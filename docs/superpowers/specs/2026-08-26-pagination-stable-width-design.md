# `ns-pagination` — 이전·다음 버튼의 위치를 고정한다

2026-08-26 · `ns-pagination` 만 바뀐다.

## 1. 문제

페이지를 넘길 때마다 **"이전" 과 "다음" 버튼이 좌우로 움직인다.** 가운데 번호
목록의 폭이 현재 페이지에 따라 달라지기 때문이다. 연속으로 넘기는 동안 커서
아래에서 버튼이 빠져나가므로, 같은 자리를 계속 클릭하는 사용법이 성립하지 않는다.

## 2. 원인 — 셋이다

하나만 고치면 진폭만 줄고 여전히 움직인다.

### 2.1 슬롯 개수가 `current` 에 따라 달라진다

`pageWindow(current, total)` 은 `[1, current-1, current, current+1, total]` 에서
중복을 걷어내고 빈 구간에 `gap` 을 넣는다. 양 끝에서 `current±1` 이 `1`·`total`
과 겹쳐 사라지므로 **결과 길이가 4에서 7 사이를 오간다.**

`total=240 · per-page=20` (12페이지)의 전수 추적:

| current | 렌더 | 슬롯 |
|---|---|---|
| 1 | `1 2 … 12` | 4 |
| 2 | `1 2 3 … 12` | 5 |
| 3 | `1 2 3 4 … 12` | 6 |
| 4–9 | `1 … c-1 c c+1 … 12` | 7 |
| 10 | `1 … 9 10 11 12` | 6 |
| 11 | `1 … 10 11 12` | 5 |
| 12 | `1 … 11 12` | 4 |

### 2.2 `gap` 칸과 번호 칸의 폭이 다르다

`.ns-pagination-gap` 은 `padding-inline` 과 `…` 한 글자뿐이라 번호 버튼보다
좁다. 슬롯 수가 같아도 **gap 이 1개인 배치와 2개인 배치의 폭이 다르다.**

### 2.3 번호 버튼에 `min-width` 가 없다

`.ns-button--sm` 은 최소 폭을 갖지 않는다. `9` 와 `10` 의 폭이 다르다.

## 3. 결정

세 원인을 각각 막는다.

| 원인 | 처방 |
|---|---|
| 2.1 | `pageWindow` 를 **"항상 `min(pages, size)` 슬롯"** 으로 다시 쓴다 (§4) |
| 2.2 · 2.3 | 번호들을 균등 그리드로 감싸 **모든 칸을 같은 폭**으로 만든다 (§6) |

슬롯 수 `size` 는 `page-window` 속성으로 소비자가 정한다 (§5).

**"다음" 이 안 움직이기 위한 조건은 "슬롯 수가 `current` 와 무관할 것" 이지
"모든 데이터셋에서 같을 것" 이 아니다.** 한 데이터셋 안에서 페이지를 넘기는
동안 `pages` 는 고정이므로, 페이지가 3개뿐이면 3칸만 그리면 된다. 빈 칸으로
채우지 않는다.

## 4. 윈도우 알고리즘

```ts
export function pageWindow(
  current: number,
  total: number,   // 페이지 수
  size: number,    // 검증을 통과한 슬롯 수. 5 이상의 홀수
): (number | "gap")[] {
  if (total <= size) return [1 … total];

  const h = (size - 5) / 2;   // 가운데 배치에서 현재 좌우로 몇 개
  const edge = size - 2;      // 앞/뒤 배치가 연속으로 내는 번호 개수

  if (current <= edge)        return [1 … edge, "gap", total];
  if (current > total - edge) return [1, "gap", total-edge+1 … total];
  return [1, "gap", current-h … current+h, "gap", total];
}
```

세 배치 모두 슬롯이 정확히 `size` 다 — `edge + 2`, `2 + edge`, `4 + (2h+1)`.

### 4.1 `size` 가 5 이상의 홀수여야 하는 이유

가운데 배치의 번호 개수는 `size - 4` 이고, 그것이 현재 페이지를 가운데 둔
`2h + 1` 이어야 한다. 여기서 **`h = (size-5)/2`** 가 나온다.

- **짝수면** `h` 가 정수가 아니다. 현재 페이지 좌우가 비대칭이 된다.
- **`size = 3` 이면** `h = -1` 이라 가운데 배치에 현재 페이지가 들어갈 자리가 없다.
- `size = 5` 는 `h = 0` → `1 … 6 … 12`. 최소값이다.
- `size = 7` 은 `h = 1` → `1 … 5 6 7 … 12`. 기본값이자 지금 동작이다.

### 4.2 부수 효과 — `…` 이 한 페이지만 감추는 배치가 사라진다

현재 구현은 `current=4 · total=12` 에서 `1 … 3 4 5 … 12` 를 낸다. 왼쪽 `…` 이
감추는 것이 **페이지 2 하나뿐**이다 — 버튼 하나를 줄임표로 바꿔 놓은 셈이고,
누를 수 있던 자리를 누를 수 없게 만들면서 폭도 아끼지 못한다.

새 규칙에서는 어느 배치의 `…` 도 최소 2개를 감춘다.

- 앞쪽 배치의 gap 구간은 `edge+1 … total-1` 이다. 1개만 남으려면 `total = size`
  여야 하는데 그것은 `total <= size` 분기가 이미 가져갔다.
- 가운데 배치의 왼쪽 gap 은 `2 … current-h-1` 이다. 이 분기의 최소 `current` 는
  `edge+1 = size-1` 이고, `size-1 >= h+3` 은 `size >= 3` 과 동치라 항상 참이다.
  오른쪽 gap 도 대칭으로 같다.

### 4.3 손 추적 표

**이 저장소에는 테스트 러너가 없다** (`.claude/rules/verification.md`). `pageWindow`
는 순수 함수이므로 추적이 확정적이다. 구현이 이 표와 다른 결과를 내면 **코드를
고치기 전에 어느 쪽이 틀렸는지 사람이 정한다.**

`size=7 · total=12` (`edge=5 · h=1`):

| current | 결과 | 슬롯 |
|---|---|---|
| 1 | `1 2 3 4 5 … 12` | 7 |
| 4 | `1 2 3 4 5 … 12` | 7 |
| 5 | `1 2 3 4 5 … 12` | 7 |
| 6 | `1 … 5 6 7 … 12` | 7 |
| 7 | `1 … 6 7 8 … 12` | 7 |
| 8 | `1 … 8 9 10 11 12` | 7 |
| 9 | `1 … 8 9 10 11 12` | 7 |
| 12 | `1 … 8 9 10 11 12` | 7 |

`size=5 · total=12` (`edge=3 · h=0`):

| current | 결과 | 슬롯 |
|---|---|---|
| 1 | `1 2 3 … 12` | 5 |
| 3 | `1 2 3 … 12` | 5 |
| 4 | `1 … 4 … 12` | 5 |
| 9 | `1 … 9 … 12` | 5 |
| 10 | `1 … 10 11 12` | 5 |
| 12 | `1 … 10 11 12` | 5 |

`size=7 · total=8` (`edge=5`) — 앞쪽 조건을 먼저 보므로 가운데 배치에 닿지 않는다:

| current | 결과 | 슬롯 |
|---|---|---|
| 1–5 | `1 2 3 4 5 … 8` | 7 |
| 6–8 | `1 … 4 5 6 7 8` | 7 |

`total <= size`:

| total | 결과 | 슬롯 |
|---|---|---|
| 7 | `1 2 3 4 5 6 7` | 7 |
| 2 | `1 2` | 2 |

## 5. `page-window` 프로퍼티

```ts
const DEFAULT_PAGE_WINDOW = 7;

@property({ type: Number, attribute: "page-window" })
pageWindow = DEFAULT_PAGE_WINDOW;

get #window(): number {
  const raw = this.pageWindow;
  if (Number.isInteger(raw) && raw >= 5 && raw % 2 === 1) return raw;
  if (!this.#warnedWindow) {
    this.#warnedWindow = true;
    console.warn(
      `[ns-pagination] page-window=${raw} 는 5 이상의 홀수여야 합니다. ` +
      `${DEFAULT_PAGE_WINDOW} 로 그립니다.`,
    );
  }
  return DEFAULT_PAGE_WINDOW;
}
```

| 결정 | 이유 |
|---|---|
| 초기값과 폴백이 같은 상수를 본다 | 둘로 적으면 어긋나도 아무도 모른다 |
| `#warnedWindow` 를 별개 플래그로 둔다 | `#warnedPage`·`#warnedPerPage`·`#warnedTotal` 이 이미 그렇다. 하나로 합치면 먼저 일어난 진단이 다른 진단을 가린다 |
| 잘못된 값에 렌더를 멈추지 않는다 | `per-page` 와 달리 페이지 수 계산에 쓰이지 않는 **순수 표시 설정**이다. 페이징을 통째로 죽이는 것은 과하다 |
| 속성을 갖는다 (프로퍼티 전용이 아니다) | 상태가 아니라 설정이다. `page` 가 프로퍼티 전용인 이유(제어 모드 진입)가 여기에는 없다 |

이름이 `page-window` 인 이유는 이 개념의 어휘가 이미 있기 때문이다 — 함수가
`pageWindow` 이고 설계 스펙 §7.3 이 "번호 윈도우" 라고 부른다. 호출부는
`pageWindow(current, pages, this.#window)` 로, 함수 이름과 프로퍼티 이름이 같아도
`this.` 가 갈라 준다.

React 는 `<Pagination pageWindow={5} />` 다. `NsPagination` 은 shim 없는 평범한
`createComponent` 래퍼라 반응형 프로퍼티가 그대로 프롭이 된다. **SSR 문제는
없다** — 이 컴포넌트는 하이드레이션 전까지 아무것도 렌더하지 않으므로 서버
마크업에 지킬 상태가 없다.

## 6. 폭 고정 CSS

번호들을 `.ns-pagination-pages` 로 감싸고 균등 그리드로 만든다.

```css
.ns-pagination-pages {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  align-items: center;
  gap: var(--ns-space-1);
}

.ns-pagination-pages > * { font-variant-numeric: tabular-nums; }

.ns-pagination-pages > .ns-button--ghost { border: 1px solid transparent; }
```

내재 폭 컨테이너 안에서 `1fr` 트랙들은 **전부 가장 넓은 항목의 max-content 폭**을
갖는다. 슬롯 수가 §4로 고정됐으므로, 트랙 폭만 고정되면 목록 전체 폭이 고정되고
"이전"·"다음" 이 멈춘다.

**그런데 "가장 넓은 항목이 언제나 `pages` 버튼" 이 저절로 성립하지 않는다.**
성립시키는 것이 아래 두 규칙이다.

### 6.1 현재 페이지 버튼이 2px 더 넓다

`.ns-button--outline` 은 `border: 1px solid` 를 갖고 `.ns-button--ghost` 는 갖지
않는다. `.ns-button` 이 `box-sizing: border-box` 라도 **max-content 는 테두리를
포함**하므로, 현재 페이지가 `12` 일 때와 `5` 일 때 트랙 폭이 2px 갈린다. 7칸이면
14px 어긋난다. 비활성 번호에 **투명 테두리**를 줘 상자를 맞춘다.

**선택자를 `> .ns-button` 이 아니라 `> .ns-button--ghost` 로 쓴다.**
`.ns-pagination-pages > .ns-button`(0,2,0)은 `.ns-button--outline`(0,1,0)을 이기므로
현재 페이지의 테두리까지 투명해진다.

### 6.2 자릿수가 같아도 폭이 같지 않다

비례폭 글꼴에서 `0` 이 `1` 보다 넓으면 `"10"` 이 `"11"` 보다 넓다. 그러면
`pages=11` 일 때 가장 넓은 항목이 `pages` 가 아니라 창 안의 `10` 이 되고, `10` 이
창에서 빠지는 순간 다시 흔들린다.

`font-variant-numeric: tabular-nums` 로 **자릿수만이 폭을 정하게** 만들면, `pages`
는 자릿수가 최대이면서 **어느 배치에서도 항상 렌더되므로** 최댓값이 확정된다.

버튼에 직접 준다. 상속 프로퍼티지만 UA 스타일시트가 `button` 에 `font` 단축
프로퍼티를 걸어 `font-variant-numeric` 을 `normal` 로 되돌리고, 이 저장소의
버튼 규칙은 `font-family`·`font-size`·`line-height` 를 따로 적을 뿐 단축을 쓰지
않으므로 부모에서 상속시키면 닿지 않는다.

### 6.3 `.ns-pagination-gap`

`padding-inline` 을 **버린다.** 트랙 폭을 번호가 정하므로 필요 없고, 남겨 두면
gap 이 최댓값을 다툴 여지만 생긴다. 색·글꼴 크기는 그대로 둔다.

```css
.ns-pagination-gap {
  text-align: center;   /* 그리드 항목은 트랙 폭만큼 늘어난다 */
  color: var(--ns-color-fg-subtle);
  font-size: var(--ns-font-size-sm);
  line-height: var(--ns-line-height-sm);
}
```

세로 가운데는 `.ns-pagination-pages` 의 `align-items: center` 가 맡는다.

### 6.4 건드리지 않는 것

`.ns-button--sm` 에 `min-width` 를 주지 않는다. 페이지네이션 밖의 모든 작은
버튼이 함께 넓어진다.

## 7. 경계

- **`pages <= 1` 이면 아무것도 렌더하지 않는다.** 설계 스펙 §7.4 의 문서화된
  보증이고 이번 변경이 건드릴 이유가 없다.
- `pages` 가 2 이상 `size` 이하면 전 페이지를 그리고 gap 이 없다. 슬롯 수가
  `pages` 로 고정이라 그 데이터셋 안에서는 역시 움직이지 않는다.
- `total`·`per-page` 가 잘못된 값일 때의 기존 경로(경고 후 0 페이지 → 렌더 없음)는
  그대로다. `page-window` 검증은 그보다 뒤에서 일어난다.
- `updated()` 의 포커스 복구는 `this.querySelector` 로 후손을 찾으므로 래퍼가
  생겨도 그대로 동작한다.

## 8. 문서 변경 범위

| 파일 | 무엇 |
|---|---|
| `src/components/pagination/ns-pagination.ts` | `pageWindow` 3인자화 · `pageWindow` 프로퍼티 · `#window` 게터 · `#warnedWindow` · 템플릿에 래퍼 |
| `src/controls/controls.css` | `.ns-pagination-pages` 신설 · `.ns-pagination-gap` 수정 |
| `docs/superpowers/specs/2026-08-13-ns-table-design.md` | §7.1 표에 `page-window` 행 · §7.2 렌더 결과에 래퍼 · §7.3 윈도우 규칙 교체 |
| `index.html` | 클래스 표에 `.ns-pagination-pages` · `page-window` 속성 표 행 · `page-window="5"` 데모 |
| `docs/gotchas.md` | §6.1·§6.2 의 두 함정과 grid `1fr` 균등이 성립하는 조건 |
| `docs/pending-human-checks.md` | §10 의 육안 목록 |

`index.html` 클래스 표는 선택이 아니다 — `check-tokens.mjs` 의 규칙 ④ 가
`controls.css` 의 클래스와 그 표를 대조한다. 새 절의 id 에는 절 이름을
접두사로 붙인다.

`docs/pending-human-checks.md` 는 목록만 늘리지 않는다. **`## 범위` 절에도 이번
사이클이 넣은 것으로 한 줄 더한다** — 그 절이 아래 목록이 무엇을 덮는지 설명하는
자리라, 목록만 자라면 범위 설명이 조용히 낡는다.

**`README.md` 와 `docs/consumer-example.tsx` 는 바뀌지 않는다.** README 에는
컴포넌트 API 표가 없고(`ns-pagination` 언급은 프로퍼티 전용 속성 경고 한 줄뿐이다),
`consumer-example.tsx` 가 지켜야 하는 것은 **이벤트의 `EventName<>` 브랜딩**인데
이번 변경은 이벤트를 건드리지 않는다. 릴리스 표에 행을 더하는 것은
`.claude/skills/releasing` 의 몫이지 이 스펙의 몫이 아니다.

## 9. 소비자 영향

DOM 에 래퍼가 하나 생기므로 **`ns-pagination nav > button` 으로 번호 버튼을
겨냥하던 소비자 CSS 는 깨진다.** 그 선택자에는 이전·다음만 남고 번호는 한 단계
아래로 간다. 릴리스 노트에 적는다.

앞쪽·뒤쪽 배치에서 보이는 번호가 늘어난다(`size=7` 기준 `1 2 3 … 12` → `1 2 3 4 5 … 12`).
의도한 변화다.

## 10. 검증

### 10.1 `npm run check` 가 잡는 것

- 라이브러리·소비자 타입 (`pageWindow` 3인자화가 호출부와 맞는지)
- 규칙 ④ — `.ns-pagination-pages` 가 `index.html` 클래스 표에 있는지

**새 검사 스크립트를 만들지 않는다.** 이 변경이 만드는 조용한 드리프트는 둘이고
둘 다 기존 수단이 덮는다 — 기본값 드리프트는 `DEFAULT_PAGE_WINDOW` 상수 하나가,
클래스 문서 드리프트는 규칙 ④가 막는다.

### 10.2 사람 눈이 필요한 것

`docs/pending-human-checks.md` 에 옮긴다.

- `total=240 · per-page=20` 데모에서 1 → 12 → 1 로 끝까지 넘기며 **"다음" 버튼의
  왼쪽 모서리가 1px도 움직이지 않는지.** 4→5, 9→10 경계가 가장 위험하다
- `page-window="5"` 데모에서 같은 확인
- 페이지가 2~7개인 데모에서 gap 없이 전부 그려지는지, 그 안에서도 고정인지
- **100페이지 이상**에서 고정인지 (§6.2 가 실제로 듣는지)
- 현재 페이지 버튼의 테두리가 살아 있는지 (§6.1 의 선택자를 잘못 쓰면 사라진다)
- gap `…` 이 칸 안에서 세로·가로 가운데인지
- 키보드로 "다음" 에 Tab 한 뒤 Enter 를 연타할 때 포커스가 "다음" 에 남는지
- 다크 모드에서 투명 테두리가 드러나지 않는지

§6.1 의 투명 테두리는 **템플릿이 비활성 번호에 `--ghost` 를 쓴다는 전제**에 묶여
있다. 변형을 바꾸면 규칙이 조용히 안 맞고 폭이 다시 흔들린다. `npm run check` 가
보지 못하는 지점이라 여기에 적는다.

## 11. 하지 않는 것

- `.ns-button--sm` 전역에 `min-width` 를 주지 않는다 (§6.4)
- 번호 목록을 버리는 UX(`이전 / 4 of 12 / 다음`)로 가지 않는다. 임의 페이지 점프를 잃는다
- `nav` 를 `justify-content: space-between` 으로 양 끝 정렬하지 않는다. 끝은 고정되지만 가운데 번호가 계속 흔들리고, 페이지네이션이 컨테이너 전체 폭을 차지하게 된다
- `page-window` 를 짝수까지 받도록 넓히지 않는다 (§4.1)
