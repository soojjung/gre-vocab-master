import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { words } from "@/data/words";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/hooks/useUserData";
import { getTodayString } from "@/lib/date";
import { speakWord } from "@/lib/tts";
import { createShuffledIndices } from "@/lib/shuffle";
import { Button } from "@/components/common";
import { FlashCard, StudyComplete, StudyHeader, AnswerButtons } from "@/components/study";

export function StudyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userData, loading, recordAnswer, updateSettings, getOrCreateTodaySession, updateSessionProgress } = useUserData(user?.id);

  // 오늘 날짜 기반 셔플 순서 (같은 날에는 항상 동일)
  const todayShuffledIndices = useMemo(() => {
    return createShuffledIndices(words.length, getTodayString());
  }, []);

  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0, wrongWordIds: [] as number[] });
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);

  // 오늘 학습할 단어 ID 생성
  const generateWordIds = useMemo(() => {
    const today = getTodayString();

    const reviewWordIds = words
      .filter((word) => {
        const progress = userData.progress[String(word.id)];
        return progress && progress.status === "learning" && progress.nextReview <= today;
      })
      .map((w) => w.id);

    const newWordIds = new Set(
      words
        .filter((word) => {
          const progress = userData.progress[String(word.id)];
          return !progress || progress.status === "new";
        })
        .map((w) => w.id)
    );

    const shuffledNewWordIds = todayShuffledIndices.filter((idx) => newWordIds.has(words[idx].id)).map((idx) => words[idx].id);

    return [...reviewWordIds, ...shuffledNewWordIds].slice(0, userData.dailyGoal);
  }, [userData.progress, userData.dailyGoal, todayShuffledIndices]);

  // 오늘의 세션
  const todaySession = useMemo(() => {
    const today = getTodayString();
    const existingSession = userData.todaySession;
    if (existingSession && existingSession.date === today && !existingSession.completed) {
      return existingSession;
    }
    return null;
  }, [userData.todaySession]);

  // 세션이 없으면 생성
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
  }, [todaySession]);

  const currentWord = studyWords[currentIndex];

  // 자동 발음
  useEffect(() => {
    if (currentWord && userData.autoSpeak && !isFlipped) {
      speakWord(currentWord.word);
    }
  }, [currentWord, userData.autoSpeak, isFlipped]);

  const handleFlip = useCallback(() => setIsFlipped(true), []);

  const toggleAutoSpeak = useCallback(() => {
    updateSettings({ autoSpeak: !userData.autoSpeak });
  }, [updateSettings, userData.autoSpeak]);

  const handleAnswer = useCallback(
    (correct: boolean) => {
      if (!currentWord) return;

      recordAnswer(String(currentWord.id), correct);
      setSessionStats((prev) => ({
        correct: prev.correct + (correct ? 1 : 0),
        wrong: prev.wrong + (correct ? 0 : 1),
        wrongWordIds: correct ? prev.wrongWordIds : [...prev.wrongWordIds, currentWord.id],
      }));

      if (currentIndex < studyWords.length - 1) {
        updateSessionProgress(currentIndex + 1);
        setIsFlipped(false);
      } else {
        updateSessionProgress(currentIndex, true);
        setSessionComplete(true);
      }
    },
    [currentWord, currentIndex, studyWords.length, recordAnswer, updateSessionProgress]
  );

  // 복습 관련
  const reviewWords = useMemo(() => {
    return sessionStats.wrongWordIds.map((id) => words.find((w) => w.id === id)).filter((w): w is (typeof words)[0] => w !== undefined);
  }, [sessionStats.wrongWordIds]);

  const startReview = useCallback(() => {
    setReviewMode(true);
    setReviewIndex(0);
    setIsFlipped(false);
  }, []);

  const handleReviewNext = useCallback(() => {
    if (reviewIndex < reviewWords.length - 1) {
      setReviewIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      setReviewMode(false);
      setSessionStats((prev) => ({ ...prev, wrongWordIds: [] }));
    }
  }, [reviewIndex, reviewWords.length]);

  // 로딩
  if (loading) {
    return (
      <div className="min-h-dvh bg-white px-5 py-8 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="w-10 h-10 bg-gray-100 rounded animate-pulse" />
          <div className="w-16 h-5 bg-gray-100 rounded animate-pulse" />
          <div className="w-10" />
        </div>
        <div className="h-1 bg-gray-100 rounded-full mb-8" />
        <div className="flex justify-center">
          <div className="w-full max-w-sm aspect-square rounded-3xl bg-gray-200 animate-pulse" />
        </div>
      </div>
    );
  }

  // 완료 화면
  if (sessionComplete && !reviewMode) {
    return <StudyComplete stats={sessionStats} onGoHome={() => navigate("/")} onStartReview={startReview} />;
  }

  // 복습 모드
  if (reviewMode && reviewWords.length > 0) {
    const reviewWord = reviewWords[reviewIndex];

    return (
      <div className="min-h-dvh bg-white px-5 py-8 flex flex-col">
        <StudyHeader current={reviewIndex + 1} total={reviewWords.length} onBack={() => setReviewMode(false)} />
        <FlashCard word={reviewWord} isFlipped={isFlipped} onFlip={() => setIsFlipped(true)} />
        {isFlipped && (
          <div className="mt-6">
            <Button onClick={handleReviewNext}>{reviewIndex < reviewWords.length - 1 ? "다음 단어" : "복습 완료"}</Button>
          </div>
        )}
      </div>
    );
  }

  // 단어 없음
  if (!currentWord) {
    return (
      <div className="min-h-dvh bg-white px-5 py-8 flex flex-col items-center justify-center">
        <p className="text-gray-500">학습할 단어가 없습니다.</p>
        <button onClick={() => navigate("/")} className="mt-4 text-black underline">
          돌아가기
        </button>
      </div>
    );
  }

  // 기본 학습 화면
  return (
    <div className="min-h-dvh bg-white px-5 py-8 flex flex-col">
      <StudyHeader current={currentIndex + 1} total={studyWords.length} onBack={() => navigate(-1)} />
      <FlashCard word={currentWord} isFlipped={isFlipped} onFlip={handleFlip} />

      {/* 자동 발음 토글 */}
      <div className="flex items-center justify-end gap-2 mt-6">
        <span className="text-sm text-gray-600">자동 발음</span>
        <button onClick={toggleAutoSpeak} className={`relative w-11 h-6 rounded-full transition-colors ${userData.autoSpeak ? "bg-black" : "bg-gray-300"}`}>
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${userData.autoSpeak ? "translate-x-6" : "translate-x-1"}`} />
        </button>
      </div>

      {isFlipped && <AnswerButtons onAnswer={handleAnswer} />}
    </div>
  );
}
