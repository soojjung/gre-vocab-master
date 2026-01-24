import { useNavigate, Navigate } from "react-router-dom";
import { RotateCcw, Home, XCircle } from "lucide-react";
import { useQuiz } from "@/contexts/QuizContext";
import { Button } from "@/components/common";

export function QuizResultPage() {
  const navigate = useNavigate();
  const { quizType, quizResults } = useQuiz();

  // 결과가 없으면 선택 페이지로 리다이렉트
  if (quizResults.length === 0) {
    return <Navigate to="/quiz" replace />;
  }

  const correctCount = quizResults.filter((r) => r.isCorrect).length;
  const totalCount = quizResults.length;
  const percentage = Math.round((correctCount / totalCount) * 100);

  const wrongResults = quizResults.filter((r) => !r.isCorrect);

  const getMessage = () => {
    if (percentage === 100) return { emoji: "🎉", text: "완벽해요!" };
    if (percentage >= 80) return { emoji: "👏", text: "훌륭해요!" };
    if (percentage >= 60) return { emoji: "💪", text: "좋아요!" };
    if (percentage >= 40) return { emoji: "📚", text: "조금 더 노력해봐요!" };
    return { emoji: "🔥", text: "다시 도전해봐요!" };
  };

  const message = getMessage();

  return (
    <div className="min-h-screen bg-white">
      {/* 결과 요약 */}
      <div className="bg-black text-white px-5 py-12 text-center">
        <div className="text-6xl mb-4">{message.emoji}</div>
        <div className="text-2xl font-bold mb-2">{message.text}</div>
        <div className="text-gray-500">{quizType === "fill-blank" ? "빈칸 채우기" : "객관식"} 퀴즈</div>
      </div>

      {/* 점수 */}
      <div className="px-5 py-8">
        <div className="bg-gray-50 rounded-2xl p-6 text-center mb-6">
          <div className="text-5xl font-bold text-gray-900 mb-2">
            {correctCount}/{totalCount}
          </div>
          <div className="text-gray-500">정답률 {percentage}%</div>
          <div className="mt-4 h-3 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${percentage >= 80 ? "bg-green-500" : percentage >= 60 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${percentage}%` }} />
          </div>
        </div>

        {/* 틀린 단어 목록 */}
        {wrongResults.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">틀린 단어 ({wrongResults.length}개)</h3>
            <div className="space-y-3">
              {wrongResults.map((result) => (
                <div key={result.word.id} className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900">{result.word.word}</div>
                      <div className="text-sm text-gray-600 mt-1">{result.word.meaning}</div>
                    </div>
                    <XCircle size={18} className="text-red-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 버튼들 */}
        <div className="space-y-3">
          <Button onClick={() => navigate("/quiz/play")} icon={<RotateCcw size={20} />}>
            다시 풀기
          </Button>
          <Button variant="secondary" onClick={() => navigate("/")} icon={<Home size={20} />}>
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
}
