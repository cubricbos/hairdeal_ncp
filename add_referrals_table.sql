ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES auth.users(id);

CREATE TABLE IF NOT EXISTS public.referral_missions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid REFERENCES auth.users(id),
  referred_id uuid REFERENCES auth.users(id),
  status text DEFAULT 'signup', -- 'signup', 'completed'
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at timestamp with time zone,
  UNIQUE(referrer_id, referred_id)
);

ALTER TABLE public.referral_missions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own referral missions." ON public.referral_missions;
CREATE POLICY "Users can view their own referral missions." ON public.referral_missions FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

DROP POLICY IF EXISTS "Anyone can insert referral missions" ON public.referral_missions;
CREATE POLICY "Anyone can insert referral missions" ON public.referral_missions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "System can update missions" ON public.referral_missions;
CREATE POLICY "System can update missions" ON public.referral_missions FOR UPDATE USING (true);
