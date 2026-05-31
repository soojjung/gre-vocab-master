import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PenLine, ListChecks, Play } from "lucide-react";
import { useWords } from "@/contexts/WordsContext";
import { useUserDataContext } from "@/contexts/UserDataContext";
import { useQuiz } from "@/contexts/QuizContext";
import { BackHeader } from "@/components/BackHeader";
import { Button } from "@/components/common";
import { useT } from "@/i18n";

type QuizType = "fill-blank" | "multiple-choice";

export function QuizSelectPage() {
  const navigate = useNavigate();
  const t = useT();
  const { words } = useWords();
  const { userData } = useUserDataContext();
  const { setQuizType, setQuizCount } = useQuiz();

  const [selectedType, setSelectedType] = useState<QuizType>("fill-blank");

  const quizWords = useMemo(() => {
    return words.filter((word) => {
      const progress = userData.progress[String(word.id)];
      return progress && (progress.status === "learning" || progress.status === "mastered");
    });
  }, [words, userData.progress]);

  const canStart = quizWords.length >= 4;

  const handleStartQuiz = () => {
    setQuizType(selectedType);
    setQuizCount(quizWords.length);
    navigate("/quiz/play");
  };

  return (
    <div className="min-h-screen bg-white relative">
      <BackHeader title={t("quiz.selectTitle")} onBack={() => navigate("/")} />

      <div className="px-5 py-6 pt-[calc(4.5rem+env(safe-area-inset-top,0px))] pb-8">
        {/* 학습한 단어 수 안내 */}
        <div className="bg-gray-50 rounded-2xl p-5 mb-6">
          <div className="text-sm text-gray-600 mb-1">{t("quiz.studiedWords")}</div>
          <div className="text-2xl font-bold text-gray-900">{t("common.itemsCount", { count: quizWords.length })}</div>
          {!canStart && <p className="text-sm text-red-500 mt-2">{t("quiz.minWordsWarning")}</p>}
        </div>

        {/* 퀴즈 타입 선택 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("quiz.typeLabel")}</h2>
          <div className="space-y-3">
            <button onClick={() => setSelectedType("fill-blank")} className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${selectedType === "fill-blank" ? "border-black bg-gray-50" : "border-gray-200 bg-white"}`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <PenLine size={24} className="text-gray-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{t("quiz.fillBlank")}</div>
                  <div className="text-sm text-gray-500 mt-1">{t("quiz.fillBlankDesc")}</div>
                </div>
              </div>
            </button>

            <button onClick={() => setSelectedType("multiple-choice")} className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${selectedType === "multiple-choice" ? "border-black bg-gray-50" : "border-gray-200 bg-white"}`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <ListChecks size={24} className="text-gray-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{t("quiz.multipleChoice")}</div>
                  <div className="text-sm text-gray-500 mt-1">{t("quiz.multipleChoiceDesc")}</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* 시작 버튼 */}
        <Button onClick={handleStartQuiz} disabled={!canStart} icon={<Play size={20} />}>
          {t("quiz.start")}
        </Button>
      </div>
    </div>
  );
}
