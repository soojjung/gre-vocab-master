import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export function Login() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "오류가 발생했습니다";
      if (errorMessage.includes("user-not-found")) {
        setError("존재하지 않는 계정입니다");
      } else if (errorMessage.includes("wrong-password")) {
        setError("비밀번호가 틀렸습니다");
      } else if (errorMessage.includes("email-already-in-use")) {
        setError("이미 사용 중인 이메일입니다");
      } else if (errorMessage.includes("weak-password")) {
        setError("비밀번호는 6자 이상이어야 합니다");
      } else if (errorMessage.includes("invalid-email")) {
        setError("유효하지 않은 이메일입니다");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Google 로그인에 실패했습니다";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white px-5 py-12 flex flex-col">
      {/* 헤더 */}
      <header className="text-center mb-12">
        <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl font-bold">G</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">단어의 신 GRE</h1>
        <p className="text-gray-500 mt-2">1500 단어 정복의 시작</p>
      </header>

      {/* 에러 메시지 */}
      {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>}

      {/* Google 로그인 */}
      <button onClick={handleGoogleSignIn} disabled={loading} className="w-full bg-white border border-gray-200 text-gray-700 py-4 rounded-xl font-medium flex items-center justify-center gap-3 hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50">
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Google로 계속하기
      </button>

      {/* 구분선 */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-sm text-gray-500">또는</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* 이메일 로그인 폼 */}
      <form onSubmit={handleEmailAuth} className="space-y-4">
        <div>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="이메일" required className="w-full bg-gray-100 rounded-xl px-4 py-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black" />
        </div>
        <div>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호" required minLength={6} className="w-full bg-gray-100 rounded-xl px-4 py-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 rounded-xl font-medium active:bg-gray-800 transition-colors disabled:opacity-50">
          {loading ? "처리 중..." : isSignUp ? "회원가입" : "로그인"}
        </button>
      </form>

      {/* 회원가입/로그인 전환 */}
      <div className="text-center mt-6">
        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError("");
          }}
          className="text-gray-500 text-sm"
        >
          {isSignUp ? (
            <>
              이미 계정이 있으신가요? <span className="text-black font-medium">로그인</span>
            </>
          ) : (
            <>
              계정이 없으신가요? <span className="text-black font-medium">회원가입</span>
            </>
          )}
        </button>
      </div>
    </main>
  );
}
