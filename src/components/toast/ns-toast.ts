import { LitElement, html, nothing } from "lit";
import { state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

import { register } from "../../internal/register.js";
import { warnIfTokensMissing } from "../../internal/warn-missing-tokens.js";
import { styles } from "./ns-toast.styles.js";

// 닫기 버튼이 <ns-icon> 을 쓴다. 등록 부수효과가 필요하다.
import "../icon/ns-icon.js";

export type NsToastTone = "neutral" | "success" | "danger" | "warn";

interface ToastItem {
  key: number;
  message: string;
  tone: NsToastTone;
  /** 0 이면 자동으로 사라지지 않는다. */
  duration: number;
  /** 남은 시간. hover·포커스로 멈출 때마다 줄어든다. */
  remaining: number;
  /** 지금 타이머가 시작된 시각. */
  startedAt: number;
  timer?: number;
}

/**
 * 토스트 리전. **문서당 하나다** — `nsToast()` 가 만들어 `document.body` 에 붙이고
 * 이미 있으면 재사용한다.
 *
 * shadow 인 이유: 페이지 위에 겹쳐 뜨므로 소비자 CSS 와 격리돼야 한다. Light DOM
 * 이면 소비자의 `div { … }` 한 줄이 토스트를 무너뜨릴 수 있다.
 *
 * **직접 마크업에 쓰는 태그가 아니다.** 프로퍼티도 슬롯도 없다.
 */
export class NsToast extends LitElement {
  static override styles = styles;

  @state() private items: ToastItem[] = [];

  #nextKey = 0;
  #paused = false;

  override connectedCallback(): void {
    super.connectedCallback();
    warnIfTokensMissing();
  }

  override disconnectedCallback(): void {
    for (const item of this.items) {
      if (item.timer !== undefined) clearTimeout(item.timer);
    }
    super.disconnectedCallback();
  }

  /** 토스트 하나를 띄운다. 돌려주는 함수를 부르면 즉시 닫는다(두 번 불러도 안전). */
  show(message: string, tone: NsToastTone, duration: number): () => void {
    const key = this.#nextKey++;
    this.items = [
      ...this.items,
      { key, message, tone, duration, remaining: duration, startedAt: Date.now() },
    ];
    // 멈춰 있는 동안 새로 뜬 것은 재개될 때 함께 시작된다.
    if (duration > 0 && !this.#paused) this.#start(key);
    return () => this.dismiss(key);
  }

  /** 이미 사라진 키를 줘도 아무 일도 하지 않는다. */
  dismiss(key: number): void {
    const item = this.items.find((i) => i.key === key);
    if (item === undefined) return;
    if (item.timer !== undefined) clearTimeout(item.timer);
    this.items = this.items.filter((i) => i.key !== key);
  }

  #start(key: number): void {
    const item = this.items.find((i) => i.key === key);
    if (item === undefined || item.duration <= 0) return;
    item.startedAt = Date.now();
    item.timer = window.setTimeout(() => this.dismiss(key), item.remaining);
  }

  /*
    마우스가 올라가 있거나 안쪽에 포커스가 있는 동안 자동 소멸을 멈춘다.
    안 멈추면 읽는 중에, 혹은 닫기 버튼에 Tab 으로 닿는 중에 사라진다.

    items 배열을 갈아 끼우지 않고 항목을 직접 고친다 — 화면에 보이는 것이 하나도
    바뀌지 않으므로 리렌더할 이유가 없다.
  */
  #pause = (): void => {
    if (this.#paused) return;
    this.#paused = true;
    for (const item of this.items) {
      if (item.timer === undefined) continue;
      clearTimeout(item.timer);
      item.timer = undefined;
      item.remaining = Math.max(0, item.remaining - (Date.now() - item.startedAt));
    }
  };

  #resume = (): void => {
    if (!this.#paused) return;
    this.#paused = false;
    for (const item of this.items) if (item.duration > 0) this.#start(item.key);
  };

  protected override render() {
    /*
      리전은 aria-live="polite" 다. danger 항목만 role="alert" 로 즉시 읽게 한다 —
      중첩된 live region 은 안쪽이 자기 부분집합에 대해 이긴다.
    */
    return html`
      <div
        class="region"
        aria-live="polite"
        @mouseenter=${this.#pause}
        @mouseleave=${this.#resume}
        @focusin=${this.#pause}
        @focusout=${this.#resume}
      >
        ${repeat(
          this.items,
          (item) => item.key,
          (item) => html`
            <div class="toast ${item.tone}" role=${item.tone === "danger" ? "alert" : nothing}>
              <span class="message">${item.message}</span>
              <button
                class="close"
                type="button"
                aria-label="닫기"
                @click=${() => this.dismiss(item.key)}
              >
                <ns-icon name="close"></ns-icon>
              </button>
            </div>
          `,
        )}
      </div>
    `;
  }
}

register("ns-toast", NsToast);

declare global {
  interface HTMLElementTagNameMap {
    "ns-toast": NsToast;
  }
}
