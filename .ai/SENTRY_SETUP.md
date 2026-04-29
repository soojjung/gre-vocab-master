# Sentry 에러 모니터링 설정 가이드

웹 (Vite + React 19 + react-router v7) 의 런타임 에러를 추적하기 위한 Sentry 도입 가이드. iOS (Capacitor) 통합은 현재 범위 밖이며 후속 작업으로 분리.

[공식 Sentry React SDK Skill](https://github.com/getsentry/sentry-for-ai/blob/main/skills/sentry-react-sdk/SKILL.md) 절차를 그대로 따른 결과를 기록한 문서.

---

## 왜 Sentry 인가

운영 중 발생한 이슈를 사용자 신고 없이 즉시 인지하기 위함.

- Supabase 다운/일시중지로 인한 `Failed to fetch`
- Apple/Google/Kakao 로그인 흐름 중간 실패
- React 렌더 에러, 미잡힌 Promise rejection
- 라우트별 페이지 로드/전환 추적
- 에러 발생 직전 사용자 동작 (Session Replay)

이전 사례: `2026-03-10` Supabase 자동 paused 발생 → 사용자가 앱 리뷰 댓글로 알려 `2026-04-29` 에야 인지. Sentry 가 깔려 있었다면 paused 직후 첫 fetch 실패 이벤트로 즉시 알람.

---

## 프로젝트 설정값

| 항목 | 값 |
|------|------|
| Sentry Org slug | `sooya` |
| Sentry Project slug | `gre-vocab-master` |
| DSN host | `o4511302926139392.ingest.us.sentry.io` |
| Token 종류 | Personal Token (`sntryu_...`) |
| Token 권한 | Release: Admin, Project: Read |

토큰 값은 Vercel Environment Variables 에만 보관 (로컬 / 저장소 노출 금지).

---

## 사용 패키지

| 패키지 | 역할 |
|------|------|
| `@sentry/react` | React 19 통합 (`reactErrorHandler`), 브라우저 SDK |
| `@sentry/vite-plugin` (devDep) | 빌드 시 source map 업로드. 없으면 stack trace 가 minified 라 사실상 디버깅 불가 |

iOS 네이티브 크래시 추적이 필요해지면 `@sentry/capacitor` 를 추후 도입 (별도 작업으로 분리).

---

## 파일 구조

```
src/
├── instrument.ts      # Sentry.init() 사이드카 — 모든 import 보다 먼저 로드되어야 함
├── main.tsx           # instrument 를 첫 import 로, createRoot 에 reactErrorHandler 주입
└── App.tsx            # 변경 없음
vite.config.ts         # sentryVitePlugin + 조건부 sourcemap
.env                   # VITE_SENTRY_DSN, SENTRY_ORG, SENTRY_PROJECT (AUTH_TOKEN 제외)
.env.example           # 동일 키 placeholder
```

---

## 핵심 코드

### `src/instrument.ts`

```ts
import { useEffect } from "react";
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from "react-router";
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,

  sendDefaultPii: true,

  integrations: [
    Sentry.reactRouterV7BrowserTracingIntegration({
      useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
    }),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
  tracePropagationTargets: [
    "localhost",
    /^https:\/\/.*\.supabase\.co/,
    /^https:\/\/gre-vocab-master\.vercel\.app/,
  ],

  replaysSessionSampleRate: 0,    // 일반 세션은 녹화 안 함 (한도 절약)
  replaysOnErrorSampleRate: 1.0,  // 에러 시에만 녹화
});
```

> v7 기준이라 hooks 는 `react-router` 에서 import. v6 라면 `react-router-dom` 에서 import 하고 `reactRouterV6BrowserTracingIntegration` 사용.

### `src/main.tsx`

```tsx
import "@/instrument";   // ⚠ 모든 import 보다 먼저

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { reactErrorHandler } from "@sentry/react";
// ...

createRoot(document.getElementById("root")!, {
  onUncaughtError: reactErrorHandler(),
  onCaughtError: reactErrorHandler(),
  onRecoverableError: reactErrorHandler(),
}).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

> React 19 의 `createRoot` 옵션이 React `<19` 의 `Sentry.ErrorBoundary` 를 대체. 별도 ErrorBoundary 컴포넌트로 트리를 감쌀 필요 없음.

### `vite.config.ts`

```ts
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig({
  build: {
    // 토큰이 있을 때만 sourcemap 생성 (없으면 dist 에 노출되므로 비활성화)
    sourcemap: process.env.SENTRY_AUTH_TOKEN ? "hidden" : false,
    // ... 기존 rollupOptions
  },
  plugins: [
    react(),
    // ...
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      disable: !process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: {
        filesToDeleteAfterUpload: ["./dist/**/*.map"],
      },
    }),
    // ...
  ],
});
```

핵심 가드 두 가지:
1. **`disable: !process.env.SENTRY_AUTH_TOKEN`** — 토큰 없으면 플러그인 스킵 (로컬 빌드 깨지지 않음)
2. **조건부 `sourcemap`** — 토큰 없을 땐 sourcemap 생성 자체를 안 해서 `dist/**/*.map` 노출 위험 제거
3. **`filesToDeleteAfterUpload`** — 업로드 직후 자동 삭제로 이중 방어

---

## 환경변수

### Vercel (Production / Preview / Development 모두 체크)

| Key | Value |
|------|------|
| `VITE_SENTRY_DSN` | DSN 전체 URL |
| `SENTRY_ORG` | `sooya` |
| `SENTRY_PROJECT` | `gre-vocab-master` |
| `SENTRY_AUTH_TOKEN` | `sntryu_...` (Personal Token, 절대 코드/채팅 노출 금지) |

### 로컬 `.env`

| Key | 들어가는지 | 비고 |
|------|------|------|
| `VITE_SENTRY_DSN` | ✅ | dev 모드에서도 이벤트 전송 |
| `SENTRY_ORG` | ✅ | 로컬 빌드 테스트용 (선택) |
| `SENTRY_PROJECT` | ✅ | 동일 |
| `SENTRY_AUTH_TOKEN` | ❌ | **로컬에 절대 두지 말 것**. 로컬 빌드 시에는 plugin 이 자동 disable |

---

## 토큰 발급 절차

1. [https://sooya.sentry.io/settings/account/api/auth-tokens/](https://sooya.sentry.io/settings/account/api/auth-tokens/) 접속
2. **Create New Token** 클릭
3. Name: `vercel-build` (식별용)
4. Permissions:
   - **Project**: `Read`
   - **Release**: `Admin`
   - 나머지: `No Access`
5. **Create Token** → 발급된 `sntryu_...` 토큰 즉시 복사 (한 번만 표시)
6. **Vercel Environment Variables 에만** 직접 입력. 로컬 / 저장소 / 채팅 절대 금지

토큰 노출 시 즉시 같은 페이지에서 **Revoke** 후 재발급.

---

## 검증

### 로컬 dev

```bash
npm run dev
```

Console 에서:
```js
throw new Error("sentry test " + Date.now());
```

[Sentry Issues](https://sooya.sentry.io/issues/) 에 `environment: development` 로 1-3초 안에 도착하면 OK.

### 배포 검증

배포된 사이트 접속 → Console 에서 동일 테스트 → Sentry Issues 의 stack trace 가 **원본 파일 경로** (`src/main.tsx:14` 등) 로 표시되어야 함.

minified 경로 (`assets/index-XYZ.js:1234:5678`) 로 표시되면 source map 업로드 실패 → Vercel 빌드 로그에서 `Sentry Vite Plugin` 키워드 검색해 에러 확인.

### Releases 페이지

[https://sooya.sentry.io/releases/](https://sooya.sentry.io/releases/)

배포마다 새 release 가 등록되고, 각 release 의 **Source Maps** 섹션에 `.map` 파일들이 업로드되어 있어야 함.

---

## 알람 설정

[Sentry → Alerts → Create Alert](https://sooya.sentry.io/alerts/rules/).

**최소 권장 룰: 새 이슈 즉시 알림**
- Trigger: A new issue is created
- Action: 이메일 (`sojjung3@gmail.com`)
- Filter: `environment:production` (dev/preview 노이즈 제외)

폭증 알림이 필요해지면 두 번째 룰로 추가:
- Trigger: An issue is seen more than 50 times in 1 hour

---

## 비용

Free tier 한도 (2026-04 기준):

| 항목 | 한도 | 현재 설정의 영향 |
|------|------|------|
| Errors | 5,000 / 월 | 보통 충분 |
| Performance events | 10,000 / 월 | `tracesSampleRate: 0.2` 로 5배 절약 |
| Replays | 50 / 월 | `replaysSessionSampleRate: 0` 로 에러 시에만 녹화 |

한도 초과 시 추가 이벤트는 drop 될 뿐 자동 과금 안 됨 (Pay-as-you-go 명시적 활성화 필요).

---

## 운영 팁

### 사용자 식별 (선택)

`AuthContext` 의 로그인 성공 시점에 user id 만 태깅. 이메일/이름 등 PII 는 넣지 않음.

```ts
import * as Sentry from "@sentry/react";

// 로그인 성공 후
Sentry.setUser({ id: user.id });

// 로그아웃 시
Sentry.setUser(null);
```

### 노이즈 줄이기

확장 프로그램 / 광고차단 / 알 수 없는 외부 에러는 `instrument.ts` 의 `ignoreErrors` 옵션으로 필터:

```ts
ignoreErrors: [
  "ResizeObserver loop limit exceeded",
  "Non-Error promise rejection captured",
],
```

### Source map 보안

- `dist/**/*.map` 은 **public 배포에 절대 포함 X**
- 현재 vite 설정상 두 가지 방어가 있음:
  1. 토큰 없으면 sourcemap 생성 자체 비활성
  2. 토큰 있으면 업로드 후 자동 삭제 (`filesToDeleteAfterUpload`)
- 이 가드 둘 다 우회되면 위험. 빌드 후 `find dist -name '*.map'` 결과가 0 인지 가끔 확인

---

## 후속 작업

### 1. iOS (Capacitor) 네이티브 크래시 추적

`@sentry/capacitor` 추가 시 init 함수 시그니처가 바뀜:

```ts
import * as Sentry from "@sentry/capacitor";
import * as SentryReact from "@sentry/react";

Sentry.init({ /* ... */ }, SentryReact.init);
```

iOS 측 dSYM 업로드를 위해 Xcode build phase 에 `sentry-cli upload-dsym` 추가가 별도로 필요. 현재 범위 밖.

### 2. 알람 채널 다양화

이메일 외 Slack / Discord 연동 — Sentry → Settings → Integrations.

### 3. Release 자동 commit 연동

`sentry-cli releases set-commits` 또는 vite-plugin 의 `release.setCommits.auto` 옵션으로, 어느 commit 이 어떤 에러를 도입했는지 자동 매핑 가능.

---

## 참고 문서

- [Sentry React SDK Skill](https://github.com/getsentry/sentry-for-ai/blob/main/skills/sentry-react-sdk/SKILL.md) — 본 셋업의 베이스
- [Sentry React docs](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Vite plugin docs](https://www.npmjs.com/package/@sentry/vite-plugin)
- [Sentry Capacitor docs](https://docs.sentry.io/platforms/javascript/guides/capacitor/) — iOS 통합 시 참고
