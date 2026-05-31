import { lazy, Suspense, type ReactNode } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { QuizProvider } from "@/contexts/QuizContext";
import { WordsProvider } from "@/contexts/WordsContext";
import { LanguageProvider, useLanguage } from "@/i18n";
import { Login } from "@/pages/Login";
import { SupportPage } from "@/pages/SupportPage";
import { PrivacyPolicyPage } from "@/pages/PrivacyPolicyPage";
import { LanguagePicker } from "@/pages/LanguagePicker";

// 코드 스플리팅: 로그인 후에만 로드
const AuthenticatedApp = lazy(() => import("@/components/AuthenticatedApp").then((m) => ({ default: m.AuthenticatedApp })));

// 로딩 컴포넌트
function PageLoader() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
    </div>
  );
}

function ProtectedRoutes() {
  const { user, loading } = useAuth();

  // 로딩 중: 스피너 표시 (redirect 결과 확인 중)
  if (loading) {
    return <PageLoader />;
  }

  // 로그인 전: Login 페이지 표시 (Firestore 로드 안함)
  if (!user) {
    return <Login />;
  }

  // 로그인 후: AuthenticatedApp 지연 로드 (Firestore 포함)
  return (
    <Suspense fallback={<PageLoader />}>
      <AuthenticatedApp userId={user.id} />
    </Suspense>
  );
}

// 첫 진입 시 언어를 확정하지 않았으면 LanguagePicker 만 노출. 확정 후 children 마운트.
function LanguageGate({ children }: { children: ReactNode }) {
  const { confirmed } = useLanguage();
  if (!confirmed) return <LanguagePicker />;
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <LanguageGate>
          <AuthProvider>
            <WordsProvider>
              <QuizProvider>
                <Routes>
                  {/* 공개 라우트 (로그인 불필요) */}
                  <Route path="/support" element={<SupportPage />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                  {/* 나머지 모든 경로 */}
                  <Route path="*" element={<ProtectedRoutes />} />
                </Routes>
                <Toaster position="top-center" richColors />
              </QuizProvider>
            </WordsProvider>
          </AuthProvider>
        </LanguageGate>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
