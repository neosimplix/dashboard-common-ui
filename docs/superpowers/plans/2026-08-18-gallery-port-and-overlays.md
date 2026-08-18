# 갤러리 이관 + 오버레이 삼종 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `dashboard-shell` 의 UI 갤러리에 있고 이 라이브러리에 없는 컴포넌트(Accordion · Message · Chip · RowButton · Tabs · MultiSelect)를 옮기고, toast · alert · confirm 을 더한다.

**Architecture:** 행동이 없는 넷은 `controls.css` 의 클래스다. 행동이 있는 둘은 Light DOM 커스텀 엘리먼트로, `ns-tabs` 는 소비자 마크업에 행동만 얹고(`ns-table` 선례) `ns-multi-select` 는 데이터를 받아 렌더한다(`ns-pagination` 선례). 오버레이 셋은 Promise 를 돌려주는 명령형 함수이고, 토스트만 자기 shadow 리전(`ns-toast`)을 갖는다.

**Tech Stack:** TypeScript · Lit 3 (`LitElement` · `ReactiveElement`) · `@lit/react` · Vite · 순수 CSS(`@layer ns-controls`)

## Global Constraints

이 저장소의 불변 규칙(`.claude/rules/library-invariants.md`)과 설계 스펙(`docs/superpowers/specs/2026-08-18-gallery-port-and-overlays-design.md`)에서 이 계획에 걸리는 것만 옮긴다. **모든 태스크의 요구사항에 암묵적으로 포함된다.**

- **테스트 러너를 추가하지 않는다.** vitest · jest · playwright · web-test-runner 를 설치하지 않고 `*.test.*` 파일을 만들지 않는다. 회귀 확인은 `npm run check` 와 `index.html` 육안 확인 둘뿐이다.
- **커밋 메시지는 `<type>(<scope>): <한국어 제목>`.** type 은 `feat` `fix` `refactor` `style` `docs` `test` `chore` 중 하나, scope 는 영어 소문자. 제목에 마침표를 찍지 않는다. **`git push` 는 하지 않는다.**
- **모든 커스텀 프로퍼티는 `--ns-` 접두사.** 문서 트리에 나가는 CSS 클래스도 `.ns-` 접두사. 변형은 `--`, 하위 요소는 `__`.
- **컴포넌트 스타일에 `var()` 폴백을 쓰지 않는다.** 색·치수는 `tokens.css` 한 곳에만 존재한다. 유일한 예외는 `--ns-label-display`.
- **`controls.css` 의 모든 규칙은 `@layer ns-controls { … }` 블록 안에 있어야 한다.**
- **상태 변형에 클래스를 만들지 않는다.** `invalid` 는 `[aria-invalid="true"]`, 선택은 `[aria-checked="true"]`, 비활성은 `:disabled` / `:has(:disabled)`.
- **`:host` 에 `border` · `margin` · `padding` 을 두지 않는다.** Tailwind preflight 가 지운다. `check-tokens.mjs` 규칙 ④ 가 강제한다.
- **`@customElement` 데코레이터를 쓰지 않는다.** `src/internal/register.ts` 의 `register(tag, ctor)` 를 쓴다.
- **Light DOM 컴포넌트는 `.styles.ts` 파일을 만들지 않는다.** `createRenderRoot` 재정의로 `static styles` 가 조용히 무시된다.
- **모든 커스텀 이벤트는 `{ bubbles: true, composed: true }`.**
- **새 이벤트는 네 곳이 함께 움직인다** — 컴포넌트의 `dispatchEvent`, `src/types.ts` 의 detail 인터페이스 + `HTMLElementEventMap` 확장, `src/react/elements.ts` 의 매핑(**`EventName<>` 캐스트 포함**), `docs/consumer-example.tsx` 의 핸들러에서 `e.detail` 을 실제로 읽기.
- **`index.html` 데모 규약**: `<template class="ex">` → 다음 형제가 `.demo` → 그 다음이 `<pre>`. 예시 블록(`<script type="text/plain">`) 안에 `<script>` 태그를 넣지 않는다. 리스너를 `document` 에 붙이지 않는다. **새 절의 `id` 에는 절 이름을 접두사로 붙인다**(중복 `id` 하나가 배선 스크립트 전체를 죽인다).
- **브라우저 확인은 사람이 한다.** 하지 않은 확인을 했다고 보고하지 않는다.

**모든 태스크의 검증 명령** (달리 적지 않으면 이 셋을 돌린다):

```sh
npm run check
node scripts/check-controls.mjs
grep -oE '(^|[[:space:]])id="[^"]*"' index.html | sed -E 's/.*id="([^"]*)"/\1/' | sort | uniq -d   # 출력 없어야 정상
```

---

## 파일 구조

| 파일 | 책임 | 태스크 |
|---|---|---|
| `src/tokens/tokens.css` | `--ns-color-danger-fg` 추가 | 1 |
| `src/controls/controls.css` | 새 클래스 전부 | 1·2·3·4·5·6·7 |
| `src/react/controls/Button.tsx` | `ButtonVariant` 에 `"danger"` | 1 |
| `src/react/controls/Accordion.tsx` | `<details>` 래퍼 | 2 |
| `src/react/controls/Message.tsx` | 빈 상태 한 줄 | 3 |
| `src/react/controls/Chip.tsx` | 세 갈래 칩 | 4 |
| `src/components/tabs/ns-tabs.ts` | `ReactiveElement`. 소비자 버튼에 ARIA·키보드 | 6 |
| `src/components/multi-select/ns-multi-select.ts` | `LitElement` + Light DOM 렌더 | 7 |
| `src/components/toast/ns-toast.ts` · `.styles.ts` | shadow 리전 + 큐 + 타이머 | 8 |
| `src/components/toast/toast.ts` | `nsToast` 명령형 파사드 | 8 |
| `src/components/dialog/confirm.ts` | `nsAlert` · `nsConfirm` | 9 |
| `src/types.ts` | 이벤트 detail 둘 | 6·7 |
| `src/index.ts` | 등록 부수효과 + 재export | 6·7·8·9 |
| `src/react/elements.ts` | `NsTabs` · `NsMultiSelect` 래퍼 | 6·7 |
| `src/react/index.ts` | 재export 허브 | 1~9 |
| `docs/consumer-example.tsx` | 소비자 관점 타입 검사 | 1~9 |
| `index.html` | 문서 · 데모 · 클래스 표 | 1~9 |
| `docs/project-structure.md` · `docs/gotchas.md` · `.claude/skills/releasing/SKILL.md` | 문서 갱신 | 10 |

---

## Task 1: `--ns-color-danger-fg` 토큰과 `.ns-button--danger`

**Files:**
- Modify: `src/tokens/tokens.css` (`@no-alias` 표시 아래, `--ns-dialog-margin` 다음)
- Modify: `src/controls/controls.css` (`.ns-button--icon` 규칙 다음)
- Modify: `src/react/controls/Button.tsx:5`
- Modify: `index.html` (`.ns-button` 절)
- Modify: `docs/consumer-example.tsx`

**Interfaces:**
- Produces: CSS 클래스 `.ns-button--danger`, 토큰 `--ns-color-danger-fg`, 타입 `ButtonVariant = "solid" | "outline" | "ghost" | "icon" | "danger"`. Task 9 의 `nsConfirm` 이 이 클래스를 쓴다.

- [ ] **Step 1: 토큰을 추가한다**

`src/tokens/tokens.css` 의 `--ns-dialog-margin: var(--ns-space-8);` 줄 **다음**, `:root` 블록이 닫히기 전에 넣는다.

```css
  /*
    .ns-button--danger 의 글자색.

    색은 tokens.css 한 곳에만 존재해야 하므로 controls.css 에 #fff 를 적지
    않는다 — 리터럴은 정의상 두 모드를 함께 뒤집을 수 없다. 사용처가 하나인
    토큰을 만들지 않는다는 규칙보다 이쪽이 먼저다.

    다크에서 흰색이 아닌 이유가 있다. --ns-color-danger 는 다크에서
    oklch(70.4% …) 로 **밝아지므로** 흰 글자와의 대비가 무너진다.

    @no-alias 아래에 있는 것이 중요하다. 0.1.5 에 --color-danger-fg 라는
    무접두사 원본이 없으므로, 위에 두면 copy-css.mjs 가 아무도 쓴 적 없는
    별칭을 aliases.css 에 만든다.
  */
  --ns-color-danger-fg: light-dark(#fff, oklch(21% 0.006 285.885));
```

- [ ] **Step 2: 토큰이 `@no-alias` 아래에 있는지 확인한다**

Run:
```sh
node -e '
const s = require("fs").readFileSync("src/tokens/tokens.css","utf8");
const i = s.indexOf("@no-alias"), j = s.indexOf("--ns-color-danger-fg");
console.log(i > 0 && j > i ? "OK: @no-alias 아래" : "FAIL: 위치가 잘못됐다");'
```
Expected: `OK: @no-alias 아래`

- [ ] **Step 3: `controls.css` 에 변형을 추가한다**

`.ns-button--icon:hover…` 규칙 다음, `.ns-button--full` 앞에 넣는다.

```css
  /*
    파괴적 확인. nsConfirm({ tone: "danger" }) 의 확인 버튼이 쓴다.

    hover 에서 배경을 바꾸지 않는다. --ns-color-danger-hover 를 만들려면
    라이트·다크 두 값을 정해야 하는데 지금 그 값을 정할 근거가 없다.
    비활성은 --solid 와 같이 배경을 죽인다.
  */
  .ns-button--danger {
    background: var(--ns-color-danger);
    color: var(--ns-color-danger-fg);
  }
  .ns-button--danger:disabled,
  .ns-button--danger[aria-disabled="true"] { background: var(--ns-color-disabled); }
```

- [ ] **Step 4: React 타입을 넓힌다**

`src/react/controls/Button.tsx:5` 를 바꾼다.

```ts
export type ButtonVariant = "solid" | "outline" | "ghost" | "icon" | "danger";
```

`buttonClass` 는 이미 `` `ns-button--${variant}` `` 로 만들고, `--icon` 만 크기 변형을 빼므로 다른 변경이 필요 없다.

- [ ] **Step 5: 검사를 실패시켜 본다**

문서에 적기 **전에** `check-controls.mjs` 가 실제로 막는지 확인한다. 한 번도 실패해 본 적 없는 검사가 통과하는 것은 아무 증거도 아니다.

Run: `node scripts/check-controls.mjs`
Expected: FAIL — `ns-button--danger` 가 문서에 없다는 메시지.

- [ ] **Step 6: `index.html` 의 `.ns-button` 절에 문서화한다**

데모 `<template class="ex">` 안, `<button class="ns-button ns-button--ghost ns-button--md">ghost</button>` 다음 줄에 추가:

```html
    <button class="ns-button ns-button--danger ns-button--md">danger</button>
    <button class="ns-button ns-button--danger ns-button--md" disabled>danger disabled</button>
```

클래스 표에서 `.ns-button--ghost` 행 다음에 추가:

```html
    <tr><td><code>.ns-button--danger</code></td><td>되돌릴 수 없는 동작. 배경이 <code>--ns-color-danger</code>. <strong>hover 에서 변하지 않는다</strong></td></tr>
```

- [ ] **Step 7: `docs/consumer-example.tsx` 에 `danger` 변형을 쓴다**

`<ButtonLink href="/login" …>로그인</ButtonLink>` 줄 다음에 넣는다.

```tsx
            <Button variant="danger" size="sm" onClick={() => log("delete")}>삭제</Button>
```

- [ ] **Step 8: 검증**

Run:
```sh
npm run check
node scripts/check-controls.mjs
```
Expected: 둘 다 통과.

- [ ] **Step 9: 커밋**

```sh
git add src/tokens/tokens.css src/controls/controls.css src/react/controls/Button.tsx index.html docs/consumer-example.tsx
git commit -m "feat(button): 파괴적 동작용 danger 변형 추가"
```

---

## Task 2: `.ns-accordion`

**Files:**
- Modify: `src/controls/controls.css` (`.ns-card` 규칙 다음)
- Create: `src/react/controls/Accordion.tsx`
- Modify: `src/react/index.ts`
- Modify: `index.html` (`.ns-card` 절 다음에 새 절, 사이드바 목차)
- Modify: `docs/consumer-example.tsx`

**Interfaces:**
- Produces: 클래스 `.ns-accordion` `.ns-accordion--card` `.ns-accordion--plain` `.ns-accordion__title` `.ns-accordion__meta` `.ns-accordion__body`; React `Accordion` · 타입 `AccordionProps` · `AccordionVariant`.

- [ ] **Step 1: `controls.css` 에 규칙을 추가한다**

`.ns-card { … }` 규칙 **다음**, `@layer` 닫는 중괄호 앞에 넣는다.

```css
  /*
    접히는 섹션. 네이티브 <details>/<summary> 라 열림 상태·키보드·삼각형 표식을
    브라우저가 갖는다 — 우리 JS 가 한 줄도 실행되지 않으므로 태그가 아니라
    클래스다. .ns-checkbox 가 눌리면 체크되는데도 클래스인 것과 같다.

    **두 변형을 반드시 함께 쓴다** (class="ns-accordion ns-accordion--card").
    한쪽을 기본으로 깔고 다른 쪽에서 border: none 으로 되돌리는 방식이 아니다 —
    되돌리는 규칙은 소스 순서에 기대게 되고, 나중에 규칙을 하나 더할 때 어느
    쪽이 이기는지가 조용히 바뀐다. .ns-button 이 --solid/--outline 을 요구하는
    것과 같은 규약이다.

    .ns-accordion 에는 두 변형이 같아야 하는 것만 둔다 — 커서와 초점 표시다.
    summary 는 요소 타입으로 특정되므로 자손 선택자로 잡는다.
  */
  .ns-accordion summary {
    cursor: pointer;
  }

  /* 안쪽에 그린다. summary 가 면의 가장자리라 바깥에 그리면 이웃과 겹친다. */
  .ns-accordion summary:focus-visible {
    outline: 2px solid var(--ns-color-accent);
    outline-offset: -2px;
    border-radius: var(--ns-radius-panel);
  }

  /* ── card ── 훑는 편집 섹션. 테두리 있는 면 위에 제목 + 오른쪽 요약. */
  .ns-accordion--card {
    border: 1px solid var(--ns-color-line);
    border-radius: var(--ns-radius-panel);
    background: var(--ns-color-surface);
  }

  .ns-accordion--card summary {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--ns-space-4);
    padding: var(--ns-space-3) var(--ns-space-4);
    /* 기본 삼각형을 남긴다 — 열림 상태를 알리는 유일한 표식이고 브라우저가 그린다. */
    list-style-position: inside;
  }

  .ns-accordion--card summary:hover {
    background: var(--ns-color-surface-hover);
  }

  .ns-accordion__title {
    font-size: var(--ns-font-size-sm);
    line-height: var(--ns-line-height-sm);
    font-weight: var(--ns-weight-semibold);
    color: var(--ns-color-fg);
  }

  /* 접힌 채로 훑을 수 있게 하는 요약. 열지 않아도 개수가 보인다. */
  .ns-accordion__meta {
    font-size: var(--ns-font-size-xs);
    line-height: var(--ns-line-height-xs);
    color: var(--ns-color-fg-muted);
    text-align: right;
  }

  .ns-accordion--card .ns-accordion__body {
    display: flex;
    flex-direction: column;
    gap: var(--ns-space-4);
    padding: var(--ns-space-4);
    border-top: 1px solid var(--ns-color-line);
  }

  /*
    ── plain ── 눈에 띄면 안 되는 보조 경로. 면을 만들지 않고 위 구분선 한 줄로만
    본문과 떨어뜨린다. 위쪽 여백은 쓰는 화면이 className 으로 정한다 — 얼마나
    떨어뜨릴지는 그 화면의 배치이지 이 컴포넌트의 모양이 아니다.
  */
  .ns-accordion--plain {
    border-top: 1px solid var(--ns-color-line);
    padding-top: var(--ns-space-4);
  }

  .ns-accordion--plain summary {
    text-align: center;
    font-size: var(--ns-font-size-sm);
    line-height: var(--ns-line-height-sm);
    color: var(--ns-color-fg-muted);
  }

  .ns-accordion--plain .ns-accordion__body {
    margin-top: var(--ns-space-4);
  }
```

- [ ] **Step 2: 검사를 실패시켜 본다**

Run: `node scripts/check-controls.mjs`
Expected: FAIL — `ns-accordion` 계열 여섯 이름이 문서에 없다는 메시지. **의도한 이유로 실패했는지** 확인한다(다른 오류가 먼저 나면 이 검사는 아직 검증되지 않은 것이다).

- [ ] **Step 3: React 컴포넌트를 만든다**

Create `src/react/controls/Accordion.tsx`:

```tsx
import type { ReactNode } from "react";

import { cx } from "../cx.js";

export type AccordionVariant = "card" | "plain";

type AccordionBase = {
  title: string;
  /**
   * 처음 렌더될 때 펼쳐진 채로 나온다.
   *
   * `open` 이 아니라 `defaultOpen` 인 이유: 이후의 열림 상태는 브라우저가 갖고
   * React 는 다시 손대지 않는다. `defaultChecked` 와 같은 규약이다 — `open` 이라
   * 부르면 값을 바꿔 여닫을 수 있다는 뜻이 되는데 그렇지 않다.
   */
  defaultOpen?: boolean;
  children: ReactNode;
  /** 배치·여백만 더한다. 색·테두리는 여기서 덮이지 않는다. */
  className?: string;
};

/**
 * `summary` 가 `card` 에서만 필수인 것은 타입으로 갈라 둔 것이다.
 *
 * 「권한」만 적혀 있으면 몇 개인지 보려고 전부 열어야 하고, 그건 접어 둔 의미가
 * 없다. optional 로 두면 이 규약은 아무도 지키지 않으므로 tsc 가 호출부에서
 * 멈추게 한다. `plain` 에는 요약 자리 자체가 없으므로 `never` 다.
 */
export type AccordionProps = AccordionBase &
  (
    | { variant?: "card"; summary: string }
    | { variant: "plain"; summary?: never }
  );

/**
 * 접히는 섹션 하나. 여러 개를 쌓은 것이 아코디언이고, 각각은 독립적으로 여닫힌다.
 *
 * **네이티브 `<details>`/`<summary>` 다** — 열림 상태·키보드·접근성을 브라우저가
 * 한다. 그래서 이 컴포넌트가 상태를 갖지 않고, 라이브러리에서도 태그가 아니라
 * 클래스다.
 *
 * 두 변형의 차이는 **무게**다. `card` 는 나란히 쌓아 훑는 편집 섹션이고,
 * `plain` 은 본문에서 눈을 떼게 하지 않으려는 보조 경로다.
 */
export function Accordion({
  title,
  summary,
  defaultOpen,
  children,
  className,
  variant = "card",
}: AccordionProps) {
  return (
    <details
      className={cx("ns-accordion", `ns-accordion--${variant}`, className)}
      open={defaultOpen}
    >
      <summary>
        {variant === "plain" ? (
          title
        ) : (
          <>
            <span className="ns-accordion__title">{title}</span>
            <span className="ns-accordion__meta">{summary}</span>
          </>
        )}
      </summary>
      <div className="ns-accordion__body">{children}</div>
    </details>
  );
}
```

- [ ] **Step 4: `src/react/index.ts` 에서 내보낸다**

`export { Card } …` 블록 다음에 추가한다.

```ts
export { Accordion } from "./controls/Accordion.js";
export type { AccordionProps, AccordionVariant } from "./controls/Accordion.js";
```

- [ ] **Step 5: `index.html` 에 절을 추가한다**

먼저 사이드바 목차. `<ns-nav-item href="#ns-card" label=".ns-card" badge="CD"></ns-nav-item>` 다음 줄에:

```html
      <ns-nav-item href="#ns-accordion" label=".ns-accordion" badge="AC"></ns-nav-item>
```

그리고 `<h2 id="ns-card">.ns-card</h2>` 절이 끝나는 자리(다음 `<h2 id="ns-icon">` 바로 앞)에 절을 통째로 넣는다.

```html
  <h2 id="ns-accordion">.ns-accordion</h2>
  <p>
    접히는 섹션. 네이티브 <code>&lt;details&gt;</code>/<code>&lt;summary&gt;</code> 라
    열림 상태·키보드·삼각형 표식을 <strong>브라우저가</strong> 갖는다. 우리 JS 가 한 줄도
    실행되지 않으므로 태그가 아니라 클래스다.
  </p>
  <p>
    <strong>변형을 반드시 함께 쓴다</strong> — <code>.ns-accordion .ns-accordion--card</code>.
    한쪽을 기본으로 깔고 다른 쪽에서 되돌리면 그 되돌리는 규칙이 소스 순서에 기대게 된다.
    <code>.ns-button</code> 이 <code>--solid</code>/<code>--outline</code> 을 요구하는 것과 같다.
  </p>

  <h3>데모</h3>
  <template class="ex">
    <details class="ns-accordion ns-accordion--card">
      <summary>
        <span class="ns-accordion__title">부서 · 직급</span>
        <span class="ns-accordion__meta">플랫폼개발팀 · 팀장</span>
      </summary>
      <div class="ns-accordion__body">
        <p style="margin:0">닫힌 채로 시작한다.</p>
      </div>
    </details>

    <details class="ns-accordion ns-accordion--card" open>
      <summary>
        <span class="ns-accordion__title">권한</span>
        <span class="ns-accordion__meta">3개</span>
      </summary>
      <div class="ns-accordion__body">
        <label class="ns-checkbox">
          <input type="checkbox" checked>
          <span>사용자 목록 조회</span>
        </label>
        <label class="ns-checkbox">
          <input type="checkbox">
          <span>가입 승인</span>
        </label>
      </div>
    </details>

    <details class="ns-accordion ns-accordion--card">
      <summary>
        <span class="ns-accordion__title">프로젝트 부여</span>
        <span class="ns-accordion__meta">슈퍼 관리자는 전부 가진다 · 부서 기본 접근에 더해 개별로 부여한 것 없음</span>
      </summary>
      <div class="ns-accordion__body">
        <p style="margin:0">요약이 길 때 제목을 밀어내지 않고 오른쪽에서 줄바꿈되는지 본다.</p>
      </div>
    </details>

    <details class="ns-accordion ns-accordion--plain">
      <summary>관리자 로그인</summary>
      <div class="ns-accordion__body">
        <p style="margin:0">면을 만들지 않는다. card 와 나란히 놓고 무게 차이가 보이는지 본다.</p>
      </div>
    </details>
  </template>
  <div class="demo block" id="accordion-demo" style="display:grid;gap:var(--ns-space-2);padding:var(--ns-space-4)"></div>
  <pre></pre>

  <h3>클래스</h3>
  <table>
    <tr><th>클래스</th><th>붙이는 요소</th><th>설명</th></tr>
    <tr><td><code>.ns-accordion</code></td><td><code>details</code></td><td>기본. 항상 붙인다. 커서와 초점 표시만 갖는다</td></tr>
    <tr><td><code>.ns-accordion--card</code></td><td><code>details</code></td><td>테두리 있는 면. 훑는 편집 섹션</td></tr>
    <tr><td><code>.ns-accordion--plain</code></td><td><code>details</code></td><td>구분선 한 줄. 눈에 띄면 안 되는 보조 경로</td></tr>
    <tr><td><code>.ns-accordion__title</code></td><td><code>span</code></td><td><code>--card</code> 의 제목. <code>--plain</code> 에는 쓰지 않는다</td></tr>
    <tr><td><code>.ns-accordion__meta</code></td><td><code>span</code></td><td>접힌 채로 보이는 요약. <strong>비워 두지 않는다</strong> — 열어야만 알 수 있으면 접은 의미가 없다</td></tr>
    <tr><td><code>.ns-accordion__body</code></td><td><code>div</code></td><td>펼쳐지는 내용</td></tr>
  </table>

  <h3>HTML</h3>
  <script type="text/plain">
    <details class="ns-accordion ns-accordion--card" open>
      <summary>
        <span class="ns-accordion__title">권한</span>
        <span class="ns-accordion__meta">3개</span>
      </summary>
      <div class="ns-accordion__body">내용</div>
    </details>
  </script>

  <h3>React</h3>
  <script type="text/plain">
    import { Accordion } from "@neosimplix/common-ui/react";

    <Accordion title="권한" summary="3개" defaultOpen>내용</Accordion>
    <Accordion variant="plain" title="관리자 로그인" className="mt-6">내용</Accordion>
  </script>

  <h3>주의</h3>
  <ul>
    <li><code>open</code> 속성은 <strong>초기값이다.</strong> 이후의 열림 상태는 브라우저가 갖는다 — React 의 <code>defaultOpen</code> 과 같다.</li>
    <li><code>--card</code> 에서 <code>__meta</code> 를 비우지 않는다. React 쪽은 타입이 막는다.</li>
    <li><code>--plain</code> 의 위쪽 여백은 쓰는 화면이 정한다. 이 클래스는 구분선과 그 바로 위 여백만 갖는다.</li>
  </ul>
```

- [ ] **Step 6: `docs/consumer-example.tsx` 에 두 변형을 쓴다**

import 목록에 `Accordion` 을 알파벳 순으로 넣고(`Button` 앞), `<Card>` 안 `<Textarea …/>` 다음에 추가한다.

```tsx
            <Accordion title="권한" summary="3개" defaultOpen>
              <Checkbox label="가입 승인" defaultChecked />
            </Accordion>
            <Accordion variant="plain" title="관리자 로그인">
              <Input value="" onChange={(e) => log(e.target.value)} />
            </Accordion>
```

- [ ] **Step 7: 검증**

Run:
```sh
npm run check
node scripts/check-controls.mjs
grep -oE '(^|[[:space:]])id="[^"]*"' index.html | sed -E 's/.*id="([^"]*)"/\1/' | sort | uniq -d
```
Expected: 앞 둘 통과, 마지막은 출력 없음.

- [ ] **Step 8: 커밋**

```sh
git add src/controls/controls.css src/react/controls/Accordion.tsx src/react/index.ts index.html docs/consumer-example.tsx
git commit -m "feat(accordion): details 기반 접히는 섹션 클래스 추가"
```

---

## Task 3: `.ns-message`

**Files:**
- Modify: `src/controls/controls.css` (`.ns-accordion--plain .ns-accordion__body` 규칙 다음)
- Create: `src/react/controls/Message.tsx`
- Modify: `src/react/index.ts`
- Modify: `index.html` (`.ns-accordion` 절 다음, 사이드바 목차)
- Modify: `docs/consumer-example.tsx`

**Interfaces:**
- Produces: 클래스 `.ns-message`; React `Message` · 타입 `MessageProps`.

- [ ] **Step 1: `controls.css` 에 규칙을 추가한다**

```css
  /*
    로딩 · 빈 상태 · 오류를 남는 공간 가운데에 한 줄로 알린다.

    flex: 1 1 0% 라 **부모가 flex 컨테이너여야 한다.** 그 자리를 통째로 차지해
    가운데 정렬하는 것이 이 클래스의 전부다.

    p 는 이 컨테이너의 유일한 자식이라 요소 타입으로 특정된다 — 이름을 붙이지 않는다.
  */
  .ns-message {
    display: flex;
    flex: 1 1 0%;
    align-items: center;
    justify-content: center;
  }

  .ns-message p {
    margin: 0;
    font-size: var(--ns-font-size-sm);
    line-height: var(--ns-line-height-sm);
    color: var(--ns-color-fg-subtle);
  }
```

- [ ] **Step 2: 검사를 실패시켜 본다**

Run: `node scripts/check-controls.mjs`
Expected: FAIL — `ns-message` 가 문서에 없다.

- [ ] **Step 3: React 컴포넌트를 만든다**

Create `src/react/controls/Message.tsx`:

```tsx
import type { ReactNode } from "react";

import { cx } from "../cx.js";

export type MessageProps = {
  children: ReactNode;
  /** 배치·여백만 더한다. */
  className?: string;
};

/**
 * 로딩 · 빈 상태 · 오류를 남는 공간 가운데에 한 줄로 알린다.
 *
 * **부모가 flex 컨테이너여야 한다.** 이 컴포넌트는 `flex: 1 1 0%` 로 남는 자리를
 * 차지하고 그 안에서 가운데 정렬한다.
 */
export function Message({ children, className }: MessageProps) {
  return (
    <div className={cx("ns-message", className)}>
      <p>{children}</p>
    </div>
  );
}
```

- [ ] **Step 4: `src/react/index.ts` 에서 내보낸다**

```ts
export { Message } from "./controls/Message.js";
export type { MessageProps } from "./controls/Message.js";
```

- [ ] **Step 5: `index.html` 에 절을 추가한다**

목차에 `<ns-nav-item href="#ns-accordion" …>` 다음 줄:

```html
      <ns-nav-item href="#ns-message" label=".ns-message" badge="MG"></ns-nav-item>
```

`.ns-accordion` 절 다음에:

```html
  <h2 id="ns-message">.ns-message</h2>
  <p>
    로딩 · 빈 상태 · 오류를 남는 공간 가운데에 한 줄로 알린다.
    <strong>부모가 flex 컨테이너여야 한다</strong> — <code>flex: 1 1 0%</code> 로 남는
    자리를 차지하고 그 안에서 가운데 정렬한다.
  </p>

  <h3>데모</h3>
  <template class="ex">
    <div class="ns-message">
      <p>왼쪽에서 프로젝트를 선택하세요.</p>
    </div>
  </template>
  <div class="demo" id="message-demo" style="height:8rem"></div>
  <pre></pre>

  <h3>클래스</h3>
  <table>
    <tr><th>클래스</th><th>붙이는 요소</th><th>설명</th></tr>
    <tr><td><code>.ns-message</code></td><td><code>div</code></td><td>남는 공간을 차지하고 가운데 정렬. 안의 <code>p</code> 는 자손 선택자로 잡히므로 클래스가 없다</td></tr>
  </table>

  <h3>HTML</h3>
  <script type="text/plain">
    <div class="ns-message"><p>표시할 항목이 없습니다.</p></div>
  </script>

  <h3>React</h3>
  <script type="text/plain">
    import { Message } from "@neosimplix/common-ui/react";

    <Message>왼쪽에서 프로젝트를 선택하세요.</Message>
  </script>
```

`.demo` 는 기본이 `display:flex` 이므로 여기서는 `block` 을 붙이지 않는다 — 이 컴포넌트가 flex 부모를 요구하기 때문이다.

- [ ] **Step 6: `docs/consumer-example.tsx` 에 쓴다**

import 목록에 `Message` 를 넣고, `<Card>` 안에 추가한다.

```tsx
            <div style={{ display: "flex", height: "6rem" }}>
              <Message>표시할 항목이 없습니다.</Message>
            </div>
```

- [ ] **Step 7: 검증**

Run:
```sh
npm run check
node scripts/check-controls.mjs
grep -oE '(^|[[:space:]])id="[^"]*"' index.html | sed -E 's/.*id="([^"]*)"/\1/' | sort | uniq -d
```
Expected: 앞 둘 통과, 마지막은 출력 없음.

- [ ] **Step 8: 커밋**

```sh
git add src/controls/controls.css src/react/controls/Message.tsx src/react/index.ts index.html docs/consumer-example.tsx
git commit -m "feat(message): 빈 상태 한 줄 알림 클래스 추가"
```

---

## Task 4: `.ns-chip`

**Files:**
- Modify: `src/controls/controls.css` (`.ns-message p` 규칙 다음, 그리고 공용 `:focus-visible` 목록)
- Create: `src/react/controls/Chip.tsx`
- Modify: `src/react/index.ts`
- Modify: `index.html` (`.ns-message` 절 다음, 사이드바 목차)
- Modify: `docs/consumer-example.tsx`

**Interfaces:**
- Produces: 클래스 `.ns-chip` `.ns-chip__remove`; React `Chip` · 타입 `ChipProps`. Task 7 의 `ns-multi-select` 가 이 두 클래스를 렌더한다.

- [ ] **Step 1: 공용 `:focus-visible` 목록에 둘을 더한다**

`controls.css` 의 아래 셀렉터 목록에 두 줄을 넣는다(`.ns-table__sort:focus-visible` 앞).

```css
  .ns-button:focus-visible,
  .ns-input:focus-visible,
  .ns-textarea:focus-visible,
  .ns-select:focus-visible,
  .ns-chip:focus-visible,
  .ns-chip__remove:focus-visible,
  .ns-table__sort:focus-visible {
```

- [ ] **Step 2: `controls.css` 에 칩 규칙을 추가한다**

```css
  /*
    누르거나 지우는 선택 토큰. StatusPill 같은 **읽는** 배지가 아니다.

    세 갈래를 마크업으로 가른다 —
      토글      <button class="ns-chip" role="checkbox" aria-checked="…">
      제거      <span class="ns-chip"> … <button class="ns-chip__remove">
      읽기 전용 <span class="ns-chip">

    **토글과 제거를 함께 쓰지 않는다.** 버튼 안에 버튼이 들어가 마크업이 무효가
    된다. 마크업이 갈라져 있으므로 이 조합은 애초에 쓸 수 없고, React 쪽은
    타입이 막는다.

    선택 상태는 [aria-checked="true"] 로 잡는다. --selected 변형 클래스를 만들지
    않는다 — invalid 를 [aria-invalid="true"] 로 잡는 것과 같은 규칙이다. 붙여야
    마땅한 속성을 붙이면 스타일이 따라온다.
  */
  .ns-chip {
    display: inline-flex;
    align-items: center;
    gap: var(--ns-space-1-5);
    border: 1px solid var(--ns-color-line-strong);
    border-radius: var(--ns-radius-pill);
    padding: var(--ns-space-1-5) var(--ns-space-3);
    background: var(--ns-color-surface);
    color: var(--ns-color-fg-body);
    font-size: var(--ns-font-size-sm);
    line-height: var(--ns-line-height-sm);
    /* <button> 갈래는 UA 컨트롤 글꼴을 쓴다. <span> 갈래와 달라 보이지 않게 한다. */
    font-family: inherit;
    box-sizing: border-box;
  }

  /*
    커서·전이·hover 는 <button> 갈래에만 준다. <span> 은 상호작용하지 않으므로
    커서를 주면 거짓말이 된다.
  */
  button.ns-chip {
    cursor: pointer;
    transition: background-color var(--ns-transition-fast) var(--ns-transition-ease),
      border-color var(--ns-transition-fast) var(--ns-transition-ease);
  }

  button.ns-chip:hover:not(:disabled) {
    background: var(--ns-color-surface-hover);
  }

  .ns-chip[aria-checked="true"] {
    background: var(--ns-color-accent);
    border-color: var(--ns-color-accent);
    color: var(--ns-color-accent-fg);
  }

  .ns-chip[aria-checked="true"]:hover:not(:disabled) {
    background: var(--ns-color-accent-hover);
  }

  /* 토글 갈래는 자신이 disabled 되고, 제거 갈래는 안쪽 버튼이 disabled 된다. */
  .ns-chip:disabled,
  .ns-chip:has(:disabled) {
    cursor: default;
    opacity: .6;
  }

  .ns-chip__remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--ns-space-4);
    height: var(--ns-space-4);
    /* 칩 오른쪽 패딩 안으로 당긴다 — × 가 테두리에서 너무 떨어져 보이지 않게. */
    margin-right: calc(var(--ns-space-1) * -1);
    border: 0;
    border-radius: var(--ns-radius-pill);
    background: none;
    color: var(--ns-color-fg-subtle);
    font-family: inherit;
    line-height: 1;
    cursor: pointer;
  }

  .ns-chip__remove:hover:not(:disabled) {
    background: var(--ns-color-surface-hover);
    color: var(--ns-color-fg-body);
  }
```

- [ ] **Step 3: 검사를 실패시켜 본다**

Run: `node scripts/check-controls.mjs`
Expected: FAIL — `ns-chip` · `ns-chip__remove` 가 문서에 없다.

- [ ] **Step 4: React 컴포넌트를 만든다**

Create `src/react/controls/Chip.tsx`:

```tsx
import type { ReactNode } from "react";

import { cx } from "../cx.js";

type ChipBase = {
  children: ReactNode;
  disabled?: boolean;
  className?: string;
};

/**
 * 세 갈래를 판별 유니온으로 가른다.
 *
 * 토글과 제거를 함께 쓰면 버튼 안에 버튼이 들어가 마크업이 무효가 된다.
 * 런타임 경고가 아니라 타입으로 막는다 — 경고는 개발 빌드를 봐야 보이고,
 * 이 저장소는 `process.env` 를 번들에 넣지 않는다.
 *
 * `onClick` 이 토글 갈래에만 있는 것도 의도다. 제거 갈래는 칩 몸통이 `<span>`
 * 이고 × 만 버튼이라, 칩을 잘못 눌러 지우는 일이 없다.
 */
export type ChipProps = ChipBase &
  (
    | { selected: boolean; onClick?: () => void; onRemove?: never; removeLabel?: never }
    | { selected?: never; onClick?: never; onRemove: () => void; removeLabel?: string }
    | { selected?: never; onClick?: never; onRemove?: never; removeLabel?: never }
  );

/**
 * 누르거나 지우는 선택 토큰.
 *
 * `removeLabel` 은 × 버튼의 접근성 이름이다. `children` 이 `ReactNode` 라 거기서
 * 뽑을 수 없어 따로 받는다. **기본값을 그대로 두면 칩이 여러 개일 때 이름이 전부
 * 같아져 어느 칩인지 구별되지 않는다** — `"박승인 제거"` 처럼 채운다.
 */
export function Chip({
  children,
  selected,
  onClick,
  onRemove,
  removeLabel = "제거",
  disabled = false,
  className,
}: ChipProps) {
  if (selected !== undefined) {
    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={selected}
        disabled={disabled}
        onClick={onClick}
        className={cx("ns-chip", className)}
      >
        {children}
      </button>
    );
  }

  if (onRemove !== undefined) {
    return (
      <span className={cx("ns-chip", className)}>
        {children}
        <button
          type="button"
          aria-label={removeLabel}
          disabled={disabled}
          onClick={onRemove}
          className="ns-chip__remove"
        >
          ×
        </button>
      </span>
    );
  }

  return <span className={cx("ns-chip", className)}>{children}</span>;
}
```

- [ ] **Step 5: `src/react/index.ts` 에서 내보낸다**

```ts
export { Chip } from "./controls/Chip.js";
export type { ChipProps } from "./controls/Chip.js";
```

- [ ] **Step 6: `index.html` 에 절을 추가한다**

목차:

```html
      <ns-nav-item href="#ns-chip" label=".ns-chip" badge="CH"></ns-nav-item>
```

`.ns-message` 절 다음에:

```html
  <h2 id="ns-chip">.ns-chip</h2>
  <p>
    누르거나 지우는 선택 토큰. <strong>세 갈래를 마크업으로 가른다</strong> —
    토글은 <code>&lt;button role="checkbox"&gt;</code>, 제거는 <code>&lt;span&gt;</code> 안에
    × 버튼, 읽기 전용은 <code>&lt;span&gt;</code> 하나다.
  </p>
  <p>
    <strong>토글과 제거를 함께 쓰지 않는다.</strong> 버튼 안에 버튼이 들어가 마크업이
    무효가 된다. 선택 상태는 클래스가 아니라 <code>aria-checked="true"</code> 로 표시한다 —
    <code>.ns-input</code> 의 <code>aria-invalid</code> 와 같은 규칙이다.
  </p>

  <h3>데모</h3>
  <template class="ex">
    <button class="ns-chip" type="button" role="checkbox" aria-checked="true">마케팅팀</button>
    <button class="ns-chip" type="button" role="checkbox" aria-checked="false">데이터분석팀</button>
    <button class="ns-chip" type="button" role="checkbox" aria-checked="true" disabled>세일즈팀</button>
    <button class="ns-chip" type="button" role="checkbox" aria-checked="false" disabled>경영지원팀</button>
    <span class="ns-chip">
      박승인
      <button class="ns-chip__remove" type="button" aria-label="박승인 제거">×</button>
    </span>
    <span class="ns-chip">
      임담당
      <button class="ns-chip__remove" type="button" aria-label="임담당 제거" disabled>×</button>
    </span>
    <span class="ns-chip">공지</span>
  </template>
  <div class="demo block" id="chip-demo" style="display:flex;flex-wrap:wrap;gap:var(--ns-space-2);padding:var(--ns-space-4)"></div>
  <pre></pre>

  <h3>클래스</h3>
  <table>
    <tr><th>클래스</th><th>붙이는 요소</th><th>설명</th></tr>
    <tr><td><code>.ns-chip</code></td><td><code>button</code> · <code>span</code></td><td>토큰 몸통. <code>button</code> 일 때만 커서·hover 가 붙는다</td></tr>
    <tr><td><code>.ns-chip__remove</code></td><td><code>span.ns-chip</code> 안의 <code>button</code></td><td>× 버튼. <code>aria-label</code> 을 <strong>칩마다 다르게</strong> 채운다</td></tr>
  </table>

  <h3>상태</h3>
  <table>
    <tr><th>표시</th><th>결과</th></tr>
    <tr><td><code>aria-checked="true"</code></td><td>액센트 배경. 토글 갈래에서만 쓴다</td></tr>
    <tr><td><code>disabled</code></td><td><code>opacity: .6</code>. 제거 갈래는 안쪽 버튼에 붙인다(<code>:has()</code> 로 잡는다)</td></tr>
  </table>

  <h3>HTML</h3>
  <script type="text/plain">
    <button class="ns-chip" type="button" role="checkbox" aria-checked="true">마케팅팀</button>

    <span class="ns-chip">
      박승인
      <button class="ns-chip__remove" type="button" aria-label="박승인 제거">×</button>
    </span>
  </script>

  <h3>React</h3>
  <script type="text/plain">
    import { Chip } from "@neosimplix/common-ui/react";

    <Chip selected={on} onClick={() => setOn(!on)}>마케팅팀</Chip>
    <Chip onRemove={() => remove("park")} removeLabel="박승인 제거">박승인</Chip>
    <Chip>공지</Chip>
  </script>

  <h3>주의</h3>
  <ul>
    <li><code>removeLabel</code> 기본값(<code>"제거"</code>)을 그대로 두지 않는다. 칩이 여러 개일 때 이름이 전부 같아져 어느 칩인지 구별되지 않는다.</li>
    <li>토글 갈래에 <code>role="checkbox"</code> 를 빠뜨리면 <code>aria-checked</code> 가 무시된다 — 배경은 칠해지지만 화면낭독기는 선택 상태를 모른다.</li>
  </ul>
```

- [ ] **Step 7: `docs/consumer-example.tsx` 에 세 갈래를 다 쓴다**

import 목록에 `Chip` 을 넣고, `<Card>` 안에 추가한다.

```tsx
            <Chip selected onClick={() => log("toggle")}>마케팅팀</Chip>
            <Chip onRemove={() => log("remove")} removeLabel="박승인 제거">박승인</Chip>
            <Chip>공지</Chip>
```

- [ ] **Step 8: 검증**

Run:
```sh
npm run check
node scripts/check-controls.mjs
grep -oE '(^|[[:space:]])id="[^"]*"' index.html | sed -E 's/.*id="([^"]*)"/\1/' | sort | uniq -d
```
Expected: 앞 둘 통과, 마지막은 출력 없음.

- [ ] **Step 9: 커밋**

```sh
git add src/controls/controls.css src/react/controls/Chip.tsx src/react/index.ts index.html docs/consumer-example.tsx
git commit -m "feat(chip): 토글·제거·읽기 전용 세 갈래 선택 토큰 추가"
```

---

## Task 5: `.ns-table__row-button` 과 `.ns-table--rows-clickable`

**Files:**
- Modify: `src/controls/controls.css` (`.ns-table__sort` 규칙들 다음, 공용 `:focus-visible` 목록)
- Modify: `index.html` (기존 `.ns-table` 절 안에 하위 절 추가)
- Modify: `docs/consumer-example.tsx`

**Interfaces:**
- Produces: 클래스 `.ns-table__row-button` · `.ns-table--rows-clickable`. React 컴포넌트를 만들지 않는다.

**계획에서 스펙에 더한 것:** `.ns-table--rows-clickable` 은 설계 문서 §2.4 에 없다. 참고 구현의 `rowsClickable` prop 이 하던 "행 전체가 눌리는 표처럼 보이게" 를 클래스로 옮긴 것이다. 없으면 hover 배경(이미 모든 표에 있다)은 눌릴 것처럼 보이는데 커서는 화살표로 남아 어긋난다.

- [ ] **Step 1: 공용 `:focus-visible` 목록에 더한다**

```css
  .ns-button:focus-visible,
  .ns-input:focus-visible,
  .ns-textarea:focus-visible,
  .ns-select:focus-visible,
  .ns-chip:focus-visible,
  .ns-chip__remove:focus-visible,
  .ns-table__sort:focus-visible,
  .ns-table__row-button:focus-visible {
```

- [ ] **Step 2: `controls.css` 에 규칙을 추가한다**

`.ns-table th[aria-sort="descending"] .ns-table__sort::after { … }` 다음, `ns-pagination` 앞에 넣는다.

```css
  /*
    행 전체가 눌리는 표. hover 배경은 위에서 이미 모든 표에 준다(읽기 보조이기도
    하다) — 여기서 더하는 것은 커서뿐이다.
  */
  .ns-table--rows-clickable tbody tr {
    cursor: pointer;
  }

  /*
    클릭되는 행의 첫 칸에 넣는 버튼. **키보드가 그 행에 닿는 유일한 길이다.**

    <tr> 에 role="button" 을 달면 그 행이 더 이상 표의 행이 아니게 되어
    화면낭독기가 칸 제목과 값의 연결을 잃는다. 그래서 시맨틱은 그대로 두고
    버튼을 안에 넣는다.

    **이 버튼에 핸들러를 붙이지 않는다.** 핸들러는 <tr> 에만 있다. Enter·Space 가
    이 버튼에서 click 을 내고 그것이 <tr> 로 버블링하므로, 여기에 또 달면 클릭
    한 번에 두 번 돈다.

    표 안의 이름이 버튼처럼 보이지 않게 한다 — 행 전체가 이미 클릭 대상이고,
    이 버튼은 키보드로 그 행에 닿기 위한 것이다. 셀 텍스트와 같아 보여야 한다.

    포커스 링은 <tr> 이 아니라 이 버튼에 그린다(위 공용 목록). <tr> 의 outline 은
    브라우저마다 셀 경계에서 끊겨 보인다.
  */
  .ns-table__row-button {
    border: 0;
    background: none;
    padding: 0;
    font: inherit;
    color: inherit;
    text-align: left;
    cursor: pointer;
  }

  .ns-table__row-button:hover {
    text-decoration: underline;
  }
```

- [ ] **Step 3: 검사를 실패시켜 본다**

Run: `node scripts/check-controls.mjs`
Expected: FAIL — `ns-table--rows-clickable` · `ns-table__row-button` 이 문서에 없다.

- [ ] **Step 4: `index.html` 의 `.ns-table` 절에 하위 절을 추가한다**

`.ns-table` 절의 클래스 표에 두 행을 더한다.

```html
    <tr><td><code>.ns-table--rows-clickable</code></td><td><code>table</code></td><td>행에 커서를 준다. <strong>핸들러는 주지 않는다</strong> — <code>&lt;tr onclick&gt;</code> 은 쓰는 쪽이 붙인다</td></tr>
    <tr><td><code>.ns-table__row-button</code></td><td>첫 <code>td</code> 안의 <code>button</code></td><td>키보드가 그 행에 닿는 길. 셀 텍스트처럼 보인다</td></tr>
```

그리고 그 절의 마지막 예시 다음에 하위 절을 넣는다.

```html
  <h3>행 클릭</h3>
  <p>
    행 전체가 눌리는 표는 <strong>마우스만으로는 절반이다.</strong>
    <code>&lt;tr onclick&gt;</code> 에는 키보드가 닿지 않고, <code>&lt;tr&gt;</code> 에
    <code>tabindex</code>·<code>role="button"</code> 을 얹으면 그 행이 더 이상 표의 행이
    아니게 되어 화면낭독기가 칸 제목과 값의 연결을 잃는다.
  </p>
  <p>
    그래서 시맨틱은 그대로 두고 첫 칸에 버튼을 넣는다.
    <code>Enter</code>·<code>Space</code> 가 이 버튼에서 <code>click</code> 을 내고 그것이
    <code>&lt;tr&gt;</code> 로 버블링해 이미 있는 핸들러를 탄다 —
    <strong>이 버튼에 핸들러를 또 붙이면 클릭 한 번에 두 번 돈다.</strong>
  </p>

  <template class="ex">
    <table class="ns-table ns-table--rows-clickable">
      <thead>
        <tr><th>이름</th><th>주소</th><th>미답변</th></tr>
      </thead>
      <tbody>
        <tr>
          <td><button class="ns-table__row-button" type="button" aria-haspopup="dialog">글로벌 인플루언서 마케팅</button></td>
          <td>global-influencer-marketing</td>
          <td>3</td>
        </tr>
        <tr>
          <td><button class="ns-table__row-button" type="button" aria-haspopup="dialog">테스트 대시보드</button></td>
          <td>project01-test</td>
          <td>—</td>
        </tr>
      </tbody>
    </table>
  </template>
  <div class="demo block" id="table-row-click-demo" style="padding:var(--ns-space-4)"></div>
  <pre></pre>

  <h3>행 클릭 배선</h3>
  <script type="text/plain">
    // 핸들러는 <tr> 에만 붙인다. 버튼은 키보드 진입점일 뿐이다.
    for (const row of table.querySelectorAll("tbody tr")) {
      row.addEventListener("click", () => openDetail(row));
    }
  </script>

  <h3>React 예시 (행 클릭)</h3>
  <script type="text/plain">
    <table className="ns-table ns-table--rows-clickable">
      <tbody>
        <tr onClick={() => setDetail(row)}>
          <td>
            <button className="ns-table__row-button" type="button" aria-haspopup="dialog">
              {row.name}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </script>
```

`aria-haspopup="dialog"` 는 이 저장소의 규약이다 — 행 클릭이 모달을 여는 것이 기본이고, 모달이 아니면 쓰는 쪽이 뺀다. 위 문단에 그 문장을 한 줄 더 적는다.

- [ ] **Step 5: `docs/consumer-example.tsx` 에 쓴다**

기존 `<NsTable>` 블록 다음, `<NsPagination …/>` 앞에 넣는다.

```tsx
            {/*
              행 클릭. 핸들러는 <tr> 에만 있다 — RowButton 에 또 붙이면
              Enter·Space 가 낸 click 이 버블링해 한 번에 두 번 돈다.
            */}
            <table className="ns-table ns-table--rows-clickable">
              <tbody>
                <tr onClick={() => log("open detail")}>
                  <td>
                    <button className="ns-table__row-button" type="button" aria-haspopup="dialog">
                      글로벌 인플루언서 마케팅
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
```

- [ ] **Step 6: 검증**

Run:
```sh
npm run check
node scripts/check-controls.mjs
grep -oE '(^|[[:space:]])id="[^"]*"' index.html | sed -E 's/.*id="([^"]*)"/\1/' | sort | uniq -d
```
Expected: 앞 둘 통과, 마지막은 출력 없음.

- [ ] **Step 7: 커밋**

```sh
git add src/controls/controls.css index.html docs/consumer-example.tsx
git commit -m "feat(table): 행 클릭의 키보드 진입점 클래스 추가"
```

---

## Task 6: `ns-tabs`

**Files:**
- Create: `src/components/tabs/ns-tabs.ts`
- Modify: `src/types.ts`
- Modify: `src/index.ts`
- Modify: `src/controls/controls.css`
- Modify: `src/react/elements.ts`
- Modify: `src/react/index.ts`
- Modify: `index.html` (`ns-pagination` 절 다음, 사이드바 목차)
- Modify: `docs/consumer-example.tsx`

**Interfaces:**
- Consumes: `register` (`src/internal/register.js`), `warnIfTokensMissing`, `warnPropertyOnlyAttributes`.
- Produces:
  - `class NsTabs extends ReactiveElement` — 프로퍼티 `active?: string`(제어), `defaultActive: string`(속성 `default-active`)
  - `function tabIdFor(panelId: string): string` — `` `${panelId}-tab` ``
  - `interface NsTabChangeDetail { id: string }`
  - 이벤트 `ns-tab-change`, React 프롭 `onNsTabChange`
  - 클래스 `.ns-tabs__count`, 요소 선택자 `ns-tabs`

- [ ] **Step 1: `src/types.ts` 에 detail 을 더한다**

`NsPageChangeDetail` 다음에 넣는다.

```ts
/**
 * ns-tabs 의 탭 전환. 요청되는 다음 탭이다.
 *
 * `id` 는 탭 버튼의 `data-ns-tab` 값이다. **탭 버튼의 DOM `id` 가 아니다** —
 * 그쪽은 `data-ns-panel` 에서 파생된다(`tabIdFor`).
 */
export interface NsTabChangeDetail {
  id: string;
}
```

그리고 `HTMLElementEventMap` 블록에 한 줄:

```ts
    "ns-tab-change": CustomEvent<NsTabChangeDetail>;
```

- [ ] **Step 2: 엘리먼트를 만든다**

Create `src/components/tabs/ns-tabs.ts`:

```ts
import { ReactiveElement } from "lit";
import { property } from "lit/decorators.js";

import { register } from "../../internal/register.js";
import { warnIfTokensMissing } from "../../internal/warn-missing-tokens.js";
import { warnPropertyOnlyAttributes } from "../../internal/warn-property-only.js";
import type { NsTabChangeDetail } from "../../types.js";

/**
 * 탭 버튼에 붙는 `id`. 패널의 `aria-labelledby` 가 이 값을 가리켜야 한다.
 *
 * `data-ns-panel` 에서 파생시키는 이유: 쓰는 쪽이 두 문자열을 따로 관리하면
 * 반드시 어긋난다. 패널 id 는 한 페이지에서 유일하므로 이 파생값도 유일하다.
 */
export function tabIdFor(panelId: string): string {
  return `${panelId}-tab`;
}

/**
 * 탭 줄. **탭 버튼을 렌더하지 않는다** — 소비자가 쓴 마크업에 ARIA 와 키보드만
 * 얹는다. `ns-table` 이 셀을 렌더하지 않는 것과 같은 자리다.
 *
 * 소비자가 쓰는 것:
 * ```html
 * <ns-tabs aria-label="관리자 목록" default-active="live">
 *   <button type="button" data-ns-tab="live" data-ns-panel="panel-live">운영 중</button>
 * </ns-tabs>
 * ```
 *
 * **shadow 로 만들 수 없다.** `LitElement` 는 템플릿으로 소비자 자식을 덮어쓰고,
 * slot 없는 shadow root 는 그 자식을 감춘다. `controls.css` 도 shadow 안에 닿지 않는다.
 *
 * (`aria-controls` 가 IDREF 라서가 **아니다.** 이 컴포넌트는 버튼을 렌더하지 않으므로
 * slot 을 둔 shadow root 였다면 버튼이 문서 트리에 남아 IDREF 는 그대로 해결된다.)
 */
export class NsTabs extends ReactiveElement {
  /*
    Light DOM 이다. 실패 경로가 둘이고 이 재정의가 둘 다 막는다 —
    ReactiveElement 를 상속해 렌더 파이프라인을 갖지 않고(소비자 자식을 덮어쓰지
    않는다), this 를 반환해 shadow root 를 만들지 않는다(자식이 가려지지 않는다).
    둘 다 에러 없이 빈 탭 줄이 된다.

    부수 효과로 static styles 가 무시된다. 스타일은 전부 controls.css 에 있고
    이 컴포넌트에 .styles.ts 파일이 없다.
  */
  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  /**
   * 제어 모드의 활성 탭. `undefined` 면 비제어다.
   *
   * 속성이 아니라 프로퍼티 전용인 이유는 ns-dialog 의 `open` 과 같다 —
   * `<ns-tabs active="live">` 라고 쓰면 제어 모드로 들어가 컴포넌트가 스스로
   * 탭을 바꾸지 못한다. 순수 HTML 은 `default-active` 를 쓴다.
   *
   * **그래서 그 속성은 무시된다** — 관찰되지 않으므로 제어 모드로 들어가지도
   * 않는다. 붙어 있으면 connectedCallback 이 경고한다.
   */
  @property({ attribute: false }) active?: string;

  /** 비제어 초기 탭. 비어 있으면 첫 번째 탭이다. */
  @property({ type: String, attribute: "default-active" }) defaultActive = "";

  #innerActive = "";
  #observer?: MutationObserver;

  get #controlled(): boolean {
    return this.active !== undefined;
  }

  /**
   * 이 인스턴스가 소유한 탭 버튼들.
   *
   * Light DOM 이라 경계가 없다 — closest 로 소유를 확인하지 않으면 중첩된
   * ns-tabs 의 버튼이 바깥 인스턴스에게도 보인다.
   */
  get #tabs(): HTMLElement[] {
    return [...this.querySelectorAll<HTMLElement>("[data-ns-tab]")].filter(
      (el) => el.closest("ns-tabs") === this,
    );
  }

  #idOf(el: HTMLElement): string {
    return el.dataset.nsTab ?? "";
  }

  /** 지금 활성인 탭의 id. 지목된 것이 목록에 없으면 첫 번째 탭이다. */
  get #current(): string {
    const tabs = this.#tabs;
    if (tabs.length === 0) return "";
    const wanted = this.active ?? this.#innerActive;
    return tabs.some((el) => this.#idOf(el) === wanted) ? wanted : this.#idOf(tabs[0]);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    warnIfTokensMissing();
    warnPropertyOnlyAttributes(this, { active: "default-active" });

    /*
      호스트에 속성을 쓴다. 불변 규칙("호스트의 속성을 쓰지 않는다")의 좁은
      예외다 — ARIA 의 tablist↔tab 소유 관계는 DOM 부모여야 해서 이 role 을 둘
      곳이 호스트밖에 없다.

      규칙이 막으려던 것은 "소비자가 쓴 속성을 덮어 문서화된 override 를 조용히
      죽이는 것" 이므로, 이미 role 이 있으면 건드리지 않아 그 성질을 지킨다.
      aria-label 은 소비자가 직접 쓴다 — 우리가 관리할 이유가 없다.
    */
    if (!this.hasAttribute("role")) this.setAttribute("role", "tablist");

    // 위임이라 소비자가 탭을 다시 그려도 리스너를 다시 붙일 필요가 없다.
    this.addEventListener("click", this.#onClick);
    this.addEventListener("keydown", this.#onKeyDown);

    /*
      updated() 는 반응형 프로퍼티가 바뀔 때만 돈다. 소비자가 탭 목록을 바꾸면
      새 버튼에 role·aria-selected·tabindex 가 쓰이지 않고 다음 상호작용까지
      조용히 낡는다.

      attributes 는 관찰하지 않는다. #sync 가 setAttribute 를 쓰므로 관찰했다면
      자기 쓰기에 다시 깨어나 루프가 된다. ns-table 과 같은 배선이다.
    */
    this.#observer = new MutationObserver(() => this.#sync());
    this.#observer.observe(this, { childList: true, subtree: true });
  }

  override disconnectedCallback(): void {
    this.removeEventListener("click", this.#onClick);
    this.removeEventListener("keydown", this.#onKeyDown);
    this.#observer?.disconnect();
    super.disconnectedCallback();
  }

  /*
    비제어 초기값을 seed 한다. ns-pagination 과 달리 firstUpdated 로 충분하다 —
    이 컴포넌트는 render 를 갖지 않으므로 DOM 쓰기가 전부 updated() 에서 일어나고
    그것은 firstUpdated 다음이다. ns-table 과 같은 자리다.

    덮어쓰지 않고 seed 만 한다. Lit 은 첫 업데이트를 마이크로태스크로 미루므로,
    생성과 같은 태스크에서 프로퍼티를 만진 코드가 여기보다 먼저 실행된다.
  */
  protected override firstUpdated(): void {
    if (this.defaultActive !== "") this.#innerActive = this.defaultActive;
  }

  protected override updated(): void {
    this.#sync();
  }

  /** 소비자 DOM 에 ARIA 와 roving tabindex 를 쓴다. 멱등이다. */
  #sync(): void {
    const current = this.#current;
    for (const el of this.#tabs) {
      const id = this.#idOf(el);
      const panel = el.dataset.nsPanel ?? "";
      el.setAttribute("role", "tab");
      // 소비자가 직접 쓴 id 를 덮지 않는다.
      if (!el.hasAttribute("id") && panel !== "") el.setAttribute("id", tabIdFor(panel));
      if (panel !== "") el.setAttribute("aria-controls", panel);
      el.setAttribute("aria-selected", id === current ? "true" : "false");
      /*
        roving tabindex. 활성 탭만 Tab 키로 닿고 나머지는 화살표로 간다 —
        전부 0 이면 탭이 다섯 개일 때 Tab 을 다섯 번 눌러야 패널에 닿는다.
      */
      el.setAttribute("tabindex", id === current ? "0" : "-1");
    }
  }

  #select(id: string, focus: boolean): void {
    if (id === "") return;
    if (id === this.#current) {
      if (focus) this.#focus(id);
      return;
    }

    if (!this.#controlled) {
      this.#innerActive = id;
      this.requestUpdate();
    }

    const detail: NsTabChangeDetail = { id };
    this.dispatchEvent(
      new CustomEvent("ns-tab-change", { detail, bubbles: true, composed: true }),
    );

    /*
      제어 모드에서 소비자가 active 를 바꾸지 않으면 업데이트가 일어나지 않아
      #sync 가 돌지 않는다. 화살표 이동은 그 자리에서 포커스를 옮겨야 하므로
      직접 부른다 — 비제어에서는 위 requestUpdate 가 한 번 더 부르지만 멱등이다.
    */
    this.#sync();
    if (focus) this.#focus(id);
  }

  #focus(id: string): void {
    this.#tabs.find((el) => this.#idOf(el) === id)?.focus();
  }

  /** 이벤트가 우리 탭에서 났으면 그 요소, 아니면 null. */
  #tabFrom(target: EventTarget | null): HTMLElement | null {
    const el = (target as Element | null)?.closest?.("[data-ns-tab]") ?? null;
    if (el === null || el.closest("ns-tabs") !== this) return null;
    return el as HTMLElement;
  }

  #onClick = (e: MouseEvent): void => {
    const el = this.#tabFrom(e.target);
    if (el === null) return;
    this.#select(this.#idOf(el), false);
  };

  /*
    자동 활성화 패턴. 화살표를 누르면 포커스와 선택이 함께 움직인다 — 탭 전환이
    싼 화면이라 이 패턴이 맞다. 목록 끝에서는 반대쪽으로 순환한다.
  */
  #onKeyDown = (e: KeyboardEvent): void => {
    // 탭이 아닌 자식(소비자가 넣은 무언가)에서 난 화살표는 흘린다.
    if (this.#tabFrom(e.target) === null) return;

    const tabs = this.#tabs;
    const index = tabs.findIndex((el) => this.#idOf(el) === this.#current);
    // 기준점이 없으면 화살표를 삼키지 않는다.
    if (index === -1) return;

    const at = (next: number): void => {
      e.preventDefault();
      this.#select(this.#idOf(tabs[(next + tabs.length) % tabs.length]), true);
    };

    if (e.key === "ArrowRight") at(index + 1);
    else if (e.key === "ArrowLeft") at(index - 1);
    else if (e.key === "Home") at(0);
    else if (e.key === "End") at(tabs.length - 1);
  };
}

register("ns-tabs", NsTabs);

declare global {
  interface HTMLElementTagNameMap {
    "ns-tabs": NsTabs;
  }
}
```

- [ ] **Step 3: `src/index.ts` 에 등록과 재export 를 더한다**

import 블록에(알파벳 순, `ns-table.js` 다음):

```ts
import "./components/tabs/ns-tabs.js";
```

export 블록에(`NsTable` 다음):

```ts
export { NsTabs, tabIdFor } from "./components/tabs/ns-tabs.js";
```

그리고 타입 재export 목록에 `NsTabChangeDetail` 을 더한다.

- [ ] **Step 4: `controls.css` 에 스타일을 더한다**

`ns-pagination` 규칙들 다음, `.ns-card` 앞에 넣는다.

```css
  /*
    ns-tabs 는 소비자가 쓴 버튼에 행동만 얹는다(ns-table 과 같다). 자식이 전부
    버튼이므로 요소 타입으로 특정된다 — 소비자가 외울 클래스는 .ns-tabs__count
    하나뿐이다.

    요소 선택자라 정의되지 않은 커스텀 엘리먼트에도 적용된다. 스타일은 즉시,
    동작은 JS 로드 시 붙는다.
  */
  ns-tabs {
    display: flex;
    align-items: stretch;
    gap: var(--ns-space-1);
    /*
      밑줄이 탭 줄 전체에 이어지고 활성 탭만 그 위에 진한 선을 얹는다.
      탭 각각에 테두리를 두르면 활성/비활성 경계가 두 겹으로 보인다.
    */
    border-bottom: 1px solid var(--ns-color-line);
    /* 탭이 많으면 줄바꿈하지 않고 가로로 스크롤한다 — 줄바꿈되면 밑줄이 끊긴다. */
    overflow-x: auto;
  }

  ns-tabs button {
    display: inline-flex;
    align-items: center;
    gap: var(--ns-space-2);
    padding: var(--ns-space-2-5) var(--ns-space-3);
    border: 0;
    /* 활성 표시가 밑줄이므로 자리를 미리 잡아 둔다 — 없으면 선택할 때 1px 씩 움직인다. */
    border-bottom: 2px solid transparent;
    background: none;
    font-family: inherit;
    font-size: var(--ns-font-size-sm);
    line-height: var(--ns-line-height-sm);
    font-weight: var(--ns-weight-medium);
    color: var(--ns-color-fg-muted);
    white-space: nowrap;
    cursor: pointer;
    transition: color var(--ns-transition-fast) var(--ns-transition-ease),
      border-color var(--ns-transition-fast) var(--ns-transition-ease);
  }

  ns-tabs button:hover {
    color: var(--ns-color-fg-body);
  }

  /*
    안쪽에 그린다. 이 컨테이너가 overflow-x: auto 라 바깥에 그린 링은 잘린다.
  */
  ns-tabs button:focus-visible {
    outline: 2px solid var(--ns-color-accent);
    outline-offset: -2px;
    border-radius: var(--ns-radius-control);
  }

  ns-tabs button[aria-selected="true"] {
    color: var(--ns-color-fg);
    font-weight: var(--ns-weight-semibold);
    border-bottom-color: var(--ns-color-accent);
  }

  /*
    처리·확인할 건수. undefined 와 0 이 다르다 — 셀 것이 없는 탭은 이 span 을
    아예 쓰지 않고, 셀 것이 있는데 지금 없으면 0 을 쓴다. 0 을 숨기면
    "배지가 없다" 와 "처리할 게 없다" 가 같은 모양이 된다.
  */
  .ns-tabs__count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.25rem;
    padding: 0 var(--ns-space-1-5);
    border-radius: var(--ns-radius-pill);
    background: var(--ns-color-surface-hover);
    color: var(--ns-color-fg-muted);
    font-size: var(--ns-font-size-2xs);
    line-height: var(--ns-line-height-2xs);
    font-weight: var(--ns-weight-semibold);
  }

  ns-tabs button[aria-selected="true"] .ns-tabs__count {
    background: var(--ns-color-accent);
    color: var(--ns-color-accent-fg);
  }
```

- [ ] **Step 5: `src/react/elements.ts` 에 래퍼를 더한다**

import 에 `NsTabs as NsTabsElement`, 타입 import 에 `NsTabChangeDetail` 을 더하고, `NsPagination` 다음에:

```ts
/*
  shim 이 필요 없다. active·defaultActive 어느 것도 HTML 전역 속성과 충돌하지
  않으므로 평범한 래퍼를 그대로 공개한다. 탭 버튼은 children 으로 넘긴다.
*/
export const NsTabs = createComponent({
  react: React,
  tagName: "ns-tabs",
  elementClass: NsTabsElement,
  events: {
    // EventName<> 브랜딩이 없으면 핸들러가 (e: Event) => void 로 타입된다.
    onNsTabChange: "ns-tab-change" as EventName<CustomEvent<NsTabChangeDetail>>,
  },
});
```

- [ ] **Step 6: `src/react/index.ts` 에서 내보낸다**

첫 줄의 `export { NsHeader, … } from "./elements.js";` 목록에 `NsTabs` 를 알파벳 순으로 더하고, 아래에:

```ts
export { tabIdFor } from "../components/tabs/ns-tabs.js";
```

그리고 타입 재export 목록에 `NsTabChangeDetail` 을 더한다.

- [ ] **Step 7: 이벤트 매핑 검사를 실패시켜 본다**

`src/react/elements.ts` 의 `onNsTabChange` 줄을 잠시 주석 처리하고 검사가 잡는지 본다.

Run: `node scripts/check-events.mjs`
Expected: FAIL — `ns-tab-change` 가 React 매핑에 없다.

확인한 뒤 주석을 되돌린다.

- [ ] **Step 8: `index.html` 에 절을 추가한다**

목차에 `<ns-nav-item href="#ns-pagination" …>` 다음 줄:

```html
      <ns-nav-item href="#ns-tabs" label="ns-tabs" badge="TS"></ns-nav-item>
```

`ns-pagination` 절 다음, `ns-header` 절 앞에:

```html
  <h2 id="ns-tabs">ns-tabs</h2>
  <p>
    탭 줄. <strong>탭 버튼을 렌더하지 않는다</strong> — 소비자가 쓴
    <code>&lt;button&gt;</code> 에 <code>role</code>·<code>aria-selected</code>·
    <code>aria-controls</code>·roving tabindex 를 채우고 화살표 키를 단다.
    <code>ns-table</code> 이 셀을 렌더하지 않는 것과 같은 자리다.
  </p>
  <p>
    <strong>shadow 로 만들 수 없다.</strong> <code>LitElement</code> 는 템플릿으로 소비자
    자식을 덮어쓰고, slot 없는 shadow root 는 그 자식을 감춘다.
    <code>controls.css</code> 도 shadow 안에 닿지 않는다.
    (<code>aria-controls</code> 가 IDREF 라서가 <strong>아니다</strong> — 버튼을 렌더하지
    않으므로 slot 을 둔 shadow root 였다면 버튼이 문서 트리에 남아 IDREF 는 해결된다.)
  </p>
  <p>
    <strong>호스트에 <code>role="tablist"</code> 를 쓴다.</strong> ARIA 의 tablist↔tab
    소유 관계는 DOM 부모여야 해서 둘 곳이 호스트밖에 없다. 이미 <code>role</code> 이
    있으면 건드리지 않는다. <code>aria-label</code> 은 직접 쓴다.
  </p>

  <h3>데모</h3>
  <template class="ex">
    <ns-tabs aria-label="갤러리 예시 탭" default-active="live" id="tabs-demo-tabs">
      <button type="button" data-ns-tab="live" data-ns-panel="tabs-demo-panel-live">운영 중</button>
      <button type="button" data-ns-tab="requests" data-ns-panel="tabs-demo-panel-requests">
        신청 <span class="ns-tabs__count">0</span>
      </button>
      <button type="button" data-ns-tab="inquiries" data-ns-panel="tabs-demo-panel-inquiries">
        문의 <span class="ns-tabs__count">3</span>
      </button>
    </ns-tabs>
    <div id="tabs-demo-panel-live" role="tabpanel" aria-labelledby="tabs-demo-panel-live-tab" tabindex="0">
      운영 중 패널
    </div>
  </template>
  <div class="demo block" id="tabs-demo" style="padding:var(--ns-space-4)"></div>
  <pre></pre>

  <h3>프로퍼티</h3>
  <table>
    <tr><th>이름</th><th>속성</th><th>기본값</th><th>설명</th></tr>
    <tr><td><code>active</code></td><td>없음 (프로퍼티 전용)</td><td><code>undefined</code></td><td>제어 모드의 활성 탭. <strong><code>active="…"</code> 속성은 무시된다</strong></td></tr>
    <tr><td><code>defaultActive</code></td><td><code>default-active</code></td><td><code>""</code></td><td>비제어 초기 탭. 비면 첫 번째 탭</td></tr>
  </table>

  <h3>탭 버튼이 갖는 것</h3>
  <table>
    <tr><th>속성</th><th>누가 쓰나</th><th>설명</th></tr>
    <tr><td><code>data-ns-tab</code></td><td>소비자</td><td>이 탭의 식별자. <code>ns-tab-change</code> 의 <code>id</code> 가 이 값이다</td></tr>
    <tr><td><code>data-ns-panel</code></td><td>소비자</td><td>이 탭이 여는 패널의 <code>id</code></td></tr>
    <tr><td><code>role="tab"</code> · <code>aria-controls</code> · <code>aria-selected</code> · <code>tabindex</code></td><td>컴포넌트</td><td>자동으로 채운다</td></tr>
    <tr><td><code>id</code></td><td>컴포넌트</td><td><code>{data-ns-panel}-tab</code>. <strong>직접 쓰면 덮지 않는다</strong></td></tr>
    <tr><td><code>.ns-tabs__count</code></td><td>소비자</td><td>건수 배지. <strong><code>0</code> 도 그린다</strong> — 배지가 없는 것과 처리할 게 없는 것은 다르다</td></tr>
  </table>

  <h3>이벤트</h3>
  <table>
    <tr><th>이름</th><th>detail</th><th>React 프롭</th></tr>
    <tr><td><code>ns-tab-change</code></td><td><code>{ id }</code></td><td><code>onNsTabChange</code></td></tr>
  </table>

  <h3>키보드</h3>
  <table>
    <tr><th>키</th><th>동작</th></tr>
    <tr><td><code>←</code> <code>→</code></td><td>이전·다음 탭으로. 끝에서 순환한다</td></tr>
    <tr><td><code>Home</code> <code>End</code></td><td>첫·마지막 탭으로</td></tr>
    <tr><td><code>Tab</code></td><td>탭 줄을 한 번에 지나 패널로 간다 (활성 탭만 <code>tabindex="0"</code>)</td></tr>
  </table>
  <p>
    화살표를 누르면 포커스와 선택이 함께 움직인다(자동 활성화). 탭 전환이 싼 화면에 맞는 패턴이다.
  </p>

  <h3>HTML</h3>
  <script type="text/plain">
    <ns-tabs aria-label="관리자 목록" default-active="live">
      <button type="button" data-ns-tab="live" data-ns-panel="panel-live">운영 중</button>
      <button type="button" data-ns-tab="requests" data-ns-panel="panel-requests">
        신청 <span class="ns-tabs__count">3</span>
      </button>
    </ns-tabs>

    <div id="panel-live" role="tabpanel" aria-labelledby="panel-live-tab" tabindex="0">…</div>
  </script>

  <h3>배선</h3>
  <script type="text/plain">
    // 비제어면 배선이 필요 없다. 패널을 갈아 끼울 때만 듣는다.
    tabs.addEventListener("ns-tab-change", (e) => showPanel(e.detail.id));
  </script>

  <h3>React</h3>
  <script type="text/plain">
    import { NsTabs, tabIdFor } from "@neosimplix/common-ui/react";

    const [tab, setTab] = useState("live");

    <NsTabs aria-label="관리자 목록" active={tab} onNsTabChange={(e) => setTab(e.detail.id)}>
      <button type="button" data-ns-tab="live" data-ns-panel="panel-live">운영 중</button>
      <button type="button" data-ns-tab="requests" data-ns-panel="panel-requests">
        신청 <span className="ns-tabs__count">3</span>
      </button>
    </NsTabs>

    <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={tabIdFor(`panel-${tab}`)} tabIndex={0}>
      {tab} 패널
    </div>
  </script>

  <h3>주의</h3>
  <ul>
    <li><code>&lt;ns-tabs active="live"&gt;</code> 는 <strong>무시된다.</strong> 프로퍼티 전용이라 관찰되지 않는다 — 콘솔이 경고한다. HTML 은 <code>default-active</code> 를 쓴다.</li>
    <li>패널의 <code>aria-labelledby</code> 는 <code>{data-ns-panel}-tab</code> 이다. React 는 <code>tabIdFor()</code> 로 계산한다.</li>
    <li>탭 버튼 안에 다른 버튼을 넣지 않는다. <code>click</code> 위임이 가장 가까운 <code>[data-ns-tab]</code> 을 찾으므로 안쪽 버튼도 탭 전환을 일으킨다.</li>
  </ul>
```

- [ ] **Step 9: `index.html` 데모 배선을 더한다**

`<script>` 블록 안, 다른 데모 배선 옆에 넣는다. **리스너를 `document` 가 아니라 데모 컨테이너에 붙인다** — `ns-tab-change` 는 `composed` 라 `document` 까지 올라온다.

```js
  /*
    탭 데모. 비제어라 활성 표시는 컴포넌트가 하고, 여기서는 패널 글자만 바꾼다.
    id 에 tabs-demo- 접두사를 붙인 것은 다른 절과 겹치지 않게 하기 위해서다.
  */
  const tabsDemo = document.getElementById("tabs-demo");
  const tabsPanel = tabsDemo.querySelector("[role='tabpanel']");
  tabsDemo.addEventListener("ns-tab-change", (e) => {
    tabsPanel.textContent = `${e.detail.id} 패널`;
  });
```

- [ ] **Step 10: `docs/consumer-example.tsx` 에 핸들러를 붙인다**

**이것이 `EventName<>` 캐스트를 지키는 유일한 검사다.** import 목록에 `NsTabs` 와 `tabIdFor` 를 더하고, `<Card>` 안에 넣는다.

```tsx
            {/* e.detail 을 실제로 읽어 ns-tab-change 의 detail 타입이 검사되게 한다. */}
            <NsTabs aria-label="관리자 목록" active={tab} onNsTabChange={(e) => setTab(e.detail.id)}>
              <button type="button" data-ns-tab="live" data-ns-panel="panel-live">운영 중</button>
              <button type="button" data-ns-tab="requests" data-ns-panel="panel-requests">
                신청 <span className="ns-tabs__count">3</span>
              </button>
            </NsTabs>
            <div
              id={`panel-${tab}`}
              role="tabpanel"
              aria-labelledby={tabIdFor(`panel-${tab}`)}
              tabIndex={0}
            >
              {tab} 패널
            </div>
```

`Shell` 안의 다른 `useState` 옆에 상태를 더한다.

```tsx
  const [tab, setTab] = useState("live");
```

- [ ] **Step 11: 검증**

Run:
```sh
npm run check
node scripts/check-controls.mjs
grep -c '<script>' index.html
grep -n '</script>' index.html | grep -v -E ':\s*</script>\s*$' | grep -v '<script src='
grep -n 'document.addEventListener' index.html
grep -oE '(^|[[:space:]])id="[^"]*"' index.html | sed -E 's/.*id="([^"]*)"/\1/' | sort | uniq -d
```
Expected: 앞 둘 통과, `1`, 나머지 셋은 출력 없음.

- [ ] **Step 12: 빌드에 등록이 살아남았는지 확인한다**

Run:
```sh
npm run build && grep -c "ns-tabs" dist/bundle.umd.js
```
Expected: 1 이상.

- [ ] **Step 13: 커밋**

```sh
git add src/components/tabs src/types.ts src/index.ts src/controls/controls.css src/react/elements.ts src/react/index.ts index.html docs/consumer-example.tsx
git commit -m "feat(tabs): 소비자 마크업에 ARIA·키보드를 얹는 ns-tabs 추가"
```

---

## Task 7: `ns-multi-select`

**Files:**
- Create: `src/components/multi-select/ns-multi-select.ts`
- Modify: `src/types.ts` · `src/index.ts` · `src/controls/controls.css` · `src/react/elements.ts` · `src/react/index.ts` · `index.html` · `docs/consumer-example.tsx`

**Interfaces:**
- Consumes: 클래스 `.ns-chip` · `.ns-chip__remove` (Task 4), `.ns-input` · `.ns-checkbox` (기존).
- Produces:
  - `class NsMultiSelect extends LitElement` — `options: NsMultiSelectOption[]`, `value?: string[]`, `defaultValue: string[]`, `searchPlaceholder`(`search-placeholder`), `emptyMessage`(`empty-message`), `inputId`(`input-id`), `inputDescribedby`(`input-describedby`)
  - `interface NsMultiSelectOption { value: string; label: string; meta?: string }`
  - `interface NsMultiSelectChangeDetail { values: string[] }`
  - 이벤트 `ns-multi-select-change`, React 프롭 `onNsMultiSelectChange`
  - 클래스 `.ns-multi-select__chips` `.ns-multi-select__list` `.ns-multi-select__empty`, 요소 선택자 `ns-multi-select`

**계획에서 스펙에 더한 것:** `input-describedby`. 설계 §4.1 이 "`aria-describedby` 도 검색 input 에 넘긴다" 고만 적었는데, 호스트의 `aria-describedby` 를 읽어 안쪽에도 쓰면 같은 관계가 두 요소에 걸린다. `input-id` 와 짝이 되는 이름을 별도로 받는다.

- [ ] **Step 1: `src/types.ts` 에 detail 을 더한다**

```ts
/**
 * ns-multi-select 의 선택 변경. **요청되는 다음 전체 집합**이다 — 바뀐 하나가 아니다.
 *
 * 전체 집합으로 두는 이유는 소비자 처리가 한 줄이 되기 때문이다 —
 * `setOwners(e.detail.values)`. `ns-select-change` 와 같은 판단이다.
 *
 * 이름이 `ns-select-change` 와 다른 이유는 그 이름을 ns-table 이 이미 쓰기
 * 때문이다. HTMLElementEventMap 은 전역이라 같은 이름에 다른 detail 을 실을 수 없다.
 */
export interface NsMultiSelectChangeDetail {
  values: string[];
}
```

`HTMLElementEventMap` 블록에:

```ts
    "ns-multi-select-change": CustomEvent<NsMultiSelectChangeDetail>;
```

- [ ] **Step 2: 엘리먼트를 만든다**

Create `src/components/multi-select/ns-multi-select.ts`:

```ts
import { LitElement, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

import { register } from "../../internal/register.js";
import { warnIfTokensMissing } from "../../internal/warn-missing-tokens.js";
import { warnPropertyOnlyAttributes } from "../../internal/warn-property-only.js";
import type { NsMultiSelectChangeDetail } from "../../types.js";

export interface NsMultiSelectOption {
  value: string;
  label: string;
  /**
   * 라벨 옆에 흐리게 붙는 보조 정보. 담당자에게는 소속 부서명.
   *
   * **검색은 `label` 과 이 값 둘 다에 걸린다** — 화면에 보이는 문자열만 검색어가
   * 된다. 보이지 않는 별도 검색어 필드를 두지 않는다.
   */
  meta?: string;
}

/**
 * 후보가 길 때 쓰는 다중 선택 — 선택 칩 줄 · 검색 · 높이 제한 목록.
 *
 * **정렬 순서는 호출부가 `options` 배열 순서로 정한다.** 이 컴포넌트는 도메인을
 * 모르고 받은 순서를 건드리지 않는다.
 *
 * **자식을 받지 않는다.** Lit 이 이 요소의 내용을 통째로 소유한다.
 */
export class NsMultiSelect extends LitElement {
  /*
    Light DOM 이다. .ns-chip · .ns-input · .ns-checkbox 를 그대로 쓰기 위해서다 —
    shadow 였다면 셋 전부를 다시 적어야 했고, 그것이 이 컴포넌트의 내용 거의
    전부다. ns-pagination 과 같은 판단이다.

    자식이 없으므로 Lit 이 이 요소 안에 렌더해도 덮어쓸 소비자 내용이 없다.
    그래서 LitElement 를 그대로 쓴다.

    static styles 는 이 재정의로 무시된다. 스타일은 전부 controls.css 에 있고
    이 컴포넌트에 .styles.ts 가 없다.
  */
  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  /** 후보 전체. **배열이라 속성으로 쓸 수 없다** — JS 로 대입한다. */
  @property({ attribute: false }) options: NsMultiSelectOption[] = [];

  /**
   * 제어 모드의 선택 집합. `undefined` 면 비제어다.
   *
   * 비제어 초기값이 속성이 아니라 `defaultValue` 프로퍼티인 것은 이 저장소의
   * 규칙에서 벗어난다. 배열은 속성으로 쓸 수 없어서다 — 규칙이 막으려던 것
   * ("속성 하나가 겸용돼 조용히 제어 모드로 들어감")은 이름이 둘이라 일어나지 않는다.
   */
  @property({ attribute: false }) value?: string[];

  /** 비제어 초기 선택. */
  @property({ attribute: false }) defaultValue: string[] = [];

  @property({ type: String, attribute: "search-placeholder" }) searchPlaceholder = "검색";
  @property({ type: String, attribute: "empty-message" }) emptyMessage = "결과가 없습니다";

  /**
   * 검색 input 의 `id`. `.ns-field__label` 의 `for` 가 가리킬 곳이다.
   *
   * 호스트의 `id` 를 안쪽 input 에 옮기지 않는 이유: 문서에 같은 `id` 가 둘
   * 생기고, `getElementById` 가 어느 쪽을 주는지가 문서 순서로 정해진다.
   */
  @property({ type: String, attribute: "input-id" }) inputId = "";

  /** 검색 input 의 `aria-describedby`. `.ns-field__hint` 를 잇는 자리다. */
  @property({ type: String, attribute: "input-describedby" }) inputDescribedby = "";

  @state() private query = "";

  /**
   * 비제어 선택. **처음에는 `undefined` 다** — 사용자가 아직 아무것도 만지지
   * 않았다는 뜻이고, 그동안은 `defaultValue` 가 보인다.
   */
  #innerValue?: string[];

  get #controlled(): boolean {
    return this.value !== undefined;
  }

  get #selected(): string[] {
    return this.value ?? this.#innerValue ?? this.defaultValue;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    warnIfTokensMissing();
    warnPropertyOnlyAttributes(this, {
      value: "defaultValue 프로퍼티 (배열은 속성으로 쓸 수 없습니다)",
      options: "options 프로퍼티 (배열은 속성으로 쓸 수 없습니다)",
      "default-value": "defaultValue 프로퍼티",
    });
  }

  /*
    **비제어 초기값을 seed 하지 않는다.** ns-pagination 은 willUpdate 에서
    hasUpdated 를 보고 한 번만 seed 하는데, 그 방식이 거기서 안전한 이유는
    default-page 가 **속성**이라 upgrade 시점에 이미 있기 때문이다.

    배열은 속성으로 쓸 수 없어 여기서는 프로퍼티다. 그래서 같은 방식을 쓰면
    "첫 업데이트가 흐른 뒤의 대입은 조용히 버려진다" 가 된다 — 마크업에 쓴
    엘리먼트를 나중 스크립트가 getElementById 로 잡아 .defaultValue 를 넣는,
    가장 흔한 순수 HTML 배선이 정확히 그 모양이다.

    그래서 seed 대신 **지연 폴백**을 쓴다. #innerValue 는 사용자가 처음 만질
    때까지 undefined 로 남고 그동안 #selected 가 defaultValue 로 떨어진다.
    대입 시점 의존이 사라지고, 한 번 만진 뒤에는 defaultValue 가 무시된다 —
    "기본값" 의 뜻이 그것이다. ?? 는 null/undefined 에서만 떨어지므로 사용자가
    전부 해제한 빈 배열([])도 defaultValue 에 되살아나지 않는다.
  */

  /**
   * `source` 는 이 변경을 낸 체크박스다. 칩의 × 는 넘기지 않는다.
   */
  #toggle(item: string, source?: HTMLInputElement): void {
    const current = this.#selected;
    const next = current.includes(item)
      ? current.filter((v) => v !== item)
      : [...current, item];

    if (this.#controlled) {
      /*
        **제어 모드에서 체크박스를 되돌린다.** 브라우저가 이미 native input 을
        뒤집어 놓았는데, 소비자가 변경을 거부하면 다음 렌더의 .checked 계산값이
        직전에 커밋한 값과 같아진다. lit-html 은 PropertyPart 를 dirty-check
        하므로 그 쓰기를 통째로 건너뛰고, 체크박스는 영구히 어긋난 채 남는다 —
        이후 어떤 렌더도 고치지 못한다(바인딩 값이 다시는 안 바뀐다).

        ns-table 이 이 문제를 안 겪는 이유는 그쪽 체크박스를 Lit 이 아니라
        React 가 소유해 checked 를 강제로 되돌리기 때문이다.

        소비자 상태를 건드리는 것이 아니다 — 이 컴포넌트가 믿고 있는 값으로
        DOM 을 되돌릴 뿐이라 "제어 중이면 그 값을 바꾸지 않는다" 를 지킨다.
      */
      if (source !== undefined) source.checked = current.includes(item);
    } else {
      this.#innerValue = next;
      this.requestUpdate();
    }

    const detail: NsMultiSelectChangeDetail = { values: next };
    this.dispatchEvent(
      new CustomEvent("ns-multi-select-change", { detail, bubbles: true, composed: true }),
    );
  }

  protected override render() {
    const selected = this.#selected;
    /*
      선택된 것은 **고른 순서로** 칩에 남는다. 검색으로 목록이 좁혀져도 사라지지
      않는다. options 에 없는 값은 그릴 것이 없으므로 조용히 빠진다.
    */
    const chips = selected.flatMap((v) => this.options.filter((o) => o.value === v));

    const q = this.query.trim().toLowerCase();
    const visible =
      q === ""
        ? this.options
        : this.options.filter((o) =>
            [o.label, o.meta ?? ""].some((text) => text.toLowerCase().includes(q)),
          );

    return html`
      ${chips.length === 0
        ? nothing
        : html`
            <div class="ns-multi-select__chips">
              ${repeat(
                chips,
                (o) => o.value,
                (o) => html`
                  <span class="ns-chip">
                    ${o.label}
                    <button
                      class="ns-chip__remove"
                      type="button"
                      aria-label=${`${o.label} 제거`}
                      @click=${() => this.#toggle(o.value)}
                    >
                      ×
                    </button>
                  </span>
                `,
              )}
            </div>
          `}

      <!-- 라벨·hint 는 검색창에 건다 — 이 컴포넌트에서 포커스를 받는 곳이 여기다. -->
      <input
        class="ns-input"
        type="text"
        id=${this.inputId === "" ? nothing : this.inputId}
        aria-describedby=${this.inputDescribedby === "" ? nothing : this.inputDescribedby}
        .value=${this.query}
        placeholder=${this.searchPlaceholder}
        @input=${(e: Event) => {
          this.query = (e.target as HTMLInputElement).value;
        }}
      />

      <div class="ns-multi-select__list">
        ${visible.length === 0
          ? html`<p class="ns-multi-select__empty">${this.emptyMessage}</p>`
          : repeat(
              visible,
              (o) => o.value,
              (o) => html`
                <label class="ns-checkbox">
                  <input
                    type="checkbox"
                    .checked=${selected.includes(o.value)}
                    @change=${(e: Event) => this.#toggle(o.value, e.target as HTMLInputElement)}
                  />
                  <span>${o.label}</span>
                  ${o.meta === undefined
                    ? nothing
                    : html`<span class="ns-checkbox__hint">${o.meta}</span>`}
                </label>
              `,
            )}
      </div>
    `;
  }
}

register("ns-multi-select", NsMultiSelect);

declare global {
  interface HTMLElementTagNameMap {
    "ns-multi-select": NsMultiSelect;
  }
}
```

- [ ] **Step 3: `src/index.ts` 에 등록과 재export 를 더한다**

```ts
import "./components/multi-select/ns-multi-select.js";
```
```ts
export { NsMultiSelect } from "./components/multi-select/ns-multi-select.js";
export type { NsMultiSelectOption } from "./components/multi-select/ns-multi-select.js";
```
타입 재export 목록에 `NsMultiSelectChangeDetail` 을 더한다.

- [ ] **Step 4: `controls.css` 에 스타일을 더한다**

`ns-tabs` 규칙들 다음에 넣는다.

```css
  /*
    ns-multi-select 는 자기 내용을 렌더한다(ns-pagination 과 같다). 안쪽의
    칩·검색·체크박스는 전부 위에서 이미 정의한 .ns-chip · .ns-input · .ns-checkbox
    다 — Light DOM 인 이유가 그것이다.
  */
  ns-multi-select {
    display: flex;
    flex-direction: column;
    gap: var(--ns-space-2);
  }

  .ns-multi-select__chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--ns-space-2);
  }

  /*
    15rem 은 한 곳에만 있고 테마로 변할 이유가 없는 구조적 상수라 리터럴이다.
    참고 구현이 이 값에 이름을 붙였던 것은 CSS Modules 라 재사용 수단이 그것뿐이었기
    때문이지, 토큰이어야 해서가 아니다.
  */
  .ns-multi-select__list {
    max-height: 15rem;
    overflow-y: auto;
    border: 1px solid var(--ns-color-line);
    border-radius: var(--ns-radius-control);
    padding: var(--ns-space-1) var(--ns-space-3);
  }

  .ns-multi-select__empty {
    margin: 0;
    padding: var(--ns-space-3) 0;
    color: var(--ns-color-fg-subtle);
    font-size: var(--ns-font-size-sm);
    line-height: var(--ns-line-height-sm);
  }
```

- [ ] **Step 5: `src/react/elements.ts` 에 래퍼를 더한다**

```ts
/*
  shim 이 필요 없다. options·value 어느 것도 HTML 전역 속성과 충돌하지 않으므로
  평범한 래퍼를 그대로 공개한다 — 그래서 EventName<> 검사가 고전적인 경로로
  동작한다(docs/consumer-example.tsx 가 e.detail 을 직접 읽는다).
*/
export const NsMultiSelect = createComponent({
  react: React,
  tagName: "ns-multi-select",
  elementClass: NsMultiSelectElement,
  events: {
    // EventName<> 브랜딩이 없으면 핸들러가 (e: Event) => void 로 타입된다.
    onNsMultiSelectChange:
      "ns-multi-select-change" as EventName<CustomEvent<NsMultiSelectChangeDetail>>,
  },
});
```

import 두 줄(`NsMultiSelect as NsMultiSelectElement`, 타입 `NsMultiSelectChangeDetail`)을 함께 더한다.

- [ ] **Step 6: `src/react/index.ts` 에서 내보낸다**

첫 줄 목록에 `NsMultiSelect` 를 더하고:

```ts
export type { NsMultiSelectOption } from "../components/multi-select/ns-multi-select.js";
```
타입 재export 목록에 `NsMultiSelectChangeDetail` 을 더한다.

- [ ] **Step 7: `index.html` 에 절을 추가한다**

목차:

```html
      <ns-nav-item href="#ns-multi-select" label="ns-multi-select" badge="MS"></ns-nav-item>
```

`ns-tabs` 절 다음에:

```html
  <h2 id="ns-multi-select">ns-multi-select</h2>
  <p>
    후보가 길 때 쓰는 다중 선택 — 선택 칩 줄 · 검색 · 높이 제한 목록.
    <strong>정렬 순서는 호출부가 <code>options</code> 배열 순서로 정한다.</strong>
  </p>
  <p>
    Light DOM 이다. 안쪽의 칩·검색·체크박스가 전부
    <code>.ns-chip</code>·<code>.ns-input</code>·<code>.ns-checkbox</code> 라
    shadow 였다면 셋을 다시 적어야 했다.
  </p>
  <p>
    <strong><code>options</code> 와 <code>value</code> 는 배열이라 속성으로 쓸 수 없다.</strong>
    순수 HTML 에서도 JS 로 대입한다.
  </p>

  <h3>데모</h3>
  <template class="ex">
    <div class="ns-field">
      <label class="ns-field__label" for="multi-select-demo-search">담당자</label>
      <ns-multi-select
        id="multi-select-demo-el"
        input-id="multi-select-demo-search"
        input-describedby="multi-select-demo-hint"
        search-placeholder="이름으로 검색"
        empty-message="해당하는 사람이 없습니다"
      ></ns-multi-select>
      <span class="ns-field__hint" id="multi-select-demo-hint">부서명으로도 검색됩니다</span>
    </div>
  </template>
  <div class="demo block" id="multi-select-demo" style="max-width:22rem;padding:var(--ns-space-4)"></div>
  <pre></pre>

  <h3>프로퍼티</h3>
  <table>
    <tr><th>이름</th><th>속성</th><th>기본값</th><th>설명</th></tr>
    <tr><td><code>options</code></td><td>없음 (프로퍼티 전용)</td><td><code>[]</code></td><td><code>{ value, label, meta? }[]</code>. 받은 순서를 건드리지 않는다</td></tr>
    <tr><td><code>value</code></td><td>없음 (프로퍼티 전용)</td><td><code>undefined</code></td><td>제어 모드의 선택 집합</td></tr>
    <tr><td><code>defaultValue</code></td><td>없음 (프로퍼티 전용)</td><td><code>[]</code></td><td>비제어 초기 선택</td></tr>
    <tr><td><code>searchPlaceholder</code></td><td><code>search-placeholder</code></td><td><code>"검색"</code></td><td></td></tr>
    <tr><td><code>emptyMessage</code></td><td><code>empty-message</code></td><td><code>"결과가 없습니다"</code></td><td></td></tr>
    <tr><td><code>inputId</code></td><td><code>input-id</code></td><td><code>""</code></td><td>검색 input 의 <code>id</code>. <code>.ns-field__label</code> 의 <code>for</code> 가 가리킬 곳</td></tr>
    <tr><td><code>inputDescribedby</code></td><td><code>input-describedby</code></td><td><code>""</code></td><td>검색 input 의 <code>aria-describedby</code></td></tr>
  </table>

  <h3>클래스</h3>
  <table>
    <tr><th>클래스</th><th>설명</th></tr>
    <tr><td><code>.ns-multi-select__chips</code></td><td>선택 칩 줄. 선택이 있을 때만 렌더된다</td></tr>
    <tr><td><code>.ns-multi-select__list</code></td><td>높이 제한 목록. <code>max-height: 15rem</code></td></tr>
    <tr><td><code>.ns-multi-select__empty</code></td><td>검색 결과가 없을 때</td></tr>
  </table>
  <p>셋 다 이 컴포넌트가 렌더한다 — 소비자가 쓰는 이름이 아니라 덮어쓸 때 쓰는 이름이다.</p>

  <h3>이벤트</h3>
  <table>
    <tr><th>이름</th><th>detail</th><th>React 프롭</th></tr>
    <tr><td><code>ns-multi-select-change</code></td><td><code>{ values }</code> — <strong>요청되는 다음 전체 집합</strong></td><td><code>onNsMultiSelectChange</code></td></tr>
  </table>

  <h3>HTML</h3>
  <script type="text/plain">
    <ns-multi-select id="owners" input-id="owners-search" search-placeholder="이름으로 검색">
    </ns-multi-select>
  </script>

  <h3>배선</h3>
  <script type="text/plain">
    const el = document.getElementById("owners");
    el.options = [
      { value: "kim", label: "김담당", meta: "플랫폼개발팀" },
      { value: "park", label: "박승인", meta: "마케팅팀" },
    ];
    el.defaultValue = ["kim"];
    el.addEventListener("ns-multi-select-change", (e) => save(e.detail.values));
  </script>

  <h3>React</h3>
  <script type="text/plain">
    import { NsMultiSelect } from "@neosimplix/common-ui/react";

    const [owners, setOwners] = useState<string[]>(["kim"]);

    <NsMultiSelect
      options={OWNERS}
      value={owners}
      onNsMultiSelectChange={(e) => setOwners(e.detail.values)}
      searchPlaceholder="이름으로 검색"
    />
  </script>

  <h3>주의</h3>
  <ul>
    <li><code>&lt;ns-multi-select value="…"&gt;</code> 같은 속성은 <strong>무시된다.</strong> 콘솔이 경고한다.</li>
    <li><code>id</code> 를 안쪽 input 에 옮기지 않는다. <code>input-id</code> 를 따로 받는 이유가 그것이다 — 옮기면 문서에 같은 <code>id</code> 가 둘 생긴다.</li>
    <li>검색은 <code>label</code> 과 <code>meta</code> 둘 다에 걸린다. 화면에 보이는 문자열만 검색어가 된다.</li>
  </ul>
```

- [ ] **Step 8: `index.html` 데모 배선을 더한다**

```js
  /*
    다중 선택 데모. 비제어로 둔다 — options 와 defaultValue 만 넣으면
    선택 상태는 컴포넌트가 갖는다.
  */
  const multiSelectDemo = document.querySelector("#multi-select-demo ns-multi-select");
  multiSelectDemo.options = [
    { value: "kim", label: "김담당", meta: "플랫폼개발팀" },
    { value: "park", label: "박승인", meta: "마케팅팀" },
    { value: "choi", label: "최데이터", meta: "데이터분석팀" },
    { value: "han", label: "한지우", meta: "경영지원팀" },
    { value: "jung", label: "정하늘", meta: "세일즈팀" },
  ];
  multiSelectDemo.defaultValue = ["kim", "park"];
```

`<template class="ex">` 안의 `id="multi-select-demo-el"` 는 복제되면 데모 안에 그대로 들어간다. **`getElementById` 로 찾지 않는다** — `<template>` 안의 원본과 복제본이 같은 `id` 를 갖게 되므로 위처럼 데모 컨테이너 안에서 찾는다.

- [ ] **Step 9: 검사를 실패시켜 본다**

`src/react/elements.ts` 의 `onNsMultiSelectChange` 줄을 잠시 주석 처리한다.

Run: `node scripts/check-events.mjs`
Expected: FAIL — `ns-multi-select-change` 가 React 매핑에 없다. 확인 후 되돌린다.

- [ ] **Step 10: `docs/consumer-example.tsx` 에 핸들러를 붙인다**

import 목록에 `NsMultiSelect` 를 더하고, 상태와 사용을 넣는다.

```tsx
  const [owners, setOwners] = useState<string[]>(["kim"]);
```

```tsx
            {/* e.detail 을 실제로 읽어 ns-multi-select-change 의 detail 타입이 검사되게 한다. */}
            <NsMultiSelect
              options={[
                { value: "kim", label: "김담당", meta: "플랫폼개발팀" },
                { value: "park", label: "박승인", meta: "마케팅팀" },
              ]}
              value={owners}
              onNsMultiSelectChange={(e) => setOwners(e.detail.values)}
              searchPlaceholder="이름으로 검색"
            />
```

- [ ] **Step 11: 검증**

Run:
```sh
npm run check
node scripts/check-controls.mjs
grep -c '<script>' index.html
grep -n 'document.addEventListener' index.html
grep -oE '(^|[[:space:]])id="[^"]*"' index.html | sed -E 's/.*id="([^"]*)"/\1/' | sort | uniq -d
npm run build && grep -c "ns-multi-select" dist/bundle.umd.js
```
Expected: 검사 둘 통과, `1`, 출력 없음, 출력 없음, 1 이상.

**`id` 중복 검사가 특히 중요하다** — `<template class="ex">` 안의 `id` 는 복제되어 문서에 두 번 나타나지 않지만(템플릿 내용은 별도 문서 조각이다), `grep` 은 원본 텍스트를 보므로 데모 컨테이너 `id` 와 템플릿 안 `id` 가 겹치면 잡힌다. 위 `multi-select-demo` 와 `multi-select-demo-el` 은 서로 다르다.

- [ ] **Step 12: 커밋**

```sh
git add src/components/multi-select src/types.ts src/index.ts src/controls/controls.css src/react/elements.ts src/react/index.ts index.html docs/consumer-example.tsx
git commit -m "feat(multi-select): 칩·검색·목록을 갖춘 ns-multi-select 추가"
```

---

## Task 8: `ns-toast` 와 `nsToast`

**Files:**
- Create: `src/components/toast/ns-toast.ts` · `src/components/toast/ns-toast.styles.ts` · `src/components/toast/toast.ts`
- Modify: `src/index.ts` · `src/react/index.ts` · `index.html`
- Modify: `docs/consumer-example.tsx`

**Interfaces:**
- Consumes: `ns-icon` 의 `close` 아이콘(스프라이트 기본 셋에 있다).
- Produces:
  - `type NsToastTone = "neutral" | "success" | "danger" | "warn"`
  - `interface NsToastOptions { tone?: NsToastTone; duration?: number }`
  - `function nsToast(message: string, options?: NsToastOptions): () => void`
  - `class NsToast extends LitElement` — `show(message, tone, duration): () => void`, `dismiss(key: number): void`
- 이벤트를 내지 않는다. `src/types.ts` 와 `src/react/elements.ts` 는 건드리지 않는다.

- [ ] **Step 1: shadow 스타일을 만든다**

Create `src/components/toast/ns-toast.styles.ts`:

```ts
import { css } from "lit";

/*
  shadow 스타일이다. controls.css 는 shadow 안에 도달하지 않으므로 닫기 버튼
  스타일을 최소한만 다시 적는다 — ns-dialog 가 수용한 것과 같은 중복이다.

  :host 에 border·margin·padding 을 두지 않는다(Tailwind preflight 가 지운다).
  position·inset 은 preflight 가 건드리지 않으므로 여기 둔다.
*/
export const styles = css`
  :host {
    position: fixed;
    right: var(--ns-space-4);
    bottom: var(--ns-space-4);
    z-index: 1000;
    display: block;
    /* 토스트가 없는 동안 화면 오른쪽 아래 클릭을 가로채지 않는다. */
    pointer-events: none;
  }

  .region {
    display: flex;
    flex-direction: column;
    gap: var(--ns-space-2);
    /* 좁은 화면에서 화면 밖으로 나가지 않게 한다. */
    max-width: min(24rem, calc(100vw - var(--ns-space-8)));
  }

  .toast {
    display: flex;
    align-items: flex-start;
    gap: var(--ns-space-3);
    padding: var(--ns-space-3) var(--ns-space-4);
    border: 1px solid var(--ns-color-line);
    border-radius: var(--ns-radius-panel);
    background: var(--ns-color-surface);
    box-shadow: var(--ns-elevation-card);
    font-size: var(--ns-font-size-sm);
    line-height: var(--ns-line-height-sm);
    color: var(--ns-color-fg-body);
    /* :host 가 pointer-events 를 껐으므로 항목에서만 되살린다. */
    pointer-events: auto;
  }

  /* tone 은 왼쪽 색 띠 하나로만 표현한다. 배경을 칠하면 글자 대비를 다시 정해야 한다. */
  .toast.success { border-left: 3px solid var(--ns-color-success); }
  .toast.danger  { border-left: 3px solid var(--ns-color-danger); }
  .toast.warn    { border-left: 3px solid var(--ns-color-warn); }

  .message {
    flex: 1;
    min-width: 0;
    /* 긴 메시지가 한 줄로 넘치지 않게 한다. */
    overflow-wrap: anywhere;
  }

  .close {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--ns-space-1);
    border: 0;
    border-radius: var(--ns-radius-control);
    background: none;
    color: var(--ns-color-fg-muted);
    cursor: pointer;
  }

  .close:hover {
    background: var(--ns-color-surface-hover);
    color: var(--ns-color-fg);
  }

  .close:focus-visible {
    outline: 2px solid var(--ns-color-accent);
    outline-offset: 2px;
  }

  /* 애니메이션을 끄는 사용자를 위한 것. 지금은 전이가 없지만 규약을 남겨 둔다. */
  @media (prefers-reduced-motion: reduce) {
    .toast { transition: none; }
  }
`;
```

- [ ] **Step 2: 리전 엘리먼트를 만든다**

Create `src/components/toast/ns-toast.ts`:

```ts
import { LitElement, html, nothing } from "lit";
import { state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

import { register } from "../../internal/register.js";
import { warnIfTokensMissing } from "../../internal/warn-missing-tokens.js";
import { styles } from "./ns-toast.styles.js";

// 닫기 버튼이 <ns-icon> 을 쓴다. 등록 부수효과가 필요하다.
import "../icon/ns-icon.js";

export type NsToastTone = "neutral" | "success" | "danger" | "warn";

interface ToastItem {
  key: number;
  message: string;
  tone: NsToastTone;
  /** 0 이면 자동으로 사라지지 않는다. */
  duration: number;
  /** 남은 시간. hover·포커스로 멈출 때마다 줄어든다. */
  remaining: number;
  /** 지금 타이머가 시작된 시각. */
  startedAt: number;
  timer?: number;
}

/**
 * 토스트 리전. **문서당 하나다** — `nsToast()` 가 만들어 `document.body` 에 붙이고
 * 이미 있으면 재사용한다.
 *
 * shadow 인 이유: 페이지 위에 겹쳐 뜨므로 소비자 CSS 와 격리돼야 한다. Light DOM
 * 이면 소비자의 `div { … }` 한 줄이 토스트를 무너뜨릴 수 있다.
 *
 * **직접 마크업에 쓰는 태그가 아니다.** 프로퍼티도 슬롯도 없다.
 */
export class NsToast extends LitElement {
  static override styles = styles;

  @state() private items: ToastItem[] = [];

  #nextKey = 0;
  #paused = false;

  override connectedCallback(): void {
    super.connectedCallback();
    warnIfTokensMissing();
  }

  override disconnectedCallback(): void {
    for (const item of this.items) {
      if (item.timer !== undefined) clearTimeout(item.timer);
    }
    super.disconnectedCallback();
  }

  /** 토스트 하나를 띄운다. 돌려주는 함수를 부르면 즉시 닫는다(두 번 불러도 안전). */
  show(message: string, tone: NsToastTone, duration: number): () => void {
    const key = this.#nextKey++;
    this.items = [
      ...this.items,
      { key, message, tone, duration, remaining: duration, startedAt: Date.now() },
    ];
    // 멈춰 있는 동안 새로 뜬 것은 재개될 때 함께 시작된다.
    if (duration > 0 && !this.#paused) this.#start(key);
    return () => this.dismiss(key);
  }

  /** 이미 사라진 키를 줘도 아무 일도 하지 않는다. */
  dismiss(key: number): void {
    const item = this.items.find((i) => i.key === key);
    if (item === undefined) return;
    if (item.timer !== undefined) clearTimeout(item.timer);
    this.items = this.items.filter((i) => i.key !== key);
  }

  #start(key: number): void {
    const item = this.items.find((i) => i.key === key);
    if (item === undefined || item.duration <= 0) return;
    item.startedAt = Date.now();
    item.timer = window.setTimeout(() => this.dismiss(key), item.remaining);
  }

  /*
    마우스가 올라가 있거나 안쪽에 포커스가 있는 동안 자동 소멸을 멈춘다.
    안 멈추면 읽는 중에, 혹은 닫기 버튼에 Tab 으로 닿는 중에 사라진다.

    items 배열을 갈아 끼우지 않고 항목을 직접 고친다 — 화면에 보이는 것이 하나도
    바뀌지 않으므로 리렌더할 이유가 없다.
  */
  #pause = (): void => {
    if (this.#paused) return;
    this.#paused = true;
    for (const item of this.items) {
      if (item.timer === undefined) continue;
      clearTimeout(item.timer);
      item.timer = undefined;
      item.remaining = Math.max(0, item.remaining - (Date.now() - item.startedAt));
    }
  };

  #resume = (): void => {
    if (!this.#paused) return;
    this.#paused = false;
    for (const item of this.items) if (item.duration > 0) this.#start(item.key);
  };

  protected override render() {
    /*
      리전은 aria-live="polite" 다. danger 항목만 role="alert" 로 즉시 읽게 한다 —
      중첩된 live region 은 안쪽이 자기 부분집합에 대해 이긴다.
    */
    return html`
      <div
        class="region"
        aria-live="polite"
        @mouseenter=${this.#pause}
        @mouseleave=${this.#resume}
        @focusin=${this.#pause}
        @focusout=${this.#resume}
      >
        ${repeat(
          this.items,
          (item) => item.key,
          (item) => html`
            <div class="toast ${item.tone}" role=${item.tone === "danger" ? "alert" : nothing}>
              <span class="message">${item.message}</span>
              <button
                class="close"
                type="button"
                aria-label="닫기"
                @click=${() => this.dismiss(item.key)}
              >
                <ns-icon name="close"></ns-icon>
              </button>
            </div>
          `,
        )}
      </div>
    `;
  }
}

register("ns-toast", NsToast);

declare global {
  interface HTMLElementTagNameMap {
    "ns-toast": NsToast;
  }
}
```

- [ ] **Step 3: 명령형 파사드를 만든다**

Create `src/components/toast/toast.ts`:

```ts
import type { NsToast, NsToastTone } from "./ns-toast.js";

// 등록 부수효과. document.createElement("ns-toast") 가 업그레이드된 요소를 주려면 필요하다.
import "./ns-toast.js";

export interface NsToastOptions {
  tone?: NsToastTone;
  /** 밀리초. **`0` 이면 자동으로 사라지지 않는다** — 닫기 버튼이나 반환값으로만 닫힌다. */
  duration?: number;
}

/*
  문서당 리전 하나. **모듈 평가 시점에 만들지 않는다** — SSR 에서 document 가 없다.
  register() 가 customElements.define 을 미루는 것과 같은 이유다.
*/
function region(): NsToast {
  const found = document.querySelector("ns-toast");
  if (found !== null) return found;
  const el = document.createElement("ns-toast");
  document.body.append(el);
  return el;
}

/**
 * 토스트를 띄운다. **돌려주는 함수를 부르면 즉시 닫힌다**(두 번 불러도 안전).
 *
 * ```ts
 * nsToast("저장했습니다", { tone: "success" });
 * const close = nsToast("업로드 중…", { duration: 0 });
 * // …끝나면
 * close();
 * ```
 *
 * 문자열만 받는다. `textContent` 로 넣으므로 HTML 주입 경로가 없다.
 *
 * 서버에서 부르면 아무 일도 하지 않고 no-op 를 돌려준다 — 이벤트 핸들러에서만
 * 부르는 것이 정상이지만, 그 실수가 SSR 을 통째로 깨뜨리게 두지 않는다.
 */
export function nsToast(message: string, options: NsToastOptions = {}): () => void {
  if (typeof document === "undefined") return () => {};
  const { tone = "neutral", duration = 4000 } = options;
  return region().show(message, tone, duration);
}
```

- [ ] **Step 4: `src/index.ts` 에서 내보낸다**

```ts
import "./components/toast/ns-toast.js";
```
```ts
export { NsToast } from "./components/toast/ns-toast.js";
export type { NsToastTone } from "./components/toast/ns-toast.js";
export { nsToast } from "./components/toast/toast.js";
export type { NsToastOptions } from "./components/toast/toast.js";
```

- [ ] **Step 5: `src/react/index.ts` 에서 내보낸다**

```ts
/*
  명령형 API 다. React 컴포넌트가 아니라 함수라 래퍼가 필요 없다 — 이벤트
  핸들러에서 그대로 부른다. 이 파일에는 'use client' 배너가 붙으므로 서버
  컴포넌트에서 import 하면 빌드가 막는다.
*/
export { nsToast } from "../components/toast/toast.js";
export type { NsToastOptions } from "../components/toast/toast.js";
export type { NsToastTone } from "../components/toast/ns-toast.js";
```

- [ ] **Step 6: `index.html` 에 절을 추가한다**

목차:

```html
      <ns-nav-item href="#overlays" label="toast · alert · confirm" badge="OV"></ns-nav-item>
```

`ns-multi-select` 절 다음에 넣는다. **Task 9 가 이 절에 alert/confirm 을 더한다.**

```html
  <h2 id="overlays">toast · alert · confirm</h2>
  <p>
    셋 다 <strong>함수로 부르는 명령형 API</strong> 다. 이 라이브러리의 다른 것들은
    "상태는 소비자가 갖고 컴포넌트는 이벤트만 올린다" 로 일관돼 있는데,
    <strong>이 셋은 그 규약의 의도된 예외다</strong> — 호출 지점에서 답이 필요한
    것들이라 선언형으로 만들면 쓰는 쪽이 <code>useState</code> 와 렌더 분기를 매번
    다시 쓰게 된다.
  </p>
  <p>
    셋 다 <strong>문자열만 받는다.</strong> <code>textContent</code> 로 넣으므로 HTML
    주입 경로가 없고, 순수 HTML 과 React 에서 쓰는 법이 같다. 폼이 들어가는 모달은
    이 API 로 만들지 않고 <code>ns-dialog</code> 로 직접 만든다.
  </p>
  <p>
    이름이 <code>alert</code>/<code>confirm</code> 이 아닌 이유는
    <code>import { confirm }</code> 이 그 모듈 안에서 전역 <code>confirm</code> 을
    가리기 때문이다.
  </p>

  <h3 id="overlays-toast">nsToast</h3>
  <p>
    우하단에 쌓인다. <strong>마우스가 올라가 있거나 안쪽에 포커스가 있는 동안 자동
    소멸이 멈춘다</strong> — 안 멈추면 읽는 중에, 혹은 닫기 버튼에 Tab 으로 닿는
    중에 사라진다.
  </p>
  <div class="demo block" id="toast-demo" style="display:flex;flex-wrap:wrap;gap:var(--ns-space-3);padding:var(--ns-space-4)">
    <button class="ns-button ns-button--outline ns-button--sm" id="toast-demo-neutral">기본</button>
    <button class="ns-button ns-button--outline ns-button--sm" id="toast-demo-success">success</button>
    <button class="ns-button ns-button--outline ns-button--sm" id="toast-demo-danger">danger</button>
    <button class="ns-button ns-button--outline ns-button--sm" id="toast-demo-warn">warn</button>
    <button class="ns-button ns-button--outline ns-button--sm" id="toast-demo-sticky">duration=0 (안 사라짐)</button>
  </div>

  <h4>인자</h4>
  <table>
    <tr><th>이름</th><th>기본값</th><th>설명</th></tr>
    <tr><td><code>message</code></td><td>—</td><td>문자열만. <code>textContent</code> 로 들어간다</td></tr>
    <tr><td><code>options.tone</code></td><td><code>"neutral"</code></td><td><code>"neutral"</code> · <code>"success"</code> · <code>"danger"</code> · <code>"warn"</code>. 왼쪽 색 띠로만 표현한다</td></tr>
    <tr><td><code>options.duration</code></td><td><code>4000</code></td><td>밀리초. <strong><code>0</code> 이면 자동으로 사라지지 않는다</strong></td></tr>
  </table>
  <p>돌려주는 함수를 부르면 즉시 닫힌다. 두 번 불러도 안전하다.</p>

  <h4>JS</h4>
  <script type="text/plain">
    import { nsToast } from "@neosimplix/common-ui";

    nsToast("저장했습니다", { tone: "success" });

    const close = nsToast("업로드 중…", { duration: 0 });
    // …끝나면
    close();
  </script>

  <h4>주의</h4>
  <ul>
    <li><code>&lt;ns-toast&gt;</code> 를 직접 마크업에 쓰지 않는다. <code>nsToast()</code> 가 문서당 하나를 만들어 <code>body</code> 에 붙인다.</li>
    <li><code>danger</code> 만 <code>role="alert"</code> 로 즉시 읽힌다. 나머지는 리전의 <code>aria-live="polite"</code> 를 탄다.</li>
    <li>서버에서 부르면 아무 일도 하지 않는다 — 이벤트 핸들러에서만 부른다.</li>
  </ul>
```

- [ ] **Step 7: `index.html` 데모 배선을 더한다**

`<script>` 블록 안에 넣는다. UMD 번들의 전역 이름은 `index.html` 의 `<script src="./dist/bundle.umd.js">` 가 노출하는 것을 그대로 쓴다 — 파일 상단의 다른 배선이 쓰는 이름과 같은 방식으로 참조한다.

```js
  /*
    토스트 데모. 데모 컨테이너의 버튼에만 리스너를 붙인다 — 이 절은 이벤트를
    쓰지 않지만 규약은 같다.
  */
  const toastDemo = document.getElementById("toast-demo");
  const toastTones = { neutral: "저장했습니다", success: "승인했습니다", danger: "삭제하지 못했습니다", warn: "일부만 반영됐습니다" };
  for (const tone of Object.keys(toastTones)) {
    toastDemo.querySelector(`#toast-demo-${tone}`).addEventListener("click", () => {
      NsCommonUi.nsToast(toastTones[tone], { tone });
    });
  }
  toastDemo.querySelector("#toast-demo-sticky").addEventListener("click", () => {
    NsCommonUi.nsToast("직접 닫아야 사라진다", { duration: 0 });
  });
```

전역 이름 `NsCommonUi` 는 `vite.config.ts:77` 의 UMD `name` 값이다(대문자 `I` 가 아니다). 그 파일이 바뀌었으면 실제 값으로 맞춘다.

- [ ] **Step 8: `docs/consumer-example.tsx` 에서 부른다**

import 목록에 `nsToast` 를 더하고, 기존 버튼 하나의 핸들러에서 부른다.

```tsx
            <Button size="sm" onClick={() => nsToast("저장했습니다", { tone: "success" })}>
              저장
            </Button>
```

- [ ] **Step 9: 검증**

Run:
```sh
npm run check
node scripts/check-controls.mjs
grep -c '<script>' index.html
grep -n 'document.addEventListener' index.html
grep -oE '(^|[[:space:]])id="[^"]*"' index.html | sed -E 's/.*id="([^"]*)"/\1/' | sort | uniq -d
npm run build && grep -c "ns-toast" dist/bundle.umd.js
```
Expected: 검사 둘 통과, `1`, 출력 없음, 출력 없음, 1 이상.

- [ ] **Step 10: 커밋**

```sh
git add src/components/toast src/index.ts src/react/index.ts index.html docs/consumer-example.tsx
git commit -m "feat(toast): 명령형 nsToast 와 shadow 리전 추가"
```

---

## Task 9: `nsAlert` · `nsConfirm`

**Files:**
- Create: `src/components/dialog/confirm.ts`
- Modify: `src/index.ts` · `src/react/index.ts` · `index.html` · `docs/consumer-example.tsx`

**Interfaces:**
- Consumes: `NsDialog`(`heading` 프로퍼티, `show()`, `footer` slot, `ns-dialog-close` 이벤트), `.ns-button` · `.ns-button--outline` · `.ns-button--sm` · `.ns-button--danger`(Task 1).
- Produces:
  - `interface NsAlertOptions { heading?: string; message: string; confirmLabel?: string }`
  - `interface NsConfirmOptions extends NsAlertOptions { cancelLabel?: string; tone?: "default" | "danger" }`
  - `function nsAlert(options: NsAlertOptions): Promise<void>`
  - `function nsConfirm(options: NsConfirmOptions): Promise<boolean>`

- [ ] **Step 1: 파일을 만든다**

Create `src/components/dialog/confirm.ts`:

```ts
// 등록 부수효과. document.createElement("ns-dialog") 가 업그레이드된 요소를 주려면 필요하다.
import "./ns-dialog.js";

export interface NsAlertOptions {
  /** 대화상자 제목. 비우면 제목 줄 없이 본문만 나온다. */
  heading?: string;
  /** 본문. 문자열만 받는다 — textContent 로 들어가므로 HTML 주입 경로가 없다. */
  message: string;
  confirmLabel?: string;
}

export interface NsConfirmOptions extends NsAlertOptions {
  cancelLabel?: string;
  /**
   * `"danger"` 면 확인 버튼이 `.ns-button--danger` 이고 **취소에 초기 포커스가 간다.**
   * 네이티브 `<dialog>` 의 초기 포커스가 파괴적 동작에 놓이면 Enter 한 번에 지워진다.
   */
  tone?: "default" | "danger";
}

/**
 * 대화상자를 만들어 띄우고, 닫힐 때 resolve 한다.
 *
 * 비제어로 쓴다 — 이 대화상자는 소비자가 상태를 갖지 않는 것이 목적이므로
 * `show()`/네이티브 닫힘 경로가 맞다.
 */
function open(
  options: NsConfirmOptions,
  withCancel: boolean,
  resolve: (ok: boolean) => void,
): void {
  const el = document.createElement("ns-dialog");
  el.heading = options.heading ?? "";

  const body = document.createElement("p");
  body.textContent = options.message;
  /*
    ns-dialog 의 .body 가 이미 패딩을 주므로 <p> 의 UA 여백은 군더더기다.
    클래스를 만들지 않는 이유: 이 <p> 는 이 함수만 만들고 소비자가 손댈 수 없어서,
    controls.css 에 이름을 하나 더 늘릴 근거가 없다.
  */
  body.style.margin = "0";
  el.append(body);

  /* 닫힘 경로가 여럿이라(확인·취소·ESC·백드롭·닫기 버튼) 정리를 한 곳에 모은다. */
  let settled = false;
  const finish = (ok: boolean): void => {
    if (settled) return;
    settled = true;
    el.remove();
    resolve(ok);
  };

  const confirm = document.createElement("button");
  confirm.type = "button";
  confirm.className =
    options.tone === "danger"
      ? "ns-button ns-button--danger ns-button--sm"
      : "ns-button ns-button--solid ns-button--sm";
  confirm.textContent = options.confirmLabel ?? "확인";
  confirm.addEventListener("click", () => finish(true));

  const footer = document.createElement("div");
  footer.slot = "footer";

  if (withCancel) {
    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "ns-button ns-button--outline ns-button--sm";
    cancel.textContent = options.cancelLabel ?? "취소";
    cancel.addEventListener("click", () => finish(false));
    // 파괴적 확인에서는 초기 포커스가 취소에 간다.
    if (options.tone === "danger") cancel.autofocus = true;
    footer.append(cancel);
  }

  footer.append(confirm);
  el.append(footer);

  /* ESC · 백드롭 · 닫기 버튼. alert 은 이 경로도 resolve 다. */
  el.addEventListener("ns-dialog-close", () => finish(false));

  document.body.append(el);
  el.show();
}

/**
 * 알린다. 확인 · ESC · 백드롭 · 닫기 버튼 어느 쪽으로 닫혀도 resolve 한다.
 *
 * ```ts
 * await nsAlert({ heading: "권한 없음", message: "관리자에게 문의하세요." });
 * ```
 *
 * 서버에서 부르면 즉시 resolve 한다 — 이벤트 핸들러에서만 부르는 것이 정상이지만,
 * 그 실수가 SSR 을 통째로 깨뜨리게 두지 않는다.
 */
export function nsAlert(options: NsAlertOptions): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  return new Promise((resolve) => {
    open(options, false, () => resolve());
  });
}

/**
 * 묻는다. 확인이면 `true`, **취소 · ESC · 백드롭 · 닫기 버튼은 `false`** 다.
 *
 * ```ts
 * if (await nsConfirm({ heading: "삭제", message: "되돌릴 수 없습니다.", tone: "danger" })) {
 *   await remove();
 * }
 * ```
 *
 * 여러 번 부르면 네이티브 top layer 에 쌓인다 — 별도 큐를 두지 않는다.
 *
 * 서버에서 부르면 즉시 `false` 다.
 */
export function nsConfirm(options: NsConfirmOptions): Promise<boolean> {
  if (typeof document === "undefined") return Promise.resolve(false);
  return new Promise((resolve) => {
    open(options, true, resolve);
  });
}
```

- [ ] **Step 2: `src/index.ts` 에서 내보낸다**

```ts
export { nsAlert, nsConfirm } from "./components/dialog/confirm.js";
export type { NsAlertOptions, NsConfirmOptions } from "./components/dialog/confirm.js";
```

`ns-dialog.js` 는 이미 import 되어 있으므로 등록 import 를 더하지 않는다.

- [ ] **Step 3: `src/react/index.ts` 에서 내보낸다**

```ts
export { nsAlert, nsConfirm } from "../components/dialog/confirm.js";
export type { NsAlertOptions, NsConfirmOptions } from "../components/dialog/confirm.js";
```

- [ ] **Step 4: `index.html` 의 `#overlays` 절에 하위 절을 더한다**

`nsToast` 하위 절 다음에 넣는다.

```html
  <h3 id="overlays-alert">nsAlert · nsConfirm</h3>
  <p>
    <code>ns-dialog</code> 를 새로 만들어 <code>body</code> 에 붙이고 Promise 를
    돌려준다. 닫히면 요소를 지운다 — 남기면 호출 횟수만큼 대화상자가 문서에 쌓인다.
  </p>
  <p>
    버튼은 <code>.ns-button</code> 이다. <strong><code>controls.css</code> 를 요구하는
    것이 새 요구사항은 아니다</strong> — <code>ns-pagination</code> 이 이미 light DOM 에
    <code>.ns-button</code> 을 렌더한다.
  </p>
  <div class="demo block" id="confirm-demo" style="display:flex;flex-wrap:wrap;gap:var(--ns-space-3);padding:var(--ns-space-4)">
    <button class="ns-button ns-button--outline ns-button--sm" id="confirm-demo-alert">nsAlert</button>
    <button class="ns-button ns-button--outline ns-button--sm" id="confirm-demo-confirm">nsConfirm</button>
    <button class="ns-button ns-button--outline ns-button--sm" id="confirm-demo-danger">nsConfirm (danger)</button>
    <span id="confirm-demo-log">—</span>
  </div>

  <h4>인자</h4>
  <table>
    <tr><th>이름</th><th>기본값</th><th>설명</th></tr>
    <tr><td><code>heading</code></td><td><code>""</code></td><td>제목. 비우면 제목 줄이 없다</td></tr>
    <tr><td><code>message</code></td><td>—</td><td>본문. 문자열만</td></tr>
    <tr><td><code>confirmLabel</code></td><td><code>"확인"</code></td><td></td></tr>
    <tr><td><code>cancelLabel</code></td><td><code>"취소"</code></td><td><code>nsConfirm</code> 만</td></tr>
    <tr><td><code>tone</code></td><td><code>"default"</code></td><td><code>"danger"</code> 면 확인이 <code>.ns-button--danger</code> 이고 <strong>취소에 초기 포커스</strong>. <code>nsConfirm</code> 만</td></tr>
  </table>

  <h4>닫히는 경로</h4>
  <table>
    <tr><th>경로</th><th><code>nsAlert</code></th><th><code>nsConfirm</code></th></tr>
    <tr><td>확인 버튼</td><td>resolve</td><td><code>true</code></td></tr>
    <tr><td>취소 버튼</td><td>—</td><td><code>false</code></td></tr>
    <tr><td>ESC · 백드롭 · 닫기 버튼</td><td>resolve</td><td><code>false</code></td></tr>
  </table>

  <h4>JS</h4>
  <script type="text/plain">
    import { nsAlert, nsConfirm } from "@neosimplix/common-ui";

    await nsAlert({ heading: "권한 없음", message: "관리자에게 문의하세요." });

    if (await nsConfirm({ heading: "삭제", message: "되돌릴 수 없습니다.", tone: "danger" })) {
      await remove();
    }
  </script>

  <h4>주의</h4>
  <ul>
    <li><strong>폼이 들어가는 모달은 이 API 로 만들지 않는다.</strong> 문자열만 받는다 — <code>ns-dialog</code> 로 직접 만든다.</li>
    <li>여러 번 부르면 네이티브 top layer 에 쌓인다. 큐를 두지 않는다.</li>
    <li><code>tone: "danger"</code> 를 파괴적 확인에 반드시 쓴다. 초기 포커스가 취소로 가는 것이 그 신호다.</li>
  </ul>
```

- [ ] **Step 5: `index.html` 데모 배선을 더한다**

```js
  /* alert/confirm 데모. 결과를 옆에 적어 어느 경로로 닫혔는지 보이게 한다. */
  const confirmDemo = document.getElementById("confirm-demo");
  const confirmLog = confirmDemo.querySelector("#confirm-demo-log");
  confirmDemo.querySelector("#confirm-demo-alert").addEventListener("click", async () => {
    await NsCommonUi.nsAlert({ heading: "권한 없음", message: "관리자에게 문의하세요." });
    confirmLog.textContent = "alert 닫힘";
  });
  confirmDemo.querySelector("#confirm-demo-confirm").addEventListener("click", async () => {
    const ok = await NsCommonUi.nsConfirm({ heading: "저장", message: "변경 사항을 저장할까요?" });
    confirmLog.textContent = `confirm → ${ok}`;
  });
  confirmDemo.querySelector("#confirm-demo-danger").addEventListener("click", async () => {
    const ok = await NsCommonUi.nsConfirm({
      heading: "삭제",
      message: "되돌릴 수 없습니다.",
      confirmLabel: "삭제",
      tone: "danger",
    });
    confirmLog.textContent = `danger confirm → ${ok}`;
  });
```

**Task 8 Step 7 에서 확인한 UMD 전역 이름을 그대로 쓴다.**

- [ ] **Step 6: `docs/consumer-example.tsx` 에서 부른다**

import 목록에 `nsConfirm` 을 더하고, Task 1 에서 넣은 `danger` 버튼의 핸들러를 바꾼다.

```tsx
            <Button
              variant="danger"
              size="sm"
              onClick={async () => {
                if (await nsConfirm({ heading: "삭제", message: "되돌릴 수 없습니다.", tone: "danger" })) {
                  log("deleted");
                }
              }}
            >
              삭제
            </Button>
```

- [ ] **Step 7: 검증**

Run:
```sh
npm run check
node scripts/check-controls.mjs
grep -c '<script>' index.html
grep -n 'document.addEventListener' index.html
grep -oE '(^|[[:space:]])id="[^"]*"' index.html | sed -E 's/.*id="([^"]*)"/\1/' | sort | uniq -d
npm run build
```
Expected: 검사 둘 통과, `1`, 출력 없음, 출력 없음, 빌드 성공.

- [ ] **Step 8: 커밋**

```sh
git add src/components/dialog/confirm.ts src/index.ts src/react/index.ts index.html docs/consumer-example.tsx
git commit -m "feat(dialog): Promise 를 돌려주는 nsAlert·nsConfirm 추가"
```

---

## Task 10: 문서 갱신과 최종 검증

**Files:**
- Modify: `docs/project-structure.md` · `docs/gotchas.md` · `.claude/skills/releasing/SKILL.md`

**Interfaces:**
- Consumes: Task 1~9 의 모든 결과물.

- [ ] **Step 1: `releasing` 스킬의 export 목록을 갱신한다**

`.claude/skills/releasing/SKILL.md` 의 "콜드 설치가 되는가" 절에 기대 출력이 한 줄로 적혀 있다(`NsDialog, NsHeader, … NsTable`). **이 스모크 테스트가 이 저장소에서 SSR 안전성을 증명하는 유일한 자동 검사이므로, 여기를 고치지 않으면 새 컴포넌트의 등록 경로가 그 검사 밖에 남는다.**

목록을 손으로 추측하지 않는다. 실제 출력을 뽑아 그대로 붙여 넣는다.

Run:
```sh
npm run build && node --input-type=module -e "import('./dist/index.js').then(m=>console.log(Object.keys(m).sort().join(', ')))"
```

`NsMultiSelect` · `NsTabs` · `NsToast` · `nsAlert` · `nsConfirm` · `nsToast` · `tabIdFor` 가 포함돼 있어야 한다. 출력에 `registerIcons` · `svg` 도 있는데 지금 문서 줄에는 빠져 있다 — **그 누락도 이번에 함께 고친다.** 출력 전체를 기대값으로 적는다.

- [ ] **Step 2: `docs/project-structure.md` 의 태그 표를 갱신한다**

"무엇을 제공하나" 의 태그 표에 세 줄을 더한다.

```markdown
| `ns-tabs` | 소비자가 쓴 버튼에 ARIA·roving tabindex·화살표 키를 얹는다. **버튼을 렌더하지 않는다** |
| `ns-multi-select` | Light DOM. 칩 줄 · 검색 · 체크박스 목록. `.ns-chip`·`.ns-input`·`.ns-checkbox` 를 재사용 |
| `ns-toast` | 토스트 리전. shadow. **직접 쓰지 않는다** — `nsToast()` 가 만든다 |
```

클래스 표에 다섯 줄:

```markdown
| `.ns-accordion` | `details` (+ `--card` / `--plain` 중 하나를 반드시 함께) |
| `.ns-message` | `div`. 안의 `p` 는 자손 선택자 |
| `.ns-chip` | `button`(토글) · `span`(제거·읽기 전용). `__remove` 를 함께 쓴다 |
| `.ns-button--danger` | `.ns-button` 의 변형 |
| `.ns-table__row-button` | `td` 안의 `button`. `.ns-table--rows-clickable` 과 짝 |
```

이벤트 문단을 고친다 — "이벤트는 여섯이다" 를 **여덟**으로 바꾸고 `ns-tab-change`(`{ id }`) 와 `ns-multi-select-change`(`{ values }`) 를 더한다.

- [ ] **Step 3: 명령형 API 문단을 더한다**

"왜 이런 구조인가" 절에 문단 하나를 더한다.

```markdown
**명령형 API 가 셋 있다.** `nsToast` · `nsAlert` · `nsConfirm` 은 함수로 부르고 Promise 를 돌려준다. 나머지가 전부 "상태는 소비자가 갖고 컴포넌트는 이벤트만 올린다" 인 것과 어긋나는데, **의도된 예외다** — 호출 지점에서 답이 필요한 것들이라 선언형으로 만들면 호출부가 `useState` 와 렌더 분기를 매번 다시 쓴다. 셋 다 문자열만 받으므로 HTML 주입 경로가 없고, 폼이 들어가는 모달은 이 API 로 만들지 않고 `ns-dialog` 로 직접 만든다.
```

- [ ] **Step 4: 디렉터리 트리를 갱신한다**

```
│   ├── components/tabs/ns-tabs.ts              ReactiveElement. 소비자 자식에 ARIA·키보드
│   ├── components/multi-select/ns-multi-select.ts  LitElement + light DOM 렌더
│   ├── components/toast/ns-toast.ts            shadow 리전. .styles.ts 를 갖는다
│   ├── components/toast/toast.ts               nsToast 명령형 파사드
│   ├── components/dialog/confirm.ts            nsAlert · nsConfirm
```

- [ ] **Step 5: `docs/gotchas.md` 에 `ns-tabs` 의 호스트 속성 예외를 적는다**

새 절을 더한다.

```markdown
## `ns-tabs` 만 호스트에 속성을 쓴다

불변 규칙은 "호스트의 속성을 쓰지 않는다" 다. `setAttribute` 로 소비자가 쓴 속성을 덮으면 문서화된 override 가 조용히 죽기 때문이다.

`ns-tabs` 는 호스트에 `role="tablist"` 를 쓴다. **둘 곳이 거기밖에 없다** — ARIA 의 tablist↔tab 소유 관계는 DOM 부모여야 하고, 탭 버튼들의 부모는 호스트다. shadow 안의 `div` 에 `role="tablist"` 를 주면 그 안에 탭이 없으므로 관계가 성립하지 않는다.

**`aria-controls` 가 shadow 경계를 못 넘는다는 이유를 쓰지 않는다 — 사실이 아니다.** 이 컴포넌트는 버튼을 렌더하지 않으므로, slot 을 둔 shadow root 였다면 버튼이 문서 트리에 남아 IDREF 가 그대로 해결된다. Light DOM 인 진짜 이유는 셋이다: `LitElement` 가 템플릿으로 소비자 자식을 덮어쓰고, slot 없는 shadow root 는 그 자식을 감추며, `controls.css` 가 shadow 안에 닿지 않는다. 이 문단을 `docs/gotchas.md` 로 옮길 때 그 셋을 쓴다.

규칙이 실제로 막으려던 것은 **소비자가 쓴 값을 덮는 것**이므로, 이미 `role` 이 있으면 건드리지 않는 조건부 쓰기로 그 성질을 지킨다.

```ts
if (!this.hasAttribute("role")) this.setAttribute("role", "tablist");
```

`aria-label` 은 아예 관리하지 않는다. 소비자가 `<ns-tabs aria-label="…">` 로 직접 쓰고, 우리는 읽지도 쓰지도 않는다.

**이 예외를 다른 컴포넌트로 넓히지 않는다.** 판단 기준은 "그 속성이 호스트에 있어야만 의미가 성립하는가" 하나이고, 지금 그것을 만족하는 것은 tablist 하나뿐이다.
```

- [ ] **Step 6: 전체 검증**

Run:
```sh
npm run check
node scripts/check-controls.mjs
npm run build
grep -c '<script>' index.html
grep -n '</script>' index.html | grep -v -E ':\s*</script>\s*$' | grep -v '<script src='
grep -n 'document.addEventListener' index.html
grep -oE '(^|[[:space:]])id="[^"]*"' index.html | sed -E 's/.*id="([^"]*)"/\1/' | sort | uniq -d
for t in ns-tabs ns-multi-select ns-toast; do echo -n "$t: "; grep -c "$t" dist/bundle.umd.js; done
```
Expected: 검사 둘 통과, 빌드 성공, `1`, 출력 없음 × 3, 세 태그 모두 1 이상.

- [ ] **Step 7: 사람이 확인할 목록을 보고서에 적는다**

**구현 서브에이전트는 화면을 볼 수 없다. 아래를 "확인했다" 고 적지 않는다.** `npm run demo` 로 열어 사람이 본다.

- `.ns-button--danger` 의 대비 (라이트·다크 양쪽). hover 에 반응하지 않는 것이 어색한지
- 아코디언 `--card` 와 `--plain` 을 나란히 놓았을 때 무게 차이가 실제로 보이는지
- 아코디언 요약이 길 때 제목을 밀어내지 않고 오른쪽에서 줄바꿈되는지
- 칩 토글의 `aria-checked` 배경, 제거 버튼의 × 위치와 hover
- 탭: 좌우 화살표 이동 · `Home`/`End` · 포커스 링이 잘리지 않는지 · 탭이 넘칠 때 가로 스크롤 · 활성 밑줄이 선택할 때 1px 튀지 않는지
- 표 행: `Tab` 으로 이름에 닿는지, 포커스 링이 셀 경계에서 끊기지 않는지, 클릭 한 번에 핸들러가 한 번만 도는지
- 다중 선택: 검색이 `meta` 에도 걸리는지, 칩이 고른 순서로 남는지, 목록 스크롤
- 토스트: 여러 개 쌓였을 때 겹치지 않는지, **hover 중에 멈추는지**, `duration=0` 이 안 사라지는지, 닫기 버튼에 Tab 으로 닿는 동안 살아 있는지
- confirm: `tone="danger"` 에서 초기 포커스가 취소에 있는지, ESC·백드롭이 `false` 인지
- 다크모드(`data-theme` 토글)에서 위 전부

- [ ] **Step 8: 커밋**

```sh
git add docs/project-structure.md docs/gotchas.md .claude/skills/releasing/SKILL.md
git commit -m "docs(structure): 새 태그·클래스·명령형 API 반영"
```

---

## 자체 검토

**스펙 커버리지**

| 스펙 절 | 태스크 |
|---|---|
| §0 범위 (7 이관 + 3 신규) | 1~9 |
| §1 태그/클래스 근거 | 문서로 2·6·7·10 |
| §2.1 `.ns-accordion` | 2 |
| §2.2 `.ns-message` | 3 |
| §2.3 `.ns-chip` | 4 |
| §2.4 `.ns-table__row-button` | 5 |
| §2.5 `.ns-button--danger` + `--ns-color-danger-fg` | 1 |
| §3 `ns-tabs` (마크업형·호스트 role 예외·MutationObserver·키보드·`tabIdFor`) | 6 |
| §4 `ns-multi-select` (데이터형·검색·`input-id`·이벤트) | 7 |
| §5 React 층 | 1·2·3·4·6·7·8·9 |
| §6.2 `nsToast` (리전·tone·pause) | 8 |
| §6.3 `nsAlert`·`nsConfirm` | 9 |
| §7 함께 바뀌는 파일 | 각 태스크 + 10 |
| §8 검증 | 각 태스크 검증 단계 + 10 Step 6·7 |
| §9 단계 | 1~5 / 6~7 / 8~9 |
| §10 하지 않는 것 | Global Constraints (테스트 러너 없음), 릴리스·`dashboard-shell` 은 계획에 없음 |

**스펙에서 벗어난 것 두 가지** (각 태스크에 표시해 뒀다):
- Task 5 의 `.ns-table--rows-clickable` — 참고 구현의 `rowsClickable` 을 클래스로 옮긴 것. 스펙 §2.4 에 없다.
- Task 7 의 `input-describedby` — 스펙 §4.1 이 "`aria-describedby` 를 넘긴다" 고만 적었는데, 호스트 속성을 읽어 안쪽에도 쓰면 같은 관계가 두 요소에 걸린다. `input-id` 와 짝이 되는 이름을 따로 받는다.

**이름 일관성**: `tabIdFor` (Task 6 정의 · Task 6 Step 8·10 사용), `nsToast`/`nsAlert`/`nsConfirm` (Task 8·9 정의 · Task 8 Step 7·Task 9 Step 5 사용), `NsTabChangeDetail`/`NsMultiSelectChangeDetail` (Task 6·7 에서 정의 후 같은 태스크 안에서만 사용), `.ns-chip`/`.ns-chip__remove` (Task 4 정의 · Task 7 사용), `.ns-button--danger` (Task 1 정의 · Task 9 사용).
