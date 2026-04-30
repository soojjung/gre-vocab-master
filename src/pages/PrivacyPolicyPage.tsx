import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white relative">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="h-[env(safe-area-inset-top,0px)] bg-white" />
        <div className="h-14 px-4 flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600" aria-label="뒤로">
            <ArrowLeft size={24} />
          </button>
          <h1 className="flex-1 text-center font-bold text-lg pr-8">개인정보처리방침</h1>
        </div>
      </header>

      <article className="max-w-2xl mx-auto px-5 pt-[calc(4.5rem+env(safe-area-inset-top,0px))] pb-[calc(3rem+env(safe-area-inset-bottom,0px))] text-gray-800 leading-relaxed">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">개인정보처리방침</h2>
        <p className="text-sm text-gray-500 mb-6">시행일: 2026년 1월 27일</p>

        <p className="text-sm mb-5">
          「단어의 신 GRE」(이하 "앱")는 이용자의 개인정보를 소중히 여기며, 개인정보 보호법 및 관련 법령을 준수합니다. 본 방침은 앱이
          수집하는 개인정보의 항목, 이용 목적, 보유 기간 등을 안내합니다.
        </p>

        <h3 className="text-base font-semibold text-gray-900 mt-6 mb-2">1. 수집하는 개인정보</h3>
        <p className="text-sm mb-2">앱은 서비스 제공을 위해 아래 정보를 수집합니다.</p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>
            <strong>이메일 주소:</strong> 회원가입 및 로그인 시 수집 (이메일 로그인 또는 Google 계정 연동)
          </li>
          <li>
            <strong>학습 데이터:</strong> 단어 학습 진행률, 퀴즈 결과, 북마크, 설정 값 (목표 시험일, 일일 학습량)
          </li>
        </ul>
        <p className="text-sm mt-2">앱은 이름, 전화번호, 주소, 결제 정보 등 민감한 개인정보를 수집하지 않습니다.</p>

        <h3 className="text-base font-semibold text-gray-900 mt-6 mb-2">2. 개인정보의 이용 목적</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>회원 식별 및 로그인 서비스 제공</li>
          <li>학습 데이터의 클라우드 저장 및 기기 간 동기화</li>
          <li>서비스 개선 및 오류 해결</li>
        </ul>

        <h3 className="text-base font-semibold text-gray-900 mt-6 mb-2">3. 개인정보의 보유 및 파기</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>회원 탈퇴 시 모든 개인정보를 즉시 파기합니다.</li>
          <li>서비스 이용 중에는 위 목적 범위 내에서 보유합니다.</li>
          <li>관련 법령에 의해 보존이 필요한 경우 해당 기간 동안 보관합니다.</li>
        </ul>

        <h3 className="text-base font-semibold text-gray-900 mt-6 mb-2">4. 개인정보의 제3자 제공</h3>
        <p className="text-sm mb-2">앱은 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 아래의 경우는 예외로 합니다.</p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>이용자가 사전에 동의한 경우</li>
          <li>법령에 따른 요청이 있는 경우</li>
        </ul>

        <h3 className="text-base font-semibold text-gray-900 mt-6 mb-2">5. 개인정보의 위탁</h3>
        <p className="text-sm mb-2">앱은 서비스 운영을 위해 아래 업체에 개인정보 처리를 위탁합니다.</p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>
            <strong>Supabase Inc.:</strong> 데이터베이스 및 인증 서비스 (이메일, 학습 데이터 저장)
          </li>
          <li>
            <strong>Google LLC:</strong> Google OAuth 로그인 서비스
          </li>
        </ul>

        <h3 className="text-base font-semibold text-gray-900 mt-6 mb-2">6. 이용자의 권리</h3>
        <p className="text-sm mb-2">이용자는 언제든지 아래 권리를 행사할 수 있습니다.</p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>개인정보 열람, 수정, 삭제 요청</li>
          <li>회원 탈퇴 및 데이터 삭제 요청</li>
          <li>개인정보 처리 정지 요청</li>
        </ul>

        <h3 className="text-base font-semibold text-gray-900 mt-6 mb-2">7. 개인정보의 안전성 확보 조치</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>모든 데이터 전송은 HTTPS(SSL/TLS) 암호화를 통해 이루어집니다.</li>
          <li>비밀번호는 단방향 암호화(해시)하여 저장됩니다.</li>
          <li>접근 권한을 최소화하여 개인정보를 관리합니다.</li>
        </ul>

        <h3 className="text-base font-semibold text-gray-900 mt-6 mb-2">8. 방침의 변경</h3>
        <p className="text-sm">본 방침이 변경될 경우, 앱 내 공지 또는 이메일을 통해 사전 안내합니다.</p>

        <h3 className="text-base font-semibold text-gray-900 mt-6 mb-2">9. 문의</h3>
        <p className="text-sm mb-1">개인정보 관련 문의사항이 있으시면 아래로 연락해 주세요.</p>
        <p className="text-sm">이메일: sojjung3@gmail.com</p>
      </article>
    </div>
  );
}
