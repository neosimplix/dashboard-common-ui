import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  /*
    collapsible 이면 <button>, 아니면 <div> 다. 두 경우가 같은 클래스를 쓰므로
    글꼴·색·패딩이 한 곳에 있고, 아래 button 전용 규칙이 UA 기본값만 되돌린다.

    안쪽 .row 가 flex 를 진다. 0.4.0 까지는 display 자리를 레일 전용 신호
    프로퍼티가 쓰고 있어 여기에 flex 를 얹을 수 없었고, 그 신호가 없어진 지금은
    얹을 수 있게 됐다. 그러나 이 구조가 아래 button.heading 의 UA 되돌림과
    얽혀 있어 바꾸는 것이 이 변경의 목표가 아니다.
  */
  .heading {
    display: block;
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
    접힘. 0.4.0 에는 여기 사이드바가 내려주는 신호 프로퍼티의 var() 폴백이
    있었다 — 레일에 항목이 납작하게 나오던 시절, 접힌 그룹의 항목에 도달할 경로를
    남기려고 사이드바가 레일에서 접힘을 무시하게 만드는 신호였다. 레일이
    최상위 그룹 타일만 갖는 지금은 그룹에 도달하는 경로가 타일이므로 그
    배선의 전제가 없어졌다. 경위는 docs/gotchas.md 에 있다.
  */
  .list.collapsed {
    display: none;
  }

  /*
    하위 카테고리. 중첩 여부는 JS 가 판정해 이 클래스로 남긴다 — 이유는
    ns-nav-group.ts 의 #nested 주석에 있다.

    240px 패널에서 글자 x 좌표가 이렇게 떨어진다.

      상위 제목 16 · 상위 직속 항목 16 · 하위 제목 28 · 하위 항목 28

    상위 제목의 padding-left(16)가 .list 패딩(8) + 행 패딩(8)과 같아서 상위
    제목과 상위 항목이 정렬되는 것과 같은 산수다. 하위는 들여쓰기 12 + 행
    패딩 8 = 20 이고 .list 패딩 8 을 더해 28 이다.

    **.list 의 대칭 패딩을 하위에서 없애고 왼쪽 들여쓰기만 두는 이유**는 항목의
    오른쪽 끝을 상위 항목과 같은 자리(232px)에 남기기 위해서다. 대칭 패딩을
    유지하면 하위 항목의 hover 배경이 오른쪽에서 8px 짧아져 계단이 생긴다.

    3단 이상을 넣으면 들여쓰기는 계속 누적된다(40 → 52). 제목 자가만 2단과
    같아진다 — 판정이 "조상에 ns-nav-group 이 있나" 라는 참/거짓이기 때문이다.
    패널 폭이 정해져 있어 깊이별로 다르게 만들 실익이 없다.

    특정도: 기본 .heading 은 (0,1,0), 이 규칙은 (0,3,0) 이므로 이긴다.
    button.heading 의 UA 되돌림(0,1,1)은 font-weight·letter-spacing 을 선언하지
    않으므로 다투지 않는다.
  */
  [role="group"].nested > .heading {
    padding-top: var(--ns-space-2);
    padding-left: calc(var(--ns-space-3) + var(--ns-space-2));
    font-weight: var(--ns-weight-medium);
    letter-spacing: normal;
  }

  [role="group"].nested > .list {
    padding: 0 0 0 var(--ns-space-3);
  }

  /*
    하위 그룹 사이의 간격. Task 2 가 최상위용 규칙
    (:host(:not(:first-child)) [role="group"] { padding-top: --ns-space-6 })을
    지웠으므로 이것이 유일한 그룹 간 간격이다 — 그 규칙은 패널에 그룹이 하나만
    오는 지금 :first-child 가 배정되지 않은 형제까지 세어 패널 위 여백을 마크업
    순서에 따라 달라지게 만들었다.

    **여기서는 :first-child 가 옳게 동작한다.** 중첩 그룹은 부모의 light DOM 에서
    실제 형제이고 전부 렌더되므로 셈이 화면과 일치한다.
  */
  :host(:not(:first-child)) [role="group"].nested {
    padding-top: var(--ns-space-2);
  }
`;
