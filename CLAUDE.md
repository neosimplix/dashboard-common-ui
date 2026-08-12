# common-ui

Next.js · React 18/19 · 순수 HTML 에서 동일하게 쓰는 대시보드 셸 웹 컴포넌트 라이브러리.
npm 레지스트리를 쓰지 않고 **git 태그로 배포**한다. 구조와 실행 방법은 `docs/project-structure.md` 를 먼저 읽는다.

## 규칙

- 커밋 메시지는 `.claude/rules/commit.md` 를 준수한다. @.claude/rules/commit.md
- `git push` 는 사용자가 명시적으로 요청할 때만 실행한다. 작업 완료 시 로컬 커밋까지만 한다.
- 계획을 실행할 때는 `superpowers:subagent-driven-development` 를 기본으로 쓴다. Task 마다 새 subagent 를 띄우고 그때마다 리뷰를 받는다. 인라인 실행은 이 방식이 맞지 않을 때만 고른다.
- 프로젝트 구조가 바뀌면 `docs/project-structure.md` 를 함께 갱신한다. 이 문서 하나로 프로젝트의 목적과 구조를 파악할 수 있어야 한다.
- 개발하면서 다음에도 기억해야 할 사안이 생기면 아래 "개발하면서 발견한 사항" 에 추가한다. 한 줄 요약이 아니라 **왜 그런지**까지 적는다 — 이유를 모르면 다음 사람이 되돌린다.

## 이 저장소의 전제

- **테스트 러너를 두지 않는다.** 회귀 확인 수단은 `npm run check` 와 `index.html` 육안 확인이다. 이전 시도(`shared-ui`)가 검증 하네스 복잡도 때문에 폐기됐다. vitest·jest·playwright 등을 추가하지 않는다.
- **디자인 토큰 이름에는 접두사를 붙이지 않는다.** `dashboard-shell/app/globals.css` 와 같은 이름을 쓴다(`--color-line`, `--space-3`). 패키지 내부 배선용 프로퍼티만 `--ns-` 를 쓴다.
- **컴포넌트 태그는 `ns-` 접두사**를 쓴다.
- **컴포넌트는 자기 상태를 절대 바꾸지 않는다.** 이벤트만 올리고 상태는 소비자가 내려준다.
- 설계 배경은 `docs/superpowers/specs/2026-08-12-common-ui-web-components-design.md`, 수용된 한계는 그 문서의 "알려진 한계" 절에 있다.

## 개발하면서 발견한 사항

### 토큰은 문서 `:root` 에만 둔다

컴포넌트 shadow 의 `:host` 에 토큰을 정의하면 소비자의 `:root` 오버라이드가 죽는다. **상속은 그 요소에 선언이 하나도 없을 때만 동작**하는데, `:host` 선언이 있으면 그것이 값을 정하고 상속값은 후보에도 들지 않는다. cascade layer 로도 못 바꾼다 — 레이어는 같은 요소에 적용된 선언끼리만 비교한다. `[data-theme="dark"]` 전환도 같은 이유로 불가능해진다(`:host-context()` 는 Chromium 전용).

### 컴포넌트 스타일에 `var()` 폴백을 쓰지 않는다

색·치수 값이 `tokens.css` 와 컴포넌트 양쪽에 존재하면 조용히 어긋난다. 토큰 미로드는 폴백이 아니라 `warnIfTokensMissing()` 경고로 잡는다. 예외는 패키지 내부 프로퍼티인 `--ns-label-display` 하나뿐이다.

### Vite 의 `external` 은 문자열이면 정확히 일치해야 한다

`external: ["lit"]` 는 `"lit/decorators.js"` 를 덮지 못한다. 그러면 `@lit/reactive-element` 가 번들에 인라인되고, 그 안의 `class ReactiveElement extends HTMLElement` 가 모듈 평가 시점에 실행돼 **Node import 가 죽는다**(Next 서버 렌더링 경로). 더 나쁜 것은 소비자 앱에 ReactiveElement 가 두 벌 생겨 반응성이 깨질 수 있다는 점이다. `vite.config.ts` 의 `litExternal` 정규식을 유지한다. UMD 빌드만 예외로 lit 을 인라인한다 — 모듈 해석 없이 `<script src>` 로 받는 산출물이다.

### 타입만 바뀐 수정도 태그를 다시 잘라야 한다

`as EventName<...>` 같은 타입 어노테이션은 런타임 JS 에서 지워지지만 `.d.ts` 에는 남는다. 소스를 고쳐도 **태그를 재발행하지 않으면 소비자는 깨진 타입을 계속 받는다.** 실제로 `v0.1.1` 이 그 상태로 존재했다.

### `npm run check` 가 못 보는 영역이 있다

React 래퍼의 `events` 값은 라이브러리 안에서는 그냥 문자열이라, `EventName<>` 브랜딩이 빠져도 라이브러리 타입 검사는 통과한다. 소비자 쪽에서만 `e.detail` 이 컴파일 에러가 난다. 그래서 `docs/consumer-example.tsx` + `tsconfig.consumer.json` 이 `check` 에 포함돼 있다. **네 래퍼 전부에 핸들러를 붙여 `.detail` 을 읽어야** 한다 — 둘만 붙였을 때 나머지 둘의 회귀가 조용히 통과한 적이 있다.

### 검사는 실패시켜 봐야 검사다

`check-events.mjs` 든 소비자 타입 검사든, 새로 만들거나 고쳤으면 **일부러 깨뜨려서 실제로 실패하는지 확인한다.** 한 번도 실패해본 적 없는 검사가 통과하는 것은 아무 증거도 아니다. 이 저장소에서 실제로 그렇게 구멍 두 개를 찾았다.

### `<script type="text/plain">` 안에 `<script>` 태그를 넣지 않는다

HTML 파서는 `type` 과 무관하게 첫 `</script>` 에서 바깥 블록을 닫는다. 그 지점부터 페이지가 깨진다. `index.html` 의 예시는 마크업 블록과 배선 블록을 따로 둔다. 검사 방법은 `docs/project-structure.md` 의 구조 검사 항목에 있다.

### Lit 데코레이터에는 tsconfig 두 줄이 함께 필요하다

`experimentalDecorators: true` 와 `useDefineForClassFields: false` 중 하나라도 빠지면 클래스 필드가 `@property` 접근자를 덮어써서 **에러 없이 리렌더만 멈춘다.**

### `@customElement` 데코레이터를 쓰지 않는다

모듈 평가 시점에 `customElements.define` 을 호출해 서버 렌더링에서 터진다. `src/internal/register.ts` 를 쓴다.
