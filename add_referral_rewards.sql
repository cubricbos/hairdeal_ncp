ALTER TABLE public.app_metrics ADD COLUMN IF NOT EXISTS referral_signup_reward integer DEFAULT 20;
ALTER TABLE public.app_metrics ADD COLUMN IF NOT EXISTS referral_activity_reward integer DEFAULT 80;
