-- 모든 일반 사용자 데이터를 완전히 삭제하고 초기화하는 SQL 스크립트입니다.
-- 주의: 이 스크립트를 실행하면 애플리케이션의 모든 일반 회원, 결제 내역, 크레딧 내역 등이 삭제됩니다! (관리자는 유지됩니다)

-- 1단계: 삭제 대상(관리자 제외)을 찾기 위해 임시 테이블을 생성합니다.
CREATE TEMP TABLE temp_users_to_delete AS
SELECT id FROM auth.users WHERE email != 'cubric.ceo@gmail.com';

-- 2단계: 연관된 공개 테이블 데이터를 삭제합니다.
-- (외래 키가 ON DELETE CASCADE로 올바르게 설정되어 있다면 profiles가 삭제될 때 관련 데이터가 함께 지워집니다)
DELETE FROM public.profiles WHERE id IN (SELECT id FROM temp_users_to_delete);

-- 3단계: auth 스키마의 내부 테이블에서 데이터를 안전하게 삭제합니다.
-- auth.users의 정보를 삭제하면 연결된 다른 체인 데이터도 CASCADE 되어 Auth 시스템에서 완전히 삭제 처리됩니다.
DELETE FROM auth.users WHERE id IN (SELECT id FROM temp_users_to_delete);

-- 4단계: 임시 테이블을 정리합니다.
DROP TABLE temp_users_to_delete;

-- 5단계: 관리자(cubric.ceo@gmail.com)의 정보를 확인합니다.
SELECT id, email, raw_user_meta_data FROM auth.users WHERE email = 'cubric.ceo@gmail.com';
