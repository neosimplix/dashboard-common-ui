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
  /*
    white-space: nowrap 이 없으면 사이드바가 접히는 200ms 동안 헤딩이 줄어드는
    폭을 따라 줄바꿈한다 — ns-nav-item 의 .label 은 이미 nowrap 이라
    말줄임표로 잘리는데, 이쪽만 여러 줄로 접히며 "찢어지는" 것처럼 보였다.
    사이드바보다 긴 헤딩은 평상시에도 마찬가지다: nowrap 없이는 행이 늘어나
    아래 항목을 밀어내린다. white-space 는 상속되므로 아래 .text 에도
    닿는다.

    overflow: hidden; text-overflow: ellipsis 도 함께 둔다 — 비collapsible
    마크업(<div class="heading">텍스트)은 텍스트가 .heading 의 직접 인라인
    자식이라 여기서 바로 잘려야 한다. collapsible 쪽(<button class="heading">
    <span class="row"><span class="text">…)은 실제로 넘치는 것이 .heading
    자신이 아니라 .row 안의 .text 이므로 이 두 선언은 거기서는 아무 일도
    하지 않는다 — button 의 자식은 .row 하나뿐이고 .row 자체는 flex 폭이
    button 을 넘지 않아 button 수준에서는 넘칠 것이 없다. 그래서 .text 에
    같은 클리핑을 따로 둔다. 결과가 ns-nav-item 의 .label 과 같아진다 —
    같은 세 선언이 텍스트를 직접 감싸는 요소에 있다는 점에서, 그 요소가
    div.heading 이냐 span.text 이냐만 마크업에 따라 다를 뿐이다.
  */
  .heading {
    display: block;
    padding: var(--ns-space-4) var(--ns-space-4) var(--ns-space-2);
    font-size: var(--ns-font-size-sm);
    line-height: var(--ns-line-height-sm);
    font-weight: var(--ns-weight-semibold);
    letter-spacing: 0.05em;
    color: var(--ns-color-fg-subtle);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
    .row 안에서 실제로 넘치는 요소. flex 아이템의 min-width 기본값은 auto 라
    콘텐츠 고유 폭 밑으로 줄지 않는다 — flex: 1 만으로는 이 span 이 줄어들지
    않고 .row 를 밀어 넘친다. min-width: 0 으로 그 하한을 없애야 아래
    overflow: hidden; text-overflow: ellipsis 가 실제로 자를 폭을 갖는다.
    white-space: nowrap 은 위 .heading 에서 상속받으므로 여기서 다시 쓰지
    않는다. ns-nav-item 의 .label 과 같은 세 선언(overflow·text-overflow·
    white-space) + flex 아이템이라 필요한 flex·min-width 가 더해진 모양이다.
  */
  .text {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /*
    caret 은 헤딩 글자(--ns-font-size-sm, .875rem)에 붙는 것이라 --ns-icon-size(1.25rem)가
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
    남기려고 사이드바가 레일에서 접힘을 무시하게 만드는 신호였다. 0.5.0
    개발 중에는 레일을 최상위 그룹 타일만 갖는 모델로 다시 만들어 봤지만
    화면에서 무엇인지 읽히지 않아 물렀다 — 그 모델에서도 레일에 항목이 없기는
    마찬가지라 신호의 전제는 이미 없었다. 지금은 레일 자체가 없다. 닫히면
    사이드바가 통째로 사라지므로 접힌 그룹의 항목에 닿을 경로가 애초에 없고,
    그 배선을 되살릴 이유도 없다. 경위는 docs/gotchas.md 에 있다.
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
    하위 그룹 사이의 간격. 최상위 그룹 사이에는 이제 아무 규칙도 없으므로 이것이
    이 라이브러리가 갖는 유일한 그룹 간 간격이다.

    **없어진 규칙의 기록.** 0.4.0 에는 최상위용으로
    :host(:not(:first-child)) [role="group"] { padding-top: var(--ns-space-6) }
    (24px)이 있었고 0.5.0 개발 중에 지웠다. 그때 지운 이유는 레일 설계에 있었다 —
    사이드바가 패널에 선택된 그룹 하나만 보이려고 수동 슬롯 배정을 썼고,
    :first-child 가 화면에 없는(배정되지 않은) 형제까지 세는 바람에 패널 위 여백이
    마크업 순서에 따라 달라졌다.

    **레일이 없어지면서 그 이유도 없어졌다.** 지금 최상위 그룹은 ns-sidebar 의
    light DOM 에서 실제 형제이고 전부 렌더되므로, 그 규칙을 되살리면 옳게 동작한다.
    되살리지 않는 것은 **못 해서가 아니라 판단이다** — 헤딩 자신의 padding-top(16px)이
    이미 그룹을 가르고, 최상위가 다섯 이상인 네비게이션(이 저장소의 guide.html 이
    그렇다)에서는 24px 이 목록을 그만큼 길게 만든다. 24px 이 필요한 소비자는 문서
    CSS 한 줄로 되돌린다 — 호스트가 문서 트리에 있어 그 규칙이 shadow 를 이긴다.
    문구는 README.md 의 0.5.0 이주 절에 있고, 좁아진 최상위 그룹 간격이 소비자
    화면에서 실제로 괜찮은지는 자동 검사로 잡히지 않는 판단이라 사람이 눈으로
    본다.

    **여기서는 :first-child 가 옳게 동작한다.** 중첩 그룹은 부모의 light DOM 에서
    실제 형제이고 전부 렌더되므로 셈이 화면과 일치한다.
  */
  :host(:not(:first-child)) [role="group"].nested {
    padding-top: var(--ns-space-2);
  }
`;
