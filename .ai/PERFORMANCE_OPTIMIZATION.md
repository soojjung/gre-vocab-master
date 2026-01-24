# 성능 최적화 (Performance Optimization)

2026-01-24 적용된 최적화 내용 정리.

---

## 개선 전 (Before)

### PageSpeed Insights 점수 (모바일)

| 카테고리                  | 점수    | 상태 |
| ------------------------- | ------- | ---- |
| 성능 (Performance)        | **55**  | 🟠   |
| 접근성 (Accessibility)    | **86**  | 🟠   |
| 권장사항 (Best Practices) | **100** | 🟢   |
| 검색엔진 최적화 (SEO)     | **100** | 🟢   |

### Core Web Vitals

| 지표                           | 측정값 | 기준    | 상태 |
| ------------------------------ | ------ | ------- | ---- |
| FCP (First Contentful Paint)   | 14.8초 | < 1.8초 | 🔴   |
| LCP (Largest Contentful Paint) | 16.0초 | < 2.5초 | 🔴   |
| Speed Index                    | 14.8초 | < 3.4초 | 🔴   |
| TBT (Total Blocking Time)      | 0ms    | < 200ms | 🟢   |
| CLS (Cumulative Layout Shift)  | 0.002  | < 0.1   | 🟢   |

> 테스트 조건: 느린 4G 네트워크, Moto G Power 에뮬레이션

### 주요 문제점

| 문제               | 영향                   |
| ------------------ | ---------------------- |
| 렌더링 차단 요청   | 10,580ms 지연          |
| 사용하지 않는 JS   | 271KB 낭비             |
| 캐시 수명 미설정   | 78KB 재다운로드        |
| viewport 확대 불가 | 접근성 위반            |
| 랜드마크 없음      | 스크린리더 사용 어려움 |
| 색상 대비율 부족   | 가독성 문제            |

### 번들 크기

```
dist/assets/index.js: 1,015 KB (모든 코드가 한 파일에)
```

---

## 적용된 최적화

### 1. 폰트 비동기 로딩

**파일**: `index.html`

**Before:**

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/.../pretendard.min.css" />
```

**After:**

```html
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />
<link rel="preload" href="https://cdn.jsdelivr.net/.../pretendard.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'" />
<noscript>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/.../pretendard.min.css" />
</noscript>
```

**효과:**

- 폰트 로딩이 페이지 렌더링을 차단하지 않음
- `preconnect`로 CDN 연결을 미리 설정
- JavaScript 비활성화 환경에서도 `<noscript>`로 폴백 제공

---

### 2. DNS Prefetch & Preconnect

**파일**: `index.html`

```html
<!-- DNS Prefetch -->
<link rel="dns-prefetch" href="//firebaseapp.com" />
<link rel="dns-prefetch" href="//googleapis.com" />
<link rel="dns-prefetch" href="//texttospeech.googleapis.com" />

<!-- Preconnect (중요 도메인) -->
<link rel="preconnect" href="https://firestore.googleapis.com" crossorigin />
<link rel="preconnect" href="https://identitytoolkit.googleapis.com" crossorigin />
<link rel="preconnect" href="https://gre-vocab-app-1e0e1.firebaseapp.com" crossorigin />
<link rel="preconnect" href="https://apis.google.com" crossorigin />
```

**효과:**

- `dns-prefetch`: DNS 조회를 미리 수행 (약 20-120ms 절약)
- `preconnect`: DNS + TCP + TLS 핸드셰이크를 미리 수행 (약 100-500ms 절약)
- Firebase Auth 로딩 시간 ~630ms 절약

**언제 사용:**

- `dns-prefetch`: 나중에 사용할 수도 있는 도메인
- `preconnect`: 확실히 사용할 중요한 도메인 (Firebase API 등)

---

### 3. 코드 스플리팅 (Code Splitting)

**파일**: `src/App.tsx`

**Before:**

```tsx
import { StudyPage } from "@/pages/StudyPage";
import { QuizSelectPage } from "@/pages/QuizSelectPage";
// ... 모든 페이지를 정적 import
```

**After:**

```tsx
import { lazy, Suspense } from "react";

// 필요할 때 로드
const StudyPage = lazy(() => import("@/pages/StudyPage").then((m) => ({ default: m.StudyPage })));
const QuizSelectPage = lazy(() => import("@/pages/QuizSelectPage").then((m) => ({ default: m.QuizSelectPage })));

// Suspense로 로딩 상태 처리
<Suspense fallback={<PageLoader />}>
  <Routes>
    <Route path="/study" element={<StudyPage />} />
    ...
  </Routes>
</Suspense>;
```

**효과:**

- 초기 로딩 시 필요한 코드만 다운로드
- 각 페이지는 해당 페이지 방문 시 로드됨
- 초기 번들 크기 감소

**생성된 청크:**

```
StudyPage.js:       5.6 KB
VocabularyPage.js:  4.8 KB
QuizSelectPage.js:  2.7 KB
QuizPlayPage.js:    3.9 KB
QuizResultPage.js:  2.5 KB
MyPageWrapper.js:   7.1 KB
StatsPage.js:       9.3 KB
LicensePage.js:     5.1 KB
AboutPage.js:       4.7 KB
```

---

### 4. Vendor 청크 분리

**파일**: `vite.config.ts`

```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        "vendor-react": ["react", "react-dom", "react-router-dom"],
        "vendor-firebase": ["firebase/app", "firebase/auth", "firebase/firestore"],
        "vendor-ui": ["lucide-react", "sonner"],
      },
    },
  },
},
```

**효과:**

- 라이브러리 코드와 앱 코드를 분리
- 라이브러리는 버전이 바뀌지 않는 한 브라우저 캐시 유지
- 앱 업데이트 시 재다운로드할 양 감소

**생성된 청크:**

```
vendor-react.js:    47 KB   (React, React DOM, Router)
vendor-firebase.js: 403 KB  (Firebase SDK)
vendor-ui.js:       40 KB   (Lucide, Sonner)
index.js:           509 KB  (앱 코드)
```

**캐싱 시나리오:**

```
첫 방문:     47 + 404 + 40 + 527 = 1,018 KB 다운로드
앱 업데이트: vendor는 캐시, 527 KB만 다운로드
```

---

### 5. 사용하지 않는 JavaScript 제거

**파일**: `src/lib/firebase.ts`

Firebase Analytics가 초기화만 되고 실제로 사용되지 않고 있었음 (Vercel Analytics 사용 중).

**Before:**

```typescript
import { getAnalytics, isSupported } from "firebase/analytics";

export const analytics = isSupported().then((supported) => (supported ? getAnalytics(app) : null));
```

**After:**

```typescript
// 삭제됨 - Vercel Analytics 사용
```

**효과:**

- index.js 번들 크기 ~18KB 감소
- 사용하지 않는 JS: 271KB → 190KB (-81KB)

**Firestore Lite를 사용하지 않는 이유:**

- `onSnapshot` (실시간 업데이트) 필요 → Lite에서 미지원
- `enableIndexedDbPersistence` (오프라인) 필요 → Lite에서 미지원

---

### 6. 접근성 개선

**파일**: `index.html`, `src/pages/HomePage.tsx`, `src/pages/Login.tsx`

#### viewport 접근성

**Before:**

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
```

**After:**

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

**효과:**

- 사용자가 화면 확대 가능 (시각 장애인 접근성)
- WCAG 2.1 AA 준수

#### 시맨틱 랜드마크

**Before:**

```tsx
<div className="min-h-screen">...</div>
```

**After:**

```tsx
<main className="min-h-screen">
  <header>...</header>
  <nav aria-label="주요 메뉴">...</nav>
</main>
```

**적용된 페이지:** HomePage, Login

**효과:**

- 스크린 리더 사용자가 페이지 구조 파악 가능
- SEO 개선
- 접근성 점수: 86 → 98 (+12)

#### 색상 대비율 개선

`text-gray-400` (대비율 2.45:1) → `text-gray-500` (대비율 3.68:1)

WCAG AA 기준: 4.5:1 (일반 텍스트), 3:1 (큰 텍스트)

---

### 7. 캐시 헤더 설정

**파일**: `vercel.json` (새로 생성)

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ]
}
```

**효과:**

- JS, CSS, 폰트 파일 1년 캐싱
- 재방문 시 네트워크 요청 최소화
- PageSpeed "효율적인 캐시 수명" 경고 해결

---

### 8. FCP/LCP 개선 - Auth 로딩 최적화

**파일**: `src/App.tsx`

**문제:**

- `authLoading` 동안 스피너를 표시하여 FCP가 Firebase Auth 응답까지 지연됨
- 느린 네트워크에서 13초+ 걸림

**Before:**

```tsx
if (authLoading || dataLoading) {
  return <Spinner />;  // 모든 사용자가 스피너 봄
}
if (!user) {
  return <Login />;
}
```

**After:**

```tsx
// authLoading 동안에도 user가 null이면 즉시 Login 표시
if (!user) {
  return <Login />;  // FCP 즉시 발생
}

// 로그인된 사용자만 데이터 로딩 중 스피너 표시
if (dataLoading) {
  return <Spinner />;
}
```

**효과:**

- 비로그인 사용자: 즉시 Login 페이지 렌더링 → FCP/LCP 대폭 개선
- 로그인된 사용자: 잠깐 Login 화면 flash → auth 확인 후 자동으로 홈 이동
- 대다수 첫 방문자(비로그인)의 체감 속도 크게 개선

---

## 개선 후 (After)

### 번들 크기 비교

| 구분            | Before   | After            |
| --------------- | -------- | ---------------- |
| 메인 번들       | 1,015 KB | 509 KB           |
| vendor-react    | -        | 47 KB (캐시)     |
| vendor-firebase | -        | 403 KB (캐시)    |
| vendor-ui       | -        | 40 KB (캐시)     |
| 페이지 청크     | -        | ~46 KB (필요 시) |

### 캐싱 효과

```
첫 방문:     509 + 47 + 403 + 40 = 999 KB
재방문:      캐시 히트 → 거의 0 KB
앱 업데이트: 509 KB만 다운로드 (vendor는 캐시)
```

### 측정 결과

| 카테고리   | Before | After    | 변화 |
| ---------- | ------ | -------- | ---- |
| 성능       | 55     | 55       | -    |
| 접근성     | 86     | **98**   | +12  |
| 권장사항   | 100    | 100      | -    |
| SEO        | 100    | 100      | -    |

| Core Web Vitals | Before | After  | 개선    |
| --------------- | ------ | ------ | ------- |
| FCP             | 14.8초 | 13.3초 | -1.5초  |
| LCP             | 16.0초 | 14.3초 | -1.7초  |
| Speed Index     | 14.8초 | 13.3초 | -1.5초  |

| 항목              | Before | After | 개선   |
| ----------------- | ------ | ----- | ------ |
| 사용하지 않는 JS  | 271KB  | 190KB | -81KB  |

---

## 추가 최적화 가능 항목

### 1. Firebase 모듈 트리쉐이킹

현재 Firebase SDK가 404KB로 가장 큼. 필요한 기능만 import하면 줄일 수 있음.

```typescript
// Before: 전체 import
import { getFirestore } from "firebase/firestore";

// After: 모듈별 import (트리쉐이킹 가능)
import { getFirestore } from "firebase/firestore/lite";
```

### 2. 이미지 최적화

- WebP 포맷 사용
- 반응형 이미지 (srcset)
- lazy loading

### 3. Service Worker 캐싱 전략 개선

현재 VitePWA로 기본 설정되어 있음. 더 세밀한 캐싱 전략 가능.

---

## 참고 자료

- [web.dev - Fast load times](https://web.dev/fast/)
- [Vite - Build Optimizations](https://vite.dev/guide/build.html)
- [React - Code Splitting](https://react.dev/reference/react/lazy)
- [Resource Hints - Preconnect, Prefetch](https://web.dev/preconnect-and-dns-prefetch/)

---

## 측정 도구

| 도구               | 용도                 | URL               |
| ------------------ | -------------------- | ----------------- |
| PageSpeed Insights | 성능 점수 측정       | pagespeed.web.dev |
| Lighthouse         | 상세 성능 분석       | Chrome DevTools   |
| WebPageTest        | 네트워크 워터폴 분석 | webpagetest.org   |
| Bundlephobia       | 패키지 크기 확인     | bundlephobia.com  |
