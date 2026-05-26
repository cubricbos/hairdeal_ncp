-- ==============================================================================
-- 🚀 CUBRIC AI STUDIO - 사이트 설정 테이블 초기화 (PG 연동 키 포함)
-- ==============================================================================
-- 사용 방법: Supabase 대시보드 -> SQL Editor -> New Query 에 복사 후 RUN 클릭
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    toss_client_key TEXT,
    toss_secret_key TEXT,
    settings JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public_Read_Settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admin_Update_Settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admin_Insert_Settings" ON public.site_settings;

-- 누구나 클라이언트 키 등 설정값을 읽을 수 있음 (클라이언트 단에서 Toss 스크립트 로드용)
CREATE POLICY "Public_Read_Settings" 
ON public.site_settings FOR SELECT USING (true);

-- 관리자(운영자)만 설정값을 수정 가능
CREATE POLICY "Admin_Update_Settings" 
ON public.site_settings FOR UPDATE USING (auth.jwt() ->> 'email' = 'cubric.ceo@gmail.com');

-- 관리자(운영자)만 초기 설정값 삽입 가능
CREATE POLICY "Admin_Insert_Settings" 
ON public.site_settings FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = 'cubric.ceo@gmail.com');

-- 초기 데이터 세팅 (없는 경우에만)
INSERT INTO public.site_settings (id, toss_client_key, toss_secret_key)
VALUES ('default', 'test_ck_OEP59LybZ8BdLw0m02vwRV6GdA4P', 'test_sk_Z61JOxRQVE16W0xpe079rW0X9bAq')
ON CONFLICT (id) DO NOTHING;

-- 캐시 새로고침
NOTIFY pgrst, 'reload schema';
