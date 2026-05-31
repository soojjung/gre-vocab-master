import { Mail, Copy, Check, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useT } from "@/i18n";

const EMAIL = "sojjung3@gmail.com";

export function SupportPage() {
  const navigate = useNavigate();
  const t = useT();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = EMAIL;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="h-[env(safe-area-inset-top,0px)] bg-white" />
        <div className="h-14 px-4 flex items-center">
          <button onClick={() => navigate("/")} className="p-2 -ml-2 text-gray-600">
            <ArrowLeft size={24} />
          </button>
          <h1 className="flex-1 text-center font-bold text-lg pr-8">{t("contact.title")}</h1>
        </div>
      </header>

      <div className="px-5 pt-[calc(4.5rem+env(safe-area-inset-top,0px))] pb-8 space-y-5">
        {/* 앱 정보 */}
        <div className="bg-white rounded-2xl p-6 text-center">
          <h2 className="text-xl font-bold text-gray-900">{t("common.appName")}</h2>
          <p className="text-sm text-gray-500 mt-1">{t("contact.appDesc")}</p>
        </div>

        {/* 문의하기 */}
        <div className="bg-white rounded-2xl p-6 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={28} className="text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">{t("contact.inquiryTitle")}</h2>
            <p className="text-sm text-gray-500 mt-2">
              {t("contact.inquiryDescLine1")}
              <br />
              {t("contact.inquiryDescLine2")}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">{EMAIL}</span>
              <button onClick={handleCopy} className="flex items-center gap-1 text-sm text-gray-500 active:text-black">
                {copied ? (
                  <>
                    <Check size={16} className="text-green-500" />
                    <span className="text-green-500">{t("common.copied")}</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    <span>{t("common.copy")}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <a href={`mailto:${EMAIL}`} className="block w-full py-3 bg-black text-white text-center rounded-xl font-medium">
            {t("contact.sendEmail")}
          </a>
        </div>
      </div>
    </div>
  );
}
