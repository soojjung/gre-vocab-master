/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { SignInWithApple } from "@capacitor-community/apple-sign-in";
import { useT } from "@/i18n";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithKakao: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Apple Sign-In nonce 생성
function generateNonce(length = 32): string {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values, (v) => charset[v % charset.length]).join("");
}

// SHA-256 해시 (Apple에 전달할 nonce용)
async function sha256(plain: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// 이전에 로그인한 적 있는지 확인 (FCP 최적화)
const getInitialLoading = () => {
  if (typeof window === "undefined") return false;
  // Supabase 세션 토큰이 있으면 로딩 상태로 시작
  const hasSession = Object.keys(localStorage).some((key) => key.startsWith("sb-") && key.endsWith("-auth-token"));
  return hasSession;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const t = useT();
  const [user, setUser] = useState<User | null>(null);
  // 세션이 있을 때만 로딩 표시 (첫 방문자는 즉시 Login 표시)
  const [loading, setLoading] = useState(getInitialLoading);

  useEffect(() => {
    // 현재 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 인증 상태 변화 구독
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 네이티브 앱: Deep Link 수신 처리
    let appUrlListener: { remove: () => void } | null = null;

    if (Capacitor.isNativePlatform()) {
      App.addListener("appUrlOpen", async ({ url }) => {
        // grevocab://auth/callback#access_token=...&refresh_token=...
        if (url.includes("auth/callback")) {
          // URL에서 토큰 추출
          const hashPart = url.split("#")[1];
          if (hashPart) {
            const params = new URLSearchParams(hashPart);
            const accessToken = params.get("access_token");
            const refreshToken = params.get("refresh_token");

            if (accessToken && refreshToken) {
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
            }
          }
          // 브라우저 닫기
          await Browser.close();
        }
      }).then((listener) => {
        appUrlListener = listener;
      });
    }

    return () => {
      subscription.unsubscribe();
      appUrlListener?.remove();
    };
  }, []);

  const signInWithGoogle = async () => {
    const isNative = Capacitor.isNativePlatform();
    const redirectTo = isNative ? "grevocab://auth/callback" : window.location.origin;

    try {
      if (isNative) {
        // 네이티브 앱: OAuth URL 생성 후 외부 브라우저로 열기
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo,
            skipBrowserRedirect: true,
          },
        });

        if (error) {
          console.error("[Auth] OAuth error:", error);
          throw error;
        }

        if (data?.url) {
          try {
            await Browser.open({ url: data.url, presentationStyle: "fullscreen" });
          } catch {
            window.open(data.url, "_blank");
          }
        }
      } else {
        // 웹: 리디렉트 플로우이므로 loading 표시
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo,
          },
        });

        if (error) throw error;
      }
    } catch (error) {
      setLoading(false);
      console.error("[Auth] Google 로그인 오류:", error);
      throw error;
    }
  };

  const signInWithKakao = async () => {
    const isNative = Capacitor.isNativePlatform();
    const redirectTo = isNative ? "grevocab://auth/callback" : window.location.origin;

    try {
      if (isNative) {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "kakao",
          options: {
            redirectTo,
            skipBrowserRedirect: true,
          },
        });

        if (error) throw error;

        if (data?.url) {
          try {
            await Browser.open({ url: data.url, presentationStyle: "fullscreen" });
          } catch {
            window.open(data.url, "_blank");
          }
        }
      } else {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "kakao",
          options: { redirectTo },
        });

        if (error) throw error;
      }
    } catch (error) {
      setLoading(false);
      console.error("[Auth] Kakao 로그인 오류:", error);
      throw error;
    }
  };

  const signInWithApple = async () => {
    const isNative = Capacitor.isNativePlatform();

    try {
      if (isNative) {
        // iOS 네이티브: ASAuthorizationController
        const rawNonce = generateNonce();
        const hashedNonce = await sha256(rawNonce);
        const result = await SignInWithApple.authorize({
          clientId: "com.sooya.grevocab",
          redirectURI: "https://tmxnpuleiluskpifchsb.supabase.co/auth/v1/callback",
          scopes: "email name",
          nonce: hashedNonce,
        });

        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: "apple",
          token: result.response.identityToken,
          nonce: rawNonce,
        });

        if (error) {
          console.error("[Auth] Apple 토큰 교환 오류:", error.message, error);
          throw error;
        }

        if (!data.user) {
          console.error("[Auth] Apple 로그인: signInWithIdToken 성공했지만 user가 null");
          // i18n: Login 의 catch 에서 err.message 를 그대로 표시하므로 t() 로 현재 언어 메시지 던짐
          throw new Error(t("login.error.appleFailed"));
        }

        // signInWithIdToken은 세션과 유저 정보를 직접 반환함
        // onAuthStateChange 콜백에 의존하지 않고 즉시 상태 업데이트
        setUser(data.user);
        setLoading(false);
      } else {
        // 웹: 리디렉트 플로우이므로 loading 표시
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "apple",
          options: {
            redirectTo: window.location.origin,
          },
        });

        if (error) throw error;
      }
    } catch (error) {
      setLoading(false);
      console.error("[Auth] Apple 로그인 오류:", error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("이메일 로그인 오류:", error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error("회원가입 오류:", error);
      throw error;
    }
  };

  const signOut = async () => {
    // 먼저 user 상태 초기화 → ProtectedRoutes가 즉시 Login 렌더링
    setUser(null);
    setLoading(false);
    const { error } = await supabase.auth.signOut();
    // AuthSessionMissingError는 이미 로그아웃된 상태이므로 무시
    if (error && error.name !== "AuthSessionMissingError") {
      console.error("로그아웃 오류:", error);
    }
  };

  const deleteAccount = async () => {
    const userId = user?.id;
    // ContactPage 의 catch 가 err.message 를 읽지 않으므로 내부 sentinel 만 던짐
    if (!userId) throw new Error("not_signed_in");

    // 1. 단어장 데이터 삭제 (custom_words → word_lists 순서)
    const { error: wordsError } = await supabase.from("custom_words").delete().eq("user_id", userId);
    if (wordsError) {
      console.error("단어 삭제 오류:", wordsError);
      throw wordsError;
    }

    const { error: listsError } = await supabase.from("word_lists").delete().eq("user_id", userId);
    if (listsError) {
      console.error("단어장 삭제 오류:", listsError);
      throw listsError;
    }

    // 2. 학습 데이터 삭제
    const { error: dataError } = await supabase.from("user_data").delete().eq("user_id", userId);
    if (dataError) {
      console.error("데이터 삭제 오류:", dataError);
      throw dataError;
    }

    // 3. 계정 삭제 (Supabase DB 함수 호출)
    const { error: deleteError } = await supabase.rpc("delete_user");
    if (deleteError) {
      console.error("계정 삭제 오류:", deleteError);
      throw deleteError;
    }

    // 3. 로그아웃
    setUser(null);
    setLoading(false);
    await supabase.auth.signOut();
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithApple,
    signInWithKakao,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
