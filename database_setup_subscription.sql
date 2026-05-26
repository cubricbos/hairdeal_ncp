-- Add billing_key to profiles to save the Toss Payments billing key
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS billing_key TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS card_company TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS card_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'Free';

-- 캐시 새로고침 (Schema cache error 방지)
NOTIFY pgrst, 'reload schema';
