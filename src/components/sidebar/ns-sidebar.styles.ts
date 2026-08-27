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
  }
`;
