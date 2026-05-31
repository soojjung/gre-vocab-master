import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { getTodayStringWithResetHour, getYesterdayStringWithResetHour, getLocalDateString } from "@/lib/date";
import type { UserData, WordProgress, TodaySession } from "@/types";
import { getDefaultUserData, SR_INTERVALS } from "@/types";

// Supabase DB row를 UserData로 변환
function rowToUserData(row: { streak: number; last_study_date: string | null; target_date: string | null; daily_goal: number; reset_hour?: number; today_learned: string[]; onboarding_complete: boolean; auto_speak: boolean; locale?: string | null; today_session: TodaySession | null; progress: Record<string, WordProgress> }): UserData {
  const defaultData = getDefaultUserData();
  return {
    targetDate: row.target_date ?? defaultData.targetDate,
    dailyGoal: row.daily_goal,
    resetHour: row.reset_hour ?? defaultData.resetHour,
    progress: row.progress ?? {},
    todayLearned: row.today_learned ?? [],
    lastStudyDate: row.last_study_date ?? "",
    streak: row.streak,
    onboardingComplete: row.onboarding_complete,
    autoSpeak: row.auto_speak,
    locale: row.locale === "ko" || row.locale === "en" ? row.locale : defaultData.locale,
    todaySession: row.today_session ?? undefined,
  };
}

// UserData를 Supabase DB row로 변환
function userDataToRow(userData: UserData, userId: string) {
  return {
    user_id: userId,
    streak: userData.streak,
    last_study_date: userData.lastStudyDate || null,
    target_date: userData.targetDate,
    daily_goal: userData.dailyGoal,
    reset_hour: userData.resetHour,
    today_learned: userData.todayLearned,
    onboarding_complete: userData.onboardingComplete,
    auto_speak: userData.autoSpeak,
    locale: userData.locale,
    today_session: userData.todaySession ?? null,
    progress: userData.progress,
    updated_at: new Date().toISOString(),
  };
}

// 메인 훅 - Supabase 전용
export function useUserData(userId?: string | null) {
  const [userData, setUserDataState] = useState<UserData>(getDefaultUserData());
  const [prevUserId, setPrevUserId] = useState(userId);
  const [loading, setLoading] = useState(!!userId);
  const dataLoaded = useRef(false);
  const isSaving = useRef(false);

  // userId 변경 감지
  if (userId !== prevUserId) {
    setPrevUserId(userId);
    setLoading(!!userId);
    dataLoaded.current = false;
  }

  useEffect(() => {
    if (!userId) {
      dataLoaded.current = false;
      return;
    }

    if (dataLoaded.current) {
      return;
    }

    const loadData = async () => {
      // 저장 중이면 로드하지 않음 (race condition 방지)
      if (isSaving.current) {
        return;
      }

      try {
        const { data: row, error } = await supabase.from("user_data").select("*").eq("user_id", userId).maybeSingle();

        if (error) {
          console.error("[useUserData] Error loading data:", error);
        } else if (!row) {
          // 데이터 없음 - 새 사용자
          const defaultData = getDefaultUserData();
          const newRow = userDataToRow(defaultData, userId);

          const { error: insertError } = await supabase.from("user_data").upsert(newRow, { onConflict: "user_id" });

          if (insertError) {
            console.error("[useUserData] Error creating user data:", insertError);
          }
          setUserDataState(defaultData);
        } else {
          const data = rowToUserData(row);
          const todayStr = getTodayStringWithResetHour(data.resetHour);

          // 날짜가 바뀌면 todayLearned 초기화
          if (data.lastStudyDate !== todayStr) {
            const yesterdayStr = getYesterdayStringWithResetHour(data.resetHour);
            if (data.lastStudyDate !== yesterdayStr && data.lastStudyDate !== todayStr) {
              data.streak = 0;
            }
            data.todayLearned = [];
          }

          setUserDataState(data);
        }

        dataLoaded.current = true;
      } catch (error) {
        console.error("[useUserData] Error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  // Supabase에 저장
  const setUserData = useCallback(
    (updater: UserData | ((prev: UserData) => UserData)) => {
      setUserDataState((prev) => {
        const newData = typeof updater === "function" ? updater(prev) : updater;

        // Supabase에 저장
        if (userId) {
          isSaving.current = true;
          const row = userDataToRow(newData, userId);
          supabase
            .from("user_data")
            .upsert(row, { onConflict: "user_id" })
            .then(({ error }) => {
              isSaving.current = false;
              if (error) {
                console.error("[setUserData] Supabase save error:", error);
              }
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
        const today = getTodayStringWithResetHour(prev.resetHour);
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
          newInterval = SR_INTERVALS[nextIdx] ?? 1;
          if (progress.correctCount >= 3 && newInterval >= 7) {
            newStatus = "mastered";
          } else {
            newStatus = "learning";
          }
        } else {
          newInterval = SR_INTERVALS[0] ?? 1;
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
          const yesterdayStr = getYesterdayStringWithResetHour(prev.resetHour);
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
          nextReview: getTodayStringWithResetHour(prev.resetHour),
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
    (settings: { targetDate?: string; dailyGoal?: number; resetHour?: number; autoSpeak?: boolean; locale?: "ko" | "en" }) => {
      setUserData((prev) => ({
        ...prev,
        ...settings,
      }));
    },
    [setUserData]
  );

  // 온보딩 완료
  const completeOnboarding = useCallback(
    async (targetDate: string, dailyGoal: number, resetHour: number = 3) => {
      const newData: UserData = {
        ...userData,
        targetDate,
        dailyGoal,
        resetHour,
        onboardingComplete: true,
      };

      // 로컬 상태 먼저 업데이트
      setUserDataState(newData);

      // Supabase에 직접 저장 (await로 완료 확인)
      if (userId) {
        isSaving.current = true;
        const row = userDataToRow(newData, userId);

        const { error } = await supabase.from("user_data").upsert(row, { onConflict: "user_id" });

        isSaving.current = false;

        if (error) {
          console.error("[completeOnboarding] Save error:", error);
        }
      }
    },
    [userData, userId]
  );

  // 데이터 초기화
  const resetData = useCallback(() => {
    const newData = getDefaultUserData();
    setUserData(newData);
  }, [setUserData]);

  // 오늘의 학습 세션 시작 또는 가져오기
  const getOrCreateTodaySession = useCallback(
    (wordIds: number[]): TodaySession => {
      const today = getTodayStringWithResetHour(userData.resetHour);
      const existingSession = userData.todaySession;

      // 오늘 세션이 이미 있으면 반환 (완료 여부와 관계없이 같은 단어 set 유지)
      if (existingSession && existingSession.date === today) {
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
    [userData.resetHour, userData.todaySession, setUserData]
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

  // 오늘의 세션 가져오기 (있으면, 완료 여부와 관계없이)
  const getTodaySession = useCallback((): TodaySession | null => {
    const today = getTodayStringWithResetHour(userData.resetHour);
    const session = userData.todaySession;
    if (session && session.date === today) {
      return session;
    }
    return null;
  }, [userData.resetHour, userData.todaySession]);

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
    const today = getTodayStringWithResetHour(userData.resetHour);
    return Object.entries(userData.progress).filter(([, p]) => {
      return p.status === "learning" && p.nextReview <= today;
    }).length;
  }, [userData.resetHour, userData.progress]);

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
