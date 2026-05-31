import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTodayString, getDateAfterDays } from "@/lib/date";
import { useT } from "@/i18n";

const TOTAL_WORDS = 1500;

interface OnboardingProps {
  onComplete: (targetDate: string, dailyGoal: number, resetHour: number) => Promise<void>;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const t = useT();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [targetDate, setTargetDate] = useState(() => getDateAfterDays(60));
  const [dailyGoal, setDailyGoal] = useState(25);
  const [saving, setSaving] = useState(false);

  const handleComplete = async () => {
    setSaving(true);
    await onComplete(targetDate, dailyGoal, 3); // 기본값: 새벽 3시 (마이페이지에서 수정 가능)
    navigate("/", { replace: true });
    setSaving(false);
  };

  // D-day 계산
  const getDday = () => {
    const target = new Date(targetDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="bg-white px-5 pb-8 pt-[calc(4.5rem+env(safe-area-inset-top,0px))]">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl font-bold">G</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{t("onboarding.welcomeTitle")}</h1>
        <p className="text-gray-500 mt-2">{t("onboarding.welcomeSubtitle")}</p>
      </div>

      {/* 진행 표시 */}
      <div className="flex gap-2 justify-center mb-8">
        <div className={`w-2 h-2 rounded-full ${step >= 1 ? "bg-black" : "bg-gray-200"}`} />
        <div className={`w-2 h-2 rounded-full ${step >= 2 ? "bg-black" : "bg-gray-200"}`} />
      </div>

      {step === 1 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t("onboarding.testDateQ")}</h2>
          <p className="text-gray-500 text-sm mb-6">{t("onboarding.testDateDesc")}</p>

          <div className="bg-gray-50 rounded-2xl p-6 mb-6">
            <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} min={getTodayString()} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-black" />

            <div className="mt-4 text-center">
              <div className="text-4xl font-bold text-black">D-{getDday()}</div>
              <div className="text-sm text-gray-500 mt-1">{t("onboarding.untilTarget")}</div>
            </div>
          </div>

          {/* 빠른 선택 */}
          <div className="grid grid-cols-3 gap-2">
            {[30, 60, 90].map((days) => (
              <button key={days} onClick={() => setTargetDate(getDateAfterDays(days))} className={`py-3 rounded-xl text-sm font-medium transition-colors ${getDday() === days ? "bg-black text-white" : "bg-gray-100 text-gray-600 active:bg-gray-200"}`}>
                {t("onboarding.daysFromNow", { days })}
              </button>
            ))}
          </div>

          <button onClick={() => setStep(2)} className="w-full bg-black text-white py-4 rounded-xl font-medium text-lg mt-8">
            {t("common.next")}
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t("onboarding.dailyGoalQ")}</h2>
          <p className="text-gray-500 text-sm mb-6">{t("onboarding.dailyGoalRecommended")}</p>

          <div className="bg-gray-50 rounded-2xl p-6 mb-6">
            <div className="text-center mb-4">
              <div className="text-5xl font-bold text-black">{dailyGoal}</div>
              <div className="text-sm text-gray-500 mt-1">{t("onboarding.wordsPerDay")}</div>
            </div>

            <input type="range" min="10" max="150" step="5" value={dailyGoal} onChange={(e) => setDailyGoal(Number(e.target.value))} className="w-full accent-black" />

            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>{t("common.itemsCount", { count: 10 })}</span>
              <span>{t("common.itemsCount", { count: 150 })}</span>
            </div>
          </div>

          {/* 빠른 선택 */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 25, label: t("onboarding.paceEasy"), desc: t("onboarding.paceEasyDesc") },
              { value: 50, label: t("onboarding.paceRecommended"), desc: t("onboarding.paceRecommendedDesc") },
              { value: 100, label: t("onboarding.paceIntense"), desc: t("onboarding.paceIntenseDesc") },
            ].map((option) => (
              <button key={option.value} onClick={() => setDailyGoal(option.value)} className={`py-3 rounded-xl text-sm transition-colors ${dailyGoal === option.value ? "bg-black text-white" : "bg-gray-100 text-gray-600 active:bg-gray-200"}`}>
                <div className="font-medium">{option.label}</div>
                <div className={`text-xs ${dailyGoal === option.value ? "text-gray-300" : "text-gray-400"}`}>{option.desc}</div>
              </button>
            ))}
          </div>

          {/* 예상 완료일 */}
          <div className="bg-green-50 rounded-xl p-4 mt-6">
            <div className="text-sm text-green-800">{t("onboarding.completionEstimate", { days: Math.ceil(TOTAL_WORDS / dailyGoal), total: TOTAL_WORDS })}</div>
          </div>

          <div className="flex gap-3 mt-8">
            <button onClick={() => setStep(1)} disabled={saving} className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-medium text-lg disabled:opacity-50">
              {t("common.previous")}
            </button>
            <button onClick={handleComplete} disabled={saving} className="flex-1 bg-black text-white py-4 rounded-xl font-medium text-lg disabled:opacity-50">
              {saving ? t("onboarding.saving") : t("onboarding.start")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
