# 라이브러리 불변 규칙

이 저장소의 코드가 **항상** 만족해야 하는 것들이다. 이유와 배경은 `docs/gotchas.md` 에 있다.

## 이름

- 컴포넌트 태그는 `ns-` 접두사를 쓴다. (`ns-header`, `ns-sidebar`, `ns-nav-group`, `ns-nav-item`)
- **디자인 토큰 이름에는 접두사를 붙이지 않는다.** `dashboard-shell/app/globals.css` 와 같은 이름을 쓴다. (`--color-line`, `--space-3`)
- 패키지 내부 배선용 커스텀 프로퍼티만 `--ns-` 를 쓴다. (`--ns-label-display`)
- 이벤트는 `ns-` 접두사에 케밥 케이스, 대응하는 React prop 은 `on` + 파스칼 케이스다. (`ns-navigate` → `onNsNavigate`)

## 컴포넌트

- **자기 상태를 절대 바꾸지 않는다.** 이벤트만 올리고 상태는 소비자가 내려준다. `open`, `sidebarOpen`, `active` 어느 것도 컴포넌트가 스스로 변경하지 않는다.
- 모든 커스텀 이벤트는 `bubbles: true, composed: true` 다.
- `@customElement` 데코레이터를 쓰지 않는다. `src/internal/register.ts` 를 쓴다.
- 로직과 스타일을 파일 두 개로 나눈다. (`ns-x.ts` / `ns-x.styles.ts`)

## 스타일

- **토큰은 문서 `:root` 에만 정의한다.** 컴포넌트 shadow 의 `:host` 에 토큰을 정의하지 않는다.
- **컴포넌트 스타일에 `var()` 폴백을 쓰지 않는다.** 색·치수는 `tokens.css` 한 곳에만 존재한다. 유일한 예외는 `--ns-label-display`.
- `:host-context()` 를 쓰지 않는다. Chromium 전용이다.

## 빌드

- `tsconfig.json` 에 `experimentalDecorators: true` 와 `useDefineForClassFields: false` 가 **둘 다** 있어야 한다.
- `vite.config.ts` 의 `litExternal` 정규식을 유지한다. lit 계열은 문자열이 아니라 정규식으로 외부화한다.
- UMD 빌드만 lit 을 인라인한다. ES 빌드는 external 로 둔다.
- `package.json` 에 `sideEffects` 필드를 넣지 않는다. 진입점이 `customElements.define` 을 실행한다.
