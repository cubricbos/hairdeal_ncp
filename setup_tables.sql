-- 1. Inquiries Table
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    details TEXT,
    status TEXT DEFAULT '대기중',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert inquiries
CREATE POLICY "Anyone can submit an inquiry" ON public.inquiries
    FOR INSERT WITH CHECK (true);

-- Policy: Only admin can view/update inquiries
CREATE POLICY "Admin can view inquiries" ON public.inquiries
    FOR SELECT USING (auth.jwt() ->> 'email' = 'cubric.ceo@gmail.com');

CREATE POLICY "Admin can update inquiries" ON public.inquiries
    FOR UPDATE USING (auth.jwt() ->> 'email' = 'cubric.ceo@gmail.com');

-- 2. Profiles Table (for user management display)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can view all profiles" ON public.profiles
    FOR SELECT USING (auth.jwt() ->> 'email' = 'cubric.ceo@gmail.com');

-- Trigger to keep profiles in sync
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
