# ns-table 설계

정렬 · 페이징 · 선택이 붙는 표를 `common-ui` 에 추가한다. 프리미티브 스펙(`2026-08-13-common-ui-primitives-design.md` §10)이 여기로 미룬 작업이다.

참고 구현: `dashboard-shell/components/ui/Table.tsx` · `Table.module.css`, 그리고 실사용 표 9곳.

## 1. 실측이 바꾼 전제

계획 전에 `dashboard-shell` 의 표 9곳을 읽었고 두 가지가 예상과 달랐다.

**정렬 · 페이징 · 선택이 지금 앱에 하나도 없다.** 표 9곳 전부 서버/컨텍스트에서 받은 `records` 를 그대로 그린다. 코드에서 "정렬" 이 나오는 유일한 곳은 서버측 순서를 확인하는 테스트 한 줄(`sortOpenAccess`)이다. **기존 동작의 추출이 아니라 새 기능이다.**

**셀 내용이 데이터 주입형 API 로 표현되지 않는다.** `app/(shell)/admin/users/UserTable.tsx` 한 곳만 봐도 이렇다.

```tsx
<td><span className={s.identity}>
  {record.name}
  {record.role === "super" && <StatusPill tone="neutral">슈퍼 관리자</StatusPill>}
</span></td>
<td>{departmentName(record.departmentId)}</td>   {/* 참조 조회 + 로딩/없음 구분 */}
{showApproval && <th>승인</th>}                   {/* 조건부 칼럼 */}
<td><span className={s.actions}>
  {actions.canApprove && <Button size="sm" …>승인</Button>}
  {actions.canRevoke  && <Button variant="outline" …>승인 취소</Button>}
  … 행별 권한 객체로 갈리는 버튼 6개
</span></td>
```

임의의 마크업, 참조 조회, 조건부 칼럼, 행별 권한으로 갈리는 버튼 여섯. **Lit 엘리먼트는 소비자의 React 렌더 함수를 호출해 자기 안에 React 요소를 만들 수 없다.** 폼 컨트롤에서 shadow 경계가 폼 참여를 끊었던 것과 같은 종류의 경계다.

## 2. 표가 소유하는 것은 데이터가 아니라 컨트롤이다

"정렬 · 페이징" 이 두 가지로 갈린다.

| | 표가 소유 | 필요한 것 |
|---|---|---|
| A. 데이터 | `rows` 를 받아 직접 정렬하고 잘라 렌더 | 데이터 주입형 API + 셀 렌더러. 표 9곳 전부 다시 쓴다 |
| **B. 컨트롤과 상태** | 어느 칼럼 · 어느 방향 · 몇 페이지인지. 이벤트로 올리고 **적용은 소비자** | 소비자가 셀 마크업을 계속 쓴다 |

**B 를 택한다.** 근거 셋이다.

1. 표 9곳이 이미 서버/컨텍스트에서 데이터를 받는다. 대시보드 목록을 클라이언트에서 정렬 · 페이징하는 모델이 아니다.
2. 서버 페이징으로 갈 때 B 는 그대로 맞고 A 는 뒤집어야 한다.
3. §1 의 셀 내용을 A 로 표현하려면 셀 렌더러가 필수인데, 웹 컴포넌트에서 그것을 React 콘텐츠로 채울 방법이 없다.

**따라서 `ns-table` 은 셀을 렌더하지 않고 데이터를 모른다.** 정렬 · 페이징 상태와 그 시각 표시, 그리고 순수 HTML 로는 만들 수 없는 부분만 소유한다.

## 3. 새 규칙 — Light DOM

> **공통 컨트롤 스타일을 재사용해야 하는 컴포넌트는 Light DOM 을 쓴다.**

shadow root 를 갖는 이유는 스타일 캡슐화 하나다. `controls.css` 를 쓰려는 컴포넌트에는 그 캡슐화가 방해다.

프리미티브 스펙 §9 가 `ns-dialog` 닫기 버튼의 `.ns-button--ghost` 값 중복을 수용하면서 "테이블에서 다시 본다" 고 적었다. 페이징 컨트롤은 버튼이 여러 개(이전 · 다음 · 번호)라 그 중복이 열 줄이 아니다. Light DOM 으로 렌더하면 **중복이 0 줄이 된다.**

대가는 스타일 캡슐화 상실이다. 하지만 이 컴포넌트들이 그리는 것은 **이미 전역 클래스로 스타일되는 요소들**이라 잃을 캡슐화가 애초에 없다.

**Light DOM 이므로 컴포넌트가 붙이는 클래스와 소비자가 쓰는 훅 속성 전부 `ns-` 접두사를 쓴다.** 문서 이름공간에 그대로 들어간다. 훅 속성은 `data-ns-` 다 — `data-sort-key` 가 읽기는 편하지만, 충돌하면 엉뚱한 요소를 정렬 헤더로 오인해 **에러 없이 오동작한다.**

## 4. 세 조각

| 조각 | 형태 | 하는 일 | 안 하는 일 |
|---|---|---|---|
| `.ns-table` | 클래스 | 표 표면 — 테두리 · 패딩 · `th`/`td` · hover · `min-width: max-content` | 레이아웃 · 스크롤 |
| `ns-table` | Light DOM 태그 | 스크롤 컨테이너. `<th>` 클릭 위임 → `ns-sort`. `aria-sort` 관리. 전체 선택 3-상태 계산 → `ns-select-change` | **셀을 렌더하지 않는다.** 데이터를 모른다 |
| `ns-pagination` | Light DOM 태그 | `.ns-button` 컨트롤 렌더 → `ns-page-change` | 데이터를 모른다. 표 밖 형제 |

### 4.1 `ns-table` 이 스크롤 컨테이너를 겸한다

참고 구현은 `<div class="scroll">` 로 표를 감싼다. 좁은 화면에서 표가 부모를 밀어내지 않게 하고, `min-width: max-content` 와 짝을 이뤄 **액션 칼럼의 버튼이 쥐어짜여 줄바꿈되는 것**을 막는다(실제로 깨졌던 화면의 축소판이 갤러리에 남아 있다).

그 역할을 `ns-table` 요소가 맡는다. 래퍼용 클래스를 따로 두면 "정렬은 필요 없고 스타일만" 인 경우와 두 가지 쓰는 법이 생긴다.

**요소 선택자는 정의되지 않은 커스텀 엘리먼트에도 적용되므로 JS 없이도 스타일이 맞다.** 스타일은 즉시, 동작은 JS 로드 시 붙는다.

```css
ns-table { display: block; overflow-x: auto; }
```

### 4.2 소비자가 쓰는 모양

```html
<ns-table>
  <table class="ns-table">
    <thead><tr>
      <th><label class="ns-checkbox"><input type="checkbox" data-ns-select-all></label></th>
      <th data-ns-sort-key="name"><button class="ns-table-sort" type="button">이름</button></th>
      <th>이메일</th>
    </tr></thead>
    <tbody>
      <tr>
        <td><label class="ns-checkbox"><input type="checkbox" data-ns-row-id="a@b.com"></label></td>
        <td>홍길동</td>
        <td>a@b.com</td>
      </tr>
    </tbody>
  </table>
</ns-table>

<ns-pagination total="240" page="3" per-page="20"></ns-pagination>
```

`data-ns-sort-key` 가 없는 `<th>` 는 정렬되지 않는다. 칼럼별 스위치가 그것뿐이다.

`UserTable` 의 셀은 **하나도 바뀌지 않는다.** 소비자는 `<Table>` 을 `<ns-table>` + `class="ns-table"` 로 바꾸고 정렬할 `<th>` 에 훅을 붙이면 끝이다.

## 5. 정렬

### 5.1 헤더는 `<button>` 을 품는다

```html
<th data-ns-sort-key="name"><button class="ns-table-sort" type="button">이름</button></th>
```

`<th>` 자체를 클릭 가능하게만 만들면 **키보드로 도달할 수 없고 화면낭독기가 상호작용 요소로 안내하지 않는다.** `tabindex`/`role="button"` 을 `<th>` 에 얹는 것은 표 의미를 깨뜨린다. `<button>` 을 안에 두는 것이 유일하게 옳은 방법이다.

`ns-table` 은 렌더를 하지 않으므로 이것을 대신 만들어 줄 수 없다. **B 를 택한 값이다** — 소비자가 한 줄 더 쓰고 마우스 없이도 정렬된다.

### 5.2 방향은 3-상태

`none → ascending → descending → none`

2-상태로 하면 **서버의 기본 정렬로 돌아갈 방법이 없다.** 이 앱에서 그 기본 순서가 의도를 담는다 — `sortOpenAccess` 는 "오래된 신청이 위" 다. 이름으로 한 번 정렬하면 새로고침 말고는 되돌릴 수 없게 된다.

### 5.3 `aria-sort` 의 유일한 작성자는 컴포넌트다

활성 `<th>` 에 `ascending` / `descending` / `none` 을 쓴다. **소비자는 `aria-sort` 를 쓰지 않는다** — 작성자가 하나라 React 와 싸우지 않는다.

삼각형은 `aria-sort` 를 받아 CSS 가 그린다.

```css
.ns-table th[aria-sort="ascending"] .ns-table-sort::after { /* border 로 그린 삼각형 */ }
```

**`content` 로 화살표 문자를 넣지 않는다.** 생성된 텍스트는 일부 브라우저에서 화면낭독기에 읽혀 `aria-sort` 와 중복 안내가 된다. `border` 로 그린 삼각형은 텍스트 노드가 없어 안내되지 않고, 의미는 `aria-sort` 하나가 담는다.

### 5.4 API

제어는 프로퍼티 전용, 비제어 초기값은 별도 속성이다 — `ns-dialog` 의 `open`/`default-open` 과 같은 짝이다. 하나로 겸용하면 `<ns-table sort-key="name">` 이 제어 모드로 들어가 컴포넌트가 스스로 방향을 바꾸지 못한다.

| 프로퍼티 | 속성 | 타입 | 기본값 |
|---|---|---|---|
| `sortKey` | 없음 (프로퍼티 전용) | `string \| undefined` | `undefined` — 설정하면 제어 |
| `sortDirection` | 없음 (프로퍼티 전용) | `"ascending" \| "descending" \| "none" \| undefined` | `undefined` |
| `defaultSortKey` | `default-sort-key` | string | `""` |
| `defaultSortDirection` | `default-sort-direction` | `"ascending" \| "descending" \| "none"` | `"none"` |

| 이벤트 | detail |
|---|---|
| `ns-sort` | `{ key: string, direction: "ascending" \| "descending" \| "none" }` |

제어 판정은 `sortKey !== undefined` 다. **어느 쪽이든 데이터를 다시 정렬하는 것은 소비자다** — 비제어에서 컴포넌트가 소유하는 것은 "어느 칼럼이 어느 방향인지" 와 `aria-sort` 표시뿐이다.

## 6. 선택

### 6.1 컴포넌트가 소유하는 것은 전체 선택 체크박스 하나다

`checked` 와 `indeterminate` 를 **컴포넌트가 유일하게 쓴다.** `aria-sort` 와 같은 규약이고, 소비자는 그 둘을 바인딩하지 않는다.

`indeterminate` 는 프로퍼티고 대응하는 HTML 속성이 없다. **마크업만으로는 "일부 선택" 을 만들 수 없다.** 순수 HTML 소비자가 스스로 하려면 반드시 JS 를 써야 하고, 그래서 이것이 컴포넌트가 가져갈 값이 있는 정확한 지점이다.

### 6.2 제어 모드에서 행 체크박스를 건드리지 않는다

React 에서 행 체크박스는 거의 항상 제어된다 — `checked={selected.has(id)}`. **그 상태에서 컴포넌트가 `.checked` 를 쓰면 다음 렌더에 React 가 덮어쓴다.**

| | 행 체크박스 | 전체 선택 |
|---|---|---|
| 제어 (`selected` 설정) | **쓰지 않는다.** 요청된 다음 상태를 계산해 이벤트로만 올린다 | 컴포넌트가 3-상태를 쓴다 |
| 비제어 | 전체 선택 시 컴포넌트가 직접 `checked` 를 쓴다 — 아무도 안 하니까 | 같다 |

**비제어의 초기 선택은 마크업의 `checked` 속성에서 온다.** `default-selected` 프로퍼티를 두지 않는다 — 네이티브 폼과 같은 방식이고 컴포넌트는 DOM 을 읽으면 된다.

### 6.3 API

| 프로퍼티 | 속성 | 타입 | 기본값 |
|---|---|---|---|
| `selected` | 없음 (프로퍼티 전용) | `string[] \| undefined` | `undefined` |

| 이벤트 | detail |
|---|---|
| `ns-select-change` | `{ ids: string[] }` — **요청되는 다음 전체 집합** |

detail 을 "바뀐 하나" 가 아니라 전체 집합으로 두는 이유는 소비자 처리가 한 줄이 되기 때문이다 — 행 토글이든 전체 선택이든 같다.

```tsx
<NsTable selected={[...selected]} onNsSelectChange={(e) => setSelected(new Set(e.detail.ids))}>
```

### 6.4 전체 선택의 범위는 현재 페이지다

DOM 에 있는 행만 대상이다. 서버 페이징에서 "전체 선택" 은 **보이는 20개**를 뜻한다. "240개 전부 선택" 은 별개 기능으로 범위 밖이다.

**문서에 명시한다.** 오해하면 데이터를 잘못 지우는 종류의 모호함이다.

### 6.5 `MutationObserver` 를 받아들이는 이유

행이 오고 가면(페이지 이동, 필터) 전체 선택의 3-상태를 다시 계산해야 한다.

프리미티브 스펙 §4.4 는 `ns-field` 를 light DOM 엘리먼트로 만드는 안을 `MutationObserver` 복잡도 때문에 거절했다. **여기서는 받아들인다.** 차이가 있다 — `ns-field` 의 관찰자는 임의의 자식에 `id`·`aria-*` 를 **주입**하는 일을 다시 해야 했고, 여기 관찰자는 `querySelectorAll('[data-ns-row-id]')` 로 **개수를 다시 세는** 한 가지만 한다. 범위가 좁고 비용이 싸며, 대안은 "소비자가 `refresh()` 를 부른다" 뿐이다.

`childList` · `subtree` 로 표를 관찰하고 재계산만 한다.

## 7. `ns-pagination`

표를 모른다. 어떤 목록에도 붙는다.

### 7.1 API

| 프로퍼티 | 속성 | 타입 | 기본값 | 설명 |
|---|---|---|---|---|
| `total` | `total` | number | `0` | 전체 **항목** 수 |
| `perPage` | `per-page` | number | `20` | |
| `page` | 없음 (프로퍼티 전용) | number \| undefined | `undefined` | 설정하면 제어 |
| `defaultPage` | `default-page` | number | `1` | 비제어 초기값 |

`page` 가 프로퍼티 전용인 이유는 `sortKey` · `ns-dialog` 의 `open` 과 같다 — 속성으로 두면 `<ns-pagination page="3">` 이 제어 모드로 들어가 컴포넌트가 스스로 페이지를 넘기지 못한다. 순수 HTML 은 `default-page` 를 쓴다.

페이지 수는 `ceil(total / perPage)` 다. 서버 응답이 주는 것은 보통 항목 수라서 그쪽을 받는다.

| 이벤트 | detail |
|---|---|
| `ns-page-change` | `{ page: number }` — 요청되는 다음 페이지 |

### 7.2 렌더하는 것

```html
<nav aria-label="페이지 이동">
  <button class="ns-button ns-button--ghost ns-button--sm">이전</button>
  <button class="ns-button ns-button--ghost ns-button--sm">1</button>
  <span class="ns-pagination-gap">…</span>
  <button class="ns-button ns-button--ghost ns-button--sm">3</button>
  <button class="ns-button ns-button--outline ns-button--sm" aria-current="page">4</button>
  <button class="ns-button ns-button--ghost ns-button--sm">5</button>
  <span class="ns-pagination-gap">…</span>
  <button class="ns-button ns-button--ghost ns-button--sm">12</button>
  <button class="ns-button ns-button--ghost ns-button--sm">다음</button>
</nav>
```

**Light DOM 이라 `.ns-button` 이 그대로 먹는다.** shadow 였다면 이 버튼 스타일을 전부 다시 적어야 했다.

### 7.3 번호 윈도우 규칙

- 페이지 수 ≤ 7 이면 전부 표시
- 그 외에는 **첫 페이지 · 현재±1 · 마지막 페이지**, 빈 구간에 `…`
- 현재 페이지는 `--outline` + `aria-current="page"`. **비활성화하지 않는다** — 탭 순서에서 빠지면 키보드 사용자가 위치를 잃는다. 클릭은 아무 일도 하지 않는다
- 이전/다음은 양 끝에서 `disabled`

### 7.4 경계

- **페이지가 1개 이하면 아무것도 렌더하지 않는다.** 쓸모없는 컨트롤을 남기지 않는다
- `total = 0` 도 같다. 빈 상태 문구는 소비자 것이다
- `page` 가 범위를 벗어나면 표시용으로만 clamp 하고 콘솔 경고를 한 번 낸다. **이벤트로 교정하지 않는다** — 소비자 상태와 서로 밀어내는 루프가 된다

## 8. 구현 제약 — Light DOM 에서 Lit 이 소비자 자식을 지운다

이 스펙에서 가장 위험한 지점이다.

`createRenderRoot() { return this }` 로 light DOM 에 렌더하면 **Lit 이 그 요소의 내용을 자기 템플릿으로 교체한다.** `ns-table` 은 소비자가 쓴 `<table>` 을 품으므로, 빈 템플릿이라도 렌더하면 **표가 사라진다.**

| | 렌더하는가 | 베이스 클래스 |
|---|---|---|
| `ns-table` | **안 한다.** 이벤트 위임과 속성 갱신만 | `ReactiveElement` — `@property` 반응성과 생명주기는 주고 **렌더 파이프라인이 없다** |
| `ns-pagination` | 한다(버튼 생성). 자식이 없어 충돌 없음 | `LitElement` + `createRenderRoot() { return this }` |

**두 컴포넌트 모두 `createRenderRoot()` 를 재정의해야 한다.** `ReactiveElement` 를 쓰는 것만으로는 부족하다 — 그 기본 `createRenderRoot()` 가 **shadow root 를 만든다.** shadow root 가 있으면 `<slot>` 이 없는 한 light DOM 자식이 렌더되지 않으므로, 재정의하지 않으면 `ns-table` 이 템플릿을 렌더하지 않아도 **소비자의 표가 그대로 사라진다.**

```ts
// ns-table — ReactiveElement 를 상속하고도 이 재정의가 필요하다
protected override createRenderRoot(): HTMLElement {
  return this;   // shadow root 를 만들지 않는다
}
```

즉 실패 경로가 둘이고 서로 다르다. Lit 템플릿을 렌더하면 자식이 **덮어써지고**, shadow root 가 생기면 자식이 **가려진다.** 둘 다 에러 없이 빈 표가 된다.

`ReactiveElement` 는 `lit` 이 재수출하고 `vite.config.ts` 의 `litExternal` 정규식이 이미 `@lit/reactive-element` 를 덮는다. 빌드 설정 변경이 없다.

`updated()` · `firstUpdated()` · `willUpdate()` 는 `ReactiveElement` 가 제공한다. `render()` 만 `LitElement` 의 것이므로, `ns-table` 은 `updated()` 에서 `aria-sort` 와 전체 선택 상태를 쓴다.

**이 라이브러리에 세 번째 컴포넌트 유형이 생긴다** — shadow + 렌더(기존 8개), light DOM + 렌더(`ns-pagination`), light DOM + 렌더 없음(`ns-table`). `library-invariants.md` 에 판단 기준을 적는다.

## 9. React 래퍼

`sortKey` · `selected` · `total` · `page` 어느 것도 HTML 전역 속성과 충돌하지 않는다. **shim 이 필요 없다.** `NsTable` · `NsPagination` 을 평범한 `createComponent` 래퍼로 공개하고, `docs/consumer-example.tsx` 가 세 이벤트의 `e.detail` 을 직접 읽는다.

`ns-dialog` 는 `title` 개명과 `onClose` 어댑팅 때문에 shim 을 거쳐야 했고, 그 결과 `EventName<>` 방어가 shim 안으로 옮겨갔다(`gotchas.md` 의 "인자 0개짜리 핸들러는 `EventName<>` 캐스트 검사를 무력화한다"). 여기서는 고전적인 경로가 그대로 동작한다.

## 10. 검증

`npm run check` 는 네 단계 그대로다.

### 10.1 `check-controls.mjs` 를 요소 선택자까지 넓힌다

지금 정규식은 `\.(ns-[a-z0-9_-]+)` 로 **점이 붙은 클래스만** 잡는다. `controls.css` 에 새로 들어가는 `ns-table { }` 과 `ns-pagination { }` 은 요소 선택자라 **검사에서 그냥 빠진다.**

규칙 시작 위치의 요소 선택자를 **정방향으로만** 추가한다 — CSS 에 있으면 문서에도 있어야 한다. 역방향은 넣지 않는다(태그 이름은 `index.html` 전체에 정당하게 등장한다).

### 10.2 실패시켜 볼 검사

- `controls.css` 에 `ns-fake { }` 를 넣어 ④가 막는지 (요소 선택자 추출)
- 세 이벤트의 `EventName<>` 캐스트를 각각 지워 **①은 통과하고 ②가 실패**하는지

### 10.3 사람이 확인할 것

- 정렬 헤더를 **Tab 으로 도달**해 Enter/Space 로 정렬되는지
- 삼각형이 `aria-sort` 를 따라 바뀌고 화면낭독기가 방향을 **한 번만** 안내하는지
- 전체 선택이 일부 선택 상태에서 **가로줄(indeterminate)** 로 보이는지
- 페이지를 옮긴 뒤 전체 선택 3-상태가 다시 계산되는지
- 좁은 컨테이너에서 표가 부모를 밀지 않고 **가로 스크롤**되며 액션 버튼이 줄바꿈되지 않는지
- 번호 윈도우가 12페이지 · 3페이지 · 1페이지에서 각각 맞는지
- JS 없이 `<ns-table>` 이 스타일만으로 스크롤 컨테이너로 동작하는지

## 11. 새 클래스와 새 이벤트

| 클래스 | 붙이는 요소 |
|---|---|
| `.ns-table` | `<table>` |
| `.ns-table-sort` | `<th>` 안의 `<button>` |
| `.ns-pagination-gap` | `…` `<span>` |

요소 선택자: `ns-table`, `ns-pagination`.

이벤트 셋: `ns-sort`, `ns-select-change`, `ns-page-change`. 각각 `src/types.ts` 의 detail 인터페이스 + `HTMLElementEventMap` 확장 + `elements.ts` 의 `EventName<>` 캐스트가 함께 움직인다.

## 12. 수용한 한계

- **정렬 · 페이징의 적용은 소비자 몫이다.** 컴포넌트는 상태와 시각 표시만 갖는다(§2)
- **정렬 헤더의 `<button>` 을 소비자가 쓴다.** 렌더하지 않는 컴포넌트의 대가다
- **전체 선택은 현재 페이지만이다.** 크로스 페이지 선택은 범위 밖
- **Light DOM 이라 스타일 캡슐화가 없다.** 소비자의 `button { }` 이나 `table { }` 규칙이 새어 들어올 수 있다
- **`ns-table` 이 `aria-sort` 와 전체 선택 체크박스의 상태를 쓴다.** 소비자 DOM 을 좁게 건드리는 것을 수용했다. 그 둘은 컴포넌트가 유일한 작성자다

## 13. 이번 범위 밖

- **`dashboard-shell` 표 9곳 이관.** 별도 스펙. 이관 모양은 §4.2 에 있다 — `<Table>` → `<ns-table>` + `class="ns-table"`, 정렬할 `<th>` 에 `data-ns-sort-key` 와 `<button class="ns-table__sort">` 추가. 셀 내용은 그대로
- **페이지 크기 선택(10/20/50).** 컨트롤이 하나 더 늘고 지금 요구가 없다
- **"전체 240개 선택".** §6.4 의 페이지 범위 결정과 짝인 별개 기능
- 열 리사이즈 · 열 고정 · 가상 스크롤 · 행 확장 · 드래그 정렬
- **`ns-header`·`ns-sidebar` 의 비제어 지원.** 프리미티브 스펙이 남긴 별개 항목
