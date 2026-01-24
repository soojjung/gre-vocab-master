import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { QuizProvider } from "@/contexts/QuizContext";
import { useUserData } from "@/hooks/useUserData";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Login } from "@/pages/Login";
import { Onboarding } from "@/pages/Onboarding";
import { HomePage } from "@/pages/HomePage";
import { StudyPage } from "@/pages/StudyPage";
import { VocabularyPage } from "@/pages/VocabularyPage";
import { MyPageWrapper } from "@/pages/MyPageWrapper";
import { QuizSelectPage } from "@/pages/QuizSelectPage";
import { QuizPlayPage } from "@/pages/QuizPlayPage";
import { QuizResultPage } from "@/pages/QuizResultPage";
import { StatsPage } from "@/pages/StatsPage";
import { LicensePage } from "@/pages/LicensePage";
import { AboutPage } from "@/pages/AboutPage";

function ProtectedRoutes() {
  const { user, loading: authLoading } = useAuth();
  const { userData, loading: dataLoading, completeOnboarding } = useUserData(user?.uid);

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (!userData.onboardingComplete) {
    return <Onboarding onComplete={completeOnboarding} />;
  }

  return (
    <>
      <ScrollToTop />
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
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QuizProvider>
          <ProtectedRoutes />
          <Toaster position="top-center" richColors />
        </QuizProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
