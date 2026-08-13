# 라이브러리 불변 규칙

이 저장소의 코드가 **항상** 만족해야 하는 것들이다. 이유와 배경은 `docs/gotchas.md` 에 있다.

## 이름

- 컴포넌트 태그는 `ns-` 접두사를 쓴다. (`ns-header`, `ns-sidebar`, `ns-nav-group`, `ns-nav-item`)
- **디자인 토큰 이름에는 접두사를 붙이지 않는다.** `dashboard-shell/app/globals.css` 와 같은 이름을 쓴다. (`--color-line`, `--space-3`)
- 패키지 내부 배선용 커스텀 프로퍼티만 `--ns-` 를 쓴다. (`--ns-label-display`)
- 이벤트는 `ns-` 접두사에 케밥 케이스, 대응하는 React prop 은 `on` + 파스칼 케이스다. (`ns-navigate` → `onNsNavigate`)
- **CSS 클래스 이름은 `ns-` 접두사를 쓴다.** 전역 이름공간이라 `.input` 은 소비자 CSS 와 충돌한다. 변형은 `--`, 하위 요소는 `__` 다. (`.ns-button--outline`, `.ns-field__error`)
- **`title` 을 속성/프로퍼티 이름으로 쓰지 않는다.** 모든 HTML 요소의 전역 속성이라 브라우저가 툴팁을 띄운다. 제목은 `heading` 이다. React 프롭만 `title` 을 유지하고 shim 이 변환한다.
- **shim 이 있는 태그는 이름이 셋이다.** Lit 클래스 별칭 `Ns<X>Element`, 내부 `createComponent` 래퍼 `Ns<X>Base`(비공개), 공개 shim `<X>`. shim 이 없는 태그는 래퍼가 평범한 이름을 갖는다.

## 컴포넌트

- **제어 중이면 그 값을 바꾸지 않는다.** 소비자가 상태 프로퍼티를 설정했으면(제어) 컴포넌트는 그것을 바꾸지 않고, 설정하지 않았으면(비제어) 스스로 관리한다. 이벤트는 양쪽 모두 낸다.
- **제어/비제어는 속성 짝으로 나눈다.** 제어는 프로퍼티 전용(`@property({ attribute: false })`), 비제어 초기값은 별도 속성(`default-open`). 하나로 겸용하면 `<ns-dialog open>` 이 제어 모드로 들어가 스스로 닫지 못한다.
- 모든 커스텀 이벤트는 `bubbles: true, composed: true` 다.
- `@customElement` 데코레이터를 쓰지 않는다. `src/internal/register.ts` 를 쓴다.
- 로직과 스타일을 파일 두 개로 나눈다. (`ns-x.ts` / `ns-x.styles.ts`)
- **호스트의 속성을 쓰지 않는다.** `setAttribute` 로 소비자가 쓴 속성을 덮으면 문서화된 override 가 조용히 죽는다. 숨길 것은 shadow 안의 요소에 붙인다.
- **shadow 스타일이 UA 기본값을 덮으면 되돌릴 규칙을 함께 둔다.** author 선언은 특정도와 무관하게 origin 으로 UA 를 이긴다.
- **React shim 은 이벤트 `detail` 을 실제로 읽는다.** 인자 0개 핸들러는 `EventName<>` 캐스트 누락을 감춘다.

## 스타일

- **토큰은 문서 `:root` 에만 정의한다.** 컴포넌트 shadow 의 `:host` 에 토큰을 정의하지 않는다.
- **컴포넌트 스타일에 `var()` 폴백을 쓰지 않는다.** 색·치수는 `tokens.css` 한 곳에만 존재한다. 유일한 예외는 `--ns-label-display`.
- `:host-context()` 를 쓰지 않는다. Chromium 전용이다.
- **`invalid` 는 클래스가 아니라 `[aria-invalid="true"]` 로 스타일한다.** `--invalid` 변형 클래스를 만들지 않는다.
- **`controls.css` 는 `@layer ns-controls` 로 감싼다.** 감싸지 않으면 소비자의 Tailwind 유틸 오버라이드가 막힌다.
- **shadow 컴포넌트는 `controls.css` 를 재사용할 수 없다.** 전역 스타일시트는 shadow 안에 도달하지 않는다. 필요한 최소한만 그 컴포넌트의 shadow 스타일에 다시 적는다.

## 빌드

- `tsconfig.json` 에 `experimentalDecorators: true` 와 `useDefineForClassFields: false` 가 **둘 다** 있어야 한다.
- `vite.config.ts` 의 `litExternal` 정규식을 유지한다. lit 계열은 문자열이 아니라 정규식으로 외부화한다.
- UMD 빌드만 lit 을 인라인한다. ES 빌드는 external 로 둔다.
- `package.json` 에 `sideEffects` 필드를 넣지 않는다. 진입점이 `customElements.define` 을 실행한다.

## 폼

- **폼 컨트롤과 버튼을 웹 컴포넌트로 만들지 않는다.** 네이티브 요소 + CSS 클래스로 제공한다. 이유는 `docs/gotchas.md` 의 "FACE 를 쓰지 않은 이유" 에 있다.
- **form-associated custom element(FACE)를 도입하지 않는다.** `static formAssociated` 와 `attachInternals()` 를 쓰지 않는다.
