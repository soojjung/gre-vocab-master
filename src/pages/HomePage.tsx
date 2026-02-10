import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { User, BadgeQuestionMark, BookOpen, BookMarked, Flame, BarChart3, FolderPlus, Check } from "lucide-react";
import { useUserDataContext } from "@/contexts/UserDataContext";
import { useWordListContext } from "@/contexts/WordListContext";
import { useWords } from "@/contexts/WordsContext";
import { Button } from "@/components/common";

export function HomePage() {
  const navigate = useNavigate();
  const { userData, loading, getDday, getReviewCount } = useUserDataContext();
  const { wordLists, fetchWordsForList } = useWordListContext();
  const { allDefaultWords, setActiveSource, setCustomWords, resetToDefault } = useWords();

  const dday = getDday();
  const reviewCount = getReviewCount();

  // 단어 소스 선택 모달
  const [showSourcePicker, setShowSourcePicker] = useState(false);
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set(["default"]));
  const [startingStudy, setStartingStudy] = useState(false);

  const toggleSource = useCallback((sourceId: string) => {
    setSelectedSources((prev) => {
      const next = new Set(prev);
      if (next.has(sourceId)) {
        // 최소 1개는 선택되어야 함
        if (next.size > 1) next.delete(sourceId);
      } else {
        next.add(sourceId);
      }
      return next;
    });
  }, []);

  const handleStartStudy = useCallback(async () => {
    setStartingStudy(true);

    const hasDefault = selectedSources.has("default");
    const customListIds = [...selectedSources].filter((id) => id !== "default");

    // 커스텀 단어장만 선택 또는 혼합 선택
    if (customListIds.length > 0) {
      let combinedWords = hasDefault ? [...allDefaultWords] : [];

      for (const listId of customListIds) {
        const result = await fetchWordsForList(listId);
        combinedWords = [...combinedWords, ...result.words];
      }

      const listNames = customListIds
        .map((id) => wordLists.find((l) => l.id === id)?.name)
        .filter(Boolean);
      const sourceName = hasDefault
        ? `GRE 기본 + ${listNames.join(", ")}`
        : listNames.join(", ");

      setActiveSource({ type: "custom", listId: "mixed", listName: sourceName });
      setCustomWords(combinedWords);
    } else {
      // GRE 기본만
      resetToDefault();
    }

    setStartingStudy(false);
    setShowSourcePicker(false);
    navigate("/study");
  }, [selectedSources, allDefaultWords, fetchWordsForList, wordLists, setActiveSource, setCustomWords, resetToDefault, navigate]);

  const handleStudyClick = () => {
    if (wordLists.length === 0) {
      // 커스텀 단어장이 없으면 바로 학습
      resetToDefault();
      navigate("/study");
    } else {
      // 단어장이 있으면 선택 모달
      setSelectedSources(new Set(["default"]));
      setShowSourcePicker(true);
    }
  };

  // 로딩 중일 때 스켈레톤 표시
  if (loading) {
    return (
      <div className="min-h-screen bg-white px-5 pb-8 pt-[calc(2rem+env(safe-area-inset-top,0px))]">
        <header className="mb-8">
          <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 w-56 bg-gray-100 rounded animate-pulse mt-2" />
        </header>
        <div className="bg-gray-200 rounded-2xl h-32 animate-pulse mb-6" />
        <div className="bg-gray-100 rounded-2xl h-24 animate-pulse mb-4" />
        <div className="bg-gray-100 rounded-2xl h-24 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 마이페이지 버튼 */}
      <button onClick={() => navigate("/mypage")} className="absolute right-4 top-[calc(1rem+env(safe-area-inset-top,0px))] w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200" aria-label="마이페이지">
        <User size={20} />
      </button>

      <main className="min-h-screen bg-white px-5 pb-24 pt-[calc(1rem+env(safe-area-inset-top,0px))]">
        {/* 헤더 */}
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">단어의 신 GRE</h1>
          <p className="text-gray-500 mt-1">매일 꾸준히, 1500 단어 정복</p>
        </header>

        {/* D-day 카드 */}
        <div className="bg-black text-white rounded-2xl p-6 mb-6">
          <div className="text-sm text-gray-400 mb-1">목표 시험일까지</div>
          <div className="text-4xl font-bold">{dday > 0 ? `D-${dday}` : dday === 0 ? "D-Day" : `D+${Math.abs(dday)}`}</div>
          {userData.streak > 0 && (
            <div className="mt-3 text-sm text-gray-300 flex items-center gap-1">
              <Flame size={14} className="text-orange-400" />
              연속 {userData.streak}일째 학습 중
            </div>
          )}
        </div>

        {/* 오늘 학습 현황 */}
        <div className="bg-gray-50 rounded-2xl p-5 mb-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600">오늘 학습</span>
            <span className="text-sm font-medium text-gray-900">
              {userData.todayLearned.length} / {userData.dailyGoal}
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min((userData.todayLearned.length / userData.dailyGoal) * 100, 100)}%`,
              }}
            />
          </div>
        </div>

        {/* SR 복습 */}
        <div className={`rounded-2xl p-5 mb-6 ${reviewCount > 0 ? "bg-amber-50 border border-amber-200" : "bg-gray-50"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${reviewCount > 0 ? "bg-amber-100" : "bg-gray-200"}`}>
                <BookOpen size={20} className={reviewCount > 0 ? "text-amber-600" : "text-gray-400"} />
              </div>
              <div>
                <div className={`text-sm font-medium ${reviewCount > 0 ? "text-amber-800" : "text-gray-600"}`}>{reviewCount > 0 ? "복습할 단어가 있어요" : "SR 복습"}</div>
                <div className={`text-xs ${reviewCount > 0 ? "text-amber-600" : "text-gray-400"}`}>{reviewCount > 0 ? `${reviewCount}개 대기 중` : "복습 대기 없음"}</div>
              </div>
            </div>
            <button onClick={() => navigate("/study?mode=review")} disabled={reviewCount === 0} className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${reviewCount > 0 ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
              복습하기
            </button>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <nav className="space-y-3 mt-8" aria-label="주요 메뉴">
          <Button onClick={handleStudyClick} icon={<BookOpen size={20} />}>
            오늘의 학습 시작
          </Button>
          <Button variant="secondary" onClick={() => navigate("/quiz")} icon={<BadgeQuestionMark size={20} />}>
            퀴즈 모드
          </Button>
          <Button variant="secondary" onClick={() => navigate("/vocabulary")} icon={<BookMarked size={20} />}>
            단어장
          </Button>
          <Button variant="secondary" onClick={() => navigate("/wordlists")} icon={<FolderPlus size={20} />}>
            나만의 단어장
          </Button>
          <Button variant="secondary" onClick={() => navigate("/stats")} icon={<BarChart3 size={20} />}>
            학습 통계
          </Button>
        </nav>
      </main>

      {/* 단어 소스 선택 모달 */}
      {showSourcePicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => !startingStudy && setShowSourcePicker(false)}>
          <div className="bg-white w-full max-w-lg rounded-t-2xl p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-1">학습할 단어장 선택</h3>
            <p className="text-sm text-gray-500 mb-4">복수 선택 가능</p>

            <div className="space-y-2 mb-5 max-h-64 overflow-y-auto">
              {/* GRE 기본 */}
              <button
                onClick={() => toggleSource("default")}
                className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-colors ${
                  selectedSources.has("default") ? "bg-gray-100" : "bg-gray-50"
                }`}
              >
                <div className={`w-5 h-5 rounded-md border flex-shrink-0 flex items-center justify-center ${
                  selectedSources.has("default") ? "bg-black border-black" : "border-gray-300"
                }`}>
                  {selectedSources.has("default") && <Check size={12} className="text-white" />}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">GRE 기본 단어</div>
                  <div className="text-xs text-gray-500">{allDefaultWords.length}개</div>
                </div>
              </button>

              {/* 커스텀 단어장들 */}
              {wordLists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => toggleSource(list.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-colors ${
                    selectedSources.has(list.id) ? "bg-gray-100" : "bg-gray-50"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border flex-shrink-0 flex items-center justify-center ${
                    selectedSources.has(list.id) ? "bg-black border-black" : "border-gray-300"
                  }`}>
                    {selectedSources.has(list.id) && <Check size={12} className="text-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{list.name}</div>
                    <div className="text-xs text-gray-500">{list.wordCount}개</div>
                  </div>
                </button>
              ))}
            </div>

            <Button onClick={handleStartStudy} disabled={startingStudy || selectedSources.size === 0}>
              {startingStudy ? "준비 중..." : "학습 시작"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
