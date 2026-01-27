/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
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

// 이전에 로그인한 적 있는지 확인 (FCP 최적화)
const getInitialLoading = () => {
  if (typeof window === "undefined") return false;
  // Supabase 세션 토큰이 있으면 로딩 상태로 시작
  const hasSession = Object.keys(localStorage).some((key) => key.startsWith("sb-") && key.endsWith("-auth-token"));
  return hasSession;
};

export function AuthProvider({ children }: AuthProviderProps) {
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

    setLoading(true);

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
        // 웹: 기존 방식
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
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("로그아웃 오류:", error);
      throw error;
    }
    // 로그아웃 후 홈으로 이동 (다음 로그인 시 홈에서 시작)
    window.location.href = "/";
  };

  const deleteAccount = async () => {
    const userId = user?.id;
    if (!userId) throw new Error("로그인 상태가 아닙니다.");

    // 1. 학습 데이터 삭제
    const { error: dataError } = await supabase
      .from("user_data")
      .delete()
      .eq("user_id", userId);

    if (dataError) {
      console.error("데이터 삭제 오류:", dataError);
      throw dataError;
    }

    // 2. 계정 삭제 (Supabase DB 함수 호출)
    const { error: deleteError } = await supabase.rpc("delete_user");
    if (deleteError) {
      console.error("계정 삭제 오류:", deleteError);
      throw deleteError;
    }

    // 3. 로그아웃 후 홈으로 이동
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
