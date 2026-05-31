import { useNavigate } from "react-router-dom";
import { Mail, Copy, Check } from "lucide-react";
import { useState } from "react";
import { BackHeader } from "@/components/BackHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useT } from "@/i18n";

const EMAIL = "sojjung3@gmail.com";

export function ContactPage() {
  const navigate = useNavigate();
  const t = useT();
  const { deleteAccount } = useAuth();
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const handleDeleteAccount = async () => {
    if (window.confirm(t("contact.deleteAccountConfirmPrompt"))) {
      try {
        setDeleting(true);
        await deleteAccount();
      } catch {
        setDeleting(false);
        alert(t("contact.deleteAccountFailure"));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <BackHeader title={t("contact.title")} onBack={() => navigate("/mypage")} />

      <div className="px-5 pt-[calc(4.5rem+env(safe-area-inset-top,0px))] pb-8 space-y-5">
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
        </div>

        {/* 회원탈퇴 */}
        <div className="bg-white rounded-2xl p-6 space-y-4">
          <h2 className="font-bold text-gray-900">{t("contact.deleteAccountTitle")}</h2>
          <p className="text-sm text-gray-500">{t("contact.deleteAccountDesc")}</p>
          <button disabled={deleting} onClick={handleDeleteAccount} className="text-sm text-red-500 underline disabled:opacity-50">
            {deleting ? t("contact.deleteAccountProcessing") : t("contact.deleteAccountButton")}
          </button>
        </div>
      </div>
    </div>
  );
}
