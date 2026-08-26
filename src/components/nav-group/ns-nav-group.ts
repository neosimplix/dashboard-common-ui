import { LitElement, html, type PropertyValues } from "lit";
import { property } from "lit/decorators.js";

import { register } from "../../internal/register.js";
import { warnIfTokensMissing } from "../../internal/warn-missing-tokens.js";
import { warnPropertyOnlyAttributes } from "../../internal/warn-property-only.js";
import type { NsGroupToggleDetail } from "../../types.js";
import { styles } from "./ns-nav-group.styles.js";

// caret 이 <ns-icon> 을 쓴다. 등록 부수효과가 필요하다.
import "../icon/ns-icon.js";

export class NsNavGroup extends LitElement {
  static override styles = styles;

  /**
   * 그룹 제목. `ns-sidebar` 안에서는 이것이 그대로 패널 제목의 자리에 온다.
   *
   * 반영하는 이유는 사이드바가 이 값을 관찰하기 때문이다. `@lit/react` 의
   * `createComponent` 는 반응형 프로퍼티를 **프로퍼티로만** 설정하므로, 반영이
   * 없으면 React 소비자가 제목을 바꿔도 속성 변화가 일어나지 않아 사이드바의
   * MutationObserver 가 보지 못한다. 소비자가 준 값을 되울리는 것이라
   * "호스트의 속성을 쓰지 않는다" 가 겨냥하는 덮어쓰기가 아니다 —
   * `ns-nav-item` 의 `active` 가 이미 같은 방식이다.
   */
  @property({ type: String, reflect: true }) heading = "";

  /**
   * 레일 키. `ns-sidebar` 의 `activeGroup` 이 이 값을 가리킨다.
   *
   * **이름이 `key` 가 아닌 이유는 React 다.** `key` 는 재조정 키로 소비되어
   * 엘리먼트까지 도달하지 않고, shim 으로도 고칠 수 없다 — `title` 은 우리에게
   * 도착한 뒤 이름을 바꿀 수 있었지만 `key` 는 도착하지 않는다.
   *
   * `heading` 을 키로 쓰지 않는 이유는 그것이 표시용 문자열이라는 것이다.
   * `ns-group-toggle` 의 `detail` 에서 이미 한 판단이다.
   *
   * 비어 있으면 사이드바가 DOM 순서 인덱스를 키로 쓰고 경고한다.
   */
  @property({ type: String, reflect: true }) name = "";

  /**
   * 레일 타일에 그릴 아이콘의 이름. `<ns-icon name="…">` 에 그대로 넘어간다.
   *
   * **스프라이트는 열려 있다** — 내장 셋에 없는 이름은 `registerIcons()` 로
   * 더한다. 그룹의 정의가 마크업 한 자리에 모이므로 이것이 기본 경로다.
   *
   * 이것으로 부족한 경우가 둘 있고 그때는 사이드바의 직계 자식에
   * `data-ns-rail="<name>"` 로 요소를 직접 넣는다 — React 아이콘 컴포넌트를
   * 쓸 때, 그리고 `registerIcons` 가 Next 번들에 들어가지 않는 배치일 때다.
   */
  @property({ type: String, reflect: true }) icon = "";

  /**
   * 레일 타일에 보이는 짧은 글자. 1~2자를 넣는다.
   *
   * 타일 내용은 네 단계로 떨어진다 — `data-ns-rail` 슬롯 → `icon` → 이
   * `badge` → `heading` 의 첫 글자. 마지막 단이 있는 이유는 이주다: 0.4.0
   * 소비자는 `heading` 만 갖고 있으므로 아무것도 더하지 않아도 레일이 빈
   * 타일이 되지 않는다.
   *
   * `ns-nav-item` 의 `badge` 와 같은 종류의 폴백이지만 **그쪽은 행 안에 늘
   * 보이고 이것은 레일에만 보인다.**
   */
  @property({ type: String, reflect: true }) badge = "";

  /**
   * 헤딩 줄을 토글 버튼으로 만든다.
   *
   * opt-in 이다. 이 속성이 없으면 노드 구조가 0.4.0 과 달라지지 않는다 — 유일한
   * 차이는 목록 `<div>` 가 이제 항상 `id="list"` 를 갖는 것인데(`aria-controls`
   * 가 필요해서), shadow root 안이라 소비자가 관측할 길이 없어 이 non-breaking
   * 주장을 깨지 않는다. 전부 접히게 만들면 소비자가 코드를 한 줄도 바꾸지
   * 않았는데 헤딩에 hover·포커스 링·caret 이 생긴다.
   */
  @property({ type: Boolean }) collapsible = false;

  /**
   * 제어 모드. `undefined` 면 비제어다.
   *
   * 속성이 아니라 프로퍼티 전용이다. 겸용했다면 `<ns-nav-group collapsible open>`
   * 이 boolean 속성으로 읽혀 제어 모드로 들어가고, 그러면 컴포넌트가 스스로
   * 접지 못한다. 순수 HTML 소비자가 쓸 것은 `default-collapsed` 다.
   *
   * 그 속성이 관찰되지 않으므로 `<ns-nav-group open>` 은 제어 모드로 들어가는
   * 것이 아니라 통째로 무시된다. connectedCallback 이 경고한다.
   */
  @property({ attribute: false }) open?: boolean;

  /**
   * 비제어 초기값. 있으면 접힌 채로 시작한다.
   *
   * `default-open` 이 아닌 이유는 boolean 속성의 성질이다 — 속성이 없으면 Lit 이
   * 컨버터를 부르지 않아 필드 초기값이 그대로 남으므로, 기본을 펼침(true)으로
   * 잡으면 소비자가 그 값을 false 로 만들 경로가 없다. 그래서 극성을 뒤집어
   * **기본값에서 벗어나는 쪽**을 이름으로 삼았다. ns-dialog 의 default-open 과
   * 반대로 보이지만 규칙은 같다.
   *
   * 나중에 이 값을 바꾸면 **아직 토글되지 않은 그룹에만** 반영된다.
   */
  @property({ type: Boolean, attribute: "default-collapsed" }) defaultCollapsed = false;

  /** 비제어일 때의 진실. */
  #innerCollapsed = false;

  /** 사용자가 한 번이라도 토글했나. 늦게 도착한 defaultCollapsed 가 그것을 덮지 않게 막는다. */
  #toggled = false;

  get #controlled(): boolean {
    return this.open !== undefined;
  }

  get #isOpen(): boolean {
    return this.open ?? !this.#innerCollapsed;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    warnIfTokensMissing();
    warnPropertyOnlyAttributes(this, { open: "default-collapsed" });
  }

  /*
    씨앗을 firstUpdated 가 아니라 여기서 심는다.

    customElements.define 은 모듈 평가 시점이라 hydrateRoot 보다 먼저다. 첫
    업데이트는 마이크로태스크로 예약되는데 그것이 하이드레이션 커밋의
    useLayoutEffect 보다 먼저 흘러가고, @lit/react 의 createComponent 는 반응형
    프로퍼티를 그 useLayoutEffect 에서만 설정한다. firstUpdated 로 한 번만 읽으면
    그 시점의 defaultCollapsed 는 아직 false 이고, 뒤늦게 true 가 들어와도 다시
    돌지 않는다 — default-collapsed 가 React 소비자에게 조용히 무시된다.

    #toggled 가 있어 사용자가 손댄 뒤에는 늦게 온 값이 그 조작을 덮지 않는다.
  */
  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has("defaultCollapsed") && !this.#toggled) {
      this.#innerCollapsed = this.defaultCollapsed;
    }
  }

  override render() {
    const open = this.#isOpen;
    return html`
      <div role="group" aria-label=${this.heading}>
        ${this.collapsible
          ? html`
              <button
                class="heading"
                type="button"
                aria-expanded=${open ? "true" : "false"}
                aria-controls="list"
                @click=${this.#onToggle}
              >
                <span class="row">
                  <span class="text">${this.heading}</span>
                  <ns-icon
                    class=${open ? "caret" : "caret closed"}
                    name="chevron-down"
                  ></ns-icon>
                </span>
              </button>
            `
          : html`<div class="heading">${this.heading}</div>`}
        <div id="list" class=${this.collapsible && !open ? "list collapsed" : "list"}>
          <slot></slot>
        </div>
      </div>
    `;
  }

  #onToggle = (): void => {
    const next = !this.#isOpen;
    this.#toggled = true;

    /*
      제어 중이면 그 값을 바꾸지 않는다. 이벤트는 양쪽 모두 낸다.
      #innerCollapsed 는 반응형 프로퍼티가 아니므로 갱신을 직접 요청한다.
    */
    if (!this.#controlled) {
      this.#innerCollapsed = !next;
      this.requestUpdate();
    }

    const detail: NsGroupToggleDetail = { open: next };
    this.dispatchEvent(
      new CustomEvent("ns-group-toggle", { detail, bubbles: true, composed: true }),
    );
  };
}

register("ns-nav-group", NsNavGroup);

declare global {
  interface HTMLElementTagNameMap {
    "ns-nav-group": NsNavGroup;
  }
}
