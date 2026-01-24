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
