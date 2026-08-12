# common-ui

Next.js · React 18/19 · 순수 HTML 에서 동일하게 쓰는 대시보드 셸 웹 컴포넌트 라이브러리.
npm 레지스트리를 쓰지 않고 **git 태그로 배포**한다. 구조는 `docs/project-structure.md` 를 먼저 읽는다.

## 무엇을 어디에 적나

| 위치 | 담는 것 |
|---|---|
| `CLAUDE.md` | 이 표와 아래 세 줄. 매 세션 로드되므로 **최소한만** 둔다 |
| `.claude/rules/` | 항상 지켜야 하는 제약. 짧은 명령형 |
| `.claude/skills/` | 특정 작업에서만 필요한 절차. 가끔 쓰는 것을 CLAUDE.md 에 두지 않는다 |
| `docs/` | 구조·근거·함정. **왜** 그런지는 전부 여기 |

새 규칙이 생기면 `.claude/rules/` 에, 그 이유는 `docs/gotchas.md` 에 적는다. CLAUDE.md 에 쌓지 않는다.

## 규칙

- 커밋 메시지: @.claude/rules/commit.md — **`git push` 는 사용자가 명시적으로 요청할 때만** 한다
- 코드 불변 규칙: @.claude/rules/library-invariants.md
- 검증 방식: @.claude/rules/verification.md — **이 저장소에는 테스트 러너가 없다. 추가하지 않는다**
- 계획 실행은 `superpowers:subagent-driven-development` 를 기본으로 쓴다. 인라인 실행은 이 방식이 맞지 않을 때만 고른다
- 프로젝트 구조가 바뀌면 `docs/project-structure.md` 를 함께 갱신한다
