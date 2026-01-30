# App Store 심사 기록

## 2026-01-29 첫 번째 심사 거절

- **Submission ID:** 00aaa751-2a86-4b92-b1ff-9e0e4daa3c43
- **Review Device:** iPad Air 11-inch (M3)
- **Version:** 1.0

---

### 거절 사유 1: Guideline 4.8 - Sign in with Apple 필수

**문제:**
구글 로그인(제3자 로그인)을 제공하면서 동등한 로그인 옵션으로 Sign in with Apple을 제공하지 않음.

**Apple 요구사항:**

- 데이터 수집을 이름과 이메일로 제한
- 이메일 주소를 비공개로 유지할 수 있는 옵션 (Hide My Email)
- 광고 목적으로 앱 상호작용 수집하지 않음

**해결:**

- `@capacitor-community/apple-sign-in` 플러그인으로 Apple 로그인 구현 완료
- 로그인 화면에 "Apple로 계속하기" 버튼 추가
- 커밋: `e43f1d9` (심사 제출 이후 작업)

**참고:** Apple 프라이버시 릴레이 이메일(`@privaterelay.appleid.com`) 사용 시 마이페이지에 "Apple 사용자"로 표시되도록 처리함.

---

### 거절 사유 2: Guideline 5.1.1(v) - 계정 삭제 기능 필요

**문제:**
계정 생성을 지원하지만 계정 삭제 옵션이 없음.

**Apple 요구사항:**

- 임시 비활성화가 아닌 완전한 계정 삭제 제공
- 웹사이트에서 삭제 완료 시 직접 링크 제공
- 확인 단계는 허용되나, 고객 서비스 연락(전화/이메일) 필수는 고규제 산업만 가능

**해결:**

- 회원탈퇴 기능 이미 구현 완료
- 위치: 마이페이지 → 고객센터 → 회원탈퇴
- 커밋: `93151e9`

**재제출 시 필수 조치:**
App Store Connect → App Review Information → Notes에 다음 내용 추가:

```
Account Deletion:
1. Log in to the app
2. Tap the profile icon (My Page / 마이페이지)
3. Tap "고객센터" (Customer Service)
4. Tap "회원탈퇴" (Delete Account) button at the bottom

This permanently deletes the user's account and all associated data.
```

---

### 거절 사유 3: Guideline 1.5 - Support URL 문제

**문제:**
Support URL(`https://gre-vocab-master.vercel.app/`)이 지원 정보가 없는 페이지로 연결됨.

**Apple 요구사항:**

- 사용자가 질문하고 지원을 요청할 수 있는 정보 제공

**해결:**
App Store Connect에서 Support URL을 지원 정보가 있는 페이지로 변경 필요.

**옵션:**

1. `/support.html` 정적 페이지 생성 후 URL 변경
2. 기존 페이지에 문의 이메일(`sojjung3@gmail.com`) 정보 추가

---

## 재제출 체크리스트

- [ ] 최신 빌드로 업데이트 (Apple 로그인 포함)
- [ ] App Review Notes에 계정 삭제 위치 명시
- [ ] Support URL 변경 (지원 정보 포함된 페이지로)
- [ ] 스크린샷 업데이트 (Apple 로그인 버튼 포함)

---

## 참고 문서

- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Sign in with Apple Guidelines](https://developer.apple.com/sign-in-with-apple/get-started/)
- [Account Deletion Requirements](https://developer.apple.com/support/offering-account-deletion-in-your-app/)
