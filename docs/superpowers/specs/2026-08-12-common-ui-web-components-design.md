# common-ui — Lit Web Component 공통 UI 라이브러리 설계

작성일: 2026-08-12

## 1. 목적과 범위

Next.js, React 18/19, 순수 HTML에서 동일하게 쓰는 공통 UI를 Web Component로 만든다. npm private 레지스트리 비용을 피하기 위해 **git 태그로 버전을 관리하고 소비자는 git 의존성으로 설치**한다.

첫 릴리스 범위는 대시보드 셸의 헤더와 사이드 네비게이션이다.

- `ns-header` — 좌측 토글 버튼, 프로젝트 이름, 우측 slot
- `ns-sidebar` — 접힘/펼침, 접었을 때 좌측 레일 유지
- `ns-nav-group` — 네비게이션 그룹
- `ns-nav-item` — 그룹 하위 항목, 행 안에 사용자 정의 slot

기준이 되는 기존 구현은 `dashboard-shell/components/shell/Header.tsx`, `Sidebar.tsx`이고, 디자인 토큰은 `dashboard-shell/app/globals.css`다.

**이 저장소는 `shared-ui`를 대체한다.** `shared-ui`는 구조와 빌드 시스템이 과도하게 복잡했고 스타일링·토큰 방식이 토대부터 맞지 않아 폐기한다. 이 설계는 그 두 가지를 단순화하는 것을 최우선으로 한다.

## 2. 핵심 결정

| 항목 | 결정 | 이유 |
|---|---|---|
| 구현 기반 | Lit 3 + TypeScript | 컴포넌트 CSS가 `css\`\`` 템플릿으로 JS 안에 들어가 CSS 로더·PostCSS 설정이 전부 불필요해진다 |
| 저장소 구성 | 단일 저장소 · 단일 패키지 | 모노레포 없이 `exports` 서브패스로 나눈다. 소비자는 git 의존성 한 줄, 태그 하나만 관리 |
| 스타일 격리 | Shadow DOM | 소비자 CSS와 충돌하지 않는다. slot 콘텐츠는 light DOM이라 소비자 CSS(Tailwind 포함)가 그대로 적용된다 |
| 테마 | CSS custom property, 문서 `:root`에 정의 | 커스텀 프로퍼티는 shadow 경계를 통과해 상속된다. `[data-theme="dark"]` 한 줄로 전체 전환 가능 |
| 토큰 로드 | **소비자가 명시적으로 import** | 패키지 자동 주입은 JS 실행 이후라 FOUC가 발생한다. `<link>`/CSS import는 첫 페인트 전에 로드된다 |
| 토큰 이름 | `globals.css` 이름 그대로, 접두사 없음 | `dashboard-shell` 25개 파일이 이미 이 이름을 직접 참조한다. 대신 Tailwind 색 유틸 브리지는 포기한다(사용처 2곳) |
| React 지원 | `@lit/react` 래퍼 단일 경로 (18·19 공통) | React 19도 `onXxx` 커스텀 이벤트를 자동 연결하지 않는다. Native JSX 경로는 만들지 않는다 |
| 로컬 데모 | UMD 번들 + `file://` | `index.html` 더블 클릭만으로 실행된다. 로컬 서버 불필요 |
| 배포 | 로컬 릴리스 스크립트, dist는 태그에만 | `main`은 소스만 유지해 커밋 로그가 깨끗하다. CI 권한·시크릿 설정이 필요 없다 |
| 상태 소유 | 컴포넌트는 자기 상태를 바꾸지 않는다 | React state와의 desync를 원천 차단한다 (§6) |

### 만들지 않는 것

- **Storybook 라이브러리** — 직접 작성한 `index.html` 하나로 대체한다
- **`src/types/jsx.d.ts`(Native JSX 타입 전역 확장)** — React 19 타입에서 `declare global { namespace JSX }`가 동작하지 않고, 18과 19를 한 파일로 만족시키기 어렵다. 래퍼로 통일하므로 필요 없다
- **디자인 토큰 별도 패키지** — 같은 패키지의 `./tokens.css` 서브패스로 충분하다
- **다크모드 구현** — 토큰 구조상 `[data-theme="dark"]` 블록만 채우면 되도록 열어두되, 이번 범위 밖
- **GitHub Actions** — 필요해지면 나중에 추가한다
- **사이드바의 loading / error / empty 상태** — 기존 `Sidebar.tsx`는 섹션마다 스켈레톤·재시도 버튼·빈 상태 문구를 직접 그렸다. 새 구조에서는 `ns-nav-group`이 slot을 받으므로 소비자가 그 자리에 자기 로딩·에러 UI를 넣는다. 컴포넌트가 데이터 상태를 알 필요가 없어지고, 프로젝트마다 다른 에러 처리를 강요하지 않는다

## 3. 저장소 구조

```text
common-ui/
├── src/
│   ├── tokens/
│   │   └── tokens.css              # 손으로 쓴 정적 파일. 진실의 원천
│   ├── components/
│   │   ├── header/
│   │   │   ├── ns-header.ts
│   │   │   └── ns-header.styles.ts
│   │   ├── sidebar/
│   │   ├── nav-group/
│   │   └── nav-item/
│   ├── internal/
│   │   ├── register.ts             # SSR 안전 customElements.define
│   │   └── warn-missing-tokens.ts  # tokens.css 미로드 시 콘솔 경고
│   ├── types.ts                    # 이벤트 detail 타입
│   ├── index.ts                    # 전체 등록 진입점
│   └── react/
│       └── index.ts                # @lit/react 래퍼
├── scripts/
│   ├── copy-tokens.mjs
│   ├── check-events.mjs            # 이벤트 ↔ 래퍼 매핑 검사
│   └── release.mjs
├── index.html                      # 문서 겸 플레이그라운드
├── vite.config.ts
├── tsconfig.json
├── tsconfig.build.json
└── package.json

dist/                               # main에는 없음(gitignore). 릴리스 태그에만 존재
├── index.js                        # ES. 번들러용
├── react.js                        # ES. 'use client' 배너 포함
├── bundle.umd.js                   # UMD. lit 인라인. file:// 및 script 태그용
├── tokens.css
└── **/*.d.ts                       # tsc가 src 트리를 유지해 방출
```

## 4. 디자인 토큰

### 4.1 원칙

토큰은 **문서(`:root`)에 산다.** 컴포넌트 shadow 안에 정의하면 안 된다 — `:host` 선언이 상속을 이겨서 소비자의 `:root` 오버라이드가 죽고, `[data-theme="dark"]` 전환도 불가능해진다(`:host-context()`는 Chromium 전용).

컴포넌트는 이름만 참조한다. `tokens.css`를 import하지 않는다.

```ts
css`.row { border-color: var(--color-line); }`   // 폴백 없이 이름만
```

폴백을 넣지 않는 이유는 hex 값이 `tokens.css`와 컴포넌트 스타일 두 곳에 존재하게 되어 어긋나기 때문이다. 대신 미로드를 **경고로** 잡는다(§4.4).

### 4.2 이름 체계

`dashboard-shell/app/globals.css`에 정의된 토큰 **전체를 이름 그대로** 승계한다. **접두사를 붙이지 않고 이름도 바꾸지 않는다.** 이번 네 컴포넌트가 쓰지 않는 토큰(`--color-warn`, `--color-success`, `--elevation-card` 등)도 함께 옮긴다. 토큰은 컴포넌트 목록이 아니라 디자인 시스템 전체의 어휘다.

| 그룹 | 토큰 |
|---|---|
| 표면·전경·경계 | `--color-surface`, `-surface-sunken`, `-surface-hover`, `--color-line`, `-line-strong`, `--color-overlay`, `--color-fg`, `-fg-body`, `-fg-muted`, `-fg-subtle` |
| 액센트 | `--color-accent`, `-accent-hover`, `-accent-fg`, `--color-disabled` |
| 상태 | `--color-danger`, `-danger-surface`, `--color-warn`, `-warn-surface`, `--color-success`, `-success-surface` |
| 간격 | `--space-1`, `-1-5`, `-2`, `-2-5`, `-3`, `-4`, `-5`, `-6`, `-8` |
| 반경 | `--radius-badge`, `-control`, `-panel`, `-card`, `-pill` |
| 타이포 | `--font-size-2xs` … `-xl`, 짝이 되는 `--line-height-*`, `--weight-medium`, `-semibold` |
| 레이아웃 | `--header-height`, `--sidebar-width`, `--sidebar-width-collapsed`, `--page-padding-x`, `-y`, `--card-padding`, `--control-height-sm`, `-md` |
| 기타 | `--elevation-card`, `--transition-fast`, `--transition-ease` |

**접두사를 붙이지 않는 이유는 실측 결과다.** `dashboard-shell`은 25개 파일에서 `var(--space-3)`, `var(--color-line)` 같은 형태로 이 토큰을 직접 참조한다. 접두사를 붙이면 그 25개를 전부 고쳐야 하고, 이후 두 이름 체계가 영구히 공존한다. 이름을 그대로 두면 그 파일들은 손댈 필요가 없다.

기존 이름은 이미 Tailwind 네임스페이스를 피해 지어져 있어서(`--text-*` 대신 `--font-size-*`, `--font-weight-*` 대신 `--weight-*`, `--spacing` 대신 `--space-*`) Tailwind를 쓰는 프로젝트에 import해도 유틸리티 값이 바뀌지 않는다. `--color-*`는 Tailwind 기본 팔레트에 없는 이름들(`surface`, `line`, `fg`, `accent`, `danger` …)이라 역시 충돌하지 않는다.

`--sidebar-width-collapsed`도 이름을 유지한다. 기존 값이 이미 `4rem` 레일이라 "접었을 때 좌측에 작은 사이드바가 남는다"는 요구사항을 그대로 만족한다.

폰트 크기는 반드시 `--line-height-*` 짝과 함께 옮긴다. 짝 없이 크기만 재정의하면 줄간격이 조용히 틀어진다.

**패키지 내부용 커스텀 프로퍼티는 구별되게 `--ns-` 접두사를 쓴다.** 예: `--ns-label-display`(§5.2). 이것들은 공유 어휘가 아니라 컴포넌트 사이의 사적인 배선이고, 소비자가 건드릴 대상이 아니다.

### 4.3 값

기존 토큰은 Tailwind v4 `@theme static` 안에서 `--color-zinc-*`를 참조한다. **순수 HTML에는 Tailwind가 없으므로 그대로 쓸 수 없다.** 구현 시 `dashboard-shell`을 실행해 `getComputedStyle`로 실제 계산값을 추출하고, 그 값을 `tokens.css`에 고정한다. Tailwind v4 기본 팔레트는 oklch이므로 v3 시절 hex를 추측해 적지 않는다.

`tokens.css`는 Tailwind에 의존하지 않는 평범한 `:root` 블록 하나다.

### 4.4 레이아웃 예약과 경고

커스텀 엘리먼트는 정의 전까지 `display: inline`에 크기가 0이다. SSR HTML에는 셸이 없으므로 JS 로드 시점에 화면이 튄다. light DOM 선택자로 미리 자리를 잡는다.

```css
/* tokens.css 하단 */
ns-header  { display: block; height: var(--header-height); }
ns-sidebar { display: block; width: var(--sidebar-width); }
ns-sidebar:not([open]) { width: var(--sidebar-width-collapsed); }
```

토큰 미로드는 조용히 실패하지 않게 한다. 첫 컴포넌트가 붙을 때 한 번만 검사한다.

```ts
// src/internal/warn-missing-tokens.ts — 페이지당 1회
let settled = false;
const tokensPresent = () =>
  getComputedStyle(document.documentElement).getPropertyValue("--color-line").trim() !== "";

export function warnIfTokensMissing() {
  if (settled) return;
  if (typeof document === "undefined" || typeof getComputedStyle === "undefined") return;

  if (tokensPresent()) { settled = true; return; }   // 정상 경로는 여기서 끝난다

  // 안 보인다고 없는 것은 아니다. tokens.css 는 JS 와 별도로 로드되므로
  // 첫 컴포넌트 연결 시점에 아직 적용 전일 수 있다. 여기서 바로 경고하면
  // 정상 페이지에 취소할 수 없는 거짓 경고가 남는다.
  settled = true;
  const confirm = () => {
    if (tokensPresent()) return;
    console.warn(
      '[@neosimplix/common-ui] tokens.css 가 로드되지 않아 레이아웃이 깨집니다.\n' +
      '  Next/React:  import "@neosimplix/common-ui/tokens.css";\n' +
      '  HTML:        <link rel="stylesheet" href="…/dist/tokens.css">'
    );
  };
  if (document.readyState === "complete") confirm();
  else window.addEventListener("load", confirm, { once: true });
}
```

플래그를 프로브 전에 세우면 안 된다. 가장 먼저 연결되는 컴포넌트 하나의 판정이 영구 확정되어, 스타일시트가 늦게 적용된 정상 페이지에 되돌릴 수 없는 거짓 경고가 남는다. 반대로 매번 검사하면 nav item 수십 개마다 강제 리플로가 일어난다.

### 4.5 `dashboard-shell`의 토큰 이관

`dashboard-shell`은 토큰의 정의자에서 소비자가 된다. 값을 두 번 적지 않는다.

```css
/* app/globals.css — 이후 */
@import "tailwindcss";
@import "@neosimplix/common-ui/tokens.css";   /* ← 진실의 원천 */
@source not "../docs";

/* @theme static 블록과 :root 토큰 블록을 삭제한다.
   토큰 이름이 동일하므로 var(--space-3) 을 쓰던 25개 파일은 그대로 동작한다. */

html, body { margin: 0; padding: 0; width: 100%; height: 100%; }
```

**Tailwind 커스텀 색 유틸리티는 포기한다.** `@theme static`에 `--color-surface: var(--color-surface)`를 쓰면 자기 참조라 값이 무효가 되므로 브리지가 성립하지 않는다. 실제 사용처는 두 곳뿐이라 직접 값을 쓰도록 고친다.

| 파일 | 현재 | 변경 |
|---|---|---|
| `app/(shell)/layout.tsx:160` | `bg-surface-sunken` | `style={{ background: "var(--color-surface-sunken)" }}` 또는 CSS 모듈로 |
| `app/(shell)/projects/apply/MyRequestTable.tsx:39` | `text-fg-subtle` | 동일한 방식 |

Tailwind 자체는 계속 쓴다. `border-zinc-200` 같은 기본 팔레트 유틸리티는 영향이 없다.

## 5. 컴포넌트 명세

### 5.1 `ns-header`

| 프로퍼티 | 속성 | 타입 | 기본값 | 설명 |
|---|---|---|---|---|
| `projectName` | `project-name` | string | `""` | 좌측 토글 버튼 옆 제목 |
| `sidebarOpen` | `sidebar-open` | boolean (reflect) | `false` | 토글 버튼의 `aria-expanded`와 아이콘 상태 |

| slot | 위치 |
|---|---|
| `actions` | 우측 끝. 사용자 메뉴·로그아웃 등 소비자가 원하는 것 전부 |

| 이벤트 | detail | 발생 시점 |
|---|---|---|
| `ns-toggle` | `{ open: boolean }` | 토글 버튼 클릭. `open`은 **요청되는 다음 상태**(`!sidebarOpen`) |

토글 버튼은 shadow 안에 인라인 SVG로 그린다. `aria-label`은 상태에 따라 "사이드바 열기"/"사이드바 닫기"로 바뀐다.

### 5.2 `ns-sidebar`

| 프로퍼티 | 속성 | 타입 | 기본값 | 설명 |
|---|---|---|---|---|
| `open` | `open` | boolean (reflect) | `false` | 펼침 여부. 접히면 레일(`--sidebar-width-collapsed`, 4rem)만 남는다 |

| slot | 내용 |
|---|---|
| (기본) | `ns-nav-group` 목록 |

이벤트를 자체 발생시키지 않는다. 하위 `ns-nav-item`의 `ns-navigate`가 `composed: true`로 통과해 올라간다.

**`active-href` 프로퍼티를 두지 않는다.** 사이드바가 slot된 자식의 `active`를 대신 설정하면 React가 같은 프로퍼티를 다시 내려보내며 충돌한다. 활성 여부는 각 `ns-nav-item`이 소비자에게서 직접 받는다.

접힘 상태를 하위에 전파하는 방법은 `::slotted()`로 커스텀 프로퍼티를 내려주는 것이다. `:host-context()`(Chromium 전용)를 쓰지 않는다.

```css
/* ns-sidebar shadow */
::slotted(ns-nav-group) { --ns-label-display: block; }
:host(:not([open])) ::slotted(ns-nav-group) { --ns-label-display: none; }
```

커스텀 프로퍼티는 상속되므로 `ns-nav-group`의 shadow와 그 아래 `ns-nav-item`까지 자동으로 도달한다.

### 5.3 `ns-nav-group`

| 프로퍼티 | 속성 | 타입 | 기본값 |
|---|---|---|---|
| `heading` | `heading` | string | `""` |

| slot | 내용 |
|---|---|
| (기본) | `ns-nav-item` 목록 |

제목은 접힘 상태에서 숨는다 — `.heading { display: var(--ns-label-display, block); }`. 접근성을 위해 shadow 루트는 `role="group"`에 `aria-label`로 `heading`을 준다(시각적으로 숨어도 스크린리더에는 남는다).

### 5.4 `ns-nav-item`

| 프로퍼티 | 속성 | 타입 | 기본값 | 설명 |
|---|---|---|---|---|
| `href` | `href` | string | `""` | 라우팅 키. 이벤트에 그대로 실린다 |
| `label` | `label` | string | `""` | 펼침 상태에서 보이는 라벨. 한 줄 말줄임 |
| `badge` | `badge` | string | `""` | 접힌 레일에서 보이는 두 글자 배지 |
| `active` | `active` | boolean (reflect) | `false` | 소비자가 내려준다 |

| slot | 위치 |
|---|---|
| `trailing` | 행의 우측 끝. 배지·카운트 등 소비자 정의 |

| 이벤트 | detail |
|---|---|
| `ns-navigate` | `{ href: string, label: string }` |

**실제 `<a href>`를 렌더한다.** 수식키 클릭(⌘/Ctrl/Shift/Alt)과 가운데 클릭은 브라우저에 넘겨 새 탭 열기가 동작하게 하고, 평범한 좌클릭만 가로채 이벤트를 올린다.

```ts
#onClick = (e: MouseEvent) => {
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  this.dispatchEvent(new CustomEvent("ns-navigate", {
    detail: { href: this.href, label: this.label },
    bubbles: true, composed: true,
  }));
};
```

`label`과 `trailing` slot은 `--ns-label-display`를 따라 접힘 상태에서 숨는다. 배지는 항상 보인다.

## 6. 상태와 이벤트 규칙

**컴포넌트는 자기 상태를 절대 바꾸지 않는다.** 이벤트만 올리고, 상태는 항상 소비자가 내려준다.

토글 버튼을 눌렀을 때 `ns-header`가 자기 `sidebarOpen`을 스스로 뒤집으면, React는 그걸 모르고 다음 렌더에서 예전 값을 다시 내려보낸다. 화면이 튀거나 클릭이 한 번 씹힌다. 순수 HTML 사용자도 동일하게 `el.sidebarOpen = !el.sidebarOpen`을 직접 쓴다.

모든 커스텀 이벤트는 `bubbles: true, composed: true`다. `composed`가 없으면 shadow 경계를 넘지 못해 소비자에게 도달하지 않는다.

이벤트 이름은 `ns-` 접두사에 케밥 케이스다. 대응하는 React prop은 `on` + 파스칼 케이스다(`ns-navigate` → `onNsNavigate`).

## 7. SSR 안전 등록

`@customElement` 데코레이터는 모듈 평가 시점에 `customElements.define`을 호출한다. 서버에서 터진다. 수동 등록 헬퍼를 쓴다.

```ts
// src/internal/register.ts
export function register(tag: string, ctor: CustomElementConstructor) {
  if (typeof window === "undefined" || !("customElements" in window)) return;
  if (customElements.get(tag)) return;   // HMR·중복 import 시 재정의 에러 방지
  customElements.define(tag, ctor);
}
```

`@property` 데코레이터는 그대로 쓴다. `define`을 호출하지 않으므로 안전하다.

## 8. React 래퍼

```ts
// src/react/index.ts
import * as React from "react";
import { createComponent, type EventName } from "@lit/react";
import { NsNavItem as NsNavItemElement } from "../components/nav-item/ns-nav-item.js";
import type { NsNavigateDetail } from "../types.js";

export const NsNavItem = createComponent({
  react: React,
  tagName: "ns-nav-item",
  elementClass: NsNavItemElement,
  events: {
    // EventName<> 브랜딩이 없으면 핸들러가 (e: Event) => void 로 타입된다.
    onNsNavigate: "ns-navigate" as EventName<CustomEvent<NsNavigateDetail>>,
  },
});
```

**`EventName<>` 캐스트를 빼면 안 된다.** `@lit/react` 는 `events` 값이 `EventName<T>` 로 브랜딩된 경우에만 핸들러를 `(e: T) => void` 로 타입한다. 평범한 문자열이면 `(e: Event) => void` 가 되어 소비자의 `e.detail` 이 컴파일 에러가 난다. 라이브러리 자체의 `tsc` 는 이걸 잡지 못한다 — 그 안에서는 값이 그냥 문자열이기 때문이다. 소비자 쪽에서만 드러난다.

프로퍼티 타입은 Lit 클래스에서 자동으로 따라온다. **이벤트 매핑 테이블만 손으로 유지한다.** 어긋남을 막기 위해 릴리스 전 `scripts/check-events.mjs`가 `src/components/**`의 모든 `new CustomEvent("…")` 이름을 뽑아 `src/react/index.ts`의 `events` 값과 대조하고, 빠진 게 있으면 실패한다.

`react`/`react-dom`은 optional peerDependency다. `@lit/react`는 **일반 dependency**다 — 소비자가 알아야 할 구현 세부사항이 아니고, optional peer로 두면 아무도 설치하지 않아 import 시점에 모듈을 찾지 못한다. npm은 미충족 peer에만 경고하고 일반 dependency에는 경고하지 않으므로 바닐라 사용자에게 경고가 뜨지 않는다.

React가 중복 로드될 걱정은 없다. `react`를 `dependencies`에 넣지 않고, dist를 커밋하는 방식이라 설치 시 devDependencies가 아예 설치되지 않는다.

## 9. 빌드

### 9.1 tsconfig

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "noEmit": true
  },
  "include": ["src"]
}
```

`experimentalDecorators`와 `useDefineForClassFields: false`가 **둘 다** 필요하다. 없으면 클래스 필드 선언이 `@property`가 만든 접근자를 덮어써서, 속성이 바뀌어도 리렌더가 일어나지 않는다. 에러 없이 화면만 갱신되지 않는 함정이다.

```json
// tsconfig.build.json — 선언 전용
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "emitDeclarationOnly": true,
    "declaration": true,
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"]
}
```

`tsc`를 옵션 없이 돌리면 `.d.ts`가 아예 안 나오거나(`noEmit`) Vite 산출물 위에 `.js`를 덮어쓴다. 반드시 `--emitDeclarationOnly`로 분리한다.

### 9.2 vite.config.ts

빌드는 세 번 돈다. `react.js`에 `'use client'` 배너를 붙이려면 별도 설정이 필요하기 때문이다.

```ts
import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

// package.json 이 "type": "module" 이므로 __dirname 이 없다. import.meta 로 만든다.
const here = path.dirname(fileURLToPath(import.meta.url));
const r = (p: string) => path.resolve(here, p);

export default defineConfig([
  // 1. ES — 번들러용 웹 컴포넌트
  {
    build: {
      lib: { entry: r("src/index.ts"), formats: ["es"], fileName: () => "index.js" },
      rollupOptions: { external: ["lit"] },
    },
  },
  // 2. ES — React 래퍼
  {
    build: {
      emptyOutDir: false,
      lib: { entry: r("src/react/index.ts"), formats: ["es"], fileName: () => "react.js" },
      rollupOptions: {
        external: ["react", "react-dom", "lit", "@lit/react"],
        output: { banner: "'use client';" },
      },
    },
  },
  // 3. UMD — file:// 로컬 실행용. lit을 인라인한다
  {
    build: {
      emptyOutDir: false,
      lib: { entry: r("src/index.ts"), name: "NsCommonUi", formats: ["umd"], fileName: () => "bundle.umd.js" },
    },
  },
]);
```

Rollup은 모듈 최상단 디렉티브를 제거한다. 소스에 `'use client'`를 써도 번들에 남지 않으므로 배너로 다시 주입해야 한다. 없으면 Next의 Server Component가 이 패키지를 import할 때 에러가 난다.

**`tokens.css`는 Vite에 태우지 않는다.** `build.lib.entry`는 JS 진입점을 받는다. CSS를 넣으면 내용이 빈 `tokens.js`가 함께 생기고 CSS 출력 파일명이 Vite 버전에 따라 달라진다. 변환할 것이 없는 정적 파일이므로 복사한다.

```js
// scripts/copy-tokens.mjs
import { copyFileSync, mkdirSync } from "node:fs";
mkdirSync("dist", { recursive: true });
copyFileSync("src/tokens/tokens.css", "dist/tokens.css");
```

### 9.3 package.json

```json
{
  "name": "@neosimplix/common-ui",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".":            { "types": "./dist/index.d.ts",       "import": "./dist/index.js" },
    "./react":      { "types": "./dist/react/index.d.ts", "import": "./dist/react.js" },
    "./tokens.css": "./dist/tokens.css",
    "./umd":        "./dist/bundle.umd.js"
  },
  "files": ["dist"],
  "scripts": {
    "build": "vite build && tsc -p tsconfig.build.json && node scripts/copy-tokens.mjs",
    "check": "tsc -p tsconfig.json && node scripts/check-events.mjs",
    "release": "node scripts/release.mjs"
  },
  "dependencies": { "lit": "^3.0.0", "@lit/react": "^1.0.0" },
  "peerDependencies": { "react": "^18.0.0 || ^19.0.0", "react-dom": "^18.0.0 || ^19.0.0" },
  "peerDependenciesMeta": { "react": { "optional": true }, "react-dom": { "optional": true } }
}
```

`sideEffects` 필드는 넣지 않는다. `dist/index.js`가 `customElements.define`을 실행하므로 tree-shaking되면 안 된다.

`.d.ts`는 `src` 트리를 유지해 방출되지만 `.js`는 번들되어 평탄하다. TypeScript는 `./components/nav-item/ns-nav-item.js`를 `.d.ts`로 해석하므로 문제없다.

## 10. 배포와 소비

### 10.1 릴리스

`main`은 소스만 유지한다(`dist/`는 gitignore). 태그가 가리킬 커밋을 새로 만든다.

```
npm run release -- 0.1.0
  → npm run check && npm run build
  → git checkout --detach
  → git add -f dist && git commit -m "release: v0.1.0"
  → git tag v0.1.0
  → git push origin v0.1.0        # 태그만 푸시. main 히스토리는 그대로
  → git checkout -
```

`package.json`의 `version`도 함께 올린다. 스크립트는 작업 트리가 깨끗한지 먼저 확인하고, 아니면 중단한다.

### 10.2 소비자 설치

```json
"dependencies": {
  "@neosimplix/common-ui": "git+ssh://git@github.com/neosimplix/common-ui.git#v0.1.0"
}
```

업그레이드는 태그 번호 한 곳을 바꾸는 것이다.

### 10.3 사용 예시

**Next.js (App Router)**

```tsx
// app/layout.tsx
import "@neosimplix/common-ui/tokens.css";

// app/shell.tsx — "use client"
import { NsHeader, NsSidebar, NsNavGroup, NsNavItem } from "@neosimplix/common-ui/react";

const [open, setOpen] = useState(true);
const pathname = usePathname();
const router = useRouter();

<NsHeader projectName="대시보드" sidebarOpen={open} onNsToggle={(e) => setOpen(e.detail.open)}>
  <div slot="actions"><UserMenu /><SignOutButton /></div>
</NsHeader>

<NsSidebar open={open} onNsNavigate={(e) => router.push(e.detail.href)}>
  <NsNavGroup heading="프로젝트">
    <NsNavItem href="/a" label="프로젝트 A" badge="PA" active={pathname === "/a"}>
      <span slot="trailing">3</span>
    </NsNavItem>
  </NsNavGroup>
</NsSidebar>
```

**React 18 (Vite 등)** — 동일한 코드다. 래퍼가 차이를 흡수한다.

**순수 HTML** — 빌드 도구 0개.

```html
<link rel="stylesheet" href="./node_modules/@neosimplix/common-ui/dist/tokens.css">
<script src="./node_modules/@neosimplix/common-ui/dist/bundle.umd.js"></script>

<ns-header project-name="대시보드" sidebar-open>
  <button slot="actions">로그아웃</button>
</ns-header>
<ns-sidebar open>
  <ns-nav-group heading="프로젝트">
    <ns-nav-item href="/a" label="프로젝트 A" badge="PA" active>
      <span slot="trailing">3</span>
    </ns-nav-item>
  </ns-nav-group>
</ns-sidebar>

<script>
  const header = document.querySelector("ns-header");
  const sidebar = document.querySelector("ns-sidebar");
  header.addEventListener("ns-toggle", (e) => {
    header.sidebarOpen = e.detail.open;
    sidebar.open = e.detail.open;
  });
  sidebar.addEventListener("ns-navigate", (e) => { location.href = e.detail.href; });
</script>
```

UMD는 **`type` 없는 클래식 script 태그**로 불러야 한다. `file://`에서 `<script type="module">`은 CORS로 막힌다.

## 11. 문서 페이지 (`index.html`)

저장소 루트의 단일 HTML 파일이다. 빌드 도구도 로컬 서버도 없이 더블 클릭으로 열린다. `dist/bundle.umd.js`를 클래식 script로, `dist/tokens.css`를 `<link>`로 로드한다.

Storybook 라이브러리를 쓰지 않는다. 이 파일은 사람이 읽고, 나중에 AI가 읽고 개발하는 데 쓴다.

### 11.1 문서 셸이 곧 데모다

**문서 페이지의 헤더와 좌측 네비게이션을 우리 컴포넌트로 만든다.** 별도 CSS 프레임워크를 쓰지 않는다.

```html
<ns-header project-name="common-ui" sidebar-open></ns-header>
<div class="body">
  <ns-sidebar open id="docs-nav">
    <ns-nav-group heading="시작하기">
      <ns-nav-item href="#install" label="설치" badge="설치" active></ns-nav-item>
      <ns-nav-item href="#usage"   label="환경별 연동" badge="연동"></ns-nav-item>
    </ns-nav-group>
    <ns-nav-group heading="기초">
      <ns-nav-item href="#tokens" label="디자인 토큰" badge="토큰"></ns-nav-item>
    </ns-nav-group>
    <ns-nav-group heading="컴포넌트">
      <ns-nav-item href="#ns-header"    label="ns-header"    badge="HD"></ns-nav-item>
      <ns-nav-item href="#ns-sidebar"   label="ns-sidebar"   badge="SB"></ns-nav-item>
      <ns-nav-item href="#ns-nav-group" label="ns-nav-group" badge="NG"></ns-nav-item>
      <ns-nav-item href="#ns-nav-item"  label="ns-nav-item"  badge="NI"></ns-nav-item>
    </ns-nav-group>
    <ns-nav-group heading="예시">
      <ns-nav-item href="#full" label="전체 셸 조합" badge="셸"></ns-nav-item>
    </ns-nav-group>
  </ns-sidebar>
  <main>…</main>
</div>
```

이 구조 자체가 회귀 확인 수단이다. 접힘·이벤트·slot·`active`가 깨지면 문서가 즉시 못 쓰게 되어 바로 드러난다.

동작 배선은 소비자가 쓰는 방식과 동일하다 — 컴포넌트는 상태를 바꾸지 않고 문서 페이지가 내려준다.

```js
const header = document.querySelector("ns-header");
const nav = document.getElementById("docs-nav");

header.addEventListener("ns-toggle", (e) => {
  header.sidebarOpen = e.detail.open;
  nav.open = e.detail.open;
});

// ★ document 가 아니라 셸 사이드바에 붙인다 (11.2 참고)
nav.addEventListener("ns-navigate", (e) => {
  document.querySelector(e.detail.href)?.scrollIntoView({ behavior: "smooth" });
  history.replaceState(null, "", e.detail.href);
});
```

스크롤에 따라 `active`를 옮기는 것은 `IntersectionObserver` 한 개로 처리한다. 이것도 `active` 프로퍼티의 데모가 된다.

### 11.2 자기 참조 구조에서 걸리는 세 가지

**① 데모 안의 이벤트가 문서 셸을 움직인다**

`ns-navigate`는 `bubbles: true, composed: true`라 데모 사이드바에서 발생한 이벤트도 `document`까지 올라온다. 셸 리스너를 `document`에 붙이면 데모를 클릭할 때마다 문서가 스크롤된다.

→ 셸 리스너는 **셸의 `ns-sidebar` 엘리먼트에** 붙인다. 각 데모도 자기 컨테이너에 붙인다. 이벤트가 버블링된다는 성질 자체가 이 격리를 만들어준다.

**② 데모 사이드바가 페이지 높이를 다 먹는다**

`tokens.css`의 `ns-sidebar { width: var(--sidebar-width) }`는 전역 element 선택자라 데모에도 적용된다. 이건 의도한 것이다. 다만 높이는 제한해야 한다.

→ 데모는 고정 높이 프레임(`.demo { height: 320px; overflow: hidden; border: 1px solid var(--color-line) }`) 안에 넣는다.

**③ 예시 코드와 실제 데모가 어긋난다**

코드 블록을 손으로 적으면 데모를 고칠 때 코드가 따라오지 않는다. `shared-ui`에서 문서가 신뢰를 잃은 방식이다.

→ HTML 예시는 **`<template>` 하나를 원본으로 삼는다.** 작은 헬퍼가 그것을 복제해 데모를 만들고, 같은 `innerHTML`을 들여쓰기만 정리해 `<pre>`에 넣는다. 이스케이프를 손으로 할 필요도 없어진다.

```js
// 한 곳에서 정의하고 두 곳에 쓴다
for (const tpl of document.querySelectorAll("template.ex")) {
  const frame = tpl.nextElementSibling;              // <div class="demo">
  frame.append(tpl.content.cloneNode(true));
  frame.nextElementSibling.textContent =             // <pre>
    dedent(tpl.innerHTML);
}
```

React·Next 예시는 실행하지 않으므로 `<script type="text/plain">`에 원문 그대로 담고 `<pre>`로 옮긴다. 브라우저가 파싱하지 않아 이스케이프가 필요 없다.

### 11.3 섹션 구성

| # | 섹션 | 내용 |
|---|---|---|
| 1 | 설치 | git 의존성 한 줄, 태그로 버전 올리는 법, `dist`가 태그에만 있다는 설명 |
| 2 | 환경별 연동 | Next(App Router) / React 18 / 순수 HTML 각각의 최소 동작 코드. `tokens.css` import가 필수라는 점 명시 |
| 3 | 디자인 토큰 | 전체 목록을 그룹별 표로. 각 색은 실제 색 견본을 함께 표시. `:root` 재정의로 덮는 방법 |
| 4~7 | 컴포넌트별 | `ns-header` → `ns-sidebar` → `ns-nav-group` → `ns-nav-item` |
| 8 | 전체 셸 조합 | 헤더 + 사이드바 + 그룹 + 아이템이 실제로 접히고 펴지고 라우팅 이벤트를 올리는 데모 |

컴포넌트 섹션은 넷 다 동일한 순서를 따른다.

1. 한 줄 설명과 라이브 데모
2. **프로퍼티** 표 — 프로퍼티명 / 속성명 / 타입 / 기본값 / 설명
3. **slot** 표 — 이름 / 위치 / 용도
4. **이벤트** 표 — 이름 / `detail` 형태 / 발생 시점
5. **사용 예시** — HTML과 React를 위아래로 나란히. 탭을 만들지 않는다(JS와 상태가 늘어난다)
6. 주의사항 — 해당되는 경우만. 예: `ns-header`의 `sidebarOpen`은 컴포넌트가 스스로 바꾸지 않으므로 소비자가 이벤트를 받아 되돌려줘야 한다

### 11.4 dist 누락 감지

`dist`가 없으면 셸부터 그려지지 않아 빈 화면이 된다. `shared-ui`에서 겪은 함정이므로 원인을 화면에 띄운다.

```html
<script>
  if (!customElements.get("ns-header")) {
    document.body.insertAdjacentHTML("afterbegin",
      '<p style="background:#fee;color:#900;padding:12px;margin:0">' +
      'dist 가 없습니다. 먼저 <code>npm run build</code> 를 실행하세요.</p>');
  }
</script>
```

## 12. 검증

무거운 검증 하네스를 만들지 않는다. `shared-ui`의 실패 원인이었다. 다음 넷만 유지한다.

1. **`npm run check`** — `tsc` 타입 검사 + 이벤트 매핑 검사(§8)
2. **`index.html` 육안 확인** — 라이브 데모가 회귀 확인 수단이다. 문서 셸 자체가 우리 컴포넌트로 만들어져 있어서(§11.1) 헤더·사이드바·접힘·이벤트가 깨지면 문서가 열리지 않는 것으로 즉시 드러난다. 컴포넌트를 추가하면 여기에도 추가한다
3. **콜드 설치 검증** — 릴리스 후 빈 디렉터리에서 실제로 태그를 설치하고 확인한다. `files: ["dist"]`와 gitignore된 `dist`가 얽히는 지점이라 실측이 필요하다

   ```sh
   npm i git+ssh://git@github.com/neosimplix/common-ui.git#v0.1.0
   ls node_modules/@neosimplix/common-ui/dist   # index.js react.js bundle.umd.js tokens.css *.d.ts
   node -e "import('@neosimplix/common-ui').then(() => console.log('ok'))"
   ```

4. **`dashboard-shell` 실연동** — 첫 릴리스 후 다음을 수행해 실제 앱에서 동작을 확인한다. `shared-ui`는 데모에서는 되고 실제 앱에서 안 되는 문제가 있었다

   - `globals.css`의 `@theme static`·`:root` 토큰 블록 삭제, `tokens.css` import로 교체 (§4.5)
   - Tailwind 커스텀 색 유틸 2곳 수정
   - `Header.tsx`/`Sidebar.tsx`를 `NsHeader`/`NsSidebar`로 교체
   - `var(--space-*)` 등을 쓰는 25개 파일이 **수정 없이** 그대로 동작하는지 확인 — 이름을 유지한 이유가 여기다

## 13. 확인이 필요한 항목

- **저장소 URL** — 이 문서는 `git+ssh://git@github.com/neosimplix/common-ui.git`을 가정한다. 실제 호스트와 조직명 확인 필요
- **토큰 실제 값** — §4.3에 따라 `dashboard-shell`에서 계산값을 추출해 고정
