import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useWords } from "@/contexts/WordsContext";
import { useUserDataContext } from "@/contexts/UserDataContext";
import { getTodayStringWithResetHour } from "@/lib/date";
import { speakWord } from "@/lib/tts";
import { createShuffledIndices } from "@/lib/shuffle";

/** 학습 페이지의 모든 상태와 로직을 관리하는 커스텀 훅 */
export function useStudySession(isReviewOnlyMode: boolean) {
  const { words } = useWords();
  const { userData, loading, recordAnswer, updateSettings, getOrCreateTodaySession, updateSessionProgress } = useUserDataContext();

  // 오늘 날짜 기반 셔플 순서
  const todayShuffledIndices = useMemo(() => {
    return createShuffledIndices(words.length, getTodayStringWithResetHour(userData.resetHour));
  }, [words.length, userData.resetHour]);

  // 상태
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0, wrongWordIds: [] as number[] });
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [, setReviewWrongIds] = useState<number[]>([]);
  const [quizMode, setQuizMode] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [srReviewIndex, setSrReviewIndex] = useState(0);
  const [srReviewComplete, setSrReviewComplete] = useState(false);

  // SR 복습 대상 단어
  const srReviewWords = useMemo(() => {
    const today = getTodayStringWithResetHour(userData.resetHour);
    return words.filter((word) => {
      const progress = userData.progress[String(word.id)];
      return progress && progress.status === "learning" && progress.nextReview <= today;
    });
  }, [words, userData.resetHour, userData.progress]);

  // 오늘 학습할 단어 ID (새 단어만)
  const generateWordIds = useMemo(() => {
    const newWordIds = new Set(
      words
        .filter((word) => {
          const progress = userData.progress[String(word.id)];
          return !progress || progress.status === "new";
        })
        .map((w) => w.id)
    );
    const shuffledNewWordIds = todayShuffledIndices.filter((idx) => newWordIds.has(words[idx].id)).map((idx) => words[idx].id);
    return shuffledNewWordIds.slice(0, userData.dailyGoal);
  }, [words, userData.progress, userData.dailyGoal, todayShuffledIndices]);

  // 오늘의 세션
  const todaySession = useMemo(() => {
    const today = getTodayStringWithResetHour(userData.resetHour);
    const existingSession = userData.todaySession;
    if (existingSession && existingSession.date === today) {
      return existingSession;
    }
    return null;
  }, [userData.resetHour, userData.todaySession]);

  // 세션 생성
  const sessionCreated = useRef(false);
  useEffect(() => {
    if (!todaySession && !sessionCreated.current && generateWordIds.length > 0) {
      sessionCreated.current = true;
      getOrCreateTodaySession(generateWordIds);
    }
  }, [todaySession, generateWordIds, getOrCreateTodaySession]);

  const currentIndex = todaySession?.currentIndex ?? 0;

  const studyWords = useMemo(() => {
    if (todaySession) {
      return todaySession.wordIds.map((id) => words.find((w) => w.id === id)).filter((w): w is (typeof words)[0] => w !== undefined);
    }
    return [];
  }, [words, todaySession]);

  const currentWord = studyWords[currentIndex];

  // 복습할 단어 (틀린 단어)
  const reviewWords = useMemo(() => {
    return sessionStats.wrongWordIds.map((id) => words.find((w) => w.id === id)).filter((w): w is (typeof words)[0] => w !== undefined);
  }, [words, sessionStats.wrongWordIds]);

  // 자동 발음 토글
  const toggleAutoSpeak = useCallback(() => {
    updateSettings({ autoSpeak: !userData.autoSpeak });
  }, [updateSettings, userData.autoSpeak]);

  // 자동 발음 effects
  useEffect(() => {
    const isComplete = sessionComplete || todaySession?.completed;
    if (currentWord && userData.autoSpeak && !isFlipped && !quizMode && !isComplete && !isReviewOnlyMode) {
      speakWord(currentWord.word);
    }
  }, [currentWord, userData.autoSpeak, isFlipped, quizMode, sessionComplete, todaySession?.completed, isReviewOnlyMode]);

  useEffect(() => {
    if (quizMode && studyWords[quizIndex] && userData.autoSpeak && !isFlipped) {
      speakWord(studyWords[quizIndex].word);
    }
  }, [quizMode, quizIndex, studyWords, userData.autoSpeak, isFlipped]);

  useEffect(() => {
    if (reviewMode && reviewWords[reviewIndex] && userData.autoSpeak && !isFlipped) {
      speakWord(reviewWords[reviewIndex].word);
    }
  }, [reviewMode, reviewIndex, reviewWords, userData.autoSpeak, isFlipped]);

  useEffect(() => {
    if (isReviewOnlyMode && !srReviewComplete && srReviewWords[srReviewIndex] && userData.autoSpeak && !isFlipped) {
      speakWord(srReviewWords[srReviewIndex].word);
    }
  }, [isReviewOnlyMode, srReviewComplete, srReviewIndex, srReviewWords, userData.autoSpeak, isFlipped]);

  // 핸들러들
  const handleFlip = useCallback(() => setIsFlipped(true), []);

  const handleNext = useCallback(() => {
    if (!currentWord) return;
    recordAnswer(String(currentWord.id), true);
    if (currentIndex < studyWords.length - 1) {
      updateSessionProgress(currentIndex + 1);
      setIsFlipped(false);
    } else {
      updateSessionProgress(currentIndex, true);
      setSessionComplete(true);
    }
  }, [currentWord, currentIndex, studyWords.length, recordAnswer, updateSessionProgress]);

  const startReview = useCallback(() => {
    setReviewMode(true);
    setReviewIndex(0);
    setReviewWrongIds([]);
    setIsFlipped(false);
  }, []);

  const handleReviewAnswer = useCallback(
    (correct: boolean) => {
      const reviewWord = reviewWords[reviewIndex];
      if (!reviewWord) return;

      const isLastWord = reviewIndex === reviewWords.length - 1;

      if (isLastWord) {
        setReviewWrongIds((prev) => {
          const stillWrong = !correct ? [...prev, reviewWord.id] : prev;
          const correctCount = reviewWords.length - stillWrong.length;
          setReviewMode(false);
          setSessionStats({
            correct: correctCount,
            wrong: stillWrong.length,
            wrongWordIds: stillWrong,
          });
          return [];
        });
      } else {
        if (!correct) {
          setReviewWrongIds((prev) => [...prev, reviewWord.id]);
        }
        setReviewIndex((prev) => prev + 1);
        setIsFlipped(false);
      }
    },
    [reviewIndex, reviewWords]
  );

  const exitReviewMode = useCallback(() => {
    setReviewMode(false);
    setSessionStats({ correct: 0, wrong: 0, wrongWordIds: [] });
  }, []);

  const startQuiz = useCallback(() => {
    setQuizMode(true);
    setQuizIndex(0);
    setIsFlipped(false);
    setSessionStats({ correct: 0, wrong: 0, wrongWordIds: [] });
  }, []);

  const handleQuizAnswer = useCallback(
    (correct: boolean) => {
      const quizWord = studyWords[quizIndex];
      if (!quizWord) return;

      setSessionStats((prev) => ({
        correct: prev.correct + (correct ? 1 : 0),
        wrong: prev.wrong + (correct ? 0 : 1),
        wrongWordIds: correct ? prev.wrongWordIds : [...prev.wrongWordIds, quizWord.id],
      }));

      if (quizIndex < studyWords.length - 1) {
        setQuizIndex((prev) => prev + 1);
        setIsFlipped(false);
      } else {
        setQuizMode(false);
        setSessionComplete(true);
      }
    },
    [quizIndex, studyWords]
  );

  const exitQuizMode = useCallback(() => {
    setQuizMode(false);
    setSessionStats({ correct: 0, wrong: 0, wrongWordIds: [] });
  }, []);

  const handleSrReviewNext = useCallback(() => {
    const word = srReviewWords[srReviewIndex];
    if (!word) return;
    recordAnswer(String(word.id), true);
    if (srReviewIndex < srReviewWords.length - 1) {
      setSrReviewIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      setSrReviewComplete(true);
    }
  }, [srReviewIndex, srReviewWords, recordAnswer]);

  return {
    // 상태
    loading,
    isFlipped,
    sessionComplete,
    sessionStats,
    reviewMode,
    reviewIndex,
    quizMode,
    quizIndex,
    srReviewIndex,
    srReviewComplete,
    // 데이터
    userData,
    currentWord,
    currentIndex,
    studyWords,
    reviewWords,
    srReviewWords,
    todaySession,
    // 핸들러
    handleFlip,
    handleNext,
    startReview,
    handleReviewAnswer,
    exitReviewMode,
    startQuiz,
    handleQuizAnswer,
    exitQuizMode,
    handleSrReviewNext,
    toggleAutoSpeak,
    setIsFlipped,
  };
}
