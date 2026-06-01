# App Store Connect 메타데이터 (i18n)

Phase 5 — 영문판 출시를 위한 App Store Connect 입력용 문안. 사용자가 이 문서의 내용을 그대로 복사/붙여넣기 하여 App Store Connect 에 입력하는 용도.

- 마지막 갱신: 2026-06-01
- Primary Language 결정: **English (en-US)** — `.ai/I18N_PLAN.md` §2 참고
- 관련 작업: Info.plist 로컬라이즈(`ios/App/App/{en,ko}.lproj/InfoPlist.strings`)

---

## 0. 출시 전 사용자 액션 체크리스트

1. [ ] **App Store Connect → App Information → Primary Language** 현 상태 확인
   - 현재 Korean (ko) 이면 변경 가능 여부 확인. Apple 은 이미 출시된 앱의 Primary Language 변경에 제약을 둠
   - 변경이 안 되면 둘 중 하나: (a) Korean Primary 유지 + English additional localization 추가 (역방향 fallback) (b) 신규 앱 ID 로 영문판 별도 출시
2. [ ] **Xcode 에서 `.lproj` 파일을 프로젝트 빌드 대상에 추가**:
   - Xcode 열기 → `App/` 그룹 → 마우스 우클릭 → "Add Files to App..." → `en.lproj/InfoPlist.strings`, `ko.lproj/InfoPlist.strings` 선택 → Add
   - 또는 Project Navigator 에서 Info.plist 선택 → File Inspector → Localization → "+" 로 `English`, `Korean` 추가
3. [ ] **localization 추가**: App Store Connect → App → My App → (해당 버전) → + Add Localization → Korean (ko) 추가
4. [ ] 아래 문안을 한·영 각각 입력
5. [ ] 스크린샷 한·영 각각 업로드
6. [ ] Support URL 영문/한국어 모두 적절한 페이지인지 확인 (기존: `https://gre-vocab-master.vercel.app/support`)

---

## 1. App Name, Subtitle, Promotional Text

App Store Connect 제한:
- **Name**: 30자
- **Subtitle**: 30자
- **Promotional Text**: 170자 (앱 업데이트 없이 수시 변경 가능)

> **이름 정책 (1.6, 2026-06-02 결정)**: App Store 등록 이름은 SEO/검색용으로 길게 (`1500 Essential GRE` / `1,500개 GRE 필수 단어`), 부제 + 홈 화면명 + 앱 내 표시명은 브랜드명 (`GRE Vocab Master` / `단어의 신 GRE`) 으로 유지. App Store 등록 이름 후보 다수가 충돌해 SEO 친화 + 브랜드 분리 전략으로 전환.

### English (en-US)

```
Name:               1500 Essential GRE
Subtitle:           GRE Vocab Master
Promotional Text:   Quiet, distraction-free flashcards for serious GRE prep.
                    Spaced repetition built in. No ads, no clutter — just the
                    words you need to learn.
```

### Korean (ko)

```
Name:               1,500개 GRE 필수 단어
Subtitle:           단어의 신 GRE
Promotional Text:   집중에 방해되지 않는 깔끔한 GRE 단어 암기 앱. 간격 반복 학습으로
                    효율적으로 외우고, 광고 없이 단어 학습에만 집중하세요.
```

---

## 2. Keywords (100자 제한, 쉼표 구분)

### English (en-US)

```
GRE,vocabulary,flashcards,test prep,SAT,TOEFL,GMAT,verbal,spaced repetition,grad school
```

### Korean (ko)

```
GRE,GRE단어,영단어,단어암기,플래시카드,간격반복,유학,대학원,영어공부,토플
```

---

## 3. Description (4,000자 제한)

### English (en-US)

```
Master 1,500 essential GRE words with focused, distraction-free flashcards.

GRE Vocab Master is a clean, minimal study app for serious GRE test takers. No clutter, no gimmicks — just the words you need to memorize, with smart spaced repetition built in.

FEATURES
• 1,500 high-frequency GRE words drawn from trusted sources (Manhattan Prep, Target Test Prep)
• Spaced repetition: words you miss come back sooner, words you know come back later
• Two quiz modes: fill-in-the-blank and multiple choice
• Audio pronunciation for every word
• Bookmark tricky words for focused review
• Progress tracking by mastery and difficulty level
• Daily streak counter to keep your momentum
• Works offline once installed

DESIGNED FOR FOCUSED STUDY
Whether you're aiming for a top verbal score or building vocabulary for graduate school, this app stays out of your way. A minimal black-and-white interface, fast loading, and a single goal: help you actually learn the words.

NO ADS, NO TRACKING
Your study data syncs across your devices via secure cloud storage. We don't sell your data and we don't show ads. You can delete your account and all data at any time from My Page.

LANGUAGES
The app is available in English and Korean. Choose your language on first launch or switch anytime from My Page.

Built by Sooya, a graduate-school applicant who wanted a quieter way to study.
```

### Korean (ko)

```
1,500개 GRE 필수 단어를 깔끔하고 집중력 있게 학습할 수 있는 플래시카드 앱.

단어의 신 GRE 는 GRE 시험 준비에 필요한 핵심만 담은 미니멀 학습 앱입니다. 화려한 광고도, 산만한 UI 도 없이 — 외워야 할 단어와 효율적인 간격 반복 학습 알고리즘만 있습니다.

주요 기능
• 1,500개 GRE 빈출 단어 (Manhattan Prep, Target Test Prep 기반)
• 간격 반복 학습: 틀린 단어는 자주, 맞은 단어는 점점 길게 복습
• 두 가지 퀴즈 모드: 빈칸 채우기 / 객관식
• 모든 단어 영어 발음 듣기
• 헷갈리는 단어는 북마크 후 집중 복습
• 암기 상태 / 난이도별 진도율 통계
• 매일 연속 학습일(스트릭) 표시
• 오프라인 학습 지원

집중을 위한 디자인
높은 GRE Verbal 점수를 목표로 하든, 미국 대학원 진학을 위한 영단어 기반을 만들고 싶든 — 이 앱은 방해 없이 학습에만 몰입할 수 있도록 설계되었습니다. 깔끔한 흑백 미니멀 인터페이스, 빠른 로딩, 그리고 단 하나의 목표: "단어를 진짜로 외우게 한다".

광고 없음, 추적 없음
학습 데이터는 안전한 클라우드에 자동 동기화되어 다른 기기에서도 이어집니다. 데이터를 판매하지 않으며 광고도 없습니다. 회원탈퇴 시 모든 데이터는 즉시 완전 삭제됩니다 (마이페이지 → 고객센터).

지원 언어
한국어 / English 지원. 첫 진입 시 선택하고, 이후 마이페이지에서 언제든 변경할 수 있습니다.

대학원 진학을 준비하는 한 사용자가, 더 조용히 공부하고 싶어서 만든 앱입니다. — 수야 드림.
```

---

## 4. What's New (4,000자 제한)

> 한·영 모두 작성. 이 버전의 핵심 변경 사항.

### English (en-US)

```
This release adds full English support.

• Choose your language on first launch
• Switch between English and Korean anytime from My Page
• All screens, prompts, and error messages are now localized
• English app name "GRE Vocab Master" for non-Korean users
```

### Korean (ko)

```
영어 지원이 추가되었습니다.

• 첫 실행 시 언어 선택 화면 노출
• 마이페이지에서 한국어 ↔ English 언제든 전환 가능
• 모든 화면, 안내문, 에러 메시지가 다국어로 표시됩니다
```

---

## 5. App Review Information

기존 `.ai/APP_STORE_REVIEW.md` 의 Account Deletion 안내를 보강해 영문 버전 추가:

```
Account Deletion (English app users):
1. Sign in to the app
2. Tap the profile icon in the top-right (opens My Page)
3. Tap "Support"
4. Scroll down and tap "Delete account" at the bottom

Account Deletion (Korean app users):
1. 로그인
2. 우측 상단 프로필 아이콘 → 마이페이지
3. "고객센터"
4. 하단 "회원탈퇴"

This permanently deletes the user account and all associated data.

Languages: The app supports English and Korean. On first launch the user
selects a language; this can be changed anytime from My Page (Settings →
Language). The reviewer can also test the app in either language by
launching the app, going to My Page, and using the language selector
in the Study Settings section.
```

---

## 6. URLs

- **Support URL (en)**: `https://gre-vocab-master.vercel.app/support` (영문 모드로 자동 노출 — `Accept-Language` 또는 사용자 첫 진입 선택)
- **Support URL (ko)**: 동일 URL — 앱이 첫 진입에서 언어 선택을 처리
- **Privacy Policy URL**: `https://gre-vocab-master.vercel.app/privacy-policy` (영문/한국어 모두 in-app 페이지로 i18n 처리됨, 정적 `public/privacy-policy.html` 은 한국어 fallback 만 보유 — 영문 정책이 필요하면 별도 정적 페이지 추가 필요)

---

## 7. 스크린샷 가이드

App Store Connect 에 필수 디바이스 사이즈(6.7" iPhone, 6.5" iPhone 등)별로 한·영 각각 업로드.

촬영 권장 화면:
1. Login (Apple / Google / Kakao 로그인 버튼 노출)
2. Onboarding step 1 (시험일 선택)
3. Home (D-day + 오늘 학습 + SR 복습)
4. Study (FlashCard 뜻 공개 상태)
5. Quiz Select
6. Stats (전체 진도율 + 난이도별)
7. My Page (언어 토글 노출)

영어 모드 캡처: 마이페이지 → 언어 → English 선택 후 캡처
한국어 모드 캡처: 한국어 선택 후 캡처

---

## 8. 참고 — 이미 처리된 항목

- [x] `ios/App/App/Info.plist`: `CFBundleLocalizations = [en, ko]` 추가, `CFBundleDisplayName = "GRE Vocab Master"` 로 설정 (fallback)
- [x] `ios/App/App/en.lproj/InfoPlist.strings`: `CFBundleDisplayName = "GRE Vocab Master"`
- [x] `ios/App/App/ko.lproj/InfoPlist.strings`: `CFBundleDisplayName = "단어의 신 GRE"`
- [x] `index.html`: head 인라인 스크립트로 부팅 언어 결정 (FOIT 방지)
- [x] LanguageProvider: 언어 변경 시 `document.title` 갱신
- [x] In-app Privacy Policy: ko/en 양쪽 i18n 완료 (단, 영문은 법률 검토 권장)
