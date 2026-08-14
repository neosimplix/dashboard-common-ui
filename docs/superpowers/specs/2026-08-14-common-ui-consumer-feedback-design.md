# 소비자 피드백 반영 설계 (0.2.0)

`v0.1.5` 를 두 번째 Next.js 프로젝트에 붙인 소비자가 적어 온 기록을 근거로 한다. 그 문서가 보고한 것은 다섯이고, 그중 넷은 라이브러리가 고쳐야 할 것, 하나는 문서 문구다. **breaking change 를 포함하므로 `0.2.0` 이다.**

첫 소비자(`dashboard-shell`)는 아직 이관 전이다. 지금이 이름공간을 바꿀 수 있는 마지막 시점이다 — 이관 후에는 두 소비자를 동시에 고쳐야 한다.

## 1. 다섯 증상, 네 원인

| # | 소비자가 겪은 것 | 원인 |
|---|---|---|
| 1 | `tokens.css` 를 `globals.css` **뒤에** 임포트해야 셸 색이 산다 | A. 라이브러리가 읽는 이름과 소비자가 테마하는 이름이 하나다 |
| 2 | 매 페이지 로드마다 사이드바가 4rem → 15rem 으로 벌어진다 | B. 상태가 프로퍼티로만 전달돼 서버 HTML 에 실리지 않는다 |
| 3 | 배지를 접힘 전용으로 읽고 `개요 개요` 를 만들었다 | C. `leading` 자리가 슬롯이 아니라 프로퍼티다 |
| 4 | 항목마다 있던 24×24 아이콘을 버렸다 | C. 같은 원인 |
| 5 | OS 다크모드에서 셸만 밝게 남는다 | D. `[data-theme="dark"]` 가 빈 블록이고, 활성화 신호도 안 맞는다 |

**여섯 번째 증상이 문서 맨 아래에 있다.** "버전 올릴 때 확인할 것" 다섯 줄 중 셋이 `node_modules/**/dist` 를 `grep` 하라고 시킨다 — `transition: width` 값, `--sidebar-width` 값, 빌드된 `.bg-surface`. **계약으로 노출하지 않은 값에 소비자가 의존하게 됐다는 신호다.** 아래 A·B 가 그 셋을 전부 없앤다.

## 2. A — 토큰 이름공간 분리

### 무엇이 잘못됐나

`src/tokens/tokens.css` 머리말이 근거를 적어 뒀다.

> 이름은 `dashboard-shell/app/globals.css` 와 동일하다. 접두사를 붙이지 않는 이유는 그 프로젝트의 25개 파일이 이미 `var(--space-3)` 형태로 이 이름들을 직접 참조하고 있기 때문이다.

**소비자가 하나일 때만 성립하는 가정이다.** 컴포넌트 shadow 스타일은 `var()` 폴백 없이 `var(--color-surface)` 를 읽는다(그 자체는 옳은 규칙이다 — 값이 두 곳에 있으면 어긋난다). 그래서 그 이름을 다른 뜻으로 쓰는 문서에 들어가면 **라이브러리 렌더링이 소비자 캐스케이드의 승패에 종속된다.** 임포트 순서가 승자를 정한다는 소비자의 관찰은 정확하지만 그건 증상이고, 원인은 두 이름이 하나라는 것이다.

두 번째 소비자에서 실제로 겹친 것은 `--color-surface` · `--color-surface-hover` 둘뿐이었다. 그건 우연이다. `--color-fg` · `--space-3` · `--radius-card` 는 흔한 이름이고 다음 프로젝트에서 겹치지 않을 이유가 없다.

### 바꾸는 것

`tokens.css` 의 공개 토큰 **전부**에 `--ns-` 를 붙인다.

```
--color-surface        → --ns-color-surface
--space-3              → --ns-space-3
--sidebar-width        → --ns-sidebar-width
--font-size-sm         → --ns-font-size-sm
… (tokens.css 의 :root 블록 전부)
```

`src/components/*/*.styles.ts` 와 `src/controls/controls.css` 의 참조를 전부 따라 고친다. 두 곳이 참조하는 서로 다른 이름은 **51개**이고 그중 4개(`--ns-icon-size` · `--ns-dialog-width` · `--ns-dialog-margin` · `--ns-label-display`)는 이미 접두사가 있으므로 **47개를 고친다.** `tokens.css` 의 `:root` 정의는 62개다(타이포 블록 여섯 줄이 한 줄에 정의를 둘씩 담고 있어 줄 수로 세면 56으로 나온다 — 세는 쪽이 틀리기 쉬운 지점이다). 참조보다 정의가 많은 차이는 `controls.css` 소비자만 쓰는 토큰이다.

### 뒤집히는 규칙

`.claude/rules/library-invariants.md` 는 지금 이렇게 말한다.

> **디자인 토큰 이름에는 접두사를 붙이지 않는다.** … 패키지 내부 배선용 커스텀 프로퍼티만 `--ns-` 를 쓴다.

전면 접두사를 하면 이 구분선이 사라진다. 새 구분선은 **이름이 아니라 위치**다.

> **모든 커스텀 프로퍼티는 `--ns-` 를 쓴다. `tokens.css` 에 정의돼 있으면 공개(소비자가 덮어도 된다), 없으면 내부 신호다.**

기존 셋이 새 규칙에 이미 맞는다. `--ns-icon-size` · `--ns-dialog-width` · `--ns-dialog-margin` 은 `tokens.css` 에 있고 원래 소비자가 덮으라고 문서화된 것이다. `--ns-label-display` 는 `tokens.css` 에 없고 `ns-sidebar.styles.ts` 가 `::slotted` 로 내려 `ns-nav-item.styles.ts` 가 받는 내부 신호다 — 그리고 이것이 `var()` 폴백 금지의 유일한 예외라는 서술도 그대로 유지된다.

### 별칭 시트 (옵트인)

이미 무접두사 이름을 쓰던 프로젝트를 위해 `dist/aliases.css` 를 추가 export 한다.

```css
/* @neosimplix/common-ui/aliases.css */
:root {
  --color-surface: var(--ns-color-surface);
  --space-3: var(--ns-space-3);
  …
}
```

**이 파일은 임포트하는 순간 원래의 충돌을 그대로 재현한다. 그게 목적이다** — `dashboard-shell` 의 25개 파일이 `var(--space-3)` 를 계속 읽게 하는 것. 문서에 한 줄로 못 박는다: **새 프로젝트는 임포트하지 않는다.**

**손으로 쓰지 않고 `scripts/copy-css.mjs` 가 `tokens.css` 에서 생성한다.** 두 파일이 어긋나면 별칭이 존재하지 않는 토큰을 가리키고, 그건 조용한 고장이다. 생성기는 `tokens.css` 의 `:root` 블록에서 `--ns-<name>:` 를 찾아 `--<name>: var(--ns-<name>);` 를 뽑는다. 원래 무접두사 이름이 없었던 배선 토큰 셋(`--ns-icon-size` · `--ns-dialog-width` · `--ns-dialog-margin`)은 `/* @no-alias */` 주석으로 시작하는 블록에 모아 두고 생성기가 건너뛴다.

### 새 검사 — `scripts/check-tokens.mjs`

`npm run check` 에 넷째 검사를 더한다. 이것이 없으면 다음에 누가 `var(--color-line)` 을 다시 적어도 아무도 모른다 — 타입 검사도 빌드도 통과한다.

`src/components/*/*.styles.ts` 와 `src/controls/controls.css` 에 나타나는 모든 `var(--x)` 에 대해:

1. `--ns-` 로 시작해야 한다.
2. `tokens.css` 에 정의돼 있거나, 내부 배선 화이트리스트(`--ns-label-display`)에 있어야 한다.

역방향은 보지 않는다. `tokens.css` 에 있고 아무도 안 쓰는 토큰은 `controls.css` 소비자가 쓸 수 있으므로 오류가 아니다.

`verification.md` 규칙대로 **일부러 깨뜨려 확인한다.** `--ns-space-3` 를 `--space-3` 로 되돌려 ①로 실패하는지, 존재하지 않는 `--ns-space-7` 을 넣어 ②로 실패하는지 각각 본다. 의도한 이유로 실패했는지까지 본다.

### `warn-missing-tokens.ts`

검사 대상 이름을 `--ns-color-line` 으로 바꾼다. 이 검사는 접두사 전환 이후 **더 정확해진다** — 우연히 같은 이름을 쓰는 소비자 때문에 거짓 통과할 여지가 사라진다.

## 3. B — SSR 상태 채널

### 무엇이 잘못됐나

두 가지가 겹쳤다.

**(1) `@lit/react` 는 반응형 프로퍼티를 서버 마크업에 싣지 않는다.** `createComponent` 는 `elementClass` 의 반응형 프로퍼티 이름을 가로채 `useLayoutEffect` 안에서 **프로퍼티로** 설정하고, `React.createElement` 에는 넘기지 않는다. 서버에서는 layout effect 가 실행되지 않으므로 `open` 속성이 마크업에 아예 없다.

> 구현 시 `node_modules/@lit/react/**/create-component.js` 를 실제로 읽어 이 서술을 확인한다. 이 저장소에는 `node_modules` 가 없어 지금은 소비자 보고와 문서에 근거한다.

**(2) 정의 전 레이아웃 예약이 `[open]` 을 본다.** `tokens.css` 의 `ns-sidebar:not([open]) { width: var(--sidebar-width-collapsed) }` 가 그것이다. 이 규칙의 목적은 **`customElements.define` 이전**의 화면 튐을 막는 것인데, 정의 이후까지 계속 걸린다. 정의 이후의 프레임은 `useLayoutEffect` 가 페인트 전에 잡으므로 애초에 볼 이유가 없다.

**(3) 우회책이 계약을 새로 만들었다.** 소비자는 래퍼 `div` 가 너비를 소유하고 사이드바가 `width: 100%` 로 채우게 했다. 그 순간 `ns-sidebar` 자신의 `transition: width 200ms` 가 무력해지므로 같은 트랜지션을 래퍼에 복제해야 했고, `15rem`/`4rem` 도 하드코딩됐다. **버전 올릴 때 `dist` 를 `grep` 하라는 체크리스트가 여기서 나왔다.**

### 바꾸는 것

**예약 규칙을 `:not(:defined)` 기준으로 재작성한다.**

```css
/* 정의 전에만 걸린다. 정의 후에는 :host 스타일이 소유한다. */
ns-sidebar:not(:defined)               { width: var(--ns-sidebar-width-collapsed) }
ns-sidebar:not(:defined)[open],
ns-sidebar:not(:defined)[data-ns-open] { width: var(--ns-sidebar-width) }
```

순수 HTML 소비자는 마크업에 `<ns-sidebar open>` 을 이미 쓰므로 첫 짝이 그대로 걸린다. React 소비자를 위한 것이 `data-ns-open` 이다.

**`src/react/tags/Sidebar.tsx` 를 추가한다.** 반응형 프로퍼티가 **아닌** 이름은 `createComponent` 가 가로채지 않고 `React.createElement` 로 흘려보내므로 서버 마크업에 그대로 실린다. 그 통로가 `data-ns-open` 이다.

```tsx
export function Sidebar({ open, onNavigate, children, className }: SidebarProps) {
  return (
    <NsSidebarBase
      open={open}
      // 하이드레이션 전에는 이것만 보인다. tokens.css 의 :not(:defined) 규칙이 읽는다.
      data-ns-open={open ? "" : undefined}
      className={className}
      onNsNavigate={(e) => onNavigate?.(e.detail)}
    >
      {children}
    </NsSidebarBase>
  );
}
```

훅 속성이 `data-ns-` 접두사인 것은 이미 있는 규칙이다(Light DOM 컴포넌트 조항에서 왔지만 이유가 같다 — 문서 이름공간이라 충돌하면 에러 없이 오동작한다).

### 이름 세 개

`library-invariants.md` 의 "shim 이 있는 태그는 이름이 셋이다" 를 따른다. `Dialog` · `PageHeading` 과 같은 모양이다.

| | 0.1.5 | 0.2.0 |
|---|---|---|
| Lit 클래스 별칭 | `NsSidebarElement` | 그대로 |
| `createComponent` 래퍼 | `NsSidebar` (공개) | `NsSidebarBase` (**비공개**) |
| 공개 이름 | — | `Sidebar` (shim) |

**breaking 이다.** `import { NsSidebar }` 를 쓰던 소비자는 `Sidebar` 로 바꾼다.

### 검증 경로가 하나 옮겨간다

`verification.md` 는 이벤트 일곱 중 여섯을 `docs/consumer-example.tsx` 가 직접 검사하고, 일곱 번째(`ns-dialog-close`)만 shim 이 `e.detail` 을 읽어 방어한다고 적고 있다. `NsSidebar` 가 비공개가 되면 `ns-navigate` 셋 중 하나가 같은 처지가 된다.

위 shim 의 `onNsNavigate={(e) => onNavigate?.(e.detail)}` 가 `Dialog` 와 똑같은 방어다 — `EventName<>` 캐스트가 빠지면 `e` 가 `Event` 로 타입돼 이 줄이 깨진다. `consumer-example.tsx` 는 `NsNavGroup` · `NsNavItem` 두 곳으로 `ns-navigate` 를 계속 검사한다. **`verification.md` 의 "일곱 중 여섯" 서술을 "일곱 중 다섯 + shim 둘" 로 고친다.**

### `ns-header` 는 손대지 않는다

예약 높이가 상태에 따라 바뀌지 않으므로 같은 문제가 없다. 소비자도 그렇게 보고했다.

### 소비자에게서 사라지는 것

래퍼 `div`, `SIDEBAR_TRANSITION` 상수, `15rem`/`4rem` 하드코딩. 체크리스트 다섯 줄 중 둘이 없어진다.

## 4. C — `leading` 슬롯

### 무엇이 잘못됐나

`ns-nav-item.ts` 는 `.badge` 를 **항상** 렌더한다. 프로퍼티 주석의 "접힌 레일에서 보이는 두 글자 배지" 는 배지가 그때 *유일하게 남는* 요소라는 뜻이었는데, 소비자는 *그때만 보이는* 것으로 읽고 `개요` 를 넣어 `개요 개요` 를 만들었다.

그리고 아이콘을 넣을 자리가 없다. 슬롯은 `trailing` 하나이고 좌측은 배지가 차지한다. **우회가 없다는 소비자의 판단은 맞다** — shadow 안이라 문서 CSS 가 닿지 않는다.

**두 증상의 원인이 하나다. 좌측 자리가 슬롯이 아니라 프로퍼티다.**

### 바꾸는 것

배지를 `leading` 슬롯의 **폴백 내용**으로 옮긴다.

```ts
<a class="row" href=${this.href} title=${this.label} @click=${this.#onClick}>
  <span class="leading">
    <slot name="leading">
      <span class="badge" aria-hidden="true">${this.badge}</span>
    </slot>
  </span>
  <span class="label">${this.label}</span>
  <span class="trailing"><slot name="trailing"></slot></span>
</a>
```

**슬롯 폴백은 할당된 노드가 없을 때만 렌더되므로 배타가 자동이다.** 아이콘을 주면 아이콘, 안 주면 배지. 소비자가 분기 코드를 쓸 필요가 없다.

스타일은 `.badge` 가 갖고 있던 `flex: none` 과 크기를 `.leading` 컨테이너로 올린다. 슬롯에 들어온 것이 배지와 같은 사각형을 차지하게 `::slotted(*)` 로 `--ns-icon-size` 를 맞춘다. 접힘 상태에서 leading 은 계속 보인다 — `--ns-label-display` 는 `.label` 과 `.trailing` 만 끈다.

`.leading` 을 새로 감싸는 이유는 슬롯 요소 자체에 레이아웃을 걸면 소비자가 넣은 요소의 `display` 에 휘둘리기 때문이다.

### 문서

`badge` 프로퍼티 주석과 `index.html` 설명을 고친다.

> **`leading` 슬롯이 비었을 때 대신 보이는 짧은 배지. 접힘·펼침 양쪽에서 보인다.** 펼친 상태에서 라벨 왼쪽에 그대로 남으므로 라벨과 같은 글자를 넣지 않는다.

`index.html` 에 아이콘을 넣은 항목과 배지만 있는 항목을 나란히 둔 데모를 추가한다(`.claude/skills/adding-a-component` 의 슬롯 추가 절차를 따른다). 새 절의 `id` 에는 절 이름을 접두사로 붙인다.

## 5. D — 다크모드

### 무엇이 잘못됐나

`tokens.css` 의 `[data-theme="dark"] { }` 는 빈 블록이다. **그런데 채워도 이 소비자에게는 안 켜진다** — 그쪽 본문은 `prefers-color-scheme` 으로 어두워지고 `data-theme` 을 세우지 않는다. 값을 채우는 것과 어떤 신호로 켜지는가는 별개 결정이고, 두 번째가 빠져 있었다.

두 신호를 다 받는 흔한 방법은 선언 블록을 두 벌(미디어쿼리 안/밖) 복제하는 것이다. **값이 두 곳에 존재하면 어긋나고 어긋나도 아무도 모른다** — 이 저장소가 `var()` 폴백을 금지한 바로 그 이유라 같은 함정을 다시 파는 셈이다.

### 바꾸는 것

`color-scheme` 만 신호로 세우고 값은 `light-dark()` 한 줄에 둔다. 복제가 없다.

```css
:root                     { color-scheme: light dark }   /* OS 를 따른다 */
:root[data-theme="light"] { color-scheme: light }        /* 명시 지정이 이긴다 */
:root[data-theme="dark"]  { color-scheme: dark }

:root {
  --ns-color-surface: light-dark(#fff, oklch(21% .006 285.885));
  …
}
```

부수 효과가 이득이다. `color-scheme` 은 **네이티브 폼 컨트롤·스크롤바·기본 배경**도 함께 뒤집으므로, `controls.css` 가 클래스로 감싸는 네이티브 요소들이 저절로 맞는다. 웹 컴포넌트로 만들지 않기로 한 결정의 배당금이다.

`color-scheme` 은 상속되므로 shadow 안까지 도달한다. `light-dark()` 는 `color-scheme` 이 세워진 요소 아래에서 해석되므로 컴포넌트 shadow 스타일이 별도 처리 없이 동작한다.

**요구 브라우저: Chrome 123 · Safari 17.5 · Firefox 120 이상.** 사내 대시보드 대상이라 수용한다. `README` 와 `index.html` 에 적는다.

### 팔레트 (1차안)

zinc 스케일 대칭 반전이 기본이다. **육안 확인 전까지는 1차안이다.**

| 토큰 | 라이트 | 다크 |
|---|---|---|
| `--ns-color-surface` | `#fff` | zinc-900 |
| `--ns-color-surface-sunken` | zinc-50 | zinc-950 |
| `--ns-color-surface-hover` | zinc-100 | zinc-800 |
| `--ns-color-line` | zinc-200 | zinc-800 |
| `--ns-color-line-strong` | zinc-300 | zinc-700 |
| `--ns-color-fg` | zinc-900 | zinc-50 |
| `--ns-color-fg-body` | zinc-700 | zinc-300 |
| `--ns-color-fg-muted` | zinc-500 | zinc-400 |
| `--ns-color-fg-subtle` | zinc-400 | zinc-500 |
| `--ns-color-accent` | zinc-900 | zinc-50 |
| `--ns-color-accent-hover` | zinc-800 | zinc-200 |
| `--ns-color-accent-fg` | `#fff` | zinc-900 |
| `--ns-color-disabled` | zinc-300 | zinc-700 |
| `--ns-color-overlay` | `rgb(0 0 0/.4)` | `rgb(0 0 0/.6)` |
| `--ns-color-danger` | red-600 | red-400 |
| `--ns-color-danger-surface` | red-50 | red-950 |
| `--ns-color-warn` | amber-700 | amber-400 |
| `--ns-color-warn-surface` | amber-50 | amber-950 |
| `--ns-color-success` | emerald-600 | emerald-400 |
| `--ns-color-success-surface` | emerald-50 | emerald-950 |
| `--ns-elevation-card` | 현행 | 알파를 `.1` → `.4` 로 |

`--ns-color-line` 과 `--ns-color-surface-hover` 가 다크에서 같은 값(zinc-800)이 된다. 의도한 것이다 — 다크에서 경계선을 더 밝히면 행 hover 가 경계보다 튄다. **`index.html` 육안 확인에서 다시 본다.**

### 확인 경로

`index.html` 에 테마 토글 절을 추가한다. `data-theme` 을 `light` / `dark` / 해제(OS 따름) 셋으로 순환시키는 버튼 하나다. **이것이 없으면 다크모드는 육안 확인 경로가 없어 이 저장소의 두 회귀 확인 수단 중 하나가 닿지 않는다.**

`id` 중복 검사(`verification.md` 넷째 명령)를 반드시 돌린다. 이 절의 `id` 는 `theme-` 접두사를 쓴다.

## 6. E — 규칙과 문서

| 파일 | 고치는 것 |
|---|---|
| `.claude/rules/library-invariants.md` | 접두사 규칙 교체(§2), shim 목록에 `Sidebar` 추가, `leading` 슬롯 폴백 조항 |
| `.claude/rules/verification.md` | "일곱 중 여섯" → "일곱 중 다섯 + shim 둘", `check-tokens.mjs` 를 `npm run check` 표에 추가 |
| `docs/gotchas.md` | 새 항목 셋 (아래) |
| `docs/project-structure.md` | `aliases.css` export, `Sidebar` shim, `check-tokens.mjs`, `leading` 슬롯 |
| `README.md` · `index.html` | 임포트 순서 무관 명시, `aliases.css` 안내, 브라우저 요구사항 |

`gotchas.md` 새 항목 셋. 각각 **왜** 를 적는다.

1. **소비자와 이름을 공유하면 라이브러리가 캐스케이드에 종속된다** — 0.1.5 의 무접두사 결정과 그것이 두 번째 소비자에서 깨진 경위. 별칭 시트가 옵트인인 이유.
2. **`@lit/react` 는 반응형 프로퍼티를 서버 마크업에 싣지 않는다** — SSR 에 필요한 상태는 반응형이 **아닌** 이름으로 내보내야 한다. 예약 규칙이 `[open]` 이 아니라 `:not(:defined)` 를 봐야 하는 이유.
3. **슬롯 폴백은 배타가 자동이다** — 프로퍼티로 만들면 소비자가 분기해야 하고, 분기해야 한다는 사실 자체를 문서로만 알릴 수 있다.

## 7. 검증

`verification.md` 를 따른다. **테스트 러너를 추가하지 않는다.**

| 대상 | 수단 |
|---|---|
| 토큰 참조 누락 | `npm run check` — 새 `check-tokens.mjs` (일부러 깨뜨려 확인) |
| 별칭 시트 ↔ 토큰 어긋남 | 생성이라 구조적으로 불가능. 출력 줄 수가 `tokens.css` 정의 수 − `@no-alias` 블록 수와 같은지 대조 |
| 이벤트 매핑 | `npm run check` — `check-events.mjs`, `consumer-example.tsx` |
| 클래스 ↔ 문서 | `npm run check` — `check-controls.mjs` |
| `index.html` 구조 | `verification.md` 의 네 `grep`. **`id` 중복 검사 필수**(새 절이 둘이다) |
| 렌더·상호작용·다크 팔레트 | `npm run demo` 후 **사람이** 본다 |
| SSR 마크업에 `data-ns-open` 이 실리는지 | **사람이** 확인한다. 소비자 프로젝트에서 `curl` 로 서버 HTML 을 받아 `grep` 한다 |

마지막 줄이 중요하다. 이 저장소에는 Next.js 소비자가 없으므로 **B 의 핵심 효과는 이 저장소 안에서 확인할 수 없다.** 구현 서브에이전트는 이것을 확인했다고 보고하지 않는다.

## 8. 비범위

- **`ns-shell`.** 헤더+사이드바+본문 그리드를 소유하고 토글을 흡수하는 컴포넌트. `project-structure.md` 의 "남은 일" 첫 항목이며 이번 shim 으로 SSR 튐이 해결되므로 급하지 않다. 별도 스펙.
- **소비자 프로젝트 코드 수정.** 이 스펙은 라이브러리만 다룬다.
- **아이콘 세트 확장.** `leading` 슬롯이 생기면 소비자가 자기 SVG 를 넣을 수 있다. `icons.ts` 를 늘릴지는 별개 판단.
- **`dashboard-shell` 이관.** 접두사 전환으로 오히려 쉬워지지만(이름이 안 겹쳐 점진 이관이 가능하다) 별도 계획이다.

## 9. 소비자 영향

| 변경 | 영향 |
|---|---|
| 토큰 접두사 | **breaking.** 토큰을 직접 참조하던 CSS 를 고치거나 `aliases.css` 를 임포트한다 |
| `NsSidebar` → `Sidebar` | **breaking.** import 한 줄 |
| `leading` 슬롯 | 추가만. 기존 `badge` 사용은 그대로 동작한다 |
| 다크모드 | 추가만. `color-scheme` 을 명시적으로 세우던 소비자는 `data-theme` 으로 옮긴다 |
| `:not(:defined)` 예약 | 추가만. 래퍼 `div` 우회는 **제거해도 되고 둬도 동작한다** |

피드백 문서의 "버전 올릴 때 확인할 것" 다섯 줄은 이 릴리스 이후 전부 필요 없어진다.

| 체크리스트 항목 | 이후 |
|---|---|
| `.bg-surface` 가 `var(--surface)` 로 컴파일되는지 | 이름이 겹치지 않으므로 무의미해짐 |
| `transition: width` 값 대조 | 래퍼가 사라져 불필요 |
| `--sidebar-width` 값이 15rem/4rem 인지 | 하드코딩이 사라져 불필요 |
| `[data-theme="dark"]` 가 채워졌는지 | 해결 |
| `leading` 슬롯이 생겼는지 | 해결 |
