-- =====================================================
-- 커스텀 단어장 테이블 마이그레이션
-- Supabase Dashboard > SQL Editor에서 실행하세요
-- =====================================================

-- 1. word_lists 테이블
CREATE TABLE word_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  word_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE word_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own word lists"
  ON word_lists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own word lists"
  ON word_lists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own word lists"
  ON word_lists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own word lists"
  ON word_lists FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_word_lists_user_id ON word_lists(user_id);

-- 2. custom_words 테이블
CREATE SEQUENCE custom_word_id_seq START WITH 10000;

CREATE TABLE custom_words (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numeric_id INTEGER DEFAULT nextval('custom_word_id_seq') UNIQUE NOT NULL,
  list_id UUID REFERENCES word_lists(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  word TEXT NOT NULL,
  meaning TEXT NOT NULL,
  example TEXT DEFAULT '',
  example_ko TEXT DEFAULT '',
  difficulty INTEGER DEFAULT 2,
  source_word_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE custom_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own custom words"
  ON custom_words FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own custom words"
  ON custom_words FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own custom words"
  ON custom_words FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own custom words"
  ON custom_words FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_custom_words_list_id ON custom_words(list_id);
CREATE INDEX idx_custom_words_user_id ON custom_words(user_id);
