import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Upload, Plus, Trash2, Download, Search, Edit2, Check } from "lucide-react";
import { BackHeader } from "@/components/BackHeader";
import { Button } from "@/components/common";
import { useWordListContext } from "@/contexts/WordListContext";
import { parseWordFile } from "@/lib/parseWordFile";
import { downloadCSV } from "@/lib/exportWords";
import { toast } from "sonner";
import type { Word, CustomWord } from "@/types";

export function WordListDetailPage() {
  const navigate = useNavigate();
  const { id: listId } = useParams<{ id: string }>();
  const { wordLists, fetchWordsForList, addWordsToList, removeWordFromList, renameWordList } = useWordListContext();

  const list = wordLists.find((l) => l.id === listId);

  const [words, setWords] = useState<Word[]>([]);
  const [customWords, setCustomWordsLocal] = useState<CustomWord[]>([]);
  const [wordsLoading, setWordsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // 파일 업로드 모달
  const [showUpload, setShowUpload] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: number; errors: number } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 직접 입력 모달
  const [showManual, setShowManual] = useState(false);
  const [manualWord, setManualWord] = useState("");
  const [manualMeaning, setManualMeaning] = useState("");
  const [adding, setAdding] = useState(false);

  // 이름 편집
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(list?.name ?? "");

  // 단어 로드
  const loadWords = useCallback(async () => {
    if (!listId) return;
    setWordsLoading(true);
    const result = await fetchWordsForList(listId);
    setWords(result.words);
    setCustomWordsLocal(result.customWords);
    setWordsLoading(false);
  }, [listId, fetchWordsForList]);

  useEffect(() => {
    loadWords();
  }, [loadWords]);

  const [isDragging, setIsDragging] = useState(false);

  // 파일 처리 공통 로직
  const processFile = async (file: File) => {
    if (!listId) return;
    setUploading(true);
    setUploadResult(null);
    try {
      const content = await file.text();
      const result = parseWordFile(content, file.name);

      if (result.success.length > 0) {
        const count = await addWordsToList(listId, result.success);
        setUploadResult({ success: count, errors: result.errors.length });
        await loadWords();
      } else {
        setUploadResult({ success: 0, errors: result.errors.length });
      }
    } catch {
      setUploadResult({ success: 0, errors: 1 });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // input 파일 선택
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  // 드래그앤드롭
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  // 직접 입력 처리
  const handleManualAdd = async () => {
    if (!manualWord.trim() || !manualMeaning.trim() || !listId) return;
    setAdding(true);
    await addWordsToList(listId, [{ word: manualWord.trim(), meaning: manualMeaning.trim() }]);
    setManualWord("");
    setManualMeaning("");
    setShowManual(false);
    setAdding(false);
    await loadWords();
  };

  // 단어 삭제
  const handleRemoveWord = async (customWordId: string) => {
    if (!listId) return;
    await removeWordFromList(customWordId, listId);
    setCustomWordsLocal((prev) => prev.filter((w) => w.id !== customWordId));
    setWords((prev) => {
      const removed = customWords.find((cw) => cw.id === customWordId);
      if (!removed) return prev;
      const removedWordId = removed.sourceWordId ?? removed.numericId;
      return prev.filter((w) => w.id !== removedWordId);
    });
  };

  // 이름 변경
  const handleRename = async () => {
    if (!listId || !editName.trim()) return;
    const success = await renameWordList(listId, editName.trim());
    if (!success) {
      toast.error("같은 이름의 단어장이 이미 있습니다");
      return;
    }
    setIsEditing(false);
  };

  // CSV 내보내기
  const handleExport = () => {
    if (words.length === 0) return;
    downloadCSV(words, `${list?.name ?? "words"}.csv`);
  };

  // 검색 필터
  const filteredWords = searchQuery
    ? customWords.filter((cw) => cw.word.toLowerCase().includes(searchQuery.toLowerCase()) || cw.meaning.includes(searchQuery))
    : customWords;

  if (!list) {
    return (
      <div className="min-h-dvh bg-white flex items-center justify-center">
        <p className="text-gray-500">단어장을 찾을 수 없습니다</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-white">
      <BackHeader
        title={isEditing ? "" : list.name}
        onBack={() => navigate("/wordlists")}
        rightElement={
          isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm w-40 focus:outline-none focus:border-black"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleRename()}
              />
              <button onClick={handleRename} className="p-1.5 text-black">
                <Check size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => { setEditName(list.name); setIsEditing(true); }} className="p-2 text-gray-500">
                <Edit2 size={16} />
              </button>
              <button onClick={handleExport} className="p-2 text-gray-500" disabled={words.length === 0}>
                <Download size={16} />
              </button>
            </div>
          )
        }
      />

      <div className="pt-[calc(4rem+env(safe-area-inset-top,0px))] px-5 pb-8">
        {/* 단어 추가 영역 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setShowUpload(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 active:bg-gray-100"
          >
            <Upload size={16} />
            파일 업로드
          </button>
          <button
            onClick={() => setShowManual(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 active:bg-gray-100"
          >
            <Plus size={16} />
            직접 입력
          </button>
        </div>

        {/* 검색 */}
        {customWords.length > 0 && (
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="단어 검색"
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:bg-gray-100"
            />
          </div>
        )}

        {/* 단어 목록 */}
        {wordsLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-gray-50 rounded-xl h-14 animate-pulse" />
            ))}
          </div>
        ) : filteredWords.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">{customWords.length === 0 ? "단어를 추가해주세요" : "검색 결과가 없습니다"}</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredWords.map((cw) => (
              <div key={cw.id} className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">{cw.word}</div>
                  <div className="text-xs text-gray-500 truncate">{cw.meaning}</div>
                </div>
                <button onClick={() => handleRemoveWord(cw.id)} className="p-1.5 text-gray-300 active:text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 파일 업로드 모달 */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => !uploading && setShowUpload(false)}>
          <div className="bg-white w-full max-w-lg rounded-t-2xl p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-2">파일 업로드</h3>
            <p className="text-sm text-gray-500 mb-4">
              CSV: <code className="bg-gray-100 px-1 rounded">word,meaning</code><br />
              TXT: <code className="bg-gray-100 px-1 rounded">word{"<탭>"}meaning</code> 또는 <code className="bg-gray-100 px-1 rounded">word - meaning</code>
            </p>

            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                isDragging ? "border-black bg-gray-100" : "border-gray-300 bg-gray-50"
              }`}
            >
              <Upload size={24} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 font-medium">파일을 드래그하거나 클릭하여 선택</p>
              <p className="text-xs text-gray-400 mt-1">.csv, .txt</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {uploading && <p className="text-sm text-gray-500 mt-3">업로드 중...</p>}

            {uploadResult && (
              <div className="mt-3 p-3 bg-gray-50 rounded-xl text-sm">
                <p className="text-green-600">{uploadResult.success}개 단어 추가됨</p>
                {uploadResult.errors > 0 && <p className="text-red-500">{uploadResult.errors}개 행 파싱 실패</p>}
              </div>
            )}

            <Button variant="secondary" size="md" onClick={() => { setShowUpload(false); setUploadResult(null); }} className="mt-4">
              닫기
            </Button>
          </div>
        </div>
      )}

      {/* 직접 입력 모달 */}
      {showManual && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => !adding && setShowManual(false)}>
          <div className="bg-white w-full max-w-lg rounded-t-2xl p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">단어 추가</h3>
            <input
              type="text"
              value={manualWord}
              onChange={(e) => setManualWord(e.target.value)}
              placeholder="단어 (영어)"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base mb-3 focus:outline-none focus:border-black"
              autoFocus
            />
            <input
              type="text"
              value={manualMeaning}
              onChange={(e) => setManualMeaning(e.target.value)}
              placeholder="뜻 (한국어)"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base mb-4 focus:outline-none focus:border-black"
              onKeyDown={(e) => e.key === "Enter" && handleManualAdd()}
            />
            <div className="flex gap-3">
              <Button variant="secondary" size="md" onClick={() => setShowManual(false)}>
                취소
              </Button>
              <Button size="md" onClick={handleManualAdd} disabled={!manualWord.trim() || !manualMeaning.trim() || adding}>
                {adding ? "추가 중..." : "추가"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
