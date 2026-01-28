# Apple Sign-In 구현 계획

2026-01-28 작성. App Store 심사 요구사항 대응.

## 배경

App Store Review Guideline 4.8에 따라, 타사 소셜 로그인(Google)을 제공하는 앱은 Apple 로그인도 반드시 제공해야 합니다.

## 아키텍처

```
iOS 네이티브:
  @capacitor-community/apple-sign-in 플러그인
  → ASAuthorizationController (시스템 네이티브 UI)
  → Apple ID Token + nonce 반환
  → supabase.auth.signInWithIdToken({ provider: "apple", token, nonce })
  → 세션 생성

웹:
  supabase.auth.signInWithOAuth({ provider: "apple" })
  → Apple 웹 인증 페이지로 리디렉트
  → 콜백으로 세션 생성
```

## 사전 작업 (수동)

### 1. Apple Developer Portal
- https://developer.apple.com/account/resources/identifiers
- App ID (`com.sooya.grevocab`) → "Sign in with Apple" 활성화
- Service ID 생성: `com.sooya.grevocab.web`
  - Domain: `tmxnpuleiluskpifchsb.supabase.co`
  - Return URL: `https://tmxnpuleiluskpifchsb.supabase.co/auth/v1/callback`
- Key 생성 → `.p8` 파일 다운로드, Key ID 기록

### 2. Supabase Dashboard
- Authentication → Providers → Apple 활성화
  - Client ID: `com.sooya.grevocab.web`
  - Secret Key: `.p8` 파일 내용
  - Key ID: Apple 발급 Key ID
  - Team ID: `6KCGZ5594F`

### 3. Xcode
- Targets → App → Signing & Capabilities → "+ Capability" → "Sign in with Apple"

## 코드 변경

### 패키지 설치
```bash
npm install @capacitor-community/apple-sign-in
npx cap sync ios
```

### 수정 파일

| 파일 | 변경 내용 |
|------|-----------|
| `capacitor.config.ts` | appId를 `com.sooya.grevocab`로 수정 |
| `src/contexts/AuthContext.tsx` | `signInWithApple()` 메서드 추가, nonce 생성 유틸 |
| `src/pages/Login.tsx` | Apple 로그인 버튼 UI 추가 |

### AuthContext.tsx 핵심 로직

```typescript
// 네이티브 iOS
const result = await SignInWithApple.authorize({
  clientId: "com.sooya.grevocab",
  redirectURI: "https://tmxnpuleiluskpifchsb.supabase.co/auth/v1/callback",
  scopes: "email name",
  nonce: rawNonce,
});

await supabase.auth.signInWithIdToken({
  provider: "apple",
  token: result.response.identityToken,
  nonce: rawNonce,
});

// 웹
await supabase.auth.signInWithOAuth({
  provider: "apple",
  options: { redirectTo: window.location.origin },
});
```

### Login.tsx Apple 버튼

- Google 버튼 아래에 배치
- 검정 배경 + 흰색 Apple 로고 (Apple HIG 준수)
- 라벨: "Apple로 계속하기"
- 취소 시 에러 무시 처리

## 주의사항

- Apple은 사용자 이름을 **최초 로그인 시에만** 전달 (이후 재전송 안 함)
- Apple Private Relay 이메일 사용 가능 (xxx@privaterelay.appleid.com)
- nonce는 raw(해시 안 한) 값을 Supabase에 전달해야 함
- Capacitor 플러그인이 SHA-256 해시를 Apple에 전송하고, Supabase가 raw nonce를 다시 해시해서 비교
