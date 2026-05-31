import { Volume2 } from "lucide-react";
import { speakWord } from "@/lib/tts";
import type { Word } from "@/types";
import { useT } from "@/i18n";

interface FlashCardProps {
  word: Word;
  isFlipped: boolean;
  onFlip: () => void;
}

function CardFront({ word }: { word: string }) {
  const t = useT();
  return (
    <>
      <div className="text-3xl font-bold mb-4">{word}</div>
      <div className="text-sm text-gray-400">{t("study.card.tapToReveal")}</div>
    </>
  );
}

function CardBack({ word }: { word: Word }) {
  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    speakWord(word.word);
  };

  return (
    <>
      <div className="text-2xl font-bold text-gray-900 mb-3">{word.word}</div>
      <div className="text-xl text-gray-700 mb-5">{word.meaning}</div>
      {word.example && <div className="text-sm text-gray-500 leading-relaxed mb-2">"{word.example}"</div>}
      {word.exampleKo && <div className="text-sm text-gray-400 leading-relaxed mb-4">"{word.exampleKo}"</div>}
      <button onClick={handleSpeak} className="p-2 rounded-full bg-gray-200 text-gray-600 active:bg-gray-300">
        <Volume2 size={18} />
      </button>
    </>
  );
}

export function FlashCard({ word, isFlipped, onFlip }: FlashCardProps) {
  const cardStyle = isFlipped ? "bg-gray-50" : "bg-black text-white shadow-2xl active:scale-[0.98]";

  return (
    <div className="flex justify-center">
      <div onClick={!isFlipped ? onFlip : undefined} className={`w-full max-w-sm aspect-square rounded-3xl px-8 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer ${cardStyle}`}>
        {isFlipped ? <CardBack word={word} /> : <CardFront word={word.word} />}
      </div>
    </div>
  );
}
