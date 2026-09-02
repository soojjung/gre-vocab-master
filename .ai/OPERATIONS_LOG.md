# 운영 오류 로그

운영 환경에서 발생한 이슈와 해결 기록. 신규 이슈는 상단에 추가.

각 항목 구성: 발생일 / 발견 경로 / 증상 / 원인 / 해결 / 후속 조치 / 교훈.

---

## 2026-09-02 — 퀴즈에서 답을 고를 때마다 문항 전체가 재생성 (빨강·초록 동시 표시) + iOS 토스트가 상태바에 가려짐

| 항목 | 내용 |
|---|---|
| **발견 경로** | 사용자 이메일 제보 (HYENNIE `ekdnsaosldk@naver.com`, 2026-08-28 오전 9:17 / 9:20 두 통, 아이폰 스크린샷 첨부). "정답을 선택해도 갑자기 보기들이 바뀌면서 이상하게 빨강과 초록칸이 같이 뜨다가 넘어가요", "정답입니다/오답입니다 표시가 너무 위쪽에 떠서 가려져 보여요". 첨부 스크린샷에 토스트는 `정답입니다!` 인데 A 는 빨강, C 는 초록으로 동시 표시된 상태가 그대로 찍혀 있어 원인 특정의 결정적 단서가 됨 |
| **영향** | 웹 전 버전 + iOS 1.0 ~ 1.7. 퀴즈 두 모드(fill-blank / multiple-choice) 모두. ① 답을 고른 직후 1.5초 피드백 구간에서 문제·보기가 통째로 다른 것으로 바뀌고, 이전 문항 기준 `selectedIndex` 가 새 보기 위에 찍혀 정답을 맞혀도 빨간 칸이 같이 뜸 → **무엇이 정답이었는지 알 수 없어 학습 자체가 불가능**. 매 문항 재추첨이므로 이미 푼 단어가 다시 나오거나 특정 단어가 반복 출제되기도 함. 단, `recordAnswer` / `results` 는 렌더 클로저의 이전 `question` 객체를 쓰므로 **진도 기록과 결과 페이지 채점은 정상**이었음 (표시만 깨짐)<br>② 아이폰에서 토스트가 상태바/노치 아래로 파고들어 잘려 보임 |
| **원인** | ① `QuizPlayPage` 의 `questions` 가 `useMemo(..., [quizWords, quizCount])` 이고 `quizWords` 는 `useMemo(..., [words, userData.progress])`. 답을 고르면 `recordAnswer()` 가 `progress: {...prev.progress, [wordId]: newProgress}` 로 **새 객체를 반환** → `quizWords` → `questions` 가 연쇄 재계산되며 `generateQuestions()` 가 다시 셔플. `currentIndex` / `selectedIndex` / `showResult` 는 그대로 남아 **데이터(문항)와 표시 상태(선택 결과)의 생명주기가 어긋남**<br>② sonner 의 뷰포트 오프셋 기본값이 모바일 16px / 데스크톱 24px 고정 (`MOBILE_VIEWPORT_OFFSET`). safe-area 를 반영하지 않아 노치 기기에서 상태바 영역에 겹침 |
| **해결** | - `src/pages/QuizPlayPage.tsx`: 문항을 **단어가 준비된 첫 렌더에서 1회만 생성**하고 세션 내내 고정 (`useState` + 렌더 중 상태 조정). ref 로 캡처하거나 `useEffect` 에서 생성하는 방식은 이 저장소의 eslint(react-hooks v7) `refs` / `set-state-in-effect` 규칙에 걸려 불가 — `useUserData.ts` 가 이미 쓰는 렌더 중 조정 패턴에 맞춤. 생성 직전 1프레임에 `/quiz` 로 튕기지 않도록 로딩 가드 추가, 매직넘버 4 는 `MIN_QUIZ_WORDS` 상수로 정리<br>- `src/App.tsx`: `<Toaster>` 에 `offset`/`mobileOffset` = `calc(max(2rem, env(safe-area-inset-top)) + 28px)`. 퀴즈 헤더의 상단 패딩과 같은 식을 써서 닫기·진행 표시 아래에 오도록 맞춤 (72px → 32px → 28px 로 실기기 보며 조정) |
| **후속 조치** | - 실기기(iPhone, Capacitor 네이티브 빌드) 확인 완료: 정답 선택 시 초록만 표시, 토스트가 상태바 아래에 온전히 노출<br>- **남은 확인**: 오답 케이스, 연속 3~4문항 진행 시 문제·보기 고정 여부<br>- 제보자 HYENNIE 님에게 회신 + 다음 배포 반영 안내 필요<br>- iOS `MARKETING_VERSION` bump 후 재제출 필요<br>- 퀴즈 흐름에 회귀 테스트 부재 — "답을 고른 뒤 문항이 그대로인가" 같은 시나리오는 타입체크·lint 로 절대 안 잡힘 |
| **교훈** | - **파생 상태를 휘발성 의존성으로 memo 하면 세션 도중 재생성된다.** `userData.progress` 처럼 사용자의 행동마다 새 객체가 되는 값을 `useMemo` 체인 상류에 두면, 그 하류의 "한 번만 만들어야 하는 것"(퀴즈 문항, 셔플 결과, 추천 목록 등)이 조용히 다시 만들어짐<br>- **데이터와 그 데이터를 가리키는 인덱스·선택 상태는 생명주기를 같이 가야 한다.** `questions` 는 재생성되는데 `selectedIndex` 는 유지되니 두 세대가 겹쳐 그려졌음. 인덱스로 참조하는 구조는 이 어긋남에 특히 취약<br>- **에러가 안 나는 UI 버그는 Sentry·타입체크·lint 어디에도 안 걸린다.** 이번에도 인지 채널은 사용자 이메일 하나뿐이었고, 첨부 스크린샷이 없었으면 원인 특정에 훨씬 오래 걸렸을 것 — 제보 시 스크린샷 요청을 기본으로 두는 게 유효<br>- **서드파티 UI 라이브러리의 기본 오프셋은 safe-area 를 모른다.** 노치 기기 대응은 라이브러리가 아니라 우리가 명시해야 함 |

관련 파일:
- `src/pages/QuizPlayPage.tsx` (문항 1회 생성 고정, `MIN_QUIZ_WORDS`, 생성 직전 로딩 가드)
- `src/App.tsx` (`<Toaster>` safe-area 오프셋)

---

## 2026-09-02 — supabase auth `navigatorLock` 획득 타임아웃이 unhandled rejection 으로 새어나가 `/study` 무한 로딩 (`AbortError: signal is aborted without reason`)

| 항목 | 내용 |
|---|---|
| **발견 경로** | Sentry 이슈 `GRE-VOCAB-MASTER-8` (event `42aac851`, 2026-08-31 발생 / 09-01 확인). `AbortError: signal is aborted without reason` — release `af3e60670ea6`, production, `/study`, 1 user / 1 event, Chrome 151 / macOS. mechanism `auto.browser.global_handlers.onunhandledrejection`, handled=false |
| **영향** | 웹 전 버전 (iOS 네이티브 WebView 포함 가능). 저빈도(8시간 1건 / 1명) 지만 노이즈가 아니라 실제 사용자 영향 있음 — Session Replay 상 해당 세션 화면이 **빈 페이지 + 로딩 스피너** 상태였고, 이는 `AuthContext` 의 `getSession()` 이 거절되어 `loading` 이 안 풀리는 증상과 일치 (리플레이가 10초짜리라 "끝내 안 풀렸다"까지 단정은 불가). 절전/백그라운드 복귀나 다른 탭이 auth 락을 쥐고 있는 상황에서 재현 |
| **원인** | `@supabase/auth-js@2.91.1` 의 `navigatorLock` (`lib/locks.js:98`) 은 `acquireTimeout`(기본 10초) 경과 시 `AbortController.abort()` 로 `navigator.locks.request` 를 취소하는데, 이때 브라우저가 던지는 `DOMException(AbortError)` 을 자기 타입인 `NavigatorLockAcquireTimeoutError` 로 변환하지 않고 그대로 흘려보냄. `GoTrueClient._handleVisibilityChange` 는 리스너를 `async () => await this._onVisibilityChanged(false)` 로 등록해 **아무도 await 하지 않는 promise** 를 만들고, `_onVisibilityChanged` 에도 catch 가 없어 그대로 `unhandledrejection` 으로 탈출. 같은 에러가 `getSession()` 경로로 오면 `AuthContext` 의 `.then()` 이 실행되지 않아 `loading` 이 `true` 로 고정 (catch 없는 floating promise) |
| **해결** | - `src/lib/supabase.ts`: `createClient` 의 `auth.lock` 에 커스텀 `resilientNavigatorLock` 주입. `navigatorLock` 을 감싸 `acquireTimeout > 0 && err.name === "AbortError"` 인 경우에만 경고 로그 후 락 없이 `fn()` 실행 — auth-js 가 "LockManager 스펙 미준수 브라우저" 에서 쓰는 폴백과 동일한 처리. `navigator.locks` 부재 환경은 `lockNoOp` 과 동일하게 가드<br>- `src/contexts/AuthContext.tsx`: `getSession().then()` 에 `.catch()` 추가 — 세션 확인 실패 시에도 `loading` 을 풀어 무한 스피너 대신 로그인 화면으로 폴백, 이후 `onAuthStateChange` 가 복구 |
| **후속 조치** | - 로컬 검증 완료: 콘솔에서 해당 락(`lock:sb-<ref>-auth-token`)을 25초 점유 + `visibilitychange` 디스패치 → 10초 뒤 unhandled AbortError 없이 경고 한 줄만 출력되는 것 확인<br>- **배포 후 Sentry 이슈를 "Resolve in the next release" 로 마킹 필요.** 저빈도 이슈라 "며칠 조용함" 만으로는 판정 불가 — regression 자동 재오픈에 의존<br>- auth-js 업스트림에 AbortError → `NavigatorLockAcquireTimeoutError` 변환 및 visibilitychange 핸들러 catch 누락 이슈 보고 검토<br>- 락 없이 진행하는 폴백은 다중 탭 동시 토큰 갱신 가능성이 있음(리프레시 토큰 회전). 10초 경합 이후에만 발생하고 auth-js 자체 폴백과 동일한 수준이지만, 배포 후 로그인 풀림 관련 제보 여부 모니터링 |
| **교훈** | - **서드파티 라이브러리가 이벤트 리스너 안에서 만드는 unawaited promise 는 우리 코드에 catch 지점이 없다.** try/catch 로 감쌀 호출부 자체가 없으므로, 유일한 개입 지점은 라이브러리가 노출한 확장 포인트(여기서는 `auth.lock` 옵션)뿐<br>- **`.then()` 만 달고 `.catch()` 를 안 단 floating promise 는 로딩 상태를 영구 고착시킨다.** 에러가 Sentry 에 찍히는 것보다 "스피너가 안 풀린다"는 사용자 영향이 더 크다 — 로딩 플래그를 푸는 코드는 항상 성공/실패 양쪽 경로에 있어야 함<br>- **Sentry 의 "1 event / 1 user" 를 노이즈로 넘기면 안 되는 경우가 있다.** 이번 건은 Session Replay 를 열어보고서야 사용자가 흰 화면을 보고 있었다는 게 드러남 — 저빈도라도 replay/trace 확인이 영향 판정을 바꿈 |

관련 파일:
- `src/lib/supabase.ts` (커스텀 `lock` 주입)
- `src/contexts/AuthContext.tsx` (`getSession()` catch 추가)

---

## 2026-08-09 — 네이버 인앱 브라우저에서 `speechSynthesis` 미지원으로 `/study` ErrorBoundary (ReferenceError)

| 항목 | 내용 |
|---|---|
| **발견 경로** | Sentry 알람 이메일 (이슈 `7660016717`, alert rule `16982005`). `ReferenceError: speechSynthesis is not defined` — release `b9ce72e05057`, production 환경, 1 user / 7 events / `/study?mode=review` |
| **영향** | 네이버 앱 인앱 브라우저(User-Agent 에 `NAVER(inapp; search; 2100)` / Crosswalk 29 WebView / Android 16 / SM-S906N)로 배포 URL 을 열어 학습 페이지 진입 시 즉시 React ErrorBoundary 발동 → 흰 화면. 발음 재생 여부와 무관하게 `StudyPage` 렌더 초기 경로에서 `speakWord()` 가 호출되면서 참조 오류가 튀어 페이지 자체가 죽음. 웹 전 버전 영향, iOS 네이티브는 무관 (해당 WebView 사용 안 함) |
| **원인** | `src/lib/tts.ts` 가 `speechSynthesis` 를 3곳(`speakWord` 시작부 `cancel()`, `audio.play()` catch 폴백 내 `new SpeechSynthesisUtterance` + `speak()`, `stopSpeaking()` 의 `cancel()`)에서 존재 여부 가드 없이 참조. 대부분의 데스크톱/모바일 브라우저에는 Web Speech API 가 있지만 **네이버 인앱 브라우저(Crosswalk 기반 WebView)에는 `window.speechSynthesis` 자체가 undefined** → 첫 참조에서 `ReferenceError` |
| **해결** | `src/lib/tts.ts` 상단에 `hasSpeechSynthesis = typeof window !== "undefined" && "speechSynthesis" in window` 판정 상수 추가, 3곳 참조 모두 이 가드로 감쌈. 폴백(SpeechSynthesisUtterance) 블록 전체를 `if (!hasSpeechSynthesis) return;` 로 조기 반환. 주 경로(Google Cloud TTS via `/api/tts` → `HTMLAudioElement`) 는 변경 없음 — 네이버 인앱에서도 오디오 재생 자체는 정상 동작. 폴백만 조용히 스킵 |
| **후속 조치** | - 배포 후 Sentry 이슈 `7660016717` resolve 처리 + 신규 이벤트 발생 없는지 24h 모니터링<br>- 로컬 검증은 `hasSpeechSynthesis = false` 강제로 재현 → StudyPage 정상 렌더 확인 완료 (dev 서버는 `/api/tts` 부재로 무음이지만 ReferenceError 소멸 확인이 목적)<br>- 국내 인앱 브라우저(네이버/카카오/인스타/페이스북) 매트릭스 테스트 채널 부재 — 실기기 QA 리스트에 추가 검토 필요 |
| **교훈** | - **"모든 브라우저에 있는 웹 표준 API" 라는 가정은 국내 인앱 브라우저에서 자주 깨진다.** 네이버 인앱은 Crosswalk 기반이라 표준 window 객체 중 일부(Web Speech, WebRTC 일부, Web Share 등)가 통째로 누락. `typeof` 가드 없이 참조하면 첫 접근에서 ReferenceError 로 페이지 전체가 죽음<br>- **폴백 코드 자체가 참조 오류의 원인이 되는 안티패턴.** try/catch 로 감싸도 `SpeechSynthesisUtterance` 생성자 자체가 ReferenceError 를 던지므로 catch 도착 전에 상위로 튐 — 폴백 진입 자체를 가드해야 함<br>- Sentry alert 이 이번엔 24h 내 즉시 발동 — 이슈 발생 → 인지 → 수정 사이클이 짧아진 케이스. 알람 룰 튜닝 효과 확인됨 |

---

## 2026-07-18 — "암기완료" 상태에 절대 도달하지 못하는 판정 로직 (`recordAnswer` 누락 3서피스)

| 항목 | 내용 |
|---|---|
| **발견 경로** | 사용자 이메일 제보 (김소민 `lucypp3@naver.com`, 2026-07-10 수신 / 2026-07-18 확인). "복습퀴즈에서 안다고 표시해도, 퀴즈모드에서 두 버전 다 풀어서 맞춰도 암기완료 상태가 되는 단어가 없다"는 문의. 단어별 암기완료 임계값이 존재하는지 질문 형태로 제보 |
| **영향** | 웹 전 버전 + iOS 1.0 ~ 1.6. `progress.status === "mastered"` 로 전환되는 서피스가 사실상 2개(기본 학습 `handleNext`, SR 복습 `handleSrReviewNext`)로만 제한되어 있었고, 사용자가 "학습" 목적으로 인식하는 나머지 3개 채널(복습 모드 "안다" 버튼 / 학습 페이지 내 퀴즈 모드 / 별도 퀴즈 페이지 fill-blank·multiple-choice)은 진도에 전혀 기여하지 못함. `VocabularyPage` 의 "암기완료" 필터가 사실상 도달 불가한 상태의 필터로 존재해 온 셈 |
| **원인** | `src/hooks/useStudySession.ts` 의 `handleReviewAnswer`(라인 163), `handleQuizAnswer`(라인 205) 두 콜백이 `sessionStats` 임시 카운터만 업데이트하고 `recordAnswer()` 를 호출하지 않음. 별도 퀴즈 페이지(`src/pages/QuizPlayPage.tsx:94`) 의 `handleSelectOption` 도 결과를 `results` state 에 담아 `QuizResultPage` 로 넘기기만 하고 진도 커밋 없음. mastered 판정 조건(`correctCount >= 3 && interval >= 7`) 자체는 정상이었으나, 조건을 트리거할 입력 경로가 좁아서 도달 불가 |
| **해결** | 세 곳에 `recordAnswer(String(word.id), correct)` 추가:<br>- `useStudySession.ts:163` `handleReviewAnswer` — 자기 신고("안다") 도 정답으로 인정<br>- `useStudySession.ts:205` `handleQuizAnswer` — 채점 결과 그대로 반영<br>- `QuizPlayPage.tsx:94` `handleSelectOption` — 문항별 개별 커밋 (fill-blank / multiple-choice 두 버전 각각 카운트)<br>`QuizPlayPage` 는 `useUserDataContext` 에서 `recordAnswer` 를 새로 구조분해. 타입 체크 통과. 소급 반영 없음(과거 세션 원본 미보존) |
| **후속 조치** | - 김소민 님에게 다음 배포 이후 정상 반영 안내 회신 필요<br>- 남은 별도 이슈 2건: (a) 한 세션 안에서 같은 단어가 인터벌 사다리를 여러 번 승격돼 하루 만에 mastered 되는 문제 — `recordAnswer` 승격 로직에 "일 1회" 게이트 검토 필요, (b) 퀴즈 오답 시 이미 mastered 였던 단어가 `learning` 으로 강등되는 정책 — 사용자 관점 억울함 여부 확인 필요<br>- E2E/단위 테스트 부재로 "recordAnswer 미호출" 형태의 silent bug 를 CI 로 잡을 수 없음. mastered 전환이 실제로 트리거되는지 확인하는 회귀 시나리오 추가 검토 |
| **교훈** | - **"조건은 있는데 트리거가 없다" 형태의 silent bug 는 Sentry 로 안 잡힘.** 예외도 없고 로그도 없고, 그저 사용자 진도가 안 오를 뿐. 인지 채널은 사용자 제보뿐 — 김소민 님 제보가 없었으면 인지 시점이 훨씬 뒤로 밀렸을 가능성<br>- **입력 경로(서피스)와 상태 전이 규칙을 별도로 나열해 매트릭스로 관리**하면 이런 종류의 누락을 잡기 쉬움. 서피스 × (correct/wrong) × 상태전이 매트릭스가 문서화되어 있으면 신규 서피스 추가 시 자동으로 대응 진도 업데이트가 필요하다는 것이 드러남<br>- 앞선 `harrow` 빈칸 인플렉션 이슈(2026-05-07)와 동일 패턴 — **에러가 아니라 "기대 동작이 안 일어난다" 형태의 이슈는 사용자 제보 채널 확보가 사실상 유일한 방어선** |

관련 파일:
- `src/hooks/useStudySession.ts:163,205` (신규 `recordAnswer` 호출)
- `src/pages/QuizPlayPage.tsx:48,94` (context 구조분해 + 신규 호출)
- `src/hooks/useUserData.ts:166` (mastered 판정 조건 — 변경 없음, 참고용)

---

## 2026-06-18 — 계정 삭제 시 `user_data` / `profiles` 의 client-side DELETE 가 사일런트 no-op (RLS default-deny)

| 항목 | 내용 |
|---|---|
| **발견 경로** | `ARCHITECTURE.md` 초안 작성 중 §5 의 "RLS policies enforce per-user row access" 문장을 검증하다 발견. `AuthContext.deleteAccount()` 의 `.delete()` 호출과 `.ai/DATABASE_SCHEMA.md` RLS 매트릭스 (DELETE 정책 없음) 의 불일치를 확인하고 라이브 DB 의 `pg_policies` 를 직접 조회해 확정 |
| **영향** | 데이터 유출은 없음 (`auth.users` CASCADE 가 결국 정리). 다만 의도된 "코드 명시 삭제 + CASCADE 이중 안전망" 이 단일 경로(CASCADE만) 로 축소되어 있던 상태. `rpc("delete_user")` 가 실패하면 `user_data` 가 고아 row 로 남는 시나리오에 대한 방어막이 부재했음. iOS 1.0 ~ 1.6 + 웹 전 버전 |
| **원인** | 초기 마이그레이션(`.ai/SUPABASE_MIGRATION.md`) 작성 시 `profiles` 와 `user_data` 에 SELECT/INSERT/UPDATE 정책만 작성하고 DELETE 정책을 누락. PostgreSQL RLS 는 default-deny 이므로 정책 없는 작업은 0 rows affected 인 채 에러 없이 통과. 클라이언트 코드 (`AuthContext.tsx:312`) 는 `delete()` 가 성공한 줄 알고 다음 단계로 진행 |
| **해결** | `supabase-migration-delete-policies.sql` 생성 — `profiles` 와 `user_data` 에 `auth.uid() = id` / `auth.uid() = user_id` 술어의 DELETE 정책 추가. 클라이언트 코드는 그대로 유지 (이중 안전망 의도 복원). `.ai/SUPABASE_MIGRATION.md`, `.ai/DATABASE_SCHEMA.md` 매트릭스 동기화 |
| **후속 조치** | - ✅ 2026-06-18 `supabase-migration-delete-policies.sql` 라이브 적용 완료<br>- ✅ `pg_policies` 검증 쿼리로 4개 테이블(`custom_words`, `profiles`, `user_data`, `word_lists`) 모두 DELETE 정책 존재 확인<br>- ✅ `ARCHITECTURE.md §3.4` 에 RLS default-deny invariant 추가 |
| **교훈** | - **RLS default-deny 는 사일런트하다.** 정책 없는 CRUD 호출은 에러 없이 0 rows affected. 클라이언트 입장에서는 성공으로 보임 — 명시 정책 누락은 Sentry 도 못 잡는 부류의 silent bug<br>- **문서와 라이브 DB 의 drift 점검은 정기 작업화 가치 있음**. 이번엔 `pg_policies` 한 줄 쿼리로 발견. CI 에 마이그레이션 파일 vs `pg_policies` diff 체크를 넣는 것도 후보<br>- **코드의 모든 CRUD 경로가 대응 정책을 갖는지** 점검하는 것이 RLS 활용의 기본 위생. 새 테이블/새 작업 추가 시 정책 체크리스트 필요 |

관련 파일:
- `supabase-migration-delete-policies.sql` (신규)
- `src/contexts/AuthContext.tsx:312` (기존, 수정 없음)
- `.ai/SUPABASE_MIGRATION.md`, `.ai/DATABASE_SCHEMA.md` (문서 동기화)

---

## 2026-05-10 — SR 복습 모드 마지막 단어 답변 직후 TypeError (`undefined is not an object (evaluating 'n.word')`)

| 항목 | 내용 |
|---|---|
| **발견 경로** | Sentry Weekly Update 이메일 (2026-05-02 ~ 05-09 기간, 신규 이슈 1건 / 에러 3건). 메시지 `undefined is not an object (evaluating 'n.word')` (n 은 minified 변수) |
| **영향** | iOS 1.0 ~ 1.4 + 웹 전 버전. SR 복습 전용 모드(`/study?mode=review`)에서 단어를 답변하면 해당 단어의 `progress.nextReview` 가 미래로 push 되어 라이브 복습 목록에서 즉시 빠짐 → 다음 단어로 인덱스를 증가시킨 후 재렌더 시 `srReviewWords[srReviewIndex]` 가 undefined → `<FlashCard word={undefined} />` → `word.word` 접근에서 TypeError. 한 세션에 2개 이상 단어가 있는 경우 첫 답변 직후 무조건 재현 |
| **원인** | `src/hooks/useStudySession.ts` 의 `srReviewWords` 가 `userData.progress` 의존 `useMemo` 라서 답변마다 재계산 됨. `recordAnswer` 호출 → progress 업데이트 → 메모 재계산 → 길이 축소 → 인덱스 stale. 그런데 `handleSrReviewNext` 의 분기는 stale closure 의 길이 기준으로 `setSrReviewIndex(prev+1)` 를 호출하므로 새 길이 기준에서 인덱스가 범위를 벗어남 |
| **해결** | 세션 진입 시점의 라이브 목록을 한 번만 snapshot 해서 `srSessionWords` state 에 고정 (`useStudySession.ts:45-56`). React 권장 패턴(["Adjusting state when a prop changes"](https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes))에 따라 `prevIsReviewOnlyMode` 추적 state 와 함께 render 중 setState 로 처리. `useEffect` 안에서 setState 하는 형태는 ESLint `react-hooks/set-state-in-effect` 에 막히고 cascading render 가 발생하므로 채택 불가 |
| **후속 조치** | - 코드 수정 미커밋 상태 → 커밋 후 웹 배포 + iOS 1.5 빌드 제출 필요<br>- Sentry 통합 효용 입증된 케이스 (이전 Supabase paused 50일 인지 지연 → 이번엔 주간 리포트로 7일 내 인지)<br>- 동일 패턴(라이브 메모가 답변 사이드 이펙트로 변하는 구조)이 다른 곳에 없는지 점검 — 일반 학습/퀴즈/오답 복습은 `todaySession.wordIds` 기반이라 안전 |
| **교훈** | - **답변 sideeffect 가 의존성에 들어가는 useMemo 는 휘발성 목록**. 인덱싱 기반 UI 가 그 위에 올라가면 인덱스 OOB 가 거의 필연 — 세션 단위로 snapshot 필요<br>- **Sentry 주간 리포트 기반 운영은 7일 단위 인지 지연을 감수하는 셈**. 더 빨리 잡고 싶다면 "신규 이슈 발생 즉시 이메일" 알람 룰이 별도 활성화돼 있는지 점검해야 함 (현 상태 미확인)<br>- React 의 derived state 는 effect 가 아니라 render 중 setState 가 권장 — `react-hooks/set-state-in-effect` lint 룰이 안전망 역할 |

관련 파일: `src/hooks/useStudySession.ts:45-56`

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
