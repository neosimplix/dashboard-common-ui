import { css } from "lit";

/*
  shadow 스타일이다. controls.css 는 shadow 안에 도달하지 않으므로 닫기 버튼
  스타일을 최소한만 다시 적는다 — ns-dialog 가 수용한 것과 같은 중복이다.

  :host 에 border·margin·padding 을 두지 않는다(Tailwind preflight 가 지운다).
  position·inset 은 preflight 가 건드리지 않으므로 여기 둔다.
*/
export const styles = css`
  :host {
    position: fixed;
    right: var(--ns-space-4);
    bottom: var(--ns-space-4);
    z-index: 1000;
    display: block;
    /* 토스트가 없는 동안 화면 오른쪽 아래 클릭을 가로채지 않는다. */
    pointer-events: none;
  }

  .region {
    display: flex;
    flex-direction: column;
    gap: var(--ns-space-2);
    /* 좁은 화면에서 화면 밖으로 나가지 않게 한다. */
    max-width: min(24rem, calc(100vw - var(--ns-space-8)));
  }

  .toast {
    display: flex;
    align-items: flex-start;
    gap: var(--ns-space-3);
    padding: var(--ns-space-3) var(--ns-space-4);
    border: 1px solid var(--ns-color-line);
    border-radius: var(--ns-radius-panel);
    background: var(--ns-color-surface);
    box-shadow: var(--ns-elevation-card);
    font-size: var(--ns-font-size-sm);
    line-height: var(--ns-line-height-sm);
    color: var(--ns-color-fg-body);
    /* :host 가 pointer-events 를 껐으므로 항목에서만 되살린다. */
    pointer-events: auto;
  }

  /* tone 은 왼쪽 색 띠 하나로만 표현한다. 배경을 칠하면 글자 대비를 다시 정해야 한다. */
  .toast.success { border-left: 3px solid var(--ns-color-success); }
  .toast.danger  { border-left: 3px solid var(--ns-color-danger); }
  .toast.warn    { border-left: 3px solid var(--ns-color-warn); }

  .message {
    flex: 1;
    min-width: 0;
    /* 긴 메시지가 한 줄로 넘치지 않게 한다. */
    overflow-wrap: anywhere;
  }

  .close {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--ns-space-1);
    border: 0;
    border-radius: var(--ns-radius-control);
    background: none;
    color: var(--ns-color-fg-muted);
    cursor: pointer;
  }

  .close:hover {
    background: var(--ns-color-surface-hover);
    color: var(--ns-color-fg);
  }

  .close:focus-visible {
    outline: 2px solid var(--ns-color-accent);
    outline-offset: 2px;
  }

  /* 애니메이션을 끄는 사용자를 위한 것. 지금은 전이가 없지만 규약을 남겨 둔다. */
  @media (prefers-reduced-motion: reduce) {
    .toast { transition: none; }
  }
`;
