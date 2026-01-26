import { lazy, Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { QuizProvider } from "@/contexts/QuizContext";
import { Login } from "@/pages/Login";

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
