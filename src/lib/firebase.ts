import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

// Firebase 설정 - .env 파일에서 가져옴
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Auth, Firestore 내보내기
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Firestore 오프라인 persistence 활성화
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === "failed-precondition") {
    // 여러 탭이 열려있으면 오프라인 persistence 불가
    console.warn("Firestore persistence failed: Multiple tabs open");
  } else if (err.code === "unimplemented") {
    // 브라우저가 지원하지 않음
    console.warn("Firestore persistence not supported");
  }
});

export default app;
