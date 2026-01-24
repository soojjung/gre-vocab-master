import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Home } from "lucide-react";
import { words } from "@/data/words";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/hooks/useUserData";
import { getTodayString } from "@/lib/date";
import { Button } from "@/components/common";

export function StudyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userData, recordAnswer } = useUserData(user?.uid);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0 });

  // 학습할 단어 선택 (복습 대기 단어 우선, 그 다음 새 단어)
  const studyWords = useMemo(() => {
    const today = getTodayString();

    const reviewWords = words.filter((word) => {
      const progress = userData.progress[String(word.id)];
      return progress && progress.status === "learning" && progress.nextReview <= today;
    });

    const newWords = words.filter((word) => {
      const progress = userData.progress[String(word.id)];
      return !progress || progress.status === "new";
    });

    return [...reviewWords, ...newWords].slice(0, userData.dailyGoal);
  }, [userData.progress, userData.dailyGoal]);

  const currentWord = studyWords[currentIndex];
  const progress = currentIndex + 1;

  const handleFlip = useCallback(() => {
    setIsFlipped(true);
  }, []);

  const handleAnswer = useCallback(
    (correct: boolean) => {
      if (!currentWord) return;

      recordAnswer(String(currentWord.id), correct);
      setSessionStats((prev) => ({
        correct: prev.correct + (correct ? 1 : 0),
        wrong: prev.wrong + (correct ? 0 : 1),
      }));

      if (currentIndex < studyWords.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setIsFlipped(false);
      } else {
        setSessionComplete(true);
      }
    },
    [currentWord, currentIndex, studyWords.length, recordAnswer]
  );

  // 세션 완료 화면
  if (sessionComplete) {
    const total = sessionStats.correct + sessionStats.wrong;
    const percentage = total > 0 ? Math.round((sessionStats.correct / total) * 100) : 0;

    return (
      <div className="min-h-screen bg-white px-5 py-8 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="text-6xl mb-6">{percentage >= 80 ? "🎉" : percentage >= 50 ? "👍" : "💪"}</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">학습 완료!</h2>
          <p className="text-gray-500 mb-8">오늘도 수고했어요</p>

          <div className="bg-gray-50 rounded-2xl p-6 w-full max-w-xs">
            <div className="text-4xl font-bold text-gray-900 mb-2">{percentage}%</div>
            <div className="text-sm text-gray-500 mb-4">정답률</div>
            <div className="flex justify-center gap-8">
              <div>
                <div className="text-2xl font-bold text-green-500">{sessionStats.correct}</div>
                <div className="text-xs text-gray-500">맞음</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-500">{sessionStats.wrong}</div>
                <div className="text-xs text-gray-500">틀림</div>
              </div>
            </div>
          </div>
        </div>

        <Button onClick={() => navigate("/")} icon={<Home size={20} />}>
          홈으로 돌아가기
        </Button>
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="min-h-screen bg-white px-5 py-8 flex flex-col items-center justify-center">
        <p className="text-gray-500">학습할 단어가 없습니다.</p>
        <button onClick={() => navigate("/")} className="mt-4 text-black underline">
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-5 py-8 flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate("/")} className="p-2 -ml-2 text-gray-600">
          <ChevronLeft size={24} />
        </button>
        <div className="text-sm text-gray-600">
          <span className="font-medium text-gray-900">{progress}</span> / {studyWords.length}
        </div>
        <div className="w-10" />
      </div>

      {/* 진행률 바 */}
      <div className="h-1 bg-gray-100 rounded-full mb-8 overflow-hidden">
        <div className="h-full bg-black rounded-full transition-all duration-200" style={{ width: `${(progress / studyWords.length) * 100}%` }} />
      </div>

      {/* 플래시카드 */}
      <div className="flex justify-center">
        <div
          onClick={!isFlipped ? handleFlip : undefined}
          className={`
            w-full max-w-sm aspect-square rounded-3xl px-8
            flex flex-col items-center justify-center text-center
            transition-all duration-200 cursor-pointer
            ${isFlipped ? "bg-gray-50" : "bg-black text-white shadow-2xl active:scale-[0.98]"}
          `}
        >
          {!isFlipped ? (
            <>
              <div className="text-3xl font-bold mb-4">{currentWord.word}</div>
              <div className="text-sm text-gray-400">탭하여 뜻 보기</div>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold text-gray-900 mb-3">{currentWord.word}</div>
              <div className="text-xl text-gray-700 mb-5">{currentWord.meaning}</div>
              <div className="text-sm text-gray-500 leading-relaxed px-2 mb-2">"{currentWord.example}"</div>
              <div className="text-sm text-gray-400 leading-relaxed px-2">"{currentWord.exampleKo}"</div>
            </>
          )}
        </div>
      </div>

      {/* 답변 버튼 */}
      {isFlipped && (
        <div className="flex gap-4 mt-8">
          <button onClick={() => handleAnswer(false)} className="flex-1 bg-red-50 text-red-600 py-4 rounded-xl font-medium text-lg active:bg-red-100 transition-colors flex items-center justify-center gap-2">
            <span>몰라요</span>
            <span>✕</span>
          </button>
          <button onClick={() => handleAnswer(true)} className="flex-1 bg-green-50 text-green-600 py-4 rounded-xl font-medium text-lg active:bg-green-100 transition-colors flex items-center justify-center gap-2">
            <span>알아요</span>
            <span>✓</span>
          </button>
        </div>
      )}
    </div>
  );
}
