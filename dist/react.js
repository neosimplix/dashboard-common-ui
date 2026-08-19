"use client";
var It = (n) => {
  throw TypeError(n);
};
var st = (n, o, e) => o.has(n) || It("Cannot " + e);
var c = (n, o, e) => (st(n, o, "read from private field"), e ? e.call(n) : o.get(n)), h = (n, o, e) => o.has(n) ? It("Cannot add the same private member more than once") : o instanceof WeakSet ? o.add(n) : o.set(n, e), l = (n, o, e, s) => (st(n, o, "write to private field"), s ? s.call(n, e) : o.set(n, e), e), r = (n, o, e) => (st(n, o, "access private method"), e);
var Tt = (n, o, e, s) => ({
  set _(t) {
    l(n, o, t, e);
  },
  get _() {
    return c(n, o, s);
  }
});
import * as _ from "react";
import { useId as ns, isValidElement as is, cloneElement as os } from "react";
import { createComponent as S } from "@lit/react";
import { css as j, svg as nt, LitElement as P, html as v, nothing as C, ReactiveElement as Ut } from "lit";
import { svg as Mn } from "lit";
import { property as p, query as as, state as _t } from "lit/decorators.js";
import { repeat as We } from "lit/directives/repeat.js";
import { jsx as g, jsxs as A, Fragment as rs } from "react/jsx-runtime";
function $(n, o) {
  typeof window > "u" || !("customElements" in window) || customElements.get(n) || customElements.define(n, o);
}
let it = !1;
const ls = `[@neosimplix/common-ui] tokens.css 가 로드되지 않아 레이아웃이 깨집니다.
  Next/React:  import "@neosimplix/common-ui/tokens.css";
  HTML:        <link rel="stylesheet" href="…/dist/tokens.css">`, jt = () => getComputedStyle(document.documentElement).getPropertyValue("--ns-color-line").trim() !== "";
function x() {
  if (it || typeof document > "u" || typeof getComputedStyle > "u") return;
  if (jt()) {
    it = !0;
    return;
  }
  it = !0;
  const n = () => {
    jt() || console.warn(ls);
  };
  document.readyState === "complete" ? n() : window.addEventListener("load", n, { once: !0 });
}
const zt = /* @__PURE__ */ new WeakMap();
function qe(n, o) {
  for (const [e, s] of Object.entries(o)) {
    const t = [e, e.replaceAll("-", "")].find((a) => n.hasAttribute(a));
    if (t === void 0) continue;
    let i = zt.get(n);
    i === void 0 && zt.set(n, i = /* @__PURE__ */ new Set()), !i.has(t) && (i.add(t), console.warn(
      `[${n.localName}] ${t} 속성은 무시됩니다 — 이 이름은 프로퍼티 전용입니다.
  HTML 에서 쓸 것: ${s}
  JS 에서는 el.${cs(e)} 에 대입합니다.`
    ));
  }
}
const cs = (n) => n.replace(/-([a-z])/g, (o, e) => e.toUpperCase()), ds = j`
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
`, Fe = {
  menu: {
    viewBox: "0 0 20 20",
    content: nt`
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
    content: nt`
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
    content: nt`
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
};
function Ys(n) {
  Object.assign(Fe, n);
}
const hs = j`
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

  /*
    슬롯으로 들어온 것을 이 상자에 맞춘다.

    소비자가 넣는 것은 대개 자기 크기를 갖고 온다 — lucide-react 는 width/height
    속성을 24 로 찍고, 손으로 적은 <svg> 도 보통 그렇다. 그대로 두면 아이콘마다
    크기가 달라지고, 어디서 온 것이냐에 따라 --ns-icon-size 가 먹기도 안 먹기도 한다.
    여기서 정규화하면 출처와 무관하게 ns-icon 하나가 크기의 단일 권한이 된다.

    프레젠테이션 속성(width="24")은 어떤 CSS 규칙에도 지므로 선택자를 세게 쓸
    필요가 없다. 소비자가 굳이 다른 크기를 원하면 그 요소에 style 을 주면 된다 —
    인라인 스타일은 이 규칙을 이긴다.

    **이 규칙만으로는 부족하다.** ::slotted 는 shadow root 가 생긴 뒤에만 존재하므로
    upgrade 전에는 자식이 자기 크기(24)로 그려지다가 upgrade 직후 줄어든다.
    tokens.css 가 같은 선언을 "ns-icon > *" 로 문서 트리에도 두어 그 구간을 덮는다.
    둘 다 필요하다 — 문서 선택자는 다른 컴포넌트 shadow 안의 ns-icon 에 닿지 못하고,
    ::slotted 는 upgrade 전에 존재하지 않는다. 위 :host 의 크기가 tokens.css 의
    ns-icon 요소 선택자와 짝을 이루는 것과 같은 이유다.
  */
  ::slotted(*) {
    display: block;
    width: 100%;
    height: 100%;
  }
`;
var us = Object.defineProperty, ps = (n, o, e, s) => {
  for (var t = void 0, i = n.length - 1, a; i >= 0; i--)
    (a = n[i]) && (t = a(o, e, t) || t);
  return t && us(o, e, t), t;
}, se, Y, Ft, ot, ne;
let St = (ne = class extends P {
  constructor() {
    super(...arguments);
    h(this, Y);
    h(this, se);
    this.name = "", l(this, se, "");
  }
  connectedCallback() {
    super.connectedCallback(), x();
  }
  render() {
    return v`<slot>${r(this, Y, Ft).call(this)}</slot>`;
  }
  /*
      경고를 render() 가 아니라 여기서 낸다.
  
      render() 시점에는 슬롯이 아직 shadow 에 들어가지 않아 배정을 물어볼 수 없고,
      그러면 자식을 넣은 소비자에게 "없는 아이콘" 경고를 잘못 찍는다. updated() 는
      shadow 가 쓰인 뒤라 assignedNodes() 가 확정돼 있다.
    */
  updated() {
    var s;
    const e = ((s = this.renderRoot.querySelector("slot")) == null ? void 0 : s.assignedNodes()) ?? [];
    if (!e.some((t) => t.nodeType === Node.ELEMENT_NODE)) {
      if (e.length > 0) {
        r(this, Y, ot).call(this, `공백-${this.name}`, `[ns-icon] 공백만 든 자식이 슬롯을 채워 name="${this.name}" 폴백이 그려지지 않았다. <ns-icon name="${this.name}"></ns-icon> 처럼 안쪽을 붙여 쓴다.`);
        return;
      }
      this.name !== "" && !Fe[this.name] && r(this, Y, ot).call(this, `없음-${this.name}`, `[ns-icon] 없는 아이콘: "${this.name}". 사용 가능: ${Object.keys(Fe).join(", ")}. registerIcons() 로 더하거나, 자식으로 직접 넣는다 — <ns-icon><MyIcon /></ns-icon> 는 name 없이 동작한다.`);
    }
  }
}, se = new WeakMap(), Y = new WeakSet(), Ft = function() {
  if (this.name === "") return C;
  const e = Fe[this.name];
  return e ? v`<svg viewBox=${e.viewBox} fill="none" aria-hidden="true">${e.content}</svg>` : C;
}, /** 같은 사유로 리렌더될 때마다 찍지 않는다. */
ot = function(e, s) {
  c(this, se) !== e && (l(this, se, e), console.warn(s));
}, ne.styles = hs, ne);
ps([
  p({ type: String })
], St.prototype, "name");
$("ns-icon", St);
var fs = Object.defineProperty, ye = (n, o, e, s) => {
  for (var t = void 0, i = n.length - 1, a; i >= 0; i--)
    (a = n[i]) && (t = a(o, e, t) || t);
  return t && fs(o, e, t), t;
}, I, H, B, m, at, rt, lt, Se, Pe, Ee, Ae, Me, ct, Re;
const At = class At extends P {
  constructor() {
    super(...arguments);
    h(this, m);
    h(this, I);
    h(this, H);
    h(this, B);
    h(this, Se);
    h(this, Pe);
    h(this, Ee);
    h(this, Ae);
    h(this, Me);
    this.heading = "", this.defaultOpen = !1, this.noBackdropClose = !1, this.hasFooter = !1, l(this, I, !1), l(this, H, !1), l(this, B, !1), l(this, Se, (e) => {
      const s = e.target;
      this.hasFooter = s.assignedNodes({ flatten: !0 }).length > 0;
    }), l(this, Pe, () => {
      if (c(this, B)) {
        l(this, B, !1);
        return;
      }
      r(this, m, Re).call(this, "escape");
    }), l(this, Ee, () => {
      r(this, m, Re).call(this, "close-button");
    }), l(this, Ae, (e) => {
      l(this, H, r(this, m, ct).call(this, e));
    }), l(this, Me, (e) => {
      const s = c(this, H);
      l(this, H, !1), !this.noBackdropClose && e.detail !== 0 && (!s || !r(this, m, ct).call(this, e) || r(this, m, Re).call(this, "backdrop"));
    });
  }
  connectedCallback() {
    super.connectedCallback(), x(), qe(this, { open: "default-open" });
    const e = this.dialogEl;
    e != null && e.open && (l(this, B, !0), e.close()), this.requestUpdate();
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
    this.defaultOpen && l(this, I, !0);
  }
  /**
   * 비제어일 때만 연다. 제어 중이면 경고만 낸다 — 여기서 상태를 바꾸면
   * 소비자의 `open` 과 어긋나 화면이 튄다.
   */
  show() {
    r(this, m, lt).call(this, "show") || (l(this, I, !0), this.requestUpdate());
  }
  /** 비제어일 때만 닫는다. 소비자가 부른 것이므로 `ns-dialog-close` 를 내지 않는다. */
  close() {
    r(this, m, lt).call(this, "close") || (l(this, I, !1), this.requestUpdate());
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
    const e = this.dialogEl;
    e && (c(this, m, rt) && !e.open ? this.isConnected && e.showModal() : !c(this, m, rt) && e.open && (l(this, B, !0), e.close()));
  }
  render() {
    return v`
      <dialog
        aria-labelledby="dialog-heading"
        @close=${c(this, Pe)}
        @mousedown=${c(this, Ae)}
        @click=${c(this, Me)}
      >
        <div class="header">
          <h2 id="dialog-heading">${this.heading}</h2>
          <button class="close" type="button" aria-label="닫기" @click=${c(this, Ee)}>
            <ns-icon name="close"></ns-icon>
          </button>
        </div>
        <div class="body"><slot></slot></div>
        <div class="footer" ?hidden=${!this.hasFooter}>
          <slot name="footer" @slotchange=${c(this, Se)}></slot>
        </div>
      </dialog>
    `;
  }
};
I = new WeakMap(), H = new WeakMap(), B = new WeakMap(), m = new WeakSet(), at = function() {
  return this.open !== void 0;
}, rt = function() {
  return this.open ?? c(this, I);
}, lt = function(e) {
  return c(this, m, at) ? (console.warn(
    `[ns-dialog] open 프로퍼티가 설정된 제어 모드에서는 ${e}() 가 동작하지 않습니다. open 을 바꾸세요.`
  ), !0) : !1;
}, Se = new WeakMap(), Pe = new WeakMap(), Ee = new WeakMap(), Ae = new WeakMap(), Me = new WeakMap(), /*
  e.target 으로 판별하지 않는다. border-radius 모서리처럼 대화상자 자기
  표면을 클릭해도 타깃이 <dialog> 라서 backdrop 으로 오인된다.
*/
ct = function(e) {
  const s = this.dialogEl;
  if (!s) return !1;
  const t = s.getBoundingClientRect();
  return e.clientX < t.left || e.clientX > t.right || e.clientY < t.top || e.clientY > t.bottom;
}, Re = function(e) {
  c(this, m, at) || l(this, I, !1);
  const s = { reason: e };
  this.dispatchEvent(
    new CustomEvent("ns-dialog-close", { detail: s, bubbles: !0, composed: !0 })
  ), this.requestUpdate();
}, At.styles = ds;
let M = At;
ye([
  p({ type: String })
], M.prototype, "heading");
ye([
  p({ attribute: !1 })
], M.prototype, "open");
ye([
  p({ type: Boolean, attribute: "default-open" })
], M.prototype, "defaultOpen");
ye([
  p({ type: Boolean, attribute: "no-backdrop-close" })
], M.prototype, "noBackdropClose");
ye([
  as("dialog")
], M.prototype, "dialogEl");
ye([
  _t()
], M.prototype, "hasFooter");
$("ns-dialog", M);
const gs = j`
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
var vs = Object.defineProperty, Rt = (n, o, e, s) => {
  for (var t = void 0, i = n.length - 1, a; i >= 0; i--)
    (a = n[i]) && (t = a(o, e, t) || t);
  return t && vs(o, e, t), t;
}, Oe, ie;
let Je = (ie = class extends P {
  constructor() {
    super(...arguments);
    h(this, Oe);
    this.projectName = "", this.sidebarOpen = !1, l(this, Oe, () => {
      const e = { open: !this.sidebarOpen };
      this.dispatchEvent(
        new CustomEvent("ns-toggle", { detail: e, bubbles: !0, composed: !0 })
      );
    });
  }
  connectedCallback() {
    super.connectedCallback(), x();
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
          @click=${c(this, Oe)}
        >
          <ns-icon name="menu"></ns-icon>
        </button>

        <span class="title">${this.projectName}</span>

        <div class="actions"><slot name="actions"></slot></div>
      </header>
    `;
  }
}, Oe = new WeakMap(), ie.styles = gs, ie);
Rt([
  p({ type: String, attribute: "project-name" })
], Je.prototype, "projectName");
Rt([
  p({ type: Boolean, reflect: !0, attribute: "sidebar-open" })
], Je.prototype, "sidebarOpen");
$("ns-header", Je);
var bs = Object.defineProperty, U = (n, o, e, s) => {
  for (var t = void 0, i = n.length - 1, a; i >= 0; i--)
    (a = n[i]) && (t = a(o, e, t) || t);
  return t && bs(o, e, t), t;
}, De, O, Ht, dt, ht, Bt;
let D = (Bt = class extends P {
  constructor() {
    super(...arguments);
    h(this, O);
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
    h(this, De);
    this.options = [], this.defaultValue = [], this.searchPlaceholder = "검색", this.emptyMessage = "결과가 없습니다", this.inputId = "", this.inputDescribedby = "", this.query = "";
  }
  /*
      Light DOM 이다. .ns-chip · .ns-input · .ns-checkbox 를 그대로 쓰기 위해서다 —
      shadow 였다면 셋 전부를 다시 적어야 했고, 그것이 이 컴포넌트의 내용 거의
      전부다. ns-pagination 과 같은 판단이다.
  
      자식이 없으므로 Lit 이 이 요소 안에 렌더해도 덮어쓸 소비자 내용이 없다.
      그래서 LitElement 를 그대로 쓴다.
  
      static styles 는 이 재정의로 무시된다. 스타일은 전부 controls.css 에 있고
      이 컴포넌트에 .styles.ts 가 없다.
    */
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    super.connectedCallback(), x(), qe(this, {
      value: "defaultValue 프로퍼티 (배열은 속성으로 쓸 수 없습니다)",
      options: "options 프로퍼티 (배열은 속성으로 쓸 수 없습니다)",
      "default-value": "defaultValue 프로퍼티"
    });
  }
  render() {
    const e = c(this, O, dt), s = e.flatMap((a) => this.options.filter((u) => u.value === a)), t = this.query.trim().toLowerCase(), i = t === "" ? this.options : this.options.filter(
      (a) => [a.label, a.meta ?? ""].some((u) => u.toLowerCase().includes(t))
    );
    return v`
      ${s.length === 0 ? C : v`
            <div class="ns-multi-select__chips">
              ${We(
      s,
      (a) => a.value,
      (a) => v`
                  <span class="ns-chip">
                    ${a.label}
                    <button
                      class="ns-chip__remove"
                      type="button"
                      aria-label=${`${a.label} 제거`}
                      @click=${() => r(this, O, ht).call(this, a.value)}
                    >
                      ×
                    </button>
                  </span>
                `
    )}
            </div>
          `}

      <!-- 라벨·hint 는 검색창에 건다 — 이 컴포넌트에서 포커스를 받는 곳이 여기다. -->
      <input
        class="ns-input"
        type="text"
        id=${this.inputId === "" ? C : this.inputId}
        aria-describedby=${this.inputDescribedby === "" ? C : this.inputDescribedby}
        .value=${this.query}
        placeholder=${this.searchPlaceholder}
        @input=${(a) => {
      this.query = a.target.value;
    }}
      />

      <div class="ns-multi-select__list">
        ${i.length === 0 ? v`<p class="ns-multi-select__empty">${this.emptyMessage}</p>` : We(
      i,
      (a) => a.value,
      (a) => v`
                <label class="ns-checkbox">
                  <input
                    type="checkbox"
                    .checked=${e.includes(a.value)}
                    @change=${(u) => r(this, O, ht).call(this, a.value, u.target)}
                  />
                  <span>${a.label}</span>
                  ${a.meta === void 0 ? C : v`<span class="ns-checkbox__hint">${a.meta}</span>`}
                </label>
              `
    )}
      </div>
    `;
  }
}, De = new WeakMap(), O = new WeakSet(), Ht = function() {
  return this.value !== void 0;
}, dt = function() {
  return this.value ?? c(this, De) ?? this.defaultValue;
}, /**
 * @param item   토글할 값
 * @param source 이 토글을 일으킨 네이티브 체크박스. 칩의 제거 버튼에는 없다.
 */
ht = function(e, s) {
  const t = c(this, O, dt), i = t.includes(e) ? t.filter((u) => u !== e) : [...t, e];
  c(this, O, Ht) ? s !== void 0 && (s.checked = t.includes(e)) : (l(this, De, i), this.requestUpdate());
  const a = { values: i };
  this.dispatchEvent(
    new CustomEvent("ns-multi-select-change", { detail: a, bubbles: !0, composed: !0 })
  );
}, Bt);
U([
  p({ attribute: !1 })
], D.prototype, "options");
U([
  p({ attribute: !1 })
], D.prototype, "value");
U([
  p({ attribute: !1 })
], D.prototype, "defaultValue");
U([
  p({ type: String, attribute: "search-placeholder" })
], D.prototype, "searchPlaceholder");
U([
  p({ type: String, attribute: "empty-message" })
], D.prototype, "emptyMessage");
U([
  p({ type: String, attribute: "input-id" })
], D.prototype, "inputId");
U([
  p({ type: String, attribute: "input-describedby" })
], D.prototype, "inputDescribedby");
U([
  _t()
], D.prototype, "query");
$("ns-multi-select", D);
const ms = j`
  :host {
    display: block;
  }

  /*
    그룹 사이 간격. 원본은 .section + .section 이었지만 여기서는 형제가
    light DOM 의 호스트라 shadow 안에서 선택할 수 없다. ::slotted() 는
    결합자를 받지 않으므로 사이드바 쪽에서도 불가능하다. :host() 는
    복합 선택자를 받으므로 형제를 보는 방법은 이것뿐이다.

    다만 선언은 호스트가 아니라 shadow 안의 래퍼에 둔다. 호스트는 문서
    트리에 있어 소비자의 "* { margin: 0 }"(Tailwind preflight)이 :host 를
    이기고, 0.2.0 까지 여기 있던 margin-top 은 그렇게 지워지고 있었다.
    그룹이 하나뿐이면 :not(:first-child) 가 발동하지 않아 증상이 없다가
    두 번째 그룹을 만드는 순간 간격이 0 이 된다.

    margin 이 아니라 padding 인 이유는 마진 상쇄다. margin-top 을 래퍼에
    두면 호스트를 통과해 밖으로 상쇄돼 나가므로 결과는 같지만, 소비자가
    호스트에 마진을 주는 순간 둘이 상쇄돼 합이 달라진다. padding 은
    상쇄되지 않는다. 배경이 없어 보이는 결과는 margin 과 같다.
  */
  :host(:not(:first-child)) [role="group"] {
    padding-top: var(--ns-space-6);
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
var ys = Object.defineProperty, ws = (n, o, e, s) => {
  for (var t = void 0, i = n.length - 1, a; i >= 0; i--)
    (a = n[i]) && (t = a(o, e, t) || t);
  return t && ys(o, e, t), t;
}, oe;
let Pt = (oe = class extends P {
  constructor() {
    super(...arguments), this.heading = "";
  }
  connectedCallback() {
    super.connectedCallback(), x();
  }
  render() {
    return v`
      <div role="group" aria-label=${this.heading}>
        <div class="heading">${this.heading}</div>
        <div class="list"><slot></slot></div>
      </div>
    `;
  }
}, oe.styles = ms, oe);
ws([
  p({ type: String })
], Pt.prototype, "heading");
$("ns-nav-group", Pt);
const ks = j`
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
var $s = Object.defineProperty, Qe = (n, o, e, s) => {
  for (var t = void 0, i = n.length - 1, a; i >= 0; i--)
    (a = n[i]) && (t = a(o, e, t) || t);
  return t && $s(o, e, t), t;
}, Ie, ae;
let we = (ae = class extends P {
  constructor() {
    super(...arguments);
    h(this, Ie);
    this.href = "", this.label = "", this.badge = "", this.active = !1, l(this, Ie, (e) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      const s = { href: this.href, label: this.label };
      this.dispatchEvent(
        new CustomEvent("ns-navigate", { detail: s, bubbles: !0, composed: !0 })
      );
    });
  }
  connectedCallback() {
    super.connectedCallback(), x();
  }
  render() {
    return v`
      <a class="row" href=${this.href} title=${this.label} @click=${c(this, Ie)}>
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
}, Ie = new WeakMap(), ae.styles = ks, ae);
Qe([
  p({ type: String })
], we.prototype, "href");
Qe([
  p({ type: String })
], we.prototype, "label");
Qe([
  p({ type: String })
], we.prototype, "badge");
Qe([
  p({ type: Boolean, reflect: !0 })
], we.prototype, "active");
$("ns-nav-item", we);
const xs = j`
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
var Cs = Object.defineProperty, Vt = (n, o, e, s) => {
  for (var t = void 0, i = n.length - 1, a; i >= 0; i--)
    (a = n[i]) && (t = a(o, e, t) || t);
  return t && Cs(o, e, t), t;
};
const Mt = class Mt extends P {
  constructor() {
    super(...arguments), this.heading = "", this.description = "";
  }
  connectedCallback() {
    super.connectedCallback(), x();
  }
  render() {
    return v`
      <h1>${this.heading}</h1>
      ${this.description ? v`<p>${this.description}</p>` : C}
    `;
  }
};
Mt.styles = xs;
let me = Mt;
Vt([
  p({ type: String })
], me.prototype, "heading");
Vt([
  p({ type: String })
], me.prototype, "description");
$("ns-page-heading", me);
var Ns = Object.defineProperty, et = (n, o, e, s) => {
  for (var t = void 0, i = n.length - 1, a; i >= 0; i--)
    (a = n[i]) && (t = a(o, e, t) || t);
  return t && Ns(o, e, t), t;
};
function _s(n, o) {
  if (o <= 7) return Array.from({ length: o }, (i, a) => a + 1);
  const e = [1, n - 1, n, n + 1, o].filter((i) => i >= 1 && i <= o).sort((i, a) => i - a), s = [];
  let t = 0;
  for (const i of e)
    i !== t && (t !== 0 && i - t > 1 && s.push("gap"), s.push(i), t = i);
  return s;
}
var L, re, le, ce, V, y, ut, He, pt, Zt, Ve, Lt;
let ke = (Lt = class extends P {
  constructor() {
    super(...arguments);
    h(this, y);
    h(this, L);
    h(this, re);
    h(this, le);
    h(this, ce);
    h(this, V);
    this.total = 0, this.perPage = 20, this.defaultPage = 1, l(this, L, 1), l(this, re, !1), l(this, le, !1), l(this, ce, !1), l(this, V, null);
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
    super.connectedCallback(), x(), qe(this, { page: "default-page" });
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
      this.defaultPage !== 1 && l(this, L, this.defaultPage);
    }
  }
  /*
    페이지가 바뀌면 방금 누른 컨트롤로 포커스를 되돌린다. repeat() 의 키가
    번호 버튼의 정체성을 지켜 주지만, 그 버튼이 윈도우 안에서 자리를 옮기면
    lit 이 노드를 이동시키고(제거 후 삽입) 브라우저는 그때 포커스를 떨어뜨린다.
    키만으로는 부족해서 여기서 명시적으로 되돌린다.
  */
  updated() {
    var i;
    const e = c(this, V);
    if (e === null || (l(this, V, null), (this.page ?? c(this, L)) !== e.page)) return;
    const s = this.ownerDocument.activeElement;
    if (s !== null && s !== this.ownerDocument.body && !this.contains(s)) return;
    const t = typeof e.control == "number" ? `button[data-ns-page="${e.control}"]` : `button[data-ns-nav="${e.control}"]`;
    (i = this.querySelector(t)) == null || i.focus();
  }
  render() {
    const e = c(this, y, He);
    if (e <= 1) return C;
    const s = r(this, y, pt).call(this);
    return v`
      <nav aria-label="페이지 이동">
        <button
          class="ns-button ns-button--ghost ns-button--sm"
          type="button"
          data-ns-nav="prev"
          aria-disabled=${s === 1 ? "true" : C}
          @click=${() => r(this, y, Ve).call(this, "prev", s - 1)}
        >
          이전
        </button>
        ${We(
      _s(s, e),
      /*
        번호는 그 번호 자신이 정체성이다. 위치로 diff 하면 윈도우가
        줄어들 때(pageWindow(6,12) 는 7개, pageWindow(12,12) 는 4개)
        포커스가 있던 노드가 제거되고, 윈도우가 밀릴 때는 노드가 재사용되며
        라벨만 5 에서 6 으로 바뀐다 — 화면낭독기가 엉뚱한 번호를 읽는다.
        gap 은 포커스를 받지 않고 위치가 곧 정체성이라 인덱스로 구분한다.
        문자열 키라 번호 키와 섞이지 않는다.
      */
      (t, i) => t === "gap" ? `gap-${i}` : t,
      (t) => t === "gap" ? v`<span class="ns-pagination-gap" aria-hidden="true">…</span>` : v`<button
                  class=${t === s ? "ns-button ns-button--outline ns-button--sm" : "ns-button ns-button--ghost ns-button--sm"}
                  type="button"
                  data-ns-page=${t}
                  aria-current=${t === s ? "page" : C}
                  @click=${() => r(this, y, Ve).call(this, t, t)}
                >
                  ${t}
                </button>`
    )}
        <button
          class="ns-button ns-button--ghost ns-button--sm"
          type="button"
          data-ns-nav="next"
          aria-disabled=${s === e ? "true" : C}
          @click=${() => r(this, y, Ve).call(this, "next", s + 1)}
        >
          다음
        </button>
      </nav>
    `;
  }
}, L = new WeakMap(), re = new WeakMap(), le = new WeakMap(), ce = new WeakMap(), V = new WeakMap(), y = new WeakSet(), ut = function() {
  return this.page !== void 0;
}, He = function() {
  return this.perPage > 0 ? !Number.isFinite(this.total) || this.total < 0 ? (c(this, ce) || (l(this, ce, !0), console.warn(
    `[ns-pagination] total=${this.total} 은 0 이상의 유한한 수여야 합니다. 페이징을 렌더하지 않습니다.`
  )), 0) : Math.ceil(this.total / this.perPage) : (c(this, le) || (l(this, le, !0), console.warn(
    `[ns-pagination] per-page=${this.perPage} 는 1 이상이어야 합니다. 페이징을 렌더하지 않습니다.`
  )), 0);
}, /**
 * 지금 보여줄 페이지. **#pages 가 1 이상이면 언제나 1..#pages 의 정수를
 * 돌려준다** — raw 가 무엇이든 상관없다.
 */
pt = function() {
  const e = this.page ?? c(this, L), s = c(this, y, He);
  if (Number.isInteger(e) && e >= 1 && e <= s) return e;
  const t = Number.isFinite(e) ? Math.min(Math.max(Math.round(e), 1), Math.max(s, 1)) : 1;
  return c(this, re) || (l(this, re, !0), console.warn(
    c(this, y, ut) ? `[ns-pagination] page=${e} 가 1..${s} 범위를 벗어났습니다. 표시용으로 ${t} 로 보정합니다.` : `[ns-pagination] 현재 페이지 ${e} 가 total=${this.total} · per-page=${this.perPage} 로 계산된 페이지 수(${s})를 벗어났습니다. 표시용으로 ${t} 로 보정합니다.`
  )), t;
}, /** 이동했으면(= 이벤트를 냈으면) true. */
Zt = function(e) {
  if (!Number.isInteger(e) || e < 1 || e > c(this, y, He) || e === r(this, y, pt).call(this)) return !1;
  c(this, y, ut) || (l(this, L, e), this.requestUpdate());
  const s = { page: e };
  return this.dispatchEvent(
    new CustomEvent("ns-page-change", { detail: s, bubbles: !0, composed: !0 })
  ), !0;
}, /*
  실제로 이동했을 때만 포커스 의도를 남긴다. 양 끝에서 눌린 이전·다음이나
  현재 페이지 재클릭은 DOM 을 바꾸지 않으므로 되돌릴 포커스도 없다 —
  의도를 남기면 한참 뒤의 무관한 업데이트에서 소진되어 포커스를 훔친다.
*/
Ve = function(e, s) {
  r(this, y, Zt).call(this, s) && l(this, V, { control: e, page: s });
}, Lt);
et([
  p({ type: Number })
], ke.prototype, "total");
et([
  p({ type: Number, attribute: "per-page" })
], ke.prototype, "perPage");
et([
  p({ attribute: !1 })
], ke.prototype, "page");
et([
  p({ type: Number, attribute: "default-page" })
], ke.prototype, "defaultPage");
$("ns-pagination", ke);
const Ss = j`
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
    background: var(--ns-color-surface);
    transition: width 200ms var(--ns-transition-ease);
  }

  /*
    경계선과 스크롤을 호스트가 아니라 이 <nav> 가 갖는다.

    호스트는 문서 트리에 있으므로 소비자의 문서 규칙이 :host 를 이긴다.
    특정도가 아니라 캐스케이드 순서로 정해지는 것이라 :host 쪽이 아무리
    구체적이어도 진다. Tailwind preflight 의 "*, ::before, ::after,
    ::backdrop { border: 0 solid }" 가 그 규칙이고, 0.2.0 까지 여기 있던
    border-right 는 Tailwind 를 쓰는 소비자 전부에서 지워지고 있었다.
    shadow 안의 요소에는 그 규칙이 닿지 못한다.

    overflow 를 함께 내리는 이유는 스크롤바와 경계선의 순서다. 경계선만
    내리면 스크롤바가 호스트 것이라 경계선 오른쪽에 생긴다. 같은 요소가
    둘을 가져야 스크롤바가 경계선 안쪽에 남아 0.2.0 과 같게 그려진다.

    배경은 preflight 가 건드리지 않으므로 :host 에 그대로 둔다 — 소비자가
    ns-sidebar { background: … } 로 덮을 수 있는 자리를 남긴다.
  */
  nav {
    box-sizing: border-box;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    border-right: 1px solid var(--ns-color-line);
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
var Ps = Object.defineProperty, Es = (n, o, e, s) => {
  for (var t = void 0, i = n.length - 1, a; i >= 0; i--)
    (a = n[i]) && (t = a(o, e, t) || t);
  return t && Ps(o, e, t), t;
};
const Ot = class Ot extends P {
  constructor() {
    super(...arguments), this.open = !1;
  }
  connectedCallback() {
    super.connectedCallback(), x();
  }
  render() {
    return v`<nav><slot></slot></nav>`;
  }
};
Ot.styles = Ss;
let _e = Ot;
Es([
  p({ type: Boolean, reflect: !0 })
], _e.prototype, "open");
$("ns-sidebar", _e);
const As = j`
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
var Ms = Object.defineProperty, Et = (n, o, e, s) => {
  for (var t = void 0, i = n.length - 1, a; i >= 0; i--)
    (a = n[i]) && (t = a(o, e, t) || t);
  return t && Ms(o, e, t), t;
};
const Os = /* @__PURE__ */ new Set(["badge", "control", "panel", "card", "pill"]);
var Ye, Gt, de;
let Ke = (de = class extends P {
  constructor() {
    super(...arguments);
    h(this, Ye);
    this.width = "100%", this.height = "1rem", this.radius = "control";
  }
  connectedCallback() {
    super.connectedCallback(), x();
  }
  render() {
    return v`
      <div
        class="bar"
        aria-hidden="true"
        style="width:${this.width};height:${this.height};border-radius:${r(this, Ye, Gt).call(this)}"
      ></div>
    `;
  }
}, Ye = new WeakSet(), Gt = function() {
  return Os.has(this.radius) ? `var(--ns-radius-${this.radius})` : this.radius;
}, de.styles = As, de);
Et([
  p({ type: String })
], Ke.prototype, "width");
Et([
  p({ type: String })
], Ke.prototype, "height");
Et([
  p({ type: String })
], Ke.prototype, "radius");
$("ns-skeleton", Ke);
var Ds = Object.defineProperty, Ue = (n, o, e, s) => {
  for (var t = void 0, i = n.length - 1, a; i >= 0; i--)
    (a = n[i]) && (t = a(o, e, t) || t);
  return t && Ds(o, e, t), t;
};
function Is(n) {
  return n === "none" ? "ascending" : n === "ascending" ? "descending" : "none";
}
var Z, G, W, he, ue, d, Wt, ft, gt, Xt, ee, vt, pe, Ze, F, xe, bt, Yt, Jt, Ce, Qt, qt;
let J = (qt = class extends Ut {
  constructor() {
    super(...arguments);
    h(this, d);
    h(this, Z);
    h(this, G);
    /*
        비제어 모드에서 ns-select-change 로 **마지막에 보고한 집합**이다.
        `undefined` 면 아직 기준선이 없다는 뜻이고, 그때는 비교 대신 seed 만 한다.
    
        관찰자가 이것과 DOM 을 비교해 "이벤트 없이 바뀐 선택" 을 잡는다.
      */
    h(this, W);
    h(this, he);
    h(this, ue);
    h(this, pe);
    this.defaultSortKey = "", this.defaultSortDirection = "none", l(this, Z, ""), l(this, G, "none"), l(this, he, !1), l(this, pe, (e) => {
      const s = e.target, t = s == null ? void 0 : s.closest(
        'input[type="checkbox"][data-ns-select-all], input[type="checkbox"][data-ns-row-id]'
      );
      if (t && r(this, d, ee).call(this, t)) {
        r(this, d, Qt).call(this, t);
        return;
      }
      const i = s == null ? void 0 : s.closest("th[data-ns-sort-key]");
      if (!i || !r(this, d, ee).call(this, i)) return;
      const a = i.dataset.nsSortKey ?? "", u = a === c(this, d, ft) ? Is(c(this, d, gt)) : "ascending", b = u === "none" ? "" : a;
      c(this, d, Wt) || (l(this, Z, b), l(this, G, u), this.requestUpdate());
      const E = { key: b, direction: u };
      this.dispatchEvent(
        new CustomEvent("ns-sort", { detail: E, bubbles: !0, composed: !0 })
      );
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
    super.connectedCallback(), x(), qe(this, {
      "sort-key": "default-sort-key",
      "sort-direction": "default-sort-direction",
      selected: "각 행 checkbox 의 checked 속성"
    }), this.addEventListener("click", c(this, pe)), l(this, ue, new MutationObserver(() => {
      r(this, d, vt).call(this), r(this, d, xe).call(this), r(this, d, Jt).call(this);
    })), c(this, ue).observe(this, { childList: !0, subtree: !0 });
  }
  disconnectedCallback() {
    var e;
    this.removeEventListener("click", c(this, pe)), (e = c(this, ue)) == null || e.disconnect(), super.disconnectedCallback();
  }
  /*
    비제어 초기값을 seed 한다. 덮어쓰지 않는다 — Lit 은 첫 업데이트를
    마이크로태스크로 미루므로, 생성과 같은 태스크에서 프로퍼티를 만진 코드가
    여기보다 먼저 실행된다. 무조건 대입하면 그것이 경고 없이 사라진다.
  */
  firstUpdated() {
    this.defaultSortKey !== "" && l(this, Z, this.defaultSortKey), this.defaultSortDirection !== "none" && l(this, G, this.defaultSortDirection), this.selected === void 0 && l(this, W, r(this, d, bt).call(this));
  }
  updated() {
    r(this, d, Xt).call(this), r(this, d, vt).call(this), r(this, d, xe).call(this);
  }
}, Z = new WeakMap(), G = new WeakMap(), W = new WeakMap(), he = new WeakMap(), ue = new WeakMap(), d = new WeakSet(), Wt = function() {
  return this.sortKey !== void 0;
}, ft = function() {
  return this.sortKey ?? c(this, Z);
}, gt = function() {
  return this.sortDirection ?? c(this, G);
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
Xt = function() {
  c(this, he) || this.sortDirection === void 0 || this.sortKey !== void 0 || (l(this, he, !0), console.warn(
    `[ns-table] sortDirection="${this.sortDirection}" 만 설정하고 sortKey 는 설정하지 않았습니다. 둘은 짝이라 이 상태에서는 정렬 방향이 바뀌지 않습니다. 제어하려면 둘 다 설정하고, 비제어 초기값이 목적이면 default-sort-direction 을 쓰세요.`
  ));
}, /*
  Light DOM 이라 shadow 경계가 없다. 중첩된 <ns-table> 의 <th>·체크박스도 바깥
  호스트의 querySelectorAll·closest 에 그대로 잡히므로, 안쪽 헤더 클릭이나 안쪽
  체크박스가 바깥 컴포넌트에서도 처리돼 이벤트가 두 번 발생하고 두 컴포넌트가
  같은 상태를 두고 다툰다. 가장 가까운 ns-table 이 자기인 요소만 자기 것이다.
  헤더 · 행 체크박스 · 전체 선택 체크박스 모두 이 검사를 거친다.
*/
ee = function(e) {
  return e.closest("ns-table") === this;
}, /*
    활성 <th> 에만 aria-sort 를 쓴다. 컴포넌트가 유일한 작성자다 — 소비자는 이
    속성을 쓰지 않으므로 React 와 싸우지 않는다. 삼각형은 controls.css 가
    이 속성을 받아 그린다.

    **정렬 중이 아닌 칼럼에는 "none" 을 쓰지 않고 속성을 지운다.** 근거가 둘이다.

    ① aria-sort="none" 은 ARIA 의 기본값이라 속성이 없는 것과 의미가 같다.
       화면낭독기에 달라지는 것이 없다.
    ② controls.css 는 "none" 을 보지 않는다 — 삼각형은 [aria-sort="ascending"]
       과 [aria-sort="descending"] 두 규칙이 그린다. 자리는 .ns-table__sort::after
       가 opacity: 0 으로 늘 잡아 두므로 속성이 없어도 헤더 폭이 그대로다.

    그래서 지우는 편이 얻는 것이 있다. customElements.define 은 모듈 평가
    시점에 실행되므로 hydrateRoot 보다 먼저다. "none" 을 쓰면 upgrade 때
    서버 마크업에 없던 속성이 모든 정렬 칼럼에 생겨 React 가 하이드레이션
    불일치를 보고한다 — 정렬 헤더를 쓰는 Next.js 소비자 전부가 그 에러를 봤다.
    지우면 첫 페인트에 아무것도 정렬돼 있지 않은 보통의 경우에 이 컴포넌트가
    <th> 를 아예 건드리지 않으므로 마크업이 그대로 일치한다.

    default-sort-key 로 처음부터 정렬된 표는 여전히 upgrade 때 속성이 생긴다.
    그것은 진짜 상태이므로 지울 수 없다 — 그 소비자는 서버 마크업에 같은
    속성을 직접 렌더한다(index.html 의 SSR 안내).
  */
vt = function() {
  const e = c(this, d, ft), s = c(this, d, gt);
  for (const t of this.querySelectorAll("th[data-ns-sort-key]"))
    r(this, d, ee).call(this, t) && (t.dataset.nsSortKey === e && s !== "none" ? t.setAttribute("aria-sort", s) : t.removeAttribute("aria-sort"));
}, pe = new WeakMap(), /*
  중첩된 <ns-table> 의 행 체크박스도 바깥 호스트의 querySelectorAll 에 그대로
  잡힌다 — #owns 로 걸러 자기 것만 남긴다.
*/
Ze = function() {
  return [...this.querySelectorAll("input[data-ns-row-id]")].filter(
    (e) => r(this, d, ee).call(this, e)
  );
}, F = function(e) {
  return e.dataset.nsRowId ?? "";
}, /*
    전체 선택 체크박스의 3-상태를 쓴다. checked 와 indeterminate 의 유일한
    작성자가 컴포넌트다 — 소비자는 그 둘을 바인딩하지 않는다.

    indeterminate 는 프로퍼티고 대응하는 HTML 속성이 없다. 마크업만으로는
    "일부 선택" 을 만들 수 없어서, 이것이 컴포넌트가 가져갈 값이 있는 지점이다.
  */
xe = function() {
  const e = [
    ...this.querySelectorAll("input[data-ns-select-all]")
  ].filter((b) => r(this, d, ee).call(this, b));
  if (e.length === 0) return;
  const s = r(this, d, Ze).call(this), t = this.selected, i = t === void 0 ? s.filter((b) => b.checked).length : s.filter((b) => t.includes(r(this, d, F).call(this, b))).length, a = s.length > 0 && i === s.length, u = i > 0 && i < s.length;
  for (const b of e)
    b.checked = a, b.indeterminate = u;
}, /** 비제어 모드의 진실 — DOM 이다. 행 순서를 그대로 따른다. */
bt = function() {
  return r(this, d, Ze).call(this).filter((e) => e.checked).map((e) => r(this, d, F).call(this, e));
}, /*
  **내용**으로 비교한다. 배열 정체성으로 보면 매번 새 배열이라 관찰자가 도는
  족족 "바뀌었다" 가 되어 이벤트를 스팸한다. 순서도 보지 않는다 — 소비자가
  행을 재정렬하면 같은 집합이 다른 순서로 오는데 그것은 선택 변경이 아니다.
  (같은 data-ns-row-id 가 둘인 마크업은 정의되지 않은 입력으로 둔다.)
*/
Yt = function(e, s) {
  if (e.length !== s.length) return !1;
  const t = new Set(s);
  return e.every((i) => t.has(i));
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
Jt = function() {
  if (this.selected !== void 0) return;
  const e = r(this, d, bt).call(this), s = c(this, W);
  if (!(s !== void 0 && r(this, d, Yt).call(this, s, e))) {
    if (s === void 0 || this.ownerDocument.readyState === "loading") {
      l(this, W, e);
      return;
    }
    r(this, d, Ce).call(this, e);
  }
}, Ce = function(e) {
  l(this, W, e);
  const s = { ids: e };
  this.dispatchEvent(
    new CustomEvent("ns-select-change", { detail: s, bubbles: !0, composed: !0 })
  );
}, /**
 * 체크박스 하나가 활성화됐다. `box.checked` 는 **이미 뒤집힌 뒤**다.
 *
 * `change` 가 아니라 `click` 에서 부른다 — 근거는 `#onClick` 주석에 있다.
 */
Qt = function(e) {
  const s = r(this, d, Ze).call(this);
  if (e.hasAttribute("data-ns-select-all")) {
    if (this.selected === void 0)
      for (const u of s) u.checked = e.checked;
    r(this, d, Ce).call(this, e.checked ? s.map((u) => r(this, d, F).call(this, u)) : []), this.selected === void 0 && r(this, d, xe).call(this);
    return;
  }
  if (!e.hasAttribute("data-ns-row-id")) return;
  let t;
  if (this.selected === void 0) {
    t = s.filter((u) => u.checked).map((u) => r(this, d, F).call(this, u)), r(this, d, Ce).call(this, t), r(this, d, xe).call(this);
    return;
  }
  const i = new Set(this.selected), a = r(this, d, F).call(this, e);
  e.checked ? i.add(a) : i.delete(a), t = s.map((u) => r(this, d, F).call(this, u)).filter((u) => i.has(u)), r(this, d, Ce).call(this, t);
}, qt);
Ue([
  p({ attribute: !1 })
], J.prototype, "sortKey");
Ue([
  p({ attribute: !1 })
], J.prototype, "sortDirection");
Ue([
  p({ type: String, attribute: "default-sort-key" })
], J.prototype, "defaultSortKey");
Ue([
  p({ type: String, attribute: "default-sort-direction" })
], J.prototype, "defaultSortDirection");
Ue([
  p({ attribute: !1 })
], J.prototype, "selected");
$("ns-table", J);
var Ts = Object.defineProperty, es = (n, o, e, s) => {
  for (var t = void 0, i = n.length - 1, a; i >= 0; i--)
    (a = n[i]) && (t = a(o, e, t) || t);
  return t && Ts(o, e, t), t;
};
function js(n) {
  return `${n}-tab`;
}
var X, fe, ge, f, mt, Ne, R, yt, Ge, wt, kt, $t, ve, be, Kt;
let tt = (Kt = class extends Ut {
  constructor() {
    super(...arguments);
    h(this, f);
    h(this, X);
    h(this, fe);
    h(this, ge);
    h(this, ve);
    h(this, be);
    this.defaultActive = "", l(this, X, ""), l(this, ge, !1), l(this, ve, (e) => {
      const s = r(this, f, $t).call(this, e.target);
      s !== null && r(this, f, wt).call(this, r(this, f, R).call(this, s), !1);
    }), l(this, be, (e) => {
      const s = r(this, f, $t).call(this, e.target);
      if (s === null) return;
      const t = c(this, f, Ne), i = t.indexOf(s);
      if (i === -1) return;
      const a = (u) => {
        e.preventDefault(), r(this, f, wt).call(this, r(this, f, R).call(this, t[(u + t.length) % t.length]), !0);
      };
      e.key === "ArrowRight" ? a(i + 1) : e.key === "ArrowLeft" ? a(i - 1) : e.key === "Home" ? a(0) : e.key === "End" && a(t.length - 1);
    });
  }
  /*
      Light DOM 이다. 실패 경로가 둘이고 이 재정의가 둘 다 막는다 —
      ReactiveElement 를 상속해 렌더 파이프라인을 갖지 않고(소비자 자식을 덮어쓰지
      않는다), this 를 반환해 shadow root 를 만들지 않는다(자식이 가려지지 않는다).
      둘 다 에러 없이 빈 탭 줄이 된다.
  
      부수 효과로 static styles 가 무시된다. 스타일은 전부 controls.css 에 있고
      이 컴포넌트에 .styles.ts 파일이 없다.
    */
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    super.connectedCallback(), x(), qe(this, { active: "default-active" }), this.hasAttribute("role") || this.setAttribute("role", "tablist"), this.addEventListener("click", c(this, ve)), this.addEventListener("keydown", c(this, be)), l(this, fe, new MutationObserver(() => r(this, f, Ge).call(this))), c(this, fe).observe(this, { childList: !0, subtree: !0 });
  }
  disconnectedCallback() {
    var e;
    this.removeEventListener("click", c(this, ve)), this.removeEventListener("keydown", c(this, be)), (e = c(this, fe)) == null || e.disconnect(), super.disconnectedCallback();
  }
  /*
      비제어 초기값을 seed 한다. ns-pagination 과 달리 firstUpdated 로 충분하다 —
      이 컴포넌트는 render 를 갖지 않으므로 DOM 쓰기가 전부 updated() 에서 일어나고
      그것은 firstUpdated 다음이다. ns-table 과 같은 자리다.
  
      덮어쓰지 않고 seed 만 한다. Lit 은 첫 업데이트를 마이크로태스크로 미루므로,
      생성과 같은 태스크에서 프로퍼티를 만진 코드가 여기보다 먼저 실행된다.
    */
  firstUpdated() {
    this.defaultActive !== "" && l(this, X, this.defaultActive);
  }
  updated() {
    r(this, f, Ge).call(this);
  }
}, X = new WeakMap(), fe = new WeakMap(), ge = new WeakMap(), f = new WeakSet(), mt = function() {
  return this.active !== void 0;
}, Ne = function() {
  return [...this.querySelectorAll("[data-ns-tab]")].filter(
    (e) => e.closest("ns-tabs") === this
  );
}, R = function(e) {
  return e.dataset.nsTab ?? "";
}, yt = function() {
  const e = c(this, f, Ne);
  if (e.length === 0) return "";
  const s = this.active ?? c(this, X);
  if (e.some((i) => r(this, f, R).call(this, i) === s)) return s;
  const t = r(this, f, R).call(this, e[0]);
  return s !== "" && !c(this, ge) && (l(this, ge, !0), console.warn(
    c(this, f, mt) ? `[ns-tabs] active="${s}" 와 일치하는 data-ns-tab 이 없습니다. 첫 번째 탭 "${t}" 을 표시하지만 그 탭을 눌러도 ns-tab-change 가 나가지 않습니다. 대소문자까지 맞는지 확인하세요.` : `[ns-tabs] 활성 탭 "${s}" 와 일치하는 data-ns-tab 이 없습니다. 첫 번째 탭 "${t}" 을 표시합니다. default-active 값이 data-ns-tab 과 맞는지 확인하세요.`
  )), t;
}, /** 소비자 DOM 에 ARIA 와 roving tabindex 를 쓴다. 멱등이다. */
Ge = function() {
  const e = c(this, f, yt);
  for (const s of c(this, f, Ne)) {
    const t = r(this, f, R).call(this, s), i = s.dataset.nsPanel ?? "";
    s.setAttribute("role", "tab"), !s.hasAttribute("id") && i !== "" && s.setAttribute("id", js(i)), i !== "" && s.setAttribute("aria-controls", i), s.setAttribute("aria-selected", t === e ? "true" : "false"), s.setAttribute("tabindex", t === e ? "0" : "-1");
  }
}, wt = function(e, s) {
  if (e === "") return;
  if (e === c(this, f, yt)) {
    s && r(this, f, kt).call(this, e);
    return;
  }
  c(this, f, mt) || (l(this, X, e), this.requestUpdate());
  const t = { id: e };
  this.dispatchEvent(
    new CustomEvent("ns-tab-change", { detail: t, bubbles: !0, composed: !0 })
  ), r(this, f, Ge).call(this), s && r(this, f, kt).call(this, e);
}, kt = function(e) {
  var s;
  (s = c(this, f, Ne).find((t) => r(this, f, R).call(this, t) === e)) == null || s.focus();
}, /** 이벤트가 우리 탭에서 났으면 그 요소, 아니면 null. */
$t = function(e) {
  var t;
  const s = ((t = e == null ? void 0 : e.closest) == null ? void 0 : t.call(e, "[data-ns-tab]")) ?? null;
  return s === null || s.closest("ns-tabs") !== this ? null : s;
}, ve = new WeakMap(), be = new WeakMap(), Kt);
es([
  p({ attribute: !1 })
], tt.prototype, "active");
es([
  p({ type: String, attribute: "default-active" })
], tt.prototype, "defaultActive");
$("ns-tabs", tt);
const sn = S({
  react: _,
  tagName: "ns-header",
  elementClass: Je,
  events: {
    // EventName<> 브랜딩이 없으면 핸들러가 (e: Event) => void 로 타입된다.
    onNsToggle: "ns-toggle"
  }
}), nn = S({
  react: _,
  tagName: "ns-icon",
  elementClass: St,
  events: {}
}), zs = S({
  react: _,
  tagName: "ns-sidebar",
  elementClass: _e,
  events: {
    // EventName<> 브랜딩이 없으면 핸들러가 (e: Event) => void 로 타입된다.
    onNsNavigate: "ns-navigate"
  }
}), on = S({
  react: _,
  tagName: "ns-nav-group",
  elementClass: Pt,
  events: {
    // EventName<> 브랜딩이 없으면 핸들러가 (e: Event) => void 로 타입된다.
    onNsNavigate: "ns-navigate"
  }
}), an = S({
  react: _,
  tagName: "ns-nav-item",
  elementClass: we,
  events: {
    // EventName<> 브랜딩이 없으면 핸들러가 (e: Event) => void 로 타입된다.
    onNsNavigate: "ns-navigate"
  }
}), Bs = S({
  react: _,
  tagName: "ns-page-heading",
  elementClass: me,
  events: {}
}), rn = S({
  react: _,
  tagName: "ns-skeleton",
  elementClass: Ke,
  events: {}
}), Ls = S({
  react: _,
  tagName: "ns-dialog",
  elementClass: M,
  events: {
    // EventName<> 브랜딩이 없으면 핸들러가 (e: Event) => void 로 타입된다.
    onNsDialogClose: "ns-dialog-close"
  }
}), ln = S({
  react: _,
  tagName: "ns-table",
  elementClass: J,
  events: {
    // EventName<> 브랜딩이 없으면 핸들러가 (e: Event) => void 로 타입된다.
    onNsSort: "ns-sort",
    onNsSelectChange: "ns-select-change"
  }
}), cn = S({
  react: _,
  tagName: "ns-pagination",
  elementClass: ke,
  events: {
    // EventName<> 브랜딩이 없으면 핸들러가 (e: Event) => void 로 타입된다.
    onNsPageChange: "ns-page-change"
  }
}), dn = S({
  react: _,
  tagName: "ns-tabs",
  elementClass: tt,
  events: {
    // EventName<> 브랜딩이 없으면 핸들러가 (e: Event) => void 로 타입된다.
    onNsTabChange: "ns-tab-change"
  }
}), hn = S({
  react: _,
  tagName: "ns-multi-select",
  elementClass: D,
  events: {
    // EventName<> 브랜딩이 없으면 핸들러가 (e: Event) => void 로 타입된다.
    onNsMultiSelectChange: "ns-multi-select-change"
  }
});
function un({ title: n, description: o, className: e }) {
  return /* @__PURE__ */ g(Bs, { heading: n, description: o ?? "", className: e });
}
function pn({
  open: n,
  title: o,
  onClose: e,
  children: s,
  footer: t,
  noBackdropClose: i = !1,
  className: a
}) {
  return /* @__PURE__ */ A(
    Ls,
    {
      open: n,
      heading: o,
      noBackdropClose: i,
      className: a,
      onNsDialogClose: (u) => e(u.detail.reason),
      children: [
        s,
        t != null && /* @__PURE__ */ g("div", { slot: "footer", children: t })
      ]
    }
  );
}
function fn({ open: n, onNavigate: o, children: e, className: s, style: t }) {
  return /* @__PURE__ */ g(
    zs,
    {
      open: n,
      "data-ns-open": n ? "" : void 0,
      className: s,
      style: t,
      onNsNavigate: (i) => o == null ? void 0 : o(i.detail),
      children: e
    }
  );
}
function N(...n) {
  return n.filter(Boolean).join(" ");
}
function ts({ variant: n = "solid", size: o = "md", fullWidth: e = !1 }, s) {
  return N(
    "ns-button",
    `ns-button--${n}`,
    // --icon 은 자체 패딩을 쓰므로 크기 변형을 붙이지 않는다.
    n !== "icon" && `ns-button--${o}`,
    e && "ns-button--full",
    s
  );
}
function gn({
  variant: n = "solid",
  size: o = "md",
  fullWidth: e = !1,
  className: s,
  type: t = "button",
  ...i
}) {
  return /* @__PURE__ */ g(
    "button",
    {
      type: t,
      className: ts({ variant: n, size: o, fullWidth: e }, s),
      ...i
    }
  );
}
function vn({
  variant: n = "solid",
  size: o = "md",
  fullWidth: e = !1,
  className: s,
  ...t
}) {
  return /* @__PURE__ */ g("a", { className: ts({ variant: n, size: o, fullWidth: e }, s), ...t });
}
function bn({
  className: n,
  children: o,
  heading: e,
  description: s,
  actions: t,
  headingLevel: i = 2
}) {
  if (e === void 0)
    return /* @__PURE__ */ g("div", { className: N("ns-card", n), children: o });
  const a = i === 3 ? "h3" : "h2";
  return /* @__PURE__ */ A("div", { className: N("ns-card", n), children: [
    /* @__PURE__ */ A("div", { className: "ns-card__header", children: [
      /* @__PURE__ */ A("div", { children: [
        /* @__PURE__ */ g(a, { className: "ns-card__title", children: e }),
        s !== void 0 && /* @__PURE__ */ g("p", { className: "ns-card__description", children: s })
      ] }),
      t !== void 0 && /* @__PURE__ */ g("div", { className: "ns-card__actions", children: t })
    ] }),
    /* @__PURE__ */ g("div", { className: "ns-card__body", children: o })
  ] });
}
function mn({
  title: n,
  summary: o,
  defaultOpen: e,
  children: s,
  className: t,
  variant: i = "card"
}) {
  return /* @__PURE__ */ A(
    "details",
    {
      className: N("ns-accordion", `ns-accordion--${i}`, t),
      open: e,
      children: [
        /* @__PURE__ */ g("summary", { children: i === "plain" ? n : /* @__PURE__ */ A(rs, { children: [
          /* @__PURE__ */ g("span", { className: "ns-accordion__title", children: n }),
          /* @__PURE__ */ g("span", { className: "ns-accordion__meta", children: o })
        ] }) }),
        /* @__PURE__ */ g("div", { className: "ns-accordion__body", children: s })
      ]
    }
  );
}
function yn({ invalid: n = !1, className: o, ...e }) {
  return /* @__PURE__ */ g(
    "input",
    {
      className: N("ns-input", o),
      "aria-invalid": n || void 0,
      ...e
    }
  );
}
function wn({ invalid: n = !1, className: o, rows: e = 3, ...s }) {
  return /* @__PURE__ */ g(
    "textarea",
    {
      className: N("ns-textarea", o),
      "aria-invalid": n || void 0,
      rows: e,
      ...s
    }
  );
}
function kn({
  options: n,
  placeholder: o,
  invalid: e = !1,
  className: s,
  value: t,
  defaultValue: i,
  ...a
}) {
  const u = t !== void 0 ? void 0 : i !== void 0 ? i : o !== void 0 ? "" : void 0;
  return /* @__PURE__ */ A(
    "select",
    {
      className: N("ns-select", s),
      "aria-invalid": e || void 0,
      value: t,
      defaultValue: u,
      ...a,
      children: [
        o !== void 0 && /* @__PURE__ */ g("option", { value: "", disabled: !0, children: o }),
        n.map((b) => /* @__PURE__ */ g("option", { value: b.value, children: b.label }, b.value))
      ]
    }
  );
}
function $n({ label: n, hint: o, className: e, ...s }) {
  return /* @__PURE__ */ A("label", { className: N("ns-checkbox", e), children: [
    /* @__PURE__ */ g("input", { ...s, type: "checkbox" }),
    /* @__PURE__ */ g("span", { children: n }),
    o && /* @__PURE__ */ g("span", { className: "ns-checkbox__hint", children: o })
  ] });
}
function xn({ label: n, hint: o, error: e, children: s }) {
  const t = ns(), i = `${t}-hint`, a = `${t}-error`, u = !!e, b = !u && !!o;
  let E = s, z = t;
  if (is(s)) {
    const Q = s;
    z = Q.props.id ?? t;
    const k = { id: z };
    b && (k["aria-describedby"] = i), u && (k["aria-errormessage"] = a, k["aria-invalid"] = !0), E = os(Q, k);
  }
  return /* @__PURE__ */ A("div", { className: "ns-field", children: [
    /* @__PURE__ */ g("label", { htmlFor: z, className: "ns-field__label", children: n }),
    E,
    u ? /* @__PURE__ */ g("span", { id: a, className: "ns-field__error", children: e }) : b ? /* @__PURE__ */ g("span", { id: i, className: "ns-field__hint", children: o }) : null
  ] });
}
function Cn({ children: n, className: o }) {
  return /* @__PURE__ */ g("div", { className: N("ns-message", o), children: /* @__PURE__ */ g("p", { children: n }) });
}
function Nn({
  children: n,
  selected: o,
  onClick: e,
  onRemove: s,
  removeLabel: t = "제거",
  disabled: i = !1,
  className: a
}) {
  return o !== void 0 ? /* @__PURE__ */ g(
    "button",
    {
      type: "button",
      role: "checkbox",
      "aria-checked": o,
      disabled: i,
      onClick: e,
      className: N("ns-chip", a),
      children: n
    }
  ) : s !== void 0 ? /* @__PURE__ */ A("span", { className: N("ns-chip", a), children: [
    n,
    /* @__PURE__ */ g(
      "button",
      {
        type: "button",
        "aria-label": t,
        disabled: i,
        onClick: s,
        className: "ns-chip__remove",
        children: "×"
      }
    )
  ] }) : /* @__PURE__ */ g("span", { className: N("ns-chip", a), children: n });
}
const qs = j`
  :host {
    position: fixed;
    right: var(--ns-space-4);
    bottom: var(--ns-space-4);
    /*
      **이 숫자를 올려도 열려 있는 모달 ns-dialog 를 이길 수 없다.** showModal() 은
      대화상자를 top layer 로 올리고, top layer 는 통상 스태킹 컨텍스트의 모든
      z-index 위에 있다 — 정수 하나로 닿는 곳이 아니다. 대화상자가 열린 채로 띄운
      토스트는 대화상자와 ::backdrop 뒤에 가려 보이지도 눌리지도 않는다.

      Popover API(showPopover)로 이 리전도 top layer 에 올릴 수 있지만 쓰지 않는다.
      이유는 하나, 브라우저 하한이다 — showPopover 는 Firefox 125+ 인데 이 패키지의
      문서화된 하한은 Firefox 121 이다.

      (UA 의 [popover] 규칙이 border·padding 을 넣는 것은 이유가 아니다.
      check-tokens.mjs 규칙 ④ 는 no-op 값을 면제하므로 :host { border: none;
      padding: 0 } 으로 되돌리면 통과한다.)

      해결은 문서다 — index.html 의 nsToast 절 "주의" 에 적혀 있다.
    */
    z-index: 1000;
    display: block;
    /* 토스트가 없는 동안 화면 오른쪽 아래 클릭을 가로채지 않는다. */
    pointer-events: none;
  }

  .region {
    display: flex;
    flex-direction: column;
    gap: var(--ns-space-2);
    /* 좁은 화면에서 화면 밖으로 나가지 않게 한다. */
    max-width: min(24rem, calc(100vw - var(--ns-space-8)));
  }

  .toast {
    display: flex;
    align-items: flex-start;
    gap: var(--ns-space-3);
    padding: var(--ns-space-3) var(--ns-space-4);
    border: 1px solid var(--ns-color-line);
    border-radius: var(--ns-radius-panel);
    background: var(--ns-color-surface);
    box-shadow: var(--ns-elevation-card);
    font-size: var(--ns-font-size-sm);
    line-height: var(--ns-line-height-sm);
    color: var(--ns-color-fg-body);
    /* :host 가 pointer-events 를 껐으므로 항목에서만 되살린다. */
    pointer-events: auto;
  }

  /*
    tone 은 왼쪽 색 띠 하나로만 표현한다. 배경을 칠하면 글자 대비를 다시 정해야 한다.

    neutral 도 같은 두께의 띠를 갖는다. 없으면 색 있는 것만 3px 두꺼워져
    쌓였을 때 neutral 만 안쪽 폭이 넓고 글자 시작점이 어긋난다.

    색은 var(--ns-color-line) 이다 — .toast 의 다른 세 변과 같은 색이라 눈이
    "이 변만 두껍다" 로 읽지 "색 띠가 있다" 로 읽지 않는다. --ns-color-line 은
    채도가 0.004–0.006 로 무채색에 가깝고 모든 tone 은 유채색이라 neutral 이
    tone 처럼 보일 일도 없다. transparent 를 쓰면 밝은 모드에서 토스트 표면과
    페이지의 sunken 배경 명도차가 1.5%p 뿐이라 왼쪽 변이 사실상 사라진다.
  */
  .toast          { border-left: 3px solid var(--ns-color-line); }
  .toast.success  { border-left-color: var(--ns-color-success); }
  .toast.danger   { border-left-color: var(--ns-color-danger); }
  .toast.warn     { border-left-color: var(--ns-color-warn); }

  .message {
    flex: 1;
    min-width: 0;
    /* 긴 메시지가 한 줄로 넘치지 않게 한다. */
    overflow-wrap: anywhere;
  }

  .close {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--ns-space-1);
    border: 0;
    border-radius: var(--ns-radius-control);
    background: none;
    color: var(--ns-color-fg-muted);
    cursor: pointer;
  }

  .close:hover {
    background: var(--ns-color-surface-hover);
    color: var(--ns-color-fg);
  }

  .close:focus-visible {
    outline: 2px solid var(--ns-color-accent);
    outline-offset: 2px;
  }
`;
var Ks = Object.defineProperty, Us = (n, o, e, s) => {
  for (var t = void 0, i = n.length - 1, a; i >= 0; i--)
    (a = n[i]) && (t = a(o, e, t) || t);
  return t && Ks(o, e, t), t;
}, Te, q, T, K, w, xt, Ct, Nt, te, je, ze, Be, Le;
const Dt = class Dt extends P {
  constructor() {
    super(...arguments);
    h(this, w);
    h(this, Te);
    h(this, q);
    h(this, T);
    h(this, K);
    h(this, je);
    h(this, ze);
    h(this, Be);
    h(this, Le);
    this.items = [], l(this, Te, 0), l(this, q, !1), l(this, T, !1), l(this, K, !1), l(this, je, () => {
      l(this, q, !0), r(this, w, te).call(this);
    }), l(this, ze, () => {
      l(this, q, !1), r(this, w, te).call(this);
    }), l(this, Be, () => {
      l(this, T, !0), r(this, w, te).call(this);
    }), l(this, Le, () => {
      l(this, T, !1), r(this, w, te).call(this);
    });
  }
  connectedCallback() {
    super.connectedCallback(), x(), r(this, w, Nt).call(this);
  }
  disconnectedCallback() {
    r(this, w, Ct).call(this), l(this, q, !1), l(this, T, !1), l(this, K, !1), super.disconnectedCallback();
  }
  /** 토스트 하나를 띄운다. 돌려주는 함수를 부르면 즉시 닫는다(두 번 불러도 안전). */
  show(e, s, t) {
    const i = Tt(this, Te)._++, a = {
      key: i,
      message: e,
      tone: s,
      duration: t,
      remaining: t,
      startedAt: Date.now()
    };
    return this.items = [...this.items, a], c(this, K) || r(this, w, xt).call(this, a), () => this.dismiss(i);
  }
  /** 이미 사라진 키를 줘도 아무 일도 하지 않는다. */
  dismiss(e) {
    const s = this.items.find((t) => t.key === e);
    s !== void 0 && (s.timer !== void 0 && clearTimeout(s.timer), this.items = this.items.filter((t) => t.key !== e));
  }
  /*
      **포커스된 요소가 DOM 에서 사라져도 브라우저는 focusout 을 내지 않는다.**
      닫기 버튼을 눌러 그 토스트가 없어지는 것이 정확히 그 경로다(클릭이 포커스를
      주는 플랫폼에서). 그대로 두면 #focused 가 true 로 굳어 남은 토스트가 영원히
      멈추고, 그 뒤에 뜨는 토스트도 타이머 없이 쌓인다.
  
      갱신을 마친 시점의 shadow 안 실제 포커스가 유일하게 믿을 수 있는 값이므로
      거기서 다시 맞춘다. #hovered 는 손대지 않는다 — :hover 는 스타일 재계산에
      묶여 있어 마우스가 아직 올라가 있는데도 false 로 읽힐 수 있고, 그러면 이 고침이
      막으려던 바로 그 고장(읽는 중에 사라짐)을 다시 만든다. .region 요소는 리렌더에도
      살아남으므로 mouseleave 는 실제로 도착한다.
    */
  updated() {
    var e;
    l(this, T, ((e = this.shadowRoot) == null ? void 0 : e.activeElement) != null), r(this, w, te).call(this);
  }
  render() {
    return v`
      <div
        class="region"
        aria-live="polite"
        @mouseenter=${c(this, je)}
        @mouseleave=${c(this, ze)}
        @focusin=${c(this, Be)}
        @focusout=${c(this, Le)}
      >
        ${We(
      this.items,
      (e) => e.key,
      (e) => v`
            <div class="toast ${e.tone}" role=${e.tone === "danger" ? "alert" : C}>
              <span class="message">${e.message}</span>
              <button
                class="close"
                type="button"
                aria-label="닫기"
                @click=${() => this.dismiss(e.key)}
              >
                <ns-icon name="close"></ns-icon>
              </button>
            </div>
          `
    )}
      </div>
    `;
  }
};
Te = new WeakMap(), q = new WeakMap(), T = new WeakMap(), K = new WeakMap(), w = new WeakSet(), /** duration 이 0 이거나 이미 돌고 있으면 아무 일도 하지 않는다(재개가 멱등한 근거). */
xt = function(e) {
  e.duration <= 0 || e.timer !== void 0 || (e.startedAt = Date.now(), e.timer = window.setTimeout(() => this.dismiss(e.key), e.remaining));
}, /*
    마우스가 올라가 있거나 안쪽에 포커스가 있는 동안 자동 소멸을 멈춘다.
    안 멈추면 읽는 중에, 혹은 닫기 버튼에 Tab 으로 닿는 중에 사라진다.

    items 배열을 갈아 끼우지 않고 항목을 직접 고친다 — 화면에 보이는 것이 하나도
    바뀌지 않으므로 리렌더할 이유가 없다.
  */
Ct = function() {
  for (const e of this.items)
    e.timer !== void 0 && (clearTimeout(e.timer), e.timer = void 0, e.remaining = Math.max(0, e.remaining - (Date.now() - e.startedAt)));
}, Nt = function() {
  for (const e of this.items) r(this, w, xt).call(this, e);
}, /*
  두 사유를 하나의 적용 상태로 접는다. 사유가 바뀔 때마다 부르고, 실제 정지·재개는
  상태가 뒤집힐 때만 일어난다.
*/
te = function() {
  const e = c(this, q) || c(this, T);
  e !== c(this, K) && (l(this, K, e), e ? r(this, w, Ct).call(this) : r(this, w, Nt).call(this));
}, je = new WeakMap(), ze = new WeakMap(), Be = new WeakMap(), Le = new WeakMap(), Dt.styles = qs;
let Xe = Dt;
Us([
  _t()
], Xe.prototype, "items");
$("ns-toast", Xe);
function Fs() {
  const n = document.querySelector("ns-toast");
  if (n !== null) return n;
  const o = document.createElement("ns-toast");
  return document.body.append(o), o;
}
function _n(n, o = {}) {
  if (typeof document > "u") return () => {
  };
  const { tone: e = "neutral", duration: s = 4e3 } = o;
  return Fs().show(n, e, s);
}
function ss(n, o, e) {
  const s = document.activeElement, t = document.createElement("ns-dialog");
  t.heading = n.heading ?? "";
  const i = document.createElement("p");
  i.textContent = n.message, i.style.margin = "0", t.append(i);
  let a = !1;
  const u = (k) => {
    if (a) return;
    a = !0, t.close();
    const $e = () => {
      t.remove(), e(k), s instanceof HTMLElement && s.isConnected && s.focus();
    };
    t.updateComplete.then($e, $e);
  }, b = async (k) => {
    for (let $e = 0; $e < 5; $e++)
      if (await t.updateComplete, a || (k.focus({ preventScroll: !0 }), document.activeElement === k)) return;
    console.warn(
      "[ns-confirm] 취소 버튼에 초기 포커스를 주지 못했습니다. ns-dialog 의 갱신 순서가 바뀌었을 수 있습니다."
    );
  }, E = document.createElement("button");
  E.type = "button", E.className = n.tone === "danger" ? "ns-button ns-button--danger ns-button--sm" : "ns-button ns-button--solid ns-button--sm", E.textContent = n.confirmLabel ?? "확인", E.addEventListener("click", () => u(!0));
  const z = document.createElement("div");
  z.slot = "footer";
  let Q = null;
  if (o) {
    const k = document.createElement("button");
    k.type = "button", k.className = "ns-button ns-button--outline ns-button--sm", k.textContent = n.cancelLabel ?? "취소", k.addEventListener("click", () => u(!1)), n.tone === "danger" && (Q = k), z.append(k);
  }
  z.append(E), t.append(z), t.addEventListener("ns-dialog-close", () => u(!1)), document.body.append(t), t.show(), Q !== null && b(Q);
}
function Sn(n) {
  return typeof document > "u" ? Promise.resolve() : new Promise((o) => {
    ss(n, !1, () => o());
  });
}
function Pn(n) {
  return typeof document > "u" ? Promise.resolve(!1) : new Promise((o) => {
    ss(n, !0, o);
  });
}
export {
  mn as Accordion,
  gn as Button,
  vn as ButtonLink,
  bn as Card,
  $n as Checkbox,
  Nn as Chip,
  pn as Dialog,
  xn as Field,
  yn as Input,
  Cn as Message,
  sn as NsHeader,
  nn as NsIcon,
  hn as NsMultiSelect,
  on as NsNavGroup,
  an as NsNavItem,
  cn as NsPagination,
  rn as NsSkeleton,
  ln as NsTable,
  dn as NsTabs,
  un as PageHeading,
  kn as Select,
  fn as Sidebar,
  wn as Textarea,
  Sn as nsAlert,
  Pn as nsConfirm,
  _n as nsToast,
  Ys as registerIcons,
  Mn as svg,
  js as tabIdFor
};
