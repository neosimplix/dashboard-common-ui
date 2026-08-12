import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { register } from "../../internal/register.js";
import { warnIfTokensMissing } from "../../internal/warn-missing-tokens.js";
import { styles } from "./ns-nav-group.styles.js";

export class NsNavGroup extends LitElement {
  static override styles = styles;

  /** 그룹 제목. 사이드바가 접히면 시각적으로 숨지만 aria-label 로는 남는다. */
  @property({ type: String }) heading = "";

  override connectedCallback(): void {
    super.connectedCallback();
    warnIfTokensMissing();
  }

  override render() {
    return html`
      <div role="group" aria-label=${this.heading}>
        <div class="heading">${this.heading}</div>
        <div class="list"><slot></slot></div>
      </div>
    `;
  }
}

register("ns-nav-group", NsNavGroup);

declare global {
  interface HTMLElementTagNameMap {
    "ns-nav-group": NsNavGroup;
  }
}
