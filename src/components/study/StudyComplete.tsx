import { Home, RotateCcw, BookOpen } from "lucide-react";
import { Button } from "@/components/common";

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
  const total = stats.correct + stats.wrong;
  const hasQuizStats = total > 0;

  return (
    <div className="min-h-dvh bg-white px-5 py-12 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">학습 완료!</h2>
        <p className="text-gray-500 mb-8">오늘도 수고했어요</p>

        {hasQuizStats && (
          <div className="bg-gray-50 rounded-2xl p-6 w-full max-w-xs">
            <div className="text-4xl font-bold text-gray-900 mb-2">{total}개</div>
            <div className="text-sm text-gray-500 mb-4">복습 퀴즈 결과</div>
            <div className="flex justify-center gap-8">
              <div>
                <div className="text-2xl font-bold text-green-500">{stats.correct}</div>
                <div className="text-xs text-gray-500">알아요</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-500">{stats.wrong}</div>
                <div className="text-xs text-gray-500">몰라요</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {stats.wrongWordIds.length > 0 && (
          <Button variant="secondary" onClick={onStartReview} icon={<RotateCcw size={20} />}>
            틀린 단어 다시 보기 ({stats.wrongWordIds.length}개)
          </Button>
        )}
        {showQuizButton && onStartQuiz && (
          <Button variant="secondary" onClick={onStartQuiz} icon={<BookOpen size={20} />}>
            복습 퀴즈 시작
          </Button>
        )}
        <Button onClick={onGoHome} icon={<Home size={20} />}>
          홈으로 돌아가기
        </Button>
      </div>
    </div>
  );
}
