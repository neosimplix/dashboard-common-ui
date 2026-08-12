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

## 검사는 실패시켜 봐야 검사다

이 저장소에서 이 원칙으로 구멍 두 개를 찾았다. `check-events.mjs` 는 가짜 이벤트를 넣어 실패를 확인했고, 소비자 타입 검사는 캐스트를 되돌려 확인했다 — 그 과정에서 네 래퍼 중 둘만 검사하고 있다는 것이 드러났다.

**의도한 이유로 실패했는지까지 본다.** 다른 이유로 먼저 실패하면 목표한 속성은 여전히 검증되지 않은 것이다.
