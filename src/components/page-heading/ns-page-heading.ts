import { LitElement, html, nothing } from "lit";
import { property } from "lit/decorators.js";

import { register } from "../../internal/register.js";
import { warnIfTokensMissing } from "../../internal/warn-missing-tokens.js";
import { styles } from "./ns-page-heading.styles.js";

export class NsPageHeading extends LitElement {
  static override styles = styles;

  /**
   * 제목.
   *
   * `title` 이 아니라 `heading` 인 이유: `title` 은 모든 HTML 요소의 전역
   * 속성이고 브라우저가 툴팁을 띄운다. `@property` 로 `HTMLElement.prototype.title`
   * 을 덮어도 속성에 반영되는 순간 제목 전체가 툴팁을 갖는다.
   * React 프롭만 `title` 을 유지한다(src/react/tags/PageHeading.tsx).
   */
  @property({ type: String }) heading = "";

  /** 제목 아래 한 줄. 빈 문자열이면 <p> 를 렌더하지 않는다. */
  @property({ type: String }) description = "";

  override connectedCallback(): void {
    super.connectedCallback();
    warnIfTokensMissing();
  }

  override render() {
    return html`
      <h1>${this.heading}</h1>
      ${this.description ? html`<p>${this.description}</p>` : nothing}
    `;
  }
}

register("ns-page-heading", NsPageHeading);

declare global {
  interface HTMLElementTagNameMap {
    "ns-page-heading": NsPageHeading;
  }
}
