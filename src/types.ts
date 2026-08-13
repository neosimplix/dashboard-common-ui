/** ns-header 의 토글 버튼이 올리는 이벤트. open 은 "요청되는 다음 상태"다. */
export interface NsToggleDetail {
  open: boolean;
}

/** ns-nav-item 클릭이 올리는 이벤트. 라우팅은 소비자가 처리한다. */
export interface NsNavigateDetail {
  href: string;
  label: string;
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

declare global {
  interface HTMLElementEventMap {
    "ns-toggle": CustomEvent<NsToggleDetail>;
    "ns-navigate": CustomEvent<NsNavigateDetail>;
    "ns-dialog-close": CustomEvent<NsDialogCloseDetail>;
    "ns-sort": CustomEvent<NsSortDetail>;
    "ns-select-change": CustomEvent<NsSelectChangeDetail>;
    "ns-page-change": CustomEvent<NsPageChangeDetail>;
  }
}
