/**
 * 로컬 시간 기준 날짜 유틸리티
 * toISOString()은 UTC 기준이라 한국에서 오전 9시 전에는 전날로 계산됨
 * 이 함수들은 사용자의 로컬 시간대를 기준으로 날짜를 계산함
 */

/**
 * 로컬 시간 기준으로 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환 (로컬 시간 기준)
 */
export function getTodayString(): string {
  return getLocalDateString(new Date());
}

/**
 * 리셋 시간을 고려한 "오늘" 날짜를 반환
 * 예: resetHour가 3이면, 새벽 3시 전까지는 어제 날짜로 계산
 */
export function getTodayStringWithResetHour(resetHour: number): string {
  const now = new Date();
  const currentHour = now.getHours();

  // 현재 시간이 리셋 시간보다 이전이면 어제 날짜 반환
  if (currentHour < resetHour) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return getLocalDateString(yesterday);
  }

  return getLocalDateString(now);
}

/**
 * 오늘로부터 N일 후의 날짜를 YYYY-MM-DD 형식으로 반환 (로컬 시간 기준)
 */
export function getDateAfterDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return getLocalDateString(date);
}

/**
 * 어제 날짜를 YYYY-MM-DD 형식으로 반환 (로컬 시간 기준)
 */
export function getYesterdayString(): string {
  return getDateAfterDays(-1);
}

/**
 * 리셋 시간을 고려한 "어제" 날짜를 반환
 */
export function getYesterdayStringWithResetHour(resetHour: number): string {
  const todayWithReset = getTodayStringWithResetHour(resetHour);
  const todayDate = new Date(todayWithReset);
  todayDate.setDate(todayDate.getDate() - 1);
  return getLocalDateString(todayDate);
}
