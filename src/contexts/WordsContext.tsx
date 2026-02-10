/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from "react";
import { words as defaultWords } from "@/data/words";
import type { Word, WordSource } from "@/types";

interface WordsContextType {
  words: Word[];
  allDefaultWords: Word[];
  isCustomData: boolean;
  activeSource: WordSource;
  setActiveSource: (source: WordSource) => void;
  setCustomWords: (words: Word[]) => void;
  resetToDefault: () => void;
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
  const [activeSource, setActiveSourceState] = useState<WordSource>({ type: "default" });
  const [customWords, setCustomWordsState] = useState<Word[] | null>(null);

  const setActiveSource = useCallback((source: WordSource) => {
    setActiveSourceState(source);
    if (source.type === "default") {
      setCustomWordsState(null);
    }
  }, []);

  const setCustomWords = useCallback((words: Word[]) => {
    setCustomWordsState(words);
  }, []);

  const resetToDefault = useCallback(() => {
    setActiveSourceState({ type: "default" });
    setCustomWordsState(null);
  }, []);

  const value = useMemo(() => {
    const words = activeSource.type === "custom" && customWords ? customWords : defaultWords;

    return {
      words,
      allDefaultWords: defaultWords,
      isCustomData: activeSource.type === "custom",
      activeSource,
      setActiveSource,
      setCustomWords,
      resetToDefault,
    };
  }, [activeSource, customWords, setActiveSource, setCustomWords, resetToDefault]);

  return <WordsContext.Provider value={value}>{children}</WordsContext.Provider>;
}
