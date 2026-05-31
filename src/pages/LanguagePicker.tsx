import { useState } from "react";
import { useLanguage } from "@/i18n";
import type { Lang } from "@/i18n";

// 첫 진입 시 1회만 노출되는 언어 선택 화면.
// 사용자가 명시적으로 확정해야 진입 가능 — confirmed = false 동안 App 의 다른 라우트는 마운트되지 않음.
// 제목/부제는 사용자가 어느 언어를 선호할지 모르므로 한·영 모두 표기.
export function LanguagePicker() {
  const { lang, setLang } = useLanguage();
  const [selected, setSelected] = useState<Lang>(lang);

  const handleConfirm = () => {
    setLang(selected);
  };

  return (
    <main className="min-h-dvh bg-white px-5 flex flex-col pt-[calc(4rem+env(safe-area-inset-top,0px))] pb-[calc(2rem+env(safe-area-inset-bottom,0px))]">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-2xl font-bold">G</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">Choose your language</h1>
      </div>

      <div className="space-y-3 flex-1">
        <button
          onClick={() => setSelected("en")}
          aria-pressed={selected === "en"}
          className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${selected === "en" ? "border-black bg-gray-50" : "border-gray-200 bg-white"}`}
        >
          <div className="font-medium text-gray-900 text-lg">English</div>
          <div className="text-sm text-gray-500 mt-1">영어</div>
        </button>

        <button
          onClick={() => setSelected("ko")}
          aria-pressed={selected === "ko"}
          className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${selected === "ko" ? "border-black bg-gray-50" : "border-gray-200 bg-white"}`}
        >
          <div className="font-medium text-gray-900 text-lg">한국어</div>
          <div className="text-sm text-gray-500 mt-1">Korean</div>
        </button>
      </div>

      <button onClick={handleConfirm} className="w-full bg-black text-white py-4 rounded-xl font-medium text-lg mt-8 active:bg-gray-800">
        Continue
      </button>
    </main>
  );
}
