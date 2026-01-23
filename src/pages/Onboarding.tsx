import { useState } from "react";

interface OnboardingProps {
  onComplete: (targetDate: string, dailyGoal: number) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [targetDate, setTargetDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 60);
    return date.toISOString().split("T")[0];
  });
  const [dailyGoal, setDailyGoal] = useState(25);

  const handleComplete = () => {
    onComplete(targetDate, dailyGoal);
  };

  // D-day 계산
  const getDday = () => {
    const target = new Date(targetDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-white px-5 py-12 flex flex-col">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl font-bold">G</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">환영합니다!</h1>
        <p className="text-gray-500 mt-2">학습 목표를 설정해주세요</p>
      </div>

      {/* 진행 표시 */}
      <div className="flex gap-2 justify-center mb-8">
        <div className={`w-2 h-2 rounded-full ${step >= 1 ? "bg-black" : "bg-gray-200"}`} />
        <div className={`w-2 h-2 rounded-full ${step >= 2 ? "bg-black" : "bg-gray-200"}`} />
      </div>

      {step === 1 && (
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-2">GRE 시험일은 언제인가요?</h2>
            <p className="text-gray-500 text-sm mb-6">목표일을 설정하면 D-day를 계산해드려요</p>

            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-black" />

              <div className="mt-4 text-center">
                <div className="text-4xl font-bold text-black">D-{getDday()}</div>
                <div className="text-sm text-gray-500 mt-1">목표일까지</div>
              </div>
            </div>

            {/* 빠른 선택 */}
            <div className="grid grid-cols-3 gap-2">
              {[30, 60, 90].map((days) => (
                <button
                  key={days}
                  onClick={() => {
                    const date = new Date();
                    date.setDate(date.getDate() + days);
                    setTargetDate(date.toISOString().split("T")[0]);
                  }}
                  className={`py-3 rounded-xl text-sm font-medium transition-colors ${getDday() === days ? "bg-black text-white" : "bg-gray-100 text-gray-600 active:bg-gray-200"}`}
                >
                  {days}일 후
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => setStep(2)} className="w-full bg-black text-white py-4 rounded-xl font-medium text-lg mt-8">
            다음
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-2">하루에 몇 단어를 학습할까요?</h2>
            <p className="text-gray-500 text-sm mb-6">권장: 25개 (약 15분 소요)</p>

            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <div className="text-center mb-4">
                <div className="text-5xl font-bold text-black">{dailyGoal}</div>
                <div className="text-sm text-gray-500 mt-1">단어/일</div>
              </div>

              <input type="range" min="10" max="50" step="5" value={dailyGoal} onChange={(e) => setDailyGoal(Number(e.target.value))} className="w-full accent-black" />

              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>10개</span>
                <span>50개</span>
              </div>
            </div>

            {/* 빠른 선택 */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 15, label: "여유롭게", desc: "~10분" },
                { value: 25, label: "권장", desc: "~15분" },
                { value: 40, label: "빡세게", desc: "~25분" },
              ].map((option) => (
                <button key={option.value} onClick={() => setDailyGoal(option.value)} className={`py-3 rounded-xl text-sm transition-colors ${dailyGoal === option.value ? "bg-black text-white" : "bg-gray-100 text-gray-600 active:bg-gray-200"}`}>
                  <div className="font-medium">{option.label}</div>
                  <div className={`text-xs ${dailyGoal === option.value ? "text-gray-300" : "text-gray-400"}`}>{option.desc}</div>
                </button>
              ))}
            </div>

            {/* 예상 완료일 */}
            <div className="bg-green-50 rounded-xl p-4 mt-6">
              <div className="text-sm text-green-800">
                이 속도로 학습하면 <strong>{Math.ceil(100 / dailyGoal)}일</strong>이면 100단어를 마스터할 수 있어요!
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button onClick={() => setStep(1)} className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-medium text-lg">
              이전
            </button>
            <button onClick={handleComplete} className="flex-1 bg-black text-white py-4 rounded-xl font-medium text-lg">
              시작하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
