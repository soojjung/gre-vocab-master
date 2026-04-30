# 운영 오류 로그

운영 환경에서 발생한 이슈와 해결 기록. 신규 이슈는 상단에 추가.

각 항목 구성: 발생일 / 발견 경로 / 증상 / 원인 / 해결 / 후속 조치 / 교훈.

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

---

## 작성 가이드

신규 이슈 추가 시:

1. 최상단에 `## YYYY-MM-DD — 한 줄 요약` 헤더로 시작
2. 표 형식으로 발견 경로 / 영향 / 원인 / 해결 / 후속 조치 / 교훈 6개 항목 채우기
3. 관련 커밋 SHA 가 있으면 항목 아래에 명시
4. 일반화된 교훈은 하단 "운영 점검 체크리스트" 에도 반영 고려
