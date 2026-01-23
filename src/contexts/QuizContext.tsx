/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from "react";
import type { QuizType, QuizResult } from "@/types";

interface QuizContextType {
  quizType: QuizType;
  quizCount: number;
  quizResults: QuizResult[];
  setQuizType: (type: QuizType) => void;
  setQuizCount: (count: number) => void;
  setQuizResults: (results: QuizResult[]) => void;
  resetQuiz: () => void;
}

const QuizContext = createContext<QuizContextType | null>(null);

export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error("useQuiz must be used within a QuizProvider");
  }
  return context;
}

interface QuizProviderProps {
  children: ReactNode;
}

export function QuizProvider({ children }: QuizProviderProps) {
  const [quizType, setQuizType] = useState<QuizType>("fill-blank");
  const [quizCount, setQuizCount] = useState<number>(10);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);

  const resetQuiz = () => {
    setQuizType("fill-blank");
    setQuizCount(10);
    setQuizResults([]);
  };

  const value = {
    quizType,
    quizCount,
    quizResults,
    setQuizType,
    setQuizCount,
    setQuizResults,
    resetQuiz,
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}
