# 라이브러리 불변 규칙

이 저장소의 코드가 **항상** 만족해야 하는 것들이다. 이유와 배경은 `docs/gotchas.md` 에 있다.

## 이름

- 컴포넌트 태그는 `ns-` 접두사를 쓴다. (`ns-header`, `ns-sidebar`, `ns-nav-group`, `ns-nav-item`)
- **모든 커스텀 프로퍼티는 `--ns-` 를 쓴다.** `tokens.css` 에 정의돼 있으면 공개(소비자가 덮어도 된다), 없으면 내부 신호다. (`--ns-color-line`, `--ns-space-3`) **지금 신호에 해당하는 이름은 하나도 없다** — 0.4.0 에 둘 있었고 0.5.0 에 함께 죽었다. 그 생몰과, 접두사를 붙이지 않던 0.1.5 가 두 번째 소비자에서 깨진 경위는 `docs/gotchas.md` 에 있다.
- 이벤트는 `ns-` 접두사에 케밥 케이스, 대응하는 React prop 은 `on` + 파스칼 케이스다. (`ns-navigate` → `onNsNavigate`)
- **문서 트리에 나가는 CSS 클래스 이름은 `ns-` 접두사를 쓴다.** 전역 이름공간이라 `.input` 은 소비자 CSS 와 충돌한다. 변형은 `--`, 하위 요소는 `__` 다. (`.ns-button--outline`, `.ns-field__error`) **shadow 안에서만 쓰는 클래스에는 붙이지 않는다** — 캡슐화 경계가 이미 이름공간이라 충돌할 상대가 없다. (`.row`, `.header`, `.title`) 판단 기준은 이름의 모양이 아니라 **그 클래스가 문서 이름공간에 들어가는가** 하나다. Light DOM 컴포넌트가 쓰는 클래스는 문서에 나가므로 접두사를 쓴다.
- **`title` 을 속성/프로퍼티 이름으로 쓰지 않는다.** 모든 HTML 요소의 전역 속성이라 브라우저가 툴팁을 띄운다. 제목은 `heading` 이다. React 프롭만 `title` 을 유지하고 shim 이 변환한다.
- **`key` 를 속성/프로퍼티 이름으로 쓰지 않는다.** React 가 재조정 키로 소비해 엘리먼트까지 도달하지 않고, shim 으로도 고칠 수 없다 — `title` 은 우리에게 도착한 뒤 이름을 바꿀 수 있었지만 `key` 는 도착하지 않는다. 키는 `name` 이다. (0.5.0 개발 중 `ns-nav-group` 이 잠시 그것을 가졌다가 함께 없어졌다 — 규칙은 다음에 키가 필요해질 때를 위해 남는다)
- **shim 이 있는 태그는 이름이 셋이다.** Lit 클래스 별칭 `Ns<X>Element`, 내부 `createComponent` 래퍼 `Ns<X>Base`(비공개), 공개 shim `<X>`. shim 이 없는 태그는 래퍼가 평범한 이름을 갖는다.
- **컴포넌트 유형이 셋이다.** shadow + 렌더(기본), Light DOM + 렌더(`ns-pagination`), Light DOM + 렌더 없음(`ns-table`). 판단은 "캡슐화가 필요한가 / 소비자 자식을 품는가" 두 축이다.

## 컴포넌트

- **제어 중이면 그 값을 바꾸지 않는다.** 소비자가 상태 프로퍼티를 설정했으면(제어) 컴포넌트는 그것을 바꾸지 않고, 설정하지 않았으면(비제어) 스스로 관리한다. 이벤트는 양쪽 모두 낸다.
- **제어/비제어는 속성 짝으로 나눈다.** 제어는 프로퍼티 전용(`@property({ attribute: false })`), 비제어 초기값은 별도 속성(`default-open`). 하나로 겸용하면 `<ns-dialog open>` 이 제어 모드로 들어가 스스로 닫지 못한다. **그래서 실제로는 그 속성이 조용히 무시된다** — 관찰되지 않으므로 제어 모드로 들어가지도 않는다. 라이브러리는 **그 이름들을** 호스트에 쓰지 않고 Lit 도 `attribute: false` 를 반영하지 않으므로 **그 이름의 속성이 발견되면 언제나 소비자의 실수다.** `connectedCallback` 에서 `warnPropertyOnlyAttributes` 로 경고한다.
- 모든 커스텀 이벤트는 `bubbles: true, composed: true` 다.
- `@customElement` 데코레이터를 쓰지 않는다. `src/internal/register.ts` 를 쓴다.
- 로직과 스타일을 파일 두 개로 나눈다. (`ns-x.ts` / `ns-x.styles.ts`)
- **호스트의 속성을 쓰지 않는다.** `setAttribute` 로 소비자가 쓴 속성을 덮으면 문서화된 override 가 조용히 죽는다. 숨길 것은 shadow 안의 요소에 붙인다. **예외는 호스트 말고는 둘 곳이 없는 ARIA 소유 관계 하나다** — `ns-tabs` 가 `role="tablist"` 를 쓰고, 이미 `role` 이 있으면 건드리지 않아 규칙이 막으려던 성질을 지킨다. **호스트에 속성이 찍히는 컴포넌트는 셋이지만 예외는 이 하나다** — `ns-toast` 의 `position` 과 `ns-sidebar` 의 `data-ns-open` 은 소비자가 그 이름을 마크업에 쓰는 경로가 없어 덮을 값이 없으므로 애초에 이 규칙이 금지하는 행위가 아니다. **둘은 경로가 없는 자리가 다르다** — 토스트는 *태그* 를 소비자가 쓰지 않고, 사이드바는 태그는 쓰지만 **소비자가 쓰는 이름이 `default-open` 이다.** `data-ns-open` 은 라이브러리와 그 shim 만 쓴다(`Sidebar.tsx` 가 제어 모드에서 SSR 마크업에 싣고, 이 저장소의 `guide.html` 은 순수 HTML 제어 모드에서 그 shim 을 그대로 흉내 낸다). **그 자리에 실린 값은 구조상 엘리먼트가 첫 `updated()` 에 쓸 값과 같으므로 덮을 값이 애초에 없다** — 이 예외가 성립하는 근거는 "아무도 쓰지 않는다" 가 아니라 "쓰는 쪽이 라이브러리와 같은 값을 쓴다" 다. `open` 이 프로퍼티 전용이 되어 CSS 가 볼 속성이 없어진 자리를 라이브러리 전용 이름 하나가 메운다. 세 경우를 가르는 기준은 `docs/gotchas.md` 에 있다.
- **shadow 스타일이 UA 기본값을 덮으면 되돌릴 규칙을 함께 둔다.** author 선언은 특정도와 무관하게 origin 으로 UA 를 이긴다.
- **React shim 은 이벤트 `detail` 을 실제로 읽는다.** 인자 0개 핸들러는 `EventName<>` 캐스트 누락을 감춘다.
- **shim 은 필드가 하나인 `detail` 만 벗긴다.** 단일 필드는 그 필드를 인자로 주고(`onClose(reason)`), 필드가 여럿이면 레코드째 넘긴다(`onNavigate(detail)`). 여럿을 벗으면 한 필드를 근거 없이 특권화하게 되고, **필드를 하나 더하는 것이 breaking 이 된다.**
- **공통 컨트롤 스타일을 재사용해야 하는 컴포넌트는 Light DOM 을 쓴다.** shadow root 를 갖는 이유는 스타일 캡슐화 하나이고, `controls.css` 를 쓰려는 컴포넌트에는 그 캡슐화가 방해다. `createRenderRoot()` 를 재정의해 `this` 를 반환한다.
- **Light DOM 컴포넌트는 `static styles` 를 갖지 않는다.** `createRenderRoot` 재정의로 `adoptStyles` 가 호출되지 않아 조용히 무시된다. **"로직과 스타일을 파일 두 개로 나눈다" 규칙의 예외다** — 스타일이 전부 `controls.css` 에 있으므로 `.styles.ts` 파일이 없다.
- **소비자 자식을 품는 Light DOM 컴포넌트는 `ReactiveElement` 를 상속한다.** `LitElement` 는 템플릿을 렌더해 그 자식을 덮어쓴다. 렌더가 필요하고 자식이 없는 경우에만 `LitElement` + `createRenderRoot` 재정의를 쓴다.
- **소비자가 쓰는 훅 속성은 `data-ns-` 접두사를 쓴다.** Light DOM 이라 문서 이름공간에 들어가고, 충돌하면 엉뚱한 요소를 오인해 에러 없이 오동작한다.
- **Light DOM 컴포넌트는 조회 지점마다 소유를 확인한다.** `el.closest("ns-x") === this`. 경계가 없어 중첩 인스턴스의 요소가 서로에게 보인다.
- **소비자 DOM 의 속성을 관리하면 `MutationObserver` 가 필요하다.** `updated()` 는 반응형 프로퍼티 변경만 본다. `{ childList: true, subtree: true }` 를 쓰고 **`attributes` 는 켜지 않는다** — 동기화가 `setAttribute` 를 쓰므로 자기 쓰기에 재발동해 루프가 된다.
- **SSR 에 보여야 하는 상태는 반응형 프로퍼티가 아닌 이름으로 내보낸다.** `@lit/react` 의 `createComponent` 는 반응형 프로퍼티를 `useLayoutEffect` 에서만 설정하므로 서버 마크업에 남지 않는다. shim 이 **반응형 프로퍼티가 아닌 이름**을 함께 렌더한다 — `data-ns-*` 훅이거나, 하이픈 든 원시 속성이다. `ns-sidebar` 는 둘 다 쓰고 각각 다른 구간을 덮는다: `data-ns-open`(제어 경로의 upgrade 전)과 `default-open`(비제어 경로 전체 + 제어 경로의 upgrade~hydration). **쓰는 쪽이 정확히 하나여야 한다** — 엘리먼트가 쓰는 이름을 shim 이 함께 쓰면 같은 속성을 두고 다툰다. 그래서 `data-ns-open` 은 제어 모드에서만 렌더한다.
- **`:not(:defined)` 경계는 상태에 따라 달라지는 예약에만 붙인다.** 상태를 보는 예약이 정의 이후까지 계속 걸리면 shadow 의 `:host` 와 다퉈 하이드레이션 튐이 된다. (`ns-sidebar` 의 너비, `ns-dialog` 의 `display: none`) **조건 없는 예약은 그칠 이유가 없으므로 경계를 긋지 않는다** — `ns-header`·`ns-page-heading`·`ns-skeleton` 의 `display`, `ns-icon` 의 크기가 그렇다. 특히 `ns-icon { width: var(--ns-icon-size) }` 는 정의 이후에도 걸려야 소비자의 `ns-icon { width: … }` override 가 `:host` 를 이기는 지점이 된다. **shadow 쪽에만 있는 규칙은 upgrade 전 구간을 못 덮는다** — 슬롯 자식의 크기처럼 소비자가 넣은 것이 자기 값을 갖고 오는 자리는 `tokens.css` 에 문서 트리 짝을 함께 둔다. (`ns-icon > *` 와 `::slotted(*)`)
- **둘 중 하나만 보여야 하는 자리는 슬롯 폴백으로 만든다.** 프로퍼티 두 개로 만들면 소비자가 분기해야 하고, 분기해야 한다는 사실을 문서로만 알릴 수 있다. (`ns-icon` 의 기본 슬롯과 `name`. `ns-nav-item` 의 `leading` 슬롯과 `badge` 가 같은 짝이었으나 0.5.0 에 `badge` 가 없어져 지금 `leading` 은 폴백 없는 슬롯이고, 비면 그 자리가 접힌다) **기본 슬롯에 폴백을 두면 공백 텍스트 노드가 폴백을 죽인다** — 명명 슬롯은 공백이 기본 슬롯으로 가서 안전하지만 기본 슬롯은 그것까지 배정받는다. 막을 수단이 없으므로 `updated()` 에서 배정을 보고 경고를 낸다. (`ns-icon`)

## 스타일

- **토큰은 문서 `:root` 에만 정의한다.** 컴포넌트 shadow 의 `:host` 에 토큰을 정의하지 않는다.
- **컴포넌트 스타일에 `var()` 폴백을 쓰지 않는다.** 색·치수는 `tokens.css` 한 곳에만 존재한다. **예외는 신호 프로퍼티다** — 정의가 `tokens.css` 에 없고 세우는 쪽이 없는 상황에서는 폴백이 곧 기본 동작이라, 지우면 배선이 끊긴다. **지금 그 예외에 해당하는 이름은 하나도 없다.** 0.4.0 의 `--ns-label-display`·`--ns-group-list-display` 둘은 접힌 사이드바가 항목을 그리지 않게 되면서 세우는 쪽이 사라져 0.5.0 에 함께 죽었다 — 0.5.0 의 사이드바는 닫히면 통째로 사라지므로 자식에게 알릴 접힘 상태 자체가 없다. 규칙은 그대로 남는다 — 다음에 신호가 생기면 같은 근거로 예외가 된다. 목록의 출처는 여전히 `scripts/check-tokens.mjs` 의 `WIRING` 집합이고, 그 집합은 지금 **의도적으로 빈 채로** 있다.
- `:host-context()` 를 쓰지 않는다. Chromium 전용이다.
- **`invalid` 는 클래스가 아니라 `[aria-invalid="true"]` 로 스타일한다.** `--invalid` 변형 클래스를 만들지 않는다.
- **`controls.css` 는 `@layer ns-controls` 로 감싼다.** 감싸지 않으면 소비자의 Tailwind 유틸 오버라이드가 막힌다.
- **`:host` 에 `border`·`margin`·`padding` 을 두지 않는다.** 호스트는 문서 트리에 있어 소비자의 문서 규칙이 `:host` 를 이긴다 — 특정도가 아니라 캐스케이드 순서라 `:host` 쪽이 아무리 구체적이어도 진다. Tailwind preflight 의 `*, ::before, ::after, ::backdrop { border: 0 solid; margin: 0; padding: 0 }` 가 그 규칙이고, Tailwind 소비자는 예외 없이 이것을 갖는다. 박스는 shadow 안의 요소가 갖는다 (`ns-sidebar` 의 `nav`, `ns-nav-group` 의 `.heading`·`.list`, `ns-header` 의 `header`). **`background`·`color`·`width`·`display` 는 대상이 아니다** — preflight 가 건드리지 않고, `:host` 에 두어야 소비자가 `ns-x { … }` 로 덮을 수 있다. `check-tokens.mjs` 의 규칙 ④ 가 강제한다.
- **shadow 컴포넌트는 `controls.css` 를 재사용할 수 없다.** 전역 스타일시트는 shadow 안에 도달하지 않는다. `tokens.css` 의 요소 선택자(정의 전 레이아웃 예약)도 같다 — 둘 다 문서 트리에만 적용된다. 필요한 최소한만 그 컴포넌트의 shadow 스타일에 다시 적는다.
- **shadow 안에서 `height: 100%` 와 테두리를 함께 쓰는 요소에는 `box-sizing: border-box` 를 직접 적는다.** 문서의 `*` 리셋이 shadow 안에 닿지 않아 그 요소는 content-box 로 시작하고, 테두리 두께만큼 호스트를 넘친다. 호스트 높이가 고정이면 넘친 부분은 레이아웃을 밀지 않고 **뒤 형제의 배경에 덮여** 테두리만 조용히 사라진다. (`ns-header` 의 `header`, `ns-sidebar` 의 `nav`)
- **shadow 경계를 넘겨야 하는 값은 선택자가 아니라 커스텀 프로퍼티로 내려보낸다.** 문서의 요소 선택자는 shadow 안에 닿지 않지만, 커스텀 프로퍼티는 상속되므로 중첩 shadow 까지 도달한다. (`--ns-icon-size`, `--ns-dialog-width`)
- **다크모드 값은 토큰마다 `light-dark()` 한 쌍으로 둔다.** `@media (prefers-color-scheme: dark)` 안에 선언 블록을 복제하지 않는다. 신호는 `:root` 의 `color-scheme` 하나이고, `[data-theme]` 은 그 한 프로퍼티만 덮는다.
- **모든 값이 토큰이어야 하는 것은 아니다.** 토큰으로 뽑는 기준은 **두 곳 이상에 나타나거나 테마로 바뀔 값**이다. 한 곳에만 있고 변할 이유가 없는 구조적 상수는 리터럴로 둔다 — hairline `1px`, 체크박스 `1rem`, 비활성 `opacity: .6`. 사용처가 하나인 토큰을 만드는 것은 추측이다.

## 빌드

- `tsconfig.json` 에 `experimentalDecorators: true` 와 `useDefineForClassFields: false` 가 **둘 다** 있어야 한다.
- `vite.config.ts` 의 `litExternal` 정규식을 유지한다. lit 계열은 문자열이 아니라 정규식으로 외부화한다.
- UMD 빌드만 lit 을 인라인한다. ES 빌드는 external 로 둔다.
- `package.json` 에 `sideEffects` 필드를 넣지 않는다. 진입점이 `customElements.define` 을 실행한다.

## 폼

- **폼 컨트롤과 버튼을 웹 컴포넌트로 만들지 않는다.** 네이티브 요소 + CSS 클래스로 제공한다. 이유는 `docs/gotchas.md` 의 "FACE 를 쓰지 않은 이유" 에 있다.
- **form-associated custom element(FACE)를 도입하지 않는다.** `static formAssociated` 와 `attachInternals()` 를 쓰지 않는다.
