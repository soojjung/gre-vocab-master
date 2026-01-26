# iOS 앱 배포 가이드

Capacitor를 사용한 iOS App Store 배포 가이드.

---

## 사전 준비

### 필수 요구사항

| 항목 | 설명 |
|------|------|
| **Mac** | Xcode는 macOS에서만 실행 가능 |
| **Xcode** | App Store에서 설치 (무료) |
| **Apple Developer 계정** | $99/년 - [developer.apple.com](https://developer.apple.com) |
| **CocoaPods** | `sudo gem install cocoapods` |

---

## 프로젝트 구조

```
ios/
├── App/
│   ├── App/
│   │   ├── AppDelegate.swift
│   │   ├── Info.plist          # 앱 설정
│   │   ├── public/             # 웹 빌드 결과물
│   │   └── Assets.xcassets/    # 앱 아이콘, 이미지
│   ├── App.xcodeproj
│   └── Podfile                 # CocoaPods 의존성
└── capacitor-cordova-ios-plugins/
```

---

## 개발 워크플로우

### 1. 웹 빌드 및 동기화

```bash
# 웹 앱 빌드
npm run build

# iOS 프로젝트에 복사
npx cap sync ios
```

### 2. Xcode에서 열기

```bash
npx cap open ios
```

### 3. 시뮬레이터에서 테스트

Xcode에서:
1. 상단 기기 선택 드롭다운에서 시뮬레이터 선택
2. ▶️ Run 버튼 클릭 (또는 Cmd + R)

### 4. 실제 기기에서 테스트

1. iPhone을 USB로 연결
2. Xcode에서 기기 선택
3. Team 설정 (Signing & Capabilities)
4. ▶️ Run

---

## 앱 아이콘 설정

### 필요한 크기

| 용도 | 크기 |
|------|------|
| iPhone Notification | 20pt (2x: 40px, 3x: 60px) |
| iPhone Settings | 29pt (2x: 58px, 3x: 87px) |
| iPhone Spotlight | 40pt (2x: 80px, 3x: 120px) |
| iPhone App | 60pt (2x: 120px, 3x: 180px) |
| App Store | 1024x1024px |

### 설정 방법

1. Xcode에서 `Assets.xcassets` 열기
2. `AppIcon` 선택
3. 각 슬롯에 해당 크기 이미지 드래그

**팁:** [App Icon Generator](https://appicon.co/) 사용하면 한 이미지로 모든 크기 생성 가능

---

## 앱 정보 설정 (Info.plist)

`ios/App/App/Info.plist`에서 설정:

```xml
<!-- 앱 표시 이름 -->
<key>CFBundleDisplayName</key>
<string>GRE 단어</string>

<!-- 버전 -->
<key>CFBundleShortVersionString</key>
<string>1.0.0</string>

<!-- 빌드 번호 -->
<key>CFBundleVersion</key>
<string>1</string>
```

---

## App Store 출시

### 1. App Store Connect 설정

1. [App Store Connect](https://appstoreconnect.apple.com) 접속
2. "앱" → "+" → "새로운 앱"
3. 앱 정보 입력:
   - 이름: 단어의 신 GRE
   - 기본 언어: 한국어
   - 번들 ID: com.suya.grevocab
   - SKU: grevocab

### 2. Xcode에서 Archive 생성

1. 기기를 "Any iOS Device"로 선택
2. Product → Archive
3. Archive 완료 후 Organizer 창 열림

### 3. App Store에 업로드

1. Organizer에서 "Distribute App" 클릭
2. "App Store Connect" 선택
3. "Upload" 선택
4. 옵션 확인 후 업로드

### 4. 심사 제출

App Store Connect에서:
1. 빌드 선택
2. 앱 정보, 스크린샷, 설명 입력
3. "심사를 위해 제출"

---

## 스크린샷 요구사항

| 기기 | 크기 |
|------|------|
| iPhone 6.9" | 1320 x 2868 |
| iPhone 6.7" | 1290 x 2796 |
| iPhone 6.5" | 1284 x 2778 |
| iPhone 5.5" | 1242 x 2208 |

**최소 1세트 필수**, 최대 10장

---

## 자주 쓰는 명령어

```bash
# 웹 빌드 + iOS 동기화
npm run build && npx cap sync ios

# Xcode 열기
npx cap open ios

# 변경사항만 복사 (빠름)
npx cap copy ios

# CocoaPods 업데이트
cd ios/App && pod install
```

---

## 트러블슈팅

### "Signing requires a development team"

Xcode → Signing & Capabilities → Team 선택

### "Pod install failed"

```bash
cd ios/App
pod repo update
pod install
```

### 웹 변경사항이 반영 안됨

```bash
npm run build && npx cap sync ios
```

---

## 버전 관리

앱 업데이트 시:
1. `Info.plist`에서 `CFBundleShortVersionString` 증가 (예: 1.0.0 → 1.1.0)
2. `CFBundleVersion` 증가 (빌드마다 증가)
3. 다시 Archive → Upload

---

## 참고 링크

- [Capacitor iOS 문서](https://capacitorjs.com/docs/ios)
- [App Store 심사 가이드라인](https://developer.apple.com/app-store/review/guidelines/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
