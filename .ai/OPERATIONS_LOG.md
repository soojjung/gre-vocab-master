# 운영 오류 로그

운영 환경에서 발생한 이슈와 해결 기록. 신규 이슈는 상단에 추가.

각 항목 구성: 발생일 / 발견 경로 / 증상 / 원인 / 해결 / 후속 조치 / 교훈.

---

## 2026-05-07 — 빈칸 채우기 퀴즈에서 정답 단어가 변형 형태로 등장 시 빈칸이 만들어지지 않음

| 항목 | 내용 |
|---|---|
| **발견 경로** | 사용자 이메일 제보 (iPhone 15, iOS 26.4.2). 스크린샷 첨부 — 12/50 문제 "The graphic images **harrowed** the viewers." 가 빈칸 처리 없이 노출됐고 보기 D번이 `harrow` 였음 |
| **영향** | iOS 1.0 ~ 1.3 전 버전. 빈칸 채우기 퀴즈에서 정답 단어가 예문에 인플렉션 형태(과거형 -ed, 진행형 -ing, 복수 -s, y→ied 등)로 등장하면 빈칸이 생성되지 않고 정답이 그대로 노출 → 객관식 정답이 사실상 자동 공개되는 형태로 학습 효과 무력화. 전체 1,560개 quiz 단어 중 **319건(20.5%)** 이 영향 범위 |
| **원인** | `src/pages/QuizPlayPage.tsx` 의 `getBlankSentence` 가 `new RegExp('\\b${word}\\b', 'gi')` — 정확한 단어 경계만 매칭. 정답 `harrow` 에 대한 정규식 `\bharrow\b` 는 `harrowed` 뒤의 `ed` 가 단어 일부라서 매칭 실패. 영어 인플렉션 가능성을 고려하지 않은 설계 |
| **해결** | 헬퍼를 `src/lib/blankSentence.ts` 로 분리하고 인플렉션 4종 지원 정규식으로 교체:<br>- 기본 접미사: `s, es, ed, ing, d, er, est, ly, ier, iest, ation, al, ally, ically`<br>- y → i 변형: `fortify → fortified/fortifies`<br>- e 탈락: `gouge → gouging`<br>- 자음 중첩: `aver → averred`, `log → logged`<br>1,560건 전수 시뮬레이션 결과 **1,558건 매칭(99.9%)**. 남은 2건은 약어(`e.g.`)와 불규칙 과거형(`rend→rent`) — 무시 |
| **후속 조치** | - 1.4 빌드 App Store Connect 제출 완료 (2026-05-07, 심사 대기 중)<br>- 제보자(`dainlinda@gmail.com`)에게 원인/수정/배포 일정 안내 회신 발송 (2026-05-07)<br>- Sentry 통합 완료 상태라 동일 패턴 재발 시 알람 가능 (단, 이 버그는 예외 발생이 아니라 "빈칸이 안 생김" 형태라 Sentry 가 잡지 못함 — 사용자 제보에 의존)<br>- 단위 테스트 환경(vitest) 미도입 — 데이터 추가 시 동일 회귀 가능. 도입 검토 필요<br>- 데이터 추가 시 인플렉션 매칭 검증 스크립트를 CI 또는 로컬 hook 으로 자동화 검토 |
| **교훈** | - **자연어 데이터에서 exact match 가정은 위험**. 영어는 형태소 변형이 흔하므로 단어→예문 매칭 시 인플렉션 가능성 항상 고려<br>- 충분한 데이터셋(1,560건)이 있으면 패치 전 **시뮬레이션으로 영향 범위 정량화 가능** — 이번엔 패치 적용 전 80% 매칭률을 확인했고, 패치 후 99.9% 로 개선 검증<br>- "예외가 안 나는 silent bug" 는 Sentry 같은 에러 모니터링으로 잡히지 않음. 사용자 제보 채널(이메일/리뷰)이 유일한 인지 경로라는 점 인식 |

관련 커밋:
- `e554b6c` (빈칸 인플렉션 헬퍼 + 적용)
- `2532ff0` (수출 규정 자동 선언)
- `36a6d05` (1.4 버전 bump)

---

## 2026-04-30 — iOS 앱에서 "개인정보처리방침" 페이지 이동 안 됨

| 항목 | 내용 |
|---|---|
| **발견 경로** | 사용자 (본인) 테스트 중 발견 |
| **영향** | iOS 앱에서 마이페이지 → 개인정보처리방침 버튼 무반응. 웹은 정상 (새 탭으로 열림) |
| **원인** | `MyPageWrapper.tsx` 의 `window.open("/privacy-policy.html", "_blank")`. Capacitor iOS WKWebView 는 보안 정책상 `_blank` 타깃의 윈도우 생성을 차단/무시함. 웹 브라우저에서만 정상 동작하던 코드 |
| **해결** | `public/privacy-policy.html` 정적 페이지를 React 컴포넌트(`PrivacyPolicyPage.tsx`)로 이식하고 `/privacy-policy` SPA 라우트로 추가. 버튼은 `navigate("/privacy-policy")` 로 전환. 정적 `.html` 파일은 외부 링크 (App Store Connect 등록 URL 등) 호환성을 위해 그대로 보존 |
| **후속 조치** | - 코드베이스 내 `window.open` 추가 사용처 grep — privacy-policy 외에는 없음 확인됨<br>- 향후 in-app 링크는 SPA 라우트, 진짜 외부 URL 은 `@capacitor/browser` 의 `Browser.open` 사용 원칙 |
| **교훈** | Capacitor 앱은 단일 WKWebView 내에서 동작. **`window.open` 은 웹 전용 패턴**으로 간주하고, in-app 이동은 `react-router` 의 `navigate()` 로 통일. 외부 URL 은 Capacitor Browser 플러그인 사용 |

관련 커밋: `9df8b66` (privacy policy React 라우트 전환)

---

## 2026-04-29 — Supabase 프로젝트 자동 일시중지 (Free tier auto-pause)

| 항목 | 내용 |
|---|---|
| **발견 경로** | 사용자가 App Store **앱 리뷰 댓글**로 "로그인이 안 된다"고 알려줘서 인지 |
| **time-to-detection** | 약 50일 (paused 시점 2026-03-10 → 인지 2026-04-29) |
| **증상** | 클라이언트 콘솔에 `vendor-supabase-rHgJDrTE.js` 발 `TypeError: Failed to fetch`. 모든 Supabase 호출 실패 → 로그인/데이터 조회 전부 차단 |
| **원인** | Supabase Free tier 정책: **약 7일간 무활동 시 프로젝트 자동 paused**. 컴퓨트 인스턴스가 내려가서 모든 fetch 가 네트워크 레벨에서 실패. 데이터/스키마는 보존 |
| **해결** | Supabase 대시보드에서 **"Resume project"** 클릭. 약 1-2분 후 정상 복구. 코드 변경 불필요 |
| **후속 조치** | - **Sentry 웹 통합** 도입 (`1b71a14`): 다음 번 fetch 실패는 사용자 신고 없이 즉시 알람<br>- Sentry "새 이슈 발생 시 이메일" 알람 룰 생성<br>- 본 운영 로그 문서 (`OPERATIONS_LOG.md`) 신설<br>- paused 재발 방지 옵션 검토 (미적용): Pro 업그레이드 ($25/월) / 외부 cron 으로 주기적 핑 / 현 상태 유지 |
| **교훈** | - Free tier 는 출시 직후 트래픽 부족 구간에서 paused 위험 존재<br>- 사용자 리뷰에 의존한 장애 인지는 너무 느림 — 모니터링 도구 필수 (이번 인지 지연 50일이 그 증거)<br>- 새 외부 의존성 추가 시 "이 서비스가 다운/중지되면 어떻게 알아챌 것인가" 를 함께 설계 |

관련 커밋: `1b71a14` (Sentry 웹 통합)

---

## 운영 점검 체크리스트 (장기적으로 유지)

이 로그를 분석해 도출된 항목. 분기별 또는 출시 전 점검:

- [ ] Supabase 프로젝트 상태 확인 ([dashboard](https://supabase.com/dashboard))
- [ ] [Sentry Issues](https://sooya.sentry.io/issues/) 미해결 이슈 검토
- [ ] [Sentry Alerts 룰](https://sooya.sentry.io/alerts/rules/) 정상 동작 (이메일 도착 테스트)
- [ ] App Store 앱 리뷰 댓글 확인 (운영 이슈 보고 채널)
- [ ] iOS Capacitor 앱: `window.open` / `_blank` 패턴 사용처 점검 (in-app 흐름은 SPA 라우팅으로)
- [ ] 새 단어 데이터 추가 시 빈칸 인플렉션 매칭 검증 (`src/lib/blankSentence.ts` 로 전수 시뮬레이션)
- [ ] silent bug (예외 미발생, Sentry 감지 불가) 채널 점검: 사용자 제보 이메일 / App Store 리뷰 댓글 정기 확인

---

## 작성 가이드

신규 이슈 추가 시:

1. 최상단에 `## YYYY-MM-DD — 한 줄 요약` 헤더로 시작
2. 표 형식으로 발견 경로 / 영향 / 원인 / 해결 / 후속 조치 / 교훈 6개 항목 채우기
3. 관련 커밋 SHA 가 있으면 항목 아래에 명시
4. 일반화된 교훈은 하단 "운영 점검 체크리스트" 에도 반영 고려
