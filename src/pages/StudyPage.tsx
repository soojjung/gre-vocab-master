import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Home, Volume2, VolumeX } from "lucide-react";
import { words } from "@/data/words";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/hooks/useUserData";
import { getTodayString } from "@/lib/date";
import { Button } from "@/components/common";

// 모듈 로드 시 한 번만 셔플 순서 생성 (렌더링 외부)
function createShuffledIndices(length: number): number[] {
  const indices = Array.from({ length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}
const SHUFFLED_WORD_INDICES = createShuffledIndices(words.length);

// 영어 발음 재생 함수
function speakWord(word: string) {
  // 이전 발음 중지
  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  utterance.rate = 0.9;
  speechSynthesis.speak(utterance);
}

export function StudyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userData, recordAnswer, updateSettings } = useUserData(user?.uid);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0 });

  // 학습할 단어 선택 (복습 대기 단어 우선, 그 다음 새 단어는 랜덤)
  const studyWords = useMemo(() => {
    const today = getTodayString();

    // 1. 복습 대기 단어 (복습 날짜가 된 단어들)
    const reviewWords = words.filter((word) => {
      const progress = userData.progress[String(word.id)];
      return progress && progress.status === "learning" && progress.nextReview <= today;
    });

    // 2. 새 단어 (아직 학습하지 않은 단어들) - ID 집합으로 저장
    const newWordIds = new Set(
      words
        .filter((word) => {
          const progress = userData.progress[String(word.id)];
          return !progress || progress.status === "new";
        })
        .map((w) => w.id)
    );

    // 미리 섞인 순서대로 새 단어 정렬
    const shuffledNewWords = SHUFFLED_WORD_INDICES.filter((idx) => newWordIds.has(words[idx].id)).map((idx) => words[idx]);

    // 복습 단어 먼저, 그 다음 랜덤 새 단어
    return [...reviewWords, ...shuffledNewWords].slice(0, userData.dailyGoal);
  }, [userData.progress, userData.dailyGoal]);

  const currentWord = studyWords[currentIndex];
  const progress = currentIndex + 1;

  // 자동 발음 재생: 단어가 바뀌고 카드가 앞면일 때
  useEffect(() => {
    if (currentWord && userData.autoSpeak && !isFlipped) {
      speakWord(currentWord.word);
    }
  }, [currentWord, userData.autoSpeak, isFlipped]);

  const handleFlip = useCallback(() => {
    setIsFlipped(true);
  }, []);

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

      {/* 발음 토글 버튼 */}
      <div className="flex justify-end mt-6">
        <button onClick={toggleAutoSpeak} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors bg-gray-100 text-gray-600">
          {userData.autoSpeak ? <Volume2 size={18} /> : <VolumeX size={18} />}
          <span>자동 발음</span>
        </button>
      </div>

      {/* 답변 버튼 */}
      {isFlipped && (
        <div className="flex gap-4 mt-6">
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
