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
css`.row { border-color: var(--ns-color-line); }`   // 폴백 없이 이름만
```

폴백을 넣지 않는 이유는 hex 값이 `tokens.css`와 컴포넌트 스타일 두 곳에 존재하게 되어 어긋나기 때문이다. 대신 미로드를 **경고로** 잡는다(§4.4).

### 4.2 이름 체계

`dashboard-shell/app/globals.css`에 정의된 토큰 **전체**를 그대로 승계하고 `--ns-` 접두사만 붙인다. 새 이름을 만들지 않는다 — 두 체계가 공존하면 어느 쪽이 진실인지 알 수 없게 된다. 이번 네 컴포넌트가 쓰지 않는 토큰(`--ns-color-warn`, `--ns-color-success`, `--ns-elevation-card` 등)도 함께 옮긴다. 토큰은 컴포넌트 목록이 아니라 디자인 시스템 전체의 어휘다.

승계 대상 그룹:

| 그룹 | 토큰 |
|---|---|
| 표면·전경·경계 | `--ns-color-surface`, `-surface-sunken`, `-surface-hover`, `--ns-color-line`, `-line-strong`, `--ns-color-overlay`, `--ns-color-fg`, `-fg-body`, `-fg-muted`, `-fg-subtle` |
| 액센트 | `--ns-color-accent`, `-accent-hover`, `-accent-fg`, `--ns-color-disabled` |
| 상태 | `--ns-color-danger`, `-danger-surface`, `--ns-color-warn`, `-warn-surface`, `--ns-color-success`, `-success-surface` |
| 간격 | `--ns-space-1`, `-1-5`, `-2`, `-2-5`, `-3`, `-4`, `-5`, `-6`, `-8` |
| 반경 | `--ns-radius-badge`, `-control`, `-panel`, `-card`, `-pill` |
| 타이포 | `--ns-font-size-2xs` … `-xl`, 짝이 되는 `--ns-line-height-*`, `--ns-weight-medium`, `-semibold` |
| 레이아웃 | `--ns-header-height`, `--ns-sidebar-width`, `--ns-sidebar-width-rail`, `--ns-page-padding-x`, `-y`, `--ns-card-padding`, `--ns-control-height-sm`, `-md` |
| 기타 | `--ns-elevation-card`, `--ns-transition-fast`, `--ns-transition-ease` |

`--sidebar-width-collapsed`만 `--ns-sidebar-width-rail`로 이름을 바꾼다. 접었을 때 완전히 사라지지 않고 레일이 남는다는 동작을 이름이 드러내게 한다.

폰트 크기는 반드시 `--ns-line-height-*` 짝과 함께 옮긴다. 짝 없이 크기만 재정의하면 줄간격이 조용히 틀어진다.

### 4.3 값

기존 토큰은 Tailwind v4 `@theme static` 안에서 `--color-zinc-*`를 참조한다. **순수 HTML에는 Tailwind가 없으므로 그대로 쓸 수 없다.** 구현 시 `dashboard-shell`을 실행해 `getComputedStyle`로 실제 계산값을 추출하고, 그 값을 `tokens.css`에 고정한다. Tailwind v4 기본 팔레트는 oklch이므로 v3 시절 hex를 추측해 적지 않는다.

### 4.4 레이아웃 예약과 경고

커스텀 엘리먼트는 정의 전까지 `display: inline`에 크기가 0이다. SSR HTML에는 셸이 없으므로 JS 로드 시점에 화면이 튄다. light DOM 선택자로 미리 자리를 잡는다.

```css
/* tokens.css 하단 */
ns-header  { display: block; height: var(--ns-header-height); }
ns-sidebar { display: block; width: var(--ns-sidebar-width); }
ns-sidebar:not([open]) { width: var(--ns-sidebar-width-rail); }
```

토큰 미로드는 조용히 실패하지 않게 한다. 첫 컴포넌트가 붙을 때 한 번만 검사한다.

```ts
// src/internal/warn-missing-tokens.ts — 페이지당 1회
let warned = false;
export function warnIfTokensMissing() {
  if (warned || typeof getComputedStyle === "undefined") return;
  warned = true;
  if (getComputedStyle(document.documentElement).getPropertyValue("--ns-color-line").trim()) return;
  console.warn(
    '[@neosimplix/common-ui] tokens.css 가 로드되지 않아 레이아웃이 깨집니다.\n' +
    '  Next/React:  import "@neosimplix/common-ui/tokens.css";\n' +
    '  HTML:        <link rel="stylesheet" href="…/dist/tokens.css">'
  );
}
```

### 4.5 Tailwind 프로젝트 브리지

`dashboard-shell`은 토큰의 소비자가 된다. 값을 두 번 적지 않는다.

```css
@import "tailwindcss";
@import "@neosimplix/common-ui/tokens.css";

@theme static {
  --color-surface: var(--ns-color-surface);
  --color-line:    var(--ns-color-line);
  --color-fg:      var(--ns-color-fg);
  /* … */
}
```

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
| `open` | `open` | boolean (reflect) | `false` | 펼침 여부. 접히면 레일(`--ns-sidebar-width-rail`)만 남는다 |

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
import { createComponent } from "@lit/react";
import { NsNavItem as NsNavItemElement } from "../components/nav-item/ns-nav-item.js";

export const NsNavItem = createComponent({
  react: React,
  tagName: "ns-nav-item",
  elementClass: NsNavItemElement,
  events: { onNsNavigate: "ns-navigate" },
});
```

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

저장소 루트의 단일 HTML 파일이다. 빌드 도구도 로컬 서버도 없이 더블 클릭으로 열린다. `dist/bundle.umd.js`를 클래식 script로 로드한다.

Storybook 라이브러리를 쓰지 않는다. 이 파일은 사람이 읽고, 나중에 AI가 읽고 개발하는 데 쓴다.

구성 순서:

1. **설치** — git 의존성 한 줄, 그리고 Next / React 18 / 순수 HTML 각각의 최소 연동 코드
2. **디자인 토큰** — 전체 목록과 오버라이드 방법
3. **컴포넌트별 섹션** — 컴포넌트마다
   - 라이브 데모 (실제로 동작하는 것)
   - 프로퍼티 표 (이름 / 속성명 / 타입 / 기본값 / 설명)
   - slot 표
   - 이벤트 표 (이름 / detail 형태 / 발생 시점)
   - 사용 예시 코드 (HTML과 React 양쪽)
4. **조합 예시** — 헤더 + 사이드바 전체 셸이 실제로 접히고 펴지는 데모

`dist`가 없으면 빈 화면이 된다. `shared-ui`에서 겪은 함정이므로 원인을 화면에 띄운다.

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
2. **`index.html` 육안 확인** — 라이브 데모가 회귀 확인 수단이다. 컴포넌트를 추가하면 여기에도 추가한다
3. **콜드 설치 검증** — 릴리스 후 빈 디렉터리에서 실제로 태그를 설치하고 확인한다. `files: ["dist"]`와 gitignore된 `dist`가 얽히는 지점이라 실측이 필요하다

   ```sh
   npm i git+ssh://git@github.com/neosimplix/common-ui.git#v0.1.0
   ls node_modules/@neosimplix/common-ui/dist   # index.js react.js bundle.umd.js tokens.css *.d.ts
   node -e "import('@neosimplix/common-ui').then(() => console.log('ok'))"
   ```

4. **`dashboard-shell` 실연동** — 첫 릴리스 후 `dashboard-shell`의 `Header.tsx`/`Sidebar.tsx`를 이 패키지로 교체해 실제 앱에서 동작을 확인한다. `shared-ui`는 데모에서는 되고 실제 앱에서 안 되는 문제가 있었다

## 13. 확인이 필요한 항목

- **저장소 URL** — 이 문서는 `git+ssh://git@github.com/neosimplix/common-ui.git`을 가정한다. 실제 호스트와 조직명 확인 필요
- **토큰 실제 값** — §4.3에 따라 `dashboard-shell`에서 계산값을 추출해 고정
