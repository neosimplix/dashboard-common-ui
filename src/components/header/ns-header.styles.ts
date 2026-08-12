import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    box-sizing: border-box;
    height: var(--header-height);
  }

  header {
    display: flex;
    height: 100%;
    align-items: center;
    gap: var(--space-3);
    border-bottom: 1px solid var(--color-line);
    background: var(--color-surface);
    padding-inline: var(--space-4);
  }

  .toggle {
    flex: none;
    display: grid;
    place-items: center;
    width: var(--control-height-md);
    height: var(--control-height-md);
    border: 0;
    border-radius: var(--radius-control);
    background: transparent;
    color: var(--color-fg-body);
    cursor: pointer;
    transition: background-color var(--transition-fast) var(--transition-ease);
  }

  .toggle:hover {
    background: var(--color-surface-hover);
  }

  .title {
    font-weight: var(--weight-semibold);
    color: var(--color-fg);
  }

  /* margin-left: auto 가 남은 공간을 흡수해 actions 를 우측에 붙인다. */
  .actions {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }
`;
