import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { register } from "../../internal/register.js";
import { warnIfTokensMissing } from "../../internal/warn-missing-tokens.js";
import { styles } from "./ns-skeleton.styles.js";

/** tokens.css 의 반경 토큰 이름들. 이 목록에 없으면 원시 CSS 값으로 쓴다. */
const RADIUS_TOKENS = new Set(["badge", "control", "panel", "card", "pill"]);

export class NsSkeleton extends LitElement {
  static override styles = styles;

  /** CSS 길이. 참고 구현이 Tailwind 유틸로 받던 것을 프로퍼티로 옮긴 것이다. */
  @property({ type: String }) width = "100%";

  @property({ type: String }) height = "1rem";

  /**
   * `badge` `control` `panel` `card` `pill` 중 하나면 해당 토큰을 쓰고,
   * 아니면 원시 CSS 값으로 그대로 쓴다(`50%`, `0` 등).
   */
  @property({ type: String }) radius = "control";

  override connectedCallback(): void {
    super.connectedCallback();
    warnIfTokensMissing();
  }

  #radiusValue(): string {
    return RADIUS_TOKENS.has(this.radius) ? `var(--ns-radius-${this.radius})` : this.radius;
  }

  override render() {
    /*
      aria-hidden 을 호스트가 아니라 이 div 에 둔다. 호스트에 명령적으로 찍으면
      소비자가 쓴 속성을 덮어쓰게 되고, ns-icon 에서 그 방식이 문서화된 override 를
      죽이는 것이 드러났다. 로딩 자리표시자는 읽힐 내용이 없으므로 내부에서 숨긴다.

      주석을 템플릿 밖에 둔다 — Lit 템플릿 안의 HTML 주석은 shadow DOM 으로
      함께 렌더돼 인스턴스마다 실려 나간다.
    */
    return html`
      <div
        class="bar"
        aria-hidden="true"
        style="width:${this.width};height:${this.height};border-radius:${this.#radiusValue()}"
      ></div>
    `;
  }
}

register("ns-skeleton", NsSkeleton);

declare global {
  interface HTMLElementTagNameMap {
    "ns-skeleton": NsSkeleton;
  }
}
