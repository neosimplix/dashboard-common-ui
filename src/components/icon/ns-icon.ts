import { LitElement, html, nothing } from "lit";
import { property } from "lit/decorators.js";

import { register } from "../../internal/register.js";
import { warnIfTokensMissing } from "../../internal/warn-missing-tokens.js";
import { icons } from "./icons.js";
import { styles } from "./ns-icon.styles.js";

export class NsIcon extends LitElement {
  static override styles = styles;

  /**
   * 스프라이트의 키.
   *
   * 자식을 넣으면 그것이 이긴다 — 이 프로퍼티는 슬롯 폴백이므로 자식이 있을 때는
   * 읽히지 않는다. 없는 이름이면 아무것도 그리지 않고 한 번 경고한다.
   */
  @property({ type: String }) name = "";

  #warned = "";

  override connectedCallback(): void {
    super.connectedCallback();
    warnIfTokensMissing();
  }

  override render() {
    /*
      기본 슬롯의 폴백으로 스프라이트를 둔다.

      자식이 있으면 브라우저가 폴백을 렌더하지 않는다 — 분기가 CSS 도 JS 도 아닌
      슬롯 배정 규칙이므로 우리가 셀 것이 없고, 소비자도 "아이콘을 넣었으면 name 을
      비워라" 같은 조건을 지킬 필요가 없다. ns-nav-item 의 leading/badge 와 같은 형태다.

      크기는 여기서 정해지지 않는다. ::slotted 규칙이 --ns-icon-size 로 정규화하므로
      lucide-react 처럼 자기 width/height 를 갖고 오는 것도 이 상자에 맞춰진다.
    */
    return html`<slot>${this.#sprite()}</slot>`;
  }

  #sprite() {
    /*
      name 이 빈 문자열인 것은 잘못이 아니다 — 아직 아이콘을 정하지 않은 자리다.
      경고 없이 조용히 비운다.
    */
    if (this.name === "") return nothing;

    const def = icons[this.name];
    if (!def) return nothing;

    /*
      aria-hidden 을 호스트가 아니라 이 <svg> 에 둔다.

      호스트에 붙이면 소비자가 role="img" aria-label 로 의미를 주려 해도 연결
      시점에 다시 찍혀 요소가 접근성 트리에서 제거된다 — 문서가 안내하는
      override 가 에러 없이 죽는다. 여기 두면 기본은 장식이면서 그 override 가
      그대로 동작하고, 컴포넌트가 소비자 소유의 속성을 건드리지 않는다.

      슬롯으로 들어온 것에는 이 방어가 없다. 소비자 소유의 요소이므로 접근성도
      소비자 몫이다 — lucide-react 는 스스로 aria-hidden 을 붙인다.
    */
    return html`<svg viewBox=${def.viewBox} fill="none" aria-hidden="true">${def.content}</svg>`;
  }

  /*
    경고를 render() 가 아니라 여기서 낸다.

    render() 시점에는 슬롯이 아직 shadow 에 들어가지 않아 배정을 물어볼 수 없고,
    그러면 자식을 넣은 소비자에게 "없는 아이콘" 경고를 잘못 찍는다. updated() 는
    shadow 가 쓰인 뒤라 assignedNodes() 가 확정돼 있다.
  */
  override updated(): void {
    const assigned = this.renderRoot.querySelector("slot")?.assignedNodes() ?? [];

    /*
      요소가 하나라도 있으면 소비자가 자기 아이콘을 넣은 것이다. name 은 읽히지
      않으므로 그 값이 무엇이든 경고하지 않는다.
    */
    if (assigned.some((node) => node.nodeType === Node.ELEMENT_NODE)) return;

    /*
      배정된 것이 공백 텍스트뿐인 경우. 기본 슬롯은 공백 텍스트 노드도 배정받고,
      배정이 하나라도 있으면 브라우저가 폴백을 렌더하지 않는다. 즉

        <ns-icon name="menu">
        </ns-icon>

      는 줄바꿈 하나 때문에 아이콘이 사라진다. 막을 방법이 없으므로 — 명명 슬롯이면
      공백이 기본 슬롯으로 가서 안전하지만 그러면 소비자가 slot 속성을 써야 한다 —
      조용히 비는 대신 시끄럽게 만든다. 이 저장소가 겪은 고장은 전부 조용한 쪽이었다.
    */
    if (assigned.length > 0) {
      this.#warn(
        `공백-${this.name}`,
        `[ns-icon] 공백만 든 자식이 슬롯을 채워 name="${this.name}" 폴백이 그려지지 않았다. ` +
          `<ns-icon name="${this.name}"></ns-icon> 처럼 안쪽을 붙여 쓴다.`,
      );
      return;
    }

    if (this.name !== "" && !icons[this.name]) {
      this.#warn(
        `없음-${this.name}`,
        `[ns-icon] 없는 아이콘: "${this.name}". 사용 가능: ${Object.keys(icons).join(", ")}. ` +
          `registerIcons() 로 더하거나, 자식으로 직접 넣는다 — ` +
          `<ns-icon><MyIcon /></ns-icon> 는 name 없이 동작한다.`,
      );
    }
  }

  /** 같은 사유로 리렌더될 때마다 찍지 않는다. */
  #warn(key: string, message: string): void {
    if (this.#warned === key) return;
    this.#warned = key;
    console.warn(message);
  }
}

register("ns-icon", NsIcon);

declare global {
  interface HTMLElementTagNameMap {
    "ns-icon": NsIcon;
  }
}
