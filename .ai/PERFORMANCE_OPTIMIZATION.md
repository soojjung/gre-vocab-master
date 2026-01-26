# 성능 최적화 (Performance Optimization)

2026-01-24 적용, 2026-01-26 Supabase 마이그레이션 반영.

---

## 적용된 최적화 요약

| 최적화                     | 효과                        | 영향 지표        |
| -------------------------- | --------------------------- | ---------------- |
| HTML 사전 렌더링           | FCP 즉시 표시               | FCP              |
| CSS 비동기 로딩            | 렌더 블로킹 제거            | FCP, LCP         |
| Auth 로딩 최적화           | 첫 방문자 즉시 Login 표시   | FCP              |
| 코드 스플리팅              | 페이지별 청크 분리          | TBT              |
| Vendor 청크 분리           | 라이브러리 캐시 최적화      | Speed Index      |
| DNS Prefetch/Preconnect    | 연결 시간 ~500ms 절약       | FCP, LCP         |
| 폰트 비동기 로딩           | 렌더 블로킹 제거            | FCP              |
| 캐시 헤더 설정             | 재방문 시 즉시 로드         | Speed Index      |

---

## 핵심 최적화 (High Impact)

### 1. HTML 사전 렌더링 - FCP 즉시 표시

**문제:** React 앱은 JS가 로드되고 실행된 후에야 화면에 콘텐츠가 표시됨. 느린 네트워크에서 사용자는 빈 화면을 오래 보게 됨.

**해결:** 최소한의 콘텐츠(로고 + 제목)를 HTML에 인라인 스타일로 직접 작성. JS 로드 전에 브라우저가 즉시 렌더링:

```html
<!-- index.html -->
<div id="root">
  <!-- 최소한의 사전 렌더링 -->
  <div style="min-height:100vh;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center">
    <div style="width:64px;height:64px;background:#000;border-radius:16px;...">
      <span style="color:#fff;font-size:24px;font-weight:700">G</span>
    </div>
    <h1>단어의 신 GRE</h1>
    <p>1500 단어 정복의 시작</p>
  </div>
</div>
```

**주의:** 사전 렌더링 콘텐츠를 너무 복잡하게 만들면 오히려 FCP가 지연됨. 최소한의 요소만 포함.

React hydration 시 자동 교체됨.

---

### 2. CSS 비동기 로딩 - 렌더 블로킹 제거

**문제:** Vite가 빌드한 CSS 파일이 `<link rel="stylesheet">`로 head에 주입되어 렌더링을 차단. 사전 렌더링된 HTML이 있어도 CSS 로드 완료까지 FCP 지연.

**해결:** Vite 플러그인으로 CSS를 비동기 로딩:

```typescript
// vite.config.ts
function asyncCssPlugin(): Plugin {
  return {
    name: "async-css",
    enforce: "post",
    transformIndexHtml(html) {
      return html.replace(
        /<link rel="stylesheet"([^>]*) href="([^"]+)"([^>]*)>/g,
        '<link rel="stylesheet"$1 href="$2"$3 media="print" onload="this.media=\'all\'">'
      );
    },
  };
}
```

**결과:** CSS가 렌더링을 차단하지 않아 사전 렌더링된 HTML이 즉시 FCP로 측정됨.

---

### 3. Auth 로딩 최적화 - FCP 즉시 발생

**문제:** Auth 응답을 기다리는 동안 스피너를 표시하면 느린 네트워크에서 FCP 지연.

**해결:** localStorage에 Supabase 세션 토큰이 없으면 로딩 스킵하고 즉시 Login 표시:

```typescript
// AuthContext.tsx
const getInitialLoading = () => {
  if (typeof window === "undefined") return false;
  // Supabase 세션 토큰이 있을 때만 로딩 상태로 시작
  const hasSession = Object.keys(localStorage).some(
    (key) => key.startsWith("sb-") && key.endsWith("-auth-token")
  );
  return hasSession;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  // 세션이 있을 때만 로딩 표시 (첫 방문자는 즉시 Login 표시)
  const [loading, setLoading] = useState(getInitialLoading);
  // ...
}
```

**결과:**
- 첫 방문자: 즉시 Login 화면 표시 (FCP 최소화)
- 재방문자 (로그인됨): 잠깐 로딩 후 홈으로 이동

---

## 기타 최적화

### 코드 스플리팅

React의 `lazy`와 `Suspense`를 사용해 각 페이지를 별도 청크로 분리. 사용자가 해당 페이지에 방문할 때만 코드를 다운로드:

```tsx
const StudyPage = lazy(() => import("@/pages/StudyPage"));
```

### Vendor 청크 분리

라이브러리(React, Supabase)와 앱 코드를 분리. 라이브러리는 버전이 바뀌지 않는 한 브라우저 캐시를 유지하므로, 앱 업데이트 시 앱 코드만 다시 다운로드:

```typescript
// vite.config.ts
manualChunks: {
  "vendor-react": ["react", "react-dom", "react-router-dom"],
  "vendor-supabase": ["@supabase/supabase-js"],
  "vendor-ui": ["lucide-react", "sonner"],
}
```

### DNS Prefetch & Preconnect

브라우저가 Supabase API 서버에 미리 연결을 설정. 실제 요청 시 DNS 조회 + TCP/TLS 핸드셰이크 시간(~500ms) 절약:

```html
<!-- index.html -->
<link rel="dns-prefetch" href="//supabase.co" />
<link rel="dns-prefetch" href="//googleapis.com" />
<link rel="preconnect" href="https://tmxnpuleiluskpifchsb.supabase.co" crossorigin />
<link rel="preconnect" href="https://apis.google.com" crossorigin />
```

### 폰트 비동기 로딩

폰트 CSS를 `preload`로 미리 다운로드하되, 렌더링을 차단하지 않음. 폰트가 늦게 로드되어도 시스템 폰트로 먼저 텍스트 표시:

```html
<link
  rel="preload"
  href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
  as="style"
  onload="this.onload=null;this.rel='stylesheet'"
/>
<noscript>
  <link rel="stylesheet" href="..." />
</noscript>
```

### 캐시 헤더 (vercel.json)

JS, CSS 등 정적 파일에 1년 캐시 설정. Vite가 파일 내용 변경 시 해시를 바꾸므로 캐시 무효화 걱정 없음:

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

---

## 번들 구조

Supabase 마이그레이션 후 번들 구성:

| 청크             | 크기 (gzip) | 로드 시점      |
| ---------------- | ----------- | -------------- |
| index            | ~61 KB      | 초기 로드      |
| vendor-react     | ~47 KB      | 초기 로드      |
| vendor-supabase  | ~45 KB      | 초기 로드      |
| vendor-ui        | ~15 KB      | 초기 로드      |
| 페이지 청크들    | 각 5-20 KB  | 해당 페이지 방문 시 |

**참고:** Supabase SDK (~170KB)는 Firebase SDK (~250KB) 대비 약 30% 작음.

---

## 측정 도구

| 도구               | 용도           | URL               |
| ------------------ | -------------- | ----------------- |
| PageSpeed Insights | 성능 점수 측정 | pagespeed.web.dev |
| Lighthouse         | 상세 성능 분석 | Chrome DevTools   |
| Bundlephobia       | 패키지 크기    | bundlephobia.com  |

---

## 추가 최적화 고려사항

### Supabase 지연 로딩 (미적용)

Firebase처럼 Supabase도 지연 로딩 가능하지만, 이미 별도 청크로 분리되어 캐싱되므로 효과 대비 복잡도 증가. 현재는 미적용.

### TanStack Query 도입 (예정)

데이터 페칭 최적화 및 오프라인 캐시를 위해 TanStack Query 도입 예정. `persistQueryClient`로 IndexedDB 캐시 지원.
