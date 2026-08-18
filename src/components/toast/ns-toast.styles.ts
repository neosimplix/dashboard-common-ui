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
    /*
      **이 숫자를 올려도 열려 있는 모달 ns-dialog 를 이길 수 없다.** showModal() 은
      대화상자를 top layer 로 올리고, top layer 는 통상 스태킹 컨텍스트의 모든
      z-index 위에 있다 — 정수 하나로 닿는 곳이 아니다. 대화상자가 열린 채로 띄운
      토스트는 대화상자와 ::backdrop 뒤에 가려 보이지도 눌리지도 않는다.

      Popover API(showPopover)로 이 리전도 top layer 에 올릴 수 있지만 쓰지 않는다.
      이유는 하나, 브라우저 하한이다 — showPopover 는 Firefox 125+ 인데 이 패키지의
      문서화된 하한은 Firefox 121 이다.

      (UA 의 [popover] 규칙이 border·padding 을 넣는 것은 이유가 아니다.
      check-tokens.mjs 규칙 ④ 는 no-op 값을 면제하므로 :host { border: none;
      padding: 0 } 으로 되돌리면 통과한다.)

      해결은 문서다 — index.html 의 nsToast 절 "주의" 에 적혀 있다.
    */
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

  /*
    tone 은 왼쪽 색 띠 하나로만 표현한다. 배경을 칠하면 글자 대비를 다시 정해야 한다.

    neutral 도 같은 두께의 투명한 띠를 갖는다. 없으면 색 있는 것만 3px 두꺼워져
    쌓였을 때 neutral 만 안쪽 폭이 좁고 글자 시작점이 어긋난다.
  */
  .toast          { border-left: 3px solid transparent; }
  .toast.success  { border-left-color: var(--ns-color-success); }
  .toast.danger   { border-left-color: var(--ns-color-danger); }
  .toast.warn     { border-left-color: var(--ns-color-warn); }

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
`;
