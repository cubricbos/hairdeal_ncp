CREATE TABLE IF NOT EXISTS public.user_billings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    billing_key TEXT NOT NULL,
    method TEXT,
    authenticated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    issuer_company TEXT,
    acquirer_company TEXT,
    card_number TEXT,
    card_type TEXT,
    owner_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_billings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can insert own billing" ON public.user_billings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own billing" ON public.user_billings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own billing" ON public.user_billings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own billing" ON public.user_billings FOR DELETE USING (auth.uid() = user_id);

-- Optional: index for fast lookup
CREATE INDEX IF NOT EXISTS idx_user_billings_user_id ON public.user_billings(user_id);
