CREATE TABLE IF NOT EXISTS public.cs_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  author_id uuid REFERENCES auth.users(id),
  image_url text,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.cs_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.cs_events FOR SELECT USING (true);
CREATE POLICY "Users can insert their own events." ON public.cs_events FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their own events." ON public.cs_events FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete their own events." ON public.cs_events FOR DELETE USING (auth.uid() = author_id);
