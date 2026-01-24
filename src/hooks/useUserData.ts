import { useState, useEffect, useCallback, useRef } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getTodayString, getYesterdayString, getLocalDateString } from "@/lib/date";
import type { UserData, WordProgress, TodaySession } from "@/types";
import { getDefaultUserData, SR_INTERVALS } from "@/types";

// 메인 훅 - Firestore 전용 (오프라인은 Firebase persistence가 처리)
export function useUserData(userId?: string | null) {
  const [userData, setUserDataState] = useState<UserData>(getDefaultUserData());
  const [prevUserId, setPrevUserId] = useState(userId);
  const [loading, setLoading] = useState(!!userId);
  const dataLoaded = useRef(false); // 데이터 로드 완료 여부

  // Adjust state during render when userId changes (React recommended pattern)
  if (userId !== prevUserId) {
    setPrevUserId(userId);
    setLoading(!!userId);
  }

  useEffect(() => {
    if (!userId) {
      dataLoaded.current = false;
      return;
    }

    // 이미 로드했으면 스킵 (React StrictMode 대응)
    if (dataLoaded.current) {
      return;
    }

    const userDataRef = doc(db, "users", userId, "data", "progress");

    const loadData = async () => {
      try {
        const docSnap = await getDoc(userDataRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as UserData;
          // 날짜가 바뀌면 todayLearned 초기화
          if (data.lastStudyDate !== getTodayString()) {
            const yesterdayStr = getYesterdayString();
            if (data.lastStudyDate !== yesterdayStr && data.lastStudyDate !== getTodayString()) {
              data.streak = 0;
            }
            data.todayLearned = [];
          }
          setUserDataState(data);
        } else {
          // 새 사용자: 기본 데이터 생성
          const defaultData = getDefaultUserData();
          await setDoc(userDataRef, defaultData);
          setUserDataState(defaultData);
        }
        dataLoaded.current = true;
      } catch (error) {
        console.error("[useUserData] Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  // Firestore에 저장
  const setUserData = useCallback(
    (updater: UserData | ((prev: UserData) => UserData)) => {
      setUserDataState((prev) => {
        const newData = typeof updater === "function" ? updater(prev) : updater;

        // Firestore에 저장
        if (userId) {
          const userDataRef = doc(db, "users", userId, "data", "progress");
          setDoc(userDataRef, newData).catch((err) => {
            console.error("[setUserData] Firestore save error:", err);
          });
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
          nextReview: getLocalDateString(nextReviewDate),
          interval: newInterval,
          lastStudied: today,
        };

        const todayLearned = prev.todayLearned.includes(wordId) ? prev.todayLearned : [...prev.todayLearned, wordId];

        let newStreak = prev.streak;
        if (prev.lastStudyDate !== today) {
          const yesterdayStr = getYesterdayString();
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
    (settings: { targetDate?: string; dailyGoal?: number; autoSpeak?: boolean }) => {
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

  // 오늘의 학습 세션 시작 또는 가져오기
  const getOrCreateTodaySession = useCallback(
    (wordIds: number[]): TodaySession => {
      const today = getTodayString();
      const existingSession = userData.todaySession;

      // 오늘 세션이 이미 있고 완료되지 않았으면 반환
      if (existingSession && existingSession.date === today && !existingSession.completed) {
        return existingSession;
      }

      // 새 세션 생성
      const newSession: TodaySession = {
        date: today,
        wordIds,
        currentIndex: 0,
        completed: false,
      };

      setUserData((prev) => ({
        ...prev,
        todaySession: newSession,
      }));

      return newSession;
    },
    [userData.todaySession, setUserData]
  );

  // 세션 진행 상황 업데이트
  const updateSessionProgress = useCallback(
    (currentIndex: number, completed: boolean = false) => {
      setUserData((prev) => {
        if (!prev.todaySession) return prev;
        return {
          ...prev,
          todaySession: {
            ...prev.todaySession,
            currentIndex,
            completed,
          },
        };
      });
    },
    [setUserData]
  );

  // 오늘의 세션 가져오기 (있으면)
  const getTodaySession = useCallback((): TodaySession | null => {
    const today = getTodayString();
    const session = userData.todaySession;
    if (session && session.date === today && !session.completed) {
      return session;
    }
    return null;
  }, [userData.todaySession]);

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
    getOrCreateTodaySession,
    updateSessionProgress,
    getTodaySession,
  };
}
