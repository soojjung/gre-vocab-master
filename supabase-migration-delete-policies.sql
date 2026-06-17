-- =====================================================
-- profiles / user_data DELETE 정책 추가
-- Supabase Dashboard > SQL Editor에서 실행하세요
-- =====================================================
--
-- 배경: AuthContext.deleteAccount() 가 supabase.from("user_data").delete()
-- 를 호출하지만 user_data 와 profiles 에 DELETE 정책이 없어 RLS default-deny
-- 로 0 rows affected 인 채 조용히 통과되고 있었음. 실제 정리는 이어지는
-- rpc("delete_user") -> auth.users -> CASCADE 경로로만 이뤄져 의도된 "코드
-- 명시 삭제 + CASCADE" 이중 안전망이 단일 경로로 축소되어 있었음.
-- 이 마이그레이션으로 DELETE 정책을 추가해 이중 안전망을 복원함.
-- 발견일: 2026-06-18 (라이브 pg_policies 점검)
-- 관련 문서: .ai/OPERATIONS_LOG.md, ARCHITECTURE.md §3.4

DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete own data" ON user_data;
CREATE POLICY "Users can delete own data"
  ON user_data FOR DELETE
  USING (auth.uid() = user_id);
