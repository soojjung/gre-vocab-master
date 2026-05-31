import { useNavigate } from "react-router-dom";
import { User, BadgeQuestionMark, BookOpen, BookMarked, Flame, BarChart3 } from "lucide-react";
import { useUserDataContext } from "@/contexts/UserDataContext";
import { formatDday } from "@/lib/date";
import { Button } from "@/components/common";
import { useT } from "@/i18n";

export function HomePage() {
  const navigate = useNavigate();
  const t = useT();
  const { userData, loading, getDday, getReviewCount } = useUserDataContext();

  const dday = getDday();
  const reviewCount = getReviewCount();

  // 로딩 중일 때 스켈레톤 표시
  if (loading) {
    return (
      <div className="min-h-screen bg-white px-5 pb-8 pt-[calc(2rem+env(safe-area-inset-top,0px))]">
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
      <button onClick={() => navigate("/mypage")} className="absolute right-4 top-[calc(1rem+env(safe-area-inset-top,0px))] w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200" aria-label={t("home.myPageAria")}>
        <User size={20} />
      </button>

      <main className="min-h-screen bg-white px-5 pb-24 pt-[calc(1rem+env(safe-area-inset-top,0px))]">
        {/* 헤더 */}
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{t("common.appName")}</h1>
          <p className="text-gray-500 mt-1">{t("home.subtitle")}</p>
        </header>

        {/* D-day 카드 */}
        <div className="bg-black text-white rounded-2xl p-6 mb-6">
          <div className="text-sm text-gray-400 mb-1">{t("home.untilTargetDate")}</div>
          <div className="text-4xl font-bold">{formatDday(dday)}</div>
          {dday < 0 && <div className="mt-2 text-sm text-gray-300">{t("home.testDatePassed")}</div>}
          {userData.streak > 0 && (
            <div className="mt-3 text-sm text-gray-300 flex items-center gap-1">
              <Flame size={14} className="text-orange-400" />
              {t("home.streak", { count: userData.streak })}
            </div>
          )}
        </div>

        {/* 오늘 학습 현황 */}
        <div className="bg-gray-50 rounded-2xl p-5 mb-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600">{t("home.todayStudy")}</span>
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

        {/* SR 복습 */}
        <div className={`rounded-2xl p-5 mb-6 ${reviewCount > 0 ? "bg-amber-50 border border-amber-200" : "bg-gray-50"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${reviewCount > 0 ? "bg-amber-100" : "bg-gray-200"}`}>
                <BookOpen size={20} className={reviewCount > 0 ? "text-amber-600" : "text-gray-400"} />
              </div>
              <div>
                <div className={`text-sm font-medium ${reviewCount > 0 ? "text-amber-800" : "text-gray-600"}`}>{reviewCount > 0 ? t("home.reviewAvailable") : t("home.srReview")}</div>
                <div className={`text-xs ${reviewCount > 0 ? "text-amber-600" : "text-gray-400"}`}>{reviewCount > 0 ? t("home.reviewWaiting", { count: reviewCount }) : t("home.noReviewWaiting")}</div>
              </div>
            </div>
            <button onClick={() => navigate("/study?mode=review")} disabled={reviewCount === 0} className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${reviewCount > 0 ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
              {t("home.reviewBtn")}
            </button>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <nav className="space-y-3 mt-8" aria-label={t("home.menuAria")}>
          <Button onClick={() => navigate("/study")} icon={<BookOpen size={20} />}>
            {t("home.todayStudyBtn")}
          </Button>
          <Button variant="secondary" onClick={() => navigate("/quiz")} icon={<BadgeQuestionMark size={20} />}>
            {t("home.quizMode")}
          </Button>
          <Button variant="secondary" onClick={() => navigate("/vocabulary")} icon={<BookMarked size={20} />}>
            {t("home.vocabulary")}
          </Button>
          <Button variant="secondary" onClick={() => navigate("/stats")} icon={<BarChart3 size={20} />}>
            {t("home.stats")}
          </Button>
        </nav>
      </main>
    </div>
  );
}
