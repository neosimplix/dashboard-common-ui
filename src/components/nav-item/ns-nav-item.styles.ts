import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  .row {
    display: flex;
    align-items: center;
    gap: var(--space-2-5);
    margin-bottom: var(--space-1);
    border-radius: var(--radius-control);
    padding: var(--space-2);
    color: var(--color-fg-body);
    text-decoration: none;
    transition: background-color var(--transition-fast) var(--transition-ease),
      color var(--transition-fast) var(--transition-ease);
  }

  .row:hover {
    background: var(--color-surface-sunken);
  }

  :host([active]) .row {
    background: var(--color-surface-hover);
    color: var(--color-fg);
  }

  /* 접힌 레일에서 유일하게 남는 요소라 flex 축소를 막는다. */
  .badge {
    flex: none;
    display: grid;
    place-items: center;
    width: var(--control-height-sm);
    height: var(--control-height-sm);
    border-radius: var(--radius-badge);
    background: var(--color-surface-hover);
    font-size: var(--font-size-2xs);
    line-height: var(--line-height-2xs);
    font-weight: var(--weight-semibold);
  }

  :host([active]) .badge {
    background: var(--color-accent);
    color: var(--color-accent-fg);
  }

  /*
    flex: 1 과 min-width: 0 이 함께 있어야 한다. flex 자식은 기본이
    min-width: auto 라 내용보다 작아지지 않고, 그러면 text-overflow 가
    동작하지 않는다.

    --ns-label-display 는 ns-sidebar 가 ::slotted 로 내려주는 패키지
    내부 프로퍼티다. 사이드바 밖에서 단독으로 쓰일 때를 위해 여기만
    폴백을 둔다.
  */
  .label {
    display: var(--ns-label-display, block);
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: var(--font-size-sm);
    line-height: var(--line-height-sm);
    font-weight: var(--weight-medium);
  }

  .trailing {
    display: var(--ns-label-display, block);
    flex: none;
  }
`;
