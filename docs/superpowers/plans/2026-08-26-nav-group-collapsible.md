# ns-nav-group 접힘 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `ns-nav-group` 에 opt-in 접힘을 넣는다. `collapsible` 을 쓴 그룹만 헤딩이 버튼이 되고, 누르면 그 그룹의 항목이 숨는다.

**Architecture:** 접힘 상태는 `ns-dialog` 와 같은 제어(`open` 프로퍼티 전용)/비제어(`default-collapsed` 속성) 짝으로 나눈다. 사이드바가 레일로 접히면 `--ns-group-list-display` 라는 신호 커스텀 프로퍼티를 `::slotted(ns-nav-group)` 으로 내려보내 그룹의 접힘을 무시하게 만든다 — 그룹은 그 값을 **읽기만** 하므로 캐스케이드 싸움이 없다.

**Tech Stack:** Lit 3 · TypeScript · `@lit/react` `createComponent` · 순수 CSS 커스텀 프로퍼티. 빌드는 Vite.

**설계 문서:** `docs/superpowers/specs/2026-08-26-nav-group-collapsible-design.md` — 판단의 근거는 전부 거기 있다. 이 계획은 그것을 실행 순서로 옮긴 것이다.

## Global Constraints

이 저장소의 불변 규칙 중 이 작업에 걸리는 것들이다. **모든 태스크의 요구사항에 암묵적으로 포함된다.**

- **테스트 러너를 추가하지 않는다.** vitest·jest·playwright·web-test-runner 를 넣지 않고 테스트 파일도 만들지 않는다. 회귀 확인 수단은 `npm run check` 와 `index.html` 육안 확인 둘뿐이다.
- **검사를 고쳤으면 일부러 깨뜨려 본다.** 한 번도 실패해본 적 없는 검사가 통과하는 것은 아무 증거도 아니다. **의도한 이유로 실패했는지**까지 확인한다.
- **브라우저 확인은 사람이 한다.** 하지 않은 확인을 했다고 보고하지 않는다. 사람 눈이 필요한 것은 `docs/pending-human-checks.md` 로 옮긴다.
- 커밋 메시지는 `<type>(<scope>): <한국어 제목>`. 마침표 없음. **`git push` 는 하지 않는다.**
- 컴포넌트 태그·커스텀 프로퍼티는 `--ns-` / `ns-` 접두사. 이벤트는 `ns-` 케밥, React prop 은 `on` + 파스칼.
- 모든 커스텀 이벤트는 `bubbles: true, composed: true`.
- **`@customElement` 데코레이터를 쓰지 않는다.** `src/internal/register.ts` 를 쓴다.
- **shadow 안에서만 쓰는 클래스에는 `ns-` 접두사를 붙이지 않는다.** 이 작업이 만드는 클래스(`.heading`·`.row`·`.text`·`.caret`·`.list`·`.collapsed`)는 전부 shadow 안이다.
- **`:host` 에 `border`·`margin`·`padding` 을 두지 않는다.** `check-tokens.mjs` 규칙 ④ 가 강제한다.
- **호스트에 속성을 쓰지 않는다.** 접힘 상태를 `:host([collapsed])` 로 스타일하지 않는다.
- **컴포넌트 스타일에 `var()` 폴백을 쓰지 않는다** — 예외는 신호 프로퍼티(`--ns-label-display`, 이 작업이 더하는 `--ns-group-list-display`). Task 2 가 그 규칙 문구를 함께 고친다.
- 로직과 스타일은 파일 두 개(`ns-x.ts` / `ns-x.styles.ts`).
- **`title` 을 속성/프로퍼티 이름으로 쓰지 않는다.**

## File Structure

| 파일 | 책임 | 태스크 |
|---|---|---|
| `src/components/icon/icons.ts` | 아이콘 스프라이트. `chevron-down` 추가 | 1 |
| `src/types.ts` | 이벤트 detail 타입 + `HTMLElementEventMap` 확장 | 2 |
| `src/components/nav-group/ns-nav-group.ts` | 상태 소유·토글·이벤트·ARIA·템플릿 | 2 |
| `src/components/nav-group/ns-nav-group.styles.ts` | 버튼 리셋·caret·`.list.collapsed` | 2 |
| `src/components/sidebar/ns-sidebar.styles.ts` | 레일 분기에서 신호를 내려보냄 | 2 |
| `scripts/check-tokens.mjs` | `WIRING` 집합에 신호 이름 추가 | 2 |
| `.claude/rules/library-invariants.md` | `var()` 폴백 예외를 신호 프로퍼티로 | 2 |
| `docs/gotchas.md` | `default-collapsed` 극성·`willUpdate` 씨앗·신호 읽기 전용의 근거 | 2 |
| `src/react/elements.ts` | `NsNavGroup` 래퍼의 이벤트 매핑 | 2 |
| `docs/consumer-example.tsx` | `e.detail.open` 을 실제로 읽어 `EventName<>` 누락을 잡음 | 3 |
| `index.html` | 데모·프로퍼티/이벤트 표·React 예시 | 4 |
| `docs/project-structure.md` | 이벤트 개수와 목록 | 4 |
| `README.md` | 다음 릴리스 변경 행 | 4 |
| `docs/pending-human-checks.md` | 육안 확인 목록 | 4 |

**Task 2 가 큰 이유가 있다.** 컴포넌트·스타일·사이드바 배선·검사·규칙이 한 덩어리다 — 셋 중 하나만 빠져도 `npm run check` 가 초록이 되지 않는다. 리뷰어가 그중 하나만 따로 물릴 수 있는 경계가 없다.

---

### Task 1: `chevron-down` 아이콘

**Files:**
- Modify: `src/components/icon/icons.ts:21` (`icons` 객체에 항목 추가)
- Modify: `index.html:1495` (수록된 셋 목록 문장)

**Interfaces:**
- Consumes: 없음
- Produces: `icons["chevron-down"]` — `<ns-icon name="chevron-down">` 으로 Task 2 가 쓴다. `viewBox: "0 0 20 20"`, 아래를 가리키는 홑화살.

- [ ] **Step 1: 지금 아이콘이 셋인지 확인한다**

```sh
node -e 'import("./dist/index.js").catch(()=>{})' 2>/dev/null; grep -n "^  [a-z-]*: {" src/components/icon/icons.ts
```

기대: `menu`·`close`·`google` 세 줄. 넷 이상이면 이 계획이 낡은 것이니 멈추고 보고한다.

- [ ] **Step 2: `chevron-down` 을 더한다**

`icons.ts` 의 `icons` 객체 안, `menu` 바로 뒤에 넣는다. 기존 항목과 같은 모양을 따른다 — `width`/`height` 를 적지 않고 `currentColor` 를 쓴다.

```ts
  /*
    ns-nav-group 의 접힘 caret. 아래를 가리키는 것이 펼침이고, 접히면
    그 컴포넌트가 -90deg 로 돌린다. 회전은 여기서 하지 않는다 — 이 스프라이트는
    방향을 모르는 채로 하나만 갖고, 쓰는 쪽이 돌린다.
  */
  "chevron-down": {
    viewBox: "0 0 20 20",
    content: svg`
      <path
        d="M5 7.5l5 5 5-5"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
      />
    `,
  },
```

**키에 따옴표가 필요하다.** `chevron-down` 은 하이픈이 있어 식별자가 아니다.

- [ ] **Step 3: 문서의 "수록된 셋" 문장을 고친다**

`index.html:1493-1499` 의 `<p>` 를 연다. 지금 이렇게 돼 있다.

```html
    <code>menu</code>·<code>close</code>·<code>google</code> 은 라이브러리 자신이 쓰는 것이라
    (헤더 토글, 대화상자 닫기, 구글 로그인 버튼) 앱 아이콘은 여기 없다.
```

이렇게 바꾼다.

```html
    <code>menu</code>·<code>close</code>·<code>google</code>·<code>chevron-down</code> 은
    라이브러리 자신이 쓰는 것이라 (헤더 토글, 대화상자 닫기, 구글 로그인 버튼,
    <code>ns-nav-group</code> 접힘 caret) 앱 아이콘은 여기 없다.
```

같은 줄 근처에 "셋" 이라고 세는 다른 문장이 있는지 함께 본다.

```sh
grep -n "아이콘.*셋\|셋이면\|스프라이트.*셋" index.html src/components/icon/icons.ts
```

`icons.ts:13` 의 `"셋이면 무시할 수준이고"` 도 대상이다 — `"넷이면"` 으로 고친다.

- [ ] **Step 4: 검사**

```sh
npm run check
```

기대: 전부 통과. 이 태스크는 검사 스크립트를 건드리지 않으므로 "일부러 깨뜨리기" 대상이 아니다.

- [ ] **Step 5: 커밋**

```sh
git add src/components/icon/icons.ts index.html
git commit -m "feat(icon): 접힘 caret 용 chevron-down 을 스프라이트에 더한다"
```

---

### Task 2: `ns-nav-group` 접힘 — 상태 · 스타일 · 레일 배선

**Files:**
- Modify: `src/types.ts` (detail 타입 + 이벤트 맵)
- Modify: `src/components/nav-group/ns-nav-group.ts` (전면 개편)
- Modify: `src/components/nav-group/ns-nav-group.styles.ts` (규칙 추가)
- Modify: `src/components/sidebar/ns-sidebar.styles.ts:79-81` (레일 분기)
- Modify: `scripts/check-tokens.mjs:117` (`WIRING`)
- Modify: `src/react/elements.ts:76-84` (`NsNavGroup` 의 `events`)
- Modify: `.claude/rules/library-invariants.md:39`
- Modify: `src/tokens/tokens.css:59, 271` ("포커스 링 여섯" → 일곱)
- Modify: `docs/gotchas.md` (절 추가)

**Interfaces:**
- Consumes: `icons["chevron-down"]` (Task 1)
- Produces:
  - `NsGroupToggleDetail { open: boolean }` — `src/types.ts` 에서 export. Task 3 이 읽는다.
  - 이벤트 이름 `"ns-group-toggle"`, React prop `onNsGroupToggle`.
  - 커스텀 프로퍼티 `--ns-group-list-display` — 사이드바가 세우고 그룹이 읽는다.
  - `NsNavGroup` 의 공개 프로퍼티: `heading: string`, `collapsible: boolean`, `open?: boolean`, `defaultCollapsed: boolean`.

- [ ] **Step 1: 검사가 아직 이 이름을 모른다는 것을 먼저 확인한다**

`--ns-group-list-display` 를 참조하는 스타일을 쓰기 전에, `check-tokens.mjs` 가 그것을 미정의 토큰으로 잡을 것인지 본다. 임시로 참조 한 줄을 넣어 확인한다.

```sh
printf '\n/* TEMP */\n.tmp { display: var(--ns-group-list-display); }\n' >> src/controls/controls.css
node scripts/check-tokens.mjs; echo "exit=$?"
```

기대: `exit=1` 과 `tokens.css 에 정의되지 않은 토큰을 참조합니다: src/controls/controls.css: --ns-group-list-display`.

**이것이 이 태스크의 "실패하는 테스트" 다.** 검사가 새 이름을 실제로 붙잡는다는 증거이고, 그래서 `WIRING` 추가가 필요하다는 것도 함께 증명된다.

되돌린다.

```sh
git checkout src/controls/controls.css
node scripts/check-tokens.mjs; echo "exit=$?"    # exit=0 이어야 한다
```

- [ ] **Step 2: `WIRING` 에 이름을 더한다**

`scripts/check-tokens.mjs:116-117` 을 연다.

```js
/* tokens.css 에 정의하지 않는 내부 배선. 소비자가 덮는 값이 아니라 신호다. */
const WIRING = new Set(["--ns-label-display"]);
```

이렇게 바꾼다.

```js
/*
  tokens.css 에 정의하지 않는 내부 배선. 소비자가 덮는 값이 아니라 신호다.

  ns-sidebar 가 ::slotted 로 자식에게 상태를 알리는 통로 둘이다. 색·치수 토큰과
  달리 정의가 tokens.css 에 없고, 사이드바가 세워 주지 않는 상황(단독 사용,
  사이드바 펼침)에서는 읽는 쪽의 var() 폴백이 곧 기본 동작이다. 그래서 이 둘만
  "컴포넌트 스타일에 var() 폴백을 쓰지 않는다" 의 예외이기도 하다.
*/
const WIRING = new Set(["--ns-label-display", "--ns-group-list-display"]);
```

- [ ] **Step 3: 불변 규칙의 폴백 예외 문구를 고친다**

`.claude/rules/library-invariants.md:39` 이 지금 이렇다.

```md
- **컴포넌트 스타일에 `var()` 폴백을 쓰지 않는다.** 색·치수는 `tokens.css` 한 곳에만 존재한다. 유일한 예외는 `--ns-label-display`.
```

이렇게 바꾼다.

```md
- **컴포넌트 스타일에 `var()` 폴백을 쓰지 않는다.** 색·치수는 `tokens.css` 한 곳에만 존재한다. **예외는 신호 프로퍼티다** — `ns-sidebar` 가 `::slotted` 로 자식에게 상태를 알리는 `--ns-label-display` 와 `--ns-group-list-display` 둘. 정의가 `tokens.css` 에 없고 사이드바가 세워 주지 않는 상황에서는 폴백이 곧 기본 동작이라, 지우면 배선이 끊긴다. 목록의 출처는 `scripts/check-tokens.mjs` 의 `WIRING` 집합이다.
```

- [ ] **Step 4: `docs/gotchas.md` 에 근거를 적는다**

파일 끝에 절을 더한다. 제목은 다른 절과 같은 수준(`##`)으로 맞춘다 — 먼저 `grep -n '^## ' docs/gotchas.md | tail -3` 으로 확인한다.

내용에 반드시 들어가야 하는 것 셋이다.

1. **`default-open` 이 아니라 `default-collapsed` 인 이유.** boolean 속성은 없으면 언제나 `false` 다 — Lit 은 속성이 없을 때 컨버터를 부르지 않으므로 필드 초기값이 그대로 남는다. 기본이 펼침(`true`)인 `default-open` 을 두면 소비자가 그것을 `false` 로 만들 경로가 존재하지 않는다. `ns-dialog` 와 극성이 반대로 보이지만 규칙은 같다 — 양쪽 다 **기본값에서 벗어나는 쪽**을 속성 이름으로 삼았다.
2. **씨앗을 `firstUpdated` 가 아니라 `willUpdate` 에서 심는 이유.** `customElements.define` 은 모듈 평가 시점이라 `hydrateRoot` 보다 먼저다. 업그레이드된 엘리먼트의 첫 업데이트(마이크로태스크)가 하이드레이션 커밋의 `useLayoutEffect` 보다 먼저 흘러가고, `createComponent` 는 반응형 프로퍼티를 그 `useLayoutEffect` 에서만 설정한다. 그래서 `firstUpdated` 가 읽는 `defaultCollapsed` 는 아직 `false` 이고, 뒤늦게 `true` 가 들어와도 `firstUpdated` 는 다시 돌지 않는다 — **`default-collapsed` 가 오류도 경고도 없이 무시된다.** `ns-dialog` 에 같은 성질이 잠재해 있지만 그쪽은 `default-open` 을 SSR 에서 쓰는 조합이 드물어 드러나지 않았다.
3. **신호를 그룹이 세우지 않고 읽기만 하는 이유.** 그룹이 `:host` 에 세우고 사이드바가 `::slotted` 로 덮는 구조였다면 둘 다 같은 요소(호스트)를 겨냥하므로 특정도 싸움이 되고, `:host(:not(…))`(0,2,0)이 `::slotted(…)`(0,0,2)를 이겨 **사이드바가 진다.** 읽기만 하면 그 싸움 자체가 없다.

- [ ] **Step 5: `src/types.ts` 에 detail 타입을 더한다**

`NsNavigateDetail` 바로 아래에 넣는다.

```ts
/**
 * ns-nav-group 의 헤딩 버튼이 올리는 이벤트. open 은 "요청되는 다음 상태"다.
 *
 * 어느 그룹인지는 e.target 이 준다. heading 을 함께 싣지 않는 이유는 그것이
 * 표시용 문자열이라 상태를 저장할 키로 나쁘고, 필드가 둘이 되는 순간 필드를
 * 하나 더하는 것이 breaking 이 되기 때문이다.
 */
export interface NsGroupToggleDetail {
  open: boolean;
}
```

`HTMLElementEventMap` 확장에도 한 줄 더한다. `"ns-navigate"` 다음이다.

```ts
    "ns-group-toggle": CustomEvent<NsGroupToggleDetail>;
```

- [ ] **Step 6: `ns-nav-group.ts` 를 다시 쓴다**

파일 전체를 아래로 바꾼다.

```ts
import { LitElement, html, type PropertyValues } from "lit";
import { property } from "lit/decorators.js";

import { register } from "../../internal/register.js";
import { warnIfTokensMissing } from "../../internal/warn-missing-tokens.js";
import { warnPropertyOnlyAttributes } from "../../internal/warn-property-only.js";
import type { NsGroupToggleDetail } from "../../types.js";
import { styles } from "./ns-nav-group.styles.js";

// caret 이 <ns-icon> 을 쓴다. 등록 부수효과가 필요하다.
import "../icon/ns-icon.js";

export class NsNavGroup extends LitElement {
  static override styles = styles;

  /** 그룹 제목. 사이드바가 접히면 시각적으로 숨지만 aria-label 로는 남는다. */
  @property({ type: String }) heading = "";

  /**
   * 헤딩 줄을 토글 버튼으로 만든다.
   *
   * opt-in 이다. 이 속성이 없으면 렌더 결과가 0.4.0 과 한 노드도 다르지 않다 —
   * 전부 접히게 만들면 소비자가 코드를 한 줄도 바꾸지 않았는데 헤딩에
   * hover·포커스 링·caret 이 생긴다.
   */
  @property({ type: Boolean }) collapsible = false;

  /**
   * 제어 모드. `undefined` 면 비제어다.
   *
   * 속성이 아니라 프로퍼티 전용이다. 겸용했다면 `<ns-nav-group collapsible open>`
   * 이 boolean 속성으로 읽혀 제어 모드로 들어가고, 그러면 컴포넌트가 스스로
   * 접지 못한다. 순수 HTML 소비자가 쓸 것은 `default-collapsed` 다.
   *
   * 그 속성이 관찰되지 않으므로 `<ns-nav-group open>` 은 제어 모드로 들어가는
   * 것이 아니라 통째로 무시된다. connectedCallback 이 경고한다.
   */
  @property({ attribute: false }) open?: boolean;

  /**
   * 비제어 초기값. 있으면 접힌 채로 시작한다.
   *
   * `default-open` 이 아닌 이유는 boolean 속성의 성질이다 — 속성이 없으면 Lit 이
   * 컨버터를 부르지 않아 필드 초기값이 그대로 남으므로, 기본을 펼침(true)으로
   * 잡으면 소비자가 그 값을 false 로 만들 경로가 없다. 그래서 극성을 뒤집어
   * **기본값에서 벗어나는 쪽**을 이름으로 삼았다. ns-dialog 의 default-open 과
   * 반대로 보이지만 규칙은 같다.
   *
   * 나중에 이 값을 바꾸면 **아직 토글되지 않은 그룹에만** 반영된다.
   */
  @property({ type: Boolean, attribute: "default-collapsed" }) defaultCollapsed = false;

  /** 비제어일 때의 진실. */
  #innerCollapsed = false;

  /** 사용자가 한 번이라도 토글했나. 늦게 도착한 defaultCollapsed 가 그것을 덮지 않게 막는다. */
  #toggled = false;

  get #controlled(): boolean {
    return this.open !== undefined;
  }

  get #isOpen(): boolean {
    return this.open ?? !this.#innerCollapsed;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    warnIfTokensMissing();
    warnPropertyOnlyAttributes(this, { open: "default-collapsed" });
  }

  /*
    씨앗을 firstUpdated 가 아니라 여기서 심는다.

    customElements.define 은 모듈 평가 시점이라 hydrateRoot 보다 먼저다. 첫
    업데이트는 마이크로태스크로 예약되는데 그것이 하이드레이션 커밋의
    useLayoutEffect 보다 먼저 흘러가고, @lit/react 의 createComponent 는 반응형
    프로퍼티를 그 useLayoutEffect 에서만 설정한다. firstUpdated 로 한 번만 읽으면
    그 시점의 defaultCollapsed 는 아직 false 이고, 뒤늦게 true 가 들어와도 다시
    돌지 않는다 — default-collapsed 가 React 소비자에게 조용히 무시된다.

    #toggled 가 있어 사용자가 손댄 뒤에는 늦게 온 값이 그 조작을 덮지 않는다.
  */
  override willUpdate(changed: PropertyValues): void {
    if (changed.has("defaultCollapsed") && !this.#toggled) {
      this.#innerCollapsed = this.defaultCollapsed;
    }
  }

  override render() {
    const open = this.#isOpen;
    return html`
      <div role="group" aria-label=${this.heading}>
        ${this.collapsible
          ? html`
              <button
                class="heading"
                type="button"
                aria-expanded=${open ? "true" : "false"}
                aria-controls="list"
                @click=${this.#onToggle}
              >
                <span class="row">
                  <span class="text">${this.heading}</span>
                  <ns-icon
                    class=${open ? "caret" : "caret closed"}
                    name="chevron-down"
                    aria-hidden="true"
                  ></ns-icon>
                </span>
              </button>
            `
          : html`<div class="heading">${this.heading}</div>`}
        <div id="list" class=${this.collapsible && !open ? "list collapsed" : "list"}>
          <slot></slot>
        </div>
      </div>
    `;
  }

  #onToggle = (): void => {
    const next = !this.#isOpen;
    this.#toggled = true;

    /*
      제어 중이면 그 값을 바꾸지 않는다. 이벤트는 양쪽 모두 낸다.
      #innerCollapsed 는 반응형 프로퍼티가 아니므로 갱신을 직접 요청한다.
    */
    if (!this.#controlled) {
      this.#innerCollapsed = !next;
      this.requestUpdate();
    }

    const detail: NsGroupToggleDetail = { open: next };
    this.dispatchEvent(
      new CustomEvent("ns-group-toggle", { detail, bubbles: true, composed: true }),
    );
  };
}

register("ns-nav-group", NsNavGroup);

declare global {
  interface HTMLElementTagNameMap {
    "ns-nav-group": NsNavGroup;
  }
}
```

**`classMap` 을 쓰지 않는다.** 이 저장소는 `ns-pagination.ts:379` 에서 삼항 문자열을 쓴다. 디렉티브를 새로 들이지 않는다.

**`active` 를 보는 코드가 없는 것이 의도다.** 접힌 그룹 안에 활성 항목이 있어도 자동으로 펼치지 않는다 — 제어 모드에서 소비자가 준 `open={false}` 를 라이브러리가 덮게 되어 "제어 중이면 그 값을 바꾸지 않는다" 위반이고, 자식의 `active` 변화를 보려면 `slotchange` 와 `MutationObserver` 가 함께 들어온다. 소비자는 라우팅을 이미 소유하므로 필요하면 `default-collapsed` 를 경로에서 계산해 넣는다. 스펙 §7 이다.

- [ ] **Step 7: `ns-nav-group.styles.ts` 에 규칙을 더한다**

기존 `.heading` 규칙을 아래로 바꾸고, 그 뒤에 새 규칙들을 넣는다. `:host(:not(:first-child)) [role="group"]` 와 `.list` 의 기존 규칙은 그대로 둔다.

```ts
  /*
    collapsible 이면 <button>, 아니면 <div> 다. 두 경우가 같은 클래스를 쓰므로
    글꼴·색·패딩이 한 곳에 있고, 아래 button 전용 규칙이 UA 기본값만 되돌린다.

    display 자리를 --ns-label-display 신호가 쓰고 있어 여기에 flex 를 얹을 수
    없다. 그래서 안쪽 .row 가 flex 를 진다. 신호가 나르는 값을 flex 로 바꾸는
    길은 막혀 있다 — ns-nav-item 의 .label·.trailing 이 같은 신호를 읽으므로
    셋이 함께 바뀐다.
  */
  .heading {
    display: var(--ns-label-display, block);
    padding: var(--ns-space-4) var(--ns-space-4) var(--ns-space-2);
    font-size: var(--ns-font-size-xs);
    line-height: var(--ns-line-height-xs);
    font-weight: var(--ns-weight-semibold);
    letter-spacing: 0.05em;
    color: var(--ns-color-fg-subtle);
  }

  /*
    <button> 의 UA 기본값을 되돌린다. 위 .heading 이 글꼴·색을 이미 정하지만
    button 은 그것을 상속하지 않고 UA 가 정한 값을 갖는다.
  */
  button.heading {
    width: 100%;
    border: 0;
    background: none;
    font-family: inherit;
    text-align: left;
    cursor: pointer;
    transition: color var(--ns-transition-fast) var(--ns-transition-ease);
  }

  button.heading:hover {
    color: var(--ns-color-fg-body);
  }

  /* controls.css 의 :focus-visible 규칙은 전역이라 shadow 안에 닿지 않는다. */
  button.heading:focus-visible {
    outline: 2px solid var(--ns-color-accent);
    outline-offset: -2px;
  }

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ns-space-2);
  }

  /*
    caret 은 헤딩 글자(--ns-font-size-xs)에 붙는 것이라 --ns-icon-size(1.25rem)가
    크다. 커스텀 프로퍼티는 상속되므로 이 인스턴스에만 세우면 ns-icon 의 shadow
    :host 까지 도달한다. 사용처가 하나이고 변할 이유가 없으므로 리터럴이다.
  */
  .caret {
    --ns-icon-size: 1rem;
    flex: none;
    transition: transform var(--ns-transition-fast) var(--ns-transition-ease);
  }

  .caret.closed {
    transform: rotate(-90deg);
  }

  /*
    접힘. --ns-group-list-display 는 ns-sidebar 가 ::slotted 로 내려주는 신호이고
    레일에서만 block 이 된다 — 레일에서는 헤딩(= 토글 버튼)이 display: none 으로
    사라지므로, 접힘을 그대로 적용하면 그 그룹의 항목에 도달할 경로가 없어진다.

    그룹은 이 값을 세우지 않고 읽기만 한다. 세우면 사이드바의 ::slotted(0,0,2)와
    같은 요소를 겨냥하는 특정도 싸움이 되고 :host(:not(…))(0,2,0)이 이겨 사이드바가
    진다. 읽기만 하면 그 싸움 자체가 없다.

    폴백이 기본 동작이다 — 사이드바 펼침과 단독 사용에서 둘 다 none 이다.
    check-tokens.mjs 의 WIRING 이 이 이름을 신호로 인정한다.
  */
  .list.collapsed {
    display: var(--ns-group-list-display, none);
  }
```

- [ ] **Step 8: 사이드바 레일 분기에서 신호를 내려보낸다**

`src/components/sidebar/ns-sidebar.styles.ts` 의 마지막 규칙을 연다. 지금 이렇다.

```css
  /* 너비와 같은 구간을 겪는다. 여기서 [open] 만 보면 라벨이 깜빡인다. */
  :host(:not([open]):not([data-ns-open])) ::slotted(ns-nav-group) {
    --ns-label-display: none;
  }
```

이렇게 바꾼다.

```css
  /*
    너비와 같은 구간을 겪는다. 여기서 [open] 만 보면 라벨이 깜빡인다.

    --ns-group-list-display 는 ns-nav-group 의 접힘을 레일에서만 무시하게 만든다.
    레일에서는 위 --ns-label-display: none 이 그룹 헤딩을 지우는데, 그 헤딩이 곧
    토글 버튼이라 접힌 그룹은 항목도 버튼도 없이 사라진다. 접힘 상태는 그대로
    기억되고, 사이드바를 다시 펼치면 이 규칙이 매칭을 멈춰 값이 미정의로
    돌아가면서 접힌 그룹이 다시 접힌다 — 되돌릴 코드가 따로 없다.

    라벨 숨김과 같은 한계를 갖는다. ::slotted 는 결합자를 받지 않으므로 직계 자식
    ns-nav-group 에만 닿는다.
  */
  :host(:not([open]):not([data-ns-open])) ::slotted(ns-nav-group) {
    --ns-label-display: none;
    --ns-group-list-display: block;
  }
```

- [ ] **Step 9: React 래퍼에 이벤트를 등록한다**

`src/react/elements.ts` 의 `NsNavGroup` 을 연다(76행 근처).

```ts
export const NsNavGroup = createComponent({
  react: React,
  tagName: "ns-nav-group",
  elementClass: NsNavGroupElement,
  events: {
    // EventName<> 브랜딩이 없으면 핸들러가 (e: Event) => void 로 타입된다.
    onNsNavigate: "ns-navigate" as EventName<CustomEvent<NsNavigateDetail>>,
    onNsGroupToggle: "ns-group-toggle" as EventName<CustomEvent<NsGroupToggleDetail>>,
  },
});
```

같은 파일 위쪽의 타입 import 블록(16행 근처)에 `NsGroupToggleDetail` 을 더한다.

- [ ] **Step 10: "포커스 링 여섯" 을 일곱으로 고친다**

헤딩 버튼이 링 하나를 더한다. 세 곳이다.

```sh
grep -rn "포커스 링 여섯" src/tokens/tokens.css index.html
```

`src/tokens/tokens.css` 두 곳과 `index.html` 한 곳(466행 근처)에서 `포커스 링 여섯` → `포커스 링 일곱`. 숫자만 고치고 뒤따르는 설명 문장은 건드리지 않는다.

**`tokens.css` 를 편집할 때 주의한다.** 그 파일의 `@no-alias` 표시 문자열을 산문에 새로 적으면 `copy-css.mjs` 가 별칭 구간을 그 자리에서 잘라 아래 토큰들의 별칭이 조용히 사라진다. 이 단계는 숫자 한 글자만 바꾸므로 해당 없지만, 다른 것을 함께 고치고 싶어지면 멈춘다.

- [ ] **Step 11: 검사**

```sh
npm run check
```

기대: 전부 통과. 이벤트 매핑 줄에 `ns-group-toggle` 이 새로 나타나야 한다.

```
이벤트 매핑 확인 완료: ns-dialog-close, ns-group-toggle, ns-multi-select-change, …
```

토큰 줄의 "정의 65 개" 는 **바뀌지 않는다** — 신호는 `tokens.css` 에 정의되지 않는다. 65 가 아닌 수가 나오면 실수로 `tokens.css` 에 정의를 넣은 것이다.

- [ ] **Step 12: 커밋**

**깨뜨리기 검증보다 커밋이 먼저다.** 아래 두 단계는 `git checkout` 으로 되돌리는데, 커밋하지 않은 상태에서 그것을 쓰면 Step 5~10 전체가 날아간다.

```sh
git add src/types.ts \
        src/components/nav-group/ns-nav-group.ts \
        src/components/nav-group/ns-nav-group.styles.ts \
        src/components/sidebar/ns-sidebar.styles.ts \
        src/react/elements.ts \
        src/tokens/tokens.css \
        scripts/check-tokens.mjs \
        .claude/rules/library-invariants.md \
        docs/gotchas.md
git commit -m "feat(nav-group): 그룹을 접을 수 있게 한다"
git status --short    # 비어 있어야 한다. 남은 것이 있으면 add 목록을 빠뜨린 것이다
```

- [ ] **Step 13: `check-events.mjs` 를 일부러 깨뜨린다**

```sh
# Step 9 에서 더한 매핑 줄만 임시로 지운다
node -e '
const fs=require("fs");const p="src/react/elements.ts";
fs.writeFileSync(p,fs.readFileSync(p,"utf8").replace(/\n\s*onNsGroupToggle:.*\n/,"\n"));
'
node scripts/check-events.mjs; echo "exit=$?"
```

기대: `exit=1` 과 `React 래퍼(src/react/elements.ts)에 등록되지 않은 이벤트: ns-group-toggle`.

**의도한 이유로 실패했는지 본다.** 문법 오류로 먼저 죽었다면 이 검사는 여전히 검증되지 않은 것이다.

```sh
git checkout src/react/elements.ts
node scripts/check-events.mjs; echo "exit=$?"    # exit=0
```

- [ ] **Step 14: `check-tokens.mjs` 를 일부러 깨뜨린다**

```sh
node -e '
const fs=require("fs");const p="scripts/check-tokens.mjs";
fs.writeFileSync(p,fs.readFileSync(p,"utf8").replace(/, "--ns-group-list-display"/,""));
'
node scripts/check-tokens.mjs; echo "exit=$?"
```

기대: `exit=1` 과 `tokens.css 에 정의되지 않은 토큰을 참조합니다: src/components/nav-group/ns-nav-group.styles.ts: --ns-group-list-display`.

```sh
git checkout scripts/check-tokens.mjs
node scripts/check-tokens.mjs; echo "exit=$?"    # exit=0
git status --short                              # 비어 있어야 한다
```

---

### Task 3: React 이벤트 타입 방어

**Files:**
- Modify: `docs/consumer-example.tsx:161` (`NsNavGroup` 사용 지점)

**Interfaces:**
- Consumes: `NsGroupToggleDetail`, prop `onNsGroupToggle` (Task 2)
- Produces: 없음

**왜 이것이 형식적인 일이 아닌가.** `events` 값은 라이브러리 안에서는 그냥 문자열이라 `EventName<>` 브랜딩이 빠져도 라이브러리 타입 검사가 통과한다. **인자 0개짜리 핸들러도 그 누락을 감춘다** — `e.detail.open` 을 실제로 읽어야 검사가 성립한다.

- [ ] **Step 1: 핸들러를 더한다**

`docs/consumer-example.tsx:161` 이 지금 이렇다.

```tsx
          <NsNavGroup heading="프로젝트" onNsNavigate={(e) => log(e.detail.label)}>
```

이렇게 바꾼다.

```tsx
          <NsNavGroup
            heading="프로젝트"
            collapsible
            onNsNavigate={(e) => log(e.detail.label)}
            /*
              detail 을 실제로 읽는다. 인자 0개짜리 핸들러는 EventName<> 캐스트
              누락을 감추므로 e.detail.open 까지 내려가야 검사가 성립한다.
            */
            onNsGroupToggle={(e) => log(String(e.detail.open))}
          >
```

같은 파일 위쪽 주석(121-127행)의 설명도 함께 손본다 — 지금 그 문단은 `ns-navigate` 만 이야기한다. `ns-group-toggle` 도 여기서 검사된다는 한 줄을 더한다.

- [ ] **Step 2: 소비자 관점 타입 검사가 실제로 무는지 확인한다**

먼저 브랜딩을 일부러 벗긴다.

```sh
node -e '
const fs=require("fs");const p="src/react/elements.ts";
fs.writeFileSync(p,fs.readFileSync(p,"utf8").replace(
  /onNsGroupToggle: "ns-group-toggle" as EventName<CustomEvent<NsGroupToggleDetail>>/,
  `onNsGroupToggle: "ns-group-toggle"`));
'
npx tsc -p tsconfig.consumer.json; echo "exit=$?"
```

기대: `exit` 이 0 이 아니고, `docs/consumer-example.tsx` 에서 `e.detail` 관련 오류(`Property 'detail' does not exist on type 'Event'`)가 난다.

**이것이 이 태스크의 존재 이유 전체다.** 오류가 나지 않으면 핸들러가 `detail` 을 충분히 깊게 읽지 않은 것이다.

되돌린다.

```sh
git checkout src/react/elements.ts
npx tsc -p tsconfig.consumer.json; echo "exit=$?"    # exit=0
```

- [ ] **Step 3: 전체 검사**

```sh
npm run check
```

기대: 전부 통과.

- [ ] **Step 4: 커밋**

```sh
git add docs/consumer-example.tsx
git commit -m "test(react): 그룹 토글 이벤트의 detail 을 소비자 예시에서 읽는다"
```

---

### Task 4: 문서

**Files:**
- Modify: `index.html:3022-3072` (`ns-nav-group` 절)
- Modify: `docs/project-structure.md:40` (이벤트 개수·목록)
- Modify: `README.md` (릴리스 표)
- Modify: `docs/pending-human-checks.md`

**Interfaces:**
- Consumes: Task 2 의 전체 공개 API
- Produces: 없음

- [ ] **Step 1: `index.html` 의 데모를 접히는 그룹으로 넓힌다**

`index.html:3026-3033` 의 `<template class="ex">` 를 연다. 지금 그룹 둘이 들어 있다. 두 번째(`관리`)에 `collapsible` 을 붙이고 세 번째를 더한다.

```html
  <template class="ex">
    <ns-nav-group heading="프로젝트">
      <ns-nav-item href="/a" label="프로젝트 A" badge="PA" active></ns-nav-item>
      <ns-nav-item href="/b" label="프로젝트 B" badge="PB"></ns-nav-item>
    </ns-nav-group>
    <ns-nav-group heading="관리" collapsible>
      <ns-nav-item href="/admin" label="사용자 관리" badge="UM"></ns-nav-item>
      <ns-nav-item href="/roles" label="권한" badge="RL"></ns-nav-item>
    </ns-nav-group>
    <ns-nav-group heading="보관" collapsible default-collapsed>
      <ns-nav-item href="/archive" label="지난 프로젝트" badge="AR"></ns-nav-item>
    </ns-nav-group>
  </template>
```

**`<template class="ex">` 하나가 데모와 코드 블록 양쪽의 원본이다.** 바로 다음 형제인 `.demo` 에 복제되어 렌더되고, 그 다음 형제인 `<pre>` 에 같은 마크업이 글자로 들어간다. 손으로 두 곳을 고치지 않는다.

- [ ] **Step 2: 프로퍼티 표를 채운다**

`index.html:3038-3042` 의 표에 세 행을 더한다.

```html
    <tr><td><code>collapsible</code></td><td><code>collapsible</code></td><td>boolean</td><td><code>false</code></td><td>헤딩 줄을 토글 버튼으로 만든다. 쓰지 않으면 렌더 결과가 이전과 같다</td></tr>
    <tr><td><code>open</code></td><td>—</td><td>boolean</td><td><code>undefined</code></td><td><strong>프로퍼티 전용.</strong> 설정하면 제어 모드가 되어 컴포넌트가 스스로 접지 않는다. HTML 에서는 <code>default-collapsed</code> 를 쓴다</td></tr>
    <tr><td><code>defaultCollapsed</code></td><td><code>default-collapsed</code></td><td>boolean</td><td><code>false</code></td><td>비제어 초기값. 나중에 바꾸면 <strong>아직 토글되지 않은 그룹에만</strong> 반영된다</td></tr>
```

- [ ] **Step 3: 이벤트 절을 다시 쓴다**

`index.html:3050-3051` 이 지금 이렇다.

```html
  <h3>이벤트</h3>
  <p>자체 이벤트가 없다. 하위 <code>ns-nav-item</code> 의 <code>ns-navigate</code> 가 통과해 올라간다.</p>
```

이렇게 바꾼다.

```html
  <h3>이벤트</h3>
  <table>
    <tr><th>이벤트</th><th>React prop</th><th>detail</th><th>언제</th></tr>
    <tr><td><code>ns-group-toggle</code></td><td><code>onNsGroupToggle</code></td><td><code>{ open }</code></td><td>헤딩 버튼을 눌렀을 때. <code>open</code> 은 <strong>요청되는 다음 상태</strong>다. 제어·비제어 양쪽에서 올라온다</td></tr>
  </table>
  <p>
    하위 <code>ns-nav-item</code> 의 <code>ns-navigate</code> 도 통과해 올라간다.
    어느 그룹의 토글인지는 <code>e.target</code> 이 준다 — <code>detail</code> 에
    <code>heading</code> 을 싣지 않는 이유는 그것이 표시용 문자열이라 상태를 저장할
    키로 나쁘고, 필드가 둘이 되면 필드를 하나 더하는 것이 breaking 이 되기 때문이다.
  </p>
```

- [ ] **Step 4: 레일과의 관계를 적는다**

`index.html` 의 `ns-nav-group` 절 끝(React 예시 앞)에 문단 하나를 더한다.

```html
  <h3>사이드바가 접히면</h3>
  <p>
    <code>ns-sidebar</code> 가 레일로 접히면 그룹 헤딩이 숨는데, 그 헤딩이 곧 토글
    버튼이다. 그래서 <strong>레일에서는 접힘을 무시하고 항목을 전부 보여준다</strong> —
    그러지 않으면 접힌 그룹의 항목에 도달할 경로가 없어진다. 접힘 상태는 그대로
    기억되고, 사이드바를 다시 펼치면 접혀 있던 그룹은 접힌 채로 돌아온다.
  </p>
  <p>
    <strong>직계 자식 <code>ns-nav-group</code> 에만 전해진다.</strong> 라벨 숨김과
    같은 한계다.
  </p>
```

- [ ] **Step 5: React 예시에 접힘을 넣는다**

`index.html:3060-3070` 의 `<script type="text/plain">` 을 연다. 아래를 더한다.

```jsx
    {/* 접힘. 상태를 소비자가 갖고 싶으면 open 프로퍼티를 쓴다 */}
    <NsNavGroup heading="관리" collapsible defaultCollapsed>
      <NsNavItem href="/admin" label="사용자 관리" badge="UM" />
    </NsNavGroup>

    {/* 제어 모드 — 접힘 상태를 저장하고 싶을 때 */}
    <NsNavGroup
      heading="보관"
      collapsible
      open={openGroups.archive}
      onNsGroupToggle={(e) => setOpenGroups((g) => ({ ...g, archive: e.detail.open }))}
    >
      <NsNavItem href="/archive" label="지난 프로젝트" badge="AR" />
    </NsNavGroup>
```

- [ ] **Step 6: `index.html` 정적 검사 넷을 돌린다**

```sh
grep -c '<script>' index.html
grep -n '</script>' index.html | grep -v -E ':\s*</script>\s*$' | grep -v '<script src='
grep -n 'document.addEventListener' index.html
grep -oE '(^|[[:space:]])id="[^"]*"' index.html | sed -E 's/.*id="([^"]*)"/\1/' | sort | uniq -d
```

기대: 첫 번째는 `1`, 나머지 셋은 **출력 없음**.

**네 번째가 특히 중요하다.** `getElementById` 는 문서 순서상 첫 번째를 주므로 id 가 겹치면 엉뚱한 요소를 받고 `querySelector(...).addEventListener` 에서 예외가 난다. 이 파일의 배선은 `<script>` 하나라 그 지점부터 아래 전부가 실행되지 않는데 **화면은 멀쩡해 보인다.** 이 태스크가 새 id 를 더한다면 `nav-group-` 접두사를 붙인다.

- [ ] **Step 7: `docs/project-structure.md` 의 이벤트 개수를 고친다**

40행이 `이벤트는 여덟이다.` 로 시작한다. `아홉` 으로 바꾸고 목록에 `ns-group-toggle`(`{ open }`) 을 `ns-navigate` 다음에 끼운다.

같은 파일 위쪽 태그 표의 `ns-nav-group` 행 설명도 손본다.

```md
| `ns-nav-group` | 제목이 붙은 네비게이션 그룹. `collapsible` 을 쓰면 헤딩이 토글 버튼이 된다 |
```

- [ ] **Step 8: `README.md` 릴리스 표에 다음 버전 행을 더한다**

표 맨 위(`v0.4.0` 행 위)에 넣는다. 버전 번호는 아직 정해지지 않았으므로 `릴리스 전` 으로 둔다 — `releasing` 스킬이 태그를 자를 때 채운다.

```md
| (릴리스 전) | 변경 | 태그만 올린다. `ns-nav-group` 에 `collapsible` 이 생겼다 — **쓰지 않으면 아무것도 바뀌지 않는다.** 접힘 상태를 저장하려면 `open` 프로퍼티와 `onNsGroupToggle` 을 쓴다 |
```

- [ ] **Step 9: `docs/pending-human-checks.md` 를 채운다**

**`## 범위` 절을 먼저 고친다.** 지금은 "이번 사이클이 넣은 것은 문서 정리 하나다. `dist/` 는 바뀌지 않는다" 인데, 이제 `dist/` 가 바뀐다.

`## B`(재현 불가, 소비자 프로젝트 필요)에 하나. **문장을 아래 내용대로 쓴다 — 무엇을 보나 뿐 아니라 왜 이것이 낮은 위험인지까지 적어야 확인하는 사람이 판정할 수 있다.**

- **Next.js SSR 에서 `default-collapsed` 를 준 그룹이 첫 페인트부터 접혀 있는지.** 무엇이 잘못된 것인가: 펼쳐진 채로 한 프레임 그려졌다가 접히는 것. **최종 상태는 어느 쪽이든 맞다** — `willUpdate` 씨앗이 늦게 도착한 값을 반영하므로 "펼쳐진 채로 남는" 결함은 없다. 남는 위험은 한 프레임뿐이다.

  **이 위험이 낮다고 보는 근거를 함께 적는다.** 문제의 구간은 업그레이드와 하이드레이션 사이인데, `createComponent` 는 **모든** 반응형 프로퍼티를 `useLayoutEffect` 에서만 설정하므로 `label`·`badge` 도 같은 구간을 겪는다. 그 구간에서 페인트가 일어난다면 이번 변경 **전에도** 항목 글자가 비어 있다가 채워지는 것이 보였어야 하고, 소비자 프로젝트에서 그것이 관측된 적이 없다.

  `ns-sidebar` 의 `data-ns-open` 과 `ns-icon` 의 문서 트리 짝이 이 종류를 방어하지만, **그 둘이 실제로 관측한 것은 업그레이드 *전* 구간이다**(예약이 그린 4rem 이 15rem 으로 벌어진 것, 아이콘 자식이 24 에서 20 으로 줄어든 것). 업그레이드 ↔ 하이드레이션 구간은 그 주석들이 **예측**으로 방어한 것이고 관측 기록이 없다. 그룹의 접힘은 업그레이드 전에 아무것도 그리지 않으므로(항목의 내용이 자기 shadow 안에 있다) 오직 이 미관측 구간에만 걸린다.

  **여기서 깜빡임이 실제로 보이면 처방이 정해져 있다** — React shim(`src/react/tags/NavGroup.tsx`)이 `data-ns-collapsed` 를 서버 마크업에 실어 보내고 `connectedCallback` 이 그것을 씨앗으로 읽는 것이다. 다만 그 shim 은 이름 규칙상 `NsNavGroup` → `NavGroup` 개명(breaking)을 데려오므로, **관측 없이 미리 지불하지 않는다.** 별도 릴리스로 낸다.

`## A`(`index.html` 육안)에 일곱:

- **`collapsible` 없는 그룹이 이전과 같은지.** 헤딩에 hover 색 변화·커서 변화·caret 이 **없어야** 정상이다.
- **레일에서 접힌 그룹의 항목이 보이는지.** `ns-sidebar` 절의 토글로 접는다. 항목이 사라지면 결함이다.
- **레일 ↔ 펼침을 오갈 때 접힘 상태가 유지되는지.** 접어 둔 그룹이 사이드바를 접었다 펴면 접힌 채로 돌아와야 한다. 펼쳐져 있으면 결함이다.
- **그 전환 중에 항목이 깜빡이지 않는지.** 사이드바 너비 전환은 200ms 이고 caret 회전은 `--ns-transition-fast`(150ms)다.
- **헤딩 버튼의 포커스 링이 잘리지 않는지.** `outline-offset` 이 음수(`-2px`)라 안쪽에 그린다 — 사이드바 폭 안에 들어와야 한다. 탭으로 이동해 확인한다.
- **다크모드에서 헤딩 hover 색이 `ns-nav-item` hover 와 겨루지 않는지.** 헤딩은 글자색만 바뀌고 배경은 바뀌지 않는 것이 의도다.
- **`button.heading` 이 `div.heading` 과 같은 자리에 놓이는지. 이 항목은 Safari 에서 따로 본다.** `<button>` 의 UA 기본값은 엔진마다 다르고 Safari 는 `-webkit-appearance` 때문에 폰트·패딩·정렬이 Chrome 과 어긋나는 이력이 있다. shadow 리셋이 `width`·`border`·`background`·`font-family`·`text-align` 만 되돌리므로, 남은 UA 값이 어긋나면 **접히는 그룹의 제목만 한 칸 밀린다.** `collapsible` 있는 절과 없는 절의 헤딩을 나란히 두고 좌측 정렬과 줄 높이를 비교한다. **한 엔진만 본 확인은 증거가 아니다.**

- [ ] **Step 10: 전체 검사**

```sh
npm run check
```

기대: 전부 통과. 클래스 문서 대조(`check-controls.mjs`)에 새 이름이 나타나지 **않아야** 한다 — 이 작업의 클래스는 전부 shadow 안이라 문서 트리에 나가지 않는다.

- [ ] **Step 11: 커밋**

```sh
git add index.html docs/project-structure.md README.md docs/pending-human-checks.md
git commit -m "docs(nav-group): 그룹 접힘의 사용법과 확인 목록을 적는다"
```

---

## 끝난 뒤

**빌드해서 문서를 열어야 육안 확인이 가능하다.**

```sh
npm run demo    # npm run build && open index.html
```

`dist` 가 없으면 문서가 빨간 경고 줄을 띄운다.

**푸시하지 않는다.** 릴리스는 `releasing` 스킬이 별도로 다루고, 그 앞에서 `docs/pending-human-checks.md` 를 비우는 것이 전제다 — 남아 있는 항목은 확인되지 않은 항목이고 태그는 되돌릴 수 없다.
