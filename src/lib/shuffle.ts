/**
 * 날짜 기반 시드 생성
 * 같은 날짜면 항상 같은 시드 반환
 */
function getDateSeed(dateString: string): number {
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * 시드 기반 의사 난수 생성기 (Mulberry32)
 */
function seededRandom(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fisher-Yates Shuffle 알고리즘으로 배열 인덱스 셔플
 * 날짜 기반 시드 사용 - 같은 날에는 항상 같은 순서 보장
 */
export function createShuffledIndices(length: number, dateString?: string): number[] {
  const indices = Array.from({ length }, (_, i) => i);

  // 날짜가 제공되면 시드 기반 랜덤, 아니면 일반 랜덤
  const random = dateString ? seededRandom(getDateSeed(dateString)) : Math.random;

  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    // i, j 는 indices.length 범위 내이므로 항상 정의됨 — noUncheckedIndexedAccess 만족용 단언.
    [indices[i], indices[j]] = [indices[j]!, indices[i]!];
  }
  return indices;
}
