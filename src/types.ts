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

declare global {
  interface HTMLElementEventMap {
    "ns-toggle": CustomEvent<NsToggleDetail>;
    "ns-navigate": CustomEvent<NsNavigateDetail>;
    "ns-dialog-close": CustomEvent<NsDialogCloseDetail>;
  }
}
