import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useT } from "@/i18n";
import type { TranslationKey } from "@/i18n";

// Supabase Auth 에러 코드 → 사전 키 매핑
const AUTH_ERROR_KEYS: Record<string, TranslationKey> = {
  invalid_credentials: "login.error.invalidCredentials",
  user_not_found: "login.error.userNotFound",
  email_exists: "login.error.emailExists",
  user_already_exists: "login.error.emailExists",
  weak_password: "login.error.weakPassword",
  invalid_email: "login.error.invalidEmail",
  over_request_rate_limit: "login.error.rateLimit",
};

export function Login() {
  const t = useT();
  const { signInWithGoogle, signInWithApple, signInWithKakao, signInWithEmail, signUpWithEmail, loading: authLoading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getAuthErrorMessage = (err: unknown): string => {
    const code = (err as { code?: string })?.code ?? "";
    const key = AUTH_ERROR_KEYS[code];
    return key ? t(key) : t("login.error.generic");
  };

  // AuthContext loading이 15초 이상 지속되면 자동 리셋 (무한 로딩 방지)
  useEffect(() => {
    if (!authLoading) return;
    const timer = setTimeout(() => {
      setError(t("login.error.timeout"));
      setLoading(false);
    }, 15000);
    return () => clearTimeout(timer);
  }, [authLoading, t]);

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
      setError(getAuthErrorMessage(err));
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
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithApple();
    } catch (err: unknown) {
      // 사용자가 취소한 경우(에러 코드 1001) 에러 표시하지 않음
      const errCode = (err as { code?: number })?.code;
      if (errCode === 1001) {
        // 사용자가 Apple 로그인 시트를 취소함 → 무시
      } else {
        const message = (err as { message?: string })?.message;
        setError(message || t("login.error.appleFailed"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKakaoSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithKakao();
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-dvh bg-white px-5 flex flex-col pb-12 pt-[calc(2rem+env(safe-area-inset-top,0px))]">
      {/* 헤더 */}
      <header className="text-center mb-12">
        <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl font-bold">G</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{t("common.appName")}</h1>
        <p className="text-gray-500 mt-2">{t("login.tagline")}</p>
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
        {t("login.continueWithGoogle")}
      </button>

      {/* 카카오 로그인 */}
      <button onClick={handleKakaoSignIn} disabled={loading} className="w-full bg-[#FEE500] text-[#191919] py-4 rounded-xl font-medium flex items-center justify-center gap-3 active:bg-[#F0D800] transition-colors disabled:opacity-50 mt-3">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#191919">
          <path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.725 1.8 5.117 4.508 6.476-.144.522-.926 3.361-.961 3.581 0 0-.02.166.088.229.108.063.234.03.234.03.31-.044 3.588-2.345 4.155-2.74.638.094 1.293.143 1.976.143 5.523 0 10-3.463 10-7.719C22 6.463 17.523 3 12 3" />
        </svg>
        {t("login.continueWithKakao")}
      </button>

      {/* Apple 로그인 */}
      <button onClick={handleAppleSignIn} disabled={loading} className="w-full bg-black text-white py-4 rounded-xl font-medium flex items-center justify-center gap-3 active:bg-gray-800 transition-colors disabled:opacity-50 mt-3">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
        </svg>
        {t("login.continueWithApple")}
      </button>

      {/* 구분선 */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-sm text-gray-500">{t("common.or")}</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* 이메일 로그인 폼 */}
      <form onSubmit={handleEmailAuth} className="space-y-4">
        <div>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("login.emailPlaceholder")} required className="w-full bg-gray-100 rounded-xl px-4 py-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black" />
        </div>
        <div>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("login.passwordPlaceholder")} required minLength={6} className="w-full bg-gray-100 rounded-xl px-4 py-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 rounded-xl font-medium active:bg-gray-800 transition-colors disabled:opacity-50">
          {loading ? t("login.processing") : isSignUp ? t("login.signUp") : t("login.signIn")}
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
              {t("login.alreadyHasAccount")} <span className="text-black font-medium">{t("login.signIn")}</span>
            </>
          ) : (
            <>
              {t("login.noAccountYet")} <span className="text-black font-medium">{t("login.signUp")}</span>
            </>
          )}
        </button>
      </div>
    </main>
  );
}
