import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  /*
    그룹 사이 간격. 원본은 .section + .section 이었지만 여기서는 형제가
    light DOM 의 호스트라 shadow 안에서 선택할 수 없다. ::slotted() 는
    결합자를 받지 않으므로 사이드바 쪽에서도 불가능하다. :host() 는
    복합 선택자를 받으므로 형제를 보는 방법은 이것뿐이다.

    다만 선언은 호스트가 아니라 shadow 안의 래퍼에 둔다. 호스트는 문서
    트리에 있어 소비자의 "* { margin: 0 }"(Tailwind preflight)이 :host 를
    이기고, 0.2.0 까지 여기 있던 margin-top 은 그렇게 지워지고 있었다.
    그룹이 하나뿐이면 :not(:first-child) 가 발동하지 않아 증상이 없다가
    두 번째 그룹을 만드는 순간 간격이 0 이 된다.

    margin 이 아니라 padding 인 이유는 마진 상쇄다. margin-top 을 래퍼에
    두면 호스트를 통과해 밖으로 상쇄돼 나가므로 결과는 같지만, 소비자가
    호스트에 마진을 주는 순간 둘이 상쇄돼 합이 달라진다. padding 은
    상쇄되지 않는다. 배경이 없어 보이는 결과는 margin 과 같다.
  */
  :host(:not(:first-child)) [role="group"] {
    padding-top: var(--ns-space-6);
  }

  /*
    collapsible 이면 <button>, 아니면 <div> 다. 두 경우가 같은 클래스를 쓰므로
    글꼴·색·패딩이 한 곳에 있고, 아래 button 전용 규칙이 UA 기본값만 되돌린다.

    display 자리를 --ns-label-display 신호가 쓰고 있어 여기에 flex 를 얹을 수
    없다. 그래서 안쪽 .row 가 flex 를 진다. 신호가 나르는 값을 flex 로 바꾸는
    길은 막혀 있다 — ns-nav-item 의 .label·.trailing 이 같은 신호를 읽으므로
    셋이 함께 바뀐다.
  */
  .heading {
    display: var(--ns-label-display, block);
    padding: var(--ns-space-4) var(--ns-space-4) var(--ns-space-2);
    font-size: var(--ns-font-size-xs);
    line-height: var(--ns-line-height-xs);
    font-weight: var(--ns-weight-semibold);
    letter-spacing: 0.05em;
    color: var(--ns-color-fg-subtle);
  }

  /*
    <button> 의 UA 기본값을 되돌린다. 위 .heading 이 글꼴·색을 이미 정하지만
    button 은 그것을 상속하지 않고 UA 가 정한 값을 갖는다.
  */
  button.heading {
    /*
      <button> 의 UA 기본값은 이미 border-box 라(div 와 다르다) 이 줄은 오늘
      아무것도 바꾸지 않는다. 그래도 적어 두는 이유는 이 규칙이 명시적
      width 와 padding 을 함께 쓰기 때문이다 — 이 저장소의 다른 모든 그런
      요소가 그렇게 한다(ns-sidebar.styles.ts, ns-header.styles.ts,
      ns-dialog.styles.ts). UA 기본값에 기대는 것과 그것을 적어 두는 것은
      다르다.
    */
    box-sizing: border-box;
    width: 100%;
    border: 0;
    background: none;
    font-family: inherit;
    text-align: left;
    cursor: pointer;
    transition: color var(--ns-transition-fast) var(--ns-transition-ease);
  }

  button.heading:hover {
    color: var(--ns-color-fg-body);
  }

  /*
    controls.css 의 :focus-visible 규칙은 전역이라 shadow 안에 닿지 않는다.

    outline-offset 이 음수인 이유: 헤딩 버튼은 사이드바 폭 전체를 채우는데
    ns-sidebar.styles.ts 의 <nav> 가 overflow-x: hidden 이다. 바깥으로 그리면
    링이 그 경계에서 잘린다.
  */
  button.heading:focus-visible {
    outline: 2px solid var(--ns-color-accent);
    outline-offset: -2px;
  }

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ns-space-2);
  }

  /*
    caret 은 헤딩 글자(--ns-font-size-xs)에 붙는 것이라 --ns-icon-size(1.25rem)가
    크다. 커스텀 프로퍼티는 상속되므로 이 인스턴스에만 세우면 ns-icon 의 shadow
    :host 까지 도달한다. 사용처가 하나이고 변할 이유가 없으므로 리터럴이다.
  */
  .caret {
    --ns-icon-size: 1rem;
    flex: none;
    transition: transform var(--ns-transition-fast) var(--ns-transition-ease);
  }

  .caret.closed {
    transform: rotate(-90deg);
  }

  .list {
    padding: var(--ns-space-2);
  }

  /*
    접힘. --ns-group-list-display 는 ns-sidebar 가 ::slotted 로 내려주는 신호이고
    레일에서만 block 이 된다 — 레일에서는 헤딩(= 토글 버튼)이 display: none 으로
    사라지므로, 접힘을 그대로 적용하면 그 그룹의 항목에 도달할 경로가 없어진다.

    그룹은 이 값을 세우지 않고 읽기만 한다. 세우면 사이드바의 ::slotted(0,0,2)와
    같은 요소를 겨냥하는 특정도 싸움이 되고 :host(:not(…))(0,2,0)이 이겨 사이드바가
    진다. 읽기만 하면 그 싸움 자체가 없다.

    폴백이 기본 동작이다 — 사이드바 펼침과 단독 사용에서 둘 다 none 이다.
    check-tokens.mjs 의 WIRING 이 이 이름을 신호로 인정한다.
  */
  .list.collapsed {
    display: var(--ns-group-list-display, none);
  }
`;
