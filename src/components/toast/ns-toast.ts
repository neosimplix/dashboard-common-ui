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

  /*
    **정지 사유가 둘이고, 서로 독립적으로 들어오고 나간다.** 불리언 하나로 합치면
    나중에 풀리는 쪽이 무시되고 먼저 풀리는 쪽이 상대의 정지를 취소한다.

    가장 흔한 경로가 평범하다. Windows·Linux Chrome 은 버튼 클릭이 포커스를 주므로
    "hover → 닫기 클릭" 이 focusin 을 낳는데, 합친 불리언에서는 이미 멈춰 있어
    무시되고, 이어지는 focusout 이 마우스가 아직 올라가 있는 나머지 토스트의
    타이머를 되살린다. 거울상도 있다 — 포커스가 안에 있는데 마우스가 스쳐 지나가면
    mouseleave 가 키보드 사용자의 포커스 밑에서 토스트를 지운다.

    그래서 사유를 따로 들고, **둘 다 풀렸을 때만** 재개한다. 카운터가 아니라
    불리언인 이유는 짝이 맞지 않는 mouseleave·focusout 이 와도 0 아래로 내려갈
    수 없기 때문이다 — false 를 다시 false 로 두는 것은 언제나 안전하다.
  */
  #hovered = false;
  #focused = false;

  /*
    위 둘에서 파생되지만 실제로 적용된 상태를 따로 들고 있다. 정지와 재개를 각각
    한 번씩만 실행하기 위한 것이다 — #sync 가 멱등한 근거가 이 값이다.
  */
  #paused = false;

  override connectedCallback(): void {
    super.connectedCallback();
    warnIfTokensMissing();
    /*
      분리 중에 멈춰 둔 타이머를 남은 시간으로 다시 건다. disconnectedCallback 이
      정지 사유를 비웠으므로 조건 없이 재개해도 된다 — 방금 붙은 리전에는 hover 도
      포커스도 없다. 첫 연결에서는 items 가 비어 있어 아무 일도 하지 않는다.
    */
    this.#resumeTimers();
  }

  override disconnectedCallback(): void {
    /*
      타이머를 끄고 남은 시간을 저축한다. **timer 를 undefined 로 되돌리는 것이
      핵심이다** — 지우지 않으면 재연결된 리전의 #pauseTimers 가 이미 죽은(그리고
      브라우저가 재활용했을 수도 있는) id 를 clearTimeout 하고, 분리돼 있던 벽시계
      시간 전체를 remaining 에서 빼 버린다. 그러면 이어지는 재개가
      setTimeout(…, 0) 이 되어 토스트가 뜨자마자 사라진다.

      분리된 동안 흐른 시간은 세지 않는다. 화면에 없는 것은 읽힐 수 없으므로
      소멸 시간에 포함시킬 이유가 없다.
    */
    this.#pauseTimers();

    /*
      정지 사유도 비운다. 분리된 요소에는 hover 도 포커스도 없는데 남겨 두면
      재연결된 리전이 아무도 멈추지 않았는데 멈춘 상태로 시작한다.
    */
    this.#hovered = false;
    this.#focused = false;
    this.#paused = false;

    super.disconnectedCallback();
  }

  /** 토스트 하나를 띄운다. 돌려주는 함수를 부르면 즉시 닫는다(두 번 불러도 안전). */
  show(message: string, tone: NsToastTone, duration: number): () => void {
    const key = this.#nextKey++;
    const item: ToastItem = {
      key,
      message,
      tone,
      duration,
      remaining: duration,
      startedAt: Date.now(),
    };
    this.items = [...this.items, item];
    // 멈춰 있는 동안 새로 뜬 것은 재개될 때 함께 시작된다.
    if (!this.#paused) this.#startItem(item);
    return () => this.dismiss(key);
  }

  /** 이미 사라진 키를 줘도 아무 일도 하지 않는다. */
  dismiss(key: number): void {
    const item = this.items.find((i) => i.key === key);
    if (item === undefined) return;
    if (item.timer !== undefined) clearTimeout(item.timer);
    this.items = this.items.filter((i) => i.key !== key);
  }

  /** duration 이 0 이거나 이미 돌고 있으면 아무 일도 하지 않는다(재개가 멱등한 근거). */
  #startItem(item: ToastItem): void {
    if (item.duration <= 0 || item.timer !== undefined) return;
    item.startedAt = Date.now();
    item.timer = window.setTimeout(() => this.dismiss(item.key), item.remaining);
  }

  /*
    마우스가 올라가 있거나 안쪽에 포커스가 있는 동안 자동 소멸을 멈춘다.
    안 멈추면 읽는 중에, 혹은 닫기 버튼에 Tab 으로 닿는 중에 사라진다.

    items 배열을 갈아 끼우지 않고 항목을 직접 고친다 — 화면에 보이는 것이 하나도
    바뀌지 않으므로 리렌더할 이유가 없다.
  */
  #pauseTimers(): void {
    for (const item of this.items) {
      if (item.timer === undefined) continue;
      clearTimeout(item.timer);
      item.timer = undefined;
      item.remaining = Math.max(0, item.remaining - (Date.now() - item.startedAt));
    }
  }

  #resumeTimers(): void {
    for (const item of this.items) this.#startItem(item);
  }

  /*
    두 사유를 하나의 적용 상태로 접는다. 사유가 바뀔 때마다 부르고, 실제 정지·재개는
    상태가 뒤집힐 때만 일어난다.
  */
  #sync(): void {
    const shouldPause = this.#hovered || this.#focused;
    if (shouldPause === this.#paused) return;
    this.#paused = shouldPause;
    if (shouldPause) this.#pauseTimers();
    else this.#resumeTimers();
  }

  #onMouseEnter = (): void => {
    this.#hovered = true;
    this.#sync();
  };

  #onMouseLeave = (): void => {
    this.#hovered = false;
    this.#sync();
  };

  /*
    focusout → focusin 순서로 리전 안에서 포커스가 옮겨 가면 잠깐 재개됐다가 다시
    멈춘다. 두 이벤트가 같은 태스크에서 연달아 오므로 그 사이에 흐르는 시간은 0 이고
    remaining 도 그대로다 — relatedTarget 을 보는 특수 처리를 두지 않는 이유다.
  */
  #onFocusIn = (): void => {
    this.#focused = true;
    this.#sync();
  };

  #onFocusOut = (): void => {
    this.#focused = false;
    this.#sync();
  };

  /*
    **포커스된 요소가 DOM 에서 사라져도 브라우저는 focusout 을 내지 않는다.**
    닫기 버튼을 눌러 그 토스트가 없어지는 것이 정확히 그 경로다(클릭이 포커스를
    주는 플랫폼에서). 그대로 두면 #focused 가 true 로 굳어 남은 토스트가 영원히
    멈추고, 그 뒤에 뜨는 토스트도 타이머 없이 쌓인다.

    갱신을 마친 시점의 shadow 안 실제 포커스가 유일하게 믿을 수 있는 값이므로
    거기서 다시 맞춘다. #hovered 는 손대지 않는다 — :hover 는 스타일 재계산에
    묶여 있어 마우스가 아직 올라가 있는데도 false 로 읽힐 수 있고, 그러면 이 고침이
    막으려던 바로 그 고장(읽는 중에 사라짐)을 다시 만든다. .region 요소는 리렌더에도
    살아남으므로 mouseleave 는 실제로 도착한다.
  */
  protected override updated(): void {
    this.#focused = this.shadowRoot?.activeElement != null;
    this.#sync();
  }

  protected override render() {
    /*
      리전은 aria-live="polite" 다. danger 항목만 role="alert" 로 즉시 읽게 한다 —
      중첩된 live region 은 안쪽이 자기 부분집합에 대해 이긴다.
    */
    return html`
      <div
        class="region"
        aria-live="polite"
        @mouseenter=${this.#onMouseEnter}
        @mouseleave=${this.#onMouseLeave}
        @focusin=${this.#onFocusIn}
        @focusout=${this.#onFocusOut}
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
