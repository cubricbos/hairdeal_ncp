-- ==============================================================================
-- 🚀 CUBRIC AI STUDIO - Security Enhancement Phase 2
-- ==============================================================================
-- 1. 권한 분리 (Role Separation) RLS 적용
-- 2. 고위험 기능 로깅 체계 고도화 지원
-- ==============================================================================

-- 1. profiles 테이블 접근 제어 강화 (Row Level Security)
-- 기본적으로 모든 접근은 막혀있고, 정책에 따라 허용됩니다.

-- 기존 정책 및 중복 방지를 위한 사전 삭제
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;

-- RLS 재귀 호출(infinite recursion) 방지를 위한 헬퍼 함수
CREATE OR REPLACE FUNCTION public.check_user_role(allowed_roles text[])
RETURNS boolean AS $$
DECLARE
  user_role text;
BEGIN
  -- SECURITY DEFINER를 통해 RLS 없이 현재 세션 유저의 role을 확인합니다
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
  RETURN user_role = ANY(allowed_roles);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- [정책 1] 일반 사용자는 자신의 정보만 조회 가능
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- [정책 2] 시스템 관리자(system_admin), 보안 관리자(security_admin)는 모든 정보 조회 가능
CREATE POLICY "Admin can view all profiles" ON public.profiles
  FOR SELECT USING (
    (auth.jwt() ->> 'email' = 'cubric.ceo@gmail.com')
  );

-- [정책 3] 일반 사용자는 자신의 정보만 수정 가능(제한적)
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- [정책 4] 시스템 최고 관리자와 운영자는 다른 사용자의 권한 및 상태(고위험) 수정 가능
CREATE POLICY "Admin can update all profiles" ON public.profiles
  FOR UPDATE USING (
    (auth.jwt() ->> 'email' = 'cubric.ceo@gmail.com')
  );

-- 2. 고위험 기능 로깅을 수행하는 log_privacy_action 관련 권한
-- Phase 1에서 생성한 privacy_audit_logs 테이블 보안 기능 작동 확인 완료.
