# dashboard-shell 갤러리 이관 + 오버레이 삼종 설계

`dashboard-shell` 의 `app/dev/ui/page.tsx` 가 그 프로젝트의 공통 컴포넌트 인벤토리다. 이 라이브러리에 없는 것을 옮기고, 거기에 없던 toast · alert · confirm 을 더한다.

## 0. 범위

**옮기는 것**

| 원본 | 결과 |
|---|---|
| `Accordion` | `.ns-accordion` (+ `--card` `--plain`, `__title` `__meta` `__body`) |
| `Message` | `.ns-message` |
| `Chip` | `.ns-chip` (+ `__remove`) |
| `RowButton` | `.ns-table__row-button` |
| `Tabs` · `tabIdFor` | `ns-tabs` |
| `MultiSelect` | `ns-multi-select` |

**더하는 것** — `nsToast` · `nsAlert` · `nsConfirm`, 그리고 그 재료인 `ns-toast` 태그와 `.ns-button--danger` 변형.

**빼는 것** — `Avatar` · `DescriptionList` · `StatusPill` · `CenteredScreen` 은 사용자가 제외했다. `AdminLoginForm` 은 그 앱의 폼이라 라이브러리 대상이 아니다. 나머지(`Button` `ButtonLink` `Card` `Checkbox` `Dialog` `Field` `Input` `PageHeading` `Select` `Skeleton` `Table` `Textarea` `Header` `Sidebar` `Icons`)는 이미 있다.

## 1. 태그와 클래스를 가른 근거

기준은 `.claude/skills/adding-a-component/SKILL.md` 의 세 줄이다 — 캡슐화할 행동이 있으면 태그, 만들어 줄 마크업이 있으면 태그, 둘 다 아니면 클래스.

**Accordion 이 클래스인 이유가 이 기준의 시금석이다.** 눌리면 열리므로 "행동이 있다" 로 보이지만, 그 열림을 구현하는 것은 네이티브 `<details>`/`<summary>` 다 — 열림 상태 · 키보드 · 삼각형 표식을 브라우저가 갖고 우리 JS 는 한 줄도 실행되지 않는다. `.ns-checkbox` 가 눌리면 체크되는데도 클래스인 것과 같다. 반대로 `ns-dialog` 가 태그인 이유는 `showModal()` 호출 · ESC/백드롭/닫기버튼의 사유 구분 · 제어/비제어 조율을 **우리 코드가** 해야 하기 때문이다.

즉 기준은 "화면이 움직이는가" 가 아니라 **"그 움직임을 우리가 구현해야 하는가"** 다.

`ns-tabs` 는 roving tabindex 와 화살표 이동이 플랫폼에 없어서 태그다. `ns-multi-select` 는 검색 필터링과 선택 집합을 스스로 갖고, 목록·칩을 매번 다시 그리므로 태그다.

## 2. 클래스 넷 + 버튼 변형 하나

값은 `tokens.css` 의 토큰만 참조한다. `var()` 폴백을 쓰지 않는다. 전부 `@layer ns-controls` 블록 안이다.

### 2.1 `.ns-accordion`

```html
<details class="ns-accordion ns-accordion--card">
  <summary>
    <span class="ns-accordion__title">권한</span>
    <span class="ns-accordion__meta">3개</span>
  </summary>
  <div class="ns-accordion__body">…</div>
</details>

<details class="ns-accordion ns-accordion--plain">
  <summary>관리자 로그인</summary>
  <div class="ns-accordion__body">…</div>
</details>
```

**변형을 반드시 명시하게 한다.** 참고 구현의 CSS 주석이 "한쪽을 기본으로 깔고 다른 쪽에서 `border: none` 으로 되돌리지 않는다 — 되돌리는 규칙은 소스 순서에 기대게 되고, 나중에 규칙을 하나 더할 때 어느 쪽이 이기는지가 조용히 바뀐다" 를 근거와 함께 적어 뒀다. 클래스 하나에 card 를 기본으로 깔면 정확히 그 형태가 된다. `.ns-button` 이 이미 `--solid`/`--outline` 을 요구하므로 이 저장소에서 새 규약도 아니다.

`.ns-accordion` 에는 두 변형이 **같아야 하는 것만** 둔다 — `summary` 의 커서와 `:focus-visible` 링이다.

- `--card` — 면(`--ns-color-line` 테두리 · `--ns-radius-panel` · `--ns-color-surface`). `summary` 는 `display: flex` · `justify-content: space-between` · `align-items: baseline`, `list-style-position: inside`(기본 삼각형을 남긴다 — 열림 상태를 알리는 유일한 표식이고 브라우저가 그린다). hover 에 `--ns-color-surface-hover`.
- `--plain` — 면을 만들지 않고 위 구분선 한 줄. `summary` 는 가운데 정렬 · `--ns-color-fg-muted`. 위쪽 여백은 쓰는 화면이 정한다.

`summary` 는 `.ns-accordion--card summary` 처럼 자손 선택자로 잡는다 — 요소 타입으로 특정되므로 이름을 하나 덜 외운다. `__title` · `__meta` 는 둘 다 `span` 이라 순서에만 의존하지 않도록 이름을 붙인다. `__body` 는 `div` 이고 형제가 생길 수 있어 이름을 붙인다.

`--plain` 에는 요약 자리가 없다. React 쪽에서 타입으로 막는다(§5).

### 2.2 `.ns-message`

```html
<div class="ns-message"><p>왼쪽에서 프로젝트를 선택하세요.</p></div>
```

`flex: 1 1 0%` 로 남는 공간을 차지하고 가운데 정렬한다. `p` 는 자손 선택자(`.ns-message p`) — `margin: 0` · `--ns-font-size-sm` · `--ns-color-fg-subtle`.

### 2.3 `.ns-chip`

세 갈래를 마크업으로 가른다.

```html
<!-- 토글 -->
<button type="button" class="ns-chip" role="checkbox" aria-checked="true">마케팅팀</button>
<!-- 제거 -->
<span class="ns-chip">박승인 <button type="button" class="ns-chip__remove" aria-label="박승인 제거">×</button></span>
<!-- 읽기 전용 -->
<span class="ns-chip">공지</span>
```

**선택 상태는 `[aria-checked="true"]` 로 잡는다.** `--selected` 변형 클래스를 만들지 않는다 — `invalid` 를 `[aria-invalid="true"]` 로 잡는 것과 같은 규칙이다. 클래스를 토글하는 자바스크립트가 필요 없어 순수 HTML 에서도 동작한다.

커서·전이·hover 는 `button.ns-chip` 으로 잡는다. `<span>` 갈래는 상호작용하지 않으므로 커서를 주면 거짓말이 된다.

비활성은 `.ns-chip:disabled`(토글)와 `.ns-chip:has(:disabled)`(제거 갈래 — 안쪽 버튼이 disabled 다) 둘 다 본다. `.ns-checkbox:has(:disabled)` 와 같은 형태다.

`.ns-chip` 과 `.ns-chip__remove` 를 `controls.css` 의 공용 `:focus-visible` 목록에 더한다.

**토글과 제거를 함께 쓰지 않는다.** 버튼 안에 버튼이 들어가 마크업이 무효가 된다. 마크업이 갈라져 있으므로 이 조합은 애초에 쓸 수 없고, React 쪽만 런타임 경고를 남긴다(§5).

### 2.4 `.ns-table__row-button`

`.ns-table__sort` 옆에 둔다. 표에 속한 이름이라 `__` 로 잇는다.

```html
<tr onclick="…">
  <td><button type="button" class="ns-table__row-button" aria-haspopup="dialog">임연정</button></td>
  …
</tr>
```

**클릭 핸들러를 대신하는 것이 아니라 키보드 진입점이다.** `<tr>` 에 click 만 붙이면 Tab 키가 그 행에 닿지 않는다. `<tr>` 에 `tabindex`·`role="button"` 을 얹으면 그 행이 더 이상 표의 행이 아니게 되어 화면낭독기가 칸 제목과 값의 연결을 잃는다. 그래서 시맨틱은 그대로 두고 첫 칸에 버튼을 넣는다 — Enter/Space 가 이 버튼에서 click 을 내고 그것이 `<tr>` 로 버블링해 이미 있는 핸들러를 탄다. **그래서 이 버튼에 핸들러를 또 붙이면 클릭 한 번에 두 번 돈다.**

클래스가 하는 일은 버튼을 셀 텍스트처럼 보이게 하는 것(`border: 0` · `background: none` · `font: inherit` · `color: inherit`)과 포커스 링이다. 링은 `<tr>` 이 아니라 이 버튼에 그린다 — `<tr>` 의 outline 은 브라우저마다 셀 경계에서 끊겨 보인다.

### 2.5 `.ns-button--danger`

`nsConfirm({ tone: "danger" })` 의 확인 버튼이 쓴다. `--solid` 와 같은 모양이되 배경이 `--ns-color-danger` 다.

**글자색으로 `--ns-color-danger-fg` 토큰을 `tokens.css` 에 더한다.** 사용처가 하나인 토큰을 만드는 것은 추측이라는 규칙이 있지만, 그보다 강한 규칙이 먼저다 — **색은 `tokens.css` 한 곳에만 존재한다.** `controls.css` 에 `#fff` 를 적으면 그 리터럴이 두 모드를 함께 뒤집지 못한다. 값은 `--ns-color-accent-fg` 와 같은 모양으로 둔다:

```css
--ns-color-danger-fg: light-dark(#fff, oklch(21% 0.006 285.885));
```

다크에서 흰색이 아닌 이유가 있다. `--ns-color-danger` 는 다크에서 `oklch(70.4% 0.191 22.216)` 로 **밝아지므로** 흰 글자와의 대비가 무너진다. 라이트에서는 `oklch(57.7% …)` 라 흰 글자가 맞다.

**hover 에서 배경을 바꾸지 않는다.** `--ns-color-danger-hover` 를 만들려면 다크·라이트 두 값을 정해야 하는데, 지금 그 값을 정할 근거가 없다. 비활성은 `--solid` 와 같이 `--ns-color-disabled` 로 간다. 파괴적 버튼이 hover 에 반응하지 않는 것이 실제로 어색한지는 브라우저 확인 항목이다(§8).

## 3. `ns-tabs` — 마크업형

`ns-table` 선례를 따른다. **셀을 렌더하지 않는 표**와 같은 자리다 — 탭 버튼을 렌더하지 않고 소비자가 쓴 것에 행동만 얹는다.

```html
<ns-tabs aria-label="관리자 목록" default-active="live">
  <button type="button" data-ns-tab="live" data-ns-panel="panel-live">운영 중</button>
  <button type="button" data-ns-tab="requests" data-ns-panel="panel-requests">
    신청 <span class="ns-tabs__count">0</span>
  </button>
</ns-tabs>

<div id="panel-live" role="tabpanel" aria-labelledby="panel-live-tab" tabindex="0">…</div>
```

### 3.1 구현 형태

Light DOM · `ReactiveElement` · `createRenderRoot() { return this }`. 소비자 자식을 품으므로 `LitElement` 를 쓰면 템플릿이 그 자식을 덮어쓴다.

`.styles.ts` 를 만들지 않는다. 스타일은 전부 `controls.css` 에 있다.

### 3.2 컴포넌트가 채우는 것

각 `[data-ns-tab]` 자식에:

| 속성 | 값 |
|---|---|
| `role` | `"tab"` |
| `id` | `` `${data-ns-panel}-tab` `` — 소비자가 이미 `id` 를 썼으면 건드리지 않는다 |
| `aria-controls` | `data-ns-panel` 값 |
| `aria-selected` | 활성 탭만 `"true"` |
| `tabindex` | 활성 `0`, 나머지 `-1` (roving tabindex) |

roving tabindex 인 이유: 전부 `0` 이면 탭이 다섯 개일 때 Tab 을 다섯 번 눌러야 패널에 닿는다.

**호스트에는 `role="tablist"` 를 쓴다. 불변 규칙 "호스트의 속성을 쓰지 않는다" 의 좁은 예외다.** ARIA 의 tablist↔tab 소유 관계는 DOM 부모여야 해서 이 role 을 둘 곳이 호스트밖에 없다. 규칙이 막으려던 것은 "소비자가 쓴 속성을 덮어 문서화된 override 를 조용히 죽이는 것" 이므로, **이미 `role` 이 있으면 건드리지 않는 조건부 쓰기**로 그 성질을 지킨다. `aria-label` 은 소비자가 직접 쓴다 — 우리가 관리할 이유가 없다.

이 예외와 그 근거를 `docs/gotchas.md` 에 남긴다.

### 3.3 소비자 DOM 감시

`MutationObserver({ childList: true, subtree: true })`. **`attributes` 는 켜지 않는다** — 동기화가 `setAttribute` 를 쓰므로 자기 쓰기에 재발동해 루프가 된다. `ns-table` 과 같은 배선이다.

조회 지점마다 소유를 확인한다: `el.closest("ns-tabs") === this`. 경계가 없어 중첩 인스턴스의 버튼이 서로에게 보인다.

### 3.4 상태와 이벤트

- `active` — 제어. `@property({ attribute: false })`. `<ns-tabs active="live">` 는 무시되므로 `connectedCallback` 에서 `warnPropertyOnlyAttributes(this, { active: "default-active" })` 로 경고한다.
- `default-active` — 비제어 초기값. 없으면 첫 번째 탭.
- `ns-tab-change` — `{ id }`. `id` 는 `data-ns-tab` 값이다. `bubbles: true, composed: true`.

제어 중이면 `active` 를 바꾸지 않고 이벤트만 낸다. 비제어면 스스로 바꾸고 이벤트도 낸다.

`active` 가 어느 탭에도 없으면 화살표 키를 삼키지 않고 흘린다 — 기준점이 없다.

### 3.5 키보드

←/→ 로 이동, Home/End 로 양 끝. **자동 활성화 패턴** — 화살표를 누르면 포커스와 선택이 함께 움직인다. 탭 전환이 싼 화면이라 이 패턴이 맞다. 목록 끝에서 반대쪽으로 순환한다.

### 3.6 스타일

`controls.css` 의 요소 선택자로 둔다. `ns-tabs` 의 자식은 전부 버튼이므로 자손 선택자로 잡는다 — 소비자가 외울 이름은 `.ns-tabs__count` 하나뿐이다.

```
ns-tabs { display: flex; align-items: stretch; gap; border-bottom; overflow-x: auto }
ns-tabs [data-ns-tab] { … border-bottom: 2px solid transparent … }
ns-tabs [data-ns-tab][aria-selected="true"] { … border-bottom-color: var(--ns-color-accent) }
.ns-tabs__count { … }
ns-tabs [data-ns-tab][aria-selected="true"] .ns-tabs__count { … }
```

밑줄이 탭 줄 전체에 이어지고 활성 탭만 그 위에 진한 선을 얹는다. 탭 각각에 테두리를 두르면 활성/비활성 경계가 두 겹으로 보인다. 활성 표시가 밑줄이므로 비활성에도 `2px` 투명 테두리로 자리를 미리 잡아 둔다 — 없으면 선택할 때 1px 씩 움직인다.

탭이 많으면 줄바꿈하지 않고 가로로 스크롤한다. 줄바꿈되면 밑줄이 끊긴다.

### 3.7 `tabIdFor`

```ts
export function tabIdFor(panelId: string): string { return `${panelId}-tab`; }
```

패널의 `aria-labelledby` 가 가리켜야 하는 값이다. 소비자가 두 문자열을 따로 관리하면 반드시 어긋나므로 `panelId` 에서 파생시킨다. `src/index.ts` 와 `src/react/index.ts` 에서 내보낸다. 순수 HTML 은 `id="{panelId}-tab"` 를 손으로 쓴다 — 규칙이 한 줄이라 문서에 적는 것으로 족하다.

## 4. `ns-multi-select` — 데이터형

`ns-pagination` 선례를 따른다. Light DOM · `LitElement` · `createRenderRoot() { return this }`. 자식이 없으므로 Lit 이 내용을 통째로 소유한다.

**Light DOM 인 이유가 이 컴포넌트의 존재 이유와 같다.** 칩 줄 · 검색 입력 · 체크박스 목록은 전부 `controls.css` 의 `.ns-chip` · `.ns-input` · `.ns-checkbox` 다. shadow 였다면 셋 전부를 다시 적어야 했다.

```
ns-multi-select
├─ 선택 칩 줄        .ns-chip + .ns-chip__remove   (선택이 있을 때만)
├─ 검색 입력         .ns-input
└─ 목록 컨테이너     .ns-multi-select__list
   ├─ .ns-checkbox × N   (label + hint = option.meta)
   └─ .ns-multi-select__empty   (결과 없음)
```

### 4.1 API

| 이름 | 종류 | 설명 |
|---|---|---|
| `options` | 프로퍼티 전용 | `{ value, label, meta? }[]`. **정렬 순서는 호출부가 이 배열 순서로 정한다** — 컴포넌트는 도메인을 모른다 |
| `value` | 프로퍼티 전용 | 제어. `undefined` 면 비제어 |
| `defaultValue` | 프로퍼티 | 비제어 초기값. 기본 `[]` |
| `search-placeholder` | 속성 | 기본 `"검색"` |
| `empty-message` | 속성 | 기본 `"결과가 없습니다"` |
| `input-id` | 속성 | 검색 input 의 `id` |

**비제어 초기값이 속성이 아니라 프로퍼티인 것은 규칙에서 벗어난다.** 배열은 속성으로 쓸 수 없어서다. 규칙이 막으려던 것("속성 하나가 겸용돼 `<ns-x value=…>` 가 조용히 제어 모드로 들어감")은 이름이 둘이라 일어나지 않는다. `warnPropertyOnlyAttributes(this, { value: "defaultValue 프로퍼티", options: "options 프로퍼티" })` 로 속성으로 쓴 실수를 잡는다.

**`input-id` 를 따로 두는 이유.** `.ns-field__label` 의 `for` 는 실제로 포커스를 받는 검색 input 을 가리켜야 한다. 호스트의 `id` 를 안쪽 input 에 그대로 옮기면 문서에 같은 `id` 가 둘 생기고, `getElementById` 가 어느 쪽을 주는지가 문서 순서로 정해진다. 명시적인 이름을 받아 그 경로를 닫는다.

`aria-describedby` 도 검색 input 에 그대로 넘긴다 — `.ns-field__hint` 를 잇는 자리다.

### 4.2 검색

`label` 과 `meta` 둘 다에 걸린다. **화면에 보이는 문자열만 검색어가 된다** — 보이지 않는 별도 검색어 필드를 두지 않는다. 대소문자를 무시하고 부분 일치다.

선택된 것은 **고른 순서로** 칩에 남는다. 검색으로 목록이 좁혀져도 칩은 사라지지 않는다.

### 4.3 이벤트

`ns-multi-select-change` — `{ values: string[] }`. **요청되는 다음 전체 집합**이다. 바뀐 하나가 아니라 전체를 주면 소비자 처리가 한 줄이 된다(`setOwners(e.detail.values)`) — `ns-select-change` 와 같은 판단이다.

이름이 `ns-select-change` 와 다른 이유는 그 이름을 `ns-table` 이 이미 쓰기 때문이다. `HTMLElementEventMap` 은 전역이라 같은 이름에 다른 `detail` 을 실을 수 없다.

### 4.4 스타일

```
ns-multi-select { display: flex; flex-direction: column; gap: var(--ns-space-2) }
.ns-multi-select__chips { display: flex; flex-wrap: wrap; gap: var(--ns-space-2) }
.ns-multi-select__list { max-height: 15rem; overflow-y: auto; border; border-radius; padding }
.ns-multi-select__empty { … --ns-color-fg-subtle }
```

`15rem` 은 한 곳에만 있고 테마로 변할 이유가 없는 구조적 상수라 리터럴로 둔다. 참고 구현이 `--multi-select-list-height` 로 뽑았던 것은 CSS Modules 라 값에 이름을 붙이는 것 외에 재사용 수단이 없었기 때문이다.

## 5. React 층

### 5.1 `src/react/controls/`

- `Accordion.tsx` — `variant: "card" | "plain"`(기본 `card`) · `title` · `summary` · `defaultOpen` · `children` · `className`. **`summary` 는 `card` 에서 필수, `plain` 에서 `never` 다.** 판별 유니온으로 타입이 강제한다 — 「권한」만 적혀 있으면 몇 개인지 보려고 전부 열어야 하고, optional 로 두면 이 규약은 아무도 지키지 않는다.
  `open` 이 아니라 `defaultOpen` 인 것이 중요하다. 이후의 열림 상태는 브라우저가 갖고 React 는 다시 손대지 않는다 — `defaultChecked` 와 같은 규약이다.
- `Message.tsx` — `children` 만.
- `Chip.tsx` — `children` · `selected?` · `onRemove?` · `removeLabel?` · `onClick?` · `disabled?` · `className?`. `selected !== undefined` 면 토글 갈래, `onRemove` 가 있으면 제거 갈래, 둘 다 없으면 읽기 전용 `<span>`. 둘을 함께 주면 `selected` 가 이기고 개발 빌드에서만 `console.warn` 한다.

`RowButton` 은 React 컴포넌트를 만들지 않는다 — `<button className="ns-table__row-button">` 한 줄이고, 감싸면 `onClick` 을 막는 타입을 위해서만 존재하는 컴포넌트가 된다. 대신 `index.html` 과 `consumer-example.tsx` 에 "핸들러는 `<tr>` 에만" 을 적는다.

### 5.2 `src/react/elements.ts`

`createComponent` 래퍼 둘. **`EventName<>` 캐스트를 반드시 넣는다** — 빼면 라이브러리 타입 검사는 통과하고 소비자의 `e.detail` 만 컴파일 에러가 난다.

```ts
NsTabs:        events: { onNsTabChange: "ns-tab-change" as EventName<CustomEvent<NsTabChangeDetail>> }
NsMultiSelect: events: { onNsMultiSelectChange: "ns-multi-select-change" as EventName<CustomEvent<NsMultiSelectChangeDetail>> }
```

shim 은 만들지 않는다. 두 태그 모두 `title` 같은 전역 속성 이름을 쓰지 않고, SSR 에 보여야 하는 상태도 없다(`ns-sidebar` 의 `data-ns-open` 같은 사정이 없다).

### 5.3 명령형 셋

`nsToast` · `nsAlert` · `nsConfirm` 을 `src/index.ts` 와 `src/react/index.ts` 양쪽에서 내보낸다. 함수라 React 컴포넌트가 필요 없다. **모듈 평가 시점에 `document` 를 만지지 않는다** — 호출될 때 만든다. `register()` 가 SSR 을 막는 것과 같은 이유다.

## 6. 명령형 삼종

### 6.1 왜 명령형인가

이 저장소는 지금까지 "상태는 소비자가 갖고 컴포넌트는 이벤트만 올린다" 로 일관돼 있다. **이 셋은 그 규약의 의도된 예외다.** 토스트와 confirm 은 호출 지점에서 답이 필요한 것이고, 선언형으로 만들면 호출부가 `useState` 와 렌더 분기를 매번 다시 쓴다. 셋을 한 가족으로 두는 것이 그 예외를 한 자리에 모은다.

셋 다 **문자열만 받는다.** `textContent` 로 넣으므로 HTML 주입 경로가 없고, 순수 HTML 과 React 에서 쓰는 법이 같다. 폼이 들어가는 모달은 이 API 로 만들지 않고 `ns-dialog` 로 직접 만든다.

이름이 `alert`/`confirm` 이 아닌 이유는 `import { confirm } from "@neosimplix/common-ui"` 가 그 모듈 안에서 전역 `confirm` 을 가리기 때문이다. UMD 에서는 네임스페이스가 붙지만(`NsCommonUI.nsConfirm`) ES 에서는 아니다.

### 6.2 `nsToast`

```ts
nsToast(message: string, options?: {
  tone?: "neutral" | "success" | "danger" | "warn";   // 기본 neutral
  duration?: number;                                   // 기본 4000. 0 이면 자동 소멸 없음
}): () => void   // 즉시 닫는 함수
```

**리전은 `ns-toast` shadow 태그다.** 문서당 하나를 만들어 `document.body` 에 붙이고, 이미 있으면 재사용한다. 페이지 위에 겹쳐 뜨므로 소비자 CSS 와 격리되는 shadow 가 맞다 — Light DOM 이면 소비자의 `div { … }` 한 줄이 토스트를 무너뜨릴 수 있다.

- 우하단 고정(`position: fixed`), 아래에서 위로 쌓이고 새 것이 아래다.
- 리전에 `aria-live="polite"` · `role="status"`. **`danger` 항목만 `role="alert"`** 로 즉시 읽게 한다.
- 각 항목에 닫기 버튼. shadow 안이라 `ns-icon` 을 쓸 수 있다(`ns-dialog` 의 닫기 버튼과 같은 경로).
- **마우스 hover 와 키보드 포커스 중에는 자동 소멸 타이머를 멈춘다.** 안 멈추면 읽는 중에, 혹은 닫기 버튼에 Tab 으로 닿는 중에 사라진다.
- 반환한 `dismiss()` 를 두 번 불러도 안전하다.

스타일은 `ns-toast.styles.ts` 의 shadow CSS 다. `controls.css` 는 shadow 안에 도달하지 않으므로 닫기 버튼 스타일을 최소한만 다시 적는다 — `ns-dialog` 가 수용한 것과 같은 중복이다.

### 6.3 `nsAlert` · `nsConfirm`

```ts
nsAlert(options: { heading?: string; message: string; confirmLabel?: string }): Promise<void>
nsConfirm(options: {
  heading?: string; message: string;
  confirmLabel?: string; cancelLabel?: string;
  tone?: "default" | "danger";
}): Promise<boolean>
```

`ns-dialog` 를 새로 만들어 `document.body` 에 붙이고, 본문에 `<p>`, `slot="footer"` 에 버튼을 넣은 뒤 `.show()` 한다. **비제어로 쓴다** — 이 대화상자는 소비자가 상태를 갖지 않는 것이 목적이므로 `show()`/`close()` 경로가 맞다.

| 경로 | alert | confirm |
|---|---|---|
| 확인 버튼 | resolve | `true` |
| 취소 버튼 | — | `false` |
| ESC · 백드롭 · 닫기 버튼 (`ns-dialog-close`) | resolve | `false` |

닫힌 뒤 요소를 `remove()` 한다. 남기면 호출 횟수만큼 `<ns-dialog>` 가 문서에 쌓인다.

버튼은 `.ns-button` 이다. **`controls.css` 를 요구하는 것이 새 요구사항은 아니다** — `ns-pagination` 이 이미 Light DOM 에 `.ns-button` 을 렌더한다.

`tone: "danger"` 면 확인 버튼이 `.ns-button--danger` 이고 **취소 버튼에 `autofocus`** 가 간다. 네이티브 `<dialog>` 의 초기 포커스가 파괴적 동작에 놓이면 Enter 한 번에 지워진다.

여러 번 부르면 네이티브 top layer 에 쌓인다 — 별도 큐를 두지 않는다.

## 7. 함께 바뀌는 파일

`.claude/skills/adding-a-component/SKILL.md` 의 연결 지점 목록에 따른다.

| 파일 | 무엇 |
|---|---|
| `src/tokens/tokens.css` | `--ns-color-danger-fg` 한 줄. **`@no-alias` 표시 아래에 둔다** — 0.1.5 에 없던 새 토큰이라 무접두사 원본이 존재하지 않는다. 위에 두면 `copy-css.mjs` 가 아무도 쓴 적 없는 `--color-danger-fg` 별칭을 만든다 |
| `src/controls/controls.css` | `.ns-accordion*` · `.ns-message*` · `.ns-chip*` · `.ns-table__row-button` · `.ns-button--danger` · `ns-tabs` 계열 · `ns-multi-select` 계열 |
| `src/components/tabs/ns-tabs.ts` | `ReactiveElement`. `.styles.ts` 없음 |
| `src/components/multi-select/ns-multi-select.ts` | `LitElement` + Light DOM. `.styles.ts` 없음 |
| `src/components/toast/ns-toast.ts` · `.styles.ts` | shadow 리전 |
| `src/components/toast/toast.ts` | `nsToast` |
| `src/components/dialog/confirm.ts` | `nsAlert` · `nsConfirm` |
| `src/types.ts` | `NsTabChangeDetail` · `NsMultiSelectChangeDetail` + `HTMLElementEventMap` 확장 |
| `src/index.ts` | 등록 부수효과 import **와** 클래스·함수 재export |
| `src/react/elements.ts` | `NsTabs` · `NsMultiSelect`, `EventName<>` 캐스트 |
| `src/react/controls/{Accordion,Message,Chip}.tsx` | |
| `src/react/index.ts` | 값과 타입 재export |
| `docs/consumer-example.tsx` | **새 이벤트 둘에 핸들러를 붙여 `e.detail` 을 실제로 읽는다.** 이것이 `EventName<>` 캐스트를 지키는 유일한 검사다 |
| `index.html` | 섹션 · 클래스 표 · HTML 예시 · React 예시 |
| `.claude/skills/releasing/SKILL.md` | 콜드 설치 스모크 테스트의 export 목록 |
| `docs/project-structure.md` | 태그 표 · 클래스 표 · 이벤트 목록 · 디렉터리 |
| `docs/gotchas.md` | `ns-tabs` 가 호스트에 `role` 을 쓰는 예외의 근거 |

## 8. 검증

이 저장소에는 테스트 러너가 없다. 설계 결정이지 누락이 아니다.

**`npm run check`** — 라이브러리 타입 · 소비자 관점 타입 · 이벤트 매핑 · 클래스↔문서 대조 · 토큰 참조. `check-controls.mjs` 가 `controls.css` 의 클래스와 `index.html` 을 양방향으로 대조하므로 새 클래스를 문서에 빠뜨리면 막힌다. `--modifier` 변형도 개별로 센다.

**`index.html` 구조 검사** — `<script>` 하나, 미완결 `</script>` 없음, `document.addEventListener` 없음, **id 중복 없음**. 새 절의 id 에는 절 이름을 접두사로 붙인다(`tabs-demo` · `multi-select-demo` · `toast-demo`).

**빌드 확인** — `npm run build` 뒤 `grep -c "ns-tabs" dist/bundle.umd.js` 로 등록이 번들에 살아남았는지 본다.

**사람이 봐야 하는 것** — 구현 서브에이전트는 화면을 볼 수 없다. 하지 않은 확인을 했다고 보고하지 않는다.

- `.ns-button--danger` 의 대비 (라이트·다크 양쪽). hover 에 반응하지 않는 것이 어색한지
- 아코디언 두 변형의 무게 차이가 나란히 놓았을 때 실제로 보이는지
- 탭의 화살표 이동 · 포커스 링 · 넘칠 때 가로 스크롤
- 표 행의 Tab 진입과 포커스 링이 셀 경계에서 끊기지 않는지
- 토스트가 hover 중 멈추는지, 여러 개 쌓였을 때 겹치지 않는지
- confirm 의 초기 포커스가 `danger` 에서 취소에 놓이는지

## 9. 단계

각 단계 끝에서 `npm run check` 가 통과해야 한다.

1. **클래스** — `.ns-accordion` · `.ns-message` · `.ns-chip` · `.ns-table__row-button` · `.ns-button--danger`, React 컨트롤 셋, `index.html` 절, `consumer-example.tsx`.
2. **태그 둘** — `ns-tabs` · `ns-multi-select`, 이벤트 배선(`types.ts` → `elements.ts` → `consumer-example.tsx`), `index.html` 절.
3. **명령형 셋** — `ns-toast` · `nsToast` · `nsAlert` · `nsConfirm`, `index.html` 절, `docs/project-structure.md` 와 `docs/gotchas.md` 갱신.

## 10. 하지 않는 것

- **버전 태그를 만들지 않는다.** 릴리스는 별개 작업이다(`releasing` 스킬).
- **`dashboard-shell` 을 고치지 않는다.** 그 프로젝트의 이관은 `docs/project-structure.md` 의 "남은 일" 에 있는 별도 계획이다.
- **테스트 파일을 만들지 않는다.** 원본에 `Accordion.test.tsx` · `Chip.test.tsx` · `MultiSelect.test.tsx` · `Tabs.test.tsx` · `Table.test.tsx` 가 있지만 옮기지 않는다.
- **`.ns-chip` 을 필터 배지로 넓히지 않는다.** 원본 주석이 "활용 범위는 아직 열려 있다" 로 남겨 둔 것을 그대로 둔다.
