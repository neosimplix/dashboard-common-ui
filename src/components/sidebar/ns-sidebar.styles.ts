import { css } from "lit";

export const styles = css`
  /*
    overflow-y: auto 가 동작하려면 조상 체인에 실제 높이가 이어져 있어야
    한다. 소비자가 이 엘리먼트에 높이를 주는 레이아웃에 넣어야 한다.

    너비는 **열린 총폭**이다. 레일과 패널의 합이고, 닫히면 레일 폭으로 줄어든다.
    배경·너비는 preflight 가 건드리지 않으므로 :host 에 그대로 둔다 — 소비자가
    ns-sidebar { … } 로 덮을 자리를 남긴다.
  */
  :host {
    display: block;
    box-sizing: border-box;
    height: 100%;
    min-height: 0;
    width: var(--ns-sidebar-width);
    background: var(--ns-color-surface);
    transition: width 200ms var(--ns-transition-ease);
  }

  /*
    접힘 너비 = 레일 폭. 두 속성을 함께 보는 이유는 타이밍이다.

    customElements.define 은 모듈 평가 시점에 실행되므로 hydrateRoot 보다
    먼저다. 그 사이 구간에서는 엘리먼트가 이미 upgrade 돼 tokens.css 의
    :not(:defined) 예약이 떨어져 나갔는데, React 는 아직 open 을 설정하지
    않았다. [open] 만 보면 이 구간이 4rem 으로 그려지고 하이드레이션 직후
    벌어진다.

    data-ns-open 은 서버 마크업부터 DOM 에 있고 React 가 open 을 끌 때 함께
    지우므로 두 속성이 어긋나지 않는다.
  */
  :host(:not([open]):not([data-ns-open])) {
    width: var(--ns-sidebar-width-collapsed);
  }

  /*
    경계선과 스크롤을 호스트가 아니라 shadow 안의 요소가 갖는다.

    호스트는 문서 트리에 있으므로 소비자의 문서 규칙이 :host 를 이긴다.
    특정도가 아니라 캐스케이드 순서로 정해지는 것이라 :host 쪽이 아무리
    구체적이어도 진다. Tailwind preflight 의 "*, ::before, ::after,
    ::backdrop { border: 0 solid }" 가 그 규칙이다.
  */
  .shell {
    box-sizing: border-box;
    display: flex;
    height: 100%;
    border-right: 1px solid var(--ns-color-line);
  }

  /*
    레일은 항상 보이고 줄지 않는다. 폭이 곧 --ns-sidebar-width-collapsed 라
    패널이 사라지면 호스트 너비와 같아진다.

    overflow-x: hidden 이라 타일 포커스 링을 바깥에 그리면 잘린다. 아래
    outline-offset 이 음수인 이유다.
  */
  .rail {
    box-sizing: border-box;
    flex: none;
    width: var(--ns-sidebar-width-collapsed);
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    padding: var(--ns-space-2) 0;
    border-right: 1px solid var(--ns-color-line);
    background: var(--ns-color-surface-sunken);
  }

  /*
    타일은 정사각형이다. 레일 폭에서 좌우 패딩을 뺀 것이 한 변이다.
    <button> 의 UA 기본값(배경·테두리·글꼴)을 되돌린다.
  */
  .tile {
    box-sizing: border-box;
    display: grid;
    place-items: center;
    width: 100%;
    aspect-ratio: 1;
    position: relative;
    border: 0;
    background: none;
    color: var(--ns-color-fg-subtle);
    font-family: inherit;
    font-size: var(--ns-font-size-xs);
    line-height: var(--ns-line-height-xs);
    font-weight: var(--ns-weight-semibold);
    cursor: pointer;
    transition: background-color var(--ns-transition-fast) var(--ns-transition-ease),
      color var(--ns-transition-fast) var(--ns-transition-ease);
  }

  .tile:hover {
    background: var(--ns-color-surface-hover);
    color: var(--ns-color-fg-body);
  }

  .tile.selected {
    background: var(--ns-color-surface-hover);
    color: var(--ns-color-fg);
  }

  /*
    활성 표시는 좌측 바다. VS Code 와 같은 자리다. 의사 요소라 소비자가 넣은
    아이콘 위에 겹치지 않는다.
  */
  .tile.selected::before {
    content: "";
    position: absolute;
    inset-block: 0;
    inset-inline-start: 0;
    width: 2px;
    background: var(--ns-color-accent);
  }

  /*
    controls.css 의 :focus-visible 규칙은 전역이라 shadow 안에 닿지 않는다.
    바깥에 그리면 위 .rail 의 overflow-x: hidden 에 잘린다.
  */
  .tile:focus-visible {
    outline: 2px solid var(--ns-color-accent);
    outline-offset: -2px;
  }

  /*
    아이콘이 들어오면 타일 정사각형보다 커지지 않게 상한만 씌운다. 크기 자체는
    여기서 주지 않는다 — ns-icon 은 자기 shadow 의 :host 에서 --ns-icon-size 로
    크기를 갖는다. ns-nav-item 의 ::slotted([slot="leading"]) 과 같은 자리다.
  */
  .tile-body {
    display: grid;
    place-items: center;
    width: var(--ns-control-height-sm);
    height: var(--ns-control-height-sm);
  }

  ::slotted(*) {
    max-width: 100%;
    max-height: 100%;
  }

  /*
    패널 폭은 파생값이다. 열린 총폭에서 레일 폭을 뺀 것이라 두 토큰을 덮어쓰던
    소비자가 계속 같은 것을 제어한다. 사용처가 하나이므로 토큰을 만들지 않는다.
  */
  .panel {
    box-sizing: border-box;
    flex: none;
    width: calc(var(--ns-sidebar-width) - var(--ns-sidebar-width-collapsed));
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
  }

  :host(:not([open]):not([data-ns-open])) .panel {
    display: none;
  }
`;
