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
   * `leading` 슬롯이 비었을 때 대신 보이는 짧은 배지.
   *
   * **접힘·펼침 양쪽에서 보인다.** 접힌 레일에서 유일하게 남는 요소라 거기서
   * 두드러질 뿐이고, 펼친 상태에서도 라벨 왼쪽에 그대로 남는다. 라벨과 같은
   * 글자를 넣으면 "설치 설치" 가 된다.
   */
  @property({ type: String }) badge = "";

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
        <span class="leading">
          <slot name="leading">
            <span class="badge" aria-hidden="true">${this.badge}</span>
          </slot>
        </span>
        <span class="label">${this.label}</span>
        <span class="trailing"><slot name="trailing"></slot></span>
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
