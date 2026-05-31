import { useNavigate } from "react-router-dom";
import { BackHeader } from "@/components/BackHeader";
import { useT } from "@/i18n";

export function AboutPage() {
  const navigate = useNavigate();
  const t = useT();

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <BackHeader title={t("about.title")} onBack={() => navigate("/mypage")} />

      <div className="px-5 pt-[calc(4.5rem+env(safe-area-inset-top,0px))] pb-8">
        <div className="bg-white rounded-2xl p-6 space-y-6">
          <div className="text-center">
            <div className="text-4xl mb-2">👋</div>
            <h2 className="text-xl font-bold text-gray-900">{t("about.greeting")}</h2>
          </div>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p className="text-[15px]">{t("about.intro1")}</p>
            <p className="text-[15px]">{t("about.intro2")}</p>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <h3 className="font-bold text-gray-900">{t("about.featuresTitle")}</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <div>
                    <strong>{t("about.featureFlashTitle")}</strong>
                    <p className="text-gray-500">{t("about.featureFlashDesc")}</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <div>
                    <strong>{t("about.featureSRTitle")}</strong>
                    <p className="text-gray-500">{t("about.featureSRDesc")}</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <div>
                    <strong>{t("about.featureQuizTitle")}</strong>
                    <p className="text-gray-500">{t("about.featureQuizDesc")}</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <div>
                    <strong>{t("about.featureTTSTitle")}</strong>
                    <p className="text-gray-500">{t("about.featureTTSDesc")}</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 space-y-3">
              <h3 className="font-bold text-gray-900">{t("about.tipsTitle")}</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">1.</span>
                  <span>{t("about.tip1")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">2.</span>
                  <div>
                    <span>{t("about.tip2Main")}</span>
                    <p className="text-gray-500">{t("about.tip2Sub")}</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">3.</span>
                  <span>{t("about.tip3")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">4.</span>
                  <span>{t("about.tip4")}</span>
                </li>
              </ul>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-[15px]">{t("about.closing")}</p>{" "}
            </div>

            <div className="text-center pt-2">
              <p className="text-lg font-medium text-gray-900">{t("about.cheerOn")}</p>
            </div>
          </div>

          <div className="text-right text-sm text-gray-500">{t("about.signature")}</div>
        </div>
      </div>
    </div>
  );
}
