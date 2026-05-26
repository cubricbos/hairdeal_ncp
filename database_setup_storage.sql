-- 1. 'models' 스토리지 버킷 생성 (이미 존재하면 무시)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('models', 'models', true) 
ON CONFLICT (id) DO NOTHING;

-- 2. 해당 버킷에 대한 정책(RLS) 설정
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'models');

CREATE POLICY "Auth Insert" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'models' AND auth.role() = 'authenticated');

CREATE POLICY "Auth Update" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'models' AND auth.role() = 'authenticated');

CREATE POLICY "Auth Delete" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'models' AND auth.role() = 'authenticated');
