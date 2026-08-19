var Ae = (i) => {
  throw TypeError(i);
};
var Zt = (i, o, t) => o.has(i) || Ae("Cannot " + t);
var c = (i, o, t) => (Zt(i, o, "read from private field"), t ? t.call(i) : o.get(i)), h = (i, o, t) => o.has(i) ? Ae("Cannot add the same private member more than once") : o instanceof WeakSet ? o.add(i) : o.set(i, t), l = (i, o, t, s) => (Zt(i, o, "write to private field"), s ? s.call(i, t) : o.set(i, t), t), a = (i, o, t) => (Zt(i, o, "access private method"), t);
var Me = (i, o, t, s) => ({
  set _(e) {
    l(i, o, e, t);
  },
  get _() {
    return c(i, o, s);
  }
});
import { css as A, svg as Wt, LitElement as C, html as g, nothing as $, ReactiveElement as De } from "lit";
import { svg as Ts } from "lit";
import { property as u, query as Ze, state as be } from "lit/decorators.js";
import { repeat as Kt } from "lit/directives/repeat.js";
function w(i, o) {
  typeof window > "u" || !("customElements" in window) || customElements.get(i) || customElements.define(i, o);
}
let Xt = !1;
const We = `[@neosimplix/common-ui] tokens.css 가 로드되지 않아 레이아웃이 깨집니다.
  Next/React:  import "@neosimplix/common-ui/tokens.css";
  HTML:        <link rel="stylesheet" href="…/dist/tokens.css">`, Oe = () => getComputedStyle(document.documentElement).getPropertyValue("--ns-color-line").trim() !== "";
function k() {
  if (Xt || typeof document > "u" || typeof getComputedStyle > "u") return;
  if (Oe()) {
    Xt = !0;
    return;
  }
  Xt = !0;
  const i = () => {
    Oe() || console.warn(We);
  };
  document.readyState === "complete" ? i() : window.addEventListener("load", i, { once: !0 });
}
const ze = /* @__PURE__ */ new WeakMap();
function _t(i, o) {
  for (const [t, s] of Object.entries(o)) {
    const e = [t, t.replaceAll("-", "")].find((r) => i.hasAttribute(r));
    if (e === void 0) continue;
    let n = ze.get(i);
    n === void 0 && ze.set(i, n = /* @__PURE__ */ new Set()), !n.has(e) && (n.add(e), console.warn(
      `[${i.localName}] ${e} 속성은 무시됩니다 — 이 이름은 프로퍼티 전용입니다.
  HTML 에서 쓸 것: ${s}
  JS 에서는 el.${Xe(t)} 에 대입합니다.`
    ));
  }
}
const Xe = (i) => i.replace(/-([a-z])/g, (o, t) => t.toUpperCase()), Ye = A`
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
`, zt = {
  menu: {
    viewBox: "0 0 20 20",
    content: Wt`
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
    content: Wt`
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
    content: Wt`
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
function Os(i) {
  Object.assign(zt, i);
}
const Je = A`
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
var Qe = Object.defineProperty, Ge = (i, o, t, s) => {
  for (var e = void 0, n = i.length - 1, r; n >= 0; n--)
    (r = i[n]) && (e = r(o, t, e) || e);
  return e && Qe(o, t, e), e;
}, X, N, je, Yt;
const we = class we extends C {
  constructor() {
    super(...arguments);
    h(this, N);
    h(this, X);
    this.name = "", l(this, X, "");
  }
  connectedCallback() {
    super.connectedCallback(), k();
  }
  render() {
    return g`<slot>${a(this, N, je).call(this)}</slot>`;
  }
  /*
      경고를 render() 가 아니라 여기서 낸다.
  
      render() 시점에는 슬롯이 아직 shadow 에 들어가지 않아 배정을 물어볼 수 없고,
      그러면 자식을 넣은 소비자에게 "없는 아이콘" 경고를 잘못 찍는다. updated() 는
      shadow 가 쓰인 뒤라 assignedNodes() 가 확정돼 있다.
    */
  updated() {
    var s;
    const t = ((s = this.renderRoot.querySelector("slot")) == null ? void 0 : s.assignedNodes()) ?? [];
    if (!t.some((e) => e.nodeType === Node.ELEMENT_NODE)) {
      if (t.length > 0) {
        a(this, N, Yt).call(this, `공백-${this.name}`, `[ns-icon] 공백만 든 자식이 슬롯을 채워 name="${this.name}" 폴백이 그려지지 않았다. <ns-icon name="${this.name}"></ns-icon> 처럼 안쪽을 붙여 쓴다.`);
        return;
      }
      this.name !== "" && !zt[this.name] && a(this, N, Yt).call(this, `없음-${this.name}`, `[ns-icon] 없는 아이콘: "${this.name}". 사용 가능: ${Object.keys(zt).join(", ")}. registerIcons() 로 더하거나, 자식으로 직접 넣는다 — <ns-icon><MyIcon /></ns-icon> 는 name 없이 동작한다.`);
    }
  }
};
X = new WeakMap(), N = new WeakSet(), je = function() {
  if (this.name === "") return $;
  const t = zt[this.name];
  return t ? g`<svg viewBox=${t.viewBox} fill="none" aria-hidden="true">${t.content}</svg>` : $;
}, /** 같은 사유로 리렌더될 때마다 찍지 않는다. */
Yt = function(t, s) {
  c(this, X) !== t && (l(this, X, t), console.warn(s));
}, we.styles = Je;
let Ut = we;
Ge([
  u({ type: String })
], Ut.prototype, "name");
w("ns-icon", Ut);
var ts = Object.defineProperty, at = (i, o, t, s) => {
  for (var e = void 0, n = i.length - 1, r; n >= 0; n--)
    (r = i[n]) && (e = r(o, t, e) || e);
  return e && ts(o, t, e), e;
}, P, U, O, v, Jt, Qt, Gt, gt, vt, bt, mt, yt, te, Dt;
const ke = class ke extends C {
  constructor() {
    super(...arguments);
    h(this, v);
    h(this, P);
    h(this, U);
    h(this, O);
    h(this, gt);
    h(this, vt);
    h(this, bt);
    h(this, mt);
    h(this, yt);
    this.heading = "", this.defaultOpen = !1, this.noBackdropClose = !1, this.hasFooter = !1, l(this, P, !1), l(this, U, !1), l(this, O, !1), l(this, gt, (t) => {
      const s = t.target;
      this.hasFooter = s.assignedNodes({ flatten: !0 }).length > 0;
    }), l(this, vt, () => {
      if (c(this, O)) {
        l(this, O, !1);
        return;
      }
      a(this, v, Dt).call(this, "escape");
    }), l(this, bt, () => {
      a(this, v, Dt).call(this, "close-button");
    }), l(this, mt, (t) => {
      l(this, U, a(this, v, te).call(this, t));
    }), l(this, yt, (t) => {
      const s = c(this, U);
      l(this, U, !1), !this.noBackdropClose && t.detail !== 0 && (!s || !a(this, v, te).call(this, t) || a(this, v, Dt).call(this, "backdrop"));
    });
  }
  connectedCallback() {
    super.connectedCallback(), k(), _t(this, { open: "default-open" });
    const t = this.dialogEl;
    t != null && t.open && (l(this, O, !0), t.close()), this.requestUpdate();
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
    this.defaultOpen && l(this, P, !0);
  }
  /**
   * 비제어일 때만 연다. 제어 중이면 경고만 낸다 — 여기서 상태를 바꾸면
   * 소비자의 `open` 과 어긋나 화면이 튄다.
   */
  show() {
    a(this, v, Gt).call(this, "show") || (l(this, P, !0), this.requestUpdate());
  }
  /** 비제어일 때만 닫는다. 소비자가 부른 것이므로 `ns-dialog-close` 를 내지 않는다. */
  close() {
    a(this, v, Gt).call(this, "close") || (l(this, P, !1), this.requestUpdate());
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
    t && (c(this, v, Qt) && !t.open ? this.isConnected && t.showModal() : !c(this, v, Qt) && t.open && (l(this, O, !0), t.close()));
  }
  render() {
    return g`
      <dialog
        aria-labelledby="dialog-heading"
        @close=${c(this, vt)}
        @mousedown=${c(this, mt)}
        @click=${c(this, yt)}
      >
        <div class="header">
          <h2 id="dialog-heading">${this.heading}</h2>
          <button class="close" type="button" aria-label="닫기" @click=${c(this, bt)}>
            <ns-icon name="close"></ns-icon>
          </button>
        </div>
        <div class="body"><slot></slot></div>
        <div class="footer" ?hidden=${!this.hasFooter}>
          <slot name="footer" @slotchange=${c(this, gt)}></slot>
        </div>
      </dialog>
    `;
  }
};
P = new WeakMap(), U = new WeakMap(), O = new WeakMap(), v = new WeakSet(), Jt = function() {
  return this.open !== void 0;
}, Qt = function() {
  return this.open ?? c(this, P);
}, Gt = function(t) {
  return c(this, v, Jt) ? (console.warn(
    `[ns-dialog] open 프로퍼티가 설정된 제어 모드에서는 ${t}() 가 동작하지 않습니다. open 을 바꾸세요.`
  ), !0) : !1;
}, gt = new WeakMap(), vt = new WeakMap(), bt = new WeakMap(), mt = new WeakMap(), yt = new WeakMap(), /*
  e.target 으로 판별하지 않는다. border-radius 모서리처럼 대화상자 자기
  표면을 클릭해도 타깃이 <dialog> 라서 backdrop 으로 오인된다.
*/
te = function(t) {
  const s = this.dialogEl;
  if (!s) return !1;
  const e = s.getBoundingClientRect();
  return t.clientX < e.left || t.clientX > e.right || t.clientY < e.top || t.clientY > e.bottom;
}, Dt = function(t) {
  c(this, v, Jt) || l(this, P, !1);
  const s = { reason: t };
  this.dispatchEvent(
    new CustomEvent("ns-dialog-close", { detail: s, bubbles: !0, composed: !0 })
  ), this.requestUpdate();
}, ke.styles = Ye;
let _ = ke;
at([
  u({ type: String })
], _.prototype, "heading");
at([
  u({ attribute: !1 })
], _.prototype, "open");
at([
  u({ type: Boolean, attribute: "default-open" })
], _.prototype, "defaultOpen");
at([
  u({ type: Boolean, attribute: "no-backdrop-close" })
], _.prototype, "noBackdropClose");
at([
  Ze("dialog")
], _.prototype, "dialogEl");
at([
  be()
], _.prototype, "hasFooter");
w("ns-dialog", _);
const es = A`
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
var ss = Object.defineProperty, Le = (i, o, t, s) => {
  for (var e = void 0, n = i.length - 1, r; n >= 0; n--)
    (r = i[n]) && (e = r(o, t, e) || e);
  return e && ss(o, t, e), e;
}, wt;
const $e = class $e extends C {
  constructor() {
    super(...arguments);
    h(this, wt);
    this.projectName = "", this.sidebarOpen = !1, l(this, wt, () => {
      const t = { open: !this.sidebarOpen };
      this.dispatchEvent(
        new CustomEvent("ns-toggle", { detail: t, bubbles: !0, composed: !0 })
      );
    });
  }
  connectedCallback() {
    super.connectedCallback(), k();
  }
  /*
    토글 아이콘은 <ns-icon name="menu"> 를 쓴다. 이전에는 여기서 svg 를 손으로
    그렸는데 icons.ts 의 "menu" 와 viewBox·stroke-width 가 달랐다 — 소비자가
    actions slot 에 .ns-button--icon + <ns-icon> 을 넣으면 이 토글 바로 옆에
    굵기가 다른 같은 모양이 나란히 서서 버그로 읽혔다. 아이콘은 한 곳에서만
    정의한다.
  */
  render() {
    return g`
      <header>
        <button
          class="toggle"
          type="button"
          aria-expanded=${this.sidebarOpen ? "true" : "false"}
          aria-label=${this.sidebarOpen ? "사이드바 닫기" : "사이드바 열기"}
          @click=${c(this, wt)}
        >
          <ns-icon name="menu"></ns-icon>
        </button>

        <span class="title">${this.projectName}</span>

        <div class="actions"><slot name="actions"></slot></div>
      </header>
    `;
  }
};
wt = new WeakMap(), $e.styles = es;
let pt = $e;
Le([
  u({ type: String, attribute: "project-name" })
], pt.prototype, "projectName");
Le([
  u({ type: Boolean, reflect: !0, attribute: "sidebar-open" })
], pt.prototype, "sidebarOpen");
w("ns-header", pt);
var ns = Object.defineProperty, L = (i, o, t, s) => {
  for (var e = void 0, n = i.length - 1, r; n >= 0; n--)
    (r = i[n]) && (e = r(o, t, e) || e);
  return e && ns(o, t, e), e;
}, kt, E, qe, ee, se;
class M extends C {
  constructor() {
    super(...arguments);
    h(this, E);
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
    h(this, kt);
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
    super.connectedCallback(), k(), _t(this, {
      value: "defaultValue 프로퍼티 (배열은 속성으로 쓸 수 없습니다)",
      options: "options 프로퍼티 (배열은 속성으로 쓸 수 없습니다)",
      "default-value": "defaultValue 프로퍼티"
    });
  }
  render() {
    const t = c(this, E, ee), s = t.flatMap((r) => this.options.filter((f) => f.value === r)), e = this.query.trim().toLowerCase(), n = e === "" ? this.options : this.options.filter(
      (r) => [r.label, r.meta ?? ""].some((f) => f.toLowerCase().includes(e))
    );
    return g`
      ${s.length === 0 ? $ : g`
            <div class="ns-multi-select__chips">
              ${Kt(
      s,
      (r) => r.value,
      (r) => g`
                  <span class="ns-chip">
                    ${r.label}
                    <button
                      class="ns-chip__remove"
                      type="button"
                      aria-label=${`${r.label} 제거`}
                      @click=${() => a(this, E, se).call(this, r.value)}
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
        id=${this.inputId === "" ? $ : this.inputId}
        aria-describedby=${this.inputDescribedby === "" ? $ : this.inputDescribedby}
        .value=${this.query}
        placeholder=${this.searchPlaceholder}
        @input=${(r) => {
      this.query = r.target.value;
    }}
      />

      <div class="ns-multi-select__list">
        ${n.length === 0 ? g`<p class="ns-multi-select__empty">${this.emptyMessage}</p>` : Kt(
      n,
      (r) => r.value,
      (r) => g`
                <label class="ns-checkbox">
                  <input
                    type="checkbox"
                    .checked=${t.includes(r.value)}
                    @change=${(f) => a(this, E, se).call(this, r.value, f.target)}
                  />
                  <span>${r.label}</span>
                  ${r.meta === void 0 ? $ : g`<span class="ns-checkbox__hint">${r.meta}</span>`}
                </label>
              `
    )}
      </div>
    `;
  }
}
kt = new WeakMap(), E = new WeakSet(), qe = function() {
  return this.value !== void 0;
}, ee = function() {
  return this.value ?? c(this, kt) ?? this.defaultValue;
}, /**
 * @param item   토글할 값
 * @param source 이 토글을 일으킨 네이티브 체크박스. 칩의 제거 버튼에는 없다.
 */
se = function(t, s) {
  const e = c(this, E, ee), n = e.includes(t) ? e.filter((f) => f !== t) : [...e, t];
  c(this, E, qe) ? s !== void 0 && (s.checked = e.includes(t)) : (l(this, kt, n), this.requestUpdate());
  const r = { values: n };
  this.dispatchEvent(
    new CustomEvent("ns-multi-select-change", { detail: r, bubbles: !0, composed: !0 })
  );
};
L([
  u({ attribute: !1 })
], M.prototype, "options");
L([
  u({ attribute: !1 })
], M.prototype, "value");
L([
  u({ attribute: !1 })
], M.prototype, "defaultValue");
L([
  u({ type: String, attribute: "search-placeholder" })
], M.prototype, "searchPlaceholder");
L([
  u({ type: String, attribute: "empty-message" })
], M.prototype, "emptyMessage");
L([
  u({ type: String, attribute: "input-id" })
], M.prototype, "inputId");
L([
  u({ type: String, attribute: "input-describedby" })
], M.prototype, "inputDescribedby");
L([
  be()
], M.prototype, "query");
w("ns-multi-select", M);
const is = A`
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
var os = Object.defineProperty, rs = (i, o, t, s) => {
  for (var e = void 0, n = i.length - 1, r; n >= 0; n--)
    (r = i[n]) && (e = r(o, t, e) || e);
  return e && os(o, t, e), e;
};
const xe = class xe extends C {
  constructor() {
    super(...arguments), this.heading = "";
  }
  connectedCallback() {
    super.connectedCallback(), k();
  }
  render() {
    return g`
      <div role="group" aria-label=${this.heading}>
        <div class="heading">${this.heading}</div>
        <div class="list"><slot></slot></div>
      </div>
    `;
  }
};
xe.styles = is;
let Bt = xe;
rs([
  u({ type: String })
], Bt.prototype, "heading");
w("ns-nav-group", Bt);
const as = A`
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
var ls = Object.defineProperty, Vt = (i, o, t, s) => {
  for (var e = void 0, n = i.length - 1, r; n >= 0; n--)
    (r = i[n]) && (e = r(o, t, e) || e);
  return e && ls(o, t, e), e;
}, $t;
const Ce = class Ce extends C {
  constructor() {
    super(...arguments);
    h(this, $t);
    this.href = "", this.label = "", this.badge = "", this.active = !1, l(this, $t, (t) => {
      if (t.button !== 0 || t.metaKey || t.ctrlKey || t.shiftKey || t.altKey) return;
      t.preventDefault();
      const s = { href: this.href, label: this.label };
      this.dispatchEvent(
        new CustomEvent("ns-navigate", { detail: s, bubbles: !0, composed: !0 })
      );
    });
  }
  connectedCallback() {
    super.connectedCallback(), k();
  }
  render() {
    return g`
      <a class="row" href=${this.href} title=${this.label} @click=${c(this, $t)}>
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
$t = new WeakMap(), Ce.styles = as;
let H = Ce;
Vt([
  u({ type: String })
], H.prototype, "href");
Vt([
  u({ type: String })
], H.prototype, "label");
Vt([
  u({ type: String })
], H.prototype, "badge");
Vt([
  u({ type: Boolean, reflect: !0 })
], H.prototype, "active");
w("ns-nav-item", H);
const cs = A`
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
var ds = Object.defineProperty, Te = (i, o, t, s) => {
  for (var e = void 0, n = i.length - 1, r; n >= 0; n--)
    (r = i[n]) && (e = r(o, t, e) || e);
  return e && ds(o, t, e), e;
};
const Ee = class Ee extends C {
  constructor() {
    super(...arguments), this.heading = "", this.description = "";
  }
  connectedCallback() {
    super.connectedCallback(), k();
  }
  render() {
    return g`
      <h1>${this.heading}</h1>
      ${this.description ? g`<p>${this.description}</p>` : $}
    `;
  }
};
Ee.styles = cs;
let ft = Ee;
Te([
  u({ type: String })
], ft.prototype, "heading");
Te([
  u({ type: String })
], ft.prototype, "description");
w("ns-page-heading", ft);
var hs = Object.defineProperty, Ht = (i, o, t, s) => {
  for (var e = void 0, n = i.length - 1, r; n >= 0; n--)
    (r = i[n]) && (e = r(o, t, e) || e);
  return e && hs(o, t, e), e;
};
function us(i, o) {
  if (o <= 7) return Array.from({ length: o }, (n, r) => r + 1);
  const t = [1, i - 1, i, i + 1, o].filter((n) => n >= 1 && n <= o).sort((n, r) => n - r), s = [];
  let e = 0;
  for (const n of t)
    n !== e && (e !== 0 && n - e > 1 && s.push("gap"), s.push(n), e = n);
  return s;
}
var z, Y, J, Q, B, b, ne, jt, ie, Ke, Lt;
class At extends C {
  constructor() {
    super(...arguments);
    h(this, b);
    h(this, z);
    h(this, Y);
    h(this, J);
    h(this, Q);
    h(this, B);
    this.total = 0, this.perPage = 20, this.defaultPage = 1, l(this, z, 1), l(this, Y, !1), l(this, J, !1), l(this, Q, !1), l(this, B, null);
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
    super.connectedCallback(), k(), _t(this, { page: "default-page" });
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
      this.defaultPage !== 1 && l(this, z, this.defaultPage);
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
    const t = c(this, B);
    if (t === null || (l(this, B, null), (this.page ?? c(this, z)) !== t.page)) return;
    const s = this.ownerDocument.activeElement;
    if (s !== null && s !== this.ownerDocument.body && !this.contains(s)) return;
    const e = typeof t.control == "number" ? `button[data-ns-page="${t.control}"]` : `button[data-ns-nav="${t.control}"]`;
    (n = this.querySelector(e)) == null || n.focus();
  }
  render() {
    const t = c(this, b, jt);
    if (t <= 1) return $;
    const s = a(this, b, ie).call(this);
    return g`
      <nav aria-label="페이지 이동">
        <button
          class="ns-button ns-button--ghost ns-button--sm"
          type="button"
          data-ns-nav="prev"
          aria-disabled=${s === 1 ? "true" : $}
          @click=${() => a(this, b, Lt).call(this, "prev", s - 1)}
        >
          이전
        </button>
        ${Kt(
      us(s, t),
      /*
        번호는 그 번호 자신이 정체성이다. 위치로 diff 하면 윈도우가
        줄어들 때(pageWindow(6,12) 는 7개, pageWindow(12,12) 는 4개)
        포커스가 있던 노드가 제거되고, 윈도우가 밀릴 때는 노드가 재사용되며
        라벨만 5 에서 6 으로 바뀐다 — 화면낭독기가 엉뚱한 번호를 읽는다.
        gap 은 포커스를 받지 않고 위치가 곧 정체성이라 인덱스로 구분한다.
        문자열 키라 번호 키와 섞이지 않는다.
      */
      (e, n) => e === "gap" ? `gap-${n}` : e,
      (e) => e === "gap" ? g`<span class="ns-pagination-gap" aria-hidden="true">…</span>` : g`<button
                  class=${e === s ? "ns-button ns-button--outline ns-button--sm" : "ns-button ns-button--ghost ns-button--sm"}
                  type="button"
                  data-ns-page=${e}
                  aria-current=${e === s ? "page" : $}
                  @click=${() => a(this, b, Lt).call(this, e, e)}
                >
                  ${e}
                </button>`
    )}
        <button
          class="ns-button ns-button--ghost ns-button--sm"
          type="button"
          data-ns-nav="next"
          aria-disabled=${s === t ? "true" : $}
          @click=${() => a(this, b, Lt).call(this, "next", s + 1)}
        >
          다음
        </button>
      </nav>
    `;
  }
}
z = new WeakMap(), Y = new WeakMap(), J = new WeakMap(), Q = new WeakMap(), B = new WeakMap(), b = new WeakSet(), ne = function() {
  return this.page !== void 0;
}, jt = function() {
  return this.perPage > 0 ? !Number.isFinite(this.total) || this.total < 0 ? (c(this, Q) || (l(this, Q, !0), console.warn(
    `[ns-pagination] total=${this.total} 은 0 이상의 유한한 수여야 합니다. 페이징을 렌더하지 않습니다.`
  )), 0) : Math.ceil(this.total / this.perPage) : (c(this, J) || (l(this, J, !0), console.warn(
    `[ns-pagination] per-page=${this.perPage} 는 1 이상이어야 합니다. 페이징을 렌더하지 않습니다.`
  )), 0);
}, /**
 * 지금 보여줄 페이지. **#pages 가 1 이상이면 언제나 1..#pages 의 정수를
 * 돌려준다** — raw 가 무엇이든 상관없다.
 */
ie = function() {
  const t = this.page ?? c(this, z), s = c(this, b, jt);
  if (Number.isInteger(t) && t >= 1 && t <= s) return t;
  const e = Number.isFinite(t) ? Math.min(Math.max(Math.round(t), 1), Math.max(s, 1)) : 1;
  return c(this, Y) || (l(this, Y, !0), console.warn(
    c(this, b, ne) ? `[ns-pagination] page=${t} 가 1..${s} 범위를 벗어났습니다. 표시용으로 ${e} 로 보정합니다.` : `[ns-pagination] 현재 페이지 ${t} 가 total=${this.total} · per-page=${this.perPage} 로 계산된 페이지 수(${s})를 벗어났습니다. 표시용으로 ${e} 로 보정합니다.`
  )), e;
}, /** 이동했으면(= 이벤트를 냈으면) true. */
Ke = function(t) {
  if (!Number.isInteger(t) || t < 1 || t > c(this, b, jt) || t === a(this, b, ie).call(this)) return !1;
  c(this, b, ne) || (l(this, z, t), this.requestUpdate());
  const s = { page: t };
  return this.dispatchEvent(
    new CustomEvent("ns-page-change", { detail: s, bubbles: !0, composed: !0 })
  ), !0;
}, /*
  실제로 이동했을 때만 포커스 의도를 남긴다. 양 끝에서 눌린 이전·다음이나
  현재 페이지 재클릭은 DOM 을 바꾸지 않으므로 되돌릴 포커스도 없다 —
  의도를 남기면 한참 뒤의 무관한 업데이트에서 소진되어 포커스를 훔친다.
*/
Lt = function(t, s) {
  a(this, b, Ke).call(this, s) && l(this, B, { control: t, page: s });
};
Ht([
  u({ type: Number })
], At.prototype, "total");
Ht([
  u({ type: Number, attribute: "per-page" })
], At.prototype, "perPage");
Ht([
  u({ attribute: !1 })
], At.prototype, "page");
Ht([
  u({ type: Number, attribute: "default-page" })
], At.prototype, "defaultPage");
w("ns-pagination", At);
const ps = A`
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
var fs = Object.defineProperty, gs = (i, o, t, s) => {
  for (var e = void 0, n = i.length - 1, r; n >= 0; n--)
    (r = i[n]) && (e = r(o, t, e) || e);
  return e && fs(o, t, e), e;
};
const Pe = class Pe extends C {
  constructor() {
    super(...arguments), this.open = !1;
  }
  connectedCallback() {
    super.connectedCallback(), k();
  }
  render() {
    return g`<nav><slot></slot></nav>`;
  }
};
Pe.styles = ps;
let Rt = Pe;
gs([
  u({ type: Boolean, reflect: !0 })
], Rt.prototype, "open");
w("ns-sidebar", Rt);
const vs = A`
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
var bs = Object.defineProperty, me = (i, o, t, s) => {
  for (var e = void 0, n = i.length - 1, r; n >= 0; n--)
    (r = i[n]) && (e = r(o, t, e) || e);
  return e && bs(o, t, e), e;
};
const ms = /* @__PURE__ */ new Set(["badge", "control", "panel", "card", "pill"]);
var Ft, Ue;
const Se = class Se extends C {
  constructor() {
    super(...arguments);
    h(this, Ft);
    this.width = "100%", this.height = "1rem", this.radius = "control";
  }
  connectedCallback() {
    super.connectedCallback(), k();
  }
  render() {
    return g`
      <div
        class="bar"
        aria-hidden="true"
        style="width:${this.width};height:${this.height};border-radius:${a(this, Ft, Ue).call(this)}"
      ></div>
    `;
  }
};
Ft = new WeakSet(), Ue = function() {
  return ms.has(this.radius) ? `var(--ns-radius-${this.radius})` : this.radius;
}, Se.styles = vs;
let rt = Se;
me([
  u({ type: String })
], rt.prototype, "width");
me([
  u({ type: String })
], rt.prototype, "height");
me([
  u({ type: String })
], rt.prototype, "radius");
w("ns-skeleton", rt);
var ys = Object.defineProperty, Mt = (i, o, t, s) => {
  for (var e = void 0, n = i.length - 1, r; n >= 0; n--)
    (r = i[n]) && (e = r(o, t, e) || e);
  return e && ys(o, t, e), e;
};
function ws(i) {
  return i === "none" ? "ascending" : i === "ascending" ? "descending" : "none";
}
var R, I, F, G, tt, d, Be, oe, re, Re, Z, ae, et, qt, T, dt, le, Ie, Fe, ht, Ve;
class lt extends De {
  constructor() {
    super(...arguments);
    h(this, d);
    h(this, R);
    h(this, I);
    /*
        비제어 모드에서 ns-select-change 로 **마지막에 보고한 집합**이다.
        `undefined` 면 아직 기준선이 없다는 뜻이고, 그때는 비교 대신 seed 만 한다.
    
        관찰자가 이것과 DOM 을 비교해 "이벤트 없이 바뀐 선택" 을 잡는다.
      */
    h(this, F);
    h(this, G);
    h(this, tt);
    h(this, et);
    this.defaultSortKey = "", this.defaultSortDirection = "none", l(this, R, ""), l(this, I, "none"), l(this, G, !1), l(this, et, (t) => {
      const s = t.target, e = s == null ? void 0 : s.closest(
        'input[type="checkbox"][data-ns-select-all], input[type="checkbox"][data-ns-row-id]'
      );
      if (e && a(this, d, Z).call(this, e)) {
        a(this, d, Ve).call(this, e);
        return;
      }
      const n = s == null ? void 0 : s.closest("th[data-ns-sort-key]");
      if (!n || !a(this, d, Z).call(this, n)) return;
      const r = n.dataset.nsSortKey ?? "", f = r === c(this, d, oe) ? ws(c(this, d, re)) : "ascending", y = f === "none" ? "" : r;
      c(this, d, Be) || (l(this, R, y), l(this, I, f), this.requestUpdate());
      const q = { key: y, direction: f };
      this.dispatchEvent(
        new CustomEvent("ns-sort", { detail: q, bubbles: !0, composed: !0 })
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
    super.connectedCallback(), k(), _t(this, {
      "sort-key": "default-sort-key",
      "sort-direction": "default-sort-direction",
      selected: "각 행 checkbox 의 checked 속성"
    }), this.addEventListener("click", c(this, et)), l(this, tt, new MutationObserver(() => {
      a(this, d, ae).call(this), a(this, d, dt).call(this), a(this, d, Fe).call(this);
    })), c(this, tt).observe(this, { childList: !0, subtree: !0 });
  }
  disconnectedCallback() {
    var t;
    this.removeEventListener("click", c(this, et)), (t = c(this, tt)) == null || t.disconnect(), super.disconnectedCallback();
  }
  /*
    비제어 초기값을 seed 한다. 덮어쓰지 않는다 — Lit 은 첫 업데이트를
    마이크로태스크로 미루므로, 생성과 같은 태스크에서 프로퍼티를 만진 코드가
    여기보다 먼저 실행된다. 무조건 대입하면 그것이 경고 없이 사라진다.
  */
  firstUpdated() {
    this.defaultSortKey !== "" && l(this, R, this.defaultSortKey), this.defaultSortDirection !== "none" && l(this, I, this.defaultSortDirection), this.selected === void 0 && l(this, F, a(this, d, le).call(this));
  }
  updated() {
    a(this, d, Re).call(this), a(this, d, ae).call(this), a(this, d, dt).call(this);
  }
}
R = new WeakMap(), I = new WeakMap(), F = new WeakMap(), G = new WeakMap(), tt = new WeakMap(), d = new WeakSet(), Be = function() {
  return this.sortKey !== void 0;
}, oe = function() {
  return this.sortKey ?? c(this, R);
}, re = function() {
  return this.sortDirection ?? c(this, I);
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
Re = function() {
  c(this, G) || this.sortDirection === void 0 || this.sortKey !== void 0 || (l(this, G, !0), console.warn(
    `[ns-table] sortDirection="${this.sortDirection}" 만 설정하고 sortKey 는 설정하지 않았습니다. 둘은 짝이라 이 상태에서는 정렬 방향이 바뀌지 않습니다. 제어하려면 둘 다 설정하고, 비제어 초기값이 목적이면 default-sort-direction 을 쓰세요.`
  ));
}, /*
  Light DOM 이라 shadow 경계가 없다. 중첩된 <ns-table> 의 <th>·체크박스도 바깥
  호스트의 querySelectorAll·closest 에 그대로 잡히므로, 안쪽 헤더 클릭이나 안쪽
  체크박스가 바깥 컴포넌트에서도 처리돼 이벤트가 두 번 발생하고 두 컴포넌트가
  같은 상태를 두고 다툰다. 가장 가까운 ns-table 이 자기인 요소만 자기 것이다.
  헤더 · 행 체크박스 · 전체 선택 체크박스 모두 이 검사를 거친다.
*/
Z = function(t) {
  return t.closest("ns-table") === this;
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
ae = function() {
  const t = c(this, d, oe), s = c(this, d, re);
  for (const e of this.querySelectorAll("th[data-ns-sort-key]"))
    a(this, d, Z).call(this, e) && (e.dataset.nsSortKey === t && s !== "none" ? e.setAttribute("aria-sort", s) : e.removeAttribute("aria-sort"));
}, et = new WeakMap(), /*
  중첩된 <ns-table> 의 행 체크박스도 바깥 호스트의 querySelectorAll 에 그대로
  잡힌다 — #owns 로 걸러 자기 것만 남긴다.
*/
qt = function() {
  return [...this.querySelectorAll("input[data-ns-row-id]")].filter(
    (t) => a(this, d, Z).call(this, t)
  );
}, T = function(t) {
  return t.dataset.nsRowId ?? "";
}, /*
    전체 선택 체크박스의 3-상태를 쓴다. checked 와 indeterminate 의 유일한
    작성자가 컴포넌트다 — 소비자는 그 둘을 바인딩하지 않는다.

    indeterminate 는 프로퍼티고 대응하는 HTML 속성이 없다. 마크업만으로는
    "일부 선택" 을 만들 수 없어서, 이것이 컴포넌트가 가져갈 값이 있는 지점이다.
  */
dt = function() {
  const t = [
    ...this.querySelectorAll("input[data-ns-select-all]")
  ].filter((y) => a(this, d, Z).call(this, y));
  if (t.length === 0) return;
  const s = a(this, d, qt).call(this), e = this.selected, n = e === void 0 ? s.filter((y) => y.checked).length : s.filter((y) => e.includes(a(this, d, T).call(this, y))).length, r = s.length > 0 && n === s.length, f = n > 0 && n < s.length;
  for (const y of t)
    y.checked = r, y.indeterminate = f;
}, /** 비제어 모드의 진실 — DOM 이다. 행 순서를 그대로 따른다. */
le = function() {
  return a(this, d, qt).call(this).filter((t) => t.checked).map((t) => a(this, d, T).call(this, t));
}, /*
  **내용**으로 비교한다. 배열 정체성으로 보면 매번 새 배열이라 관찰자가 도는
  족족 "바뀌었다" 가 되어 이벤트를 스팸한다. 순서도 보지 않는다 — 소비자가
  행을 재정렬하면 같은 집합이 다른 순서로 오는데 그것은 선택 변경이 아니다.
  (같은 data-ns-row-id 가 둘인 마크업은 정의되지 않은 입력으로 둔다.)
*/
Ie = function(t, s) {
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
Fe = function() {
  if (this.selected !== void 0) return;
  const t = a(this, d, le).call(this), s = c(this, F);
  if (!(s !== void 0 && a(this, d, Ie).call(this, s, t))) {
    if (s === void 0 || this.ownerDocument.readyState === "loading") {
      l(this, F, t);
      return;
    }
    a(this, d, ht).call(this, t);
  }
}, ht = function(t) {
  l(this, F, t);
  const s = { ids: t };
  this.dispatchEvent(
    new CustomEvent("ns-select-change", { detail: s, bubbles: !0, composed: !0 })
  );
}, /**
 * 체크박스 하나가 활성화됐다. `box.checked` 는 **이미 뒤집힌 뒤**다.
 *
 * `change` 가 아니라 `click` 에서 부른다 — 근거는 `#onClick` 주석에 있다.
 */
Ve = function(t) {
  const s = a(this, d, qt).call(this);
  if (t.hasAttribute("data-ns-select-all")) {
    if (this.selected === void 0)
      for (const f of s) f.checked = t.checked;
    a(this, d, ht).call(this, t.checked ? s.map((f) => a(this, d, T).call(this, f)) : []), this.selected === void 0 && a(this, d, dt).call(this);
    return;
  }
  if (!t.hasAttribute("data-ns-row-id")) return;
  let e;
  if (this.selected === void 0) {
    e = s.filter((f) => f.checked).map((f) => a(this, d, T).call(this, f)), a(this, d, ht).call(this, e), a(this, d, dt).call(this);
    return;
  }
  const n = new Set(this.selected), r = a(this, d, T).call(this, t);
  t.checked ? n.add(r) : n.delete(r), e = s.map((f) => a(this, d, T).call(this, f)).filter((f) => n.has(f)), a(this, d, ht).call(this, e);
};
Mt([
  u({ attribute: !1 })
], lt.prototype, "sortKey");
Mt([
  u({ attribute: !1 })
], lt.prototype, "sortDirection");
Mt([
  u({ type: String, attribute: "default-sort-key" })
], lt.prototype, "defaultSortKey");
Mt([
  u({ type: String, attribute: "default-sort-direction" })
], lt.prototype, "defaultSortDirection");
Mt([
  u({ attribute: !1 })
], lt.prototype, "selected");
w("ns-table", lt);
var ks = Object.defineProperty, He = (i, o, t, s) => {
  for (var e = void 0, n = i.length - 1, r; n >= 0; n--)
    (r = i[n]) && (e = r(o, t, e) || e);
  return e && ks(o, t, e), e;
};
function $s(i) {
  return `${i}-tab`;
}
var V, st, nt, p, ce, ut, K, de, Tt, he, ue, pe, it, ot;
class ye extends De {
  constructor() {
    super(...arguments);
    h(this, p);
    h(this, V);
    h(this, st);
    h(this, nt);
    h(this, it);
    h(this, ot);
    this.defaultActive = "", l(this, V, ""), l(this, nt, !1), l(this, it, (t) => {
      const s = a(this, p, pe).call(this, t.target);
      s !== null && a(this, p, he).call(this, a(this, p, K).call(this, s), !1);
    }), l(this, ot, (t) => {
      const s = a(this, p, pe).call(this, t.target);
      if (s === null) return;
      const e = c(this, p, ut), n = e.indexOf(s);
      if (n === -1) return;
      const r = (f) => {
        t.preventDefault(), a(this, p, he).call(this, a(this, p, K).call(this, e[(f + e.length) % e.length]), !0);
      };
      t.key === "ArrowRight" ? r(n + 1) : t.key === "ArrowLeft" ? r(n - 1) : t.key === "Home" ? r(0) : t.key === "End" && r(e.length - 1);
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
    super.connectedCallback(), k(), _t(this, { active: "default-active" }), this.hasAttribute("role") || this.setAttribute("role", "tablist"), this.addEventListener("click", c(this, it)), this.addEventListener("keydown", c(this, ot)), l(this, st, new MutationObserver(() => a(this, p, Tt).call(this))), c(this, st).observe(this, { childList: !0, subtree: !0 });
  }
  disconnectedCallback() {
    var t;
    this.removeEventListener("click", c(this, it)), this.removeEventListener("keydown", c(this, ot)), (t = c(this, st)) == null || t.disconnect(), super.disconnectedCallback();
  }
  /*
      비제어 초기값을 seed 한다. ns-pagination 과 달리 firstUpdated 로 충분하다 —
      이 컴포넌트는 render 를 갖지 않으므로 DOM 쓰기가 전부 updated() 에서 일어나고
      그것은 firstUpdated 다음이다. ns-table 과 같은 자리다.
  
      덮어쓰지 않고 seed 만 한다. Lit 은 첫 업데이트를 마이크로태스크로 미루므로,
      생성과 같은 태스크에서 프로퍼티를 만진 코드가 여기보다 먼저 실행된다.
    */
  firstUpdated() {
    this.defaultActive !== "" && l(this, V, this.defaultActive);
  }
  updated() {
    a(this, p, Tt).call(this);
  }
}
V = new WeakMap(), st = new WeakMap(), nt = new WeakMap(), p = new WeakSet(), ce = function() {
  return this.active !== void 0;
}, ut = function() {
  return [...this.querySelectorAll("[data-ns-tab]")].filter(
    (t) => t.closest("ns-tabs") === this
  );
}, K = function(t) {
  return t.dataset.nsTab ?? "";
}, de = function() {
  const t = c(this, p, ut);
  if (t.length === 0) return "";
  const s = this.active ?? c(this, V);
  if (t.some((n) => a(this, p, K).call(this, n) === s)) return s;
  const e = a(this, p, K).call(this, t[0]);
  return s !== "" && !c(this, nt) && (l(this, nt, !0), console.warn(
    c(this, p, ce) ? `[ns-tabs] active="${s}" 와 일치하는 data-ns-tab 이 없습니다. 첫 번째 탭 "${e}" 을 표시하지만 그 탭을 눌러도 ns-tab-change 가 나가지 않습니다. 대소문자까지 맞는지 확인하세요.` : `[ns-tabs] 활성 탭 "${s}" 와 일치하는 data-ns-tab 이 없습니다. 첫 번째 탭 "${e}" 을 표시합니다. default-active 값이 data-ns-tab 과 맞는지 확인하세요.`
  )), e;
}, /** 소비자 DOM 에 ARIA 와 roving tabindex 를 쓴다. 멱등이다. */
Tt = function() {
  const t = c(this, p, de);
  for (const s of c(this, p, ut)) {
    const e = a(this, p, K).call(this, s), n = s.dataset.nsPanel ?? "";
    s.setAttribute("role", "tab"), !s.hasAttribute("id") && n !== "" && s.setAttribute("id", $s(n)), n !== "" && s.setAttribute("aria-controls", n), s.setAttribute("aria-selected", e === t ? "true" : "false"), s.setAttribute("tabindex", e === t ? "0" : "-1");
  }
}, he = function(t, s) {
  if (t === "") return;
  if (t === c(this, p, de)) {
    s && a(this, p, ue).call(this, t);
    return;
  }
  c(this, p, ce) || (l(this, V, t), this.requestUpdate());
  const e = { id: t };
  this.dispatchEvent(
    new CustomEvent("ns-tab-change", { detail: e, bubbles: !0, composed: !0 })
  ), a(this, p, Tt).call(this), s && a(this, p, ue).call(this, t);
}, ue = function(t) {
  var s;
  (s = c(this, p, ut).find((e) => a(this, p, K).call(this, e) === t)) == null || s.focus();
}, /** 이벤트가 우리 탭에서 났으면 그 요소, 아니면 null. */
pe = function(t) {
  var e;
  const s = ((e = t == null ? void 0 : t.closest) == null ? void 0 : e.call(t, "[data-ns-tab]")) ?? null;
  return s === null || s.closest("ns-tabs") !== this ? null : s;
}, it = new WeakMap(), ot = new WeakMap();
He([
  u({ attribute: !1 })
], ye.prototype, "active");
He([
  u({ type: String, attribute: "default-active" })
], ye.prototype, "defaultActive");
w("ns-tabs", ye);
const xs = A`
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
var Cs = Object.defineProperty, Es = (i, o, t, s) => {
  for (var e = void 0, n = i.length - 1, r; n >= 0; n--)
    (r = i[n]) && (e = r(o, t, e) || e);
  return e && Cs(o, t, e), e;
}, xt, D, S, j, m, fe, ge, ve, W, Ct, Et, Pt, St;
const _e = class _e extends C {
  constructor() {
    super(...arguments);
    h(this, m);
    h(this, xt);
    h(this, D);
    h(this, S);
    h(this, j);
    h(this, Ct);
    h(this, Et);
    h(this, Pt);
    h(this, St);
    this.items = [], l(this, xt, 0), l(this, D, !1), l(this, S, !1), l(this, j, !1), l(this, Ct, () => {
      l(this, D, !0), a(this, m, W).call(this);
    }), l(this, Et, () => {
      l(this, D, !1), a(this, m, W).call(this);
    }), l(this, Pt, () => {
      l(this, S, !0), a(this, m, W).call(this);
    }), l(this, St, () => {
      l(this, S, !1), a(this, m, W).call(this);
    });
  }
  connectedCallback() {
    super.connectedCallback(), k(), a(this, m, ve).call(this);
  }
  disconnectedCallback() {
    a(this, m, ge).call(this), l(this, D, !1), l(this, S, !1), l(this, j, !1), super.disconnectedCallback();
  }
  /** 토스트 하나를 띄운다. 돌려주는 함수를 부르면 즉시 닫는다(두 번 불러도 안전). */
  show(t, s, e) {
    const n = Me(this, xt)._++, r = {
      key: n,
      message: t,
      tone: s,
      duration: e,
      remaining: e,
      startedAt: Date.now()
    };
    return this.items = [...this.items, r], c(this, j) || a(this, m, fe).call(this, r), () => this.dismiss(n);
  }
  /** 이미 사라진 키를 줘도 아무 일도 하지 않는다. */
  dismiss(t) {
    const s = this.items.find((e) => e.key === t);
    s !== void 0 && (s.timer !== void 0 && clearTimeout(s.timer), this.items = this.items.filter((e) => e.key !== t));
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
    var t;
    l(this, S, ((t = this.shadowRoot) == null ? void 0 : t.activeElement) != null), a(this, m, W).call(this);
  }
  render() {
    return g`
      <div
        class="region"
        aria-live="polite"
        @mouseenter=${c(this, Ct)}
        @mouseleave=${c(this, Et)}
        @focusin=${c(this, Pt)}
        @focusout=${c(this, St)}
      >
        ${Kt(
      this.items,
      (t) => t.key,
      (t) => g`
            <div class="toast ${t.tone}" role=${t.tone === "danger" ? "alert" : $}>
              <span class="message">${t.message}</span>
              <button
                class="close"
                type="button"
                aria-label="닫기"
                @click=${() => this.dismiss(t.key)}
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
xt = new WeakMap(), D = new WeakMap(), S = new WeakMap(), j = new WeakMap(), m = new WeakSet(), /** duration 이 0 이거나 이미 돌고 있으면 아무 일도 하지 않는다(재개가 멱등한 근거). */
fe = function(t) {
  t.duration <= 0 || t.timer !== void 0 || (t.startedAt = Date.now(), t.timer = window.setTimeout(() => this.dismiss(t.key), t.remaining));
}, /*
    마우스가 올라가 있거나 안쪽에 포커스가 있는 동안 자동 소멸을 멈춘다.
    안 멈추면 읽는 중에, 혹은 닫기 버튼에 Tab 으로 닿는 중에 사라진다.

    items 배열을 갈아 끼우지 않고 항목을 직접 고친다 — 화면에 보이는 것이 하나도
    바뀌지 않으므로 리렌더할 이유가 없다.
  */
ge = function() {
  for (const t of this.items)
    t.timer !== void 0 && (clearTimeout(t.timer), t.timer = void 0, t.remaining = Math.max(0, t.remaining - (Date.now() - t.startedAt)));
}, ve = function() {
  for (const t of this.items) a(this, m, fe).call(this, t);
}, /*
  두 사유를 하나의 적용 상태로 접는다. 사유가 바뀔 때마다 부르고, 실제 정지·재개는
  상태가 뒤집힐 때만 일어난다.
*/
W = function() {
  const t = c(this, D) || c(this, S);
  t !== c(this, j) && (l(this, j, t), t ? a(this, m, ge).call(this) : a(this, m, ve).call(this));
}, Ct = new WeakMap(), Et = new WeakMap(), Pt = new WeakMap(), St = new WeakMap(), _e.styles = xs;
let It = _e;
Es([
  be()
], It.prototype, "items");
w("ns-toast", It);
function Ps() {
  const i = document.querySelector("ns-toast");
  if (i !== null) return i;
  const o = document.createElement("ns-toast");
  return document.body.append(o), o;
}
function zs(i, o = {}) {
  if (typeof document > "u") return () => {
  };
  const { tone: t = "neutral", duration: s = 4e3 } = o;
  return Ps().show(i, t, s);
}
function Ne(i, o, t) {
  const s = document.activeElement, e = document.createElement("ns-dialog");
  e.heading = i.heading ?? "";
  const n = document.createElement("p");
  n.textContent = i.message, n.style.margin = "0", e.append(n);
  let r = !1;
  const f = (x) => {
    if (r) return;
    r = !0, e.close();
    const ct = () => {
      e.remove(), t(x), s instanceof HTMLElement && s.isConnected && s.focus();
    };
    e.updateComplete.then(ct, ct);
  }, y = async (x) => {
    for (let ct = 0; ct < 5; ct++)
      if (await e.updateComplete, r || (x.focus({ preventScroll: !0 }), document.activeElement === x)) return;
    console.warn(
      "[ns-confirm] 취소 버튼에 초기 포커스를 주지 못했습니다. ns-dialog 의 갱신 순서가 바뀌었을 수 있습니다."
    );
  }, q = document.createElement("button");
  q.type = "button", q.className = i.tone === "danger" ? "ns-button ns-button--danger ns-button--sm" : "ns-button ns-button--solid ns-button--sm", q.textContent = i.confirmLabel ?? "확인", q.addEventListener("click", () => f(!0));
  const Ot = document.createElement("div");
  Ot.slot = "footer";
  let Nt = null;
  if (o) {
    const x = document.createElement("button");
    x.type = "button", x.className = "ns-button ns-button--outline ns-button--sm", x.textContent = i.cancelLabel ?? "취소", x.addEventListener("click", () => f(!1)), i.tone === "danger" && (Nt = x), Ot.append(x);
  }
  Ot.append(q), e.append(Ot), e.addEventListener("ns-dialog-close", () => f(!1)), document.body.append(e), e.show(), Nt !== null && y(Nt);
}
function Ds(i) {
  return typeof document > "u" ? Promise.resolve() : new Promise((o) => {
    Ne(i, !1, () => o());
  });
}
function js(i) {
  return typeof document > "u" ? Promise.resolve(!1) : new Promise((o) => {
    Ne(i, !0, o);
  });
}
export {
  _ as NsDialog,
  pt as NsHeader,
  Ut as NsIcon,
  M as NsMultiSelect,
  Bt as NsNavGroup,
  H as NsNavItem,
  ft as NsPageHeading,
  At as NsPagination,
  Rt as NsSidebar,
  rt as NsSkeleton,
  lt as NsTable,
  ye as NsTabs,
  It as NsToast,
  Ds as nsAlert,
  js as nsConfirm,
  zs as nsToast,
  Os as registerIcons,
  Ts as svg,
  $s as tabIdFor
};
