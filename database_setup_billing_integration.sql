CREATE TABLE IF NOT EXISTS public.billing (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    designer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    billing_key TEXT NOT NULL,
    method TEXT,
    issuer_company TEXT,
    acquirer_company TEXT,
    card_number TEXT,
    card_type TEXT,
    owner_type TEXT,
    authenticated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 만약 user_id 로 사용한다면
-- ALTER TABLE public.billing ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.billing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own billing" ON public.billing FOR ALL USING (auth.uid() = designer_id);
-- (또는 auth.uid() = user_id)
