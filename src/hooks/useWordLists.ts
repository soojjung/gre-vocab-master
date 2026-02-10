import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { WordList, CustomWord, ParsedWord, Word } from "@/types";

// DB row → WordList 변환
function rowToWordList(row: {
  id: string;
  name: string;
  description: string;
  word_count: number;
  created_at: string;
  updated_at: string;
}): WordList {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    wordCount: row.word_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// DB row → CustomWord 변환
function rowToCustomWord(row: {
  id: string;
  numeric_id: number;
  list_id: string;
  word: string;
  meaning: string;
  example: string;
  example_ko: string;
  difficulty: number;
  source_word_id: number | null;
}): CustomWord {
  return {
    id: row.id,
    numericId: row.numeric_id,
    listId: row.list_id,
    word: row.word,
    meaning: row.meaning,
    example: row.example ?? "",
    exampleKo: row.example_ko ?? "",
    difficulty: row.difficulty,
    sourceWordId: row.source_word_id,
  };
}

/** CustomWord를 프론트엔드 Word 객체로 변환 */
export function customWordToWord(cw: CustomWord): Word {
  return {
    id: cw.sourceWordId ?? cw.numericId,
    word: cw.word,
    meaning: cw.meaning,
    example: cw.example,
    exampleKo: cw.exampleKo,
    difficulty: cw.difficulty,
  };
}

export function useWordLists(userId?: string | null) {
  const [wordLists, setWordLists] = useState<WordList[]>([]);
  const [loading, setLoading] = useState(false);
  const loaded = useRef(false);

  // 단어장 목록 로드
  const fetchWordLists = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("word_lists")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[useWordLists] fetch error:", error);
      } else {
        setWordLists((data ?? []).map(rowToWordList));
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId && !loaded.current) {
      loaded.current = true;
      fetchWordLists();
    }
  }, [userId, fetchWordLists]);

  // 이름 중복 확인
  const isNameDuplicate = useCallback(
    (name: string, excludeId?: string) => {
      return wordLists.some((l) => l.name === name && l.id !== excludeId);
    },
    [wordLists]
  );

  // 단어장 생성
  const createWordList = useCallback(
    async (name: string, description: string = ""): Promise<WordList | null> => {
      if (!userId) return null;
      if (isNameDuplicate(name)) return null;

      const { data, error } = await supabase
        .from("word_lists")
        .insert({ user_id: userId, name, description })
        .select()
        .single();

      if (error) {
        console.error("[useWordLists] create error:", error);
        return null;
      }
      const newList = rowToWordList(data);
      setWordLists((prev) => [newList, ...prev]);
      return newList;
    },
    [userId, isNameDuplicate]
  );

  // 단어장 삭제
  const deleteWordList = useCallback(
    async (listId: string) => {
      const { error } = await supabase.from("word_lists").delete().eq("id", listId);
      if (error) {
        console.error("[useWordLists] delete error:", error);
        return;
      }
      setWordLists((prev) => prev.filter((l) => l.id !== listId));
    },
    []
  );

  // 단어장 이름 변경
  const renameWordList = useCallback(
    async (listId: string, name: string): Promise<boolean> => {
      if (isNameDuplicate(name, listId)) return false;

      const { error } = await supabase
        .from("word_lists")
        .update({ name, updated_at: new Date().toISOString() })
        .eq("id", listId);

      if (error) {
        console.error("[useWordLists] rename error:", error);
        return false;
      }
      setWordLists((prev) => prev.map((l) => (l.id === listId ? { ...l, name } : l)));
      return true;
    },
    [isNameDuplicate]
  );

  // 파일 업로드 단어 추가 (벌크)
  const addWordsToList = useCallback(
    async (listId: string, words: ParsedWord[]): Promise<number> => {
      if (!userId || words.length === 0) return 0;

      const rows = words.map((w) => ({
        list_id: listId,
        user_id: userId,
        word: w.word,
        meaning: w.meaning,
      }));

      // 100개씩 배치 삽입
      let insertedCount = 0;
      for (let i = 0; i < rows.length; i += 100) {
        const batch = rows.slice(i, i + 100);
        const { error } = await supabase.from("custom_words").insert(batch);
        if (error) {
          console.error("[useWordLists] addWords error:", error);
        } else {
          insertedCount += batch.length;
        }
      }

      // word_count 업데이트
      if (insertedCount > 0) {
        const list = wordLists.find((l) => l.id === listId);
        const newCount = (list?.wordCount ?? 0) + insertedCount;
        await supabase.from("word_lists").update({ word_count: newCount, updated_at: new Date().toISOString() }).eq("id", listId);
        setWordLists((prev) => prev.map((l) => (l.id === listId ? { ...l, wordCount: newCount } : l)));
      }

      return insertedCount;
    },
    [userId, wordLists]
  );

  // GRE 기본 단어 추가
  const addGREWordsToList = useCallback(
    async (listId: string, greWords: Word[]): Promise<number> => {
      if (!userId || greWords.length === 0) return 0;

      const rows = greWords.map((w) => ({
        list_id: listId,
        user_id: userId,
        word: w.word,
        meaning: w.meaning,
        example: w.example,
        example_ko: w.exampleKo,
        difficulty: w.difficulty,
        source_word_id: w.id,
      }));

      let insertedCount = 0;
      for (let i = 0; i < rows.length; i += 100) {
        const batch = rows.slice(i, i + 100);
        const { error } = await supabase.from("custom_words").insert(batch);
        if (error) {
          console.error("[useWordLists] addGREWords error:", error);
        } else {
          insertedCount += batch.length;
        }
      }

      if (insertedCount > 0) {
        const list = wordLists.find((l) => l.id === listId);
        const newCount = (list?.wordCount ?? 0) + insertedCount;
        await supabase.from("word_lists").update({ word_count: newCount, updated_at: new Date().toISOString() }).eq("id", listId);
        setWordLists((prev) => prev.map((l) => (l.id === listId ? { ...l, wordCount: newCount } : l)));
      }

      return insertedCount;
    },
    [userId, wordLists]
  );

  // 단어 1개 삭제
  const removeWordFromList = useCallback(
    async (customWordId: string, listId: string) => {
      const { error } = await supabase.from("custom_words").delete().eq("id", customWordId);
      if (error) {
        console.error("[useWordLists] removeWord error:", error);
        return;
      }
      const list = wordLists.find((l) => l.id === listId);
      if (list) {
        const newCount = Math.max(0, list.wordCount - 1);
        await supabase.from("word_lists").update({ word_count: newCount, updated_at: new Date().toISOString() }).eq("id", listId);
        setWordLists((prev) => prev.map((l) => (l.id === listId ? { ...l, wordCount: newCount } : l)));
      }
    },
    [wordLists]
  );

  // 특정 단어장의 단어 로드
  const fetchWordsForList = useCallback(
    async (listId: string): Promise<{ customWords: CustomWord[]; words: Word[] }> => {
      const { data, error } = await supabase
        .from("custom_words")
        .select("*")
        .eq("list_id", listId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("[useWordLists] fetchWords error:", error);
        return { customWords: [], words: [] };
      }

      const customWords = (data ?? []).map(rowToCustomWord);
      const words = customWords.map(customWordToWord);
      return { customWords, words };
    },
    []
  );

  return {
    wordLists,
    loading,
    fetchWordLists,
    createWordList,
    deleteWordList,
    renameWordList,
    addWordsToList,
    addGREWordsToList,
    removeWordFromList,
    fetchWordsForList,
  };
}
