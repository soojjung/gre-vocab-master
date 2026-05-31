/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { ko } from "./locales/ko";
import { en } from "./locales/en";
import type { Dictionary, Lang, TranslationKey } from "./types";

const STORAGE_KEY = "app.lang";

const DICTIONARIES: Record<Lang, Dictionary> = { ko, en };

type TranslationVars = Record<string, string | number>;

interface LanguageContextValue {
  lang: Lang;
  // true 면 사용자가 한 번 이상 명시적으로 언어를 확정한 적이 있음(localStorage 에 app.lang 이 존재).
  // false 면 초기 진입 → LanguagePicker 노출 대상.
  confirmed: boolean;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey, vars?: TranslationVars) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

// 최초 진입 언어 결정: localStorage > navigator.language(ko* 면 ko, 아니면 en).
// 로그인 후 Supabase user_data.locale 과의 동기화는 Phase 4 에서 연결.
function detectInitialLang(): Lang {
  if (typeof window === "undefined") return "en";

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "ko" || saved === "en") return saved;

  const nav = window.navigator.language || window.navigator.languages?.[0] || "";
  return nav.toLowerCase().startsWith("ko") ? "ko" : "en";
}

function lookup(dict: Dictionary, key: string): string {
  const value = key.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, dict);

  if (typeof value === "string") return value;

  // 키가 없으면 키 자체를 반환(디버그에 유리). 사전 누락은 개발 모드에서만 경고.
  if (import.meta.env.DEV) {
    console.warn(`[i18n] Missing translation for key: ${key}`);
  }
  return key;
}

// "{name}" 형태의 변수를 치환. 예) interpolate("{count}개", { count: 3 }) → "3개"
function interpolate(template: string, vars: TranslationVars): string {
  return template.replace(/\{(\w+)\}/g, (_, name: string) => {
    const value = vars[name];
    return value === undefined ? `{${name}}` : String(value);
  });
}

interface LanguageProviderProps {
  children: ReactNode;
}

function detectInitialConfirmed(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) !== null;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [lang, setLangState] = useState<Lang>(detectInitialLang);
  const [confirmed, setConfirmed] = useState<boolean>(detectInitialConfirmed);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      // 브라우저 탭 / PWA / 공유 시 노출되는 제목을 언어에 맞춰 갱신.
      // 초기 SEO 메타(static title) 는 index.html 그대로 두고, 런타임만 갱신.
      document.title = lang === "ko" ? "단어의 신 GRE - 한국인을 위한 GRE 단어 암기 앱" : "GRE Vocab Master - GRE Flashcards";
    }
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    setConfirmed(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: TranslationVars): string => {
      const raw = lookup(DICTIONARIES[lang], key);
      return vars ? interpolate(raw, vars) : raw;
    },
    [lang]
  );

  return <LanguageContext.Provider value={{ lang, confirmed, setLang, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}

export function useT(): (key: TranslationKey, vars?: TranslationVars) => string {
  return useLanguage().t;
}
