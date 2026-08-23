import { useState, useEffect, useCallback, useRef } from "react";
import { App } from "@capacitor/app";
import { supabase } from "@/lib/supabase";
import { getTodayStringWithResetHour, getYesterdayStringWithResetHour, getLocalDateString } from "@/lib/date";
import type { UserData, WordProgress, TodaySession } from "@/types";
import { getDefaultUserData, SR_INTERVALS } from "@/types";

// Debounce window for coalescing rapid setUserData calls (e.g. 30 answers in a session)
// into a single upsert. Long enough to catch a burst of taps, short enough that a crash
// / background-kill window has minimal unsaved data.
const SAVE_DEBOUNCE_MS = 800;

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
  // Latest committed state, read by setUserData/completeOnboarding.
  // Why: React updaters must be pure; we can't fire a supabase upsert inside
  // setUserDataState((prev) => ...), because Strict Mode / concurrent re-runs
  // duplicate the request (observed as two identical 59KB POSTs 4ms apart in Sentry).
  const latestUserDataRef = useRef<UserData>(userData);
  // Debounced save state. pendingSaveRef carries its own uid so a flush
  // fires under the userId that scheduled it, even if userId changed since.
  const saveTimerRef = useRef<number | null>(null);
  const pendingSaveRef = useRef<{ data: UserData; uid: string } | null>(null);

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
          latestUserDataRef.current = defaultData;
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

          latestUserDataRef.current = data;
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

  // Supabase 업서트 (5s abort timeout).
  // Why: 프로덕션에서 이 요청이 응답 없이 매달리면 isSaving.current가 영구 true가 되고,
  // 이후 load 경로(loadData 상단)가 차단돼 UI가 100초+ hang으로 관측됨 (Sentry).
  const saveToSupabase = useCallback(async (data: UserData, uid: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
      const row = userDataToRow(data, uid);
      const { error } = await supabase
        .from("user_data")
        .upsert(row, { onConflict: "user_id" })
        .abortSignal(controller.signal);
      if (error) {
        console.error("[useUserData] Supabase save error:", error);
      }
    } catch (err) {
      console.error("[useUserData] Supabase save exception:", err);
    } finally {
      clearTimeout(timeoutId);
      isSaving.current = false;
    }
  }, []);

  // Debounced-save helpers. flushPendingSave is safe to call anytime — no-op if nothing pending.
  const flushPendingSave = useCallback(async () => {
    if (saveTimerRef.current !== null) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    const pending = pendingSaveRef.current;
    if (!pending) return;
    pendingSaveRef.current = null;
    isSaving.current = true;
    await saveToSupabase(pending.data, pending.uid);
  }, [saveToSupabase]);

  const scheduleSave = useCallback(
    (data: UserData, uid: string) => {
      pendingSaveRef.current = { data, uid };
      if (saveTimerRef.current !== null) {
        clearTimeout(saveTimerRef.current);
      }
      saveTimerRef.current = window.setTimeout(() => {
        saveTimerRef.current = null;
        void flushPendingSave();
      }, SAVE_DEBOUNCE_MS);
    },
    [flushPendingSave]
  );

  // Supabase에 저장 (debounced)
  const setUserData = useCallback(
    (updater: UserData | ((prev: UserData) => UserData)) => {
      const newData =
        typeof updater === "function"
          ? (updater as (prev: UserData) => UserData)(latestUserDataRef.current)
          : updater;
      latestUserDataRef.current = newData;
      setUserDataState(newData);

      if (userId) {
        scheduleSave(newData, userId);
      }
    },
    [userId, scheduleSave]
  );

  // Flush triggers: 앱 백그라운드 / 탭 hide / 페이지 종료 / 언마운트 / userId 변경 시
  // 대기 중인 debounced 저장을 즉시 밀어냄. pendingSaveRef가 자기 uid를 들고 있어
  // userId가 바뀌어도 이전 유저의 데이터가 이전 유저 앞으로 정확히 저장됨.
  useEffect(() => {
    const flush = () => {
      void flushPendingSave();
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };

    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);
    const listenerPromise = App.addListener("appStateChange", ({ isActive }) => {
      if (!isActive) flush();
    });

    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibility);
      void listenerPromise.then((l) => l.remove());
      flush();
    };
  }, [flushPendingSave]);

  useEffect(() => {
    // userId 변경(로그아웃/전환) 시에도 이전 세션의 pending 저장을 밀어냄
    return () => {
      void flushPendingSave();
    };
  }, [userId, flushPendingSave]);

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

  // 온보딩 완료 — 저장 확인이 필요한 경로라 debounce 우회 (즉시 await)
  const completeOnboarding = useCallback(
    async (targetDate: string, dailyGoal: number, resetHour: number = 3) => {
      const newData: UserData = {
        ...latestUserDataRef.current,
        targetDate,
        dailyGoal,
        resetHour,
        onboardingComplete: true,
      };

      // 로컬 상태 먼저 업데이트
      latestUserDataRef.current = newData;
      setUserDataState(newData);

      if (userId) {
        // 대기 중인 debounce 저장은 stale이므로 취소하고 최신 값을 즉시 저장
        if (saveTimerRef.current !== null) {
          clearTimeout(saveTimerRef.current);
          saveTimerRef.current = null;
        }
        pendingSaveRef.current = null;
        isSaving.current = true;
        await saveToSupabase(newData, userId);
      }
    },
    [userId, saveToSupabase]
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
