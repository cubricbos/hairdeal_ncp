-- 1. 매장 (Shops) 테이블 (유료 회원용 O2O 시스템)
CREATE TABLE IF NOT EXISTS public.shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    logo_url TEXT,
    wifi_info TEXT,
    restroom_pw TEXT,
    parking_info TEXT,
    table_count INTEGER DEFAULT 0,
    drinks_menu JSONB DEFAULT '[]',
    procedure_menu JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own shop"
    ON public.shops FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own shop"
    ON public.shops FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Public can view any shop"
    ON public.shops FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own shop"
    ON public.shops FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shop"
    ON public.shops FOR DELETE
    USING (auth.uid() = user_id);

-- 2. 고객 요청 (Customer Requests) 테이블
CREATE TABLE IF NOT EXISTS public.customer_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    table_number INTEGER NOT NULL,
    request_type TEXT NOT NULL, -- 'drink', 'consultation'
    details JSONB DEFAULT '{}', -- { "drink_name": "아메리카노" } 등
    status TEXT DEFAULT 'pending', -- 'pending', 'completed'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.customer_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert requests"
    ON public.customer_requests FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can view their shop requests"
    ON public.customer_requests FOR SELECT
    USING (shop_id IN (SELECT id FROM public.shops WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their shop requests"
    ON public.customer_requests FOR UPDATE
    USING (shop_id IN (SELECT id FROM public.shops WHERE user_id = auth.uid()));

-- 3. Web Push 구독 (Push Subscriptions) 테이블
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their push subscriptions"
    ON public.push_subscriptions FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
    
-- Update trigger for customer requests to update `updated_at`
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_customer_requests_modtime ON public.customer_requests;
CREATE TRIGGER update_customer_requests_modtime
BEFORE UPDATE ON public.customer_requests
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Enable replication for customer_requests so Realtime works
ALTER PUBLICATION supabase_realtime ADD TABLE public.customer_requests;
