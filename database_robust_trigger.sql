-- 1. 가장 안정적인 사용자 가입 트리거 (중복 처리, 컬럼 자동 분기 적용)
-- 만약 profiles 테이블에 특정 컬럼(credits 등)이 없어도 에러가 나지 않도록 가장 기본적인 필드만 우선 삽입합니다.
-- credits 컬럼 추가나 관리는 클라이언트에서 안전하게 수행하도록 합니다.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 최소한의 정보로 profiles 레코드를 생성합니다.
  -- ON CONFLICT를 사용하여 이미 존재하는 경우 튕기지 않도록 방어합니다.
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '사용자')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name);
    
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- 혹시라도 프로필 테이블 삽입 중 에러가 발생해도 가입 자체가 튕기지 않도록 로그만 남기고 통과시킵니다.
    -- (앱에서 ensureProfileExists 함수가 클라이언트 단에서 다시 한 번 프로필을 생성해줍니다)
    RAISE WARNING 'Profile creation failed for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 기존 트리거 교체
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. profiles 테이블에 필요한 정책들이 모두 있는지 확인하고 추가
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 사용자가 자기 자신의 프로필을 삽입할 수 있도록 허용
DROP POLICY IF EXISTS "Profiles_Insert_Own" ON public.profiles;
CREATE POLICY "Profiles_Insert_Own" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 모든 사람이 프로필을 조회할 수 있도록 하거나 자기 자신만 조회하도록 허용
DROP POLICY IF EXISTS "Profiles_Select_All" ON public.profiles;
CREATE POLICY "Profiles_Select_All" 
ON public.profiles FOR SELECT USING (true); -- 뷰 구현 등의 편의를 위해 전체 Select 허용

-- 사용자가 자기 자신의 프로필을 수정할 수 있도록 허용
DROP POLICY IF EXISTS "Profiles_Update_Own" ON public.profiles;
CREATE POLICY "Profiles_Update_Own" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);
