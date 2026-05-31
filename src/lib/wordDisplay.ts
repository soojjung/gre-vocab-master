import type { Lang } from "@/i18n";
import type { Word } from "@/types";

// 현재 언어에 맞는 단어 뜻을 반환. 영어 모드에서 meaningEn 없으면 meaning(한국어) 으로 fallback.
export function getMeaning(word: Word, lang: Lang): string {
  if (lang === "ko") return word.meaning;
  return word.meaningEn ?? word.meaning;
}

// 영어 예문의 한국어 번역(exampleKo) 을 보여줄지 여부. 한국어 모드에서만 노출.
export function shouldShowExampleKo(lang: Lang): boolean {
  return lang === "ko";
}
