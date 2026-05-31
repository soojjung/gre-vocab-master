import { Home, RotateCcw, BookOpen } from "lucide-react";
import { Button } from "@/components/common";
import { useT } from "@/i18n";

interface StudyCompleteProps {
  stats: {
    correct: number;
    wrong: number;
    wrongWordIds: number[];
  };
  onGoHome: () => void;
  onStartReview: () => void;
  onStartQuiz?: () => void;
  showQuizButton?: boolean;
}

export function StudyComplete({ stats, onGoHome, onStartReview, onStartQuiz, showQuizButton }: StudyCompleteProps) {
  const t = useT();
  const total = stats.correct + stats.wrong;
  const hasQuizStats = total > 0;

  return (
    <div className="min-h-dvh bg-white px-5 py-12 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("study.complete.title")}</h2>
        <p className="text-gray-500 mb-8">{t("study.complete.subtitle")}</p>

        {hasQuizStats && (
          <div className="bg-gray-50 rounded-2xl p-6 w-full max-w-xs">
            <div className="text-4xl font-bold text-gray-900 mb-2">{t("study.complete.totalAnswered", { count: total })}</div>
            <div className="text-sm text-gray-500 mb-4">{t("study.complete.quizResultLabel")}</div>
            <div className="flex justify-center gap-8">
              <div>
                <div className="text-2xl font-bold text-green-500">{stats.correct}</div>
                <div className="text-xs text-gray-500">{t("study.iKnow")}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-500">{stats.wrong}</div>
                <div className="text-xs text-gray-500">{t("study.iDontKnow")}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {stats.wrongWordIds.length > 0 && (
          <Button variant="secondary" onClick={onStartReview} icon={<RotateCcw size={20} />}>
            {t("study.complete.reviewWrongWithCount", { count: stats.wrongWordIds.length })}
          </Button>
        )}
        {showQuizButton && onStartQuiz && (
          <Button variant="secondary" onClick={onStartQuiz} icon={<BookOpen size={20} />}>
            {t("study.complete.startReviewQuiz")}
          </Button>
        )}
        <Button onClick={onGoHome} icon={<Home size={20} />}>
          {t("study.complete.goHome")}
        </Button>
      </div>
    </div>
  );
}
