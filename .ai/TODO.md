# 백로그 / 아이디어 노트

"단어의 신 GRE" 의 미래 작업/아이디어 목록. 한 줄 메모 수준의 가벼운 백로그.

**룰**: 한 줄로 못 쓰겠으면 이미 작업 거리니 별도 트랙(`.ai/I18N_PLAN.md` 같은) 또는 PR 로 옮긴다.

관련 문서: `.ai/OPERATIONS_LOG.md` · `.ai/APP_STORE_REVIEW.md` · `.ai/I18N_PLAN.md`

---

| 카테고리    | 항목                                                                                                  |
| ----------- | ----------------------------------------------------------------------------------------------------- |
| 학습 기능   | 리마인더 알림 (학습 시간 미리 설정 / 복습 단어 있을 때 푸시)                                          |
| 단어 데이터 | 영어 정의 품질 검수 (PDF italic 합쳐짐 잔여 — `scripts/fix-joined-words.mjs` JOINS 에 추가)           |
| UI/UX       | 아이폰 미니에서 스크롤 안 생기게 정리                                                                 |
| UI/UX       | 프로필 또는 온보딩에 공부 자극/응원 짤                                                                |
| UI/UX       | "개발자의 말"(`AboutPage`) 에 본인 이모지 추가                                                        |
| 국제화      | 한국어/영어 외 추가 언어 검토 (일본어, 중국어 등 — `src/i18n/languages.ts` 확장)                      |
| 국제화      | 프라이버시 정책 영문 법률 검토 (영문판 출시 전)                                                       |
| iOS/배포    | Phase 7 — Xcode `.lproj` 등록 + App Store Connect 한·영 메타데이터 입력 (`.ai/APP_STORE_METADATA.md`) |
| 운영/관측   | `user_data.progress` JSONB → `word_progress` 테이블 분리 (payload 59KB→200B, 두 기기 last-write-wins 해결 — 2026-08-24 iOS 1.7 App Hang 조사 파생) |
| 개발자 경험 | 단위 테스트 환경(vitest) 도입 — 2026-07-18 recordAnswer silent bug 회귀 방지 목적                     |
| 개발자 경험 | `/commit` 시 코드 리뷰 에이전트 자동 트리거                                                           |
| 개발자 경험 | `/commit` 시 문서 관리 서브 에이전트 자동 트리거 (README · `.ai/*` 일관성 점검)                       |
| 개발자 경험 | Playwright 테스트 작성                                                                                |

> 완료된 항목은 행을 삭제. git log 가 흔적 (커밋 메시지로 추적). 운영 이슈에서 비롯된 항목이면 `.ai/OPERATIONS_LOG.md` 에도 별도 기록.
