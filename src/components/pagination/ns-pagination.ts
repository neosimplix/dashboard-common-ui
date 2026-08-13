import { LitElement, html, nothing } from "lit";
import { property } from "lit/decorators.js";

import { register } from "../../internal/register.js";
import { warnIfTokensMissing } from "../../internal/warn-missing-tokens.js";
import type { NsPageChangeDetail } from "../../types.js";

/**
 * 번호 윈도우.
 *
 * - 페이지 수 ≤ 7 이면 전부
 * - 그 외에는 첫 페이지 · 현재±1 · 마지막 페이지, 빈 구간에 `"gap"`
 *
 * 내보내는 이유는 규칙이 모호하지 않게 문서화되기 위해서다. 소비자가 쓸 API 는
 * 아니고 `src/index.ts` 에서 재export 하지 않는다.
 */
export function pageWindow(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const wanted = [1, current - 1, current, current + 1, total]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);

  const out: (number | "gap")[] = [];
  let previous = 0;
  for (const page of wanted) {
    if (page === previous) continue;
    if (previous !== 0 && page - previous > 1) out.push("gap");
    out.push(page);
    previous = page;
  }
  return out;
}

/**
 * 목록 페이지 이동 컨트롤. 표를 모르고 데이터를 모른다 — 어떤 목록에도 붙는다.
 */
export class NsPagination extends LitElement {
  /*
    Light DOM 이다. controls.css 의 .ns-button 을 그대로 쓰기 위해서다 — shadow
    였다면 버튼 스타일 전부를 다시 적어야 했고, ns-dialog 닫기 버튼에서 수용한
    중복(열 줄)이 여기서는 훨씬 커진다.

    ns-table 과 달리 자식이 없으므로 Lit 이 이 요소 안에 렌더해도 덮어쓸 소비자
    내용이 없다. 그래서 LitElement 를 그대로 쓴다.

    static styles 는 이 재정의로 무시된다 — adoptStyles 가 호출되지 않는다.
    스타일은 전부 controls.css 에 있고 이 컴포넌트에 .styles.ts 가 없다.
  */
  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  /** 전체 **항목** 수. 페이지 수가 아니다 — 서버 응답이 주는 것이 보통 이쪽이다. */
  @property({ type: Number }) total = 0;

  @property({ type: Number, attribute: "per-page" }) perPage = 20;

  /**
   * 제어 모드의 현재 페이지. `undefined` 면 비제어다.
   *
   * 속성이 아니라 프로퍼티 전용인 이유는 ns-dialog 의 `open` 과 같다 —
   * `<ns-pagination page="3">` 이라고 쓰면 제어 모드로 들어가 컴포넌트가 스스로
   * 페이지를 넘기지 못한다. 순수 HTML 은 `default-page` 를 쓴다.
   */
  @property({ attribute: false }) page?: number;

  /** 비제어 초기 페이지. */
  @property({ type: Number, attribute: "default-page" }) defaultPage = 1;

  #innerPage = 1;
  #warned = false;

  get #controlled(): boolean {
    return this.page !== undefined;
  }

  get #pages(): number {
    return Math.ceil(this.total / this.perPage);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    warnIfTokensMissing();
  }

  /*
    비제어 초기값을 seed 한다. 덮어쓰지 않는다 — Lit 은 첫 업데이트를
    마이크로태스크로 미루므로, 생성과 같은 태스크에서 프로퍼티를 만진 코드가
    여기보다 먼저 실행된다.
  */
  protected override firstUpdated(): void {
    if (this.defaultPage !== 1) this.#innerPage = this.defaultPage;
  }

  #current(): number {
    const raw = this.page ?? this.#innerPage;
    const pages = this.#pages;
    if (raw >= 1 && raw <= pages) return raw;

    /*
      범위를 벗어난 page 는 표시용으로만 clamp 하고 경고를 한 번 낸다.
      이벤트로 교정하지 않는다 — 소비자 상태와 서로 밀어내는 루프가 된다.
    */
    if (!this.#warned) {
      this.#warned = true;
      console.warn(
        `[ns-pagination] page=${raw} 가 1..${pages} 범위를 벗어났습니다.`,
      );
    }
    return Math.min(Math.max(raw, 1), Math.max(pages, 1));
  }

  #go(page: number): void {
    // 현재 페이지 클릭은 아무 일도 하지 않는다.
    if (page === this.#current()) return;

    if (!this.#controlled) {
      this.#innerPage = page;
      this.requestUpdate();
    }

    const detail: NsPageChangeDetail = { page };
    this.dispatchEvent(
      new CustomEvent("ns-page-change", { detail, bubbles: true, composed: true }),
    );
  }

  protected override render() {
    const pages = this.#pages;
    // 페이지가 하나 이하면 쓸모없는 컨트롤을 남기지 않는다.
    if (pages <= 1) return nothing;

    const current = this.#current();

    return html`
      <nav aria-label="페이지 이동">
        <button
          class="ns-button ns-button--ghost ns-button--sm"
          type="button"
          ?disabled=${current === 1}
          @click=${() => this.#go(current - 1)}
        >
          이전
        </button>
        ${pageWindow(current, pages).map((entry) =>
          entry === "gap"
            ? html`<span class="ns-pagination-gap" aria-hidden="true">…</span>`
            : html`<button
                class=${entry === current
                  ? "ns-button ns-button--outline ns-button--sm"
                  : "ns-button ns-button--ghost ns-button--sm"}
                type="button"
                aria-current=${entry === current ? "page" : nothing}
                @click=${() => this.#go(entry)}
              >
                ${entry}
              </button>`,
        )}
        <button
          class="ns-button ns-button--ghost ns-button--sm"
          type="button"
          ?disabled=${current === pages}
          @click=${() => this.#go(current + 1)}
        >
          다음
        </button>
      </nav>
    `;
  }
}

register("ns-pagination", NsPagination);

declare global {
  interface HTMLElementTagNameMap {
    "ns-pagination": NsPagination;
  }
}
