import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { register } from "../../internal/register.js";
import { warnIfTokensMissing } from "../../internal/warn-missing-tokens.js";
import { styles } from "./ns-sidebar.styles.js";

export class NsSidebar extends LitElement {
  static override styles = styles;

  /**
   * 펼침 여부. 접히면 완전히 사라지지 않고 레일(--sidebar-width-collapsed)이 남는다.
   * 컴포넌트가 스스로 바꾸지 않는다 — ns-header 의 ns-toggle 을 받아 소비자가 내려준다.
   */
  @property({ type: Boolean, reflect: true }) open = false;

  override connectedCallback(): void {
    super.connectedCallback();
    warnIfTokensMissing();
  }

  override render() {
    return html`<nav><slot></slot></nav>`;
  }
}

register("ns-sidebar", NsSidebar);

declare global {
  interface HTMLElementTagNameMap {
    "ns-sidebar": NsSidebar;
  }
}
