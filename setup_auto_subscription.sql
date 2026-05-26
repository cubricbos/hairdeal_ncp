-- 1. 구독(정기결제) 관리 테이블
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'active', -- 'active', 'canceled', 'failed'
    next_billing_date TIMESTAMPTZ NOT NULL,
    last_billing_date TIMESTAMPTZ,
    auto_renew BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책 설정
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions FOR SELECT USING (auth.uid() = user_id);
-- 사용자는 자신의 구독 관리(취소) 가능
CREATE POLICY "Users can update own subscriptions" ON public.user_subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- 인덱스 추가 (매일 정기 결제 대상을 빠르게 찾기 위해)
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status_date 
ON public.user_subscriptions(status, next_billing_date);

-- 트리거 (updated_at 자동 갱신)
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_subscriptions_modtime
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- 캐시 새로고침
NOTIFY pgrst, 'reload schema';
