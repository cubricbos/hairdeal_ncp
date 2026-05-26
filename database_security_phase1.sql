-- ==============================================================================
-- 🚀 CUBRIC AI STUDIO - Security Enhancement Phase 1
-- ==============================================================================
-- 1. 프로필 확장 (권한/상태 관리) 및 계정 수명주기
-- 2. 개인정보 취급 로깅 (audit_logs)
-- ==============================================================================

-- 1. 프로필 테이블에 권한 및 계정 상태 컬럼 추가
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pwd_updated_at TIMESTAMPTZ;

-- 기존 최고 관리자 및 운영자 계정 초기화 (예: cubric.ceo@gmail.com은 시스템 최고관리자)
UPDATE public.profiles 
SET role = 'system_admin' 
WHERE email = 'cubric.ceo@gmail.com';

-- 1.5 RLS 헬퍼 함수 생성 (profiles 재귀 참조 우회용)
CREATE OR REPLACE FUNCTION public.check_user_role(allowed_roles text[])
RETURNS boolean AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
  RETURN user_role = ANY(allowed_roles);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. 개인정보 접속 기록 (Audit Logs) 테이블 생성
-- 내부 운영자, 관리자, API 등의 개인정보 처리 행위를 보관 (최소 1~2년)
CREATE TABLE IF NOT EXISTS public.privacy_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- 행위자 (삭제 시 NULL 보존으로 기록 유지)
    actor_email TEXT, -- 행위자 이메일 스냅샷
    actor_role TEXT, -- 행위 당시의 권한 스냅샷
    action_type TEXT NOT NULL, -- READ, DOWNLOAD, UPDATE, DELETE 등
    target_resource TEXT NOT NULL, -- profiles, inquiries, billing 등 접근 대상 테이블
    target_id TEXT, -- 접근한 특정 데이터의 ID (전체 접근 시 'ALL')
    ip_address TEXT,
    user_agent TEXT,
    details JSONB, -- 추가 상세 정보 (검색 조건, 쿼리, 사유 등)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit 로그 테이블 RLS 정책 (관리자만 조회 가능, 일반 삭제는 불가)
ALTER TABLE public.privacy_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view audit logs" ON public.privacy_audit_logs
    FOR SELECT USING (
        (auth.jwt() ->> 'email' = 'cubric.ceo@gmail.com')
        OR public.check_user_role(ARRAY['system_admin', 'operator', 'security_admin'])
    );

CREATE POLICY "System can insert audit logs" ON public.privacy_audit_logs
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE/DELETE 정책은 의도적으로 제한 (위·변조 방지)

-- 3. 안전한 접속 기록 생성을 위한 헬퍼 함수
CREATE OR REPLACE FUNCTION log_privacy_action(
    p_action_type TEXT,
    p_target_resource TEXT,
    p_target_id TEXT,
    p_details JSONB DEFAULT '{}'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_log_id UUID;
    v_role TEXT;
    v_email TEXT;
BEGIN
    -- 현재 사용자의 역할과 이메일 조회
    SELECT role, email INTO v_role, v_email FROM public.profiles WHERE id = auth.uid();

    INSERT INTO public.privacy_audit_logs (
        actor_id, actor_email, actor_role, action_type, target_resource, target_id, details
    ) VALUES (
        auth.uid(), v_email, v_role, p_action_type, p_target_resource, p_target_id, p_details
    ) RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$;
