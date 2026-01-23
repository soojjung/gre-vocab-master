import { useState, useEffect, useCallback } from "react";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { UserData, WordProgress } from "@/types";
import { getDefaultUserData, SR_INTERVALS } from "@/types";

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

// 메인 훅 - Firestore 전용 (오프라인은 Firebase persistence가 처리)
export function useUserData(userId?: string | null) {
  const [userData, setUserDataState] = useState<UserData>(getDefaultUserData());
  const [prevUserId, setPrevUserId] = useState(userId);
  const [loading, setLoading] = useState(!!userId);

  // Adjust state during render when userId changes (React recommended pattern)
  if (userId !== prevUserId) {
    setPrevUserId(userId);
    setLoading(!!userId);
  }

  useEffect(() => {
    if (!userId) {
      return;
    }

    const userDataRef = doc(db, "users", userId, "data", "progress");

    const unsubscribe = onSnapshot(userDataRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserData;
        // 날짜가 바뀌면 todayLearned 초기화
        if (data.lastStudyDate !== getTodayString()) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];
          if (data.lastStudyDate !== yesterdayStr && data.lastStudyDate !== getTodayString()) {
            data.streak = 0;
          }
          data.todayLearned = [];
        }
        setUserDataState(data);
      } else {
        // 새 사용자: 기본 데이터 생성
        const defaultData = getDefaultUserData();
        setDoc(userDataRef, defaultData);
        setUserDataState(defaultData);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  // Firestore에 저장
  const setUserData = useCallback(
    (updater: UserData | ((prev: UserData) => UserData)) => {
      setUserDataState((prev) => {
        const newData = typeof updater === "function" ? updater(prev) : updater;
        if (userId) {
          const userDataRef = doc(db, "users", userId, "data", "progress");
          setDoc(userDataRef, newData);
        }
        return newData;
      });
    },
    [userId]
  );

  // 단어 학습 결과 기록
  const recordAnswer = useCallback(
    (wordId: string, correct: boolean) => {
      setUserData((prev) => {
        const today = getTodayString();
        const progress = prev.progress[wordId] || {
          status: "new",
          correctCount: 0,
          wrongCount: 0,
          nextReview: today,
          interval: 0,
          bookmarked: false,
        };

        let newInterval = progress.interval;
        let newStatus = progress.status;

        if (correct) {
          const currentIdx = SR_INTERVALS.indexOf(progress.interval);
          const nextIdx = Math.min(currentIdx + 1, SR_INTERVALS.length - 1);
          newInterval = SR_INTERVALS[nextIdx];
          if (progress.correctCount >= 3 && newInterval >= 7) {
            newStatus = "mastered";
          } else {
            newStatus = "learning";
          }
        } else {
          newInterval = SR_INTERVALS[0];
          newStatus = "learning";
        }

        const nextReviewDate = new Date();
        nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

        const newProgress: WordProgress = {
          ...progress,
          status: newStatus,
          correctCount: correct ? progress.correctCount + 1 : progress.correctCount,
          wrongCount: correct ? progress.wrongCount : progress.wrongCount + 1,
          nextReview: nextReviewDate.toISOString().split("T")[0],
          interval: newInterval,
          lastStudied: today,
        };

        const todayLearned = prev.todayLearned.includes(wordId) ? prev.todayLearned : [...prev.todayLearned, wordId];

        let newStreak = prev.streak;
        if (prev.lastStudyDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];
          newStreak = prev.lastStudyDate === yesterdayStr ? prev.streak + 1 : 1;
        }

        return {
          ...prev,
          progress: {
            ...prev.progress,
            [wordId]: newProgress,
          },
          todayLearned,
          lastStudyDate: today,
          streak: newStreak,
        };
      });
    },
    [setUserData]
  );

  // 북마크 토글
  const toggleBookmark = useCallback(
    (wordId: string) => {
      setUserData((prev) => {
        const progress = prev.progress[wordId] || {
          status: "new",
          correctCount: 0,
          wrongCount: 0,
          nextReview: getTodayString(),
          interval: 0,
          bookmarked: false,
        };

        return {
          ...prev,
          progress: {
            ...prev.progress,
            [wordId]: {
              ...progress,
              bookmarked: !progress.bookmarked,
            },
          },
        };
      });
    },
    [setUserData]
  );

  // 설정 변경
  const updateSettings = useCallback(
    (settings: { targetDate?: string; dailyGoal?: number }) => {
      setUserData((prev) => ({
        ...prev,
        ...settings,
      }));
    },
    [setUserData]
  );

  // 온보딩 완료
  const completeOnboarding = useCallback(
    (targetDate: string, dailyGoal: number) => {
      setUserData((prev) => ({
        ...prev,
        targetDate,
        dailyGoal,
        onboardingComplete: true,
      }));
    },
    [setUserData]
  );

  // 데이터 초기화
  const resetData = useCallback(() => {
    const newData = getDefaultUserData();
    setUserData(newData);
  }, [setUserData]);

  // D-day 계산
  const getDday = useCallback(() => {
    const target = new Date(userData.targetDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  }, [userData.targetDate]);

  // 복습 대기 단어 수
  const getReviewCount = useCallback(() => {
    const today = getTodayString();
    return Object.entries(userData.progress).filter(([, p]) => {
      return p.status === "learning" && p.nextReview <= today;
    }).length;
  }, [userData.progress]);

  // 전체 진도율
  const getOverallProgress = useCallback(
    (totalWords: number) => {
      const mastered = Object.values(userData.progress).filter((p) => p.status === "mastered").length;
      return {
        mastered,
        total: totalWords,
        percentage: totalWords > 0 ? Math.round((mastered / totalWords) * 100) : 0,
      };
    },
    [userData.progress]
  );

  return {
    userData,
    loading,
    recordAnswer,
    toggleBookmark,
    updateSettings,
    completeOnboarding,
    resetData,
    getDday,
    getReviewCount,
    getOverallProgress,
  };
}
