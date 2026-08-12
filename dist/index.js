var P = (e) => {
  throw TypeError(e);
};
var j = (e, r, t) => r.has(e) || P("Cannot " + t);
var w = (e, r, t) => (j(e, r, "read from private field"), t ? t.call(e) : r.get(e)), k = (e, r, t) => r.has(e) ? P("Cannot add the same private member more than once") : r instanceof WeakSet ? r.add(e) : r.set(e, t), x = (e, r, t, n) => (j(e, r, "write to private field"), n ? n.call(e, t) : r.set(e, t), t);
import { css as v, LitElement as g, html as f } from "lit";
import { property as i } from "lit/decorators.js";
function b(e, r) {
  typeof window > "u" || !("customElements" in window) || customElements.get(e) || customElements.define(e, r);
}
let $ = !1;
const M = `[@neosimplix/common-ui] tokens.css 가 로드되지 않아 레이아웃이 깨집니다.
  Next/React:  import "@neosimplix/common-ui/tokens.css";
  HTML:        <link rel="stylesheet" href="…/dist/tokens.css">`, z = () => getComputedStyle(document.documentElement).getPropertyValue("--color-line").trim() !== "";
function m() {
  if ($ || typeof document > "u" || typeof getComputedStyle > "u") return;
  if (z()) {
    $ = !0;
    return;
  }
  $ = !0;
  const e = () => {
    z() || console.warn(M);
  };
  document.readyState === "complete" ? e() : window.addEventListener("load", e, { once: !0 });
}
const B = v`
  :host {
    display: block;
    box-sizing: border-box;
    height: var(--header-height);
  }

  header {
    display: flex;
    height: 100%;
    align-items: center;
    gap: var(--space-3);
    border-bottom: 1px solid var(--color-line);
    background: var(--color-surface);
    padding-inline: var(--space-4);
  }

  .toggle {
    flex: none;
    display: grid;
    place-items: center;
    width: var(--control-height-md);
    height: var(--control-height-md);
    border: 0;
    border-radius: var(--radius-control);
    background: transparent;
    color: var(--color-fg-body);
    cursor: pointer;
    transition: background-color var(--transition-fast) var(--transition-ease);
  }

  .toggle:hover {
    background: var(--color-surface-hover);
  }

  .title {
    font-weight: var(--weight-semibold);
    color: var(--color-fg);
  }

  /* margin-left: auto 가 남은 공간을 흡수해 actions 를 우측에 붙인다. */
  .actions {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }
`;
var K = Object.defineProperty, S = (e, r, t, n) => {
  for (var o = void 0, s = e.length - 1, a; s >= 0; s--)
    (a = e[s]) && (o = a(r, t, o) || o);
  return o && K(r, t, o), o;
}, d;
const C = class C extends g {
  constructor() {
    super(...arguments);
    k(this, d);
    this.projectName = "", this.sidebarOpen = !1, x(this, d, () => {
      const t = { open: !this.sidebarOpen };
      this.dispatchEvent(
        new CustomEvent("ns-toggle", { detail: t, bubbles: !0, composed: !0 })
      );
    });
  }
  connectedCallback() {
    super.connectedCallback(), m();
  }
  render() {
    return f`
      <header>
        <button
          class="toggle"
          type="button"
          aria-expanded=${this.sidebarOpen ? "true" : "false"}
          aria-label=${this.sidebarOpen ? "사이드바 닫기" : "사이드바 열기"}
          @click=${w(this, d)}
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <span class="title">${this.projectName}</span>

        <div class="actions"><slot name="actions"></slot></div>
      </header>
    `;
  }
};
d = new WeakMap(), C.styles = B;
let c = C;
S([
  i({ type: String, attribute: "project-name" })
], c.prototype, "projectName");
S([
  i({ type: Boolean, reflect: !0, attribute: "sidebar-open" })
], c.prototype, "sidebarOpen");
b("ns-header", c);
const L = v`
  :host {
    display: block;
  }

  /*
    그룹 사이 간격. 원본은 .section + .section 이었지만 여기서는 형제가
    light DOM 의 호스트라 shadow 안에서 선택할 수 없다. ::slotted() 는
    결합자를 받지 않으므로 사이드바 쪽에서도 불가능하다. :host() 는
    복합 선택자를 받으므로 이 형태가 유일하게 동작한다.
  */
  :host(:not(:first-child)) {
    margin-top: var(--space-6);
  }

  .heading {
    display: var(--ns-label-display, block);
    padding: var(--space-4) var(--space-4) var(--space-2);
    font-size: var(--font-size-xs);
    line-height: var(--line-height-xs);
    font-weight: var(--weight-semibold);
    letter-spacing: 0.05em;
    color: var(--color-fg-subtle);
  }

  .list {
    padding: var(--space-2);
  }
`;
var T = Object.defineProperty, D = (e, r, t, n) => {
  for (var o = void 0, s = e.length - 1, a; s >= 0; s--)
    (a = e[s]) && (o = a(r, t, o) || o);
  return o && T(r, t, o), o;
};
const E = class E extends g {
  constructor() {
    super(...arguments), this.heading = "";
  }
  connectedCallback() {
    super.connectedCallback(), m();
  }
  render() {
    return f`
      <div role="group" aria-label=${this.heading}>
        <div class="heading">${this.heading}</div>
        <div class="list"><slot></slot></div>
      </div>
    `;
  }
};
E.styles = L;
let p = E;
D([
  i({ type: String })
], p.prototype, "heading");
b("ns-nav-group", p);
const A = v`
  :host {
    display: block;
  }

  .row {
    display: flex;
    align-items: center;
    gap: var(--space-2-5);
    margin-bottom: var(--space-1);
    border-radius: var(--radius-control);
    padding: var(--space-2);
    color: var(--color-fg-body);
    text-decoration: none;
    transition: background-color var(--transition-fast) var(--transition-ease),
      color var(--transition-fast) var(--transition-ease);
  }

  .row:hover {
    background: var(--color-surface-sunken);
  }

  :host([active]) .row {
    background: var(--color-surface-hover);
    color: var(--color-fg);
  }

  /* 접힌 레일에서 유일하게 남는 요소라 flex 축소를 막는다. */
  .badge {
    flex: none;
    display: grid;
    place-items: center;
    width: var(--control-height-sm);
    height: var(--control-height-sm);
    border-radius: var(--radius-badge);
    background: var(--color-surface-hover);
    font-size: var(--font-size-2xs);
    line-height: var(--line-height-2xs);
    font-weight: var(--weight-semibold);
  }

  :host([active]) .badge {
    background: var(--color-accent);
    color: var(--color-accent-fg);
  }

  /*
    flex: 1 과 min-width: 0 이 함께 있어야 한다. flex 자식은 기본이
    min-width: auto 라 내용보다 작아지지 않고, 그러면 text-overflow 가
    동작하지 않는다.

    --ns-label-display 는 ns-sidebar 가 ::slotted 로 내려주는 패키지
    내부 프로퍼티다. 사이드바 밖에서 단독으로 쓰일 때를 위해 여기만
    폴백을 둔다.
  */
  .label {
    display: var(--ns-label-display, block);
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: var(--font-size-sm);
    line-height: var(--line-height-sm);
    font-weight: var(--weight-medium);
  }

  .trailing {
    display: var(--ns-label-display, block);
    flex: none;
  }
`;
var R = Object.defineProperty, y = (e, r, t, n) => {
  for (var o = void 0, s = e.length - 1, a; s >= 0; s--)
    (a = e[s]) && (o = a(r, t, o) || o);
  return o && R(r, t, o), o;
}, h;
const _ = class _ extends g {
  constructor() {
    super(...arguments);
    k(this, h);
    this.href = "", this.label = "", this.badge = "", this.active = !1, x(this, h, (t) => {
      if (t.button !== 0 || t.metaKey || t.ctrlKey || t.shiftKey || t.altKey) return;
      t.preventDefault();
      const n = { href: this.href, label: this.label };
      this.dispatchEvent(
        new CustomEvent("ns-navigate", { detail: n, bubbles: !0, composed: !0 })
      );
    });
  }
  connectedCallback() {
    super.connectedCallback(), m();
  }
  render() {
    return f`
      <a class="row" href=${this.href} title=${this.label} @click=${w(this, h)}>
        <span class="badge" aria-hidden="true">${this.badge}</span>
        <span class="label">${this.label}</span>
        <span class="trailing"><slot name="trailing"></slot></span>
      </a>
    `;
  }
};
h = new WeakMap(), _.styles = A;
let l = _;
y([
  i({ type: String })
], l.prototype, "href");
y([
  i({ type: String })
], l.prototype, "label");
y([
  i({ type: String })
], l.prototype, "badge");
y([
  i({ type: Boolean, reflect: !0 })
], l.prototype, "active");
b("ns-nav-item", l);
const V = v`
  /*
    overflow-y: auto 가 동작하려면 조상 체인에 실제 높이가 이어져 있어야
    한다. 소비자가 이 엘리먼트에 높이를 주는 레이아웃에 넣어야 한다.
  */
  :host {
    display: block;
    box-sizing: border-box;
    height: 100%;
    min-height: 0;
    width: var(--sidebar-width);
    overflow-x: hidden;
    overflow-y: auto;
    border-right: 1px solid var(--color-line);
    background: var(--color-surface);
    transition: width 200ms var(--transition-ease);
  }

  :host(:not([open])) {
    width: var(--sidebar-width-collapsed);
  }

  /*
    접힘 상태를 하위에 전달하는 통로.

    shadow 안에서는 조상을 볼 수 없고 :host-context() 는 Chromium 전용이라
    쓸 수 없다. ::slotted() 로 직계 자식에 커스텀 프로퍼티를 내려주면
    상속을 타고 nav-group 의 shadow 와 그 아래 nav-item 까지 도달한다.
  */
  ::slotted(ns-nav-group) {
    --ns-label-display: block;
  }

  :host(:not([open])) ::slotted(ns-nav-group) {
    --ns-label-display: none;
  }
`;
var q = Object.defineProperty, F = (e, r, t, n) => {
  for (var o = void 0, s = e.length - 1, a; s >= 0; s--)
    (a = e[s]) && (o = a(r, t, o) || o);
  return o && q(r, t, o), o;
};
const O = class O extends g {
  constructor() {
    super(...arguments), this.open = !1;
  }
  connectedCallback() {
    super.connectedCallback(), m();
  }
  render() {
    return f`<nav><slot></slot></nav>`;
  }
};
O.styles = V;
let u = O;
F([
  i({ type: Boolean, reflect: !0 })
], u.prototype, "open");
b("ns-sidebar", u);
export {
  c as NsHeader,
  p as NsNavGroup,
  l as NsNavItem,
  u as NsSidebar
};
