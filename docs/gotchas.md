# 함정과 그 이유

`.claude/rules/` 의 규칙들이 **왜** 그런지 적어둔다. 이유를 모르면 다음 사람이 되돌린다. 전부 이 저장소를 만들면서 실제로 물린 것들이다.

## 토큰을 컴포넌트 shadow 에 두면 오버라이드가 죽는다

컴포넌트 `:host` 에 토큰을 정의하면 소비자의 `:root` 재정의가 도달하지 않는다.

**상속은 그 요소에 선언이 하나도 없을 때만 동작한다.** `:host` 선언이 있으면 그것이 값을 정하고, 문서에서 상속돼 내려오던 값은 후보에도 들지 않는다. cascade layer 로도 못 바꾼다 — 레이어는 같은 요소에 적용된 선언들끼리 비교할 때만 관여하고, 선언 대 상속의 순서는 바꾸지 못한다.

파급 효과가 셋이다. 브랜드 색 교체가 `:root` 한 줄로 안 되고 컴포넌트 태그를 전부 나열해야 한다. `[data-theme="dark"]` 전환이 불가능해진다(shadow 안에서 조상을 보려면 `:host-context()` 가 필요한데 Chromium 전용이다). Tailwind 유틸과 값을 공유할 수 없어 hex 를 두 번 적게 된다.

→ 토큰은 문서 `:root` 에만 둔다. 컴포넌트는 이름만 참조한다.

## `var()` 폴백은 값을 두 곳에 만든다

`var(--color-line, #e4e4e7)` 처럼 쓰면 hex 가 `tokens.css` 와 컴포넌트 양쪽에 존재한다. 시간이 지나면 어긋나고, 어긋나도 아무도 모른다.

토큰 미로드는 폴백이 아니라 `warnIfTokensMissing()` 경고로 잡는다. 그 함수는 프로브 **뒤에** 래치를 세운다 — 앞에 세우면 가장 먼저 연결되는 컴포넌트 하나의 판정이 영구 확정되고, `tokens.css` 가 JS 와 별도로 로드되므로 정상 페이지에 취소할 수 없는 거짓 경고가 남는다.

예외는 `--ns-label-display` 하나다. 패키지 내부 배선이고, 사이드바 밖에서 단독으로 쓰일 때를 위한 기본값이 필요하다.

## Vite 의 `external` 은 문자열이면 정확히 일치해야 한다

`external: ["lit"]` 는 `"lit"` 만 매치한다. 컴포넌트가 쓰는 `"lit/decorators.js"` 는 걸리지 않는다.

그러면 `@lit/reactive-element` 가 번들에 통째로 들어가고, 그 안의 `class ReactiveElement extends HTMLElement` 가 **모듈 평가 시점에** 실행된다. Node 에는 `HTMLElement` 가 없으므로 import 가 죽는다 — Next 의 서버 렌더링이 정확히 그 경로다. `register()` 의 SSR 가드는 정상이지만, **가드가 실행될 기회를 얻기 전에** 죽는다.

SSR 보다 더 나쁜 것이 있다. 소비자 앱에 `ReactiveElement` 가 두 벌 생긴다. `LitElement` 는 external `lit` 에서, 데코레이터는 번들된 사본에서 온다. Lit 이 "Multiple versions of Lit loaded" 를 경고하고 반응성이 조용히 깨질 수 있다. import 에러보다 훨씬 진단하기 어렵다.

→ 정규식으로 lit 계열 전체를 외부화한다. UMD 만 예외로 인라인한다 — 모듈 해석 없이 `<script src>` 로 브라우저가 직접 받는 산출물이다.

## 타입만 바뀐 수정도 태그를 다시 잘라야 한다

`as EventName<...>` 같은 타입 어노테이션은 컴파일 시 지워진다. 런타임 JS 는 한 글자도 안 바뀐다. 그래서 "소스 고쳤으니 됐다" 로 넘어가기 쉽다.

하지만 `.d.ts` 에는 남는다. 실제로 `v0.1.1` 태그가 `onNsToggle: string` 을 배포하고 있었다 — 소스는 고쳐진 뒤였는데도.

→ 타입이 바뀌면 재발행한다. 확인은 `git show <tag>:dist/react/index.d.ts`.

## `npm run check` 가 못 보는 영역이 있다

React 래퍼의 `events` 값은 라이브러리 안에서는 그냥 문자열이다. `EventName<>` 브랜딩이 빠져도 라이브러리 타입 검사는 통과한다.

`@lit/react` 는 값이 `EventName<T>` 로 브랜딩된 경우에만 핸들러를 `(e: T) => void` 로 타입한다. 평범한 문자열이면 `(e: Event) => void` 가 되고, 소비자의 `e.detail` 이 `TS2339` 로 죽는다.

이 결함은 열한 번의 Task 리뷰를 전부 통과했다. 소비자 관점에서 타입 체크를 돌려야만 드러난다.

→ `docs/consumer-example.tsx` 와 `tsconfig.consumer.json` 이 `check` 에 포함돼 있다. 네 래퍼 **전부**에 핸들러를 붙여야 한다 — 둘만 붙였을 때 나머지 둘의 회귀가 조용히 통과한 적이 있다.

## `<script type="text/plain">` 안의 `</script>`

HTML 파서는 `type` 속성과 무관하게 첫 `</script>` 에서 바깥 블록을 닫는다. 그 지점부터 페이지가 깨진다.

검사도 조심해야 한다. `grep -c '<script>'` 는 속성 없는 여는 태그만 세므로 이 위험을 재지 못한다. `</script>` 가 정당한 위치(자기 줄에 단독, 또는 `<script src=...></script>`) 밖에 나타나는지를 직접 찾아야 한다.

## Lit 데코레이터는 tsconfig 두 줄이 함께 필요하다

`experimentalDecorators: true` 와 `useDefineForClassFields: false` 중 하나라도 빠지면, 클래스 필드 초기화가 `@property` 가 만든 접근자를 덮어쓴다. 속성이 바뀌어도 리렌더가 일어나지 않는다. **에러는 나지 않는다.**

## Vite 는 배열 설정을 지원하지 않는다

`defineConfig([...])` 로 여러 빌드를 묶는 것은 Rollup 기능이다. Vite 에 넘기면 `config must export or return an object` 로 실패한다.

→ `--mode` 로 셋 중 하나를 고르고 `build` 스크립트가 세 번 호출한다. 환경 변수와 달리 Windows 에서도 동작한다.

## 접힘 전파는 `::slotted()` 로 밀어 내린다

컴포넌트의 shadow root 는 조상을 볼 수 없고 `:host-context()` 는 Chromium 전용이다. 그래서 자식이 "사이드바가 접혔는지" 를 알아낼 방법이 없다.

반대로 민다. 사이드바가 `::slotted(ns-nav-group)` 로 `--ns-label-display` 를 설정하면, 커스텀 프로퍼티가 flat tree 를 타고 그룹의 shadow, 그룹의 `<slot>`, nav item, 다시 그 shadow 까지 상속된다. 명시적으로 전달하는 코드가 한 줄도 없다.

한계도 여기서 온다. `::slotted()` 는 직계 자식만 매치하고 결합자를 받지 않는다. 그래서 그룹을 감싸거나 nav item 을 사이드바에 직접 넣으면 접어도 라벨이 남고, 그룹 간 여백을 `ns-nav-group + ns-nav-group` 으로 표현할 수 없어 `:host(:not(:first-child))` 를 쓴다.

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

## 컴포넌트가 호스트에 속성을 찍으면 문서화된 override 가 죽는다

`ns-icon` 이 `connectedCallback` 에서 `this.setAttribute("aria-hidden", "true")` 를 무조건 실행했다. 같은 커밋의 문서는 "의미가 필요하면 `aria-hidden` 을 지우고 `role="img" aria-label` 을 붙이라" 고 안내했다. **그 지시를 따라도 연결 시점에 다시 찍혀 요소가 접근성 트리에서 제거된다.** 에러는 없다.

각 파일은 옳았다. 코드는 "아이콘은 장식" 을 정확히 구현했고 문서는 override 를 정확히 안내했다. **둘이 서로를 무효화하는 것만 아무도 볼 수 없었다** — 타입 검사도, `check-events` 도, `check-controls` 도 코드와 문서가 같은 것을 말하는지는 검사하지 않는다.

→ **컴포넌트는 호스트의 속성을 쓰지 않는다.** 숨겨야 할 것이 있으면 shadow 안의 요소에 붙인다. `ns-icon` 은 `<svg>` 에, `ns-skeleton` 은 내부 막대에 `aria-hidden` 을 둔다. 호스트에 aria 속성이 없으면 소비자의 `role`/`aria-label` 이 싸울 상대 없이 동작한다.

## author 선언은 cascade origin 으로 UA 스타일시트를 이긴다

`ns-dialog` 의 shadow CSS 가 `dialog { display: flex }` 를 무조건 선언했다. UA 스타일시트는 `dialog:not([open]) { display: none }` 으로 닫힌 대화상자를 숨기는데 `!important` 가 아니다. **author 선언은 특정도와 무관하게 origin 으로 UA 를 이기고, shadow 트리 스타일도 author origin 이다.** 게다가 `:host { display: contents }` 라 호스트가 박스를 만들지 않아, 닫힌 대화상자의 제목·닫기 버튼·본문·footer 가 페이지에 그대로 떠 있었다. `index.html` 자신이 그 상태로 배포될 뻔했다.

같은 파일이 여덟 줄 아래에서 `.footer[hidden] { display: none }` 을 명시하며 *"`display: flex` 가 UA 의 `[hidden]` 규칙을 이기므로 되돌려야 한다"* 고 적고 있었다. **함정을 아는 것과 매번 적용하는 것은 다른 일이다.**

→ shadow 스타일이 UA 기본값을 덮으면 **되돌릴 규칙을 함께 둔다.** `dialog:not([open]) { display: none }` 은 `(0,1,1)` 이라 `(0,0,1)` 을 순서와 무관하게 이긴다.

## 인자 0개짜리 핸들러는 `EventName<>` 캐스트 검사를 무력화한다

`Dialog` shim 이 `onNsDialogClose={() => onClose()}` 였다. **인자 수가 적은 함수는 어떤 핸들러 타입에도 대입되므로** `(e: Event) => void` 와 `(e: CustomEvent<T>) => void` 를 구분하지 못한다. `NsDialogBase` 는 비공개라 `consumer-example.tsx` 가 그 prop 에 닿을 수도 없었다. 결과: 캐스트를 지워도 `npm run check` 가 통과했다.

`gotchas.md` 위쪽의 "`npm run check` 가 못 보는 영역" 항목이 이 방어를 만든 이유는 `v0.1.1` 이 실제로 `onNsToggle: string` 을 배포한 사고였다. `ns-dialog-close` 만 그 방어 밖에 있었다.

→ **shim 이 `e.detail` 을 실제로 읽는다.** `onClose: (reason) => void` 로 사유를 넘기면 캐스트가 라이브러리 코드에서 load-bearing 이 되고, 캐스트가 빠지면 **①번 검사**(`tsc -p tsconfig.json`)가 막는다. 예시 파일이 지워지면 사라지는 방어보다 강하다.

## Lit 은 첫 업데이트를 마이크로태스크로 미룬다

`ns-dialog` 의 `firstUpdated()` 가 `#innerOpen = this.defaultOpen` 로 무조건 대입했다. 생성과 같은 태스크에서 부른 `show()` 는 **항상** 그보다 먼저 실행되므로 조용히 덮였다. 경합이 아니라 결정론적이다.

```js
const d = document.createElement("ns-dialog");
document.body.append(d);
d.show();          // 무시된다
```

→ `firstUpdated` 에서 초기값은 **seed 만 한다.** `if (this.defaultOpen) this.#innerOpen = true;`

(`defaultOpen` 을 `connectedCallback` 이 아니라 `firstUpdated` 에서 읽는 이유는 별개다 — `createElement` 후 `setAttribute` 하는 경로에서는 `connectedCallback` 시점에 속성이 아직 없을 수 있다.)

## 포인터 좌표로 판별하면 키보드 클릭을 놓친다

`ns-dialog` 의 backdrop 판별이 `clientX/clientY` 를 `getBoundingClientRect()` 와 비교한다. **키보드로 활성화된 클릭은 좌표가 `0,0` 이고**, 대화상자는 가운데 정렬이라 `(0,0)` 은 항상 "밖" 이다. 여기에 `#downOutside` 플래그를 어느 경로에서도 지우지 않는 버그가 겹쳐, backdrop 에 mousedown 했다가 안에서 손을 뗀 뒤 footer 버튼을 Enter 로 누르면 `reason: "backdrop"` 으로 닫혔다.

→ 플래그는 **소비**한다(모든 종료 경로에서 지운다). 그리고 `e.detail === 0` 으로 키보드·프로그램 클릭을 걸러낸다 — 실제 마우스 클릭은 언제나 `detail >= 1` 이다.

## 클래스 하나는 클래스+타입 선택자에 진다

`.ns-checkbox span` 은 `(0,1,1)`, `.ns-checkbox__hint` 단독은 `(0,1,0)` 이다. **클래스 개수가 먼저 비교되므로 자손 선택자가 이기고**, hint 가 라벨과 같은 크기·색으로 렌더된다. 순서를 바꿔도 해결되지 않는다.

→ `.ns-checkbox .ns-checkbox__hint` `(0,2,0)` 로 쓴다. **그리고 이 확인은 구현자에게 맡길 수 없다** — `npm run check` 는 CSS 를 평가하지 않고 결과는 화면으로만 드러난다. 특정도 산수는 코드 리뷰가, 결과는 사람 눈이 본다.

## `check-controls.mjs` 의 역방향 검사는 클래스 전방 참조를 막는다

`.ns-textarea` 문서가 아직 만들지 않은 `.ns-field` 를 가리키자 "`controls.css` 에 없는 클래스가 `index.html` 에 있습니다" 로 `npm run check` 가 막혔다. 검사가 제 역할을 한 것이지만, 클래스를 하나씩 추가하는 동안 문서가 서로를 참조하면 순서에 걸린다.

→ 뒤에 올 클래스를 가리키는 문구는 그 클래스가 생긴 뒤에 넣는다. **CSS 주석 안의 언급은 안전하다** — 스크립트가 CSS 주석을 먼저 제거한다.

## Lit 템플릿 안의 HTML 주석은 shadow DOM 으로 렌더된다

`html` 태그 템플릿 안에 `<!-- … -->` 를 두면 인스턴스마다 그 주석이 shadow root 에 실려 나간다. 설명은 템플릿 **밖**에 `/* */` 로 둔다.

## 검사는 실패시켜 봐야 검사다

이 저장소에서 이 원칙으로 구멍 두 개를 찾았다. `check-events.mjs` 는 가짜 이벤트를 넣어 실패를 확인했고, 소비자 타입 검사는 캐스트를 되돌려 확인했다 — 그 과정에서 네 래퍼 중 둘만 검사하고 있다는 것이 드러났다.

**의도한 이유로 실패했는지까지 본다.** 다른 이유로 먼저 실패하면 목표한 속성은 여전히 검증되지 않은 것이다.
