import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { UserDataProvider, useUserDataContext } from "@/contexts/UserDataContext";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Onboarding } from "@/pages/Onboarding";
import { HomePage } from "@/pages/HomePage";

// 코드 스플리팅: 필요할 때 로드
const StudyPage = lazy(() => import("@/pages/StudyPage").then((m) => ({ default: m.StudyPage })));
const VocabularyPage = lazy(() => import("@/pages/VocabularyPage").then((m) => ({ default: m.VocabularyPage })));
const MyPageWrapper = lazy(() => import("@/pages/MyPageWrapper").then((m) => ({ default: m.MyPageWrapper })));
const QuizSelectPage = lazy(() => import("@/pages/QuizSelectPage").then((m) => ({ default: m.QuizSelectPage })));
const QuizPlayPage = lazy(() => import("@/pages/QuizPlayPage").then((m) => ({ default: m.QuizPlayPage })));
const QuizResultPage = lazy(() => import("@/pages/QuizResultPage").then((m) => ({ default: m.QuizResultPage })));
const StatsPage = lazy(() => import("@/pages/StatsPage").then((m) => ({ default: m.StatsPage })));
const LicensePage = lazy(() => import("@/pages/LicensePage").then((m) => ({ default: m.LicensePage })));
const AboutPage = lazy(() => import("@/pages/AboutPage").then((m) => ({ default: m.AboutPage })));

function PageLoader() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-gray-200 border-t-black rounded-full animate-spin" />
    </div>
  );
}

interface AuthenticatedAppProps {
  userId: string;
}

function AuthenticatedAppContent() {
  const { userData, loading: dataLoading, completeOnboarding } = useUserDataContext();

  // 데이터 로딩 중
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!userData.onboardingComplete) {
    return <Onboarding onComplete={completeOnboarding} />;
  }

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/study" element={<StudyPage />} />
          <Route path="/vocabulary" element={<VocabularyPage />} />
          <Route path="/mypage" element={<MyPageWrapper />} />
          <Route path="/mypage/license" element={<LicensePage />} />
          <Route path="/mypage/about" element={<AboutPage />} />
          <Route path="/quiz" element={<QuizSelectPage />} />
          <Route path="/quiz/play" element={<QuizPlayPage />} />
          <Route path="/quiz/result" element={<QuizResultPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

export function AuthenticatedApp({ userId }: AuthenticatedAppProps) {
  return (
    <UserDataProvider userId={userId}>
      <AuthenticatedAppContent />
    </UserDataProvider>
  );
}
