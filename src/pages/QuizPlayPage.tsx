import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { X } from "lucide-react";
import { useWords } from "@/contexts/WordsContext";
import type { Word } from "@/types";
import { useUserDataContext } from "@/contexts/UserDataContext";
import { useQuiz } from "@/contexts/QuizContext";
import { getBlankSentence } from "@/lib/blankSentence";

interface QuizQuestion {
  word: Word;
  options: Word[];
  correctIndex: number;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateQuestions(availableWords: Word[], count: number): QuizQuestion[] {
  const shuffledWords = shuffleArray(availableWords);
  const selectedWords = shuffledWords.slice(0, count);

  return selectedWords.map((word) => {
    const otherWords = availableWords.filter((w) => w.id !== word.id);
    const wrongOptions = shuffleArray(otherWords).slice(0, 3);
    const allOptions = shuffleArray([word, ...wrongOptions]);
    const correctIndex = allOptions.findIndex((w) => w.id === word.id);

    return { word, options: allOptions, correctIndex };
  });
}

export function QuizPlayPage() {
  const navigate = useNavigate();
  const { words } = useWords();
  const { userData, loading } = useUserDataContext();
  const { quizType, quizCount, setQuizResults } = useQuiz();

  const quizWords = useMemo(() => {
    return words.filter((word) => {
      const progress = userData.progress[String(word.id)];
      return progress && (progress.status === "learning" || progress.status === "mastered");
    });
  }, [words, userData.progress]);

  const questions = useMemo(() => generateQuestions(quizWords, quizCount), [quizWords, quizCount]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [results, setResults] = useState<{ word: Word; selectedIndex: number; correctIndex: number; isCorrect: boolean }[]>([]);
  const resultsRef = useRef(results);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const TOAST_DURATION = 1500;

  // ref를 최신 상태로 유지
  useEffect(() => {
    resultsRef.current = results;
  }, [results]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const goToNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedIndex(null);
      setShowResult(false);
    } else {
      setQuizResults(resultsRef.current);
      navigate("/quiz/result");
    }
  }, [currentIndex, questions.length, setQuizResults, navigate]);

  const handleSelectOption = useCallback(
    (index: number, question: QuizQuestion) => {
      if (showResult) return;

      setSelectedIndex(index);
      setShowResult(true);

      const isCorrect = index === question.correctIndex;

      if (isCorrect) {
        toast.success("정답입니다!", { duration: TOAST_DURATION });
      } else {
        toast.error(`오답! 정답: ${question.word.word}`, { duration: TOAST_DURATION });
      }

      setResults((prev) => [
        ...prev,
        {
          word: question.word,
          selectedIndex: index,
          correctIndex: question.correctIndex,
          isCorrect,
        },
      ]);

      timeoutRef.current = setTimeout(goToNext, TOAST_DURATION);
    },
    [showResult, goToNext]
  );

  // 로딩 중이면 로딩 화면 표시
  if (loading) {
    return (
      <div className="min-h-dvh bg-white flex items-center justify-center pt-[env(safe-area-inset-top)]">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  // 퀴즈 단어가 부족하면 선택 페이지로 리다이렉트
  if (quizWords.length < 4) {
    return <Navigate to="/quiz" replace />;
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const getOptionStyle = (index: number) => {
    if (!showResult) return "bg-gray-50 border-gray-200 text-gray-900";
    if (index === currentQuestion.correctIndex) return "bg-green-50 border-green-500 text-green-700";
    if (index === selectedIndex && index !== currentQuestion.correctIndex) return "bg-red-50 border-red-500 text-red-700";
    return "bg-gray-50 border-gray-200 text-gray-400";
  };

  return (
    <div className="min-h-dvh bg-white flex flex-col">
      {/* 상단 헤더 */}
      <header className="px-5 py-4 border-b border-gray-100 pt-[max(2rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate("/quiz")} className="text-gray-600 hover:text-gray-900">
            <X size={24} />
          </button>
          <span className="text-sm font-medium text-gray-900">
            {currentIndex + 1} / {questions.length}
          </span>
          <div className="w-6" />
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-black rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </header>

      {/* 문제 영역 */}
      <div className="flex-1 px-5 py-6">
        {quizType === "fill-blank" ? (
          <div>
            <div className="text-sm text-gray-500 mb-2">빈칸에 알맞은 단어를 선택하세요</div>
            <div className="text-lg text-gray-900 leading-relaxed mb-2">{getBlankSentence(currentQuestion.word.example, currentQuestion.word.word)}</div>
            <div className="text-sm text-gray-500 mb-8">{currentQuestion.word.exampleKo}</div>
          </div>
        ) : (
          <div>
            <div className="text-sm text-gray-500 mb-2">다음 뜻에 해당하는 단어를 선택하세요</div>
            <div className="text-xl font-medium text-gray-900 mb-8">{currentQuestion.word.meaning}</div>
          </div>
        )}

        {/* 보기 */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button key={option.id} onClick={() => handleSelectOption(index, currentQuestion)} disabled={showResult} className={`w-full p-4 rounded-xl border-2 text-left transition-all ${getOptionStyle(index)}`}>
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    showResult && index === currentQuestion.correctIndex ? "bg-green-500 text-white" : showResult && index === selectedIndex && index !== currentQuestion.correctIndex ? "bg-red-500 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="font-medium">{option.word}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
