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
      **기본 자리(top-center)의 인셋을 :host 에도 둔다.** 아래 네 규칙 중 아무것도
      걸리지 않는 상태가 둘 있고, 인셋이 하나도 없는 fixed 상자는 정적 위치
      (문서 흐름에서 있었을 자리)에 남으므로 그 둘을 여기서 받는다.

      ⓐ connectedCallback ~ 첫 update() — Lit 이 속성을 첫 업데이트에서 반영하므로
         그 전에는 [position] 이 없다.
      ⓑ **범위 밖의 값.** 타입이 없는 UMD·순수 JS 소비자가 nsToastPosition("center-top")
         을 부르면 그 문자열이 그대로 반영돼 어느 규칙에도 걸리지 않는다.

      **upgrade 전 구간은 여기서 덮이지 않는다** — shadow root 가 없으면 이 규칙도
      없다. 그 구간은 애초에 그릴 내용이 없어 문제가 되지 않는다. 근거는 ns-toast.ts
      의 position 주석에 있다.
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

      해결은 문서다 — guide.html 의 nsToast 절 "주의" 에 적혀 있다.
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
    tone 은 메시지 앞의 작은 원점 하나로만 표현한다. 배경을 칠하면 글자 대비를
    다시 정해야 하고, 왼쪽 변을 두껍게 하면 상자 자체의 모양이 tone 마다 달라진다.

    **neutral 은 점을 아예 그리지 않는다.** 투명한 자리 채우기를 두지 않는다는
    뜻이기도 하다 — 그래서 neutral 토스트의 글자는 색 있는 것보다 (점 + gap)
    만큼 왼쪽에서 시작하고, 섞어 쌓으면 글자 시작점이 어긋난다. **의도한
    선택이다.** 없는 것을 자리로 주장하지 않는다.

    점은 장식이다. tone 은 danger 의 role="alert" 와 메시지 글자로 이미
    보조기술에 닿으므로 ns-toast.ts 가 aria-hidden 을 붙인다.

    첫 줄 글자의 세로 중앙에 맞춘다. .toast 가 align-items: flex-start 라 점이
    그대로 상자 맨 위에 붙는데, 여러 줄 메시지에서 그것이 첫 글자보다 위에
    뜬다. 줄 높이와 점 지름의 차이 절반만큼 내리면 첫 줄과 중심이 같아진다.
  */
  .dot {
    flex-shrink: 0;
    width: var(--ns-space-2);
    height: var(--ns-space-2);
    margin-top: calc((var(--ns-line-height-sm) - var(--ns-space-2)) / 2);
    border-radius: var(--ns-radius-pill);
  }

  .toast.success .dot { background: var(--ns-color-success); }
  .toast.danger  .dot { background: var(--ns-color-danger); }
  .toast.warn    .dot { background: var(--ns-color-warn); }

  .message {
    flex: 1;
    min-width: 0;
    /* 긴 메시지가 한 줄로 넘치지 않게 한다. */
    overflow-wrap: anywhere;
  }

  /*
    닫기 버튼도 첫 줄 글자의 세로 중앙에 맞춘다. 점과 같은 이유이고 같은 계산이다 —
    .toast 가 align-items: flex-start 라 버튼이 상자 맨 위에 붙는데, 버튼의 높이는
    아이콘(--ns-icon-size)에 위아래 padding 이 더해진 값이라 줄 높이보다 크다.
    그 차이의 절반만큼 아이콘 중심이 첫 글자 중심보다 내려가 있었다.

    **위아래에 똑같이 준다.** 위만 당기면 버튼이 아래로 그만큼 더 삐져나와 상자
    높이를 늘리지만, 양쪽을 당기면 배치상의 높이가 정확히 한 줄이 되어 한 줄
    메시지에서 토스트가 글자보다 커지지 않는다. 넘치는 만큼은 .toast 의
    padding(--ns-space-3) 안에 들어가므로 상자 밖으로 나가지 않는다.

    지금 값은 우연히 0 이 아니다 — --ns-icon-size 와 --ns-line-height-sm 이 둘 다
    1.25rem 이라 남는 것은 padding 뿐이지만, 그 셋 중 무엇이 바뀌어도 이 식이
    따라간다.
  */
  .close {
    flex-shrink: 0;
    margin-block: calc(
      (var(--ns-line-height-sm) - (var(--ns-icon-size) + var(--ns-space-1) * 2)) / 2
    );
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
