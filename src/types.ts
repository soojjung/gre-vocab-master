// 단어 데이터 타입
export interface Word {
  id: number;
  word: string;
  meaning: string;
  example: string;
  exampleKo: string;
  difficulty: number;
}

// 단어별 학습 진도
export interface WordProgress {
  status: "new" | "learning" | "mastered";
  correctCount: number;
  wrongCount: number;
  nextReview: string; // ISO date string
  interval: number; // days
  bookmarked: boolean;
  lastStudied?: string; // ISO date string
}

// 오늘의 학습 세션
export interface TodaySession {
  date: string; // ISO date string
  wordIds: number[]; // 오늘 학습할 단어 ID 목록
  currentIndex: number; // 현재 진행 위치
  completed: boolean; // 세션 완료 여부
}

// 전체 사용자 데이터
export interface UserData {
  targetDate: string; // ISO date string (D-day 목표일)
  dailyGoal: number; // 일일 목표 단어 수
  resetHour: number; // 학습 리셋 시간 (0-23, 기본값 3 = 새벽 3시)
  progress: Record<string, WordProgress>; // key: word id
  todayLearned: string[]; // 오늘 학습한 단어 id 배열
  lastStudyDate: string; // ISO date string
  streak: number; // 연속 학습일
  onboardingComplete: boolean; // 온보딩 완료 여부
  autoSpeak: boolean; // 자동 발음 재생 여부
  locale: "ko" | "en"; // UI 언어 설정 (기기 간 동기화용)
  todaySession?: TodaySession; // 오늘의 학습 세션
}

// 기본 사용자 데이터
export const getDefaultUserData = (): UserData => {
  // 로컬 시간 기준으로 60일 후 날짜 계산
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 60);
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, "0");
  const day = String(targetDate.getDate()).padStart(2, "0");

  return {
    targetDate: `${year}-${month}-${day}`,
    dailyGoal: 25,
    resetHour: 3, // 기본값: 새벽 3시
    progress: {},
    todayLearned: [],
    lastStudyDate: "",
    streak: 0,
    onboardingComplete: false,
    autoSpeak: true,
    locale: "en", // 기본값. 실제 진입 언어는 LanguageProvider 가 localStorage/navigator 기반으로 결정
  };
};

// Spaced Repetition 간격 (일)
export const SR_INTERVALS = [1, 2, 4, 7, 14, 30];

// 퀴즈 타입
export type QuizType = "fill-blank" | "multiple-choice";

// 퀴즈 결과
export interface QuizResult {
  word: Word;
  selectedIndex: number;
  correctIndex: number;
  isCorrect: boolean;
}
