# 국제화(i18n) 작업 계획 · 진행 문서

이 문서는 "단어의 신 GRE" 앱의 국제화 작업의 **단일 출처(single source of truth)** 입니다. 새 세션에서 `i18n` 서브 에이전트가 작업을 이어가려면 **반드시 이 문서를 먼저 읽고**, 작업이 끝나면 **결정 사항 / 진행 현황 / 작업 로그를 갱신**해야 합니다.

- 작업 시작일: 2026-06-01
- 담당 서브 에이전트: `.claude/agents/i18n.md`
- 관련 정책: `CLAUDE.md`, `.ai/CODING_STANDARDS.ts`, `.ai/OPERATIONS_LOG.md`

---

## 1. 목표

1. **App Store 노출**: 디바이스 언어가 한국어인 사용자에게만 한국어, 그 외에는 영어로 표시.
2. **첫 진입 언어 선택**: 앱 첫 실행 시 언어 선택 화면 노출, 이후 저장된 언어로 자동 진입.
3. **마이페이지에서 언어 변경 가능**: 언제든 한/영 전환, 즉시 반영 + 다른 기기 동기화.
4. **앱 내 모든 UI/콘텐츠 i18n 대응**: 한국어 리터럴 제거, 1500 단어 데이터 영어 뜻 보강.

---

## 2. 결정 사항 (Decision Log)

| 항목                          | 결정                                                                          | 상태                 | 메모                                                                                                                                                                              |
| ----------------------------- | ----------------------------------------------------------------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App Store Primary Language    | **English** 로 설정, Korean 은 additional localization                        | ✅ 확정 (2026-06-01) | ⚠️ App Store Connect 의 현재 Primary 가 Korean 이면 변경 제약 발생 가능. Phase 5 진입 전 사용자가 App Store Connect → App Information 에서 현 상태/변경 가능 여부 확인 필요       |
| i18n 라이브러리               | **자체 LanguageContext + ko/en 사전** (react-i18next 미도입)                  | ✅ 확정 (2026-06-01) | 키 타입 자동 추론(union) 으로 타입 안전 확보. 번들 경량화                                                                                                                         |
| 단어 영어 뜻 소스             | **원본 PDF 추출** (Manhattan Prep / Target Test Prep) 우선, 부족분만 LLM 보강 | ✅ 확정 (2026-06-01) | `src/data/manhattan_prep_1000_gre_words_.pdf`, `src/data/target_test_prep_gre_vocabulary.pdf` 활용. 추출 스크립트는 Phase 3 에서 작성                                             |
| 언어 선택 저장 위치           | **localStorage + Supabase `user_data.locale`** 동기화                         | ✅ 확정 (2026-06-01) | `profiles` 대신 `user_data` 에 추가 — 기존 설정(`daily_goal`, `reset_hour`, `auto_speak`) 과 같은 1:1 설정 테이블. Phase 1 에서 마이그레이션 SQL 작성 + `DATABASE_SCHEMA.md` 갱신 |
| 첫 진입 언어 선택 화면 위치   | **Login 화면 이전** (1회만, localStorage 빈 경우)                             | ✅ 확정 (2026-06-01) | 디바이스 언어 기반으로 기본값 미리 선택 후 사용자 확정                                                                                                                            |
| 한국어 예문 번역(`exampleKo`) | 영어 모드에서는 미표시, 한국어 모드에서만 노출                                | ✅ 확정 (2026-06-01) | 데이터는 유지, 표시만 분기 — 언어 토글 시 즉시 복원                                                                                                                               |

> 결정이 바뀌면 표의 "상태" 와 "메모" 를 갱신하고 변경 사유를 "8. 작업 로그" 에 기록.

### 2-1. 결정 후속 액션 아이템

- [ ] **App Store Connect Primary Language 현 상태 확인** (사용자 액션 · Phase 5 차단 요소). Korean 이면 변경 가능 여부 + 절차 확인 필요.

---

## 3. 영향 범위 (현 코드베이스 한국어 박힘 위치)

조사 시점: 2026-06-01.

### 3-1. UI 문자열 (페이지/컴포넌트)

- `src/pages/` 전체 — Onboarding, HomePage, MyPageWrapper, QuizSelectPage, QuizPlayPage, QuizResultPage, StudyPage, StatsPage, VocabularyPage, Login, SupportPage, ContactPage, AboutPage, LicensePage, PrivacyPolicyPage
- `src/components/` — BackHeader, AuthenticatedApp, study/\* (StudyHeader, FlashCard, StudyComplete, AnswerButtons, AutoSpeakToggle), common/Button
- 토스트/에러 메시지 — `sonner` 호출부 전반

### 3-2. 데이터

- `src/data/words-1..8.ts` — `Word.meaning`(한국어 뜻), `Word.exampleKo`(한국어 예문 번역). 영어 뜻 필드 부재.
- `src/types.ts` — `Word` 타입 정의 (확장 필요)

### 3-3. iOS / 메타데이터

- `ios/App/App/Info.plist` — `CFBundleLocalizations`, `CFBundleDevelopmentRegion` 미설정 추정
- `ios/App/App/{en,ko}.lproj/InfoPlist.strings` — 부재
- App Store Connect — 현재 Primary Language 확인 필요
- `index.html` `<html lang="ko">`, meta description, OG 태그 — 한국어 고정
- `public/manifest.webmanifest` (PWA) — name/short_name/description 한국어 고정
- `.ai/APP_STORE_REVIEW.md` — 영어 버전 필요 여부 확인

### 3-4. 도메인 로직 (i18n 영향 가능)

- `src/lib/blankSentence.ts` — 영어 인플렉션 매칭 (언어 무관, 영향 없음)
- 객관식 퀴즈 distractor — 한국어 뜻 풀에서 추출 중일 가능성. 영어 모드일 때 영어 뜻 풀로 전환 필요. `QuizPlayPage` 확인 필요
- TTS — 영어 단어 발음용. 예문에 한국어 TTS 사용처가 있는지 `src/lib/tts.ts` 확인 필요

---

## 4. 단계별 플랜

### Phase 1 — i18n 인프라

- [x] `src/i18n/` 신설: `LanguageContext.tsx`, `locales/ko.ts`, `locales/en.ts`, `types.ts`, `index.ts` (사전 키 union 타입 자동 추론, `useT` 는 `LanguageContext.tsx` 내 export)
- [x] `App.tsx` 최상단(AuthProvider 바깥)에 `<LanguageProvider>` 배치 → Login 도 번역 대상
- [x] 초기 언어 감지: `navigator.language` 단독(Capacitor iOS WebView 도 디바이스 언어 반영, `@capacitor/device` 미설치). `ko*` → `ko`, 그 외 → `en`
- [x] 저장: localStorage `app.lang` (i18n 단에서 즉시 반영). Supabase `user_data.locale` 양방향 동기화는 Phase 4 에서 연결 — 현재는 데이터 파이프라인만 준비
- [x] Supabase 마이그레이션: `supabase-migration-locale.sql` 신설 (`ALTER TABLE user_data ADD COLUMN locale TEXT NOT NULL DEFAULT 'en'`). **사용자가 직접 Supabase Dashboard 에서 실행 필요**
- [x] `.ai/DATABASE_SCHEMA.md` 갱신 (user_data §, TypeScript 매핑 표)
- [x] `useUserData.ts` 의 row↔UserData 매핑 + `updateSettings` 시그니처에 `locale` 추가, `UserDataContext.tsx` 인터페이스도 동기화
- [x] `UserData` 타입(`src/types.ts`) 에 `locale: "ko" | "en"` 필드 + 기본값 `"en"`
- [x] `document.documentElement.lang` 동기화 (LanguageProvider 의 useEffect)
- [ ] 미사용 키 / 누락 키 검출 스크립트 (선택 — 보류. 사전 누락은 dev 모드 console.warn 으로 대체)

### Phase 2 — UI 문자열 추출

분량이 커서 4 단계(2a~2d)로 분할.

**Phase 2a — 로그인 + 학습 코어 컴포넌트** (✅ 완료, 2026-06-01)

- [x] `Login.tsx`, `AuthenticatedApp.tsx`, `StudyComplete.tsx`, `FlashCard.tsx`, `AnswerButtons.tsx`, `AutoSpeakToggle.tsx`
- [x] `LanguageContext.t` 에 변수 치환(`{count}` 등) 추가
- [x] 사전 네임스페이스 추가: `common.*`, `login.*`, `login.error.*`, `study.*`, `study.card.*`, `study.complete.*`
- [x] `common.appName` 을 "단어의 신 GRE" / "GRE Vocab Master" 로 확정

**Phase 2b — 메인 페이지** (✅ 완료, 2026-06-01)

- [x] `Onboarding.tsx`, `HomePage.tsx`, `StudyPage.tsx`
- [x] `QuizSelectPage.tsx`, `QuizPlayPage.tsx`, `QuizResultPage.tsx`
- [x] `VocabularyPage.tsx`, `StatsPage.tsx`
- [x] 사전 네임스페이스 추가: `common.{previous,itemsCount}`, `onboarding.*`(16개), `home.*`(15개), `study.{srBadge,nextWord,reviewComplete,studyComplete,noWords,goBack}`, `study.review.*`(5개), `quiz.*`(15개) + `quiz.result.*`(8개), `vocab.*`(13개), `stats.*`(14개)

**Phase 2c — 마이페이지 + 정적 페이지** (✅ 완료, 2026-06-01)

- [x] `MyPageWrapper.tsx` (66 라인, 가장 큼)
- [x] `SupportPage.tsx`, `ContactPage.tsx`, `AboutPage.tsx`
- [x] `PrivacyPolicyPage.tsx` (긴 본문), `LicensePage.tsx`
- [x] 사전 추가: `common.{edit, copy, copied}`, `mypage.*`(27개), `contact.*`(11개), `about.*`(22개), `privacy.*`(35개), `license.*`(5개) — 총 ~100키
- [x] 프라이버시 정책은 의미 동등 영문 작성 (법률 검토 권장 — Phase 5 출시 전)

**Phase 2d — 사용자 노출 토스트/에러** (✅ 완료, 2026-06-01)

- [x] 전수 검출: `grep -rnE '(alert|confirm|toast\.|throw new Error)' src/ | grep '[가-힣]'`
- [x] 결과: AuthContext.tsx 의 throw 2건만 사용자 노출 가능. `useUserData.ts`/`useStudySession.ts` 등은 console.error/주석뿐 → 코딩 표준 허용으로 유지
- [x] AuthContext: `AuthProvider` 가 LanguageProvider 안쪽에 있는 점을 활용해 `useT()` 도입. Apple sign-in throw 는 `t("login.error.appleFailed")` 로 i18n 처리. deleteAccount 의 사전조건 throw 는 내부 sentinel `"not_signed_in"` 로 변경(ContactPage 가 err.message 를 안 읽음)

**공통 체크**

- [x] sonner 토스트는 각 Phase 내에서 처리
- [x] 잔여 한국어 리터럴 검출: `grep -rE '[가-힣]' src/` (JSX/JS 주석은 코딩 표준 허용으로 제외)
- [ ] (선택, 보류) ESLint custom rule 또는 CI 체크

### Phase 3 — 단어 데이터 영어화 (별도 트랙, 가장 무거움)

- [ ] `Word` 타입 확장: `meaningEn: string` 추가 (`meaning`/`exampleKo` 유지)
- [ ] 원본 PDF (Manhattan Prep / Target Test Prep) 에서 영어 정의 추출 스크립트 작성
- [ ] 1500 단어 영어 뜻 머지 → `src/data/words-*.ts` 갱신
- [ ] 단어 카드 컴포넌트에서 현재 언어 따라 `meaning` vs `meaningEn` 선택
- [ ] 객관식 퀴즈 distractor 풀을 언어에 맞게 분기
- [ ] 빈칸 채우기 / 학습 / 단어장 / 통계 모두 회귀 확인

### Phase 4 — 첫 진입 언어 선택 + 마이페이지 토글 (✅ 완료, 2026-06-01)

- [x] `LanguageProvider` 에 `confirmed: boolean` 추가 (localStorage `app.lang` 존재 또는 `setLang()` 호출 시 true). 초기값은 `localStorage.getItem("app.lang") !== null`
- [x] `src/pages/LanguagePicker.tsx` 신설 — 한·영 타일 + 한·영 병기 제목/Continue 버튼
- [x] `App.tsx` 에 `LanguageGate` 추가: `!confirmed` 면 `LanguagePicker` 만 렌더, 그 외 기존 라우트
- [x] `src/i18n/LocaleSync.tsx` 신설 — `lang` 과 `userData.locale` 이 다르면 Supabase 에 푸시(`updateSettings({ locale })`). `loading` 가드 + 양쪽이 같아지면 자동 정지(무한 루프 방지)
- [x] `AuthenticatedApp.tsx` 의 `UserDataProvider` 아래에 `<LocaleSync />` 마운트
- [x] `MyPageWrapper.tsx` 학습 설정 섹션에 세그먼티드 토글(한국어 / English) 추가 — 클릭 즉시 `setLang()` → 리렌더 → `LocaleSync` 가 Supabase 반영

### Phase 5 — iOS / App Store 메타데이터 (✅ 코드 완료, 2026-06-01)

코드 작업:
- [x] `ios/App/App/Info.plist`: `CFBundleLocalizations = [en, ko]` 추가, `CFBundleDevelopmentRegion = en` (기존 유지), `CFBundleDisplayName = "GRE Vocab Master"` 로 변경(영문 fallback)
- [x] `ios/App/App/en.lproj/InfoPlist.strings` 신설: `CFBundleDisplayName = "GRE Vocab Master"`
- [x] `ios/App/App/ko.lproj/InfoPlist.strings` 신설: `CFBundleDisplayName = "단어의 신 GRE"`
- [x] `index.html` 의 `<html lang>` — head 인라인 스크립트로 부팅 시 결정(Phase 4 후속 작업에서 완료, FOIT 방지)
- [x] `LanguageContext.tsx`: 언어 변경 시 `document.title` 갱신
- [x] In-app Privacy Policy / Support 페이지 — Phase 2c 에서 i18n 완료
- [x] `.ai/APP_STORE_METADATA.md` 신설: 한·영 Name/Subtitle/Promotional/Description/Keywords/What's New 문안 + App Review 안내 + 스크린샷 가이드

> 사용자 대시보드/Xcode 작업은 **Phase 7** 으로 분리.

보류 항목:
- [ ] `public/privacy-policy.html` 영문 버전 (현재 한국어 정적 fallback 뿐. 영문 정책이 별도 URL 로 필요해지면 추가). In-app 정책은 i18n 완료라 통상 케이스는 커버됨
- [ ] `public/manifest.webmanifest` (vite-plugin-pwa 가 생성) — PWA add-to-home 라벨이 한국어 고정. 영어 사용자 PWA 비중이 낮으면 보류 가능

### Phase 6 — QA / 릴리스

- [ ] 두 언어 각각 골든패스 수동 테스트 (Onboarding → 학습 → 퀴즈 → 결과 → 마이페이지 → 언어 변경)
- [ ] 잔여 한국어 리터럴 grep
- [ ] 영어 모드 레이아웃 점검 (영어가 한국어보다 평균 1.3~1.5배 길어 줄바꿈/오버플로 위험)
- [ ] TTS 분기 점검
- [ ] `.ai/OPERATIONS_LOG.md` 에 릴리스 기록
- [ ] 버전 bump 후 워크스페이스 자동 오픈 (memory: open Xcode before submission)
- [ ] 사용자에게 커밋 승인 받고 커밋 → App Store 제출

### Phase 7 — 사용자 액션 (Xcode 등록 + App Store Connect 입력)

> 코드/문서 작업이 아닌 사용자가 직접 처리해야 하는 작업들. App Store 제출 전 필수.

Xcode 작업:
- [ ] **Xcode 에서 `.lproj` 파일을 프로젝트에 등록** — 파일 시스템 생성만으로는 빌드 대상에 포함되지 않음
  - Project Navigator → `App` 그룹 우클릭 → "Add Files to App..." → `en.lproj/InfoPlist.strings`, `ko.lproj/InfoPlist.strings` 선택 → Add
  - 또는 Info.plist 선택 → File Inspector → Localization → "+" 로 English, Korean 추가
- [ ] 빌드 후 실기기에서 디바이스 언어를 영어/한국어로 바꿔 홈 화면 앱 이름이 각각 "GRE Vocab Master" / "단어의 신 GRE" 로 표시되는지 확인

App Store Connect 작업 (`.ai/APP_STORE_METADATA.md` 참고):
- [ ] **App Store Connect → App Information → Primary Language** 현 상태 확인
  - Korean (ko) 으로 출시돼 있으면 변경 제약 발생 가능 — 변경 가능 여부 확인
  - 불가 시 옵션: (a) Korean Primary 유지 + English additional localization (역방향 fallback) (b) 신규 앱 ID 로 영문판 별도 출시
- [ ] App Store Connect → 해당 버전 → + Add Localization → Korean 추가 (Primary 가 English 인 경우)
- [ ] `APP_STORE_METADATA.md` §1~4 의 문안을 한·영 각각 복사/붙여넣기:
  - §1 Name / Subtitle / Promotional Text
  - §2 Keywords
  - §3 Description
  - §4 What's New
- [ ] §5 App Review Information 의 Account Deletion 안내(한·영) 입력
- [ ] §6 URLs 확인 (Support URL, Privacy Policy URL)
- [ ] 스크린샷 한·영 각각 업로드 (가이드: §7 — 필수 디바이스 사이즈별 7개 화면)

법률/리스크:
- [ ] 프라이버시 정책 영문 법률 검토 (App Store 영문판 출시 전 권장 — §7 리스크 참고)
- [ ] 결정 후속: App Store Connect Primary Language 현 상태 확인 (§2-1 후속 액션)

---

## 5. PR 분할 제안

1. `feat(i18n): LanguageProvider + locale 감지/저장` — Phase 1
2. `refactor(ui): 한국어 리터럴 t() 키로 치환` — Phase 2 (페이지별로 더 쪼개도 OK)
3. `feat(words): meaningEn 필드 + 1500 단어 영어 뜻` — Phase 3
4. `feat(settings): 첫 진입 언어 선택 + 마이페이지 토글` — Phase 4
5. `chore(ios): InfoPlist 로케일 + App Store 메타데이터 정리` — Phase 5

---

## 6. 진행 현황

| Phase                    | 상태                         | 마지막 갱신 |
| ------------------------ | ---------------------------- | ----------- |
| 0. 결정 사항 확정        | ✅ 완료                      | 2026-06-01  |
| 1. i18n 인프라           | ✅ 완료 (선택 항목 1건 보류) | 2026-06-01  |
| 2. UI 문자열 추출        | ✅ 완료 (2a/2b/2c/2d)        | 2026-06-01  |
| 3. 단어 데이터 영어화    | 🔲 미시작                    | 2026-06-01  |
| 4. 언어 선택 화면 + 토글 | ✅ 완료                      | 2026-06-01  |
| 5. iOS / App Store       | ✅ 완료 (코드)               | 2026-06-01  |
| 6. QA / 릴리스           | 🔲 미시작                    | 2026-06-01  |
| 7. 사용자 액션 (Xcode + App Store Connect) | 🔲 대기 (사용자 처리) | 2026-06-01  |

상태 표기: 🔲 미시작 · 🟡 진행중 · ✅ 완료 · ⛔ 차단

---

## 7. 알려진 리스크 / 메모

- **App Store Primary Language 변경 제약**: 앱이 한 번이라도 영어 메타데이터 없이 한국어로 출시된 경우 Primary 변경이 불가하거나 신규 앱 등록이 필요할 수 있음. App Store Connect 직접 확인 필요.
- **영어 텍스트 길이**: 영어가 한국어보다 평균 30~50% 길어 모바일 폭에서 줄바꿈/잘림이 발생. 버튼·헤더 폭 재검토 필요.
- **TTS 보이스**: 영어 모드에서 한국어 예문 번역(`exampleKo`)을 숨기더라도, 한국어 모드에서 한국어 TTS 가 활성화 돼 있다면 voice 설정 분기 필요.
- **퀴즈 distractor 풀**: 객관식에서 한국어 뜻 보기를 무작위 추출하는 로직이 있다면 영어 모드에선 `meaningEn` 풀로 분기해야 학습 효과 유지.
- **PWA 캐시**: 언어 변경 시 service worker 캐시가 옛 언어로 고정될 수 있어 cache key 에 locale 포함 검토.
- **프라이버시 정책 영문 법률 검토**: Phase 2c 에서 작성한 `privacy.*` 영문은 의미 동등 번역이지만 법률 검토를 받지 않은 상태. App Store 영문판 출시 전 변호사/법률 검토 권장.

---

## 8. 작업 로그

> 날짜 / 무엇을 했는지 / 다음 작업. 새 항목은 **상단** 에 추가.

### 2026-06-01 (저녁8) — Phase 7 신설(사용자 액션 분리)
- 사용자 요청으로 Phase 5 의 "사용자 액션 필요" 항목들을 **Phase 7** 로 분리. Phase 5 는 코드 작업만 남기고 ✅ 완료 처리.
- Phase 7 구성: (1) Xcode 에서 `.lproj` 파일 프로젝트 등록 (2) App Store Connect Primary Language 확인/변경 (3) 한·영 메타데이터 입력 (4) 스크린샷 업로드 (5) 영문 정책 법률 검토.
- 진행 현황 표에 Phase 7 행 추가.
- 다음 작업: **Phase 6 — QA / 릴리스** (두 언어 골든패스 테스트). Phase 7 은 사용자 작업이라 병렬 가능.

### 2026-06-01 (저녁7) — Phase 5 코드 작업 완료
- iOS Info.plist 로컬라이즈: `CFBundleLocalizations = [en, ko]` 추가, `CFBundleDisplayName` 영문 fallback("GRE Vocab Master")로 변경.
- `ios/App/App/en.lproj/InfoPlist.strings`, `ios/App/App/ko.lproj/InfoPlist.strings` 신설(앱 표시 이름 로컬라이즈).
- `LanguageContext.tsx`: 언어 변경 시 `document.title` 도 동기화(브라우저 탭 / PWA 공유).
- `.ai/APP_STORE_METADATA.md` 신설: 한·영 Name/Subtitle/Promotional/Description/Keywords/What's New + App Review 안내 + 스크린샷 가이드 + 사용자 액션 체크리스트.

### 2026-06-01 (저녁6) — Phase 4 완료
- 신규 파일: `src/pages/LanguagePicker.tsx`, `src/i18n/LocaleSync.tsx`.
- 수정 파일: `src/i18n/{LanguageContext.tsx, index.ts}`, `src/App.tsx`(LanguageGate 추가), `src/components/AuthenticatedApp.tsx`(LocaleSync 마운트), `src/pages/MyPageWrapper.tsx`(세그먼티드 토글).
- 동작 흐름:
  - **첫 진입**: localStorage `app.lang` 없음 → `confirmed=false` → LanguagePicker 노출. 사용자가 한국어/English 선택 후 Continue → `setLang()` → localStorage 저장 + `confirmed=true` → 정상 라우트 마운트.
  - **재진입**: localStorage 에 값 있음 → 바로 정상 라우트.
  - **로그인 후**: `LocaleSync` 가 `userData.locale ≠ lang` 이면 Supabase 에 푸시(localStorage 우선 정책).
  - **마이페이지 토글**: `setLang()` 즉시 반영 → 리렌더 → LocaleSync 가 Supabase 동기화.
- 동기화 정책: localStorage(현재 lang) 가 항상 우선. 멀티 디바이스 cross-sync 는 device-last-touched-wins.
- LanguagePicker 의 제목/버튼은 한·영 병기(사용자가 어느 언어를 선호할지 모르므로).
- 검증: `npx tsc -b` ✅, `npx eslint` ✅.
- 사용자 액션 없음.
- 다음 작업 후보:
  - **Phase 3** — 단어 1500개 영어 뜻 데이터 (가장 무거움)
  - **Phase 5** — iOS Info.plist + App Store Connect 메타데이터 + index.html / manifest 영문화

### 2026-06-01 (저녁5) — Phase 2d 완료 (Phase 2 전체 종료)

- 전수 검색 결과 사용자 노출 한국어는 `AuthContext.tsx` 의 throw 2건만 남아 있었음.
- `AuthContext` 가 LanguageProvider 안쪽이라 `useT()` 직접 사용 가능. Apple sign-in 실패 throw 는 `t("login.error.appleFailed")` 로 i18n.
- `deleteAccount` 의 precondition throw 는 ContactPage 가 err.message 를 안 읽으므로 내부 sentinel `"not_signed_in"` 로 변경.
- 검증: `npx tsc -b` ✅, `npx eslint` ✅, 사용자 노출 한국어 0건.
- **Phase 2 전체 완료**. UI / 토스트 / 에러 / 정적 페이지 / 마이페이지 / 학습·퀴즈 흐름 모두 한·영 양쪽으로 표시 가능.
- 다음 작업: **Phase 3 — 단어 데이터 영어화** (1500 단어 `meaningEn` 필드 + 데이터 머지 + 컴포넌트 분기). 가장 무거운 트랙. 또는 우선 Phase 4 (언어 선택 화면 + 마이페이지 토글) 부터 진행해 영어 모드 흐름을 운영 가능한 상태로 만든 뒤 Phase 3 를 별도 작업으로 분리하는 것도 가능.

### 2026-06-01 (저녁4) — Phase 2c 완료

- 6개 파일 치환: `MyPageWrapper`(66 라인 최다), `SupportPage`, `ContactPage`, `AboutPage`(긴 본문), `PrivacyPolicyPage`(법률 문서), `LicensePage`.
- 사전 추가 ~100키: `common.{edit,copy,copied}` + `mypage.*`(27) + `contact.*`(11) + `about.*`(22) + `privacy.*`(35) + `license.*`(5).
- 프라이버시 정책 영문은 의미 동등 번역으로 작성. 한국 PIPA 특화 문구는 "applicable privacy laws" 일반화. **출시 전 법률 검토 권장** — §7 리스크에 추가 예정.
- `formatResetHour` 처리: 0→`mypage.resetHourMidnight`, 1-5→`resetHourDawn({hour})`, 6+→`resetHourMorning({hour})`. en 에선 dawn/morning 모두 "{hour} AM" 으로 통일.
- MyPageWrapper 의 `getDisplayName` / `getProviderLabel` 은 t 함수를 인자로 받도록 시그니처 변경.
- 검증: `npx tsc -b` ✅, `npx eslint` ✅. 잔여 한국어 0건 (페이지 6개 모두).
- 사용자 액션 없음.
- 다음 작업: **Phase 2d** — 사용자 노출 토스트/에러 메시지 발췌(`AuthContext`, `useUserData`, `useStudySession` 등에서 console.error 가 아닌 사용자 표시 문자열만).

### 2026-06-01 (저녁3) — Phase 2b 완료

- 8개 메인 페이지 일괄 치환: `Onboarding`, `HomePage`, `StudyPage`, `QuizSelectPage`, `QuizPlayPage`, `QuizResultPage`, `VocabularyPage`, `StatsPage`.
- 사전 추가: `common.previous`, `common.itemsCount`("{count}개"/"{count}"), `onboarding.*`(16), `home.*`(15), `study.review.*`(5) + 추가 `study.*`(6), `quiz.*`(15) + `quiz.result.*`(8), `vocab.*`(13), `stats.*`(14). 총 신규 ~90키.
- 인터폴레이션 활용 패턴 정착: `{count}`, `{percent}`, `{days}`, `{total}`, `{word}`, `{type}`.
- 영어 단복수/어순 차이 대응: `quiz.result.typeWithLabel` 같은 합성 키 도입, `home.streak` 은 "N-day streak" 형태로 재작성.
- 검증: `npx tsc -b` ✅, `npx eslint` ✅. 잔여 한국어는 코드 주석 1건뿐(Onboarding.tsx:20 trailing comment, 코딩 표준 허용).
- 사용자 액션 없음.
- 다음 작업: **Phase 2c** — 마이페이지(`MyPageWrapper.tsx` 66 라인) + 정적 페이지 5개(`SupportPage`, `ContactPage`, `AboutPage`, `PrivacyPolicyPage`, `LicensePage`).

### 2026-06-01 (저녁2) — Phase 2a 완료

- Phase 2 를 4 단계(2a~2d)로 분할. 2a 는 로그인 + 학습 코어 컴포넌트 7개 파일.
- `LanguageContext.t` 에 변수 치환(`{count}` 패턴) 추가. `useT()` 시그니처도 갱신.
- 사전 확장: `common.{or,loading}`, `common.appName` 을 "단어의 신 GRE" / "GRE Vocab Master" 로 확정, `login.*`(8개) + `login.error.*`(9개), `study.{iKnow,iDontKnow,autoSpeak}`, `study.card.tapToReveal`, `study.complete.*`(7개).
- 수정 파일: `src/i18n/LanguageContext.tsx`, `src/i18n/locales/{ko,en}.ts`, `src/pages/Login.tsx`, `src/components/AuthenticatedApp.tsx`, `src/components/study/{StudyComplete,FlashCard,AnswerButtons,AutoSpeakToggle}.tsx`.
- `getAuthErrorMessage` 를 모듈 함수 → Login 내부 함수로 옮기고 에러 코드 → 키 매핑(`AUTH_ERROR_KEYS`) 으로 단순화.
- 검증: `npx tsc -b` ✅, `npx eslint` ✅. 잔여 한국어는 JSX 주석뿐(코딩 표준 허용).
- 사용자 액션 없음 (Supabase 마이그레이션은 어제 실행 완료).
- 다음 작업: **Phase 2b** — 메인 페이지 8개(Onboarding, HomePage, StudyPage, QuizSelectPage, QuizPlayPage, QuizResultPage, VocabularyPage, StatsPage).

### 2026-06-01 (저녁) — Phase 1 완료

- 신규 파일: `src/i18n/{LanguageContext.tsx, types.ts, index.ts, locales/ko.ts, locales/en.ts}`, `supabase-migration-locale.sql`.
- 수정 파일: `src/App.tsx` (`<LanguageProvider>` 추가), `src/types.ts` (`UserData.locale: "ko"|"en"` + 기본값 `"en"`), `src/hooks/useUserData.ts` (row↔UserData 매핑 + `updateSettings` 시그니처 확장), `src/contexts/UserDataContext.tsx` (`updateSettings` 타입 동기화), `.ai/DATABASE_SCHEMA.md` (user_data § + 매핑 표).
- 검증: `npx tsc -b` 통과, `npx eslint` 통과.
- 디바이스 감지는 `@capacitor/device` 도입 없이 `navigator.language` 단독으로 처리 (Capacitor iOS WebView 도 디바이스 언어 반영).
- Supabase `user_data.locale` 컬럼은 데이터 파이프라인까지 준비. 양방향 동기화(Provider ↔ Supabase)는 Phase 4 에서 LanguagePicker / MyPage 토글과 함께 연결.
- **사용자 액션 필요**: Supabase Dashboard SQL Editor 에서 `supabase-migration-locale.sql` 실행. 실행 전 앱이 위 컬럼에 INSERT 하면 컬럼 미존재 오류가 날 수 있으므로 다음 배포 전 필수.
- 사용자 지적으로 마이그레이션에 기존 사용자 `ko` 백필(`UPDATE user_data SET locale = 'ko';`) 추가. 현재 가입자가 모두 한국인이라는 사실 반영. 재실행 1회 한정 주의 문구 포함.
- 다음 작업: **Phase 2 (UI 문자열 추출)** — 페이지/컴포넌트 단위로 한국어 리터럴 → `t()` 키 치환.

### 2026-06-01 (오후)

- 사용자 요청으로 i18n 작업 계획 수립 및 본 문서(`I18N_PLAN.md`) 신설.
- 담당 서브 에이전트(`.claude/agents/i18n.md`) 생성.
- 미확정 결정 6건 식별 → "2. 결정 사항" 표에 정리.
- 사용자가 6건 모두 추천안대로 확정. 표 상태 ✅ 일괄 갱신.
- 후속 액션 아이템 식별: App Store Connect Primary Language 현 상태 확인 (사용자 액션, Phase 5 차단 요소).
- Phase 1 체크리스트 보강: Supabase `user_data.locale` 마이그레이션 + `DATABASE_SCHEMA.md` 갱신 + `useUserData.ts` 매핑 추가.
