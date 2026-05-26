-- ==============================================================================
-- 🚀 CUBRIC AI STUDIO - Security Enhancement Phase 3
-- ==============================================================================
-- 1. 백업 관리 및 로그 관리 (로그인, 접속 기록 분리보관)
-- 2. 위탁 및 제3자(수탁자) 관리 기능
-- ==============================================================================

-- 1. 사용자 로그인 히스토리 테이블 신설 (최소 1년 보관 대상)
-- 기존 개인정보 처리 이력(privacy_audit_logs)과 별도로 '로그인' 행위만 기록
CREATE TABLE IF NOT EXISTS public.login_histories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    email TEXT,
    ip_address TEXT,
    user_agent TEXT,
    login_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: 본인의 로그인 이력은 본인만, 관리자는 전체 접근
ALTER TABLE public.login_histories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own login logs" ON public.login_histories;
DROP POLICY IF EXISTS "Admin can view all login logs" ON public.login_histories;
DROP POLICY IF EXISTS "System can insert login logs" ON public.login_histories;

CREATE POLICY "Users can view own login logs" ON public.login_histories 
    FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Admin can view all login logs" ON public.login_histories 
    FOR SELECT USING (
        (auth.jwt() ->> 'email' = 'cubric.ceo@gmail.com')
        OR public.check_user_role(ARRAY['system_admin', 'operator', 'security_admin'])
    );

CREATE POLICY "System can insert login logs" ON public.login_histories 
    FOR INSERT WITH CHECK (auth.uid() = profile_id);


-- 2. 위탁 및 제3자(수탁자) 관리 테이블
-- 클라우드, PG사, 알림톡, CRM 등 주요 서드파티 제휴사의 보안 상태 관리
CREATE TABLE IF NOT EXISTS public.third_party_vendors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_name TEXT NOT NULL,       -- 업체명 (예: Toss Payments, AWS, Channel Talk)
    service_category TEXT NOT NULL,  -- 서비스 분류 (예: 결제, 클라우드, 고객상담)
    processing_data TEXT,            -- 취급 개인정보 항목 (예: 이름, 연락처, 결제정보)
    contact_info TEXT,               -- 수탁사 연락처/담당자
    contract_start_date DATE,        -- 계약 시작일
    contract_end_date DATE,          -- 계약 종료일
    last_security_check DATE,        -- 최근 보안 점검일
    next_security_check DATE,        -- 차기 보안 점검일
    status TEXT DEFAULT 'active'     -- active, terminated 등
);

ALTER TABLE public.third_party_vendors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can view vendors" ON public.third_party_vendors;
DROP POLICY IF EXISTS "Admin can manage vendors" ON public.third_party_vendors;

CREATE POLICY "Admin can view vendors" ON public.third_party_vendors 
    FOR SELECT USING (
        (auth.jwt() ->> 'email' = 'cubric.ceo@gmail.com')
        OR public.check_user_role(ARRAY['system_admin', 'operator', 'security_admin'])
    );

CREATE POLICY "Admin can manage vendors" ON public.third_party_vendors 
    FOR ALL USING (
        (auth.jwt() ->> 'email' = 'cubric.ceo@gmail.com')
        OR public.check_user_role(ARRAY['system_admin', 'security_admin'])
    );
