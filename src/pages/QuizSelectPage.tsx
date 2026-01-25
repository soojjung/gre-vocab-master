import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PenLine, ListChecks, Play } from "lucide-react";
import { words } from "@/data/words";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/hooks/useUserData";
import { useQuiz } from "@/contexts/QuizContext";
import { BackHeader } from "@/components/BackHeader";
import { Button } from "@/components/common";

type QuizType = "fill-blank" | "multiple-choice";

const QUIZ_COUNT = 20;

export function QuizSelectPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userData } = useUserData(user?.uid);
  const { setQuizType, setQuizCount } = useQuiz();

  const [selectedType, setSelectedType] = useState<QuizType>("fill-blank");

  const quizWords = useMemo(() => {
    return words.filter((word) => {
      const progress = userData.progress[String(word.id)];
      return progress && (progress.status === "learning" || progress.status === "mastered");
    });
  }, [userData.progress]);

  const canStart = quizWords.length >= 4;

  const handleStartQuiz = () => {
    setQuizType(selectedType);
    setQuizCount(Math.min(QUIZ_COUNT, quizWords.length));
    navigate("/quiz/play");
  };

  return (
    <div className="min-h-screen bg-white relative">
      <BackHeader title="퀴즈 모드" onBack={() => navigate("/")} />

      <div className="px-5 py-6 pt-[calc(5rem+env(safe-area-inset-top))]">
        {/* 학습한 단어 수 안내 */}
        <div className="bg-gray-50 rounded-2xl p-5 mb-6">
          <div className="text-sm text-gray-600 mb-1">학습한 단어</div>
          <div className="text-2xl font-bold text-gray-900">{quizWords.length}개</div>
          {!canStart && <p className="text-sm text-red-500 mt-2">퀴즈를 시작하려면 최소 4개 이상의 단어를 학습해야 합니다.</p>}
        </div>

        {/* 퀴즈 타입 선택 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">퀴즈 유형</h2>
          <div className="space-y-3">
            <button onClick={() => setSelectedType("fill-blank")} className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${selectedType === "fill-blank" ? "border-black bg-gray-50" : "border-gray-200 bg-white"}`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <PenLine size={24} className="text-gray-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">빈칸 채우기</div>
                  <div className="text-sm text-gray-500 mt-1">예문의 빈칸에 알맞은 단어 선택</div>
                </div>
              </div>
            </button>

            <button onClick={() => setSelectedType("multiple-choice")} className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${selectedType === "multiple-choice" ? "border-black bg-gray-50" : "border-gray-200 bg-white"}`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <ListChecks size={24} className="text-gray-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">객관식</div>
                  <div className="text-sm text-gray-500 mt-1">한글 뜻에 맞는 영어 단어 선택</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* 시작 버튼 */}
        <Button onClick={handleStartQuiz} disabled={!canStart} icon={<Play size={20} />}>
          퀴즈 시작
        </Button>
      </div>
    </div>
  );
}
