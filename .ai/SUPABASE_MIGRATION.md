# Firebase → Supabase 마이그레이션

## 마이그레이션 결정 배경 (2026-01-26)

### Firebase에서 겪은 문제점들

#### 1. PWA Google 로그인 복잡성

- `signInWithPopup`이 PWA standalone 모드에서 실패
- cross-origin 이슈로 `signInWithRedirect`도 불안정
- popup → redirect 폴백 로직 구현에 3개 커밋 소요 (여전히 불안정)

```tsx
// 현재 복잡한 로직 (AuthContext.tsx)
try {
  await signInWithPopup(auth, googleProvider);
} catch (popupError) {
  if (errorMessage.includes("popup") || errorMessage.includes("cross-origin")) {
    await signInWithRedirect(auth, googleProvider);
  }
}
```

#### 2. Firebase Auth 번들 크기

- Firebase Auth만 ~90KB
- 전체 Firebase SDK ~250KB
- lazy loading으로 최적화했지만 코드 복잡성 증가

#### 3. 관리 포인트 분산

- Firebase Console + Google Cloud Console 동시 관리 필요
- OAuth 설정이 두 곳에 분산

#### 4. Firestore 한계

- NoSQL이라 복잡한 쿼리 어려움
- 가격이 읽기/쓰기 횟수 기반 (예측 어려움)

---

## Supabase란?

### 개요

| 항목 | 설명                                            |
| ---- | ----------------------------------------------- |
| 정의 | 오픈소스 Firebase 대안 (Backend as a Service)   |
| DB   | PostgreSQL (관계형, SQL 사용 가능)              |
| 인증 | 내장 Auth (Google, Email 등)                    |
| 특징 | Row Level Security, 실시간 구독, Edge Functions |

### Firebase vs Supabase

| 비교      | Firebase            | Supabase              |
| --------- | ------------------- | --------------------- |
| DB 타입   | Firestore (NoSQL)   | PostgreSQL (관계형)   |
| 쿼리      | Firebase Query      | SQL                   |
| 보안      | Firestore Rules     | Row Level Security    |
| 번들 크기 | ~250KB              | ~170KB (gzip: 44KB)   |
| 가격      | 읽기/쓰기 횟수 기반 | 용량 기반 (예측 가능) |
| 오프라인  | 내장 Persistence    | 별도 구현 필요        |
| 오픈소스  | X                   | O                     |

### 왜 Supabase인가?

1. **더 심플한 OAuth** - popup/redirect 이슈 적음
2. **작은 번들** - ~170KB (30% 절감)
3. **SQL 사용** - 복잡한 쿼리, JOIN 가능
4. **예측 가능한 가격** - 무료 티어 넉넉
5. **통합 대시보드** - 한 곳에서 모든 관리

---

## 데이터베이스 스키마

### 테이블 구조 (2개 테이블)

```sql
-- 1. 사용자 프로필
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 사용자 학습 데이터 (progress를 JSONB로 포함)
CREATE TABLE user_data (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,

  -- 메타데이터
  streak INTEGER DEFAULT 0,
  last_study_date DATE,
  target_date DATE,
  daily_goal INTEGER DEFAULT 30,
  today_learned TEXT[] DEFAULT '{}',
  onboarding_complete BOOLEAN DEFAULT FALSE,
  auto_speak BOOLEAN DEFAULT TRUE,

  -- 세션 정보 (JSONB)
  today_session JSONB,

  -- 단어별 진행 상황 (JSONB)
  progress JSONB DEFAULT '{}',

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) 정책
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 데이터만 접근 가능
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own data"
  ON user_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own data"
  ON user_data FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data"
  ON user_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- DELETE 정책 (2026-06-18 추가, supabase-migration-delete-policies.sql 참조)
-- AuthContext.deleteAccount() 의 client-side delete 가 RLS default-deny 로
-- no-op 였던 사일런트 버그 패치. 이중 안전망 (코드 명시 삭제 + CASCADE) 복원.
CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

CREATE POLICY "Users can delete own data"
  ON user_data FOR DELETE
  USING (auth.uid() = user_id);

-- 새 사용자 가입 시 자동으로 profiles 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### progress JSONB 구조

```json
{
  "word_123": {
    "status": "learning",
    "correctCount": 3,
    "wrongCount": 1,
    "nextReview": "2026-01-28",
    "interval": 3,
    "bookmarked": false,
    "lastStudied": "2026-01-26"
  },
  "word_456": {
    "status": "mastered",
    "correctCount": 5,
    "wrongCount": 0,
    "nextReview": "2026-02-10",
    "interval": 14,
    "bookmarked": true
  }
}
```

---

## 영향 받는 파일

| 파일                           | 변경 내용                                 |
| ------------------------------ | ----------------------------------------- |
| `src/lib/firebase.ts`          | 삭제 → `src/lib/supabase.ts` 생성         |
| `src/contexts/AuthContext.tsx` | Supabase Auth로 전환                      |
| `src/hooks/useUserData.ts`     | Supabase Client로 전환                    |
| `src/pages/Login.tsx`          | 에러 처리 수정                            |
| `src/pages/LicensePage.tsx`    | Firebase 라이선스 제거                    |
| `package.json`                 | firebase 제거, @supabase/supabase-js 추가 |
| `.env`                         | Firebase 환경변수 → Supabase 환경변수     |

---

## 오프라인 지원 전략

Firebase Persistence 대체:

```
┌─────────────────────────────────────┐
│              App                    │
├─────────────────────────────────────┤
│  TanStack Query                     │
│  + persistQueryClient (IndexedDB)   │
├─────────────────────────────────────┤
│  Supabase Client                    │
└─────────────────────────────────────┘
```

- **TanStack Query**: 데이터 캐싱, stale-while-revalidate
- **IndexedDB Persistence**: 오프라인 시 캐시 사용
- **낙관적 업데이트**: 즉시 UI 반영, 백그라운드 동기화

---

## 기존 사용자 마이그레이션

**대상**: 2명

### 방법

1. Firestore에서 데이터 export (Firebase Console)
2. JSON 변환 후 Supabase에 수동 insert
3. 사용자에게 재로그인 안내 (동일 Google 계정)

---

## 구현 순서

### Phase 1: 기반 구축 ✅

- [x] Supabase 프로젝트 생성
- [x] 위 SQL로 테이블 및 RLS 생성
- [x] Google OAuth 설정
- [x] `src/lib/supabase.ts` 생성

### Phase 2: 인증 전환 ✅

- [x] AuthContext를 Supabase Auth로 변경
- [x] 로그인/로그아웃 테스트

### Phase 3: 데이터 레이어 전환 ✅

- [x] useUserData를 Supabase로 변경
- [ ] TanStack Query 도입 (추후)
- [ ] 오프라인 persistence 설정 (추후)

### Phase 4: 정리 ✅

- [x] 기존 사용자 데이터 마이그레이션 (스킵 - 데이터 적음)
- [x] Firebase 패키지 및 코드 제거
- [x] 환경변수 정리
- [x] 문서 업데이트

---

## 마이그레이션 중 겪은 이슈들

### 1. `user.uid` → `user.id`

Firebase User는 `uid`, Supabase User는 `id` 사용

```tsx
// Firebase
const userId = user.uid;

// Supabase
const userId = user.id;
```

### 2. `.single()` → `.maybeSingle()`

데이터가 없을 때 `.single()`은 406 에러 발생

```tsx
// 에러 발생
const { data } = await supabase.from("user_data").select("*").eq("user_id", id).single();

// 정상 동작 (없으면 null 반환)
const { data } = await supabase.from("user_data").select("*").eq("user_id", id).maybeSingle();
```

### 3. AuthContext `setLoading` 이슈

로그인 시도 시 `setLoading(true)` 호출하면 Login 컴포넌트가 언마운트되어 에러 메시지가 표시 안 됨

- **해결**: 이메일/비밀번호 로그인에서는 AuthContext의 loading을 건드리지 않음

### 4. 에러 처리는 `error.code` 사용

Supabase AuthError는 `code` 속성으로 에러 타입 구분

```tsx
const code = (error as { code?: string })?.code;
const errorMessages: Record<string, string> = {
  invalid_credentials: "이메일 또는 비밀번호가 올바르지 않습니다",
  // ...
};
```

---

## 환경변수

```bash
# .env (Supabase)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 참고 링크

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase Auth with React](https://supabase.com/docs/guides/auth/quickstarts/react)
- [TanStack Query Persistence](https://tanstack.com/query/latest/docs/framework/react/plugins/persistQueryClient)
- [Supabase Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google)
