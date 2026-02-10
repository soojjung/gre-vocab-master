import type { Word } from "@/types";

/** Word 배열을 CSV 문자열로 변환 */
export function wordsToCSV(words: Word[]): string {
  const header = "word,meaning";
  const rows = words.map((w) => {
    const word = w.word.includes(",") ? `"${w.word}"` : w.word;
    const meaning = w.meaning.includes(",") ? `"${w.meaning}"` : w.meaning;
    return `${word},${meaning}`;
  });
  return [header, ...rows].join("\n");
}

/** CSV 파일 다운로드 트리거 */
export function downloadCSV(words: Word[], filename: string = "words.csv") {
  const csv = wordsToCSV(words);
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
