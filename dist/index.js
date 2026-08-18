var qt = (i) => {
  throw TypeError(i);
};
var vt = (i, o, t) => o.has(i) || qt("Cannot " + t);
var d = (i, o, t) => (vt(i, o, "read from private field"), t ? t.call(i) : o.get(i)), h = (i, o, t) => o.has(i) ? qt("Cannot add the same private member more than once") : o instanceof WeakSet ? o.add(i) : o.set(i, t), a = (i, o, t, s) => (vt(i, o, "write to private field"), s ? s.call(i, t) : o.set(i, t), t), l = (i, o, t) => (vt(i, o, "access private method"), t);
import { css as S, svg as bt, LitElement as x, nothing as E, html as v, ReactiveElement as Wt } from "lit";
import { property as u, query as Jt, state as Qt } from "lit/decorators.js";
import { repeat as Gt } from "lit/directives/repeat.js";
function m(i, o) {
  typeof window > "u" || !("customElements" in window) || customElements.get(i) || customElements.define(i, o);
}
let mt = !1;
const Nt = `[@neosimplix/common-ui] tokens.css 가 로드되지 않아 레이아웃이 깨집니다.
  Next/React:  import "@neosimplix/common-ui/tokens.css";
  HTML:        <link rel="stylesheet" href="…/dist/tokens.css">`, Rt = () => getComputedStyle(document.documentElement).getPropertyValue("--ns-color-line").trim() !== "";
function y() {
  if (mt || typeof document > "u" || typeof getComputedStyle > "u") return;
  if (Rt()) {
    mt = !0;
    return;
  }
  mt = !0;
  const i = () => {
    Rt() || console.warn(Nt);
  };
  document.readyState === "complete" ? i() : window.addEventListener("load", i, { once: !0 });
}
const te = S`
  /* 네이티브 dialog 가 top layer 로 올라가므로 호스트는 자리를 차지하지 않는다. */
  :host {
    display: contents;
  }

  dialog {
    /*
      UA 스타일시트의 margin: auto 가 modal dialog 의 유일한 가운데 정렬 수단이다.
      Tailwind preflight 는 shadow 안에 닿지 않지만 소비자가 전역 dialog 규칙을
      둘 수 있으므로 명시한다. 참고 구현이 실제로 물린 함정이다.
    */
    margin: auto;
    box-sizing: border-box;
    /*
      폭은 --ns-dialog-width 에서 받고, min() 클램프는 여기 남긴다. 소비자가
      폼 대화상자를 넓히려고 그 값을 키워도 작은 화면에서 넘치지 않는다.
      커스텀 프로퍼티라 shadow 경계를 넘어 인스턴스별로 덮을 수 있다.
    */
    width: min(var(--ns-dialog-width), calc(100vw - var(--ns-dialog-margin)));
    max-height: calc(100vh - var(--ns-dialog-margin));
    padding: 0;
    border: 0;
    border-radius: var(--ns-radius-card);
    background: var(--ns-color-surface);
    color: var(--ns-color-fg-body);
    box-shadow: var(--ns-elevation-card);
    /* 본문만 스크롤되고 헤더·푸터는 고정된다. */
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /*
    UA 스타일시트의 dialog:not([open]) { display: none } 은 !important 가 아니고,
    author 선언은 cascade origin 에서 user-agent 를 이긴다 — 위의 display: flex 가
    닫힌 상태에도 적용된다. :host 가 display: contents 라 호스트는 박스를 만들지
    않으므로, 되돌리지 않으면 닫힌 대화상자의 내용이 페이지에 그대로 그려진다.
    (아래 .footer[hidden] 과 같은 종류의 함정이다.)

    특정도가 (0,1,1) 로 위 규칙 (0,0,1) 보다 높아 순서에 의존하지 않는다.
  */
  dialog:not([open]) {
    display: none;
  }

  dialog::backdrop {
    background: var(--ns-color-overlay);
  }

  .header {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ns-space-4);
    padding: var(--ns-space-5) var(--ns-space-6);
    border-bottom: 1px solid var(--ns-color-line);
  }

  h2 {
    margin: 0;
    font-size: var(--ns-font-size-lg);
    line-height: var(--ns-line-height-lg);
    font-weight: var(--ns-weight-semibold);
    color: var(--ns-color-fg);
  }

  /*
    controls.css 는 shadow 안에 도달하지 않으므로 .ns-button 을 쓸 수 없다.
    --ghost·--icon 조합에 해당하는 최소한만 다시 적는다. 설계 문서 §9 가
    이 중복을 수용한 유일한 자리로 지목한 곳이다.
  */
  .close {
    flex: none;
    display: grid;
    place-items: center;
    padding: var(--ns-space-1-5);
    border: 0;
    border-radius: var(--ns-radius-control);
    background: transparent;
    color: var(--ns-color-fg-muted);
    cursor: pointer;
    transition: background-color var(--ns-transition-fast) var(--ns-transition-ease),
      color var(--ns-transition-fast) var(--ns-transition-ease);
  }

  .close:hover {
    background: var(--ns-color-surface-hover);
    color: var(--ns-color-fg);
  }

  /*
    controls.css 의 :focus-visible 규칙은 전역이라 shadow 안에 닿지 않는다.
    이 버튼은 showModal() 이 자동 포커스하는 첫 요소이므로 특히 필요하다.
  */
  .close:focus-visible {
    outline: 2px solid var(--ns-color-accent);
    outline-offset: 2px;
  }

  .body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: var(--ns-space-6);
  }

  /*
    footer 는 내용이 있을 때만 보인다. slot 에 배정된 노드가 있는지는 CSS 로
    알 수 없어 slotchange 로 판정하고 hidden 속성을 건다.
    display: flex 가 UA 의 [hidden] 규칙을 이기므로 명시적으로 되돌린다.
  */
  .footer {
    flex: none;
    display: flex;
    justify-content: flex-end;
    gap: var(--ns-space-2);
    padding: 0 var(--ns-space-6) var(--ns-space-6);
  }

  .footer[hidden] {
    display: none;
  }
`, Lt = {
  menu: {
    viewBox: "0 0 20 20",
    content: bt`
      <path
        d="M3 5h14M3 10h14M3 15h14"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
      />
    `
  },
  close: {
    viewBox: "0 0 20 20",
    content: bt`
      <path
        d="M5 5l10 10M15 5L5 15"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
      />
    `
  },
  // 구글 브랜드 마크. 색이 규정으로 고정돼 있어 토큰을 쓰지 않는다.
  google: {
    viewBox: "0 0 18 18",
    content: bt`
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    `
  }
}, ee = S`
  /*
    크기를 --ns-icon-size 에서 받는다. tokens.css 의 ns-icon 요소 선택자에만
    의존할 수 없다 — 그 선택자는 문서 트리에만 적용되므로 ns-dialog 의 shadow
    안에 있는 <ns-icon> 에는 닿지 못하고, 그러면 아이콘이 크기를 잃어 내부 svg 의
    width/height: 100% 가 부모를 그대로 채운다. 실제로 대화상자 닫기 버튼이
    그렇게 깨졌다.

    커스텀 프로퍼티는 상속되므로 문서·중첩 shadow 어디서든 도달한다. 값은
    tokens.css 의 :root 한 곳에만 있다.
  */
  :host {
    display: inline-flex;
    flex: none;
    width: var(--ns-icon-size);
    height: var(--ns-icon-size);
  }

  svg {
    display: block;
    width: 100%;
    height: 100%;
  }
`;
var se = Object.defineProperty, ne = (i, o, t, s) => {
  for (var e = void 0, n = i.length - 1, c; n >= 0; n--)
    (c = i[n]) && (e = c(o, t, e) || e);
  return e && se(o, t, e), e;
}, D;
const Mt = class Mt extends x {
  constructor() {
    super(...arguments);
    h(this, D);
    this.name = "", a(this, D, "");
  }
  connectedCallback() {
    super.connectedCallback(), y();
  }
  render() {
    if (this.name === "") return E;
    const t = Lt[this.name];
    return t ? v`<svg viewBox=${t.viewBox} fill="none" aria-hidden="true">${t.content}</svg>` : (this.name !== d(this, D) && (a(this, D, this.name), console.warn(
      `[ns-icon] 없는 아이콘: "${this.name}". 사용 가능: ${Object.keys(Lt).join(", ")}`
    )), E);
  }
};
D = new WeakMap(), Mt.styles = ee;
let dt = Mt;
ne([
  u({ type: String })
], dt.prototype, "name");
m("ns-icon", dt);
var ie = Object.defineProperty, H = (i, o, t, s) => {
  for (var e = void 0, n = i.length - 1, c; n >= 0; n--)
    (c = i[n]) && (e = c(o, t, e) || e);
  return e && ie(o, t, e), e;
}, w, O, $, p, yt, wt, kt, Q, G, N, tt, et, xt, rt;
const zt = class zt extends x {
  constructor() {
    super(...arguments);
    h(this, p);
    h(this, w);
    h(this, O);
    h(this, $);
    h(this, Q);
    h(this, G);
    h(this, N);
    h(this, tt);
    h(this, et);
    this.heading = "", this.defaultOpen = !1, this.noBackdropClose = !1, this.hasFooter = !1, a(this, w, !1), a(this, O, !1), a(this, $, !1), a(this, Q, (t) => {
      const s = t.target;
      this.hasFooter = s.assignedNodes({ flatten: !0 }).length > 0;
    }), a(this, G, () => {
      if (d(this, $)) {
        a(this, $, !1);
        return;
      }
      l(this, p, rt).call(this, "escape");
    }), a(this, N, () => {
      l(this, p, rt).call(this, "close-button");
    }), a(this, tt, (t) => {
      a(this, O, l(this, p, xt).call(this, t));
    }), a(this, et, (t) => {
      const s = d(this, O);
      a(this, O, !1), !this.noBackdropClose && t.detail !== 0 && (!s || !l(this, p, xt).call(this, t) || l(this, p, rt).call(this, "backdrop"));
    });
  }
  connectedCallback() {
    super.connectedCallback(), y();
    const t = this.dialogEl;
    t != null && t.open && (a(this, $, !0), t.close()), this.requestUpdate();
  }
  /*
      defaultOpen 을 connectedCallback 이 아니라 여기서 읽는다. document.createElement
      로 만든 뒤 setAttribute 하는 경로에서는 connectedCallback 시점에 속성이 아직
      없을 수 있다. firstUpdated 는 같은 갱신 주기의 updated 보다 먼저 실행되므로
      아래 값이 그 주기에서 바로 반영된다.
  
      덮어쓰지 않고 seed 만 한다. Lit 은 첫 업데이트를 마이크로태스크로 미루므로
      생성과 같은 태스크에서 부른 show() 가 여기보다 먼저 실행되는데, 무조건
      대입하면 그 show() 가 경고도 없이 사라진다.
    */
  firstUpdated() {
    this.defaultOpen && a(this, w, !0);
  }
  /**
   * 비제어일 때만 연다. 제어 중이면 경고만 낸다 — 여기서 상태를 바꾸면
   * 소비자의 `open` 과 어긋나 화면이 튄다.
   */
  show() {
    l(this, p, kt).call(this, "show") || (a(this, w, !0), this.requestUpdate());
  }
  /** 비제어일 때만 닫는다. 소비자가 부른 것이므로 `ns-dialog-close` 를 내지 않는다. */
  close() {
    l(this, p, kt).call(this, "close") || (a(this, w, !1), this.requestUpdate());
  }
  /*
      네이티브 dialog 의 상태를 매번 우리 상태와 맞춘다.
  
      제어 모드에서 Esc 로 네이티브 대화상자가 닫혔는데 소비자가 open 을 true 로
      두면 여기서 다시 연다. 그게 제어의 정의다. 참고 구현에는 이 재조정이 없어
      화면은 닫히고 React state 는 열린 채로 어긋난다.
  
      open 속성이 아니라 showModal() 이어야 배경이 inert 가 되고 포커스 트랩과
      ::backdrop 이 동작한다.
    */
  updated() {
    const t = this.dialogEl;
    t && (d(this, p, wt) && !t.open ? this.isConnected && t.showModal() : !d(this, p, wt) && t.open && (a(this, $, !0), t.close()));
  }
  render() {
    return v`
      <dialog
        aria-labelledby="dialog-heading"
        @close=${d(this, G)}
        @mousedown=${d(this, tt)}
        @click=${d(this, et)}
      >
        <div class="header">
          <h2 id="dialog-heading">${this.heading}</h2>
          <button class="close" type="button" aria-label="닫기" @click=${d(this, N)}>
            <ns-icon name="close"></ns-icon>
          </button>
        </div>
        <div class="body"><slot></slot></div>
        <div class="footer" ?hidden=${!this.hasFooter}>
          <slot name="footer" @slotchange=${d(this, Q)}></slot>
        </div>
      </dialog>
    `;
  }
};
w = new WeakMap(), O = new WeakMap(), $ = new WeakMap(), p = new WeakSet(), yt = function() {
  return this.open !== void 0;
}, wt = function() {
  return this.open ?? d(this, w);
}, kt = function(t) {
  return d(this, p, yt) ? (console.warn(
    `[ns-dialog] open 프로퍼티가 설정된 제어 모드에서는 ${t}() 가 동작하지 않습니다. open 을 바꾸세요.`
  ), !0) : !1;
}, Q = new WeakMap(), G = new WeakMap(), N = new WeakMap(), tt = new WeakMap(), et = new WeakMap(), /*
  e.target 으로 판별하지 않는다. border-radius 모서리처럼 대화상자 자기
  표면을 클릭해도 타깃이 <dialog> 라서 backdrop 으로 오인된다.
*/
xt = function(t) {
  const s = this.dialogEl;
  if (!s) return !1;
  const e = s.getBoundingClientRect();
  return t.clientX < e.left || t.clientX > e.right || t.clientY < e.top || t.clientY > e.bottom;
}, rt = function(t) {
  d(this, p, yt) || a(this, w, !1);
  const s = { reason: t };
  this.dispatchEvent(
    new CustomEvent("ns-dialog-close", { detail: s, bubbles: !0, composed: !0 })
  ), this.requestUpdate();
}, zt.styles = te;
let k = zt;
H([
  u({ type: String })
], k.prototype, "heading");
H([
  u({ attribute: !1 })
], k.prototype, "open");
H([
  u({ type: Boolean, attribute: "default-open" })
], k.prototype, "defaultOpen");
H([
  u({ type: Boolean, attribute: "no-backdrop-close" })
], k.prototype, "noBackdropClose");
H([
  Jt("dialog")
], k.prototype, "dialogEl");
H([
  Qt()
], k.prototype, "hasFooter");
m("ns-dialog", k);
const oe = S`
  :host {
    display: block;
    box-sizing: border-box;
    height: var(--ns-header-height);
  }

  header {
    display: flex;
    height: 100%;
    align-items: center;
    gap: var(--ns-space-3);
    border-bottom: 1px solid var(--ns-color-line);
    background: var(--ns-color-surface);
    padding-inline: var(--ns-space-4);
  }

  .toggle {
    flex: none;
    display: grid;
    place-items: center;
    width: var(--ns-control-height-md);
    height: var(--ns-control-height-md);
    border: 0;
    border-radius: var(--ns-radius-control);
    background: transparent;
    color: var(--ns-color-fg-body);
    cursor: pointer;
    transition: background-color var(--ns-transition-fast) var(--ns-transition-ease);
  }

  .toggle:hover {
    background: var(--ns-color-surface-hover);
  }

  /* controls.css 의 :focus-visible 규칙은 전역이라 shadow 안에 닿지 않는다. */
  .toggle:focus-visible {
    outline: 2px solid var(--ns-color-accent);
    outline-offset: 2px;
  }

  .title {
    font-weight: var(--ns-weight-semibold);
    color: var(--ns-color-fg);
  }

  /* margin-left: auto 가 남은 공간을 흡수해 actions 를 우측에 붙인다. */
  .actions {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: var(--ns-space-3);
  }
`;
var re = Object.defineProperty, Ft = (i, o, t, s) => {
  for (var e = void 0, n = i.length - 1, c; n >= 0; n--)
    (c = i[n]) && (e = c(o, t, e) || e);
  return e && re(o, t, e), e;
}, st;
const Bt = class Bt extends x {
  constructor() {
    super(...arguments);
    h(this, st);
    this.projectName = "", this.sidebarOpen = !1, a(this, st, () => {
      const t = { open: !this.sidebarOpen };
      this.dispatchEvent(
        new CustomEvent("ns-toggle", { detail: t, bubbles: !0, composed: !0 })
      );
    });
  }
  connectedCallback() {
    super.connectedCallback(), y();
  }
  /*
    토글 아이콘은 <ns-icon name="menu"> 를 쓴다. 이전에는 여기서 svg 를 손으로
    그렸는데 icons.ts 의 "menu" 와 viewBox·stroke-width 가 달랐다 — 소비자가
    actions slot 에 .ns-button--icon + <ns-icon> 을 넣으면 이 토글 바로 옆에
    굵기가 다른 같은 모양이 나란히 서서 버그로 읽혔다. 아이콘은 한 곳에서만
    정의한다.
  */
  render() {
    return v`
      <header>
        <button
          class="toggle"
          type="button"
          aria-expanded=${this.sidebarOpen ? "true" : "false"}
          aria-label=${this.sidebarOpen ? "사이드바 닫기" : "사이드바 열기"}
          @click=${d(this, st)}
        >
          <ns-icon name="menu"></ns-icon>
        </button>

        <span class="title">${this.projectName}</span>

        <div class="actions"><slot name="actions"></slot></div>
      </header>
    `;
  }
};
st = new WeakMap(), Bt.styles = oe;
let W = Bt;
Ft([
  u({ type: String, attribute: "project-name" })
], W.prototype, "projectName");
Ft([
  u({ type: Boolean, reflect: !0, attribute: "sidebar-open" })
], W.prototype, "sidebarOpen");
m("ns-header", W);
const ae = S`
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
    margin-top: var(--ns-space-6);
  }

  .heading {
    display: var(--ns-label-display, block);
    padding: var(--ns-space-4) var(--ns-space-4) var(--ns-space-2);
    font-size: var(--ns-font-size-xs);
    line-height: var(--ns-line-height-xs);
    font-weight: var(--ns-weight-semibold);
    letter-spacing: 0.05em;
    color: var(--ns-color-fg-subtle);
  }

  .list {
    padding: var(--ns-space-2);
  }
`;
var le = Object.defineProperty, ce = (i, o, t, s) => {
  for (var e = void 0, n = i.length - 1, c; n >= 0; n--)
    (c = i[n]) && (e = c(o, t, e) || e);
  return e && le(o, t, e), e;
};
const jt = class jt extends x {
  constructor() {
    super(...arguments), this.heading = "";
  }
  connectedCallback() {
    super.connectedCallback(), y();
  }
  render() {
    return v`
      <div role="group" aria-label=${this.heading}>
        <div class="heading">${this.heading}</div>
        <div class="list"><slot></slot></div>
      </div>
    `;
  }
};
jt.styles = ae;
let ht = jt;
ce([
  u({ type: String })
], ht.prototype, "heading");
m("ns-nav-group", ht);
const de = S`
  :host {
    display: block;
  }

  .row {
    display: flex;
    align-items: center;
    gap: var(--ns-space-2-5);
    margin-bottom: var(--ns-space-1);
    border-radius: var(--ns-radius-control);
    padding: var(--ns-space-2);
    color: var(--ns-color-fg-body);
    text-decoration: none;
    transition: background-color var(--ns-transition-fast) var(--ns-transition-ease),
      color var(--ns-transition-fast) var(--ns-transition-ease);
  }

  .row:hover {
    background: var(--ns-color-surface-sunken);
  }

  :host([active]) .row {
    background: var(--ns-color-surface-hover);
    color: var(--ns-color-fg);
  }

  /* 접힌 레일에서 유일하게 남는 자리라 flex 축소를 막는다. */
  .leading {
    flex: none;
    display: grid;
    place-items: center;
    width: var(--ns-control-height-sm);
    height: var(--ns-control-height-sm);
  }

  /*
    이 규칙이 하는 일은 상한을 씌우는 것뿐이다 — 슬롯에 들어온 것이 위 .leading
    사각형 밖으로 커지지 않게 막는다. 크기 자체는 여기서 주지 않는다. 보통 들어오는
    <ns-icon> 은 자기 shadow 의 :host 에서 --ns-icon-size 로 크기를 갖고,
    그것이 이 상한보다 작아 상한이 발동하지 않는다. 크기가 없는 것을 넣으면
    이 규칙은 그것을 키워 주지 않는다.
  */
  ::slotted([slot="leading"]) {
    max-width: 100%;
    max-height: 100%;
  }

  .badge {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    border-radius: var(--ns-radius-badge);
    background: var(--ns-color-surface-hover);
    font-size: var(--ns-font-size-2xs);
    line-height: var(--ns-line-height-2xs);
    font-weight: var(--ns-weight-semibold);
  }

  :host([active]) .badge {
    background: var(--ns-color-accent);
    color: var(--ns-color-accent-fg);
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
    font-size: var(--ns-font-size-sm);
    line-height: var(--ns-line-height-sm);
    font-weight: var(--ns-weight-medium);
  }

  .trailing {
    display: var(--ns-label-display, block);
    flex: none;
  }
`;
var he = Object.defineProperty, ft = (i, o, t, s) => {
  for (var e = void 0, n = i.length - 1, c; n >= 0; n--)
    (c = i[n]) && (e = c(o, t, e) || e);
  return e && he(o, t, e), e;
}, nt;
const At = class At extends x {
  constructor() {
    super(...arguments);
    h(this, nt);
    this.href = "", this.label = "", this.badge = "", this.active = !1, a(this, nt, (t) => {
      if (t.button !== 0 || t.metaKey || t.ctrlKey || t.shiftKey || t.altKey) return;
      t.preventDefault();
      const s = { href: this.href, label: this.label };
      this.dispatchEvent(
        new CustomEvent("ns-navigate", { detail: s, bubbles: !0, composed: !0 })
      );
    });
  }
  connectedCallback() {
    super.connectedCallback(), y();
  }
  render() {
    return v`
      <a class="row" href=${this.href} title=${this.label} @click=${d(this, nt)}>
        <span class="leading">
          <slot name="leading">
            <span class="badge" aria-hidden="true">${this.badge}</span>
          </slot>
        </span>
        <span class="label">${this.label}</span>
        <span class="trailing"><slot name="trailing"></slot></span>
      </a>
    `;
  }
};
nt = new WeakMap(), At.styles = de;
let A = At;
ft([
  u({ type: String })
], A.prototype, "href");
ft([
  u({ type: String })
], A.prototype, "label");
ft([
  u({ type: String })
], A.prototype, "badge");
ft([
  u({ type: Boolean, reflect: !0 })
], A.prototype, "active");
m("ns-nav-item", A);
const ue = S`
  :host {
    display: block;
  }

  h1 {
    margin: 0;
    font-size: var(--ns-font-size-xl);
    line-height: var(--ns-line-height-xl);
    font-weight: var(--ns-weight-semibold);
    color: var(--ns-color-fg);
  }

  p {
    margin: var(--ns-space-1-5) 0 0;
    font-size: var(--ns-font-size-sm);
    line-height: var(--ns-line-height-sm);
    color: var(--ns-color-fg-muted);
  }
`;
var pe = Object.defineProperty, Tt = (i, o, t, s) => {
  for (var e = void 0, n = i.length - 1, c; n >= 0; n--)
    (c = i[n]) && (e = c(o, t, e) || e);
  return e && pe(o, t, e), e;
};
const Kt = class Kt extends x {
  constructor() {
    super(...arguments), this.heading = "", this.description = "";
  }
  connectedCallback() {
    super.connectedCallback(), y();
  }
  render() {
    return v`
      <h1>${this.heading}</h1>
      ${this.description ? v`<p>${this.description}</p>` : E}
    `;
  }
};
Kt.styles = ue;
let J = Kt;
Tt([
  u({ type: String })
], J.prototype, "heading");
Tt([
  u({ type: String })
], J.prototype, "description");
m("ns-page-heading", J);
var fe = Object.defineProperty, gt = (i, o, t, s) => {
  for (var e = void 0, n = i.length - 1, c; n >= 0; n--)
    (c = i[n]) && (e = c(o, t, e) || e);
  return e && fe(o, t, e), e;
};
function ge(i, o) {
  if (o <= 7) return Array.from({ length: o }, (n, c) => c + 1);
  const t = [1, i - 1, i, i + 1, o].filter((n) => n >= 1 && n <= o).sort((n, c) => n - c), s = [];
  let e = 0;
  for (const n of t)
    n !== e && (e !== 0 && n - e > 1 && s.push("gap"), s.push(n), e = n);
  return s;
}
var C, U, q, R, M, f, $t, at, Ct, It, lt;
class it extends x {
  constructor() {
    super(...arguments);
    h(this, f);
    h(this, C);
    h(this, U);
    h(this, q);
    h(this, R);
    h(this, M);
    this.total = 0, this.perPage = 20, this.defaultPage = 1, a(this, C, 1), a(this, U, !1), a(this, q, !1), a(this, R, !1), a(this, M, null);
  }
  /*
      Light DOM 이다. controls.css 의 .ns-button 을 그대로 쓰기 위해서다 — shadow
      였다면 버튼 스타일 전부를 다시 적어야 했고, ns-dialog 닫기 버튼에서 수용한
      중복(열 줄)이 여기서는 훨씬 커진다.
  
      ns-table 과 달리 자식이 없으므로 Lit 이 이 요소 안에 렌더해도 덮어쓸 소비자
      내용이 없다. 그래서 LitElement 를 그대로 쓴다.
  
      static styles 는 이 재정의로 무시된다 — adoptStyles 가 호출되지 않는다.
      스타일은 전부 controls.css 에 있고 이 컴포넌트에 .styles.ts 가 없다.
    */
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    super.connectedCallback(), y();
  }
  /*
      비제어 초기값을 seed 한다. **firstUpdated 가 아니라 willUpdate 다.**
  
      Lit 의 첫 업데이트 순서는 willUpdate → render → firstUpdated → updated 다.
      firstUpdated 에서 seed 하면 그때 이미 첫 render 가 끝나 있고, 아무도 두 번째
      업데이트를 요청하지 않으므로 default-page="4" 인데 화면은 1을 현재로 그린
      상태가 남는다(내부 상태만 4다 — 첫 "다음" 클릭이 5가 아니라 2로 간다).
      willUpdate 는 첫 render **앞**이라 첫 페인트부터 4가 현재다. 두 번 그리지
      않으므로 잘못된 페이지가 스치는 일도 없다.
  
      ns-table 이 같은 실수를 하지 않는 이유는 그쪽이 render 를 갖지 않기
      때문이다 — 그 컴포넌트의 DOM 쓰기는 전부 updated() 에서 일어나고 그것은
      firstUpdated 다음이다. 이 컴포넌트는 render 가 있어 자리가 다르다.
  
      덮어쓰지 않는다는 원래 근거는 그대로다 — Lit 은 첫 업데이트를 마이크로태스크로
      미루므로, 생성과 같은 태스크에서 프로퍼티를 만진 코드가 여기보다 먼저 실행된다.
      willUpdate 도 그 마이크로태스크 안이라 이 성질이 유지된다.
    */
  willUpdate() {
    if (!this.hasUpdated) {
      if (!Number.isInteger(this.defaultPage) || this.defaultPage < 1) {
        console.warn(
          `[ns-pagination] default-page=${this.defaultPage} 는 1 이상의 정수여야 합니다. 1 페이지에서 시작합니다.`
        );
        return;
      }
      this.defaultPage !== 1 && a(this, C, this.defaultPage);
    }
  }
  /*
    페이지가 바뀌면 방금 누른 컨트롤로 포커스를 되돌린다. repeat() 의 키가
    번호 버튼의 정체성을 지켜 주지만, 그 버튼이 윈도우 안에서 자리를 옮기면
    lit 이 노드를 이동시키고(제거 후 삽입) 브라우저는 그때 포커스를 떨어뜨린다.
    키만으로는 부족해서 여기서 명시적으로 되돌린다.
  */
  updated() {
    var n;
    const t = d(this, M);
    if (t === null || (a(this, M, null), (this.page ?? d(this, C)) !== t.page)) return;
    const s = this.ownerDocument.activeElement;
    if (s !== null && s !== this.ownerDocument.body && !this.contains(s)) return;
    const e = typeof t.control == "number" ? `button[data-ns-page="${t.control}"]` : `button[data-ns-nav="${t.control}"]`;
    (n = this.querySelector(e)) == null || n.focus();
  }
  render() {
    const t = d(this, f, at);
    if (t <= 1) return E;
    const s = l(this, f, Ct).call(this);
    return v`
      <nav aria-label="페이지 이동">
        <button
          class="ns-button ns-button--ghost ns-button--sm"
          type="button"
          data-ns-nav="prev"
          aria-disabled=${s === 1 ? "true" : E}
          @click=${() => l(this, f, lt).call(this, "prev", s - 1)}
        >
          이전
        </button>
        ${Gt(
      ge(s, t),
      /*
        번호는 그 번호 자신이 정체성이다. 위치로 diff 하면 윈도우가
        줄어들 때(pageWindow(6,12) 는 7개, pageWindow(12,12) 는 4개)
        포커스가 있던 노드가 제거되고, 윈도우가 밀릴 때는 노드가 재사용되며
        라벨만 5 에서 6 으로 바뀐다 — 화면낭독기가 엉뚱한 번호를 읽는다.
        gap 은 포커스를 받지 않고 위치가 곧 정체성이라 인덱스로 구분한다.
        문자열 키라 번호 키와 섞이지 않는다.
      */
      (e, n) => e === "gap" ? `gap-${n}` : e,
      (e) => e === "gap" ? v`<span class="ns-pagination-gap" aria-hidden="true">…</span>` : v`<button
                  class=${e === s ? "ns-button ns-button--outline ns-button--sm" : "ns-button ns-button--ghost ns-button--sm"}
                  type="button"
                  data-ns-page=${e}
                  aria-current=${e === s ? "page" : E}
                  @click=${() => l(this, f, lt).call(this, e, e)}
                >
                  ${e}
                </button>`
    )}
        <button
          class="ns-button ns-button--ghost ns-button--sm"
          type="button"
          data-ns-nav="next"
          aria-disabled=${s === t ? "true" : E}
          @click=${() => l(this, f, lt).call(this, "next", s + 1)}
        >
          다음
        </button>
      </nav>
    `;
  }
}
C = new WeakMap(), U = new WeakMap(), q = new WeakMap(), R = new WeakMap(), M = new WeakMap(), f = new WeakSet(), $t = function() {
  return this.page !== void 0;
}, at = function() {
  return this.perPage > 0 ? !Number.isFinite(this.total) || this.total < 0 ? (d(this, R) || (a(this, R, !0), console.warn(
    `[ns-pagination] total=${this.total} 은 0 이상의 유한한 수여야 합니다. 페이징을 렌더하지 않습니다.`
  )), 0) : Math.ceil(this.total / this.perPage) : (d(this, q) || (a(this, q, !0), console.warn(
    `[ns-pagination] per-page=${this.perPage} 는 1 이상이어야 합니다. 페이징을 렌더하지 않습니다.`
  )), 0);
}, /**
 * 지금 보여줄 페이지. **#pages 가 1 이상이면 언제나 1..#pages 의 정수를
 * 돌려준다** — raw 가 무엇이든 상관없다.
 */
Ct = function() {
  const t = this.page ?? d(this, C), s = d(this, f, at);
  if (Number.isInteger(t) && t >= 1 && t <= s) return t;
  const e = Number.isFinite(t) ? Math.min(Math.max(Math.round(t), 1), Math.max(s, 1)) : 1;
  return d(this, U) || (a(this, U, !0), console.warn(
    d(this, f, $t) ? `[ns-pagination] page=${t} 가 1..${s} 범위를 벗어났습니다. 표시용으로 ${e} 로 보정합니다.` : `[ns-pagination] 현재 페이지 ${t} 가 total=${this.total} · per-page=${this.perPage} 로 계산된 페이지 수(${s})를 벗어났습니다. 표시용으로 ${e} 로 보정합니다.`
  )), e;
}, /** 이동했으면(= 이벤트를 냈으면) true. */
It = function(t) {
  if (!Number.isInteger(t) || t < 1 || t > d(this, f, at) || t === l(this, f, Ct).call(this)) return !1;
  d(this, f, $t) || (a(this, C, t), this.requestUpdate());
  const s = { page: t };
  return this.dispatchEvent(
    new CustomEvent("ns-page-change", { detail: s, bubbles: !0, composed: !0 })
  ), !0;
}, /*
  실제로 이동했을 때만 포커스 의도를 남긴다. 양 끝에서 눌린 이전·다음이나
  현재 페이지 재클릭은 DOM 을 바꾸지 않으므로 되돌릴 포커스도 없다 —
  의도를 남기면 한참 뒤의 무관한 업데이트에서 소진되어 포커스를 훔친다.
*/
lt = function(t, s) {
  l(this, f, It).call(this, s) && a(this, M, { control: t, page: s });
};
gt([
  u({ type: Number })
], it.prototype, "total");
gt([
  u({ type: Number, attribute: "per-page" })
], it.prototype, "perPage");
gt([
  u({ attribute: !1 })
], it.prototype, "page");
gt([
  u({ type: Number, attribute: "default-page" })
], it.prototype, "defaultPage");
m("ns-pagination", it);
const ve = S`
  /*
    overflow-y: auto 가 동작하려면 조상 체인에 실제 높이가 이어져 있어야
    한다. 소비자가 이 엘리먼트에 높이를 주는 레이아웃에 넣어야 한다.
  */
  :host {
    display: block;
    box-sizing: border-box;
    height: 100%;
    min-height: 0;
    width: var(--ns-sidebar-width);
    overflow-x: hidden;
    overflow-y: auto;
    border-right: 1px solid var(--ns-color-line);
    background: var(--ns-color-surface);
    transition: width 200ms var(--ns-transition-ease);
  }

  /*
    접힘 너비. 두 속성을 함께 보는 이유는 타이밍이다.

    customElements.define 은 모듈 평가 시점에 실행되므로 hydrateRoot 보다
    먼저다. 그 사이 구간에서는 엘리먼트가 이미 upgrade 돼 tokens.css 의
    :not(:defined) 예약이 떨어져 나갔는데, React 는 아직 open 을 설정하지
    않았다. [open] 만 보면 이 구간이 4rem 으로 그려지고 하이드레이션 직후
    벌어진다 — 예약이 없애려던 것과 같은 튐이 창만 좁아진 채 남는다.

    data-ns-open 은 서버 마크업부터 DOM 에 있고 React 가 open 을 끌 때 함께
    지우므로 두 속성이 어긋나지 않는다. 순수 HTML 소비자는 마크업에 open 을
    직접 쓰므로 data-ns-open 이 없어도 첫 짝이 걸린다.

    타임라인: upgrade 전에는 tokens.css 의 문서 예약이, upgrade 와 hydration
    사이에는 data-ns-open 이, hydration 이후에는 open 이 너비를 잡는다.
  */
  :host(:not([open]):not([data-ns-open])) {
    width: var(--ns-sidebar-width-collapsed);
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

  /* 너비와 같은 구간을 겪는다. 여기서 [open] 만 보면 라벨이 깜빡인다. */
  :host(:not([open]):not([data-ns-open])) ::slotted(ns-nav-group) {
    --ns-label-display: none;
  }
`;
var be = Object.defineProperty, me = (i, o, t, s) => {
  for (var e = void 0, n = i.length - 1, c; n >= 0; n--)
    (c = i[n]) && (e = c(o, t, e) || e);
  return e && be(o, t, e), e;
};
const Dt = class Dt extends x {
  constructor() {
    super(...arguments), this.open = !1;
  }
  connectedCallback() {
    super.connectedCallback(), y();
  }
  render() {
    return v`<nav><slot></slot></nav>`;
  }
};
Dt.styles = ve;
let ut = Dt;
me([
  u({ type: Boolean, reflect: !0 })
], ut.prototype, "open");
m("ns-sidebar", ut);
const ye = S`
  :host {
    display: block;
  }

  .bar {
    background: var(--ns-color-surface-hover);
    animation: pulse 2s cubic-bezier(.4, 0, .6, 1) infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: .5; }
  }

  /*
    맥박 애니메이션은 이 설정이 정확히 겨냥하는 종류다. 참고 구현에는 없었다.
    멈추기만 하고 색은 유지한다 — 자리를 차지한다는 정보는 남아야 한다.
  */
  @media (prefers-reduced-motion: reduce) {
    .bar { animation: none; }
  }
`;
var we = Object.defineProperty, Ot = (i, o, t, s) => {
  for (var e = void 0, n = i.length - 1, c; n >= 0; n--)
    (c = i[n]) && (e = c(o, t, e) || e);
  return e && we(o, t, e), e;
};
const ke = /* @__PURE__ */ new Set(["badge", "control", "panel", "card", "pill"]);
var pt, Zt;
const Ut = class Ut extends x {
  constructor() {
    super(...arguments);
    h(this, pt);
    this.width = "100%", this.height = "1rem", this.radius = "control";
  }
  connectedCallback() {
    super.connectedCallback(), y();
  }
  render() {
    return v`
      <div
        class="bar"
        aria-hidden="true"
        style="width:${this.width};height:${this.height};border-radius:${l(this, pt, Zt).call(this)}"
      ></div>
    `;
  }
};
pt = new WeakSet(), Zt = function() {
  return ke.has(this.radius) ? `var(--ns-radius-${this.radius})` : this.radius;
}, Ut.styles = ye;
let Z = Ut;
Ot([
  u({ type: String })
], Z.prototype, "width");
Ot([
  u({ type: String })
], Z.prototype, "height");
Ot([
  u({ type: String })
], Z.prototype, "radius");
m("ns-skeleton", Z);
var xe = Object.defineProperty, ot = (i, o, t, s) => {
  for (var e = void 0, n = i.length - 1, c; n >= 0; n--)
    (c = i[n]) && (e = c(o, t, e) || e);
  return e && xe(o, t, e), e;
};
function $e(i) {
  return i === "none" ? "ascending" : i === "ascending" ? "descending" : "none";
}
var z, B, j, L, F, r, Ht, St, Pt, Vt, K, _t, T, ct, _, X, Et, Xt, Yt, Y, I;
class V extends Wt {
  constructor() {
    super(...arguments);
    h(this, r);
    h(this, z);
    h(this, B);
    /*
        비제어 모드에서 ns-select-change 로 **마지막에 보고한 집합**이다.
        `undefined` 면 아직 기준선이 없다는 뜻이고, 그때는 비교 대신 seed 만 한다.
    
        관찰자가 이것과 DOM 을 비교해 "이벤트 없이 바뀐 선택" 을 잡는다.
      */
    h(this, j);
    h(this, L);
    h(this, F);
    h(this, T);
    h(this, I);
    this.defaultSortKey = "", this.defaultSortDirection = "none", a(this, z, ""), a(this, B, "none"), a(this, L, !1), a(this, T, (t) => {
      const s = t.target, e = s == null ? void 0 : s.closest("th[data-ns-sort-key]");
      if (!e || !l(this, r, K).call(this, e)) return;
      const n = e.dataset.nsSortKey ?? "", c = n === d(this, r, St) ? $e(d(this, r, Pt)) : "ascending", P = c === "none" ? "" : n;
      d(this, r, Ht) || (a(this, z, P), a(this, B, c), this.requestUpdate());
      const g = { key: P, direction: c };
      this.dispatchEvent(
        new CustomEvent("ns-sort", { detail: g, bubbles: !0, composed: !0 })
      );
    }), a(this, I, (t) => {
      var g;
      const s = (g = t.target) == null ? void 0 : g.closest(
        'input[type="checkbox"]'
      );
      if (!s || !l(this, r, K).call(this, s)) return;
      const e = l(this, r, ct).call(this);
      if (s.hasAttribute("data-ns-select-all")) {
        if (this.selected === void 0)
          for (const b of e) b.checked = s.checked;
        l(this, r, Y).call(this, s.checked ? e.map((b) => l(this, r, _).call(this, b)) : []), this.selected === void 0 && l(this, r, X).call(this);
        return;
      }
      if (!s.hasAttribute("data-ns-row-id")) return;
      let n;
      if (this.selected === void 0) {
        n = e.filter((b) => b.checked).map((b) => l(this, r, _).call(this, b)), l(this, r, Y).call(this, n), l(this, r, X).call(this);
        return;
      }
      const c = new Set(this.selected), P = l(this, r, _).call(this, s);
      s.checked ? c.add(P) : c.delete(P), n = e.map((b) => l(this, r, _).call(this, b)).filter((b) => c.has(b)), l(this, r, Y).call(this, n);
    });
  }
  /*
      Light DOM 이다. 실패 경로가 둘이고 이 재정의가 둘 다 막는다.
  
      1. LitElement 처럼 템플릿을 렌더하면 소비자가 쓴 <table> 이 덮어써진다.
         → ReactiveElement 를 상속해 렌더 파이프라인 자체를 갖지 않는다.
      2. ReactiveElement 의 기본 createRenderRoot 는 shadow root 를 만든다.
         shadow root 가 있으면 <slot> 이 없는 한 light DOM 자식이 렌더되지 않는다.
         → this 를 반환해 shadow root 를 만들지 않는다.
  
      둘 다 에러 없이 빈 표가 된다. 그래서 이 재정의를 지우면 조용히 깨진다.
  
      부수 효과로 static styles 가 무시된다(adoptStyles 가 호출되지 않는다).
      스타일은 전부 controls.css 에 있고 이 컴포넌트에 .styles.ts 파일이 없다.
    */
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    super.connectedCallback(), y(), this.addEventListener("click", d(this, T)), this.addEventListener("change", d(this, I)), a(this, F, new MutationObserver(() => {
      l(this, r, _t).call(this), l(this, r, X).call(this), l(this, r, Yt).call(this);
    })), d(this, F).observe(this, { childList: !0, subtree: !0 });
  }
  disconnectedCallback() {
    var t;
    this.removeEventListener("click", d(this, T)), this.removeEventListener("change", d(this, I)), (t = d(this, F)) == null || t.disconnect(), super.disconnectedCallback();
  }
  /*
    비제어 초기값을 seed 한다. 덮어쓰지 않는다 — Lit 은 첫 업데이트를
    마이크로태스크로 미루므로, 생성과 같은 태스크에서 프로퍼티를 만진 코드가
    여기보다 먼저 실행된다. 무조건 대입하면 그것이 경고 없이 사라진다.
  */
  firstUpdated() {
    this.defaultSortKey !== "" && a(this, z, this.defaultSortKey), this.defaultSortDirection !== "none" && a(this, B, this.defaultSortDirection), this.selected === void 0 && a(this, j, l(this, r, Et).call(this));
  }
  updated() {
    l(this, r, Vt).call(this), l(this, r, _t).call(this), l(this, r, X).call(this);
  }
}
z = new WeakMap(), B = new WeakMap(), j = new WeakMap(), L = new WeakMap(), F = new WeakMap(), r = new WeakSet(), Ht = function() {
  return this.sortKey !== void 0;
}, St = function() {
  return this.sortKey ?? d(this, z);
}, Pt = function() {
  return this.sortDirection ?? d(this, B);
}, /*
    #controlled 는 sortKey 하나로 판정하는데 #direction 게터는
    `sortDirection ?? #innerDirection` 이다. sortDirection 만 설정하고 sortKey 를
    두지 않으면 비제어 분기가 #innerDirection 을 갱신해도 게터가 그것을 소비자
    값으로 덮는다 — nextDirection 의 입력이 그 값에 묶여 ns-sort 가 같은 방향만
    반복하고 aria-sort 가 거기서 멈춘다.

    코드로 한쪽을 고르지 않는 이유는 어느 쪽이 의도인지 컴포넌트가 알 수 없기
    때문이다(제어하려 했는데 sortKey 를 빠뜨렸을 수도, 비제어 초기값을 주려다
    프로퍼티를 잘못 골랐을 수도 있다). ns-pagination 이 잘못된 per-page·page 에
    하는 것처럼 알리기만 한다.
  */
Vt = function() {
  d(this, L) || this.sortDirection === void 0 || this.sortKey !== void 0 || (a(this, L, !0), console.warn(
    `[ns-table] sortDirection="${this.sortDirection}" 만 설정하고 sortKey 는 설정하지 않았습니다. 둘은 짝이라 이 상태에서는 정렬 방향이 바뀌지 않습니다. 제어하려면 둘 다 설정하고, 비제어 초기값이 목적이면 default-sort-direction 을 쓰세요.`
  ));
}, /*
  Light DOM 이라 shadow 경계가 없다. 중첩된 <ns-table> 의 <th>·체크박스도 바깥
  호스트의 querySelectorAll·closest 에 그대로 잡히므로, 안쪽 헤더 클릭이나 안쪽
  체크박스가 바깥 컴포넌트에서도 처리돼 이벤트가 두 번 발생하고 두 컴포넌트가
  같은 상태를 두고 다툰다. 가장 가까운 ns-table 이 자기인 요소만 자기 것이다.
  헤더 · 행 체크박스 · 전체 선택 체크박스 모두 이 검사를 거친다.
*/
K = function(t) {
  return t.closest("ns-table") === this;
}, /*
  활성 <th> 에 aria-sort 를 쓴다. 컴포넌트가 유일한 작성자다 — 소비자는 이
  속성을 쓰지 않으므로 React 와 싸우지 않는다. 삼각형은 controls.css 가
  이 속성을 받아 그린다.
*/
_t = function() {
  const t = d(this, r, St), s = d(this, r, Pt);
  for (const e of this.querySelectorAll("th[data-ns-sort-key]"))
    l(this, r, K).call(this, e) && e.setAttribute("aria-sort", e.dataset.nsSortKey === t ? s : "none");
}, T = new WeakMap(), /*
  중첩된 <ns-table> 의 행 체크박스도 바깥 호스트의 querySelectorAll 에 그대로
  잡힌다 — #owns 로 걸러 자기 것만 남긴다.
*/
ct = function() {
  return [...this.querySelectorAll("input[data-ns-row-id]")].filter(
    (t) => l(this, r, K).call(this, t)
  );
}, _ = function(t) {
  return t.dataset.nsRowId ?? "";
}, /*
    전체 선택 체크박스의 3-상태를 쓴다. checked 와 indeterminate 의 유일한
    작성자가 컴포넌트다 — 소비자는 그 둘을 바인딩하지 않는다.

    indeterminate 는 프로퍼티고 대응하는 HTML 속성이 없다. 마크업만으로는
    "일부 선택" 을 만들 수 없어서, 이것이 컴포넌트가 가져갈 값이 있는 지점이다.
  */
X = function() {
  const t = [
    ...this.querySelectorAll("input[data-ns-select-all]")
  ].filter((g) => l(this, r, K).call(this, g));
  if (t.length === 0) return;
  const s = l(this, r, ct).call(this), e = this.selected, n = e === void 0 ? s.filter((g) => g.checked).length : s.filter((g) => e.includes(l(this, r, _).call(this, g))).length, c = s.length > 0 && n === s.length, P = n > 0 && n < s.length;
  for (const g of t)
    g.checked = c, g.indeterminate = P;
}, /** 비제어 모드의 진실 — DOM 이다. 행 순서를 그대로 따른다. */
Et = function() {
  return l(this, r, ct).call(this).filter((t) => t.checked).map((t) => l(this, r, _).call(this, t));
}, /*
  **내용**으로 비교한다. 배열 정체성으로 보면 매번 새 배열이라 관찰자가 도는
  족족 "바뀌었다" 가 되어 이벤트를 스팸한다. 순서도 보지 않는다 — 소비자가
  행을 재정렬하면 같은 집합이 다른 순서로 오는데 그것은 선택 변경이 아니다.
  (같은 data-ns-row-id 가 둘인 마크업은 정의되지 않은 입력으로 둔다.)
*/
Xt = function(t, s) {
  if (t.length !== s.length) return !1;
  const e = new Set(s);
  return t.every((n) => e.has(n));
}, /*
    비제어 모드에서 소비자가 <tbody> 를 교체하면(정렬·페이지 이동·필터) 선택
    집합이 이벤트 없이 바뀐다. NsSelectChangeDetail 은 그 집합을 "요청되는 다음
    전체 집합" 이라고 규정하므로, 이벤트 없이 달라지면 소비자는 화면에 없는 행을
    선택한 채로 남는다("삭제(1건)" 이 켜져 있는데 체크된 행이 없는 상태다).
    관찰자가 차이를 발견하면 여기서 보고한다.

    제어 모드에서는 하지 않는다 — 그때의 진실은 DOM 이 아니라 selected 이고,
    소비자가 방금 쓴 값을 되돌려 주면 루프가 된다.

    재진입: 소비자 핸들러가 그 자리에서 DOM 을 또 바꾸면 관찰자가 다시 깨어난다.
    무한하지 않다 — #emitSelect 가 dispatch **전에** #reported 를 갱신하므로
    같은 집합으로 다시 그린 경우는 위 비교에서 멈춘다.
  */
Yt = function() {
  if (this.selected !== void 0) return;
  const t = l(this, r, Et).call(this), s = d(this, j);
  if (!(s !== void 0 && l(this, r, Xt).call(this, s, t))) {
    if (s === void 0 || this.ownerDocument.readyState === "loading") {
      a(this, j, t);
      return;
    }
    l(this, r, Y).call(this, t);
  }
}, Y = function(t) {
  a(this, j, t);
  const s = { ids: t };
  this.dispatchEvent(
    new CustomEvent("ns-select-change", { detail: s, bubbles: !0, composed: !0 })
  );
}, I = new WeakMap();
ot([
  u({ attribute: !1 })
], V.prototype, "sortKey");
ot([
  u({ attribute: !1 })
], V.prototype, "sortDirection");
ot([
  u({ type: String, attribute: "default-sort-key" })
], V.prototype, "defaultSortKey");
ot([
  u({ type: String, attribute: "default-sort-direction" })
], V.prototype, "defaultSortDirection");
ot([
  u({ attribute: !1 })
], V.prototype, "selected");
m("ns-table", V);
export {
  k as NsDialog,
  W as NsHeader,
  dt as NsIcon,
  ht as NsNavGroup,
  A as NsNavItem,
  J as NsPageHeading,
  it as NsPagination,
  ut as NsSidebar,
  Z as NsSkeleton,
  V as NsTable
};
