import { createClient, navigatorLock, type LockFunc } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// auth-js 의 navigatorLock 은 acquireTimeout(기본 10초) 이 지나면 AbortController 로
// navigator.locks.request 를 취소하는데, 이때 브라우저가 던지는
// DOMException(AbortError, "signal is aborted without reason") 을 그대로 흘려보낸다.
// - GoTrueClient 의 visibilitychange 핸들러는 이 호출을 await 하지 않으므로
//   에러가 unhandledrejection 으로 새어나간다 (Sentry GRE-VOCAB-MASTER-8, /study).
// - getSession() 경로에서 터지면 세션 확인이 실패해 로딩이 풀리지 않는다.
// 락을 쥔 쪽이 10초 안에 못 끝내는 상황(다른 탭, 절전 복귀로 멈춘 토큰 갱신 요청 등)은
// 일시적이므로, supabase 가 LockManager 스펙 미준수 브라우저에서 하는 것과 동일하게
// 락 없이 실행해 진행시킨다.
const resilientNavigatorLock: LockFunc = async (name, acquireTimeout, fn) => {
  // navigator.locks 가 없는 환경(구형 WebView 등)에서는 GoTrueClient 의 lockNoOp 과 동일하게 동작
  if (!globalThis.navigator?.locks) return await fn();

  try {
    return await navigatorLock(name, acquireTimeout, fn);
  } catch (err) {
    const isAbort = (err as { name?: string } | null)?.name === "AbortError";
    if (acquireTimeout > 0 && isAbort) {
      console.warn(`[supabase] auth 락 획득 ${acquireTimeout}ms 타임아웃 — 락 없이 진행: ${name}`);
      return await fn();
    }
    throw err;
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // 로컬 스토리지에 세션 저장 (PWA 오프라인 지원)
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    lock: resilientNavigatorLock,
  },
});
