# 사이드바 레일 재설계와 네비게이션 하위 카테고리 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `ns-sidebar` 를 VS Code 의 활동 바 + 사이드 바 모델로 바꾸고(항상 보이는 레일 + 한 그룹만 보여주는 패널), `ns-nav-group` 을 중첩해 그룹 아래 하위 카테고리를 만든다.

**Architecture:** `ns-sidebar` 가 `slotAssignment: "manual"` shadow root 를 갖고, 직계 자식 `ns-nav-group` 을 열거해 레일 타일을 렌더한 뒤 **선택된 그룹 하나만** 패널 슬롯에 배정한다. 하위 카테고리는 `ns-nav-group` 이 `connectedCallback` 에서 자기 중첩을 판정해 shadow 래퍼에 클래스를 붙이는 것으로 표현한다. 레일이 항목을 그리지 않게 되므로 `--ns-label-display`·`--ns-group-list-display` 두 신호가 함께 죽는다.

**Tech Stack:** Lit 3 · TypeScript 5.9 · `@lit/react` 1 · 순수 CSS(빌드 없음) · Vite

**설계 문서:** `docs/superpowers/specs/2026-08-26-sidebar-rail-and-nav-subcategory-design.md` — 모든 "왜" 는 거기에 있다. 이 계획은 "무엇을" 만 담는다.

## Global Constraints

- **이 저장소에는 테스트 러너가 없다. 추가하지 않는다.** vitest·jest·playwright·web-test-runner 를 설치하지 않고 테스트 파일도 만들지 않는다. 회귀 확인은 `npm run check` 와 `index.html` 육안 확인 둘이다.
- **`git push` 는 하지 않는다.** 로컬 커밋까지만 한다.
- 커밋 메시지: `<type>(<scope>): <subject>` — type 은 `feat`·`fix`·`refactor`·`style`·`docs`·`test`·`chore` 중 하나, scope 는 영어 소문자, subject 는 **한국어 명령조**, 마침표 없음.
- **모든 커밋에서 `npm run check` 가 초록이어야 한다.** 태스크 경계는 그 조건을 만족하도록 그어져 있다.
- 컴포넌트 태그는 `ns-` 접두사, 커스텀 프로퍼티는 `--ns-` 접두사, 이벤트는 `ns-` + 케밥 케이스 + `bubbles: true, composed: true`.
- **`@customElement` 데코레이터를 쓰지 않는다.** `src/internal/register.ts` 의 `register()` 를 쓴다.
- **로직과 스타일을 파일 두 개로 나눈다.** `ns-x.ts` / `ns-x.styles.ts`.
- **`:host` 에 `border`·`margin`·`padding` 을 두지 않는다.** `scripts/check-tokens.mjs` 의 규칙 ④ 가 강제한다. 박스는 shadow 안의 요소가 갖는다.
- **컴포넌트 스타일에 `var()` 폴백을 쓰지 않는다.** 이 계획이 끝나면 예외가 하나도 남지 않는다.
- **`:host-context()` 를 쓰지 않는다.** Chromium 전용이다.
- **다크모드 값은 토큰마다 `light-dark()` 한 쌍이다.** `@media (prefers-color-scheme: dark)` 블록을 만들지 않는다.
- **토큰은 문서 `:root` 에만 정의한다.** 컴포넌트 shadow 의 `:host` 에 토큰을 정의하지 않는다.
- **`title` 을 우리가 정의하는 프로퍼티/속성 이름으로 쓰지 않는다.** shadow 안 요소에 브라우저 툴팁을 띄우려고 `title=` 을 쓰는 것은 이 제약의 대상이 아니다(`ns-nav-item` 이 이미 그렇게 쓴다).
- **`key` 를 속성/프로퍼티 이름으로 쓰지 않는다.** React 가 재조정 키로 소비해 엘리먼트까지 오지 않는다.
- 브라우저 하한: Chrome 123 · Safari 17.5 · Firefox 121. 수동 슬롯 배정(Chrome 86 · Safari 16.4 · Firefox 92)은 그 아래다.
- 값: `--ns-sidebar-width` 는 **열린 총폭**(`19rem`), `--ns-sidebar-width-collapsed` 는 **닫힌 총폭 = 레일 폭**(`4rem`). 패널 폭은 `calc()` 로 파생시키고 토큰을 만들지 않는다.
- **사람 눈이 필요한 확인을 했다고 보고하지 않는다.** 보고서에 정적으로 확인한 것과 사람 눈이 필요한 것을 구분해 적고, 후자는 `docs/pending-human-checks.md` 로 옮긴다.

## 파일 구조

| 파일 | 책임 |
|---|---|
| `src/components/sidebar/ns-sidebar.ts` | 레일 열거·타일 렌더·수동 슬롯 배정·선택 상태·`open` 제어/비제어·키보드 |
| `src/components/sidebar/ns-sidebar.styles.ts` | `.shell`·`.rail`·`.tile`·`.panel` shadow CSS |
| `src/components/nav-group/ns-nav-group.ts` | `name`·`badge`·`heading` 반영, 접힘, 중첩 판정 |
| `src/components/nav-group/ns-nav-group.styles.ts` | 헤딩·목록·caret·`.nested` |
| `src/components/nav-item/ns-nav-item.styles.ts` | 신호 제거로 `display: block` 고정 |
| `src/types.ts` | 이벤트 `detail` 타입과 `HTMLElementEventMap` |
| `src/react/elements.ts` | `@lit/react` 래퍼. 이벤트 매핑의 단일 출처 |
| `src/react/tags/Sidebar.tsx` | 공개 shim. 프롭 이름과 `data-ns-open` SSR 통로 |
| `src/tokens/tokens.css` | 토큰과 upgrade 전 레이아웃 예약 |
| `scripts/check-tokens.mjs` | `WIRING` 집합 |
| `index.html` | 문서 겸 플레이그라운드. 문서 셸 자체가 이 컴포넌트들이다 |

---

## Task 1: `ns-nav-group` 에 `name`·`badge` 와 반영

레일 타일이 읽을 데이터를 그룹에 심는다. 이 태스크만으로는 화면이 달라지지 않는다 — 두 값을 읽는 쪽이 Task 2 다.

**Files:**
- Modify: `src/components/nav-group/ns-nav-group.ts`
- Modify: `index.html` (`ns-nav-group` 절의 프로퍼티 표)

**Interfaces:**
- Consumes: 없음
- Produces: `NsNavGroup` 의 공개 프로퍼티 `name: string`, `icon: string`, `badge: string`, 그리고 `heading`·`name`·`icon`·`badge` 네 속성의 반영. Task 2 의 `#syncGroups()` 가 네 값을 프로퍼티로 읽고 같은 이름의 속성으로 폴백한다.

- [ ] **Step 1: `heading` 에 반영을 켜고 `name`·`badge` 를 더한다**

`src/components/nav-group/ns-nav-group.ts` 의 `heading` 선언을 찾아 아래로 교체한다. 기존 선언은 이렇다.

```ts
  /** 그룹 제목. 사이드바가 접히면 시각적으로 숨지만 aria-label 로는 남는다. */
  @property({ type: String }) heading = "";
```

교체 후.

```ts
  /**
   * 그룹 제목. `ns-sidebar` 안에서는 이것이 그대로 패널 제목의 자리에 온다.
   *
   * 반영하는 이유는 사이드바가 이 값을 관찰하기 때문이다. `@lit/react` 의
   * `createComponent` 는 반응형 프로퍼티를 **프로퍼티로만** 설정하므로, 반영이
   * 없으면 React 소비자가 제목을 바꿔도 속성 변화가 일어나지 않아 사이드바의
   * MutationObserver 가 보지 못한다. 소비자가 준 값을 되울리는 것이라
   * "호스트의 속성을 쓰지 않는다" 가 겨냥하는 덮어쓰기가 아니다 —
   * `ns-nav-item` 의 `active` 가 이미 같은 방식이다.
   */
  @property({ type: String, reflect: true }) heading = "";

  /**
   * 레일 키. `ns-sidebar` 의 `activeGroup` 이 이 값을 가리킨다.
   *
   * **이름이 `key` 가 아닌 이유는 React 다.** `key` 는 재조정 키로 소비되어
   * 엘리먼트까지 도달하지 않고, shim 으로도 고칠 수 없다 — `title` 은 우리에게
   * 도착한 뒤 이름을 바꿀 수 있었지만 `key` 는 도착하지 않는다.
   *
   * `heading` 을 키로 쓰지 않는 이유는 그것이 표시용 문자열이라는 것이다.
   * `ns-group-toggle` 의 `detail` 에서 이미 한 판단이다.
   *
   * 비어 있으면 사이드바가 DOM 순서 인덱스를 키로 쓰고 경고한다.
   */
  @property({ type: String, reflect: true }) name = "";

  /**
   * 레일 타일에 그릴 아이콘의 이름. `<ns-icon name="…">` 에 그대로 넘어간다.
   *
   * **스프라이트는 열려 있다** — 내장 셋에 없는 이름은 `registerIcons()` 로
   * 더한다. 그룹의 정의가 마크업 한 자리에 모이므로 이것이 기본 경로다.
   *
   * 이것으로 부족한 경우가 둘 있고 그때는 사이드바의 직계 자식에
   * `data-ns-rail="<name>"` 로 요소를 직접 넣는다 — React 아이콘 컴포넌트를
   * 쓸 때, 그리고 `registerIcons` 가 Next 번들에 들어가지 않는 배치일 때다.
   */
  @property({ type: String, reflect: true }) icon = "";

  /**
   * 레일 타일에 보이는 짧은 글자. 1~2자를 넣는다.
   *
   * 타일 내용은 네 단계로 떨어진다 — `data-ns-rail` 슬롯 → `icon` → 이
   * `badge` → `heading` 의 첫 글자. 마지막 단이 있는 이유는 이주다: 0.4.0
   * 소비자는 `heading` 만 갖고 있으므로 아무것도 더하지 않아도 레일이 빈
   * 타일이 되지 않는다.
   *
   * `ns-nav-item` 의 `badge` 와 같은 종류의 폴백이지만 **그쪽은 행 안에 늘
   * 보이고 이것은 레일에만 보인다.**
   */
  @property({ type: String, reflect: true }) badge = "";
```

- [ ] **Step 2: 검사를 돌린다**

Run: `npm run check`
Expected: 초록. 마지막 줄이 `토큰 참조 확인 완료: … data-ns-* 훅 1 개 세 곳 일치 …` 다.

- [ ] **Step 3: `index.html` 의 프로퍼티 표에 두 줄을 더한다**

`ns-nav-group` 절의 프로퍼티 표를 찾는다.

Run: `grep -n 'id="ns-nav-group"' index.html`

그 절의 `<tbody>` 에서 `heading` 행 **다음에** 두 줄을 넣는다. 표의 칼럼 순서는 그 절의 기존 행을 그대로 따른다(프로퍼티 · 속성 · 타입 · 기본값 · 설명).

```html
    <tr><td><code>name</code></td><td><code>name</code></td><td>string</td><td><code>""</code></td><td><code>ns-sidebar</code> 레일의 키. <strong><code>key</code> 는 React 가 먹으므로 쓸 수 없다</strong></td></tr>
    <tr><td><code>icon</code></td><td><code>icon</code></td><td>string</td><td><code>""</code></td><td>레일 타일에 그릴 <code>ns-icon</code> 이름. 내장 셋에 없으면 <code>registerIcons()</code> 로 더한다</td></tr>
    <tr><td><code>badge</code></td><td><code>badge</code></td><td>string</td><td><code>""</code></td><td>레일 타일의 글자 폴백. 1~2자. <code>icon</code> 이 없을 때 보인다</td></tr>
```

- [ ] **Step 4: `index.html` 구조 검사 넷을 돌린다**

```sh
grep -c '<script>' index.html
grep -n '</script>' index.html | grep -v -E ':\s*</script>\s*$' | grep -v '<script src='
grep -n 'document.addEventListener' index.html
grep -oE '(^|[[:space:]])id="[^"]*"' index.html | sed -E 's/.*id="([^"]*)"/\1/' | sort | uniq -d
```

Expected: 첫 줄은 `1`. 나머지 셋은 출력이 없다.

- [ ] **Step 5: 커밋**

```bash
git add src/components/nav-group/ns-nav-group.ts index.html
git commit -m "feat(nav-group): 레일이 읽을 name·icon·badge 를 더하고 heading 을 반영한다"
```

---

## Task 2: `ns-sidebar` 재작성 — 레일·패널·수동 슬롯·선택 상태

이 태스크의 결과물은 **레일이 동작하는 사이드바**다. `open` 은 아직 지금처럼 반영되는 boolean 속성이고, 그것을 제어/비제어 짝으로 바꾸는 것은 Task 4 다. 키보드는 Task 3 이다.

**Files:**
- Modify: `src/components/sidebar/ns-sidebar.ts` (전면 교체)
- Modify: `src/components/sidebar/ns-sidebar.styles.ts` (전면 교체)
- Modify: `src/components/nav-group/ns-nav-group.styles.ts` (신호 제거)
- Modify: `src/components/nav-item/ns-nav-item.styles.ts` (신호 제거)
- Modify: `src/components/nav-item/ns-nav-item.ts` (주석 갱신)
- Modify: `src/types.ts`
- Modify: `src/react/elements.ts`
- Modify: `src/react/tags/Sidebar.tsx`
- Modify: `src/tokens/tokens.css`
- Modify: `scripts/check-tokens.mjs`
- Modify: `docs/consumer-example.tsx`

**Interfaces:**
- Consumes: Task 1 의 `NsNavGroup.name`·`icon`·`badge`·`heading`(반영됨)
- Produces:
  - `NsSidebar.activeGroup?: string` (프로퍼티 전용), `NsSidebar.defaultActiveGroup: string` (속성 `default-active-group`)
  - `NsGroupSelectDetail { name: string }` 와 이벤트 `ns-group-select`
  - `NsSidebarBase` 의 `onNsGroupSelect`·`onNsToggle`
  - shim `Sidebar` 의 프롭 `activeGroup?`·`defaultActiveGroup?`·`onGroupSelect?(name: string)`·`onToggle?(open: boolean)`
  - shadow 안 슬롯의 클래스 이름 `panel-slot`·`tile-slot` 과 `data-name` 표시 — Task 3 이 같은 이름으로 질의한다

- [ ] **Step 1: `types.ts` 에 `NsGroupSelectDetail` 을 더한다**

`NsGroupToggleDetail` 인터페이스 **다음에** 넣는다.

```ts
/**
 * ns-sidebar 의 레일 타일이 요청하는 다음 그룹.
 *
 * `name` 은 `ns-nav-group` 의 `name` 속성이다. `heading` 을 함께 싣지 않는
 * 이유는 그것이 표시용 문자열이라 상태를 저장할 키로 나쁘고, 필드가 둘이 되는
 * 순간 필드를 하나 더하는 것이 breaking 이 되기 때문이다 —
 * NsGroupToggleDetail 과 같은 판단이다.
 *
 * **"바뀌었다" 가 아니라 "바꾸고 싶다" 다.** 제어 모드에서 소비자가
 * activeGroup 을 바꾸지 않으면 패널은 그대로 있다.
 */
export interface NsGroupSelectDetail {
  name: string;
}
```

그리고 파일 끝의 `declare global` 블록 안 `"ns-group-toggle"` 줄 다음에 한 줄을 더한다.

```ts
    "ns-group-select": CustomEvent<NsGroupSelectDetail>;
```

- [ ] **Step 2: `ns-sidebar.ts` 를 전면 교체한다**

```ts
import { LitElement, html, nothing, type PropertyValues } from "lit";
import { property } from "lit/decorators.js";

import { register } from "../../internal/register.js";
import { warnIfTokensMissing } from "../../internal/warn-missing-tokens.js";
import { warnPropertyOnlyAttributes } from "../../internal/warn-property-only.js";
import type { NsNavGroup } from "../nav-group/ns-nav-group.js";

// 타일 폴백이 <ns-icon> 을 쓴다. 등록 부수효과가 필요하다.
import "../icon/ns-icon.js";
import type { NsGroupSelectDetail, NsToggleDetail } from "../../types.js";
import { styles } from "./ns-sidebar.styles.js";

/**
 * 레일 타일 하나가 필요로 하는 것. 직계 자식 그룹에서 읽어 만든다.
 *
 * 그룹 엘리먼트를 그대로 들고 있는 이유는 패널 슬롯에 배정할 대상이 그것이기
 * 때문이다. 수동 배정은 노드 참조를 받는다.
 */
interface RailEntry {
  /** activeGroup 이 가리키는 키. name 이 비면 DOM 순서 인덱스의 문자열이다. */
  key: string;
  /** 타일의 aria-label 과 title. */
  heading: string;
  /** 타일 슬롯이 비었을 때 보이는 것. ns-icon 템플릿이거나 글자다. */
  fallback: unknown;
  /** 패널 슬롯에 배정할 그룹. */
  group: Element;
  /** 타일 슬롯에 배정할 아이콘. 없으면 undefined 다. */
  icon?: Element;
}

/**
 * 네비게이션 컨테이너. **레일과 패널 두 칼럼이다.**
 *
 * 레일은 항상 보이고 직계 자식 `ns-nav-group` 하나마다 타일 하나를 갖는다.
 * 패널은 **선택된 그룹 하나만** 보여주고 `open` 이 거짓이면 사라진다. VS Code
 * 의 활동 바 + 사이드 바 모델이다.
 *
 * ```html
 * <ns-sidebar open>
 *   <ns-icon data-ns-rail="admin">…</ns-icon>
 *   <ns-nav-group name="admin" heading="관리" badge="관"> … </ns-nav-group>
 * </ns-sidebar>
 * ```
 *
 * **`slotAssignment: "manual"` 이라 `slot` 속성이 동작하지 않는다.** 배정은 전부
 * 이 컴포넌트가 한다. 그래서 아이콘의 표시는 `slot=` 이 아니라 `data-ns-rail` 이고,
 * 선택되지 않은 그룹은 숨겨지는 것이 아니라 **배정되지 않아 렌더되지 않는다** —
 * 레이아웃에도 접근성 트리에도 없고, light DOM 에는 그대로 남아 접힘 상태를
 * 계속 들고 있다.
 */
export class NsSidebar extends LitElement {
  static override styles = styles;

  /*
    수동 슬롯 배정. 선택된 그룹만 패널에, 그 그룹의 아이콘만 그 타일에 배정한다.
    자동 배정이었다면 선택되지 않은 그룹을 소비자 DOM 에 속성을 써서 숨겨야 하고,
    그러면 MutationObserver 와 이름 충돌 위험이 함께 온다.

    부수 효과로 사이드바 자식의 공백 텍스트 노드가 무해해진다 — 자동 배정에서는
    기본 슬롯으로 가서 패널에 들어간다.
  */
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    slotAssignment: "manual",
  };

  /**
   * 패널 보임 여부. 거짓이면 레일만 남는다 — 사이드바가 사라지지는 않는다.
   * 컴포넌트가 스스로 바꾸지 않는다 — `ns-header` 의 `ns-toggle` 을 받아
   * 소비자가 내려준다.
   */
  @property({ type: Boolean, reflect: true }) open = false;

  /**
   * 제어 모드의 활성 그룹. `undefined` 면 비제어다.
   *
   * 속성이 아니라 프로퍼티 전용인 이유는 `ns-tabs` 의 `active` 와 같다 —
   * `<ns-sidebar active-group="admin">` 이 속성으로 읽히면 제어 모드로 들어가
   * 컴포넌트가 스스로 그룹을 바꾸지 못한다. 순수 HTML 은 `default-active-group`
   * 을 쓴다.
   *
   * **그래서 그 속성은 무시된다** — 관찰되지 않으므로 제어 모드로 들어가지도
   * 않는다. 붙어 있으면 connectedCallback 이 경고한다.
   */
  @property({ attribute: false }) activeGroup?: string;

  /** 비제어 초기 그룹. 비어 있으면 첫 번째 그룹이다. */
  @property({ type: String, attribute: "default-active-group" }) defaultActiveGroup = "";

  /** 비제어일 때의 진실. */
  #innerActive = "";

  /** 사용자가 한 번이라도 골랐나. 늦게 도착한 defaultActiveGroup 이 그것을 덮지 않게 막는다. */
  #selected = false;

  /** 렌더가 읽는 목록. 반응형 프로퍼티가 아니므로 갱신을 직접 요청한다. */
  #entries: RailEntry[] = [];

  #observer?: MutationObserver;

  /*
    평생 한 번만 켜진다. ns-tabs 의 #warnedNoMatch 와 같은 관용구다 — 렌더마다
    다시 경고하면 스팸이 되고, 다른 진단과 플래그를 공유하면 먼저 일어난 쪽이
    나머지를 막는다.
  */
  #warnedNoMatch = false;
  #warnedNoName = false;
  #warnedDupName = false;

  get #controlledGroup(): boolean {
    return this.activeGroup !== undefined;
  }

  /**
   * 지금 패널에 있는 항목. 지목된 것이 목록에 없으면 첫 번째다.
   *
   * 제어 모드에서도 폴백한다. `ns-tabs` 와 같은 자리다 — 표시만 폴백하고 소비자
   * 상태를 교정하지 않으며, 경고가 "첫 그룹을 보여주지만 그 타일을 눌러도
   * ns-group-select 가 나가지 않는다" 를 알린다.
   */
  get #activeEntry(): RailEntry | undefined {
    const entries = this.#entries;
    if (entries.length === 0) return undefined;

    const wanted = this.activeGroup ?? this.#innerActive;
    const found = entries.find((e) => e.key === wanted);
    if (found !== undefined) return found;

    const fallback = entries[0];

    // 빈 문자열은 지목이 아니다 — 비제어 기본값(첫 그룹)을 뜻하므로 거른다.
    if (wanted !== "" && !this.#warnedNoMatch) {
      this.#warnedNoMatch = true;
      console.warn(
        this.#controlledGroup
          ? `[ns-sidebar] activeGroup="${wanted}" 와 일치하는 ns-nav-group[name] 이 없습니다. 첫 그룹 "${fallback.key}" 을 보여주지만 그 타일을 눌러도 ns-group-select 가 나가지 않습니다. 대소문자까지 맞는지 확인하세요.`
          : `[ns-sidebar] 활성 그룹 "${wanted}" 와 일치하는 ns-nav-group[name] 이 없습니다. 첫 그룹 "${fallback.key}" 을 보여줍니다. default-active-group 값이 name 과 맞는지 확인하세요.`,
      );
    }

    return fallback;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    warnIfTokensMissing();
    warnPropertyOnlyAttributes(this, { "active-group": "default-active-group" });

    this.#syncGroups();

    /*
      childList 는 그룹이 늘고 줄는 것을, attributeFilter 는 레일이 읽는 네 값이
      바뀌는 것을 본다. 수동 배정에서는 자식이 바뀌어도 배정이 자동으로 변하지
      않으므로 slotchange 가 발생하지 않는다 — 이 관찰자가 유일한 신호다.

      **subtree 가 없으면 attributes 절반이 죽는다.** MutationObserver 의
      attributes 는 관찰 대상 노드 **자신의** 속성만 보므로, subtree 없이는
      호스트의 속성을 볼 뿐 자식 그룹의 heading 이 바뀌는 것을 보지 못한다.

      **불변 규칙의 "attributes 는 켜지 않는다" 와 어긋나지 않는다.** 그 규칙이
      막으려는 것은 동기화가 setAttribute 를 쓰므로 자기 쓰기에 재발동해 루프가
      되는 것인데, 여기서 하는 동기화는 slot.assign() 이고 자식의 속성을 쓰지
      않는다. attributeFilter 가 대상을 우리가 쓰지 않는 이름들로 못박아 그
      성질을 코드에 남긴다.
    */
    this.#observer = new MutationObserver(() => this.#syncGroups());
    this.#observer.observe(this, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["name", "heading", "icon", "badge", "data-ns-rail"],
    });
  }

  override disconnectedCallback(): void {
    this.#observer?.disconnect();
    this.#observer = undefined;
    super.disconnectedCallback();
  }

  /*
    씨앗을 firstUpdated 가 아니라 여기서 심는다. ns-nav-group 의
    defaultCollapsed 와 정확히 같은 이유다 — customElements.define 이
    hydrateRoot 보다 먼저 실행되므로 첫 업데이트의 마이크로태스크가 하이드레이션
    커밋의 useLayoutEffect 보다 먼저 흘러가고, @lit/react 의 createComponent 는
    반응형 프로퍼티를 그 useLayoutEffect 에서만 설정한다. firstUpdated 로 한 번만
    읽으면 React 소비자에게 default-active-group 이 조용히 무시된다.
  */
  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has("defaultActiveGroup") && !this.#selected) {
      this.#innerActive = this.defaultActiveGroup;
    }
  }

  override render() {
    const entries = this.#entries;
    const active = this.#activeEntry;

    return html`
      <div class="shell">
        <div class="rail" role="tablist" aria-orientation="vertical">
          ${entries.map((entry) => this.#tile(entry, entry === active))}
        </div>
        <nav class="panel">
          <!--
            role="tabpanel" 을 <nav> 에 두지 않는다. role 은 암시적 역할을 덮으므로
            얹으면 navigation 랜드마크가 사라진다 — 네비게이션 사이드바에서 그것은
            잃어도 되는 것이 아니다. 안쪽 <div> 가 tabpanel 을 지고 aria-labelledby
            로 활성 타일을 가리켜 패널에 이름이 붙는다(그 이름이 그룹의 heading 이다).
          -->
          <div
            id="panel"
            role="tabpanel"
            aria-labelledby=${active === undefined ? nothing : `tile-${active.key}`}
          >
            <slot class="panel-slot"></slot>
          </div>
        </nav>
      </div>
    `;
  }

  #tile(entry: RailEntry, isActive: boolean) {
    /*
      패널이 닫혀 있으면 선택된 타일이 없다 — VS Code 가 사이드 바를 숨겼을 때와
      같다. roving tabindex 는 그것과 무관하게 활성 항목을 따라간다. 둘이 갈라져야
      패널이 닫혀도 레일에 Tab 으로 닿을 수 있다.
    */
    const selected = isActive && this.open;
    return html`
      <button
        id=${`tile-${entry.key}`}
        class=${selected ? "tile selected" : "tile"}
        type="button"
        role="tab"
        aria-selected=${selected ? "true" : "false"}
        aria-controls="panel"
        aria-label=${entry.heading}
        title=${entry.heading}
        tabindex=${isActive ? "0" : "-1"}
        data-name=${entry.key}
        @click=${() => this.#onTile(entry.key)}
      >
        <span class="tile-body">
          <slot class="tile-slot" data-name=${entry.key}>${entry.fallback}</slot>
        </span>
      </button>
    `;
  }

  /*
    배정은 렌더 다음이어야 한다. 슬롯이 그때 존재한다.

    assign() 을 인자 없이 부르면 배정이 비워진다 — 선택된 그룹이 없거나 그 그룹에
    아이콘이 없는 경우가 그것이다.
  */
  protected override updated(): void {
    const active = this.#activeEntry;

    const panel = this.renderRoot.querySelector<HTMLSlotElement>("slot.panel-slot");
    panel?.assign(...(active === undefined ? [] : [active.group]));

    for (const slot of this.renderRoot.querySelectorAll<HTMLSlotElement>("slot.tile-slot")) {
      const entry = this.#entries.find((e) => e.key === slot.dataset.name);
      slot.assign(...(entry?.icon === undefined ? [] : [entry.icon]));
    }
  }

  /**
   * 직계 자식에서 레일 목록을 다시 만든다.
   *
   * **직계 자식만 본다.** 중첩된 하위 그룹은 그룹의 자식이므로 애초에 보이지
   * 않는다. 그룹이 아닌 자식은 아이콘 표시가 없으면 어디에도 배정되지 않아
   * 렌더되지 않는다.
   */
  #syncGroups(): void {
    const children = [...this.children];

    const icons = new Map<string, Element>();
    for (const el of children) {
      const key = el.getAttribute("data-ns-rail");
      if (key === null || key === "") continue;
      /*
        그룹 자신에 data-ns-rail 을 붙이면 그 그룹이 타일 슬롯으로 가버려 패널이
        빈다. 노드 하나는 슬롯 하나에만 배정되기 때문이다. 걸러내고 경고한다.
      */
      if (el.tagName === "NS-NAV-GROUP") {
        console.warn(
          `[ns-sidebar] data-ns-rail 은 그룹이 아니라 아이콘 요소에 붙입니다. ns-nav-group 에 붙이면 그 그룹이 레일 타일로 가버려 패널이 빕니다.`,
        );
        continue;
      }
      // 같은 키가 둘이면 문서 순서상 첫 번째를 쓴다. getElementById 와 같은 규약이다.
      if (!icons.has(key)) icons.set(key, el);
    }

    const groups = children.filter((el) => el.tagName === "NS-NAV-GROUP");
    const seen = new Set<string>();

    /*
      프로퍼티를 먼저 읽고 속성으로 폴백한다. 둘이 필요한 이유는 타이밍이다 —
      React 는 프로퍼티로 설정하고 반영은 다음 업데이트에서 일어나므로 그 사이
      속성이 낡아 있고, upgrade 전에는 프로퍼티가 없어 속성만 있다.
    */
    const read = (el: Element, prop: "name" | "heading" | "icon" | "badge"): string => {
      const own = (el as Partial<NsNavGroup>)[prop];
      return own ?? el.getAttribute(prop) ?? "";
    };

    this.#entries = groups.map((group, i) => {
      const name = read(group, "name");
      const heading = read(group, "heading");
      const icon = read(group, "icon");
      const badge = read(group, "badge");

      /*
        name 이 없으면 인덱스를 키로 쓴다. 마크업 순서가 바뀌면 상태가 엉뚱한
        그룹을 가리키게 되므로 키로 쓰기 나쁘지만, 화면이 죽는 것보다 낫다.
      */
      if (name === "" && !this.#warnedNoName) {
        this.#warnedNoName = true;
        console.warn(
          `[ns-sidebar] ns-nav-group 에 name 이 없습니다("${heading}"). DOM 순서를 키로 쓰지만 순서가 바뀌면 선택이 엉뚱한 그룹을 가리킵니다. name 을 주세요.`,
        );
      }

      const key = name === "" ? String(i) : name;

      /*
        키가 겹치면 두 번째 타일이 첫 번째의 아이콘을 가져가고, 키로 타일을 찾는
        키보드 이동도 첫 번째만 찾는다. 고치지는 않고 들리게만 한다.
      */
      if (seen.has(key) && !this.#warnedDupName) {
        this.#warnedDupName = true;
        console.warn(
          `[ns-sidebar] ns-nav-group 의 name 이 겹칩니다("${key}"). 레일 타일과 선택 상태가 첫 번째 그룹만 가리킵니다.`,
        );
      }
      seen.add(key);

      /*
        타일 내용의 폴백 세 단. 슬롯에 배정된 것이 있으면 이것은 보이지 않는다.
        코드 포인트 단위로 자르는 이유는 서로게이트 페어를 반으로 쪼개지 않는
        것이다.
      */
      const fallback =
        icon !== ""
          ? html`<ns-icon name=${icon}></ns-icon>`
          : badge !== ""
            ? badge
            : ([...heading][0] ?? "");

      return { key, heading, fallback, group, icon: icons.get(key) };
    });

    this.requestUpdate();
  }

  #onTile(key: string): void {
    const active = this.#activeEntry;

    if (active?.key === key) {
      // 활성 타일을 다시 누르면 패널을 접는다. VS Code 그대로다.
      this.#requestOpen(!this.open);
      return;
    }

    this.#select(key);
    if (!this.open) this.#requestOpen(true);
  }

  #select(key: string): void {
    this.#selected = true;

    // 제어 중이면 그 값을 바꾸지 않는다. 이벤트는 양쪽 모두 낸다.
    if (!this.#controlledGroup) {
      this.#innerActive = key;
      this.requestUpdate();
    }

    const detail: NsGroupSelectDetail = { name: key };
    this.dispatchEvent(
      new CustomEvent("ns-group-select", { detail, bubbles: true, composed: true }),
    );
  }

  /*
    open 은 아직 제어 전용이다 — 요청만 올리고 스스로 바꾸지 않는다.
    composed 라 ns-header 의 ns-toggle 을 셸에서 듣던 소비자에게 같은 핸들러로
    도착한다. 두 이벤트가 뜻하는 것이 정확히 같으므로 이름을 나누지 않는다.
  */
  #requestOpen(open: boolean): void {
    const detail: NsToggleDetail = { open };
    this.dispatchEvent(new CustomEvent("ns-toggle", { detail, bubbles: true, composed: true }));
  }
}

register("ns-sidebar", NsSidebar);

declare global {
  interface HTMLElementTagNameMap {
    "ns-sidebar": NsSidebar;
  }
}
```

- [ ] **Step 3: `ns-sidebar.styles.ts` 를 전면 교체한다**

```ts
import { css } from "lit";

export const styles = css`
  /*
    overflow-y: auto 가 동작하려면 조상 체인에 실제 높이가 이어져 있어야
    한다. 소비자가 이 엘리먼트에 높이를 주는 레이아웃에 넣어야 한다.

    너비는 **열린 총폭**이다. 레일과 패널의 합이고, 닫히면 레일 폭으로 줄어든다.
    배경·너비는 preflight 가 건드리지 않으므로 :host 에 그대로 둔다 — 소비자가
    ns-sidebar { … } 로 덮을 자리를 남긴다.
  */
  :host {
    display: block;
    box-sizing: border-box;
    height: 100%;
    min-height: 0;
    width: var(--ns-sidebar-width);
    background: var(--ns-color-surface);
    transition: width 200ms var(--ns-transition-ease);
  }

  /*
    접힘 너비 = 레일 폭. 두 속성을 함께 보는 이유는 타이밍이다.

    customElements.define 은 모듈 평가 시점에 실행되므로 hydrateRoot 보다
    먼저다. 그 사이 구간에서는 엘리먼트가 이미 upgrade 돼 tokens.css 의
    :not(:defined) 예약이 떨어져 나갔는데, React 는 아직 open 을 설정하지
    않았다. [open] 만 보면 이 구간이 4rem 으로 그려지고 하이드레이션 직후
    벌어진다.

    data-ns-open 은 서버 마크업부터 DOM 에 있고 React 가 open 을 끌 때 함께
    지우므로 두 속성이 어긋나지 않는다.
  */
  :host(:not([open]):not([data-ns-open])) {
    width: var(--ns-sidebar-width-collapsed);
  }

  /*
    경계선과 스크롤을 호스트가 아니라 shadow 안의 요소가 갖는다.

    호스트는 문서 트리에 있으므로 소비자의 문서 규칙이 :host 를 이긴다.
    특정도가 아니라 캐스케이드 순서로 정해지는 것이라 :host 쪽이 아무리
    구체적이어도 진다. Tailwind preflight 의 "*, ::before, ::after,
    ::backdrop { border: 0 solid }" 가 그 규칙이다.
  */
  .shell {
    box-sizing: border-box;
    display: flex;
    height: 100%;
    border-right: 1px solid var(--ns-color-line);
  }

  /*
    레일은 항상 보이고 줄지 않는다. 폭이 곧 --ns-sidebar-width-collapsed 라
    패널이 사라지면 호스트 너비와 같아진다.

    overflow-x: hidden 이라 타일 포커스 링을 바깥에 그리면 잘린다. 아래
    outline-offset 이 음수인 이유다.
  */
  .rail {
    box-sizing: border-box;
    flex: none;
    width: var(--ns-sidebar-width-collapsed);
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    padding: var(--ns-space-2) 0;
    border-right: 1px solid var(--ns-color-line);
    background: var(--ns-color-surface-sunken);
  }

  /*
    타일은 정사각형이다. 레일 폭이 한 변이고(레일의 패딩은 위아래에만 있다)
    aspect-ratio 가 높이를 따라오게 한다. <button> 의 UA 기본값(배경·테두리·글꼴)을
    되돌린다.
  */
  .tile {
    box-sizing: border-box;
    display: grid;
    place-items: center;
    width: 100%;
    aspect-ratio: 1;
    position: relative;
    border: 0;
    background: none;
    color: var(--ns-color-fg-subtle);
    font-family: inherit;
    font-size: var(--ns-font-size-xs);
    line-height: var(--ns-line-height-xs);
    font-weight: var(--ns-weight-semibold);
    cursor: pointer;
    transition: background-color var(--ns-transition-fast) var(--ns-transition-ease),
      color var(--ns-transition-fast) var(--ns-transition-ease);
  }

  .tile:hover {
    background: var(--ns-color-surface-hover);
    color: var(--ns-color-fg-body);
  }

  .tile.selected {
    background: var(--ns-color-surface-hover);
    color: var(--ns-color-fg);
  }

  /*
    활성 표시는 좌측 바다. VS Code 와 같은 자리다. 의사 요소라 소비자가 넣은
    아이콘 위에 겹치지 않는다.
  */
  .tile.selected::before {
    content: "";
    position: absolute;
    inset-block: 0;
    inset-inline-start: 0;
    width: 2px;
    background: var(--ns-color-accent);
  }

  /*
    controls.css 의 :focus-visible 규칙은 전역이라 shadow 안에 닿지 않는다.
    바깥에 그리면 위 .rail 의 overflow-x: hidden 에 잘린다.
  */
  .tile:focus-visible {
    outline: 2px solid var(--ns-color-accent);
    outline-offset: -2px;
  }

  /*
    아이콘이 들어오면 타일 정사각형보다 커지지 않게 상한만 씌운다. 크기 자체는
    여기서 주지 않는다 — ns-icon 은 자기 shadow 의 :host 에서 --ns-icon-size 로
    크기를 갖는다. ns-nav-item 의 ::slotted([slot="leading"]) 과 같은 자리다.
  */
  .tile-body {
    display: grid;
    place-items: center;
    width: var(--ns-control-height-sm);
    height: var(--ns-control-height-sm);
  }

  /*
    **타일 슬롯에만 건다.** 접두사 없는 ::slotted(*) 는 패널 슬롯에 배정된 그룹까지
    잡아 그 높이를 패널 높이로 묶는다 — 그러면 긴 목록에서 호스트 박스가 잘리고
    패널의 scrollHeight 가 자라지 않아 스크롤이 죽는다.
  */
  slot.tile-slot::slotted(*) {
    max-width: 100%;
    max-height: 100%;
  }

  /*
    패널은 **남는 폭**을 받는다. calc(열린 총폭 - 레일 폭) 으로 계산하지 않는 이유는
    레일과 패널 사이의 1px 경계선이 그 산수에 들어가지 않아 자식이 호스트 content
    box 를 1px 넘기기 때문이다. flex: 1 은 경계선이 몇 개든 남은 폭을 그대로 받는다.

    min-width: 0 이 필요한 이유는 flex 자식의 기본값이 min-width: auto 라서다 —
    내용이 넓으면 패널이 부풀어 레일을 밀어낸다.
  */
  .panel {
    box-sizing: border-box;
    flex: 1;
    min-width: 0;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
  }

  :host(:not([open]):not([data-ns-open])) .panel {
    display: none;
  }
`;
```

- [ ] **Step 4: 신호 둘을 제거한다**

`src/components/nav-group/ns-nav-group.styles.ts` 에서 두 곳을 고친다.

`.heading` 의 첫 선언:

```css
    display: var(--ns-label-display, block);
```
→
```css
    display: block;
```

`.list.collapsed` 규칙을 통째로 아래로 교체한다(위의 긴 주석도 함께 지운다).

```css
  /*
    접힘. 0.4.0 에는 여기 var(--ns-group-list-display, none) 이 있었다 —
    레일에 항목이 납작하게 나오던 시절, 접힌 그룹의 항목에 도달할 경로를
    남기려고 사이드바가 레일에서 접힘을 무시하게 만드는 신호였다. 레일이
    최상위 그룹 타일만 갖는 지금은 그룹에 도달하는 경로가 타일이므로 그
    배선의 전제가 없어졌다. 경위는 docs/gotchas.md 에 있다.
  */
  .list.collapsed {
    display: none;
  }
```

**그룹 간 간격 규칙을 지운다.** `ns-nav-group.styles.ts` 의 이 규칙과 그 위 긴 주석을 통째로 삭제한다.

```css
  :host(:not(:first-child)) [role="group"] {
    padding-top: var(--ns-space-6);
  }
```

패널에는 그룹이 하나만 오므로 이 규칙은 쓸모가 없고, 그대로 두면 해롭다 — `:first-child` 는 호스트가 **부모의 자식들 중** 몇 번째인지를 보고 배정되지 않은 형제도 그 셈에 들어가므로, 두 번째 그룹을 고르면 패널 맨 위에 24px 이 붙고 첫 번째 그룹을 고르면 붙지 않는다. **패널의 위 여백이 마크업 순서에 따라 달라진다.** 중첩 그룹 사이의 간격은 Task 7 이 `.nested` 를 붙여 다시 세운다. 삭제 근거는 `docs/gotchas.md` 가 맡는다(Task 6).

`.heading` 위쪽 주석에서 신호를 설명하는 문단을 아래로 교체한다.

```
    display 자리를 --ns-label-display 신호가 쓰고 있어 여기에 flex 를 얹을 수
    없다. 그래서 안쪽 .row 가 flex 를 진다. 신호가 나르는 값을 flex 로 바꾸는
    길은 막혀 있다 — ns-nav-item 의 .label·.trailing 이 같은 신호를 읽으므로
    셋이 함께 바뀐다.
```
→
```
    안쪽 .row 가 flex 를 진다. 0.4.0 까지는 display 자리를 --ns-label-display
    신호가 쓰고 있어 여기에 flex 를 얹을 수 없었고, 그 신호가 없어진 지금은
    얹을 수 있게 됐다. 그러나 이 구조가 아래 button.heading 의 UA 되돌림과
    얽혀 있어 바꾸는 것이 이 변경의 목표가 아니다.
```

`src/components/nav-item/ns-nav-item.styles.ts` 에서 `.label` 과 `.trailing` 의 `display` 를 각각 `block` 으로 바꾸고, `.label` 위 주석의 신호 문단을 지운다.

```css
    display: var(--ns-label-display, block);
```
→
```css
    display: block;
```

지울 주석 문단(`.label` 위):

```
    --ns-label-display 는 ns-sidebar 가 ::slotted 로 내려주는 패키지
    내부 프로퍼티다. 사이드바 밖에서 단독으로 쓰일 때를 위해 여기만
    폴백을 둔다.
```

`.leading` 위 주석의 첫 줄도 고친다.

```css
  /* 접힌 레일에서 유일하게 남는 자리라 flex 축소를 막는다. */
```
→
```css
  /* 배지든 아이콘이든 이 사각형이 행의 고정 자리라 flex 축소를 막는다. */
```

- [ ] **Step 5: `ns-nav-item.ts` 의 `badge` 주석을 고친다**

레일이 항목을 그리지 않으므로 근거가 낡았다.

```ts
  /**
   * `leading` 슬롯이 비었을 때 대신 보이는 짧은 배지.
   *
   * **접힘·펼침 양쪽에서 보인다.** 접힌 레일에서 유일하게 남는 요소라 거기서
   * 두드러질 뿐이고, 펼친 상태에서도 라벨 왼쪽에 그대로 남는다. 라벨과 같은
   * 글자를 넣으면 "설치 설치" 가 된다.
   */
```
→
```ts
  /**
   * `leading` 슬롯이 비었을 때 대신 보이는 짧은 배지.
   *
   * 라벨 왼쪽에 늘 남는다. 라벨과 같은 글자를 넣으면 "설치 설치" 가 된다.
   *
   * **`ns-nav-group` 의 `badge` 와 다른 것이다.** 그쪽은 레일 타일에만 보이고
   * 이쪽은 행에 늘 보인다. 0.4.0 까지는 접힌 레일에 항목이 납작하게 나와서
   * 이 배지가 거기서 유일하게 남는 요소였고, 레일이 그룹 타일만 갖는 지금은
   * 그 역할이 그룹의 `badge` 로 옮겨갔다.
   */
```

- [ ] **Step 6: `tokens.css` 를 고친다**

`--ns-sidebar-width` 를 언급하는 **다른 주석도 함께 본다.** 그 파일에는 15rem 을 리터럴로 적은 서술이 남아 있다.

Run: `grep -n '15rem\|sidebar-width' src/tokens/tokens.css`

찾은 곳의 숫자와 뜻을 새 값(열린 총폭 19rem = 레일 4 + 패널 15)에 맞춘다.

폭 토큰의 값과 주석.

```css
  --ns-sidebar-width: 15rem;
  --ns-sidebar-width-collapsed: 4rem;
```
→
```css
  /*
    열린 총폭이다. 레일(--ns-sidebar-width-collapsed)과 패널의 합이고, 패널 폭은
    ns-sidebar 의 shadow 에서 이 둘의 차로 파생된다. 사용처가 하나인 파생값이라
    토큰으로 뽑지 않는다.
  */
  --ns-sidebar-width: 19rem;
  /* 닫힌 총폭이자 레일 폭이다. 레일은 패널이 열려도 사라지지 않는다. */
  --ns-sidebar-width-collapsed: 4rem;
```

- [ ] **Step 7: `check-tokens.mjs` 의 `WIRING` 을 비운다**

```js
const WIRING = new Set(["--ns-label-display", "--ns-group-list-display"]);
```
→
```js
const WIRING = new Set([]);
```

그 위 주석 블록도 교체한다.

```js
/*
  tokens.css 에 정의하지 않는 내부 배선. 소비자가 덮는 값이 아니라 신호다.

  **지금 비어 있다.** 0.4.0 에는 둘이 있었다 — ns-sidebar 가 ::slotted 로
  자식에게 레일 상태를 알리던 --ns-label-display 와 --ns-group-list-display 다.
  레일이 최상위 그룹 타일만 갖게 되면서 세우는 쪽이 사라졌고, 세우는 쪽이 없는
  신호는 읽는 쪽이 언제나 폴백을 받으므로 신호가 아니라 상수를 var() 로 감싼
  것이 된다. 경위는 docs/gotchas.md 에 있다.

  **집합을 지우지 않는 이유는 규칙이 살아 있기 때문이다.** 신호 프로퍼티는
  "컴포넌트 스타일에 var() 폴백을 쓰지 않는다" 의 예외이고, 다음에 신호가
  생기면 같은 근거로 이 집합에 들어온다. 지금 그 예외에 해당하는 이름이 하나도
  없다는 것이 사실일 뿐이다.
*/
```

- [ ] **Step 8: 검사를 돌려 실패를 확인한다**

Run: `node scripts/check-tokens.mjs`

**`npm run check` 전체가 아니라 이 스크립트만 직접 돌린다.** 이 시점에는 Step 10 이 아직 안 됐으므로 `check-events.mjs` 가 먼저 실패해 `check-tokens.mjs` 까지 도달하지 않는다 — 다른 이유로 먼저 실패하면 목표한 속성은 검증되지 않은 것이다.

Expected: **실패한다.** `--ns-label-display`·`--ns-group-list-display` 를 `WIRING` 에서 지웠는데 아직 참조가 남아 있는지 확인하는 단계다. 남은 참조가 있으면 아래처럼 나온다.

```
tokens.css 에 없는 토큰 참조:
  src/components/…: --ns-label-display
```

출력이 그 이름을 가리키면 해당 파일의 남은 참조를 Step 4 대로 지운다. 실패가 사라지면 다음 단계로 간다. **다른 이유(타입 오류 등)로 실패했으면 그것은 이 확인이 아니다** — 그 오류를 먼저 고치고 이 단계를 다시 본다.

- [ ] **Step 9: 남은 참조가 없는지 직접 확인한다**

```sh
grep -rn 'ns-label-display\|ns-group-list-display' src/ scripts/
```

Expected: 출력이 없다.

**주석에 남은 것도 지운다.** `check-tokens.mjs` 의 규칙 ①② 는 참조 수집에서 주석을 지우지 않으므로 주석 속 `var(--ns-group-list-display, none)` 도 실패로 잡힌다. Step 4·7 이 지시하는 새 주석 본문에 그 이름이 리터럴로 들어 있으므로 **그 주석에서 이름만 걷어내고 "왜 있었고 왜 없어졌나" 는 남긴다** — 이름이 든 서술은 `docs/gotchas.md` 가 맡는다(Task 6).

`docs/` 와 `index.html` 의 산문은 대상이 아니다. 그쪽은 Task 6 에서 경위로 고친다.

- [ ] **Step 10: `elements.ts` 에 이벤트 둘을 매핑한다**

`NsSidebarBase` 의 `events` 를 교체한다.

```ts
  events: {
    // EventName<> 브랜딩이 없으면 핸들러가 (e: Event) => void 로 타입된다.
    onNsNavigate: "ns-navigate" as EventName<CustomEvent<NsNavigateDetail>>,
    onNsGroupSelect: "ns-group-select" as EventName<CustomEvent<NsGroupSelectDetail>>,
    onNsToggle: "ns-toggle" as EventName<CustomEvent<NsToggleDetail>>,
  },
```

파일 위쪽의 `import type { … } from "../types.js"` 목록에 `NsGroupSelectDetail` 을 더한다. `NsToggleDetail` 은 이미 있다.

- [ ] **Step 11: `Sidebar.tsx` 를 고친다**

```tsx
import type { CSSProperties, ReactNode } from "react";

import { NsSidebarBase } from "../elements.js";
import type { NsNavigateDetail } from "../../types.js";

export type SidebarProps = {
  /** 패널 보임 여부. 소비자가 내려준다 — 컴포넌트가 스스로 바꾸지 않는다. */
  open: boolean;
  /**
   * 패널에 보일 그룹의 `name`. 주면 제어 모드다 — 컴포넌트가 스스로 바꾸지 않는다.
   *
   * 주지 않으면 컴포넌트가 스스로 관리하고, 초기값은 `defaultActiveGroup` 이다.
   */
  activeGroup?: string;
  /** 비제어 초기 그룹. 비우면 첫 번째 그룹이다. */
  defaultActiveGroup?: string;
  /**
   * 레일 타일이 요청하는 다음 그룹.
   *
   * **`open` 을 소비자가 들고 있으므로 `onToggle` 과 짝으로 다뤄야 한다.**
   * 타일 클릭은 그룹을 바꾸면서 패널을 열어 달라고 요청한다.
   */
  onGroupSelect?: (name: string) => void;
  /**
   * 패널의 다음 상태 요청. 레일 타일과 `ns-header` 의 토글이 같은 이름으로 올린다.
   *
   * 빠뜨리면 레일 타일을 눌러도 패널이 열리지 않는다.
   */
  onToggle?: (open: boolean) => void;
  /**
   * 하위 ns-nav-item 의 클릭. composed 라 사이드바에서 한 번만 들으면 된다.
   *
   * **빠뜨리면 그 사이드바의 링크가 전부 죽는다.** ns-nav-item 은 평범한 좌클릭에
   * preventDefault() 를 부르고 이벤트만 올리므로(라우팅은 소비자 몫이라는 설계),
   * 듣는 쪽이 없으면 클릭이 아무 일도 하지 않는다. 선택 프롭이라 타입 검사도 통과하고
   * 콘솔에도 아무것도 남지 않아 화면에서만 드러난다. 수식키·가운데 클릭은 가로채지
   * 않으므로 새 탭 열기만 동작해 "가끔 되는 것처럼" 보인다.
   *
   * 선택으로 두는 이유는 사이드바가 라우팅 없이 쓰이는 경우(정적 예시, 스토리)가
   * 있기 때문이다.
   */
  onNavigate?: (detail: NsNavigateDetail) => void;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/**
 * `open` 을 서버 마크업에도 싣기 위한 shim.
 *
 * `@lit/react` 의 `createComponent` 는 반응형 프로퍼티를 `useLayoutEffect`
 * 안에서 프로퍼티로만 설정한다. 서버 렌더 시점에는 실행되지 않으므로 Next 가
 * 내려주는 HTML 에 `open` 속성이 없고, `tokens.css` 의 정의 전 예약이 접힘으로
 * 그려다가 하이드레이션 직후 벌어진다.
 *
 * 반응형 프로퍼티가 **아닌** 이름은 가로채이지 않고 `React.createElement` 로
 * 흘러가 서버 마크업에 그대로 실린다. `data-ns-open` 이 그 통로다.
 */
export function Sidebar({
  open,
  activeGroup,
  defaultActiveGroup,
  onGroupSelect,
  onToggle,
  onNavigate,
  children,
  className,
  style,
}: SidebarProps) {
  return (
    <NsSidebarBase
      open={open}
      activeGroup={activeGroup}
      defaultActiveGroup={defaultActiveGroup}
      // 하이드레이션 전에는 이것만 보인다. tokens.css 의 :not(:defined) 규칙이 읽는다.
      data-ns-open={open ? "" : undefined}
      className={className}
      style={style}
      // e.detail 을 여기서 실제로 읽는다. elements.ts 의 EventName<> 캐스트가
      // 빠지면 e 가 Event 로 타입돼 이 줄들이 깨진다.
      onNsNavigate={(e) => onNavigate?.(e.detail)}
      onNsGroupSelect={(e) => onGroupSelect?.(e.detail.name)}
      onNsToggle={(e) => onToggle?.(e.detail.open)}
    >
      {children}
    </NsSidebarBase>
  );
}
```

- [ ] **Step 12: `docs/consumer-example.tsx` 에 `ns-group-select` 를 검사시킨다**

`ns-nav-group` 을 쓰는 절을 찾는다.

Run: `grep -n 'NsNavGroup\|Sidebar' docs/consumer-example.tsx`

그 부근에 `NsSidebarBase` 가 아니라 공개 shim 을 쓰는 사용처가 있으면 그 프롭에 핸들러를 더한다. 없으면 파일의 관례(다른 절이 어떻게 쓰였는지)를 따라 절을 하나 만든다. **`e.detail` 을 실제로 읽어야 검사가 성립한다** — 인자 0개짜리 핸들러는 `EventName<>` 캐스트 누락을 감춘다. shim 이 이미 `e.detail.name` 을 읽으므로 그쪽 방어는 갖춰져 있고, 여기서는 shim 의 벗겨진 인자를 쓴다.

```tsx
      <Sidebar
        open={sidebarOpen}
        defaultActiveGroup="admin"
        onToggle={(next) => setSidebarOpen(next)}
        onGroupSelect={(name) => setActiveGroup(name)}
        onNavigate={(detail) => router.push(detail.href)}
      >
        <NsNavGroup name="projects" heading="프로젝트" badge="프">
          <NsNavItem href="/a" label="프로젝트 A" badge="PA" />
        </NsNavGroup>
      </Sidebar>
```

**`name` 은 그 그룹의 `heading` 과 뜻이 맞아야 한다.** 키와 표시가 어긋난 예시는 문서로서 나쁘다.

`setActiveGroup`·`sidebarOpen` 같은 상태는 그 파일의 기존 관례대로 선언한다. **이 파일은 타입 검사만 받는다** — 실행되지 않으므로 값이 무엇이든 타입이 맞으면 된다.

- [ ] **Step 13: 검사를 돌린다**

Run: `npm run check`
Expected: 초록. 이벤트 목록에 `ns-group-select` 가 새로 들어가고, 토큰 줄은 `data-ns-* 훅 1 개 세 곳 일치` 를 유지한다.

- [ ] **Step 14: 검사를 고의로 깨뜨려 본다 — 미등록 방향**

`src/react/elements.ts` 에서 `onNsGroupSelect` 줄을 잠시 지운다.

Run: `node scripts/check-events.mjs`
Expected: 실패. `React 래퍼(src/react/elements.ts)에 등록되지 않은 이벤트: ns-group-select`

줄을 되돌린다.

- [ ] **Step 15: 검사를 고의로 깨뜨려 본다 — 미사용 방향**

`src/components/sidebar/ns-sidebar.ts` 의 `new CustomEvent("ns-group-select", …)` 를 잠시 `new CustomEvent("ns-group-selct", …)` 로 오타 낸다.

Run: `node scripts/check-events.mjs`
Expected: 실패. `React 래퍼(src/react/elements.ts)에 등록되지 않은 이벤트: ns-group-selct`

**두 방향이 함께 나오지 않는다.** 그 스크립트는 `missing` 검사에서 `process.exit(1)` 하므로 `unused` 검사까지 가지 않는다. 오타 하나가 두 방향의 결함(미등록 + 미사용)을 동시에 만들지만 보이는 것은 앞쪽 하나다. 그래도 이 확인의 목적은 달성된다 — 오타가 통과하지 못한다는 것이 확인된다.

`unused` 방향만 따로 보려면 오타 대신 `dispatchEvent` 호출을 **지운다**. 그러면 `missing` 이 비고 `어떤 컴포넌트도 발생시키지 않는 이벤트가 래퍼에 있습니다: ns-group-select` 가 나온다.

둘 다 확인한 뒤 원래대로 되돌린다.

- [ ] **Step 16: 커밋**

```bash
git add src/ scripts/check-tokens.mjs docs/consumer-example.tsx
git commit -m "feat(sidebar): 레일과 패널 두 칼럼으로 재작성하고 그룹 선택을 들인다"
```

---

## Task 3: 레일 키보드

`ns-tabs` 와 같은 자동 활성화 패턴을 레일에 얹는다. 세로 목록이므로 ↑↓ 다.

**Files:**
- Modify: `src/components/sidebar/ns-sidebar.ts`

**Interfaces:**
- Consumes: Task 2 의 `#entries`·`#activeEntry`·`#onTile`·`#select`, 타일 버튼의 `data-name` 표시
- Produces: 없음 (내부 동작)

- [ ] **Step 1: 레일에 `keydown` 을 얹는다**

`render()` 의 `.rail` 여는 태그에 핸들러를 더한다.

```ts
        <div
          class="rail"
          role="tablist"
          aria-orientation="vertical"
          @keydown=${this.#onKeyDown}
        >
```

- [ ] **Step 2: 핸들러를 더한다**

`#onTile` **위에** 넣는다.

```ts
  /** 이벤트가 레일 타일에서 났으면 그 타일의 키, 아니면 null. */
  #keyFrom(target: EventTarget | null): string | null {
    const el = (target as Element | null)?.closest?.(".tile") ?? null;
    // 이 레일의 타일인지 확인한다. shadow 안이라 경계가 있지만 조회 지점을 맞춘다.
    if (el === null || el.getRootNode() !== this.renderRoot) return null;
    return (el as HTMLElement).dataset.name ?? null;
  }

  /*
    자동 활성화 패턴. 화살표를 누르면 포커스와 선택이 함께 움직인다 — 그룹 전환이
    싼 화면이라 이 패턴이 맞다. 목록 끝에서는 반대쪽으로 순환한다.

    **기준점은 키가 발생한 타일이지 선택된 타일이 아니다.** 둘은 제어 모드에서
    갈라진다 — 소비자가 ns-group-select 를 무시하거나 비동기로 미루면 포커스는
    옆 타일로 갔는데 활성은 그대로다. 선택된 타일을 기준으로 세면 다음 화살표가
    같은 곳을 다시 골라 포커스가 한 칸 옆에 영영 갇히고, 그 사이 DOM 포커스는
    tabindex="-1" 인 요소에 앉아 roving tabindex 규약 자체가 깨진다.
    ns-tabs 의 #onKeyDown 과 같은 판단이다.
  */
  #onKeyDown = (e: KeyboardEvent): void => {
    const from = this.#keyFrom(e.target);
    if (from === null) return;

    const entries = this.#entries;
    const index = entries.findIndex((entry) => entry.key === from);
    // 기준점이 없으면 화살표를 삼키지 않는다.
    if (index === -1) return;

    const at = (next: number): void => {
      e.preventDefault();
      const entry = entries[(next + entries.length) % entries.length];
      this.#select(entry.key);
      /*
        제어 모드에서 소비자가 activeGroup 을 바꾸지 않으면 업데이트가 일어나지
        않아 tabindex 가 옮겨가지 않는다. 화살표 이동은 그 자리에서 포커스를
        옮겨야 하므로 직접 부른다 — 비제어에서는 #select 의 requestUpdate 가
        렌더를 예약하지만 포커스는 그것과 무관하다.
      */
      this.renderRoot
        .querySelector<HTMLElement>(`.tile[data-name="${entry.key}"]`)
        ?.focus();
    };

    if (e.key === "ArrowDown") at(index + 1);
    else if (e.key === "ArrowUp") at(index - 1);
    else if (e.key === "Home") at(0);
    else if (e.key === "End") at(entries.length - 1);
  };
```

- [ ] **Step 3: 검사를 돌린다**

Run: `npm run check`
Expected: 초록.

- [ ] **Step 4: 커밋**

```bash
git add src/components/sidebar/ns-sidebar.ts
git commit -m "feat(sidebar): 레일 타일에 방향키 이동을 얹는다"
```

---

## Task 4: `open` 을 제어/비제어 짝으로

레일 타일을 눌렀을 때 소비자 배선 없이 패널이 열리게 한다. `ns-nav-group` 이 0.4.0 에서 만든 짝과 같은 모양이다.

**Files:**
- Modify: `src/components/sidebar/ns-sidebar.ts`
- Modify: `src/components/sidebar/ns-sidebar.styles.ts`
- Modify: `src/tokens/tokens.css`
- Modify: `src/react/tags/Sidebar.tsx`
- Modify: `docs/consumer-example.tsx`

**Interfaces:**
- Consumes: Task 2·3 의 전부
- Produces: `NsSidebar.open?: boolean` (프로퍼티 전용), `NsSidebar.defaultOpen: boolean` (속성 `default-open`), 호스트 속성 `data-ns-open` 을 컴포넌트가 쓴다. shim 프롭 `open?`·`defaultOpen?`.

- [ ] **Step 1: `open` 을 프로퍼티 전용으로 바꾸고 `defaultOpen` 을 더한다**

`ns-sidebar.ts` 의 `open` 선언을 교체한다.

```ts
  /**
   * 제어 모드. `undefined` 면 비제어다.
   *
   * 속성이 아니라 프로퍼티 전용이다. 겸용했다면 `<ns-sidebar open>` 이 boolean
   * 속성으로 읽혀 제어 모드로 들어가고, 그러면 컴포넌트가 스스로 패널을 여닫지
   * 못한다. 순수 HTML 소비자가 쓸 것은 `default-open` 이다.
   *
   * 그 속성이 관찰되지 않으므로 `<ns-sidebar open>` 은 제어 모드로 들어가는
   * 것이 아니라 통째로 무시된다. connectedCallback 이 경고한다.
   */
  @property({ attribute: false }) open?: boolean;

  /**
   * 비제어 초기값. 있으면 패널이 열린 채로 시작한다.
   *
   * 기본이 닫힘이므로 **기본값에서 벗어나는 쪽**이 속성 이름이다. ns-nav-group 이
   * `default-collapsed` 인 것과 반대로 보이지만 규칙은 같다 — 그쪽은 기본이
   * 펼침이었다.
   *
   * 나중에 이 값을 바꾸면 **아직 토글되지 않은 사이드바에만** 반영된다.
   */
  @property({ type: Boolean, attribute: "default-open" }) defaultOpen = false;

  /** 비제어일 때의 진실. */
  #innerOpen = false;

  /** 사용자가 한 번이라도 토글했나. 늦게 도착한 defaultOpen 이 그것을 덮지 않게 막는다. */
  #toggled = false;

  get #controlledOpen(): boolean {
    return this.open !== undefined;
  }

  get #isOpen(): boolean {
    return this.open ?? this.#innerOpen;
  }
```

- [ ] **Step 2: `this.open` 을 읽는 곳을 `this.#isOpen` 으로 바꾼다**

`#tile()` 안:

```ts
    const selected = isActive && this.open;
```
→
```ts
    const selected = isActive && this.#isOpen;
```

`#onTile()` 안 두 곳:

```ts
      this.#requestOpen(!this.open);
      return;
    }

    this.#select(key);
    if (!this.open) this.#requestOpen(true);
```
→
```ts
      this.#requestOpen(!this.#isOpen);
      return;
    }

    this.#select(key);
    if (!this.#isOpen) this.#requestOpen(true);
```

- [ ] **Step 3: `#requestOpen` 이 비제어에서 스스로 바꾸게 한다**

```ts
  /*
    제어 중이면 그 값을 바꾸지 않는다. 이벤트는 양쪽 모두 낸다.

    composed 라 ns-header 의 ns-toggle 을 셸에서 듣던 소비자에게 같은 핸들러로
    도착한다. 두 이벤트가 뜻하는 것이 정확히 같으므로 이름을 나누지 않는다 —
    ns-nav-group 의 접힘이 별도 이름을 가진 것은 그것이 다른 것이었기 때문이다.
  */
  #requestOpen(open: boolean): void {
    this.#toggled = true;

    if (!this.#controlledOpen) {
      this.#innerOpen = open;
      this.requestUpdate();
    }

    const detail: NsToggleDetail = { open };
    this.dispatchEvent(new CustomEvent("ns-toggle", { detail, bubbles: true, composed: true }));
  }
```

- [ ] **Step 4: 씨앗과 경고와 호스트 속성을 더한다**

`willUpdate` 를 교체한다.

```ts
  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has("defaultOpen") && !this.#toggled) {
      this.#innerOpen = this.defaultOpen;
    }
    if (changed.has("defaultActiveGroup") && !this.#selected) {
      this.#innerActive = this.defaultActiveGroup;
    }
  }
```

`connectedCallback` 의 `warnIfTokensMissing();` 다음에 한 줄을 더하고, 파일 위쪽에 import 를 더한다.

```ts
import { warnPropertyOnlyAttributes } from "../../internal/warn-property-only.js";
```

```ts
    warnPropertyOnlyAttributes(this, {
      open: "default-open",
      "active-group": "default-active-group",
    });
```

`updated()` 의 **맨 앞에** 호스트 속성 쓰기를 더한다.

```ts
  protected override updated(): void {
    /*
      호스트에 속성을 쓴다. 불변 규칙("호스트의 속성을 쓰지 않는다")의 좁은
      예외다 — open 이 프로퍼티 전용이 되면서 CSS 가 볼 속성이 없어졌는데, 폭은
      :host 에 있어야 한다(소비자가 ns-sidebar { width: … } 로 덮을 자리를
      남기려면 그렇다).

      규칙이 막으려던 것은 소비자가 쓴 속성을 덮어 문서화된 override 를 조용히
      죽이는 것이고, 이 이름은 소비자가 쓰는 이름이 아니다 — 소비자가 쓰는 것은
      default-open 이다. 덮을 값이 애초에 없으므로 ns-toast 의 position 과 같은
      형태의 예외다.

      새 이름이 아니다. Sidebar.tsx shim 이 SSR 마크업에 이미 렌더하고 tokens.css
      의 upgrade 전 예약이 이미 그것을 본다. 바뀌는 것은 하이드레이션 이후에도
      계속 쓴다는 것뿐이다.
    */
    this.toggleAttribute("data-ns-open", this.#isOpen);

    const active = this.#activeEntry;
    …
```

- [ ] **Step 5: shadow 스타일에서 `[open]` 을 뺀다**

`ns-sidebar.styles.ts` 의 두 규칙에서 `:not([open])` 를 지운다.

```css
  :host(:not([open]):not([data-ns-open])) {
```
→
```css
  :host(:not([data-ns-open])) {
```

```css
  :host(:not([open]):not([data-ns-open])) .panel {
```
→
```css
  :host(:not([data-ns-open])) .panel {
```

첫 규칙 위 주석의 타임라인 문단을 교체한다.

```
    접힘 너비 = 레일 폭. 두 속성을 함께 보는 이유는 타이밍이다.
```
→
```
    접힘 너비 = 레일 폭.

    open 이 프로퍼티 전용이라 호스트에는 그 이름의 속성이 없다. 대신 컴포넌트가
    updated() 에서 data-ns-open 을 쓰고, upgrade 전 구간은 tokens.css 의 예약이
    default-open 과 data-ns-open 을 함께 봐서 덮는다. 세 구간이 이렇게 이어진다 —
    upgrade 전에는 문서 예약이, upgrade 와 hydration 사이에는 shim 이 렌더한
    data-ns-open 이, hydration 이후에는 컴포넌트가 쓰는 data-ns-open 이 폭을 잡는다.
```

- [ ] **Step 6: `tokens.css` 의 예약을 고친다**

```css
ns-sidebar:not(:defined)               { width: var(--ns-sidebar-width-collapsed); }
ns-sidebar:not(:defined)[open],
ns-sidebar:not(:defined)[data-ns-open] { width: var(--ns-sidebar-width); }
```
→
```css
ns-sidebar:not(:defined)                  { width: var(--ns-sidebar-width-collapsed); }
/*
  [open] 이 아니라 [default-open] 이다. 0.5.0 부터 open 은 프로퍼티 전용이고
  순수 HTML 이 쓰는 이름은 default-open 이다. data-ns-open 은 React shim 이
  SSR 마크업에 싣는 통로이고 그 뒤로는 컴포넌트가 쓴다.
*/
ns-sidebar:not(:defined)[default-open],
ns-sidebar:not(:defined)[data-ns-open]    { width: var(--ns-sidebar-width); }
```

- [ ] **Step 7: `Sidebar.tsx` 의 `open` 을 선택으로 바꾸고 `defaultOpen` 을 더한다**

`SidebarProps` 의 `open` 을 교체하고 그 아래에 한 프롭을 더한다.

```tsx
  /**
   * 패널 보임 여부. 주면 제어 모드다 — 컴포넌트가 스스로 바꾸지 않으므로
   * `onToggle` 을 받아 다시 내려줘야 한다.
   *
   * 주지 않으면 컴포넌트가 스스로 여닫고, 초기값은 `defaultOpen` 이다.
   */
  open?: boolean;
  /** 비제어 초기값. */
  defaultOpen?: boolean;
```

함수의 구조 분해와 JSX 를 고친다.

```tsx
export function Sidebar({
  open,
  defaultOpen,
  activeGroup,
  …
```

```tsx
      open={open}
      defaultOpen={defaultOpen}
      // 하이드레이션 전에는 이것만 보인다. tokens.css 의 :not(:defined) 규칙이 읽는다.
      // 제어 모드에서만 렌더한다 — 비제어에서는 엘리먼트가 스스로 쓰므로
      // 여기서 함께 쓰면 두 쪽이 같은 속성을 두고 다툰다.
      data-ns-open={open === true ? "" : undefined}
```

- [ ] **Step 8: `consumer-example.tsx` 에 비제어 사용처를 하나 더한다**

Task 2 에서 만든 제어 사용처는 그대로 두고, 그 아래에 비제어를 하나 더 쓴다. **두 모드가 모두 타입 검사를 받게 하는 것이 목적이다.**

```tsx
      {/* 비제어. open 을 주지 않으면 레일 타일이 스스로 패널을 여닫는다. */}
      <Sidebar defaultOpen defaultActiveGroup="admin" onNavigate={(d) => router.push(d.href)}>
        <NsNavGroup name="admin" heading="관리" badge="관">
          <NsNavItem href="/users" label="사용자" badge="사" />
        </NsNavGroup>
      </Sidebar>
```

- [ ] **Step 9: 검사를 돌린다**

Run: `npm run check`
Expected: 초록. 토큰 줄이 `data-ns-* 훅 1 개 세 곳 일치` 를 유지해야 한다 — `data-ns-open` 이 `Sidebar.tsx`·`tokens.css`·`ns-sidebar.styles.ts` 세 곳에 모두 남아 있어야 한다.

- [ ] **Step 10: 훅 검사를 고의로 깨뜨려 본다**

`src/components/sidebar/ns-sidebar.styles.ts` 의 `data-ns-open` 을 잠시 `data-ns-opne` 로 오타 낸다(두 규칙 중 한 곳만).

Run: `node scripts/check-tokens.mjs`
Expected: 실패. `data-ns-*` 훅이 세 곳에서 일치하지 않는다는 메시지가 나온다. 오타를 되돌린다.

- [ ] **Step 11: 커밋**

```bash
git add src/ docs/consumer-example.tsx
git commit -m "feat(sidebar): open 을 제어·비제어 짝으로 나눠 레일이 스스로 여닫게 한다"
```

---

## Task 5: `index.html` — 문서 셸과 `ns-sidebar` 절

문서 페이지 자체가 이 컴포넌트로 만들어져 있어서 이 태스크가 끝나면 **문서를 열어 보는 것이 곧 회귀 확인**이 된다.

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: Task 1~4 의 전부
- Produces: 없음

- [ ] **Step 1: 문서 셸의 네비게이션을 새 모양으로 바꾼다**

`<ns-sidebar open id="docs-nav">` 로 시작하는 블록(138행 부근)을 찾는다.

Run: `grep -n 'id="docs-nav"' index.html`

`open` 을 `default-open` 으로 바꾸고 그룹마다 `name`·`badge` 를 준다. 기존 항목은 그대로 둔다.

```html
  <ns-sidebar default-open id="docs-nav">
    <ns-nav-group name="start" heading="시작하기" badge="시">
```

다섯 그룹의 `name`·`badge` 는 이렇게 준다.

| heading | name | badge |
|---|---|---|
| 시작하기 | `start` | `시` |
| 기초 | `basics` | `기` |
| 클래스 | `classes` | `클` |
| 컴포넌트 | `components` | `컴` |
| 예시 | `examples` | `예` |

- [ ] **Step 2: 문서 셸 배선을 고친다**

문서 셸은 **제어 모드를 쓴다.** 헤더 토글 버튼이 동작해야 하는데 헤더와 사이드바는 서로 남남이라 이벤트를 받아 내려주는 주체가 스크립트밖에 없다.

그래서 Step 1 에서 준 `default-open` 을 **다시 뺀다.** 반쪽 제어(처음엔 비제어, 첫 토글에 제어로 바뀜)를 만들지 않기 위해 시작부터 프로퍼티로 세운다.

```html
<ns-sidebar id="docs-nav">
```

배선은 3369행 부근에 있다.

Run: `grep -n 'docsHeader.addEventListener' index.html`

지금 이렇다.

```js
  const docsHeader = document.getElementById("docs-header");
  const docsNav = document.getElementById("docs-nav");

  docsHeader.addEventListener("ns-toggle", (e) => {
    docsHeader.sidebarOpen = e.detail.open;
    docsNav.open = e.detail.open;
  });
```

아래로 교체한다.

```js
  const docsHeader = document.getElementById("docs-header");
  const docsNav = document.getElementById("docs-nav");

  /*
    셸은 제어 모드다. 시작부터 프로퍼티로 세워 반쪽 제어를 만들지 않는다 —
    open 을 첫 토글에서만 대입하면 그때까지는 비제어이므로 default-open 이
    진실이고, 그 뒤에는 프로퍼티가 진실이 된다.
  */
  docsNav.open = true;

  /*
    ns-toggle 을 올리는 곳이 둘이다 — 헤더의 토글 버튼과 사이드바의 레일 타일.
    **두 엘리먼트에 각각 붙인다.** 둘의 공통 조상은 body 이고 이벤트가
    composed 라 거기 붙이면 데모 안에서 난 ns-toggle 까지 받는다. 리스너는
    자기가 소유한 엘리먼트에만 붙인다.
  */
  const setShellOpen = (open) => {
    docsHeader.sidebarOpen = open;
    docsNav.open = open;
  };

  docsHeader.addEventListener("ns-toggle", (e) => setShellOpen(e.detail.open));
  docsNav.addEventListener("ns-toggle", (e) => setShellOpen(e.detail.open));
```

**`docsNav` 에 이미 붙어 있는 `ns-navigate` 리스너는 그대로 둔다.**

- [ ] **Step 3: `ns-sidebar` 절을 재작성한다**

Run: `grep -n 'id="ns-sidebar"' index.html`

그 절의 데모와 표를 새 API 로 고친다. 데모의 id 에는 `sidebar-rail-` 접두사를 붙인다.

```html
  <div class="demo" style="height: 22rem">
    <ns-sidebar default-open id="sidebar-rail-demo">
      <ns-icon data-ns-rail="admin" name="menu"></ns-icon>
      <ns-nav-group name="projects" heading="프로젝트" badge="프">
        <ns-nav-item href="/a" label="프로젝트 A" badge="PA" active></ns-nav-item>
        <ns-nav-item href="/b" label="프로젝트 B" badge="PB"></ns-nav-item>
      </ns-nav-group>
      <ns-nav-group name="admin" heading="관리" badge="관">
        <ns-nav-item href="/users" label="사용자" badge="사"></ns-nav-item>
      </ns-nav-group>
    </ns-sidebar>
  </div>
```

프로퍼티 표를 교체한다.

```html
    <tr><td><code>open</code></td><td>—</td><td>boolean</td><td><code>undefined</code></td><td><strong>프로퍼티 전용.</strong> 주면 제어 모드다. HTML 에서는 <code>default-open</code> 을 쓴다</td></tr>
    <tr><td><code>defaultOpen</code></td><td><code>default-open</code></td><td>boolean</td><td><code>false</code></td><td>비제어 초기값. 패널이 열린 채로 시작한다</td></tr>
    <tr><td><code>activeGroup</code></td><td>—</td><td>string</td><td><code>undefined</code></td><td><strong>프로퍼티 전용.</strong> 패널에 보일 그룹의 <code>name</code></td></tr>
    <tr><td><code>defaultActiveGroup</code></td><td><code>default-active-group</code></td><td>string</td><td><code>""</code></td><td>비제어 초기 그룹. 비우면 첫 번째 그룹</td></tr>
```

이벤트 표에 두 줄을 더한다.

```html
    <tr><td><code>ns-group-select</code></td><td><code>{ name }</code></td><td>레일 타일이 요청하는 다음 그룹</td></tr>
    <tr><td><code>ns-toggle</code></td><td><code>{ open }</code></td><td>패널의 다음 상태 요청. <code>ns-header</code> 와 같은 이름이다</td></tr>
```

절의 산문에 다음 넷을 적는다.

1. **레일은 항상 보인다.** 패널이 닫히면 레일 폭(`--ns-sidebar-width-collapsed`)만 남는다. 열린 총폭은 `--ns-sidebar-width` 다.
2. **패널은 선택된 그룹 하나만 보여준다.** 나머지 그룹은 숨는 것이 아니라 렌더되지 않고, 접힘 상태는 그대로 남아 그룹을 오갔다 돌아오면 복원된다.
3. **레일 아이콘은 사이드바의 직계 자식에 `data-ns-rail="<name>"` 로 넣는다.** 그룹 안에 넣으면 슬롯 배정이 자기 shadow root 안에서만 일어나므로 레일에 도달하지 않는다. 아이콘을 그룹 바로 앞에 두면 짝이 국소적으로 읽힌다. 이 이름은 정적 검사가 없으므로 오타가 조용히 폴백 글자로 나타난다.
4. **`slot` 속성은 동작하지 않는다.** 이 컴포넌트는 `slotAssignment: "manual"` 이다.
5. **레일 키보드.** ↑↓ 는 타일 사이를 돌며 **선택을 함께 옮기지만 패널을 열지는 않는다.** 패널이 닫혀 있을 때 화살표를 눌러도 열리지 않고, 그 타일에서 Enter·Space 를 누르면(= 클릭) 열린다. 사용자가 일부러 닫은 패널을 포커스 이동이 강제로 열지 않게 한 것이다. Home·End 는 처음·끝으로 간다.
6. **활성 타일을 다시 누르면 패널이 닫힌다.** VS Code 와 같다. 그래서 패널이 닫혀 있으면 어느 타일도 `aria-selected="true"` 가 아니다 — 선택된 탭이 없는 tablist 는 유효한 상태이고, 열림 여부는 패널의 존재로 드러난다.

- [ ] **Step 4: 포커스 링 숫자를 고친다**

Run: `grep -n '포커스 링 일곱\|포커스 링(액센트 2px)은 자리가 일곱' src/tokens/tokens.css index.html`

찾은 네 곳(`tokens.css` 셋, `index.html` 하나)에서 `일곱` → `여덟` 로 고치고, `tokens.css` 94행 부근의 "바깥에 그리는 넷 / 안에 그리는 …" 갈래 설명에 레일 타일을 **안에 그리는 쪽**으로 더한다. 레일이 `overflow-x: hidden` 이라 `outline-offset` 이 음수다 — `ns-nav-group` 헤딩 버튼과 같은 이유다.

- [ ] **Step 5: `index.html` 구조 검사 넷을 돌린다**

```sh
grep -c '<script>' index.html
grep -n '</script>' index.html | grep -v -E ':\s*</script>\s*$' | grep -v '<script src='
grep -n 'document.addEventListener' index.html
grep -oE '(^|[[:space:]])id="[^"]*"' index.html | sed -E 's/.*id="([^"]*)"/\1/' | sort | uniq -d
```

Expected: 첫 줄은 `1`. 나머지 셋은 출력이 없다.

- [ ] **Step 6: 검사를 돌린다**

Run: `npm run check`
Expected: 초록. `클래스 문서 확인 완료` 줄의 목록이 줄지 않아야 한다 — 새 클래스가 전부 shadow 안이라 그 검사의 대상이 아니다.

- [ ] **Step 7: 커밋**

```bash
git add index.html src/tokens/tokens.css
git commit -m "docs(sidebar): 문서 셸과 ns-sidebar 절을 레일 모델로 고친다"
```

---

## Task 6: 규칙·문서·이주 안내 (Phase 1 마감)

**Files:**
- Modify: `.claude/rules/library-invariants.md`
- Modify: `.claude/rules/verification.md`
- Modify: `docs/gotchas.md`
- Modify: `docs/project-structure.md`
- Modify: `README.md`
- Modify: `docs/pending-human-checks.md`

**Interfaces:**
- Consumes: Task 1~5
- Produces: 없음

- [ ] **Step 1: `library-invariants.md` 의 네 문단을 고친다**

① 호스트 속성 예외. 지금 이렇게 적혀 있다.

```
**호스트에 속성이 찍히는 컴포넌트는 둘이지만 예외는 이 하나다** — `ns-toast` 의 `position` 은 …
```

`ns-sidebar` 의 `data-ns-open` 을 같은 성질의 예외로 더한다. **개수를 세는 문장을 고치고 근거를 붙인다** — 소비자가 마크업에 쓰는 이름이 아니므로 덮을 값이 없다.

② `MutationObserver`. 지금 이렇게 적혀 있다.

```
**`{ childList: true, subtree: true }` 를 쓰고 `attributes` 는 켜지 않는다** — 동기화가 `setAttribute` 를 쓰므로 자기 쓰기에 재발동해 루프가 된다.
```

`attributeFilter` 가 우리가 쓰지 않는 이름들로 좁혀져 있으면 켜도 된다는 것을 더한다. `ns-sidebar` 가 그 경우이고 동기화가 `slot.assign()` 이라 재발동 경로가 없다.

③ `var()` 폴백 예외. 지금 이렇게 적혀 있다.

```
**예외는 신호 프로퍼티다** — `ns-sidebar` 가 `::slotted` 로 자식에게 상태를 알리는 `--ns-label-display` 와 `--ns-group-list-display` 둘. …
```

규칙은 그대로 두고 **지금 그 예외에 해당하는 이름이 하나도 없다**는 것으로 고친다. 출처는 여전히 `scripts/check-tokens.mjs` 의 `WIRING` 집합이다.

④ 컴포넌트 유형. 지금 "컴포넌트 유형이 셋이다" 라고 적혀 있다. 수동 슬롯 배정을 쓰는 컴포넌트가 하나 생겼다는 것을 더한다 — 유형이 늘어난 것은 아니고(여전히 shadow + 렌더), **소비자 자식을 골라 배정한다**는 성질이 새로 생긴 것이다.

`name` 을 키로 쓴다는 것도 이름 절에 더한다.

```
- **`key` 를 속성/프로퍼티 이름으로 쓰지 않는다.** React 가 재조정 키로 소비해 엘리먼트까지 도달하지 않고, shim 으로도 고칠 수 없다 — `title` 은 우리에게 도착한 뒤 이름을 바꿀 수 있었지만 `key` 는 도착하지 않는다. 키는 `name` 이다.
```

- [ ] **Step 2: `verification.md` 의 개수를 고친다**

"이벤트를 가진 아홉 래퍼" 와 "아홉 중 일곱" 문단을 찾는다.

Run: `grep -n '아홉' .claude/rules/verification.md`

`ns-sidebar` 가 이제 `ns-navigate`·`ns-group-select`·`ns-toggle` 셋을 매핑하므로 숫자와 목록을 함께 고친다. **바가 래퍼 단위가 아니라 이벤트 단위**라는 문단이 이미 그 취지를 적고 있으므로, 새 두 이벤트가 어디서 `e.detail` 을 읽히는지 적는다 — `Sidebar.tsx` 가 `e.detail.name` 과 `e.detail.open` 을 읽고, `consumer-example.tsx` 가 shim 의 벗겨진 인자를 쓴다.

개수의 출처는 `src/react/elements.ts` 에서 `events` 가 비어 있지 않은 `createComponent` 호출이다. 세어서 적는다.

Run: `grep -c 'as EventName<' src/react/elements.ts`

- [ ] **Step 3: `gotchas.md` 에 절 넷을 더하거나 고친다**

① **`key` 를 속성 이름으로 쓸 수 없다.** React 가 재조정 키로 소비하는 경로와, `title` 과 달리 shim 으로 고칠 수 없는 이유. 그래서 `ns-nav-group` 의 키가 `name` 이다.

② **수동 슬롯 배정을 고른 이유.** 자동 배정이었다면 선택되지 않은 그룹을 숨기기 위해 소비자 DOM 에 속성을 써야 하고, 그러면 `MutationObserver` 와 이름 충돌 위험이 함께 온다. 대가는 `slot` 속성이 동작하지 않는 것이고, 그래서 아이콘 표시가 `data-ns-rail` 이다. 그 이름은 코드가 짝인 훅이라 `check-tokens.mjs` 의 규칙 ③ 대상이 아니라는 것도 함께 적는다.

③ **레일 아이콘이 사이드바 자식인 이유.** 슬롯 배정은 자기 shadow root 안에서만 일어나므로 그룹 안에 넣은 것은 레일에 도달할 수 없다. 스프라이트 이름 방식이 반쪽인 이유(앱 아이콘이 없고, React 소비자의 아이콘 컴포넌트를 쓸 수 없다). 레일 타일을 그룹이 그리지 못하는 이유(패널 높이와 무관하게 쌓여야 한다).

④ **`--ns-label-display`·`--ns-group-list-display` 의 생몰.** 기존 절 둘을 **삭제하지 않고** 고친다 — 왜 있었고 왜 없어졌는지를 남긴다. 없앤 이유는 레일이 항목을 그리지 않게 되어 세우는 쪽이 사라진 것이고, 세우는 쪽이 없는 신호는 읽는 쪽이 언제나 폴백을 받으므로 신호가 아니라 상수를 `var()` 로 감싼 것이 된다. **같은 판단을 다시 하게 되는 것을 막는 것이 이 문서의 목적이다.**

Run: `grep -n 'ns-group-list-display\|ns-label-display' docs/gotchas.md`

- [ ] **Step 4: `project-structure.md` 를 고친다**

- 태그 표의 `ns-sidebar` 행: "네비게이션 컨테이너. 접으면 좌측에 4rem 레일이 남는다" → 레일 + 패널 두 칼럼, 레일은 항상 보이고 패널은 선택된 그룹 하나.
- 태그 표의 `ns-nav-group` 행: `name`·`badge` 와 중첩(Task 7 이후) 언급. **이 태스크에서는 `name`·`badge` 만 적고 중첩은 Task 8 에서 더한다.**
- "이벤트는 아홉이다" → 열. 목록에 `ns-group-select`(`{ name }`) 를 더한다.
- "남은 일" 의 `ns-header`·`ns-sidebar` 비제어 항목: 사이드바 쪽은 해결됐다. **헤더 토글은 여전히 배선이 필요하다** — 두 엘리먼트가 서로 남남이라는 원래 문제의 절반이 남았다는 것으로 고친다.
- 디렉터리 트리의 `ns-sidebar` 주석에 수동 슬롯 배정을 적는다.

- [ ] **Step 5: `README.md` 에 0.5.0 이주 절을 더한다**

| 지금 | 바뀐 뒤 |
|---|---|
| `<ns-sidebar open>` | `<ns-sidebar default-open>` |
| `<NsSidebar open={x}>` | 그대로 (제어) |
| `<ns-nav-group heading="관리">` | `<ns-nav-group name="admin" heading="관리" badge="관">` |
| 열린 총폭 15rem | 19rem |
| 접힘 = 모든 항목의 배지 목록 | 접힘 = 최상위 그룹 타일 |
| `collapsible` 을 최상위 그룹에 | 하위 그룹에 |

`<ns-sidebar open>` 은 이제 관찰되지 않는 속성이라 **조용히 무시되고 콘솔 경고가 뜬다.** `name` 이 없으면 화면이 죽지 않고 인덱스 키 + 경고로 동작한다.

- [ ] **Step 6: `pending-human-checks.md` 에 항목을 옮긴다**

**이 파일은 자기 형식을 갖고 있다.** 먼저 파일 앞부분의 "이 파일을 다루는 법" 을 읽는다. 세 절이 있고 각각 역할이 다르다.

- `## 범위` — 이번 사이클이 무엇을 바꿨는지 산문으로. **`dist/` 가 바뀌는지 명시한다.** 여기에 레일 재설계 항목을 하나 더한다: 접힘 상태의 화면이 완전히 달라지고 열린 총폭이 15rem → 19rem 이 되며 `ns-sidebar` 의 `open` 이 프로퍼티 전용이 된 것. **`dist/` 가 바뀐다.**
- `## B` — 두 확인 수단 **어느 쪽도** 닿지 않아 소비자 프로젝트가 필요한 것. 기존 번호를 이어서 붙인다.
- `## A` — `index.html` 육안 확인이 볼 목록. 기존 번호를 이어서 붙인다.

**B 를 A 보다 앞에 둔다**(파일이 그 이유를 적고 있다). 항목마다 **무엇을 보나** 와 **무엇이 잘못된 것인가** 를 함께 적는다 — 하나만 있으면 보는 사람이 판정할 수 없다.

A 로 갈 것(이 저장소에서 확인 가능).

- 레일이 패널 열림·닫힘 양쪽에서 같은 자리에 있는지, 폭 전환(200ms)이 레일을 밀지 않는지
- 그룹을 오갔다 돌아왔을 때 하위 그룹의 접힘 상태가 보존되는지
- 활성 타일의 좌측 액센트 바와 배경이 다크·라이트 양쪽에서 읽히는지
- 타일 포커스 링이 4rem 폭에서 잘리지 않는지
- ↑↓·Home·End 로 타일을 오갈 때 패널이 따라 바뀌는지, 탭 순서가 레일 → 패널인지
- `data-ns-rail` 아이콘 · `badge` 폴백 · `heading` 첫 글자 폴백 셋이 같은 크기로 보이는지
- `data-ns-rail` 의 이름을 틀렸을 때 폴백 글자가 보이는지 (정적 검사가 없는 자리)
- **Safari 에서 위 전부.** 수동 슬롯 배정과 `role="tab"` 접근성이 엔진 차이가 나는 자리다

B 로 갈 것(소비자 프로젝트가 있어야 확인된다). **`npm run check` 가 초록인 것은 이 둘에 대해 아무 증거도 아니다.**

- **Next.js SSR 에서 `default-open`·`default-active-group` 이 첫 페인트부터 맞는지.** `willUpdate` 씨앗이 막으려는 것이 정확히 이것이고 `index.html` 은 순수 HTML 이라 이 경로를 재현하지 못한다.
- **React 소비자가 `<UsersIcon data-ns-rail="admin" />` 로 자기 아이콘을 레일에 넣을 수 있는지.** 이 설계가 스프라이트 이름 방식을 버리고 슬롯을 고른 이유가 이것이다.

- [ ] **Step 7: 검사를 돌린다**

Run: `npm run check`
Expected: 초록.

- [ ] **Step 8: 커밋**

```bash
git add .claude/rules/ docs/ README.md
git commit -m "docs(sidebar): 레일 재설계의 규칙·경위·이주를 적는다"
```

---

## Task 7: `ns-nav-group` 중첩

**Files:**
- Modify: `src/components/nav-group/ns-nav-group.ts`
- Modify: `src/components/nav-group/ns-nav-group.styles.ts`

**Interfaces:**
- Consumes: Task 1~6
- Produces: shadow 래퍼의 `nested` 클래스. 소비자 API 는 늘지 않는다 — 넣기만 하면 된다.

- [ ] **Step 1: 중첩 판정을 더한다**

`ns-nav-group.ts` 의 `#toggled` 선언 다음에 필드를 더한다.

```ts
  /**
   * 조상에 다른 `ns-nav-group` 이 있나. 하위 카테고리로 그려질지를 정한다.
   *
   * **CSS 로는 알 수 없다.** shadow 안에서 조상을 보는 수단은 `:host-context()`
   * 하나인데 Chromium 전용이라 금지돼 있고, 부모 그룹의 shadow 에서
   * `::slotted(ns-nav-group)` 으로 자식 호스트에 `padding-left` 를 주는 길은
   * 문서 트리 규칙이 shadow 규칙을 이기므로(외곽 트리 우선) Tailwind preflight
   * 의 `* { padding: 0 }` 이 지운다. `:host` 에 박스를 두지 못하는 것과 같은
   * 함정이다. 그래서 판정은 JS 가 하고 들여쓰기는 자기 shadow 안에서 건다.
   */
  #nested = false;
```

`connectedCallback` 의 마지막에 판정을 더한다.

```ts
    /*
      parentElement 부터 closest 로 올라가므로 소비자가 중간에 <div> 로 감싸도
      잡히고, 바깥 그룹이 아직 upgrade 되지 않았어도 태그 이름만 보므로 잡힌다.
      순수 HTML 파싱 · React 렌더 · createElement 후 append 세 경로가 모두
      덮인다.

      connectedCallback 이 첫 렌더보다 먼저이므로 잘못된 모양이 한 프레임도
      나가지 않는다. 요소를 옮기면 다시 불려 재판정되므로 MutationObserver 가
      필요 없다.
    */
    const nested = this.parentElement?.closest("ns-nav-group") != null;
    if (nested !== this.#nested) {
      this.#nested = nested;
      // 반응형 프로퍼티가 아니므로 갱신을 직접 요청한다.
      this.requestUpdate();
    }
```

- [ ] **Step 2: 래퍼에 클래스를 붙인다**

`render()` 의 여는 태그를 고친다.

```ts
      <div role="group" aria-label=${this.heading}>
```
→
```ts
      <div role="group" aria-label=${this.heading} class=${this.#nested ? "nested" : ""}>
```

- [ ] **Step 3: `.nested` 스타일을 더한다**

`ns-nav-group.styles.ts` 의 `.list.collapsed` 규칙 **다음에** 넣는다.

```css
  /*
    하위 카테고리. 중첩 여부는 JS 가 판정해 이 클래스로 남긴다 — 이유는
    ns-nav-group.ts 의 #nested 주석에 있다.

    240px 패널에서 글자 x 좌표가 이렇게 떨어진다.

      상위 제목 16 · 상위 직속 항목 16 · 하위 제목 28 · 하위 항목 28

    상위 제목의 padding-left(16)가 .list 패딩(8) + 행 패딩(8)과 같아서 상위
    제목과 상위 항목이 정렬되는 것과 같은 산수다. 하위는 들여쓰기 12 + 행
    패딩 8 = 20 이고 .list 패딩 8 을 더해 28 이다.

    **.list 의 대칭 패딩을 하위에서 없애고 왼쪽 들여쓰기만 두는 이유**는 항목의
    오른쪽 끝을 상위 항목과 같은 자리(232px)에 남기기 위해서다. 대칭 패딩을
    유지하면 하위 항목의 hover 배경이 오른쪽에서 8px 짧아져 계단이 생긴다.

    3단 이상을 넣으면 들여쓰기는 계속 누적된다(40 → 52). 제목 자가만 2단과
    같아진다 — 판정이 "조상에 ns-nav-group 이 있나" 라는 참/거짓이기 때문이다.
    패널 폭이 정해져 있어 깊이별로 다르게 만들 실익이 없다.

    특정도: 기본 .heading 은 (0,1,0), 이 규칙은 (0,3,0) 이므로 이긴다.
    button.heading 의 UA 되돌림(0,1,1)은 font-weight·letter-spacing 을 선언하지
    않으므로 다투지 않는다.
  */
  [role="group"].nested > .heading {
    padding-top: var(--ns-space-2);
    padding-left: calc(var(--ns-space-3) + var(--ns-space-2));
    font-weight: var(--ns-weight-medium);
    letter-spacing: normal;
  }

  [role="group"].nested > .list {
    padding: 0 0 0 var(--ns-space-3);
  }

  /*
    하위 그룹 사이의 간격. Task 2 가 최상위용 규칙
    (:host(:not(:first-child)) [role="group"] { padding-top: --ns-space-6 })을
    지웠으므로 이것이 유일한 그룹 간 간격이다 — 그 규칙은 패널에 그룹이 하나만
    오는 지금 :first-child 가 배정되지 않은 형제까지 세어 패널 위 여백을 마크업
    순서에 따라 달라지게 만들었다.

    **여기서는 :first-child 가 옳게 동작한다.** 중첩 그룹은 부모의 light DOM 에서
    실제 형제이고 전부 렌더되므로 셈이 화면과 일치한다.
  */
  :host(:not(:first-child)) [role="group"].nested {
    padding-top: var(--ns-space-2);
  }
```

- [ ] **Step 4: 검사를 돌린다**

Run: `npm run check`
Expected: 초록. `--ns-space-3`·`--ns-space-2`·`--ns-weight-medium` 은 모두 `tokens.css` 에 정의돼 있다.

- [ ] **Step 5: 커밋**

```bash
git add src/components/nav-group/
git commit -m "feat(nav-group): 그룹 안에 그룹을 넣어 하위 카테고리를 만든다"
```

---

## Task 8: 중첩 데모와 문서 (Phase 2 마감)

**Files:**
- Modify: `index.html`
- Modify: `docs/consumer-example.tsx`
- Modify: `docs/gotchas.md`
- Modify: `docs/project-structure.md`
- Modify: `docs/pending-human-checks.md`

**Interfaces:**
- Consumes: Task 7
- Produces: 없음

- [ ] **Step 1: `ns-nav-group` 절에 중첩 데모를 더한다**

Run: `grep -n 'id="ns-nav-group"' index.html`

그 절에 데모를 하나 더한다. id 접두사는 `nav-group-` 이다.

```html
  <div class="demo" style="height: 18rem">
    <ns-sidebar default-open id="nav-group-nested-demo">
      <ns-nav-group name="admin" heading="관리" badge="관">
        <ns-nav-group heading="사용자" collapsible>
          <ns-nav-item href="/users" label="목록" badge="목"></ns-nav-item>
          <ns-nav-item href="/roles" label="권한" badge="권"></ns-nav-item>
        </ns-nav-group>
        <ns-nav-group heading="결제" collapsible default-collapsed>
          <ns-nav-item href="/receipts" label="영수증" badge="영"></ns-nav-item>
        </ns-nav-group>
        <ns-nav-item href="/logs" label="로그" badge="로"></ns-nav-item>
      </ns-nav-group>
    </ns-sidebar>
  </div>
```

산문에 다음 다섯을 적는다.

1. **하위 그룹은 `ns-nav-group` 을 그냥 중첩하면 된다.** 소비자가 더 쓸 속성이 없다 — 그룹이 자기 중첩을 판정한다.
2. **하위 그룹과 직속 항목을 섞어도 된다.** 순서는 마크업 순서다.
3. **2단까지 시각적으로 구분된다.** 3단 이상은 들여쓰기가 누적되지만 제목 자가는 2단과 같다.
4. **`collapsible` 은 하위 그룹에 쓴다.** 최상위 그룹에 쓰면 패널이 통째로 비어 보인다 — 패널에 그룹 하나만 오기 때문이다.
5. **하위 그룹의 `ns-group-toggle`·`ns-navigate` 는 상위 그룹의 핸들러에도 도착한다.** `composed` 라서다. 어느 그룹인지는 `e.target` 이 준다.

기존 `ns-sidebar`·`ns-nav-group` 절의 데모 중 최상위 그룹에 `collapsible` 이 붙은 것이 있으면 하위로 옮긴다.

Run: `grep -n 'collapsible' index.html`

- [ ] **Step 2: `consumer-example.tsx` 에 중첩을 더한다**

Task 2 에서 만든 사용처의 그룹 안에 그룹을 하나 넣는다. **`ns-group-toggle` 을 하위에서도 받아 `e.detail.open` 을 읽는다** — 상위 그룹의 핸들러에 도착하는 경로가 타입으로 성립하는지 확인하는 자리다.

```tsx
        <NsNavGroup
          name="admin"
          heading="관리"
          badge="관"
          onNsGroupToggle={(e) => setAdminOpen(e.detail.open)}
        >
          <NsNavGroup heading="사용자" collapsible>
            <NsNavItem href="/users" label="목록" badge="목" />
          </NsNavGroup>
          <NsNavItem href="/logs" label="로그" badge="로" />
        </NsNavGroup>
```

- [ ] **Step 3: `gotchas.md` 에 절을 더한다**

**CSS 로 중첩 깊이를 볼 수 없다.** `:host-context()` 가 Chromium 전용이라 금지된 것, `::slotted(ns-nav-group)` 으로 자식 호스트에 박스를 주면 문서 트리 규칙이 이겨 Tailwind preflight 가 지우는 것(`:host` 박스 금지와 같은 함정), 그래서 판정이 JS 이고 들여쓰기는 자기 shadow 안이라는 것. `connectedCallback` 이 첫 렌더보다 먼저라 튐이 없고 요소 이동에도 재판정된다는 것.

**최상위 그룹의 `collapsible` 은 무르지 않는다.** 판정 정보로 무시하게 만들 수 있지만 0.4.0 소비자의 동작을 조용히 바꾸는 것이 되고, "소비자가 요청한 것을 라이브러리가 판단해 무르지 않는다" 는 원칙에 걸린다. 문서로 알린다.

- [ ] **Step 4: `project-structure.md` 의 `ns-nav-group` 행을 고친다**

중첩을 적는다 — 그룹 안에 그룹을 넣으면 하위 카테고리가 되고, `name`·`badge` 는 레일용이며, `collapsible` 은 하위에 쓴다.

- [ ] **Step 5: `pending-human-checks.md` 에 항목을 더한다**

- 하위 제목이 상위 제목과 구분되어 읽히는지 (다크·라이트)
- 하위 항목의 hover 배경 오른쪽 끝이 상위 항목과 같은 자리인지
- 하위 그룹 caret 의 회전과 상위 그룹 caret 이 겨루지 않는지
- 3단을 넣었을 때 무너지지 않는지
- 중첩 없는 기존 그룹이 0.4.0 과 픽셀 단위로 같은지
- **Safari 에서 위 전부**

- [ ] **Step 6: `index.html` 구조 검사 넷과 `npm run check`**

```sh
grep -c '<script>' index.html
grep -n '</script>' index.html | grep -v -E ':\s*</script>\s*$' | grep -v '<script src='
grep -n 'document.addEventListener' index.html
grep -oE '(^|[[:space:]])id="[^"]*"' index.html | sed -E 's/.*id="([^"]*)"/\1/' | sort | uniq -d
npm run check
```

Expected: 첫 줄 `1`, 다음 셋 출력 없음, `npm run check` 초록.

- [ ] **Step 7: 커밋**

```bash
git add index.html docs/
git commit -m "docs(nav-group): 하위 카테고리 데모와 경위를 적는다"
```

---

## 마감 — 사람이 볼 것

**구현 서브에이전트는 화면을 볼 수 없다. 하지 않은 확인을 했다고 보고하지 않는다.**

전부 끝나면 `npm run demo` 로 `index.html` 을 열어 사람이 확인한다. 볼 것의 목록은 `docs/pending-human-checks.md` 에 있다. **릴리스는 이 계획의 범위가 아니다** — `.claude/skills/releasing` 이 그 절차를 갖고 있고, 버전 결정(0.5.0)은 사람이 한다.
