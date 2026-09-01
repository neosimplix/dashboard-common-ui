import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    box-sizing: border-box;
    height: var(--ns-header-height);
  }

  /*
    box-sizing 은 여기에도 있어야 한다. 문서의 * 리셋은 shadow 안에 닿지 않으므로
    이 요소는 content-box 로 시작하고, 그러면 height: 100% 위에 border-bottom 이
    1px 더해져 호스트의 --ns-header-height 를 넘친다. 넘친 1px 은 호스트 상자
    바깥이라, 뒤에 오는 형제(셸·본문)의 배경이 트리 순서로 그 위에 칠해져
    밑줄이 통째로 사라진다. ns-sidebar 의 nav 가 같은 짝(height: 100% +
    테두리)이고 같은 이유로 border-box 다.
  */
  header {
    box-sizing: border-box;
    display: flex;
    height: 100%;
    align-items: center;
    gap: var(--ns-space-3);
    border-bottom: 1px solid var(--ns-color-line);
    background: var(--ns-color-surface);
    padding-inline: var(--ns-space-4);
  }

  .toggle {
    flex: none;
    display: grid;
    place-items: center;
    width: var(--ns-control-height-md);
    height: var(--ns-control-height-md);
    border: 0;
    border-radius: var(--ns-radius-control);
    background: transparent;
    color: var(--ns-color-fg-body);
    cursor: pointer;
    transition: background-color var(--ns-transition-fast) var(--ns-transition-ease);
  }

  .toggle:hover {
    background: var(--ns-color-surface-hover);
  }

  /* controls.css 의 :focus-visible 규칙은 전역이라 shadow 안에 닿지 않는다. */
  .toggle:focus-visible {
    outline: 2px solid var(--ns-color-accent);
    outline-offset: 2px;
  }

  .title {
    font-weight: var(--ns-weight-semibold);
    color: var(--ns-color-fg);
  }

  /* margin-left: auto 가 남은 공간을 흡수해 actions 를 우측에 붙인다. */
  .actions {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: var(--ns-space-3);
  }
`;
