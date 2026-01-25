import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Star, Bookmark, BookmarkCheck } from "lucide-react";
import type { Word } from "@/types";
import { words } from "@/data/words";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/hooks/useUserData";
import { BackHeader } from "@/components/BackHeader";

type FilterType = "all" | "learning" | "mastered" | "bookmarked";

export function VocabularyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userData, toggleBookmark } = useUserData(user?.uid);

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);

  const filteredWords = useMemo(() => {
    return words.filter((word) => {
      const matchesSearch = searchQuery === "" || word.word.toLowerCase().includes(searchQuery.toLowerCase()) || word.meaning.includes(searchQuery);

      const wordProgress = userData.progress[String(word.id)];
      let matchesFilter = true;

      if (filter === "learning") {
        matchesFilter = wordProgress?.status === "learning";
      } else if (filter === "mastered") {
        matchesFilter = wordProgress?.status === "mastered";
      } else if (filter === "bookmarked") {
        matchesFilter = wordProgress?.bookmarked === true;
      }

      return matchesSearch && matchesFilter;
    });
  }, [userData.progress, searchQuery, filter]);

  const getWordStatus = (wordId: number) => {
    const p = userData.progress[String(wordId)];
    if (!p) return { status: "new", rate: 0, bookmarked: false };
    const total = p.correctCount + p.wrongCount;
    const rate = total > 0 ? Math.round((p.correctCount / total) * 100) : 0;
    return { status: p.status, rate, bookmarked: p.bookmarked };
  };

  // 단어 상세 모달
  if (selectedWord) {
    const wordStatus = getWordStatus(selectedWord.id);

    return (
      <div className="min-h-screen bg-white relative">
        <BackHeader title={selectedWord.word} onBack={() => setSelectedWord(null)} />

        <div className="px-5 py-8 pt-[calc(5rem+env(safe-area-inset-top))] text-center">
          <div className="text-4xl font-bold text-gray-900 mb-4">{selectedWord.word}</div>
          <div className="text-xl text-gray-600 mb-8">{selectedWord.meaning}</div>

          <div className="bg-gray-50 rounded-2xl p-6 text-left mb-6">
            <div className="text-sm text-gray-500 mb-2">예문</div>
            <div className="text-gray-800 mb-2">{selectedWord.example}</div>
            <div className="text-gray-500 text-sm">{selectedWord.exampleKo}</div>
          </div>

          <button onClick={() => toggleBookmark(String(selectedWord.id))} className={`mt-6 px-6 py-3 rounded-xl font-medium flex items-center gap-2 mx-auto ${wordStatus.bookmarked ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}`}>
            {wordStatus.bookmarked ? (
              <>
                <BookmarkCheck size={18} />
                북마크 해제
              </>
            ) : (
              <>
                <Bookmark size={18} />
                북마크 추가
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24 relative">
      <BackHeader title="단어장" onBack={() => navigate(-1)} />

      <div className="px-5 pt-[calc(5rem+env(safe-area-inset-top))]">
        {/* 검색 */}
        <div className="relative mb-4">
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="단어 또는 뜻 검색" className="w-full bg-gray-100 rounded-xl px-4 py-3 pl-10 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black" />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>

        {/* 필터 탭 */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { key: "all", label: "전체" },
            { key: "learning", label: "학습중 📖" },
            { key: "mastered", label: "암기완료 ✔️" },
            { key: "bookmarked", label: "북마크 🔖" },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setFilter(tab.key as FilterType)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === tab.key ? "bg-black text-white" : "bg-gray-100 text-gray-600"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* 단어 목록 */}
        <div className="space-y-3">
          {filteredWords.map((word) => {
            const status = getWordStatus(word.id);
            return (
              <div key={word.id} onClick={() => setSelectedWord(word)} className="bg-gray-50 rounded-xl p-4 active:bg-gray-100 transition-colors cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{word.word}</span>
                      {status.bookmarked && <Star size={14} className="text-yellow-500 fill-yellow-500" />}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{word.meaning}</div>
                  </div>
                  {status.status !== "new" && <span className={`text-sm font-medium ${status.status === "mastered" ? "text-green-500" : "text-gray-400"}`}>{status.status === "mastered" ? "암기완료" : "학습중"}</span>}
                </div>
              </div>
            );
          })}
        </div>

        {filteredWords.length === 0 && <div className="text-center text-gray-500 py-12">{searchQuery ? "검색 결과가 없습니다" : "단어가 없습니다"}</div>}
      </div>
    </div>
  );
}
