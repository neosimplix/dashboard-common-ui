# 0.2.5 소비자 피드백 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `project01-test` 가 0.2.5 를 적용하며 보고한 결함 셋(제어 선택 무력화, `aria-sort` 하이드레이션 불일치, CSS 임포트 문서 모순)을 고치고, 문서 빈자리 하나와 `Card` 머리-본문 구조를 더한다.

**Architecture:** `ns-table` 의 체크박스 처리를 `change` 에서 `click` 으로 옮기고(React 가 DOM 을 되돌리기 전 시점), `aria-sort` 는 활성 칼럼에만 쓰고 나머지에서는 지운다. `Card` 는 새 클래스 다섯과 선택 프롭 넷을 얻되 `heading` 이 없으면 지금과 완전히 같은 출력을 낸다.

**Tech Stack:** TypeScript · Lit 3 (`ReactiveElement`) · `@lit/react` · 순수 CSS(`@layer ns-controls`)

**설계 문서:** `docs/superpowers/specs/2026-08-19-consumer-feedback-0.2.5-design.md`

## Global Constraints

`.claude/rules/` 에서 이 계획에 걸리는 것만 옮긴다. **모든 태스크의 요구사항에 암묵적으로 포함된다.**

- **테스트 러너를 추가하지 않는다.** vitest·jest·playwright·web-test-runner 를 설치하지 않고 `*.test.*` 파일을 만들지 않는다. 회귀 확인은 `npm run check`, `node scripts/check-controls.mjs`, `npm run build`, `index.html` 육안 확인이다.
- **새 검사 스크립트를 만들지 않는다.** 필요하면 기존 검사를 넓힌다.
- 커밋 메시지: `<type>(<scope>): <한국어 제목>` — type 은 `feat|fix|refactor|style|docs|test|chore`, scope 는 영어 소문자, 마침표 없음. **`git push` 를 하지 않는다.**
- 문서 트리 CSS 클래스는 `.ns-` 접두사. 변형은 `--`, 하위 요소는 `__`.
- **컴포넌트 스타일에 `var()` 폴백을 쓰지 않는다.** 색·치수는 `src/tokens/tokens.css` 한 곳에만 있다.
- `controls.css` 의 모든 규칙은 `@layer ns-controls { … }` 안에 있어야 한다.
- 상태 변형에 클래스를 만들지 않는다.
- **`ns-table` 은 소비자 마크업의 유일한 작성자라는 설계를 유지한다.** 이 계획은 쓰는 값을 줄일 뿐 소유권을 옮기지 않는다.
- `index.html`: `<template class="ex">` → 다음 형제 `.demo` → 그다음 `<pre>`. `<script type="text/plain">` 안에 `<script>` 를 넣지 않는다. **`document` 에 리스너를 붙이지 않는다.** 새 절 id 에 절 이름 접두사. **구조 검사 grep 은 텍스트 수준이라 주석·예시 안의 `id="…"` 도 센다.**
- 주석과 문서는 한국어이고 근거를 담는다. **틀린 단언은 없는 것보다 나쁘다.**

**모든 태스크의 검증 명령:**

```sh
npm run check
node scripts/check-controls.mjs
npm run build
grep -c '<script>' index.html                                  # 1
grep -n '</script>' index.html | grep -v -E ':\s*</script>\s*$' | grep -v '<script src='   # 출력 없음
grep -n 'document.addEventListener' index.html                 # 출력 없음
grep -oE '(^|[[:space:]])id="[^"]*"' index.html | sed -E 's/.*id="([^"]*)"/\1/' | sort | uniq -d   # 출력 없음
```

---

## 파일 구조

| 파일 | 책임 | 태스크 |
|---|---|---|
| `src/components/table/ns-table.ts` | 체크박스 처리를 `click` 으로 · `aria-sort` 를 활성 칼럼에만 | 1·2 |
| `index.html` | `ns-table` 절 보강 · Next.js 임포트 예시 정정 · `"use client"` 문단 · `.ns-card` 절 확장 | 1·2·3·4 |
| `README.md` | 임포트 자리 안내 정합 | 3 |
| `src/controls/controls.css` | `.ns-card__header` 계열 다섯 | 4 |
| `src/react/controls/Card.tsx` | 선택 프롭 넷 | 4 |
| `docs/consumer-example.tsx` | 새 `Card` 프롭 사용 | 4 |
| `docs/project-structure.md` | 클래스 표 한 줄 | 5 |

---

## Task 1: `ns-table` 체크박스 처리를 `click` 으로 옮긴다

**Files:**
- Modify: `src/components/table/ns-table.ts`
- Modify: `index.html` (`ns-table` 절)

**Interfaces:**
- Produces: 동작 변경만. 공개 API(`selected` 프로퍼티, `ns-select-change` 이벤트, `data-ns-row-id`·`data-ns-select-all` 훅)는 그대로다.

- [ ] **Step 1: 지금 깨져 있다는 것을 먼저 확인한다**

고치기 전에 원인을 눈으로 본다. `src/components/table/ns-table.ts` 에서 `#onChange` 를 찾아, 제어 모드 갈래가 `box.checked` 를 읽는 줄을 확인한다. 그 값이 React 가 되돌린 뒤의 값이라는 것이 이 태스크의 전제다.

Run: `grep -n 'addEventListener("change"\|box.checked' src/components/table/ns-table.ts`
Expected: `change` 리스너 등록과, `#onChange` 안에서 `box.checked` 를 읽는 줄들이 나온다.

- [ ] **Step 2: 리스너를 하나로 줄인다**

`connectedCallback` 에서 `change` 리스너 등록을 지우고, `disconnectedCallback` 에서 해제도 지운다. 등록 옆의 주석("위임이라 소비자가 행을 다시 그려도 리스너를 다시 붙일 필요가 없다")은 `click` 에도 그대로 참이므로 유지한다.

- [ ] **Step 3: `#onChange` 를 `#onCheckbox` 로 바꾸고 타깃 해석을 분리한다**

**본문 로직은 한 줄도 바꾸지 않는다.** `click` 시점의 `box.checked` 는 `change` 시점에 기대했던 값과 같기 때문이다 — 달라지는 것은 React 가 아직 되돌리지 않았다는 것뿐이다.

기존 `#onChange` 의 시그니처와 앞 세 줄을 이렇게 바꾼다.

```ts
  /**
   * 체크박스 하나가 활성화됐다. `box.checked` 는 **이미 뒤집힌 뒤**다.
   *
   * `change` 가 아니라 `click` 에서 부른다 — 근거는 `#onClick` 주석에 있다.
   */
  #onCheckbox(box: HTMLInputElement): void {
    const boxes = this.#rowBoxes();
```

그 아래 본문(select-all 갈래, `data-ns-row-id` 갈래, 제어/비제어 분기)은 그대로 둔다. 화살표 함수가 아니라 메서드가 되므로 끝의 `};` 를 `}` 로 고친다.

- [ ] **Step 4: `#onClick` 이 두 가지를 가르게 한다**

`#onClick` 의 앞부분을 이렇게 바꾼다. **체크박스를 먼저 본다** — 전체 선택 체크박스가 `<th>` 안에 있으므로, 정렬 훅이 붙은 `<th>` 에 체크박스를 넣은 마크업에서 순서가 결과를 바꾼다.

```ts
  /*
    클릭 하나로 두 가지를 받는다.

    ① 체크박스 — **`change` 가 아니라 여기서 처리하는 것이 중요하다.**
       체크박스의 활성화 동작은 순서가 정해져 있다: checked 를 뒤집고 →
       click 을 디스패치하고 → 그 다음 input·change 를 디스패치한다.
       React 의 제어 입력 구현은 루트 컨테이너에서 click 을 처리하고 그
       처리가 끝나는 시점에 DOM 을 프롭 값으로 되돌리므로, change 시점에는
       사용자가 만든 값이 이미 사라져 있다 — change 를 듣는 어떤 코드도
       그 클릭을 볼 수 없다. 이 리스너는 호스트에 붙어 있어 버블 경로에서
       루트보다 먼저 지나가므로 되돌리기 전의 값을 읽는다.

       Space 키도 브라우저가 click 을 디스패치하므로 경로가 하나로 족하다.

       대가 하나를 받아들인다: 누군가 click 에서 preventDefault() 를 부르면
       체크가 되돌아가는데 우리는 이미 읽은 뒤다. 그 경우 change 는 아예
       나지 않으므로 전에는 **아무 일도 일어나지 않았다** — 조용히 어긋나는
       쪽으로 바뀌지만, 그 마크업은 애초에 체크박스가 동작하지 않는다.

       라벨 클릭은 두 번 처리되지 않는다. `.ns-checkbox` 는 <label> 이
       <input> 을 감싸는 모양인데, 라벨의 click 은 타깃이 라벨이라
       closest("input") 이 비어 무시되고, 그 뒤 전달된 input 의 click 만
       처리된다.

    ② 정렬 헤더 — <th data-ns-sort-key> 안의 클릭을 받는다. 안쪽 <button>
       뿐 아니라 <th> 의 여백을 눌러도 동작한다. 마우스 타깃이 넓어지고,
       키보드 도달은 <button> 이 담당한다.

    체크박스를 먼저 본다. 정렬 훅이 붙은 <th> 안에 체크박스를 넣은 마크업에서
    순서가 결과를 바꾸기 때문이다.
  */
  #onClick = (e: Event): void => {
    const target = e.target as Element | null;

    const box = target?.closest<HTMLInputElement>('input[type="checkbox"]');
    if (box && this.#owns(box)) {
      this.#onCheckbox(box);
      return;
    }

    const th = target?.closest<HTMLElement>("th[data-ns-sort-key]");
    if (!th || !this.#owns(th)) return;
```

그 아래 정렬 로직은 그대로 둔다.

- [ ] **Step 5: 검증**

Run:
```sh
npm run check
node scripts/check-controls.mjs
npm run build
```
Expected: 모두 통과.

`grep -n 'change' src/components/table/ns-table.ts` 로 `change` 라는 낱말이 남아 있는 자리를 전부 훑고, 주석에서 이제 틀린 서술이 된 것이 없는지 본다.

- [ ] **Step 6: `index.html` 의 `ns-table` 절을 고친다**

이 절에는 지금 **React 의 렌더 루프가 그것을 거저 해 준다** 는 취지의 문장이 있다. 그 문장을 찾아서, 고친 뒤의 사실로 바꾼다 — 제어 모드에서 소비자가 `checked` 를 다시 그리는 것이 맞고, **그것이 0.2.5 에서는 동작하지 않았다**는 것을 함께 적는다.

이관 안내를 담을 문단을 그 근처에 둔다. 담을 내용은 셋이다.

- 0.2.5 에서 React 제어 체크박스(`checked` 프롭 + no-op `onChange`)를 쓰면 선택이 전혀 되지 않았다. 원인은 위 `#onClick` 주석의 이벤트 순서다.
- 그래서 `defaultChecked` + `ref` 로 DOM 에 직접 쓰는 우회를 한 프로젝트가 있다. **그 우회를 되돌려도 된다** — 이제 `checked` 프롭이 정상 경로다.
- 프로그램으로 `input.checked` 를 바꾼 뒤 `change` 를 직접 디스패치하는 방식은 **지원하지 않는다.** 이 컴포넌트는 `click` 만 듣는다. 상태를 바꾸려면 `selected` 프로퍼티를 쓴다.

- [ ] **Step 7: 검증**

Run: 위 "모든 태스크의 검증 명령" 전부.
Expected: 검사 셋 통과, grep 넷이 각각 `1`·없음·없음·없음.

- [ ] **Step 8: 커밋**

```sh
git add src/components/table/ns-table.ts index.html
git commit -m "fix(table): 체크박스 선택을 click 에서 읽어 React 제어 입력과 함께 동작시킴"
```

---

## Task 2: `aria-sort` 를 활성 칼럼에만 쓴다

**Files:**
- Modify: `src/components/table/ns-table.ts` (`#syncAriaSort`)
- Modify: `index.html` (`ns-table` 절의 접근성/SSR 안내)

**Interfaces:**
- Consumes: Task 1 의 변경과 같은 파일이지만 다른 메서드다. 충돌 없음.
- Produces: 정렬되지 않은 `th` 에는 `aria-sort` 속성이 **존재하지 않는다.**

- [ ] **Step 1: `#syncAriaSort` 를 바꾼다**

```ts
  /*
    활성 <th> 에만 aria-sort 를 쓴다. 컴포넌트가 유일한 작성자다 — 소비자는 이
    속성을 쓰지 않으므로 React 와 싸우지 않는다. 삼각형은 controls.css 가
    이 속성을 받아 그린다.

    **정렬 중이 아닌 칼럼에는 "none" 을 쓰지 않고 속성을 지운다.** 근거가 둘이다.

    ① aria-sort="none" 은 ARIA 의 기본값이라 속성이 없는 것과 의미가 같다.
       화면낭독기에 달라지는 것이 없다.
    ② controls.css 는 "none" 을 보지 않는다 — 삼각형은 [aria-sort="ascending"]
       과 [aria-sort="descending"] 두 규칙이 그린다.

    그래서 지우는 편이 얻는 것이 있다. customElements.define 은 모듈 평가
    시점에 실행되므로 hydrateRoot 보다 먼저다. "none" 을 쓰면 upgrade 때
    서버 마크업에 없던 속성이 모든 정렬 칼럼에 생겨 React 가 하이드레이션
    불일치를 보고한다 — 정렬 헤더를 쓰는 Next.js 소비자 전부가 그 에러를 봤다.
    지우면 첫 페인트에 아무것도 정렬돼 있지 않은 보통의 경우에 이 컴포넌트가
    <th> 를 아예 건드리지 않으므로 마크업이 그대로 일치한다.

    default-sort-key 로 처음부터 정렬된 표는 여전히 upgrade 때 속성이 생긴다.
    그것은 진짜 상태이므로 지울 수 없다 — 그 소비자는 서버 마크업에 같은
    속성을 직접 렌더한다(index.html 의 SSR 안내).
  */
  #syncAriaSort(): void {
    const key = this.#key;
    const direction = this.#direction;

    for (const th of this.querySelectorAll<HTMLElement>("th[data-ns-sort-key]")) {
      if (!this.#owns(th)) continue;
      /*
        direction 이 none 이면 #key 가 "" 라 어느 칼럼도 맞지 않지만, 두
        조건을 함께 본다 — 반쪽 제어(sortDirection 만 설정)에서 그 불변이
        깨질 수 있고, 그때 aria-sort="none" 을 쓰는 것은 위 ①에 어긋난다.
      */
      if (th.dataset.nsSortKey === key && direction !== "none") {
        th.setAttribute("aria-sort", direction);
      } else {
        th.removeAttribute("aria-sort");
      }
    }
  }
```

- [ ] **Step 2: 정렬 데모가 여전히 세 상태를 보이는지 정적으로 확인한다**

`index.html` 의 `ns-table` 절에 정렬 상태 데모가 있다. 그 마크업이 `aria-sort="none"` 을 **직접 써 두고 있으면** 이제 컴포넌트가 그것을 지운다.

Run: `grep -n 'aria-sort' index.html`
확인할 것: 데모 마크업에 손으로 쓴 `aria-sort="none"` 이 있으면 지운다(컴포넌트가 쓰지 않는 값이다). `ascending`/`descending` 을 보여주는 정적 예시는 그대로 두되, **컴포넌트가 관리하는 표 안에 있으면** 지워진다는 것을 확인한다 — 정적 예시라면 `ns-table` 밖이어야 한다.

- [ ] **Step 3: `index.html` 에 SSR 안내를 더한다**

`ns-table` 절에 문단 하나를 둔다.

- 정렬되지 않은 칼럼에는 `aria-sort` 가 **붙지 않는다.** `none` 은 ARIA 기본값이라 의미가 같고, 붙이면 SSR 마크업과 어긋나 React 가 하이드레이션 불일치를 보고한다.
- `default-sort-key` 로 **처음부터 정렬된 표만** 그 불일치가 남는다. 그 경우 서버 마크업의 해당 `<th>` 에 같은 `aria-sort` 를 직접 렌더한다.
- **소비자가 `aria-sort="none"` 을 직접 쓰지 않는다.** 컴포넌트가 지우므로 그것 자체가 불일치가 된다.

- [ ] **Step 4: 검증**

Run: 위 "모든 태스크의 검증 명령" 전부.
Expected: 검사 셋 통과, grep 넷 정상.

- [ ] **Step 5: 커밋**

```sh
git add src/components/table/ns-table.ts index.html
git commit -m "fix(table): 정렬되지 않은 칼럼에서 aria-sort 를 지워 하이드레이션 불일치를 없앰"
```

---

## Task 3: CSS 임포트 문서 정합과 `"use client"` 안내

**Files:**
- Modify: `index.html` (Next.js 절, "CSS 두 개를 모두 불러온다" 절)
- Modify: `README.md`

**Interfaces:**
- 코드 변경 없음. 문서만.

- [ ] **Step 1: 지금 두 안내가 어긋나 있다는 것을 확인한다**

Run:
```sh
grep -n 'app/layout.tsx' index.html
grep -n 'app/globals.css' index.html README.md
grep -n '@layer theme' index.html README.md
```
확인할 것: `index.html` 의 Next.js 절이 `layout.tsx` 에서 두 CSS 를 JS `import` 하라고 안내하고, 같은 파일의 다른 절과 `README.md` 는 `globals.css` 안 `@import` 를 안내한다. Tailwind 소비자가 둘을 각각 따르면 `@layer ns-controls` 가 레이어 순서 선언보다 먼저 등장해 preflight 에 진다.

- [ ] **Step 2: Next.js 예시를 `globals.css` 형태로 바꾼다**

`index.html` 의 Next.js 절에서 `// app/layout.tsx` 로 시작하는 두 줄의 CSS `import` 를 지우고, 대신 `globals.css` 형태를 보인다.

```css
/* app/globals.css — 이 파일 하나에서 순서까지 정한다 */
@layer theme, base, ns-controls, components, utilities;

@import "tailwindcss";
@import "@neosimplix/common-ui/tokens.css";
@import "@neosimplix/common-ui/controls.css";
```

그리고 왜 `layout.tsx` 가 아닌지 한 문단을 붙인다. 담을 내용:

- 레이어 순서는 **첫 등장 순서**로 정해진다.
- `layout.tsx` 에서 `controls.css` 를 `globals.css` 보다 먼저 임포트하면 `@layer ns-controls { … }` 가 순서 선언보다 앞에 나오고, **뒤늦은 선언은 그것을 되돌리지 못한다.**
- 결과는 `ns-controls` 가 Tailwind 의 `base`(preflight)보다 앞으로 가는 것 — preflight 가 이겨 `.ns-*` 의 테두리·여백이 사라진다.
- **경고도 에러도 없다.** 화면으로만 드러난다.
- Tailwind v4 의 임포트 리졸버가 bare specifier 를 해석하므로 `@import "@neosimplix/…"` 가 그대로 동작한다.

- [ ] **Step 3: "순서는 상관없다" 문단을 고친다**

`index.html` 의 "CSS 두 개를 모두 불러온다" 절에 **순서는 상관없다** 는 문장이 있다. 그 문장은 토큰 *이름* 충돌에 대해서만 참인데, Tailwind 소비자에게는 임포트 *자리*가 결정적이다.

두 문장이 서로를 무너뜨리지 않게 붙여 둔다: 이름 충돌은 `--ns-` 접두사가 없앴으므로 **tokens.css 와 controls.css 사이의 순서**는 상관없다 — 그러나 Tailwind 를 쓰면 **두 파일이 어디서 임포트되는지**는 상관있다, 그리고 그 자리는 `globals.css` 다. 아래 Tailwind 절로 잇는다.

`README.md` 의 같은 문장(`**임포트 순서는 결과를 바꾸지 않는다.**`)에도 같은 단서를 붙인다.

- [ ] **Step 4: `README.md` 의 임포트 예시가 Tailwind 절과 한 덩어리로 읽히게 한다**

`README.md` 는 이미 `globals.css` 안 `@import` 를 보이고 있으므로 예시 자체는 맞다. 두 블록(임포트 예시와 레이어 순서 선언)이 떨어져 있어 **각각 따라도 되는 것처럼 읽히는 것**이 문제다. 한 블록으로 합치거나, 임포트 예시 쪽에 "레이어 순서 선언과 같은 파일에 둔다" 를 한 줄 적는다.

- [ ] **Step 5: `"use client"` 문단을 더한다**

`index.html` 의 Next.js 절에 문단 하나를 둔다.

- `dist/react.js` 최상단에 `"use client"` 배너가 있다. `@lit/react` 의 `createComponent` 가 훅을 쓰므로 필요하고 없앨 수 없다.
- 따라서 상호작용이 없는 `PageHeading`·`Card` 도 **클라이언트 경계**다. 서버 컴포넌트에서 쓰는 것은 되지만, **그 아래로 함수를 넘길 수 없다.**
- 표 칼럼을 `{ render, sortValue }` 로 정의해 서버 페이지에서 넘기면 빌드가 `Functions cannot be passed directly to Client Components` 로 깨진다.
- 우회는 칼럼 정의를 클라이언트 파일로 내리고 페이지는 데이터만 넘기는 것이다.
- **셸을 이 라이브러리로 바꾸면 표시 전용 컴포넌트까지 클라이언트로 끌려온다** — 도입 전에 알아야 하는 사실이다.

- [ ] **Step 6: 검증**

Run: 위 "모든 태스크의 검증 명령" 전부.
Expected: 검사 셋 통과, grep 넷 정상.

`index.html` 은 예시 블록이 `<script type="text/plain">` 안에 있다. **CSS 예시를 넣을 때도 그 규약을 지킨다** — 이 절의 이웃 블록과 같은 모양인지 확인한다.

- [ ] **Step 7: 커밋**

```sh
git add index.html README.md
git commit -m "docs(usage): Tailwind 에서 CSS 임포트 자리가 결과를 바꾼다는 것을 명시"
```

---

## Task 4: `.ns-card` 머리-본문 구조

**Files:**
- Modify: `src/controls/controls.css` (`.ns-card` 규칙 다음)
- Modify: `src/react/controls/Card.tsx`
- Modify: `index.html` (`.ns-card` 절)
- Modify: `docs/consumer-example.tsx`

**Interfaces:**
- Produces: 클래스 `.ns-card__header` `.ns-card__title` `.ns-card__description` `.ns-card__actions` `.ns-card__body`; React `CardProps` 에 `heading` · `description` · `actions` · `headingLevel`.
- **기존 호출부는 바뀌지 않는다** — `heading` 이 없으면 지금과 완전히 같은 출력이다.

- [ ] **Step 1: `controls.css` 에 규칙을 더한다**

`.ns-card { … }` 규칙 **다음**에 넣는다.

```css
  /*
    카드 머리. 제목 묶음이 왼쪽, 액션이 오른쪽이다.

    **구분선을 카드 폭 전체로 긋지 않는다.** .ns-card 는 자기 자신에
    --ns-card-padding 을 갖고 있어서, 전체 폭으로 그으려면 그 패딩을
    __header·__body 로 내려야 한다 — 그러면 머리 없이 .ns-card 만 쓰던 기존
    호출부의 패딩이 경고 없이 사라진다. 음수 마진 우회는 쓰지 않는다.
    안쪽까지만 긋는 선은 대시보드 카드에 흔한 모양이기도 하다.

    __title 과 __description 에 이름을 붙이는 이유: 요소 타입으로 특정되지
    않는다. 제목 레벨은 소비자가 정하므로(h2 일지 h3 일지 모른다) 요소
    선택자를 쓸 수 없고, __actions 안에도 <p> 가 들어올 수 있다.
  */
  .ns-card__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--ns-space-4);
    padding-bottom: var(--ns-space-4);
    margin-bottom: var(--ns-space-6);
    border-bottom: 1px solid var(--ns-color-line);
  }

  .ns-card__title {
    margin: 0;
    font-size: var(--ns-font-size-base);
    line-height: var(--ns-line-height-base);
    font-weight: var(--ns-weight-semibold);
    color: var(--ns-color-fg);
  }

  .ns-card__description {
    margin: var(--ns-space-1) 0 0;
    font-size: var(--ns-font-size-sm);
    line-height: var(--ns-line-height-sm);
    color: var(--ns-color-fg-muted);
  }

  /* 제목이 길어도 액션이 줄바꿈되거나 찌그러지지 않게 한다. */
  .ns-card__actions {
    display: flex;
    align-items: center;
    gap: var(--ns-space-2);
    flex-shrink: 0;
  }

  .ns-card__body {
    display: flex;
    flex-direction: column;
    gap: var(--ns-space-4);
  }
```

- [ ] **Step 2: 검사를 실패시켜 본다**

문서에 적기 **전에** `check-controls.mjs` 가 막는지 확인한다. 한 번도 실패해본 적 없는 검사가 통과하는 것은 아무 증거도 아니다.

Run: `node scripts/check-controls.mjs`
Expected: FAIL — 다섯 이름이 문서에 없다는 메시지. **의도한 이유로 실패했는지** 확인하고 메시지를 보고서에 적는다.

- [ ] **Step 3: React `Card` 를 바꾼다**

`src/react/controls/Card.tsx` 를 통째로 이렇게 만든다.

```tsx
import type { ReactNode } from "react";

import { cx } from "../cx.js";

type CardBase = {
  className?: string;
  children: ReactNode;
};

/**
 * 머리는 `heading` 이 있을 때만 생긴다. **없으면 출력이 예전과 완전히 같다** —
 * 이 프롭들이 생겼다고 기존 호출부가 달라지지 않는다.
 *
 * `description`·`actions`·`headingLevel` 을 `heading` 없이 주는 것은 타입이
 * 막는다. 셋만 주면 아무것도 렌더되지 않아 조용히 사라지기 때문이다.
 */
export type CardProps = CardBase &
  (
    | {
        heading: string;
        description?: string;
        actions?: ReactNode;
        /**
         * 제목 요소. 기본은 `2` — 이 라이브러리를 쓰는 페이지에는 대개
         * `ns-page-heading` 의 `h1` 이 이미 있다.
         *
         * **`1` 을 허용하지 않는다.** 카드 제목이 페이지 제목일 수는 없다.
         */
        headingLevel?: 2 | 3;
      }
    | { heading?: never; description?: never; actions?: never; headingLevel?: never }
  );

export function Card({
  className,
  children,
  heading,
  description,
  actions,
  headingLevel = 2,
}: CardProps) {
  if (heading === undefined) {
    return <div className={cx("ns-card", className)}>{children}</div>;
  }

  const Heading = (headingLevel === 3 ? "h3" : "h2") as "h2" | "h3";

  return (
    <div className={cx("ns-card", className)}>
      <div className="ns-card__header">
        <div>
          <Heading className="ns-card__title">{heading}</Heading>
          {description !== undefined && (
            <p className="ns-card__description">{description}</p>
          )}
        </div>
        {actions !== undefined && <div className="ns-card__actions">{actions}</div>}
      </div>
      <div className="ns-card__body">{children}</div>
    </div>
  );
}
```

**제목 묶음을 감싸는 `<div>` 에 클래스를 주지 않는다.** `__header` 가 `space-between` 이라 자식 둘의 자리가 정해지고, 그 `div` 는 이름으로 불릴 일이 없다.

- [ ] **Step 4: `index.html` 의 `.ns-card` 절을 확장한다**

기존 데모 아래에 머리 있는 카드를 더한다. `<template class="ex">` → `.demo` → `<pre>` 규약을 지킨다.

```html
    <div class="ns-card">
      <div class="ns-card__header">
        <div>
          <h2 class="ns-card__title">최근 주문</h2>
          <p class="ns-card__description">최근 30일</p>
        </div>
        <div class="ns-card__actions">
          <a class="ns-button ns-button--ghost ns-button--sm" href="#ns-card">전체 보기</a>
        </div>
      </div>
      <div class="ns-card__body">
        <p style="margin:0">본문.</p>
      </div>
    </div>
```

클래스 표에 다섯 줄을 더한다. 각 줄에 붙이는 요소와 역할을 적고, `__title` 에는 **레벨은 소비자가 정한다(대개 `h2`)** 를, `__header` 에는 **구분선이 내용 폭까지만 그어진다** 를 적는다.

React 예시에 머리 있는 형태를 더한다.

```jsx
<Card heading="최근 주문" description="최근 30일"
      actions={<ButtonLink href="/orders" variant="ghost" size="sm">전체 보기</ButtonLink>}>
  <RecentOrders />
</Card>
```

주의 목록에 두 줄을 더한다.

- `heading` 없이 `description`·`actions` 만 주는 것은 타입이 막는다. 셋만 주면 아무것도 렌더되지 않아 조용히 사라진다.
- 구분선은 **내용 폭까지만** 그어진다. 카드 폭 전체로 그으려면 `.ns-card` 의 패딩을 하위 요소로 내려야 하고, 그러면 머리 없이 쓰던 기존 호출부의 패딩이 사라진다.

- [ ] **Step 5: `docs/consumer-example.tsx` 에서 새 프롭을 쓴다**

기존 `<Card>` 는 그대로 두고(머리 없는 형태가 여전히 컴파일되는지가 검사다), 머리 있는 형태를 하나 더 넣는다.

```tsx
            <Card
              heading="최근 주문"
              description="최근 30일"
              actions={<ButtonLink href="/orders" variant="ghost" size="sm">전체 보기</ButtonLink>}
            >
              <p>본문</p>
            </Card>
```

- [ ] **Step 6: 타입이 실제로 막는지 확인한다**

임시 파일을 만들지 않는다(테스트 파일 금지). `docs/consumer-example.tsx` 에 `<Card description="x">본문</Card>` 를 잠시 넣고 `npm run check` 가 **실패하는지** 본다. 확인 후 되돌린다. 실패 메시지를 보고서에 적는다.

- [ ] **Step 7: 검증**

Run: 위 "모든 태스크의 검증 명령" 전부.
Expected: 검사 셋 통과, grep 넷 정상.

- [ ] **Step 8: 커밋**

```sh
git add src/controls/controls.css src/react/controls/Card.tsx index.html docs/consumer-example.tsx
git commit -m "feat(card): 제목·설명·액션을 갖는 머리-본문 구조 추가"
```

---

## Task 5: 구조 문서와 최종 검증

**Files:**
- Modify: `docs/project-structure.md`

- [ ] **Step 1: 클래스 표에 한 줄을 더한다**

"무엇을 제공하나" 의 클래스 표에 넣는다.

```markdown
| `.ns-card__header` 계열 | `.ns-card` 안의 머리. `__title` `__description` `__actions` `__body` 를 함께 쓴다 |
```

- [ ] **Step 2: 최종 검증**

Run:
```sh
npm run check
node scripts/check-controls.mjs
npm run build
grep -c '<script>' index.html
grep -n '</script>' index.html | grep -v -E ':\s*</script>\s*$' | grep -v '<script src='
grep -n 'document.addEventListener' index.html
grep -oE '(^|[[:space:]])id="[^"]*"' index.html | sed -E 's/.*id="([^"]*)"/\1/' | sort | uniq -d
node --input-type=module -e "import('./dist/index.js').then(m=>console.log(Object.keys(m).sort().join(', ')))"
```
Expected: 검사 셋 통과, `1`, 출력 없음 ×3, 그리고 export 목록이 `.claude/skills/releasing/SKILL.md` 에 적힌 것과 같아야 한다(이 계획은 export 를 더하지 않으므로 변화가 없어야 정상이다).

- [ ] **Step 3: 사람이 확인할 목록을 보고서에 적는다**

**구현 서브에이전트는 화면을 볼 수 없다. 아래를 "확인했다" 고 적지 않는다.**

이 사이클의 핵심은 **이 저장소에서 재현할 수 없는 것이 둘이라는 점**이다. 그것을 흐리지 말고 따로 적는다.

*이 저장소의 `index.html` 에서 확인 가능*

- 표 선택: 마우스와 Space 양쪽으로 행 선택·해제가 되는지, 전체 선택 3-상태(없음 · indeterminate · 전체)가 도는지, 라벨 글자를 눌러도 한 번만 토글되는지
- 정렬: 정렬되지 않은 `th` 에 개발자 도구로 봤을 때 `aria-sort` 속성이 **아예 없는지**, 정렬하면 `ascending`/`descending` 이 붙고 해제하면 다시 사라지는지, 삼각형이 그대로인지
- 카드: 머리 있는 카드와 없는 카드를 나란히 놓고 **없는 쪽의 패딩이 예전 그대로인지**, 구분선이 내용 폭까지만 그어지는지, 제목이 길 때 액션이 찌그러지지 않는지, 다크모드

*이 저장소에서는 재현할 수 없음 — 소비자 프로젝트에서 확인해야 함*

- **React 제어 체크박스와의 조합**(피드백 #1 의 본체). `index.html` 에는 React 가 없다. `checked` 프롭 + no-op `onChange` 로 쓴 표에서 선택이 되는지, 그리고 0.2.5 에서 쓰던 `defaultChecked` + `ref` 우회를 지워도 되는지를 `project01-test` 에서 본다.
- **하이드레이션 경고가 사라졌는지**(#2). 정렬 헤더가 있는 Next.js 페이지에서 콘솔이 깨끗한지.
- **문서대로 CSS 를 임포트했을 때 테두리가 살아 있는지**(#3). 새 예시를 그대로 따라 `globals.css` 를 구성하고 `.ns-button--outline` 의 테두리가 1px 인지.

- [ ] **Step 4: 커밋**

```sh
git add docs/project-structure.md
git commit -m "docs(structure): .ns-card 머리 클래스 반영"
```

---

## 자체 검토

**스펙 커버리지**

| 스펙 절 | 태스크 |
|---|---|
| §1 `ns-table` 제어 선택 (`click` 이전, 문서) | 1 |
| §2 `aria-sort` (활성 칼럼만, SSR 안내) | 2 |
| §3 CSS 임포트 문서 (예시 정정, "순서는 상관없다" 단서) | 3 |
| §4 `"use client"` 안내 | 3 |
| §5 `.ns-card` 머리-본문 (클래스 다섯, React 프롭 넷, 안쪽 구분선) | 4 |
| §6 검증 (재현 가능/불가능 분리) | 5 |
| §7 하지 않는 것 | 계획에 없음(태그 없음, 배너 유지, 소유권 유지, 보류 항목 없음) |

**placeholder 없음.** 모든 코드 단계에 실제 코드가 있다. 산문으로만 지시한 단계(Task 1 Step 6, Task 2 Step 3, Task 3 Step 2·3·5, Task 4 Step 4)는 전부 **문서 문단**이고, 담을 내용을 항목으로 열거했다 — 문서는 그 저장소의 목소리로 써야 하므로 문장을 받아 적게 하지 않는다.

**이름 일관성**: `#onCheckbox`(Task 1 에서 `#onChange` 를 개명, 같은 태스크 안에서만 참조), `#syncAriaSort`(Task 2, 기존 이름 유지), `.ns-card__header` 계열 다섯(Task 4 정의 · Task 5 문서화), `CardProps` 의 네 프롭(Task 4 정의 · 같은 태스크에서 사용).

**Task 1 과 2 가 같은 파일을 만진다.** 서로 다른 메서드이고 순차 실행이므로 충돌하지 않는다. Task 2 의 구현자는 Task 1 이 이미 병합된 상태에서 시작한다.
