-- 1. 프로필 삽입 (회원 가입/처음 로그인 시) 허용 정책 추가
-- (Supabase 트리거 외에 클라이언트에서 안전하게 프로필을 초기화할 수 있도록 허용합니다.)
DROP POLICY IF EXISTS "Profiles_Insert_Own" ON public.profiles;

CREATE POLICY "Profiles_Insert_Own" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
