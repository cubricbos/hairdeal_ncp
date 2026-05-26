CREATE TABLE IF NOT EXISTS ai_models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gender TEXT NOT NULL CHECK (gender IN ('female', 'male')),
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 초기 데이터 세팅 (기존 Unsplash 이미지)
INSERT INTO ai_models (gender, description, image_url) VALUES 
('female', '청순한 분위기의 20대 한국 여성', 'https://images.unsplash.com/photo-1618886487325-f837626bd2a4?auto=format&fit=crop&w=300&q=80'),
('female', '세련된 무드의 30대 여성', 'https://images.unsplash.com/photo-1579038773867-0402b8d5e8ab?auto=format&fit=crop&w=300&q=80'),
('female', '단아하고 깔끔한 스타일의 여성', 'https://images.unsplash.com/photo-1563306406-e66174fa3787?auto=format&fit=crop&w=300&q=80'),
('female', '도회적인 분위기의 여성 모델', 'https://images.unsplash.com/photo-1601288496920-b6154fe3626a?auto=format&fit=crop&w=300&q=80'),
('male', '자연스러운 댄디 스타일의 20대 남성', 'https://images.unsplash.com/photo-1623862274431-1e9bf4d2847d?auto=format&fit=crop&w=300&q=80'),
('male', '트렌디한 아이돌 무드의 남성', 'https://images.unsplash.com/photo-1583096114844-06ce12338bd4?auto=format&fit=crop&w=300&q=80'),
('male', '캐주얼하고 부드러운 인상의 모델', 'https://images.unsplash.com/photo-1550291910-c081e7dcd66d?auto=format&fit=crop&w=300&q=80'),
('male', '깔끔하고 이지적인 직장인 스타일', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80');

-- RLS Policies
ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;

-- 누구나 조회 가능 (public read)
CREATE POLICY "Allow public read access on ai_models" ON ai_models FOR SELECT USING (true);

-- 관리자(authenticated) 수정/생성/삭제 가능
CREATE POLICY "Allow authenticated full access on ai_models" ON ai_models FOR ALL TO authenticated USING (true) WITH CHECK (true);
