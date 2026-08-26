import { LitElement, html, nothing, type PropertyValues } from "lit";
import { property } from "lit/decorators.js";

import { register } from "../../internal/register.js";
import { warnIfTokensMissing } from "../../internal/warn-missing-tokens.js";
import { warnPropertyOnlyAttributes } from "../../internal/warn-property-only.js";
import type { NsNavGroup } from "../nav-group/ns-nav-group.js";

// 타일 폴백이 <ns-icon> 을 쓴다. 등록 부수효과가 필요하다.
import "../icon/ns-icon.js";
import type { NsGroupSelectDetail, NsToggleDetail } from "../../types.js";
import { styles } from "./ns-sidebar.styles.js";

/**
 * 레일 타일 하나가 필요로 하는 것. 직계 자식 그룹에서 읽어 만든다.
 *
 * 그룹 엘리먼트를 그대로 들고 있는 이유는 패널 슬롯에 배정할 대상이 그것이기
 * 때문이다. 수동 배정은 노드 참조를 받는다.
 */
interface RailEntry {
  /** activeGroup 이 가리키는 키. name 이 비면 DOM 순서 인덱스의 문자열이다. */
  key: string;
  /** 타일의 aria-label 과 title. */
  heading: string;
  /** 타일 슬롯이 비었을 때 보이는 것. ns-icon 템플릿이거나 글자다. */
  fallback: unknown;
  /** 패널 슬롯에 배정할 그룹. */
  group: Element;
  /** 타일 슬롯에 배정할 아이콘. 없으면 undefined 다. */
  icon?: Element;
}

/**
 * 네비게이션 컨테이너. **레일과 패널 두 칼럼이다.**
 *
 * 레일은 항상 보이고 직계 자식 `ns-nav-group` 하나마다 타일 하나를 갖는다.
 * 패널은 **선택된 그룹 하나만** 보여주고 `open` 이 거짓이면 사라진다. VS Code
 * 의 활동 바 + 사이드 바 모델이다.
 *
 * ```html
 * <ns-sidebar open>
 *   <ns-icon data-ns-rail="admin">…</ns-icon>
 *   <ns-nav-group name="admin" heading="관리" badge="관"> … </ns-nav-group>
 * </ns-sidebar>
 * ```
 *
 * **`slotAssignment: "manual"` 이라 `slot` 속성이 동작하지 않는다.** 배정은 전부
 * 이 컴포넌트가 한다. 그래서 아이콘의 표시는 `slot=` 이 아니라 `data-ns-rail` 이고,
 * 선택되지 않은 그룹은 숨겨지는 것이 아니라 **배정되지 않아 렌더되지 않는다** —
 * 레이아웃에도 접근성 트리에도 없고, light DOM 에는 그대로 남아 접힘 상태를
 * 계속 들고 있다.
 */
export class NsSidebar extends LitElement {
  static override styles = styles;

  /*
    수동 슬롯 배정. 선택된 그룹만 패널에, 그 그룹의 아이콘만 그 타일에 배정한다.
    자동 배정이었다면 선택되지 않은 그룹을 소비자 DOM 에 속성을 써서 숨겨야 하고,
    그러면 MutationObserver 와 이름 충돌 위험이 함께 온다.

    부수 효과로 사이드바 자식의 공백 텍스트 노드가 무해해진다 — 자동 배정에서는
    기본 슬롯으로 가서 패널에 들어간다.
  */
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    slotAssignment: "manual",
  };

  /**
   * 패널 보임 여부. 거짓이면 레일만 남는다 — 사이드바가 사라지지는 않는다.
   * 컴포넌트가 스스로 바꾸지 않는다 — `ns-header` 의 `ns-toggle` 을 받아
   * 소비자가 내려준다.
   */
  @property({ type: Boolean, reflect: true }) open = false;

  /**
   * 제어 모드의 활성 그룹. `undefined` 면 비제어다.
   *
   * 속성이 아니라 프로퍼티 전용인 이유는 `ns-tabs` 의 `active` 와 같다 —
   * `<ns-sidebar active-group="admin">` 이 속성으로 읽히면 제어 모드로 들어가
   * 컴포넌트가 스스로 그룹을 바꾸지 못한다. 순수 HTML 은 `default-active-group`
   * 을 쓴다.
   *
   * **그래서 그 속성은 무시된다** — 관찰되지 않으므로 제어 모드로 들어가지도
   * 않는다. 붙어 있으면 connectedCallback 이 경고한다.
   */
  @property({ attribute: false }) activeGroup?: string;

  /** 비제어 초기 그룹. 비어 있으면 첫 번째 그룹이다. */
  @property({ type: String, attribute: "default-active-group" }) defaultActiveGroup = "";

  /** 비제어일 때의 진실. */
  #innerActive = "";

  /** 사용자가 한 번이라도 골랐나. 늦게 도착한 defaultActiveGroup 이 그것을 덮지 않게 막는다. */
  #selected = false;

  /** 렌더가 읽는 목록. 반응형 프로퍼티가 아니므로 갱신을 직접 요청한다. */
  #entries: RailEntry[] = [];

  #observer?: MutationObserver;

  /*
    평생 한 번만 켜진다. ns-tabs 의 #warnedNoMatch 와 같은 관용구다 — 렌더마다
    다시 경고하면 스팸이 되고, 다른 진단과 플래그를 공유하면 먼저 일어난 쪽이
    나머지를 막는다.
  */
  #warnedNoMatch = false;
  #warnedNoName = false;
  #warnedDupName = false;

  get #controlledGroup(): boolean {
    return this.activeGroup !== undefined;
  }

  /**
   * 지금 패널에 있는 항목. 지목된 것이 목록에 없으면 첫 번째다.
   *
   * 제어 모드에서도 폴백한다. `ns-tabs` 와 같은 자리다 — 표시만 폴백하고 소비자
   * 상태를 교정하지 않으며, 경고가 "첫 그룹을 보여주지만 그 타일을 눌러도
   * ns-group-select 가 나가지 않는다" 를 알린다.
   */
  get #activeEntry(): RailEntry | undefined {
    const entries = this.#entries;
    if (entries.length === 0) return undefined;

    const wanted = this.activeGroup ?? this.#innerActive;
    const found = entries.find((e) => e.key === wanted);
    if (found !== undefined) return found;

    const fallback = entries[0];

    // 빈 문자열은 지목이 아니다 — 비제어 기본값(첫 그룹)을 뜻하므로 거른다.
    if (wanted !== "" && !this.#warnedNoMatch) {
      this.#warnedNoMatch = true;
      console.warn(
        this.#controlledGroup
          ? `[ns-sidebar] activeGroup="${wanted}" 와 일치하는 ns-nav-group[name] 이 없습니다. 첫 그룹 "${fallback.key}" 을 보여주지만 그 타일을 눌러도 ns-group-select 가 나가지 않습니다. 대소문자까지 맞는지 확인하세요.`
          : `[ns-sidebar] 활성 그룹 "${wanted}" 와 일치하는 ns-nav-group[name] 이 없습니다. 첫 그룹 "${fallback.key}" 을 보여줍니다. default-active-group 값이 name 과 맞는지 확인하세요.`,
      );
    }

    return fallback;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    warnIfTokensMissing();
    warnPropertyOnlyAttributes(this, { "active-group": "default-active-group" });

    this.#syncGroups();

    /*
      childList 는 그룹이 늘고 줄는 것을, attributeFilter 는 레일이 읽는 네 값이
      바뀌는 것을 본다. 수동 배정에서는 자식이 바뀌어도 배정이 자동으로 변하지
      않으므로 slotchange 가 발생하지 않는다 — 이 관찰자가 유일한 신호다.

      **subtree 가 없으면 attributes 절반이 죽는다.** MutationObserver 의
      attributes 는 관찰 대상 노드 **자신의** 속성만 보므로, subtree 없이는
      호스트의 속성을 볼 뿐 자식 그룹의 heading 이 바뀌는 것을 보지 못한다.

      **불변 규칙의 "attributes 는 켜지 않는다" 와 어긋나지 않는다.** 그 규칙이
      막으려는 것은 동기화가 setAttribute 를 쓰므로 자기 쓰기에 재발동해 루프가
      되는 것인데, 여기서 하는 동기화는 slot.assign() 이고 자식의 속성을 쓰지
      않는다. attributeFilter 가 대상을 우리가 쓰지 않는 이름들로 못박아 그
      성질을 코드에 남긴다.
    */
    this.#observer = new MutationObserver(() => this.#syncGroups());
    this.#observer.observe(this, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["name", "heading", "icon", "badge", "data-ns-rail"],
    });
  }

  override disconnectedCallback(): void {
    this.#observer?.disconnect();
    this.#observer = undefined;
    super.disconnectedCallback();
  }

  /*
    씨앗을 firstUpdated 가 아니라 여기서 심는다. ns-nav-group 의
    defaultCollapsed 와 정확히 같은 이유다 — customElements.define 이
    hydrateRoot 보다 먼저 실행되므로 첫 업데이트의 마이크로태스크가 하이드레이션
    커밋의 useLayoutEffect 보다 먼저 흘러가고, @lit/react 의 createComponent 는
    반응형 프로퍼티를 그 useLayoutEffect 에서만 설정한다. firstUpdated 로 한 번만
    읽으면 React 소비자에게 default-active-group 이 조용히 무시된다.
  */
  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has("defaultActiveGroup") && !this.#selected) {
      this.#innerActive = this.defaultActiveGroup;
    }
  }

  override render() {
    const entries = this.#entries;
    const active = this.#activeEntry;

    return html`
      <div class="shell">
        <div class="rail" role="tablist" aria-orientation="vertical">
          ${entries.map((entry) => this.#tile(entry, entry === active))}
        </div>
        <nav class="panel">
          <!--
            role="tabpanel" 을 <nav> 에 두지 않는다. role 은 암시적 역할을 덮으므로
            얹으면 navigation 랜드마크가 사라진다 — 네비게이션 사이드바에서 그것은
            잃어도 되는 것이 아니다. 안쪽 <div> 가 tabpanel 을 지고 aria-labelledby
            로 활성 타일을 가리켜 패널에 이름이 붙는다(그 이름이 그룹의 heading 이다).
          -->
          <div
            id="panel"
            role="tabpanel"
            aria-labelledby=${active === undefined ? nothing : `tile-${active.key}`}
          >
            <slot class="panel-slot"></slot>
          </div>
        </nav>
      </div>
    `;
  }

  #tile(entry: RailEntry, isActive: boolean) {
    /*
      패널이 닫혀 있으면 선택된 타일이 없다 — VS Code 가 사이드 바를 숨겼을 때와
      같다. roving tabindex 는 그것과 무관하게 활성 항목을 따라간다. 둘이 갈라져야
      패널이 닫혀도 레일에 Tab 으로 닿을 수 있다.
    */
    const selected = isActive && this.open;
    return html`
      <button
        id=${`tile-${entry.key}`}
        class=${selected ? "tile selected" : "tile"}
        type="button"
        role="tab"
        aria-selected=${selected ? "true" : "false"}
        aria-controls="panel"
        aria-label=${entry.heading}
        title=${entry.heading}
        tabindex=${isActive ? "0" : "-1"}
        data-name=${entry.key}
        @click=${() => this.#onTile(entry.key)}
      >
        <span class="tile-body">
          <slot class="tile-slot" data-name=${entry.key}>${entry.fallback}</slot>
        </span>
      </button>
    `;
  }

  /*
    배정은 렌더 다음이어야 한다. 슬롯이 그때 존재한다.

    assign() 을 인자 없이 부르면 배정이 비워진다 — 선택된 그룹이 없거나 그 그룹에
    아이콘이 없는 경우가 그것이다.
  */
  protected override updated(): void {
    const active = this.#activeEntry;

    const panel = this.renderRoot.querySelector<HTMLSlotElement>("slot.panel-slot");
    panel?.assign(...(active === undefined ? [] : [active.group]));

    for (const slot of this.renderRoot.querySelectorAll<HTMLSlotElement>("slot.tile-slot")) {
      const entry = this.#entries.find((e) => e.key === slot.dataset.name);
      slot.assign(...(entry?.icon === undefined ? [] : [entry.icon]));
    }
  }

  /**
   * 직계 자식에서 레일 목록을 다시 만든다.
   *
   * **직계 자식만 본다.** 중첩된 하위 그룹은 그룹의 자식이므로 애초에 보이지
   * 않는다. 그룹이 아닌 자식은 아이콘 표시가 없으면 어디에도 배정되지 않아
   * 렌더되지 않는다.
   */
  #syncGroups(): void {
    const children = [...this.children];

    const icons = new Map<string, Element>();
    for (const el of children) {
      const key = el.getAttribute("data-ns-rail");
      if (key === null || key === "") continue;
      /*
        그룹 자신에 data-ns-rail 을 붙이면 그 그룹이 타일 슬롯으로 가버려 패널이
        빈다. 노드 하나는 슬롯 하나에만 배정되기 때문이다. 걸러내고 경고한다.
      */
      if (el.tagName === "NS-NAV-GROUP") {
        console.warn(
          `[ns-sidebar] data-ns-rail 은 그룹이 아니라 아이콘 요소에 붙입니다. ns-nav-group 에 붙이면 그 그룹이 레일 타일로 가버려 패널이 빕니다.`,
        );
        continue;
      }
      // 같은 키가 둘이면 문서 순서상 첫 번째를 쓴다. getElementById 와 같은 규약이다.
      if (!icons.has(key)) icons.set(key, el);
    }

    const groups = children.filter((el) => el.tagName === "NS-NAV-GROUP");
    const seen = new Set<string>();

    /*
      프로퍼티를 먼저 읽고 속성으로 폴백한다. 둘이 필요한 이유는 타이밍이다 —
      React 는 프로퍼티로 설정하고 반영은 다음 업데이트에서 일어나므로 그 사이
      속성이 낡아 있고, upgrade 전에는 프로퍼티가 없어 속성만 있다.
    */
    const read = (el: Element, prop: "name" | "heading" | "icon" | "badge"): string => {
      const own = (el as Partial<NsNavGroup>)[prop];
      return own ?? el.getAttribute(prop) ?? "";
    };

    this.#entries = groups.map((group, i) => {
      const name = read(group, "name");
      const heading = read(group, "heading");
      const icon = read(group, "icon");
      const badge = read(group, "badge");

      /*
        name 이 없으면 인덱스를 키로 쓴다. 마크업 순서가 바뀌면 상태가 엉뚱한
        그룹을 가리키게 되므로 키로 쓰기 나쁘지만, 화면이 죽는 것보다 낫다.
      */
      if (name === "" && !this.#warnedNoName) {
        this.#warnedNoName = true;
        console.warn(
          `[ns-sidebar] ns-nav-group 에 name 이 없습니다("${heading}"). DOM 순서를 키로 쓰지만 순서가 바뀌면 선택이 엉뚱한 그룹을 가리킵니다. name 을 주세요.`,
        );
      }

      const key = name === "" ? String(i) : name;

      /*
        키가 겹치면 두 번째 타일이 첫 번째의 아이콘을 가져가고, 키로 타일을 찾는
        키보드 이동도 첫 번째만 찾는다. 고치지는 않고 들리게만 한다.
      */
      if (seen.has(key) && !this.#warnedDupName) {
        this.#warnedDupName = true;
        console.warn(
          `[ns-sidebar] ns-nav-group 의 name 이 겹칩니다("${key}"). 레일 타일과 선택 상태가 첫 번째 그룹만 가리킵니다.`,
        );
      }
      seen.add(key);

      /*
        타일 내용의 폴백 세 단. 슬롯에 배정된 것이 있으면 이것은 보이지 않는다.
        코드 포인트 단위로 자르는 이유는 서로게이트 페어를 반으로 쪼개지 않는
        것이다.
      */
      const fallback =
        icon !== ""
          ? html`<ns-icon name=${icon}></ns-icon>`
          : badge !== ""
            ? badge
            : ([...heading][0] ?? "");

      return { key, heading, fallback, group, icon: icons.get(key) };
    });

    this.requestUpdate();
  }

  #onTile(key: string): void {
    const active = this.#activeEntry;

    if (active?.key === key) {
      // 활성 타일을 다시 누르면 패널을 접는다. VS Code 그대로다.
      this.#requestOpen(!this.open);
      return;
    }

    this.#select(key);
    if (!this.open) this.#requestOpen(true);
  }

  #select(key: string): void {
    this.#selected = true;

    // 제어 중이면 그 값을 바꾸지 않는다. 이벤트는 양쪽 모두 낸다.
    if (!this.#controlledGroup) {
      this.#innerActive = key;
      this.requestUpdate();
    }

    const detail: NsGroupSelectDetail = { name: key };
    this.dispatchEvent(
      new CustomEvent("ns-group-select", { detail, bubbles: true, composed: true }),
    );
  }

  /*
    open 은 아직 제어 전용이다 — 요청만 올리고 스스로 바꾸지 않는다.
    composed 라 ns-header 의 ns-toggle 을 셸에서 듣던 소비자에게 같은 핸들러로
    도착한다. 두 이벤트가 뜻하는 것이 정확히 같으므로 이름을 나누지 않는다.
  */
  #requestOpen(open: boolean): void {
    const detail: NsToggleDetail = { open };
    this.dispatchEvent(new CustomEvent("ns-toggle", { detail, bubbles: true, composed: true }));
  }
}

register("ns-sidebar", NsSidebar);

declare global {
  interface HTMLElementTagNameMap {
    "ns-sidebar": NsSidebar;
  }
}
