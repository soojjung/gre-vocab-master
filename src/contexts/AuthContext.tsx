/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react";
import type { User } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { toast } from "sonner";
import { db, getAuthLazy, getGoogleProviderLazy } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
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

// PWA standalone 모드 감지 (초기 렌더링용)
const getIsStandalone = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches
    || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  // PWA standalone이거나 이전 로그인 기록이 있으면 로딩으로 시작
  const [loading, setLoading] = useState(() => {
    if (typeof window === 'undefined') return false;
    return getIsStandalone() || localStorage.getItem("wasLoggedIn") === "true";
  });
  const authInitialized = useRef(false);

  // Auth 초기화 및 상태 구독 (지연 로딩)
  const initializeAuth = async () => {
    if (authInitialized.current) return;
    authInitialized.current = true;

    const auth = await getAuthLazy();
    const { onAuthStateChanged, getRedirectResult } = await import("firebase/auth");

    // PWA redirect 결과 처리
    try {
      const result = await getRedirectResult(auth);
      if (result?.user) {
        localStorage.setItem("wasLoggedIn", "true");
      }
    } catch (error) {
      console.error("Redirect 결과 처리 오류:", error);
      toast.error("로그인에 실패했습니다. 다시 시도해주세요.");
      setLoading(false);
    }

    onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);

      // 새 사용자인 경우 Firestore에 문서 생성
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            await setDoc(userRef, {
              email: user.email,
              displayName: user.displayName,
              createdAt: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error("Firestore 사용자 문서 생성 오류:", error);
        }
      }
    });
  };

  // 이전에 로그인한 적 있거나 PWA standalone 모드면 auth 초기화
  useEffect(() => {
    const wasLoggedIn = localStorage.getItem("wasLoggedIn");
    const isStandalone = getIsStandalone();

    // PWA standalone 모드에서는 redirect 결과 확인을 위해 항상 초기화
    if (wasLoggedIn || isStandalone) {
      initializeAuth();
    }
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await initializeAuth();
      const auth = await getAuthLazy();
      const googleProvider = await getGoogleProviderLazy();

      // PWA standalone 모드 감지
      const isStandalone = getIsStandalone();

      if (isStandalone) {
        // PWA에서는 redirect 방식 사용 (popup이 차단됨)
        const { signInWithRedirect } = await import("firebase/auth");
        localStorage.setItem("wasLoggedIn", "true");
        await signInWithRedirect(auth, googleProvider);
      } else {
        // 일반 브라우저에서는 popup 방식 사용
        const { signInWithPopup } = await import("firebase/auth");
        await signInWithPopup(auth, googleProvider);
        localStorage.setItem("wasLoggedIn", "true");
      }
    } catch (error) {
      setLoading(false);
      console.error("Google 로그인 오류:", error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      await initializeAuth();
      const auth = await getAuthLazy();
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem("wasLoggedIn", "true");
    } catch (error) {
      setLoading(false);
      console.error("이메일 로그인 오류:", error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      await initializeAuth();
      const auth = await getAuthLazy();
      const { createUserWithEmailAndPassword } = await import("firebase/auth");
      await createUserWithEmailAndPassword(auth, email, password);
      localStorage.setItem("wasLoggedIn", "true");
    } catch (error) {
      setLoading(false);
      console.error("회원가입 오류:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const auth = await getAuthLazy();
      const { signOut: firebaseSignOut } = await import("firebase/auth");
      await firebaseSignOut(auth);
      localStorage.removeItem("wasLoggedIn");
    } catch (error) {
      console.error("로그아웃 오류:", error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
