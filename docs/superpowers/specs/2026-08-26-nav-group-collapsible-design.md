# ns-nav-group 접힘 설계

`ns-nav-group` 에 접힘을 넣는다. 헤딩 줄이 버튼이 되고, 누르면 그 그룹의 `ns-nav-item` 목록이 숨는다.

**스크롤이 없어서 넣는 것이 아니다.** `ns-sidebar` 의 `<nav>` 는 이미 `height: 100%` + `overflow-y: auto` 라 펼침·레일 양쪽에서 넘치면 스크롤된다(조상이 높이를 확정해 줄 때). 접힘은 그 스크롤을 **덜 하게** 만드는 것이고, 그룹이 예닐곱 개로 늘어난 소비자에서 목록 전체를 훑는 비용을 줄이는 것이 목적이다.

## 1. opt-in 이다

`collapsible` 속성을 쓴 그룹만 접힌다.

```html
<ns-nav-group heading="시작하기"> … </ns-nav-group>              <!-- 지금과 동일 -->
<ns-nav-group heading="관리" collapsible> … </ns-nav-group>       <!-- 헤딩이 버튼 -->
<ns-nav-group heading="관리" collapsible default-collapsed> … </ns-nav-group>
```

**전부 접히게 만들지 않는 이유는 breaking 이기 때문이다.** 소비자가 코드를 한 줄도 바꾸지 않았는데 헤딩에 hover·포커스 링·caret 이 생기고 커서가 pointer 로 바뀐다. 다크모드 때 한 번 겪은 종류의 변경이고, 그때 얻은 결론이 "옵트아웃 수단이 있는 것과 그것이 옵트아웃이라고 적혀 있는 것은 다르다" 였다. 여기서는 애초에 옵트인으로 둔다.

`collapsible` 이 없으면 노드 구조가 지금과 달라지지 않는다 — `<div class="heading">` 그대로다. 유일한 차이는 목록 `<div>` 가 이제 항상 `id="list"` 를 갖는 것인데(`aria-controls` 가 그 id 를 가리켜야 해서), shadow root 안이라 소비자가 관측할 길이 없다. 이것이 회귀 확인의 기준선이다.

## 2. 상태 — 제어/비제어

| 이름 | 형태 | 기본값 | 뜻 |
|---|---|---|---|
| `collapsible` | boolean 속성 | `false` | 접힘 기능 on |
| `open` | **프로퍼티 전용** (`attribute: false`) | `undefined` | 제어 모드 |
| `default-collapsed` | boolean 속성 | `false` | 비제어 초기값 |

`ns-dialog` 와 같은 짝이다. `open` 을 속성과 겸용하면 `<ns-nav-group collapsible open>` 이 boolean 속성으로 읽혀 제어 모드로 들어가고, 그러면 컴포넌트가 스스로 접히지 못한다. `connectedCallback` 에서 `warnPropertyOnlyAttributes(this, { open: "default-collapsed" })` 로 경고한다 — 라이브러리가 그 이름을 호스트에 쓰지 않고 Lit 도 `attribute: false` 를 반영하지 않으므로, `open` 속성이 발견되면 언제나 소비자의 실수다.

### `default-open` 이 아니라 `default-collapsed` 인 이유

**boolean 속성은 없으면 언제나 `false` 다.** Lit 은 속성이 없을 때 컨버터를 부르지 않으므로 필드 초기값이 그대로 남고, 속성이 있으면 `true` 가 된다. 즉 `default-open` 을 두고 기본을 펼침(`true`)으로 잡으면 **소비자가 그 값을 `false` 로 만들 경로가 존재하지 않는다.** 속성을 써도 `true`, 안 써도 `true` 다.

기본은 펼침이어야 한다 — 기존 그룹에 `collapsible` 을 붙였을 때 항목이 사라지면 안 된다. 그래서 극성을 뒤집어 **없을 때가 기본값(펼침)이고 있을 때가 예외(접힘)** 인 이름을 쓴다.

`ns-dialog` 가 `default-open` 인 것과 반대로 보이지만 규칙은 같다. 대화상자는 기본이 닫힘이고 네비게이션 그룹은 기본이 펼침이라, **양쪽 다 "기본값에서 벗어나는 쪽"을 속성 이름으로 삼은 것**이다.

### 씨앗은 `firstUpdated` 가 아니라 `willUpdate` 에서 심는다

`ns-dialog` 는 `firstUpdated()` 에서 `defaultOpen` 을 한 번 읽어 `#innerOpen` 을 씨앗으로 심는다. **그 방식을 그대로 베끼면 React SSR 에서 조용히 깨진다.**

타임라인이 그렇다. `customElements.define` 은 모듈 평가 시점에 실행되므로 `hydrateRoot` 보다 먼저다. 업그레이드된 엘리먼트는 첫 업데이트를 마이크로태스크로 예약하는데, 그 마이크로태스크는 하이드레이션 커밋의 `useLayoutEffect` 보다 **먼저** 흘러간다. `@lit/react` 의 `createComponent` 는 반응형 프로퍼티를 그 `useLayoutEffect` 에서만 설정하므로, `firstUpdated` 가 읽는 `defaultCollapsed` 는 아직 `false` 다. 뒤늦게 `true` 가 들어와도 `firstUpdated` 는 다시 돌지 않는다 → **`default-collapsed` 가 오류도 경고도 없이 무시된다.**

그래서 씨앗을 한 번이 아니라 **아직 토글되지 않은 동안** 심는다.

```ts
#innerCollapsed = false;
#toggled = false;          // 사용자가 한 번이라도 토글했나

override willUpdate(changed: PropertyValues): void {
  if (changed.has("defaultCollapsed") && !this.#toggled) {
    this.#innerCollapsed = this.defaultCollapsed;
  }
}
```

- 순수 HTML: 첫 업데이트에서 속성값이 그대로 반영된다.
- React SSR: 늦게 도착한 값이 다음 업데이트에서 반영된다. `useLayoutEffect` 는 페인트 전이고 Lit 의 갱신도 마이크로태스크라 **화면에 펼쳐진 프레임이 나가지 않는다.**
- `document.createElement` 후 `setAttribute` 하는 경로도 같이 덮인다 — `ns-dialog` 주석이 `connectedCallback` 을 피한 이유가 이것이었다.
- `#toggled` 가 있어서 사용자가 접었다 편 뒤에 소비자가 `default-collapsed` 를 바꿔도 그 조작을 덮지 않는다.

**의미를 문서에 적는다.** `default-collapsed` 를 나중에 바꾸면 **아직 토글되지 않은 그룹에만** 반영된다. `ns-dialog` 의 `defaultOpen` 과 다른 성질이므로 두 곳 다 그렇게 읽히지 않도록 쓴다.

## 3. 이벤트

```ts
export interface NsGroupToggleDetail {
  /** 토글 후의 상태. */
  open: boolean;
}
```

`ns-group-toggle`, `bubbles: true, composed: true`. 제어·비제어 양쪽에서 낸다.

**`ns-toggle` 을 재사용하지 않는다.** `ns-header` 가 그 이름을 `{ open }` 으로 이미 쓰고 있고 둘 다 `composed` 라, 셸 컨테이너에 리스너를 붙인 소비자에게는 헤더 토글과 그룹 토글이 같은 이름으로 도착한다. `e.target` 으로 갈라내게 만드는 것은 이름을 아끼려고 소비자에게 분기를 파는 것이다.

**`detail` 은 필드 하나로 끝낸다.** 어느 그룹인지는 `e.target` 이 준다. `heading` 을 넣고 싶어지지만 그것은 표시용 문자열이라 접힘 상태를 저장할 키로 나쁘고, 필드가 둘이 되는 순간 **필드를 하나 더하는 것이 breaking 이 된다.**

## 4. 레일과의 충돌 — 이 설계의 중심

`ns-sidebar` 가 접히면 4rem 레일이 되고, 그때 `::slotted(ns-nav-group)` 으로 `--ns-label-display: none` 을 내려보내 그룹 헤딩이 사라진다. 헤딩이 곧 토글 버튼이므로, **레일에서 그룹이 접혀 있으면 항목도 없고 버튼도 없어서 그 항목들에 도달할 경로가 사라진다.**

**레일에서는 접힘을 무시하고 항목을 전부 보여준다.** 접힘 상태는 기억되고, 사이드바를 다시 펼치면 접혀 있던 그룹은 접힌 채로 돌아온다.

### 배선

`--ns-label-display` 와 같은 모양의 신호 프로퍼티를 하나 더 둔다.

```css
/* ns-sidebar.styles.ts — 레일 분기 */
:host(:not([open]):not([data-ns-open])) ::slotted(ns-nav-group) {
  --ns-label-display: none;
  --ns-group-list-display: block;
}

/* ns-nav-group.styles.ts */
.list.collapsed { display: var(--ns-group-list-display, none); }
```

**읽는 방향이 반대인 것이 요점이다.** 그룹은 이 값을 세우지 않고 읽기만 한다. 그룹이 `:host` 에 세우고 사이드바가 `::slotted` 로 덮는 구조였다면 둘 다 같은 요소(호스트)를 겨냥하므로 특정도 싸움이 되고, `:host(:not(…))`(0,2,0)이 `::slotted(…)`(0,0,2)를 이겨서 사이드바가 진다. 읽기만 하면 그 싸움 자체가 없다.

세 경우가 모두 맞다.

| 상황 | `--ns-group-list-display` | 접힌 그룹 |
|---|---|---|
| 사이드바 펼침 | 미정의 → 폴백 `none` | 접힌다 |
| 사이드바 레일 | `block` | 항목이 보인다 |
| 사이드바 밖에서 단독 사용 | 미정의 → 폴백 `none` | 접힌다 |

레일 → 펼침 전환에서는 두 번째 규칙이 매칭을 멈춰 값이 다시 미정의가 되고, 접혀 있던 그룹이 접힌 상태로 돌아온다. 상태를 따로 되돌릴 코드가 없다.

**직계 자식 `ns-nav-group` 에만 닿는다.** `::slotted` 는 결합자를 받지 않으므로 라벨 숨김과 정확히 같은 한계이고, 이미 `index.html` 에 그렇게 적혀 있다.

### 호스트 속성을 쓰지 않는다

접힘 상태를 `:host([collapsed])` 로 스타일하지 않는다. 불변 규칙이 금지하는 자리이고, `open` 이 프로퍼티 전용이라 애초에 호스트에 속성이 없다. shadow 안 `.list` 의 클래스로 건다.

### `var()` 폴백 예외를 넓힌다

`var(--ns-group-list-display, none)` 은 "컴포넌트 스타일에 `var()` 폴백을 쓰지 않는다" 에 걸린다. 규칙이 지금 예외로 적은 이름은 `--ns-label-display` 하나다.

**그 이름이 특별해서가 아니라 신호 프로퍼티여서 예외였다.** 색·치수 토큰에서 폴백을 금지하는 이유는 값이 `tokens.css` 한 곳에만 있어야 하기 때문인데, 신호는 `tokens.css` 에 정의되지 않는다 — 사이드바가 세워 주지 않는 상황(단독 사용, 사이드바 펼침)에서 **폴백이 곧 기본 동작**이라 지우면 배선이 끊긴다.

`check-tokens.mjs` 가 이미 그 부류를 `WIRING` 집합으로 따로 다루고 있으므로, 검사는 이름 하나를 그 집합에 더하는 것으로 넓어진다. 새 검사 스크립트를 만들지 않는다.

→ `.claude/rules/library-invariants.md` 의 문구를 "유일한 예외는 `--ns-label-display`" 에서 **신호 프로퍼티** 를 가리키는 문장으로 고친다. 이유는 `docs/gotchas.md` 에 적는다.

## 5. 마크업과 접근성

```html
<div role="group" aria-label="관리">
  <button class="heading" aria-expanded="true" aria-controls="list">
    <span class="row">관리<svg class="caret">…</svg></span>
  </button>
  <div class="list" id="list"><slot></slot></div>
</div>
```

- `collapsible` 이 없으면 `<button>` 자리에 지금의 `<div class="heading">` 이 그대로 온다.
- `.heading` 이 `display: var(--ns-label-display, block)` 를 계속 읽는다. **레일에서 `none` 이 되어 버튼이 탭 순서에서도 사라진다** — 정체를 알 수 없는 caret 버튼이 레일에 남지 않는다.
- `display` 자리를 신호가 쓰고 있어 flex 를 얹을 수 없다. 그래서 안쪽 `<span class="row">` 가 flex 를 진다. **신호가 나르는 값을 `flex` 로 바꾸는 길은 막혀 있다** — `ns-nav-item` 의 `.label`·`.trailing` 이 같은 신호를 읽으므로 셋이 함께 바뀐다.
- shadow 안에서만 쓰는 클래스라 `ns-` 접두사를 붙이지 않는다.
- `<button>` 은 UA 기본값(배경·테두리·글꼴·정렬·너비)을 shadow 에서 되돌린다.
- 포커스 링은 기존 액센트 2px 패턴을 그대로 쓴다.

**`aria-expanded` 는 실제 접힘 상태를 따른다.** 레일에서 항목이 보이는 것은 화면 표현이고, 그때 버튼 자체가 `display: none` 이라 접근성 트리에 없으므로 두 값이 어긋나 보이는 순간이 없다.

## 6. caret

`icons.ts` 에 `chevron-down` 을 더하고 `<ns-icon name="chevron-down">` 을 쓴다. `ns-dialog` 가 `close` 를 쓰는 것과 같은 부수효과 import 다.

접히면 `transform: rotate(-90deg)`, 전환은 `--ns-transition-fast`.

**목록 자체는 애니메이션하지 않는다.** `display` 는 전환되지 않고, `grid-template-rows: 0fr → 1fr` 트릭을 쓰려면 `.list` 를 감싸는 grid 래퍼가 하나 더 생긴다. caret 회전만으로 상태 변화가 읽힌다.

`--ns-icon-size`(1.25rem)는 `--ns-font-size-xs` 헤딩 옆에서 크다. 그 인스턴스에 더 작은 값을 세워 줄인다 — 커스텀 프로퍼티가 상속되므로 그것이 문서화된 경로다.

## 7. 활성 항목은 보지 않는다

접힌 그룹 안에 `active` 인 `ns-nav-item` 이 있어도 **라이브러리는 아무것도 하지 않는다.**

자동으로 펼치면 제어 모드에서 소비자가 준 `open={false}` 를 라이브러리가 덮어쓰게 되고, 이는 "제어 중이면 그 값을 바꾸지 않는다" 위반이다. 자식의 `active` 변화를 보려면 `slotchange` 와 `MutationObserver` 도 함께 들어온다.

소비자는 라우팅을 이미 소유하므로 필요하면 `default-collapsed` 를 경로에서 계산해 넣는다.

## 8. 파급

| 파일 | 할 일 |
|---|---|
| `src/components/nav-group/ns-nav-group.ts` | `collapsible`·`open`·`defaultCollapsed`, 토글, 이벤트, 경고 |
| `src/components/nav-group/ns-nav-group.styles.ts` | 버튼 리셋·caret·`.row`·`.list.collapsed` |
| `src/components/sidebar/ns-sidebar.styles.ts` | 레일 분기에 `--ns-group-list-display: block` |
| `src/components/icon/icons.ts` | `chevron-down` |
| `src/types.ts` | `NsGroupToggleDetail` + `HTMLElementEventMap` |
| `src/react/elements.ts` | `NsNavGroup` 의 `events` 에 `onNsGroupToggle` |
| `docs/consumer-example.tsx` | `e.detail.open` 을 **실제로 읽는** 핸들러 |
| `scripts/check-tokens.mjs` | `WIRING` 에 `--ns-group-list-display` |
| `.claude/rules/library-invariants.md` | `var()` 폴백 예외를 신호 프로퍼티로 |
| `docs/gotchas.md` | `default-collapsed` 극성, 신호를 읽기 전용으로 둔 이유 |
| `docs/project-structure.md` | "이벤트는 여덟이다" → 아홉, 목록에 추가 |
| `index.html` | 데모 절 + 프로퍼티·이벤트 표. id 는 `nav-group-` 접두사 |
| `src/tokens/tokens.css` ×2, `index.html` ×1 | "포커스 링 여섯" → 일곱 |
| `README.md` | 다음 릴리스 변경 행 |
| `docs/pending-human-checks.md` | 육안 확인 항목 |

`docs/consumer-example.tsx` 를 고치는 것이 형식적인 일이 아니다. `events` 값은 라이브러리 안에서는 그냥 문자열이라 `EventName<>` 브랜딩이 빠져도 라이브러리 타입 검사가 통과한다. **인자 0개짜리 핸들러도 그 누락을 감춘다** — `e.detail.open` 을 실제로 읽어야 검사가 성립한다.

`check-controls.mjs` 는 영향이 없다. 새 클래스가 전부 shadow 안이라 문서 트리에 나가지 않는다.

## 9. 검증

`npm run check` 가 잡는 것: 타입, 이벤트 매핑(`ns-group-toggle` 이 래퍼에 등록됐는지), 토큰 참조(`--ns-group-list-display` 가 `WIRING` 에 없으면 실패), 소비자 관점 타입.

**검사를 고쳤으면 일부러 깨뜨려서 실제로 실패하는지 확인한다.** 최소 둘이다.

- `src/react/elements.ts` 에서 `onNsGroupToggle` 매핑을 지우고 `check-events.mjs` 가 실패하는지
- `WIRING` 에서 새 이름을 빼고 `check-tokens.mjs` 가 실패하는지

의도한 이유로 실패했는지까지 본다.

`npm run check` 가 초록인 것으로는 아무 증거도 되지 않는 것들이 있다. 사람 눈이 필요하고 `docs/pending-human-checks.md` 로 간다.

- 레일에서 접힌 그룹의 항목이 실제로 보이는지
- 레일 ↔ 펼침을 오갈 때 접힘 상태가 유지되는지, 그 사이에 항목이 깜빡이지 않는지
- caret 회전과 사이드바 너비 전환(200ms)이 같이 일어날 때 어색하지 않은지
- 헤딩 버튼의 포커스 링이 좁은 폭에서 잘리지 않는지
- `collapsible` 없는 그룹이 이전과 픽셀 단위로 같은지
- 다크모드에서 헤딩 hover 배경이 `ns-nav-item` hover 와 겨루지 않는지

React 소비자 프로젝트가 있어야만 확인되는 것이 하나 있고, 그것이 이 작업에서 가장 중요한 육안 항목이다.

- **Next.js SSR 에서 `default-collapsed` 를 준 그룹이 첫 페인트부터 접혀 있는지.** §2 의 `willUpdate` 씨앗이 막으려는 것이 정확히 이것이다. 여기서 이 저장소의 `npm run check` 가 초록인 것은 아무 증거도 아니다 — `index.html` 은 순수 HTML 이라 이 경로를 재현하지 못한다.

`ns-sidebar` 처럼 `data-ns-*` 를 내보내는 길은 **쓰지 않는다.** 그것이 필요했던 이유는 사이드바 너비가 `tokens.css` 의 업그레이드 전 예약과 shadow `:host` 양쪽에 걸쳐 있어서였다. 그룹의 접힘은 shadow 안 `.list` 하나가 소유하고 업그레이드 전에는 `ns-nav-item` 이 아직 아무것도 그리지 않으므로, 덮어야 할 "업그레이드 전 구간" 자체가 없다.
