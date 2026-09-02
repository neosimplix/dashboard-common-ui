import { LitElement, html, type PropertyValues } from "lit";
import { property } from "lit/decorators.js";

import { register } from "../../internal/register.js";
import { warnIfTokensMissing } from "../../internal/warn-missing-tokens.js";
import { warnPropertyOnlyAttributes } from "../../internal/warn-property-only.js";
import { styles } from "./ns-sidebar.styles.js";

/**
 * 네비게이션 컨테이너. 열리면 `ns-nav-group` 이 세로로 이어지고 닫히면 사라진다.
 *
 * ```html
 * <ns-sidebar default-open>
 *   <ns-nav-group heading="관리">
 *     <ns-nav-group heading="사용자" collapsible>
 *       <ns-nav-item href="/users" label="목록"></ns-nav-item>
 *     </ns-nav-group>
 *     <ns-nav-item href="/logs" label="로그"></ns-nav-item>
 *   </ns-nav-group>
 * </ns-sidebar>
 * ```
 *
 * **0.5.0 개발 중에 레일 모델을 만들었다가 물렀다.** 4rem 레일에 그룹마다 한 글자
 * 타일을 쌓는 방식이었는데 그것이 무엇인지 읽히지 않았다. 경위는
 * `docs/gotchas.md` 에 있다.
 */
export class NsSidebar extends LitElement {
  static override styles = styles;

  /**
   * 제어 모드. `undefined` 면 비제어다.
   *
   * 속성이 아니라 프로퍼티 전용이다. 겸용했다면 `<ns-sidebar open>` 이 boolean
   * 속성으로 읽혀 **제어 모드로 굳는다** — 마크업에 초기 상태를 적으려던 소비자가
   * 자기도 모르게 제어 모드에 들어가고, 그 뒤로는 `el.open` 을 대입하는 코드를
   * 쓰지 않는 한 사이드바가 그 값에 고정된다. 순수 HTML 소비자가 쓸 것은
   * `default-open` 이다. (`ns-dialog` 에서는 같은 겸용이 "스스로 닫지 못한다" 로
   * 드러난다. 이쪽은 자기 토글 경로가 애초에 없어 증상이 다르다.)
   *
   * **그래서 그 속성은 무시된다** — 관찰되지 않으므로 제어 모드로 들어가지도
   * 않는다. `connectedCallback` 이 경고한다.
   */
  @property({ attribute: false }) open?: boolean;

  /**
   * 비제어 초기값. 있으면 열린 채로 시작한다.
   *
   * 기본이 닫힘이므로 **기본값에서 벗어나는 쪽**이 속성 이름이다. `ns-dialog` 와
   * 같고, `ns-nav-group` 의 `default-collapsed` 와 반대로 보이지만 규칙은 같다 —
   * 그쪽은 기본이 펼침이었다.
   *
   * **레일이 없어 이 컴포넌트는 스스로 토글하지 않는다.** 그래서 비제어
   * 모드에서 사용자 상호작용으로 여닫히는 경로가 아예 없고, 이 값을 지키던
   * 가드(`#toggled`)도 지킬 대상이 없어져 지웠다 — 나중에 이 값을 바꾸면
   * 그대로 다시 반영된다. 사실상 비제어 모드는 **초기값 하나로 시작해서
   * 계속 그 값을 따라가는 것**이고, "나중에 소비자가 상호작용으로 연 것을
   * `defaultOpen` 변경이 덮어쓴다" 는 걱정을 할 필요가 없다.
   */
  @property({ type: Boolean, attribute: "default-open" }) defaultOpen = false;

  /** 비제어일 때의 진실. */
  #innerOpen = false;

  get #isOpen(): boolean {
    return this.open ?? this.#innerOpen;
  }

  /** 여닫기 배선 경고 타이머. 분리되면 취소한다. */
  #wiringWarnTimer: ReturnType<typeof setTimeout> | undefined;

  override connectedCallback(): void {
    super.connectedCallback();
    warnIfTokensMissing();
    warnPropertyOnlyAttributes(this, { open: "default-open" });

    /*
      open 도 default-open 도 없으면 #isOpen 이 영원히 false 라 열 방법이 없다.
      거의 언제나 배선 실수다.

      매크로태스크로 미루는 이유는 위 willUpdate 주석과 같다 — @lit/react 의
      createComponent 는 반응형 프로퍼티를 useLayoutEffect 에서만 설정하고,
      customElements.define 이 hydrateRoot 보다 먼저 실행되므로 그 useLayoutEffect
      는 첫 업데이트의 마이크로태스크보다 뒤에 온다. connectedCallback 이나
      firstUpdated 에서 즉시 재면 그 사이 창에서 React 소비자가 전부 거짓 양성이
      된다 — open 을 나중에 프로퍼티로 세울 참인데 아직 세우지 못했을 뿐이다.

      판정에 다른 컴포넌트를 보지 않는다. ns-toggle 은 ns-header 만 내므로
      그것을 기다리면 "어느 헤더가 어느 사이드바를 겨냥하는가" 가 되살아난다 —
      철회한 교차 검사가 이름만 바꿔 돌아오는 셈이다. 자기 프로퍼티 둘로 충분하다.
    */
    this.#wiringWarnTimer = setTimeout(() => {
      if (this.open === undefined && !this.hasAttribute("default-open")) {
        console.warn(
          "[ns-sidebar] open 도 default-open 도 없어 이 사이드바는 열 수 없습니다. " +
            "제어하려면 open 프로퍼티를, 비제어로 열어 두려면 default-open 속성을 씁니다.",
        );
      }
    }, 0);
  }

  override disconnectedCallback(): void {
    clearTimeout(this.#wiringWarnTimer);
    super.disconnectedCallback();
  }

  /*
    씨앗을 firstUpdated 가 아니라 여기서 심는다. customElements.define 이
    hydrateRoot 보다 먼저 실행되므로 첫 업데이트의 마이크로태스크가 하이드레이션
    커밋의 useLayoutEffect 보다 먼저 흘러가고, @lit/react 의 createComponent 는
    반응형 프로퍼티를 그 useLayoutEffect 에서만 설정한다. firstUpdated 로 한 번만
    읽으면 React 소비자에게 default-open 이 조용히 무시된다.

    대입 전에 좁히는 이유는 반응형 프로퍼티의 필드 기본값이 소비자의 undefined
    대입에 지워지기 때문이다 — shim 의 선택 프롭이 주어지지 않으면 값이 undefined
    이고 createComponent 는 그것을 그대로 대입한다. 좁히지 않으면 #isOpen 이
    undefined 가 되고, **toggleAttribute 의 두 번째 인자가 undefined 면 지우는
    것이 아니라 뒤집는다.**
  */
  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has("defaultOpen")) {
      this.#innerOpen = this.defaultOpen === true;
    }
  }

  /*
    호스트에 속성을 쓴다. 불변 규칙("호스트의 속성을 쓰지 않는다")의 좁은
    예외다 — open 이 프로퍼티 전용이라 CSS 가 볼 속성이 없는데, 폭은 :host 에
    있어야 한다(소비자가 ns-sidebar { width: … } 로 덮을 자리를 남기려면).

    규칙이 막으려던 것은 소비자가 쓴 속성을 덮는 것이고, 소비자가 쓰는 이름은
    default-open 이다. 이 이름을 마크업에 쓰는 것은 라이브러리와 그 shim 뿐이고
    (Sidebar.tsx 가 제어 모드에서 SSR 마크업에 싣는다. 이 저장소의 guide.html 이
    순수 HTML 제어 모드에서 같은 짝을 손으로 적는 것은 그 shim 을 흉내 낸 것이다),
    거기 실린 값은 구조상 이 updated() 가 쓸 값과 같으므로 덮을 값이 애초에 없다.
    ns-toast 의 position 과 같은 형태의 예외이고, 성립 근거는 "아무도 그 이름을
    쓰지 않는다" 가 아니라 "쓰는 쪽이 같은 값을 쓴다" 다.
  */
  protected override updated(): void {
    this.toggleAttribute("data-ns-open", this.#isOpen);
  }

  override render() {
    return html`<nav><slot></slot></nav>`;
  }
}

register("ns-sidebar", NsSidebar);

declare global {
  interface HTMLElementTagNameMap {
    "ns-sidebar": NsSidebar;
  }
}
