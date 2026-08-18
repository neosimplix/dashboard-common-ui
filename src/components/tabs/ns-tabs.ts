import { ReactiveElement } from "lit";
import { property } from "lit/decorators.js";

import { register } from "../../internal/register.js";
import { warnIfTokensMissing } from "../../internal/warn-missing-tokens.js";
import { warnPropertyOnlyAttributes } from "../../internal/warn-property-only.js";
import type { NsTabChangeDetail } from "../../types.js";

/**
 * 탭 버튼에 붙는 `id`. 패널의 `aria-labelledby` 가 이 값을 가리켜야 한다.
 *
 * `data-ns-panel` 에서 파생시키는 이유: 쓰는 쪽이 두 문자열을 따로 관리하면
 * 반드시 어긋난다. 패널 id 는 한 페이지에서 유일하므로 이 파생값도 유일하다.
 */
export function tabIdFor(panelId: string): string {
  return `${panelId}-tab`;
}

/**
 * 탭 줄. **탭 버튼을 렌더하지 않는다** — 소비자가 쓴 마크업에 ARIA 와 키보드만
 * 얹는다. `ns-table` 이 셀을 렌더하지 않는 것과 같은 자리다.
 *
 * 소비자가 쓰는 것:
 * ```html
 * <ns-tabs aria-label="관리자 목록" default-active="live">
 *   <button type="button" data-ns-tab="live" data-ns-panel="panel-live">운영 중</button>
 * </ns-tabs>
 * ```
 *
 * **shadow root 를 두지 않는다.** 이 컴포넌트는 자기 마크업을 하나도 렌더하지
 * 않으므로 캡슐화할 것이 없고, shadow 를 두면 얻는 것 없이 실패 경로만 생긴다 —
 * `LitElement` 처럼 템플릿을 렌더하면 소비자가 쓴 버튼이 덮이고, `<slot>` 없는
 * shadow root 는 그 버튼을 가린다. 둘 다 에러 없이 빈 탭 줄이 된다.
 * 곁들여, 전역 스타일시트인 `controls.css` 는 shadow 안에 닿지 않으므로 shadow
 * 안에 무언가를 그리는 순간 그 스타일을 컴포넌트에 다시 적어야 한다.
 *
 * (`aria-controls` 는 이 결정의 근거가 아니다. 슬롯을 쓰면 탭 버튼은 문서 트리에
 * 그대로 남으므로 IDREF 도 `ns-tabs [data-ns-tab]` 선택자도 계속 해석된다.)
 */
export class NsTabs extends ReactiveElement {
  /*
    Light DOM 이다. 실패 경로가 둘이고 이 재정의가 둘 다 막는다 —
    ReactiveElement 를 상속해 렌더 파이프라인을 갖지 않고(소비자 자식을 덮어쓰지
    않는다), this 를 반환해 shadow root 를 만들지 않는다(자식이 가려지지 않는다).
    둘 다 에러 없이 빈 탭 줄이 된다.

    부수 효과로 static styles 가 무시된다. 스타일은 전부 controls.css 에 있고
    이 컴포넌트에 .styles.ts 파일이 없다.
  */
  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  /**
   * 제어 모드의 활성 탭. `undefined` 면 비제어다.
   *
   * 속성이 아니라 프로퍼티 전용인 이유는 ns-dialog 의 `open` 과 같다 —
   * `<ns-tabs active="live">` 라고 쓰면 제어 모드로 들어가 컴포넌트가 스스로
   * 탭을 바꾸지 못한다. 순수 HTML 은 `default-active` 를 쓴다.
   *
   * **그래서 그 속성은 무시된다** — 관찰되지 않으므로 제어 모드로 들어가지도
   * 않는다. 붙어 있으면 connectedCallback 이 경고한다.
   */
  @property({ attribute: false }) active?: string;

  /** 비제어 초기 탭. 비어 있으면 첫 번째 탭이다. */
  @property({ type: String, attribute: "default-active" }) defaultActive = "";

  #innerActive = "";
  #observer?: MutationObserver;

  /*
    평생 한 번만 켜진다. ns-pagination 의 #warnedPage, ns-table 의
    #warnedHalfControlled 와 같은 관용구다 — 렌더마다 다시 경고하면 스팸이 되고,
    다른 진단과 플래그를 공유하면 먼저 일어난 쪽이 나머지를 막는다.
  */
  #warnedNoMatch = false;

  get #controlled(): boolean {
    return this.active !== undefined;
  }

  /**
   * 이 인스턴스가 소유한 탭 버튼들.
   *
   * Light DOM 이라 경계가 없다 — closest 로 소유를 확인하지 않으면 중첩된
   * ns-tabs 의 버튼이 바깥 인스턴스에게도 보인다.
   */
  get #tabs(): HTMLElement[] {
    return [...this.querySelectorAll<HTMLElement>("[data-ns-tab]")].filter(
      (el) => el.closest("ns-tabs") === this,
    );
  }

  #idOf(el: HTMLElement): string {
    return el.dataset.nsTab ?? "";
  }

  /** 지금 활성인 탭의 id. 지목된 것이 목록에 없으면 첫 번째 탭이다. */
  get #current(): string {
    const tabs = this.#tabs;
    if (tabs.length === 0) return "";
    const wanted = this.active ?? this.#innerActive;
    if (tabs.some((el) => this.#idOf(el) === wanted)) return wanted;

    const fallback = this.#idOf(tabs[0]);

    /*
      폴백 자체는 바꾸지 않고 들리게만 한다. 조용히 두면 고장이 이렇게 보인다 —
      첫 번째 탭이 선택된 채로 그려지는데 **그 탭을 눌러도 아무 일도 일어나지
      않는다.** #select 가 id === #current 에서 조기 반환하므로 이벤트가 나가지
      않고, 소비자 상태는 영원히 어긋난 값에 머문다. 다른 탭을 먼저 눌러야
      빠져나온다. 화살표 키는 도는 것이 이것을 더 임의적으로 보이게 한다.

      빈 문자열은 지목이 아니다 — 비제어 기본값(첫 번째 탭)을 뜻하므로 거른다.

      ns-pagination 이 범위를 벗어난 page 에, ns-table 이 반쪽 제어에 하는 것과
      같은 자리다. 알리기만 하고 소비자 상태를 교정하지 않는다.
    */
    if (wanted !== "" && !this.#warnedNoMatch) {
      this.#warnedNoMatch = true;
      console.warn(
        this.#controlled
          ? `[ns-tabs] active="${wanted}" 와 일치하는 data-ns-tab 이 없습니다. 첫 번째 탭 "${fallback}" 을 표시하지만 그 탭을 눌러도 ns-tab-change 가 나가지 않습니다. 대소문자까지 맞는지 확인하세요.`
          : `[ns-tabs] 활성 탭 "${wanted}" 와 일치하는 data-ns-tab 이 없습니다. 첫 번째 탭 "${fallback}" 을 표시합니다. default-active 값이 data-ns-tab 과 맞는지 확인하세요.`,
      );
    }

    return fallback;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    warnIfTokensMissing();
    warnPropertyOnlyAttributes(this, { active: "default-active" });

    /*
      호스트에 속성을 쓴다. 불변 규칙("호스트의 속성을 쓰지 않는다")의 좁은
      예외다 — ARIA 의 tablist↔tab 소유 관계는 DOM 부모여야 해서 이 role 을 둘
      곳이 호스트밖에 없다.

      규칙이 막으려던 것은 "소비자가 쓴 속성을 덮어 문서화된 override 를 조용히
      죽이는 것" 이므로, 이미 role 이 있으면 건드리지 않아 그 성질을 지킨다.
      aria-label 은 소비자가 직접 쓴다 — 우리가 관리할 이유가 없다.
    */
    if (!this.hasAttribute("role")) this.setAttribute("role", "tablist");

    // 위임이라 소비자가 탭을 다시 그려도 리스너를 다시 붙일 필요가 없다.
    this.addEventListener("click", this.#onClick);
    this.addEventListener("keydown", this.#onKeyDown);

    /*
      updated() 는 반응형 프로퍼티가 바뀔 때만 돈다. 소비자가 탭 목록을 바꾸면
      새 버튼에 role·aria-selected·tabindex 가 쓰이지 않고 다음 상호작용까지
      조용히 낡는다.

      attributes 는 관찰하지 않는다. #sync 가 setAttribute 를 쓰므로 관찰했다면
      자기 쓰기에 다시 깨어나 루프가 된다. ns-table 과 같은 배선이다.
    */
    this.#observer = new MutationObserver(() => this.#sync());
    this.#observer.observe(this, { childList: true, subtree: true });
  }

  override disconnectedCallback(): void {
    this.removeEventListener("click", this.#onClick);
    this.removeEventListener("keydown", this.#onKeyDown);
    this.#observer?.disconnect();
    super.disconnectedCallback();
  }

  /*
    비제어 초기값을 seed 한다. ns-pagination 과 달리 firstUpdated 로 충분하다 —
    이 컴포넌트는 render 를 갖지 않으므로 DOM 쓰기가 전부 updated() 에서 일어나고
    그것은 firstUpdated 다음이다. ns-table 과 같은 자리다.

    덮어쓰지 않고 seed 만 한다. Lit 은 첫 업데이트를 마이크로태스크로 미루므로,
    생성과 같은 태스크에서 프로퍼티를 만진 코드가 여기보다 먼저 실행된다.
  */
  protected override firstUpdated(): void {
    if (this.defaultActive !== "") this.#innerActive = this.defaultActive;
  }

  protected override updated(): void {
    this.#sync();
  }

  /** 소비자 DOM 에 ARIA 와 roving tabindex 를 쓴다. 멱등이다. */
  #sync(): void {
    const current = this.#current;
    for (const el of this.#tabs) {
      const id = this.#idOf(el);
      const panel = el.dataset.nsPanel ?? "";
      el.setAttribute("role", "tab");
      // 소비자가 직접 쓴 id 를 덮지 않는다.
      if (!el.hasAttribute("id") && panel !== "") el.setAttribute("id", tabIdFor(panel));
      if (panel !== "") el.setAttribute("aria-controls", panel);
      el.setAttribute("aria-selected", id === current ? "true" : "false");
      /*
        roving tabindex. 활성 탭만 Tab 키로 닿고 나머지는 화살표로 간다 —
        전부 0 이면 탭이 다섯 개일 때 Tab 을 다섯 번 눌러야 패널에 닿는다.
      */
      el.setAttribute("tabindex", id === current ? "0" : "-1");
    }
  }

  #select(id: string, focus: boolean): void {
    if (id === "") return;
    if (id === this.#current) {
      if (focus) this.#focus(id);
      return;
    }

    if (!this.#controlled) {
      this.#innerActive = id;
      this.requestUpdate();
    }

    const detail: NsTabChangeDetail = { id };
    this.dispatchEvent(
      new CustomEvent("ns-tab-change", { detail, bubbles: true, composed: true }),
    );

    /*
      제어 모드에서 소비자가 active 를 바꾸지 않으면 업데이트가 일어나지 않아
      #sync 가 돌지 않는다. 화살표 이동은 그 자리에서 포커스를 옮겨야 하므로
      직접 부른다 — 비제어에서는 위 requestUpdate 가 한 번 더 부르지만 멱등이다.
    */
    this.#sync();
    if (focus) this.#focus(id);
  }

  #focus(id: string): void {
    this.#tabs.find((el) => this.#idOf(el) === id)?.focus();
  }

  /** 이벤트가 우리 탭에서 났으면 그 요소, 아니면 null. */
  #tabFrom(target: EventTarget | null): HTMLElement | null {
    const el = (target as Element | null)?.closest?.("[data-ns-tab]") ?? null;
    if (el === null || el.closest("ns-tabs") !== this) return null;
    return el as HTMLElement;
  }

  #onClick = (e: MouseEvent): void => {
    const el = this.#tabFrom(e.target);
    if (el === null) return;
    this.#select(this.#idOf(el), false);
  };

  /*
    자동 활성화 패턴. 화살표를 누르면 포커스와 선택이 함께 움직인다 — 탭 전환이
    싼 화면이라 이 패턴이 맞다. 목록 끝에서는 반대쪽으로 순환한다.

    **기준점은 키가 발생한 탭이지 선택된 탭이 아니다.** 둘은 제어 모드에서
    갈라진다 — 소비자가 ns-tab-change 를 무시하거나 비동기로 미루면 포커스는
    옆 탭으로 갔는데 #current 는 그대로다. 선택된 탭을 기준으로 세면 다음
    화살표가 같은 곳을 다시 골라 포커스가 한 칸 옆에 영영 갇히고, 그 사이
    DOM 포커스는 tabindex="-1" 인 요소에 앉아 이 코드가 지키려는 roving
    tabindex 규약 자체가 깨진다. 비제어에서는 둘이 일치하므로 차이가 없다.
  */
  #onKeyDown = (e: KeyboardEvent): void => {
    // 탭이 아닌 자식(소비자가 넣은 무언가)에서 난 화살표는 흘린다.
    const from = this.#tabFrom(e.target);
    if (from === null) return;

    const tabs = this.#tabs;
    const index = tabs.indexOf(from);
    // 기준점이 없으면 화살표를 삼키지 않는다.
    if (index === -1) return;

    const at = (next: number): void => {
      e.preventDefault();
      this.#select(this.#idOf(tabs[(next + tabs.length) % tabs.length]), true);
    };

    if (e.key === "ArrowRight") at(index + 1);
    else if (e.key === "ArrowLeft") at(index - 1);
    else if (e.key === "Home") at(0);
    else if (e.key === "End") at(tabs.length - 1);
  };
}

register("ns-tabs", NsTabs);

declare global {
  interface HTMLElementTagNameMap {
    "ns-tabs": NsTabs;
  }
}
