# common-ui 프리미티브 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `dashboard-shell/components/ui/*` 의 프리미티브를 `common-ui` 로 옮긴다. 폼 컨트롤·버튼·카드는 네이티브 요소용 CSS 클래스 7종으로, 마크업이나 행동을 만들어 주는 것은 웹 컴포넌트 4종으로 제공한다.

**Architecture:** 패키지가 층으로 나뉜다. `./tokens.css`(토큰) · `./controls.css`(`.ns-*` 클래스) · `./react`(클래스를 붙이는 얇은 React 컴포넌트 + `@lit/react` 태그 래퍼) · `.`(웹 컴포넌트 등록). 순수 HTML 은 클래스를 직접 쓰고, React 소비자는 `./react` 하나에서 전부 가져와 **호출부가 바뀌지 않는다.**

**Tech Stack:** Lit 3, TypeScript 5, Vite 6(lib mode), `@lit/react`, React 18/19(peer, optional), Node 20+

설계 문서: `docs/superpowers/specs/2026-08-13-common-ui-primitives-design.md`
참고 구현: `/Users/neosimplix/coding/dashboard/dashboard-shell/components/ui/`

## Global Constraints

- **테스트 러너를 도입하지 않는다.** `.claude/rules/verification.md` 의 설계 결정이다. vitest·jest·playwright·web-test-runner 를 추가하지 않고 테스트 파일도 만들지 않는다. 회귀 확인 수단은 `npm run check` 와 `index.html` 육안 확인 둘이다.
- **검사를 새로 만들거나 고쳤으면 일부러 깨뜨려 실패를 확인한다.** 그리고 **의도한 이유로 실패했는지**까지 본다. 다른 이유(사용하지 않는 import 등)로 먼저 실패하면 목표한 속성은 검증되지 않은 것이다.
- **브라우저 확인은 사람이 한다.** 구현자는 화면을 볼 수 없다. **하지 않은 확인을 했다고 보고하지 않는다.** 각 Task 의 "사람이 확인할 것" 항목은 보고서에 별도로 구분해 적는다.
- **컴포넌트 태그는 `ns-` 접두사를 쓴다.** 이번에 추가되는 것은 `ns-icon` · `ns-page-heading` · `ns-skeleton` · `ns-dialog`.
- **CSS 클래스 이름도 `ns-` 접두사를 쓴다.** 전역 이름공간이라 `.input` 은 소비자 CSS 와 충돌한다. 변형은 `--`, 하위 요소는 `__` 다 (`.ns-button--outline`, `.ns-field__error`).
- **디자인 토큰 이름에는 접두사를 붙이지 않는다.** `--color-line`, `--space-3` 처럼 `tokens.css` 의 이름을 그대로 쓴다. 패키지 내부 배선용 커스텀 프로퍼티만 `--ns-` 를 쓴다.
- **`var()` 폴백을 쓰지 않는다.** 색·치수 값은 `tokens.css` 한 곳에만 존재한다. `controls.css` 와 shadow 스타일 모두 해당한다. 유일한 예외는 기존 `--ns-label-display`.
- **`invalid` 는 클래스가 아니라 `[aria-invalid="true"]` 로 스타일한다.** `--invalid` 변형 클래스를 만들지 않는다.
- **`title` 을 속성/프로퍼티 이름으로 쓰지 않는다.** 모든 HTML 요소의 전역 속성이라 브라우저가 툴팁을 띄운다. 속성 이름은 `heading` 이고, React 프롭만 `title` 을 유지한다.
- **제어/비제어는 속성 짝으로 나눈다.** 제어는 프로퍼티 전용(`open`, `attribute: false`), 비제어 초기값은 별도 속성(`default-open`). 하나로 겸용하면 순수 HTML 의 `<ns-dialog open>` 이 제어 모드로 들어가 스스로 닫히지 않는다.
- **제어 중이면 컴포넌트가 그 값을 바꾸지 않는다.** 비제어면 스스로 관리하고, 이벤트는 양쪽 모두 낸다.
- **모든 커스텀 이벤트는 `bubbles: true, composed: true`** 이고, React 래퍼 매핑에 **`EventName<>` 캐스트**가 있어야 한다. 빠지면 라이브러리 타입 검사는 통과하고 소비자의 `e.detail` 만 죽는다.
- **`@customElement` 데코레이터를 쓰지 않는다.** `src/internal/register.ts` 를 쓴다.
- **로직과 스타일을 파일 두 개로 나눈다.** (`ns-x.ts` / `ns-x.styles.ts`, `css``` 템플릿이지 `.css` 파일이 아니다)
- **`tsconfig.json` 의 `experimentalDecorators: true` 와 `useDefineForClassFields: false` 를 건드리지 않는다.** 표준 데코레이터 문법(`accessor`)을 쓰지 않는다.
- **`index.html` 예시 블록 안에 `<script>` 태그를 넣지 않는다.** HTML 파서는 `type="text/plain"` 과 무관하게 첫 `</script>` 에서 바깥 블록을 닫는다. 마크업 예시와 배선 예시를 따로 둔다.
- **데모 리스너는 자기가 소유한 엘리먼트에 붙인다.** `document.addEventListener` 를 쓰지 않는다. 이벤트가 `composed` 라 다른 섹션의 데모까지 잡는다.
- **`index.html` 데모 헬퍼 규약**: `<template class="ex">` → 다음 형제가 `.demo` → 그 다음이 `<pre>`. 어기면 콘솔에 위치가 찍히고 그 섹션만 건너뛴다.
- **커밋은 각 Task 끝에서 한 번.** `.claude/rules/commit.md` 를 따른다 — `<type>(<scope>): <한국어 제목>`, 마침표 없음. **`git push` 는 하지 않는다.**

---

## 파일 구조

| 파일 | 책임 |
|---|---|
| `src/controls/controls.css` | `.ns-*` 클래스 7종. `@layer ns-controls` 로 감싼 손으로 쓰는 정적 파일 |
| `src/react/cx.ts` | 조건부 클래스 합치기. 내부 전용, 공개하지 않는다 |
| `src/react/controls/Button.tsx` | `Button` · `ButtonLink`. 클래스 조합 헬퍼의 단일 출처 |
| `src/react/controls/Input.tsx` | `Input` |
| `src/react/controls/Textarea.tsx` | `Textarea` |
| `src/react/controls/Select.tsx` | `Select`. `options` 배열과 `placeholder` 렌더 |
| `src/react/controls/Checkbox.tsx` | `Checkbox` |
| `src/react/controls/Field.tsx` | `Field`. `useId` + `cloneElement` 로 접근성 배선 |
| `src/react/controls/Card.tsx` | `Card` |
| `src/react/elements.ts` | `@lit/react` `createComponent` 래퍼 전부. **이벤트 매핑의 단일 출처** |
| `src/react/tags/PageHeading.tsx` | `title` → `heading` shim |
| `src/react/tags/Dialog.tsx` | `title` → `heading`, `onClose` → `onNsDialogClose`, `footer` prop → `slot="footer"` shim |
| `src/react/index.ts` | 재export 허브. 값과 타입만 내보낸다 |
| `src/components/icon/ns-icon.ts` | `ns-icon` 로직 |
| `src/components/icon/ns-icon.styles.ts` | `ns-icon` shadow CSS |
| `src/components/icon/icons.ts` | SVG 스프라이트. 이름 → `SVGTemplateResult` |
| `src/components/page-heading/ns-page-heading.{ts,styles.ts}` | `ns-page-heading` |
| `src/components/skeleton/ns-skeleton.{ts,styles.ts}` | `ns-skeleton` |
| `src/components/dialog/ns-dialog.{ts,styles.ts}` | `ns-dialog` |
| `src/types.ts` | 이벤트 `detail` 타입 + `HTMLElementEventMap` 확장 |
| `src/tokens/tokens.css` | 새 태그의 정의 전 레이아웃 예약 추가 |
| `src/index.ts` | 등록 부수효과 import + 클래스 재export |
| `scripts/copy-css.mjs` | `tokens.css` · `controls.css` → `dist/` (기존 `copy-tokens.mjs` 를 대체) |
| `scripts/check-controls.mjs` | `controls.css` 클래스 ↔ `index.html` 문서 양방향 대조 |
| `scripts/check-events.mjs` | 읽는 대상을 `src/react/elements.ts` 로 바꾼다 |
| `vite.config.ts` | `react` external 을 정규식으로 바꾼다 |
| `package.json` | `./controls.css` export, `check` 에 ④ 추가, `build` 의 스크립트 이름 변경 |
| `index.html` | 섹션 11개 추가, `controls.css` 링크, Tailwind 레이어 안내 |
| `docs/consumer-example.tsx` | React 컴포넌트 11종 전부 사용 |

React 파일을 `controls/` 와 `tags/` 로 나누는 이유는 성질이 다르기 때문이다. `controls/` 는 네이티브 요소에 클래스를 붙이는 순수 함수고, `tags/` 는 커스텀 엘리먼트 래퍼의 프롭 이름을 맞추는 얇은 어댑터다.

**`createComponent` 호출은 전부 `src/react/elements.ts` 에 모은다.** `tags/` 의 shim 이 래퍼를 import 해야 하므로, `index.ts` 에 두면 순환 import 가 된다. `check-events.mjs` 가 읽는 대상도 함께 옮긴다.

## 범위

이 계획은 클래스 7종(`button` `input` `select` `textarea` `checkbox` `field` `card`)과 태그 4종(`icon` `page-heading` `skeleton` `dialog`)을 다룬다.

**`table` 은 이 계획에 없다.** 정렬·페이징·선택이 붙고, 그 선택은 `.ns-checkbox`·페이징은 `.ns-button` 을 쓰므로 이 계획이 먼저 끝나야 한다. 설계 문서 §10 참고.

**`dashboard-shell` 이관도 이 계획에 없다.** 다른 저장소다.

---

### Task 1: 배관 — `controls.css` · React 파일 구조 · 검사 둘

가장 단순한 클래스(`.ns-card`) 하나로 전체 파이프라인을 세운다. 클래스 → CSS → React 컴포넌트 → 빌드 산출물 → 문서 → 검사가 한 번에 이어지는지 여기서 확인한다.

**Files:**
- Create: `src/controls/controls.css`
- Create: `src/react/cx.ts`
- Create: `src/react/controls/Card.tsx`
- Create: `src/react/elements.ts`
- Create: `scripts/copy-css.mjs`
- Create: `scripts/check-controls.mjs`
- Delete: `scripts/copy-tokens.mjs`
- Modify: `src/react/index.ts` (전체 재작성 — 재export 허브로)
- Modify: `scripts/check-events.mjs:26` (읽는 파일 경로)
- Modify: `vite.config.ts:70` (react external)
- Modify: `package.json` (exports · scripts)
- Modify: `index.html` (link · nav · 설치 섹션 · `.ns-card` 섹션)
- Modify: `docs/consumer-example.tsx`

**Interfaces:**
- Produces:
  - `src/react/cx.ts` → `export function cx(...values: ClassValue[]): string` where `type ClassValue = string | false | null | undefined`
  - `src/react/controls/Card.tsx` → `export function Card(props: CardProps)`, `export type CardProps = { className?: string; children: ReactNode }`
  - `src/react/elements.ts` → `export const NsHeader, NsSidebar, NsNavGroup, NsNavItem` (기존 `createComponent` 결과를 그대로 옮긴 것)
  - `src/controls/controls.css` → `@layer ns-controls { … }` 블록 하나. 이후 Task 는 이 블록 **안에** 클래스를 추가한다
  - `scripts/check-controls.mjs` → `npm run check` 의 ④번 검사

- [ ] **Step 1: `src/controls/controls.css` 를 만든다**

```css
/*
  common-ui 네이티브 요소용 클래스.

  폼 컨트롤·버튼·카드를 웹 컴포넌트로 만들지 않는 이유는 설계 문서
  docs/superpowers/specs/2026-08-13-common-ui-primitives-design.md §2 에 있다.
  요약: shadow DOM 은 폼 참여·label for·검증·자동완성을 끊고, FACE 로 되살려도
  "JS 없이 동작한다" 는 성질은 돌아오지 않는다.

  값은 tokens.css 의 토큰만 참조한다. var() 폴백을 쓰지 않는다 — 값이 두 곳에
  존재하면 어긋나고, 어긋나도 아무도 모른다.

  @layer 로 감싸는 이유:
    Tailwind v4 는 preflight 를 @layer base, 유틸을 @layer utilities 에 넣는다.
    레이어에 들지 않은 스타일은 레이어에 든 스타일을 항상 이긴다 — 순서와
    무관하게. 감싸지 않으면 preflight 는 이기지만 소비자의 className="px-6"
    같은 유틸 오버라이드까지 막아버린다.

    그래서 감싸고, 소비자가 Tailwind import 위에 레이어 순서를 선언한다:
      @layer theme, base, ns-controls, components, utilities;

    이 한 줄이 없으면 preflight 가 이 파일의 스타일을 지운다. JS 로 감지할
    방법이 없어 문서로만 지키는 요구사항이다.
*/
@layer ns-controls {
  .ns-card {
    width: 100%;
    border: 1px solid var(--color-line);
    border-radius: var(--radius-card);
    background: var(--color-surface);
    padding: var(--card-padding);
    box-shadow: var(--elevation-card);
  }
}
```

- [ ] **Step 2: `src/react/cx.ts` 를 만든다**

참고 구현 `dashboard-shell/components/ui/cx.ts` 를 그대로 옮긴다.

```ts
type ClassValue = string | false | null | undefined;

/**
 * 조건부 클래스를 합친다. 외부 의존성을 쓰지 않기 위한 최소 구현.
 *
 * 공개 API 로 내보내지 않는다 — 여섯 줄짜리고, 내보내면 유지 의무가 생긴다.
 */
export function cx(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
```

- [ ] **Step 3: `src/react/controls/Card.tsx` 를 만든다**

```tsx
import type { ReactNode } from "react";

import { cx } from "../cx.js";

export type CardProps = {
  className?: string;
  children: ReactNode;
};

export function Card({ className, children }: CardProps) {
  return <div className={cx("ns-card", className)}>{children}</div>;
}
```

`verbatimModuleSyntax` 가 켜져 있으므로 타입 전용 import 에 `import type` 을 쓰고, `moduleResolution: bundler` 에서도 상대 import 는 기존 코드와 같이 `.js` 확장자를 붙인다.

- [ ] **Step 4: `src/react/elements.ts` 를 만든다**

기존 `src/react/index.ts` 의 `createComponent` 호출 네 개를 **주석까지 그대로** 옮긴다. 파일 상단 주석을 이렇게 바꾼다.

```ts
import * as React from "react";
import { createComponent, type EventName } from "@lit/react";

import { NsHeader as NsHeaderElement } from "../components/header/ns-header.js";
import { NsNavGroup as NsNavGroupElement } from "../components/nav-group/ns-nav-group.js";
import { NsNavItem as NsNavItemElement } from "../components/nav-item/ns-nav-item.js";
import { NsSidebar as NsSidebarElement } from "../components/sidebar/ns-sidebar.js";
import type { NsToggleDetail, NsNavigateDetail } from "../types.js";

/*
  @lit/react 래퍼 전부가 이 파일에 모인다. 두 가지 이유다.

  1. tags/ 의 shim(PageHeading·Dialog)이 래퍼를 import 해야 한다.
     index.ts 에 두면 index → tags → index 로 순환한다.
  2. scripts/check-events.mjs 가 이 파일과 컴포넌트의 dispatchEvent 를
     대조한다. 이벤트 매핑의 단일 출처를 한 파일로 유지한다.

  프로퍼티 타입은 createComponent 가 Lit 클래스에서 자동으로 끌어온다.
  이벤트만 손으로 적는다.
*/

export const NsHeader = createComponent({
  react: React,
  tagName: "ns-header",
  elementClass: NsHeaderElement,
  events: {
    // EventName<> 브랜딩이 없으면 핸들러가 (e: Event) => void 로 타입된다.
    onNsToggle: "ns-toggle" as EventName<CustomEvent<NsToggleDetail>>,
  },
});
```

`NsSidebar` · `NsNavGroup` · `NsNavItem` 세 개도 기존 파일의 내용과 주석을 그대로 옮긴다. `ns-navigate` 를 세 곳에 매핑하는 이유를 적은 주석도 함께 옮긴다.

- [ ] **Step 5: `src/react/index.ts` 를 재export 허브로 바꾼다**

```ts
/*
  React 소비자의 단일 진입점.

  값과 타입만 내보낸다. createComponent 호출은 elements.ts, 네이티브 요소에
  클래스를 붙이는 컴포넌트는 controls/, 커스텀 엘리먼트 래퍼의 프롭 이름을
  맞추는 어댑터는 tags/ 에 있다.
*/
export { NsHeader, NsNavGroup, NsNavItem, NsSidebar } from "./elements.js";

export { Card } from "./controls/Card.js";
export type { CardProps } from "./controls/Card.js";

export type { NsToggleDetail, NsNavigateDetail } from "../types.js";
```

- [ ] **Step 6: `scripts/check-events.mjs` 가 읽는 파일을 바꾼다**

26번째 줄 부근의 한 줄을 바꾸고, 파일 상단 주석의 경로 언급도 함께 고친다.

```js
const wrapper = readFileSync("src/react/elements.ts", "utf8");
```

에러 메시지의 경로도 함께 바꾼다.

```js
    `React 래퍼(src/react/elements.ts)에 등록되지 않은 이벤트: ${missing.join(", ")}`,
```

- [ ] **Step 7: `scripts/copy-css.mjs` 를 만들고 `copy-tokens.mjs` 를 지운다**

```js
/*
  CSS 두 개를 dist/ 로 복사한다. 손으로 쓰는 정적 파일이라 빌드가 아니라 복사다.

  tokens.css   — 어느 환경에서든 반드시 불러야 한다. 컴포넌트 스타일이 이
                 파일의 변수를 폴백 없이 참조한다.
  controls.css — 네이티브 요소용 클래스. 순수 HTML 소비자가 직접 링크한다.
*/
import { copyFileSync, mkdirSync } from "node:fs";

mkdirSync("dist", { recursive: true });

for (const [from, to] of [
  ["src/tokens/tokens.css", "dist/tokens.css"],
  ["src/controls/controls.css", "dist/controls.css"],
]) {
  copyFileSync(from, to);
  console.log(`복사 완료: ${to}`);
}
```

```bash
git rm scripts/copy-tokens.mjs
```

- [ ] **Step 8: `scripts/check-controls.mjs` 를 만든다**

```js
/*
  controls.css 의 클래스와 index.html 문서를 양방향으로 대조한다.

  클래스 레이어에는 타입 검사가 닿지 않는다. controls.css 에 클래스를 추가하고
  index.html 에 안 적으면 아무도 모른다. 반대로 index.html 이 존재하지 않는
  클래스를 문서화하고 있으면 오타다.

  --modifier 변형도 개별 이름으로 센다. .ns-button--ghost 를 문서에 빠뜨리는
  것이 정확히 이 검사가 잡아야 하는 누락이다.

  문서 쪽에서 클래스를 뽑는 방법이 두 가지인 이유:
    - class="..." 속성값     → 데모와 HTML 예시에서 실제로 쓰인 것
    - .ns-x 처럼 점이 붙은 것 → 표와 산문에서 이름으로 언급된 것
  태그 이름(ns-dialog 등)을 클래스로 오해하지 않으려면 이 둘만 봐야 한다.
  html.includes("ns-dialog") 로 판정하면 태그가 클래스로 잡힌다.

  한계: 클래스가 언급됐는지만 본다. 예시가 올바른지는 보지 못한다.
*/
import { readFileSync } from "node:fs";

const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "");

const css = stripComments(readFileSync("src/controls/controls.css", "utf8"));
const html = readFileSync("index.html", "utf8");

const CLASS = /\.(ns-[a-z0-9_-]+)/g;

const defined = new Set([...css.matchAll(CLASS)].map((m) => m[1]));

const documented = new Set([...html.matchAll(CLASS)].map((m) => m[1]));
for (const m of html.matchAll(/class="([^"]*)"/g)) {
  for (const name of m[1].split(/\s+/)) {
    if (name.startsWith("ns-")) documented.add(name);
  }
}

const missing = [...defined].filter((n) => !documented.has(n)).sort();
if (missing.length > 0) {
  console.error(`index.html 에 문서화되지 않은 클래스: ${missing.join(", ")}`);
  process.exit(1);
}

const unknown = [...documented].filter((n) => !defined.has(n)).sort();
if (unknown.length > 0) {
  console.error(
    `controls.css 에 없는 클래스가 index.html 에 있습니다: ${unknown.join(", ")}`,
  );
  process.exit(1);
}

console.log(`클래스 문서 확인 완료: ${[...defined].sort().join(", ")}`);
```

- [ ] **Step 9: `vite.config.ts` 의 react external 을 정규식으로 바꾼다**

`litExternal` 선언 바로 아래에 추가한다.

```ts
/*
  같은 이유로 react 도 정규식이어야 한다. tsconfig 의 "jsx": "react-jsx" 트랜스폼은
  import { jsx as _jsx } from "react/jsx-runtime" 을 넣는데, 문자열 "react" 는
  그 지정자를 잡지 못한다. 그러면 React 의 jsx-runtime 이 dist/react.js 에
  번들되어 소비자 앱에 React 런타임이 두 벌 생긴다.

  react 는 peerDependencies 이므로 소비자가 이미 갖고 있다.
*/
const reactExternal = [/^react(\/.*)?$/, /^react-dom(\/.*)?$/];
```

그리고 `react` 설정의 `external` 을 바꾼다.

```ts
      external: [...reactExternal, ...litExternal],
```

- [ ] **Step 10: `package.json` 을 고친다**

`exports` 에 한 줄 추가한다 (`"./tokens.css"` 다음).

```json
    "./controls.css": "./dist/controls.css",
```

`scripts` 두 개를 바꾼다.

```json
    "build": "vite build --mode es && vite build --mode react && vite build --mode umd && tsc -p tsconfig.build.json && node scripts/copy-css.mjs",
    "check": "tsc -p tsconfig.json && tsc -p tsconfig.consumer.json && node scripts/check-events.mjs && node scripts/check-controls.mjs",
```

- [ ] **Step 11: `index.html` 에 `controls.css` 링크와 안내를 넣는다**

7번째 줄의 `tokens.css` 링크 **다음**에 한 줄 추가한다.

```html
<link rel="stylesheet" href="./dist/controls.css">
```

`<h2 id="install">설치</h2>` 섹션 끝(다음 `<h2 id="usage">` 바로 앞)에 이 블록을 넣는다.

```html
  <h3>CSS 두 개를 모두 불러온다</h3>
  <p>
    <code>tokens.css</code> 는 색·치수의 단일 출처이고, <code>controls.css</code> 는
    네이티브 요소용 <code>.ns-*</code> 클래스다. 컴포넌트 스타일은 토큰을
    폴백 없이 참조하므로 둘 중 하나라도 빠지면 레이아웃이 무너진다.
  </p>
  <script type="text/plain">
    /* Next.js — app/globals.css */
    @import "@neosimplix/common-ui/tokens.css";
    @import "@neosimplix/common-ui/controls.css";
  </script>

  <h3>Tailwind 를 쓰면 레이어 순서를 선언해야 한다</h3>
  <p>
    Tailwind v4 는 preflight 를 <code>@layer base</code>, 유틸을
    <code>@layer utilities</code> 에 넣는다. <code>controls.css</code> 는
    <code>@layer ns-controls</code> 로 감싸 배포되므로, 순서를 선언하지 않으면
    preflight 가 이 클래스들을 지운다. <strong>이 한 줄이 빠졌는지는 자바스크립트로
    감지할 수 없다</strong> — 유틸이 클래스를 이기는지 화면으로 확인하는 것이 유일한 수단이다.
  </p>
  <script type="text/plain">
    /* app/globals.css — Tailwind import 보다 위 */
    @layer theme, base, ns-controls, components, utilities;
    @import "tailwindcss";
  </script>
```

- [ ] **Step 12: `index.html` 에 `.ns-card` 섹션과 네비게이션을 추가한다**

`<ns-nav-group heading="기초">` 블록 **다음**에 새 그룹을 넣는다. 이후 Task 가 이 그룹에 항목을 추가한다.

```html
    <ns-nav-group heading="클래스">
      <ns-nav-item href="#ns-card" label=".ns-card" badge="CD"></ns-nav-item>
    </ns-nav-group>
```

`<h2 id="ns-header">` 바로 **앞**에 섹션을 넣는다. 클래스 섹션이 태그 섹션보다 앞에 온다 — 태그가 클래스를 참조하는 방향이기 때문이다.

```html
  <h2 id="ns-card">.ns-card</h2>
  <p>
    카드 표면. 감싸는 <code>div</code> 하나에 스타일뿐이라 클래스다.
    여백(<code>margin</code>)은 제공하지 않는다 — 카드 사이 간격은 배치하는 쪽이 정한다.
  </p>

  <h3>데모</h3>
  <template class="ex">
    <div class="ns-card">
      <p style="margin:0">카드 안의 내용</p>
    </div>
  </template>
  <div class="demo block" id="card-demo" style="padding: var(--space-4)"></div>
  <pre></pre>

  <h3>클래스</h3>
  <table>
    <tr><th>클래스</th><th>붙이는 요소</th><th>설명</th></tr>
    <tr><td><code>.ns-card</code></td><td><code>div</code></td><td>테두리·반경·표면색·<code>--card-padding</code>·그림자</td></tr>
  </table>

  <h3>HTML</h3>
  <script type="text/plain">
    <div class="ns-card">내용</div>
  </script>

  <h3>React</h3>
  <script type="text/plain">
    import { Card } from "@neosimplix/common-ui/react";

    <Card>내용</Card>
    <Card className="mt-8">유틸로 여백을 준다</Card>
  </script>
```

- [ ] **Step 13: `docs/consumer-example.tsx` 에 `Card` 를 넣는다**

import 를 바꾸고, `<main>{children}</main>` 을 감싼다.

```tsx
import { NsHeader, NsSidebar, NsNavGroup, NsNavItem, Card } from "../src/react/index.js";
```

```tsx
        <main>
          <Card>{children}</Card>
        </main>
```

- [ ] **Step 14: `npm run check` 를 돌린다**

Run: `npm run check`
Expected: 검사 네 개가 모두 통과. 마지막 줄에 `클래스 문서 확인 완료: ns-card`.

- [ ] **Step 15: `check-controls.mjs` 를 정방향으로 깨뜨려 본다**

`src/controls/controls.css` 의 `@layer` 블록 안에 임시로 넣는다.

```css
  .ns-fake { color: red; }
```

Run: `npm run check`
Expected: FAIL — `index.html 에 문서화되지 않은 클래스: ns-fake`

**의도한 이유로 실패했는지 본다.** 타입 에러나 이벤트 매핑 에러가 먼저 나면 이 속성은 검증되지 않은 것이다. 확인 후 그 두 줄을 지운다.

- [ ] **Step 16: `check-controls.mjs` 를 역방향으로 깨뜨려 본다**

`index.html` 의 `.ns-card` 클래스 표에 임시로 한 행을 넣는다.

```html
    <tr><td><code>.ns-bogus</code></td><td><code>div</code></td><td>없는 클래스</td></tr>
```

Run: `npm run check`
Expected: FAIL — `controls.css 에 없는 클래스가 index.html 에 있습니다: ns-bogus`

확인 후 그 행을 지운다.

- [ ] **Step 17: `check-events.mjs` 가 새 경로에서도 동작하는지 깨뜨려 본다**

`src/react/elements.ts` 의 `onNsToggle` 매핑 한 줄을 임시로 지운다.

Run: `node scripts/check-events.mjs`
Expected: FAIL — `React 래퍼(src/react/elements.ts)에 등록되지 않은 이벤트: ns-toggle`

이 확인이 필요한 이유는, 경로를 잘못 적으면 `readFileSync` 가 던지는 대신 **빈 집합을 비교해 조용히 통과할 수** 있기 때문이다. 확인 후 되돌린다.

- [ ] **Step 18: 빌드하고 산출물을 확인한다**

Run: `npm run build`

```sh
ls -l dist/controls.css dist/tokens.css        # 둘 다 있어야 정상
grep -c 'ns-card' dist/controls.css            # 1 이상
grep -o 'from *"react/jsx-runtime"' dist/react.js   # 출력이 있어야 정상 (external 유지)
```

세 번째가 이 Task 의 핵심 확인이다. 출력이 있으면 jsx-runtime 이 **import 로 남았다**는 뜻이다.

- [ ] **Step 19: react external 을 되돌려 실패를 확인한다**

`vite.config.ts` 의 react `external` 을 임시로 문자열로 바꾼다.

```ts
      external: ["react", "react-dom", ...litExternal],
```

Run: `npm run build`

```sh
grep -c 'from *"react/jsx-runtime"' dist/react.js   # 0 이어야 한다 — 번들에 인라인됐다는 뜻
wc -c dist/react.js                                  # 정규식 판보다 커야 한다
```

**정규식이 필요한 이유를 실제로 본 것이다.** 확인 후 되돌리고 다시 빌드한다.

- [ ] **Step 20: 사람이 확인할 것을 보고서에 적는다**

구현자는 아래를 확인할 수 없다. **했다고 적지 않는다.**

- `index.html` 을 열어 `.ns-card` 데모가 테두리·그림자와 함께 보이는지
- 데모 헬퍼가 콘솔에 `[docs] N번째 template.ex` 경고를 내지 않는지
- 좌측 네비게이션의 "클래스" 그룹에서 `.ns-card` 로 이동되는지

브라우저 없이 가능한 구조 검사는 직접 돌린다.

```sh
grep -c '<script>' index.html                                        # 1
grep -n '</script>' index.html | grep -v -E ':\s*</script>\s*$' | grep -v '<script src='   # 출력 없음
grep -n 'document.addEventListener' index.html                        # 출력 없음
```

- [ ] **Step 21: 커밋**

```bash
git add -A
git commit -m "feat(controls): controls.css 배관과 .ns-card 추가"
```

---

### Task 2: `.ns-button` 과 `Button` · `ButtonLink`

버튼이 클래스인 덕분에 `<button>` 과 `<a>` 가 스타일 하나를 공유한다. 참고 구현이 `buttonClass()` 헬퍼로 두 컴포넌트에 같은 CSS Module 클래스를 붙이던 것이, 여기서는 문자열 조합만 남는다.

**Files:**
- Modify: `src/controls/controls.css` (`@layer` 블록 안에 추가)
- Create: `src/react/controls/Button.tsx`
- Modify: `src/react/index.ts` (재export)
- Modify: `index.html` (nav 항목 · 섹션)
- Modify: `docs/consumer-example.tsx`

**Interfaces:**
- Consumes: `cx` from `src/react/cx.ts` (Task 1)
- Produces:
  - `export type ButtonVariant = "solid" | "outline" | "ghost" | "icon"`
  - `export type ButtonSize = "sm" | "md"`
  - `export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize; fullWidth?: boolean }`
  - `export type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: ButtonVariant; size?: ButtonSize; fullWidth?: boolean }`
  - `export function Button(props: ButtonProps)` · `export function ButtonLink(props: ButtonLinkProps)`
  - 클래스 `.ns-button` · `--solid` `--outline` `--ghost` `--icon` · `--sm` `--md` · `--full`

- [ ] **Step 1: `controls.css` 의 `@layer` 블록 안에 `.ns-button` 을 추가한다**

`.ns-card` 규칙 **앞**에 넣는다 (알파벳 순이 아니라 사용 빈도 순 — 버튼이 가장 많이 읽힌다).

```css
  /*
    <button> 과 <a> 가 같은 클래스를 쓴다. 동작이 링크면 마크업도 링크여야 하고,
    참고 구현이 Button/ButtonLink 두 컴포넌트로 나눠 스타일을 공유하려고
    헬퍼를 두었던 이유가 클래스에서는 사라진다.
  */
  .ns-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    border-radius: var(--radius-control);
    font-weight: var(--weight-medium);
    transition: background-color var(--transition-fast) var(--transition-ease),
      color var(--transition-fast) var(--transition-ease);
    cursor: pointer;
    /* <a> 로 렌더될 때를 위한 것. <button> 에는 영향이 없다. */
    text-decoration: none;
    box-sizing: border-box;
  }

  .ns-button:disabled {
    cursor: not-allowed;
  }

  /* ── 크기 ── */
  .ns-button--md {
    min-height: var(--control-height-md);
    padding-inline: var(--space-4);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-sm);
  }

  .ns-button--sm {
    min-height: var(--control-height-sm);
    padding-inline: var(--space-2);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-sm);
  }

  /* ── 변형 ── */
  .ns-button--solid {
    background: var(--color-accent);
    color: var(--color-accent-fg);
  }
  .ns-button--solid:hover:not(:disabled) { background: var(--color-accent-hover); }
  .ns-button--solid:disabled { background: var(--color-disabled); }

  .ns-button--outline {
    background: transparent;
    color: var(--color-fg-body);
    border: 1px solid var(--color-line-strong);
  }
  .ns-button--outline:hover:not(:disabled) { background: var(--color-surface-sunken); }

  .ns-button--ghost {
    background: transparent;
    color: var(--color-fg-muted);
  }
  .ns-button--ghost:hover:not(:disabled) {
    background: var(--color-surface-hover);
    color: var(--color-fg);
  }

  /* 정사각 패딩만 쓴다. --sm/--md 와 함께 쓰지 않는다. */
  .ns-button--icon {
    background: transparent;
    color: var(--color-fg-body);
    padding: var(--space-1-5);
  }
  .ns-button--icon:hover:not(:disabled) {
    background: var(--color-surface-hover);
    color: var(--color-fg);
  }

  .ns-button--full { width: 100%; }
```

- [ ] **Step 2: `src/react/controls/Button.tsx` 를 만든다**

```tsx
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

import { cx } from "../cx.js";

export type ButtonVariant = "solid" | "outline" | "ghost" | "icon";
export type ButtonSize = "sm" | "md";

type ButtonBase = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ButtonBase;
export type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & ButtonBase;

function buttonClass(
  { variant = "solid", size = "md", fullWidth = false }: ButtonBase,
  className?: string,
): string {
  return cx(
    "ns-button",
    `ns-button--${variant}`,
    // --icon 은 자체 패딩을 쓰므로 크기 변형을 붙이지 않는다.
    variant !== "icon" && `ns-button--${size}`,
    fullWidth && "ns-button--full",
    className,
  );
}

/**
 * type 기본값이 "button" 인 것이 중요하다. 네이티브 기본값은 "submit" 이라
 * 폼 안에 놓인 순간 의도치 않게 제출한다. 제출 버튼은 호출부가 명시한다.
 */
export function Button({
  variant = "solid",
  size = "md",
  fullWidth = false,
  className,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClass({ variant, size, fullWidth }, className)}
      {...rest}
    />
  );
}

/**
 * 버튼처럼 보이는 링크. 서버 리디렉션으로 시작하는 로그인처럼 클릭 결과가
 * 페이지 이동인 경우에 쓴다. 동작이 링크면 마크업도 링크여야 한다.
 */
export function ButtonLink({
  variant = "solid",
  size = "md",
  fullWidth = false,
  className,
  ...rest
}: ButtonLinkProps) {
  return <a className={buttonClass({ variant, size, fullWidth }, className)} {...rest} />;
}
```

- [ ] **Step 3: `src/react/index.ts` 에 재export 를 추가한다**

`Card` 재export **위**에 넣는다 (파일 안에서도 사용 빈도 순).

```ts
export { Button, ButtonLink } from "./controls/Button.js";
export type {
  ButtonLinkProps,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from "./controls/Button.js";
```

- [ ] **Step 4: `index.html` 에 네비게이션 항목과 섹션을 추가한다**

"클래스" 그룹의 `.ns-card` 항목 **앞**에 넣는다.

```html
      <ns-nav-item href="#ns-button" label=".ns-button" badge="BT"></ns-nav-item>
```

`<h2 id="ns-card">` 바로 **앞**에 섹션을 넣는다.

```html
  <h2 id="ns-button">.ns-button</h2>
  <p>
    <code>button</code> 과 <code>a</code> 에 똑같이 붙는다. 클릭 결과가 페이지 이동이면
    <code>a</code>, 그 자리에서 무언가 하면 <code>button</code> 이다.
  </p>
  <p>
    <strong>웹 컴포넌트로 만들지 않은 이유가 여기서 가장 뚜렷하다.</strong>
    shadow DOM 안의 <code>button type="submit"</code> 은 바깥 폼을 제출하지 못하고,
    텍스트 필드에서 Enter 로 제출되는 동작도 보장되지 않는다.
  </p>

  <h3>데모</h3>
  <template class="ex">
    <button class="ns-button ns-button--solid ns-button--md">solid</button>
    <button class="ns-button ns-button--outline ns-button--md">outline</button>
    <button class="ns-button ns-button--ghost ns-button--md">ghost</button>
    <button class="ns-button ns-button--solid ns-button--sm">sm</button>
    <button class="ns-button ns-button--solid ns-button--md" disabled>disabled</button>
    <a class="ns-button ns-button--outline ns-button--md" href="#ns-button">링크</a>
  </template>
  <div class="demo block" id="button-demo" style="display:flex;flex-wrap:wrap;gap:var(--space-3);padding:var(--space-4)"></div>
  <pre></pre>

  <h3>클래스</h3>
  <table>
    <tr><th>클래스</th><th>역할</th></tr>
    <tr><td><code>.ns-button</code></td><td>기본. 항상 붙인다</td></tr>
    <tr><td><code>.ns-button--solid</code></td><td>액센트 배경. 주 동작</td></tr>
    <tr><td><code>.ns-button--outline</code></td><td>테두리만. 보조 동작</td></tr>
    <tr><td><code>.ns-button--ghost</code></td><td>배경 없음. 파괴적이거나 낮은 우선순위</td></tr>
    <tr><td><code>.ns-button--icon</code></td><td>정사각 패딩. <strong><code>--sm</code>/<code>--md</code> 와 함께 쓰지 않는다</strong></td></tr>
    <tr><td><code>.ns-button--md</code></td><td>기본 높이 <code>--control-height-md</code></td></tr>
    <tr><td><code>.ns-button--sm</code></td><td>낮은 높이 <code>--control-height-sm</code></td></tr>
    <tr><td><code>.ns-button--full</code></td><td><code>width: 100%</code></td></tr>
  </table>

  <h3>HTML</h3>
  <script type="text/plain">
    <button class="ns-button ns-button--solid ns-button--md" type="submit">저장</button>
    <a class="ns-button ns-button--outline ns-button--md" href="/login">로그인</a>
    <button class="ns-button ns-button--icon" type="button" aria-label="메뉴">
      <ns-icon name="menu"></ns-icon>
    </button>
  </script>

  <h3>React</h3>
  <script type="text/plain">
    import { Button, ButtonLink } from "@neosimplix/common-ui/react";

    <Button type="submit" size="sm">저장</Button>
    <Button variant="ghost" size="sm" onClick={onDelete}>삭제</Button>
    <ButtonLink href="/login" variant="outline" fullWidth>로그인</ButtonLink>
  </script>
```

`<ns-icon>` 은 Task 7 에서 만든다. 이 예시 블록은 `<script type="text/plain">` 안이라 실행되지 않으므로 순서 문제가 없다.

- [ ] **Step 5: `docs/consumer-example.tsx` 에 `Button` 과 `ButtonLink` 를 넣는다**

import 에 추가하고, `Card` 안에 둔다.

```tsx
        <main>
          <Card>
            {children}
            <Button type="submit" size="sm" onClick={() => log("saved")}>저장</Button>
            <ButtonLink href="/login" variant="outline" fullWidth>로그인</ButtonLink>
          </Card>
        </main>
```

- [ ] **Step 6: `npm run check` 를 돌린다**

Run: `npm run check`
Expected: 통과. 마지막 줄의 클래스 목록에 `ns-button` 과 변형 여덟 개가 모두 나온다.

- [ ] **Step 7: 변형 하나를 문서에서 빠뜨려 실패를 확인한다**

`index.html` 의 클래스 표에서 `.ns-button--ghost` 행을 임시로 지운다. 데모의 `ns-button--ghost` 도 함께 지워야 한다 — `class="..."` 속성값도 문서화로 세기 때문이다.

Run: `npm run check`
Expected: FAIL — `index.html 에 문서화되지 않은 클래스: ns-button--ghost`

**변형까지 대조된다는 것을 실제로 본 것이다.** 확인 후 되돌린다.

- [ ] **Step 8: 빌드하고 확인한다**

Run: `npm run build`

```sh
grep -c 'ns-button--icon' dist/controls.css      # 1 이상
grep -o 'from *"react/jsx-runtime"' dist/react.js  # 출력 있어야 정상
```

- [ ] **Step 9: 사람이 확인할 것을 보고서에 적는다**

- 세 변형(solid/outline/ghost)이 시각적으로 구분되는지
- `disabled` 버튼의 커서가 `not-allowed` 이고 hover 배경이 바뀌지 않는지
- `<a class="ns-button">` 에 밑줄이 없고 `<button>` 과 높이가 같은지
- hover 전환이 튀지 않는지

- [ ] **Step 10: 커밋**

```bash
git add -A
git commit -m "feat(controls): .ns-button 과 Button·ButtonLink 추가"
```

---

### Task 3: `.ns-input` 과 `.ns-textarea`

둘을 한 Task 에 묶는다. 참고 구현이 **일부러 props·클래스 구성·invalid 처리를 똑같이 맞춰 둔** 짝이다 — 두 컨트롤이 다르게 생기면 `Field` 안에 나란히 놓았을 때 어긋나 보인다. 따로 구현하면 그 대응이 깨질 여지가 생긴다.

**Files:**
- Modify: `src/controls/controls.css`
- Create: `src/react/controls/Input.tsx`
- Create: `src/react/controls/Textarea.tsx`
- Modify: `src/react/index.ts`
- Modify: `index.html`
- Modify: `docs/consumer-example.tsx`

**Interfaces:**
- Consumes: `cx` (Task 1)
- Produces:
  - `export type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }`
  - `export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }`
  - `export function Input(props: InputProps)` · `export function Textarea(props: TextareaProps)`
  - 클래스 `.ns-input` · `.ns-textarea` (변형 없음)

- [ ] **Step 1: `controls.css` 에 두 클래스를 추가한다**

`.ns-button` 규칙 다음, `.ns-card` 앞에 넣는다.

```css
  /*
    .ns-input 과 .ns-textarea 는 값을 의도적으로 맞춰 둔다. Field 안에서
    나란히 놓였을 때 어긋나 보이지 않게 하기 위해서다.

    invalid 는 변형 클래스가 아니라 [aria-invalid="true"] 로 잡는다. 붙여야
    마땅한 속성을 붙이면 스타일이 따라온다 — 빨간 테두리만 원하고 화면낭독기에는
    안 알리는 조합은 만들 수 없고, 그건 막는 것이 맞다.
  */
  .ns-input,
  .ns-textarea {
    width: 100%;
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-line-strong);
    border-radius: var(--radius-control);
    background: var(--color-surface);
    color: var(--color-fg);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-sm);
    outline: none;
    box-sizing: border-box;
  }

  .ns-input { min-height: var(--control-height-md); }

  .ns-textarea {
    /* textarea 는 폼 컨트롤 기본 글꼴을 쓴다 — 상속시키지 않으면 혼자 monospace 로 뜬다. */
    font-family: inherit;
    /* 가로로 늘리면 표·대화상자 폭이 깨진다. 세로만 허용한다. */
    resize: vertical;
  }

  .ns-input::placeholder,
  .ns-textarea::placeholder {
    color: var(--color-fg-subtle);
  }

  .ns-input:focus,
  .ns-textarea:focus {
    border-color: var(--color-accent);
  }

  .ns-input:disabled,
  .ns-textarea:disabled {
    color: var(--color-fg-subtle);
    cursor: not-allowed;
  }

  .ns-input[aria-invalid="true"],
  .ns-input[aria-invalid="true"]:focus,
  .ns-textarea[aria-invalid="true"],
  .ns-textarea[aria-invalid="true"]:focus {
    border-color: var(--color-danger);
  }
```

`:focus` 뒤에 `[aria-invalid]` 규칙이 오는 순서가 중요하다. 같은 특정도라면 나중 것이 이기므로, 포커스된 invalid 컨트롤도 빨간 테두리를 유지한다.

- [ ] **Step 2: `src/react/controls/Input.tsx` 를 만든다**

```tsx
import type { InputHTMLAttributes } from "react";

import { cx } from "../cx.js";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export function Input({ invalid = false, className, ...rest }: InputProps) {
  return (
    <input
      className={cx("ns-input", className)}
      // false 를 넘기면 aria-invalid="false" 가 남는다. 없는 것과 다른 뜻이다.
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
}
```

- [ ] **Step 3: `src/react/controls/Textarea.tsx` 를 만든다**

```tsx
import type { TextareaHTMLAttributes } from "react";

import { cx } from "../cx.js";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

/**
 * `Input` 의 여러 줄 판이다. props·클래스 구성·invalid 처리를 일부러 똑같이
 * 맞춘다 — 두 컨트롤이 다르게 생기면 `Field` 안에 나란히 놓았을 때 어긋나 보인다.
 *
 * `rows` 기본값 3 은 호출부가 덮을 수 있다. 높이를 className 으로 잡게 두면
 * cascade layer 가 달라 조용히 안 먹는 경우가 생긴다.
 */
export function Textarea({ invalid = false, className, rows = 3, ...rest }: TextareaProps) {
  return (
    <textarea
      className={cx("ns-textarea", className)}
      aria-invalid={invalid || undefined}
      rows={rows}
      {...rest}
    />
  );
}
```

- [ ] **Step 4: `src/react/index.ts` 에 재export 를 추가한다**

```ts
export { Input } from "./controls/Input.js";
export type { InputProps } from "./controls/Input.js";
export { Textarea } from "./controls/Textarea.js";
export type { TextareaProps } from "./controls/Textarea.js";
```

- [ ] **Step 5: `index.html` 에 항목과 섹션을 추가한다**

"클래스" 그룹의 `.ns-card` 항목 앞에 두 줄을 넣는다.

```html
      <ns-nav-item href="#ns-input" label=".ns-input" badge="IN"></ns-nav-item>
      <ns-nav-item href="#ns-textarea" label=".ns-textarea" badge="TA"></ns-nav-item>
```

`<h2 id="ns-card">` 앞에 섹션 둘을 넣는다.

```html
  <h2 id="ns-input">.ns-input</h2>
  <p>
    한 줄 입력. 값·검증·자동완성·IME 를 전부 네이티브 <code>input</code> 이 처리한다.
    <code>invalid</code> 상태는 <strong>클래스가 아니라 <code>aria-invalid="true"</code></strong> 로 표시한다 —
    화면낭독기에 알리지 않고 빨간 테두리만 얻는 조합을 만들 수 없게 하기 위해서다.
  </p>

  <h3>데모</h3>
  <template class="ex">
    <input class="ns-input" placeholder="기본">
    <input class="ns-input" value="값이 있는 상태">
    <input class="ns-input" value="invalid" aria-invalid="true">
    <input class="ns-input" placeholder="disabled" disabled>
  </template>
  <div class="demo block" id="input-demo" style="display:grid;gap:var(--space-3);max-width:20rem;padding:var(--space-4)"></div>
  <pre></pre>

  <h3>클래스</h3>
  <table>
    <tr><th>클래스</th><th>역할</th></tr>
    <tr><td><code>.ns-input</code></td><td>기본. 변형 없음</td></tr>
  </table>

  <h3>상태</h3>
  <table>
    <tr><th>선택자</th><th>모양</th></tr>
    <tr><td><code>:focus</code></td><td>테두리가 <code>--color-accent</code></td></tr>
    <tr><td><code>[aria-invalid="true"]</code></td><td>테두리가 <code>--color-danger</code>. 포커스 중에도 유지</td></tr>
    <tr><td><code>:disabled</code></td><td>글자가 <code>--color-fg-subtle</code>, 커서 <code>not-allowed</code></td></tr>
    <tr><td><code>::placeholder</code></td><td><code>--color-fg-subtle</code></td></tr>
  </table>

  <h3>HTML</h3>
  <script type="text/plain">
    <input class="ns-input" name="email" type="email" autocomplete="email" required>
    <input class="ns-input" aria-invalid="true" aria-errormessage="email-error">
  </script>

  <h3>React</h3>
  <script type="text/plain">
    import { Input } from "@neosimplix/common-ui/react";

    <Input value={name} onChange={(e) => setName(e.target.value)} required />
    <Input invalid value={email} onChange={onChange} />
  </script>

  <h2 id="ns-textarea">.ns-textarea</h2>
  <p>
    여러 줄 입력. <code>.ns-input</code> 과 값을 맞춰 두었다 — <code>.ns-field</code> 안에
    나란히 놓였을 때 어긋나 보이지 않게 하기 위해서다. 가로 <code>resize</code> 는 막는다.
    표나 대화상자 안에서 폭을 깨뜨리기 때문이다.
  </p>

  <h3>데모</h3>
  <template class="ex">
    <textarea class="ns-textarea" rows="3" placeholder="기본"></textarea>
    <textarea class="ns-textarea" rows="3" aria-invalid="true">invalid</textarea>
    <textarea class="ns-textarea" rows="6" placeholder="rows=6"></textarea>
  </template>
  <div class="demo block" id="textarea-demo" style="display:grid;gap:var(--space-3);max-width:20rem;padding:var(--space-4)"></div>
  <pre></pre>

  <h3>클래스</h3>
  <table>
    <tr><th>클래스</th><th>역할</th></tr>
    <tr><td><code>.ns-textarea</code></td><td>기본. 변형 없음. <code>font-family: inherit</code> 과 <code>resize: vertical</code> 포함</td></tr>
  </table>

  <h3>HTML</h3>
  <script type="text/plain">
    <textarea class="ns-textarea" name="purpose" rows="3" required></textarea>
  </script>

  <h3>React</h3>
  <script type="text/plain">
    import { Textarea } from "@neosimplix/common-ui/react";

    <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} />
  </script>
```

- [ ] **Step 6: `docs/consumer-example.tsx` 에 둘을 넣는다**

`Card` 안에 추가한다. `invalid` 프롭도 실제로 써서 타입이 검사되게 한다.

```tsx
            <Input value="" onChange={(e) => log(e.target.value)} invalid />
            <Textarea value="" onChange={(e) => log(e.target.value)} rows={6} />
```

- [ ] **Step 7: `npm run check` 를 돌린다**

Run: `npm run check`
Expected: 통과. 클래스 목록에 `ns-input` · `ns-textarea` 포함.

- [ ] **Step 8: 빌드하고 확인한다**

Run: `npm run build`

```sh
grep -c 'aria-invalid' dist/controls.css     # 1 이상 — 속성 선택자가 살아있는지
```

- [ ] **Step 9: 사람이 확인할 것을 보고서에 적는다**

- 두 컨트롤의 테두리 색·반경·글자 크기가 같은지
- **한글을 입력해 IME 조합이 정상인지** — 네이티브라 되어야 하지만 확인 대상이다
- 브라우저 자동완성이 뜨는지 (`autocomplete="email"` 로)
- invalid 컨트롤을 포커스했을 때 테두리가 빨강을 유지하는지 (파랑/검정으로 바뀌면 규칙 순서가 잘못된 것)
- `textarea` 우하단 리사이즈 핸들이 세로로만 동작하는지
- `textarea` 글꼴이 monospace 가 아닌지

- [ ] **Step 10: 커밋**

```bash
git add -A
git commit -m "feat(controls): .ns-input 과 .ns-textarea 추가"
```

---

### Task 4: `.ns-select`

`input`/`textarea` 와 달리 별도 Task 인 이유는 렌더 로직이 있기 때문이다. `placeholder` 를 `<option value="" disabled>` 로 만들고, 아직 고르지 않은 상태를 옅게 보여주는 `:has()` 규칙이 붙는다.

**Files:**
- Modify: `src/controls/controls.css`
- Create: `src/react/controls/Select.tsx`
- Modify: `src/react/index.ts`
- Modify: `index.html`
- Modify: `docs/consumer-example.tsx`

**Interfaces:**
- Consumes: `cx` (Task 1)
- Produces:
  - `export type SelectOption = { value: string; label: string }`
  - `export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> & { options: SelectOption[]; placeholder?: string; invalid?: boolean }`
  - `export function Select(props: SelectProps)`
  - 클래스 `.ns-select`

- [ ] **Step 1: `controls.css` 에 `.ns-select` 를 추가한다**

`.ns-textarea` 규칙 다음에 넣는다.

```css
  .ns-select {
    width: 100%;
    min-height: var(--control-height-md);
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-line-strong);
    border-radius: var(--radius-control);
    background: var(--color-surface);
    color: var(--color-fg);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-sm);
    outline: none;
    box-sizing: border-box;
  }

  .ns-select:focus {
    border-color: var(--color-accent);
  }

  /*
    아직 고르지 않은 상태는 플레이스홀더처럼 옅게 보여준다.
    빈 값 option 이 선택돼 있는지를 :has() 로 판별한다 — 클래스를 토글하는
    자바스크립트가 필요 없고, 순수 HTML 에서도 동작한다.
  */
  .ns-select:has(option[value=""]:checked) {
    color: var(--color-fg-subtle);
  }

  .ns-select:disabled {
    color: var(--color-fg-subtle);
    cursor: not-allowed;
  }

  .ns-select[aria-invalid="true"],
  .ns-select[aria-invalid="true"]:focus {
    border-color: var(--color-danger);
  }
```

- [ ] **Step 2: `src/react/controls/Select.tsx` 를 만든다**

```tsx
import type { SelectHTMLAttributes } from "react";

import { cx } from "../cx.js";

export type SelectOption = { value: string; label: string };

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  options: SelectOption[];
  /** 비어 있는 첫 항목의 문구. 값은 항상 "" 이다. */
  placeholder?: string;
  invalid?: boolean;
};

/**
 * children 을 받지 않는다. option 을 호출부가 직접 쓰게 두면 빈 값 항목의
 * value 규약(항상 "")이 지켜지지 않고, .ns-select:has() 규칙이 조용히 어긋난다.
 */
export function Select({
  options,
  placeholder,
  invalid = false,
  className,
  ...rest
}: SelectProps) {
  return (
    <select
      className={cx("ns-select", className)}
      aria-invalid={invalid || undefined}
      {...rest}
    >
      {placeholder !== undefined && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
```

- [ ] **Step 3: `src/react/index.ts` 에 재export 를 추가한다**

```ts
export { Select } from "./controls/Select.js";
export type { SelectOption, SelectProps } from "./controls/Select.js";
```

- [ ] **Step 4: `index.html` 에 항목과 섹션을 추가한다**

"클래스" 그룹의 `.ns-card` 앞에 넣는다.

```html
      <ns-nav-item href="#ns-select" label=".ns-select" badge="SL"></ns-nav-item>
```

`<h2 id="ns-card">` 앞에 섹션을 넣는다.

```html
  <h2 id="ns-select">.ns-select</h2>
  <p>
    네이티브 <code>select</code>. 목록 열기·키보드 이동·모바일 휠 UI 를 브라우저가 처리한다.
    커스텀 리스트박스를 만들지 않는 이유가 그것이다 — 만들면 접근성을 처음부터 다시 짜야 한다.
  </p>
  <p>
    <strong>빈 값 항목의 <code>value</code> 는 항상 <code>""</code> 다.</strong>
    아직 고르지 않은 상태를 옅게 보여주는 규칙이 <code>:has(option[value=""]:checked)</code> 로
    그 규약에 의존한다.
  </p>

  <h3>데모</h3>
  <template class="ex">
    <select class="ns-select">
      <option value="" disabled selected>부서를 선택하세요</option>
      <option value="platform">플랫폼개발팀</option>
      <option value="data">데이터분석팀</option>
    </select>
    <select class="ns-select">
      <option value="staff">사원</option>
      <option value="senior" selected>선임</option>
    </select>
    <select class="ns-select" aria-invalid="true">
      <option value="" disabled selected>선택하세요</option>
      <option value="a">A</option>
    </select>
    <select class="ns-select" disabled>
      <option value="" disabled selected>disabled</option>
    </select>
  </template>
  <div class="demo block" id="select-demo" style="display:grid;gap:var(--space-3);max-width:20rem;padding:var(--space-4)"></div>
  <pre></pre>

  <h3>클래스</h3>
  <table>
    <tr><th>클래스</th><th>역할</th></tr>
    <tr><td><code>.ns-select</code></td><td>기본. 변형 없음</td></tr>
  </table>

  <h3>상태</h3>
  <table>
    <tr><th>선택자</th><th>모양</th></tr>
    <tr><td><code>:has(option[value=""]:checked)</code></td><td>글자가 <code>--color-fg-subtle</code> — 아직 고르지 않음</td></tr>
    <tr><td><code>:focus</code></td><td>테두리가 <code>--color-accent</code></td></tr>
    <tr><td><code>[aria-invalid="true"]</code></td><td>테두리가 <code>--color-danger</code></td></tr>
    <tr><td><code>:disabled</code></td><td>글자가 <code>--color-fg-subtle</code>, 커서 <code>not-allowed</code></td></tr>
  </table>

  <h3>HTML</h3>
  <script type="text/plain">
    <select class="ns-select" name="department" required>
      <option value="" disabled selected>부서를 선택하세요</option>
      <option value="platform">플랫폼개발팀</option>
    </select>
  </script>

  <h3>React</h3>
  <script type="text/plain">
    import { Select } from "@neosimplix/common-ui/react";

    <Select
      value={dept}
      onChange={(e) => setDept(e.target.value)}
      placeholder="부서를 선택하세요"
      options={[
        { value: "platform", label: "플랫폼개발팀" },
        { value: "data", label: "데이터분석팀" },
      ]}
    />
  </script>
```

- [ ] **Step 5: `docs/consumer-example.tsx` 에 `Select` 를 넣는다**

```tsx
            <Select
              value=""
              onChange={(e) => log(e.target.value)}
              placeholder="부서를 선택하세요"
              options={[{ value: "platform", label: "플랫폼개발팀" }]}
            />
```

- [ ] **Step 6: `npm run check` 를 돌린다**

Run: `npm run check`
Expected: 통과. 클래스 목록에 `ns-select` 포함.

- [ ] **Step 7: 사람이 확인할 것을 보고서에 적는다**

- 아직 고르지 않은 첫 번째 select 의 글자가 나머지보다 옅은지 (`:has()` 가 동작하는 증거)
- 값을 고르면 글자가 진해지는지
- 네이티브 화살표가 보이는지 (`appearance` 를 건드리지 않았다)
- disabled select 의 커서
- 목록을 열었을 때 옵션 글꼴이 깨지지 않는지

- [ ] **Step 8: 커밋**

```bash
git add -A
git commit -m "feat(controls): .ns-select 추가"
```

---

### Task 5: `.ns-checkbox`

자식이 셋인 첫 클래스다. 어디까지 자손 선택자로 하고 어디에 이름을 붙일지의 기준을 여기서 세운다.

**Files:**
- Modify: `src/controls/controls.css`
- Create: `src/react/controls/Checkbox.tsx`
- Modify: `src/react/index.ts`
- Modify: `index.html`
- Modify: `docs/consumer-example.tsx`

**Interfaces:**
- Consumes: `cx` (Task 1)
- Produces:
  - `export type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }`
  - `export function Checkbox(props: CheckboxProps)`
  - 클래스 `.ns-checkbox` · `.ns-checkbox__hint`

- [ ] **Step 1: `controls.css` 에 `.ns-checkbox` 를 추가한다**

`.ns-select` 규칙 다음에 넣는다.

```css
  /*
    행 전체가 <label> 이다. 클릭 영역이 라벨 글자까지 넓어지고, for/id 배선이
    필요 없다 — 감싸는 label 은 내부의 labelable 요소를 암묵적으로 가리킨다.

    (.ns-field 는 반대로 label 이 컨트롤을 감싸지 않는다. 그쪽은 hint/error 가
     accessible name 에 섞여 들어가는 문제가 있어서다. 체크박스는 hint 가
     짧은 보조 문구뿐이라 그 문제가 없다.)

    input 과 첫 span 은 요소 타입으로 특정되므로 자손 선택자로 잡는다.
    hint 만 이름을 붙인다 — span 이 둘이라 순서에만 의존하면 깨지기 쉽다.
  */
  .ns-checkbox {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-1-5) 0;
    cursor: pointer;
  }

  /* 클래스를 토글하는 자바스크립트 없이 disabled 를 반영한다. */
  .ns-checkbox:has(:disabled) {
    cursor: default;
    opacity: .6;
  }

  .ns-checkbox input {
    width: 1rem;
    height: 1rem;
    accent-color: var(--color-accent);
    cursor: inherit;
  }

  .ns-checkbox span {
    font-size: var(--font-size-sm);
    line-height: var(--line-height-sm);
    color: var(--color-fg-body);
  }

  .ns-checkbox__hint {
    font-size: var(--font-size-xs);
    line-height: var(--line-height-xs);
    color: var(--color-fg-subtle);
  }
```

`.ns-checkbox__hint` 가 `.ns-checkbox span` 다음에 와야 한다. 특정도가 같지 않지만(클래스 하나 vs 클래스+타입) 순서를 지켜 두면 나중에 특정도를 조정할 때 실수가 줄어든다.

- [ ] **Step 2: `src/react/controls/Checkbox.tsx` 를 만든다**

```tsx
import type { InputHTMLAttributes } from "react";

import { cx } from "../cx.js";

export type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  /**
   * 라벨 옆에 흐리게 붙는 보조 설명. 두 가지로 쓰인다 — 체크돼 있지만 바꿀 수
   * 없는 이유(비활성 체크박스), 또는 편집 가능한 항목이 무엇을 하는지 풀어 쓴 설명.
   */
  hint?: string;
};

export function Checkbox({ label, hint, className, ...rest }: CheckboxProps) {
  return (
    <label className={cx("ns-checkbox", className)}>
      {/* type 을 rest 뒤에 두어 호출부가 덮어쓸 수 없게 한다. */}
      <input {...rest} type="checkbox" />
      <span>{label}</span>
      {hint && <span className="ns-checkbox__hint">{hint}</span>}
    </label>
  );
}
```

`disabled` 는 `rest` 에 담겨 `<input>` 으로 간다. 참고 구현이 `rest.disabled && s.disabled` 로 클래스를 붙였던 것은 `:has(:disabled)` 가 대신한다.

- [ ] **Step 3: `src/react/index.ts` 에 재export 를 추가한다**

```ts
export { Checkbox } from "./controls/Checkbox.js";
export type { CheckboxProps } from "./controls/Checkbox.js";
```

- [ ] **Step 4: `index.html` 에 항목과 섹션을 추가한다**

"클래스" 그룹의 `.ns-card` 앞에 넣는다.

```html
      <ns-nav-item href="#ns-checkbox" label=".ns-checkbox" badge="CB"></ns-nav-item>
```

`<h2 id="ns-card">` 앞에 섹션을 넣는다.

```html
  <h2 id="ns-checkbox">.ns-checkbox</h2>
  <p>
    행 전체가 <code>label</code> 이다. 클릭 영역이 글자까지 넓어지고
    <code>for</code>/<code>id</code> 배선이 필요 없다 — 감싸는 <code>label</code> 이
    내부 컨트롤을 암묵적으로 가리킨다.
  </p>
  <p>
    <code>disabled</code> 는 <code>:has(:disabled)</code> 로 반영한다.
    클래스를 토글하는 자바스크립트가 없어 순수 HTML 에서도 그대로 동작한다.
  </p>

  <h3>데모</h3>
  <template class="ex">
    <label class="ns-checkbox">
      <input type="checkbox" checked>
      <span>사용자 목록 조회</span>
    </label>
    <label class="ns-checkbox">
      <input type="checkbox">
      <span>가입 승인</span>
    </label>
    <label class="ns-checkbox">
      <input type="checkbox" disabled>
      <span>프로젝트 권한 부여</span>
    </label>
    <label class="ns-checkbox">
      <input type="checkbox" checked disabled>
      <span>Global Influencer Marketing</span>
      <span class="ns-checkbox__hint">부서 기본</span>
    </label>
  </template>
  <div class="demo block" id="checkbox-demo" style="max-width:22rem;padding:var(--space-4)"></div>
  <pre></pre>

  <h3>클래스</h3>
  <table>
    <tr><th>클래스</th><th>붙이는 요소</th><th>설명</th></tr>
    <tr><td><code>.ns-checkbox</code></td><td><code>label</code></td><td>행 전체. <code>input</code> 과 첫 <code>span</code> 은 자손 선택자로 잡혀 클래스가 필요 없다</td></tr>
    <tr><td><code>.ns-checkbox__hint</code></td><td>두 번째 <code>span</code></td><td>보조 설명. <code>span</code> 이 둘이라 이름이 필요하다</td></tr>
  </table>

  <h3>HTML</h3>
  <script type="text/plain">
    <label class="ns-checkbox">
      <input type="checkbox" name="capabilities" value="users.read" checked>
      <span>사용자 목록 조회</span>
      <span class="ns-checkbox__hint">부서 기본</span>
    </label>
  </script>

  <h3>React</h3>
  <script type="text/plain">
    import { Checkbox } from "@neosimplix/common-ui/react";

    <Checkbox
      label="사용자 목록 조회"
      hint="부서 기본"
      checked={granted}
      onChange={(e) => setGranted(e.target.checked)}
    />
  </script>
```

- [ ] **Step 5: `docs/consumer-example.tsx` 에 `Checkbox` 를 넣는다**

```tsx
            <Checkbox
              label="사용자 목록 조회"
              hint="부서 기본"
              checked
              onChange={(e) => log(String(e.target.checked))}
            />
```

- [ ] **Step 6: `npm run check` 를 돌린다**

Run: `npm run check`
Expected: 통과. 클래스 목록에 `ns-checkbox` · `ns-checkbox__hint` 포함.

- [ ] **Step 7: 사람이 확인할 것을 보고서에 적는다**

- **라벨 글자를 클릭했을 때 체크가 토글되는지** — 암묵적 label 연결의 증거
- disabled 행 전체가 옅어지고 커서가 기본 화살표인지 (`:has()` 동작 확인)
- 체크박스 색이 `--color-accent` 인지 (`accent-color`)
- hint 가 라벨보다 작고 옅은지
- 여러 행을 세로로 쌓았을 때 간격이 균일한지

- [ ] **Step 8: 커밋**

```bash
git add -A
git commit -m "feat(controls): .ns-checkbox 추가"
```

---

### Task 6: `.ns-field`

접근성 배선이 있는 유일한 클래스다. React 는 `useId` + `cloneElement` 로 자동 배선하고, **순수 HTML 은 소비자가 직접 적는다.** 그 비대칭이 의도된 것임을 문서에 분명히 적는다.

**Files:**
- Modify: `src/controls/controls.css`
- Create: `src/react/controls/Field.tsx`
- Modify: `src/react/index.ts`
- Modify: `index.html`
- Modify: `docs/consumer-example.tsx`

**Interfaces:**
- Consumes: 없음 (`cx` 를 쓰지 않는다 — `className` 프롭을 받지 않는다)
- Produces:
  - `export type FieldProps = { label: string; hint?: ReactNode; error?: ReactNode; children: ReactNode }`
  - `export function Field(props: FieldProps)`
  - 클래스 `.ns-field` · `.ns-field__label` · `.ns-field__hint` · `.ns-field__error`

- [ ] **Step 1: `controls.css` 에 `.ns-field` 를 추가한다**

`.ns-checkbox` 규칙 다음, `.ns-card` 앞에 넣는다.

```css
  /*
    hint/error 는 <label> 밖에 두고 id 로 컨트롤과 연결한다. label 이 컨트롤을
    감싸면 hint/error 텍스트까지 그 컨트롤의 accessible name 에 포함돼,
    화면낭독기가 포커스마다 라벨과 오류 문구를 한 문장으로 읽게 된다.

    hint 와 error 가 둘 다 span 이라 양쪽 모두 이름이 필요하다. label 은
    하나뿐이지만, .ns-checkbox 의 label 이 역할이 정반대(행 전체를 감싼다)라
    구분을 위해 이름을 붙인다.
  */
  .ns-field {
    display: flex;
    flex-direction: column;
    gap: var(--space-1-5);
  }

  .ns-field__label {
    font-size: var(--font-size-sm);
    line-height: var(--line-height-sm);
    font-weight: var(--weight-medium);
    color: var(--color-fg-body);
  }

  .ns-field__hint {
    font-size: var(--font-size-xs);
    line-height: var(--line-height-xs);
    color: var(--color-fg-muted);
  }

  .ns-field__error {
    font-size: var(--font-size-xs);
    line-height: var(--line-height-xs);
    color: var(--color-danger);
  }
```

- [ ] **Step 2: `src/react/controls/Field.tsx` 를 만든다**

참고 구현 `dashboard-shell/components/ui/Field.tsx` 를 클래스 이름만 바꿔 옮긴다. 주석도 함께 옮긴다 — 왜 이 구조인지가 거기 있다.

```tsx
import { cloneElement, isValidElement, useId } from "react";
import type { ReactElement, ReactNode } from "react";

export type FieldProps = {
  label: string;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
};

type ControlProps = {
  id?: string;
  "aria-describedby"?: string;
  "aria-errormessage"?: string;
  "aria-invalid"?: boolean;
};

/**
 * hint/error 는 label 밖에 두고 id 로 컨트롤과 연결한다.
 * label 이 컨트롤을 감싸면 hint/error 텍스트까지 그 컨트롤의 accessible name 에
 * 포함돼, 화면낭독기가 포커스마다 라벨과 오류 문구를 한 문장으로 읽게 된다.
 * error 가 있으면 hint 는 감춘다 — 둘 다 보이면 어느 쪽을 읽어야 할지 모호하다.
 *
 * className 프롭을 받지 않는다. 이 컴포넌트는 아이에게 props 를 주입하는 것이
 * 본체이고, 레이아웃 조정은 감싸는 쪽이 한다.
 */
export function Field({ label, hint, error, children }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const showError = Boolean(error);
  const showHint = !showError && Boolean(hint);

  let control: ReactNode = children;
  let controlId = id;

  if (isValidElement(children)) {
    const element = children as ReactElement<ControlProps>;
    controlId = element.props.id ?? id;

    // cloneElement 는 값이 undefined 인 키도 그대로 얹어 기존 prop 을 지운다.
    // 그래서 필요한 키만 골라 넣는다 — 아이가 스스로 aria-invalid 등을 들고
    // 있을 때 hint/error 가 없는 렌더에서 그걸 지워버리지 않기 위해서다.
    const ariaProps: ControlProps = { id: controlId };
    if (showHint) ariaProps["aria-describedby"] = hintId;
    if (showError) {
      ariaProps["aria-errormessage"] = errorId;
      ariaProps["aria-invalid"] = true;
    }

    control = cloneElement(element, ariaProps);
  }

  return (
    <div className="ns-field">
      <label htmlFor={controlId} className="ns-field__label">
        {label}
      </label>
      {control}
      {showError ? (
        <span id={errorId} className="ns-field__error">
          {error}
        </span>
      ) : showHint ? (
        <span id={hintId} className="ns-field__hint">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 3: `src/react/index.ts` 에 재export 를 추가한다**

```ts
export { Field } from "./controls/Field.js";
export type { FieldProps } from "./controls/Field.js";
```

- [ ] **Step 4: `index.html` 에 항목과 섹션을 추가한다**

"클래스" 그룹의 `.ns-card` 앞에 넣는다.

```html
      <ns-nav-item href="#ns-field" label=".ns-field" badge="FD"></ns-nav-item>
```

`<h2 id="ns-card">` 앞에 섹션을 넣는다.

```html
  <h2 id="ns-field">.ns-field</h2>
  <p>
    라벨·hint·error 를 컨트롤 하나에 묶는다. <code>hint</code> 와 <code>error</code> 는
    <code>label</code> <strong>밖</strong>에 두고 <code>id</code> 로 연결한다 —
    <code>label</code> 이 컨트롤을 감싸면 그 문구까지 accessible name 에 들어가
    화면낭독기가 포커스마다 라벨과 오류를 한 문장으로 읽는다.
  </p>
  <p>
    <code>error</code> 가 있으면 <code>hint</code> 는 감춘다. 둘 다 보이면 어느 쪽을
    읽어야 할지 모호하다.
  </p>
  <p>
    <strong>순수 HTML 에서는 <code>id</code>·<code>for</code>·<code>aria-*</code> 를 직접 적어야 한다.</strong>
    React 의 <code>Field</code> 는 <code>useId</code> 로 자동 배선하지만, 클래스만으로는
    그 일을 할 수 없다. 빠뜨려도 경고가 없다는 것이 이 설계에서 수용한 한계다.
  </p>

  <h3>데모</h3>
  <template class="ex">
    <div class="ns-field">
      <label class="ns-field__label" for="f-dept">부서</label>
      <input class="ns-input" id="f-dept" placeholder="예: 플랫폼개발팀">
    </div>
    <div class="ns-field">
      <label class="ns-field__label" for="f-rank">직급</label>
      <input class="ns-input" id="f-rank" placeholder="예: 선임" aria-describedby="f-rank-hint">
      <span class="ns-field__hint" id="f-rank-hint">입력한 직급은 관리자 승인 대상입니다.</span>
    </div>
    <div class="ns-field">
      <label class="ns-field__label" for="f-email">이메일</label>
      <input class="ns-input" id="f-email" value="someone@gmail.com"
             aria-invalid="true" aria-errormessage="f-email-error">
      <span class="ns-field__error" id="f-email-error">@neosimplix.com 계정만 사용할 수 있습니다.</span>
    </div>
  </template>
  <div class="demo block" id="field-demo" style="display:grid;gap:var(--space-4);max-width:22rem;padding:var(--space-4)"></div>
  <pre></pre>

  <h3>클래스</h3>
  <table>
    <tr><th>클래스</th><th>붙이는 요소</th><th>설명</th></tr>
    <tr><td><code>.ns-field</code></td><td><code>div</code></td><td>세로 배치와 간격</td></tr>
    <tr><td><code>.ns-field__label</code></td><td><code>label</code></td><td><code>for</code> 로 컨트롤을 가리킨다</td></tr>
    <tr><td><code>.ns-field__hint</code></td><td><code>span</code></td><td>컨트롤의 <code>aria-describedby</code> 대상</td></tr>
    <tr><td><code>.ns-field__error</code></td><td><code>span</code></td><td>컨트롤의 <code>aria-errormessage</code> 대상. <code>aria-invalid="true"</code> 를 함께 붙인다</td></tr>
  </table>

  <h3>HTML — 배선까지 직접 적는다</h3>
  <script type="text/plain">
    <div class="ns-field">
      <label class="ns-field__label" for="email">이메일</label>
      <input class="ns-input" id="email" name="email"
             aria-invalid="true" aria-errormessage="email-error">
      <span class="ns-field__error" id="email-error">@neosimplix.com 계정만 사용할 수 있습니다.</span>
    </div>
  </script>

  <h3>React — 배선은 자동이다</h3>
  <script type="text/plain">
    import { Field, Input } from "@neosimplix/common-ui/react";

    <Field label="이메일" error={emailError}>
      <Input value={email} onChange={(e) => setEmail(e.target.value)} />
    </Field>

    <Field label="직급" hint="관리자 승인 후 반영됩니다">
      <Select placeholder="직급을 선택하세요" options={ranks} />
    </Field>
  </script>
```

- [ ] **Step 5: `docs/consumer-example.tsx` 에 `Field` 를 넣는다**

`hint` 와 `error` 두 경로를 모두 쓴다 — `cloneElement` 분기가 양쪽 다 타입 검사되게 한다.

```tsx
            <Field label="이메일" error="@neosimplix.com 계정만 사용할 수 있습니다.">
              <Input value="" onChange={(e) => log(e.target.value)} />
            </Field>
            <Field label="직급" hint="관리자 승인 후 반영됩니다">
              <Select
                value=""
                onChange={(e) => log(e.target.value)}
                placeholder="직급을 선택하세요"
                options={[{ value: "senior", label: "선임" }]}
              />
            </Field>
```

Task 4 에서 넣은 단독 `<Select>` 는 지운다 — `Field` 안의 것이 그 자리를 대신한다.

- [ ] **Step 6: `npm run check` 를 돌린다**

Run: `npm run check`
Expected: 통과. 클래스 목록에 `ns-field` · `ns-field__label` · `ns-field__hint` · `ns-field__error` 포함.

- [ ] **Step 7: 사람이 확인할 것을 보고서에 적는다**

- **라벨 글자를 클릭했을 때 해당 입력칸에 포커스가 가는지** — `for`/`id` 연결의 증거. 세 데모 모두 확인
- error 가 있는 필드의 입력칸 테두리가 빨간지 (`aria-invalid` 로 스타일된다)
- hint 와 error 의 색이 다른지 (`--color-fg-muted` vs `--color-danger`)
- 화면낭독기로 입력칸에 포커스했을 때 라벨만 읽고 hint/error 는 설명으로 따로 읽는지 (가능하면)

- [ ] **Step 8: 커밋**

```bash
git add -A
git commit -m "feat(controls): .ns-field 추가"
```

---

### Task 7: `ns-icon`

첫 태그다. 클래스는 SVG 마크업을 만들 수 없어서 태그가 된다. 태그 하나를 추가할 때 함께 움직이는 파일 여섯 곳(`components/` 둘 · `tokens.css` · `index.ts` · `elements.ts` · `react/index.ts` · `index.html`)의 경로를 여기서 확립한다.

**Files:**
- Create: `src/components/icon/icons.ts`
- Create: `src/components/icon/ns-icon.ts`
- Create: `src/components/icon/ns-icon.styles.ts`
- Modify: `src/tokens/tokens.css` (정의 전 레이아웃 예약)
- Modify: `src/index.ts`
- Modify: `src/react/elements.ts`
- Modify: `src/react/index.ts`
- Modify: `index.html`
- Modify: `docs/consumer-example.tsx`

**Interfaces:**
- Produces:
  - `src/components/icon/icons.ts` → `export interface IconDef { viewBox: string; content: SVGTemplateResult }`, `export const icons: Record<string, IconDef>` (키: `"menu"` · `"google"` · `"close"`)
  - `src/components/icon/ns-icon.ts` → `export class NsIcon extends LitElement` with `name: string`
  - `src/react/elements.ts` → `export const NsIcon` (`@lit/react` 래퍼, 이벤트 없음)

- [ ] **Step 1: `src/components/icon/icons.ts` 를 만든다**

```ts
import { svg, type SVGTemplateResult } from "lit";

export interface IconDef {
  /** 아이콘마다 다르다. ns-icon 이 <svg> 에 그대로 넘긴다. */
  viewBox: string;
  /** <svg> 의 자식들. width/height 를 적지 않는다 — 크기는 :host 가 정한다. */
  content: SVGTemplateResult;
}

/*
  아이콘 스프라이트.

  전부 이 모듈에 있으므로 트리 셰이킹되지 않는다. 셋이면 무시할 수준이고,
  늘어나면 서브패스 분리를 검토한다.

  stroke/fill 에 currentColor 를 쓴다. color 는 shadow 경계를 넘어 상속되므로
  바깥에서 색을 정할 수 있다. google 은 브랜드 규정상 색이 고정이라 예외다 —
  토큰을 쓰지 않는 유일한 아이콘이다.
*/
export const icons: Record<string, IconDef> = {
  menu: {
    viewBox: "0 0 20 20",
    content: svg`
      <path
        d="M3 5h14M3 10h14M3 15h14"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
      />
    `,
  },

  close: {
    viewBox: "0 0 20 20",
    content: svg`
      <path
        d="M5 5l10 10M15 5L5 15"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
      />
    `,
  },

  // 구글 브랜드 마크. 색이 규정으로 고정돼 있어 토큰을 쓰지 않는다.
  google: {
    viewBox: "0 0 18 18",
    content: svg`
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    `,
  },
};
```

- [ ] **Step 2: `src/components/icon/ns-icon.styles.ts` 를 만든다**

```ts
import { css } from "lit";

export const styles = css`
  /*
    크기(width/height)는 tokens.css 의 ns-icon 규칙이 정한다. 문서 트리의
    선택자가 :host 를 이기므로 여기에 값을 두면 두 곳에 존재하게 된다 —
    var() 폴백을 금지하는 것과 같은 이유다.
  */
  :host {
    display: inline-flex;
    flex: none;
  }

  svg {
    display: block;
    width: 100%;
    height: 100%;
  }
`;
```

- [ ] **Step 3: `src/components/icon/ns-icon.ts` 를 만든다**

```ts
import { LitElement, html, nothing } from "lit";
import { property } from "lit/decorators.js";

import { register } from "../../internal/register.js";
import { warnIfTokensMissing } from "../../internal/warn-missing-tokens.js";
import { icons } from "./icons.js";
import { styles } from "./ns-icon.styles.js";

export class NsIcon extends LitElement {
  static override styles = styles;

  /** 스프라이트의 키. 없는 이름이면 아무것도 그리지 않고 경고한다. */
  @property({ type: String }) name = "";

  #warned = "";

  override connectedCallback(): void {
    super.connectedCallback();
    warnIfTokensMissing();
    /*
      기본은 장식이다. 의미를 가져야 하면 소비자가 호스트에
      role="img" aria-label="…" 을 붙인다.
    */
    this.setAttribute("aria-hidden", "true");
  }

  override render() {
    const def = icons[this.name];

    if (!def) {
      // 같은 이름으로 리렌더될 때마다 찍지 않는다.
      if (this.name !== this.#warned) {
        this.#warned = this.name;
        console.warn(
          `[ns-icon] 없는 아이콘: "${this.name}". 사용 가능: ${Object.keys(icons).join(", ")}`,
        );
      }
      return nothing;
    }

    return html`<svg viewBox=${def.viewBox} fill="none">${def.content}</svg>`;
  }
}

register("ns-icon", NsIcon);

declare global {
  interface HTMLElementTagNameMap {
    "ns-icon": NsIcon;
  }
}
```

`aria-hidden` 을 `connectedCallback` 에서 호스트에 직접 붙인다. 소비자가 `role="img"` 를 붙이려면 `aria-hidden` 도 함께 지워야 하므로, 그 사실을 문서에 적는다.

- [ ] **Step 4: `src/tokens/tokens.css` 에 예약을 추가한다**

파일 끝의 `ns-sidebar:not([open])` 줄 다음에 넣는다.

```css
ns-icon { display: inline-flex; width: 1.25rem; height: 1.25rem; }
```

같은 블록의 주석("정의 전 레이아웃 예약")이 이미 이유를 설명하고 있다. 한 줄을 덧붙인다.

```css
/* ns-icon 의 크기는 여기가 단일 출처다. 컴포넌트 shadow 에 두면 값이 두 곳에 존재한다. */
```

- [ ] **Step 5: `src/index.ts` 에 등록과 재export 를 추가한다**

import 는 알파벳 순을 유지한다.

```ts
import "./components/header/ns-header.js";
import "./components/icon/ns-icon.js";
import "./components/nav-group/ns-nav-group.js";
```

```ts
export { NsIcon } from "./components/icon/ns-icon.js";
```

- [ ] **Step 6: `src/react/elements.ts` 에 래퍼를 추가한다**

```ts
import { NsIcon as NsIconElement } from "../components/icon/ns-icon.js";
```

```ts
/* 이벤트가 없다. events 를 빈 객체로 두면 createComponent 가 그대로 받는다. */
export const NsIcon = createComponent({
  react: React,
  tagName: "ns-icon",
  elementClass: NsIconElement,
  events: {},
});
```

- [ ] **Step 7: `src/react/index.ts` 에 재export 를 추가한다**

기존 태그 재export 줄에 `NsIcon` 을 넣는다.

```ts
export { NsHeader, NsIcon, NsNavGroup, NsNavItem, NsSidebar } from "./elements.js";
```

- [ ] **Step 8: `index.html` 에 항목과 섹션을 추가한다**

"컴포넌트" 그룹의 `ns-header` 항목 **앞**에 넣는다.

```html
      <ns-nav-item href="#ns-icon" label="ns-icon" badge="IC"></ns-nav-item>
```

`<h2 id="ns-header">` 바로 **앞**에 섹션을 넣는다.

```html
  <h2 id="ns-icon">ns-icon</h2>
  <p>
    인라인 SVG 를 이름으로 꺼낸다. <strong>행동은 없지만 마크업을 만들어 주므로</strong>
    클래스가 아니라 태그다 — CSS 는 SVG 를 만들 수 없다.
  </p>
  <p>
    색은 <code>currentColor</code> 다. <code>color</code> 는 shadow 경계를 넘어
    상속되므로 바깥에서 정할 수 있다. 크기는 호스트 CSS 로 정한다
    (<code>ns-icon { width: 1rem }</code>). <code>google</code> 만 브랜드 규정상 색이 고정이다.
  </p>

  <h3>데모</h3>
  <template class="ex">
    <ns-icon name="menu"></ns-icon>
    <ns-icon name="close"></ns-icon>
    <ns-icon name="google"></ns-icon>
    <span style="color: var(--color-danger)"><ns-icon name="close"></ns-icon></span>
    <span style="color: var(--color-fg-muted)"><ns-icon name="menu" style="width:2rem;height:2rem"></ns-icon></span>
  </template>
  <div class="demo block" id="icon-demo" style="display:flex;align-items:center;gap:var(--space-4);padding:var(--space-4)"></div>
  <pre></pre>

  <h3>프로퍼티</h3>
  <table>
    <tr><th>프로퍼티</th><th>속성</th><th>타입</th><th>기본값</th><th>설명</th></tr>
    <tr><td><code>name</code></td><td><code>name</code></td><td>string</td><td><code>""</code></td><td>스프라이트의 키. 없는 이름이면 아무것도 그리지 않고 콘솔에 한 번 경고한다</td></tr>
  </table>

  <h3>수록된 아이콘</h3>
  <table>
    <tr><th>이름</th><th>용도</th><th>색</th></tr>
    <tr><td><code>menu</code></td><td>사이드바 토글 등 햄버거</td><td><code>currentColor</code></td></tr>
    <tr><td><code>close</code></td><td>대화상자 닫기</td><td><code>currentColor</code></td></tr>
    <tr><td><code>google</code></td><td>구글 로그인 버튼</td><td>브랜드 고정 4색</td></tr>
  </table>
  <p>
    아이콘 전부가 번들에 들어간다 — 트리 셰이킹되지 않는다. 셋이면 무시할 수준이고,
    늘어나면 서브패스 분리를 검토한다.
  </p>

  <h3>접근성</h3>
  <p>
    호스트에 <code>aria-hidden="true"</code> 를 자동으로 붙인다. 아이콘이 유일한
    내용인 버튼은 <strong>버튼에</strong> <code>aria-label</code> 을 붙인다.
    아이콘 자체가 의미를 가져야 하는 드문 경우에만 <code>aria-hidden</code> 을 지우고
    <code>role="img" aria-label</code> 을 붙인다.
  </p>

  <h3>HTML</h3>
  <script type="text/plain">
    <button class="ns-button ns-button--icon" type="button" aria-label="메뉴 열기">
      <ns-icon name="menu"></ns-icon>
    </button>

    <a class="ns-button ns-button--outline ns-button--md" href="/api/auth/google/start">
      <ns-icon name="google"></ns-icon>
      Google 계정으로 로그인
    </a>
  </script>

  <h3>React</h3>
  <script type="text/plain">
    import { Button, NsIcon } from "@neosimplix/common-ui/react";

    <Button variant="icon" aria-label="메뉴 열기" onClick={onToggle}>
      <NsIcon name="menu" />
    </Button>
  </script>
```

- [ ] **Step 9: `docs/consumer-example.tsx` 에 `NsIcon` 을 넣는다**

기존 `Button` 예시를 아이콘 버튼으로 바꾼다.

```tsx
            <Button variant="icon" aria-label="메뉴 열기" onClick={() => log("toggle")}>
              <NsIcon name="menu" />
            </Button>
```

- [ ] **Step 10: `npm run check` 를 돌린다**

Run: `npm run check`
Expected: 통과. ③번 이벤트 검사가 기존 두 이벤트만 보고한다 (`ns-icon` 은 이벤트가 없다).

- [ ] **Step 11: 빌드하고 등록이 살아남았는지 확인한다**

Run: `npm run build`

```sh
grep -c 'ns-icon' dist/bundle.umd.js     # 1 이상 — register 호출이 번들에 남았는지
grep -c 'ns-icon' dist/index.js          # 1 이상
ls dist/components/icon/                  # ns-icon.d.ts · icons.d.ts · ns-icon.styles.d.ts
```

- [ ] **Step 12: 없는 아이콘 이름의 경고 경로를 확인한다**

`index.html` 의 아이콘 데모에 임시로 한 줄을 넣는다.

```html
    <ns-icon name="nope"></ns-icon>
```

Run: `npm run demo` 후 브라우저 콘솔 확인 — 이것은 **사람이 확인할 항목**이다. 구현자는 `npm run check` 가 통과하는 것까지만 확인하고, 이 줄은 되돌린다.

- [ ] **Step 13: 사람이 확인할 것을 보고서에 적는다**

- 세 아이콘이 모두 보이고 `menu`/`close` 가 주변 글자색을 따라가는지
- `--color-danger` 를 준 부모 안의 `close` 가 빨간지 (`currentColor` 가 shadow 를 넘는 증거)
- `style="width:2rem"` 을 준 것이 실제로 커지는지 (호스트 CSS 로 크기 제어)
- `google` 아이콘이 4색으로 보이는지
- **없는 이름(`name="nope"`)에서 콘솔 경고가 한 번만 찍히는지**
- `tokens.css` 를 링크에서 잠시 지웠을 때 아이콘이 사라지지 않고(display 는 shadow 에도 있다) 크기만 잃는지

- [ ] **Step 14: 커밋**

```bash
git add -A
git commit -m "feat(icon): ns-icon 과 아이콘 스프라이트 추가"
```

---

### Task 8: `ns-page-heading`

`title` 을 속성 이름으로 쓸 수 없다는 제약과, React 프롭 이름을 유지하는 shim 패턴을 여기서 확립한다. `ns-dialog` 가 같은 패턴을 쓴다.

**Files:**
- Create: `src/components/page-heading/ns-page-heading.ts`
- Create: `src/components/page-heading/ns-page-heading.styles.ts`
- Create: `src/react/tags/PageHeading.tsx`
- Modify: `src/tokens/tokens.css`
- Modify: `src/index.ts`
- Modify: `src/react/elements.ts`
- Modify: `src/react/index.ts`
- Modify: `index.html`
- Modify: `docs/consumer-example.tsx`

**Interfaces:**
- Consumes: 없음
- Produces:
  - `export class NsPageHeading extends LitElement` with `heading: string`, `description: string`
  - `src/react/elements.ts` → `export const NsPageHeadingBase` (`@lit/react` 래퍼. `Element` 는 Lit 클래스 별칭이 쓰므로 래퍼는 `Base` 다)
  - `src/react/tags/PageHeading.tsx` → `export type PageHeadingProps = { title: string; description?: string; className?: string }`, `export function PageHeading(props: PageHeadingProps)`

- [ ] **Step 1: `src/components/page-heading/ns-page-heading.styles.ts` 를 만든다**

```ts
import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  h1 {
    margin: 0;
    font-size: var(--font-size-xl);
    line-height: var(--line-height-xl);
    font-weight: var(--weight-semibold);
    color: var(--color-fg);
  }

  p {
    margin: var(--space-1-5) 0 0;
    font-size: var(--font-size-sm);
    line-height: var(--line-height-sm);
    color: var(--color-fg-muted);
  }
`;
```

- [ ] **Step 2: `src/components/page-heading/ns-page-heading.ts` 를 만든다**

```ts
import { LitElement, html, nothing } from "lit";
import { property } from "lit/decorators.js";

import { register } from "../../internal/register.js";
import { warnIfTokensMissing } from "../../internal/warn-missing-tokens.js";
import { styles } from "./ns-page-heading.styles.js";

export class NsPageHeading extends LitElement {
  static override styles = styles;

  /**
   * 제목.
   *
   * `title` 이 아니라 `heading` 인 이유: `title` 은 모든 HTML 요소의 전역
   * 속성이고 브라우저가 툴팁을 띄운다. `@property` 로 `HTMLElement.prototype.title`
   * 을 덮어도 속성에 반영되는 순간 제목 전체가 툴팁을 갖는다.
   * React 프롭만 `title` 을 유지한다(src/react/tags/PageHeading.tsx).
   */
  @property({ type: String }) heading = "";

  /** 제목 아래 한 줄. 빈 문자열이면 <p> 를 렌더하지 않는다. */
  @property({ type: String }) description = "";

  override connectedCallback(): void {
    super.connectedCallback();
    warnIfTokensMissing();
  }

  override render() {
    return html`
      <h1>${this.heading}</h1>
      ${this.description ? html`<p>${this.description}</p>` : nothing}
    `;
  }
}

register("ns-page-heading", NsPageHeading);

declare global {
  interface HTMLElementTagNameMap {
    "ns-page-heading": NsPageHeading;
  }
}
```

`<h1>` 로 고정한다. 로그인 카드 안에서도 그 페이지의 유일한 제목이라 h1 이 맞고, 참고 구현도 그렇다.

- [ ] **Step 3: `src/tokens/tokens.css` 에 예약을 추가한다**

```css
ns-page-heading { display: block; }
```

- [ ] **Step 4: `src/index.ts` 에 등록과 재export 를 추가한다**

```ts
import "./components/page-heading/ns-page-heading.js";
```

```ts
export { NsPageHeading } from "./components/page-heading/ns-page-heading.js";
```

- [ ] **Step 5: `src/react/elements.ts` 에 래퍼를 추가한다**

```ts
import { NsPageHeading as NsPageHeadingElement } from "../components/page-heading/ns-page-heading.js";
```

```ts
/*
  이 래퍼는 소비자에게 직접 노출하지 않는다. tags/PageHeading.tsx 가 감싸서
  title 프롭을 heading 속성으로 넘긴다 — 소비자 호출부를 바꾸지 않기 위해서다.
  Element 는 Lit 클래스 별칭이 쓰므로(기존 네 컴포넌트와 같은 규칙) 래퍼는 Base 다.
*/
export const NsPageHeadingBase = createComponent({
  react: React,
  tagName: "ns-page-heading",
  elementClass: NsPageHeadingElement,
  events: {},
});
```

- [ ] **Step 6: `src/react/tags/PageHeading.tsx` 를 만든다**

```tsx
import { NsPageHeadingBase } from "../elements.js";

export type PageHeadingProps = {
  /**
   * 커스텀 엘리먼트의 속성 이름은 `heading` 이다 — `title` 은 브라우저 툴팁을
   * 띄우기 때문이다. React 프롭은 `title` 을 유지해 소비자 호출부가 바뀌지 않게 한다.
   */
  title: string;
  description?: string;
  className?: string;
};

export function PageHeading({ title, description, className }: PageHeadingProps) {
  return (
    <NsPageHeadingBase heading={title} description={description ?? ""} className={className} />
  );
}
```

`description` 을 `?? ""` 로 넘기는 이유는 `undefined` 를 그대로 넘기면 `@lit/react` 가 프로퍼티에 `undefined` 를 대입해 Lit 의 기본값(`""`)을 지우기 때문이다. 렌더 결과는 같지만 타입상 `string` 을 유지하는 쪽이 명확하다.

- [ ] **Step 7: `src/react/index.ts` 에 재export 를 추가한다**

```ts
export { PageHeading } from "./tags/PageHeading.js";
export type { PageHeadingProps } from "./tags/PageHeading.js";
```

`NsPageHeadingBase` 는 내보내지 않는다.

- [ ] **Step 8: `index.html` 에 항목과 섹션을 추가한다**

"컴포넌트" 그룹의 `ns-icon` 항목 다음에 넣는다.

```html
      <ns-nav-item href="#ns-page-heading" label="ns-page-heading" badge="PH"></ns-nav-item>
```

`<h2 id="ns-header">` 앞, `ns-icon` 섹션 다음에 넣는다.

```html
  <h2 id="ns-page-heading">ns-page-heading</h2>
  <p>
    페이지 제목과 한 줄 설명. <code>h1</code> 과 <code>p</code> 두 줄, 그리고 제목
    레벨을 만들어 주므로 태그다.
  </p>
  <p>
    <strong>속성 이름이 <code>title</code> 이 아니라 <code>heading</code> 이다.</strong>
    <code>title</code> 은 모든 HTML 요소의 전역 속성이라 브라우저가 툴팁을 띄운다 —
    제목 위에 마우스를 올리면 같은 글자가 툴팁으로 한 번 더 뜬다.
    React 프롭은 <code>title</code> 을 유지한다.
  </p>

  <h3>데모</h3>
  <template class="ex">
    <ns-page-heading
      heading="가입 신청 완료"
      description="관리자가 승인하면 대시보드에 접근할 수 있습니다."
    ></ns-page-heading>
    <ns-page-heading heading="설명 없는 제목"></ns-page-heading>
  </template>
  <div class="demo block" id="page-heading-demo" style="display:grid;gap:var(--space-6);padding:var(--space-4)"></div>
  <pre></pre>

  <h3>프로퍼티</h3>
  <table>
    <tr><th>프로퍼티</th><th>속성</th><th>타입</th><th>기본값</th><th>설명</th></tr>
    <tr><td><code>heading</code></td><td><code>heading</code></td><td>string</td><td><code>""</code></td><td><code>h1</code> 의 내용</td></tr>
    <tr><td><code>description</code></td><td><code>description</code></td><td>string</td><td><code>""</code></td><td>빈 문자열이면 <code>p</code> 를 렌더하지 않는다</td></tr>
  </table>
  <p>
    마크업이 필요한 설명은 받지 않는다. 소비자 8곳의 <code>description</code> 이 전부
    평문 문자열이어서 속성으로 충분하다.
  </p>

  <h3>HTML</h3>
  <script type="text/plain">
    <ns-page-heading heading="사용자" description="가입 신청을 승인하고 권한을 관리합니다."></ns-page-heading>
  </script>

  <h3>React — 프롭은 title 이다</h3>
  <script type="text/plain">
    import { PageHeading } from "@neosimplix/common-ui/react";

    <PageHeading title="사용자" description="가입 신청을 승인하고 권한을 관리합니다." />
  </script>
```

- [ ] **Step 9: `docs/consumer-example.tsx` 에 `PageHeading` 을 넣는다**

`Card` 안 맨 위에 둔다.

```tsx
            <PageHeading title="사용자" description="가입 신청을 승인하고 권한을 관리합니다." />
```

- [ ] **Step 10: `npm run check` 를 돌린다**

Run: `npm run check`
Expected: 통과.

- [ ] **Step 11: `title` 을 속성으로 쓰면 안 되는 이유를 문서와 코드 양쪽에서 확인한다**

```sh
grep -rn 'title' src/components/page-heading/    # heading 을 설명하는 주석에서만 나와야 한다
grep -c 'heading=' index.html                     # 데모와 예시에서 쓰인 횟수
```

`@property` 로 `title` 을 선언한 곳이 없어야 한다. 이 확인은 grep 으로 가능하다.

- [ ] **Step 12: 빌드하고 확인한다**

Run: `npm run build`

```sh
grep -c 'ns-page-heading' dist/bundle.umd.js     # 1 이상
ls dist/react/tags/PageHeading.d.ts               # 선언이 방출됐는지
```

- [ ] **Step 13: 사람이 확인할 것을 보고서에 적는다**

- 제목이 `--font-size-xl`, 설명이 `--font-size-sm` 이고 색이 다른지
- 설명 없는 두 번째 데모에 빈 여백이 남지 않는지
- **제목 위에 마우스를 올렸을 때 툴팁이 뜨지 않는지** — `heading` 으로 개명한 이유의 확인
- 카드 안에 넣었을 때 위 여백이 카드 패딩과 겹치지 않는지

- [ ] **Step 14: 커밋**

```bash
git add -A
git commit -m "feat(page-heading): ns-page-heading 추가"
```

---

### Task 9: `ns-skeleton`

크기를 프로퍼티로 받는 첫 컴포넌트다. 참고 구현은 Tailwind 유틸(`className="h-9 w-40"`)로 크기를 받았는데, 순수 HTML 에는 그 유틸이 없다.

**Files:**
- Create: `src/components/skeleton/ns-skeleton.ts`
- Create: `src/components/skeleton/ns-skeleton.styles.ts`
- Modify: `src/tokens/tokens.css`
- Modify: `src/index.ts`
- Modify: `src/react/elements.ts`
- Modify: `src/react/index.ts`
- Modify: `index.html`
- Modify: `docs/consumer-example.tsx`

**Interfaces:**
- Consumes: 없음
- Produces:
  - `export class NsSkeleton extends LitElement` with `width: string`, `height: string`, `radius: string`
  - `src/react/elements.ts` → `export const NsSkeleton`

- [ ] **Step 1: `src/components/skeleton/ns-skeleton.styles.ts` 를 만든다**

```ts
import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  .bar {
    background: var(--color-surface-hover);
    animation: pulse 2s cubic-bezier(.4, 0, .6, 1) infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: .5; }
  }

  /*
    맥박 애니메이션은 이 설정이 정확히 겨냥하는 종류다. 참고 구현에는 없었다.
    멈추기만 하고 색은 유지한다 — 자리를 차지한다는 정보는 남아야 한다.
  */
  @media (prefers-reduced-motion: reduce) {
    .bar { animation: none; }
  }
`;
```

- [ ] **Step 2: `src/components/skeleton/ns-skeleton.ts` 를 만든다**

```ts
import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { register } from "../../internal/register.js";
import { warnIfTokensMissing } from "../../internal/warn-missing-tokens.js";
import { styles } from "./ns-skeleton.styles.js";

/** tokens.css 의 반경 토큰 이름들. 이 목록에 없으면 원시 CSS 값으로 쓴다. */
const RADIUS_TOKENS = new Set(["badge", "control", "panel", "card", "pill"]);

export class NsSkeleton extends LitElement {
  static override styles = styles;

  /** CSS 길이. 참고 구현이 Tailwind 유틸로 받던 것을 프로퍼티로 옮긴 것이다. */
  @property({ type: String }) width = "100%";

  @property({ type: String }) height = "1rem";

  /**
   * `badge` `control` `panel` `card` `pill` 중 하나면 해당 토큰을 쓰고,
   * 아니면 원시 CSS 값으로 그대로 쓴다(`50%`, `0` 등).
   */
  @property({ type: String }) radius = "control";

  override connectedCallback(): void {
    super.connectedCallback();
    warnIfTokensMissing();
    // 로딩 자리표시자는 화면낭독기에 읽힐 내용이 없다.
    this.setAttribute("aria-hidden", "true");
  }

  #radiusValue(): string {
    return RADIUS_TOKENS.has(this.radius) ? `var(--radius-${this.radius})` : this.radius;
  }

  override render() {
    return html`
      <div
        class="bar"
        style="width:${this.width};height:${this.height};border-radius:${this.#radiusValue()}"
      ></div>
    `;
  }
}

register("ns-skeleton", NsSkeleton);

declare global {
  interface HTMLElementTagNameMap {
    "ns-skeleton": NsSkeleton;
  }
}
```

크기를 `:host` 가 아니라 내부 `.bar` 에 주는 이유는 `:host` 스타일이 문서 트리 선택자에 지기 때문이다. 소비자가 `ns-skeleton { width: … }` 를 쓰면 프로퍼티가 무시되어 혼란스럽다. 내부 요소에 주면 프로퍼티가 언제나 이긴다.

- [ ] **Step 3: `src/tokens/tokens.css` 에 예약을 추가한다**

```css
ns-skeleton { display: block; }
```

- [ ] **Step 4: `src/index.ts` 에 등록과 재export 를 추가한다**

```ts
import "./components/skeleton/ns-skeleton.js";
```

```ts
export { NsSkeleton } from "./components/skeleton/ns-skeleton.js";
```

- [ ] **Step 5: `src/react/elements.ts` 에 래퍼를 추가한다**

```ts
import { NsSkeleton as NsSkeletonElement } from "../components/skeleton/ns-skeleton.js";
```

```ts
export const NsSkeleton = createComponent({
  react: React,
  tagName: "ns-skeleton",
  elementClass: NsSkeletonElement,
  events: {},
});
```

- [ ] **Step 6: `src/react/index.ts` 의 태그 재export 에 `NsSkeleton` 을 넣는다**

```ts
export { NsHeader, NsIcon, NsNavGroup, NsNavItem, NsSidebar, NsSkeleton } from "./elements.js";
```

- [ ] **Step 7: `index.html` 에 항목과 섹션을 추가한다**

"컴포넌트" 그룹의 `ns-page-heading` 다음에 넣는다.

```html
      <ns-nav-item href="#ns-skeleton" label="ns-skeleton" badge="SK"></ns-nav-item>
```

`ns-page-heading` 섹션 다음에 넣는다.

```html
  <h2 id="ns-skeleton">ns-skeleton</h2>
  <p>
    로딩 자리표시자. 크기를 <strong>프로퍼티로</strong> 받는다 — 참고 구현은
    Tailwind 유틸(<code>h-9 w-40</code>)로 받았지만 순수 HTML 에는 그 유틸이 없어
    인라인 스타일이 되기 때문이다.
  </p>
  <p>
    <code>prefers-reduced-motion: reduce</code> 에서 맥박 애니메이션을 멈춘다.
    색은 유지한다 — 자리를 차지한다는 정보는 남아야 한다.
  </p>

  <h3>데모</h3>
  <template class="ex">
    <ns-skeleton width="10rem" height="2.25rem"></ns-skeleton>
    <ns-skeleton width="6rem" height="2.25rem" radius="pill"></ns-skeleton>
    <ns-skeleton width="6rem" height="6rem" radius="card"></ns-skeleton>
    <ns-skeleton width="100%" height=".75rem" radius="0"></ns-skeleton>
  </template>
  <div class="demo block" id="skeleton-demo" style="display:grid;gap:var(--space-3);justify-items:start;padding:var(--space-4)"></div>
  <pre></pre>

  <h3>프로퍼티</h3>
  <table>
    <tr><th>프로퍼티</th><th>속성</th><th>타입</th><th>기본값</th><th>설명</th></tr>
    <tr><td><code>width</code></td><td><code>width</code></td><td>string</td><td><code>100%</code></td><td>CSS 길이</td></tr>
    <tr><td><code>height</code></td><td><code>height</code></td><td>string</td><td><code>1rem</code></td><td>CSS 길이</td></tr>
    <tr><td><code>radius</code></td><td><code>radius</code></td><td>string</td><td><code>control</code></td><td><code>badge</code> <code>control</code> <code>panel</code> <code>card</code> <code>pill</code> 중 하나면 해당 토큰. 아니면 원시 CSS 값</td></tr>
  </table>

  <h3>접근성</h3>
  <p>
    호스트에 <code>aria-hidden="true"</code> 를 자동으로 붙인다. 로딩 중임을 알려야 하면
    감싸는 영역에 <code>aria-busy="true"</code> 를 소비자가 붙인다.
  </p>

  <h3>HTML</h3>
  <script type="text/plain">
    <div aria-busy="true">
      <ns-skeleton width="10rem" height="2.25rem"></ns-skeleton>
      <ns-skeleton width="100%" height=".75rem" radius="0"></ns-skeleton>
    </div>
  </script>

  <h3>React</h3>
  <script type="text/plain">
    import { NsSkeleton } from "@neosimplix/common-ui/react";

    {loading
      ? <NsSkeleton width="10rem" height="2.25rem" />
      : <span>{value}</span>}
  </script>
```

- [ ] **Step 8: `docs/consumer-example.tsx` 에 `NsSkeleton` 을 넣는다**

```tsx
            <NsSkeleton width="10rem" height="2.25rem" radius="pill" />
```

- [ ] **Step 9: `npm run check` 를 돌린다**

Run: `npm run check`
Expected: 통과.

- [ ] **Step 10: 빌드하고 확인한다**

Run: `npm run build`

```sh
grep -c 'ns-skeleton' dist/bundle.umd.js       # 1 이상
grep -c 'prefers-reduced-motion' dist/bundle.umd.js   # 1 이상 — shadow CSS 가 살아있는지
```

- [ ] **Step 11: 사람이 확인할 것을 보고서에 적는다**

- 네 데모의 크기와 반경이 각각 다른지. 특히 `radius="0"` 이 각지고 `radius="pill"` 이 완전 둥근지
- 맥박 애니메이션이 부드럽게 반복되는지
- **시스템 설정에서 "동작 줄이기"를 켜면 애니메이션이 멈추고 색은 남는지** (macOS: 손쉬운 사용 → 디스플레이 → 동작 줄이기)
- 소비자가 `ns-skeleton { width: 5rem }` 을 문서 CSS 에 써도 프로퍼티가 이기는지

- [ ] **Step 12: 커밋**

```bash
git add -A
git commit -m "feat(skeleton): ns-skeleton 추가"
```

---

### Task 10: `ns-dialog`

이 계획에서 가장 큰 Task 다. 제어/비제어 패턴, 커스텀 이벤트 추가 경로, backdrop 판별의 두 함정이 모두 여기 있다.

**Files:**
- Create: `src/components/dialog/ns-dialog.ts`
- Create: `src/components/dialog/ns-dialog.styles.ts`
- Create: `src/react/tags/Dialog.tsx`
- Modify: `src/types.ts`
- Modify: `src/tokens/tokens.css`
- Modify: `src/index.ts`
- Modify: `src/react/elements.ts`
- Modify: `src/react/index.ts`
- Modify: `index.html` (nav · 섹션 · 데모 배선)
- Modify: `docs/consumer-example.tsx`

**Interfaces:**
- Consumes:
  - `ns-icon` (Task 7) — 닫기 버튼이 `<ns-icon name="close">` 를 쓴다
  - `.ns-button` (Task 2) — 데모와 예시의 `footer` 버튼
- Produces:
  - `src/types.ts` → `export type NsDialogCloseReason = "escape" | "close-button" | "backdrop"`, `export interface NsDialogCloseDetail { reason: NsDialogCloseReason }`
  - `export class NsDialog extends LitElement` with `heading: string`, `open?: boolean`, `defaultOpen: boolean`, `noBackdropClose: boolean`, `show(): void`, `close(): void`
  - `src/react/elements.ts` → `export const NsDialogBase` (이벤트 `onNsDialogClose`)
  - `src/react/tags/Dialog.tsx` → `export type DialogProps = { open: boolean; title: string; onClose: () => void; children: ReactNode; footer?: ReactNode; noBackdropClose?: boolean; className?: string }`, `export function Dialog(props: DialogProps)`

- [ ] **Step 1: `src/types.ts` 에 이벤트 타입을 추가한다**

```ts
/** ns-dialog 가 닫히기를 요청할 때 올리는 이벤트의 사유. */
export type NsDialogCloseReason = "escape" | "close-button" | "backdrop";

/**
 * ns-dialog 가 닫히기를 요청한다. "닫혔다"가 아니라 "닫고 싶다"다 —
 * 제어 모드에서 소비자가 open 을 바꾸지 않으면 대화상자는 다시 열린다.
 */
export interface NsDialogCloseDetail {
  reason: NsDialogCloseReason;
}
```

`declare global` 블록에 한 줄 추가한다.

```ts
    "ns-dialog-close": CustomEvent<NsDialogCloseDetail>;
```

- [ ] **Step 2: `src/components/dialog/ns-dialog.styles.ts` 를 만든다**

```ts
import { css } from "lit";

export const styles = css`
  /* 네이티브 dialog 가 top layer 로 올라가므로 호스트는 자리를 차지하지 않는다. */
  :host {
    display: contents;
  }

  dialog {
    /*
      UA 스타일시트의 margin: auto 가 modal dialog 의 유일한 가운데 정렬 수단이다.
      Tailwind preflight 는 shadow 안에 닿지 않지만 소비자가 전역 dialog 규칙을
      둘 수 있으므로 명시한다. 참고 구현이 실제로 물린 함정이다.
    */
    margin: auto;
    box-sizing: border-box;
    width: min(32rem, calc(100vw - var(--space-8)));
    max-height: calc(100vh - var(--space-8));
    padding: 0;
    border: 0;
    border-radius: var(--radius-card);
    background: var(--color-surface);
    color: var(--color-fg-body);
    box-shadow: var(--elevation-card);
    /* 본문만 스크롤되고 헤더·푸터는 고정된다. */
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  dialog::backdrop {
    background: var(--color-overlay);
  }

  .header {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    padding: var(--space-5) var(--space-6);
    border-bottom: 1px solid var(--color-line);
  }

  h2 {
    margin: 0;
    font-size: var(--font-size-lg);
    line-height: var(--line-height-lg);
    font-weight: var(--weight-semibold);
    color: var(--color-fg);
  }

  /*
    controls.css 는 shadow 안에 도달하지 않으므로 .ns-button 을 쓸 수 없다.
    --ghost·--icon 조합에 해당하는 최소한만 다시 적는다. 설계 문서 §9 가
    이 중복을 수용한 유일한 자리로 지목한 곳이다.
  */
  .close {
    flex: none;
    display: grid;
    place-items: center;
    padding: var(--space-1-5);
    border: 0;
    border-radius: var(--radius-control);
    background: transparent;
    color: var(--color-fg-muted);
    cursor: pointer;
    transition: background-color var(--transition-fast) var(--transition-ease),
      color var(--transition-fast) var(--transition-ease);
  }

  .close:hover {
    background: var(--color-surface-hover);
    color: var(--color-fg);
  }

  .body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: var(--space-6);
  }

  /*
    footer 는 내용이 있을 때만 보인다. slot 에 배정된 노드가 있는지는 CSS 로
    알 수 없어 slotchange 로 판정하고 hidden 속성을 건다.
    display: flex 가 UA 의 [hidden] 규칙을 이기므로 명시적으로 되돌린다.
  */
  .footer {
    flex: none;
    display: flex;
    justify-content: flex-end;
    gap: var(--space-2);
    padding: 0 var(--space-6) var(--space-6);
  }

  .footer[hidden] {
    display: none;
  }
`;
```

- [ ] **Step 3: `src/components/dialog/ns-dialog.ts` 를 만든다**

```ts
import { LitElement, html } from "lit";
import { property, query, state } from "lit/decorators.js";

import { register } from "../../internal/register.js";
import { warnIfTokensMissing } from "../../internal/warn-missing-tokens.js";
import type { NsDialogCloseDetail, NsDialogCloseReason } from "../../types.js";
import { styles } from "./ns-dialog.styles.js";

// 닫기 버튼이 <ns-icon> 을 쓴다. 등록 부수효과가 필요하다.
import "../icon/ns-icon.js";

export class NsDialog extends LitElement {
  static override styles = styles;

  /**
   * 제목.
   *
   * `title` 이 아닌 이유는 ns-page-heading 과 같다 — 전역 속성이라 대화상자
   * 전체가 브라우저 툴팁을 갖는다. React 프롭만 `title` 을 유지한다.
   */
  @property({ type: String }) heading = "";

  /**
   * 제어 모드. `undefined` 면 비제어다.
   *
   * 속성이 아니라 프로퍼티 전용인 이유: `<ns-dialog open>` 이라고 쓰면 boolean
   * 속성이 `true` 로 읽혀 제어 모드로 들어가고, 그러면 컴포넌트가 스스로 닫지
   * 못한다. 순수 HTML 소비자는 `default-open` 을 쓴다.
   */
  @property({ attribute: false }) open?: boolean;

  /** 비제어 초기값. */
  @property({ type: Boolean, attribute: "default-open" }) defaultOpen = false;

  /** backdrop 클릭 닫기를 끈다. 입력을 잃으면 안 되는 폼 대화상자에서 쓴다. */
  @property({ type: Boolean, attribute: "no-backdrop-close" }) noBackdropClose = false;

  @query("dialog") private dialogEl!: HTMLDialogElement | null;

  /** footer slot 에 내용이 있는지. CSS 로는 알 수 없어 slotchange 로 잡는다. */
  @state() private hasFooter = false;

  /** 비제어일 때의 진실. */
  #innerOpen = false;

  /** mousedown 이 대화상자 밖에서 시작됐는지. */
  #downOutside = false;

  /** updated() 가 부른 close() 인지. native close 이벤트를 Esc 로 오해하지 않기 위한 것. */
  #closedByUs = false;

  get #controlled(): boolean {
    return this.open !== undefined;
  }

  get #isOpen(): boolean {
    return this.open ?? this.#innerOpen;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    warnIfTokensMissing();
  }

  /*
    defaultOpen 을 connectedCallback 이 아니라 여기서 읽는다. document.createElement
    로 만든 뒤 setAttribute 하는 경로에서는 connectedCallback 시점에 속성이 아직
    없을 수 있다. firstUpdated 는 같은 갱신 주기의 updated 보다 먼저 실행되므로
    아래 값이 그 주기에서 바로 반영된다.
  */
  override firstUpdated(): void {
    this.#innerOpen = this.defaultOpen;
  }

  /**
   * 비제어일 때만 연다. 제어 중이면 경고만 낸다 — 여기서 상태를 바꾸면
   * 소비자의 `open` 과 어긋나 화면이 튄다.
   */
  show(): void {
    if (this.#warnIfControlled("show")) return;
    this.#innerOpen = true;
    this.requestUpdate();
  }

  /** 비제어일 때만 닫는다. 소비자가 부른 것이므로 `ns-dialog-close` 를 내지 않는다. */
  close(): void {
    if (this.#warnIfControlled("close")) return;
    this.#innerOpen = false;
    this.requestUpdate();
  }

  #warnIfControlled(method: string): boolean {
    if (!this.#controlled) return false;
    console.warn(
      `[ns-dialog] open 프로퍼티가 설정된 제어 모드에서는 ${method}() 가 동작하지 않습니다. open 을 바꾸세요.`,
    );
    return true;
  }

  /*
    네이티브 dialog 의 상태를 매번 우리 상태와 맞춘다.

    제어 모드에서 Esc 로 네이티브 대화상자가 닫혔는데 소비자가 open 을 true 로
    두면 여기서 다시 연다. 그게 제어의 정의다. 참고 구현에는 이 재조정이 없어
    화면은 닫히고 React state 는 열린 채로 어긋난다.

    open 속성이 아니라 showModal() 이어야 배경이 inert 가 되고 포커스 트랩과
    ::backdrop 이 동작한다.
  */
  override updated(): void {
    const el = this.dialogEl;
    if (!el) return;

    if (this.#isOpen && !el.open) {
      el.showModal();
    } else if (!this.#isOpen && el.open) {
      this.#closedByUs = true;
      el.close();
    }
  }

  override render() {
    return html`
      <dialog
        aria-labelledby="dialog-heading"
        @close=${this.#onNativeClose}
        @mousedown=${this.#onMouseDown}
        @click=${this.#onClick}
      >
        <div class="header">
          <h2 id="dialog-heading">${this.heading}</h2>
          <button class="close" type="button" aria-label="닫기" @click=${this.#onCloseButton}>
            <ns-icon name="close"></ns-icon>
          </button>
        </div>
        <div class="body"><slot></slot></div>
        <div class="footer" ?hidden=${!this.hasFooter}>
          <slot name="footer" @slotchange=${this.#onFooterSlotChange}></slot>
        </div>
      </dialog>
    `;
  }

  #onFooterSlotChange = (e: Event): void => {
    const slot = e.target as HTMLSlotElement;
    this.hasFooter = slot.assignedNodes({ flatten: true }).length > 0;
  };

  /*
    Esc 는 브라우저가 직접 닫으므로 close 이벤트만 남는다. 그것을 여기서 올린다.

    close() 는 close 이벤트를 비동기로 큐에 넣기 때문에 동기 플래그로는
    "우리가 닫았다" 를 구분할 수 없다. 그래서 의도를 플래그로 들고 있다가 소비한다.
  */
  #onNativeClose = (): void => {
    if (this.#closedByUs) {
      this.#closedByUs = false;
      return;
    }
    this.#requestClose("escape");
  };

  #onCloseButton = (): void => {
    this.#requestClose("close-button");
  };

  #onMouseDown = (e: MouseEvent): void => {
    this.#downOutside = this.#isOutside(e);
  };

  #onClick = (e: MouseEvent): void => {
    if (this.noBackdropClose) return;
    /*
      mousedown 과 click 이 모두 밖이어야 한다. 본문 글자를 드래그로 선택하다
      backdrop 에서 손을 떼면 click 타깃이 <dialog> 가 되므로, 이 확인이 없으면
      복사하려던 사용자가 대화상자를 잃는다.
    */
    if (!this.#downOutside || !this.#isOutside(e)) return;
    this.#requestClose("backdrop");
  };

  /*
    e.target 으로 판별하지 않는다. border-radius 모서리처럼 대화상자 자기
    표면을 클릭해도 타깃이 <dialog> 라서 backdrop 으로 오인된다.
  */
  #isOutside(e: MouseEvent): boolean {
    const el = this.dialogEl;
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return (
      e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom
    );
  }

  #requestClose(reason: NsDialogCloseReason): void {
    if (!this.#controlled) this.#innerOpen = false;

    const detail: NsDialogCloseDetail = { reason };
    this.dispatchEvent(
      new CustomEvent("ns-dialog-close", { detail, bubbles: true, composed: true }),
    );

    /*
      제어 모드에서 소비자가 open 을 바꾸지 않으면 updated() 가 다시 연다.
      비제어에서는 #innerOpen 이 반응형 프로퍼티가 아니므로 갱신을 직접 요청한다.
    */
    this.requestUpdate();
  }
}

register("ns-dialog", NsDialog);

declare global {
  interface HTMLElementTagNameMap {
    "ns-dialog": NsDialog;
  }
}
```

- [ ] **Step 4: `src/tokens/tokens.css` 에 예약을 추가한다**

```css
/* 정의 전에는 light DOM 자식이 그대로 보인다. 모달 내용이 페이지에 새는 것을 막는다. */
ns-dialog:not(:defined) { display: none; }
```

- [ ] **Step 5: `src/index.ts` 에 등록과 재export 를 추가한다**

```ts
import "./components/dialog/ns-dialog.js";
```

```ts
export { NsDialog } from "./components/dialog/ns-dialog.js";
export type {
  NsToggleDetail,
  NsNavigateDetail,
  NsDialogCloseDetail,
  NsDialogCloseReason,
} from "./types.js";
```

- [ ] **Step 6: `src/react/elements.ts` 에 래퍼를 추가한다**

```ts
import { NsDialog as NsDialogElement } from "../components/dialog/ns-dialog.js";
import type {
  NsToggleDetail,
  NsNavigateDetail,
  NsDialogCloseDetail,
} from "../types.js";
```

```ts
/*
  소비자에게 직접 노출하지 않는다. tags/Dialog.tsx 가 감싸서 title/onClose/footer
  프롭 이름을 맞춘다.
*/
export const NsDialogBase = createComponent({
  react: React,
  tagName: "ns-dialog",
  elementClass: NsDialogElement,
  events: {
    // EventName<> 브랜딩이 없으면 핸들러가 (e: Event) => void 로 타입된다.
    onNsDialogClose: "ns-dialog-close" as EventName<CustomEvent<NsDialogCloseDetail>>,
  },
});
```

- [ ] **Step 7: `src/react/tags/Dialog.tsx` 를 만든다**

```tsx
import type { ReactNode } from "react";

import { NsDialogBase } from "../elements.js";

export type DialogProps = {
  open: boolean;
  /** 커스텀 엘리먼트의 속성 이름은 `heading` 이다. React 프롭은 `title` 을 유지한다. */
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** 하단 우측 정렬 영역. 지정하면 `slot="footer"` 로 들어간다. */
  footer?: ReactNode;
  noBackdropClose?: boolean;
  className?: string;
};

/**
 * `open` 을 항상 넘기므로 언제나 제어 모드다. React 에서는 state 가 진실의
 * 원천이어야 하고, 비제어 모드는 순수 HTML 소비자를 위한 것이다.
 *
 * Esc·backdrop·닫기 버튼 어느 경로든 `onClose` 로 모인다. 사유를 구분해야 하면
 * 래퍼를 쓰지 않고 `onNsDialogClose` 로 `e.detail.reason` 을 읽는다.
 */
export function Dialog({
  open,
  title,
  onClose,
  children,
  footer,
  noBackdropClose = false,
  className,
}: DialogProps) {
  return (
    <NsDialogBase
      open={open}
      heading={title}
      noBackdropClose={noBackdropClose}
      className={className}
      onNsDialogClose={() => onClose()}
    >
      {children}
      {footer !== undefined && <div slot="footer">{footer}</div>}
    </NsDialogBase>
  );
}
```

- [ ] **Step 8: `src/react/index.ts` 에 재export 를 추가한다**

```ts
export { Dialog } from "./tags/Dialog.js";
export type { DialogProps } from "./tags/Dialog.js";
```

그리고 타입 재export 줄을 넓힌다.

```ts
export type {
  NsToggleDetail,
  NsNavigateDetail,
  NsDialogCloseDetail,
  NsDialogCloseReason,
} from "../types.js";
```

`NsDialogBase` 는 내보내지 않는다.

- [ ] **Step 9: `index.html` 에 항목과 섹션을 추가한다**

"컴포넌트" 그룹의 `ns-skeleton` 다음에 넣는다.

```html
      <ns-nav-item href="#ns-dialog" label="ns-dialog" badge="DG"></ns-nav-item>
```

`ns-skeleton` 섹션 다음, `<h2 id="ns-header">` 앞에 넣는다.

```html
  <h2 id="ns-dialog">ns-dialog</h2>
  <p>
    네이티브 <code>dialog</code> 를 <code>showModal()</code> 로 연다. 포커스 트랩 ·
    Esc 닫기 · 배경 <code>inert</code> · top layer · <code>::backdrop</code> 을
    브라우저가 처리한다. 직접 구현하면 접근성을 처음부터 다시 만들어야 한다.
  </p>
  <p>
    <strong>slot 된 <code>form</code> 은 안전하다.</strong> 폼과 그 안의 입력칸은 전부
    light DOM 에 있어 제출 · 검증 · 자동완성이 정상 동작하고, 모달의 포커스 트랩은
    flat tree 를 따라가므로 slot 된 내용도 포함한다.
  </p>

  <h3>제어와 비제어</h3>
  <p>
    <code>open</code> 프로퍼티를 설정하면 <strong>제어 모드</strong>다. 컴포넌트는
    그 값을 바꾸지 않고 <code>ns-dialog-close</code> 만 올린다. 소비자가
    <code>open</code> 을 <code>true</code> 로 두면 Esc 로 닫혔던 대화상자가
    <strong>다시 열린다</strong> — 그게 제어의 정의다.
  </p>
  <p>
    <code>open</code> 을 한 번도 설정하지 않으면 <strong>비제어 모드</strong>다.
    컴포넌트가 스스로 닫고, <code>show()</code> / <code>close()</code> 로 여닫는다.
    초기값은 <code>default-open</code> 속성이다.
  </p>
  <p>
    <strong><code>open</code> 은 속성이 아니라 프로퍼티다.</strong>
    <code>&lt;ns-dialog open&gt;</code> 이라고 쓰면 제어 모드로 들어가 스스로 닫지
    못하게 된다. 순수 HTML 에서는 <code>default-open</code> 을 쓴다.
  </p>

  <h3>데모 — 비제어</h3>
  <template class="ex">
    <div id="dialog-demo-box">
      <button class="ns-button ns-button--outline ns-button--md" type="button" data-open>대화상자 열기</button>
      <ns-dialog heading="사용자 승인">
        <p style="margin:0">임연정 님의 가입 신청을 승인하시겠습니까?</p>
        <div slot="footer">
          <button class="ns-button ns-button--outline ns-button--sm" type="button" data-close>취소</button>
          <button class="ns-button ns-button--solid ns-button--sm" type="button" data-close>승인</button>
        </div>
      </ns-dialog>
    </div>
  </template>
  <div class="demo block" id="dialog-demo" style="padding:var(--space-4)"></div>
  <pre></pre>
  <p id="dialog-log" style="font-family: monospace">닫으면 여기에 이벤트가 찍힌다.</p>

  <h3>프로퍼티</h3>
  <table>
    <tr><th>프로퍼티</th><th>속성</th><th>타입</th><th>기본값</th><th>설명</th></tr>
    <tr><td><code>heading</code></td><td><code>heading</code></td><td>string</td><td><code>""</code></td><td>제목. 대화상자의 accessible name 이므로 사실상 필수다</td></tr>
    <tr><td><code>open</code></td><td>없음</td><td>boolean | undefined</td><td><code>undefined</code></td><td>제어 모드. <strong>속성이 아니라 프로퍼티다</strong></td></tr>
    <tr><td><code>defaultOpen</code></td><td><code>default-open</code></td><td>boolean</td><td><code>false</code></td><td>비제어 초기값</td></tr>
    <tr><td><code>noBackdropClose</code></td><td><code>no-backdrop-close</code></td><td>boolean</td><td><code>false</code></td><td>backdrop 클릭 닫기를 끈다. 입력을 잃으면 안 되는 폼에서 쓴다</td></tr>
  </table>

  <h3>메서드</h3>
  <table>
    <tr><th>이름</th><th>동작</th></tr>
    <tr><td><code>show()</code></td><td>비제어일 때만 연다. 제어 중이면 콘솔 경고만 내고 아무것도 하지 않는다</td></tr>
    <tr><td><code>close()</code></td><td>비제어일 때만 닫는다. 소비자가 부른 것이므로 <code>ns-dialog-close</code> 를 내지 않는다</td></tr>
  </table>

  <h3>slot</h3>
  <table>
    <tr><th>이름</th><th>위치</th><th>용도</th></tr>
    <tr><td>(기본)</td><td>본문</td><td>내용이 길면 이 영역만 스크롤된다</td></tr>
    <tr><td><code>footer</code></td><td>하단</td><td><strong>우측 정렬과 간격이 내장</strong>이다. 비어 있으면 영역 자체가 사라진다</td></tr>
  </table>

  <h3>이벤트</h3>
  <table>
    <tr><th>이름</th><th>detail</th><th>발생 시점</th></tr>
    <tr><td><code>ns-dialog-close</code></td><td><code>{ reason: "escape" | "close-button" | "backdrop" }</code></td><td>닫히기를 <strong>요청</strong>할 때. "닫혔다"가 아니다</td></tr>
  </table>

  <h3>backdrop 클릭</h3>
  <p>
    기본으로 닫는다. <code>no-backdrop-close</code> 로 끈다.
    backdrop 은 요소가 아니라(<code>::backdrop</code> 은 의사 요소) 배경 클릭의
    타깃이 <code>&lt;dialog&gt;</code> 자신이 되는 것을 이용한다. 두 가지를 함께 처리한다.
  </p>
  <ul>
    <li><strong>드래그 선택.</strong> 본문 글자를 드래그하다 배경에서 손을 떼면 click 타깃이 <code>&lt;dialog&gt;</code> 가 된다. <code>mousedown</code> 과 <code>click</code> 이 <strong>모두</strong> 밖이었을 때만 닫는다</li>
    <li><strong>모서리 클릭.</strong> <code>border-radius</code> 모서리는 대화상자 자기 표면인데 타깃이 <code>&lt;dialog&gt;</code> 다. <code>e.target</code> 대신 좌표를 <code>getBoundingClientRect()</code> 와 비교한다</li>
  </ul>

  <h3>HTML — 마크업</h3>
  <script type="text/plain">
    <ns-dialog heading="사용자 승인" id="approve">
      <p>임연정 님의 가입 신청을 승인하시겠습니까?</p>
      <div slot="footer">
        <button class="ns-button ns-button--outline ns-button--sm" type="button" data-close>취소</button>
        <button class="ns-button ns-button--solid ns-button--sm" type="button">승인</button>
      </div>
    </ns-dialog>
  </script>

  <h3>HTML — 배선</h3>
  <script type="text/plain">
    const dialog = document.getElementById("approve");

    document.getElementById("open-approve")
      .addEventListener("click", () => dialog.show());

    dialog.querySelector("[data-close]")
      .addEventListener("click", () => dialog.close());

    dialog.addEventListener("ns-dialog-close", (e) => {
      console.log(e.detail.reason);   // "escape" | "close-button" | "backdrop"
    });
  </script>

  <h3>React — 언제나 제어 모드다</h3>
  <script type="text/plain">
    import { Button, Dialog } from "@neosimplix/common-ui/react";

    const [open, setOpen] = useState(false);

    <Dialog
      open={open}
      title="사용자 승인"
      onClose={() => setOpen(false)}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>취소</Button>
          <Button size="sm" onClick={approve}>승인</Button>
        </>
      }
    >
      <p>임연정 님의 가입 신청을 승인하시겠습니까?</p>
    </Dialog>
  </script>
```

- [ ] **Step 10: `index.html` 의 헬퍼 스크립트에 데모 배선을 추가한다**

기존 `<script>` 안, `fullDemo` 블록 **다음**(스크립트 닫는 `</script>` 바로 앞)에 넣는다. 템플릿 복제 루프보다 뒤에 있어야 복제된 노드를 찾을 수 있다.

```js
  const dialogDemo = document.getElementById("dialog-demo");
  const dialogLog = document.getElementById("dialog-log");
  if (dialogDemo && dialogLog) {
    const dialog = dialogDemo.querySelector("ns-dialog");
    dialogDemo.querySelector("[data-open]").addEventListener("click", () => dialog.show());
    for (const button of dialogDemo.querySelectorAll("[data-close]")) {
      button.addEventListener("click", () => dialog.close());
    }
    // 이 데모 컨테이너에 붙인다. document 에 붙이면 다른 데모의 이벤트까지 잡는다.
    dialogDemo.addEventListener("ns-dialog-close", (e) => {
      dialogLog.textContent = `ns-dialog-close  reason=${e.detail.reason}`;
    });
  }
```

- [ ] **Step 11: `docs/consumer-example.tsx` 에 `Dialog` 를 넣는다**

`onNsDialogClose` 의 `e.detail.reason` 을 **직접 읽는 경로도 함께** 둔다. 래퍼만 쓰면 `EventName<>` 캐스트 누락이 검사되지 않는다.

```tsx
import {
  Button,
  Card,
  Checkbox,
  Dialog,
  Field,
  Input,
  NsHeader,
  NsIcon,
  NsNavGroup,
  NsNavItem,
  NsSidebar,
  NsSkeleton,
  PageHeading,
  Select,
  Textarea,
} from "../src/react/index.js";
import type { NsDialogCloseReason } from "../src/react/index.js";
```

`Shell` 안에 상태와 대화상자를 넣는다.

```tsx
  const [dialogOpen, setDialogOpen] = useState(false);

  // reason 을 실제로 읽어 detail 타입이 검사되게 한다.
  const onDialogClose = (reason: NsDialogCloseReason) => {
    log(`closed by ${reason}`);
    setDialogOpen(false);
  };
```

```tsx
            <Dialog
              open={dialogOpen}
              title="사용자 승인"
              onClose={() => setDialogOpen(false)}
              footer={<Button size="sm" onClick={() => setDialogOpen(false)}>확인</Button>}
            >
              <p>승인하시겠습니까?</p>
            </Dialog>
```

그리고 래퍼를 거치지 않는 경로도 둔다 — `src/react/elements.ts` 의 `NsDialogBase` 는 공개하지 않으므로, 대신 **`Dialog` 의 `onClose` 와 별개로** `onDialogClose` 를 실제로 호출해 타입을 검사한다.

```tsx
            <Button size="sm" onClick={() => onDialogClose("backdrop")}>reason 타입 검사</Button>
```

- [ ] **Step 12: `npm run check` 를 돌린다**

Run: `npm run check`
Expected: 통과. ③번 검사가 `ns-dialog-close, ns-navigate, ns-toggle` 셋을 보고한다.

- [ ] **Step 13: `EventName<>` 캐스트를 빼서 실패를 확인한다**

`src/react/elements.ts` 의 `onNsDialogClose` 에서 `as EventName<...>` 을 임시로 지운다.

```ts
    onNsDialogClose: "ns-dialog-close",
```

Run: `npm run check`
Expected: **①번(`tsc -p tsconfig.json`)은 통과하고 ②번(`tsc -p tsconfig.consumer.json`)에서 실패**한다. 소비자 관점 검사만 이 결함을 본다는 것이 요점이다.

실패 메시지가 `e.detail` 또는 `reason` 을 가리키는지 확인한다. 다른 이유로 실패하면 이 속성은 검증되지 않은 것이다. 확인 후 되돌린다.

- [ ] **Step 14: 빌드하고 확인한다**

Run: `npm run build`

```sh
grep -c 'ns-dialog' dist/bundle.umd.js            # 1 이상
grep -c 'showModal' dist/bundle.umd.js            # 1 이상
grep -c 'ns-dialog-close' dist/index.js           # 1 이상
grep -c 'getBoundingClientRect' dist/index.js     # 1 이상 — backdrop 좌표 판별이 살아있는지
ls dist/react/tags/Dialog.d.ts dist/components/dialog/ns-dialog.d.ts
```

- [ ] **Step 15: 사람이 확인할 것을 보고서에 적는다**

이 Task 는 사람 확인 항목이 가장 많다. **하나도 했다고 적지 않는다.**

- "대화상자 열기"로 열리고 배경이 어두워지는지(`::backdrop`), 배경 요소가 클릭·탭 이동되지 않는지(`inert`)
- 대화상자가 화면 **가운데** 있는지 (좌측 상단에 붙으면 `margin: auto` 가 죽은 것)
- Tab 이 대화상자 안에서만 순환하는지 (포커스 트랩)
- **Esc 로 닫히고 로그에 `reason=escape` 가 찍히는지**
- **닫기 버튼(×)으로 닫히고 `reason=close-button` 이 찍히는지**
- **배경을 클릭해 닫히고 `reason=backdrop` 이 찍히는지**
- **본문 글자를 드래그로 선택하다 배경에서 손을 떼도 닫히지 않는지** — `mousedown` 확인이 동작하는 증거
- **대화상자 둥근 모서리 바로 안쪽을 클릭해도 닫히지 않는지** — 좌표 판별이 동작하는 증거
- `footer` 의 버튼 둘이 우측 정렬되고 간격이 있는지
- `footer` slot 을 비운 대화상자에 빈 여백이 남지 않는지 (`hidden` 처리)
- 본문을 길게 만들면 본문만 스크롤되고 헤더·푸터가 고정되는지
- 닫기 버튼의 hover 배경이 보이는지 (shadow 자체 스타일이 `.ns-button` 없이 동작하는지)
- JS 를 끈 상태로 페이지를 열었을 때 **대화상자 내용이 페이지에 새지 않는지** (`ns-dialog:not(:defined)`)

- [ ] **Step 16: 커밋**

```bash
git add -A
git commit -m "feat(dialog): ns-dialog 와 제어·비제어 패턴 추가"
```

---

### Task 11: 규칙 · 함정 · 구조 문서 갱신

코드가 끝난 뒤에 한 번에 정리한다. 앞선 Task 들이 만든 새 제약과 함정을 되돌리려는 다음 사람이 이유를 찾을 수 있게 하는 것이 목적이다.

**Files:**
- Modify: `.claude/rules/library-invariants.md`
- Modify: `docs/gotchas.md`
- Modify: `docs/project-structure.md`
- Modify: `.claude/skills/adding-a-component/SKILL.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: Task 1~10 의 모든 결정
- Produces: 없음 (문서 전용)

- [ ] **Step 1: `.claude/rules/library-invariants.md` 에 규칙을 추가한다**

"## 이름" 절의 마지막 줄(`이벤트는 ns- 접두사에…`) 다음에 넣는다.

```markdown
- **CSS 클래스 이름은 `ns-` 접두사를 쓴다.** 전역 이름공간이라 `.input` 은 소비자 CSS 와 충돌한다. 변형은 `--`, 하위 요소는 `__` 다. (`.ns-button--outline`, `.ns-field__error`)
- **`title` 을 속성/프로퍼티 이름으로 쓰지 않는다.** 모든 HTML 요소의 전역 속성이라 브라우저가 툴팁을 띄운다. 제목은 `heading` 이다. React 프롭만 `title` 을 유지하고 shim 이 변환한다.
```

"## 컴포넌트" 절의 첫 항목(`자기 상태를 절대 바꾸지 않는다`)을 **교체**한다.

```markdown
- **제어 중이면 그 값을 바꾸지 않는다.** 소비자가 상태 프로퍼티를 설정했으면(제어) 컴포넌트는 그것을 바꾸지 않고, 설정하지 않았으면(비제어) 스스로 관리한다. 이벤트는 양쪽 모두 낸다.
- **제어/비제어는 속성 짝으로 나눈다.** 제어는 프로퍼티 전용(`@property({ attribute: false })`), 비제어 초기값은 별도 속성(`default-open`). 하나로 겸용하면 `<ns-dialog open>` 이 제어 모드로 들어가 스스로 닫지 못한다.
```

"## 스타일" 절에 추가한다.

```markdown
- **`invalid` 는 클래스가 아니라 `[aria-invalid="true"]` 로 스타일한다.** `--invalid` 변형 클래스를 만들지 않는다.
- **`controls.css` 는 `@layer ns-controls` 로 감싼다.** 감싸지 않으면 소비자의 Tailwind 유틸 오버라이드가 막힌다.
- **shadow 컴포넌트는 `controls.css` 를 재사용할 수 없다.** 전역 스타일시트는 shadow 안에 도달하지 않는다. 필요한 최소한만 그 컴포넌트의 shadow 스타일에 다시 적는다.
```

"## 폼" 절을 새로 만든다.

```markdown
## 폼

- **폼 컨트롤과 버튼을 웹 컴포넌트로 만들지 않는다.** 네이티브 요소 + CSS 클래스로 제공한다. 이유는 `docs/gotchas.md` 의 "FACE 를 쓰지 않은 이유" 에 있다.
- **form-associated custom element(FACE)를 도입하지 않는다.** `static formAssociated` 와 `attachInternals()` 를 쓰지 않는다.
```

- [ ] **Step 2: `docs/gotchas.md` 에 함정 다섯 개를 추가한다**

파일 끝의 "## 검사는 실패시켜 봐야 검사다" 절 **앞**에 넣는다.

```markdown
## FACE 를 쓰지 않은 이유

shadow DOM 안의 `<input>` 은 바깥 `<form>` 에게 보이지 않는다. `FormData` 에 안 담기고, `<label for>` 가 못 가리키고, `required` 가 제출을 막지 못한다. `<button type="submit">` 도 같다 — 소비자 11곳이 그것을 쓰고, shadow 안의 버튼은 폼의 기본 제출 버튼 자리를 채우지 못해 Enter 제출도 보장되지 않는다.

form-associated custom element 로 되살릴 수 있지만 남는 것이 있다.

- `required` · `type=email` · `minlength` · `pattern` 을 `setValidity()` 로 전부 직접 구현
- 제어/비제어 분기가 텍스트 입력에 들어간다. 렌더 틱이 하나 늘어 **빠른 타이핑에 커서가 튀고 한글 IME 조합이 깨진다.** `compositionstart`/`compositionend` 를 직접 물어야 한다
- 브라우저 자동완성·비밀번호 관리자를 신뢰할 수 없다
- **JS 없이 동작하지 않는다.** 커스텀 엘리먼트라 JS 가 없으면 입력칸 자체가 렌더되지 않는다

마지막 것이 결정적이었다. `dashboard-shell/components/shell/AdminLoginForm.tsx` 의 주석이 `method="post" 라 자바스크립트 없이도 동작한다` 다. 그 폼은 `autoComplete="username"`/`current-password` 와 `required` 를 쓴다.

규모도 근거였다. 라이브러리 전체가 549줄일 때, FACE 는 컨트롤 넷에 약 430줄을 더하면서 **테스트 러너 없는 이 저장소에서 가장 검증하기 어려운 코드**(폼 제출·reset·뒤로가기 복원·자동완성·IME)를 늘린다.

→ 값·검증·라벨·폼 제출은 플랫폼이 이미 한다. shadow 경계는 그걸 끊었다가 되붙이는 비용만 만든다. 캡슐화할 **행동**이나 만들어 줄 **마크업**이 있을 때만 태그로 만든다.

## `title` 은 속성 이름으로 쓸 수 없다

`title` 은 모든 HTML 요소의 전역 속성이고 브라우저가 툴팁을 띄운다. `<ns-page-heading title="Dashboard">` 는 제목 위에 같은 글자가 툴팁으로 한 번 더 뜨고, `<ns-dialog title="…">` 은 대화상자 전체가 툴팁을 갖는다. `@property` 로 `HTMLElement.prototype.title` 을 덮어도 속성에 반영되는 순간 같은 일이 일어난다.

→ 속성은 `heading` 이다. React 프롭만 `title` 을 유지하고 `src/react/tags/` 의 shim 이 변환한다. 소비자 호출부 21곳이 바뀌지 않는다.

## 레이어에 든 스타일은 레이어에 안 든 스타일에 진다

Tailwind v4 는 preflight 를 `@layer base`, 유틸을 `@layer utilities` 에 넣는다. 레이어 순서와 무관하게 **레이어에 들지 않은 선언이 레이어에 든 선언을 이긴다.**

`controls.css` 를 레이어 없이 두면 preflight 는 이기지만 소비자의 `className="px-6"` 오버라이드까지 이겨버린다. `@layer ns-controls` 로 감싸면 유틸에는 지지만 preflight 에도 진다.

→ 감싸고, 소비자가 순서를 선언한다.

```css
@layer theme, base, ns-controls, components, utilities;
@import "tailwindcss";
```

**이 한 줄이 빠졌는지 JS 로 감지할 수 없다.** `warnIfTokensMissing()` 같은 안전망을 만들 수 없어 문서로만 지킨다. 유일한 확인 수단은 유틸이 클래스를 이기는지 화면으로 보는 것이다.

## backdrop 클릭 닫기에는 함정이 둘 있다

backdrop 은 요소가 아니다(`::backdrop` 은 의사 요소). 배경을 클릭하면 타깃이 `<dialog>` 자신이 되는 것을 이용하는데, 그 판정이 두 곳에서 틀린다.

**드래그 선택.** 본문 글자를 드래그하다 배경에서 손을 떼면 `mousedown` 은 본문, `mouseup` 은 배경이라 `click` 타깃이 `<dialog>` 가 된다. 문구를 복사하려던 사용자가 대화상자를 잃는다. → `mousedown` 타깃을 기억해 **둘 다** 밖이었을 때만 닫는다.

**모서리 클릭.** `border-radius` 모서리는 대화상자 자기 표면인데 타깃이 `<dialog>` 다. → `e.target` 대신 좌표를 `getBoundingClientRect()` 와 비교한다.

그리고 `dialog.close()` 는 `close` 이벤트를 **비동기로** 큐에 넣는다. "우리가 닫았다" 를 동기 플래그로 구분할 수 없어서, 의도를 플래그로 들고 있다가 리스너에서 소비한다.

## 제어 모드는 재조정이 있어야 제어다

Esc 는 브라우저가 네이티브 `<dialog>` 를 직접 닫는다. 이벤트만 올리고 끝내면 화면은 닫히고 소비자의 `open` 은 `true` 로 남아 어긋난다. 참고 구현(`dashboard-shell/components/ui/Dialog.tsx`)이 정확히 그 상태였다.

→ `updated()` 에서 `this.open` 과 내부 `<dialog>.open` 을 매번 맞춘다. 소비자가 `open` 을 바꾸지 않으면 **다시 열린다.** 그게 제어의 정의다.

## `react` external 도 정규식이어야 한다

`tsconfig.json` 의 `"jsx": "react-jsx"` 트랜스폼은 `import { jsx } from "react/jsx-runtime"` 를 넣는다. `external: ["react"]` 는 그 지정자를 잡지 못해 React 의 jsx-runtime 이 `dist/react.js` 에 번들되고, 소비자 앱에 React 런타임이 두 벌 생긴다.

위의 lit external 항목과 **같은 결함**이다. 그 교훈이 이미 이 문서에 있었는데도 react 쪽에는 적용되지 않았다.

```ts
const reactExternal = [/^react(\/.*)?$/, /^react-dom(\/.*)?$/];
```
```

- [ ] **Step 3: `docs/project-structure.md` 를 갱신한다**

"## 무엇을 제공하나" 표를 태그 여덟 개로 늘리고, 그 아래에 클래스 표를 새로 만든다.

```markdown
| 태그 | 역할 |
|---|---|
| `ns-header` | 좌측 토글 버튼과 프로젝트 이름, 우측 `actions` slot |
| `ns-sidebar` | 네비게이션 컨테이너. 접으면 좌측에 4rem 레일이 남는다 |
| `ns-nav-group` | 제목이 붙은 네비게이션 그룹 |
| `ns-nav-item` | 그룹 하위 항목. 행 우측에 `trailing` slot |
| `ns-icon` | 이름으로 꺼내는 인라인 SVG |
| `ns-page-heading` | `h1` + 설명 `p` |
| `ns-skeleton` | 로딩 자리표시자. 크기를 프로퍼티로 받는다 |
| `ns-dialog` | 네이티브 `dialog` 모달. 제어/비제어 |

| 클래스 | 붙이는 요소 |
|---|---|
| `.ns-button` | `button` · `a` |
| `.ns-input` `.ns-select` `.ns-textarea` | 같은 이름의 네이티브 컨트롤 |
| `.ns-checkbox` | `label` (내부에 `input[type=checkbox]`) |
| `.ns-field` | `div`. `__label` `__hint` `__error` 를 함께 쓴다 |
| `.ns-card` | `div` |

**태그와 클래스를 가르는 기준은 두 줄이다.** 캡슐화할 행동이 있으면 태그, 만들어 줄 마크업이 있으면 태그, 둘 다 아니면 클래스다. 폼 컨트롤과 버튼이 클래스인 이유는 `docs/gotchas.md` 의 "FACE 를 쓰지 않은 이유" 에 있다.
```

"## 왜 이런 구조인가" 절에 한 항목을 추가한다.

```markdown
**폼 컨트롤을 웹 컴포넌트로 만들지 않는다.** shadow DOM 이 폼 참여·라벨·검증·자동완성을 끊고, FACE 로 되살려도 "JS 없이 동작한다"는 성질은 돌아오지 않는다. 근거는 `docs/gotchas.md` 에 있다.
```

"## 디렉터리" 트리에 새 항목을 넣는다.

```
├── src/
│   ├── controls/controls.css          .ns-* 클래스. @layer ns-controls. 손으로 쓰는 정적 파일
│   ├── react/
│   │   ├── cx.ts                      조건부 클래스 합치기(내부 전용)
│   │   ├── controls/*.tsx             네이티브 요소에 클래스를 붙이는 컴포넌트 7종
│   │   ├── tags/*.tsx                 커스텀 엘리먼트 래퍼의 프롭 이름을 맞추는 shim
│   │   ├── elements.ts                @lit/react 래퍼. 이벤트 매핑의 단일 출처
│   │   └── index.ts                   재export 허브
├── scripts/
│   ├── copy-css.mjs                   tokens.css · controls.css → dist/
│   └── check-controls.mjs             클래스 ↔ index.html 문서 양방향 대조
```

"## 산출물과 진입점" 에 한 줄 추가한다.

```
dist/controls.css     복사본                    → 순수 HTML 이 직접 링크
```

그리고 `exports` 설명에 `./controls.css` 를 넣고, 이 문구를 추가한다.

```markdown
**Tailwind 를 쓰는 소비자는 레이어 순서를 한 줄 선언해야 한다.** `@layer theme, base, ns-controls, components, utilities;` 를 Tailwind import 위에 둔다. 빠지면 preflight 가 클래스 스타일을 지우고, **JS 로 감지할 수 없다.**
```

"## 명령" 표의 `npm run check` 행을 고친다.

```markdown
| `npm run check` | ① 라이브러리 타입 ② 소비자 관점 타입 ③ 이벤트 매핑 ④ 클래스 ↔ 문서 대조 |
```

"## 남은 일" 을 갱신한다. `dashboard-shell` 이관 항목은 유지하고 앞에 한 줄을 넣는다.

```markdown
- **`ns-table`.** 정렬·페이징·선택이 붙는 데이터 주입형 표. 별도 스펙이 필요하다 — 셀 커스터마이징, 서버 페이징 지원 여부, 선택 상태의 제어/비제어, 그리고 shadow 안에서 `.ns-checkbox`·`.ns-button` 을 재사용하는 문제가 얽혀 있다.
- **`ns-header`·`ns-sidebar` 의 비제어 지원.** 토글을 소비자 코드 없이 동작시키는 것. 지금 소비자 코드가 필요한 이유는 두 컴포넌트가 서로 남남이어서, 이벤트를 받아 *다른* 엘리먼트에 내려주는 일을 소비자밖에 할 수 없다는 것이다. 둘을 감싸는 것을 도입할지가 논의의 핵심이다.
```

- [ ] **Step 4: `.claude/skills/adding-a-component/SKILL.md` 에 클래스 체크리스트를 추가한다**

기존 "## 체크리스트" 를 "## 태그를 추가할 때" 로 이름을 바꾸고, 그 **앞**에 판단 기준을, **뒤**에 클래스 체크리스트를 넣는다.

```markdown
## 먼저: 태그인가 클래스인가

- **캡슐화할 행동이 있으면 태그.** 포커스 트랩, 정렬 상태, 여닫힘처럼 플랫폼이 안 해주는 것
- **만들어 줄 마크업이 있으면 태그.** SVG, `h1`+`p`, 제목 레벨처럼 CSS 로 만들 수 없는 것
- **둘 다 아니면 클래스.** 스타일뿐인 것은 네이티브 요소 + `.ns-*` 클래스다

폼 컨트롤과 버튼은 **클래스여야 한다.** shadow DOM 이 폼 참여·라벨·검증·자동완성을 끊는다. `docs/gotchas.md` 의 "FACE 를 쓰지 않은 이유" 를 읽고 오지 않았다면 태그로 만들지 않는다.

## 클래스를 추가할 때

- [ ] `src/controls/controls.css` 의 `@layer ns-controls` 블록 **안**에 규칙. 값은 토큰만, `var()` 폴백 없음
- [ ] `src/react/controls/<Name>.tsx` — 네이티브 요소에 클래스를 붙이는 컴포넌트
- [ ] `src/react/index.ts` — 값과 타입 재export
- [ ] `index.html` — 데모 · **클래스 표** · HTML 예시 · React 예시
- [ ] `docs/consumer-example.tsx` — 새 컴포넌트를 실제로 사용

`scripts/check-controls.mjs` 가 `controls.css` 의 클래스와 `index.html` 을 양방향으로 대조한다. `--modifier` 변형도 개별로 센다. 문서에 빠뜨리면 `npm run check` 가 막는다.

**상태 변형은 클래스를 만들지 않는다.** `invalid` 는 `[aria-invalid="true"]`, `disabled` 는 `:has(:disabled)` 로 잡는다. 클래스를 토글하는 자바스크립트가 필요 없어 순수 HTML 에서도 동작한다.

**요소 타입으로 특정되면 자손 선택자를 쓴다.** 순수 HTML 사용자가 외워야 하는 이름을 줄인다. 같은 태그가 둘 이상이라 순서에만 의존하게 될 때만 `__이름` 을 붙인다.
```

기존 "## 새 이벤트를 추가할 때" 절의 3번 항목에서 파일 경로를 고친다.

```markdown
3. **`src/react/elements.ts`** — 이벤트 매핑, **`EventName<>` 캐스트 포함**
```

"## 마치기 전에" 의 명령 목록에 추가한다.

```sh
node scripts/check-controls.mjs             # 클래스 ↔ 문서
```

- [ ] **Step 5: `README.md` 에 `controls.css` 와 레이어 순서를 추가한다**

"## 설치" 절 끝에 넣는다.

```markdown
CSS 두 개를 모두 불러온다.

```css
@import "@neosimplix/common-ui/tokens.css";
@import "@neosimplix/common-ui/controls.css";
```

`tokens.css` 는 색·치수의 단일 출처이고 `controls.css` 는 네이티브 요소용 `.ns-*` 클래스다. 컴포넌트 스타일이 토큰을 폴백 없이 참조하므로 둘 중 하나라도 빠지면 레이아웃이 무너진다.

**Tailwind 를 쓰면 레이어 순서를 선언해야 한다.** `controls.css` 는 `@layer ns-controls` 로 감싸 배포되므로, 이 한 줄이 없으면 Tailwind preflight 가 클래스 스타일을 지운다.

```css
/* Tailwind import 보다 위 */
@layer theme, base, ns-controls, components, utilities;
@import "tailwindcss";
```
```

`scripts/release.mjs` 가 README 와 `index.html` 의 설치 라인을 정규식으로 갱신한다(`dashboard-common-ui.git#v<version>`). 위 블록에는 그 패턴이 없으므로 영향이 없다. 확인한다.

```sh
grep -c 'dashboard-common-ui.git#v' README.md    # 기존 개수와 같아야 한다
```

- [ ] **Step 6: `npm run check` 와 빌드를 마지막으로 돌린다**

Run: `npm run check && npm run build`
Expected: 넷 다 통과, `dist/` 에 산출물 여섯(`index.js` · `react.js` · `bundle.umd.js` · `tokens.css` · `controls.css` · `**/*.d.ts`).

```sh
ls dist/index.js dist/react.js dist/bundle.umd.js dist/tokens.css dist/controls.css
```

- [ ] **Step 7: 구조 검사를 돌린다**

```sh
grep -c '<script>' index.html                                        # 1
grep -n '</script>' index.html | grep -v -E ':\s*</script>\s*$' | grep -v '<script src='   # 출력 없음
grep -n 'document.addEventListener' index.html                        # 출력 없음
```

- [ ] **Step 8: 문서 안의 링크와 경로가 맞는지 확인한다**

문서가 서로를 가리키는 경로를 실제로 검증한다.

```sh
grep -rn 'copy-tokens' . --include="*.md" --include="*.json" --include="*.mjs" | grep -v node_modules   # 출력 없음
grep -rn 'src/react/index.ts' .claude docs scripts | grep -v node_modules   # elements.ts 로 바뀐 곳이 남아있지 않은지
```

`copy-tokens` 언급이 남아 있으면 `project-structure.md` 나 스킬 문서를 덜 고친 것이다.

- [ ] **Step 9: 사람이 확인할 것을 보고서에 적는다**

- `index.html` 전체를 처음부터 끝까지 열어 **섹션 11개가 모두 보이고** 콘솔에 오류가 없는지
- 좌측 네비게이션의 "클래스"·"컴포넌트" 그룹 항목이 모두 해당 섹션으로 이동되는지
- 스크롤에 따라 `active` 가 옮겨가는지 (`IntersectionObserver` 가 새 섹션도 관찰하는지)
- README 를 GitHub 에서 볼 때 중첩 코드 블록이 깨지지 않는지

- [ ] **Step 10: 커밋**

```bash
git add -A
git commit -m "docs(primitives): 클래스 레이어의 규칙과 함정 기록"
```

---

## 완료 후 남는 일

- **`ns-table`** — 별도 스펙. 이 계획이 만든 `.ns-checkbox`(선택)와 `.ns-button`(페이징)을 쓴다. shadow 안에서 그 클래스들을 재사용하는 문제를 그 스펙에서 정한다
- **`ns-header`·`ns-sidebar` 의 비제어 지원** — 이 계획이 `ns-dialog` 에서 확립한 제어/비제어 패턴을 셸에 적용하는 것. 두 컴포넌트를 감싸는 것을 도입할지가 핵심이다
- **릴리스** — `.claude/skills/releasing` 을 따른다. `dist/controls.css` 가 태그 커밋에 포함되는지 확인해야 한다(`copy-css.mjs` 가 `build` 에 있으므로 자동이지만, `git show <tag>:dist/controls.css` 로 확인한다)
- **`dashboard-shell` 이관** — `components/ui/*` 삭제 후 패키지 re-export. 다른 저장소이므로 그쪽에서 새 spec·plan 을 만든다
