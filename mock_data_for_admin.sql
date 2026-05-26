-- ===============================================================================
-- AI Studio - Cubric 모의 데이터 생성 스크립트 (Admin / CS / Security 대시보드용)
--
-- 알림: 이 스크립트는 프로젝트에 '목업(Mock) 데이터'를 채워 넣기 위한 용도입니다.
-- 기존 데이터를 삭제하거나 손상시키지는 않지만, 임의의 계정/정보가 추가됩니다.
-- Supabase SQL Editor에서 한 번 실행해주시면 관리자 페이지의 각 탭에서 
-- 기능들이 어떻게 동작하는지 직관적으로 확인하실 수 있습니다.
-- ===============================================================================

DO $$
DECLARE
  v_user1_id UUID := gen_random_uuid();
  v_user2_id UUID := gen_random_uuid();
  v_user3_id UUID := gen_random_uuid();
  v_user4_id UUID := gen_random_uuid();
BEGIN
  -- 1. 임의 사용자 계정 생성
  -- 사용자를 auth.users에 추가하면 on_auth_user_created 트리거가 Profiles 테이블에 데이터를 자동 생성합니다.
  -- Supabase Auth의 제약(crypt 비밀번호 등)을 회피하기 위해 간단히 암호화된 비밀번호 필드를 비워두거나 임의 값을 넣을 수 있습니다.
  -- 테스트용이므로 실제 로그인은 불가능하며, 관리자 페이지 화면용 가짜 데이터입니다.
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES 
  (v_user1_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'marketing@example.com', 'fakepassword123', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"마케팅 관리자"}', now(), now()),
  (v_user2_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'cs@example.com', 'fakepassword123', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"CS 매니저"}', now(), now()),
  (v_user3_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'finance@example.com', 'fakepassword123', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"재무 관리자"}', now(), now()),
  (v_user4_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'security@example.com', 'fakepassword123', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"보안 관리자"}', now(), now());

  -- 2. 권한(Role) 및 구독 상태 등을 업데이트 (profiles 테이블)
  -- 방금 auth.users 에 추가되면서 자동으로 profile이 생성되므로 UPDATE를 수행합니다.
  UPDATE public.profiles 
  SET role = 'operator', is_cs_admin = false, subscription_plan = 'Business', subscription_status = 'active'
  WHERE id = v_user1_id;

  UPDATE public.profiles 
  SET role = 'operator', is_cs_admin = true, subscription_plan = 'Pro', subscription_status = 'active'
  WHERE id = v_user2_id;

  UPDATE public.profiles 
  SET role = 'system_admin', is_cs_admin = false, credits = 5000
  WHERE id = v_user3_id;

  UPDATE public.profiles 
  SET role = 'security_admin', is_cs_admin = true 
  WHERE id = v_user4_id;

  -- 3. 도입 문의 데이터 (inquiries) - 관리자 대시보드 '도입 문의 관리' 탭
  INSERT INTO public.inquiries (salon_name, contact_name, phone, email, details, status, created_at)
  VALUES 
  ('A살롱 강남점', '이원장', '010-1234-5678', 'lee@salon.com', '프리미엄 요금제 도입 비용과 기간이 궁금합니다.', '대기중', now() - interval '2 days'),
  ('주노헤어 본사', '박팀장', '010-9876-5432', 'juno@hq.com', 'API 연동 여부 및 엔터프라이즈 문의', '처리중', now() - interval '1 days'),
  ('개인미용실', '김디자이너', '010-1111-2222', 'kim@gmail.com', '무료 체험판을 사용해보고 싶은데요.', '완료', now() - interval '5 days');

  -- 4. CS 인시던트 데이터 (cs_incidents) - CS 데스크
  INSERT INTO public.cs_incidents (title, description, status, severity, created_at)
  VALUES
  ('결제 모듈 연동 에러', '카드 결제 시 500 에러 알림이 노출됩니다. (User: lee@salon.com)', 'open', 1, now() - interval '3 hours'),
  ('AI 이미지 모델 로딩 속도 지연', '스타일 변환 처리 속도가 너무 느립니다. (User: juno@hq.com)', 'investigating', 2, now() - interval '1 days');

  -- 5. 보안 로그인 로그 (login_histories) - 보안 관리자(ISMS)의 접속 로그
  INSERT INTO public.login_histories (email, ip_address, user_agent, login_at)
  VALUES
  ('finance@example.com', '121.112.33.44', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', now() - interval '1 hours'),
  ('security@example.com', '124.55.66.77', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', now() - interval '5 hours'),
  ('marketing@example.com', '211.222.111.44', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac)', now() - interval '2 days');

  -- 6. 보안 권한 접근/작업 로그 (privacy_audit_logs) - 보안 관리자(ISMS)의 정보 처리 로그
  INSERT INTO public.privacy_audit_logs (actor_email, actor_role, action_type, target_resource, target_id, details, created_at)
  VALUES
  ('marketing@example.com', 'operator', 'DOWNLOAD', 'profiles', 'ALL', '{"source":"AdminPage_Export"}', now() - interval '2 days'),
  ('system_admin@example.com', 'system_admin', 'VIEW', 'billing', '123123', '{"source":"AdminPage_Billing"}', now() - interval '1 days'),
  ('security@example.com', 'security_admin', 'UPDATE', 'profiles', v_user1_id::text, '{"action":"grant_operator_role"}', now() - interval '4 hours');

END $$;
