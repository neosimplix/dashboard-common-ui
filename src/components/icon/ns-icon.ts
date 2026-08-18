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
  }

  override render() {
    /*
      name 이 빈 문자열인 것은 잘못이 아니다 — 아직 아이콘을 정하지 않은 슬롯이다.
      경고 없이 조용히 비운다. #warned 의 초기값이 "" 라서 우연히 같은 결과가
      나오지만, 그 우연에 의존하지 않고 여기서 명시적으로 갈라둔다.
    */
    if (this.name === "") return nothing;

    const def = icons[this.name];

    if (!def) {
      // 같은 이름으로 리렌더될 때마다 찍지 않는다.
      if (this.name !== this.#warned) {
        this.#warned = this.name;
        console.warn(
          `[ns-icon] 없는 아이콘: "${this.name}". 사용 가능: ${Object.keys(icons).join(", ")}. ` +
            `registerIcons() 로 더할 수 있다 — 첫 렌더보다 앞서 불러야 한다.`,
        );
      }
      return nothing;
    }

    /*
      aria-hidden 을 호스트가 아니라 이 <svg> 에 둔다.

      호스트에 붙이면 소비자가 role="img" aria-label 로 의미를 주려 해도 연결
      시점에 다시 찍혀 요소가 접근성 트리에서 제거된다 — 문서가 안내하는
      override 가 에러 없이 죽는다. 여기 두면 기본은 장식이면서 그 override 가
      그대로 동작하고, 컴포넌트가 소비자 소유의 속성을 건드리지 않는다.
    */
    return html`<svg viewBox=${def.viewBox} fill="none" aria-hidden="true">${def.content}</svg>`;
  }
}

register("ns-icon", NsIcon);

declare global {
  interface HTMLElementTagNameMap {
    "ns-icon": NsIcon;
  }
}
