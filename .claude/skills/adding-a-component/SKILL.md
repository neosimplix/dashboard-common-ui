---
name: adding-a-component
description: Use when adding a new web component to this library, adding a custom event to an existing component, or adding a new slot or property that consumers will use
---

# 컴포넌트 추가

불변 규칙은 `.claude/rules/library-invariants.md` 에 있다. 이 문서는 **빠뜨리기 쉬운 연결 지점**을 다룬다. 컴포넌트 하나를 추가하면 파일 다섯 곳이 함께 바뀐다.

## 먼저: 태그인가 클래스인가

- **캡슐화할 행동이 있으면 태그.** 포커스 트랩, 정렬 상태, 여닫힘처럼 플랫폼이 안 해주는 것
- **만들어 줄 마크업이 있으면 태그.** SVG, `h1`+`p`, 제목 레벨처럼 CSS 로 만들 수 없는 것
- **둘 다 아니면 클래스.** 스타일뿐인 것은 네이티브 요소 + `.ns-*` 클래스다

폼 컨트롤과 버튼은 **클래스여야 한다.** shadow DOM 이 폼 참여·라벨·검증·자동완성을 끊는다. `docs/gotchas.md` 의 "FACE 를 쓰지 않은 이유" 를 읽고 오지 않았다면 태그로 만들지 않는다.

## 태그를 추가할 때

- [ ] `src/components/<name>/ns-<name>.ts` — 로직. `register()` 로 등록하고 `declare global` 로 `HTMLElementTagNameMap` 확장
- [ ] `src/components/<name>/ns-<name>.styles.ts` — shadow CSS. `css``` 템플릿이지 `.css` 파일이 아니다
- [ ] `src/index.ts` — 등록 부수효과 import **와** 클래스 재export 둘 다
- [ ] `src/react/elements.ts` — `createComponent` 래퍼, 이벤트 매핑
- [ ] `src/react/index.ts` — 값과 타입 재export
- [ ] `index.html` — 문서 섹션

## 클래스를 추가할 때

- [ ] `src/controls/controls.css` 의 `@layer ns-controls` 블록 **안**에 규칙. 값은 토큰만, `var()` 폴백 없음
- [ ] `src/react/controls/<Name>.tsx` — 네이티브 요소에 클래스를 붙이는 컴포넌트
- [ ] `src/react/index.ts` — 값과 타입 재export
- [ ] `index.html` — 데모 · **클래스 표** · HTML 예시 · React 예시
- [ ] `docs/consumer-example.tsx` — 새 컴포넌트를 실제로 사용

`scripts/check-controls.mjs` 가 `controls.css` 의 클래스와 `index.html` 을 양방향으로 대조한다. `--modifier` 변형도 개별로 센다. 문서에 빠뜨리면 `npm run check` 가 막는다.

**상태 변형은 클래스를 만들지 않는다.** `invalid` 는 `[aria-invalid="true"]`, `disabled` 는 `:has(:disabled)` 로 잡는다. 클래스를 토글하는 자바스크립트가 필요 없어 순수 HTML 에서도 동작한다.

**요소 타입으로 특정되면 자손 선택자를 쓴다.** 순수 HTML 사용자가 외워야 하는 이름을 줄인다. 같은 태그가 둘 이상이라 순서에만 의존하게 될 때만 `__이름` 을 붙인다.

## 새 이벤트를 추가할 때

세 곳이 함께 움직인다. 하나라도 빠지면 조용히 어긋난다.

1. **컴포넌트** — `new CustomEvent("ns-x", { detail, bubbles: true, composed: true })`
2. **`src/types.ts`** — `detail` 인터페이스와 `HTMLElementEventMap` 확장
3. **`src/react/elements.ts`** — 이벤트 매핑, **`EventName<>` 캐스트 포함**

```ts
events: {
  onNsX: "ns-x" as EventName<CustomEvent<NsXDetail>>,
},
```

**캐스트를 빼면 소비자의 `e.detail` 이 컴파일 에러가 난다.** 라이브러리 타입 검사는 통과하므로 `npm run check` 만으로는 안 잡힌다.

4. **`docs/consumer-example.tsx`** — 새 핸들러를 붙여 `e.detail` 을 실제로 읽는다. 이것이 3번을 지키는 검사다.

`scripts/check-events.mjs` 가 1번과 3번의 이름을 대조하지만, 전체 집합끼리 비교하므로 컴포넌트별 매핑까지는 보증하지 않는다.

## `index.html` 섹션

문서는 바깥에서 안으로 읽는다. 컨테이너 컴포넌트가 앞에 온다.

**데모 헬퍼 규약**: `<template class="ex">` → 다음 형제가 `.demo` → 그 다음이 `<pre>`. 어기면 콘솔에 위치가 찍히고 그 섹션만 건너뛴다.

**예시 블록 안에 `<script>` 태그를 넣지 않는다.** HTML 파서는 `type="text/plain"` 과 무관하게 첫 `</script>` 에서 바깥 블록을 닫는다. 마크업 예시와 배선 예시를 따로 둔다.

**데모 리스너는 자기 컨테이너에 붙인다.** 이벤트가 `composed` 라 `document` 에 붙이면 다른 섹션의 데모까지 잡는다.

섹션 순서: 라이브 데모 → 프로퍼티 표 → slot 표 → 이벤트 표 → HTML·React 예시 → 주의사항.

## 마치기 전에

```sh
npm run check
npm run build
grep -c "ns-<name>" dist/bundle.umd.js      # 등록이 번들에 살아남았는지
grep -n 'document.addEventListener' index.html   # 출력 없어야 정상
node scripts/check-controls.mjs             # 클래스 ↔ 문서
```

브라우저 확인이 필요한 것은 사람에게 넘긴다. 하지 않은 확인을 했다고 적지 않는다.
