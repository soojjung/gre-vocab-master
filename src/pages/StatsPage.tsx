import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Flame, Target, BookOpen, CheckCircle, Clock } from "lucide-react";
import { words } from "@/data/words";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/hooks/useUserData";
import { BackHeader } from "@/components/BackHeader";

export function StatsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userData, loading, getDday, getOverallProgress } = useUserData(user?.id);

  const stats = useMemo(() => {
    const progressEntries = Object.entries(userData.progress);
    const totalWords = words.length;

    // 상태별 단어 수
    const statusCounts = {
      new: totalWords - progressEntries.length,
      learning: 0,
      mastered: 0,
    };

    progressEntries.forEach(([, progress]) => {
      if (progress.status === "learning") statusCounts.learning++;
      else if (progress.status === "mastered") statusCounts.mastered++;
    });

    // 난이도별 통계
    const difficultyStats = {
      easy: { total: 0, mastered: 0 },
      medium: { total: 0, mastered: 0 },
      hard: { total: 0, mastered: 0 },
    };

    words.forEach((word) => {
      const level = word.difficulty <= 1 ? "easy" : word.difficulty === 2 ? "medium" : "hard";
      difficultyStats[level].total++;
      const progress = userData.progress[String(word.id)];
      if (progress?.status === "mastered") {
        difficultyStats[level].mastered++;
      }
    });

    return {
      totalWords,
      statusCounts,
      difficultyStats,
    };
  }, [userData.progress]);

  const overallProgress = getOverallProgress(words.length);
  const dday = getDday();

  const progressPercentage = (count: number, total: number) => {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  // 로딩 중일 때 스켈레톤 표시
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 relative">
        <BackHeader title="학습 통계" onBack={() => navigate("/")} />
        <div className="px-5 py-6 pt-[calc(5rem+env(safe-area-inset-top))] space-y-5">
          <div className="bg-gray-300 rounded-2xl h-36 animate-pulse" />
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl h-24 animate-pulse" />
            <div className="bg-white rounded-2xl h-24 animate-pulse" />
          </div>
          <div className="bg-white rounded-2xl h-48 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <BackHeader title="학습 통계" onBack={() => navigate("/")} />

      <div className="px-5 py-6 pt-[calc(5rem+env(safe-area-inset-top))] space-y-5">
        {/* 요약 카드 */}
        <div className="bg-black text-white rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-gray-500 text-sm">전체 진도율</div>
              <div className="text-3xl font-bold mt-1">{overallProgress.percentage}%</div>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-gray-700 flex items-center justify-center">
              <TrendingUp size={28} className="text-white" />
            </div>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${overallProgress.percentage}%` }} />
          </div>
          <div className="text-sm text-gray-500 mt-2">
            {overallProgress.mastered} / {overallProgress.total} 단어 완료
          </div>
        </div>

        {/* 스트릭 & D-day */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Flame size={20} className="text-orange-500" />
              </div>
              <span className="text-sm text-gray-500">연속 학습</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{userData.streak}일</div>
          </div>
          <div className="bg-white rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Target size={20} className="text-blue-500" />
              </div>
              <span className="text-sm text-gray-500">시험까지</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{dday > 0 ? `D-${dday}` : dday === 0 ? "D-Day" : `D+${Math.abs(dday)}`}</div>
          </div>
        </div>

        {/* 학습 현황 */}
        <div className="bg-white rounded-2xl p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">학습 현황</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="text-sm text-gray-600">암기 완료</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {stats.statusCounts.mastered}개 ({progressPercentage(stats.statusCounts.mastered, stats.totalWords)}%)
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${progressPercentage(stats.statusCounts.mastered, stats.totalWords)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-yellow-500" />
                  <span className="text-sm text-gray-600">학습 중</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {stats.statusCounts.learning}개 ({progressPercentage(stats.statusCounts.learning, stats.totalWords)}%)
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${progressPercentage(stats.statusCounts.learning, stats.totalWords)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600">미학습</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {stats.statusCounts.new}개 ({progressPercentage(stats.statusCounts.new, stats.totalWords)}%)
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gray-300 rounded-full" style={{ width: `${progressPercentage(stats.statusCounts.new, stats.totalWords)}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* 난이도별 암기 현황 */}
        <div className="bg-white rounded-2xl p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">난이도별 암기 현황</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">쉬움 (Lv.1)</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.difficultyStats.easy.mastered} / {stats.difficultyStats.easy.total}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full"
                  style={{
                    width: `${progressPercentage(stats.difficultyStats.easy.mastered, stats.difficultyStats.easy.total)}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">보통 (Lv.2)</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.difficultyStats.medium.mastered} / {stats.difficultyStats.medium.total}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{
                    width: `${progressPercentage(stats.difficultyStats.medium.mastered, stats.difficultyStats.medium.total)}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">어려움 (Lv.3)</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.difficultyStats.hard.mastered} / {stats.difficultyStats.hard.total}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-400 rounded-full"
                  style={{
                    width: `${progressPercentage(stats.difficultyStats.hard.mastered, stats.difficultyStats.hard.total)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
