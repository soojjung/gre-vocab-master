import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { User, BadgeQuestionMark, BookOpen, BookMarked, Flame, BarChart3 } from "lucide-react";
import { words } from "@/data/words";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/hooks/useUserData";
import { Button } from "@/components/common";

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userData, loading, getDday, getReviewCount, getOverallProgress } = useUserData(user?.id);

  const overallProgress = useMemo(() => getOverallProgress(words.length), [getOverallProgress]);
  const dday = getDday();
  const reviewCount = getReviewCount();

  // 로딩 중일 때 스켈레톤 표시
  if (loading) {
    return (
      <div className="min-h-screen bg-white px-5 py-8">
        <header className="mb-8">
          <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 w-56 bg-gray-100 rounded animate-pulse mt-2" />
        </header>
        <div className="bg-gray-200 rounded-2xl h-32 animate-pulse mb-6" />
        <div className="bg-gray-100 rounded-2xl h-24 animate-pulse mb-4" />
        <div className="bg-gray-100 rounded-2xl h-24 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 마이페이지 버튼 */}
      <button
        onClick={() => navigate("/mypage")}
        className="absolute top-4 right-4 w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200"
        aria-label="마이페이지"
      >
        <User size={20} />
      </button>

      <main className="min-h-screen bg-white px-5 py-8 pb-24">
        {/* 헤더 */}
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">단어의 신 GRE</h1>
          <p className="text-gray-500 mt-1">매일 꾸준히, 1500 단어 정복</p>
        </header>

        {/* D-day 카드 */}
        <div className="bg-black text-white rounded-2xl p-6 mb-6">
          <div className="text-sm text-gray-400 mb-1">목표 시험일까지</div>
          <div className="text-4xl font-bold">{dday > 0 ? `D-${dday}` : dday === 0 ? "D-Day" : `D+${Math.abs(dday)}`}</div>
          {userData.streak > 0 && (
            <div className="mt-3 text-sm text-gray-300 flex items-center gap-1">
              <Flame size={14} className="text-orange-400" />
              연속 {userData.streak}일째 학습 중
            </div>
          )}
        </div>

        {/* 전체 진도율 */}
        <div className="bg-gray-50 rounded-2xl p-5 mb-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600">전체 진도율</span>
            <span className="text-sm font-medium text-gray-900">
              {overallProgress.mastered} / {overallProgress.total}
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-black rounded-full transition-all duration-500" style={{ width: `${overallProgress.percentage}%` }} />
          </div>
          <div className="text-right mt-2 text-xs text-gray-500">{overallProgress.percentage}% 완료</div>
        </div>

        {/* 오늘 학습 현황 */}
        <div className="bg-gray-50 rounded-2xl p-5 mb-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600">오늘 학습</span>
            <span className="text-sm font-medium text-gray-900">
              {userData.todayLearned.length} / {userData.dailyGoal}
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min((userData.todayLearned.length / userData.dailyGoal) * 100, 100)}%`,
              }}
            />
          </div>
        </div>

        {/* 복습 대기 */}
        {reviewCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <BookOpen size={20} className="text-amber-600" />
              </div>
              <div>
                <div className="text-sm text-amber-800 font-medium">복습할 단어가 있어요</div>
                <div className="text-xs text-amber-600">{reviewCount}개 대기 중</div>
              </div>
            </div>
          </div>
        )}

        {/* 액션 버튼들 */}
        <nav className="space-y-3 mt-8" aria-label="주요 메뉴">
          <Button onClick={() => navigate("/study")} icon={<BookOpen size={20} />}>
            오늘의 학습 시작
          </Button>
          <Button variant="secondary" onClick={() => navigate("/quiz")} icon={<BadgeQuestionMark size={20} />}>
            퀴즈 모드
          </Button>
          <Button variant="secondary" onClick={() => navigate("/vocabulary")} icon={<BookMarked size={20} />}>
            단어장
          </Button>
          <Button variant="secondary" onClick={() => navigate("/stats")} icon={<BarChart3 size={20} />}>
            학습 통계
          </Button>
        </nav>
      </main>
    </div>
  );
}
