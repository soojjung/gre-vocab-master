/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, type ReactNode } from "react";
import { words as defaultWords } from "@/data/words";
import type { Word } from "@/types";

interface WordsContextType {
  words: Word[];
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

const value: WordsContextType = { words: defaultWords };

export function WordsProvider({ children }: WordsProviderProps) {
  return <WordsContext.Provider value={value}>{children}</WordsContext.Provider>;
}
