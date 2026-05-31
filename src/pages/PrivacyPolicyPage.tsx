import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useT } from "@/i18n";

export function PrivacyPolicyPage() {
  const navigate = useNavigate();
  const t = useT();

  return (
    <div className="min-h-screen bg-white relative">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="h-[env(safe-area-inset-top,0px)] bg-white" />
        <div className="h-14 px-4 flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600" aria-label={t("privacy.backAria")}>
            <ArrowLeft size={24} />
          </button>
          <h1 className="flex-1 text-center font-bold text-lg pr-8">{t("privacy.title")}</h1>
        </div>
      </header>

      <article className="max-w-2xl mx-auto px-5 pt-[calc(4.5rem+env(safe-area-inset-top,0px))] pb-[calc(3rem+env(safe-area-inset-bottom,0px))] text-gray-800 leading-relaxed">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("privacy.title")}</h2>
        <p className="text-sm text-gray-500 mb-6">{t("privacy.effectiveDate")}</p>

        <p className="text-sm mb-5">{t("privacy.intro")}</p>

        <h3 className="text-base font-semibold text-gray-900 mt-6 mb-2">{t("privacy.s1Title")}</h3>
        <p className="text-sm mb-2">{t("privacy.s1Body")}</p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>
            <strong>{t("privacy.s1EmailLabel")}</strong> {t("privacy.s1EmailDesc")}
          </li>
          <li>
            <strong>{t("privacy.s1DataLabel")}</strong> {t("privacy.s1DataDesc")}
          </li>
        </ul>
        <p className="text-sm mt-2">{t("privacy.s1Note")}</p>

        <h3 className="text-base font-semibold text-gray-900 mt-6 mb-2">{t("privacy.s2Title")}</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>{t("privacy.s2Item1")}</li>
          <li>{t("privacy.s2Item2")}</li>
          <li>{t("privacy.s2Item3")}</li>
        </ul>

        <h3 className="text-base font-semibold text-gray-900 mt-6 mb-2">{t("privacy.s3Title")}</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>{t("privacy.s3Item1")}</li>
          <li>{t("privacy.s3Item2")}</li>
          <li>{t("privacy.s3Item3")}</li>
        </ul>

        <h3 className="text-base font-semibold text-gray-900 mt-6 mb-2">{t("privacy.s4Title")}</h3>
        <p className="text-sm mb-2">{t("privacy.s4Body")}</p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>{t("privacy.s4Item1")}</li>
          <li>{t("privacy.s4Item2")}</li>
        </ul>

        <h3 className="text-base font-semibold text-gray-900 mt-6 mb-2">{t("privacy.s5Title")}</h3>
        <p className="text-sm mb-2">{t("privacy.s5Body")}</p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>
            <strong>{t("privacy.s5SupabaseLabel")}</strong> {t("privacy.s5SupabaseDesc")}
          </li>
          <li>
            <strong>{t("privacy.s5GoogleLabel")}</strong> {t("privacy.s5GoogleDesc")}
          </li>
        </ul>

        <h3 className="text-base font-semibold text-gray-900 mt-6 mb-2">{t("privacy.s6Title")}</h3>
        <p className="text-sm mb-2">{t("privacy.s6Body")}</p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>{t("privacy.s6Item1")}</li>
          <li>{t("privacy.s6Item2")}</li>
          <li>{t("privacy.s6Item3")}</li>
        </ul>

        <h3 className="text-base font-semibold text-gray-900 mt-6 mb-2">{t("privacy.s7Title")}</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>{t("privacy.s7Item1")}</li>
          <li>{t("privacy.s7Item2")}</li>
          <li>{t("privacy.s7Item3")}</li>
        </ul>

        <h3 className="text-base font-semibold text-gray-900 mt-6 mb-2">{t("privacy.s8Title")}</h3>
        <p className="text-sm">{t("privacy.s8Body")}</p>

        <h3 className="text-base font-semibold text-gray-900 mt-6 mb-2">{t("privacy.s9Title")}</h3>
        <p className="text-sm mb-1">{t("privacy.s9Body")}</p>
        <p className="text-sm">{t("privacy.s9Email")}</p>
      </article>
    </div>
  );
}
