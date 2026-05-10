import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/common";
import { FlashCard, StudyComplete, StudyHeader, AnswerButtons, AutoSpeakToggle } from "@/components/study";
import { useStudySession } from "@/hooks/useStudySession";

export function StudyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isReviewOnlyMode = searchParams.get("mode") === "review";

  const {
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
    userData,
    currentWord,
    currentIndex,
    studyWords,
    reviewWords,
    srReviewWords,
    todaySession,
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
  } = useStudySession(isReviewOnlyMode);

  // 로딩
  if (loading) {
    return (
      <div className="min-h-dvh bg-white px-5 pb-8 flex flex-col pt-[max(2rem,env(safe-area-inset-top))]">
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

  // SR 복습 전용 모드
  if (isReviewOnlyMode) {
    if (srReviewComplete || srReviewWords.length === 0) {
      return (
        <div className="min-h-dvh bg-white px-5 py-8 flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{srReviewWords.length === 0 ? "복습할 단어가 없어요" : "복습 완료!"}</h2>
            <p className="text-gray-500 mb-8">{srReviewWords.length === 0 ? "새로운 단어를 학습해보세요" : "수고했어요! 간격 반복 알고리즘에 따라 다음 복습일이 설정되었어요"}</p>
            {srReviewWords.length > 0 && (
              <div className="bg-gray-50 rounded-2xl p-6 w-full max-w-xs mb-8">
                <div className="text-4xl font-bold text-gray-900 mb-2">{srReviewWords.length}개</div>
                <div className="text-sm text-gray-500">단어 복습 완료</div>
              </div>
            )}
          </div>
          <Button onClick={() => navigate("/")}>홈으로 돌아가기</Button>
        </div>
      );
    }

    const currentSrWord = srReviewWords[srReviewIndex];
    if (!currentSrWord) {
      // 인덱스 OOB 방어 (snapshot 으로 막혀 있지만 noUncheckedIndexedAccess 만족용).
      return null;
    }
    return (
      <div className="min-h-dvh bg-white px-5 pb-8 flex flex-col pt-[max(2rem,env(safe-area-inset-top))]">
        <StudyHeader current={srReviewIndex + 1} total={srReviewWords.length} onBack={() => navigate("/")} />
        <div className="mb-2 text-center">
          <span className="text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full">SR 복습</span>
        </div>
        <FlashCard word={currentSrWord} isFlipped={isFlipped} onFlip={() => setIsFlipped(true)} />
        <AutoSpeakToggle enabled={userData.autoSpeak} onToggle={toggleAutoSpeak} />
        {isFlipped && (
          <div className="mt-6">
            <Button onClick={handleSrReviewNext}>{srReviewIndex < srReviewWords.length - 1 ? "다음 단어" : "복습 완료"}</Button>
          </div>
        )}
      </div>
    );
  }

  // 완료 화면
  if ((sessionComplete || todaySession?.completed) && !reviewMode && !quizMode) {
    const showQuizButton = sessionStats.correct === 0 && sessionStats.wrong === 0;
    return <StudyComplete stats={sessionStats} onGoHome={() => navigate("/")} onStartReview={startReview} onStartQuiz={startQuiz} showQuizButton={showQuizButton} />;
  }

  // 복습 모드 (틀린 단어)
  if (reviewMode && reviewWords.length > 0) {
    const reviewWord = reviewWords[reviewIndex];
    if (!reviewWord) return null;
    return (
      <div className="min-h-dvh bg-white px-5 pb-8 flex flex-col pt-[max(2rem,env(safe-area-inset-top))]">
        <StudyHeader current={reviewIndex + 1} total={reviewWords.length} onBack={exitReviewMode} />
        <FlashCard word={reviewWord} isFlipped={isFlipped} onFlip={() => setIsFlipped(true)} />
        <AutoSpeakToggle enabled={userData.autoSpeak} onToggle={toggleAutoSpeak} />
        {isFlipped && <AnswerButtons onAnswer={handleReviewAnswer} />}
      </div>
    );
  }

  // 퀴즈 모드
  if (quizMode && studyWords.length > 0) {
    const quizWord = studyWords[quizIndex];
    if (!quizWord) return null;
    return (
      <div className="min-h-dvh bg-white px-5 pb-8 flex flex-col pt-[max(2rem,env(safe-area-inset-top))]">
        <StudyHeader current={quizIndex + 1} total={studyWords.length} onBack={exitQuizMode} />
        <FlashCard word={quizWord} isFlipped={isFlipped} onFlip={() => setIsFlipped(true)} />
        <AutoSpeakToggle enabled={userData.autoSpeak} onToggle={toggleAutoSpeak} />
        {isFlipped && <AnswerButtons onAnswer={handleQuizAnswer} />}
      </div>
    );
  }

  // 단어 없음
  if (!currentWord) {
    return (
      <div className="min-h-dvh bg-white px-5 pb-8 flex flex-col items-center justify-center pt-[max(2rem,env(safe-area-inset-top))]">
        <p className="text-gray-500">학습할 단어가 없습니다.</p>
        <button onClick={() => navigate("/")} className="mt-4 text-black underline">
          돌아가기
        </button>
      </div>
    );
  }

  // 기본 학습 화면
  return (
    <div className="min-h-dvh bg-white px-5 pb-8 flex flex-col pt-[max(2rem,env(safe-area-inset-top))]">
      <StudyHeader current={currentIndex + 1} total={studyWords.length} onBack={() => navigate(-1)} />
      <FlashCard word={currentWord} isFlipped={isFlipped} onFlip={handleFlip} />
      <AutoSpeakToggle enabled={userData.autoSpeak} onToggle={toggleAutoSpeak} />
      {isFlipped && (
        <div className="mt-6">
          <Button onClick={handleNext}>{currentIndex < studyWords.length - 1 ? "다음 단어" : "학습 완료"}</Button>
        </div>
      )}
    </div>
  );
}
