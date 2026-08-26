/** ns-header 의 토글 버튼이 올리는 이벤트. open 은 "요청되는 다음 상태"다. */
export interface NsToggleDetail {
  open: boolean;
}

/** ns-nav-item 클릭이 올리는 이벤트. 라우팅은 소비자가 처리한다. */
export interface NsNavigateDetail {
  href: string;
  label: string;
}

/**
 * ns-nav-group 의 헤딩 버튼이 올리는 이벤트. open 은 "요청되는 다음 상태"다.
 *
 * 어느 그룹인지는 e.target 이 준다. heading 을 함께 싣지 않는 이유는 그것이
 * 표시용 문자열이라 상태를 저장할 키로 나쁘고, 필드가 둘이 되는 순간 필드를
 * 하나 더하는 것이 breaking 이 되기 때문이다.
 */
export interface NsGroupToggleDetail {
  open: boolean;
}

/**
 * ns-sidebar 의 레일 타일이 요청하는 다음 그룹.
 *
 * `name` 은 `ns-nav-group` 의 `name` 속성이다. `heading` 을 함께 싣지 않는
 * 이유는 그것이 표시용 문자열이라 상태를 저장할 키로 나쁘고, 필드가 둘이 되는
 * 순간 필드를 하나 더하는 것이 breaking 이 되기 때문이다 —
 * NsGroupToggleDetail 과 같은 판단이다.
 *
 * **"바뀌었다" 가 아니라 "바꾸고 싶다" 다.** 제어 모드에서 소비자가
 * activeGroup 을 바꾸지 않으면 패널은 그대로 있다.
 */
export interface NsGroupSelectDetail {
  name: string;
}

/** ns-dialog 가 닫히기를 요청할 때 올리는 이벤트의 사유. */
export type NsDialogCloseReason = "escape" | "close-button" | "backdrop";

/**
 * ns-dialog 가 닫히기를 요청한다. "닫혔다"가 아니라 "닫고 싶다"다 —
 * 제어 모드에서 소비자가 open 을 바꾸지 않으면 대화상자는 다시 열린다.
 */
export interface NsDialogCloseDetail {
  reason: NsDialogCloseReason;
}

/** ns-table 의 정렬 방향. */
export type NsSortDirection = "ascending" | "descending" | "none";

/**
 * ns-table 의 정렬 헤더 클릭이 올리는 이벤트.
 *
 * `direction` 이 `"none"` 이면 `key` 는 빈 문자열이다 — 정렬이 해제된 상태다.
 * **데이터를 다시 정렬하는 것은 소비자다.** 컴포넌트는 어느 칼럼이 어느 방향인지와
 * 그 시각 표시만 갖는다.
 */
export interface NsSortDetail {
  key: string;
  direction: NsSortDirection;
}

/**
 * ns-table 의 선택 변경. **요청되는 다음 전체 집합**이다 — 바뀐 하나가 아니다.
 *
 * 전체 집합으로 두는 이유는 소비자 처리가 한 줄이 되기 때문이다. 행 토글이든
 * 전체 선택이든 같다 — `setSelected(new Set(e.detail.ids))`.
 *
 * 범위는 **DOM 에 있는 행**, 즉 현재 페이지다. 서버 페이징에서 "전체 선택" 은
 * 보이는 20개를 뜻한다. "240개 전부 선택" 은 별개 기능이다.
 */
export interface NsSelectChangeDetail {
  ids: string[];
}

/** ns-pagination 의 페이지 이동. 요청되는 다음 페이지다. */
export interface NsPageChangeDetail {
  page: number;
}

/**
 * ns-tabs 의 탭 전환. 요청되는 다음 탭이다.
 *
 * `id` 는 탭 버튼의 `data-ns-tab` 값이다. **탭 버튼의 DOM `id` 가 아니다** —
 * 그쪽은 `data-ns-panel` 에서 파생된다(`tabIdFor`).
 */
export interface NsTabChangeDetail {
  id: string;
}

/**
 * ns-multi-select 의 선택 변경. **요청되는 다음 전체 집합**이다 — 바뀐 하나가 아니다.
 *
 * 전체 집합으로 두는 이유는 소비자 처리가 한 줄이 되기 때문이다 —
 * `setOwners(e.detail.values)`. `ns-select-change` 와 같은 판단이다.
 *
 * 이름이 `ns-select-change` 와 다른 이유는 그 이름을 ns-table 이 이미 쓰기
 * 때문이다. HTMLElementEventMap 은 전역이라 같은 이름에 다른 detail 을 실을 수 없다.
 */
export interface NsMultiSelectChangeDetail {
  values: string[];
}

declare global {
  interface HTMLElementEventMap {
    "ns-toggle": CustomEvent<NsToggleDetail>;
    "ns-navigate": CustomEvent<NsNavigateDetail>;
    "ns-group-toggle": CustomEvent<NsGroupToggleDetail>;
    "ns-group-select": CustomEvent<NsGroupSelectDetail>;
    "ns-dialog-close": CustomEvent<NsDialogCloseDetail>;
    "ns-sort": CustomEvent<NsSortDetail>;
    "ns-select-change": CustomEvent<NsSelectChangeDetail>;
    "ns-page-change": CustomEvent<NsPageChangeDetail>;
    "ns-tab-change": CustomEvent<NsTabChangeDetail>;
    "ns-multi-select-change": CustomEvent<NsMultiSelectChangeDetail>;
  }
}
