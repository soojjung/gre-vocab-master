import type { ko } from "./locales/ko";

export type Lang = "ko" | "en";

// 사전 트리 구조를 점(.)으로 연결한 키 경로 union.
// 예: "common.next" | "language.label" 등.
type Path<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? P extends ""
      ? K
      : `${P}.${K}`
    : T[K] extends object
      ? Path<T[K], P extends "" ? K : `${P}.${K}`>
      : never;
}[keyof T & string];

export type TranslationKey = Path<typeof ko>;

// 문자열 리프(leaf)를 string 으로 넓힌 사전 타입.
// 영어 사전(en)이 한국어와 다른 문자열 값을 가질 수 있도록 literal 을 풀어줍니다.
type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringify<T[K]>;
};

export type Dictionary = DeepStringify<typeof ko>;
