-- =====================================================
-- 사용자 언어 설정(locale) 컬럼 추가
-- Supabase Dashboard > SQL Editor 에서 실행하세요
-- =====================================================

-- 1) 컬럼 추가 (재실행 안전)
-- DB 레벨 기본값은 'en'. 신규 사용자는 앱의 LanguageProvider 가
-- localStorage / navigator.language 로 감지한 값을 upsert 시 덮어씁니다.
ALTER TABLE user_data
  ADD COLUMN IF NOT EXISTS locale TEXT NOT NULL DEFAULT 'en';

COMMENT ON COLUMN user_data.locale IS 'UI language preference: ko or en';

-- 2) 기존 사용자 백필 — ⚠️ 이번 배포 시점에 한 번만 실행하세요.
-- 마이그레이션 시점의 모든 가입자는 한국어 사용자이므로 ko 로 일괄 설정합니다.
-- 재실행하면 그 사이 가입한 영어 사용자까지 ko 로 덮어쓰니 주의.
UPDATE user_data SET locale = 'ko';
