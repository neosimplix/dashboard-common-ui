import { LitElement, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

import { register } from "../../internal/register.js";
import { warnIfTokensMissing } from "../../internal/warn-missing-tokens.js";
import { warnPropertyOnlyAttributes } from "../../internal/warn-property-only.js";
import type { NsMultiSelectChangeDetail } from "../../types.js";

export interface NsMultiSelectOption {
  /**
   * 이 후보의 식별자. **`options` 안에서 유일해야 한다.**
   *
   * 두 곳에서 키로 쓰인다 — 목록과 칩 줄의 `repeat()` 이 이 값으로 DOM 을
   * 재사용하므로, 겹치면 lit 이 같은 키의 두 항목을 하나로 보고 렌더가 어긋난다.
   * 선택도 값으로만 하므로 겹친 후보는 함께 선택되고 칩도 그 수만큼 생긴다.
   */
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

  /**
   * 비제어 초기 선택. **사용자가 처음 만지기 전까지 계속 유효하다.**
   *
   * 첫 업데이트에서 한 번 seed 하고 마는 것이 아니다. 늦게 대입해도(마크업으로
   * 만들어 둔 요소를 나중에 `getElementById` 로 찾아 대입하는, 문서가 안내하는
   * 바로 그 모양) 반응형 프로퍼티라 그대로 다시 렌더된다. 이유는 `#innerValue`
   * 선언에 적어 뒀다.
   */
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

  /*
    비제어 상태. **사용자가 처음 토글하기 전까지 undefined 다** — 빈 배열이
    아니다. 그 전까지 유효 선택은 defaultValue 이고, 여기에 값이 생기는 순간부터
    defaultValue 는 더 이상 보이지 않는다. "기본값" 이 뜻해야 하는 것이 그것이다.

    **이 lazy 함이 ns-pagination 과 다른 점이고, 의도한 것이다.** 그쪽은 비제어
    초기값이 default-page 라는 *속성*이라 upgrade 시점에 이미 마크업에 있다 —
    그래서 willUpdate 에서 hasUpdated 로 막고 한 번만 seed 해도 안전하다.
    여기서는 배열이라 속성으로 쓸 수 없어 defaultValue 가 프로퍼티일 수밖에
    없고, 프로퍼티는 언제 대입될지가 정해져 있지 않다. 같은 모양으로 seed 하면
    첫 업데이트가 이미 흘러간 뒤의 대입이 hasUpdated 가드에 걸려 조용히
    버려진다 — 그리고 문서가 안내하는 순수 HTML 배선(마크업에 태그를 두고
    나중에 스크립트가 .defaultValue 를 대입한다)이 정확히 그 모양이다.

    경고로 막지 않고 타이밍 의존 자체를 없앤다. seed 하는 코드가 없으므로
    "늦은 대입" 이라는 것이 존재하지 않고, defaultValue 는 반응형 프로퍼티라
    대입이 그냥 다음 렌더에 반영된다.
  */
  #innerValue?: string[];

  get #controlled(): boolean {
    return this.value !== undefined;
  }

  get #selected(): string[] {
    return this.value ?? this.#innerValue ?? this.defaultValue;
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

  /**
   * @param item   토글할 값
   * @param source 이 토글을 일으킨 네이티브 체크박스. 칩의 제거 버튼에는 없다.
   */
  #toggle(item: string, source?: HTMLInputElement): void {
    const current = this.#selected;
    const next = current.includes(item)
      ? current.filter((v) => v !== item)
      : [...current, item];

    if (this.#controlled) {
      /*
        제어 모드에서 체크박스를 원래대로 되돌린다. **소비자가 이벤트를 받아들이면
        곧바로 다시 뒤집히므로 눈에 보이지 않고, 거절하면 이것이 유일한 복구다.**

        되돌리지 않으면 영구히 어긋난다. 클릭 시점에 브라우저가 이미 native
        checked 를 뒤집어 놓았는데, 소비자가 value 를 바꾸지 않으면 다음 렌더의
        `.checked` 바인딩 값이 **직전에 커밋한 값과 같다**. lit-html 의
        PropertyPart 는 값이 그대로면 DOM 쓰기를 통째로 건너뛰므로 그 렌더가
        고쳐주지 않고, 바인딩 값이 앞으로도 바뀌지 않으니 이후 어떤 렌더도
        고칠 수 없다. 화면만 체크된 채로 남는다.

        ns-table 이 이 문제를 겪지 않는 이유는 그쪽 체크박스를 lit 이 아니라
        React 가 갖고 있어서다 — React 는 checked 를 매 렌더 강제로 되돌린다.

        여기서만 할 수 있는 일이다. 무엇이 참인지 아는 지점이 여기뿐이다.
      */
      if (source !== undefined) source.checked = current.includes(item);
    } else {
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
                    @change=${(e: Event) =>
                      this.#toggle(o.value, e.target as HTMLInputElement)}
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
