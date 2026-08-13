import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { register } from "../../internal/register.js";
import { warnIfTokensMissing } from "../../internal/warn-missing-tokens.js";
import type { NsToggleDetail } from "../../types.js";
import { styles } from "./ns-header.styles.js";

// 토글 버튼이 <ns-icon> 을 쓴다. 등록 부수효과가 필요하다.
import "../icon/ns-icon.js";

export class NsHeader extends LitElement {
  static override styles = styles;

  /** 헤더 좌측에 표시할 프로젝트 이름. */
  @property({ type: String, attribute: "project-name" }) projectName = "";

  /**
   * 사이드바 펼침 여부. 토글 버튼의 aria-expanded 와 aria-label 을 결정한다.
   * 컴포넌트가 스스로 바꾸지 않는다 — ns-toggle 을 받아 소비자가 내려준다.
   */
  @property({ type: Boolean, reflect: true, attribute: "sidebar-open" }) sidebarOpen = false;

  override connectedCallback(): void {
    super.connectedCallback();
    warnIfTokensMissing();
  }

  /*
    토글 아이콘은 <ns-icon name="menu"> 를 쓴다. 이전에는 여기서 svg 를 손으로
    그렸는데 icons.ts 의 "menu" 와 viewBox·stroke-width 가 달랐다 — 소비자가
    actions slot 에 .ns-button--icon + <ns-icon> 을 넣으면 이 토글 바로 옆에
    굵기가 다른 같은 모양이 나란히 서서 버그로 읽혔다. 아이콘은 한 곳에서만
    정의한다.
  */
  override render() {
    return html`
      <header>
        <button
          class="toggle"
          type="button"
          aria-expanded=${this.sidebarOpen ? "true" : "false"}
          aria-label=${this.sidebarOpen ? "사이드바 닫기" : "사이드바 열기"}
          @click=${this.#onToggle}
        >
          <ns-icon name="menu"></ns-icon>
        </button>

        <span class="title">${this.projectName}</span>

        <div class="actions"><slot name="actions"></slot></div>
      </header>
    `;
  }

  /** detail.open 은 현재 상태가 아니라 "요청되는 다음 상태"다. */
  #onToggle = (): void => {
    const detail: NsToggleDetail = { open: !this.sidebarOpen };
    this.dispatchEvent(
      new CustomEvent("ns-toggle", { detail, bubbles: true, composed: true }),
    );
  };
}

register("ns-header", NsHeader);

declare global {
  interface HTMLElementTagNameMap {
    "ns-header": NsHeader;
  }
}
