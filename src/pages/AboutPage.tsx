import { useNavigate } from "react-router-dom";
import { BackHeader } from "@/components/BackHeader";

export function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <BackHeader title="개발자의 말" onBack={() => navigate("/mypage")} />

      <div className="px-5 pt-[calc(5rem+env(safe-area-inset-top))] pb-12">
        <div className="bg-white rounded-2xl p-6 space-y-6">
          <div className="text-center">
            <div className="text-4xl mb-2">👋</div>
            <h2 className="text-xl font-bold text-gray-900">안녕하세요, 개발자 수야입니다</h2>
          </div>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p className="text-[15px]">이 앱은 제가 미국 유학을 준비하면서 GRE 단어를 공부하던 중, “왜 한국어로 편하게 공부할 수 있는 앱이 없을까?”라는 생각에서 시작되었습니다. 결국 제가 쓰려고 직접 만들게 되었고, 그렇게 탄생한 것이 한국인을 위한 GRE 단어 학습 앱입니다.</p>
            <p className="text-[15px]">혼자 쓰기에는 아까워서, 저처럼 유학을 꿈꾸는 분들께 조금이나마 도움이 되었으면 하는 마음으로 앱을 공개하게 되었습니다.</p>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <h3 className="font-bold text-gray-900">이런 기능들이 있어요</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <div>
                    <strong>플래시카드 학습</strong>
                    <p className="text-gray-500">영어 단어를 보고 뜻을 떠올린 후 확인해요</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <div>
                    <strong>간격 반복 학습</strong>
                    <p className="text-gray-500">틀린 단어는 자주, 맞은 단어는 간격을 늘려서 복습해요</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <div>
                    <strong>퀴즈 모드</strong>
                    <p className="text-gray-500">빈칸 채우기와 객관식으로 실력을 점검해요</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <div>
                    <strong>발음 듣기</strong>
                    <p className="text-gray-500">영어 발음을 들으며 함께 암기해요</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 space-y-3">
              <h3 className="font-bold text-gray-900">이렇게 공부하면 효과적이에요</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">1.</span>
                  <span>매일 꾸준히 일일 목표량만큼 학습하세요</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">2.</span>
                  <div>
                    <span>복습 알림이 오면 꼭 복습하세요</span>
                    <p className="text-gray-500">간격 반복이 핵심이에요</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">3.</span>
                  <span>퀴즈로 주기적으로 실력을 점검하세요</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">4.</span>
                  <span>헷갈리는 단어는 북마크해두고 집중 복습하세요</span>
                </li>
              </ul>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-[15px]">이 글을 언제, 어떤 분이 읽고 계실지는 모르지만, 이 앱이 여러분의 긴 준비 과정에 작은 힘이 되었으면 좋겠습니다. 꾸준히 공부하셔서 GRE에서도 좋은 결과를 얻고, 꼭 원하는 목표에 도달하시길 진심으로 응원할게요.</p>{" "}
            </div>

            <div className="text-center pt-2">
              <p className="text-lg font-medium text-gray-900">여러분의 유학 성공을 응원합니다! 🎓</p>
            </div>
          </div>

          <div className="text-right text-sm text-gray-500">- 수야 드림</div>
        </div>
      </div>
    </div>
  );
}
