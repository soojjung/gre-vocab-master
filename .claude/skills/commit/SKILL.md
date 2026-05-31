---
name: commit
description: 변경 사항을 커밋하기 전 타입 체크, 브랜치 최신화, 코드 리뷰, TODO 동기화를 거친 뒤 커밋. 사용자가 /commit [메시지] 로 호출.
---

`git commit` 을 직접 실행하기 전 안전망 4 가지를 통과시킨 후 커밋합니다. 자동 푸시는 하지 않습니다.

## 호출 패턴

### 메시지 있는 호출
사용자: `/commit feat(quiz): SR 복습 인덱스 OOB 정적 차단`
→ 메시지를 채택. 단, 필요 시 형식만 정리(prefix 보정 등).

### 메시지 없는 호출
사용자: `/commit`
→ 변경 사항 분석 후 초안 작성, 사용자 확인 받고 진행.

## 작업 흐름 (순서 엄수 — 빠르게 실패하는 순서)

### 1. Pre-flight: 변경 사항 확인

- `git status --short` — staged/unstaged/untracked 파일 목록
- `git diff --stat` — 변경 규모
- 변경 사항 0 이면 즉시 종료: "커밋할 변경 사항이 없습니다."

### 2. 타입 체크

- `npx tsc -b` 실행
- 실패 시 에러 보고하고 **커밋 중단**. 사용자에게 수정 후 다시 호출하라고 안내.
- 통과해야 다음 단계로.

### 3. 브랜치 최신화 확인

- 현재 브랜치 + 메인 브랜치 식별 (보통 main)
- `git fetch origin <main_branch>` (네트워크 호출, 실패해도 경고로 통과)
- `git rev-list --left-right --count HEAD...origin/<main>` 로 ahead/behind 카운트
- 로컬이 origin/main 보다 **behind** 면:
  - 사용자에게 알리고 `git pull --rebase origin <main>` 제안
  - 사용자 승인 후 rebase 실행. 충돌 나면 중단하고 사용자에게 해결 요청.
- ahead-only 또는 same 이면 통과.

### 4. 코드 리뷰 (스테이징 전 + 후 모두 대상)

대상: `git diff HEAD` 결과 (스테이지/언스테이지 합쳐서) + 신규 파일.

체크 포인트 (빠르게 스캔):

- **잔여 디버그**: `console.log` (특히 `error` 가 아닌 것), `debugger`, `// TODO`, `// FIXME`, `// XXX` 코멘트
- **타입 안정성**: `as any`, `// @ts-ignore`, `// @ts-expect-error` 신규 도입
- **시크릿/키 노출**: `.env` 누락, API key/토큰 하드코딩, Supabase URL 외 노출된 secret
- **테스트 코드 잔여**: `.only`, `.skip` (vitest/jest 패턴)
- **i18n 회귀**: 새 페이지/컴포넌트에 하드코딩된 한국어 리터럴이 있으면 `t()` 사용 권유 (`.ai/I18N_PLAN.md` 참고)
- **공통 표준 위반**: `.ai/CODING_STANDARDS.ts` 의 named export, type import, 절대 경로 import 등

중요 이슈 발견 시:
- 한 곳에 모아 보고 ("이 줄 / 이 파일의 이 문제")
- 사용자에게 "그래도 진행하시겠습니까 / 수정 후 다시 / 무시" 묻기.
- 사용자가 "진행" 선택하면 다음 단계로.

심각하지 않은 잔소리(스타일/네이밍)는 보고만 하고 흐름은 막지 말 것.

### 5. TODO 동기화

`.ai/TODO.md` 를 읽고, 이번 변경으로 완료될 만한 항목이 있는지 변경 사항과 대조.

- 후보 항목 발견 시 사용자에게 명시적으로 확인:
  - "이번 커밋으로 다음 TODO 가 완료되어 보입니다. 제거할까요? [목록]"
- 사용자가 OK 하면 해당 줄 삭제 → 같이 스테이징.
- 사용자가 NO 또는 무응답이면 그대로 둠.

후보가 없으면 이 단계 건너뜀.

### 6. 메시지 작성 / 확인

- 사용자가 메시지를 줬으면 그대로 사용 (prefix 형식만 점검: `feat:`, `fix:`, `chore:` 등).
- 안 줬으면 변경 사항 기반으로 초안 작성:
  - 최근 5-10 커밋(`git log --oneline -10`) 스타일 따라하기 (이 프로젝트는 한국어 prefix + 콜론 + 한국어 본문 패턴)
  - 한 줄 요약 (제목) + 빈 줄 + 본문 (선택)
- 사용자에게 메시지 보여주고 **확인** 받음. 거절 시 수정.

### 7. 스테이징 + 커밋

- 명시적 파일 지정으로 스테이징 (`git add .` 또는 `git add -A` **금지** — 의도치 않은 파일 포함 위험)
- TODO 변경분이 있으면 같이 스테이징
- HEREDOC 으로 메시지 전달 + Co-Authored-By 라인 추가:
  ```
  git commit -m "$(cat <<'EOF'
  {제목}

  {본문, 있으면}

  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  EOF
  )"
  ```
- 커밋 후 `git status` 로 결과 확인

### 8. 후속 안내

- 커밋 SHA + 한 줄 요약 보고
- "푸시는 사용자가 직접 `git push` 로 해주세요" 안내 (메모리 규칙)
- iOS 관련 변경(빌드/sync/버전 bump)이면 Xcode 워크스페이스 자동 오픈 권유 (`feedback_open_xcode_before_submission` 메모리)

## 주의 사항

- **자동 푸시 금지**. 어떤 상황에서도 `git push` 는 사용자 명시 요청 시에만.
- **`--no-verify` 금지**. pre-commit hook 실패 시 hook 자체를 우회하지 말고 원인 수정 후 재시도.
- **amend 지양**. 사용자가 명시적으로 `--amend` 요청 안 했으면 항상 새 커밋.
- 타입 체크 / 코드 리뷰 / 브랜치 최신화 / TODO 동기화 중 **단계 건너뛰기 금지** — 사용자가 "타입 체크 건너뛰어" 같이 명시 요청 시만 예외.
- 사용자가 검토할 수 있도록 **메시지 확정 전에 보여주기**. 무응답이면 진행하지 말고 대기.

## 실패 시나리오 처리

- 타입 체크 실패 → 에러 위치/메시지 정리해서 보고, 커밋 중단
- rebase 충돌 → 해결 안 된 파일 목록 보고, 커밋 중단
- pre-commit hook 실패 → 메시지 그대로 보여주고 원인 분석 후 사용자에게 옵션 제시 (수정 후 재시도 / 중단). **절대 `--no-verify` 사용 금지**

## 다른 스킬과의 관계

- `/oplog` — 운영 이슈 기록 (커밋 후 별도)
- `/todo` — TODO 추가 (커밋과 무관, 아무 때나)
- `/review` (built-in) — PR 단위 리뷰. `/commit` 의 §4 와 별개로 PR 단계에서 사용.
