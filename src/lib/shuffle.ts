/**
 * Fisher-Yates Shuffle 알고리즘으로 배열 인덱스 셔플
 * 모듈 로드 시 한 번만 실행되어 순수성 규칙 준수
 */
export function createShuffledIndices(length: number): number[] {
  const indices = Array.from({ length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}
