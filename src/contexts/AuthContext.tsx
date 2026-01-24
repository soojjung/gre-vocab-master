/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react";
import type { User } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
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

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false); // 초기에는 false (로그인 화면 즉시 표시)
  const authInitialized = useRef(false);

  // Auth 초기화 및 상태 구독 (지연 로딩)
  const initializeAuth = async () => {
    if (authInitialized.current) return;
    authInitialized.current = true;

    const auth = await getAuthLazy();
    const { onAuthStateChanged } = await import("firebase/auth");

    onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);

      // 새 사용자인 경우 Firestore에 문서 생성
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            email: user.email,
            displayName: user.displayName,
            createdAt: new Date().toISOString(),
          });
        }
      }
    });
  };

  // 이전에 로그인한 적 있으면 백그라운드에서 auth 초기화
  useEffect(() => {
    const wasLoggedIn = localStorage.getItem("wasLoggedIn");
    if (wasLoggedIn) {
      setLoading(true);
      initializeAuth();
    }
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await initializeAuth();
      const auth = await getAuthLazy();
      const googleProvider = await getGoogleProviderLazy();
      const { signInWithPopup } = await import("firebase/auth");
      await signInWithPopup(auth, googleProvider);
      localStorage.setItem("wasLoggedIn", "true");
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
