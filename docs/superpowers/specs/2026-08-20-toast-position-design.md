# 토스트 위치 설계

`nsToast` 는 지금 우하단 고정이다. 기본을 **상단 중앙**으로 바꾸고 네 자리 중에서 고를 수 있게 한다.

## 1. 네 자리

`"top-center"`(기본) · `"bottom-center"` · `"top-right"` · `"bottom-right"`.

값 이름을 `세로-가로` 로 고정한다. `"center-top"` 과 `"top-center"` 를 둘 다 받는 관용은 두지 않는다 — 받는 순간 문서와 코드가 두 표기를 평생 함께 들고 간다.

**네 개로 끝낸다.** 좌측 정렬(`top-left`·`bottom-left`)을 넣지 않는 이유는 이 라이브러리의 셸이 좌측에 사이드바를 두기 때문이다. 좌하단 토스트는 접힌 레일 위에 겹치고, 펼친 사이드바에서는 아예 가려진다. 필요해지면 그때 두 값을 더한다 — 값을 더하는 것은 breaking 이 아니다.

## 2. 누가 정하나 — 전역 설정 함수

```ts
nsToastPosition("top-center");
```

**리전이 문서당 하나이기 때문이다.** `nsToast()` 가 첫 호출에 `ns-toast` 를 만들어 `document.body` 에 붙이고 이후 재사용한다. 위치는 그 리전 하나의 성질이지 개별 토스트의 성질이 아니다.

호출마다 위치를 받는 안(`nsToast(msg, { position })`)을 쓰지 않는 이유가 둘이다. 위치마다 리전을 따로 만들면 **정지 상태(`#hovered`/`#focused`)와 쌓기가 리전마다 갈라져** 한쪽에 마우스를 올려도 다른 쪽은 계속 사라진다. 리전 하나를 옮기는 방식이면 뒤에 온 토스트 하나가 **이미 떠 있는 것들을 통째로 끌고 간다.** 둘 다 지금 없는 문제다.

`nsToastPosition` 은 언제 불러도 된다.

- 토스트가 뜨기 전이면 값만 기억했다가 리전을 만들 때 적용한다.
- 이미 떠 있으면 리전이 그 자리로 옮겨가고 **떠 있던 토스트도 함께 움직인다.** 시작 시점에 한 번 부르는 것이 정상 사용이고, 그렇지 않을 때 무슨 일이 일어나는지를 문서에 적는다.

`NsToastPosition` 타입을 함께 내보낸다. `src/index.ts` 와 `src/react/index.ts` 양쪽이다 — `nsToast` 가 그렇다.

## 3. 어떻게 거는가 — 반영 프로퍼티 + `:host([position])`

`ns-toast` 에 `@property({ reflect: true }) position` 을 두고 shadow CSS 가 `:host([position="…"])` 네 규칙으로 받는다.

**호스트에 속성이 쓰이지만 불변 규칙의 대상이 아니다.** 그 규칙("호스트의 속성을 쓰지 않는다")이 막는 것은 *소비자가 쓴* 속성을 덮어 문서화된 override 를 죽이는 것이다. `ns-toast` 는 `nsToast()` 가 만들고 소비자는 마크업에 쓰지 않는다(문서가 그렇게 적고 있다) — 덮을 소비자 값이 존재하지 않는다. `ns-tabs` 의 `role="tablist"` 처럼 조건부로 쓸 이유도 없다.

가운데 정렬은 `left: 50%` 와 `translateX(-50%)` 가 필요하다. `:host` 에 `position`·`inset`·`transform` 은 둘 수 있다 — `check-tokens.mjs` 규칙 ④ 가 막는 것은 `border`·`margin`·`padding` 셋뿐이다.

**첫 프레임에 엉뚱한 자리에 뜨지 않아야 한다.** Lit 의 속성 반영은 첫 업데이트에서 일어나므로, 그 전에 그려지는 순간이 있으면 기본 자리를 벗어난다. 구현이 이것을 어떻게 막는지 근거와 함께 남긴다 — 기본값에 해당하는 인셋을 `:host` 에도 두는 것이 가장 단순한 길이다.

**네 규칙은 인셋 넷과 `transform` 을 모두 명시한다.** 한 규칙이 `right` 만 쓰고 다른 규칙이 남긴 `left` 를 지우지 않으면 두 값이 함께 걸린다. 되돌리는 규칙에 기대지 않는 것은 `.ns-accordion` 에서 이미 정한 판단과 같다.

## 4. 쌓는 방향

`.region` 은 `flex-direction: column` 그대로 두고 새 토스트를 끝에 붙인다.

- 상단 고정: 리전이 위에 붙어 아래로 자란다 → 새 토스트가 **아래에** 붙는다.
- 하단 고정: 리전이 아래에 붙어 위로 자란다 → 새 토스트가 **아래에**, 즉 화면 가장자리 쪽에 붙는다.

두 경우 모두 "새 것이 아래" 라 방향을 바꿀 이유가 없다. `column-reverse` 를 쓰지 않는다.

`max-width: min(24rem, calc(100vw - var(--ns-space-8)))` 는 그대로다. 가운데 정렬에서도 좁은 화면에서 넘치지 않는다.

## 5. 기본값을 바꾸는 것

**기본이 `bottom-right` 에서 `top-center` 로 바뀐다. 동작 변경이다.**

0.3.0 이 방금 나갔고 아직 아무도 그 태그를 쓰지 않는다. 그래도 이관 문단을 둔다 — 우하단을 유지하려면 `nsToastPosition("bottom-right")` 한 줄이면 된다는 것을 적는다.

## 6. 함께 바뀌는 것

| 파일 | 무엇 |
|---|---|
| `src/components/toast/ns-toast.ts` | `position` 반영 프로퍼티, `NsToastPosition` 타입 |
| `src/components/toast/ns-toast.styles.ts` | `:host` 기본 인셋 + `:host([position="…"])` 넷 |
| `src/components/toast/toast.ts` | `nsToastPosition()`, 리전 생성 시 적용 |
| `src/index.ts` · `src/react/index.ts` | `nsToastPosition` 값과 `NsToastPosition` 타입 재export |
| `index.html` | `#overlays` 의 `nsToast` 절 — 위치 표, 설정 예시, 이관 문단, 데모 |
| `.claude/skills/releasing/SKILL.md` | **콜드 설치 기대 export 목록.** `nsToastPosition` 이 늘어난다 — 손으로 추측하지 말고 실제 출력을 붙인다 |
| `docs/pending-human-checks.md` | 네 자리가 실제로 그 자리에 뜨는지, 첫 프레임 튐이 없는지 |

## 7. 검증

테스트 러너를 두지 않는다. `npm run check` · `node scripts/check-controls.mjs` · `npm run build` · `index.html` 육안 확인.

**이 기능은 정적으로 거의 확인되지 않는다.** 위치는 렌더 결과이고 `index.html` 데모에서만 보인다. 그래서 사람 확인 목록에 네 자리 각각과 첫 프레임을 항목으로 남긴다.

`#toast-demo` 에 위치를 바꾸는 버튼을 둔다 — 그것이 없으면 사람이 콘솔로 네 번 호출해야 하고, 그 확인은 안 하게 된다.

## 8. 하지 않는 것

- **좌측 정렬 두 값을 넣지 않는다.** 셸의 사이드바와 겹친다(§1).
- **호출마다 위치를 받지 않는다.** 리전이 하나라는 사실과 어긋난다(§2).
- **`ns-dialog`·`ns-toast` 의 z-index 관계를 손대지 않는다.** 모달 위에 토스트를 띄우는 것은 top layer 문제이고 별개다 — `index.html` 이 이미 그 한계를 적고 있다.
- **버전 태그를 만들지 않는다.** 릴리스는 별개 작업이다.
