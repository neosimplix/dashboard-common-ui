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

    overflow: hidden 이 함께 필요하다. 폭이 0 인 동안 안의 <nav> 가 자기 폭을
    유지해 밖으로 삐져나오는 것을 막는다.
  */
  :host(:not([data-ns-open])) {
    width: var(--ns-sidebar-width-collapsed);
    overflow: hidden;
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

    닫힐 때 폭이 줄어드는 동안 안의 내용이 함께 찌그러지지 않도록 min-width 로
    열린 폭을 붙들어 둔다. 바깥의 overflow: hidden 이 그것을 잘라낸다.
  */
  nav {
    box-sizing: border-box;
    height: 100%;
    min-width: var(--ns-sidebar-width);
    overflow-x: hidden;
    overflow-y: auto;
    border-right: 1px solid var(--ns-color-line);
  }
`;
