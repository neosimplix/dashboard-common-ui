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
 * **shadow 로 만들 수 없다.** `aria-controls` 는 IDREF 라 shadow 경계를 넘지
 * 못해서, 탭이 패널을 가리키는 연결이 에러 없이 끊긴다.
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
    return tabs.some((el) => this.#idOf(el) === wanted) ? wanted : this.#idOf(tabs[0]);
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
  */
  #onKeyDown = (e: KeyboardEvent): void => {
    // 탭이 아닌 자식(소비자가 넣은 무언가)에서 난 화살표는 흘린다.
    if (this.#tabFrom(e.target) === null) return;

    const tabs = this.#tabs;
    const index = tabs.findIndex((el) => this.#idOf(el) === this.#current);
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
