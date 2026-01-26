# Supabase 설정 방법

## 1. Supabase 프로젝트 생성

1. https://supabase.com 접속
2. GitHub으로 로그인
3. "New Project" 생성
   - **Name**: gre-vocab
   - **Database Password**: 안전한 비밀번호
   - **Region**: Northeast Asia (Seoul)

## 2. 데이터베이스 스키마 생성

**SQL Editor**에서 [SUPABASE_MIGRATION.md](./SUPABASE_MIGRATION.md)의 SQL 실행

## 3. Google OAuth 설정

1. **Supabase**: Authentication > Providers > Google 활성화
2. **Google Cloud Console**: OAuth Client의 redirect URI에 추가:
   ```
   https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
   ```

## 4. 환경 변수 설정

**Settings > API**에서 복사 → `.env` 파일에 입력:

```bash
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

## 5. 개발 서버 실행

```bash
npm run dev
```
