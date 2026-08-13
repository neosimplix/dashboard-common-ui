import { LitElement, html } from "lit";
import { property, query, state } from "lit/decorators.js";

import { register } from "../../internal/register.js";
import { warnIfTokensMissing } from "../../internal/warn-missing-tokens.js";
import type { NsDialogCloseDetail, NsDialogCloseReason } from "../../types.js";
import { styles } from "./ns-dialog.styles.js";

// 닫기 버튼이 <ns-icon> 을 쓴다. 등록 부수효과가 필요하다.
import "../icon/ns-icon.js";

export class NsDialog extends LitElement {
  static override styles = styles;

  /**
   * 제목.
   *
   * `title` 이 아닌 이유는 ns-page-heading 과 같다 — 전역 속성이라 대화상자
   * 전체가 브라우저 툴팁을 갖는다. React 프롭만 `title` 을 유지한다.
   */
  @property({ type: String }) heading = "";

  /**
   * 제어 모드. `undefined` 면 비제어다.
   *
   * 속성이 아니라 프로퍼티 전용인 이유: `<ns-dialog open>` 이라고 쓰면 boolean
   * 속성이 `true` 로 읽혀 제어 모드로 들어가고, 그러면 컴포넌트가 스스로 닫지
   * 못한다. 순수 HTML 소비자는 `default-open` 을 쓴다.
   *
   * `open` 을 나중에 `undefined` 로 되돌리면 비제어로 전환되고, 그 시점의 내부
   * 상태(보통 닫힘)가 화면에 반영된다 — 열려 있던 대화상자가 닫힌다. React 의
   * controlled/uncontrolled 전환과 같은 성질이다.
   */
  @property({ attribute: false }) open?: boolean;

  /** 비제어 초기값. */
  @property({ type: Boolean, attribute: "default-open" }) defaultOpen = false;

  /** backdrop 클릭 닫기를 끈다. 입력을 잃으면 안 되는 폼 대화상자에서 쓴다. */
  @property({ type: Boolean, attribute: "no-backdrop-close" }) noBackdropClose = false;

  @query("dialog") private dialogEl!: HTMLDialogElement | null;

  /** footer slot 에 내용이 있는지. CSS 로는 알 수 없어 slotchange 로 잡는다. */
  @state() private hasFooter = false;

  /** 비제어일 때의 진실. */
  #innerOpen = false;

  /** mousedown 이 대화상자 밖에서 시작됐는지. */
  #downOutside = false;

  /** updated() 가 부른 close() 인지. native close 이벤트를 Esc 로 오해하지 않기 위한 것. */
  #closedByUs = false;

  get #controlled(): boolean {
    return this.open !== undefined;
  }

  get #isOpen(): boolean {
    return this.open ?? this.#innerOpen;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    warnIfTokensMissing();
  }

  /*
    defaultOpen 을 connectedCallback 이 아니라 여기서 읽는다. document.createElement
    로 만든 뒤 setAttribute 하는 경로에서는 connectedCallback 시점에 속성이 아직
    없을 수 있다. firstUpdated 는 같은 갱신 주기의 updated 보다 먼저 실행되므로
    아래 값이 그 주기에서 바로 반영된다.

    덮어쓰지 않고 seed 만 한다. Lit 은 첫 업데이트를 마이크로태스크로 미루므로
    생성과 같은 태스크에서 부른 show() 가 여기보다 먼저 실행되는데, 무조건
    대입하면 그 show() 가 경고도 없이 사라진다.
  */
  override firstUpdated(): void {
    if (this.defaultOpen) this.#innerOpen = true;
  }

  /**
   * 비제어일 때만 연다. 제어 중이면 경고만 낸다 — 여기서 상태를 바꾸면
   * 소비자의 `open` 과 어긋나 화면이 튄다.
   */
  show(): void {
    if (this.#warnIfControlled("show")) return;
    this.#innerOpen = true;
    this.requestUpdate();
  }

  /** 비제어일 때만 닫는다. 소비자가 부른 것이므로 `ns-dialog-close` 를 내지 않는다. */
  close(): void {
    if (this.#warnIfControlled("close")) return;
    this.#innerOpen = false;
    this.requestUpdate();
  }

  #warnIfControlled(method: string): boolean {
    if (!this.#controlled) return false;
    console.warn(
      `[ns-dialog] open 프로퍼티가 설정된 제어 모드에서는 ${method}() 가 동작하지 않습니다. open 을 바꾸세요.`,
    );
    return true;
  }

  /*
    네이티브 dialog 의 상태를 매번 우리 상태와 맞춘다.

    제어 모드에서 Esc 로 네이티브 대화상자가 닫혔는데 소비자가 open 을 true 로
    두면 여기서 다시 연다. 그게 제어의 정의다. 참고 구현에는 이 재조정이 없어
    화면은 닫히고 React state 는 열린 채로 어긋난다.

    open 속성이 아니라 showModal() 이어야 배경이 inert 가 되고 포커스 트랩과
    ::backdrop 이 동작한다.
  */
  override updated(): void {
    const el = this.dialogEl;
    if (!el) return;

    if (this.#isOpen && !el.open) {
      // 분리된 동안 open 이 바뀌면 showModal() 이 InvalidStateError 를 던져 갱신 주기를 끊는다.
      if (this.isConnected) el.showModal();
    } else if (!this.#isOpen && el.open) {
      this.#closedByUs = true;
      el.close();
    }
  }

  override render() {
    return html`
      <dialog
        aria-labelledby="dialog-heading"
        @close=${this.#onNativeClose}
        @mousedown=${this.#onMouseDown}
        @click=${this.#onClick}
      >
        <div class="header">
          <h2 id="dialog-heading">${this.heading}</h2>
          <button class="close" type="button" aria-label="닫기" @click=${this.#onCloseButton}>
            <ns-icon name="close"></ns-icon>
          </button>
        </div>
        <div class="body"><slot></slot></div>
        <div class="footer" ?hidden=${!this.hasFooter}>
          <slot name="footer" @slotchange=${this.#onFooterSlotChange}></slot>
        </div>
      </dialog>
    `;
  }

  #onFooterSlotChange = (e: Event): void => {
    const slot = e.target as HTMLSlotElement;
    this.hasFooter = slot.assignedNodes({ flatten: true }).length > 0;
  };

  /*
    Esc 는 브라우저가 직접 닫으므로 close 이벤트만 남는다. 그것을 여기서 올린다.

    close() 는 close 이벤트를 비동기로 큐에 넣기 때문에 동기 플래그로는
    "우리가 닫았다" 를 구분할 수 없다. 그래서 의도를 플래그로 들고 있다가 소비한다.
  */
  #onNativeClose = (): void => {
    if (this.#closedByUs) {
      this.#closedByUs = false;
      return;
    }
    this.#requestClose("escape");
  };

  #onCloseButton = (): void => {
    this.#requestClose("close-button");
  };

  #onMouseDown = (e: MouseEvent): void => {
    this.#downOutside = this.#isOutside(e);
  };

  #onClick = (e: MouseEvent): void => {
    /*
      플래그를 소비한다. 지우지 않으면 backdrop 에 mousedown 했다가 안에서 손을 뗀
      뒤 남은 true 가 다음 클릭까지 살아남는다.
    */
    const downOutside = this.#downOutside;
    this.#downOutside = false;

    if (this.noBackdropClose) return;

    /*
      키보드로 활성화된 클릭은 clientX/clientY 가 0 이다. 대화상자는 가운데 정렬이라
      (0,0) 은 항상 밖으로 판정되므로, 걸러내지 않으면 footer 버튼을 Enter 로 누른 것이
      backdrop 클릭이 된다. e.detail === 0 이 관용적인 판별법이다.
    */
    if (e.detail === 0) return;

    /*
      mousedown 과 click 이 모두 밖이어야 한다. 본문 글자를 드래그로 선택하다
      backdrop 에서 손을 떼면 click 타깃이 <dialog> 가 되므로, 이 확인이 없으면
      복사하려던 사용자가 대화상자를 잃는다.
    */
    if (!downOutside || !this.#isOutside(e)) return;
    this.#requestClose("backdrop");
  };

  /*
    e.target 으로 판별하지 않는다. border-radius 모서리처럼 대화상자 자기
    표면을 클릭해도 타깃이 <dialog> 라서 backdrop 으로 오인된다.
  */
  #isOutside(e: MouseEvent): boolean {
    const el = this.dialogEl;
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return (
      e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom
    );
  }

  #requestClose(reason: NsDialogCloseReason): void {
    if (!this.#controlled) this.#innerOpen = false;

    const detail: NsDialogCloseDetail = { reason };
    this.dispatchEvent(
      new CustomEvent("ns-dialog-close", { detail, bubbles: true, composed: true }),
    );

    /*
      제어 모드에서 소비자가 open 을 바꾸지 않으면 updated() 가 다시 연다.
      비제어에서는 #innerOpen 이 반응형 프로퍼티가 아니므로 갱신을 직접 요청한다.
    */
    this.requestUpdate();
  }
}

register("ns-dialog", NsDialog);

declare global {
  interface HTMLElementTagNameMap {
    "ns-dialog": NsDialog;
  }
}
