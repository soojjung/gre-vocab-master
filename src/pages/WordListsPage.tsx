import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { BackHeader } from "@/components/BackHeader";
import { Button } from "@/components/common";
import { useWordListContext } from "@/contexts/WordListContext";

export function WordListsPage() {
  const navigate = useNavigate();
  const { wordLists, loading, createWordList, deleteWordList } = useWordListContext();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    if (wordLists.some((l) => l.name === newName.trim())) {
      toast.error("같은 이름의 단어장이 이미 있습니다");
      return;
    }
    setCreating(true);
    const list = await createWordList(newName.trim());
    setCreating(false);
    setNewName("");
    setShowCreate(false);
    if (list) {
      navigate(`/wordlists/${list.id}`);
    }
  };

  const handleDelete = async (e: React.MouseEvent, listId: string) => {
    e.stopPropagation();
    if (!confirm("이 단어장을 삭제하시겠습니까?")) return;
    setDeletingId(listId);
    await deleteWordList(listId);
    setDeletingId(null);
  };

  return (
    <div className="min-h-dvh bg-white">
      <BackHeader title="나만의 단어장" onBack={() => navigate(-1)} />

      <div className="pt-[calc(5rem+env(safe-area-inset-top,0px))] px-5 pb-8">
        {/* 새 단어장 만들기 */}
        {showCreate ? (
          <div className="bg-gray-50 rounded-2xl p-5 mb-6">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="단어장 이름을 입력하세요"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-base focus:outline-none focus:border-black"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <div className="flex gap-3 mt-3">
              <Button variant="secondary" size="md" onClick={() => { setShowCreate(false); setNewName(""); }}>
                취소
              </Button>
              <Button size="md" onClick={handleCreate} disabled={!newName.trim() || creating}>
                {creating ? "생성 중..." : "만들기"}
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowCreate(true)}
            className="w-full flex items-center justify-center gap-2 py-4 mb-6 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 active:bg-gray-50"
          >
            <Plus size={20} />
            <span className="font-medium">새 단어장 만들기</span>
          </button>
        )}

        {/* 로딩 */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-20 animate-pulse" />
            ))}
          </div>
        )}

        {/* 단어장 목록 */}
        {!loading && wordLists.length === 0 && (
          <div className="text-center py-16">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">아직 단어장이 없어요</p>
            <p className="text-gray-400 text-sm mt-1">첫 단어장을 만들어보세요</p>
          </div>
        )}

        <div className="space-y-3">
          {wordLists.map((list) => (
            <div
              key={list.id}
              onClick={() => navigate(`/wordlists/${list.id}`)}
              className="bg-gray-50 rounded-2xl p-5 flex items-center justify-between cursor-pointer active:bg-gray-100 transition-colors"
            >
              <div>
                <div className="font-medium text-gray-900">{list.name}</div>
                <div className="text-sm text-gray-500 mt-1">{list.wordCount}개 단어</div>
              </div>
              <button
                onClick={(e) => handleDelete(e, list.id)}
                disabled={deletingId === list.id}
                className="p-2 text-gray-400 active:text-red-500"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
