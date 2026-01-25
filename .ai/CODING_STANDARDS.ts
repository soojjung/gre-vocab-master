/**
 * GRE Vocabulary App - Coding Standards
 *
 * 이 파일은 프로젝트의 코딩 컨벤션을 정의합니다.
 * Claude/Copilot 등 AI 도구는 이 표준을 참조하여 코드를 생성해야 합니다.
 */

// =============================================================================
// 1. 기술 스택
// =============================================================================

export const TECH_STACK = {
  runtime: "Node 20 LTS",
  framework: "React 19",
  bundler: "Vite 7",
  language: "TypeScript 5.9 (strict mode)",
  styling: "Tailwind CSS 4",
  backend: "Firebase (Auth, Firestore)",
  linting: "ESLint 9 + typescript-eslint",
  formatting: "Prettier",
} as const;

// =============================================================================
// 2. 파일/폴더 구조
// =============================================================================

export const FOLDER_STRUCTURE = {
  "src/pages/": "페이지 컴포넌트 (라우트별)",
  "src/components/": "재사용 가능한 UI 컴포넌트",
  "src/hooks/": "커스텀 React 훅",
  "src/contexts/": "React Context 정의",
  "src/lib/": "외부 서비스 설정 (Firebase 등)",
  "src/data/": "정적 데이터 (단어 목록 등)",
  "src/types.ts": "공통 타입 정의",
} as const;

// =============================================================================
// 3. 네이밍 컨벤션
// =============================================================================

// 파일명
// - 컴포넌트: PascalCase.tsx (예: BackHeader.tsx, Home.tsx)
// - 훅: camelCase.ts (예: useUserData.ts)
// - 유틸/설정: camelCase.ts (예: firebase.ts)

// 변수/함수명
// - 변수: camelCase (예: userData, isLoading)
// - 함수: camelCase (예: getTodayString, handleClick)
// - 컴포넌트: PascalCase (예: BackHeader, AuthProvider)
// - 상수: SCREAMING_SNAKE_CASE (예: SR_INTERVALS, LOCAL_STORAGE_KEY)
// - 타입/인터페이스: PascalCase (예: UserData, WordProgress)

// Props 인터페이스: 컴포넌트명 + Props
// interface BackHeaderProps {
//   title: string;
//   onBack: () => void;
//   rightElement?: React.ReactNode;
// }

// =============================================================================
// 4. 컴포넌트 패턴
// =============================================================================

// 함수 선언문 + named export 사용 (export default 지양)
// export function ExampleComponent({ title, onAction }: ExampleComponentProps) {
//   // 1. hooks
//   // 2. state
//   // 3. derived values
//   // 4. effects
//   // 5. handlers
//   // 6. render
//
//   return (
//     <div className="p-4">
//       <h1>{title}</h1>
//       <button onClick={onAction}>Action</button>
//     </div>
//   );
// }

// =============================================================================
// 5. 훅 패턴
// =============================================================================

// 커스텀 훅은 use 접두사 사용
// 반환값은 객체 형태로 명시적 네이밍
export function useExampleHook() {
  // const [state, setState] = useState<Type>(initialValue);
  // const memoizedCallback = useCallback(() => {}, [deps]);
  // const memoizedValue = useMemo(() => computeValue(), [deps]);

  return {
    // 명시적 이름으로 반환
    // data,
    // loading,
    // error,
    // actions
  };
}

// =============================================================================
// 6. 타입 정의
// =============================================================================

// interface 우선 사용 (확장 가능성)
export interface Word {
  id: number;
  word: string;
  meaning: string;
  example: string;
  exampleKo: string;
  difficulty: number;
}

// Union 타입은 string literal 사용
export type WordStatus = "new" | "learning" | "mastered";

// Record 타입 활용
export type ProgressMap = Record<string, { status: WordStatus }>;

// =============================================================================
// 7. import 순서
// =============================================================================

// 1. React/React hooks
// import { useState, useEffect, useCallback } from "react";

// 2. 외부 라이브러리
// import { doc, setDoc } from "firebase/firestore";

// 3. 내부 모듈 (절대 경로 또는 상대 경로)
// import { db } from "../lib/firebase";

// 4. 타입 (type import 사용)
// import type { UserData } from "../types";

// =============================================================================
// 8. 스타일링 (Tailwind CSS)
// =============================================================================

// 인라인 className 사용
// 긴 클래스는 줄바꿈으로 가독성 확보
// 예시:
//   <div className="bg-white px-5 py-4 flex items-center justify-between border-b border-gray-100">
//
// 반복되는 스타일은 변수로 추출
//   const buttonStyle = "px-4 py-2 rounded-lg font-medium";

// =============================================================================
// 9. 주석 규칙
// =============================================================================

// 한글 주석 허용 (프로젝트 특성상)
// 복잡한 로직에만 주석 추가
// JSDoc은 공개 API/유틸 함수에만 사용

// =============================================================================
// 10. 에러 처리
// =============================================================================

// try-catch로 에러 처리
// 에러 로깅 시 한글 메시지 사용
// 예시:
//   async function someFunction() {
//     try {
//       await someAsyncOperation();
//     } catch (error) {
//       console.error("작업 실패:", error);
//       throw error;
//     }
//   }

// =============================================================================
// 11. TypeScript 설정 요약
// =============================================================================

export const TS_CONFIG_HIGHLIGHTS = {
  target: "ES2022",
  strict: true,
  noUnusedLocals: true,
  noUnusedParameters: true,
  verbatimModuleSyntax: true, // type import 강제
} as const;

// =============================================================================
// 12. 금지 사항
// =============================================================================

// - any 타입 사용 금지 (불가피한 경우 주석으로 사유 명시)
// - export default 지양 (named export 사용)
// - 인라인 스타일 지양 (Tailwind 사용)
// - console.log 배포 코드에 남기지 않기 (error 제외)
// - 사용하지 않는 import/변수 남기지 않기

// =============================================================================
// 13. 권장 사항
// =============================================================================

// - 컴포넌트는 단일 책임 원칙 준수
// - 비즈니스 로직은 커스텀 훅으로 분리
// - 상태 공유는 Context API 활용
// - 날짜는 ISO 문자열로 저장 (YYYY-MM-DD)
// - 비동기 상태는 loading, error 상태 함께 관리

// =============================================================================
// 14. React 패턴
// =============================================================================

// 가드 클로즈(early return) 선호, 깊은 중첩 지양
// 예시:
//   function Component({ data }: Props) {
//     if (!data) return <Loading />;
//     if (data.error) return <Error />;
//     return <Content data={data} />;
//   }

// 불필요한 try/catch 금지 (의미 있는 처리 시에만)
// - 에러를 무시하는 빈 catch 금지
// - 상위로 전파할 거면 try/catch 불필요

// 상태/부수효과 최소화, 의존성 배열 엄격 관리
// - 파생 가능한 값은 useMemo로 계산
// - useEffect 의존성 배열 빠짐없이 작성

// 조건부 렌더링/로딩 상태는 명확히 표현
// 예시:
//   {isLoading && <Spinner />}
//   {!isLoading && data && <Content />}
//   {!isLoading && !data && <Empty />}

// pages 폴더에는 단독적인 URL이 존재하는 컴포넌트만 배치
// - /study → StudyPage.tsx
// - /quiz → QuizSelectPage.tsx
// - /quiz/play → QuizPlayPage.tsx

// components와 utils를 먼저 확인하고 재사용할 수 있는 코드는 재사용하기
// - 새 컴포넌트/함수 작성 전 기존 코드 검토 필수

// import할 때는 최대한 절대 경로('@') 사용
// 예시:
//   import { useAuth } from "@/contexts/AuthContext";
//   import { BackHeader } from "@/components/BackHeader";
//   import type { Word } from "@/types";

// useEffect 사용 시 정리(cleanup) 함수 추가
// 예시:
//   useEffect(() => {
//     const unsubscribe = onSnapshot(docRef, callback);
//     return () => unsubscribe(); // cleanup
//   }, [docRef]);
//
//   useEffect(() => {
//     window.addEventListener("resize", handler);
//     return () => window.removeEventListener("resize", handler);
//   }, []);

// =============================================================================
// 15. 유틸 함수
// =============================================================================

// 2개 이상의 컴포넌트에서 사용되는 로직은 src/utils/에 공통 함수로 분리
// 예시:
//   // src/utils/date.ts
//   export function getTodayString(): string {
//     return new Date().toISOString().split("T")[0];
//   }

// 유틸 함수는 단일 책임 원칙을 따르며, 명확한 JSDoc 주석 작성
// 예시:
//   /**
//    * 배열을 랜덤하게 섞습니다 (Fisher-Yates 알고리즘)
//    * @param array - 섞을 배열
//    * @returns 섞인 새 배열 (원본 불변)
//    */
//   export function shuffleArray<T>(array: T[]): T[] {
//     const shuffled = [...array];
//     for (let i = shuffled.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));
//       [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
//     }
//     return shuffled;
//   }

// src/utils/index.ts에서 export하여 @/utils로 간편하게 import
// 예시:
//   // src/utils/index.ts
//   export * from "./date";
//   export * from "./array";
//   export * from "./format";
//
//   // 사용처
//   import { getTodayString, shuffleArray } from "@/utils";

// =============================================================================
// 16. 공통 컴포넌트
// =============================================================================

// 공통 컴포넌트로 사용할 만한 컴포넌트 만들기 전에
// @/components/common 폴더를 먼저 확인하여 재사용할 컴포넌트가 있는지 검토
//
// 체크리스트:
// - Button, IconButton 등 버튼 컴포넌트
// - Modal, Dialog 등 오버레이 컴포넌트
// - Input, Select 등 폼 컴포넌트
// - Card, Container 등 레이아웃 컴포넌트
// - Spinner, Skeleton 등 로딩 컴포넌트
//
// 새 공통 컴포넌트 작성 시 가이드:
// - Props는 최소화하되 확장 가능하게 설계
// - children, className은 기본적으로 받을 수 있게
// - 예시:
//   interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
//     variant?: "primary" | "secondary" | "ghost";
//     size?: "sm" | "md" | "lg";
//     isLoading?: boolean;
//   }

// =============================================================================
// 17. Git 컨벤션
// =============================================================================

// 커밋(commit)과 푸쉬(push)는 사용자가 명시적으로 요청할 때만 수행
// - 코드 수정 완료 후 자동으로 커밋하지 않음
// - 커밋 후 자동으로 푸쉬하지 않음
// - "커밋해줘", "푸쉬해줘" 등 명확한 요청이 있을 때만 실행
//
// 커밋 메시지 작성 규칙:
// - 한글 또는 영어로 작성 가능
// - 간결하고 명확하게 변경 사항 설명
// - 예시: "fix: 로그인 무한 로딩 버그 수정", "feat: 복습 모드 추가"
