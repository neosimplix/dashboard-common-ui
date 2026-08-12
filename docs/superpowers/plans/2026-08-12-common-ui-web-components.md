# common-ui Web Components 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Next.js · React 18/19 · 순수 HTML에서 동일하게 쓰는 대시보드 셸 웹 컴포넌트 4종을 git 태그로 배포 가능한 단일 패키지로 만든다.

**Architecture:** Lit 3 + TypeScript 단일 패키지. Shadow DOM으로 스타일을 격리하고 테마는 문서 `:root`의 CSS custom property로 주입받는다. Vite가 세 벌(ES 웹컴포넌트 / ES React 래퍼 / UMD 단일 번들)을 만들고 tsc가 선언만 방출한다. `main`은 소스만 유지하고 `dist`는 릴리스 태그 커밋에만 넣는다.

**Tech Stack:** Lit 3, TypeScript 5, Vite 6(lib mode), `@lit/react`, Node 20+

설계 문서: `docs/superpowers/specs/2026-08-12-common-ui-web-components-design.md`

## Global Constraints

- **테스트 러너를 도입하지 않는다.** 이 저장소의 회귀 확인 수단은 `npm run check`(tsc + 이벤트 매핑)와 `index.html` 육안 확인이다. 형제 프로젝트 `dashboard-shell`도 같은 방식이다(`app/dev/ui/page.tsx` 주석 참고). 무거운 검증 하네스는 이전 시도(`shared-ui`)가 폐기된 직접 원인이므로 추가하지 않는다.
- **모든 컴포넌트 태그는 `ns-` 접두사**를 쓴다: `ns-header`, `ns-sidebar`, `ns-nav-group`, `ns-nav-item`.
- **디자인 토큰 이름에는 접두사를 붙이지 않는다.** `dashboard-shell/app/globals.css`의 이름을 그대로 쓴다(`--color-line`, `--space-3`, `--sidebar-width-collapsed` …). 패키지 내부 배선용 프로퍼티만 `--ns-` 접두사를 쓴다(`--ns-label-display`).
- **컴포넌트는 자기 상태를 절대 바꾸지 않는다.** 이벤트만 올리고 상태는 소비자가 내려준다. `sidebarOpen`, `open`, `active` 어느 것도 컴포넌트가 스스로 변경하지 않는다.
- **모든 커스텀 이벤트는 `bubbles: true, composed: true`**. `composed`가 없으면 shadow 경계를 넘지 못한다.
- **컴포넌트 스타일에서 `var()` 폴백을 쓰지 않는다.** 색·치수 값이 두 곳에 존재하면 어긋난다. 단, 패키지 내부 프로퍼티(`--ns-label-display`)는 예외로 폴백을 쓴다.
- **`tsconfig.json`에 `experimentalDecorators: true`와 `useDefineForClassFields: false`가 둘 다 있어야 한다.** 없으면 클래스 필드가 `@property` 접근자를 덮어써서 리렌더가 조용히 멈춘다.
- **`@customElement` 데코레이터를 쓰지 않는다.** 모듈 평가 시점에 `customElements.define`을 호출해 SSR에서 터진다. `src/internal/register.ts`를 쓴다.
- **커밋은 각 Task 끝에서 한 번.** 커밋 메시지는 한국어 본문에 Conventional Commits 접두사를 쓴다.

---

## 파일 구조

| 파일 | 책임 |
|---|---|
| `package.json` | 패키지 메타, `exports` 서브패스, 스크립트, 의존성 |
| `tsconfig.json` | 타입 검사용(`noEmit`). 데코레이터 설정의 단일 출처 |
| `tsconfig.build.json` | 선언 방출 전용(`emitDeclarationOnly`) |
| `vite.config.ts` | 3회 빌드 배열 — ES 웹컴포넌트 / ES React(배너) / UMD |
| `.gitignore` | `dist`, `node_modules` |
| `src/tokens/tokens.css` | 디자인 토큰 + 정의 전 레이아웃 예약. 손으로 쓰는 정적 파일 |
| `src/internal/register.ts` | SSR 안전 커스텀 엘리먼트 등록 |
| `src/internal/warn-missing-tokens.ts` | `tokens.css` 미로드 콘솔 경고(페이지당 1회) |
| `src/types.ts` | 이벤트 `detail` 타입 + `HTMLElementEventMap` 확장 |
| `src/components/<name>/ns-<name>.ts` | Lit 엘리먼트 로직 + 등록 + 태그 타입 선언 |
| `src/components/<name>/ns-<name>.styles.ts` | 해당 컴포넌트의 shadow CSS |
| `src/index.ts` | 네 컴포넌트를 모두 import해 등록하는 진입점 |
| `src/react/index.ts` | `@lit/react` 래퍼. 이벤트 매핑 테이블의 단일 출처 |
| `scripts/copy-tokens.mjs` | `tokens.css` → `dist/` 복사 |
| `scripts/check-events.mjs` | 발생 이벤트 ↔ React 래퍼 매핑 대조 |
| `scripts/release.mjs` | 빌드 → detached 커밋에 dist 포함 → 태그 → push |
| `index.html` | 문서 겸 플레이그라운드. 셸 자체가 우리 컴포넌트 |

컴포넌트마다 로직과 스타일을 두 파일로 나눈다. 스타일이 길어지면 로직을 읽기 어려워지고, 스타일만 고치는 커밋이 로직 파일을 건드리지 않게 된다.

## 범위

이 계획은 **common-ui 패키지 자체**를 다룬다. Task 10의 콜드 설치 검증까지 끝나면 다른 프로젝트가 실제로 설치해 쓸 수 있는 상태가 된다.

설계 문서 §12.4의 **`dashboard-shell` 이관은 이 계획에 포함하지 않는다.** 다른 저장소이고, `SidebarSection[]` 데이터를 JSX로 바꾸는 작업, loading/error/empty 상태를 slot으로 옮기는 작업, `linkComponent={Link}` → `ns-navigate` 전환, `useSidebar` 하이드레이션 처리가 얽혀 있어 별도 계획이 필요하다. Task 10 완료 후 그 저장소에서 새 spec·plan을 만든다.

---

### Task 1: 디자인 토큰

**Files:**
- Create: `src/tokens/tokens.css`

**Interfaces:**
- Consumes: 없음
- Produces: `:root`에 정의되는 CSS custom property 전체. 이후 모든 컴포넌트 스타일이 이 이름들을 `var()`로 참조한다. 이름은 `dashboard-shell/app/globals.css`와 동일하다.

값은 `dashboard-shell/node_modules/tailwindcss/theme.css`에서 실제 oklch 값을 읽어 확정한 것이다. hex로 근사하지 않는다 — Tailwind v4 기본 팔레트는 oklch이고, 근사하면 `dashboard-shell`과 미묘하게 색이 달라진다.

- [ ] **Step 1: `src/tokens/tokens.css` 작성**

```css
/*
  common-ui 디자인 토큰.

  이름은 dashboard-shell/app/globals.css 와 동일하다. 접두사를 붙이지 않는
  이유는 그 프로젝트의 25개 파일이 이미 var(--space-3) 형태로 이 이름들을
  직접 참조하고 있기 때문이다.

  색 값은 Tailwind v4 기본 팔레트(oklch)에서 그대로 가져왔다. 이 파일은
  Tailwind 에 의존하지 않으므로 순수 HTML 에서도 동작한다.
*/
:root {
  /* 표면 · 전경 · 경계 */
  --color-surface: #fff;
  --color-surface-sunken: oklch(98.5% 0 0);            /* zinc-50 */
  --color-surface-hover: oklch(96.7% 0.001 286.375);   /* zinc-100 */
  --color-line: oklch(92% 0.004 286.32);               /* zinc-200 */
  --color-line-strong: oklch(87.1% 0.006 286.286);     /* zinc-300 */
  --color-overlay: rgb(0 0 0 / .4);

  --color-fg: oklch(21% 0.006 285.885);                /* zinc-900 */
  --color-fg-body: oklch(37% 0.013 285.805);           /* zinc-700 */
  --color-fg-muted: oklch(55.2% 0.016 285.938);        /* zinc-500 */
  --color-fg-subtle: oklch(70.5% 0.015 286.067);       /* zinc-400 */

  /* 액센트 — 브랜드 컬러가 정해지면 이 네 줄만 교체한다 */
  --color-accent: oklch(21% 0.006 285.885);            /* zinc-900 */
  --color-accent-hover: oklch(27.4% 0.006 286.033);    /* zinc-800 */
  --color-accent-fg: #fff;
  --color-disabled: oklch(87.1% 0.006 286.286);        /* zinc-300 */

  /* 상태 */
  --color-danger: oklch(57.7% 0.245 27.325);           /* red-600 */
  --color-danger-surface: oklch(97.1% 0.013 17.38);    /* red-50 */
  --color-warn: oklch(55.5% 0.163 48.998);             /* amber-700 */
  --color-warn-surface: oklch(98.7% 0.022 95.277);     /* amber-50 */
  --color-success: oklch(59.6% 0.145 163.225);         /* emerald-600 */
  --color-success-surface: oklch(97.9% 0.021 166.113); /* emerald-50 */

  /* 간격 — 4px 스케일 */
  --space-1: .25rem;
  --space-1-5: .375rem;
  --space-2: .5rem;
  --space-2-5: .625rem;
  --space-3: .75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;

  /* 반경 — 용도 이름 */
  --radius-badge: .25rem;
  --radius-control: .375rem;
  --radius-panel: .5rem;
  --radius-card: .75rem;
  --radius-pill: 9999px;

  /* 타이포 — 크기와 줄간격은 반드시 짝으로 쓴다 */
  --font-size-2xs: .6875rem; --line-height-2xs: 1rem;
  --font-size-xs: .75rem;    --line-height-xs: 1rem;
  --font-size-sm: .875rem;   --line-height-sm: 1.25rem;
  --font-size-base: 1rem;    --line-height-base: 1.5rem;
  --font-size-lg: 1.125rem;  --line-height-lg: 1.75rem;
  --font-size-xl: 1.25rem;   --line-height-xl: 1.75rem;
  --weight-medium: 500;
  --weight-semibold: 600;

  /* 레이아웃 상수 */
  --header-height: 3.5rem;
  --sidebar-width: 15rem;
  --sidebar-width-collapsed: 4rem;
  --page-padding-x: var(--space-6);
  --page-padding-y: var(--space-6);
  --card-padding: var(--space-8);
  --control-height-sm: 1.75rem;
  --control-height-md: 2.5rem;

  /* 기타 */
  --elevation-card: 0 1px 3px 0 rgb(0 0 0 / .1), 0 1px 2px -1px rgb(0 0 0 / .1);
  --transition-fast: 150ms;
  --transition-ease: cubic-bezier(.4, 0, .2, 1);
}

/* 다크모드는 이번 범위 밖. 나중에 이 블록만 채우면 된다. */
[data-theme="dark"] { }

/*
  정의 전 레이아웃 예약.

  커스텀 엘리먼트는 customElements.define 이전까지 display: inline 이고
  크기가 0 이다. SSR HTML 에는 셸이 없으므로 JS 로드 시점에 화면이 튄다.
  light DOM 선택자라 upgrade 전에도 적용된다.
*/
ns-header  { display: block; height: var(--header-height); }
ns-sidebar { display: block; width: var(--sidebar-width); }
ns-sidebar:not([open]) { width: var(--sidebar-width-collapsed); }
```

- [ ] **Step 2: `dashboard-shell`의 계산값과 일치하는지 대조**

Run:
```bash
grep -oE '\-\-color-(zinc|red|amber|emerald)-(50|100|200|300|400|500|600|700|800|900): [^;]+;' \
  /Users/neosimplix/coding/dashboard/dashboard-shell/node_modules/tailwindcss/theme.css \
  | grep -E 'zinc-(50|100|200|300|400|500|700|800|900)|red-(50|600)|amber-(50|700)|emerald-(50|600)'
```

Expected: 출력된 각 값이 `tokens.css` 주석에 적은 팔레트 이름의 값과 문자 단위로 일치한다. 단 `--color-zinc-50`은 `oklch(98.5% 0 none)`으로 나오는데, `tokens.css`에는 `oklch(98.5% 0 0)`으로 적는다 — 채도가 0이면 색상각은 결과에 영향이 없고 `0`이 호환성이 넓다.

- [ ] **Step 3: 커밋**

```bash
git add src/tokens/tokens.css
git commit -m "feat(tokens): dashboard-shell 디자인 토큰을 Tailwind 비의존 CSS로 이관

이름은 globals.css 와 동일하게 유지한다. 색 값은 Tailwind v4 기본
팔레트의 oklch 를 그대로 옮겨 dashboard-shell 과 정확히 일치시킨다."
```

---

### Task 2: 스캐폴딩과 빌드 파이프라인

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.build.json`, `vite.config.ts`, `.gitignore`
- Create: `src/index.ts`, `src/react/index.ts`, `scripts/copy-tokens.mjs`

**Interfaces:**
- Consumes: Task 1의 `src/tokens/tokens.css`
- Produces:
  - `npm run build` → `dist/index.js`, `dist/react.js`, `dist/bundle.umd.js`, `dist/tokens.css`, `dist/**/*.d.ts`
  - `npm run check` → `tsc` 타입 검사 (Task 8에서 이벤트 검사가 추가된다)
  - `npm run demo` → 빌드 후 `index.html` 열기 (macOS `open`)

이 시점의 `src/index.ts`와 `src/react/index.ts`는 내용이 비어 있다. 빌드 설정을 한 번만 쓰기 위해 진입점 파일을 미리 만들어 둔다.

- [ ] **Step 1: `.gitignore` 작성**

```gitignore
node_modules
dist
.DS_Store
```

- [ ] **Step 2: `package.json` 작성**

```json
{
  "name": "@neosimplix/common-ui",
  "version": "0.0.0",
  "type": "module",
  "engines": { "node": ">=20" },
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
    "build": "vite build --mode es && vite build --mode react && vite build --mode umd && tsc -p tsconfig.build.json && node scripts/copy-tokens.mjs",
    "check": "tsc -p tsconfig.json",
    "demo": "npm run build && open index.html",
    "release": "node scripts/release.mjs"
  },
  "dependencies": {
    "lit": "^3.3.0",
    "@lit/react": "^1.0.8"
  },
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0"
  },
  "peerDependenciesMeta": {
    "react": { "optional": true },
    "react-dom": { "optional": true }
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^18.3.0",
    "react": "^18.3.1",
    "typescript": "^5.9.0",
    "vite": "^6.0.0"
  }
}
```

`sideEffects` 필드를 넣지 않는다. `dist/index.js`가 `customElements.define`을 실행하므로 tree-shaking되면 안 된다.

- [ ] **Step 3: `tsconfig.json` 작성**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "noEmit": true
  },
  "include": ["src", "vite.config.ts"]
}
```

`scripts/*.mjs`는 `include`에 넣지 않는다. `allowJs`가 없어 어차피 검사되지 않으므로 넣어 두면 검사되는 것처럼 오해만 부른다.

`vite.config.ts`가 `node:path`와 `node:url`을 import하므로 `@types/node`가 devDependencies에 있어야 한다. 없으면 `npm run check`가 모듈을 찾지 못해 실패한다.

`experimentalDecorators`와 `useDefineForClassFields: false`가 둘 다 필요하다. 하나라도 빠지면 클래스 필드 초기화가 `@property`가 만든 접근자를 덮어써서, 속성이 바뀌어도 리렌더가 일어나지 않는다. 에러가 나지 않고 화면만 갱신되지 않는 함정이다.

- [ ] **Step 4: `tsconfig.build.json` 작성**

```json
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

`tsc`를 옵션 없이 돌리면 `noEmit: true` 때문에 `.d.ts`가 아예 생기지 않는다. 반드시 이 설정으로 분리한다.

- [ ] **Step 5: `vite.config.ts` 작성**

**Vite 는 배열 설정을 지원하지 않는다.** 배열로 여러 빌드를 묶는 것은 Rollup 기능이고, Vite 에 넘기면 `config must export or return an object` 로 실패한다. 대신 `--mode` 로 셋 중 하나를 고르고 `build` 스크립트가 `vite build` 를 세 번 호출한다. `--mode` 는 Vite 내장 플래그라 환경 변수와 달리 Windows 에서도 그대로 동작한다.

```ts
import { defineConfig, type UserConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

// package.json 이 "type": "module" 이므로 __dirname 이 없다.
const here = path.dirname(fileURLToPath(import.meta.url));
const r = (p: string) => path.resolve(here, p);

/*
  Rollup 의 문자열 external 은 모듈 지정자와 정확히 일치해야 한다.
  "lit" 만 적으면 컴포넌트가 쓰는 "lit/decorators.js" 가 걸리지 않아
  @lit/reactive-element 가 번들에 통째로 들어간다. 그 안의
  `class ReactiveElement extends HTMLElement` 가 모듈 평가 시점에
  실행되므로 Node 에서 import 하면 ReferenceError 로 죽는다 — Next 의
  서버 렌더링이 정확히 그 경로다.

  게다가 소비자 앱에 ReactiveElement 가 두 벌 생긴다. LitElement 는
  external "lit" 에서, 데코레이터는 번들된 사본에서 오기 때문에 Lit 이
  "Multiple versions of Lit loaded" 를 경고하고 반응성이 깨질 수 있다.

  정규식으로 lit 계열 전체를 외부로 둔다. lit 은 dependencies 에 있으므로
  소비자에게 함께 설치된다.
*/
const litExternal = [
  /^lit(\/.*)?$/,
  /^lit-(html|element)(\/.*)?$/, // lit 이 재수출하는 별개 패키지들
  /^@lit\/.*/,
  /^@lit-labs\/.*/,
];

// 1. ES — 번들러(Next/Vite)가 소비하는 웹 컴포넌트
const es: UserConfig = {
  build: {
    lib: { entry: r("src/index.ts"), formats: ["es"], fileName: () => "index.js" },
    rollupOptions: { external: litExternal },
  },
};

// 2. ES — React 래퍼. 'use client' 배너가 필요해 별도 설정으로 분리한다
const react: UserConfig = {
  build: {
    emptyOutDir: false,
    lib: { entry: r("src/react/index.ts"), formats: ["es"], fileName: () => "react.js" },
    rollupOptions: {
      external: ["react", "react-dom", ...litExternal],
      // Rollup 은 모듈 최상단 디렉티브를 제거한다. 소스에 써도 남지 않으므로
      // 여기서 다시 주입한다. 없으면 Next 의 Server Component 가 import 할 때 터진다.
      output: { banner: "'use client';" },
    },
  },
};

// 3. UMD — file:// 로컬 실행용. lit 을 인라인한다
const umd: UserConfig = {
  build: {
    emptyOutDir: false,
    lib: {
      entry: r("src/index.ts"),
      name: "NsCommonUi",
      formats: ["umd"],
      fileName: () => "bundle.umd.js",
    },
  },
};

const configs: Record<string, UserConfig> = { es, react, umd };

export default defineConfig(({ mode }) => configs[mode] ?? es);
```

**`minify` 와 `target` 을 건드리지 않는다.** Vite 의 기본값을 그대로 쓴다. 특히 `bundle.umd.js` 는 번들러 없이 브라우저가 `<script src>` 로 직접 받는 유일한 산출물이라, 압축을 끄면 그 비용을 소비자가 그대로 치른다.

`tokens.css`를 `lib.entry`에 넣지 않는다. `build.lib.entry`는 JS 진입점을 받으며, CSS를 넣으면 내용이 빈 `tokens.js`가 함께 생기고 출력 파일명이 Vite 버전에 따라 달라진다.

- [ ] **Step 6: `scripts/copy-tokens.mjs` 작성**

```js
import { copyFileSync, mkdirSync } from "node:fs";

mkdirSync("dist", { recursive: true });
copyFileSync("src/tokens/tokens.css", "dist/tokens.css");
console.log("복사 완료: dist/tokens.css");
```

- [ ] **Step 7: 빈 진입점 두 개 작성**

`src/index.ts`:
```ts
// 컴포넌트는 Task 4~7 에서 추가된다.
export {};
```

`src/react/index.ts`:
```ts
// React 래퍼는 Task 8 에서 추가된다.
export {};
```

- [ ] **Step 8: 의존성 설치**

Run: `npm install`
Expected: `node_modules`가 생성되고 오류 없이 끝난다.

- [ ] **Step 9: 타입 검사가 통과하는지 확인**

Run: `npm run check`
Expected: 출력 없이 종료 코드 0.

- [ ] **Step 10: 빌드가 네 산출물을 만드는지 확인**

Run: `npm run build && ls dist`
Expected: `bundle.umd.js`, `index.js`, `react.js`, `tokens.css`가 모두 보인다.

- [ ] **Step 11: React 배너가 실제로 번들에 남았는지 확인**

Run: `head -1 dist/react.js`
Expected: `use client` 디렉티브가 첫 줄에 있다. **인용부호는 작은따옴표든 큰따옴표든 무방하다** — Vite 의 esbuild 재출력 패스가 문자열을 큰따옴표로 정규화할 수 있고, 두 형태 모두 유효한 디렉티브다. 확인하려는 것은 Rollup 이 디렉티브를 지워버리지 않았다는 사실 하나다.

인용부호를 맞추려고 `minify` 나 `target` 을 건드리지 않는다. 검증 문구를 위해 산출물 품질을 바꾸는 것은 방향이 거꾸로다.

이 확인이 중요하다. Rollup이 디렉티브를 제거하는 문제가 실재하므로, 배너 설정이 동작했다는 증거를 여기서 남긴다.

- [ ] **Step 12: 커밋**

```bash
git add .gitignore package.json package-lock.json tsconfig.json tsconfig.build.json vite.config.ts src/index.ts src/react/index.ts scripts/copy-tokens.mjs
git commit -m "chore(build): 패키지 스캐폴딩과 3회 빌드 파이프라인 구성

Vite 가 ES 웹컴포넌트 / ES React 래퍼 / UMD 세 벌을 만들고 tsc 는
선언만 방출한다. React 엔트리는 Rollup 이 제거하는 'use client'
디렉티브를 배너로 다시 주입한다."
```

---

### Task 3: 공통 유틸과 타입

**Files:**
- Create: `src/internal/register.ts`, `src/internal/warn-missing-tokens.ts`, `src/types.ts`

**Interfaces:**
- Consumes: 없음
- Produces:
  - `register(tag: string, ctor: CustomElementConstructor): void`
  - `warnIfTokensMissing(): void`
  - `interface NsToggleDetail { open: boolean }`
  - `interface NsNavigateDetail { href: string; label: string }`
  - 전역 `HTMLElementEventMap`에 `"ns-toggle"`, `"ns-navigate"` 추가

- [ ] **Step 1: `src/internal/register.ts` 작성**

```ts
/**
 * 커스텀 엘리먼트를 안전하게 등록한다.
 *
 * @customElement 데코레이터를 쓰지 않는 이유가 여기 있다. 그 데코레이터는
 * 모듈 평가 시점에 customElements.define 을 호출하는데, Next 의 서버
 * 렌더링처럼 브라우저가 아닌 곳에서 import 되면 그대로 터진다.
 */
export function register(tag: string, ctor: CustomElementConstructor): void {
  if (typeof window === "undefined" || !("customElements" in window)) return;
  // HMR 이나 중복 import 시 재정의 에러가 나지 않게 한다.
  if (customElements.get(tag)) return;
  customElements.define(tag, ctor);
}
```

- [ ] **Step 2: `src/internal/warn-missing-tokens.ts` 작성**

```ts
let settled = false;

const MESSAGE =
  "[@neosimplix/common-ui] tokens.css 가 로드되지 않아 레이아웃이 깨집니다.\n" +
  '  Next/React:  import "@neosimplix/common-ui/tokens.css";\n' +
  '  HTML:        <link rel="stylesheet" href="…/dist/tokens.css">';

const tokensPresent = () =>
  getComputedStyle(document.documentElement).getPropertyValue("--color-line").trim() !== "";

/**
 * tokens.css 가 로드되지 않았으면 콘솔에 한 번만 경고한다.
 *
 * 컴포넌트 스타일은 var() 폴백을 쓰지 않는다. 값이 tokens.css 와 컴포넌트
 * 양쪽에 존재하면 어긋나기 때문이다. 그래서 토큰이 없으면 레이아웃이
 * 무너지는데, 조용히 무너지는 대신 원인과 해결책을 알려준다.
 *
 * 네 컴포넌트가 각자 connectedCallback 에서 호출한다. 사이드바 하나에
 * nav item 이 수십 개일 수 있으므로 정상 페이지에서는 반드시 한 번만
 * 실제 검사가 일어나야 한다.
 */
export function warnIfTokensMissing(): void {
  if (settled) return;
  if (typeof document === "undefined" || typeof getComputedStyle === "undefined") return;

  // 토큰이 보이면 그것으로 확정이다. 정상 경로는 여기서 끝나고
  // getComputedStyle 은 페이지당 한 번만 호출된다.
  if (tokensPresent()) {
    settled = true;
    return;
  }

  /*
    아직 안 보인다고 없는 것은 아니다. tokens.css 는 JS 와 별도로 로드되므로
    (Next 의 CSS 청크, 늦게 삽입된 <link>) 첫 컴포넌트가 연결되는 시점에
    아직 적용 전일 수 있다. 여기서 바로 경고하면 정상 페이지에 취소할 수 없는
    거짓 경고가 남는다. 문서 로드가 끝난 뒤 한 번 더 보고 판단한다.

    settled 는 지금 세운다. 예약을 한 번만 하기 위해서다 — 판정 자체는
    아래 confirm 이 내린다.
  */
  settled = true;

  const confirm = () => {
    if (tokensPresent()) return;
    console.warn(MESSAGE);
  };

  if (document.readyState === "complete") confirm();
  else window.addEventListener("load", confirm, { once: true });
}
```

**`settled` 를 프로브 전에 세우면 안 된다.** 페이지에서 가장 먼저 연결되는 컴포넌트 하나의 판정이 영구 확정되어, 스타일시트가 조금 늦게 적용된 정상 페이지에 되돌릴 수 없는 거짓 경고가 남는다. 반대로 매번 검사하면 nav item 수십 개마다 강제 리플로가 일어난다. 위 형태는 정상 경로에서 `getComputedStyle` 을 한 번만 호출하면서 거짓 경고도 내지 않는다.

- [ ] **Step 3: `src/types.ts` 작성**

```ts
/** ns-header 의 토글 버튼이 올리는 이벤트. open 은 "요청되는 다음 상태"다. */
export interface NsToggleDetail {
  open: boolean;
}

/** ns-nav-item 클릭이 올리는 이벤트. 라우팅은 소비자가 처리한다. */
export interface NsNavigateDetail {
  href: string;
  label: string;
}

declare global {
  interface HTMLElementEventMap {
    "ns-toggle": CustomEvent<NsToggleDetail>;
    "ns-navigate": CustomEvent<NsNavigateDetail>;
  }
}
```

이 전역 확장 덕분에 소비자가 `el.addEventListener("ns-navigate", (e) => e.detail.href)`를 쓸 때 `detail`이 자동으로 타입을 얻는다.

- [ ] **Step 4: 타입 검사**

Run: `npm run check`
Expected: 출력 없이 종료 코드 0.

- [ ] **Step 5: 커밋**

```bash
git add src/internal src/types.ts
git commit -m "feat(internal): SSR 안전 등록 헬퍼와 이벤트 타입 추가

@customElement 데코레이터는 모듈 평가 시점에 define 을 호출해 서버에서
터지므로 쓰지 않는다. HTMLElementEventMap 확장으로 소비자의
addEventListener 에서 detail 타입이 따라오게 한다."
```

---

### Task 4: `index.html` 뼈대와 데모 헬퍼

**Files:**
- Create: `index.html`

**Interfaces:**
- Consumes: `dist/bundle.umd.js`, `dist/tokens.css` (Task 2의 빌드 산출물)
- Produces:
  - `<template class="ex">` + `<div class="demo">` + `<pre>` 3종 세트 규약. Task 5~8이 이 규약으로 섹션을 추가한다
  - `section(id, title)` 구조 — 좌측 네비게이션이 `#id`로 스크롤한다

문서 셸을 우리 컴포넌트로 만드는 것은 Task 9다. 네 컴포넌트가 다 있어야 하기 때문이다. 지금은 평범한 HTML 뼈대를 만들어, Task 5~8이 각자 자기 섹션을 붙이면서 **바로 눈으로 확인할 수 있게** 한다.

- [ ] **Step 1: `index.html` 작성**

```html
<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>common-ui</title>
<link rel="stylesheet" href="./dist/tokens.css">
<style>
  body {
    margin: 0;
    font-family: system-ui, -apple-system, "Apple SD Gothic Neo", sans-serif;
    color: var(--color-fg);
    background: var(--color-surface-sunken);
  }
  main { max-width: 56rem; margin: 0 auto; padding: var(--space-8) var(--space-6) 6rem; }
  h1 { font-size: var(--font-size-xl); line-height: var(--line-height-xl); }
  h2 {
    margin-top: var(--space-8);
    padding-top: var(--space-6);
    border-top: 1px solid var(--color-line);
    font-size: var(--font-size-lg);
    line-height: var(--line-height-lg);
  }
  h3, h4 { font-size: var(--font-size-sm); color: var(--color-fg-muted); text-transform: uppercase; letter-spacing: .05em; }
  p, li { font-size: var(--font-size-sm); line-height: 1.7; color: var(--color-fg-body); }
  code { font-size: var(--font-size-xs); background: var(--color-surface-hover); padding: 0 .25em; border-radius: var(--radius-badge); }

  table { width: 100%; border-collapse: collapse; margin: var(--space-4) 0; }
  th, td {
    border-bottom: 1px solid var(--color-line);
    padding: var(--space-2) var(--space-3);
    text-align: left;
    font-size: var(--font-size-xs);
    line-height: var(--line-height-sm);
    vertical-align: top;
  }
  th { color: var(--color-fg-muted); font-weight: var(--weight-semibold); }
  td code { background: none; padding: 0; }

  /* 데모는 반드시 높이를 고정한다. tokens.css 의 ns-sidebar 규칙은 전역
     element 선택자라 데모 사이드바에도 적용되는데, 높이를 안 잡으면
     페이지 전체로 늘어난다. */
  .demo {
    display: flex;
    height: 320px;
    overflow: hidden;
    border: 1px solid var(--color-line);
    border-radius: var(--radius-panel);
    background: var(--color-surface);
  }
  .demo.block { display: block; height: auto; }
  pre {
    margin: var(--space-2) 0 0;
    padding: var(--space-3);
    overflow-x: auto;
    border-radius: var(--radius-panel);
    background: var(--color-fg);
    color: #fff;
    font-size: var(--font-size-xs);
    line-height: 1.6;
  }
</style>
</head>
<body>

<main>
  <h1>common-ui</h1>
  <p>Next.js · React 18/19 · 순수 HTML 에서 동일하게 쓰는 대시보드 셸 웹 컴포넌트.</p>

  <!-- 컴포넌트 섹션은 Task 5~8 에서, 설치·연동·토큰 섹션은 Task 9 에서 추가한다. -->
</main>

<script src="./dist/bundle.umd.js"></script>

<script>
  // dist 가 없으면 화면이 통째로 비어 원인을 알 수 없다. shared-ui 에서 겪은 함정이다.
  if (!customElements.get("ns-nav-item")) {
    document.body.insertAdjacentHTML("afterbegin",
      '<p style="background:#fee;color:#900;padding:12px;margin:0;font-size:14px">' +
      'dist 가 없습니다. 먼저 <code>npm run build</code> 를 실행하세요.</p>');
  }

  /*
    예시 코드와 데모가 어긋나지 않게 한다.

    <template class="ex"> 하나를 원본으로 삼아, 바로 다음 형제인 .demo 에
    복제해 실제로 렌더하고, 그 다음 형제인 <pre> 에 같은 마크업을 글자로
    넣는다. 손으로 이스케이프할 필요도, 코드와 데모를 따로 고칠 일도 없다.
  */
  function dedent(html) {
    const lines = html.replace(/^\n/, "").replace(/\s+$/, "").split("\n");
    const indent = Math.min(
      ...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length)
    );
    return lines.map((l) => l.slice(indent)).join("\n");
  }

  /*
    규약: <template class="ex"> 다음 형제가 .demo, 그 다음이 <pre> 다.

    섹션을 추가하는 쪽이 이 순서를 어기면 예외가 이 스크립트 전체를 중단시켜
    그 뒤의 모든 섹션이 함께 빈 화면이 된다. 원인 하나가 여러 곳의 고장으로
    보여서 진단이 어렵다. 어긋난 곳을 짚어주고 그 섹션만 건너뛴다.
  */
  document.querySelectorAll("template.ex").forEach((tpl, i) => {
    const demo = tpl.nextElementSibling;
    const pre = demo?.nextElementSibling;
    if (!demo?.classList.contains("demo") || pre?.tagName !== "PRE") {
      console.error(
        `[docs] ${i + 1}번째 template.ex: 다음 형제가 .demo, 그 다음이 <pre> 여야 합니다.`
      );
      return;
    }
    demo.append(tpl.content.cloneNode(true));
    pre.textContent = dedent(tpl.innerHTML);
  });

  // 실행하지 않는 예시(React/Next)는 <script type="text/plain"> 에 원문으로 담는다.
  // 브라우저가 파싱하지 않으므로 이스케이프가 필요 없다.
  for (const src of document.querySelectorAll('script[type="text/plain"]')) {
    const pre = document.createElement("pre");
    pre.textContent = dedent(src.textContent);
    src.replaceWith(pre);
  }
</script>

</body>
</html>
```

- [ ] **Step 2: 빌드가 통과하는지 확인**

Run: `npm run build`
Expected: 오류 없이 끝나고 `dist/bundle.umd.js`가 존재한다.

**이 시점에 `index.html`을 열면 빨간 배너가 뜬다. 그게 정상이다.** 배너 조건은 `!customElements.get("ns-nav-item")`인데 컴포넌트가 아직 하나도 없으므로 참이다. 배너 문구("dist 가 없습니다")는 이 개발 중간 상태를 정확히 설명하지는 못하지만, Task 5에서 첫 컴포넌트가 등록되는 순간 사라진다. 소비자가 보게 되는 상태가 아니므로 문구를 바꾸지 않는다.

- [ ] **Step 3: 구조 검사**

브라우저 없이 확인할 수 있는 것들이다.

```bash
# ① text/plain 블록 안에 script 태그가 없는가 (있으면 HTML 파서가 페이지를 끊는다)
#    두 검사가 서로 다른 경우를 잡으므로 둘 다 필요하다.
grep -c '<script>' index.html          # 1 이어야 한다 (헬퍼 스크립트 하나)

#    진짜 위험은 </script> 가 예시 블록 안에 들어가는 것이다. 정당한 닫는
#    태그는 자기 줄에 혼자 있거나 <script src=...></script> 한 줄뿐이므로,
#    그 외의 위치에 나타나면 예시 안에 섞여 들어간 것이다.
grep -n '</script>' index.html | grep -v -E ':\s*</script>\s*$' | grep -v '<script src='
# 출력이 없어야 정상.

#    요소 수와 닫는 태그 수도 맞아야 한다.
echo "요소:$(grep -cE '^\s*<script' index.html) 닫는:$(grep -o '</script>' index.html | wc -l)"

# ② 데모 헬퍼의 세 요소가 다 있는가
grep -c 'template.ex\|class="demo"\|dedent' index.html

# ③ dist 누락 감지 배너가 있는가
grep -c 'npm run build' index.html
```

Expected: ①이 `1`. ②가 1 이상. ③이 1 이상.

①이 1보다 크면 예시 코드 안에 `<script>` 태그를 넣은 것이다. `<script type="text/plain">` 안이라도 HTML 파서는 첫 `</script>`에서 블록을 닫아버려 그 지점부터 페이지가 깨진다. 마크업 예시와 배선 예시를 별도 블록으로 나눠야 한다.

시각 확인은 컨트롤러가 Task 5(첫 컴포넌트가 화면에 나오는 시점)와 Task 10(문서 완성)에서 한다.

- [ ] **Step 4: 커밋**

```bash
git add index.html
git commit -m "docs(playground): 문서 페이지 뼈대와 데모 헬퍼 추가

template 하나를 원본으로 삼아 라이브 데모와 코드 블록 양쪽을 만든다.
예시와 데모가 어긋나지 않고 HTML 이스케이프도 필요 없다.
dist 누락 시 빈 화면 대신 원인을 화면에 띄운다."
```

---

### Task 5: `ns-nav-item`

**Files:**
- Create: `src/components/nav-item/ns-nav-item.ts`, `src/components/nav-item/ns-nav-item.styles.ts`
- Modify: `src/index.ts`, `index.html`

**Interfaces:**
- Consumes: `register`, `warnIfTokensMissing`, `NsNavigateDetail` (Task 3)
- Produces:
  - `class NsNavItem extends LitElement` — 프로퍼티 `href: string`, `label: string`, `badge: string`, `active: boolean`
  - 커스텀 엘리먼트 `ns-nav-item`, slot `trailing`
  - 이벤트 `ns-navigate`, detail `NsNavigateDetail`
  - 내부 프로퍼티 `--ns-label-display`를 읽어 라벨·trailing slot 표시를 결정한다 (Task 7의 `ns-sidebar`가 내려준다)

가장 안쪽 잎사귀부터 만든다. 이벤트·수식키 처리·slot·`active`가 모두 여기 모여 있다.

- [ ] **Step 1: `src/components/nav-item/ns-nav-item.styles.ts` 작성**

```ts
import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  .row {
    display: flex;
    align-items: center;
    gap: var(--space-2-5);
    margin-bottom: var(--space-1);
    border-radius: var(--radius-control);
    padding: var(--space-2);
    color: var(--color-fg-body);
    text-decoration: none;
    transition: background-color var(--transition-fast) var(--transition-ease),
      color var(--transition-fast) var(--transition-ease);
  }

  .row:hover {
    background: var(--color-surface-sunken);
  }

  :host([active]) .row {
    background: var(--color-surface-hover);
    color: var(--color-fg);
  }

  /* 접힌 레일에서 유일하게 남는 요소라 flex 축소를 막는다. */
  .badge {
    flex: none;
    display: grid;
    place-items: center;
    width: var(--control-height-sm);
    height: var(--control-height-sm);
    border-radius: var(--radius-badge);
    background: var(--color-surface-hover);
    font-size: var(--font-size-2xs);
    line-height: var(--line-height-2xs);
    font-weight: var(--weight-semibold);
  }

  :host([active]) .badge {
    background: var(--color-accent);
    color: var(--color-accent-fg);
  }

  /*
    flex: 1 과 min-width: 0 이 함께 있어야 한다. flex 자식은 기본이
    min-width: auto 라 내용보다 작아지지 않고, 그러면 text-overflow 가
    동작하지 않는다.

    --ns-label-display 는 ns-sidebar 가 ::slotted 로 내려주는 패키지
    내부 프로퍼티다. 사이드바 밖에서 단독으로 쓰일 때를 위해 여기만
    폴백을 둔다.
  */
  .label {
    display: var(--ns-label-display, block);
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: var(--font-size-sm);
    line-height: var(--line-height-sm);
    font-weight: var(--weight-medium);
  }

  .trailing {
    display: var(--ns-label-display, block);
    flex: none;
  }
`;
```

- [ ] **Step 2: `src/components/nav-item/ns-nav-item.ts` 작성**

```ts
import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { register } from "../../internal/register.js";
import { warnIfTokensMissing } from "../../internal/warn-missing-tokens.js";
import type { NsNavigateDetail } from "../../types.js";
import { styles } from "./ns-nav-item.styles.js";

export class NsNavItem extends LitElement {
  static override styles = styles;

  /** 라우팅 키. ns-navigate 이벤트에 그대로 실린다. */
  @property({ type: String }) href = "";

  /** 펼친 상태에서 보이는 라벨. 넘치면 한 줄 말줄임. */
  @property({ type: String }) label = "";

  /** 접힌 레일에서 보이는 두 글자 배지. */
  @property({ type: String }) badge = "";

  /**
   * 활성 여부. 컴포넌트가 스스로 바꾸지 않는다 — 소비자가 내려준다.
   * reflect 로 속성에 남겨야 :host([active]) 스타일이 걸린다.
   */
  @property({ type: Boolean, reflect: true }) active = false;

  override connectedCallback(): void {
    super.connectedCallback();
    warnIfTokensMissing();
  }

  override render() {
    return html`
      <a class="row" href=${this.href} title=${this.label} @click=${this.#onClick}>
        <span class="badge" aria-hidden="true">${this.badge}</span>
        <span class="label">${this.label}</span>
        <span class="trailing"><slot name="trailing"></slot></span>
      </a>
    `;
  }

  /**
   * 진짜 <a href> 를 렌더하는 이유는 수식키 클릭이다. ⌘/Ctrl/Shift/Alt
   * 클릭과 가운데 클릭은 브라우저에 넘겨 새 탭 열기가 동작하게 하고,
   * 평범한 좌클릭만 가로채 이벤트로 올린다.
   */
  #onClick = (e: MouseEvent): void => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const detail: NsNavigateDetail = { href: this.href, label: this.label };
    this.dispatchEvent(
      new CustomEvent("ns-navigate", { detail, bubbles: true, composed: true }),
    );
  };
}

register("ns-nav-item", NsNavItem);

declare global {
  interface HTMLElementTagNameMap {
    "ns-nav-item": NsNavItem;
  }
}
```

- [ ] **Step 3: `src/index.ts` 갱신**

```ts
import "./components/nav-item/ns-nav-item.js";

export { NsNavItem } from "./components/nav-item/ns-nav-item.js";
export type { NsToggleDetail, NsNavigateDetail } from "./types.js";
```

- [ ] **Step 4: `index.html`에 섹션 추가**

`<main>` 안, 소개 문단 다음에 넣는다.

```html
  <h2 id="ns-nav-item">ns-nav-item</h2>
  <p>
    네비게이션 그룹 하위의 항목 하나. 클릭하면 <code>ns-navigate</code> 이벤트를 올리고,
    라우팅은 이 컴포넌트를 쓰는 프로젝트가 처리한다.
  </p>

  <h3>데모</h3>
  <template class="ex">
    <ns-nav-item href="/a" label="프로젝트 A" badge="PA" active></ns-nav-item>
    <ns-nav-item href="/b" label="아주 긴 프로젝트 이름은 한 줄로 말줄임된다" badge="PB"></ns-nav-item>
    <ns-nav-item href="/c" label="프로젝트 C" badge="PC">
      <span slot="trailing">3</span>
    </ns-nav-item>
  </template>
  <div class="demo block" id="nav-item-demo" style="padding: var(--space-2)"></div>
  <pre></pre>
  <p id="nav-item-log" style="font-family: monospace">클릭하면 여기에 이벤트가 찍힌다.</p>

  <h3>프로퍼티</h3>
  <table>
    <tr><th>프로퍼티</th><th>속성</th><th>타입</th><th>기본값</th><th>설명</th></tr>
    <tr><td><code>href</code></td><td><code>href</code></td><td>string</td><td><code>""</code></td><td>라우팅 키. 이벤트에 그대로 실린다</td></tr>
    <tr><td><code>label</code></td><td><code>label</code></td><td>string</td><td><code>""</code></td><td>펼친 상태에서 보이는 라벨. 한 줄 말줄임</td></tr>
    <tr><td><code>badge</code></td><td><code>badge</code></td><td>string</td><td><code>""</code></td><td>접힌 레일에서 보이는 두 글자 배지</td></tr>
    <tr><td><code>active</code></td><td><code>active</code></td><td>boolean</td><td><code>false</code></td><td>활성 여부. 컴포넌트가 스스로 바꾸지 않는다</td></tr>
  </table>

  <h3>slot</h3>
  <table>
    <tr><th>이름</th><th>위치</th><th>용도</th></tr>
    <tr><td><code>trailing</code></td><td>행의 우측 끝</td><td>카운트 배지 등 소비자가 원하는 것. 접히면 함께 숨는다</td></tr>
  </table>

  <h3>이벤트</h3>
  <table>
    <tr><th>이름</th><th>detail</th><th>발생 시점</th></tr>
    <tr><td><code>ns-navigate</code></td><td><code>{ href: string, label: string }</code></td><td>평범한 좌클릭. ⌘/Ctrl/Shift/Alt 클릭과 가운데 클릭은 브라우저의 새 탭 열기에 넘긴다</td></tr>
  </table>

  <h3>HTML — 마크업</h3>
  <script type="text/plain">
    <ns-nav-item href="/a" label="프로젝트 A" badge="PA" active></ns-nav-item>
  </script>

  <h3>HTML — 배선</h3>
  <script type="text/plain">
    document.querySelector("ns-nav-item")
      .addEventListener("ns-navigate", (e) => { location.href = e.detail.href; });
  </script>

  <h3>React</h3>
  <script type="text/plain">
    import { NsNavItem } from "@neosimplix/common-ui/react";

    <NsNavItem
      href="/a"
      label="프로젝트 A"
      badge="PA"
      active={pathname === "/a"}
      onNsNavigate={(e) => router.push(e.detail.href)}
    />
  </script>
```

그리고 헬퍼 스크립트의 `for (const tpl of …)` 반복문 **뒤에** 로그 배선을 추가한다.

```js
  const navItemDemo = document.getElementById("nav-item-demo");
  const navItemLog = document.getElementById("nav-item-log");
  if (navItemDemo && navItemLog) {
    // 이 데모 컨테이너에 붙인다. document 에 붙이면 다른 데모의 이벤트까지 잡는다.
    navItemDemo.addEventListener("ns-navigate", (e) => {
      navItemLog.textContent = `ns-navigate  href=${e.detail.href}  label=${e.detail.label}`;
    });
  }
```

**예시 코드에 `<script>` 태그를 넣지 않는다.** `<script type="text/plain">` 안이라도 HTML 파서는 첫 `</script>`에서 블록을 닫아버려 페이지가 깨진다. 그래서 마크업과 배선을 별도 블록으로 나눈다.

- [ ] **Step 5: 타입 검사**

Run: `npm run check`
Expected: 출력 없이 종료 코드 0.

- [ ] **Step 6: 브라우저에서 동작 확인**

Run: `npm run demo`

확인 항목:
1. 항목 세 개가 보이고, 첫 번째는 배경이 짙고 배지가 검은색이다(`active`)
2. 두 번째 라벨이 `…`로 잘려 있다
3. 세 번째 우측에 `3`이 보인다(`trailing` slot)
4. 항목을 클릭하면 페이지가 이동하지 **않고**, 아래 로그 줄이 `ns-navigate href=/a label=프로젝트 A`로 바뀐다
5. ⌘(또는 Ctrl)를 누른 채 클릭하면 새 탭이 열리고 **로그는 바뀌지 않는다**. `file://`에서 열었으므로 새 탭에는 "파일을 찾을 수 없음"이 뜨는데, 그래도 무방하다 — 확인하려는 것은 우리가 클릭을 가로채지 않았다는 사실이다
6. `<pre>` 안의 코드가 데모와 동일한 마크업이다

- [ ] **Step 7: 커밋**

```bash
git add src/components/nav-item src/index.ts index.html
git commit -m "feat(nav-item): 네비게이션 항목 컴포넌트 추가

진짜 <a href> 를 렌더해 수식키 클릭의 새 탭 열기를 살리고, 평범한
좌클릭만 가로채 ns-navigate 를 올린다. active 는 컴포넌트가 스스로
바꾸지 않고 소비자가 내려준다."
```

---

### Task 6: `ns-nav-group`

**Files:**
- Create: `src/components/nav-group/ns-nav-group.ts`, `src/components/nav-group/ns-nav-group.styles.ts`
- Modify: `src/index.ts`, `index.html`

**Interfaces:**
- Consumes: `register`, `warnIfTokensMissing` (Task 3), `ns-nav-item` (Task 5)
- Produces:
  - `class NsNavGroup extends LitElement` — 프로퍼티 `heading: string`
  - 커스텀 엘리먼트 `ns-nav-group`, 기본 slot(`ns-nav-item` 목록)
  - `--ns-label-display`를 읽어 제목 표시를 결정한다

- [ ] **Step 1: `src/components/nav-group/ns-nav-group.styles.ts` 작성**

```ts
import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  /*
    그룹 사이 간격. 원본은 .section + .section 이었지만 여기서는 형제가
    light DOM 의 호스트라 shadow 안에서 선택할 수 없다. ::slotted() 는
    결합자를 받지 않으므로 사이드바 쪽에서도 불가능하다. :host() 는
    복합 선택자를 받으므로 이 형태가 유일하게 동작한다.
  */
  :host(:not(:first-child)) {
    margin-top: var(--space-6);
  }

  .heading {
    display: var(--ns-label-display, block);
    padding: var(--space-4) var(--space-4) var(--space-2);
    font-size: var(--font-size-xs);
    line-height: var(--line-height-xs);
    font-weight: var(--weight-semibold);
    letter-spacing: 0.05em;
    color: var(--color-fg-subtle);
  }

  .list {
    padding: var(--space-2);
  }
`;
```

- [ ] **Step 2: `src/components/nav-group/ns-nav-group.ts` 작성**

```ts
import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { register } from "../../internal/register.js";
import { warnIfTokensMissing } from "../../internal/warn-missing-tokens.js";
import { styles } from "./ns-nav-group.styles.js";

export class NsNavGroup extends LitElement {
  static override styles = styles;

  /** 그룹 제목. 사이드바가 접히면 시각적으로 숨지만 aria-label 로는 남는다. */
  @property({ type: String }) heading = "";

  override connectedCallback(): void {
    super.connectedCallback();
    warnIfTokensMissing();
  }

  override render() {
    return html`
      <div role="group" aria-label=${this.heading}>
        <div class="heading">${this.heading}</div>
        <div class="list"><slot></slot></div>
      </div>
    `;
  }
}

register("ns-nav-group", NsNavGroup);

declare global {
  interface HTMLElementTagNameMap {
    "ns-nav-group": NsNavGroup;
  }
}
```

- [ ] **Step 3: `src/index.ts` 갱신**

```ts
import "./components/nav-group/ns-nav-group.js";
import "./components/nav-item/ns-nav-item.js";

export { NsNavGroup } from "./components/nav-group/ns-nav-group.js";
export { NsNavItem } from "./components/nav-item/ns-nav-item.js";
export type { NsToggleDetail, NsNavigateDetail } from "./types.js";
```

- [ ] **Step 4: `index.html`에 섹션 추가**

`ns-nav-item` 섹션 **앞에** 넣는다(문서는 바깥에서 안으로 읽는 편이 낫다).

```html
  <h2 id="ns-nav-group">ns-nav-group</h2>
  <p>제목이 붙은 네비게이션 그룹. 하위에 <code>ns-nav-item</code> 을 넣는다.</p>

  <h3>데모</h3>
  <template class="ex">
    <ns-nav-group heading="프로젝트">
      <ns-nav-item href="/a" label="프로젝트 A" badge="PA" active></ns-nav-item>
      <ns-nav-item href="/b" label="프로젝트 B" badge="PB"></ns-nav-item>
    </ns-nav-group>
    <ns-nav-group heading="관리">
      <ns-nav-item href="/admin" label="사용자 관리" badge="UM"></ns-nav-item>
    </ns-nav-group>
  </template>
  <div class="demo block" style="width: var(--sidebar-width)"></div>
  <pre></pre>

  <h3>프로퍼티</h3>
  <table>
    <tr><th>프로퍼티</th><th>속성</th><th>타입</th><th>기본값</th><th>설명</th></tr>
    <tr><td><code>heading</code></td><td><code>heading</code></td><td>string</td><td><code>""</code></td><td>그룹 제목. 접히면 시각적으로 숨지만 <code>aria-label</code> 로 남는다</td></tr>
  </table>

  <h3>slot</h3>
  <table>
    <tr><th>이름</th><th>위치</th><th>용도</th></tr>
    <tr><td>(기본)</td><td>제목 아래</td><td><code>ns-nav-item</code> 목록. 로딩·에러 UI 를 넣어도 된다</td></tr>
  </table>

  <h3>이벤트</h3>
  <p>자체 이벤트가 없다. 하위 <code>ns-nav-item</code> 의 <code>ns-navigate</code> 가 통과해 올라간다.</p>

  <h3>HTML</h3>
  <script type="text/plain">
    <ns-nav-group heading="프로젝트">
      <ns-nav-item href="/a" label="프로젝트 A" badge="PA"></ns-nav-item>
    </ns-nav-group>
  </script>

  <h3>React</h3>
  <script type="text/plain">
    import { NsNavGroup, NsNavItem } from "@neosimplix/common-ui/react";

    <NsNavGroup heading="프로젝트">
      {projects.map((p) => (
        <NsNavItem key={p.href} href={p.href} label={p.label} badge={p.badge}
                   active={pathname === p.href} />
      ))}
    </NsNavGroup>
  </script>
```

- [ ] **Step 5: 타입 검사**

Run: `npm run check`
Expected: 출력 없이 종료 코드 0.

- [ ] **Step 6: 브라우저에서 동작 확인**

Run: `npm run demo`

확인 항목:
1. "프로젝트"와 "관리" 두 제목이 회색 소문자 간격 넓은 스타일로 보인다
2. 두 번째 그룹 위에 여백이 있다(`:host(:not(:first-child))`)
3. 각 그룹 아래에 항목이 들여쓰기되어 보인다

- [ ] **Step 7: 커밋**

```bash
git add src/components/nav-group src/index.ts index.html
git commit -m "feat(nav-group): 네비게이션 그룹 컴포넌트 추가

그룹 간 여백은 :host(:not(:first-child)) 로 준다. ::slotted() 가
결합자를 받지 않아 사이드바 쪽에서는 형제 선택이 불가능하다."
```

---

### Task 7: `ns-sidebar`

**Files:**
- Create: `src/components/sidebar/ns-sidebar.ts`, `src/components/sidebar/ns-sidebar.styles.ts`
- Modify: `src/index.ts`, `index.html`

**Interfaces:**
- Consumes: `register`, `warnIfTokensMissing` (Task 3), `ns-nav-group` (Task 6)
- Produces:
  - `class NsSidebar extends LitElement` — 프로퍼티 `open: boolean`
  - 커스텀 엘리먼트 `ns-sidebar`, 기본 slot(`ns-nav-group` 목록)
  - `::slotted(ns-nav-group)`에 `--ns-label-display`를 내려 접힘을 전파한다

- [ ] **Step 1: `src/components/sidebar/ns-sidebar.styles.ts` 작성**

```ts
import { css } from "lit";

export const styles = css`
  /*
    overflow-y: auto 가 동작하려면 조상 체인에 실제 높이가 이어져 있어야
    한다. 소비자가 이 엘리먼트에 높이를 주는 레이아웃에 넣어야 한다.
  */
  :host {
    display: block;
    box-sizing: border-box;
    height: 100%;
    min-height: 0;
    width: var(--sidebar-width);
    overflow-x: hidden;
    overflow-y: auto;
    border-right: 1px solid var(--color-line);
    background: var(--color-surface);
    transition: width 200ms var(--transition-ease);
  }

  :host(:not([open])) {
    width: var(--sidebar-width-collapsed);
  }

  /*
    접힘 상태를 하위에 전달하는 통로.

    shadow 안에서는 조상을 볼 수 없고 :host-context() 는 Chromium 전용이라
    쓸 수 없다. ::slotted() 로 직계 자식에 커스텀 프로퍼티를 내려주면
    상속을 타고 nav-group 의 shadow 와 그 아래 nav-item 까지 도달한다.
  */
  ::slotted(ns-nav-group) {
    --ns-label-display: block;
  }

  :host(:not([open])) ::slotted(ns-nav-group) {
    --ns-label-display: none;
  }
`;
```

- [ ] **Step 2: `src/components/sidebar/ns-sidebar.ts` 작성**

```ts
import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { register } from "../../internal/register.js";
import { warnIfTokensMissing } from "../../internal/warn-missing-tokens.js";
import { styles } from "./ns-sidebar.styles.js";

export class NsSidebar extends LitElement {
  static override styles = styles;

  /**
   * 펼침 여부. 접히면 완전히 사라지지 않고 레일(--sidebar-width-collapsed)이 남는다.
   * 컴포넌트가 스스로 바꾸지 않는다 — ns-header 의 ns-toggle 을 받아 소비자가 내려준다.
   */
  @property({ type: Boolean, reflect: true }) open = false;

  override connectedCallback(): void {
    super.connectedCallback();
    warnIfTokensMissing();
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

- [ ] **Step 3: `src/index.ts` 갱신**

```ts
import "./components/nav-group/ns-nav-group.js";
import "./components/nav-item/ns-nav-item.js";
import "./components/sidebar/ns-sidebar.js";

export { NsNavGroup } from "./components/nav-group/ns-nav-group.js";
export { NsNavItem } from "./components/nav-item/ns-nav-item.js";
export { NsSidebar } from "./components/sidebar/ns-sidebar.js";
export type { NsToggleDetail, NsNavigateDetail } from "./types.js";
```

- [ ] **Step 4: `index.html`에 섹션 추가**

`ns-nav-group` 섹션 앞에 넣는다.

```html
  <h2 id="ns-sidebar">ns-sidebar</h2>
  <p>
    네비게이션 그룹을 담는 사이드바. 접어도 완전히 사라지지 않고 좌측에 레일이 남아
    배지로 항목을 계속 볼 수 있다.
  </p>

  <h3>데모</h3>
  <template class="ex">
    <ns-sidebar open id="demo-sidebar">
      <ns-nav-group heading="프로젝트">
        <ns-nav-item href="/a" label="프로젝트 A" badge="PA" active></ns-nav-item>
        <ns-nav-item href="/b" label="프로젝트 B" badge="PB"></ns-nav-item>
      </ns-nav-group>
      <ns-nav-group heading="관리">
        <ns-nav-item href="/admin" label="사용자 관리" badge="UM">
          <span slot="trailing">2</span>
        </ns-nav-item>
      </ns-nav-group>
    </ns-sidebar>
  </template>
  <div class="demo"></div>
  <pre></pre>
  <p><button id="demo-sidebar-toggle">접기 / 펴기</button> <span id="sidebar-log"></span></p>

  <h3>프로퍼티</h3>
  <table>
    <tr><th>프로퍼티</th><th>속성</th><th>타입</th><th>기본값</th><th>설명</th></tr>
    <tr><td><code>open</code></td><td><code>open</code></td><td>boolean</td><td><code>false</code></td><td>펼침 여부. 접히면 <code>--sidebar-width-collapsed</code>(4rem) 레일만 남는다</td></tr>
  </table>

  <h3>slot</h3>
  <table>
    <tr><th>이름</th><th>위치</th><th>용도</th></tr>
    <tr><td>(기본)</td><td>사이드바 전체</td><td><code>ns-nav-group</code> 목록</td></tr>
  </table>

  <h3>이벤트</h3>
  <p>
    자체 이벤트가 없다. 하위 <code>ns-nav-item</code> 의 <code>ns-navigate</code> 가
    <code>composed: true</code> 로 통과해 올라오므로, 사이드바에서 한 번만 듣는 것이 편하다.
  </p>

  <h3>주의</h3>
  <p>
    <code>overflow-y: auto</code> 가 동작하려면 이 엘리먼트에 높이가 잡혀야 한다.
    부모가 높이를 가진 flex 컨테이너인 레이아웃에 넣는다.
  </p>

  <h3>HTML — 마크업</h3>
  <script type="text/plain">
    <ns-sidebar open>
      <ns-nav-group heading="프로젝트">
        <ns-nav-item href="/a" label="프로젝트 A" badge="PA"></ns-nav-item>
      </ns-nav-group>
    </ns-sidebar>
  </script>

  <h3>HTML — 배선</h3>
  <script type="text/plain">
    const sidebar = document.querySelector("ns-sidebar");

    // ns-navigate 는 composed 라 항목에서 사이드바까지 올라온다.
    sidebar.addEventListener("ns-navigate", (e) => { location.href = e.detail.href; });

    sidebar.open = false;   // 접기. 컴포넌트가 스스로 바꾸지 않는다
  </script>

  <h3>React</h3>
  <script type="text/plain">
    import { NsSidebar, NsNavGroup, NsNavItem } from "@neosimplix/common-ui/react";

    <NsSidebar open={open} onNsNavigate={(e) => router.push(e.detail.href)}>
      <NsNavGroup heading="프로젝트">
        <NsNavItem href="/a" label="프로젝트 A" badge="PA" active={pathname === "/a"} />
      </NsNavGroup>
    </NsSidebar>
  </script>
```

헬퍼 스크립트 뒤에 배선을 추가한다.

```js
  const demoSidebar = document.getElementById("demo-sidebar");
  const demoSidebarToggle = document.getElementById("demo-sidebar-toggle");
  const sidebarLog = document.getElementById("sidebar-log");
  if (demoSidebar && demoSidebarToggle) {
    demoSidebarToggle.addEventListener("click", () => {
      demoSidebar.open = !demoSidebar.open;
    });
    // 사이드바에 붙인다. document 에 붙이면 다른 데모의 이벤트까지 잡는다.
    demoSidebar.addEventListener("ns-navigate", (e) => {
      sidebarLog.textContent = `ns-navigate  href=${e.detail.href}`;
    });
  }
```

- [ ] **Step 5: 타입 검사**

Run: `npm run check`
Expected: 출력 없이 종료 코드 0.

- [ ] **Step 6: 브라우저에서 접힘 전파 확인**

Run: `npm run demo`

확인 항목:
1. 사이드바 폭이 240px이고 그룹 제목과 라벨이 보인다
2. "접기 / 펴기"를 누르면 폭이 64px로 **애니메이션되며** 줄고, **그룹 제목과 라벨과 trailing 배지가 모두 사라지고 두 글자 배지만 남는다**
3. 다시 누르면 원래대로 돌아온다
4. 접힌 상태에서 배지를 클릭하면 로그에 `ns-navigate href=/a`가 찍힌다
5. 위쪽 `ns-nav-group` 데모의 항목을 클릭해도 이 로그는 **바뀌지 않는다**(리스너 격리)

2번이 이 Task의 핵심이다. `::slotted()`로 내려준 `--ns-label-display`가 nav-group의 shadow와 nav-item의 shadow까지 상속으로 도달했다는 증거다.

- [ ] **Step 7: 커밋**

```bash
git add src/components/sidebar src/index.ts index.html
git commit -m "feat(sidebar): 접힘 레일을 유지하는 사이드바 컴포넌트 추가

접힘 상태는 ::slotted() 로 --ns-label-display 를 내려 전파한다.
shadow 안에서 조상을 볼 수 없고 :host-context() 는 Chromium 전용이라
이 방법이 표준 범위에서 유일하게 동작한다."
```

---

### Task 8: `ns-header`

**Files:**
- Create: `src/components/header/ns-header.ts`, `src/components/header/ns-header.styles.ts`
- Modify: `src/index.ts`, `index.html`

**Interfaces:**
- Consumes: `register`, `warnIfTokensMissing`, `NsToggleDetail` (Task 3)
- Produces:
  - `class NsHeader extends LitElement` — 프로퍼티 `projectName: string`(속성 `project-name`), `sidebarOpen: boolean`(속성 `sidebar-open`)
  - 커스텀 엘리먼트 `ns-header`, slot `actions`
  - 이벤트 `ns-toggle`, detail `NsToggleDetail`

- [ ] **Step 1: `src/components/header/ns-header.styles.ts` 작성**

```ts
import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    box-sizing: border-box;
    height: var(--header-height);
  }

  header {
    display: flex;
    height: 100%;
    align-items: center;
    gap: var(--space-3);
    border-bottom: 1px solid var(--color-line);
    background: var(--color-surface);
    padding-inline: var(--space-4);
  }

  .toggle {
    flex: none;
    display: grid;
    place-items: center;
    width: var(--control-height-md);
    height: var(--control-height-md);
    border: 0;
    border-radius: var(--radius-control);
    background: transparent;
    color: var(--color-fg-body);
    cursor: pointer;
    transition: background-color var(--transition-fast) var(--transition-ease);
  }

  .toggle:hover {
    background: var(--color-surface-hover);
  }

  .title {
    font-weight: var(--weight-semibold);
    color: var(--color-fg);
  }

  /* margin-left: auto 가 남은 공간을 흡수해 actions 를 우측에 붙인다. */
  .actions {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }
`;
```

- [ ] **Step 2: `src/components/header/ns-header.ts` 작성**

```ts
import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { register } from "../../internal/register.js";
import { warnIfTokensMissing } from "../../internal/warn-missing-tokens.js";
import type { NsToggleDetail } from "../../types.js";
import { styles } from "./ns-header.styles.js";

export class NsHeader extends LitElement {
  static override styles = styles;

  /** 헤더 좌측에 표시할 프로젝트 이름. */
  @property({ type: String, attribute: "project-name" }) projectName = "";

  /**
   * 사이드바 펼침 여부. 토글 버튼의 aria-expanded 와 aria-label 을 결정한다.
   * 컴포넌트가 스스로 바꾸지 않는다 — ns-toggle 을 받아 소비자가 내려준다.
   */
  @property({ type: Boolean, reflect: true, attribute: "sidebar-open" }) sidebarOpen = false;

  override connectedCallback(): void {
    super.connectedCallback();
    warnIfTokensMissing();
  }

  override render() {
    return html`
      <header>
        <button
          class="toggle"
          type="button"
          aria-expanded=${this.sidebarOpen ? "true" : "false"}
          aria-label=${this.sidebarOpen ? "사이드바 닫기" : "사이드바 열기"}
          @click=${this.#onToggle}
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <span class="title">${this.projectName}</span>

        <div class="actions"><slot name="actions"></slot></div>
      </header>
    `;
  }

  /** detail.open 은 현재 상태가 아니라 "요청되는 다음 상태"다. */
  #onToggle = (): void => {
    const detail: NsToggleDetail = { open: !this.sidebarOpen };
    this.dispatchEvent(
      new CustomEvent("ns-toggle", { detail, bubbles: true, composed: true }),
    );
  };
}

register("ns-header", NsHeader);

declare global {
  interface HTMLElementTagNameMap {
    "ns-header": NsHeader;
  }
}
```

- [ ] **Step 3: `src/index.ts` 갱신**

```ts
import "./components/header/ns-header.js";
import "./components/nav-group/ns-nav-group.js";
import "./components/nav-item/ns-nav-item.js";
import "./components/sidebar/ns-sidebar.js";

export { NsHeader } from "./components/header/ns-header.js";
export { NsNavGroup } from "./components/nav-group/ns-nav-group.js";
export { NsNavItem } from "./components/nav-item/ns-nav-item.js";
export { NsSidebar } from "./components/sidebar/ns-sidebar.js";
export type { NsToggleDetail, NsNavigateDetail } from "./types.js";
```

- [ ] **Step 4: `index.html`에 섹션 추가**

`ns-sidebar` 섹션 앞, 즉 컴포넌트 섹션들의 맨 앞에 넣는다.

```html
  <h2 id="ns-header">ns-header</h2>
  <p>
    좌측 토글 버튼과 프로젝트 이름은 공통이고, 우측은 <code>actions</code> slot 으로
    각 프로젝트가 원하는 것을 넣는다.
  </p>

  <h3>데모</h3>
  <template class="ex">
    <ns-header project-name="대시보드" sidebar-open id="demo-header">
      <div slot="actions">
        <span style="font-size: var(--font-size-sm)">홍길동</span>
        <button>로그아웃</button>
      </div>
    </ns-header>
  </template>
  <div class="demo block"></div>
  <pre></pre>
  <p id="header-log">토글 버튼을 누르면 여기에 이벤트가 찍힌다.</p>

  <h3>프로퍼티</h3>
  <table>
    <tr><th>프로퍼티</th><th>속성</th><th>타입</th><th>기본값</th><th>설명</th></tr>
    <tr><td><code>projectName</code></td><td><code>project-name</code></td><td>string</td><td><code>""</code></td><td>토글 버튼 옆에 표시할 제목</td></tr>
    <tr><td><code>sidebarOpen</code></td><td><code>sidebar-open</code></td><td>boolean</td><td><code>false</code></td><td>토글 버튼의 <code>aria-expanded</code> 와 <code>aria-label</code> 을 결정한다</td></tr>
  </table>

  <h3>slot</h3>
  <table>
    <tr><th>이름</th><th>위치</th><th>용도</th></tr>
    <tr><td><code>actions</code></td><td>우측 끝</td><td>사용자 정보, 로그아웃, 알림 등 프로젝트마다 다른 것 전부</td></tr>
  </table>

  <h3>이벤트</h3>
  <table>
    <tr><th>이름</th><th>detail</th><th>발생 시점</th></tr>
    <tr><td><code>ns-toggle</code></td><td><code>{ open: boolean }</code></td><td>토글 버튼 클릭. <code>open</code> 은 현재 상태가 아니라 <strong>요청되는 다음 상태</strong>다</td></tr>
  </table>

  <h3>주의</h3>
  <p>
    토글을 눌러도 <code>sidebarOpen</code> 은 저절로 바뀌지 않는다. 컴포넌트가 자기 상태를
    바꾸면 React 의 state 와 어긋나 화면이 튀기 때문이다. 이벤트를 받아 되돌려줘야 한다.
  </p>

  <h3>HTML — 마크업</h3>
  <script type="text/plain">
    <ns-header project-name="대시보드" sidebar-open>
      <button slot="actions">로그아웃</button>
    </ns-header>
  </script>

  <h3>HTML — 배선</h3>
  <script type="text/plain">
    const header = document.querySelector("ns-header");
    const sidebar = document.querySelector("ns-sidebar");

    header.addEventListener("ns-toggle", (e) => {
      header.sidebarOpen = e.detail.open;   // 상태는 우리가 되돌려준다
      sidebar.open = e.detail.open;
    });
  </script>

  <h3>React</h3>
  <script type="text/plain">
    import { NsHeader } from "@neosimplix/common-ui/react";

    const [open, setOpen] = useState(true);

    <NsHeader projectName="대시보드" sidebarOpen={open} onNsToggle={(e) => setOpen(e.detail.open)}>
      <div slot="actions">
        <UserMenu />
        <SignOutButton />
      </div>
    </NsHeader>
  </script>
```

헬퍼 스크립트 뒤에 배선을 추가한다.

```js
  const demoHeader = document.getElementById("demo-header");
  const headerLog = document.getElementById("header-log");
  if (demoHeader && headerLog) {
    demoHeader.addEventListener("ns-toggle", (e) => {
      demoHeader.sidebarOpen = e.detail.open;   // 소비자가 되돌려준다
      headerLog.textContent = `ns-toggle  open=${e.detail.open}`;
    });
  }
```

- [ ] **Step 5: 타입 검사**

Run: `npm run check`
Expected: 출력 없이 종료 코드 0.

- [ ] **Step 6: 브라우저에서 동작 확인**

Run: `npm run demo`

확인 항목:
1. 헤더 좌측에 햄버거 아이콘, 그 옆에 "대시보드", 우측 끝에 "홍길동"과 로그아웃 버튼이 보인다
2. 토글 버튼을 누르면 로그가 `ns-toggle open=false`로 바뀐다
3. 다시 누르면 `ns-toggle open=true`로 바뀐다 — 소비자가 `sidebarOpen`을 되돌려줬기 때문이다
4. 브라우저 개발자 도구에서 `<ns-header>`를 선택해 shadow root의 버튼 `aria-label`이 상태에 따라 "사이드바 닫기"/"사이드바 열기"로 바뀌는지 확인한다

- [ ] **Step 7: 커밋**

```bash
git add src/components/header src/index.ts index.html
git commit -m "feat(header): 토글 버튼과 actions slot 을 가진 헤더 추가

ns-toggle 의 detail.open 은 현재 상태가 아니라 요청되는 다음 상태다.
컴포넌트는 sidebarOpen 을 스스로 바꾸지 않고 소비자가 되돌려준다."
```

---

### Task 9: React 래퍼와 이벤트 매핑 검사

**Files:**
- Modify: `src/react/index.ts`, `package.json`
- Create: `scripts/check-events.mjs`

**Interfaces:**
- Consumes: 네 컴포넌트 클래스 (Task 5~8)
- Produces:
  - `NsHeader`, `NsSidebar`, `NsNavGroup`, `NsNavItem` React 컴포넌트
  - `npm run check`가 타입 검사 + 이벤트 매핑 검사를 함께 수행

- [ ] **Step 1: `src/react/index.ts` 작성**

```ts
import * as React from "react";
import { createComponent } from "@lit/react";

import { NsHeader as NsHeaderElement } from "../components/header/ns-header.js";
import { NsNavGroup as NsNavGroupElement } from "../components/nav-group/ns-nav-group.js";
import { NsNavItem as NsNavItemElement } from "../components/nav-item/ns-nav-item.js";
import { NsSidebar as NsSidebarElement } from "../components/sidebar/ns-sidebar.js";

/*
  프로퍼티 타입은 createComponent 가 Lit 클래스에서 자동으로 끌어온다.
  이벤트만 손으로 적는다 — 그래서 scripts/check-events.mjs 가 이 파일과
  컴포넌트의 dispatchEvent 를 대조한다.
*/

export const NsHeader = createComponent({
  react: React,
  tagName: "ns-header",
  elementClass: NsHeaderElement,
  events: { onNsToggle: "ns-toggle" },
});

/*
  ns-navigate 는 composed: true 로 올라오므로 사이드바와 그룹에서도
  받을 수 있다. 항목마다 핸들러를 다는 대신 사이드바에서 한 번만 듣는
  쪽이 편해서 세 곳 모두에 매핑해 둔다.
*/
export const NsSidebar = createComponent({
  react: React,
  tagName: "ns-sidebar",
  elementClass: NsSidebarElement,
  events: { onNsNavigate: "ns-navigate" },
});

export const NsNavGroup = createComponent({
  react: React,
  tagName: "ns-nav-group",
  elementClass: NsNavGroupElement,
  events: { onNsNavigate: "ns-navigate" },
});

export const NsNavItem = createComponent({
  react: React,
  tagName: "ns-nav-item",
  elementClass: NsNavItemElement,
  events: { onNsNavigate: "ns-navigate" },
});

export type { NsToggleDetail, NsNavigateDetail } from "../types.js";
```

- [ ] **Step 2: `scripts/check-events.mjs` 작성**

```js
/*
  컴포넌트가 발생시키는 커스텀 이벤트가 React 래퍼에 빠짐없이 등록됐는지
  확인한다.

  createComponent 는 프로퍼티 타입은 자동으로 끌어오지만 이벤트 매핑은
  손으로 적어야 한다. 컴포넌트에 이벤트를 추가하고 래퍼를 깜빡하면
  React 사용자에게만 조용히 동작하지 않는다. 그 드리프트를 여기서 잡는다.
*/
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return walk(p);
    return p.endsWith(".ts") ? [p] : [];
  });

const emitted = new Set();
for (const file of walk("src/components")) {
  const source = readFileSync(file, "utf8");
  for (const m of source.matchAll(/new CustomEvent\(\s*["']([^"']+)["']/g)) {
    emitted.add(m[1]);
  }
}

const wrapper = readFileSync("src/react/index.ts", "utf8");
const mapped = new Set(
  [...wrapper.matchAll(/on[A-Za-z0-9]+:\s*["']([^"']+)["']/g)].map((m) => m[1]),
);

const missing = [...emitted].filter((name) => !mapped.has(name)).sort();
if (missing.length > 0) {
  console.error(
    `React 래퍼(src/react/index.ts)에 등록되지 않은 이벤트: ${missing.join(", ")}`,
  );
  process.exit(1);
}

const unused = [...mapped].filter((name) => !emitted.has(name)).sort();
if (unused.length > 0) {
  console.error(
    `어떤 컴포넌트도 발생시키지 않는 이벤트가 래퍼에 있습니다: ${unused.join(", ")}`,
  );
  process.exit(1);
}

console.log(`이벤트 매핑 확인 완료: ${[...emitted].sort().join(", ")}`);
```

- [ ] **Step 3: `package.json`의 `check` 스크립트 갱신**

```json
"check": "tsc -p tsconfig.json && node scripts/check-events.mjs",
```

- [ ] **Step 4: 검사가 통과하는지 확인**

Run: `npm run check`
Expected: 마지막 줄에 `이벤트 매핑 확인 완료: ns-navigate, ns-toggle`

- [ ] **Step 5: 검사가 실제로 드리프트를 잡는지 확인**

`src/components/header/ns-header.ts`의 `#onToggle` 안에 임시로 한 줄을 넣는다.

```ts
    this.dispatchEvent(new CustomEvent("ns-bogus", { bubbles: true, composed: true }));
```

Run: `npm run check`
Expected: 종료 코드 1과 `React 래퍼(src/react/index.ts)에 등록되지 않은 이벤트: ns-bogus`

확인 후 그 줄을 **반드시 삭제**하고 다시 실행한다.

Run: `npm run check`
Expected: 다시 통과.

이 단계가 이 Task에서 가장 중요하다. 검사 스크립트가 실제로 실패할 수 있다는 증거 없이는 통과가 아무 의미도 없다.

- [ ] **Step 6: 빌드 산출물 확인**

Run: `npm run build && head -1 dist/react.js && ls dist/react`
Expected: 첫 줄이 `'use client';`이고 `dist/react/index.d.ts`가 존재한다.

- [ ] **Step 7: 커밋**

```bash
git add src/react/index.ts scripts/check-events.mjs package.json
git commit -m "feat(react): 네 컴포넌트의 React 래퍼와 이벤트 매핑 검사 추가

createComponent 는 프로퍼티 타입만 자동으로 끌어오고 이벤트 매핑은
손으로 적어야 한다. check-events 가 dispatchEvent 와 래퍼를 대조해
드리프트를 빌드 전에 잡는다."
```

---

### Task 10: 문서 셸 전환과 설치·연동·토큰 섹션

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: 네 컴포넌트 (Task 5~8)
- Produces: 완성된 문서 페이지. 셸 자체가 우리 컴포넌트로 만들어져 회귀 확인 수단이 된다

- [ ] **Step 1: `<body>` 구조를 셸로 교체**

기존 `<main>…</main>`을 감싸는 형태로 바꾼다. 컴포넌트 섹션들의 내용은 그대로 둔다.

```html
<ns-header project-name="common-ui" sidebar-open id="docs-header"></ns-header>

<div class="shell">
  <ns-sidebar open id="docs-nav">
    <ns-nav-group heading="시작하기">
      <ns-nav-item href="#install" label="설치" badge="설치" active></ns-nav-item>
      <ns-nav-item href="#usage" label="환경별 연동" badge="연동"></ns-nav-item>
    </ns-nav-group>
    <ns-nav-group heading="기초">
      <ns-nav-item href="#tokens" label="디자인 토큰" badge="토큰"></ns-nav-item>
    </ns-nav-group>
    <ns-nav-group heading="컴포넌트">
      <ns-nav-item href="#ns-header" label="ns-header" badge="HD"></ns-nav-item>
      <ns-nav-item href="#ns-sidebar" label="ns-sidebar" badge="SB"></ns-nav-item>
      <ns-nav-item href="#ns-nav-group" label="ns-nav-group" badge="NG"></ns-nav-item>
      <ns-nav-item href="#ns-nav-item" label="ns-nav-item" badge="NI"></ns-nav-item>
    </ns-nav-group>
    <ns-nav-group heading="예시">
      <ns-nav-item href="#full" label="전체 셸 조합" badge="셸"></ns-nav-item>
    </ns-nav-group>
  </ns-sidebar>

  <main>
    <!-- 기존 내용 그대로 -->
  </main>
</div>
```

`<style>`에 셸 레이아웃을 추가한다.

```css
  /* 사이드바의 overflow-y 가 동작하려면 높이 체인이 끊기지 않아야 한다. */
  html, body { height: 100%; }
  body { display: flex; flex-direction: column; }
  .shell { display: flex; flex: 1; min-height: 0; }
  main { flex: 1; overflow-y: auto; max-width: none; }
  main > * { max-width: 56rem; }
```

- [ ] **Step 2: 셸 배선 추가**

헬퍼 스크립트 뒤에 넣는다.

```js
  const docsHeader = document.getElementById("docs-header");
  const docsNav = document.getElementById("docs-nav");

  docsHeader.addEventListener("ns-toggle", (e) => {
    docsHeader.sidebarOpen = e.detail.open;
    docsNav.open = e.detail.open;
  });

  // document 가 아니라 셸 사이드바에 붙인다. ns-navigate 는 composed 라
  // 데모 안에서 발생한 것도 document 까지 올라온다.
  docsNav.addEventListener("ns-navigate", (e) => {
    document.querySelector(e.detail.href)?.scrollIntoView({ behavior: "smooth" });
    history.replaceState(null, "", e.detail.href);
  });

  // 스크롤에 따라 active 를 옮긴다. active 프로퍼티의 데모이기도 하다.
  const navItems = [...docsNav.querySelectorAll("ns-nav-item")];
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const item of navItems) {
          item.active = item.href === `#${entry.target.id}`;
        }
      }
    },
    { rootMargin: "0px 0px -70% 0px" },
  );
  for (const item of navItems) {
    const target = document.querySelector(item.href);
    if (target) observer.observe(target);
  }
```

- [ ] **Step 3: 설치 섹션 추가**

`<main>` 맨 앞에 넣는다.

```html
  <h2 id="install">설치</h2>
  <p>
    npm 레지스트리에 올리지 않는다. git 태그로 버전을 관리하고 소비자는 git 의존성으로 설치한다.
    <code>package.json</code> 에 한 줄을 넣는다.
  </p>
  <script type="text/plain">
    {
      "dependencies": {
        "@neosimplix/common-ui": "git+ssh://git@github.com/neosimplix/common-ui.git#v0.1.0"
      }
    }
  </script>
  <p>
    업그레이드는 태그 번호만 바꾸면 된다. <code>#v0.1.0</code> → <code>#v0.2.0</code>.
  </p>
  <p>
    <code>main</code> 브랜치에는 <code>dist</code> 가 없다. 빌드 산출물은 릴리스 태그가 가리키는
    커밋에만 들어 있으므로, 반드시 태그를 지정해 설치한다.
  </p>
```

- [ ] **Step 4: 환경별 연동 섹션 추가**

```html
  <h2 id="usage">환경별 연동</h2>
  <p>
    <strong>어느 환경이든 <code>tokens.css</code> 를 반드시 불러와야 한다.</strong>
    컴포넌트 스타일은 이 파일이 정의하는 CSS 변수를 값 없이 참조하므로, 빠지면
    레이아웃이 무너진다. 잊으면 콘솔에 경고가 뜬다.
  </p>

  <h3>Next.js (App Router)</h3>
  <script type="text/plain">
    // app/layout.tsx
    import "@neosimplix/common-ui/tokens.css";

    // app/shell.tsx
    "use client";
    import { useState } from "react";
    import { usePathname, useRouter } from "next/navigation";
    import { NsHeader, NsSidebar, NsNavGroup, NsNavItem } from "@neosimplix/common-ui/react";

    export function Shell({ children }) {
      const [open, setOpen] = useState(true);
      const pathname = usePathname();
      const router = useRouter();

      return (
        <>
          <NsHeader projectName="대시보드" sidebarOpen={open}
                    onNsToggle={(e) => setOpen(e.detail.open)}>
            <div slot="actions"><UserMenu /></div>
          </NsHeader>
          <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
            <NsSidebar open={open} onNsNavigate={(e) => router.push(e.detail.href)}>
              <NsNavGroup heading="프로젝트">
                <NsNavItem href="/a" label="프로젝트 A" badge="PA"
                           active={pathname === "/a"} />
              </NsNavGroup>
            </NsSidebar>
            <main>{children}</main>
          </div>
        </>
      );
    }
  </script>

  <h3>React 18 (Vite 등)</h3>
  <p>코드가 Next 와 완전히 동일하다. 래퍼가 React 18 과 19 의 차이를 흡수한다.</p>

  <h3>순수 HTML</h3>
  <p>
    빌드 도구가 필요 없다. UMD 번들은 <code>type</code> 없는 클래식 script 로 불러야 한다 —
    <code>file://</code> 에서 <code>type="module"</code> 은 CORS 로 막힌다.
  </p>
  <ul>
    <li><code>dist/tokens.css</code> 를 <code>&lt;link rel="stylesheet"&gt;</code> 로</li>
    <li><code>dist/bundle.umd.js</code> 를 <code>&lt;script src&gt;</code> 로 (<code>type</code> 없이)</li>
  </ul>

  <h4>마크업</h4>
  <script type="text/plain">
    <ns-header project-name="대시보드" sidebar-open>
      <button slot="actions">로그아웃</button>
    </ns-header>
    <ns-sidebar open>
      <ns-nav-group heading="프로젝트">
        <ns-nav-item href="/a" label="프로젝트 A" badge="PA"></ns-nav-item>
      </ns-nav-group>
    </ns-sidebar>
  </script>

  <h4>배선</h4>
  <script type="text/plain">
    const header = document.querySelector("ns-header");
    const sidebar = document.querySelector("ns-sidebar");

    header.addEventListener("ns-toggle", (e) => {
      header.sidebarOpen = e.detail.open;
      sidebar.open = e.detail.open;
    });
    sidebar.addEventListener("ns-navigate", (e) => { location.href = e.detail.href; });
  </script>
```

- [ ] **Step 5: 디자인 토큰 섹션 추가**

```html
  <h2 id="tokens">디자인 토큰</h2>
  <p>
    토큰 이름은 <code>dashboard-shell/app/globals.css</code> 와 동일하다. 접두사가 없으므로
    이미 그 이름을 쓰던 코드는 그대로 동작한다.
  </p>
  <p>브랜드 색을 바꾸려면 <code>:root</code> 에서 다시 정의한다. 문서 쪽 선언이 항상 이긴다.</p>
  <script type="text/plain">
    :root {
      --color-accent: #2563eb;
      --color-accent-hover: #1d4ed8;
    }
  </script>

  <div class="demo block" style="padding: var(--space-4)">
    <div id="token-swatches" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(11rem,1fr));gap:var(--space-2)"></div>
  </div>
```

색 견본은 스크립트로 만든다. 손으로 적으면 `tokens.css`와 어긋난다.

```js
  const swatchNames = [
    "--color-surface", "--color-surface-sunken", "--color-surface-hover",
    "--color-line", "--color-line-strong",
    "--color-fg", "--color-fg-body", "--color-fg-muted", "--color-fg-subtle",
    "--color-accent", "--color-accent-hover", "--color-accent-fg", "--color-disabled",
    "--color-danger", "--color-danger-surface", "--color-warn", "--color-warn-surface",
    "--color-success", "--color-success-surface",
  ];
  const swatches = document.getElementById("token-swatches");
  if (swatches) {
    const root = getComputedStyle(document.documentElement);
    for (const name of swatchNames) {
      const cell = document.createElement("div");
      cell.style.cssText = "display:flex;align-items:center;gap:var(--space-2);font-size:var(--font-size-xs)";
      cell.innerHTML =
        `<span style="width:1.5rem;height:1.5rem;flex:none;border-radius:var(--radius-badge);` +
        `border:1px solid var(--color-line);background:var(${name})"></span>` +
        `<code>${name}</code>`;
      cell.title = root.getPropertyValue(name).trim();
      swatches.append(cell);
    }
  }
```

- [ ] **Step 6: 전체 셸 조합 섹션 추가**

`<main>` 맨 끝, 컴포넌트 섹션들 다음에 넣는다. 페이지 셸 자체가 이미 조합 예시이지만, 한 화면 안에서 전체를 보고 배선 코드를 함께 읽을 수 있는 자리가 따로 있는 편이 낫다.

```html
  <h2 id="full">전체 셸 조합</h2>
  <p>헤더의 토글이 사이드바를 접고, 항목 클릭이 라우팅 이벤트를 올린다.</p>

  <template class="ex">
    <div style="display:flex;flex-direction:column;height:100%;width:100%" id="full-demo">
      <ns-header project-name="대시보드" sidebar-open></ns-header>
      <div style="display:flex;flex:1;min-height:0">
        <ns-sidebar open>
          <ns-nav-group heading="프로젝트">
            <ns-nav-item href="/a" label="프로젝트 A" badge="PA" active></ns-nav-item>
            <ns-nav-item href="/b" label="프로젝트 B" badge="PB"></ns-nav-item>
          </ns-nav-group>
          <ns-nav-group heading="관리">
            <ns-nav-item href="/admin" label="사용자 관리" badge="UM"></ns-nav-item>
          </ns-nav-group>
        </ns-sidebar>
        <div style="flex:1;padding:var(--space-4);background:var(--color-surface-sunken)">
          <span id="full-log">토글을 누르거나 항목을 클릭해보세요.</span>
        </div>
      </div>
    </div>
  </template>
  <div class="demo"></div>
  <pre></pre>

  <h3>배선</h3>
  <script type="text/plain">
    const header = document.querySelector("ns-header");
    const sidebar = document.querySelector("ns-sidebar");

    // 컴포넌트는 자기 상태를 바꾸지 않는다. 이벤트를 받아 되돌려준다.
    header.addEventListener("ns-toggle", (e) => {
      header.sidebarOpen = e.detail.open;
      sidebar.open = e.detail.open;
    });

    // ns-navigate 는 composed 라 사이드바에서 한 번만 들으면 된다.
    sidebar.addEventListener("ns-navigate", (e) => {
      router.push(e.detail.href);
    });
  </script>
```

배선 스크립트 뒤에 데모용 배선을 추가한다.

```js
  const fullDemo = document.getElementById("full-demo");
  if (fullDemo) {
    const fullHeader = fullDemo.querySelector("ns-header");
    const fullSidebar = fullDemo.querySelector("ns-sidebar");
    const fullItems = [...fullDemo.querySelectorAll("ns-nav-item")];
    const fullLog = fullDemo.querySelector("#full-log");

    fullHeader.addEventListener("ns-toggle", (e) => {
      fullHeader.sidebarOpen = e.detail.open;
      fullSidebar.open = e.detail.open;
      fullLog.textContent = `ns-toggle  open=${e.detail.open}`;
    });

    fullSidebar.addEventListener("ns-navigate", (e) => {
      for (const item of fullItems) item.active = item.href === e.detail.href;
      fullLog.textContent = `ns-navigate  href=${e.detail.href}`;
    });
  }
```

- [ ] **Step 7: 브라우저에서 전체 확인**

Run: `npm run demo`

확인 항목:
1. 페이지 상단에 우리 `ns-header`가, 좌측에 우리 `ns-sidebar`가 보인다
2. 헤더의 토글을 누르면 좌측 네비게이션이 레일(64px)로 접히고 배지만 남는다
3. 네비게이션 항목을 클릭하면 해당 섹션으로 부드럽게 스크롤되고 주소창 해시가 바뀐다
4. 스크롤을 내리면 좌측 네비게이션의 `active`가 따라 이동한다
5. **`ns-sidebar` 데모 안의 항목을 클릭해도 페이지가 스크롤되지 않는다** — 리스너 격리가 동작한다는 증거다
6. 디자인 토큰 섹션에 색 견본이 보이고, 각 칸에 마우스를 올리면 실제 계산값이 툴팁으로 뜬다
7. 본문이 스크롤되어도 헤더와 사이드바는 제자리에 있다
8. "전체 셸 조합" 데모에서 토글을 누르면 그 데모의 사이드바만 접히고 **좌측 문서 네비게이션은 그대로**다. 항목을 클릭하면 그 데모 안에서 `active`가 옮겨간다

5번과 8번을 반드시 확인한다. 이 문서 페이지 구조에서 가장 깨지기 쉬운 지점이다.

- [ ] **Step 8: 커밋**

```bash
git add index.html
git commit -m "docs(playground): 문서 셸을 자체 컴포넌트로 전환하고 설치·연동·토큰 섹션 추가

문서 페이지의 헤더와 좌측 네비게이션이 우리 컴포넌트다. 접힘·이벤트·
slot·active 중 하나라도 깨지면 문서가 못 쓰게 되어 즉시 드러난다.
ns-navigate 는 composed 라 데모에서도 올라오므로 셸 리스너는 document
가 아니라 셸 사이드바에 붙인다."
```

---

### Task 11: 릴리스 스크립트와 콜드 설치 검증

**Files:**
- Create: `scripts/release.mjs`
- Create: `README.md`

**Interfaces:**
- Consumes: `npm run check`, `npm run build` (Task 2, 9)
- Produces:
  - `npm run release -- 0.1.0` → `v0.1.0` 태그(빌드 산출물 포함 커밋을 가리킴)
  - 다른 프로젝트가 `git+…#v0.1.0`으로 설치 가능한 상태

- [ ] **Step 1: `scripts/release.mjs` 작성**

```js
/*
  main 은 소스만 유지하고 dist 는 릴리스 태그에만 넣는다.

  태그는 이미 존재하는 커밋에 파일을 얹을 수 없으므로, detached HEAD 에서
  dist 를 포함한 커밋을 새로 만들고 거기에 태그를 붙인다. main 히스토리는
  건드리지 않는다.
*/
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const version = process.argv[2];
if (!/^\d+\.\d+\.\d+$/.test(version ?? "")) {
  console.error("사용법: npm run release -- 0.1.0");
  process.exit(1);
}
const tag = `v${version}`;

const git = (...args) => execFileSync("git", args, { stdio: "inherit" });
const gitOut = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const run = (cmd, ...args) => execFileSync(cmd, args, { stdio: "inherit" });

if (gitOut("status", "--porcelain")) {
  console.error("작업 트리가 깨끗하지 않습니다. 커밋하거나 stash 후 다시 실행하세요.");
  process.exit(1);
}
if (gitOut("tag", "--list", tag)) {
  console.error(`${tag} 태그가 이미 있습니다.`);
  process.exit(1);
}

const branch = gitOut("rev-parse", "--abbrev-ref", "HEAD");

/*
  검사와 빌드를 git 에 아무것도 쓰기 전에 먼저 돌린다. 순서를 뒤집으면
  버전 커밋을 남긴 뒤에 빌드가 깨져서, 검증되지 않은 버전 커밋이
  브랜치에 남는다.
*/
run("npm", "run", "check");
run("npm", "run", "build");

// 버전 커밋은 현재 브랜치에 남긴다.
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
pkg.version = version;
writeFileSync("package.json", `${JSON.stringify(pkg, null, 2)}\n`);
git("add", "package.json");
git("commit", "-m", `chore(release): v${version}`);

const hasOrigin = gitOut("remote").split("\n").includes("origin");

/*
  여기서부터 detached HEAD 다. 무슨 일이 있어도 브랜치로 돌아와야 한다 —
  중간에 던지고 끝나면 사용자가 detached 상태에 갇힌 채 이유도 모른다.
  push 실패(네트워크·인증)가 가장 현실적인 경로다.
*/
git("checkout", "--detach");
try {
  // dist 는 .gitignore 대상이라 -f 로 강제 추가한다.
  git("add", "-f", "dist");
  git("commit", "-m", `release: ${tag}`);
  git("tag", tag);

  if (hasOrigin) {
    git("push", "origin", tag);
    console.log(`\n${tag} 태그를 푸시했습니다.`);
  } else {
    console.log(`\n${tag} 태그를 로컬에 만들었습니다. origin 이 없어 푸시는 건너뜁니다.`);
  }
} catch (error) {
  console.error(`
릴리스가 중단됐습니다. ${branch} 브랜치로 돌아갑니다.

정리할 것이 남아 있을 수 있습니다:
  git tag -l ${tag}                 태그가 만들어졌는지 확인
  git tag -d ${tag}                 만들어졌다면 삭제
  git log --oneline -1 ${branch}    버전 커밋을 되돌릴지 판단
`);
  throw error;
} finally {
  git("checkout", branch);
}

console.log(`
${branch} 브랜치의 버전 커밋은 아직 푸시되지 않았습니다:
  git push origin ${branch}

소비자 설치:
  "@neosimplix/common-ui": "git+ssh://git@github.com/neosimplix/common-ui.git#${tag}"
`);
```

- [ ] **Step 2: `README.md` 작성**

```markdown
# common-ui

Next.js · React 18/19 · 순수 HTML 에서 동일하게 쓰는 대시보드 셸 웹 컴포넌트.

- `ns-header` — 토글 버튼, 프로젝트 이름, 우측 `actions` slot
- `ns-sidebar` — 접으면 좌측 레일이 남는 사이드바
- `ns-nav-group` / `ns-nav-item` — 네비게이션 그룹과 항목

## 설치

npm 레지스트리를 쓰지 않는다. git 태그로 설치한다.

```json
"dependencies": {
  "@neosimplix/common-ui": "git+ssh://git@github.com/neosimplix/common-ui.git#v0.1.1"
}
```

**태그를 반드시 지정한다.** `main` 에는 `dist/` 가 없어서 브랜치를 가리키면 설치는 되지만 import 가 실패한다. 사용할 수 있는 태그는 `git tag -l` 로 확인한다.

사용법·프로퍼티·이벤트는 `index.html` 에 있다. 빌드 후 파일을 그대로 열면 된다.

```sh
npm install
npm run demo
```

## 개발

| 명령 | 설명 |
|---|---|
| `npm run check` | 타입 검사 + 이벤트 매핑 검사 |
| `npm run build` | `dist/` 에 ES · React · UMD · tokens.css 생성 |
| `npm run demo` | 빌드 후 `index.html` 열기 |
| `npm run release -- 0.1.0` | 빌드 산출물을 포함한 `v0.1.0` 태그 생성·푸시 |

테스트 러너가 없다. `npm run check` 와 `index.html` 육안 확인이 회귀 확인
수단이다. 문서 페이지의 헤더와 네비게이션 자체가 이 패키지의 컴포넌트라,
깨지면 문서가 열리지 않는 것으로 드러난다. 컴포넌트를 추가하면
`index.html` 에도 섹션을 추가한다.

## 설계

`docs/superpowers/specs/2026-08-12-common-ui-web-components-design.md`
```

- [ ] **Step 3: README 커밋**

```bash
git add README.md scripts/release.mjs
git commit -m "chore(release): 릴리스 스크립트와 README 추가

dist 는 detached HEAD 커밋에만 넣고 태그를 붙인다. main 히스토리는
빌드 산출물 없이 유지된다."
```

- [ ] **Step 4: 첫 릴리스 실행**

Run: `npm run release -- 0.1.0`
Expected: `check`와 `build`가 통과하고, `v0.1.0 태그를 로컬에 만들었습니다. origin 이 없어 푸시는 건너뜁니다.`가 출력된다. 마지막에 원래 브랜치로 돌아온다.

- [ ] **Step 5: 태그에 dist가 들어갔는지, main에는 없는지 확인**

Run: `git ls-tree --name-only v0.1.0 && echo "--- main ---" && git ls-tree --name-only HEAD`
Expected: 태그 목록에는 `dist`가 있고, `HEAD` 목록에는 없다.

- [ ] **Step 6: 콜드 설치 검증**

원격이 없으므로 `git+file://` 로 로컬 저장소를 직접 설치해 확인한다. npm 이 git 의존성을 다루는 경로는 원격과 동일하다.

Run:
```bash
rm -rf /tmp/ns-cold && mkdir -p /tmp/ns-cold && cd /tmp/ns-cold \
  && npm init -y >/dev/null \
  && npm i "git+file:///Users/neosimplix/coding/dashboard/common-ui#v0.1.0" \
  && ls node_modules/@neosimplix/common-ui \
  && ls node_modules/@neosimplix/common-ui/dist
```

Expected:
- 패키지 루트에 `package.json` 과 `dist` 만 있다(`files: ["dist"]` 가 동작했다는 뜻)
- `dist` 안에 `index.js`, `react.js`, `bundle.umd.js`, `tokens.css`, `index.d.ts`, `react/index.d.ts` 가 모두 있다

`dist` 가 비어 있으면 `.gitignore` 와 `files` 가 충돌한 것이다. 그 경우 `.npmignore` 를 만들지 말고 `files` 배열이 `package.json` 에 남아 있는지 먼저 확인한다.

- [ ] **Step 7: 설치된 패키지가 실제로 import 되는지 확인**

Run:
```bash
cd /tmp/ns-cold && node --input-type=module \
  -e "import('@neosimplix/common-ui').then((m) => console.log(Object.keys(m).sort().join(', ')))"
```

Expected: `NsHeader, NsNavGroup, NsNavItem, NsSidebar`

Node 에는 `window` 가 없으므로 `register()` 가 등록을 건너뛴다. 예외 없이 이 목록이 출력되면 SSR 안전성이 실증된 것이다.

**이 검사가 `ReferenceError: HTMLElement is not defined` 로 실패하면 `register()` 를 고치지 말 것.** 가드는 정상이고, 원인은 빌드 설정이다. `external` 이 `lit` 하위 경로를 덮지 못해 `@lit/reactive-element` 가 번들에 들어갔고, 그 안의 클래스 선언이 가드보다 먼저 평가된다. `vite.config.ts` 의 `litExternal` 정규식을 확인한다.

- [ ] **Step 7-1: 번들이 실제로 lit 을 외부로 두었는지 확인**

Run:
```bash
cd /Users/neosimplix/coding/dashboard/common-ui
grep -c 'extends HTMLElement' dist/index.js || true
grep -oE 'from ?"[^"]+"' dist/index.js | sort -u
wc -c dist/index.js dist/bundle.umd.js
```

Expected:
- `extends HTMLElement` 가 `dist/index.js` 에 **0개**. 있으면 lit 이 인라인된 것이다
- import 목록에 `"lit"` 과 `"lit/decorators.js"` 가 보인다
- `dist/index.js` 는 수 KB 수준. `dist/bundle.umd.js` 만 lit 을 인라인해 20KB 를 넘는다

- [ ] **Step 8: 정리**

Run: `rm -rf /tmp/ns-cold`

---

## 완료 후 남는 일

이 계획이 끝나면 패키지는 다른 프로젝트가 설치해 쓸 수 있는 상태가 된다. 이어서 필요한 것은 두 가지다.

1. **원격 저장소 연결** — `git remote add origin …` 후 `main`과 태그를 푸시한다. 설계 문서 §13의 미확정 항목이다.
2. **`dashboard-shell` 이관** — 별도 spec·plan이 필요하다. `globals.css`의 토큰 블록 삭제, Tailwind 커스텀 색 유틸 2곳 수정, `SidebarSection[]` 데이터를 `NsNavGroup`/`NsNavItem` JSX로 변환, loading/error/empty 상태를 slot으로 이동, `linkComponent={Link}` → `ns-navigate` 전환, `useSidebar` 하이드레이션 처리가 포함된다.
