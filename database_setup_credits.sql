-- ==============================================================================
-- 🚀 CUBRIC AI STUDIO - 데이터베이스 전체 초기화 및 구조 재정의 스크립트 🚀
-- ==============================================================================
-- 사용 방법: Supabase 대시보드 -> SQL Editor -> New Query 에 복사 후 RUN 클릭
-- 주의: 이 스크립트는 기존의 꼬인 RLS 정책들을 싹 지우고 완벽하게 새로 세팅합니다.
-- ==============================================================================

-- [1] profiles 테이블에 credits 컬럼이 없다면 생성 (기본값 0)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0;

-- [2] 기존에 생성되었던 찌꺼기 RLS 정책 모두 삭제 (충돌 방지용 클렌징)
DROP POLICY IF EXISTS "Admin All Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for all users" ON public.profiles;
DROP POLICY IF EXISTS "Profiles - Select All" ON public.profiles;
DROP POLICY IF EXISTS "Profiles - Update Own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles - Admin Update" ON public.profiles;

DROP POLICY IF EXISTS "Admin All TXs" ON public.credit_transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.credit_transactions;
DROP POLICY IF EXISTS "Users can read own transactions" ON public.credit_transactions;
DROP POLICY IF EXISTS "Users can manage own transactions" ON public.credit_transactions;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.credit_transactions;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.credit_transactions;
DROP POLICY IF EXISTS "Tx - Insert Own" ON public.credit_transactions;
DROP POLICY IF EXISTS "Tx - Select Own" ON public.credit_transactions;
DROP POLICY IF EXISTS "Tx - Admin All" ON public.credit_transactions;

-- [3] Profiles (회원 정보) 테이블 새 RLS 정책 적용
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 누구나 다른 프로필 정보(이름, 아바타 등)를 읽을 수 있음
CREATE POLICY "Profiles_Select_All" 
ON public.profiles FOR SELECT USING (true);

-- 사용자는 '본인'의 프로필(크레딧 포함) 정보를 수정할 수 있음 (출석 보상 및 사용 차감 기능)
CREATE POLICY "Profiles_Update_Own" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 관리자(운영자)는 모든 사람의 프로필을 수정 가능
CREATE POLICY "Profiles_Update_Admin" 
ON public.profiles FOR UPDATE USING (auth.jwt() ->> 'email' = 'cubric.ceo@gmail.com');


-- [4] Credit Transactions (크레딧 거래 내역) 테이블 새 RLS 정책 적용
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- 사용자는 '본인'의 크레딧 내역만 조회 가능
CREATE POLICY "Tx_Select_Own" 
ON public.credit_transactions FOR SELECT USING (auth.uid() = user_id);

-- 사용자는 '본인'의 크레딧 획득/소비 내역을 추가 가능 (출석 보상, AI 생성 스크립트에서 작동)
CREATE POLICY "Tx_Insert_Own" 
ON public.credit_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 관리자(운영자)는 시스템 상의 모든 내역을 조회/삽입/수정 가능
CREATE POLICY "Tx_All_Admin" 
ON public.credit_transactions FOR ALL USING (auth.jwt() ->> 'email' = 'cubric.ceo@gmail.com');

-- (선택) 이전 DB 오류로 인해 트랜잭션 기록과 현재 크레딧 금액을 맞추고 싶으시다면
-- 필요에 따라 크레딧 관련 테이블 데이터를 초기화 하실 수 있습니다.
-- TRUNCATE TABLE public.credit_transactions;
-- UPDATE public.profiles SET credits = 0;
