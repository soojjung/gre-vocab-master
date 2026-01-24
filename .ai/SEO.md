# SEO (Search Engine Optimization) 가이드

프론트엔드 개발자가 챙겨야 할 SEO 체크리스트와 구현 방법.

---

## 1. 기본 메타 태그

### 필수 태그

```html
<!-- 페이지 제목 (50-60자 권장) -->
<title>단어의 신 GRE - 한국인을 위한 GRE 단어 암기 앱</title>

<!-- 페이지 설명 (150-160자 권장) -->
<meta name="description" content="GRE 시험 대비 1,560개 필수 영단어..." />

<!-- 키워드 (쉼표로 구분, 10-20개 권장) -->
<meta name="keywords" content="GRE, GRE 단어, 영단어 암기..." />

<!-- 정식 URL (중복 콘텐츠 방지) -->
<link rel="canonical" href="https://example.com/page" />

<!-- 언어 설정 -->
<html lang="ko">
```

### 뷰포트 설정 (모바일 필수)

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

---

## 2. Open Graph (소셜 미디어 공유)

카카오톡, 페이스북, 슬랙 등에서 링크 공유 시 표시되는 정보.

```html
<meta property="og:type" content="website" />
<meta property="og:title" content="페이지 제목" />
<meta property="og:description" content="페이지 설명" />
<meta property="og:url" content="https://example.com" />
<meta property="og:image" content="https://example.com/og-image.png" />
<meta property="og:locale" content="ko_KR" />
<meta property="og:site_name" content="사이트명" />
```

### OG 이미지 가이드라인

| 플랫폼 | 권장 크기 | 비율 |
|--------|-----------|------|
| 페이스북 | 1200x630 | 1.91:1 |
| 트위터 | 1200x600 | 2:1 |
| 카카오톡 | 800x400 | 2:1 |
| 링크드인 | 1200x627 | 1.91:1 |

**범용 권장: 1200x630px**

---

## 3. Twitter Card

트위터(X) 공유 최적화.

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="페이지 제목" />
<meta name="twitter:description" content="페이지 설명" />
<meta name="twitter:image" content="https://example.com/og-image.png" />
<meta name="twitter:site" content="@twitter_handle" />
```

**card 타입:**
- `summary`: 작은 이미지 + 텍스트
- `summary_large_image`: 큰 이미지 (권장)

---

## 4. 구조화 데이터 (JSON-LD)

검색 결과에 리치 스니펫(별점, 가격 등)을 표시.

### WebApplication 예시

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "앱 이름",
  "description": "앱 설명",
  "url": "https://example.com",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "KRW"
  }
}
</script>
```

### 자주 쓰는 @type

| 타입 | 용도 |
|------|------|
| `WebApplication` | 웹 앱 |
| `Article` | 블로그/뉴스 |
| `Product` | 상품 |
| `Organization` | 회사/단체 |
| `Person` | 개인 |
| `FAQPage` | FAQ 페이지 |
| `HowTo` | 가이드/튜토리얼 |

**검증 도구:** [Google Rich Results Test](https://search.google.com/test/rich-results)

---

## 5. robots.txt

검색엔진 크롤러에게 크롤링 규칙 전달.

```txt
# 모든 크롤러 허용
User-agent: *
Allow: /

# 특정 경로 차단
Disallow: /api/
Disallow: /admin/

# 사이트맵 위치
Sitemap: https://example.com/sitemap.xml
```

**위치:** `public/robots.txt` (루트에 배포됨)

---

## 6. sitemap.xml

검색엔진에 사이트 구조 알림.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2026-01-24</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

### priority 가이드

| 값 | 용도 |
|----|------|
| 1.0 | 홈페이지 |
| 0.8-0.9 | 주요 페이지 |
| 0.5-0.7 | 일반 페이지 |
| 0.3-0.4 | 부가 페이지 |

**위치:** `public/sitemap.xml`

---

## 7. SPA/React 앱 SEO 문제와 해결

### 문제점

React SPA는 JavaScript로 렌더링되어 검색엔진이 콘텐츠를 제대로 인덱싱하지 못할 수 있음.

### 해결 방법

| 방법 | 설명 | 난이도 |
|------|------|--------|
| **SSR** | Next.js 등으로 서버 사이드 렌더링 | 높음 |
| **SSG** | 빌드 시 정적 HTML 생성 | 중간 |
| **Prerendering** | 크롤러용 정적 페이지 생성 | 낮음 |
| **동적 렌더링** | 크롤러에게만 SSR 제공 | 중간 |

### React Helmet (메타 태그 동적 변경)

```tsx
import { Helmet } from 'react-helmet-async';

function Page() {
  return (
    <>
      <Helmet>
        <title>페이지 제목</title>
        <meta name="description" content="설명" />
      </Helmet>
      {/* 페이지 내용 */}
    </>
  );
}
```

---

## 8. 성능 최적화 (Core Web Vitals)

Google 검색 순위에 영향을 주는 성능 지표.

### LCP (Largest Contentful Paint)

가장 큰 콘텐츠가 표시되는 시간. **2.5초 이내** 권장.

```tsx
// 이미지 lazy loading
<img loading="lazy" src="..." alt="..." />

// 중요 이미지는 eager
<img loading="eager" src="..." alt="..." />

// 프리로드
<link rel="preload" href="/hero.webp" as="image" />
```

### FID (First Input Delay) / INP

사용자 입력에 대한 반응 시간. **100ms 이내** 권장.

```tsx
// 무거운 작업은 Web Worker로
// 긴 태스크는 분할
// 불필요한 JavaScript 제거
```

### CLS (Cumulative Layout Shift)

레이아웃 이동 정도. **0.1 이하** 권장.

```tsx
// 이미지에 크기 지정
<img width="400" height="300" src="..." alt="..." />

// 폰트 로딩 최적화
<link rel="preload" href="/font.woff2" as="font" crossorigin />
```

**측정 도구:**
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Lighthouse](https://developer.chrome.com/docs/lighthouse/)

---

## 9. 이미지 최적화

```tsx
// WebP 포맷 사용 (30% 더 작음)
<picture>
  <source srcset="/image.webp" type="image/webp" />
  <img src="/image.jpg" alt="설명" />
</picture>

// 반응형 이미지
<img
  srcset="small.jpg 480w, medium.jpg 800w, large.jpg 1200w"
  sizes="(max-width: 600px) 480px, 800px"
  src="medium.jpg"
  alt="설명"
/>
```

### alt 텍스트 작성법

```html
<!-- 나쁜 예 -->
<img alt="이미지" />
<img alt="IMG_1234.jpg" />

<!-- 좋은 예 -->
<img alt="GRE 단어 플래시카드 학습 화면" />
```

---

## 10. URL 구조

```
# 좋은 URL
/study
/words/aberrant
/quiz/verbal

# 나쁜 URL
/page?id=123
/study?word=1&mode=2
```

### React Router에서 클린 URL

```tsx
// 동적 라우트
<Route path="/words/:wordId" element={<WordDetail />} />

// 한글 URL은 인코딩됨 (피하는 것이 좋음)
```

---

## 11. 접근성 (a11y)

SEO와 접근성은 밀접하게 연관됨.

```tsx
// 시맨틱 태그 사용
<header>, <nav>, <main>, <article>, <section>, <footer>

// 헤딩 계층 구조
<h1>메인 제목</h1>
  <h2>섹션 제목</h2>
    <h3>서브 제목</h3>

// 링크에 명확한 텍스트
<a href="/about">더보기</a>  // 나쁨
<a href="/about">개발자 소개 보기</a>  // 좋음

// aria 레이블
<button aria-label="메뉴 열기">
  <MenuIcon />
</button>
```

---

## 12. 국제화 (i18n)

다국어 사이트의 경우.

```html
<!-- 현재 페이지 언어 -->
<html lang="ko">

<!-- 대체 언어 페이지 -->
<link rel="alternate" hreflang="en" href="https://example.com/en/" />
<link rel="alternate" hreflang="ko" href="https://example.com/ko/" />
<link rel="alternate" hreflang="x-default" href="https://example.com/" />
```

---

## 13. 체크리스트

### 배포 전 필수 확인

- [ ] `<title>` 설정 (50-60자)
- [ ] `<meta name="description">` 설정 (150-160자)
- [ ] `<meta name="keywords">` 설정
- [ ] `<link rel="canonical">` 설정
- [ ] Open Graph 태그 설정
- [ ] Twitter Card 태그 설정
- [ ] og-image.png 생성 (1200x630)
- [ ] robots.txt 생성
- [ ] sitemap.xml 생성
- [ ] JSON-LD 구조화 데이터 추가
- [ ] 모든 이미지에 alt 속성
- [ ] 시맨틱 HTML 사용
- [ ] HTTPS 적용
- [ ] 모바일 반응형

### 배포 후 확인

- [ ] [Google Search Console](https://search.google.com/search-console) 등록
- [ ] [Naver Search Advisor](https://searchadvisor.naver.com/) 등록
- [ ] sitemap 제출
- [ ] PageSpeed Insights 점수 확인
- [ ] 소셜 미디어 공유 테스트

---

## 14. 유용한 도구

| 도구 | 용도 | URL |
|------|------|-----|
| Google Search Console | 검색 성능 모니터링 | search.google.com/search-console |
| Naver Search Advisor | 네이버 검색 등록 | searchadvisor.naver.com |
| PageSpeed Insights | 성능 측정 | pagespeed.web.dev |
| Rich Results Test | 구조화 데이터 검증 | search.google.com/test/rich-results |
| Meta Tags Preview | OG 태그 미리보기 | metatags.io |
| Ahrefs/SEMrush | 키워드 분석 | ahrefs.com / semrush.com |

---

## 15. 이 프로젝트 현황

### 적용 완료

- [x] index.html 메타 태그 (title, description, keywords)
- [x] Open Graph 태그
- [x] Twitter Card 태그
- [x] JSON-LD 구조화 데이터
- [x] robots.txt
- [x] sitemap.xml
- [x] og-image.png (1200x630)
- [x] PWA manifest

### 추가 고려 사항

- [ ] React Helmet으로 페이지별 메타 태그 동적 변경
- [ ] Google Search Console 등록
- [ ] Naver Search Advisor 등록
- [ ] 동적 sitemap 생성 (단어 상세 페이지 등)
