import { ChevronLeft } from "lucide-react";

interface StudyHeaderProps {
  current: number;
  total: number;
  onBack: () => void;
}

export function StudyHeader({ current, total, onBack }: StudyHeaderProps) {
  return (
    <>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-600">
          <ChevronLeft size={24} />
        </button>
        <div className="text-sm text-gray-600">
          <span className="font-medium text-gray-900">{current}</span> / {total}
        </div>
        <div className="w-10" />
      </div>

      {/* 진행률 바 */}
      <div className="h-1 bg-gray-100 rounded-full mb-10 overflow-hidden">
        <div className="h-full bg-black rounded-full transition-all duration-200" style={{ width: `${(current / total) * 100}%` }} />
      </div>
    </>
  );
}
