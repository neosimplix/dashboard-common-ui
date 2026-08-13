import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  h1 {
    margin: 0;
    font-size: var(--font-size-xl);
    line-height: var(--line-height-xl);
    font-weight: var(--weight-semibold);
    color: var(--color-fg);
  }

  p {
    margin: var(--space-1-5) 0 0;
    font-size: var(--font-size-sm);
    line-height: var(--line-height-sm);
    color: var(--color-fg-muted);
  }
`;
