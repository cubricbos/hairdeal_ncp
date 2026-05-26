-- 트리거 함수 재정의: 구글 로그인 시 이름(풀네임)을 안전하게 가져오고, 충돌 시 업데이트하도록 개선
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, credits)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '사용자'),
    0
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 기존 트리거 삭제 후 재생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 클라이언트 측에서의 안전한 업서트를 위해 Insert Policy 추가
DROP POLICY IF EXISTS "Profiles_Insert_Own" ON public.profiles;
CREATE POLICY "Profiles_Insert_Own" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Select Policy 확인
DROP POLICY IF EXISTS "Profiles_Select_All" ON public.profiles;
CREATE POLICY "Profiles_Select_All" 
ON public.profiles FOR SELECT USING (true);

-- Update Policy 확인
DROP POLICY IF EXISTS "Profiles_Update_Own" ON public.profiles;
CREATE POLICY "Profiles_Update_Own" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);
