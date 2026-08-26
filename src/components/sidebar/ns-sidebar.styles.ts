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
    접힘 너비 = 레일 폭.

    open 이 프로퍼티 전용이라 호스트에는 그 이름의 속성이 없다. 대신 컴포넌트가
    updated() 에서 data-ns-open 을 쓰고, upgrade 전 구간은 tokens.css 의 예약이
    default-open 과 data-ns-open 을 함께 봐서 덮는다. 세 구간이 이렇게 이어진다 —
    upgrade 전에는 문서 예약이, upgrade 와 hydration 사이에는 shim 이 렌더한
    data-ns-open 이, hydration 이후에는 컴포넌트가 쓰는 data-ns-open 이 폭을 잡는다.
  */
  :host(:not([data-ns-open])) {
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

    border-right 와 overflow 를 같은 요소에 함께 둔다. 경계선만 여기 두고
    스크롤은 조상(.shell)에 두면 스크롤바가 호스트 쪽 것이 되어 경계선 바깥
    (오른쪽)에 생긴다 — 0.2.0 에서 겪은 고장이다. 같은 요소가 둘을 가져야
    스크롤바가 경계선 안쪽에 남는다. 아래 .panel 은 자기 경계선이 없지만
    .shell 의 border-right 바로 안쪽에 붙어 있어 같은 성질을 얻는다.

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
    타일은 정사각형이다. 레일 폭이 한 변이고(레일의 패딩은 위아래에만 있다)
    aspect-ratio 가 높이를 따라오게 한다. <button> 의 UA 기본값(배경·테두리·글꼴)을
    되돌린다.
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

  /*
    **타일 슬롯에만 건다.** 접두사 없는 ::slotted(*) 는 패널 슬롯에 배정된 그룹까지
    잡아 그 높이를 패널 높이로 묶는다 — 그러면 긴 목록에서 호스트 박스가 잘리고
    패널의 scrollHeight 가 자라지 않아 스크롤이 죽는다.
  */
  slot.tile-slot::slotted(*) {
    max-width: 100%;
    max-height: 100%;
  }

  /*
    패널은 **남는 폭**을 받는다. calc(열린 총폭 - 레일 폭) 으로 계산하지 않는 이유는
    레일과 패널 사이의 1px 경계선이 그 산수에 들어가지 않아 자식이 호스트 content
    box 를 1px 넘기기 때문이다. flex: 1 은 경계선이 몇 개든 남은 폭을 그대로 받는다.

    min-width: 0 이 필요한 이유는 flex 자식의 기본값이 min-width: auto 라서다 —
    내용이 넓으면 패널이 부풀어 레일을 밀어낸다.
  */
  .panel {
    box-sizing: border-box;
    flex: 1;
    min-width: 0;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
  }

  :host(:not([data-ns-open])) .panel {
    display: none;
  }
`;
