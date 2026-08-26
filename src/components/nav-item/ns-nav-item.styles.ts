import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  .row {
    display: flex;
    align-items: center;
    gap: var(--ns-space-2-5);
    margin-bottom: var(--ns-space-1);
    border-radius: var(--ns-radius-control);
    padding: var(--ns-space-2);
    color: var(--ns-color-fg-body);
    text-decoration: none;
    transition: background-color var(--ns-transition-fast) var(--ns-transition-ease),
      color var(--ns-transition-fast) var(--ns-transition-ease);
  }

  .row:hover {
    background: var(--ns-color-surface-sunken);
  }

  :host([active]) .row {
    background: var(--ns-color-surface-hover);
    color: var(--ns-color-fg);
  }

  /* 배지든 아이콘이든 이 사각형이 행의 고정 자리라 flex 축소를 막는다. */
  .leading {
    flex: none;
    display: grid;
    place-items: center;
    width: var(--ns-control-height-sm);
    height: var(--ns-control-height-sm);
  }

  /*
    이 규칙이 하는 일은 상한을 씌우는 것뿐이다 — 슬롯에 들어온 것이 위 .leading
    사각형 밖으로 커지지 않게 막는다. 크기 자체는 여기서 주지 않는다. 보통 들어오는
    <ns-icon> 은 자기 shadow 의 :host 에서 --ns-icon-size 로 크기를 갖고,
    그것이 이 상한보다 작아 상한이 발동하지 않는다. 크기가 없는 것을 넣으면
    이 규칙은 그것을 키워 주지 않는다.
  */
  ::slotted([slot="leading"]) {
    max-width: 100%;
    max-height: 100%;
  }

  .badge {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    border-radius: var(--ns-radius-badge);
    background: var(--ns-color-surface-hover);
    font-size: var(--ns-font-size-2xs);
    line-height: var(--ns-line-height-2xs);
    font-weight: var(--ns-weight-semibold);
  }

  /*
    활성 배지도 채움면이라 --ns-color-accent 가 아니라 --ns-color-accent-fill 을
    읽는다. 나뉜 이유는 tokens.css 에 있다 — 액센트는 선·링, 이쪽은 면이다.
    밝은 모드는 두 토큰의 값이 같아 달라지지 않는다.

    **다크에서는 이 배지가 자기 행 배경에서 거의 떨어지지 않는다.** 활성 행이
    --ns-color-surface-hover(27.4%)이고 배지가 37% 라 둘의 대비가 1.42:1 이다
    (채움면 분리 전에는 87.1% 라 10.08:1 이었다). .ns-tabs__count 가 받은 것과
    같은 값 짝이고 그래서 같은 수치다 — controls.css 의 그 규칙 주석을 함께 본다.
    활성 신호는 행 배경·글자색이 함께 지므로 활성 항목을 못 알아보게 되지는
    않지만, **배지 하나만 놓고 보면 실제로 나빠진 것이 맞다. 알고 넣은 저하다.**
    docs/pending-human-checks.md 에 판정 항목으로 적어 두었다.
  */
  :host([active]) .badge {
    background: var(--ns-color-accent-fill);
    color: var(--ns-color-accent-fill-fg);
  }

  /*
    flex: 1 과 min-width: 0 이 함께 있어야 한다. flex 자식은 기본이
    min-width: auto 라 내용보다 작아지지 않고, 그러면 text-overflow 가
    동작하지 않는다.
  */
  .label {
    display: block;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: var(--ns-font-size-sm);
    line-height: var(--ns-line-height-sm);
    font-weight: var(--ns-weight-medium);
  }

  .trailing {
    display: block;
    flex: none;
  }
`;
