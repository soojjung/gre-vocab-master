# Firebase 설정 방법

앱이 작동하려면 Firebase 프로젝트를 생성하고 설정해야 합니다:

## 1. Firebase 프로젝트 생성

1. https://console.firebase.google.com 접속
2. 프로젝트 추가 클릭
3. 프로젝트 이름 입력 (예: gre-vocab-app)
4. Google Analytics는 선택사항 (나중에 추가 가능)

## 2. 웹 앱 추가

1. 프로젝트 대시보드에서 </> (웹) 아이콘 클릭
2. 앱 닉네임 입력 (예: gre-web)
3. Firebase SDK 설정 및 구성에서 설정값 복사

## 3. 환경 변수 설정

프로젝트 루트에 .env 파일 생성:

```bash
cp .env.example .env
```

.env 파일에 Firebase 설정값 입력:

```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

## 4. Authentication 활성화

1. 좌측 메뉴 Build > Authentication 클릭
2. 시작하기 클릭
3. Sign-in method 탭에서:

   - 이메일/비밀번호 → 활성화
   - Google → 활성화 (프로젝트 공개 이름 설정: 단어의 신 GRE)

## 5. Firestore 생성

1. 좌측 메뉴 Build > Firestore Database 클릭
2. 데이터베이스 만들기 클릭
3. 프로덕션 모드 선택 → 위치 선택 (asia-northeast3 = 서울)
4. 규칙 탭에서 아래 규칙 입력:

```
rules_version = '2';

service cloud.firestore {
    match /databases/{database}/documents {
        match /users/{userId}/{document=\*\*} {
            allow read, write: if request.auth != null && request.auth.uid == userId;
        }
    }
}
```

## 6. 개발 서버 재시작

```bash
npm run dev
```

---

설정 완료 후 앱에 접속하면 로그인 화면이 표시됩니다. 설정 중 도움이 필요하면 말씀해주세요!
