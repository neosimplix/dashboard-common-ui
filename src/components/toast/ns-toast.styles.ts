import { css } from "lit";

/*
  shadow 스타일이다. controls.css 는 shadow 안에 도달하지 않으므로 닫기 버튼
  스타일을 최소한만 다시 적는다 — ns-dialog 가 수용한 것과 같은 중복이다.

  :host 에 border·margin·padding 을 두지 않는다(Tailwind preflight 가 지운다).
  position·inset·transform·width 는 preflight 가 건드리지 않으므로 여기 둔다.
  가운데 정렬을 margin-inline: auto 로 하지 않는 이유가 그것이다 — margin 은
  preflight 가 0 으로 덮어 소비자 프로젝트에서만 가운데가 아니게 된다.
*/
export const styles = css`
  :host {
    position: fixed;
    /*
      **기본 자리(top-center)의 인셋을 :host 에도 둔다.** Lit 은 속성을 첫
      업데이트에서 반영하므로 그 전에는 [position] 이 없고, 아래 네 규칙 중
      아무것도 걸리지 않는다. 그 구간에 그려질 것이 실제로 있는지와 무관하게
      값이 하나도 없는 fixed 상자는 정적 위치(문서 흐름상 body 끝)에 남으므로,
      기본값에 해당하는 인셋을 여기 둬서 그 경우에도 제자리에 오게 한다.
      구간 자체의 분석은 ns-toast.ts 의 position 주석에 있다.
    */
    top: var(--ns-space-4);
    right: auto;
    bottom: auto;
    left: 50%;
    transform: translateX(-50%);
    /*
      **가운데 정렬에서 폭이 반토막 나는 것을 막는다.** width: auto 인 fixed 상자는
      shrink-to-fit 이고, 그때 "쓸 수 있는 폭" 은 컨테이닝 블록 폭에서 left 를 뺀
      값이다 — left: 50% 면 50vw 다. 좁은 화면에서 그 값이 .region 의 max-width
      보다 먼저 걸려 토스트가 화면 절반 폭으로 눌린다. max-content 는 그 계산에서
      빠지고, 넘치는 것은 .region 의 max-width 가 그대로 막는다.
    */
    width: max-content;
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
    /* 토스트가 없는 동안 리전이 덮는 자리의 클릭을 가로채지 않는다. */
    pointer-events: none;
  }

  /*
    네 자리. **각 규칙이 인셋 넷과 transform 을 모두 적는다.** 자기에게 필요한
    것만 적고 나머지는 다른 규칙이 지워 주기를 기대하면 두 값이 함께 걸리고,
    규칙을 하나 더할 때 어느 쪽이 이기는지가 소스 순서로 조용히 바뀐다.
    .ns-accordion 이 --card/--plain 을 반드시 함께 쓰게 만든 것과 같은 판단이다.

    top-center 규칙은 위 :host 기본값과 값이 같다. 중복이지만 일부러 적는다 —
    네 자리가 한자리에 모여 있어야 대조할 수 있고, 기본값이 바뀌어도 이 규칙은
    자기 이름이 뜻하는 자리를 계속 가리킨다.
  */
  :host([position="top-center"]) {
    top: var(--ns-space-4);
    right: auto;
    bottom: auto;
    left: 50%;
    transform: translateX(-50%);
  }

  :host([position="bottom-center"]) {
    top: auto;
    right: auto;
    bottom: var(--ns-space-4);
    left: 50%;
    transform: translateX(-50%);
  }

  :host([position="top-right"]) {
    top: var(--ns-space-4);
    right: var(--ns-space-4);
    bottom: auto;
    left: auto;
    transform: none;
  }

  :host([position="bottom-right"]) {
    top: auto;
    right: var(--ns-space-4);
    bottom: var(--ns-space-4);
    left: auto;
    transform: none;
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

    neutral 도 같은 두께의 띠를 갖는다. 없으면 색 있는 것만 3px 두꺼워져
    쌓였을 때 neutral 만 안쪽 폭이 넓고 글자 시작점이 어긋난다.

    색은 var(--ns-color-line) 이다 — .toast 의 다른 세 변과 같은 색이라 눈이
    "이 변만 두껍다" 로 읽지 "색 띠가 있다" 로 읽지 않는다. --ns-color-line 은
    채도가 0.004–0.006 로 무채색에 가깝고 모든 tone 은 유채색이라 neutral 이
    tone 처럼 보일 일도 없다. transparent 를 쓰면 밝은 모드에서 토스트 표면과
    페이지의 sunken 배경 명도차가 1.5%p 뿐이라 왼쪽 변이 사실상 사라진다.
  */
  .toast          { border-left: 3px solid var(--ns-color-line); }
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
