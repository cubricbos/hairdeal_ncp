-- app_metrics 테이블에 첫 가입 보상 크레딧 컬럼 추가
ALTER TABLE public.app_metrics ADD COLUMN IF NOT EXISTS welcome_credit_reward INTEGER DEFAULT 0;
