/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, type ReactNode } from "react";
import { useUserData } from "@/hooks/useUserData";
import type { UserData, TodaySession } from "@/types";

interface UserDataContextType {
  userData: UserData;
  loading: boolean;
  recordAnswer: (wordId: string, correct: boolean) => void;
  toggleBookmark: (wordId: string) => void;
  updateSettings: (settings: { targetDate?: string; dailyGoal?: number; resetHour?: number; autoSpeak?: boolean; locale?: "ko" | "en" }) => void;
  completeOnboarding: (targetDate: string, dailyGoal: number, resetHour?: number) => Promise<void>;
  resetData: () => void;
  getDday: () => number;
  getReviewCount: () => number;
  getOverallProgress: (totalWords: number) => { mastered: number; total: number; percentage: number };
  getOrCreateTodaySession: (wordIds: number[]) => TodaySession;
  updateSessionProgress: (currentIndex: number, completed?: boolean) => void;
  getTodaySession: () => TodaySession | null;
}

const UserDataContext = createContext<UserDataContextType | null>(null);

export function useUserDataContext() {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error("useUserDataContext must be used within a UserDataProvider");
  }
  return context;
}

interface UserDataProviderProps {
  userId: string;
  children: ReactNode;
}

export function UserDataProvider({ userId, children }: UserDataProviderProps) {
  const userDataHook = useUserData(userId);

  return <UserDataContext.Provider value={userDataHook}>{children}</UserDataContext.Provider>;
}
