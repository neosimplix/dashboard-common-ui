import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { register } from "../../internal/register.js";
import { warnIfTokensMissing } from "../../internal/warn-missing-tokens.js";
import type { NsNavigateDetail } from "../../types.js";
import { styles } from "./ns-nav-item.styles.js";

export class NsNavItem extends LitElement {
  static override styles = styles;

  /** 라우팅 키. ns-navigate 이벤트에 그대로 실린다. */
  @property({ type: String }) href = "";

  /** 펼친 상태에서 보이는 라벨. 넘치면 한 줄 말줄임. */
  @property({ type: String }) label = "";

  /**
   * 활성 여부. 컴포넌트가 스스로 바꾸지 않는다 — 소비자가 내려준다.
   * reflect 로 속성에 남겨야 :host([active]) 스타일이 걸린다.
   */
  @property({ type: Boolean, reflect: true }) active = false;

  override connectedCallback(): void {
    super.connectedCallback();
    warnIfTokensMissing();
  }

  override render() {
    return html`
      <a class="row" href=${this.href} title=${this.label} @click=${this.#onClick}>
        <slot name="leading"></slot>
        <span class="label">${this.label}</span>
        <slot name="trailing"></slot>
      </a>
    `;
  }

  /**
   * 진짜 <a href> 를 렌더하는 이유는 수식키 클릭이다. ⌘/Ctrl/Shift/Alt
   * 클릭과 가운데 클릭은 브라우저에 넘겨 새 탭 열기가 동작하게 하고,
   * 평범한 좌클릭만 가로채 이벤트로 올린다.
   */
  #onClick = (e: MouseEvent): void => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const detail: NsNavigateDetail = { href: this.href, label: this.label };
    this.dispatchEvent(
      new CustomEvent("ns-navigate", { detail, bubbles: true, composed: true }),
    );
  };
}

register("ns-nav-item", NsNavItem);

declare global {
  interface HTMLElementTagNameMap {
    "ns-nav-item": NsNavItem;
  }
}
