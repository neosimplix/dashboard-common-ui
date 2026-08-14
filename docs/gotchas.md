# 함정과 그 이유

`.claude/rules/` 의 규칙들이 **왜** 그런지 적어둔다. 이유를 모르면 다음 사람이 되돌린다. 전부 이 저장소를 만들면서 실제로 물린 것들이다.

## 토큰을 컴포넌트 shadow 에 두면 오버라이드가 죽는다

컴포넌트 `:host` 에 토큰을 정의하면 소비자의 `:root` 재정의가 도달하지 않는다.

**상속은 그 요소에 선언이 하나도 없을 때만 동작한다.** `:host` 선언이 있으면 그것이 값을 정하고, 문서에서 상속돼 내려오던 값은 후보에도 들지 않는다. cascade layer 로도 못 바꾼다 — 레이어는 같은 요소에 적용된 선언들끼리 비교할 때만 관여하고, 선언 대 상속의 순서는 바꾸지 못한다.

파급 효과가 셋이다. 브랜드 색 교체가 `:root` 한 줄로 안 되고 컴포넌트 태그를 전부 나열해야 한다. `[data-theme="dark"]` 전환이 불가능해진다(shadow 안에서 조상을 보려면 `:host-context()` 가 필요한데 Chromium 전용이다). Tailwind 유틸과 값을 공유할 수 없어 hex 를 두 번 적게 된다.

→ 토큰은 문서 `:root` 에만 둔다. 컴포넌트는 이름만 참조한다.

## `var()` 폴백은 값을 두 곳에 만든다

`var(--ns-color-line, #e4e4e7)` 처럼 쓰면 hex 가 `tokens.css` 와 컴포넌트 양쪽에 존재한다. 시간이 지나면 어긋나고, 어긋나도 아무도 모른다.

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

→ `docs/consumer-example.tsx` 와 `tsconfig.consumer.json` 이 `check` 에 포함돼 있다. 이벤트를 가진 래퍼 **전부**에 핸들러를 붙여야 한다 — 둘만 붙였을 때 나머지 둘의 회귀가 조용히 통과한 적이 있다. `ns-dialog-close` 처럼 `consumer-example.tsx` 가 닿지 못하는 비공개 래퍼는 "인자 0개짜리 핸들러는 `EventName<>` 캐스트 검사를 무력화한다" 항목의 방식(shim 이 `e.detail` 을 직접 읽는 것)으로 같은 방어를 받는다.

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

## 분리된 동안 열려 있던 대화상자는 재연결해도 스스로 안 닫힌다

DOM 스펙의 node-removing 단계는 열린 모달을 문서에서 떼어낼 때 top layer 에서만
빼고 `dialog.open` 은 그대로 둔다. `ns-dialog` 를 열어 둔 채 다른 컨테이너로
옮기면(예: `appendChild` 로 재부모 교체) 재연결 시점에 `connectedCallback` 은
원래 `warnIfTokensMissing()` 만 부르고 끝났다. Lit 은 그 재연결에 새 갱신을
스스로 예약하지 않고, 설령 `updated()` 가 돌아도 `#isOpen && el.open` 은 이미
둘 다 true 라 아무 것도 안 하는 분기다. 결과: `:host { display: contents }`
안에서 `dialog` 가 백드롭도 `inert` 도 포커스 트랩도 없이 통상 흐름으로 그려진다.

"author 선언은 cascade origin 으로 UA 스타일시트를 이긴다" 의 닫힌 대화상자
누출과 같은 실패 유형이다 — 컴포넌트가 짜 둔 상태 재조정이 특정 경로(여기서는
분리→재연결)를 놓치면 네이티브 `dialog` 의 상태와 우리 상태가 어긋난다.

→ `connectedCallback` 에서 `dialogEl?.open` 이 참이면 먼저 `close()` 로 닫는다
(`#closedByUs` 를 세워 그 close 를 Esc 로 착각하지 않게 한다). 그 뒤
`requestUpdate()` 를 불러 `updated()` 가 `#isOpen` 을 보고 `showModal()` 로
다시 열게 한다.

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

## `tokens.css` 의 요소 선택자도 shadow 안에 닿지 않는다

`controls.css` 가 shadow 에 도달하지 못한다는 것은 위에 적혀 있다. **`tokens.css` 의 "정의 전 레이아웃 예약" 블록도 똑같다** — 그것도 문서 스타일시트의 요소 선택자다.

`ns-icon` 의 크기가 그 블록에만 있었다.

```css
ns-icon { display: inline-flex; width: 1.25rem; height: 1.25rem; }
```

`ns-dialog` 의 닫기 버튼은 자기 shadow 안에서 `<ns-icon name="close">` 를 쓴다. 그 아이콘에는 위 규칙이 **매치되지 않아** 크기가 없고, 내부 `svg { width: 100%; height: 100% }` 가 제약을 잃어 `.close` 버튼을 그대로 채웠다. × 하나가 대화상자를 뒤덮었다.

`ns-icon.styles.ts` 의 주석이 정확히 틀린 근거를 적고 있었다 — *"문서 트리의 선택자가 `:host` 를 이기므로 여기에 값을 두면 두 곳에 존재하게 된다."* 문서 안에서는 맞다. **다른 컴포넌트의 shadow 안에서는 문서 선택자가 적용조차 되지 않으므로, `:host` 가 죽은 중복이 아니라 크기를 줄 수 있는 유일한 곳이다.**

리뷰가 이것을 놓친 방식도 적어둘 값이 있다. Task 7 리뷰는 그 근거를 승인했고, Task 10 리뷰는 `icons.ts` 에 `close` 가 정의됐는지 확인했다. **둘 다 컴포넌트 하나씩만 봤다** — 아이콘이 *다른* 컴포넌트의 shadow 안에서 크기를 갖는지는 두 리뷰 사이에 떨어졌다.

→ shadow 경계를 넘겨야 하는 값은 **커스텀 프로퍼티로 내려보낸다.** 커스텀 프로퍼티는 상속되므로 문서·중첩 shadow 어디서든 도달한다.

```css
/* tokens.css :root — 값은 여기 한 곳 */
--ns-icon-size: 1.25rem;
```
```css
/* ns-icon.styles.ts :host — 그리고 tokens.css 의 요소 예약도 같은 var 를 참조 */
:host { width: var(--ns-icon-size); height: var(--ns-icon-size); }
```

`--ns-` 접두사인 이유는 패키지 내부 배선이기 때문이다. `:root` 에 두는 이유는 상속의 출발점이 문서여야 하기 때문이다. 소비자 override 는 `ns-icon { width: … }` 로 그대로 동작한다 — 문서 선택자가 `:host` 를 이긴다.

이 패턴은 사이드바가 `--ns-label-display` 로 접힘을 내려보내는 것과 같은 수단이다. 그때는 조상을 볼 수 없어서 썼고, 여기서는 선택자가 닿지 않아서 쓴다.

## Light DOM 에서 소비자 자식이 사라지는 두 경로

`ns-table` 은 소비자가 쓴 `<table>` 을 품는다. 그 자식이 사라지는 방법이 둘이고 서로 다르다.

**1. Lit 템플릿을 렌더하면 덮어써진다.** `createRenderRoot() { return this }` 로 light DOM 에 렌더하면 Lit 이 그 요소의 내용을 자기 템플릿으로 교체한다. 빈 템플릿이라도 그렇다.

**2. shadow root 가 생기면 가려진다.** `ReactiveElement` 의 **기본** `createRenderRoot()` 는 shadow root 를 만든다. shadow root 가 있으면 `<slot>` 이 없는 한 light DOM 자식이 렌더되지 않는다.

즉 `ReactiveElement` 를 상속하는 것만으로는 부족하다 — 그것은 1번만 막는다. `createRenderRoot` 재정의가 2번을 막는다.

**둘 다 에러 없이 빈 표가 된다.** `npm run check` 는 타입만 보므로 통과한다.

→ 소비자 자식을 품는 Light DOM 컴포넌트는 `ReactiveElement` 상속 **과** `createRenderRoot` 재정의 둘 다 한다. 자식이 없다면(`ns-pagination`) `LitElement` + 재정의로 충분하다.

## Light DOM 컴포넌트의 `static styles` 는 조용히 무시된다

`createRenderRoot` 를 재정의하면 Lit 의 `adoptStyles` 가 호출되지 않는다. `static styles` 를 적어도 아무 일도 일어나지 않고 경고도 없다.

→ Light DOM 컴포넌트에는 `.styles.ts` 파일을 만들지 않는다. 스타일은 `controls.css` 에 요소 선택자로 적는다. 그것이 오히려 이 컴포넌트들이 Light DOM 인 이유다 — `.ns-button` 을 재사용하려고 캡슐화를 포기한 것이다.

## `check-controls.mjs` 는 요소 선택자를 못 봤다

정규식이 `\.(ns-[a-z0-9_-]+)` 로 **점이 붙은 클래스만** 잡았다. `ns-table { overflow-x: auto }` 같은 요소 선택자는 그냥 빠졌다 — Light DOM 컴포넌트가 처음 들어오면서 드러났다.

정방향만 넓혔다. 역방향은 넣지 않는다 — 태그 이름은 `index.html` 전체에 정당하게 등장하므로(데모 마크업, 프로퍼티 표, 예시 블록) 역방향으로 보면 거짓 양성만 쏟아진다.

→ `controls.css` 에 새 규칙 형태가 들어올 때마다 이 검사가 그것을 보는지 확인한다. 검사가 못 보는 규칙은 문서 대조 밖에 있다.

## Light DOM 은 컴포넌트 인스턴스 사이의 경계도 없앤다

`ns-table` 이 `this.querySelectorAll("th[data-ns-sort-key]")` 로 정렬 헤더를 찾고 `target.closest("th[data-ns-sort-key]")` 로 클릭을 위임했다. shadow 컴포넌트라면 그것으로 충분하다 — 경계가 남의 것을 걸러준다.

**Light DOM 에는 그 경계가 없다.** 중첩된 `<ns-table>` 의 `<th>` 는 바깥 호스트의 `querySelectorAll` 에도 잡히고, 안쪽 헤더 클릭이 위로 버블해 바깥 핸들러의 `closest()` 에도 매치된다. 결과는 `ns-sort` 가 두 번 발생하고, "aria-sort 의 유일한 작성자" 를 자처하는 두 컴포넌트가 같은 속성을 두고 다투는 것이다. 선택 기능도 같다 — 바깥 표가 안쪽 행을 자기 3-상태에 세고 자기 것이 아닌 id 를 이벤트로 올린다.

→ **가장 가까운 호스트가 자기인지 확인한다.** `el.closest("ns-table") === this` 한 줄이고, 조회하는 모든 지점에 붙여야 한다. `closest()` 가 조상 사슬 전체를 걷고 Light DOM 에 그 걸음을 끊는 것이 없으므로, 중첩 아닌 경우 거짓 음성은 구조적으로 불가능하다.

이것이 캡슐화를 포기하고 `controls.css` 재사용을 얻은 거래의 청구서다. shadow 컴포넌트에는 없던 종류의 부담이다.

## `updated()` 는 남의 DOM 변경을 보지 못한다

컴포넌트가 소비자 DOM 의 속성을 관리하면(`aria-sort`, 전체 선택의 `checked`) 그 동기화를 언제 돌릴지가 문제가 된다. `updated()` 는 **반응형 프로퍼티가 바뀔 때만** 돈다.

소비자가 정렬과 무관한 이유로 — 칼럼 구성 변경, i18n, 페이지 이동 — `<thead>` 나 `<tbody>` 를 교체하면 새 노드에 아무것도 쓰이지 않는다. 다음 클릭이나 프로퍼티 변경까지 조용히 낡는다.

→ `MutationObserver` 로 `{ childList: true, subtree: true }` 를 관찰한다. **`subtree` 는 장식이 아니다** — `<thead>` 교체는 `<table>` 의 자식 변경이라 호스트에서 두 단계 아래고, 호스트의 `childList` 만으로는 놓친다.

**`attributes` 를 관찰하면 무한 루프가 된다.** 동기화가 `setAttribute` 를 쓰고, `setAttribute` 는 **값이 같아도** `MutationRecord` 를 큐에 넣는다. 지금은 주석만이 그것을 막는다.

## `<=` 비교는 NaN 을 통과시킨다

`ns-pagination` 이 `Math.ceil(total / perPage)` 로 페이지 수를 셌다. `perPage` 가 `0` 이면 `Infinity` 가 되어 `"Infinity"` 라는 글자가 버튼으로 렌더되고 "다음" 이 영원히 활성이었다. `total` 까지 `0` 이면 `NaN` 이 되는데, **NaN 비교는 항상 false** 라서 `if (pages <= 1) return nothing` 가드를 그냥 통과했다 — 문서가 조건 없이 보증하는 "1페이지 이하면 아무것도 렌더하지 않는다" 가 깨졌다. `#go` 의 no-op 가드도 `NaN === NaN` 이 false 라 실패해 `detail.page = NaN` 인 이벤트가 나갔다.

→ 양수 검사는 `!(x > 0)` 로 쓴다. **`x <= 0` 은 NaN 을 놓친다.**

→ 그리고 경고 플래그를 진단별로 나눈다. 하나를 공유하면 먼저 발생한 오설정이 다른 하나를 영구히 침묵시킨다.

## 한 변수만 고치면 같은 결함이 그대로 남는다 (위 항목의 후속)

위 항목은 처음에 `perPage` 만 막고 끝났다. `total` 은 무검사였고, 같은 나눗셈에 들어가므로 **같은 결함이 그대로 살아 있었다.** `total={parseInt(searchParams.get("total"))}` 가 파라미터를 못 찾으면 NaN 이고, 이것은 App Router 소비자의 가장 흔한 형태다. 결과도 같았다 — 번호 버튼 없이 이전·다음만 둘 다 활성인 nav 가 남고, 어느 쪽을 눌러도 `page: NaN` 이 나갔다.

고쳐진 항목의 문장이 "→ 양수 검사는 `!(x > 0)` 로 쓴다" 로 끝나 **이미 다 고쳐진 것처럼 읽혔다는 점이 더 나빴다.** 이 저장소가 이미 겪은 "코드와 문서가 각각 맞고 합쳐서 틀린" 유형이다.

→ **같은 식에 들어가는 입력은 전부 같이 막는다.** 하나만 막은 가드는 막지 않은 쪽으로 같은 값이 들어온다.

## `Math.min`/`Math.max` 는 NaN 을 정화하지 못한다

범위를 벗어난 페이지를 표시용으로 clamp 하는 코드가 `Math.min(Math.max(raw, 1), Math.max(pages, 1))` 이었다. `raw` 가 NaN 이면 `Math.max(NaN, 1)` 이 이미 NaN 이고 `Math.min(NaN, 5)` 도 NaN 이다 — **clamp 를 통과했는데 값이 그대로 NaN 이다.**

그래서 한 번 `#innerPage` 가 NaN 이 되면 `total` 이 정상값으로 돌아온 뒤에도 상태가 고착됐다. 번호 버튼은 렌더되는데 **어느 것에도 `aria-current` 도 `--outline` 도 붙지 않고**, 이전·다음은 계속 활성이며 계속 NaN 을 냈다.

→ 지금 `ns-pagination` 은 네 지점에서 함께 막는다.

| 지점 | 하는 일 |
|---|---|
| `#pages` | `!(perPage > 0)` · `!Number.isFinite(total) \|\| total < 0` 이면 진단별 플래그로 경고 한 번 내고 `0` 을 돌린다 → 아무것도 렌더하지 않는다 |
| `#current()` | `Number.isInteger(raw) && raw >= 1 && raw <= pages` 로 판정하고, clamp 를 `Number.isFinite(raw) ? … : 1` 로 감싼다. **`#pages >= 1` 이면 언제나 `1..#pages` 의 정수를 돌려준다** |
| `#go()` | `!Number.isInteger(page) \|\| page < 1 \|\| page > #pages` 면 no-op. `ns-page-change` 의 `page` 가 유한한 정수라는 것을 이 한 지점이 보증한다 |
| `willUpdate()` | `default-page` 가 1 이상 정수가 아니면 경고하고 seed 하지 않는다 (`default-page="abc"` → `Number("abc") = NaN`, `NaN !== 1` 이 true 라 옛 가드를 통과했다) |

→ **입구를 막고, 읽는 쪽에서 한 번 더 정화한다.** 입구만 막으면 놓친 입구 하나가 상태를 영구 고착시키고, 읽는 쪽만 정화하면 잘못된 값이 계속 저장된다. 정화한 값을 상태에 되쓰지는 않는다 — 렌더 중 상태 쓰기이고, 제어 모드에서 소비자 값과 서로 밀어내는 루프가 된다.

→ 범위 경고는 **모드마다 지목할 프로퍼티가 다르다.** 비제어에서 `raw` 는 소비자가 쓴 `page` 가 아니라 내부 값이므로, `page` 를 탓하면 존재하지도 않는 프로퍼티를 가리킨다. 그때 실제로 어긋난 것은 `total`·`per-page` 로 계산된 페이지 수다.

## `firstUpdated` 에서 seed 하면 첫 페인트가 그 값을 못 본다

`ns-pagination` 의 `default-page="4"` 가 화면에는 1을 현재 페이지로 그렸다. 내부 상태는 4였다. 그래서 첫 "다음" 클릭이 5가 아니라 **2로 갔다** — 렌더 시점의 `current`(=1)를 잡고 있던 클릭 클로저가 2를 요청했고, 중복 클릭 가드가 그 2를 `#current()`(=4)와 비교해 다르다고 판단해 통과시켰다.

Lit 의 첫 업데이트 순서는 `willUpdate` → `render` → `firstUpdated` → `updated` 다. `firstUpdated` 는 이름과 달리 **첫 렌더가 끝난 뒤**에 돈다. 거기서 상태를 seed 해도 아무도 두 번째 업데이트를 요청하지 않으므로 그 값은 다음 렌더까지 화면에 반영되지 않는다.

`ns-table` 과 `ns-dialog` 가 같은 자리에서 seed 하면서도 멀쩡한 것이 헷갈리는 지점이다. 기준은 렌더의 유무가 아니라 **눈에 보이는 결과가 어디서 나오는가**다. 그 둘은 `updated()` 에서 나온다 — `ns-table` 은 DOM 동기화, `ns-dialog` 는 `showModal()` 이고, `updated` 는 `firstUpdated` 다음이라 seed 한 값을 본다. 결과가 `render()` 의 반환값에 있는 컴포넌트만 자리가 다르다.

`willUpdate` 로 옮길 때 첫 업데이트에서만 돌게 `hasUpdated` 로 막는다. 이 플래그는 `firstUpdated` **직전**에 true 가 되므로 첫 `willUpdate` 만 false 를 본다. seed 대상이 반응형 프로퍼티가 아닌 `#private` 필드라 렌더 중 상태 쓰기 경고에도 걸리지 않고, 다시 그리지 않으니 1이 스쳤다 4로 바뀌는 깜빡임도 없다.

`ns-dialog` 의 "첫 업데이트 전에 부른 `show()` 가 조용히 사라진다" 와 같은 뿌리다. 둘 다 **Lit 이 첫 업데이트를 마이크로태스크로 미룬다**는 사실에서 나온다.

→ **비제어 초기값은 `willUpdate` 에서 seed 한다.** 단, 덮어쓰지 않는다 — 생성과 같은 태스크에서 소비자가 만진 프로퍼티가 먼저 와 있을 수 있다. `firstUpdated` 는 렌더가 없는 컴포넌트에서만 안전하다.

## 검사의 대상이 다른 이름공간과 이름을 공유하면 falsify 할 수 없다

`check-controls.mjs` 를 요소 선택자까지 넓히고 `ns-table` 로 깨뜨려 보려 했다. **실패하지 않았다.** 탈출구가 둘이었다. `.ns-table`(클래스)과 `ns-table`(요소)이 이름이 같아, 데모의 `class="ns-table"` 이 이미 문서화 집합을 채웠다. **그리고** 스크립트의 `TAG()` 폴백(`/<ns-table[\s>]|<code>ns-table<\/code>/`)이 있어, 그 클래스 겹침이 없었어도 데모의 실제 `<ns-table>` 마크업과 `<code>ns-table</code>` 언급이 독립적으로 통과시켰을 것이다. 새 판정 경로는 한 번도 실행되지 않았고, 그 사실을 통과가 감췄다.

→ **짝이 없는 합성 이름으로 falsify 한다.** `ns-probe-tag` 가 통하는 이유는 이 둘 중 **어느 쪽 탈출구도 없기** 때문이다 — 같은 이름의 클래스도, 실제 태그 마크업도 문서에 없다. CSS 에만 넣어 실패를 확인하고, 문서에 언급을 더해 통과를 확인하고, 언급만 지워 다시 실패를 확인한다. 가운데 단계가 "정규식이 실제로 뭔가를 매치한다" 를, 양쪽이 "판정이 공허하지 않다" 를 증명한다.

## 빌드 산출물을 private 필드 이름으로 grep 하면 항상 0 이다

esbuild 가 네이티브 `#private` 필드를 익명 `WeakMap`/`WeakSet` 헬퍼로 낮춘다. `grep -c '#innerPage' dist/index.js` 는 코드가 멀쩡해도 0 을 돌려준다.

→ 산출물 확인은 **살아남는 문자열**로 한다 — 경고 문구, 이벤트 이름, 클래스 이름. private 이름과 타입 어노테이션은 남지 않는다.

## 선택자 추출을 줄 기준으로 하면 조용히 새어 나간다

`check-controls.mjs` 의 첫 요소 선택자 정규식이 `/^[ \t]*(ns-[a-z-]+)[ \t]*[,{]/gm` 이었다. 줄 시작에 있고 바로 `,` 나 `{` 가 오는 형태만 잡는다. 그래서 `} ns-table {`(앞 규칙과 같은 줄), `ns-table[data-x] {`, `ns-table:hover {` 가 모두 **문서 대조에서 빠졌다** — 검사를 붙인 목적이 바로 그런 누락을 막는 것인데.

→ 줄이 아니라 **선택자 경계**에 앵커한다. `/(?:^|[};,])\s*(ns-[a-z0-9-]+)(?=[\s,{:[.])/gm`. 넓혀서 과하게 잡히면 "문서화하라" 는 **시끄러운 실패**가 되고, 좁아서 놓치면 **조용한 통과**가 된다. 검사에서는 전자가 안전한 방향이다.

**그래도 못 잡는 형태가 남아 있다.** 앞의 경계 집합이 `줄 시작 } ; ,` 뿐이고 뒤의 lookahead 가 `공백 , { : [ .` 뿐이라 그렇다. 실제로 돌려 확인한 결과는 이렇다.

| 형태 | 예 | |
|---|---|---|
| 줄 시작(들여쓰기 포함) · `}` · `;` · `,` 뒤 | `ns-table {` · `} ns-table {` · `a, ns-table {` | 잡힘 |
| 이름 뒤에 `[` `:` `.` `{` | `ns-table[data-x]` · `ns-table:hover` · `ns-table.foo` · `ns-table{` | 잡힘 |
| **공백을 둔** 결합자 | `ns-table > div {` · `+` · `~` | 잡힘 (결합자를 알아서가 아니라 **앞의 공백**이 lookahead 를 만족시킨다) |
| 공백 없는 결합자 | `ns-table>div {` · `ns-table+div` · `ns-table~div` | 놓침 |
| **자손 위치** — 이름이 선택자의 첫 요소가 아닐 때 | `div ns-table {` · `div > ns-table {` | 놓침 (앞이 경계 문자가 아니다) |
| **`{` 뒤 같은 줄** | `@media (…) { ns-table {` | 놓침 (`{` 가 경계 집합에 없다) |
| `:is()` · `:where()` · `:not()` 안 | `:is(ns-table, ns-pagination) {` | 놓침 (`(` 가 경계에 없고 `)` 가 lookahead 에 없다) |

앞의 둘(자손 위치, `{` 뒤 같은 줄)이 결합자보다 **큰 구멍**이다 — 미디어 쿼리 안의 규칙과 `.wrapper ns-table` 류는 실제로 쓸 만한 형태다.

지금 `controls.css` 에는 놓치는 형태가 하나도 없다(20여 개 형태를 직접 넣어 확인했다). 그래서 **현재 상태에서는 무해하고, 새 규칙을 그런 형태로 쓰는 순간 조용히 문서 대조 밖으로 나간다.** 요소 선택자를 새로 쓸 때는 이름을 선택자 맨 앞에 두고 앞뒤에 공백을 둔다.

## `index.html` 의 중복 id 하나가 배선 전체를 죽인다

`ns-table` 절이 데모 컨테이너에 `id="select-demo"` 를 붙였는데, 그 이름을 **이전 브랜치의 `.ns-select` 절**이 이미 쓰고 있었다. `getElementById` 는 문서 순서상 첫 번째를 준다 — `.ns-select` 컨테이너에는 `<ns-table>` 이 없으므로 `querySelector` 가 `null` 을 돌려주고 `.addEventListener` 가 `TypeError` 를 던졌다.

이 파일의 배선은 **클래식 `<script>` 하나**다. 예외 지점부터 아래 문장이 전부 실행되지 않는다. 실제로 `ns-select-change` 로그와 그 아래의 `ns-page-change` 로그가 **둘 다** 죽어 있었다. 새 기능 두 개의 이벤트가 실제로 발생하는지 확인할 방법이 문서에서 사라진 것이다.

**증상이 고약한 이유: 화면은 멀쩡해 보인다.** 데모 복제는 스크립트 맨 앞이라 렌더되고, 3-상태 체크박스도 페이지 버튼도 컴포넌트가 스스로 하는 일이라 정상 동작한다. 콘솔을 열지 않으면 "로그 문구가 안 바뀌네" 뿐이다.

**두 검증 경로 어느 쪽도 이것을 보지 못한다.** `npm run check` 는 `index.html` 의 JS 를 파싱하지 않고(`check-controls.mjs` 는 정규식으로 클래스 이름만 본다), 육안 확인은 **이 결함의 피해자**라 스스로를 검증할 수 없다. per-task 리뷰도 못 본다 — 새 id 는 그 Task 의 diff 안에서 유일하고, 충돌 상대는 다른 브랜치가 만든 절이다.

→ 새 절의 id 에는 **절 이름을 접두사로** 붙인다(`table-select-demo`, `table-both-sort-log`). 그리고 `verification.md` 의 `index.html` grep 목록에 중복 id 검사를 넣었다. 배선이 살아 있는지는 로그 문단이 실제로 바뀌는지로만 확인된다.

## 검사는 실패시켜 봐야 검사다

이 저장소에서 이 원칙으로 구멍 두 개를 찾았다. `check-events.mjs` 는 가짜 이벤트를 넣어 실패를 확인했고, 소비자 타입 검사는 캐스트를 되돌려 확인했다 — 그 과정에서 네 래퍼 중 둘만 검사하고 있다는 것이 드러났다.

**의도한 이유로 실패했는지까지 본다.** 다른 이유로 먼저 실패하면 목표한 속성은 여전히 검증되지 않은 것이다.

## 토큰 이름을 소비자와 공유하면 라이브러리가 캐스케이드에 종속된다

0.1.5 까지 토큰 이름에는 접두사가 없었다. 근거가 있었다 — 첫 소비자 `dashboard-shell` 의 25개 파일이 이미 `var(--space-3)` 형태로 그 이름들을 직접 참조하고 있었고, 이름을 그대로 두면 그 파일들이 한 줄도 바뀌지 않는다. 실제로 그 근거대로 동작했다.

**그 근거는 소비자가 하나라는 것을 전제한다.** 두 번째 소비자가 붙자 전제가 깨졌다. 그 프로젝트도 `--color-surface` 와 `--color-surface-hover` 를 쓰고 있었는데, 이름만 같고 값 체계가 달랐다 — 그쪽의 `surface` 는 카드 배경이 아니라 페이지 배경이었다. 두 정의가 같은 `:root` 를 두고 겹치므로 **어느 쪽이 이길지를 `@import` 순서가 정했다.** `tokens.css` 를 앞에 두면 셸의 카드가 페이지 배경색으로 칠해지고, 뒤에 두면 소비자 자기 컴포넌트가 셸 색을 입었다. 어느 배치에서도 한쪽은 틀린다.

여기에 이 저장소의 다른 규칙이 겹쳐 증상을 조용하게 만든다. **컴포넌트 스타일은 `var()` 폴백을 쓰지 않는다** — 값이 `tokens.css` 한 곳에만 존재하게 하는 옳은 규칙이고, 위의 "`var()` 폴백은 값을 두 곳에 만든다" 항목이 그 이유다. 폴백이 없으므로 컴포넌트는 **문서 `:root` 가 그 이름에 무엇을 넣어 뒀든 그대로 받는다.** 이름을 공유한다는 것은 곧 라이브러리의 렌더링 결과를 남의 캐스케이드에 맡긴다는 뜻이다. 이름이 겹치는 순간 라이브러리 안에는 그것을 막을 지점이 하나도 없다.

→ **모든 공개 토큰에 `--ns-` 를 붙인다.** 이름공간이 갈리면 임포트 순서가 결과를 바꾸지 않는다. 소비자 override 는 `:root { --ns-color-accent: … }` 로 그대로 동작한다 — 문서 선언이 이기는 성질은 접두사와 무관하다.

→ 원래의 근거였던 "이미 무접두사 이름을 쓰던 프로젝트" 는 `dist/aliases.css` 로 받는다. `scripts/copy-css.mjs` 가 `tokens.css` 에서 생성하므로 두 파일이 어긋날 수 없다. **그 파일은 임포트하는 순간 위의 충돌을 그대로 재현한다** — 무접두사 이름을 다시 문서 `:root` 에 정의하는 것이 하는 일의 전부이기 때문이다. 그래서 기본이 아니라 옵트인이고, 새 프로젝트는 임포트하지 않는다.

## `@lit/react` 는 반응형 프로퍼티를 서버 마크업에 싣지 않는다

`createComponent` 는 엘리먼트 클래스의 반응형 프로퍼티 이름을 알고 있다. 그 이름으로 들어온 prop 은 **가로채서** `React.createElement` 에 넘기지 않고, 대신 `useLayoutEffect` 안에서 DOM 프로퍼티로 설정한다. 속성이 아니라 프로퍼티로 설정하는 것이 옳은 동작이다 — 객체·배열도 넘길 수 있어야 하고, Lit 의 `reflect` 가 속성 쪽을 담당한다.

**서버에는 layout effect 가 없다.** `renderToString` 은 effect 를 실행하지 않으므로 Next 가 내려주는 HTML 의 `<ns-sidebar>` 에는 `open` 이 없다. `tokens.css` 의 정의 전 레이아웃 예약은 `open` 을 보고 너비를 정하는데, 그 속성이 없으니 접힘(4rem)으로 그렸다가 하이드레이션 직후 15rem 으로 벌어졌다. 소비자가 처음 보고한 증상이 이것이다.

**반응형이 아닌 이름은 가로채이지 않고 그대로 흘러간다.** `data-ns-open` 은 `ns-sidebar` 엘리먼트의 반응형 프로퍼티가 아니므로 `React.createElement` 의 props 에 남고, 서버 마크업에 문자 그대로 실린다. 통로는 이 한 가지 성질이 전부다.

예약 규칙이 `[open]` 이 아니라 `:not(:defined)` 를 봐야 하는 이유는 그다음 구간에 있다. `customElements.define` 은 모듈 평가 시점, 즉 `hydrateRoot` **보다 먼저** 실행된다. 그래서 타임라인이 셋으로 갈린다.

| 구간 | 너비를 잡는 것 |
|---|---|
| upgrade 전 | `tokens.css` 의 `ns-sidebar:not(:defined)` + `[data-ns-open]` |
| upgrade ~ hydration | `ns-sidebar.styles.ts` 의 `:host(:not([open]):not([data-ns-open]))` |
| hydration 이후 | `open` |

예약을 `:not(:defined)` 로 끊지 않으면 정의 이후까지 문서 규칙이 걸려 shadow 와 다툰다. 반대로 shadow 쪽이 `[open]` 만 보면 가운데 구간이 접힘으로 그려진다 — 예약이 없애려던 것과 **같은 튐이 창만 좁아진 채** 남는다. 정의 이후의 프레임은 `useLayoutEffect` 가 페인트 전에 잡으므로 안전하다.

부수 피해도 적어 둔다. 소비자는 이 튐을 라이브러리 밖에서 우회하고 있었다 — 사이드바를 래퍼 `<div>` 로 감싸고 거기에 너비와 트랜지션을 직접 준 것이다. 그러려면 `15rem`/`4rem` 과 트랜지션 지속시간을 소비자 코드가 복제해야 하고, 그 값들은 라이브러리 내부 상수라 다음 릴리스에 조용히 어긋난다. **라이브러리가 고치지 않으면 소비자가 라이브러리의 내부를 베낀다.**

## 슬롯 폴백은 배타가 자동이다

`ns-nav-item` 의 `badge` 는 프로퍼티였다. 프로퍼티는 값이 있으면 **항상** 렌더되므로, 아이콘을 넣고 싶은 소비자는 `badge` 를 비워야 한다는 것을 알아야 했다 — 코드가 강제하는 것이 아니라 문서가 부탁하는 관계다.

문서 문구가 그 부탁을 더 어렵게 만들었다. "접힌 레일에서 보이는 짧은 배지" 였는데, 이것이 **"접힘 전용"** 으로 읽힌다. 펼친 상태에서는 안 보이는 줄 알면 라벨과 같은 글자를 넣는 것이 자연스럽다. 소비자가 정확히 그렇게 했고, 펼친 사이드바에 "개요 개요" 가 나란히 떴다.

**이 저장소의 `index.html` 자신도 같은 상태였다.** 좌측 네비게이션이 `label="설치" badge="설치"` 로 "설치 설치" 를 렌더하고 있었다. 육안 확인이 회귀 확인 수단인 저장소에서, 매일 열어 보는 페이지가 그 결함을 띄운 채였다. **오해를 부르는 문구는 그것을 쓴 사람도 오해시킨다.**

→ **`leading` 슬롯을 만들고 `badge` 를 그 폴백 콘텐츠로 옮긴다.** `<slot>` 은 할당된 노드가 하나라도 있으면 폴백을 렌더하지 않는다 — 배타가 브라우저의 슬롯 알고리즘에서 나오므로 소비자 쪽에도 컴포넌트 쪽에도 분기 코드가 없다. `badge` 프로퍼티를 그대로 두고 `leading` 을 채우면 배지는 저절로 사라진다.

한계도 슬롯에서 온다. **폴백의 접근성은 슬롯에 들어온 것에 따라 달라진다.** 배지는 장식이라 컴포넌트가 `aria-hidden="true"` 를 직접 붙이지만, 슬롯에 들어오는 노드는 소비자 것이라 컴포넌트가 손댈 수 없다. `<ns-icon>` 은 자기 shadow 안의 `<svg>` 에 `aria-hidden` 을 두므로 그냥 넣어도 되고, 그 외의 장식 요소를 넣는다면 소비자가 직접 붙여야 한다.
