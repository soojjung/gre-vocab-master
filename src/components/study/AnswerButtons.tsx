import { useT } from "@/i18n";

interface AnswerButtonsProps {
  onAnswer: (correct: boolean) => void;
}

export function AnswerButtons({ onAnswer }: AnswerButtonsProps) {
  const t = useT();
  return (
    <div className="flex gap-4 mt-6">
      <button
        onClick={() => onAnswer(false)}
        className="flex-1 bg-red-50 text-red-600 py-4 rounded-xl font-medium text-lg active:bg-red-100 transition-colors flex items-center justify-center gap-2"
      >
        <span>{t("study.iDontKnow")}</span>
        <span>✕</span>
      </button>
      <button
        onClick={() => onAnswer(true)}
        className="flex-1 bg-green-50 text-green-600 py-4 rounded-xl font-medium text-lg active:bg-green-100 transition-colors flex items-center justify-center gap-2"
      >
        <span>{t("study.iKnow")}</span>
        <span>✓</span>
      </button>
    </div>
  );
}
