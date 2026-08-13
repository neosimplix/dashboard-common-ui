import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { register } from "../../internal/register.js";
import { warnIfTokensMissing } from "../../internal/warn-missing-tokens.js";
import type { NsToggleDetail } from "../../types.js";
import { styles } from "./ns-header.styles.js";

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
    이 버튼의 svg 를 손으로 그린다. icons.ts 의 "menu" 와 viewBox·stroke-width 가
    다르다는 것을 알고 남긴 상태다 — <ns-icon> 으로 바꾸면 이미 배포된 셸의
    렌더링이 바뀌므로, 통일은 이 수정과 별개로 결정할 일이다. (Lit 템플릿 안의
    HTML 주석은 인스턴스마다 shadow DOM 에 실려 나가므로 여기 밖에 둔다.)
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
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
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
