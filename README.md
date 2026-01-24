# 단어의 신 GRE (GRE Vocab Master)

GRE 시험 대비 단어 암기 PWA 플래시카드 앱입니다. Manhattan Prep과 Target Test Prep 기반의 **1,689개 필수 단어**를 Spaced Repetition(간격 반복) 학습법으로 효과적으로 암기할 수 있습니다.

## 이런 분들께 추천합니다

- **GRE 시험 준비생**: D-day 카운트다운과 함께 체계적으로 단어를 학습하세요
- **영어 어휘력 향상을 원하는 분**: 고급 영어 단어를 예문과 함께 학습할 수 있습니다
- **짧은 시간에 효율적으로 공부하고 싶은 분**: 출퇴근길, 자투리 시간에 모바일로 학습하세요

## 학습 활용 가이드

### 1. 매일 꾸준히 학습하기

- 일일 목표(기본 25개)를 설정하고 홈 화면에서 "오늘의 학습 시작"을 눌러주세요
- 플래시카드 형태로 단어를 보고, 뜻을 떠올린 후 카드를 뒤집어 확인합니다
- "알아요/몰라요"를 선택하면 Spaced Repetition에 따라 복습 주기가 조절됩니다
- 자동 발음 기능을 켜면 단어가 나타날 때 영어 발음이 자동 재생됩니다
- 새 단어는 매번 랜덤 순서로 제시되어 위치 기억에 의존하지 않고 학습할 수 있습니다

### 2. 퀴즈로 실력 점검하기

- **빈칸 채우기**: 예문 속 빈칸에 들어갈 단어를 맞춰보세요
- **객관식**: 한글 뜻을 보고 해당하는 영어 단어를 선택하세요
- 10/20/50문제 중 선택하여 자신의 암기 수준을 확인할 수 있습니다

### 3. 단어장에서 복습하기

- 검색 기능으로 특정 단어를 빠르게 찾아보세요
- 필터(전체/학습중/암기완료/북마크)로 원하는 단어만 모아볼 수 있습니다
- 자주 틀리는 단어는 북마크해두고 집중 복습하세요

### 4. 통계로 진도 확인하기

- 전체 진도율과 일별 학습량을 확인하세요
- 연속 학습일(Streak)을 유지하며 동기부여를 얻으세요

## 주요 기능

| 기능              | 설명                                      |
| ----------------- | ----------------------------------------- |
| 플래시카드 학습   | 영어 단어 → 한글 뜻 + 예문 확인           |
| 자동 발음         | Web Speech API로 영어 단어 발음 재생      |
| Spaced Repetition | 틀린 단어는 자주, 맞은 단어는 간격 늘려서 |
| 랜덤 학습 순서    | 새 단어를 랜덤으로 섞어 학습 효과 향상    |
| 퀴즈 모드         | 빈칸 채우기, 객관식 퀴즈                  |
| 단어장            | 검색, 필터, 북마크 기능                   |
| 통계              | 진도율, 일별 학습량, 취약 단어 분석       |
| D-day             | 목표 시험일까지 남은 일수 표시            |
| PWA               | 오프라인 지원, 홈 화면 설치 가능          |

## 기술 스택

### Frontend

- **React 19** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite 7** - 빌드 도구
- **Tailwind CSS 4** - 스타일링
- **React Router DOM** - 라우팅

### Backend & Auth

- **Firebase** - 사용자 인증 및 데이터 저장

### UI/UX

- **Lucide React** - 아이콘
- **Sonner** - Toast 알림

### PWA

- **vite-plugin-pwa** - Progressive Web App 지원

## 시작하기

### 사전 요구사항

- Node.js 18 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 저장소 클론
git clone <repository-url>
cd GRE

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속하세요.

### 빌드

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과물 미리보기
npm run preview
```

### 기타 스크립트

```bash
# 린트 검사
npm run lint

# 린트 자동 수정
npm run lint:fix

# 코드 포맷팅
npm run format

# 포맷 검사
npm run format:check

# 린트 + 포맷 한번에
npm run fix
```

## 프로젝트 구조

```
src/
├── components/      # 재사용 가능한 컴포넌트
├── contexts/        # React Context (Auth, Quiz)
├── data/           # 단어 데이터 (1,689개)
├── hooks/          # 커스텀 훅
├── lib/            # Firebase 설정, 날짜 유틸리티
├── pages/          # 페이지 컴포넌트
└── types.ts        # TypeScript 타입 정의
```

## 라이선스

이 프로젝트는 개인 학습 목적으로 제작되었습니다.

단어 데이터 출처:

- [Manhattan Prep 1000 GRE Words](https://www.manhattanprep.com/gre/)
- [Target Test Prep GRE Vocabulary](https://gre.blog.targettestprep.com/gre-vocabulary/)
