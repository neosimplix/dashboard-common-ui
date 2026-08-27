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

  /** 그룹 제목. `[role="group"]` 의 `aria-label` 로도 실린다. */
  @property({ type: String }) heading = "";

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

  /**
   * 조상에 다른 `ns-nav-group` 이 있나. 하위 카테고리로 그려질지를 정한다.
   *
   * **CSS 로는 알 수 없다.** shadow 안에서 조상을 보는 수단은 `:host-context()`
   * 하나인데 Chromium 전용이라 금지돼 있고, 부모 그룹의 shadow 에서
   * `::slotted(ns-nav-group)` 으로 자식 호스트에 `padding-left` 를 주는 길은
   * 문서 트리 규칙이 shadow 규칙을 이기므로(외곽 트리 우선) Tailwind preflight
   * 의 `* { padding: 0 }` 이 지운다. `:host` 에 박스를 두지 못하는 것과 같은
   * 함정이다. 그래서 판정은 JS 가 하고 들여쓰기는 자기 shadow 안에서 건다.
   */
  #nested = false;

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

    /*
      parentElement 부터 closest 로 올라가므로 소비자가 중간에 <div> 로 감싸도
      잡히고, 바깥 그룹이 아직 upgrade 되지 않았어도 태그 이름만 보므로 잡힌다.
      순수 HTML 파싱 · React 렌더 · createElement 후 append 세 경로가 모두
      덮인다.

      connectedCallback 이 첫 렌더보다 먼저이므로 잘못된 모양이 한 프레임도
      나가지 않는다. 요소를 옮기면 다시 불려 재판정되므로 MutationObserver 가
      필요 없다.
    */
    const nested = this.parentElement?.closest("ns-nav-group") != null;
    if (nested !== this.#nested) {
      this.#nested = nested;
      // 반응형 프로퍼티가 아니므로 갱신을 직접 요청한다.
      this.requestUpdate();
    }
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
      <div role="group" aria-label=${this.heading} class=${this.#nested ? "nested" : ""}>
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
