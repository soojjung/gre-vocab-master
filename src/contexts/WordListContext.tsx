/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { useWordLists } from "@/hooks/useWordLists";
import type { WordList, CustomWord, ParsedWord, Word } from "@/types";

interface WordListContextType {
  wordLists: WordList[];
  loading: boolean;
  fetchWordLists: () => Promise<void>;
  createWordList: (name: string, description?: string) => Promise<WordList | null>;
  deleteWordList: (listId: string) => Promise<void>;
  renameWordList: (listId: string, name: string) => Promise<boolean>;
  addWordsToList: (listId: string, words: ParsedWord[]) => Promise<number>;
  addGREWordsToList: (listId: string, greWords: Word[]) => Promise<number>;
  removeWordFromList: (customWordId: string, listId: string) => Promise<void>;
  fetchWordsForList: (listId: string) => Promise<{ customWords: CustomWord[]; words: Word[] }>;
}

const WordListContext = createContext<WordListContextType | null>(null);

export function useWordListContext() {
  const context = useContext(WordListContext);
  if (!context) {
    throw new Error("useWordListContext must be used within a WordListProvider");
  }
  return context;
}

interface WordListProviderProps {
  children: ReactNode;
}

export function WordListProvider({ children }: WordListProviderProps) {
  const { user } = useAuth();
  const hook = useWordLists(user?.id);

  return <WordListContext.Provider value={hook}>{children}</WordListContext.Provider>;
}
