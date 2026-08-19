# 0.2.5 소비자 피드백 설계

`project01-test`(Next.js 16.3 App Router · React 19.2 · Tailwind v4)가 셸·표·폼·카드를 `@neosimplix/common-ui` 0.2.5 로 갈아 끼우면서 낸 보고서에서 온다. 여섯 항목 중 다섯을 다룬다.

| # | 성격 | 무엇 | 이 문서 |
|---|---|---|---|
| 1 | 버그 | `ns-table` 제어 선택이 React 제어 체크박스와 함께 전혀 동작하지 않는다 | §1 |
| 2 | 버그 | `ns-table` 이 소비자 `th` 에 `aria-sort` 를 써서 하이드레이션이 깨진다 | §2 |
| 3 | 문서 오류 | Next.js CSS 임포트 예시를 따르면 모든 `.ns-*` 테두리가 사라진다 | §3 |
| 4 | 빈자리 | React 래퍼가 전부 `"use client"` 라는 것이 문서에 없다 | §4 |
| 5 | 요청 | `Card` 에 머리-본문 구조가 없다 | §5 |

**다루지 않는 것.** 차트 계열색 토큰(보고서 §5)과 `Field` 의 `className`(§6)은 사용자가 보류했다. 계열색은 두 번째 대시보드 프로젝트가 같은 것을 필요로 할 때, `Field` 는 래퍼 `div` 가 실제로 불편해질 때 다시 본다.

## 1. `ns-table` 제어 선택 — `change` 를 `click` 으로 옮긴다

### 무엇이 깨졌나

행 체크박스를 눌러도 체크되지 않는다. `ns-select-change` 는 나오지만 `ids` 가 언제나 그대로다. **콘솔도 타입 검사도 조용하다.** 소비자는 `index.html` 이 안내한 대로 썼다.

```tsx
<input type="checkbox" data-ns-row-id={id}
       checked={selected.includes(id)} onChange={() => {}} />
```

### 왜

체크박스의 활성화 동작은 순서가 정해져 있다 — ① `checked` 를 뒤집고 ② `click` 을 디스패치하고 ③ 그 다음 `input`·`change` 를 디스패치한다.

React 의 제어 입력 구현은 루트 컨테이너에서 `click` 을 처리하고, **그 처리가 끝나는 시점에 DOM 을 프롭 값으로 되돌린다.** `ns-table` 은 ③의 `change` 에서 `box.checked` 를 읽으므로(`ns-table.ts` 의 `#onChange`) 언제나 되돌려진 값을 본다. 늦게 듣는 것이 아니라, `change` 가 발생하는 시점에 이미 값이 되돌아가 있다 — **`change` 를 듣는 어떤 코드도 사용자의 클릭을 볼 수 없다.**

소비자가 브라우저에서 뜬 로그가 이것을 그대로 보여준다.

```
native change, checked=false          ← 체크박스 자신의 리스너인데 이미 false
ns-select-change ids=[]
```

### 고침

**체크박스 처리를 `change` 에서 `click` 으로 옮긴다.**

`click` 시점에는 ①이 이미 끝났으므로 `box.checked` 가 사용자 의도다. 그리고 `ns-table` 의 리스너는 **호스트에 붙어 있어** 버블 경로에서 React 의 루트 리스너보다 먼저 지나간다 — 되돌리기 전에 읽는다.

이 컴포넌트에는 이미 `#onClick` 이 있다(정렬 헤더용). 같은 리스너가 두 가지를 가르게 한다: `th[data-ns-sort-key]` 안이면 정렬, **이 컴포넌트가 아는 두 훅(`data-ns-select-all`·`data-ns-row-id`) 중 하나가 붙은 체크박스**면 선택. 훅이 없는 체크박스까지 잡으면 정렬 헤더 안의 소비자 체크박스가 클릭을 삼켜 정렬이 죽으므로, 선택자를 그 둘로 좁힌다.

**키보드도 같은 경로다.** 체크박스에서 Space 를 누르면 브라우저가 `click` 을 디스패치하므로 경로가 하나로 줄어든다 — `change` 리스너는 제거한다.

**받아들이는 대가 하나.** 누군가 `click` 에서 `preventDefault()` 를 부르면 체크가 되돌아가는데 우리는 이미 읽은 뒤다. 지금은 `change` 가 아예 안 나므로 그 경우 **아무 일도 일어나지 않는다** — 조용히 어긋나는 것보다 낫지만 주석에 남긴다.

**라벨 클릭은 선택을 두 번 처리하지 않는다.** `.ns-checkbox` 는 `<label>` 이 `<input>` 을 감싸는 모양이다. 라벨을 누르면 라벨의 `click` 이 먼저 끝까지 버블링하고(타깃이 라벨이라 `closest()` 가 비어 체크박스 갈래에 걸리지 않는다), 그 다음 전달된 `click` 이 input 에서 올라온다. 선택 처리는 한 번이다.

**체크박스를 먼저 보는 순서는 타깃이 `input` 일 때만 결과를 바꾼다.** 라벨 타깃에서는 그 갈래가 성립하지 않기 때문이다. 그리고 `.ns-checkbox` 는 `padding: var(--ns-space-1-5) 0` 과 `gap` 을 갖고 input 은 `1rem` 이라 **라벨만 있는 클릭 영역이 실제로 존재한다.** 정렬 훅이 붙은 `<th>` 안에서 그 영역을 누르면 **정렬이 먼저 일어나고 이어서 선택이 일어난다** — 한 클릭이 둘 다 한다. (0.2.5 는 같은 마크업에서 `ns-sort` 를 **두 번** 냈다. 라벨 타깃과 전달된 input 타깃이 각각 정렬 갈래에 걸렸다. 이 변경은 그것을 한 번으로 줄인다.)

**그래서 두 훅을 정렬 훅이 붙은 `<th>` 안에 두지 않는다.** 선택 칼럼에 `data-ns-sort-key` 를 붙이지 않는 것이 답이고 `index.html` 의 데모가 이미 그렇다. 코드로 막을 수 있는 것이 아니다 — 라벨 영역 클릭의 타깃은 정말로 라벨이다.

### 문서

`index.html` 의 `ns-table` 절이 지금 **"React 의 렌더 루프가 그것을 거저 해 준다"** 고 적고 있다. 거저 해 주기는커녕 **그 방식이 유일하게 동작하지 않던 방식이었다.** 고친 뒤에는 동작하므로 그 문장은 참이 되지만, 소비자가 밟은 함정을 남겨 둘 이유가 있다 — 0.2.5 로 이미 우회 코드를 쓴 프로젝트가 그것을 되돌릴 수 있어야 한다. 이관 절에 한 문단을 둔다.

## 2. `aria-sort` — `"none"` 을 쓰지 않고 속성을 지운다

### 무엇이 깨졌나

정렬 헤더가 있는 페이지 전부에서 React 하이드레이션 경고가 뜬다.

```
A tree hydrated but some attributes of the server rendered HTML didn't match…
  <th data-ns-sort-key="name"
-     aria-sort="none"
```

### 왜

`customElements.define` 은 모듈 평가 시점에 실행되므로 `hydrateRoot` 보다 먼저다. `ns-table` 은 upgrade 하면서 소비자가 쓴 `th` **전부**에 `aria-sort` 를 쓰는데, 정렬돼 있지 않은 칼럼에는 `"none"` 을 쓴다. 서버 마크업에는 그 속성이 없으므로 React 가 차이를 발견한다.

`suppressHydrationWarning` 은 `ns-table` 요소에 붙여도 소용없다 — 그 프롭은 한 단계 아래로 내려가지 않고, `aria-sort` 의 주인은 `th` 다.

### 고침

**정렬 중이 아닌 `th` 에서는 속성을 쓰지 말고 지운다.**

근거는 둘이고 둘 다 검증됐다.

- **`aria-sort="none"` 은 ARIA 의 기본값이다.** 속성을 두지 않는 것과 의미가 같다. 화면낭독기에 달라지는 것이 없다.
- **`controls.css` 는 `"none"` 을 보지 않는다.** 삼각형은 `[aria-sort="ascending"]` 과 `[aria-sort="descending"]` 두 규칙이 그린다.

그러면 첫 페인트에 아무것도 정렬돼 있지 않은 **보통의 경우**에 컴포넌트가 `th` 를 전혀 건드리지 않으므로 서버 마크업과 완전히 일치한다. 소비자가 `suppressHydrationWarning` 을 붙일 필요가 없어진다.

**남는 경우 하나.** `default-sort-key` 로 처음부터 정렬된 표는 여전히 upgrade 때 `aria-sort="ascending"` 이 생긴다. 이것은 진짜 상태 변화이므로 지울 수 없다. 그 소비자는 서버 마크업에 같은 속성을 직접 렌더하면 된다 — 문서에 적는다. 정렬된 채로 시작하는 표는 드물고, 그때는 소비자가 정렬 상태를 알고 있다.

## 3. CSS 임포트 문서 — 두 안내가 서로를 무너뜨린다

### 무엇이 깨졌나

**이번 보고서에서 가장 위험한 항목이다. 경고도 에러도 없고 화면만 미묘하게 망가진다** — 모든 `.ns-*` 의 테두리가 사라진다.

`index.html` 의 "환경별 연동 → Next.js (App Router)" 는 `app/layout.tsx` 에서 두 CSS 를 JS `import` 하라고 안내한다. 같은 파일의 "CSS 두 개를 모두 불러온다" 절과 `README.md` 는 `globals.css` 안에서 `@import` 하라고 안내한다. Tailwind 를 쓰면 **두 안내를 각각 따르는 순간 반드시 깨진다.**

### 왜

레이어 순서는 **첫 등장 순서**로 정해진다. `layout.tsx` 에서 `controls.css` 를 `globals.css` 보다 먼저 임포트하면 번들에서 `@layer ns-controls { … }` 가 `@layer theme, base, ns-controls, …` 선언보다 앞에 나온다. 뒤늦은 선언은 그것을 되돌리지 못하므로 `ns-controls` 가 Tailwind 의 `base`(preflight)보다 앞으로 가고, preflight 가 이긴다.

소비자가 재현하고 측정한 표가 그대로다.

| 임포트 방식 | 레이어 첫 등장 순서 | `.ns-button--outline` 테두리 |
|---|---|---|
| 문서 예시대로 (`layout.tsx` 에서 JS import) | `ns-controls` → `theme` → `base` → … | 0px |
| `globals.css` 안에서 CSS `@import` | `theme` → `base` → `ns-controls` → … | 1px |

### 고침

`index.html` 의 Next.js 예시를 `globals.css` 형태로 바꾼다. Tailwind v4 의 임포트 리졸버가 bare specifier 를 해석하므로 그대로 동작한다.

```css
/* app/globals.css */
@layer theme, base, ns-controls, components, utilities;

@import "tailwindcss";
@import "@neosimplix/common-ui/tokens.css";
@import "@neosimplix/common-ui/controls.css";
```

그리고 **"순서는 상관없다" 문단을 고친다.** 그 문장은 토큰 *이름* 충돌에 대해서만 참인데, Tailwind 소비자에게는 임포트 *자리*가 결정적이라는 것이 이번 사고의 내용이다. 두 문장이 붙어 있어야 서로를 무너뜨리지 않는다.

## 4. React 래퍼는 전부 클라이언트 경계다

`dist/react.js` 최상단에 `"use client"` 가 있다. 따라서 상호작용이 전혀 없는 `PageHeading`·`Card` 도 클라이언트 경계이고, **그 아래로 함수를 넘길 수 없다.**

소비자는 표 칼럼을 `{ render, sortValue }` 로 정의해 서버 페이지에서 넘겼다가 빌드가 깨졌다.

```
Error: Functions cannot be passed directly to Client Components
```

라이브러리 잘못이 아니다. 배너는 필요하고(`@lit/react` 가 훅을 쓴다) 없앨 수 없다. **문서에 없다는 것이 빈자리다** — 셸을 이 라이브러리로 바꾸면 표시 전용 컴포넌트까지 클라이언트로 끌려온다는 사실은 도입 전에 알아야 한다.

`index.html` 의 Next.js 절에 한 문단을 둔다: 배너의 존재, 그 결과(렌더 함수·비교 함수를 서버에서 못 넘긴다), 그리고 우회(칼럼 정의를 클라이언트 파일로 내리고 페이지는 데이터만 넘긴다).

## 5. `.ns-card` 에 머리-본문 구조

### 무엇이 없었나

대시보드 카드는 거의 전부 "제목 + 설명 + 우측 액션 + 본문" 이다. 소비자는 `SectionCard` 를 직접 만들어 세 페이지에서 같은 모양을 쓴다 — **두 번째 사용처 기준을 이미 넘겼다.**

### 형태

클래스다. `.ns-card` 가 이미 클래스이고, 우측 액션은 임의의 소비자 내용이라 슬롯이 필요 없다. **그리고 제목 레벨은 소비자가 정해야 한다** — 페이지에 이미 `ns-page-heading` 의 `h1` 이 있으므로 카드 제목은 대개 `h2` 인데, 그것은 그 화면의 문서 개요를 아는 쪽만 안다. 태그로 만들면 `level` 프로퍼티를 받아야 하고, 그런 프로퍼티는 어긋난 채로 방치되기 쉽다.

```html
<div class="ns-card">
  <div class="ns-card__header">
    <div>
      <h2 class="ns-card__title">최근 주문</h2>
      <p class="ns-card__description">최근 30일</p>
    </div>
    <div class="ns-card__actions">
      <a class="ns-button ns-button--ghost ns-button--sm" href="/orders">전체 보기</a>
    </div>
  </div>
  <div class="ns-card__body">…</div>
</div>
```

- `__header` — `display: flex`, `justify-content: space-between`, `align-items: start`, `gap`. 제목 묶음이 왼쪽, 액션이 오른쪽.
- `__title` / `__description` — 요소 타입(`h2`/`p`)으로는 특정되지 않는다. 레벨이 소비자 몫이라 `h2`·`h3` 중 무엇이 올지 모르고, `__actions` 안에도 `p` 가 들어올 수 있다. 이름을 붙인다.
- `__actions` — 없으면 쓰지 않는다. `__header` 가 `space-between` 이라 하나만 있어도 배치가 맞다.
- `__body` — `display: flex; flex-direction: column; gap`. `.ns-accordion__body` 와 같은 판단이다.

### 구분선은 안쪽에 긋는다

`.ns-card` 는 **자기 자신에** `--ns-card-padding` 을 갖고 있다. 구분선을 카드 폭 전체로 그으려면 패딩을 `__header`·`__body` 로 내려야 하는데, 그러면 **머리 없이 `.ns-card` 만 쓰던 기존 호출부의 패딩이 경고 없이 사라진다.** 음수 마진 우회는 이 저장소가 피하는 모양이다.

그래서 `__header` 의 `border-bottom` 을 내용 폭까지만 긋는다. 기존 소비자는 전혀 영향을 받지 않고, 대시보드 카드에 흔한 모양이다.

### React

`Card` 에 선택 프롭 셋을 더한다 — `heading` · `description` · `actions`. **`heading` 이 있을 때만 머리를 렌더한다.** 없으면 지금과 완전히 같은 출력이라 기존 호출부가 안 바뀐다.

제목 요소는 `headingLevel?: 2 | 3` 로 고른다. 기본은 `2` — 페이지에 `ns-page-heading` 의 `h1` 이 있다는 전제가 이 라이브러리에서는 합리적이다. **`1` 을 허용하지 않는다**: 카드 제목이 페이지 제목일 수는 없다.

`title` 이 아니라 `heading` 인 이유는 `ns-page-heading`·`ns-dialog` 와 다르다 — 저쪽은 전역 속성 충돌이 이유였고 React 프롭만 `title` 을 유지했다. 여기서는 `.ns-card` 가 `div` 라 그 충돌이 없다. 그럼에도 `heading` 으로 통일한다: 같은 라이브러리 안에서 같은 것을 두 이름으로 부르지 않는다.

## 6. 검증

테스트 러너를 두지 않는다. 회귀 확인은 `npm run check` · `node scripts/check-controls.mjs` · `npm run build` · `index.html` 육안 확인이다.

**정적으로 못 보는 것이 이 사이클의 핵심이다.** §1 과 §2 는 둘 다 **React 소비자에게만 드러나고 이 저장소의 검사 어디에도 걸리지 않는다** — `docs/consumer-example.tsx` 는 타입만 보고, `index.html` 은 React 가 없다. 그래서 사람 확인 목록에 다음을 명시한다.

- §1: `index.html` 의 `ns-table` 선택 데모에서 마우스와 Space 양쪽으로 선택·해제·전체 선택 3-상태가 도는지. **React 제어 체크박스와의 조합은 이 저장소에서 재현할 수 없다** — 소비자 프로젝트에서 확인해야 한다. 그 사실을 보고서에 적는다.
- §2: 정렬되지 않은 표의 `th` 에 `aria-sort` 속성이 **아예 없는지**(개발자 도구), 정렬 후 `ascending`/`descending` 이 붙고 해제하면 다시 사라지는지.
- §3: 문서 예시를 그대로 따라간 프로젝트에서 테두리가 살아 있는지. 이 저장소에서는 확인할 수 없다.
- §5: 머리 있는 카드와 없는 카드를 나란히 놓고 기존 카드의 패딩이 그대로인지, 구분선이 내용 폭까지만 긋는지, 액션이 길 때 제목을 밀지 않는지.

## 7. 하지 않는 것

- **버전 태그를 만들지 않는다.** 릴리스는 별개 작업이다(`releasing` 스킬).
- **`"use client"` 배너를 없애지 않는다.** `@lit/react` 의 `createComponent` 가 훅을 쓴다.
- **`ns-table` 의 "aria-sort 의 유일한 작성자는 컴포넌트다" 설계를 바꾸지 않는다.** §2 는 쓰는 값을 줄일 뿐 소유권을 옮기지 않는다.
- **차트 계열색 토큰과 `Field` 의 `className` 을 넣지 않는다.** 사용자가 보류했다.
