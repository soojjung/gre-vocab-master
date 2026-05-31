import { useNavigate, Navigate } from "react-router-dom";
import { RotateCcw, Home, XCircle } from "lucide-react";
import { useQuiz } from "@/contexts/QuizContext";
import { Button } from "@/components/common";
import { useT, useLanguage } from "@/i18n";
import type { TranslationKey } from "@/i18n";
import { getMeaning } from "@/lib/wordDisplay";

export function QuizResultPage() {
  const navigate = useNavigate();
  const t = useT();
  const { lang } = useLanguage();
  const { quizType, quizResults } = useQuiz();

  // 결과가 없으면 선택 페이지로 리다이렉트
  if (quizResults.length === 0) {
    return <Navigate to="/quiz" replace />;
  }

  const correctCount = quizResults.filter((r) => r.isCorrect).length;
  const totalCount = quizResults.length;
  const percentage = Math.round((correctCount / totalCount) * 100);

  const wrongResults = quizResults.filter((r) => !r.isCorrect);

  const getMessage = (): { emoji: string; key: TranslationKey } => {
    if (percentage === 100) return { emoji: "🎉", key: "quiz.result.perfect" };
    if (percentage >= 80) return { emoji: "👏", key: "quiz.result.excellent" };
    if (percentage >= 60) return { emoji: "💪", key: "quiz.result.good" };
    if (percentage >= 40) return { emoji: "📚", key: "quiz.result.tryHarder" };
    return { emoji: "🔥", key: "quiz.result.retry" };
  };

  const message = getMessage();
  const quizTypeLabel = t(quizType === "fill-blank" ? "quiz.fillBlank" : "quiz.multipleChoice");

  return (
    <div className="min-h-screen bg-white pb-8">
      {/* 결과 요약 */}
      <div className="bg-black text-white px-5 py-12 text-center pt-[calc(4.5rem+env(safe-area-inset-top,0px))]">
        <div className="text-6xl mb-4">{message.emoji}</div>
        <div className="text-2xl font-bold mb-2">{t(message.key)}</div>
        <div className="text-gray-500">{t("quiz.result.typeWithLabel", { type: quizTypeLabel })}</div>
      </div>

      {/* 점수 */}
      <div className="px-5 py-8">
        <div className="bg-gray-50 rounded-2xl p-6 text-center mb-6">
          <div className="text-5xl font-bold text-gray-900 mb-2">
            {correctCount}/{totalCount}
          </div>
          <div className="text-gray-500">{t("quiz.result.accuracy", { percent: percentage })}</div>
          <div className="mt-4 h-3 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${percentage >= 80 ? "bg-green-500" : percentage >= 60 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${percentage}%` }} />
          </div>
        </div>

        {/* 틀린 단어 목록 */}
        {wrongResults.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("quiz.result.wrongWords", { count: wrongResults.length })}</h3>
            <div className="space-y-3">
              {wrongResults.map((result) => (
                <div key={result.word.id} className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900">{result.word.word}</div>
                      <div className="text-sm text-gray-600 mt-1">{getMeaning(result.word, lang)}</div>
                    </div>
                    <XCircle size={18} className="text-red-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 버튼들 */}
        <div className="space-y-3">
          <Button onClick={() => navigate("/quiz/play")} icon={<RotateCcw size={20} />}>
            {t("quiz.result.retryBtn")}
          </Button>
          <Button variant="secondary" onClick={() => navigate("/")} icon={<Home size={20} />}>
            {t("study.complete.goHome")}
          </Button>
        </div>
      </div>
    </div>
  );
}
