import type { Lang, TranslationKey } from "./types";

// 지원 언어 목록. 새 언어를 추가할 때 거치는 단일 출처:
// 1) `types.ts` 의 Lang union 에 코드 추가
// 2) `locales/<code>.ts` 사전 작성 + `LanguageContext.tsx` DICTIONARIES 에 등록
// 3) 아래 배열에 항목 추가 — 마이페이지 드롭다운, 향후 LanguagePicker 등에서 자동 반영
export const SUPPORTED_LANGUAGES: ReadonlyArray<{ code: Lang; labelKey: TranslationKey }> = [
  { code: "en", labelKey: "language.english" },
  { code: "ko", labelKey: "language.korean" },
] as const;
