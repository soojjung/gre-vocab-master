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

// 전체 사용자 데이터
export interface UserData {
  targetDate: string; // ISO date string (D-day 목표일)
  dailyGoal: number; // 일일 목표 단어 수
  progress: Record<string, WordProgress>; // key: word id
  todayLearned: string[]; // 오늘 학습한 단어 id 배열
  lastStudyDate: string; // ISO date string
  streak: number; // 연속 학습일
  onboardingComplete: boolean; // 온보딩 완료 여부
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
    progress: {},
    todayLearned: [],
    lastStudyDate: "",
    streak: 0,
    onboardingComplete: false,
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
