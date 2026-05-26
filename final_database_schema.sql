-- ==============================================================================
-- 🚀 CUBRIC AI STUDIO - 사이트 설정 테이블 최종 스키마 (다중 컬럼 구조)
-- ==============================================================================
-- 1. 테이블 초기 생성 (없는 경우) 및 컬럼 일원화 관리
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    toss_client_key TEXT,
    toss_secret_key TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- 기존 단일 blob (하위 호환성용)
    settings JSONB DEFAULT '{}',
    -- 각 서비스/섹션별 분리 컬럼 (데이터 안정성 및 유지보수용)
    nav JSONB DEFAULT '{}',
    hero JSONB DEFAULT '{}',
    features JSONB DEFAULT '{}',
    ai_demo JSONB DEFAULT '{}',
    pricing JSONB DEFAULT '{}',
    cta JSONB DEFAULT '{}',
    footer JSONB DEFAULT '{}',
    layers JSONB DEFAULT '[]',
    section_order JSONB DEFAULT '[]',
    integrations JSONB DEFAULT '{}'
);

-- 2. 기존 테이블이 있는 경우 누락된 컬럼 추가
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS toss_client_key TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS toss_secret_key TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS nav JSONB DEFAULT '{}';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS hero JSONB DEFAULT '{}';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '{}';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS ai_demo JSONB DEFAULT '{}';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS pricing JSONB DEFAULT '{}';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS cta JSONB DEFAULT '{}';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS footer JSONB DEFAULT '{}';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS layers JSONB DEFAULT '[]';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS section_order JSONB DEFAULT '[]';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS integrations JSONB DEFAULT '{}';

-- 3. 기존 'settings' JSONB 데이터가 있다면 각 컬럼으로 이전 (마이그레이션)
UPDATE public.site_settings 
SET 
  nav = COALESCE(settings->'nav', nav),
  hero = COALESCE(settings->'hero', hero),
  features = COALESCE(settings->'features', features),
  ai_demo = COALESCE(settings->'aiDemo', ai_demo),
  pricing = COALESCE(settings->'pricing', pricing),
  cta = COALESCE(settings->'cta', cta),
  footer = COALESCE(settings->'footer', footer),
  layers = COALESCE(settings->'layers', layers),
  section_order = COALESCE(settings->'sectionOrder', section_order),
  integrations = COALESCE(settings->'integrations', integrations)
WHERE settings IS NOT NULL AND settings != '{}';

-- 4. 기본 레코드 생성 (없는 경우)
INSERT INTO public.site_settings (id) 
VALUES ('default') 
ON CONFLICT (id) DO NOTHING;

-- 5. 스키마 캐시 새로고침
NOTIFY pgrst, 'reload schema';
