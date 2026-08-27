import { css } from "lit";

export const styles = css`
  /*
    overflow-y: auto 가 동작하려면 조상 체인에 실제 높이가 이어져 있어야
    한다. 소비자가 이 엘리먼트에 높이를 주는 레이아웃에 넣어야 한다.

    배경·너비는 preflight 가 건드리지 않으므로 :host 에 그대로 둔다 — 소비자가
    ns-sidebar { … } 로 덮을 자리를 남긴다.
  */
  :host {
    display: block;
    box-sizing: border-box;
    height: 100%;
    min-height: 0;
    width: var(--ns-sidebar-width);
    /*
      양방향을 함께 자른다. 닫힘 규칙에만 두면 열릴 때 규칙이 즉시 매칭을 멈추는
      바람에 폭이 200ms 동안 늘어나는 내내 안의 <nav> 가 호스트 밖으로, 곧 <main>
      위로 그려진다. overflow 는 check-tokens.mjs 규칙 ④ 의 박스 프로퍼티
      (border·margin·padding)가 아니므로 :host 에 두어도 된다.
    */
    overflow: hidden;
    background: var(--ns-color-surface);
    transition: width 200ms var(--ns-transition-ease);
  }

  /*
    닫힘. 레일을 남기지 않고 통째로 사라진다.

    open 이 프로퍼티 전용이라 호스트에는 그 이름의 속성이 없다. 대신 컴포넌트가
    updated() 에서 data-ns-open 을 쓰고, upgrade 전 구간은 tokens.css 의 예약이
    default-open 과 data-ns-open 을 함께 봐서 덮는다. 세 구간이 이렇게 이어진다 —
    upgrade 전에는 문서 예약이, upgrade 와 hydration 사이에는 shim 이 렌더한
    default-open 을 Lit 의 컨버터가 읽어 세운 값이, hydration 이후에는 컴포넌트가
    쓰는 data-ns-open 이 폭을 잡는다.
  */
  :host(:not([data-ns-open])) {
    width: var(--ns-sidebar-width-collapsed);
  }

  /*
    닫히면 탭 순서에서도 빠진다. 폭 0 과 overflow: hidden 은 자를 뿐 숨기지
    않으므로, 그것만으로는 보이지 않는 링크에 Tab 이 내려앉는다.

    지연을 새 상태 쪽에 두는 것이 요점이다 — 닫힐 때는 200ms 뒤에 숨어 애니메이션이
    끝난 뒤에 사라지고, 열릴 때는 기본 규칙에 전이가 없어 즉시 보인다.
  */
  :host(:not([data-ns-open])) nav {
    visibility: hidden;
    transition: visibility 0s 200ms;
  }

  /*
    경계선과 스크롤을 호스트가 아니라 이 <nav> 가 갖는다.

    호스트는 문서 트리에 있으므로 소비자의 문서 규칙이 :host 를 이긴다.
    특정도가 아니라 캐스케이드 순서로 정해지는 것이라 :host 쪽이 아무리
    구체적이어도 진다. Tailwind preflight 의 "*, ::before, ::after,
    ::backdrop { border: 0 solid }" 가 그 규칙이다.

    overflow 를 함께 내리는 이유는 스크롤바와 경계선의 순서다. 경계선만 내리면
    스크롤바가 호스트 것이라 경계선 오른쪽에 생긴다. 같은 요소가 둘을 가져야
    스크롤바가 경계선 안쪽에 남는다.

    min-width 를 두지 않는다. 닫힐 때 폭이 줄어드는 동안 내용이 찌그러지지
    않게 하려던 것이었지만, 그러려면 :host { width: … } override 가 깨진다 —
    소비자가 ns-sidebar { width: 12rem } 처럼 토큰보다 좁은 값을 주면 min-width
    가 여전히 --ns-sidebar-width(15rem)를 붙들어 nav 가 호스트 밖으로 3rem
    삐져나온다. 대신 :host 가 이제 양방향을 자르므로 삐져나올 걱정이 없고,
    안의 .label 이 이미 white-space: nowrap; overflow: hidden; text-overflow:
    ellipsis 라 폭이 줄어드는 동안 글자가 말줄임표로 점진적으로 줄어들 뿐
    레이아웃이 깨지지 않는다.
  */
  nav {
    box-sizing: border-box;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    border-right: 1px solid var(--ns-color-line);
    /*
      감추지 않고 가늘게 만든다. 표준 프로퍼티 하나로는 하한을 못 덮어 둘을
      함께 쓴다 — scrollbar-width·scrollbar-color 는 Chrome 121·Firefox 64
      부터라 이 저장소의 하한(Chrome 123·Firefox 121)을 덮지만, Safari 는
      18.2 부터로 하한(17.5)보다 위다. 아래의 ::-webkit-scrollbar 계열은
      비표준이지만 Safari 전 버전과 Chrome 에서 동작해 그 구멍을 막는다.

      두 경로가 같은 요소에서 다투지 않는다 — Chrome 이 scrollbar-width·
      scrollbar-color 를 auto 아닌 값으로 지원하면 레거시 ::-webkit-scrollbar
      계열을 통째로 무시하도록 CSS 워킹 그룹이 정리했다(2024년 결정, Chrome
      121 부터 반영). 그래서 이 저장소 하한에서는 Chrome·Firefox 가 표준
      경로를, 18.2 미만 Safari 만 WebKit 경로를 탄다 — 겹쳐 그려지지 않는다.

      두 경로가 픽셀 단위로 같을 수는 없다 — 표준 scrollbar-width 는 auto·
      thin·none 세 키워드만 받아 두께를 고를 수 없고, WebKit 쪽만 트랙 폭과
      여백을 직접 그릴 수 있다. 아래에서 각각 최대한 가깝게 맞췄을 뿐이다.

      :host-context() 를 금지한 이유와는 다르다 — 그것은 없으면 기능이
      조용히 죽는다. 여기서 WebKit 규칙이 빠지면(18.2 미만 Safari 가 아닌
      다른 상상 속 엔진이라면) 플랫폼 기본 스크롤바로 떨어질 뿐 스크롤
      자체는 죽지 않는다. 그래서 이 벤더 접두사는 전례가 되지 않는다 —
      판단 기준은 "없으면 죽는가, 못생겨지는가" 이지 벤더 접두사 자체의
      허용이 아니다.

      감추지 않고 칠하기로 한 이유는 따로 있다 — 막대를 완전히 지우면
      "목록이 더 이어진다" 는 것을 알려주는 유일한 정적 신호가 함께
      사라진다. 가늘게 두면 그 신호는 남기고 존재감만 줄어든다.
    */
    scrollbar-width: thin;
    scrollbar-color: var(--ns-color-line-strong) transparent;
  }

  /*
    목록 안에 있을 때만 눈에 띄게 한다 — 평소엔 옅다가 스크롤하려는 그
    순간에 진해지는 편이 항상 진한 것보다 덜 거슬린다. scrollbar-color 는
    transition 대상이 아니라(애니메이션 불가 프로퍼티) 즉시 전환된다.
  */
  nav:hover {
    scrollbar-color: var(--ns-color-fg-subtle) transparent;
  }

  /*
    WebKit 쪽 두께는 트랙(--ns-scrollbar-width)과 인셋(--ns-scrollbar-thumb-inset)을
    함께 정해 만든다. border 를 transparent 로 주고 background-clip:
    padding-box 를 쓰면 배경색이 border 안쪽(패딩 상자)에서만 칠해져,
    실제로 보이는 막대는 트랙보다 좁고 양옆에 여백이 남는다 — border
    두께만큼 막대가 트랙 가운데로 졸아든다. border 를 안 쓰고 막대 폭만
    줄이면 트랙 배경이 그대로 남아 막대 옆에 색 있는 여백이 아니라 색
    없는 여백이 필요한데, ::-webkit-scrollbar-track 자체가 transparent
    라 그 여백을 만드는 유일한 수단이 이 인셋이다.

    두 값을 토큰으로 뽑은 이유는 tokens.css 의 정의 옆 주석에 있다 — 이
    블록이 ns-dialog · .ns-multi-select__list 에도 그대로 반복되면서
    "한 곳에만 있는 구조적 상수" 에서 "두 곳 이상에 나타나는 값" 으로
    넘어갔다.
  */
  nav::-webkit-scrollbar {
    width: var(--ns-scrollbar-width);
  }

  nav::-webkit-scrollbar-track {
    background: transparent;
  }

  nav::-webkit-scrollbar-thumb {
    background-color: var(--ns-color-line-strong);
    border-radius: var(--ns-radius-pill);
    border: var(--ns-scrollbar-thumb-inset) solid transparent;
    background-clip: padding-box;
  }

  nav::-webkit-scrollbar-thumb:hover {
    background-color: var(--ns-color-fg-subtle);
    background-clip: padding-box;
  }
`;
