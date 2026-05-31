import { useEffect } from "react";
import { useUserDataContext } from "@/contexts/UserDataContext";
import { useLanguage } from "./LanguageContext";

// LanguageProvider(localStorage 기반) ↔ Supabase user_data.locale 동기화.
// 정책: localStorage(=현재 lang) 가 항상 우선. userData.locale 이 다르면 Supabase 로 푸시.
// AuthenticatedApp 내부, UserDataProvider 아래에 마운트 — UserDataContext 와 LanguageContext 모두 필요.
export function LocaleSync() {
  const { lang } = useLanguage();
  const { userData, loading, updateSettings } = useUserDataContext();

  useEffect(() => {
    if (loading) return;
    if (userData.locale !== lang) {
      updateSettings({ locale: lang });
    }
  }, [lang, userData.locale, loading, updateSettings]);

  return null;
}
