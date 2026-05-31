import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronDown, BookOpen, BookMarked, LogOut, Volume2, VolumeX, FileText, Heart, Shield, HelpCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserDataContext } from "@/contexts/UserDataContext";
import { getTodayString, formatDday } from "@/lib/date";
import { BackHeader } from "@/components/BackHeader";
import { Button } from "@/components/common";
import { useT, useLanguage, SUPPORTED_LANGUAGES } from "@/i18n";
import type { Lang, TranslationKey } from "@/i18n";

type TFn = (key: TranslationKey, vars?: Record<string, string | number>) => string;

// 사용자 표시 이름 추출 (Apple 프라이버시 릴레이 이메일 처리)
function getDisplayName(user: ReturnType<typeof useAuth>["user"], t: TFn): string {
  if (!user) return t("mypage.defaultUserName");

  // user_metadata에서 이름 확인 (Apple/Google 등에서 제공)
  const fullName = user.user_metadata?.full_name || user.user_metadata?.name;
  if (fullName) return fullName;

  // 이메일이 Apple 프라이버시 릴레이인 경우
  if (user.email?.endsWith("@privaterelay.appleid.com")) {
    return t("mypage.appleUserName");
  }

  // 일반 이메일
  return user.email || t("mypage.defaultUserName");
}

// 로그인 제공자 표시 텍스트
function getProviderLabel(user: ReturnType<typeof useAuth>["user"], t: TFn): string | null {
  if (!user) return null;
  const provider = user.app_metadata?.provider;
  if (provider === "apple") return t("mypage.providerApple");
  if (provider === "google") return t("mypage.providerGoogle");
  if (provider === "kakao") return t("mypage.providerKakao");
  return null;
}

// 아바타에 표시할 첫 글자 추출
function getAvatarInitial(user: ReturnType<typeof useAuth>["user"]): string {
  if (!user) return "U";

  // 이름이 있으면 이름의 첫 글자
  const fullName = user.user_metadata?.full_name || user.user_metadata?.name;
  if (fullName && typeof fullName === "string") {
    return fullName.charAt(0).toUpperCase();
  }

  // Apple 프라이버시 릴레이 이메일이면 A
  if (user.email?.endsWith("@privaterelay.appleid.com")) {
    return "A";
  }

  // 이메일 첫 글자 (숫자면 U로 대체)
  const firstChar = user.email?.charAt(0);
  if (firstChar && /[a-zA-Z]/.test(firstChar)) {
    return firstChar.toUpperCase();
  }

  return "U";
}

export function MyPageWrapper() {
  const navigate = useNavigate();
  const t = useT();
  const { lang, setLang } = useLanguage();
  const { user, signOut } = useAuth();
  const { userData, loading, updateSettings } = useUserDataContext();

  const displayName = getDisplayName(user, t);
  const avatarInitial = getAvatarInitial(user);
  const providerLabel = getProviderLabel(user, t);

  const [isEditingDday, setIsEditingDday] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [isEditingResetHour, setIsEditingResetHour] = useState(false);
  const [showResetHourConfirm, setShowResetHourConfirm] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  // 편집 중일 때만 사용하는 임시 값 (null이면 편집 중 아님)
  const [editTargetDate, setEditTargetDate] = useState<string | null>(null);
  const [editDailyGoal, setEditDailyGoal] = useState<number | null>(null);
  const [editResetHour, setEditResetHour] = useState<number | null>(null);

  // 표시할 값: 편집 중이면 임시 값, 아니면 실제 userData 값
  const displayTargetDate = editTargetDate ?? userData.targetDate;
  const displayDailyGoal = editDailyGoal ?? userData.dailyGoal;
  const displayResetHour = editResetHour ?? userData.resetHour;

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

  const handleStartEditResetHour = () => {
    setEditResetHour(userData.resetHour);
    setIsEditingResetHour(true);
  };

  // 리셋 시간 변경 시 학습 단어가 바뀌는지 확인
  const willWordsChange = (oldResetHour: number, newResetHour: number): boolean => {
    const currentHour = new Date().getHours();
    const wasBeforeReset = currentHour < oldResetHour;
    const willBeBeforeReset = currentHour < newResetHour;
    return wasBeforeReset !== willBeBeforeReset;
  };

  const handleSaveResetHour = () => {
    if (editResetHour !== null && editResetHour !== userData.resetHour) {
      if (willWordsChange(userData.resetHour, editResetHour)) {
        setShowResetHourConfirm(true);
        return;
      }
      updateSettings({ resetHour: editResetHour });
    }
    setEditResetHour(null);
    setIsEditingResetHour(false);
  };

  const handleConfirmResetHour = () => {
    if (editResetHour !== null) {
      updateSettings({ resetHour: editResetHour });
    }
    setEditResetHour(null);
    setIsEditingResetHour(false);
    setShowResetHourConfirm(false);
  };

  const handleCancelResetHourConfirm = () => {
    setShowResetHourConfirm(false);
  };

  const handleCancelResetHour = () => {
    setEditResetHour(null);
    setIsEditingResetHour(false);
  };

  const formatResetHour = (hour: number) => {
    if (hour === 0) return t("mypage.resetHourMidnight");
    if (hour < 6) return t("mypage.resetHourDawn", { hour });
    return t("mypage.resetHourMorning", { hour });
  };

  // 로딩 중일 때 스켈레톤 표시
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 relative">
        <BackHeader title={t("mypage.title")} onBack={() => navigate("/")} />
        <div className="px-5 pt-[calc(4.5rem+env(safe-area-inset-top,0px))] pb-8 space-y-5">
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
      <BackHeader title={t("mypage.title")} onBack={() => navigate("/")} />

      <div className="px-5 pt-[calc(4.5rem+env(safe-area-inset-top,0px))] pb-8 space-y-5">
        {/* 프로필 */}
        <div className="bg-white rounded-2xl p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">{avatarInitial}</span>
            </div>
            <div>
              <div className="font-medium text-gray-900">{displayName}</div>
              {providerLabel && <div className="text-xs text-gray-400">{providerLabel}</div>}
              <div className="text-sm text-gray-500">{t("mypage.streak", { count: userData.streak })}</div>
            </div>
          </div>
        </div>

        {/* 학습 설정 */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-500">{t("mypage.sectionStudySettings")}</span>
          </div>

          {/* D-day 설정 */}
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{t("mypage.targetDate")}</div>
                <div className="text-sm text-gray-500">
                  {isEditingDday ? (
                    <input type="date" value={displayTargetDate} onChange={(e) => setEditTargetDate(e.target.value)} min={getTodayString()} className="mt-2 bg-gray-100 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black" />
                  ) : (
                    <>
                      {formatDday(getDday())} ({userData.targetDate}){getDday() < 0 && <div className="mt-1 text-xs text-amber-600">{t("mypage.testDatePassed")}</div>}
                    </>
                  )}
                </div>
              </div>
              {isEditingDday ? (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" fullWidth={false} onClick={handleCancelDday}>
                    {t("common.cancel")}
                  </Button>
                  <Button size="sm" fullWidth={false} onClick={handleSaveDday}>
                    {t("common.save")}
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" size="sm" fullWidth={false} onClick={handleStartEditDday}>
                  {t("common.edit")}
                </Button>
              )}
            </div>
          </div>

          {/* 일일 목표 */}
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{t("mypage.dailyGoal")}</div>
                <div className="text-sm text-gray-500">
                  {isEditingGoal ? (
                    <div className="mt-2 flex items-center gap-3">
                      <input type="range" min="10" max="150" step="5" value={displayDailyGoal} onChange={(e) => setEditDailyGoal(Number(e.target.value))} className="w-32 accent-black" />
                      <span className="text-gray-900 font-medium">{t("common.itemsCount", { count: displayDailyGoal })}</span>
                    </div>
                  ) : (
                    t("mypage.dailyGoalDisplay", { count: userData.dailyGoal })
                  )}
                </div>
              </div>
              {isEditingGoal ? (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" fullWidth={false} onClick={handleCancelGoal}>
                    {t("common.cancel")}
                  </Button>
                  <Button size="sm" fullWidth={false} onClick={handleSaveGoal}>
                    {t("common.save")}
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" size="sm" fullWidth={false} onClick={handleStartEditGoal}>
                  {t("common.edit")}
                </Button>
              )}
            </div>
          </div>

          {/* 리셋 시간 설정 */}
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{t("mypage.resetHour")}</div>
                <div className="text-sm text-gray-500">
                  {isEditingResetHour ? (
                    <div className="mt-2 flex items-center gap-3">
                      <input type="range" min="0" max="9" step="1" value={displayResetHour} onChange={(e) => setEditResetHour(Number(e.target.value))} className="w-32 accent-black" />
                      <span className="text-gray-900 font-medium">{formatResetHour(displayResetHour)}</span>
                    </div>
                  ) : (
                    formatResetHour(userData.resetHour)
                  )}
                </div>
              </div>
              {isEditingResetHour ? (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" fullWidth={false} onClick={handleCancelResetHour}>
                    {t("common.cancel")}
                  </Button>
                  <Button size="sm" fullWidth={false} onClick={handleSaveResetHour}>
                    {t("common.save")}
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" size="sm" fullWidth={false} onClick={handleStartEditResetHour}>
                  {t("common.edit")}
                </Button>
              )}
            </div>
          </div>

          {/* 언어 설정 */}
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between gap-3">
              <div className="font-medium text-gray-900">{t("language.label")}</div>
              <div className="relative">
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value as Lang)}
                  aria-label={t("language.label")}
                  className="appearance-none bg-gray-100 text-gray-900 text-sm font-medium rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                >
                  {SUPPORTED_LANGUAGES.map(({ code, labelKey }) => (
                    <option key={code} value={code}>
                      {t(labelKey)}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* 자동 발음 설정 */}
          <div className="px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">{userData.autoSpeak ? <Volume2 size={20} className="text-purple-600" /> : <VolumeX size={20} className="text-purple-600" />}</div>
                <div className="min-w-0">
                  <div className="font-medium text-gray-900">{t("mypage.autoSpeak")}</div>
                  <div className="text-xs text-gray-500">{t("mypage.autoSpeakDesc")}</div>
                </div>
              </div>
              <button onClick={() => updateSettings({ autoSpeak: !userData.autoSpeak })} className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${userData.autoSpeak ? "bg-black" : "bg-gray-300"}`}>
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${userData.autoSpeak ? "left-6" : "left-1"}`} />
              </button>
            </div>
          </div>
        </div>

        {/* 바로가기 */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-500">{t("mypage.sectionShortcuts")}</span>
          </div>

          <button onClick={() => navigate("/study")} className="w-full px-5 py-4 flex items-center justify-between border-b border-gray-100 active:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <BookOpen size={20} className="text-green-600" />
              </div>
              <span className="font-medium text-gray-900">{t("mypage.shortcutTodayStudy")}</span>
            </div>
            <ChevronRight size={20} className="text-gray-400 shrink-0" />
          </button>

          <button onClick={() => navigate("/vocabulary")} className="w-full px-5 py-4 flex items-center justify-between active:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <BookMarked size={20} className="text-blue-600" />
              </div>
              <span className="font-medium text-gray-900">{t("mypage.shortcutVocabulary")}</span>
            </div>
            <ChevronRight size={20} className="text-gray-400 shrink-0" />
          </button>
        </div>

        {/* 정보 */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-500">{t("mypage.sectionInfo")}</span>
          </div>

          <button onClick={() => navigate("/mypage/about")} className="w-full px-5 py-4 flex items-center justify-between border-b border-gray-100 active:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                <Heart size={20} className="text-pink-500" />
              </div>
              <span className="font-medium text-gray-900">{t("mypage.infoAbout")}</span>
            </div>
            <ChevronRight size={20} className="text-gray-400 shrink-0" />
          </button>

          <button onClick={() => navigate("/mypage/contact")} className="w-full px-5 py-4 flex items-center justify-between border-b border-gray-100 active:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <HelpCircle size={20} className="text-orange-500" />
              </div>
              <span className="font-medium text-gray-900">{t("mypage.infoSupport")}</span>
            </div>
            <ChevronRight size={20} className="text-gray-400 shrink-0" />
          </button>

          <button onClick={() => navigate("/mypage/license")} className="w-full px-5 py-4 flex items-center justify-between border-b border-gray-100 active:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <FileText size={20} className="text-gray-600" />
              </div>
              <span className="font-medium text-gray-900">{t("mypage.infoLicense")}</span>
            </div>
            <ChevronRight size={20} className="text-gray-400 shrink-0" />
          </button>

          <button onClick={() => navigate("/privacy-policy")} className="w-full px-5 py-4 flex items-center justify-between active:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Shield size={20} className="text-indigo-600" />
              </div>
              <span className="font-medium text-gray-900">{t("mypage.infoPrivacy")}</span>
            </div>
            <ChevronRight size={20} className="text-gray-400 shrink-0" />
          </button>
        </div>

        {/* 로그아웃 */}
        <Button variant="danger" onClick={() => setShowSignOutConfirm(true)} icon={<LogOut size={18} />}>
          {t("mypage.signOut")}
        </Button>
      </div>

      {/* 로그아웃 확인 모달 */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-5">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{t("mypage.signOutConfirmTitle")}</h3>
            <p className="text-gray-600 text-sm mb-6">{t("mypage.signOutConfirmDesc")}</p>
            <div className="flex gap-3">
              <Button variant="ghost" fullWidth onClick={() => setShowSignOutConfirm(false)}>
                {t("common.cancel")}
              </Button>
              <Button variant="danger" fullWidth onClick={signOut}>
                {t("mypage.signOut")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 리셋 시간 변경 확인 모달 */}
      {showResetHourConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-5">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{t("mypage.resetHourConfirmTitle")}</h3>
            <p className="text-gray-600 text-sm mb-6">{t("mypage.resetHourConfirmDesc")}</p>
            <div className="flex gap-3">
              <Button variant="ghost" fullWidth onClick={handleCancelResetHourConfirm}>
                {t("common.cancel")}
              </Button>
              <Button fullWidth onClick={handleConfirmResetHour}>
                {t("mypage.resetHourConfirmAction")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
