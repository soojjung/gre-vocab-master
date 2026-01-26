import { ChevronLeft } from "lucide-react";

interface BackHeaderProps {
  title: string;
  onBack: () => void;
  rightElement?: React.ReactNode;
}

export function BackHeader({ title, onBack, rightElement }: BackHeaderProps) {
  return (
    <div className="bg-white px-5 pb-3 flex items-center justify-between border-b border-gray-100 fixed top-0 left-0 right-0 z-10 pt-[max(0.75rem,calc(env(safe-area-inset-top)+0.25rem))]">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-600">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      </div>
      {rightElement && <div>{rightElement}</div>}
    </div>
  );
}
