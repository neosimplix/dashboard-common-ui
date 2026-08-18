import { LitElement, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

import { register } from "../../internal/register.js";
import { warnIfTokensMissing } from "../../internal/warn-missing-tokens.js";
import { warnPropertyOnlyAttributes } from "../../internal/warn-property-only.js";
import type { NsMultiSelectChangeDetail } from "../../types.js";

export interface NsMultiSelectOption {
  value: string;
  label: string;
  /**
   * 라벨 옆에 흐리게 붙는 보조 정보. 담당자에게는 소속 부서명.
   *
   * **검색은 `label` 과 이 값 둘 다에 걸린다** — 화면에 보이는 문자열만 검색어가
   * 된다. 보이지 않는 별도 검색어 필드를 두지 않는다.
   */
  meta?: string;
}

/**
 * 후보가 길 때 쓰는 다중 선택 — 선택 칩 줄 · 검색 · 높이 제한 목록.
 *
 * **정렬 순서는 호출부가 `options` 배열 순서로 정한다.** 이 컴포넌트는 도메인을
 * 모르고 받은 순서를 건드리지 않는다.
 *
 * **자식을 받지 않는다.** Lit 이 이 요소의 내용을 통째로 소유한다.
 */
export class NsMultiSelect extends LitElement {
  /*
    Light DOM 이다. .ns-chip · .ns-input · .ns-checkbox 를 그대로 쓰기 위해서다 —
    shadow 였다면 셋 전부를 다시 적어야 했고, 그것이 이 컴포넌트의 내용 거의
    전부다. ns-pagination 과 같은 판단이다.

    자식이 없으므로 Lit 이 이 요소 안에 렌더해도 덮어쓸 소비자 내용이 없다.
    그래서 LitElement 를 그대로 쓴다.

    static styles 는 이 재정의로 무시된다. 스타일은 전부 controls.css 에 있고
    이 컴포넌트에 .styles.ts 가 없다.
  */
  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  /** 후보 전체. **배열이라 속성으로 쓸 수 없다** — JS 로 대입한다. */
  @property({ attribute: false }) options: NsMultiSelectOption[] = [];

  /**
   * 제어 모드의 선택 집합. `undefined` 면 비제어다.
   *
   * 비제어 초기값이 속성이 아니라 `defaultValue` 프로퍼티인 것은 이 저장소의
   * 규칙에서 벗어난다. 배열은 속성으로 쓸 수 없어서다 — 규칙이 막으려던 것
   * ("속성 하나가 겸용돼 조용히 제어 모드로 들어감")은 이름이 둘이라 일어나지 않는다.
   */
  @property({ attribute: false }) value?: string[];

  /** 비제어 초기 선택. */
  @property({ attribute: false }) defaultValue: string[] = [];

  @property({ type: String, attribute: "search-placeholder" }) searchPlaceholder = "검색";
  @property({ type: String, attribute: "empty-message" }) emptyMessage = "결과가 없습니다";

  /**
   * 검색 input 의 `id`. `.ns-field__label` 의 `for` 가 가리킬 곳이다.
   *
   * 호스트의 `id` 를 안쪽 input 에 옮기지 않는 이유: 문서에 같은 `id` 가 둘
   * 생기고, `getElementById` 가 어느 쪽을 주는지가 문서 순서로 정해진다.
   */
  @property({ type: String, attribute: "input-id" }) inputId = "";

  /** 검색 input 의 `aria-describedby`. `.ns-field__hint` 를 잇는 자리다. */
  @property({ type: String, attribute: "input-describedby" }) inputDescribedby = "";

  @state() private query = "";

  #innerValue: string[] = [];

  get #controlled(): boolean {
    return this.value !== undefined;
  }

  get #selected(): string[] {
    return this.value ?? this.#innerValue;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    warnIfTokensMissing();
    warnPropertyOnlyAttributes(this, {
      value: "defaultValue 프로퍼티 (배열은 속성으로 쓸 수 없습니다)",
      options: "options 프로퍼티 (배열은 속성으로 쓸 수 없습니다)",
      "default-value": "defaultValue 프로퍼티",
    });
  }

  /*
    비제어 초기값을 seed 한다. **firstUpdated 가 아니라 willUpdate 다** —
    ns-pagination 과 같은 이유다. 첫 업데이트 순서는 willUpdate → render →
    firstUpdated → updated 라, firstUpdated 에서 seed 하면 첫 render 가 이미
    끝나 있고 아무도 두 번째 업데이트를 요청하지 않는다.
  */
  protected override willUpdate(): void {
    if (this.hasUpdated) return;
    if (this.defaultValue.length > 0) this.#innerValue = [...this.defaultValue];
  }

  #toggle(item: string): void {
    const current = this.#selected;
    const next = current.includes(item)
      ? current.filter((v) => v !== item)
      : [...current, item];

    if (!this.#controlled) {
      this.#innerValue = next;
      this.requestUpdate();
    }

    const detail: NsMultiSelectChangeDetail = { values: next };
    this.dispatchEvent(
      new CustomEvent("ns-multi-select-change", { detail, bubbles: true, composed: true }),
    );
  }

  protected override render() {
    const selected = this.#selected;
    /*
      선택된 것은 **고른 순서로** 칩에 남는다. 검색으로 목록이 좁혀져도 사라지지
      않는다. options 에 없는 값은 그릴 것이 없으므로 조용히 빠진다.
    */
    const chips = selected.flatMap((v) => this.options.filter((o) => o.value === v));

    const q = this.query.trim().toLowerCase();
    const visible =
      q === ""
        ? this.options
        : this.options.filter((o) =>
            [o.label, o.meta ?? ""].some((text) => text.toLowerCase().includes(q)),
          );

    return html`
      ${chips.length === 0
        ? nothing
        : html`
            <div class="ns-multi-select__chips">
              ${repeat(
                chips,
                (o) => o.value,
                (o) => html`
                  <span class="ns-chip">
                    ${o.label}
                    <button
                      class="ns-chip__remove"
                      type="button"
                      aria-label=${`${o.label} 제거`}
                      @click=${() => this.#toggle(o.value)}
                    >
                      ×
                    </button>
                  </span>
                `,
              )}
            </div>
          `}

      <!-- 라벨·hint 는 검색창에 건다 — 이 컴포넌트에서 포커스를 받는 곳이 여기다. -->
      <input
        class="ns-input"
        type="text"
        id=${this.inputId === "" ? nothing : this.inputId}
        aria-describedby=${this.inputDescribedby === "" ? nothing : this.inputDescribedby}
        .value=${this.query}
        placeholder=${this.searchPlaceholder}
        @input=${(e: Event) => {
          this.query = (e.target as HTMLInputElement).value;
        }}
      />

      <div class="ns-multi-select__list">
        ${visible.length === 0
          ? html`<p class="ns-multi-select__empty">${this.emptyMessage}</p>`
          : repeat(
              visible,
              (o) => o.value,
              (o) => html`
                <label class="ns-checkbox">
                  <input
                    type="checkbox"
                    .checked=${selected.includes(o.value)}
                    @change=${() => this.#toggle(o.value)}
                  />
                  <span>${o.label}</span>
                  ${o.meta === undefined
                    ? nothing
                    : html`<span class="ns-checkbox__hint">${o.meta}</span>`}
                </label>
              `,
            )}
      </div>
    `;
  }
}

register("ns-multi-select", NsMultiSelect);

declare global {
  interface HTMLElementTagNameMap {
    "ns-multi-select": NsMultiSelect;
  }
}
