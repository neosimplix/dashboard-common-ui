# 사이드바 레일 재설계와 네비게이션 하위 카테고리 설계

두 가지를 함께 넣는다.

1. **하위 카테고리** — `ns-nav-group` 안에 `ns-nav-group` 을 넣어 그룹 아래 한 단계를 더 만든다.
2. **레일 재설계** — 접힌 사이드바가 "모든 항목을 4rem 에 밀어넣은 것" 이 아니라 **최상위 그룹의 타일이 쌓인 항상 보이는 레일**이 된다. 타일을 누르면 패널이 열리고 그 그룹만 보인다. VS Code 의 활동 바 + 사이드 바 모델이다.

**둘을 한 스펙에 두는 이유는 2번이 1번의 일을 줄이기 때문이다.** 레일이 항목을 더 이상 그리지 않으므로 "레일에서는 그룹 접힘을 무시한다" 는 배선(`--ns-group-list-display`)의 존재 이유가 사라지고, 하위 카테고리가 필요로 하던 들여쓰기 신호(`--ns-nav-indent`)도 필요 없어진다. 1번을 먼저 만들면 그 배선을 만들었다가 2번에서 지우게 된다.

**breaking 이다.** 0.5.0 으로 나간다. 이주 목록은 §10 에 있다.

## 1. 무엇이 달라지나

```
지금 (0.4.0)                     바뀐 뒤 (0.5.0)

닫힘 4rem   열림 15rem            닫힘 4rem   열림 19rem
┌────┐      ┌───────────────┐     ┌────┐      ┌────┬───────────────┐
│ 설 │      │ 시작하기      │     │ 시 │      │ 시 │ 관리          │
│ 연 │      │   □ 설치      │     │ 관 │      │ 관 │   사용자    ▾ │
│ 토 │      │   □ 환경별    │     │ 예 │      │ 예 │     □ 목록    │
│ BT │      │ 기초          │     └────┘      │    │     □ 권한    │
│ IN │      │   □ 디자인    │                 │    │   결제      ▾ │
│ …  │      │ …             │      항상       │    │     □ 영수증  │
└────┘      └───────────────┘      보인다     └────┴───────────────┘
 모든 항목이  모든 그룹이           최상위      레일이     선택된 그룹
 배지로 납작   이어서 보인다        그룹 타일   그대로     하나만
```

핵심 변화 셋이다.

- **레일이 항상 보인다.** 패널이 열려도 사라지지 않는다. 열린 총폭은 레일 + 패널이다.
- **레일에는 최상위 그룹만 있다.** 항목도, 하위 카테고리도 레일에 나오지 않는다.
- **패널은 한 번에 한 그룹만 보여준다.** 선택되지 않은 그룹은 렌더되지 않는다.

## 2. 폭 — 토큰을 새로 만들지 않는다

| 토큰 | 지금 | 바뀐 뒤 | 뜻 |
|---|---|---|---|
| `--ns-sidebar-width` | `15rem` | `19rem` | **열린 총폭** (뜻 그대로) |
| `--ns-sidebar-width-collapsed` | `4rem` | `4rem` | **닫힌 총폭 = 레일 폭** (뜻 그대로) |

두 토큰의 **뜻이 바뀌지 않고 값 하나만 바뀐다.** 패널 폭은 토큰도 `calc()` 도 아니고 **남는 폭**이다.

```css
.rail  { flex: none; width: var(--ns-sidebar-width-collapsed); }
.panel { flex: 1; min-width: 0; }
```

`calc(var(--ns-sidebar-width) - var(--ns-sidebar-width-collapsed))` 로 계산하지 않는 이유는 **레일과 패널 사이의 1px 경계선이 그 산수에 들어가지 않기 때문이다.** 두 폭을 더하면 호스트의 content box 를 1px 넘겨 자식이 밖으로 밀린다. `flex: 1` 은 남은 폭을 그대로 받으므로 경계선이 몇 개든 맞는다. `min-width: 0` 은 flex 자식의 기본 `min-width: auto` 를 눌러 내용이 넓을 때 패널이 부풀지 않게 한다.

**레일 폭을 위한 새 토큰(`--ns-sidebar-rail-width`)을 만들지 않는 이유**는 그것이 이미 `--ns-sidebar-width-collapsed` 이기 때문이다. 닫힌 상태의 총폭이 곧 레일 폭이다 — 이름이 표현하는 것이 정확히 같으므로 두 이름을 나란히 두면 어느 것을 덮어야 하는지가 모호해진다. 두 토큰을 덮어쓰던 소비자는 계속 같은 것을 제어한다.

`19rem = 4 + 15` 다. 패널 폭이 지금의 사이드바 폭과 같으므로 **패널 안의 레이아웃은 지금과 같은 산수를 쓴다.** VS Code 는 48px + 300px 이고 우리는 64px + 240px 이다.

## 3. `ns-sidebar` 의 새 구조

```html
<div class="shell">
  <div class="rail" role="tablist" aria-orientation="vertical">
    <button id="tile-admin" role="tab" aria-selected="true" aria-controls="panel" class="tile selected">
      <span class="tile-body"><slot data-name="admin">관</slot></span>
    </button>
    …
  </div>
  <nav class="panel">
    <div id="panel" role="tabpanel" aria-labelledby="tile-admin">
      <slot class="panel-slot"></slot>
    </div>
  </nav>
</div>
```

**`role="tabpanel"` 을 `<nav>` 에 두지 않는다.** `role` 은 요소의 암시적 역할을 덮으므로 `<nav>` 에 얹으면 navigation 랜드마크가 사라진다 — 네비게이션 사이드바에서 그것은 잃어도 되는 것이 아니다. 안쪽 `<div>` 가 tabpanel 을 지고, `aria-labelledby` 로 활성 타일을 가리켜 패널에 이름이 붙는다. 그 이름은 그룹의 `heading` 이다.

### 왜 레일을 사이드바가 렌더하는가

그룹이 자기 레일 타일을 그리게 하는 길은 **막혀 있다.** 레일 타일들은 패널 내용의 높이와 무관하게 한 컨테이너에 세로로 쌓여야 하는데, 그룹의 shadow 안에서 그린 것은 그 그룹 호스트의 자리에 묶여 있다. 두 번째 그룹의 타일이 첫 그룹의 패널 내용 아래로 밀린다. `:host { display: contents }` 로 사이드바의 grid 에 참여시켜도 행이 짝지어져 같은 문제가 남는다. 절대 위치로 띄우면 세로 쌓기를 JS 로 계산해야 한다.

그래서 타일은 사이드바의 shadow 가 그리고, **타일에 들어갈 것은 사이드바가 읽을 수 있는 데이터여야 한다.**

### 아이콘 경로가 둘인 이유

**`icon` — 스프라이트 이름.** `<ns-nav-group icon="users">` 를 주면 사이드바가 타일에 `<ns-icon name="users">` 를 그린다. **스프라이트는 열려 있다** — `registerIcons()` 가 공개 API 이고, `README.md` 가 `name` 을 "내장 셋과 `registerIcons()` 로 등록한 것" 에 쓰라고 안내한다. 그룹의 정의가 마크업 한 자리에 모이므로 이것이 기본 경로다.

**`data-ns-rail` — 슬롯.** `icon` 만으로 부족한 경우가 둘 있다.

- **React 아이콘 컴포넌트.** 소비자가 이미 가진 `<UsersIcon />` 은 등록할 수 없다. `registerIcons` 는 lit `svg` 템플릿을 받으므로 아이콘마다 SVG 를 다시 적어야 한다.
- **`registerIcons` 의 배치 함정.** 부수효과만 있는 모듈은 클라이언트 참조가 만들어지지 않아 Next 브라우저 번들에 들어가지 않는다(`docs/gotchas.md` 의 그 절). 등록이 조용히 실패하면 타일이 폴백 글자로 떨어진다.

**슬롯이 그룹 안이 아니라 사이드바 자식인 이유**는 슬롯 배정이 **자기 shadow root 안에서만** 일어나기 때문이다. `<ns-nav-group>` 안에 넣은 것은 그 그룹의 슬롯에만 배정될 수 있고, 사이드바의 레일 칼럼에 도달할 방법이 없다. 위로 올리는 슬롯 전달은 존재하지 않는다.

SVG 문자열을 프로퍼티로 받는 길은 쓰지 않는다. `unsafeSVG` 가 들어오고, 이 저장소가 명령형 API 셋을 "문자열만 받으므로 HTML 주입 경로가 없다" 로 정당화한 것과 어긋난다. **`registerIcons` 가 이미 그 자리를 정당한 방식으로 채우고 있다.**

### 수동 슬롯 배정

shadow root 를 `slotAssignment: "manual"` 로 만들고 **선택된 그룹 하나만** 패널 슬롯에 배정한다.

```ts
static override shadowRootOptions: ShadowRootInit = {
  ...LitElement.shadowRootOptions,
  slotAssignment: "manual",
};
```

선택되지 않은 그룹은 배정되지 않아 **렌더 자체가 되지 않는다.** `display: none` 으로 숨기는 것과 다르다 — 레이아웃에 없고 접근성 트리에도 없다. 그래서

- **소비자 DOM 에 숨김 표시 속성을 쓸 필요가 없다.** `data-ns-panel-hidden` 같은 것을 쓰고 `::slotted([…])` 로 숨기는 대안은 소비자 DOM 을 관리하게 되고, 그러면 `MutationObserver` 와 이름 충돌 위험이 함께 온다.
- **접힘 상태가 보존된다.** 그룹은 light DOM 에 그대로 있고 upgrade 된 상태이므로 `#innerCollapsed` 를 계속 들고 있다. 그룹을 오갔다 돌아오면 접혀 있던 하위 그룹이 접힌 채로 돌아온다.
- **공백 텍스트 노드가 무해하다.** 자동 배정에서는 사이드바 자식의 공백이 기본 슬롯으로 가서 패널에 들어가는데, 수동 배정에서는 배정하지 않은 것이 렌더되지 않는다.

지원 하한은 Chrome 86 · Safari 16.4 · Firefox 92 다. 이 저장소의 하한은 Chrome 123 · Safari 17.5 · Firefox 121 이므로 여유가 있다. **하한을 정하는 것은 여전히 `light-dark()` 와 `:has()` 다.**

### 대가 — `slot` 속성이 동작하지 않는다

수동 배정을 켜면 `slot` 속성은 브라우저에게 아무 의미가 없다. 배정은 전부 우리가 한다. 그래서 레일 아이콘의 표시에 `slot="rail-admin"` 이 아니라 **`data-ns-rail="admin"`** 을 쓴다.

```html
<ns-sidebar default-open>
  <ns-icon data-ns-rail="admin"><svg>…</svg></ns-icon>
  <ns-nav-group name="admin" heading="관리" badge="관"> … </ns-nav-group>
</ns-sidebar>
```

`slot=` 을 그대로 쓰면 **동작하지 않는 표준 속성**이 되어 더 나쁘다. 소비자가 쓰는 훅에 `data-ns-` 를 붙이는 것은 이미 이 저장소의 규칙이다.

**이 이름에는 정적 검사가 없다.** `check-tokens.mjs` 의 규칙 ③ 은 `data-ns-*` 훅을 세 층(`react/tags/*.tsx` · `tokens.css` · `*.styles.ts`)에서 대조하는데, 그 셋은 **CSS 가 짝인 훅**을 위한 것이다. `data-ns-rail` 은 코드가 질의하는 훅이라 어느 층에도 나타나지 않아 수집되지 않는다 — `data-ns-row-id`·`data-ns-page` 와 같은 부류이고, 그 파일의 한계 목록이 이 경우를 이미 적어 두고 있다. 규칙을 넓히지 않는다. **이름이 어긋나면 조용히 폴백 글자가 보이므로 육안 확인 항목으로 간다.**

아이콘이 그룹과 떨어져 마크업 두 자리에 나뉜다. **아이콘을 그룹 바로 앞에 두도록 문서에 적는다** — 짝이 국소적으로 읽히게 하는 것이 우리가 할 수 있는 최선이다.

### 그룹 목록의 관찰

```ts
this.#observer = new MutationObserver(() => this.#syncGroups());
this.#observer.observe(this, {
  childList: true,
  attributeFilter: ["name", "icon", "badge", "heading", "data-ns-rail"],
});
```

**`attributes` 를 켜지 않는다는 불변 규칙과 어긋나지 않는다.** 그 규칙이 막으려는 것은 "동기화가 `setAttribute` 를 쓰므로 자기 쓰기에 재발동해 루프가 된다" 인데, 여기서 하는 동기화는 `slot.assign()` 이고 **자식의 속성을 쓰지 않는다.** 재발동 경로가 없다. `attributeFilter` 가 관찰 대상을 우리가 쓰지 않는 이름들로 못박아 이 성질을 코드에 남긴다.

`ns-nav-group` 의 `name`·`icon`·`badge`·`heading` 에 `reflect: true` 를 붙인다. `@lit/react` 의 `createComponent` 는 반응형 프로퍼티를 **프로퍼티로** 설정하므로 반영이 없으면 React 소비자가 `heading` 을 바꿔도 속성 변화가 일어나지 않아 관찰자가 보지 못한다. 반영은 소비자가 준 값을 되울리는 것이라 "호스트의 속성을 쓰지 않는다" 가 겨냥하는 덮어쓰기가 아니다 — `ns-nav-item` 의 `active` 가 이미 같은 방식이다.

`slotchange` 로는 부족하다. 수동 배정에서는 자식이 추가·제거돼도 배정이 자동으로 바뀌지 않으므로 `slotchange` 가 발생하지 않는다. 관찰자가 유일한 신호다.

### 레일에 오르는 것은 직계 자식 최상위 그룹뿐

`this.children` 중 `tagName === "NS-NAV-GROUP"` 인 것만 본다. 중첩된 하위 그룹은 그룹의 자식이므로 애초에 보이지 않는다. **`ns-sidebar` 안에 그룹이 아닌 것을 두면 패널에 나오지 않는다** — 배정하지 않기 때문이다. 문서에 적는다.

## 4. 상태

| 이름 | 형태 | 기본값 | 뜻 |
|---|---|---|---|
| `open` | **프로퍼티 전용** (`attribute: false`) | `undefined` | 패널 보임 (제어) |
| `default-open` | boolean 속성 | `false` | 비제어 초기값 |
| `activeGroup` | **프로퍼티 전용** | `undefined` | 패널에 있는 그룹의 `name` (제어) |
| `default-active-group` | 속성 | 첫 그룹 | 비제어 초기값 |

`ns-nav-group` 이 0.4.0 에서 만든 짝과 같은 모양이다. 씨앗도 같은 이유로 같은 자리에 심는다.

```ts
protected override willUpdate(changed: PropertyValues): void {
  if (changed.has("defaultOpen") && !this.#toggled) {
    this.#innerOpen = this.defaultOpen === true;
  }
  if (changed.has("defaultActiveGroup") && !this.#selected) {
    this.#innerActive = typeof this.defaultActiveGroup === "string" ? this.defaultActiveGroup : "";
  }
}
```

**씨앗을 좁히는 것이 형식적인 방어가 아니다.** 반응형 프로퍼티는 필드 기본값을 갖지만 소비자가 `undefined` 를 대입하면 그 기본값이 지워진다. 그리고 그 경로는 흔하다 — shim 의 선택 프롭이 주어지지 않으면 값이 `undefined` 이고, `createComponent` 는 그것을 그대로 대입한다. `<Sidebar onNavigate={…} />` 하나로 충분하다.

좁히지 않으면 이렇게 된다.

- `#innerOpen` 이 `undefined` → `#isOpen` 도 `undefined` → **`toggleAttribute("data-ns-open", undefined)` 는 지우는 것이 아니라 토글이다**(두 번째 인자는 선택적이고, 없거나 `undefined` 면 뒤집는다). 갱신마다 패널이 열리고 닫힌다.
- 같은 렌더에서 `selected = isActive && this.#isOpen` 도 `undefined` 라, 열려 있는 패널의 타일이 `aria-selected="false"` 로 나간다.
- `#innerActive` 가 `undefined` → `#activeEntry` 의 `wanted !== ""` 가 참이 되어 **"활성 그룹 undefined 와 일치하는 그룹이 없다" 는 경고가 근거 없이 뜬다.**

**타입 검사는 이것을 보지 못한다.** 프로퍼티 타입이 `boolean`·`string` 이므로 라이브러리 안에서는 `undefined` 가 들어올 수 없는 것처럼 보이고, shim 의 선택 프롭이 그 약속을 깨는 지점은 `createComponent` 안이다.

`firstUpdated` 가 아니라 `willUpdate` 인 이유는 `ns-nav-group` 과 정확히 같다 — `customElements.define` 이 `hydrateRoot` 보다 먼저 실행되므로 첫 업데이트의 마이크로태스크가 하이드레이션 커밋의 `useLayoutEffect` 보다 먼저 흘러가고, `createComponent` 는 반응형 프로퍼티를 그 `useLayoutEffect` 에서만 설정한다. `firstUpdated` 로 한 번만 읽으면 React 소비자에게 `default-open` 이 조용히 무시된다.

`#toggled`·`#selected` 가드가 있어 사용자가 한 번 조작한 뒤에 늦게 도착한 기본값이 그 조작을 덮지 않는다.

`connectedCallback` 에서 경고한다.

```ts
warnPropertyOnlyAttributes(this, {
  open: "default-open",
  activeGroup: "default-active-group",
});
```

### `default-open` 이 `default-collapsed` 가 아닌 이유

`ns-nav-group` 은 기본이 **펼침**이라 boolean 속성으로 표현할 수 있는 것이 "기본에서 벗어나는 쪽 = 접힘" 이었다. 사이드바는 기본이 **닫힘**이므로 벗어나는 쪽이 열림이고, 그래서 `default-open` 이다. `ns-dialog` 와 같다. **극성을 정하는 규칙은 하나다 — 기본값에서 벗어나는 쪽을 속성 이름으로 삼는다.**

### `activeGroup` 의 폴백은 첫 그룹이다

`default-active-group` 이 없거나 그 이름의 그룹이 없으면 DOM 순서상 첫 그룹을 고른다. 그룹이 하나도 없으면 아무것도 선택하지 않고 패널을 비운다(레일도 빈다).

**제어 모드에서도 첫 그룹으로 폴백하고 경고한다.** `ns-tabs` 가 `active` 와 일치하는 `data-ns-tab` 이 없을 때 하는 것과 같다 — 표시만 폴백하고 소비자 상태를 교정하지 않으며, 경고가 "첫 그룹을 보여주지만 그 타일을 눌러도 `ns-group-select` 가 나가지 않는다" 를 알린다. 폴백을 조용히 두면 고장이 "첫 타일이 선택돼 있는데 그 타일을 눌러도 아무 일도 없다" 로 보이고, 그것은 `ns-tabs` 가 이미 겪은 증상이다. 경고는 인스턴스마다 한 번만 낸다(`#warnedNoMatch`).

### 호스트에 `data-ns-open` 을 쓴다

`open` 이 프로퍼티 전용이 되면 **CSS 가 볼 속성이 없어진다.** 폭은 `:host` 에 있어야 하는데(소비자가 `ns-sidebar { width: … }` 로 덮을 자리를 남기려면 그렇다) `:host([open])` 이 성립하지 않는다.

그래서 사이드바가 `updated()` 에서 호스트에 `data-ns-open` 을 직접 쓴다.

```ts
protected override updated(): void {
  this.toggleAttribute("data-ns-open", this.#isOpen);
}
```

**"호스트의 속성을 쓰지 않는다" 의 예외다.** 그 규칙이 막으려는 것은 소비자가 마크업에 쓴 속성을 덮어 문서화된 override 를 조용히 죽이는 것인데, `data-ns-open` 은 소비자가 쓰는 이름이 아니다 — 소비자가 쓰는 것은 `default-open` 이다. 덮을 값이 애초에 없으므로 `ns-toast` 의 `position` 과 같은 형태의 예외다.

이 이름은 새로 만드는 것이 아니다. `Sidebar.tsx` shim 이 SSR 마크업에 이미 렌더하고 있고 `tokens.css` 의 upgrade 전 예약이 이미 그것을 본다. **바뀌는 것은 그 값을 하이드레이션 이후에도 계속 쓴다는 것뿐이다.**

타임라인이 이렇게 정리된다.

| 구간 | 제어 (`open`) | 비제어 (`default-open`) |
|---|---|---|
| upgrade 전 | `tokens.css` 예약이 shim 의 `data-ns-open` 을 본다 | `tokens.css` 예약이 shim 의 `default-open` 을 본다 |
| upgrade ~ hydration | shim 이 렌더한 `data-ns-open` | **Lit 의 속성 컨버터**가 `default-open` 을 읽어 세운 `data-ns-open` |
| hydration 이후 | 사이드바가 쓰는 `data-ns-open` | 사이드바가 쓰는 `data-ns-open` |

### 비제어 React 경로에는 `default-open` 을 속성으로도 내보낸다

`Sidebar.tsx` 가 `data-ns-open` 을 **제어 모드에서만** 렌더한다면 비제어 React 소비자에게 튐이 그대로 남는다. `defaultOpen` 은 반응형 프로퍼티이므로 `createComponent` 가 가로채 `useLayoutEffect` 에서만 설정하고, 서버 마크업에는 아무 표시도 남지 않는다 — upgrade 시점에 `defaultOpen` 은 아직 `false` 라 4rem 으로 그려지고 하이드레이션 직후 19rem 으로 벌어진다. **이 메커니즘 전체가 막으려던 바로 그 튐이 새 경로에 다시 생긴다.**

그래서 shim 이 `default-open` 을 **하이픈 든 원시 속성으로 함께** 렌더한다.

```tsx
<NsSidebarBase
  open={open}
  defaultOpen={defaultOpen}
  // 하이픈 든 이름은 반응형 프로퍼티가 아니므로 createComponent 가 가로채지 않고
  // 서버 마크업에 그대로 실린다. upgrade 시점에 Lit 의 속성 컨버터가 이것을 읽어
  // defaultOpen 을 세우므로, 하이드레이션을 기다리지 않고 첫 프레임부터 열려 있다.
  default-open={open === true || defaultOpen === true ? "" : undefined}
  data-ns-open={open === true ? "" : undefined}
>
```

**조건이 `open === true || defaultOpen === true` 인 것이 요점이다.** 제어 모드도 이 속성을 필요로 한다.

`data-ns-open` 만으로는 **제어 React 경로의 upgrade~hydration 구간이 비어 있다.** shim 이 SSR 마크업에 `data-ns-open` 을 심어 upgrade 전까지는 19rem 으로 그려지는데, upgrade 직후 엘리먼트의 첫 `updated()` 가 돈다. 그 시점에 `open` 은 아직 `undefined` 이고 `#innerOpen` 은 `false` 이므로 `toggleAttribute` 가 **shim 이 심은 그 속성을 지운다.** 4rem 으로 접혔다가 하이드레이션이 `open` 을 세우면 19rem 으로 200ms 동안 벌어진다 — 비제어에서 막은 것과 같은 튐이 제어 쪽에 남는다.

`default-open` 이 함께 있으면 upgrade 때 Lit 의 컨버터가 `defaultOpen = true` 를 세우고, `#isOpen` 이 `open ?? #innerOpen` 이므로 `open` 이 도착하기 전에도 참이 된다. 첫 `updated()` 가 속성을 유지하고 구간이 메워진다. 소비자가 나중에 `open={false}` 로 바꾸면 `open` 이 이기므로 초기값이 남아 있어도 해가 없다.

**`data-ns-open` 을 비제어에서도 렌더하는 쪽으로 넓히지 않는다.** 그러면 React 가 그 속성의 소유자가 되어 엘리먼트의 `toggleAttribute` 와 같은 속성을 두고 다툰다. `default-open` 은 소비자가 준 초기값일 뿐이고 엘리먼트가 쓰지 않는 이름이므로 그 다툼이 없다 — **쓰는 쪽이 정확히 하나여야 한다는 것이 이 배선의 규칙이다.**

`tokens.css` 의 예약을 함께 고친다. 순수 HTML 소비자는 이제 `default-open` 을 쓰므로 그 이름을 봐야 한다.

```css
ns-sidebar:not(:defined)                      { width: var(--ns-sidebar-width-collapsed); }
ns-sidebar:not(:defined)[default-open],
ns-sidebar:not(:defined)[data-ns-open]        { width: var(--ns-sidebar-width); }
```

`:not(:defined)` 경계를 유지하는 이유는 0.2.0 과 같다 — 상태에 따라 달라지는 예약이 정의 이후까지 계속 걸리면 shadow 의 `:host` 와 다퉈 하이드레이션 튐이 된다.

## 5. 상호작용

| 동작 | 결과 | 올리는 이벤트 |
|---|---|---|
| 비활성 타일 클릭 | 그 그룹 선택 + 패널 열기 | `ns-group-select` + (닫혀 있었으면) `ns-toggle {open:true}` |
| 활성 타일 클릭 (패널 열림) | 패널 닫기 | `ns-toggle {open:false}` |
| 활성 타일 클릭 (패널 닫힘) | 패널 열기 | `ns-toggle {open:true}` |
| `ns-header` 의 토글 | 패널 열고 닫기 (소비자 배선) | `ns-toggle` (헤더가 올린다) |

활성 타일을 다시 눌러 닫는 것은 VS Code 그대로다.

**`ns-toggle` 을 사이드바도 올린다.** `composed: true` 라 셸 컨테이너에 리스너를 붙여 헤더 토글을 받던 소비자에게 같은 핸들러로 도착한다. `ns-header` 와 이름을 공유하는 것이 문제가 되지 않는 이유는 두 이벤트가 뜻하는 것이 정확히 같기 때문이다 — "패널의 다음 상태를 요청한다". `ns-nav-group` 이 `ns-toggle` 을 재사용하지 않은 것과 반대로 보이지만 규칙은 같다: **뜻이 같으면 이름을 나누지 않고, 다르면 나눈다.** 그룹 접힘은 사이드바 패널과 다른 것이었다.

### 새 이벤트

```ts
/**
 * 레일 타일이 요청하는 다음 그룹. `name` 은 ns-nav-group 의 name 속성이다.
 *
 * heading 을 싣지 않는 이유는 그것이 표시용 문자열이라 상태를 저장할 키로 나쁘고,
 * 필드가 둘이 되는 순간 필드를 하나 더하는 것이 breaking 이 되기 때문이다.
 */
export interface NsGroupSelectDetail {
  name: string;
}
```

`ns-group-select`, `bubbles: true, composed: true`. 제어·비제어 양쪽에서 낸다. 필드가 하나이므로 React shim 규칙에 따라 `onGroupSelect(name)` 처럼 벗길 수 있는 모양이지만, `NsSidebar` 는 shim 을 통해 공개되므로 그 결정은 `tags/Sidebar.tsx` 에서 한다(§8).

**이벤트 이름이 아홉에서 열이 된다.** `docs/project-structure.md` 의 "이벤트는 아홉이다" 를 고친다.

**`.claude/rules/verification.md` 의 "아홉 래퍼" 는 다른 것을 센다.** 그 문단이 세는 것은 `events` 가 비어 있지 않은 `createComponent` 호출, 즉 **래퍼 수**이고 그 수는 바뀌지 않는다 — `ns-sidebar` 는 0.4.0 에도 이미 `ns-navigate` 를 매핑하고 있었으므로 새 이벤트가 그 래퍼에 얹히는 것뿐이다. 두 문단이 같은 "아홉" 을 쓰고 있어 헷갈리기 쉬운데, **한쪽은 래퍼를 세고 한쪽은 이름을 센다.**

그래서 `verification.md` 는 숫자를 하나 올리는 것이 아니라 **두 숫자를 함께 적고 각자의 출처를 남기는** 쪽으로 고친다 — 래퍼 수는 `events` 가 비어 있지 않은 `createComponent` 호출, 이벤트 수는 `as EventName<` 의 개수다. 이 작업 자체가 "래퍼는 늘지 않고 이벤트만 늘 수 있다" 는 함정의 실례이므로 그것도 함께 적는다.

## 6. 레일 타일

내용은 **슬롯 폴백 하나**다. 폴백 안에서 세 단계로 떨어진다.

```html
<slot data-name="admin"><ns-icon name="users"></ns-icon></slot>
```

| 우선순위 | 조건 | 타일에 보이는 것 |
|---|---|---|
| 1 | `data-ns-rail="<name>"` 인 사이드바 자식이 있다 | 그 요소 (슬롯 배정) |
| 2 | 그룹에 `icon` 이 있다 | `<ns-icon name="<icon>">` |
| 3 | 그룹에 `badge` 가 있다 | 그 글자 |
| 4 | 아무것도 없다 | `heading` 의 첫 글자 |

**4단이 있는 이유는 이주다.** 0.4.0 소비자는 그룹에 `heading` 만 갖고 있으므로, 아무 것도 더하지 않아도 레일이 빈 타일이 되지 않는다.

**슬롯에 `name` 을 주지 않는다.** 수동 배정에서는 슬롯 이름 매칭이 일어나지 않으므로 `name="rail-admin"` 은 동작하지 않는 장식이 된다. 배정 대상을 찾을 때 쓰는 표시는 `data-name` 이고, 그것은 shadow 안이라 문서 이름공간과 충돌하지 않는다.

"둘 중 하나만 보여야 하는 자리는 슬롯 폴백으로 만든다" 규칙 그대로다 — 프로퍼티 넷으로 소비자가 분기하게 하지 않고 슬롯 하나에 폴백을 쌓는다. **수동 배정이라 `ns-icon` 이 겪은 문제가 없다** — 기본 슬롯에 폴백을 두면 공백 텍스트 노드가 배정받아 폴백을 죽이는데, 여기서는 우리가 배정한 것만 받는다.

`name` 이 없는 그룹은 DOM 순서 인덱스를 키로 쓰고 `connectedCallback` 에서 한 번 경고한다. 인덱스는 마크업 순서가 바뀌면 상태가 엉뚱한 그룹을 가리키게 되므로 **키로 쓰기 나쁘지만 화면이 죽는 것보다 낫다.** 경고 문구가 `name` 을 요구한다.

### 접근성

`role="tablist"` + `aria-orientation="vertical"`, 타일은 `id="tile-<name>"` + `role="tab"` + `aria-selected` + `aria-controls="panel"`, 패널 안쪽 `<div>` 가 `role="tabpanel"` + `aria-labelledby` 로 활성 타일을 가리킨다. roving tabindex 와 ↑↓ 키는 `ns-tabs` 의 구현을 그대로 따른다.

타일에는 `aria-label` 로 `heading` 을 준다. 타일 내용이 아이콘이거나 한 글자라 그것만으로는 읽히지 않는다. 툴팁은 `title` 속성으로 준다 — **`title` 을 프로퍼티 이름으로 쓰지 않는다는 규칙은 우리가 정의하는 API 이름에 대한 것이고, shadow 안 요소에 브라우저 툴팁을 띄우려고 쓰는 것은 그 규칙이 막으려는 것이 아니다.** `ns-nav-item` 이 이미 `<a title=…>` 를 그렇게 쓰고 있다.

`aria-expanded` 를 타일에 붙이지 않는다. 활성 타일이 패널을 닫는 것은 사실이지만, `role="tab"` 에 `aria-expanded` 를 얹으면 탭 패턴을 아는 보조기술에 상충하는 신호를 준다. 대신 **패널이 닫히면 모든 타일의 `aria-selected` 가 `false` 가 된다** — 선택된 탭이 없는 tablist 는 유효한 상태이고, 열림 여부는 패널의 존재로 드러난다.

### 스타일

- 타일: `--ns-sidebar-width-collapsed` 정사각형, `place-items: center`.
- 활성: 배경 `--ns-color-surface-hover`, 좌측 2px `--ns-color-accent` 바.
- hover: 배경 `--ns-color-surface-sunken`.
- 포커스 링: 액센트 2px, `outline-offset: -2px`. **레일이 `overflow-x: hidden` 안이라 바깥에 그리면 잘린다** — `ns-nav-group` 헤딩 버튼과 같은 이유다.
- 레일 배경은 `--ns-color-surface-sunken`, 패널은 `--ns-color-surface`. 둘 사이 `1px solid --ns-color-line`.

**포커스 링 자리가 일곱에서 여덟이 된다.** `tokens.css` 세 곳(59·94·273행 부근)과 `index.html` 한 곳(466행 부근)의 숫자를 함께 고친다. 이 숫자들은 `--ns-color-accent` 가 무엇을 칠하는지 세는 문장에 있다.

박스 프로퍼티는 `:host` 가 아니라 `.shell`·`.rail`·`.panel` 이 갖는다. `check-tokens.mjs` 의 규칙 ④ 가 강제한다. `:host` 에는 `display`·`width`·`background` 만 남는다.

## 7. `ns-nav-group` — 하위 카테고리

### 중첩 감지

```ts
override connectedCallback(): void {
  super.connectedCallback();
  // … 기존 경고 둘
  const nested = this.parentElement?.closest("ns-nav-group") != null;
  if (nested !== this.#nested) {
    this.#nested = nested;
    this.requestUpdate();
  }
}
```

**CSS 로는 알 수 없다.** shadow 안에서 조상을 보는 수단은 `:host-context()` 하나인데 Chromium 전용이라 금지돼 있다. 부모 그룹의 shadow 에서 `::slotted(ns-nav-group)` 으로 자식 호스트에 `padding-left` 를 주는 길도 막혀 있다 — 슬롯 자식 호스트를 겨냥할 때 **문서 트리 규칙이 shadow 트리 규칙을 이기므로**(외곽 트리 우선) Tailwind preflight 의 `* { padding: 0 }` 이 그것을 지운다. `:host` 에 박스를 두지 못하는 것과 정확히 같은 함정이다.

그래서 들여쓰기는 **안쪽 그룹이 자기 shadow 안에서** 걸고, 중첩 여부는 JS 가 판정해 shadow 래퍼의 클래스로 남긴다.

```ts
html`<div role="group" aria-label=${this.heading} class=${this.#nested ? "nested" : ""}>`
```

`connectedCallback` 이 첫 렌더보다 먼저이므로 **잘못된 모양이 한 프레임도 나가지 않는다.** `parentElement` 부터 `closest` 로 올라가므로 소비자가 중간에 `<div>` 로 감싸도 잡히고, 바깥 그룹이 아직 upgrade 되지 않았어도 태그 이름만 보므로 잡힌다. 순수 HTML 파싱 · React 렌더 · `createElement` 후 append 세 경로가 모두 덮이고, 요소를 옮기면 `connectedCallback` 이 다시 불려 재판정되므로 `MutationObserver` 가 필요 없다.

호스트에 속성을 찍지 않는다. `#nested` 는 반응형 프로퍼티가 아니므로 `#innerCollapsed` 와 같이 갱신을 직접 요청한다.

### 스타일

```css
[role="group"].nested > .heading {
  padding-top: var(--ns-space-2);
  padding-left: calc(var(--ns-space-3) + var(--ns-space-2));
  font-weight: var(--ns-weight-medium);
  letter-spacing: normal;
}

[role="group"].nested > .list {
  padding: 0 0 0 var(--ns-space-3);
}

:host(:not(:first-child)) [role="group"].nested {
  padding-top: var(--ns-space-2);
}
```

240px 패널에서 글자 위치가 이렇게 떨어진다.

| | 상위 제목 | 상위 직속 항목 | 하위 제목 | 하위 항목 |
|---|---|---|---|---|
| 글자 x | 16 | 16 | 28 | 28 |

**하위 제목이 자기 항목과 정확히 정렬된다.** 상위 제목의 `padding-left`(16) 가 `.list` 패딩(8) + 행 패딩(8) 과 같아서 상위 제목과 상위 항목이 정렬되는 것과 같은 산수다. 하위는 들여쓰기 12 + 행 패딩 8 = 20 이고 `.list` 패딩 8 을 더해 28 이다.

`.list` 의 **대칭 패딩을 하위에서 없애고 왼쪽 들여쓰기만 두는 이유**는 항목의 오른쪽 끝을 상위 항목과 같은 자리(232px)에 남기기 위해서다. 대칭 패딩을 유지하면 하위 항목의 hover 배경이 오른쪽에서 8px 짧아져 계단이 생긴다.

**3단 이상을 넣으면 들여쓰기는 계속 누적된다**(40 → 52). 제목 자가만 2단과 같아진다 — 감지가 "조상에 `ns-nav-group` 이 있나" 라는 참/거짓이기 때문이다. 조상 개수를 세어 깊이별로 다르게 만들 수도 있지만 패널 폭이 정해져 있어 실익이 없다. **문서에 "2단까지 시각적으로 구분된다" 로 적는다.**

특정도를 확인해 둔다. 기본 `.heading` 은 (0,1,0), 중첩 규칙은 `[role="group"].nested > .heading` 으로 (0,3,0) 이므로 이긴다. 그룹 간 간격은 기본이 `:host(:not(:first-child)) [role="group"]` = (0,3,0), 중첩이 `.nested` 를 더해 (0,4,0) 이므로 이긴다. `button.heading` 의 UA 되돌림 규칙(0,1,1)은 `font-weight`·`letter-spacing` 을 선언하지 않으므로 다투지 않는다.

### 그룹 간 간격 규칙을 최상위에서 걷는다

0.4.0 의 `ns-nav-group` 에는 `:host(:not(:first-child)) [role="group"] { padding-top: var(--ns-space-6) }` 가 있었다. 그룹이 세로로 쌓이던 시절 그것들 사이의 간격이었다.

**패널에는 그룹이 하나만 오므로 이 규칙은 쓸모가 없고, 그대로 두면 해롭다.** `:first-child` 는 호스트가 **부모의 자식들 중** 몇 번째인지를 보고, 배정되지 않은 형제도 그 셈에 들어간다. 그래서 두 번째 그룹을 고르면 패널 맨 위에 24px 이 붙고 첫 번째 그룹을 고르면 붙지 않는다 — **패널의 위 여백이 마크업 순서에 따라 달라진다.**

규칙을 지우고 중첩 그룹 사이의 간격만 `.nested` 를 붙여 남긴다. 사이드바 밖에서 최상위 그룹을 세로로 쌓는 경우는 헤딩 자신의 `padding-top` 이 간격을 준다 — 24px 이 아니라 16px 이 되지만, 이 규칙이 0.2.0 에 도입될 때의 목적(호스트 마진이 preflight 에 지워지는 것을 shadow 안 padding 으로 되살리기)은 그 자리에서 이미 달성돼 있다.

### 접힘의 상호작용

- **상위가 접히면 하위도 함께 사라진다.** 상위 `.list.collapsed` 가 `display: none` 이므로 코드가 따로 없다.
- **하위 접힘 상태는 상위와 무관하다.** 각자 자기 `#innerCollapsed` 를 갖는다.
- `aria-controls="list"` 의 id 는 shadow root 마다 별개라 중첩해도 충돌하지 않는다.
- 중첩 `role="group"` + `aria-label` 은 유효한 ARIA 다.
- 하위 그룹의 `ns-group-toggle`·`ns-navigate` 는 `composed` 라 **상위 그룹의 `onNsGroupToggle`·`onNsNavigate` 에도 도착한다.** `e.target` 으로 갈라내는 기존 규약 그대로다. 문서에 적는다.
- `collapsible` 은 하위에서도 옵트인이다. 붙이지 않으면 제목만 있는 라벨이다.

### 최상위 그룹의 `heading` 이 패널 제목이 된다

패널에 그룹 하나만 오므로 그 그룹의 헤딩이 자연히 패널 제목의 자리에 온다. **사이드바가 제목을 따로 그리지 않는다** — 그리면 그룹에게 자기 헤딩을 숨기라고 알려야 하고, 그것이 또 하나의 컴포넌트 간 신호가 된다.

**최상위 그룹에 `collapsible` 을 쓰면 패널이 비어 보인다.** 특수 처리하지 않는다 — 감지 정보(`#nested` 의 반대)로 무시하게 만들 수는 있지만, 0.4.0 소비자의 동작을 조용히 바꾸는 것이 되고 "제어 중이면 그 값을 바꾸지 않는다" 와 같은 종류의 원칙(소비자가 요청한 것을 라이브러리가 판단해 무르지 않는다)에 걸린다. **문서에 "`collapsible` 은 하위 그룹에 쓴다" 로 적고, `index.html` 데모의 `collapsible` 을 하위로 옮긴다.**

### 새 프로퍼티

| 이름 | 속성 | 뜻 |
|---|---|---|
| `name` | `name` (reflect) | 레일 키. `activeGroup` 이 이 값을 가리킨다 |
| `icon` | `icon` (reflect) | 레일 타일에 그릴 `ns-icon` 이름. 스프라이트는 `registerIcons()` 로 열려 있다 |
| `badge` | `badge` (reflect) | 레일 타일의 텍스트 폴백 |

**`key` 를 쓸 수 없다.** React 가 `key` 를 재조정 키로 소비해 엘리먼트까지 전달하지 않고, **shim 으로도 고칠 수 없다** — `title` 은 우리에게 도착한 뒤 이름을 바꿀 수 있었지만 `key` 는 도착하지 않는다. `name` 은 전역 속성이 아니고 `HTMLElement.name` 도 없으므로 안전하다. 이 함정을 `docs/gotchas.md` 에 적는다.

`heading` 에도 `reflect: true` 를 더한다(§3 의 관찰 때문에). 네 이름 모두 반영한다.

## 8. React

- `elements.ts` 의 `NsSidebarBase` 에 `onNsGroupSelect` 를 더한다.
- `tags/Sidebar.tsx` 가 새 프롭 이름을 맞춘다. `open`(제어) · `defaultOpen`(비제어) · `activeGroup` · `defaultActiveGroup`.
- `data-ns-open` 은 **`open` 이 주어졌을 때만** 렌더한다. 비제어에서는 엘리먼트가 스스로 쓰므로 shim 이 관여하지 않는다.
- `ns-group-select` 의 `detail` 은 필드가 하나이므로 shim 이 벗겨 `onGroupSelect(name: string)` 로 준다. `Dialog.tsx` 의 `onClose(reason)` 과 같은 규칙이다.
- `Sidebar.tsx` 가 `e.detail.name` 을 **실제로 읽는다.** 인자 0개 핸들러는 `EventName<>` 캐스트 누락을 감춘다.

`NsNavGroup` 은 shim 없이 그대로 공개한다. `name`·`badge` 어느 것도 React 나 HTML 전역 속성과 충돌하지 않는다.

## 9. 사라지는 것

`--ns-group-list-display` 를 제거한다. 레일이 항목을 그리지 않으므로 "레일에서는 그룹 접힘을 무시해 항목에 도달할 경로를 남긴다" 는 배선의 전제 자체가 없어졌다 — 레일에는 그룹 타일만 있고, 그룹에 도달하는 경로는 타일이다.

- `ns-nav-group.styles.ts` 의 `.list.collapsed { display: var(--ns-group-list-display, none) }` → `display: none`
- `ns-sidebar.styles.ts` 의 레일 분기 삭제 (레일이 이제 별개 렌더다)
- `check-tokens.mjs` 의 `WIRING` 에서 이름 제거
- `docs/gotchas.md` 의 해당 절을 **삭제하지 않고** "왜 있었고 왜 없어졌나" 로 고친다. 같은 판단을 다시 하게 되는 것을 막는 것이 그 문서의 목적이다.

`--ns-label-display` **도 함께 죽는다.** 이 값을 세우는 곳은 `ns-sidebar` 의 `::slotted(ns-nav-group)` 둘뿐이고, 레일이 항목을 그리지 않게 되면 라벨을 숨겨야 하는 상황 자체가 없어진다. 세우는 쪽이 사라지면 읽는 쪽은 언제나 폴백(`block`)을 받으므로 **신호가 아니라 상수를 var() 로 감싼 것**이 된다.

- `ns-nav-group.styles.ts` 의 `.heading`, `ns-nav-item.styles.ts` 의 `.label`·`.trailing` → `display: block`
- `ns-sidebar.styles.ts` 의 `::slotted(ns-nav-group)` 규칙 둘 삭제
- `check-tokens.mjs` 의 `WIRING` 이 **빈 집합**이 된다

빈 집합이 되어도 검사는 동작한다(멤버십만 본다). **규칙은 지운다는 뜻이 아니다** — "신호 프로퍼티는 `var()` 폴백 금지의 예외다" 는 그대로 두고, 지금 그 예외에 해당하는 이름이 없다는 것만 적는다. 다음에 신호가 생기면 같은 근거로 `WIRING` 에 들어간다.

`ns-nav-group` 의 `.row` 는 그대로 둔다. `.heading` 의 `display` 자리가 비어 flex 를 직접 얹을 수 있게 되지만, 그것은 이 작업이 필요로 하는 변경이 아니고 헤딩 버튼의 UA 되돌림 규칙과 얽혀 있다.

## 10. 이주 (0.5.0)

| 지금 | 바뀐 뒤 |
|---|---|
| `<ns-sidebar open>` | `<ns-sidebar default-open>` |
| `<NsSidebar open={x}>` | 그대로 (제어) |
| `<ns-nav-group heading="관리">` | `<ns-nav-group name="admin" heading="관리" icon="users">` (또는 `badge="관"`) |
| 열린 총폭 15rem | 19rem |
| 접힘 = 모든 항목의 배지 목록 | 접힘 = 최상위 그룹 타일 |
| `collapsible` 을 최상위에 | 하위 그룹에 |

`<ns-sidebar open>` 은 이제 관찰되지 않는 속성이므로 **조용히 무시되고 콘솔 경고가 뜬다.** `warnPropertyOnlyAttributes` 가 그것을 잡는다 — 라이브러리가 그 이름을 호스트에 쓰지 않고 Lit 도 `attribute: false` 를 반영하지 않으므로, `open` 속성이 발견되면 언제나 소비자의 실수다.

`name` 이 없으면 화면이 죽지 않고 인덱스 키 + 경고로 동작한다. **`README.md` 에 이주 절을 둔다.**

## 11. 파급

| 파일 | 할 일 |
|---|---|
| `src/components/sidebar/ns-sidebar.ts` | 재작성. 수동 슬롯·레일 렌더·관찰자·선택 상태·비제어 `open`·키보드 |
| `src/components/sidebar/ns-sidebar.styles.ts` | 재작성. `.shell`·`.rail`·`.tile`·`.panel` |
| `src/components/nav-group/ns-nav-group.ts` | `name`·`icon`·`badge`·`heading` reflect, `#nested` 감지, 래퍼 클래스 |
| `src/components/nav-group/ns-nav-group.styles.ts` | `.nested` 규칙 셋, 신호 둘 제거 |
| `src/components/nav-item/ns-nav-item.styles.ts` | `--ns-label-display` 제거, "접힌 레일에서 유일하게 남는 자리" 주석 갱신 |
| `src/components/nav-item/ns-nav-item.ts` | `badge` 의 doc 주석에서 레일 근거 갱신 |
| `src/tokens/tokens.css` | `--ns-sidebar-width` 19rem, `:not(:defined)` 예약, 포커스 링 숫자 ×3 |
| `src/types.ts` | `NsGroupSelectDetail` + `HTMLElementEventMap` |
| `src/react/elements.ts` | `NsSidebarBase` 의 `onNsGroupSelect` |
| `src/react/tags/Sidebar.tsx` | 새 프롭 이름, `detail.name` 읽기, `data-ns-open` 조건부 |
| `scripts/check-tokens.mjs` | `WIRING` 을 빈 집합으로 (신호 둘 제거), 주석 갱신 |
| `.claude/rules/library-invariants.md` | 호스트 속성 예외, `attributeFilter` 로 좁힌 관찰자, 신호 목록, 수동 슬롯 |
| `.claude/rules/verification.md` | "아홉 래퍼" 문단에 래퍼 수와 이벤트 수를 각자의 출처와 함께 (래퍼 수는 안 바뀐다) |
| `docs/gotchas.md` | `key` 함정, 수동 슬롯, 레일 재설계 근거, `--ns-group-list-display` 의 생몰 |
| `docs/project-structure.md` | 이벤트 열, `ns-sidebar`·`ns-nav-group` 설명, "남은 일" 에서 비제어 항목 제거 |
| `docs/consumer-example.tsx` | `ns-group-select` 의 `detail.name` 을 실제로 읽는 핸들러 |
| `index.html` | `ns-sidebar` 절 재작성, 문서 셸 네비게이션을 새 모양으로, 프로퍼티·이벤트 표, 포커스 링 숫자 |
| `README.md` | 0.5.0 이주 절 |
| `docs/pending-human-checks.md` | 육안 항목 |

`check-controls.mjs` 는 영향이 없다. 새 클래스가 전부 shadow 안이라 문서 트리에 나가지 않는다.

## 12. 검증

`npm run check` 가 잡는 것: 라이브러리 타입, 소비자 관점 타입, `ns-group-select` 의 래퍼 매핑, `data-ns-open` 훅의 세 곳 일치(계속 세 층에 있어야 한다), 토큰 참조, `:host` 박스 없음.

**검사를 고쳤으면 일부러 깨뜨려서 실제로 실패하는지 확인한다. 셋이다.**

- `elements.ts` 에서 `onNsGroupSelect` 를 지우고 `check-events.mjs` 가 실패하는지 (미등록 방향)
- `elements.ts` 에 `onNsGroupSelect` 를 남긴 채 컴포넌트의 `dispatchEvent` 를 지우고 `check-events.mjs` 가 실패하는지 (미사용 방향)
- `--ns-label-display` 를 `WIRING` 에서 지운 뒤 CSS 참조를 하나 남겨 `check-tokens.mjs` 가 실패하는지 — 그 뒤 참조와 `WIRING` 항목을 **둘 다** 지운 것이 최종 상태다

**의도한 이유로 실패했는지까지 본다.**

`index.html` 을 고친 뒤의 구조 검사 넷(`<script>` 하나, 닫는 태그, `document.addEventListener` 없음, id 중복 없음)을 함께 돌린다. 새 절의 id 에는 `sidebar-rail-` 접두사를 붙인다.

### 사람 눈이 필요한 것

`docs/pending-human-checks.md` 로 간다. **`npm run check` 가 초록인 것은 이것들에 대해 아무 증거도 아니다.**

- 레일이 패널 열림·닫힘 양쪽에서 같은 자리에 있는지, 폭 전환(200ms)이 레일을 밀지 않는지
- 그룹을 오갔다 돌아왔을 때 하위 그룹의 접힘 상태가 보존되는지
- 활성 타일의 좌측 액센트 바와 배경이 다크·라이트 양쪽에서 읽히는지
- 타일 포커스 링이 4rem 폭에서 잘리지 않는지
- ↑↓ 로 타일을 오갈 때 패널이 따라 바뀌는지, 탭 순서가 레일 → 패널인지
- `data-ns-rail` 아이콘과 `badge` 폴백과 `heading` 첫 글자 폴백 셋이 같은 크기로 보이는지
- 하위 제목이 상위 제목과 구분되어 읽히는지 (다크·라이트)
- 3단을 넣었을 때 무너지지 않는지
- **Safari 에서 위 전부** — 한 엔진만 본 확인은 증거가 아니다. 수동 슬롯 배정과 `role="tab"` 접근성이 특히 엔진 차이가 나는 자리다.

소비자 프로젝트가 있어야만 확인되는 것 둘이다. 이 작업에서 가장 중요한 육안 항목이다.

- **Next.js SSR 에서 `default-open`·`default-active-group` 이 첫 페인트부터 맞는지.** §4 의 `willUpdate` 씨앗이 막으려는 것이 정확히 이것이고, `index.html` 은 순수 HTML 이라 이 경로를 재현하지 못한다.
- **React 소비자가 `<UsersIcon data-ns-rail="admin" />` 로 자기 아이콘을 레일에 넣을 수 있는지.** 이 설계가 스프라이트 이름 방식을 버리고 슬롯을 고른 이유가 이것이다.

## 13. 순서

두 단계로 실행한다. **1단계가 2단계의 일을 줄이므로 이 순서여야 한다.**

1. **레일 재설계** — `ns-sidebar` 재작성, `ns-nav-group` 의 `name`·`badge`·reflect, 선택 상태, 비제어 `open`, `--ns-group-list-display` 제거, 토큰·검사·문서·`index.html`
2. **하위 카테고리** — `#nested` 감지와 `.nested` 스타일, 데모, 문서

2단계는 1단계가 끝나면 작다. 1단계에서 레일이 항목을 그리지 않게 되므로 들여쓰기 신호가 필요 없어지기 때문이다.
