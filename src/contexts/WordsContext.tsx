/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { words as defaultWords } from "@/data/words";
import { wordsCustom } from "@/data/words-custom";
import type { Word } from "@/types";

// 커스텀 단어 데이터를 사용할 이메일 목록
const CUSTOM_WORDS_EMAILS = ["sojjung3@gmail.com"];

interface WordsContextType {
  words: Word[];
  isCustomData: boolean;
}

const WordsContext = createContext<WordsContextType | null>(null);

export function useWords() {
  const context = useContext(WordsContext);
  if (!context) {
    throw new Error("useWords must be used within a WordsProvider");
  }
  return context;
}

interface WordsProviderProps {
  children: ReactNode;
}

export function WordsProvider({ children }: WordsProviderProps) {
  const { user } = useAuth();

  const value = useMemo(() => {
    const userEmail = user?.email?.toLowerCase();
    const provider = user?.app_metadata?.provider;
    // 일반 이메일 로그인(provider가 "email")이고 특정 이메일인 경우만 커스텀 데이터 사용
    const isCustomData = provider === "email" && userEmail ? CUSTOM_WORDS_EMAILS.includes(userEmail) : false;

    return {
      words: isCustomData ? wordsCustom : defaultWords,
      isCustomData,
    };
  }, [user?.email, user?.app_metadata?.provider]);

  return <WordsContext.Provider value={value}>{children}</WordsContext.Provider>;
}
