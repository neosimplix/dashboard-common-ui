# 사이드바 레일 제거 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `ns-sidebar` 에서 레일을 걷어내 단일 칼럼으로 되돌리고, `ns-nav-item` 의 배지 사각형을 없애고, 하위 카테고리 중첩과 `open` 제어/비제어 짝은 그대로 남긴다.

**Architecture:** 앞선 계획(`2026-08-26-sidebar-rail-and-nav-subcategory.md`)이 만든 레일을 삭제한다. 사용자가 화면을 보고 "한 글자 타일이 무엇인지 읽히지 않는다" 고 판정했다. 근거와 살아남는 것의 목록은 설계 문서 **§0** 에 있다 — 그 절을 먼저 읽는다.

**Tech Stack:** Lit 3 · TypeScript 5.9 · `@lit/react` 1 · 순수 CSS · Vite

**설계 문서:** `docs/superpowers/specs/2026-08-26-sidebar-rail-and-nav-subcategory-design.md` — **§0 이 §1~§6 을 뒤집는다.**

## Global Constraints

- **이 저장소에는 테스트 러너가 없다. 추가하지 않는다.** 회귀 확인은 `npm run check` 와 `index.html` 육안 확인 둘이다.
- **`git push` 는 하지 않는다.**
- 커밋 메시지: `<type>(<scope>): <subject>` — subject 는 **한국어 명령조**, 마침표 없음.
- **모든 커밋에서 `npm run check` 가 초록이어야 한다.**
- **`:host` 에 `border`·`margin`·`padding` 을 두지 않는다.** `check-tokens.mjs` 규칙 ④.
- **컴포넌트 스타일에 `var()` 폴백을 쓰지 않는다.** `WIRING` 은 빈 집합으로 남는다.
- **`:host-context()` 를 쓰지 않는다.** **`@customElement` 를 쓰지 않는다.**
- 모든 커스텀 이벤트는 `bubbles: true, composed: true`.
- **`document` 에 리스너를 붙이지 않는다.**
- **`data-ns-open` 은 세 층(`react/tags/*.tsx` · `tokens.css` · `*.styles.ts`)에 모두 남아야 한다.** `check-tokens.mjs` 규칙 ③.
- 주석과 문서는 한국어로 **왜** 를 적는다.
- **삭제한 것의 경위를 지우지 않는다.** `docs/gotchas.md` 는 "왜 있었고 왜 없어졌나" 를 남기는 곳이다.

## 살아남는 것 — 지우지 말 것

- `ns-nav-group` 의 `#nested` 판정과 `.nested` 스타일 **전부**
- `open` 프로퍼티 전용 + `default-open` 속성, `#innerOpen`, `willUpdate` 씨앗과 그 `undefined` 좁히기 (**`#toggled` 는 남기지 않는다** — 초안은 남기라고 했으나 자기 토글 경로가 없어져 값이 변하지 않는다. Step 1 뒤 문단에 근거가 있다)
- 호스트의 `data-ns-open` 과 `tokens.css` 의 upgrade 전 예약
- `Sidebar.tsx` 의 `default-open` 원시 속성 렌더(`open === true || defaultOpen === true`)
- `--ns-label-display`·`--ns-group-list-display` 가 **삭제된 상태**

---

## Task 1: `ns-sidebar` 를 단일 칼럼으로 되돌린다

**Files:**
- Modify: `src/components/sidebar/ns-sidebar.ts`
- Modify: `src/components/sidebar/ns-sidebar.styles.ts`
- Modify: `src/types.ts`
- Modify: `src/react/elements.ts`
- Modify: `src/react/tags/Sidebar.tsx`
- Modify: `src/tokens/tokens.css`
- Modify: `docs/consumer-example.tsx`

**Interfaces:**
- Consumes: 없음
- Produces: `NsSidebar` 의 공개 표면이 `open?`(프로퍼티 전용) · `defaultOpen`(속성 `default-open`) 둘로 줄어든다. 이벤트는 `ns-navigate` 통과와 `ns-toggle` 없음 — **`ns-toggle` 도 사라진다**(레일 타일이 없으므로 사이드바가 토글을 요청할 일이 없다). shim `Sidebar` 의 프롭은 `open?`·`defaultOpen?`·`onNavigate?`·`children`·`className`·`style`.

- [ ] **Step 1: `ns-sidebar.ts` 를 아래로 전면 교체한다**

```ts
import { LitElement, html, type PropertyValues } from "lit";
import { property } from "lit/decorators.js";

import { register } from "../../internal/register.js";
import { warnIfTokensMissing } from "../../internal/warn-missing-tokens.js";
import { warnPropertyOnlyAttributes } from "../../internal/warn-property-only.js";
import { styles } from "./ns-sidebar.styles.js";

/**
 * 네비게이션 컨테이너. 열리면 `ns-nav-group` 이 세로로 이어지고 닫히면 사라진다.
 *
 * ```html
 * <ns-sidebar default-open>
 *   <ns-nav-group heading="관리">
 *     <ns-nav-group heading="사용자" collapsible>
 *       <ns-nav-item href="/users" label="목록"></ns-nav-item>
 *     </ns-nav-group>
 *     <ns-nav-item href="/logs" label="로그"></ns-nav-item>
 *   </ns-nav-group>
 * </ns-sidebar>
 * ```
 *
 * **0.5.0 개발 중에 레일 모델을 만들었다가 물렀다.** 4rem 레일에 그룹마다 한 글자
 * 타일을 쌓는 방식이었는데 그것이 무엇인지 읽히지 않았다. 경위는
 * `docs/gotchas.md` 에 있다.
 */
export class NsSidebar extends LitElement {
  static override styles = styles;

  /**
   * 제어 모드. `undefined` 면 비제어다.
   *
   * 속성이 아니라 프로퍼티 전용이다. 겸용했다면 `<ns-sidebar open>` 이 boolean
   * 속성으로 읽혀 제어 모드로 들어가고, 그러면 컴포넌트가 스스로 여닫지 못한다.
   * 순수 HTML 소비자가 쓸 것은 `default-open` 이다.
   *
   * **그래서 그 속성은 무시된다** — 관찰되지 않으므로 제어 모드로 들어가지도
   * 않는다. `connectedCallback` 이 경고한다.
   */
  @property({ attribute: false }) open?: boolean;

  /**
   * 비제어 초기값. 있으면 열린 채로 시작한다.
   *
   * 기본이 닫힘이므로 **기본값에서 벗어나는 쪽**이 속성 이름이다. `ns-dialog` 와
   * 같고, `ns-nav-group` 의 `default-collapsed` 와 반대로 보이지만 규칙은 같다 —
   * 그쪽은 기본이 펼침이었다.
   *
   * **레일이 없어 이 컴포넌트는 스스로 토글하지 않는다.** 그래서 비제어
   * 모드에서 사용자 상호작용으로 여닫히는 경로가 아예 없고, 이 값을 지키던
   * 가드(`#toggled`)도 지킬 대상이 없어져 지웠다 — 나중에 이 값을 바꾸면
   * 그대로 다시 반영된다. 사실상 비제어 모드는 **초기값 하나로 시작해서
   * 계속 그 값을 따라가는 것**이고, "나중에 소비자가 상호작용으로 연 것을
   * `defaultOpen` 변경이 덮어쓴다" 는 걱정을 할 필요가 없다.
   */
  @property({ type: Boolean, attribute: "default-open" }) defaultOpen = false;

  /** 비제어일 때의 진실. */
  #innerOpen = false;

  get #isOpen(): boolean {
    return this.open ?? this.#innerOpen;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    warnIfTokensMissing();
    warnPropertyOnlyAttributes(this, { open: "default-open" });
  }

  /*
    씨앗을 firstUpdated 가 아니라 여기서 심는다. customElements.define 이
    hydrateRoot 보다 먼저 실행되므로 첫 업데이트의 마이크로태스크가 하이드레이션
    커밋의 useLayoutEffect 보다 먼저 흘러가고, @lit/react 의 createComponent 는
    반응형 프로퍼티를 그 useLayoutEffect 에서만 설정한다. firstUpdated 로 한 번만
    읽으면 React 소비자에게 default-open 이 조용히 무시된다.

    대입 전에 좁히는 이유는 반응형 프로퍼티의 필드 기본값이 소비자의 undefined
    대입에 지워지기 때문이다 — shim 의 선택 프롭이 주어지지 않으면 값이 undefined
    이고 createComponent 는 그것을 그대로 대입한다. 좁히지 않으면 #isOpen 이
    undefined 가 되고, **toggleAttribute 의 두 번째 인자가 undefined 면 지우는
    것이 아니라 뒤집는다.**
  */
  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has("defaultOpen")) {
      this.#innerOpen = this.defaultOpen === true;
    }
  }

  /*
    호스트에 속성을 쓴다. 불변 규칙("호스트의 속성을 쓰지 않는다")의 좁은
    예외다 — open 이 프로퍼티 전용이라 CSS 가 볼 속성이 없는데, 폭은 :host 에
    있어야 한다(소비자가 ns-sidebar { width: … } 로 덮을 자리를 남기려면).

    규칙이 막으려던 것은 소비자가 쓴 속성을 덮는 것이고, 이 이름은 소비자가 쓰는
    이름이 아니다 — 소비자가 쓰는 것은 default-open 이다. 덮을 값이 애초에
    없으므로 ns-toast 의 position 과 같은 형태의 예외다.
  */
  protected override updated(): void {
    this.toggleAttribute("data-ns-open", this.#isOpen);
  }

  override render() {
    return html`<nav><slot></slot></nav>`;
  }
}

register("ns-sidebar", NsSidebar);

declare global {
  interface HTMLElementTagNameMap {
    "ns-sidebar": NsSidebar;
  }
}
```

**`#toggled` 도 함께 지운다.** 이 계획의 초안은 필드를 남기라고 했고 그 근거가 틀렸다 — 레일 타일이 이 컴포넌트 안에서 토글을 요청하던 유일한 주체였으므로, 타일이 없어진 뒤에는 "사용자가 한 번이라도 토글했나" 가 **언제나 false** 다. 값이 변하지 않는 가드는 가드가 아니고, 그것을 남기면 읽는 사람에게 자기 토글 경로가 있는 것처럼 읽힌다. 소비자가 `el.open` 을 직접 대입하는 경로는 **제어 모드**이고 그쪽은 `open ?? #innerOpen` 의 `??` 가 이미 지킨다 — `#innerOpen` 씨앗이 무엇이 되든 `open` 이 있으면 그것이 이긴다.

**그래서 비제어 모드는 초기값 전용이다.** `ns-sidebar` 를 여닫는 버튼은 `ns-header` 에만 있고, `ns-toggle` 을 받아 `open` 에 내려주는 한 줄은 여전히 소비자 코드다(`docs/project-structure.md` 의 "남은 일").

- [ ] **Step 2: `ns-sidebar.styles.ts` 를 아래로 전면 교체한다**

```ts
import { css } from "lit";

export const styles = css`
  /*
    overflow-y: auto 가 동작하려면 조상 체인에 실제 높이가 이어져 있어야
    한다. 소비자가 이 엘리먼트에 높이를 주는 레이아웃에 넣어야 한다.

    배경·너비는 preflight 가 건드리지 않으므로 :host 에 그대로 둔다 — 소비자가
    ns-sidebar { … } 로 덮을 자리를 남긴다.
  */
  :host {
    display: block;
    box-sizing: border-box;
    height: 100%;
    min-height: 0;
    width: var(--ns-sidebar-width);
    /*
      양방향을 함께 자른다. 닫힘 규칙에만 두면 열릴 때 규칙이 즉시 매칭을 멈추는
      바람에 폭이 200ms 동안 늘어나는 내내 안의 <nav> 가 호스트 밖으로, 곧 <main>
      위로 그려진다. overflow 는 check-tokens.mjs 규칙 ④ 의 박스 프로퍼티
      (border·margin·padding)가 아니므로 :host 에 두어도 된다.
    */
    overflow: hidden;
    background: var(--ns-color-surface);
    transition: width 200ms var(--ns-transition-ease);
  }

  /*
    닫힘. 레일을 남기지 않고 통째로 사라진다.

    open 이 프로퍼티 전용이라 호스트에는 그 이름의 속성이 없다. 대신 컴포넌트가
    updated() 에서 data-ns-open 을 쓰고, upgrade 전 구간은 tokens.css 의 예약이
    default-open 과 data-ns-open 을 함께 봐서 덮는다. 세 구간이 이렇게 이어진다 —
    upgrade 전에는 문서 예약이, upgrade 와 hydration 사이에는 shim 이 렌더한
    default-open 을 Lit 의 컨버터가 읽어 세운 값이, hydration 이후에는 컴포넌트가
    쓰는 data-ns-open 이 폭을 잡는다.
  */
  :host(:not([data-ns-open])) {
    width: var(--ns-sidebar-width-collapsed);
  }

  /*
    닫히면 탭 순서에서도 빠진다. 폭 0 과 overflow: hidden 은 자를 뿐 숨기지
    않으므로, 그것만으로는 보이지 않는 링크에 Tab 이 내려앉는다.

    지연을 새 상태 쪽에 두는 것이 요점이다 — 닫힐 때는 200ms 뒤에 숨어 애니메이션이
    끝난 뒤에 사라지고, 열릴 때는 기본 규칙에 전이가 없어 즉시 보인다.
  */
  :host(:not([data-ns-open])) nav {
    visibility: hidden;
    transition: visibility 0s 200ms;
  }

  /*
    경계선과 스크롤을 호스트가 아니라 이 <nav> 가 갖는다.

    호스트는 문서 트리에 있으므로 소비자의 문서 규칙이 :host 를 이긴다.
    특정도가 아니라 캐스케이드 순서로 정해지는 것이라 :host 쪽이 아무리
    구체적이어도 진다. Tailwind preflight 의 "*, ::before, ::after,
    ::backdrop { border: 0 solid }" 가 그 규칙이다.

    overflow 를 함께 내리는 이유는 스크롤바와 경계선의 순서다. 경계선만 내리면
    스크롤바가 호스트 것이라 경계선 오른쪽에 생긴다. 같은 요소가 둘을 가져야
    스크롤바가 경계선 안쪽에 남는다.

    min-width 를 두지 않는다. 닫힐 때 폭이 줄어드는 동안 내용이 찌그러지지
    않게 하려던 것이었지만, 그러려면 :host { width: … } override 가 깨진다 —
    소비자가 ns-sidebar { width: 12rem } 처럼 토큰보다 좁은 값을 주면 min-width
    가 여전히 --ns-sidebar-width(15rem)를 붙들어 nav 가 호스트 밖으로 3rem
    삐져나온다. 대신 :host 가 이제 양방향을 자르므로 삐져나올 걱정이 없고,
    안의 .label 이 이미 white-space: nowrap; overflow: hidden; text-overflow:
    ellipsis 라 폭이 줄어드는 동안 글자가 말줄임표로 점진적으로 줄어들 뿐
    레이아웃이 깨지지 않는다.
  */
  nav {
    box-sizing: border-box;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    border-right: 1px solid var(--ns-color-line);
  }
`;
```

**이 블록은 실행 중에 세 번 고쳐졌고 위 내용이 실제로 나간 것이다.** 초안과 달라진 것 셋을 남겨 둔다 — 같은 것을 다시 쓰면 같은 결함을 다시 만든다.

- **`overflow: hidden` 을 닫힘 규칙이 아니라 `:host` 에 둔다.** 닫힘 규칙 안에 있으면 `data-ns-open` 이 붙는 순간 규칙이 매칭을 멈추는데 폭은 아직 늘어나는 중이라, 안의 `<nav>` 가 200ms 내내 `<main>` 위에 그려진다.
- **`visibility: hidden` 규칙을 더한다.** 자르는 것과 숨기는 것은 달라서, 폭 0 짜리 사이드바의 링크에 Tab 이 그대로 내려앉았다.
- **`nav { min-width }` 를 두지 않는다.** 문서화된 `ns-sidebar { width: … }` override 를 깬다.

- [ ] **Step 3: `types.ts` 에서 `NsGroupSelectDetail` 을 지운다**

인터페이스 선언과 `declare global` 의 `"ns-group-select"` 줄 둘 다 지운다.

Run: `grep -rn 'ns-group-select\|NsGroupSelectDetail' src/`
Expected: 이 단계가 끝나면 `src/` 에 출력이 없다(다음 단계들이 나머지를 지운다).

- [ ] **Step 4: `elements.ts` 의 `NsSidebarBase` 를 되돌린다**

`events` 를 `ns-navigate` 하나만 남긴다. `NsGroupSelectDetail` import 를 지운다. `NsToggleDetail` 은 `NsHeader` 가 계속 쓰므로 남긴다.

```ts
export const NsSidebarBase = createComponent({
  react: React,
  tagName: "ns-sidebar",
  elementClass: NsSidebarElement,
  events: {
    // EventName<> 브랜딩이 없으면 핸들러가 (e: Event) => void 로 타입된다.
    onNsNavigate: "ns-navigate" as EventName<CustomEvent<NsNavigateDetail>>,
  },
});
```

그 위 주석에서 `data-ns-open`·`default-open` 두 통로를 설명하는 문단은 **남긴다** — 그 배선은 그대로다.

- [ ] **Step 5: `Sidebar.tsx` 에서 레일 프롭을 지운다**

`activeGroup`·`defaultActiveGroup`·`onGroupSelect`·`onToggle` 네 프롭과 그 JSX 를 지운다. `open`·`defaultOpen`·`onNavigate`·`children`·`className`·`style` 이 남는다. `default-open` 과 `data-ns-open` 두 줄은 **그대로 남긴다** — 조건도 `open === true || defaultOpen === true` 그대로다.

`onNavigate` 의 긴 docstring(0.1.5 부터 선택 프롭인 이유)은 남긴다.

- [ ] **Step 6: `tokens.css` 의 폭을 되돌린다**

```css
  /*
    열린 폭이다. 닫히면 --ns-sidebar-width-collapsed 로 줄어든다.

    0.5.0 개발 중에 이 값이 잠시 19rem 이었다 — 레일 4rem + 패널 15rem 을 합친
    "열린 총폭" 이던 시절이다. 레일을 물리면서 뜻과 값이 함께 돌아왔다.
  */
  --ns-sidebar-width: 15rem;
  /*
    닫힌 폭. 0 이라 사이드바가 통째로 사라진다.

    이름을 지우지 않는 이유는 소비자가 이것을 덮어 좁은 레일 비슷한 것을 원할 수
    있기 때문이다. 그 자리를 남겨 둔다.
  */
  --ns-sidebar-width-collapsed: 0;
```

**upgrade 전 예약은 고치지 않는다.** `ns-sidebar:not(:defined)[default-open]`·`[data-ns-open]` 두 줄이 그대로 맞다. 다만 그 위 주석에 레일을 언급하는 문장이 있으면 지운다.

Run: `grep -n '레일\|19rem' src/tokens/tokens.css`

**출력이 위 두 주석 블록 안의 경위 서술뿐이어야 한다.** 그 둘은 일부러 남기는 역사 기록이다 — 이 저장소는 값이 왜 그 값인지를 주석에 남기고(`--ns-color-accent` 가 같은 모양이다), 다음 사람이 19rem 을 다시 제안하는 것을 막는 것이 그 문장의 일이다. 그 밖의 자리(포커스 링 재고 서술, upgrade 전 예약 주석 등)에 레일이 남아 있으면 지운다.

- [ ] **Step 7: `docs/consumer-example.tsx` 에서 레일 프롭을 지운다**

두 `Sidebar` 사용처에서 `defaultActiveGroup`·`onGroupSelect`·`onToggle` 을 지우고, `NsNavGroup` 에서 `name`·`badge` 를 지운다(다음 태스크가 그 프로퍼티를 삭제하므로 남겨 두면 타입 검사가 깨진다). 제어 사용처는 `open={open}` 을 유지하고, 헤더의 `onNsToggle` 이 `setOpen` 을 부르는 기존 배선이 그대로 살아 있는지 확인한다.

`NsNavItem` 의 `badge` 프롭도 전부 지운다 — 다음 태스크가 그것을 삭제한다.

**중첩과 `onNsGroupToggle` 은 남긴다.** `e.detail.open` 을 실제로 읽는 그 핸들러가 `ns-group-toggle` 의 `EventName<>` 캐스트를 검사하는 자리다.

- [ ] **Step 8: 검사를 돌린다**

Run: `npm run check`
Expected: 초록. 이벤트 목록에서 `ns-group-select` 가 사라지고 아홉으로 돌아간다. 토큰 줄은 `data-ns-* 훅 1 개 세 곳 일치` 를 유지해야 한다.

- [ ] **Step 9: 검사를 고의로 깨뜨려 본다**

`src/components/sidebar/ns-sidebar.styles.ts` 의 `data-ns-open` 을 잠시 `data-ns-opne` 로 오타 낸다.

Run: `node scripts/check-tokens.mjs`
Expected: 실패. `data-ns-*` 훅이 세 곳에서 일치하지 않는다는 메시지. 오타를 되돌린다.

- [ ] **Step 10: 커밋**

```bash
git add src/ docs/consumer-example.tsx
git commit -m "feat(sidebar): 레일을 걷어내고 단일 칼럼으로 되돌린다"
```

---

## Task 2: `ns-nav-group` 에서 레일용 프로퍼티를 지운다

**Files:**
- Modify: `src/components/nav-group/ns-nav-group.ts`

**Interfaces:**
- Consumes: Task 1
- Produces: `NsNavGroup` 의 공개 프로퍼티가 `heading` · `collapsible` · `open` · `defaultCollapsed` 넷으로 돌아간다. `#nested` 와 `.nested` 는 그대로다.

- [ ] **Step 1: `name`·`icon`·`badge` 세 프로퍼티를 지운다**

선언과 doc 주석을 통째로 지운다. `heading` 은 남기되 **`reflect: true`·`useDefault: true` 를 걷는다** — 그것들이 붙어 있던 유일한 이유는 사이드바의 `MutationObserver` 가 속성 변화를 봐야 해서였고, 그 관찰자가 사라졌다.

```ts
  /** 그룹 제목. `[role="group"]` 의 `aria-label` 로도 실린다. */
  @property({ type: String }) heading = "";
```

- [ ] **Step 2: 남은 참조가 없는지 확인한다**

```sh
grep -rn 'useDefault' src/
grep -rn '\.name\b\|\.badge\b\|\.icon\b' src/components/sidebar/
```

Expected: 둘 다 출력이 없다.

- [ ] **Step 3: 검사를 돌린다**

Run: `npm run check`
Expected: 초록.

- [ ] **Step 4: 커밋**

```bash
git add src/components/nav-group/
git commit -m "refactor(nav-group): 레일용 name·icon·badge 를 걷는다"
```

---

## Task 3: `ns-nav-item` 의 배지 사각형을 없앤다

**Files:**
- Modify: `src/components/nav-item/ns-nav-item.ts`
- Modify: `src/components/nav-item/ns-nav-item.styles.ts`

**Interfaces:**
- Consumes: Task 1·2
- Produces: `NsNavItem` 의 공개 프로퍼티가 `href` · `label` · `active` 셋으로 줄어든다. `leading`·`trailing` 슬롯은 남는다.

- [ ] **Step 1: `badge` 프로퍼티를 지우고 render 를 고친다**

`badge` 선언과 doc 주석을 통째로 지운다. `render()` 를 아래로 바꾼다.

```ts
  override render() {
    return html`
      <a class="row" href=${this.href} title=${this.label} @click=${this.#onClick}>
        <slot name="leading"></slot>
        <span class="label">${this.label}</span>
        <span class="trailing"><slot name="trailing"></slot></span>
      </a>
    `;
  }
```

**`.leading` 래퍼를 없애는 것이 요점이다.** 슬롯의 UA 기본값이 `display: contents` 이므로 배정된 것이 그대로 `.row` 의 flex 항목이 되고, **배정된 것이 없으면 아무것도 차지하지 않으며 `gap` 도 생기지 않는다.** 래퍼를 남기면 빈 사각형만큼 글자가 밀린다.

- [ ] **Step 2: `.leading`·`.badge` 규칙을 지우고 `::slotted` 를 다시 쓴다**

`ns-nav-item.styles.ts` 에서 `.leading`, `::slotted([slot="leading"])`, `.badge`, `:host([active]) .badge` 네 규칙과 그 주석을 지우고 아래를 넣는다.

```css
  /*
    소비자가 넣은 요소의 상한. 크기 자체는 여기서 주지 않는다 — 보통 들어오는
    <ns-icon> 은 자기 shadow 의 :host 에서 --ns-icon-size 로 크기를 갖고 그것이
    이 상한보다 작다. 크기가 없는 것을 넣으면 이 규칙은 그것을 키워 주지 않는다.

    flex: none 이 필요한 이유는 이것이 이제 .leading 래퍼 없이 .row 의 직계
    flex 항목이기 때문이다 — 라벨이 길면 축소 대상이 된다.
  */
  ::slotted([slot="leading"]) {
    flex: none;
    max-width: var(--ns-control-height-sm);
    max-height: var(--ns-control-height-sm);
  }
```

- [ ] **Step 3: 눌러지는 줄을 hover 에서 강조한다**

`.row:hover` 규칙에 글자색을 더한다.

```css
  /*
    배경만 바뀌면 "누를 수 있다" 가 정적인 대비로만 드러난다. 글자색이 함께
    올라가면 반응으로도 드러난다 — collapsible 인 그룹 제목이 이미 같은 모양의
    hover 를 갖고 있어 둘이 같은 규약을 쓴다.
  */
  .row:hover {
    background: var(--ns-color-surface-sunken);
    color: var(--ns-color-fg);
  }
```

- [ ] **Step 4: 검사를 돌린다**

Run: `npm run check`
Expected: 초록.

- [ ] **Step 5: 커밋**

```bash
git add src/components/nav-item/
git commit -m "refactor(nav-item): 배지 사각형을 걷고 아이콘 자리를 슬롯만 남긴다"
```

---

## Task 4: 문서와 데모를 되돌린다

**Files:**
- Modify: `index.html`
- Modify: `docs/gotchas.md`
- Modify: `docs/project-structure.md`
- Modify: `README.md`
- Modify: `docs/pending-human-checks.md`
- Modify: `.claude/rules/library-invariants.md`
- Modify: `.claude/rules/verification.md`

**Interfaces:**
- Consumes: Task 1~3
- Produces: 없음

- [ ] **Step 1: `index.html` 에서 레일을 걷는다**

Run: `grep -n 'data-ns-rail\|activeGroup\|default-active-group\|ns-group-select\|레일\|타일' index.html`

찾은 것을 전부 처리한다.

- 문서 셸(`#docs-nav`): `name`·`badge` 를 그룹에서 지운다. `default-open data-ns-open` 두 속성과 그 주석은 **남긴다** — 첫 페인트 예약이라 레일과 무관하다.
- `ns-sidebar` 절: 레일 데모를 단일 칼럼 데모로 바꾸고, 프로퍼티 표에서 `activeGroup`·`defaultActiveGroup` 두 줄을 지우고, 이벤트 표에서 `ns-group-select`·`ns-toggle` 두 줄을 지운다. 동작 목록의 여섯 항목 중 레일을 말하는 것을 지우고 **닫히면 통째로 사라진다**로 바꾼다.
- `ns-nav-group` 절: 프로퍼티 표에서 `name`·`icon`·`badge` 세 줄을 지운다.
- `ns-nav-item` 절: 프로퍼티 표에서 `badge` 줄을 지우고, `leading` 슬롯 설명을 "비우면 그 자리가 접힌다" 로 고친다. 데모 마크업의 `badge="…"` 를 전부 지운다.
- 중첩 데모는 그대로 두되 `name`·`badge` 만 지운다.

**포커스 링 숫자를 되돌린다.** 레일 타일이 사라졌으므로 여덟에서 일곱으로 돌아간다.

**`src/tokens/tokens.css` 쪽은 Task 1 이 이미 고쳤다.** 남은 것은 `index.html` 이다.

Run: `grep -rn '여덟' src/tokens/tokens.css index.html`

출력이 `index.html` 한 곳뿐인지 확인하고 그것을 `일곱` 으로 되돌린다. `tokens.css` 에서도 나오면 Task 1 이 놓친 것이므로 함께 고친다.

- [ ] **Step 2: `index.html` 구조 검사 넷을 돌린다**

```sh
grep -c '<script>' index.html
grep -n '</script>' index.html | grep -v -E ':\s*</script>\s*$' | grep -v '<script src='
grep -n 'document.addEventListener' index.html
grep -oE '(^|[[:space:]])id="[^"]*"' index.html | sed -E 's/.*id="([^"]*)"/\1/' | sort | uniq -d
```

Expected: 첫 줄 `1`, 나머지 셋 출력 없음. **레일 데모의 스크립트를 지웠다면 그것이 참조하던 id 도 함께 지운다.**

- [ ] **Step 3: `gotchas.md` 를 고친다**

레일을 전제로 쓴 절들을 **삭제하지 않고** "왜 만들었고 왜 물렀나" 로 고친다. 대상은 수동 슬롯 배정, 레일 아이콘이 사이드바 자식인 이유, `data-ns-rail` 이 규칙 ③ 밖인 이유, 닫힘 랜드마크 절충, 타일 `id` 파생이다.

**새 절을 하나 더한다** — "레일을 만들었다가 물렀다". 4rem 타일 한 글자가 읽히지 않았다는 것, 아이콘을 준비하지 않은 소비자에게 그것이 기본 경험이라는 것, 그래서 **소비자가 아이콘을 준비해야만 성립하는 네비게이션은 기본형이 될 수 없다**는 것.

`--ns-label-display`·`--ns-group-list-display` 의 생몰 절은 **그대로 둔다** — 그 둘은 되살아나지 않는다.

- [ ] **Step 4: `project-structure.md` 를 고친다**

- 태그 표의 `ns-sidebar` 행: 레일 서술을 지우고 "열리면 그룹이 이어지고 닫히면 사라진다" 로.
- 태그 표의 `ns-nav-group` 행: `name`·`badge` 를 지우고 중첩은 남긴다.
- 태그 표의 `ns-nav-item` 행: `badge` 폴백 서술을 지운다.
- "이벤트는 열이다" → 아홉. 목록에서 `ns-group-select` 를 지운다. **출처를 적은 문장은 남긴다.**

- [ ] **Step 5: `verification.md` 의 개수를 되돌린다**

래퍼 수는 아홉 그대로다(`ns-sidebar` 는 `ns-navigate` 를 계속 매핑한다). 이벤트 수만 줄어든다.

Run: `grep -c 'as EventName<' src/react/elements.ts`

세어서 그 숫자로 고친다. 두 숫자가 다른 것을 세는 이유를 적은 문단은 남긴다.

- [ ] **Step 6: `library-invariants.md` 를 고친다**

- 수동 슬롯 배정을 언급하는 문장을 지운다.
- `attributeFilter` 로 좁힌 `MutationObserver` 예외를 지운다 — 그 관찰자가 사라졌다.
- 호스트 속성 예외는 **셋 그대로** 다(`ns-tabs` 의 `role`, `ns-toast` 의 `position`, `ns-sidebar` 의 `data-ns-open`).
- `key` 를 쓰지 않는다는 항목은 **남긴다** — 여전히 참이고 값싸다.

- [ ] **Step 7: `README.md` 의 이주 절을 다시 쓴다**

레일 표를 걷는다. 0.5.0 이 소비자에게 요구하는 것은 이제 하나다 — `<ns-sidebar open>` → `<ns-sidebar default-open>`. 그 외에는 **`ns-nav-item` 의 `badge` 가 없어진 것**이 유일한 breaking 이다. 폭은 15rem 그대로이므로 이주 항목이 아니다.

`badge` 를 쓰던 소비자에게 대안을 준다 — `leading` 슬롯에 원하는 요소를 넣는다.

- [ ] **Step 8: `pending-human-checks.md` 를 다시 쓴다**

레일 항목이 전부 무효다. `## 범위` 를 다시 쓰고 A·B 목록에서 레일 항목을 지운 뒤 번호를 이어 붙인다. 살아남는 것과 새로 필요한 것은 이렇다.

- 하위 카테고리 관련 항목 전부(들여쓰기, 하위 제목 대비, hover 오른쪽 끝, 3단, 중첩 없는 그룹 회귀)
- 첫 페인트 폭(15rem ↔ 0)과 그 Safari 확인
- **새로:** 배지를 없앤 뒤 아이콘 없는 항목의 글자가 왼쪽 끝까지 붙는지, 일부 항목에만 아이콘을 줬을 때 줄이 들쭉날쭉해 보이는지 — **후자가 이 변경에서 가장 판정이 필요한 자리다**
- **새로:** hover 에서 글자색이 올라가는 것이 그룹 제목 hover 와 겨루지 않는지
- B 는 Next.js SSR 첫 페인트 하나만 남는다. 레일 아이콘 항목은 사라진다.

- [ ] **Step 9: 검사와 구조 검사를 함께 돌린다**

```sh
npm run check
grep -c '<script>' index.html
grep -n '</script>' index.html | grep -v -E ':\s*</script>\s*$' | grep -v '<script src='
grep -n 'document.addEventListener' index.html
grep -oE '(^|[[:space:]])id="[^"]*"' index.html | sed -E 's/.*id="([^"]*)"/\1/' | sort | uniq -d
```

Expected: `npm run check` 초록, 첫 grep `1`, 나머지 셋 출력 없음.

- [ ] **Step 10: 커밋**

```bash
git add index.html docs/ README.md .claude/
git commit -m "docs(sidebar): 레일을 걷은 뒤의 문서와 데모를 맞춘다"
```

---

## 마감 — 사람이 볼 것

**구현 서브에이전트는 화면을 볼 수 없다. 하지 않은 확인을 했다고 보고하지 않는다.**

전부 끝나면 `npm run demo` 로 사람이 확인한다. 목록은 `docs/pending-human-checks.md` 에 있고, 이번에 가장 중요한 것은 **일부 항목에만 아이콘을 줬을 때 줄이 들쭉날쭉해 보이는지**다 — 배지를 없애면서 정렬을 포기한 것이 옳았는지가 거기서 갈린다.
