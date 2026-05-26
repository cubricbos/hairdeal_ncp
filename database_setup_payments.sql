-- ==============================================================================
-- 🚀 CUBRIC AI STUDIO - Payments 테이블 생성 (누락분)
-- ==============================================================================
-- 사용 방법: Supabase 대시보드 -> SQL Editor -> New Query 에 복사 후 RUN 클릭
-- ==============================================================================

-- payments 테이블 생성
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    amount INTEGER NOT NULL,
    payment_type TEXT NOT NULL, -- 'credit', 'subscription' 등
    order_id TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 설정
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 유저는 자신의 결제 내역만 볼 수 있음
CREATE POLICY "Users can read own payments" 
ON public.payments FOR SELECT USING (auth.uid() = user_id);

-- 유저는 자신의 결제 내역을 추가할 수 있음
CREATE POLICY "Users can insert own payments" 
ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 관리자는 모든 결제 내역을 볼 수 있음
CREATE POLICY "Admin can read all payments" 
ON public.payments FOR SELECT USING (auth.jwt() ->> 'email' = 'cubric.ceo@gmail.com');

-- 캐시 새로고침
NOTIFY pgrst, 'reload schema';
