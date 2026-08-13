import { LitElement, html, nothing } from "lit";
import { property } from "lit/decorators.js";

import { register } from "../../internal/register.js";
import { warnIfTokensMissing } from "../../internal/warn-missing-tokens.js";
import { icons } from "./icons.js";
import { styles } from "./ns-icon.styles.js";

export class NsIcon extends LitElement {
  static override styles = styles;

  /** 스프라이트의 키. 없는 이름이면 아무것도 그리지 않고 경고한다. */
  @property({ type: String }) name = "";

  #warned = "";

  override connectedCallback(): void {
    super.connectedCallback();
    warnIfTokensMissing();
    /*
      기본은 장식이다. 의미를 가져야 하면 소비자가 호스트에
      role="img" aria-label="…" 을 붙인다.
    */
    this.setAttribute("aria-hidden", "true");
  }

  override render() {
    const def = icons[this.name];

    if (!def) {
      // 같은 이름으로 리렌더될 때마다 찍지 않는다.
      if (this.name !== this.#warned) {
        this.#warned = this.name;
        console.warn(
          `[ns-icon] 없는 아이콘: "${this.name}". 사용 가능: ${Object.keys(icons).join(", ")}`,
        );
      }
      return nothing;
    }

    return html`<svg viewBox=${def.viewBox} fill="none">${def.content}</svg>`;
  }
}

register("ns-icon", NsIcon);

declare global {
  interface HTMLElementTagNameMap {
    "ns-icon": NsIcon;
  }
}
