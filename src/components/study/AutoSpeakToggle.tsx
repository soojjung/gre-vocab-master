interface AutoSpeakToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export function AutoSpeakToggle({ enabled, onToggle }: AutoSpeakToggleProps) {
  return (
    <div className="flex items-center justify-end gap-2 mt-6">
      <span className="text-sm text-gray-600">자동 발음</span>
      <button onClick={onToggle} className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? "bg-black" : "bg-gray-300"}`}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </div>
  );
}
