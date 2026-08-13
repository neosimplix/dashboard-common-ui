# common-ui 프리미티브 추출 설계

`dashboard-shell` 의 `components/ui/*` 를 `common-ui` 로 옮긴다. 셸(`ns-header` · `ns-sidebar` · `ns-nav-group` · `ns-nav-item`)은 이미 옮겼고, 이번은 그 안에 들어가는 프리미티브다.

참고 구현: `dashboard-shell/components/ui/` 와 갤러리 `dashboard-shell/app/dev/ui/page.tsx`.

## 1. 대상과 판정

요청 대상은 열둘이다. `table` 은 별도 스펙으로 뺀다(§10).

| | 판정 | 근거 |
|---|---|---|
| `button` `input` `select` `textarea` `checkbox` `field` `card` | **CSS 클래스** | 캡슐화할 행동이 없다. 전부 스타일이다 |
| `icon` `page-heading` `skeleton` | **웹 컴포넌트** | 행동은 없지만 **만들어 줄 마크업**이 있다 |
| `dialog` | **웹 컴포넌트** | 포커스 트랩 · Esc · backdrop · top layer |
| `table` | 웹 컴포넌트 | 정렬 · 페이징 · 선택 상태를 소유한다. **다음 스펙** |

판단 기준은 두 줄이다.

> **캡슐화할 행동이 있으면 태그.**
> **만들어 줄 마크업이 있으면 태그.**
> 둘 다 아니면 클래스.

`card` 는 `div` 하나에 스타일뿐이라 클래스다. `page-heading` 은 `<h1>` + `<p>` 두 줄과 제목 레벨을 만들어 주므로 태그다. `skeleton` 은 크기를 프로퍼티로 받아야 순수 HTML 에서 쓸 만하므로 태그다. `icon` 은 클래스가 SVG 마크업을 만들 수 없으므로 태그다.

## 2. 폼 컨트롤을 웹 컴포넌트로 만들지 않는 이유

이 스펙에서 가장 중요한 결정이다. 되돌리려는 사람이 반드시 읽어야 한다.

### 2.1 Shadow DOM 은 폼 참여를 끊는다

shadow root 안의 `<input>` 은 바깥 `<form>` 에게 보이지 않는다. `FormData` 에 안 담기고, 네이티브 제출에 안 실리고, `<label for>` 가 못 가리키고, `required` 가 제출을 막지 못한다.

`<button type="submit">` 도 같다. **소비자 11곳이 `type="submit"` 을 쓴다.** shadow 안의 버튼은 폼의 기본 제출 버튼 자리를 채우지 못하므로, 텍스트 필드에서 Enter 로 제출되는 동작(implicit submission)도 보장되지 않는다.

### 2.2 FACE 로 되살릴 수 있지만 대가가 크다

form-associated custom element(`static formAssociated = true` + `attachInternals()`)는 폼 참여 · `<label for>` · `:invalid` · `form.reset()` · `<fieldset disabled>` 를 되살린다. 브라우저 지원도 충분하다(Chrome 77+ / Firefox 98+ / Safari 16.4+).

되살아나지 않거나 손으로 해야 하는 것들이 남는다.

| 항목 | 상태 |
|---|---|
| `required` · `type=email` · `minlength` · `pattern` | 전부 직접 구현. `setValidity()` 와 앵커 배선 |
| 제어/비제어 분기 | 텍스트 입력에 들어간다. 렌더 틱이 하나 늘어 **빠른 타이핑에 커서가 튀고 한글 IME 조합이 깨진다.** `compositionstart`/`compositionend` 를 직접 물어야 한다 |
| 브라우저 자동완성 · 비밀번호 관리자 | 신뢰할 수 없다. 크롬 휴리스틱이 커스텀 엘리먼트에서 자주 실패한다 |
| JS 없이 동작 | **불가능.** 커스텀 엘리먼트라 JS 가 없으면 입력칸 자체가 렌더되지 않는다 |

마지막 항목이 결정적이다. `dashboard-shell/components/shell/AdminLoginForm.tsx:40` 의 주석이 이렇게 되어 있다.

```
{/* method="post" 라 자바스크립트 없이도 동작한다. */}
```

그 폼은 `autoComplete="username"` / `current-password` 와 `required` 를 쓰고 `action="/api/auth/admin" method="post"` 로 제출한다. FACE 로 바꾸면 이 설계 전제가 통째로 사라진다.

### 2.3 규모

현재 라이브러리 전체가 549줄이다. FACE 는 공용 믹스인 약 70줄 + 컨트롤당 80~120줄 × 4 ≈ **430줄**을 더한다. 컴포넌트 넷으로 라이브러리가 두 배가 되고, 늘어난 부분이 **테스트 러너 없는 이 저장소에서 가장 검증하기 어려운 코드**다 — 폼 제출 · reset · 뒤로가기 복원 · 자동완성 · IME 를 매번 사람 눈으로 확인해야 한다.

### 2.4 결론

값 · 검증 · 라벨 · 폼 제출은 플랫폼이 이미 하는 일이다. shadow 경계는 그것을 끊었다가 되붙이는 비용만 만든다. 그래서 폼 컨트롤과 버튼은 **네이티브 요소 + CSS 클래스**로 제공하고, 캡슐화할 행동이 있는 것만 태그로 만든다.

같은 근거로 light DOM 렌더(`createRenderRoot() { return this }`)도 택하지 않았다. 캡슐화를 버리면서 결국 전역 CSS 를 쓰게 되므로, 클래스에 태그 껍데기만 씌운 것이 된다.

## 3. 패키지 층 구조

```
@neosimplix/common-ui
├── ./tokens.css      디자인 토큰                        (있음)
├── ./controls.css    .ns-* 클래스 7종                    (신규)
├── ./react           얇은 React 컴포넌트 + 태그 래퍼      (확장)
├── .                 웹 컴포넌트 등록 진입점              (확장)
└── ./umd             UMD 번들                            (있음)
```

순수 HTML 소비자는 `controls.css` 를 링크하고 클래스를 직접 쓴다. React 소비자는 `./react` 에서 전부 가져온다.

### 3.1 React 호출부는 바뀌지 않는다

`dashboard-shell/components/ui/Input.tsx` 는 이미 *클래스를 붙이는 18줄짜리 함수*다. 그것을 그대로 라이브러리로 옮긴다.

```tsx
// src/react/controls/Input.tsx
export function Input({ invalid = false, className, ...rest }: InputProps) {
  return (
    <input
      className={cx("ns-input", className)}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
}
```

소비자는 import 경로만 바꾼다.

```tsx
// before
import { Input } from "@/components/ui";
// after
import { Input } from "@neosimplix/common-ui/react";

<Input value={name} onChange={(e) => setName(e.target.value)} required />   // 동일
```

`cx` 는 공개하지 않는다. 여섯 줄짜리고, 공개하면 유지 의무가 생긴다.

### 3.2 순수 HTML

```html
<link rel="stylesheet" href="node_modules/@neosimplix/common-ui/dist/tokens.css">
<link rel="stylesheet" href="node_modules/@neosimplix/common-ui/dist/controls.css">

<div class="ns-card">
  <ns-page-heading heading="Dashboard" description="회사 구글 계정으로 로그인하세요."></ns-page-heading>
  <a class="ns-button ns-button--outline ns-button--full" href="/api/auth/google/start">
    <ns-icon name="google"></ns-icon>
    Google 계정으로 로그인
  </a>
</div>
```

`<a>` 에 버튼 클래스가 그대로 붙는다. `ButtonLink` 를 위한 CSS 중복이 필요 없는 이유다.

## 4. 클래스 7종

### 4.1 이름 규칙

**클래스 이름은 `ns-` 접두사를 쓴다.** 전역 이름공간이라 `.input` 은 소비자 CSS 와 충돌한다. 토큰(접두사 없음)과 반대 방향이므로 규칙 문서에 명시한다.

**클래스 수를 최소화한다.** 요소 타입으로 특정할 수 있으면 자손 선택자를 쓴다. 순수 HTML 사용자가 외워야 하는 이름을 줄이는 것이 목적이다.

```css
.ns-checkbox input { width: 1rem; height: 1rem; accent-color: var(--color-accent); }
```

**`invalid` 는 클래스가 아니라 `aria-invalid` 로 스타일한다.**

```css
.ns-input[aria-invalid="true"] { border-color: var(--color-danger); }
```

React 컴포넌트가 이미 `aria-invalid={invalid || undefined}` 를 낸다. 변형 클래스가 input · select · textarea 세 곳에서 사라지고, 순수 HTML 사용자는 붙여야 마땅한 속성을 붙이면 스타일이 따라온다. 빨간 테두리만 원하고 화면낭독기에는 안 알리는 조합은 불가능해지는데, 그건 막는 것이 맞다.

**상태 변형은 `:has()` 로 잡는다.** `.ns-checkbox--disabled` 대신 `.ns-checkbox:has(:disabled)`. 참고 구현의 `Select` 가 이미 `:has()` 를 쓰고 있어 선례가 있다.

### 4.2 목록

| 클래스 | 변형 | React |
|---|---|---|
| `.ns-button` | `--solid` `--outline` `--ghost` `--icon` · `--sm` `--md` · `--full` | `Button` `ButtonLink` |
| `.ns-input` | 없음 (`[aria-invalid]` · `:disabled` · `::placeholder`) | `Input` |
| `.ns-select` | 없음 (`:has(option[value=""]:checked)` 로 플레이스홀더 흐리게) | `Select` |
| `.ns-textarea` | 없음 | `Textarea` |
| `.ns-checkbox` | `__hint` 만 명시 | `Checkbox` |
| `.ns-field` | `__label` `__hint` `__error` | `Field` |
| `.ns-card` | 없음 | `Card` |

값 · 치수는 전부 `tokens.css` 의 토큰을 참조한다. **`var()` 폴백을 쓰지 않는다** — 기존 규칙 그대로다.

`checkbox` 와 `field` 는 자식이 여럿이라 마크업을 확정해 둔다. 요소 타입으로 특정되는 것은 자손 선택자로, 구분이 안 되는 것만 클래스로 잡는다.

```html
<!-- .ns-checkbox — label 은 요소 타입으로, hint 는 span 이 둘이 될 수 있어 클래스로 -->
<label class="ns-checkbox">
  <input type="checkbox" checked>
  <span>사용자 목록 조회</span>
  <span class="ns-checkbox__hint">부서 기본</span>
</label>

<!-- .ns-field — hint 와 error 가 둘 다 span 이라 양쪽 모두 클래스가 필요하다 -->
<div class="ns-field">
  <label class="ns-field__label" for="email">이메일</label>
  <input class="ns-input" id="email" aria-invalid="true" aria-errormessage="email-error">
  <span class="ns-field__error" id="email-error">@neosimplix.com 계정만 사용할 수 있습니다.</span>
</div>
```

`.ns-field__label` 은 자손 선택자로도 되지만(`<label>` 하나뿐이다), `.ns-checkbox` 의 `<label>` 이 역할이 정반대(행 전체를 감싼다)라 이름을 붙여 구분한다.

### 4.3 참고 구현에서 그대로 옮기는 것

- `.ns-button` 은 `<button>` 과 `<a>` 가 공유하므로 `text-decoration: none` 과 `box-sizing: border-box` 가 필요하다. `--icon` 은 정사각 패딩만 쓰고 size 변형과 함께 쓰지 않는다
- `.ns-textarea` 는 `font-family: inherit` 이 있어야 monospace 로 뜨지 않고, `resize: vertical` 로 가로 확장을 막는다
- `Field` 는 `cloneElement` 구현을 그대로 옮긴다. hint/error 를 `<label>` 밖에 두고 id 로 연결하는 이유(감싸면 hint/error 가 accessible name 에 들어간다), `error` 가 있으면 `hint` 를 감추는 이유, `cloneElement` 에 필요한 키만 골라 넣는 이유가 그 파일 주석에 있다. 함께 옮긴다
- `Select` 는 `placeholder` 를 `<option value="" disabled>` 로 렌더하고 `options` 배열을 받는다
- `Textarea` 의 `rows` 기본값 3

### 4.4 순수 HTML 에서 `Field` 의 id 연결은 소비자 책임

`Field` 의 접근성 배선(`for`/`id`/`aria-describedby`/`aria-errormessage`)은 React 컴포넌트가 `useId` + `cloneElement` 로 처리한다. 순수 HTML 에는 그 수단이 없다.

`ns-field` 를 light DOM 커스텀 엘리먼트로 만들어 자식을 훑어 배선하는 방안을 검토했으나 택하지 않았다. React 가 error 를 붙이거나 떼면 다시 배선해야 해서 `MutationObserver` 가 필요하고(약 60줄), 그 복잡도가 순수 HTML 소비자 편의보다 크다.

→ **`.ns-field` 는 레이아웃 클래스만 제공한다.** 순수 HTML 소비자가 `id` · `for` · `aria-describedby` 를 직접 적는다. 빠뜨려도 경고가 없다는 것이 수용한 한계다(§9).

### 4.5 Tailwind cascade layer — 소비자에게 한 줄을 요구한다

Tailwind v4 는 preflight 를 `@layer base`, 유틸을 `@layer utilities` 에 넣는다. **레이어에 들지 않은 스타일은 레이어에 든 스타일을 항상 이긴다** — 순서와 무관하게.

| `controls.css` 를 | preflight 와의 관계 | 유틸 오버라이드 |
|---|---|---|
| 레이어 없이 두면 | 이긴다 | **막힌다.** `className="px-6"` 이 `.ns-button` 의 패딩을 못 이긴다 |
| `@layer ns-controls` 로 감싸면 | **진다.** preflight 가 스타일을 지운다 | 된다 |

소비자가 현재 `className` 으로 유틸을 넘겨 오버라이드하고 있으므로 둘 다 필요하다. 해결은 레이어 순서를 소비자가 한 줄 선언하는 것이다.

```css
/* 소비자 globals.css — Tailwind import 보다 위 */
@layer theme, base, ns-controls, components, utilities;
@import "tailwindcss";
```

`controls.css` 는 `@layer ns-controls { … }` 로 감싸 배포하고, 이 한 줄을 README 와 `index.html` 에 **필수 항목**으로 적는다. 순수 HTML 은 경쟁자가 없어 영향이 없다.

`tokens.css` 와 같은 성질의 요구사항이지만 **JS 로 감지할 방법이 없다.** `warnIfTokensMissing()` 같은 안전망을 만들 수 없고 문서로만 지킨다. 유일한 확인 수단은 `index.html` 에서 유틸이 클래스를 이기는지 눈으로 보는 것이다.

## 5. 태그 4종

### 5.1 `title` 을 속성 이름으로 쓰지 않는다

`title` 은 모든 HTML 요소의 전역 속성이고 브라우저가 툴팁을 띄운다. `<ns-page-heading title="Dashboard">` 는 제목에 마우스를 올리면 툴팁이 뜨고, `<ns-dialog title="사용자 승인">` 은 대화상자 전체가 툴팁을 갖는다. `@property` 로 `HTMLElement.prototype.title` 을 덮어도 결과는 같다.

→ 속성 이름은 **`heading`** 이다.

React 쪽 프롭은 `title` 을 유지한다. 클래스용 React 컴포넌트를 이미 손으로 쓰고 있으니, `heading` 으로 넘기는 얇은 shim 하나로 소비자 호출부 21곳(PageHeading 8 + Dialog 13)이 바뀌지 않는다.

### 5.2 `ns-icon`

| 프로퍼티 | 속성 | 타입 | 기본값 |
|---|---|---|---|
| `name` | `name` | string | `""` |

- 스프라이트는 TS 모듈 하나. 초기 수록은 `menu` · `google` · `close` 셋이다
- 크기는 호스트 CSS 로 정한다. `:host { display: inline-flex; width: 1.25rem; height: 1.25rem }`, 내부 `svg` 는 `width: 100%; height: 100%`. 바깥에서 `ns-icon { width: 1rem }` 로 덮는다
- `color` 는 shadow 경계를 넘어 상속되므로 `currentColor` 가 동작한다. `google` 은 브랜드 규정상 색이 고정이라 토큰을 쓰지 않는다
- 호스트에 `aria-hidden="true"`. 의미를 가져야 하면 소비자가 `role="img" aria-label="…"` 을 붙인다
- 없는 `name` 은 아무것도 렌더하지 않고 `console.warn` 을 한 번 낸다
- **아이콘 전부가 번들에 들어간다.** 셋이면 무시할 수준이다. 늘어나면 서브패스 분리를 재검토한다

### 5.3 `ns-page-heading`

| 프로퍼티 | 속성 | 타입 | 기본값 |
|---|---|---|---|
| `heading` | `heading` | string | `""` |
| `description` | `description` | string | `""` |

`<h1>` 로 고정한다. 로그인 카드 안에서도 그 페이지의 유일한 제목이라 h1 이 맞고, 참고 구현도 그렇다. `description` 이 빈 문자열이면 `<p>` 를 렌더하지 않는다.

소비자 실사용 8곳의 `description` 은 전부 평문 문자열이다(`app/onboarding/page.tsx:48` 의 `user?.email` 포함). 마크업이 들어간 곳이 없어 속성으로 충분하다.

### 5.4 `ns-skeleton`

| 프로퍼티 | 속성 | 타입 | 기본값 |
|---|---|---|---|
| `width` | `width` | string | `100%` |
| `height` | `height` | string | `1rem` |
| `radius` | `radius` | string | `control` |

- `radius` 는 토큰 이름(`badge` `control` `panel` `card` `pill`)을 받아 해당 토큰을 참조한다. 목록에 없으면 원시 CSS 값으로 그대로 쓴다
- 호스트에 `aria-hidden="true"`
- **`prefers-reduced-motion: reduce` 에서 맥박 애니메이션을 멈춘다.** 참고 구현에 없던 것이고, 이 설정이 겨냥하는 종류의 애니메이션이다

참고 구현은 크기를 `className="h-9 w-40 rounded-md"` 로 받는다. 순수 HTML 에는 Tailwind 유틸이 없어 인라인 스타일이 되므로 프로퍼티로 바꾼다. 실사용은 `components/shell/Sidebar.tsx:89` 한 곳뿐이고 그 자리는 기존 스펙에서 이미 slot 으로 옮기기로 되어 있어, API 를 바꾸는 비용이 사실상 없다.

### 5.5 `ns-dialog`

| 프로퍼티 | 속성 | 타입 | 기본값 |
|---|---|---|---|
| `heading` | `heading` | string | `""` |
| `open` | 없음 (프로퍼티 전용) | `boolean \| undefined` | `undefined` |
| `defaultOpen` | `default-open` | boolean | `false` |
| `noBackdropClose` | `no-backdrop-close` | boolean | `false` |

| slot | 위치 |
|---|---|
| (기본) | 본문 |
| `footer` | 하단. 우측 정렬 + 간격이 내장 |

| 이벤트 | detail |
|---|---|
| `ns-dialog-close` | `{ reason: "escape" \| "close-button" \| "backdrop" }` |

| 메서드 | 동작 |
|---|---|
| `show()` | 비제어일 때만 연다. 제어 중이면 `console.warn` 한 번 내고 아무것도 하지 않는다 |
| `close()` | 같다 |

메서드가 필요한 이유는 순수 HTML 이다. 여는 것은 트리거가 있어야 하므로 `document.querySelector('ns-dialog').show()` 한 줄로 끝나야 한다. 제어 모드에서 이 메서드가 상태를 바꾸면 §6 의 desync 함정으로 바로 들어가므로 막는다.

**`footer` slot 이 실질적인 이득이다.** 소비자 13곳이 `<div className="mt-6 flex justify-end gap-2">` 를 손으로 적고 있다. slot 스타일이 그것을 흡수한다.

**네이티브 `<dialog>` 를 `showModal()` 로 연다.** 포커스 트랩 · Esc · 배경 inert · top layer · `::backdrop` 을 브라우저가 처리한다. `open` 속성으로 열면 그 전부를 잃는다.

**Tailwind preflight 가 `margin: 0` 을 밀어 가운데 정렬을 죽인다.** shadow 안이라 preflight 가 닿지 않지만, `margin: auto` 를 명시해 둔다. 참고 구현이 실제로 물린 함정이다.

**폼은 안전하다.** slot 된 `<form>` 과 그 안의 네이티브 입력은 전부 light DOM 에 있어 제출 · 검증 · 자동완성이 정상 동작한다. 모달의 포커스 트랩은 flat tree 를 따라가므로 slot 된 내용도 포함한다.

**닫기 버튼은 shadow 안이라 `.ns-button` 을 쓸 수 없다.** `ns-icon name="close"` + 자체 스타일 약 10줄로 처리한다. §9 의 중복이 실제로 발생하는 유일한 자리다.

#### backdrop 클릭 닫기

기본으로 켠다. `no-backdrop-close` 로 끈다.

backdrop 은 요소가 아니다(`::backdrop` 은 의사 요소). 배경을 클릭하면 이벤트 타깃이 `<dialog>` 자신이 된다. shadow 안에서도 동작한다 — 리스너는 shadow 의 `<dialog>` 에 붙고, slot 된 본문 클릭은 light DOM 노드가 타깃이라 구분된다.

함정이 둘 있다.

1. **드래그로 텍스트를 선택하다 밖에서 손을 떼면 닫힌다.** `mousedown` 은 본문, `mouseup` 은 backdrop 이면 `click` 타깃이 `<dialog>` 가 된다. → `mousedown` 타깃을 기억해 **둘 다** 밖이었을 때만 닫는다
2. **대화상자 자기 표면(`border-radius` 모서리)을 클릭해도 타깃이 `<dialog>` 다.** → `e.target` 대신 좌표를 `getBoundingClientRect()` 와 비교한다

```ts
#downOutside = false;

#onMouseDown = (e: MouseEvent): void => {
  this.#downOutside = this.#isOutside(e);
};

#onClick = (e: MouseEvent): void => {
  if (this.noBackdropClose) return;
  if (!this.#downOutside || !this.#isOutside(e)) return;
  this.#requestClose("backdrop");
};

/* 좌표로 판별한다 — e.target 만 보면 모서리 클릭이 backdrop 으로 잡힌다. */
#isOutside(e: MouseEvent): boolean {
  const r = this.#dialog.getBoundingClientRect();
  return e.clientX < r.left || e.clientX > r.right
      || e.clientY < r.top  || e.clientY > r.bottom;
}
```

## 6. 상태 소유 — 제어와 비제어

기존 규칙은 "컴포넌트는 자기 상태를 절대 바꾸지 않는다" 였다. 근거는 실재한다 — 컴포넌트가 스스로 값을 뒤집으면 React 는 그걸 모르고 다음 렌더에서 예전 값을 다시 내려보내 화면이 튀거나 클릭이 씹힌다.

그 함정이 발동하는 조건은 **소비자가 그 값의 진실 원천을 들고 있을 때**뿐이다. 소비자가 아예 안 건드리면 튈 대상이 없다. 네이티브 HTML 이 이 구분을 쓴다 — `<input value>` 는 제어, `<input defaultValue>` 는 비제어, `<details open>` 은 스스로 뒤집는다.

→ 규칙을 이렇게 바꾼다.

> **소비자가 상태 프로퍼티를 설정했으면(제어) 컴포넌트는 그것을 바꾸지 않는다.**
> **설정하지 않았으면(비제어) 컴포넌트가 스스로 관리하고, 이벤트는 양쪽 모두 낸다.**

구현은 `undefined` 를 센티널로 쓴다.

```ts
@property({ type: Boolean }) open?: boolean;                                  // 제어. 속성 없음
@property({ type: Boolean, attribute: "default-open" }) defaultOpen = false;  // 비제어 초기값
```

**속성 짝을 나누는 것이 핵심이다.** `open` 하나로 겸용하면 순수 HTML 의 `<ns-dialog open>` 이 제어 모드로 들어가 **스스로 닫히지 않는다.** 그래서 `open` 은 프로퍼티 전용이고, 초기값은 `default-open` 속성이다.

### 6.1 제어 모드의 재조정

`updated()` 에서 `this.open` 과 내부 `<dialog>.open` 을 매번 맞춘다. Esc 로 네이티브 대화상자가 닫혔는데 소비자가 `open` 을 `true` 로 두면 **다시 열린다** — 그것이 제어의 정의다.

참고 구현에는 이 재조정이 없다. Esc 를 누르면 화면은 닫히고 React state 는 열린 채로 어긋난다. `onClose` 를 무시하는 소비자에게서만 드러나는 잠재 결함이다.

### 6.2 이번 범위에서 제어/비제어를 갖는 것

`ns-dialog` 하나다. `ns-icon` · `ns-page-heading` · `ns-skeleton` 은 상태가 없다. 클래스 7종은 소유할 상태가 아예 없다 — 값은 네이티브 요소가 갖는다.

`ns-header` · `ns-sidebar` 에 이 패턴을 적용하는 것은 별도 논의다(§10).

## 7. 검증

`npm run check` 가 넷이 된다.

```
① 라이브러리 타입    ② 소비자 관점 타입    ③ 이벤트 매핑    ④ 클래스 ↔ 문서 대조
```

### 7.1 새 검사 — `scripts/check-controls.mjs`

클래스 레이어에는 지금까지 없던 드리프트가 생긴다. **`controls.css` 에 클래스를 추가하고 문서에 안 적으면 아무도 모른다.** 타입 검사는 CSS 를 보지 않는다.

`controls.css` 의 모든 `.ns-*` 선택자를 뽑아 `index.html` 에 등장하는지 대조한다. 반대 방향도 본다 — `index.html` 이 존재하지 않는 클래스를 문서화하고 있으면 오타다.

**가짜 클래스를 넣어 실제로 실패하는지 확인한다.** 실패 이유가 의도한 것인지까지 본다.

`--modifier` 변형도 개별로 대조한다. `.ns-button--ghost` 를 문서에 빠뜨리는 것이 정확히 이 검사가 잡아야 하는 종류의 누락이다.

한계를 스크립트 주석에 적는다: 클래스가 *언급됐는지*만 보고 예시가 올바른지는 보지 못한다.

### 7.2 `docs/consumer-example.tsx`

React 컴포넌트 7종과 태그 4종을 전부 쓴다. 핵심은 `onNsDialogClose` 에서 **`e.detail.reason` 을 실제로 읽는 것**이다. `EventName<>` 캐스트가 빠졌는지는 소비자 관점 타입 검사에서만 드러난다.

### 7.3 `index.html`

섹션 11개가 늘어난다. 클래스와 태그는 문서 구조가 다르다.

| | 클래스 섹션 | 태그 섹션 |
|---|---|---|
| 표 | 클래스 · 변형 목록 | 프로퍼티 · slot · 이벤트 |
| 예시 | HTML 마크업 + React 컴포넌트 | HTML + React |

`<link>` 가 둘로 늘어나고, **Tailwind 레이어 순서 한 줄이 필수 항목으로 들어간다.**

기존 구조 검사는 그대로 유지한다 — `<script>` 개수, `</script>` 위치, `document.addEventListener` 부재.

### 7.4 사람이 눈으로 확인할 목록

구현 서브에이전트는 화면을 볼 수 없다. 아래는 **하지 않은 확인을 했다고 적으면 안 되는 항목**이다.

- 네이티브 폼 제출 — `AdminLoginForm` 을 JS 끈 상태로
- 브라우저 자동완성 · 비밀번호 관리자
- 한글 IME 조합. 네이티브가 처리하지만 실제로 되는지 본다
- `ns-dialog` — Esc · backdrop 클릭 · 드래그 선택 후 밖에서 손 떼기 · 제어 모드에서 Esc 후 다시 열리는지
- `prefers-reduced-motion` 에서 skeleton 이 멈추는지
- **Tailwind 유틸이 `.ns-card` 를 이기는지.** 레이어 순서가 맞았는지의 유일한 확인 수단이다

## 8. 함께 갱신하는 문서와 설정

| 파일 | 추가 내용 |
|---|---|
| `.claude/rules/library-invariants.md` | 클래스는 `ns-` 접두사 · `invalid` 는 `aria-invalid` 로 스타일 · `title` 을 속성 이름으로 쓰지 않는다 · 제어/비제어 짝(`open` 프로퍼티 / `default-open` 속성) |
| `docs/gotchas.md` | `title` 툴팁 · Tailwind 레이어와 preflight · backdrop 의 mousedown 함정 · `controls.css` 가 shadow 에 닿지 않는다 · **FACE 를 쓰지 않은 이유**(§2) |
| `docs/project-structure.md` | 층 구조 · 새 진입점 · 명령 |
| `.claude/skills/adding-a-component/SKILL.md` | **클래스를 추가할 때의 체크리스트를 따로 만든다.** 태그와 연결 지점이 다르다 |
| `package.json` | `./controls.css` export 추가 |
| `scripts/copy-tokens.mjs` | `copy-css.mjs` 로 확장. `tokens.css` + `controls.css` 를 `dist/` 로 복사 |
| `vite.config.ts` | **`react` external 을 정규식으로 바꾼다** (아래) |

### 8.1 `react/jsx-runtime` 이 external 에 걸리지 않는다

`tsconfig.json` 은 이미 `"jsx": "react-jsx"` 다. 그 트랜스폼은 `import { jsx as _jsx } from "react/jsx-runtime"` 를 넣는다.

그런데 `vite.config.ts` 의 react 설정은 이렇다.

```ts
external: ["react", "react-dom", ...litExternal],
```

**Rollup 의 문자열 external 은 모듈 지정자와 정확히 일치해야 한다.** `"react"` 는 `"react/jsx-runtime"` 을 잡지 못한다. 지금은 `src/react/index.ts` 가 JSX 를 쓰지 않아 드러나지 않지만, 클래스용 React 컴포넌트가 JSX 를 쓰는 순간 **jsx-runtime 이 `dist/react.js` 에 번들된다.** 소비자 앱에 React 런타임이 두 벌 생긴다.

`litExternal` 이 정규식이어야 했던 것과 **완전히 같은 결함**이다. `gotchas.md` 의 "Vite 의 `external` 은 문자열이면 정확히 일치해야 한다" 항목이 이미 그 교훈을 적어두고 있는데, react 쪽에는 적용되지 않았다.

```ts
const reactExternal = [/^react(\/.*)?$/, /^react-dom(\/.*)?$/];
```

`peerDependencies` 에 있으므로 소비자가 이미 갖고 있다. `gotchas.md` 의 해당 항목에 react 사례를 덧붙인다.

## 9. 수용한 한계

- **순수 HTML 에서 `Field` 의 id 연결은 소비자 책임이다.** 빠뜨려도 경고가 없다
- **Tailwind 레이어 순서를 JS 로 감지할 수 없다.** 문서로만 지킨다
- **`controls.css` 는 shadow 안에 도달하지 않는다.** `ns-dialog` 의 닫기 버튼이 `.ns-button` 을 쓸 수 없어 자체 스타일 약 10줄이 중복된다. 값을 두 곳에 두는 것은 `gotchas.md` 가 경고하는 함정이지만, 한 자리 열 줄은 우회 비용보다 싸다. **`table` 스펙에서 다시 본다** — 거기서는 체크박스와 버튼이 여러 개라 중복이 커진다
- **아이콘 전부가 번들에 들어간다.** 트리 셰이킹되지 않는다
- **레이아웃 여백을 제공하지 않는다.** 참고 구현의 `className="mt-8"` 같은 것은 소비자 몫이다. 순수 HTML 소비자는 인라인 스타일이나 자기 CSS 를 쓴다. 태그로 만들어도 풀리지 않는 별개 사안이다
- **`aria-invalid` 로 스타일하므로 시각적 invalid 와 접근성 invalid 를 분리할 수 없다.** 의도된 제약이다

## 10. 이번 범위 밖

- **`table`** — 다음 스펙. 정렬 · 페이징 · 선택, 셀 커스터마이징(참고 구현의 `문의`/`수정`/`삭제` 버튼 같은 것), 서버 페이징 지원 여부, 선택 상태의 제어/비제어, 그리고 shadow 안에서 `.ns-checkbox` · `.ns-button` 을 재사용하는 문제. **이 스펙이 먼저 끝나야 한다** — 테이블이 그 두 클래스를 쓴다
- **`ns-header` · `ns-sidebar` 의 비제어 지원** — 토글을 소비자 코드 없이 동작시키는 것. 지금 소비자 코드가 필요한 진짜 이유는 두 컴포넌트가 서로 남남이어서 이벤트를 받아 *다른* 엘리먼트에 내려주는 일을 소비자밖에 할 수 없다는 것이다. 둘을 감싸는 것을 도입할지가 논의의 핵심이다
- **`dashboard-shell` 이관** — `components/ui/*` 삭제 후 패키지 re-export. `project-structure.md` 의 기존 "남은 일" 항목에 합친다
- **참고 구현에 있으나 요청 대상이 아닌 것** — `Avatar` · `StatusPill` · `DescriptionList` · `CenteredScreen` · `Message`. 필요해지면 같은 판정 기준(§1)을 적용한다
- **다크모드** — 기존 스펙과 동일하게 범위 밖. `controls.css` 도 토큰만 참조하므로 `[data-theme="dark"]` 블록을 채우면 따라온다
