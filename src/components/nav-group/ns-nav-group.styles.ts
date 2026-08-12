import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  /*
    그룹 사이 간격. 원본은 .section + .section 이었지만 여기서는 형제가
    light DOM 의 호스트라 shadow 안에서 선택할 수 없다. ::slotted() 는
    결합자를 받지 않으므로 사이드바 쪽에서도 불가능하다. :host() 는
    복합 선택자를 받으므로 이 형태가 유일하게 동작한다.
  */
  :host(:not(:first-child)) {
    margin-top: var(--space-6);
  }

  .heading {
    display: var(--ns-label-display, block);
    padding: var(--space-4) var(--space-4) var(--space-2);
    font-size: var(--font-size-xs);
    line-height: var(--line-height-xs);
    font-weight: var(--weight-semibold);
    letter-spacing: 0.05em;
    color: var(--color-fg-subtle);
  }

  .list {
    padding: var(--space-2);
  }
`;
