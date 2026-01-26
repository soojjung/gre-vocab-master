import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, BookOpen, BookMarked, LogOut, Volume2, VolumeX, Mail, FileText, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserDataContext } from "@/contexts/UserDataContext";
import { getTodayString } from "@/lib/date";
import { BackHeader } from "@/components/BackHeader";
import { Button } from "@/components/common";

export function MyPageWrapper() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { userData, loading, updateSettings } = useUserDataContext();

  const [isEditingDday, setIsEditingDday] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  // 편집 중일 때만 사용하는 임시 값 (null이면 편집 중 아님)
  const [editTargetDate, setEditTargetDate] = useState<string | null>(null);
  const [editDailyGoal, setEditDailyGoal] = useState<number | null>(null);

  // 표시할 값: 편집 중이면 임시 값, 아니면 실제 userData 값
  const displayTargetDate = editTargetDate ?? userData.targetDate;
  const displayDailyGoal = editDailyGoal ?? userData.dailyGoal;

  const getDday = () => {
    const target = new Date(displayTargetDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleStartEditDday = () => {
    setEditTargetDate(userData.targetDate);
    setIsEditingDday(true);
  };

  const handleSaveDday = () => {
    if (editTargetDate) {
      updateSettings({ targetDate: editTargetDate });
    }
    setEditTargetDate(null);
    setIsEditingDday(false);
  };

  const handleCancelDday = () => {
    setEditTargetDate(null);
    setIsEditingDday(false);
  };

  const handleStartEditGoal = () => {
    setEditDailyGoal(userData.dailyGoal);
    setIsEditingGoal(true);
  };

  const handleSaveGoal = () => {
    if (editDailyGoal) {
      updateSettings({ dailyGoal: editDailyGoal });
    }
    setEditDailyGoal(null);
    setIsEditingGoal(false);
  };

  const handleCancelGoal = () => {
    setEditDailyGoal(null);
    setIsEditingGoal(false);
  };

  // 로딩 중일 때 스켈레톤 표시
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 relative">
        <BackHeader title="마이페이지" onBack={() => navigate("/")} />
        <div className="px-5 pt-[calc(4rem+env(safe-area-inset-top,0px))] pb-8 space-y-5">
          <div className="bg-white rounded-2xl p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-200 rounded-full animate-pulse" />
              <div>
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-100 rounded animate-pulse mt-2" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl h-48 animate-pulse" />
          <div className="bg-white rounded-2xl h-32 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <BackHeader title="마이페이지" onBack={() => navigate("/")} />

      <div className="px-5 pt-[calc(4rem+env(safe-area-inset-top,0px))] pb-8 space-y-5">
        {/* 프로필 */}
        <div className="bg-white rounded-2xl p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">{user?.email?.charAt(0).toUpperCase() || "U"}</span>
            </div>
            <div>
              <div className="font-medium text-gray-900">{user?.email || "사용자"}</div>
              <div className="text-sm text-gray-500">연속 {userData.streak}일 학습 중 🔥</div>
            </div>
          </div>
        </div>

        {/* 학습 설정 */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-500">학습 설정</span>
          </div>

          {/* D-day 설정 */}
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">목표 시험일</div>
                <div className="text-sm text-gray-500">
                  {isEditingDday ? (
                    <input type="date" value={displayTargetDate} onChange={(e) => setEditTargetDate(e.target.value)} min={getTodayString()} className="mt-2 bg-gray-100 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black" />
                  ) : (
                    `D-${getDday()} (${userData.targetDate})`
                  )}
                </div>
              </div>
              {isEditingDday ? (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" fullWidth={false} onClick={handleCancelDday}>
                    취소
                  </Button>
                  <Button size="sm" fullWidth={false} onClick={handleSaveDday}>
                    저장
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" size="sm" fullWidth={false} onClick={handleStartEditDday}>
                  수정
                </Button>
              )}
            </div>
          </div>

          {/* 일일 목표 */}
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">일일 학습량</div>
                <div className="text-sm text-gray-500">
                  {isEditingGoal ? (
                    <div className="mt-2 flex items-center gap-3">
                      <input type="range" min="10" max="50" step="5" value={displayDailyGoal} onChange={(e) => setEditDailyGoal(Number(e.target.value))} className="w-32 accent-black" />
                      <span className="text-gray-900 font-medium">{displayDailyGoal}개</span>
                    </div>
                  ) : (
                    `${userData.dailyGoal}개/일`
                  )}
                </div>
              </div>
              {isEditingGoal ? (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" fullWidth={false} onClick={handleCancelGoal}>
                    취소
                  </Button>
                  <Button size="sm" fullWidth={false} onClick={handleSaveGoal}>
                    저장
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" size="sm" fullWidth={false} onClick={handleStartEditGoal}>
                  수정
                </Button>
              )}
            </div>
          </div>

          {/* 자동 발음 설정 */}
          <div className="px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">{userData.autoSpeak ? <Volume2 size={20} className="text-purple-600" /> : <VolumeX size={20} className="text-purple-600" />}</div>
                <div>
                  <div className="font-medium text-gray-900">자동 발음</div>
                  <div className="text-xs text-gray-500">단어가 나타날 때 자동으로 발음 재생</div>
                </div>
              </div>
              <button onClick={() => updateSettings({ autoSpeak: !userData.autoSpeak })} className={`relative w-12 h-7 rounded-full transition-colors ${userData.autoSpeak ? "bg-black" : "bg-gray-300"}`}>
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${userData.autoSpeak ? "left-6" : "left-1"}`} />
              </button>
            </div>
          </div>
        </div>

        {/* 바로가기 */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-500">바로가기</span>
          </div>

          <button onClick={() => navigate("/study")} className="w-full px-5 py-4 flex items-center justify-between border-b border-gray-100 active:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <BookOpen size={20} className="text-green-600" />
              </div>
              <span className="font-medium text-gray-900">오늘의 학습</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>

          <button onClick={() => navigate("/vocabulary")} className="w-full px-5 py-4 flex items-center justify-between active:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <BookMarked size={20} className="text-blue-600" />
              </div>
              <span className="font-medium text-gray-900">단어장</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>

        {/* 정보 */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-500">정보</span>
          </div>

          <button onClick={() => navigate("/mypage/about")} className="w-full px-5 py-4 flex items-center justify-between border-b border-gray-100 active:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                <Heart size={20} className="text-pink-500" />
              </div>
              <span className="font-medium text-gray-900">개발자의 말</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>

          <button onClick={() => navigate("/mypage/license")} className="w-full px-5 py-4 flex items-center justify-between active:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <FileText size={20} className="text-gray-600" />
              </div>
              <span className="font-medium text-gray-900">라이선스 및 출처</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>

        {/* 문의하기 */}
        <Button variant="secondary" onClick={() => (window.location.href = "mailto:sojjung3@gmail.com?subject=[단어의 신 GRE] 문의합니다")} icon={<Mail size={18} />}>
          문의하기
        </Button>

        {/* 로그아웃 */}
        <Button variant="danger" onClick={signOut} icon={<LogOut size={18} />}>
          로그아웃
        </Button>
      </div>
    </div>
  );
}
