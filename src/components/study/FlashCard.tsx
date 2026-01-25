import { Volume2 } from "lucide-react";
import { speakWord } from "@/lib/tts";
import type { Word } from "@/types";

interface FlashCardProps {
  word: Word;
  isFlipped: boolean;
  onFlip: () => void;
  variant?: "default" | "review";
}

export function FlashCard({ word, isFlipped, onFlip, variant = "default" }: FlashCardProps) {
  const isReview = variant === "review";

  const frontBg = isReview ? "bg-amber-500" : "bg-black";
  const frontTextMuted = isReview ? "text-amber-200" : "text-gray-400";
  const backBg = isReview ? "bg-amber-50" : "bg-gray-50";
  const speakerBg = isReview ? "bg-amber-100 text-amber-600 active:bg-amber-200" : "bg-gray-200 text-gray-600 active:bg-gray-300";

  return (
    <div className="flex justify-center">
      <div
        onClick={!isFlipped ? onFlip : undefined}
        className={`
          w-full max-w-sm aspect-square rounded-3xl px-8
          flex flex-col items-center justify-center text-center
          transition-all duration-200 cursor-pointer
          ${isFlipped ? backBg : `${frontBg} text-white shadow-2xl active:scale-[0.98]`}
        `}
      >
        {!isFlipped ? (
          <>
            <div className="text-3xl font-bold mb-4">{word.word}</div>
            <div className={`text-sm ${frontTextMuted}`}>탭하여 뜻 보기</div>
          </>
        ) : (
          <>
            <div className="text-2xl font-bold text-gray-900 mb-3">{word.word}</div>
            <div className="text-xl text-gray-700 mb-5">{word.meaning}</div>
            <div className="text-sm text-gray-500 leading-relaxed mb-2">"{word.example}"</div>
            <div className="text-sm text-gray-400 leading-relaxed mb-4">"{word.exampleKo}"</div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                speakWord(word.word);
              }}
              className={`p-2 rounded-full ${speakerBg}`}
            >
              <Volume2 size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
