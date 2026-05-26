ALTER TABLE public.visitor_logs ADD COLUMN IF NOT EXISTS latitude NUMERIC;
ALTER TABLE public.visitor_logs ADD COLUMN IF NOT EXISTS longitude NUMERIC;
