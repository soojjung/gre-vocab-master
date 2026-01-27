import { useNavigate } from "react-router-dom";
import { Mail, Copy, Check } from "lucide-react";
import { useState } from "react";
import { BackHeader } from "@/components/BackHeader";
import { useAuth } from "@/contexts/AuthContext";

const EMAIL = "sojjung3@gmail.com";

export function ContactPage() {
  const navigate = useNavigate();
  const { deleteAccount } = useAuth();
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = EMAIL;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("정말 탈퇴하시겠습니까?\n모든 학습 데이터가 삭제되며 복구할 수 없습니다.")) {
      try {
        setDeleting(true);
        await deleteAccount();
      } catch {
        setDeleting(false);
        alert("회원탈퇴에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <BackHeader title="고객센터" onBack={() => navigate("/mypage")} />

      <div className="px-5 pt-[calc(4.5rem+env(safe-area-inset-top,0px))] pb-8 space-y-5">
        {/* 문의하기 */}
        <div className="bg-white rounded-2xl p-6 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={28} className="text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">문의하기</h2>
            <p className="text-sm text-gray-500 mt-2">
              버그 제보, 기능 요청, 기타 문의사항을
              <br />
              아래 이메일로 보내주시면 확인 후 답변드리겠습니다.
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">{EMAIL}</span>
              <button onClick={handleCopy} className="flex items-center gap-1 text-sm text-gray-500 active:text-black">
                {copied ? (
                  <>
                    <Check size={16} className="text-green-500" />
                    <span className="text-green-500">복사됨</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    <span>복사</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 회원탈퇴 */}
        <div className="bg-white rounded-2xl p-6 space-y-4">
          <h2 className="font-bold text-gray-900">회원탈퇴</h2>
          <p className="text-sm text-gray-500">탈퇴 시 계정과 모든 학습 데이터(진행률, 북마크, 퀴즈 기록 등)가 영구적으로 삭제되며 복구할 수 없습니다.</p>
          <button disabled={deleting} onClick={handleDeleteAccount} className="text-sm text-red-500 underline disabled:opacity-50">
            {deleting ? "탈퇴 처리 중..." : "회원탈퇴"}
          </button>
        </div>
      </div>
    </div>
  );
}
