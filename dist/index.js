var Be = (n) => {
  throw TypeError(n);
};
var se = (n, o, t) => o.has(n) || Be("Cannot " + t);
var l = (n, o, t) => (se(n, o, "read from private field"), t ? t.call(n) : o.get(n)), d = (n, o, t) => o.has(n) ? Be("Cannot add the same private member more than once") : o instanceof WeakSet ? o.add(n) : o.set(n, t), r = (n, o, t, s) => (se(n, o, "write to private field"), s ? s.call(n, t) : o.set(n, t), t), c = (n, o, t) => (se(n, o, "access private method"), t);
var Ie = (n, o, t, s) => ({
  set _(e) {
    r(n, o, e, t);
  },
  get _() {
    return l(n, o, s);
  }
});
import { css as O, svg as Ft, LitElement as C, html as b, nothing as w, ReactiveElement as We } from "lit";
import { svg as Gs } from "lit";
import { property as u, query as ds, state as Pe } from "lit/decorators.js";
import { repeat as Jt } from "lit/directives/repeat.js";
function x(n, o) {
  typeof window > "u" || !("customElements" in window) || customElements.get(n) || customElements.define(n, o);
}
let ne = !1;
const hs = `[@neosimplix/common-ui] tokens.css 가 로드되지 않아 레이아웃이 깨집니다.
  Next/React:  import "@neosimplix/common-ui/tokens.css";
  HTML:        <link rel="stylesheet" href="…/dist/tokens.css">`, Fe = () => getComputedStyle(document.documentElement).getPropertyValue("--ns-color-line").trim() !== "";
function k() {
  if (ne || typeof document > "u" || typeof getComputedStyle > "u") return;
  if (Fe()) {
    ne = !0;
    return;
  }
  ne = !0;
  const n = () => {
    Fe() || console.warn(hs);
  };
  document.readyState === "complete" ? n() : window.addEventListener("load", n, { once: !0 });
}
const Re = /* @__PURE__ */ new WeakMap();
function J(n, o) {
  for (const [t, s] of Object.entries(o)) {
    const e = [t, t.replaceAll("-", "")].find((a) => n.hasAttribute(a));
    if (e === void 0) continue;
    let i = Re.get(n);
    i === void 0 && Re.set(n, i = /* @__PURE__ */ new Set()), !i.has(e) && (i.add(e), console.warn(
      `[${n.localName}] ${e} 속성은 무시됩니다 — 이 이름은 프로퍼티 전용입니다.
  HTML 에서 쓸 것: ${s}
  JS 에서는 el.${us(t)} 에 대입합니다.`
    ));
  }
}
const us = (n) => n.replace(/-([a-z])/g, (o, t) => t.toUpperCase()), ps = O`
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

  /*
    되돌릴 규칙을 두지 않는다. "UA 기본값을 덮으면 되돌릴 규칙을 함께 둔다" 는
    규칙이 막으려는 것은 키보드 사용자가 포커스 위치를 잃는 것인데, 초기
    포커스가 이 h2 에 닿는 것은 showModal() 이 여는 순간 프로그램적으로 옮긴
    결과이지 Tab 으로 닿은 것이 아니다. tabindex="-1" 이라 Tab 으로는 그
    자리에 가거나 되돌아올 경로가 없고, 이 요소는 실행 가능한 대상이 아니라
    가리킬 것도 없다. 되돌릴 대상이 없으므로 되돌릴 규칙도 없다 — 근거는
    docs/gotchas.md 에 있다.

    :focus-visible 이 아니라 :focus 다. 상위집합이라 엔진이 어느 쪽으로 링을
    거는지에 의존하지 않는다 — Chrome 은 focus-visible 로, 다른 엔진은 :focus
    로 걸 수 있다.
  */
  #dialog-heading:focus {
    outline: none;
  }

  /*
    **flex: 1 이 아니라 flex: 1 1 auto 다.** 축약형 flex: 1 은 flex-basis: 0% 이고,
    그러면 본문의 flex base size 가 0 이다. 아래 min-height: 0 이 flex 항목의 자동
    최소 크기(auto)마저 꺼 두므로, 내용이 높이를 주장할 통로가 하나도 남지 않는다.

    <dialog> 는 UA 스타일시트의 height: fit-content 를 그대로 쓰는 고유 크기
    컨테이너다. 그 높이를 구할 때 Blink 는 명세 §9.9.1(max-content flex fraction)을
    구현해 항목의 내용 기여분을 더하지만, **WebKit 은 flex base size 만 더한다.**
    그래서 Safari 에서만 본문의 content box 가 0 으로 붕괴하고, 한 줄짜리 문장에도
    스크롤 막대가 생겼다. 같은 마크업을 두 엔진에서 재서 확인했다 — 본문 높이가
    Blink 19px / WebKit 0px 였다.

    auto 는 base size 를 내용 높이로 만들어 어느 엔진에서도 같은 값을 준다.
    flex-shrink: 1 과 min-height: 0 은 그대로 두는 것이 중요하다 — 대화상자가
    max-height 에 걸리면 그 둘이 본문을 내용보다 작게 줄여 주고, 그때 비로소
    overflow-y 가 일한다. **그 축소가 이 요소가 스크롤되는 유일하게 의도된 경로다.**

    주석에 백틱을 쓰지 않는 것도 이 파일에서는 규칙이다. css 태그드 템플릿 안이라
    백틱 하나가 리터럴을 끊는다.
  */
  .body {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: var(--ns-space-6);
    /*
      ns-sidebar.styles.ts 의 nav 와 같은 가는 스크롤바. 감춘 적이 없어
      "감추지 않고 가늘게" 절이 여기는 겨냥하지 않지만, 결정이 이미 서
      있으므로 이 저장소의 세 스크롤 영역이 같은 모양이어야 한다. 표준
      경로와 WebKit 경로가 나뉘는 이유·값의 근거는 ns-sidebar.styles.ts
      의 주석과 tokens.css 의 --ns-scrollbar-width · --ns-scrollbar-thumb-inset
      정의 옆에 있다 — 여기서는 반복하지 않는다. shadow 안이라 controls.css
      가 닿지 않으므로 이 블록을 다시 적는다.
    */
    scrollbar-width: thin;
    scrollbar-color: var(--ns-color-line-strong) transparent;
  }

  .body:hover {
    scrollbar-color: var(--ns-color-fg-subtle) transparent;
  }

  .body::-webkit-scrollbar {
    width: var(--ns-scrollbar-width);
  }

  .body::-webkit-scrollbar-track {
    background: transparent;
  }

  .body::-webkit-scrollbar-thumb {
    background-color: var(--ns-color-line-strong);
    border-radius: var(--ns-radius-pill);
    border: var(--ns-scrollbar-thumb-inset) solid transparent;
    background-clip: padding-box;
  }

  .body::-webkit-scrollbar-thumb:hover {
    background-color: var(--ns-color-fg-subtle);
    background-clip: padding-box;
  }

  /*
    footer 는 내용이 있을 때만 보인다. slot 에 배정된 노드가 있는지는 CSS 로
    알 수 없어 slotchange 로 판정하고 hidden 속성을 건다.
    display: flex 가 UA 의 [hidden] 규칙을 이기므로 명시적으로 되돌린다.

    **이 규칙이 배치의 유일한 자리다.** 정렬과 gap 이 여기 있으므로 슬롯에 들어온
    것이 곧 flex 항목이어야 한다 — 버튼을 <div> 로 감싸면 항목이 래퍼 하나뿐이라
    가운데 정렬은 래퍼에 걸리고 gap 은 버튼 사이에 닿지 못한다. 감싸는 것 말고는
    방법이 없는 React shim 은 그 래퍼에 display: contents 를 줘서 비켜선다.
  */
  .footer {
    flex: none;
    display: flex;
    justify-content: center;
    gap: var(--ns-space-2);
    padding: 0 var(--ns-space-6) var(--ns-space-6);
  }

  .footer[hidden] {
    display: none;
  }
`, Wt = {
  menu: {
    viewBox: "0 0 20 20",
    content: Ft`
      <path
        d="M3 5h14M3 10h14M3 15h14"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
      />
    `
  },
  /*
    ns-nav-group 의 접힘 caret. 아래를 가리키는 것이 펼침이고, 접히면
    그 컴포넌트가 -90deg 로 돌린다. 회전은 여기서 하지 않는다 — 이 스프라이트는
    방향을 모르는 채로 하나만 갖고, 쓰는 쪽이 돌린다.
  */
  "chevron-down": {
    viewBox: "0 0 20 20",
    content: Ft`
      <path
        d="M5 7.5l5 5 5-5"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
      />
    `
  },
  close: {
    viewBox: "0 0 20 20",
    content: Ft`
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
    content: Ft`
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
function Ns(n) {
  Object.assign(Wt, n);
}
const fs = O`
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
var bs = Object.defineProperty, gs = (n, o, t, s) => {
  for (var e = void 0, i = n.length - 1, a; i >= 0; i--)
    (a = n[i]) && (e = a(o, t, e) || e);
  return e && bs(o, t, e), e;
}, Q, X, Ne, oe;
const Me = class Me extends C {
  constructor() {
    super(...arguments);
    d(this, X);
    d(this, Q);
    this.name = "", r(this, Q, "");
  }
  connectedCallback() {
    super.connectedCallback(), k();
  }
  render() {
    return b`<slot>${c(this, X, Ne).call(this)}</slot>`;
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
        c(this, X, oe).call(this, `공백-${this.name}`, `[ns-icon] 공백만 든 자식이 슬롯을 채워 name="${this.name}" 폴백이 그려지지 않았다. <ns-icon name="${this.name}"></ns-icon> 처럼 안쪽을 붙여 쓴다.`);
        return;
      }
      this.name !== "" && !Wt[this.name] && c(this, X, oe).call(this, `없음-${this.name}`, `[ns-icon] 없는 아이콘: "${this.name}". 사용 가능: ${Object.keys(Wt).join(", ")}. registerIcons() 로 더하거나, 자식으로 직접 넣는다 — <ns-icon><MyIcon /></ns-icon> 는 name 없이 동작한다.`);
    }
  }
};
Q = new WeakMap(), X = new WeakSet(), Ne = function() {
  if (this.name === "") return w;
  const t = Wt[this.name];
  return t ? b`<svg viewBox=${t.viewBox} fill="none" aria-hidden="true">${t.content}</svg>` : w;
}, /** 같은 사유로 리렌더될 때마다 찍지 않는다. */
oe = function(t, s) {
  l(this, Q) !== t && (r(this, Q, t), console.warn(s));
}, Me.styles = fs;
let Yt = Me;
gs([
  u({ type: String })
], Yt.prototype, "name");
x("ns-icon", Yt);
var vs = Object.defineProperty, bt = (n, o, t, s) => {
  for (var e = void 0, i = n.length - 1, a; i >= 0; i--)
    (a = n[i]) && (e = a(o, t, e) || e);
  return e && vs(o, t, e), e;
}, P, T, U, v, re, ae, le, Et, Pt, _t, At, Ot, ce, Nt;
const ze = class ze extends C {
  constructor() {
    super(...arguments);
    d(this, v);
    d(this, P);
    d(this, T);
    d(this, U);
    d(this, Et);
    d(this, Pt);
    d(this, _t);
    d(this, At);
    d(this, Ot);
    this.heading = "", this.defaultOpen = !1, this.noBackdropClose = !1, this.hasFooter = !1, r(this, P, !1), r(this, T, !1), r(this, U, !1), r(this, Et, (t) => {
      const s = t.target;
      this.hasFooter = s.assignedNodes({ flatten: !0 }).length > 0;
    }), r(this, Pt, () => {
      if (l(this, U)) {
        r(this, U, !1);
        return;
      }
      c(this, v, Nt).call(this, "escape");
    }), r(this, _t, () => {
      c(this, v, Nt).call(this, "close-button");
    }), r(this, At, (t) => {
      r(this, T, c(this, v, ce).call(this, t));
    }), r(this, Ot, (t) => {
      const s = l(this, T);
      r(this, T, !1), !this.noBackdropClose && t.detail !== 0 && (!s || !c(this, v, ce).call(this, t) || c(this, v, Nt).call(this, "backdrop"));
    });
  }
  connectedCallback() {
    super.connectedCallback(), k(), J(this, { open: "default-open" });
    const t = this.dialogEl;
    t != null && t.open && (r(this, U, !0), t.close()), this.requestUpdate();
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
    this.defaultOpen && r(this, P, !0);
  }
  /**
   * 비제어일 때만 연다. 제어 중이면 경고만 낸다 — 여기서 상태를 바꾸면
   * 소비자의 `open` 과 어긋나 화면이 튄다.
   */
  show() {
    c(this, v, le).call(this, "show") || (r(this, P, !0), this.requestUpdate());
  }
  /** 비제어일 때만 닫는다. 소비자가 부른 것이므로 `ns-dialog-close` 를 내지 않는다. */
  close() {
    c(this, v, le).call(this, "close") || (r(this, P, !1), this.requestUpdate());
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
    t && (l(this, v, ae) && !t.open ? this.isConnected && t.showModal() : !l(this, v, ae) && t.open && (r(this, U, !0), t.close()));
  }
  /*
      제목이 tabindex="-1" 을 갖는 이유는 초기 포커스다. showModal() 은 대화상자의
      첫 포커스 가능 자손을 고르는데, 그것이 헤더의 닫기 버튼이면 Chrome 이 그
      포커스를 :focus-visible 로 쳐서 여는 순간 × 에 링이 뜬다. h2 가 DOM 순서상
      닫기 버튼보다 앞이므로 tabindex 하나로 그 자리를 가져온다 — JS 는 필요 없다.
  
      tabindex="-1" 은 탭 순서에 들어가지 않으므로 탭 순서는 바뀌지 않는다.
      소비자가 슬롯 자식에 autofocus 를 주면 여전히 그쪽이 이긴다(Chrome).
      경위와 두 엔진 측정값은 docs/gotchas.md 에 있다.
    */
  render() {
    return b`
      <dialog
        aria-labelledby="dialog-heading"
        @close=${l(this, Pt)}
        @mousedown=${l(this, At)}
        @click=${l(this, Ot)}
      >
        <div class="header">
          <h2 id="dialog-heading" tabindex="-1">${this.heading}</h2>
          <button class="close" type="button" aria-label="닫기" @click=${l(this, _t)}>
            <ns-icon name="close"></ns-icon>
          </button>
        </div>
        <div class="body"><slot></slot></div>
        <div class="footer" ?hidden=${!this.hasFooter}>
          <slot name="footer" @slotchange=${l(this, Et)}></slot>
        </div>
      </dialog>
    `;
  }
};
P = new WeakMap(), T = new WeakMap(), U = new WeakMap(), v = new WeakSet(), re = function() {
  return this.open !== void 0;
}, ae = function() {
  return this.open ?? l(this, P);
}, le = function(t) {
  return l(this, v, re) ? (console.warn(
    `[ns-dialog] open 프로퍼티가 설정된 제어 모드에서는 ${t}() 가 동작하지 않습니다. open 을 바꾸세요.`
  ), !0) : !1;
}, Et = new WeakMap(), Pt = new WeakMap(), _t = new WeakMap(), At = new WeakMap(), Ot = new WeakMap(), /*
  e.target 으로 판별하지 않는다. border-radius 모서리처럼 대화상자 자기
  표면을 클릭해도 타깃이 <dialog> 라서 backdrop 으로 오인된다.
*/
ce = function(t) {
  const s = this.dialogEl;
  if (!s) return !1;
  const e = s.getBoundingClientRect();
  return t.clientX < e.left || t.clientX > e.right || t.clientY < e.top || t.clientY > e.bottom;
}, Nt = function(t) {
  l(this, v, re) || r(this, P, !1);
  const s = { reason: t };
  this.dispatchEvent(
    new CustomEvent("ns-dialog-close", { detail: s, bubbles: !0, composed: !0 })
  ), this.requestUpdate();
}, ze.styles = ps;
let A = ze;
bt([
  u({ type: String })
], A.prototype, "heading");
bt([
  u({ attribute: !1 })
], A.prototype, "open");
bt([
  u({ type: Boolean, attribute: "default-open" })
], A.prototype, "defaultOpen");
bt([
  u({ type: Boolean, attribute: "no-backdrop-close" })
], A.prototype, "noBackdropClose");
bt([
  ds("dialog")
], A.prototype, "dialogEl");
bt([
  Pe()
], A.prototype, "hasFooter");
x("ns-dialog", A);
const ms = O`
  :host {
    display: block;
    box-sizing: border-box;
    height: var(--ns-header-height);
  }

  /*
    box-sizing 은 여기에도 있어야 한다. 문서의 * 리셋은 shadow 안에 닿지 않으므로
    이 요소는 content-box 로 시작하고, 그러면 height: 100% 위에 border-bottom 이
    1px 더해져 호스트의 --ns-header-height 를 넘친다. 넘친 1px 은 호스트 상자
    바깥이라, 뒤에 오는 형제(셸·본문)의 배경이 트리 순서로 그 위에 칠해져
    밑줄이 통째로 사라진다. ns-sidebar 의 nav 가 같은 짝(height: 100% +
    테두리)이고 같은 이유로 border-box 다. guide.html 은 본문 배경이 투명해
    이 결함이 있어도 선이 보였다 — 경위는 docs/gotchas.md 에 있다.
  */
  header {
    box-sizing: border-box;
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
var ws = Object.defineProperty, Ve = (n, o, t, s) => {
  for (var e = void 0, i = n.length - 1, a; i >= 0; i--)
    (a = n[i]) && (e = a(o, t, e) || e);
  return e && ws(o, t, e), e;
}, Mt;
const Ue = class Ue extends C {
  constructor() {
    super(...arguments);
    d(this, Mt);
    this.projectName = "", this.sidebarOpen = !1, r(this, Mt, () => {
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
    return b`
      <header>
        <button
          class="toggle"
          type="button"
          aria-expanded=${this.sidebarOpen ? "true" : "false"}
          aria-label=${this.sidebarOpen ? "사이드바 닫기" : "사이드바 열기"}
          @click=${l(this, Mt)}
        >
          <ns-icon name="menu"></ns-icon>
        </button>

        <span class="title">${this.projectName}</span>

        <div class="actions"><slot name="actions"></slot></div>
      </header>
    `;
  }
};
Mt = new WeakMap(), Ue.styles = ms;
let kt = Ue;
Ve([
  u({ type: String, attribute: "project-name" })
], kt.prototype, "projectName");
Ve([
  u({ type: Boolean, reflect: !0, attribute: "sidebar-open" })
], kt.prototype, "sidebarOpen");
x("ns-header", kt);
var ys = Object.defineProperty, M = (n, o, t, s) => {
  for (var e = void 0, i = n.length - 1, a; i >= 0; i--)
    (a = n[i]) && (e = a(o, t, e) || e);
  return e && ys(o, t, e), e;
}, zt, S, He, de, he;
class E extends C {
  constructor() {
    super(...arguments);
    d(this, S);
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
    d(this, zt);
    this.options = [], this.defaultValue = [], this.searchPlaceholder = "검색", this.emptyMessage = "결과가 없습니다", this.inputId = "", this.inputDescribedby = "", this.inputInvalid = !1, this.query = "";
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
    super.connectedCallback(), k(), J(this, {
      value: "defaultValue 프로퍼티 (배열은 속성으로 쓸 수 없습니다)",
      options: "options 프로퍼티 (배열은 속성으로 쓸 수 없습니다)",
      "default-value": "defaultValue 프로퍼티"
    });
  }
  render() {
    const t = l(this, S, de), s = t.flatMap((a) => this.options.filter((f) => f.value === a)), e = this.query.trim().toLowerCase(), i = e === "" ? this.options : this.options.filter(
      (a) => [a.label, a.meta ?? ""].some((f) => f.toLowerCase().includes(e))
    );
    return b`
      ${s.length === 0 ? w : b`
            <div class="ns-multi-select__chips">
              ${Jt(
      s,
      (a) => a.value,
      (a) => b`
                  <span class="ns-chip">
                    ${a.label}
                    <button
                      class="ns-chip__remove"
                      type="button"
                      aria-label=${`${a.label} 제거`}
                      @click=${() => c(this, S, he).call(this, a.value)}
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
        id=${this.inputId === "" ? w : this.inputId}
        aria-describedby=${this.inputDescribedby === "" ? w : this.inputDescribedby}
        aria-invalid=${this.inputInvalid ? "true" : w}
        .value=${this.query}
        placeholder=${this.searchPlaceholder}
        @input=${(a) => {
      this.query = a.target.value;
    }}
      />

      <div class="ns-multi-select__list">
        ${i.length === 0 ? b`<p class="ns-multi-select__empty">${this.emptyMessage}</p>` : Jt(
      i,
      (a) => a.value,
      (a) => b`
                <label class="ns-checkbox">
                  <input
                    type="checkbox"
                    .checked=${t.includes(a.value)}
                    @change=${(f) => c(this, S, he).call(this, a.value, f.target)}
                  />
                  <span>${a.label}</span>
                  ${a.meta === void 0 ? w : b`<span class="ns-checkbox__hint">${a.meta}</span>`}
                </label>
              `
    )}
      </div>
    `;
  }
}
zt = new WeakMap(), S = new WeakSet(), He = function() {
  return this.value !== void 0;
}, de = function() {
  return this.value ?? l(this, zt) ?? this.defaultValue;
}, /**
 * @param item   토글할 값
 * @param source 이 토글을 일으킨 네이티브 체크박스. 칩의 제거 버튼에는 없다.
 */
he = function(t, s) {
  const e = l(this, S, de), i = e.includes(t) ? e.filter((f) => f !== t) : [...e, t];
  l(this, S, He) ? s !== void 0 && (s.checked = e.includes(t)) : (r(this, zt, i), this.requestUpdate());
  const a = { values: i };
  this.dispatchEvent(
    new CustomEvent("ns-multi-select-change", { detail: a, bubbles: !0, composed: !0 })
  );
};
M([
  u({ attribute: !1 })
], E.prototype, "options");
M([
  u({ attribute: !1 })
], E.prototype, "value");
M([
  u({ attribute: !1 })
], E.prototype, "defaultValue");
M([
  u({ type: String, attribute: "search-placeholder" })
], E.prototype, "searchPlaceholder");
M([
  u({ type: String, attribute: "empty-message" })
], E.prototype, "emptyMessage");
M([
  u({ type: String, attribute: "input-id" })
], E.prototype, "inputId");
M([
  u({ type: String, attribute: "input-describedby" })
], E.prototype, "inputDescribedby");
M([
  u({ type: Boolean, attribute: "input-invalid" })
], E.prototype, "inputInvalid");
M([
  Pe()
], E.prototype, "query");
x("ns-multi-select", E);
const xs = O`
  :host {
    display: block;
  }

  /*
    collapsible 이면 <button>, 아니면 <div> 다. 두 경우가 같은 클래스를 쓰므로
    글꼴·색·패딩이 한 곳에 있고, 아래 button 전용 규칙이 UA 기본값만 되돌린다.

    안쪽 .row 가 flex 를 진다. 0.4.0 까지는 display 자리를 레일 전용 신호
    프로퍼티가 쓰고 있어 여기에 flex 를 얹을 수 없었고, 그 신호가 없어진 지금은
    얹을 수 있게 됐다. 그러나 이 구조가 아래 button.heading 의 UA 되돌림과
    얽혀 있어 바꾸는 것이 이 변경의 목표가 아니다.
  */
  /*
    white-space: nowrap 이 없으면 사이드바가 접히는 200ms 동안 헤딩이 줄어드는
    폭을 따라 줄바꿈한다 — ns-nav-item 의 .label 은 이미 nowrap 이라
    말줄임표로 잘리는데, 이쪽만 여러 줄로 접히며 "찢어지는" 것처럼 보였다.
    사이드바보다 긴 헤딩은 평상시에도 마찬가지다: nowrap 없이는 행이 늘어나
    아래 항목을 밀어내린다. white-space 는 상속되므로 아래 .text 에도
    닿는다.

    overflow: hidden; text-overflow: ellipsis 도 함께 둔다 — 비collapsible
    마크업(<div class="heading">텍스트)은 텍스트가 .heading 의 직접 인라인
    자식이라 여기서 바로 잘려야 한다. collapsible 쪽(<button class="heading">
    <span class="row"><span class="text">…)은 실제로 넘치는 것이 .heading
    자신이 아니라 .row 안의 .text 이므로 이 두 선언은 거기서는 아무 일도
    하지 않는다 — button 의 자식은 .row 하나뿐이고 .row 자체는 flex 폭이
    button 을 넘지 않아 button 수준에서는 넘칠 것이 없다. 그래서 .text 에
    같은 클리핑을 따로 둔다. 결과가 ns-nav-item 의 .label 과 같아진다 —
    같은 세 선언이 텍스트를 직접 감싸는 요소에 있다는 점에서, 그 요소가
    div.heading 이냐 span.text 이냐만 마크업에 따라 다를 뿐이다.
  */
  .heading {
    display: block;
    padding: var(--ns-space-4) var(--ns-space-4) var(--ns-space-2);
    font-size: var(--ns-font-size-sm);
    line-height: var(--ns-line-height-sm);
    font-weight: var(--ns-weight-semibold);
    letter-spacing: 0.05em;
    color: var(--ns-color-fg-subtle);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /*
    <button> 의 UA 기본값을 되돌린다. 위 .heading 이 글꼴·색을 이미 정하지만
    button 은 그것을 상속하지 않고 UA 가 정한 값을 갖는다.
  */
  button.heading {
    /*
      <button> 의 UA 기본값은 이미 border-box 라(div 와 다르다) 이 줄은 오늘
      아무것도 바꾸지 않는다. 그래도 적어 두는 이유는 이 규칙이 명시적
      width 와 padding 을 함께 쓰기 때문이다 — 이 저장소의 다른 모든 그런
      요소가 그렇게 한다(ns-sidebar.styles.ts, ns-header.styles.ts,
      ns-dialog.styles.ts). UA 기본값에 기대는 것과 그것을 적어 두는 것은
      다르다.
    */
    box-sizing: border-box;
    width: 100%;
    border: 0;
    background: none;
    font-family: inherit;
    text-align: left;
    cursor: pointer;
    transition: color var(--ns-transition-fast) var(--ns-transition-ease);
  }

  button.heading:hover {
    color: var(--ns-color-fg-body);
  }

  /*
    controls.css 의 :focus-visible 규칙은 전역이라 shadow 안에 닿지 않는다.

    outline-offset 이 음수인 이유: 헤딩 버튼은 사이드바 폭 전체를 채우는데
    ns-sidebar.styles.ts 의 <nav> 가 overflow-x: hidden 이다. 바깥으로 그리면
    링이 그 경계에서 잘린다.
  */
  button.heading:focus-visible {
    outline: 2px solid var(--ns-color-accent);
    outline-offset: -2px;
  }

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ns-space-2);
  }

  /*
    .row 안에서 실제로 넘치는 요소. flex 아이템의 min-width 기본값은 auto 라
    콘텐츠 고유 폭 밑으로 줄지 않는다 — flex: 1 만으로는 이 span 이 줄어들지
    않고 .row 를 밀어 넘친다. min-width: 0 으로 그 하한을 없애야 아래
    overflow: hidden; text-overflow: ellipsis 가 실제로 자를 폭을 갖는다.
    white-space: nowrap 은 위 .heading 에서 상속받으므로 여기서 다시 쓰지
    않는다. ns-nav-item 의 .label 과 같은 세 선언(overflow·text-overflow·
    white-space) + flex 아이템이라 필요한 flex·min-width 가 더해진 모양이다.
  */
  .text {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /*
    caret 은 헤딩 글자(--ns-font-size-sm, .875rem)에 붙는 것이라 --ns-icon-size(1.25rem)가
    크다. 커스텀 프로퍼티는 상속되므로 이 인스턴스에만 세우면 ns-icon 의 shadow
    :host 까지 도달한다. 사용처가 하나이고 변할 이유가 없으므로 리터럴이다.
  */
  .caret {
    --ns-icon-size: 1rem;
    flex: none;
    transition: transform var(--ns-transition-fast) var(--ns-transition-ease);
  }

  .caret.closed {
    transform: rotate(-90deg);
  }

  .list {
    padding: var(--ns-space-2);
  }

  /*
    접힘. 0.4.0 에는 여기 사이드바가 내려주는 신호 프로퍼티의 var() 폴백이
    있었다 — 레일에 항목이 납작하게 나오던 시절, 접힌 그룹의 항목에 도달할 경로를
    남기려고 사이드바가 레일에서 접힘을 무시하게 만드는 신호였다. 0.5.0
    개발 중에는 레일을 최상위 그룹 타일만 갖는 모델로 다시 만들어 봤지만
    화면에서 무엇인지 읽히지 않아 물렀다 — 그 모델에서도 레일에 항목이 없기는
    마찬가지라 신호의 전제는 이미 없었다. 지금은 레일 자체가 없다. 닫히면
    사이드바가 통째로 사라지므로 접힌 그룹의 항목에 닿을 경로가 애초에 없고,
    그 배선을 되살릴 이유도 없다. 경위는 docs/gotchas.md 에 있다.
  */
  .list.collapsed {
    display: none;
  }

  /*
    하위 카테고리. 중첩 여부는 JS 가 판정해 이 클래스로 남긴다 — 이유는
    ns-nav-group.ts 의 #nested 주석에 있다.

    240px 패널에서 글자 x 좌표가 이렇게 떨어진다.

      상위 제목 16 · 상위 직속 항목 16 · 하위 제목 28 · 하위 항목 28

    상위 제목의 padding-left(16)가 .list 패딩(8) + 행 패딩(8)과 같아서 상위
    제목과 상위 항목이 정렬되는 것과 같은 산수다. 하위는 들여쓰기 12 + 행
    패딩 8 = 20 이고 .list 패딩 8 을 더해 28 이다.

    **.list 의 대칭 패딩을 하위에서 없애고 왼쪽 들여쓰기만 두는 이유**는 항목의
    오른쪽 끝을 상위 항목과 같은 자리(232px)에 남기기 위해서다. 대칭 패딩을
    유지하면 하위 항목의 hover 배경이 오른쪽에서 8px 짧아져 계단이 생긴다.

    3단 이상을 넣으면 들여쓰기는 계속 누적된다(40 → 52). 제목 자가만 2단과
    같아진다 — 판정이 "조상에 ns-nav-group 이 있나" 라는 참/거짓이기 때문이다.
    패널 폭이 정해져 있어 깊이별로 다르게 만들 실익이 없다.

    특정도: 기본 .heading 은 (0,1,0), 이 규칙은 (0,3,0) 이므로 이긴다.
    button.heading 의 UA 되돌림(0,1,1)은 font-weight·letter-spacing 을 선언하지
    않으므로 다투지 않는다.
  */
  [role="group"].nested > .heading {
    padding-top: var(--ns-space-2);
    padding-left: calc(var(--ns-space-3) + var(--ns-space-2));
    font-weight: var(--ns-weight-medium);
    letter-spacing: normal;
  }

  [role="group"].nested > .list {
    padding: 0 0 0 var(--ns-space-3);
  }

  /*
    하위 그룹 사이의 간격. 최상위 그룹 사이에는 이제 아무 규칙도 없으므로 이것이
    이 라이브러리가 갖는 유일한 그룹 간 간격이다.

    **없어진 규칙의 기록.** 0.4.0 에는 최상위용으로
    :host(:not(:first-child)) [role="group"] { padding-top: var(--ns-space-6) }
    (24px)이 있었고 0.5.0 개발 중에 지웠다. 그때 지운 이유는 레일 설계에 있었다 —
    사이드바가 패널에 선택된 그룹 하나만 보이려고 수동 슬롯 배정을 썼고,
    :first-child 가 화면에 없는(배정되지 않은) 형제까지 세는 바람에 패널 위 여백이
    마크업 순서에 따라 달라졌다.

    **레일이 없어지면서 그 이유도 없어졌다.** 지금 최상위 그룹은 ns-sidebar 의
    light DOM 에서 실제 형제이고 전부 렌더되므로, 그 규칙을 되살리면 옳게 동작한다.
    되살리지 않는 것은 **못 해서가 아니라 판단이다** — 헤딩 자신의 padding-top(16px)이
    이미 그룹을 가르고, 최상위가 다섯 이상인 네비게이션(이 저장소의 guide.html 이
    그렇다)에서는 24px 이 목록을 그만큼 길게 만든다. 24px 이 필요한 소비자는 문서
    CSS 한 줄로 되돌린다 — 호스트가 문서 트리에 있어 그 규칙이 shadow 를 이긴다.
    문구는 README.md 의 0.5.0 이주 절에 있고, 좁아진 최상위 그룹 간격이 소비자
    화면에서 실제로 괜찮은지는 자동 검사로 잡히지 않는 판단이라 사람이 눈으로
    본다.

    **여기서는 :first-child 가 옳게 동작한다.** 중첩 그룹은 부모의 light DOM 에서
    실제 형제이고 전부 렌더되므로 셈이 화면과 일치한다.
  */
  :host(:not(:first-child)) [role="group"].nested {
    padding-top: var(--ns-space-2);
  }
`;
var ks = Object.defineProperty, te = (n, o, t, s) => {
  for (var e = void 0, i = n.length - 1, a; i >= 0; i--)
    (a = n[i]) && (e = a(o, t, e) || e);
  return e && ks(o, t, e), e;
}, B, tt, I, Z, Xe, ue, Ut;
const De = class De extends C {
  constructor() {
    super(...arguments);
    d(this, Z);
    d(this, B);
    d(this, tt);
    d(this, I);
    d(this, Ut);
    this.heading = "", this.collapsible = !1, this.defaultCollapsed = !1, r(this, B, !1), r(this, tt, !1), r(this, I, !1), r(this, Ut, () => {
      const t = !l(this, Z, ue);
      r(this, tt, !0), l(this, Z, Xe) || (r(this, B, !t), this.requestUpdate());
      const s = { open: t };
      this.dispatchEvent(
        new CustomEvent("ns-group-toggle", { detail: s, bubbles: !0, composed: !0 })
      );
    });
  }
  connectedCallback() {
    var s;
    super.connectedCallback(), k(), J(this, { open: "default-collapsed" });
    const t = ((s = this.parentElement) == null ? void 0 : s.closest("ns-nav-group")) != null;
    t !== l(this, I) && (r(this, I, t), this.requestUpdate());
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
  willUpdate(t) {
    t.has("defaultCollapsed") && !l(this, tt) && r(this, B, this.defaultCollapsed);
  }
  render() {
    const t = l(this, Z, ue);
    return b`
      <div role="group" aria-label=${this.heading} class=${l(this, I) ? "nested" : ""}>
        ${this.collapsible ? b`
              <button
                class="heading"
                type="button"
                aria-expanded=${t ? "true" : "false"}
                aria-controls="list"
                @click=${l(this, Ut)}
              >
                <span class="row">
                  <span class="text">${this.heading}</span>
                  <ns-icon
                    class=${t ? "caret" : "caret closed"}
                    name="chevron-down"
                  ></ns-icon>
                </span>
              </button>
            ` : b`<div class="heading">${this.heading}</div>`}
        <div id="list" class=${this.collapsible && !t ? "list collapsed" : "list"}>
          <slot></slot>
        </div>
      </div>
    `;
  }
};
B = new WeakMap(), tt = new WeakMap(), I = new WeakMap(), Z = new WeakSet(), Xe = function() {
  return this.open !== void 0;
}, ue = function() {
  return this.open ?? !l(this, B);
}, Ut = new WeakMap(), De.styles = xs;
let H = De;
te([
  u({ type: String })
], H.prototype, "heading");
te([
  u({ type: Boolean })
], H.prototype, "collapsible");
te([
  u({ attribute: !1 })
], H.prototype, "open");
te([
  u({ type: Boolean, attribute: "default-collapsed" })
], H.prototype, "defaultCollapsed");
x("ns-nav-group", H);
const $s = O`
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

  /*
    배경만 바뀌면 "누를 수 있다" 가 정적인 대비로만 드러난다. 글자색이 함께
    올라가면 반응으로도 드러난다 — collapsible 인 그룹 제목이 이미 같은 모양의
    hover 를 갖고 있어 둘이 같은 규약을 쓴다.
  */
  .row:hover {
    background: var(--ns-color-surface-sunken);
    color: var(--ns-color-fg);
  }

  :host([active]) .row {
    background: var(--ns-color-surface-hover);
    color: var(--ns-color-fg);
  }

  /*
    소비자가 넣은 요소의 상한. 크기 자체는 여기서 주지 않는다 — 보통 들어오는
    <ns-icon> 은 자기 shadow 의 :host 에서 --ns-icon-size 로 크기를 갖고 그것이
    이 상한보다 작다. 크기가 없는 것을 넣으면 이 규칙은 그것을 키워 주지 않는다.

    flex: none 이 필요한 이유는 이것이 이제 .leading 래퍼 없이 .row 의 직계
    flex 항목이기 때문이다 — 라벨이 길면 축소 대상이 된다.
  */
  ::slotted([slot="leading"]) {
    flex: none;
    max-width: var(--ns-control-height-sm);
    max-height: var(--ns-control-height-sm);
  }

  /*
    flex: 1 과 min-width: 0 이 함께 있어야 한다. flex 자식은 기본이
    min-width: auto 라 내용보다 작아지지 않고, 그러면 text-overflow 가
    동작하지 않는다.
  */
  .label {
    display: block;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: var(--ns-font-size-sm);
    line-height: var(--ns-line-height-sm);
    font-weight: var(--ns-weight-medium);
  }

  /*
    leading 과 달리 max-width 를 주지 않는다. trailing 은 배지·카운트처럼
    내용에 따라 넓어지는 것이 정상이다 — "3" 과 "128" 은 너비가 달라야
    맞다. 높이만 행 높이에 맞춰 눌러 준다.

    flex: none 이 필요한 이유는 leading 과 같다 — 이제 .trailing 래퍼
    없이 .row 의 직계 flex 항목이라, 라벨이 길면 축소 대상이 된다.
  */
  ::slotted([slot="trailing"]) {
    flex: none;
    max-height: var(--ns-control-height-sm);
  }
`;
var Cs = Object.defineProperty, _e = (n, o, t, s) => {
  for (var e = void 0, i = n.length - 1, a; i >= 0; i--)
    (a = n[i]) && (e = a(o, t, e) || e);
  return e && Cs(o, t, e), e;
}, Dt;
const je = class je extends C {
  constructor() {
    super(...arguments);
    d(this, Dt);
    this.href = "", this.label = "", this.active = !1, r(this, Dt, (t) => {
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
    return b`
      <a class="row" href=${this.href} title=${this.label} @click=${l(this, Dt)}>
        <slot name="leading"></slot>
        <span class="label">${this.label}</span>
        <slot name="trailing"></slot>
      </a>
    `;
  }
};
Dt = new WeakMap(), je.styles = $s;
let pt = je;
_e([
  u({ type: String })
], pt.prototype, "href");
_e([
  u({ type: String })
], pt.prototype, "label");
_e([
  u({ type: Boolean, reflect: !0 })
], pt.prototype, "active");
x("ns-nav-item", pt);
const Ss = O`
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
var Es = Object.defineProperty, Ze = (n, o, t, s) => {
  for (var e = void 0, i = n.length - 1, a; i >= 0; i--)
    (a = n[i]) && (e = a(o, t, e) || e);
  return e && Es(o, t, e), e;
};
const Ke = class Ke extends C {
  constructor() {
    super(...arguments), this.heading = "", this.description = "";
  }
  connectedCallback() {
    super.connectedCallback(), k();
  }
  render() {
    return b`
      <h1>${this.heading}</h1>
      ${this.description ? b`<p>${this.description}</p>` : w}
    `;
  }
};
Ke.styles = Ss;
let $t = Ke;
Ze([
  u({ type: String })
], $t.prototype, "heading");
Ze([
  u({ type: String })
], $t.prototype, "description");
x("ns-page-heading", $t);
var Ps = Object.defineProperty, Bt = (n, o, t, s) => {
  for (var e = void 0, i = n.length - 1, a; i >= 0; i--)
    (a = n[i]) && (e = a(o, t, e) || e);
  return e && Ps(o, t, e), e;
};
const ie = 7;
function Rt(n, o) {
  return Array.from({ length: Math.max(o - n + 1, 0) }, (t, s) => n + s);
}
function _s(n, o, t) {
  if (o <= t) return Rt(1, o);
  const s = t - 2, e = (t - 5) / 2;
  return n <= s ? [...Rt(1, s), "gap", o] : n > o - s ? [1, "gap", ...Rt(o - s + 1, o)] : [1, "gap", ...Rt(n - e, n + e), "gap", o];
}
var D, et, st, nt, it, F, g, pe, Vt, Je, fe, Ye, Ht;
class gt extends C {
  constructor() {
    super(...arguments);
    d(this, g);
    d(this, D);
    d(this, et);
    d(this, st);
    d(this, nt);
    d(this, it);
    d(this, F);
    this.total = 0, this.perPage = 20, this.defaultPage = 1, this.pageWindow = ie, r(this, D, 1), r(this, et, !1), r(this, st, !1), r(this, nt, !1), r(this, it, !1), r(this, F, null);
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
    super.connectedCallback(), k(), J(this, { page: "default-page" });
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
      this.defaultPage !== 1 && r(this, D, this.defaultPage);
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
    const t = l(this, F);
    if (t === null || (r(this, F, null), (this.page ?? l(this, D)) !== t.page)) return;
    const s = this.ownerDocument.activeElement;
    if (s !== null && s !== this.ownerDocument.body && !this.contains(s)) return;
    const e = typeof t.control == "number" ? `button[data-ns-page="${t.control}"]` : `button[data-ns-nav="${t.control}"]`;
    (i = this.querySelector(e)) == null || i.focus();
  }
  render() {
    const t = l(this, g, Vt);
    if (t <= 1) return w;
    const s = c(this, g, fe).call(this);
    return b`
      <nav aria-label="페이지 이동">
        <button
          class="ns-button ns-button--ghost ns-button--sm"
          type="button"
          data-ns-nav="prev"
          aria-disabled=${s === 1 ? "true" : w}
          @click=${() => c(this, g, Ht).call(this, "prev", s - 1)}
        >
          이전
        </button>
        <span class="ns-pagination-pages">
          ${Jt(
      _s(s, t, l(this, g, Je)),
      /*
                    번호는 그 번호 자신이 정체성이다. 슬롯 수는 이제 고정이지만 윈도우가
                    밀리면 같은 자리에 다른 번호가 온다(`1 … 5 6 7 … 12` → `1 … 6 7 8 … 12`).
                    위치로 diff 하면 lit 이 노드를 재사용하며 라벨만 5에서 6으로 바꾸고,
                    화면낭독기가 엉뚱한 번호를 읽는다. 포커스가 있던 노드가 옮겨 갈 때
                    제거 후 삽입이 되는 것도 같다 — 그쪽은 updated() 가 되돌린다.
      
                    gap 은 포커스를 받지 않고 위치가 곧 정체성이라 인덱스로 구분한다.
                    문자열 키라 번호 키와 섞이지 않는다.
                  */
      (e, i) => e === "gap" ? `gap-${i}` : e,
      (e) => e === "gap" ? b`<span class="ns-pagination-gap" aria-hidden="true">…</span>` : (
        /*
          비활성 번호의 --ghost 문자열은 controls.css 의
          `.ns-pagination-pages > .ns-button--ghost` 투명 테두리 규칙과
          짝이다(§6.1). 그 선택자가 변형 이름으로 걸려 있으므로 여기서
          변형을 바꾸면 조용히 안 맞고, 트랙 폭이 다시 흔들린다.
          npm run check 는 이 결합을 보지 못한다.
        */
        b`<button
                    class=${e === s ? "ns-button ns-button--outline ns-button--sm" : "ns-button ns-button--ghost ns-button--sm"}
                    type="button"
                    data-ns-page=${e}
                    aria-current=${e === s ? "page" : w}
                    @click=${() => c(this, g, Ht).call(this, e, e)}
                  >
                    ${e}
                  </button>`
      )
    )}
        </span>
        <button
          class="ns-button ns-button--ghost ns-button--sm"
          type="button"
          data-ns-nav="next"
          aria-disabled=${s === t ? "true" : w}
          @click=${() => c(this, g, Ht).call(this, "next", s + 1)}
        >
          다음
        </button>
      </nav>
    `;
  }
}
D = new WeakMap(), et = new WeakMap(), st = new WeakMap(), nt = new WeakMap(), it = new WeakMap(), F = new WeakMap(), g = new WeakSet(), pe = function() {
  return this.page !== void 0;
}, Vt = function() {
  return this.perPage > 0 ? !Number.isFinite(this.total) || this.total < 0 ? (l(this, nt) || (r(this, nt, !0), console.warn(
    `[ns-pagination] total=${this.total} 은 0 이상의 유한한 수여야 합니다. 페이징을 렌더하지 않습니다.`
  )), 0) : Math.ceil(this.total / this.perPage) : (l(this, st) || (r(this, st, !0), console.warn(
    `[ns-pagination] per-page=${this.perPage} 는 1 이상이어야 합니다. 페이징을 렌더하지 않습니다.`
  )), 0);
}, Je = function() {
  const t = this.pageWindow;
  return Number.isInteger(t) && t >= 5 && t % 2 === 1 ? t : (l(this, it) || (r(this, it, !0), console.warn(
    `[ns-pagination] page-window=${t} 는 5 이상의 홀수여야 합니다. ${ie} 로 그립니다.`
  )), ie);
}, /**
 * 지금 보여줄 페이지. **#pages 가 1 이상이면 언제나 1..#pages 의 정수를
 * 돌려준다** — raw 가 무엇이든 상관없다.
 */
fe = function() {
  const t = this.page ?? l(this, D), s = l(this, g, Vt);
  if (Number.isInteger(t) && t >= 1 && t <= s) return t;
  const e = Number.isFinite(t) ? Math.min(Math.max(Math.round(t), 1), Math.max(s, 1)) : 1;
  return l(this, et) || (r(this, et, !0), console.warn(
    l(this, g, pe) ? `[ns-pagination] page=${t} 가 1..${s} 범위를 벗어났습니다. 표시용으로 ${e} 로 보정합니다.` : `[ns-pagination] 현재 페이지 ${t} 가 total=${this.total} · per-page=${this.perPage} 로 계산된 페이지 수(${s})를 벗어났습니다. 표시용으로 ${e} 로 보정합니다.`
  )), e;
}, /** 이동했으면(= 이벤트를 냈으면) true. */
Ye = function(t) {
  if (!Number.isInteger(t) || t < 1 || t > l(this, g, Vt) || t === c(this, g, fe).call(this)) return !1;
  l(this, g, pe) || (r(this, D, t), this.requestUpdate());
  const s = { page: t };
  return this.dispatchEvent(
    new CustomEvent("ns-page-change", { detail: s, bubbles: !0, composed: !0 })
  ), !0;
}, /*
  실제로 이동했을 때만 포커스 의도를 남긴다. 양 끝에서 눌린 이전·다음이나
  현재 페이지 재클릭은 DOM 을 바꾸지 않으므로 되돌릴 포커스도 없다 —
  의도를 남기면 한참 뒤의 무관한 업데이트에서 소진되어 포커스를 훔친다.
*/
Ht = function(t, s) {
  c(this, g, Ye).call(this, s) && r(this, F, { control: t, page: s });
};
Bt([
  u({ type: Number })
], gt.prototype, "total");
Bt([
  u({ type: Number, attribute: "per-page" })
], gt.prototype, "perPage");
Bt([
  u({ attribute: !1 })
], gt.prototype, "page");
Bt([
  u({ type: Number, attribute: "default-page" })
], gt.prototype, "defaultPage");
Bt([
  u({ type: Number, attribute: "page-window" })
], gt.prototype, "pageWindow");
x("ns-pagination", gt);
const As = O`
  /*
    overflow-y: auto 가 동작하려면 조상 체인에 실제 높이가 이어져 있어야
    한다. 소비자가 이 엘리먼트에 높이를 주는 레이아웃에 넣어야 한다.

    배경·너비는 preflight 가 건드리지 않으므로 :host 에 그대로 둔다 — 소비자가
    ns-sidebar { … } 로 덮을 자리를 남긴다.
  */
  :host {
    display: block;
    box-sizing: border-box;
    height: 100%;
    min-height: 0;
    width: var(--ns-sidebar-width);
    /*
      양방향을 함께 자른다. 닫힘 규칙에만 두면 열릴 때 규칙이 즉시 매칭을 멈추는
      바람에 폭이 200ms 동안 늘어나는 내내 안의 <nav> 가 호스트 밖으로, 곧 <main>
      위로 그려진다. overflow 는 check-tokens.mjs 규칙 ④ 의 박스 프로퍼티
      (border·margin·padding)가 아니므로 :host 에 두어도 된다.
    */
    overflow: hidden;
    background: var(--ns-color-surface);
    transition: width 200ms var(--ns-transition-ease);
  }

  /*
    닫힘. 레일을 남기지 않고 통째로 사라진다.

    open 이 프로퍼티 전용이라 호스트에는 그 이름의 속성이 없다. 대신 컴포넌트가
    updated() 에서 data-ns-open 을 쓰고, upgrade 전 구간은 tokens.css 의 예약이
    default-open 과 data-ns-open 을 함께 봐서 덮는다. 세 구간이 이렇게 이어진다 —
    upgrade 전에는 문서 예약이, upgrade 와 hydration 사이에는 shim 이 렌더한
    default-open 을 Lit 의 컨버터가 읽어 세운 값이, hydration 이후에는 컴포넌트가
    쓰는 data-ns-open 이 폭을 잡는다.
  */
  :host(:not([data-ns-open])) {
    width: var(--ns-sidebar-width-collapsed);
  }

  /*
    닫히면 탭 순서에서도 빠진다. 폭 0 과 overflow: hidden 은 자를 뿐 숨기지
    않으므로, 그것만으로는 보이지 않는 링크에 Tab 이 내려앉는다.

    지연을 새 상태 쪽에 두는 것이 요점이다 — 닫힐 때는 200ms 뒤에 숨어 애니메이션이
    끝난 뒤에 사라지고, 열릴 때는 기본 규칙에 전이가 없어 즉시 보인다.
  */
  :host(:not([data-ns-open])) nav {
    visibility: hidden;
    transition: visibility 0s 200ms;
  }

  /*
    경계선과 스크롤을 호스트가 아니라 이 <nav> 가 갖는다.

    호스트는 문서 트리에 있으므로 소비자의 문서 규칙이 :host 를 이긴다.
    특정도가 아니라 캐스케이드 순서로 정해지는 것이라 :host 쪽이 아무리
    구체적이어도 진다. Tailwind preflight 의 "*, ::before, ::after,
    ::backdrop { border: 0 solid }" 가 그 규칙이다.

    overflow 를 함께 내리는 이유는 스크롤바와 경계선의 순서다. 경계선만 내리면
    스크롤바가 호스트 것이라 경계선 오른쪽에 생긴다. 같은 요소가 둘을 가져야
    스크롤바가 경계선 안쪽에 남는다.

    min-width: var(--ns-sidebar-width) 를 nav 에 둔다. 이게 없으면 :host 의
    width 전이 200ms 동안 nav 자체가 실제로 좁아져 안의 내용이 그 폭을 따라
    리플로우한다. 예전에는 여기에 "안의 .label 이 white-space: nowrap;
    overflow: hidden; text-overflow: ellipsis 라 글자가 말줄임표로 점진적으로
    줄어들 뿐 레이아웃이 깨지지 않는다" 고 적혀 있었다 — 그 주장은 틀렸다.
    사용자가 실제로 접히는 것을 보고 신고했다: 글자 사이 간격이 줄고 아이콘·
    라벨이 서로 밀리며 찌그러지다 사라지는 것으로 보이고, ns-nav-group 의
    heading 은 white-space: nowrap 조차 없어 여러 줄로 줄바꿈까지 됐다(그건
    ns-nav-group.styles.ts 에서 따로 고친다). min-width 로 nav 를
    --ns-sidebar-width 에 고정하면 전이 내내 내용이 그대로 있고, :host 의
    overflow: hidden 이 넘치는 부분만 자른다 — 전이가 "잘려 사라짐"으로
    보이지 "찌그러져 사라짐"으로 보이지 않는다.

    전에는 이걸 뺐다 — :host { width: … } 를 토큰보다 좁게 override 하는
    소비자에게서 min-width 가 여전히 --ns-sidebar-width 를 붙들어 nav 가
    호스트 밖으로 삐져나왔기 때문이다. 그 사고는 지금 안 난다 — :host 가
    그새 양방향 overflow: hidden 을 얻었다(위 참조, 여는 동안 페인트가
    <main> 위로 새는 것을 막으려고 나중에 추가됐다). nav 가 호스트보다
    넓어도 이제 호스트 경계에서 잘리기만 하지 삐져나오지 않는다.

    남는 대가는 하나, 없애지는 못했다. width override 가 토큰보다 좁으면
    내용은 여전히 --ns-sidebar-width 기준으로 배치된 채 그 좁은 폭에서
    잘린다 — 레이아웃이 깨지진 않지만 내용이 다 보이지도 않는다. 그래서
    폭을 조절하는 공식 통로는 --ns-sidebar-width 토큰이고, ns-sidebar
    { width } 만 override 하는 것은 토큰보다 좁지 않을 때만 안전하다. 같은
    문구가 README.md 의 0.5.0 이주 절과 guide.html 의 ns-sidebar 절에도
    있다.
  */
  nav {
    box-sizing: border-box;
    height: 100%;
    min-width: var(--ns-sidebar-width);
    overflow-x: hidden;
    overflow-y: auto;
    border-right: 1px solid var(--ns-color-line);
    /*
      감추지 않고 가늘게 만든다. 표준 프로퍼티 하나로는 하한을 못 덮어 둘을
      함께 쓴다 — scrollbar-width·scrollbar-color 는 Chrome 121·Firefox 64
      부터라 이 저장소의 하한(Chrome 123·Firefox 121)을 덮지만, Safari 는
      18.2 부터로 하한(17.5)보다 위다. 아래의 ::-webkit-scrollbar 계열은
      비표준이지만 Safari 전 버전과 Chrome 에서 동작해 그 구멍을 막는다.

      두 경로가 같은 요소에서 다투지 않는다 — Chrome 이 scrollbar-width·
      scrollbar-color 를 auto 아닌 값으로 지원하면 레거시 ::-webkit-scrollbar
      계열을 통째로 무시하도록 CSS 워킹 그룹이 정리했다(2024년 결정, Chrome
      121 부터 반영). 그래서 이 저장소 하한에서는 Chrome·Firefox 가 표준
      경로를, 18.2 미만 Safari 만 WebKit 경로를 탄다 — 겹쳐 그려지지 않는다.

      두 경로가 픽셀 단위로 같을 수는 없다 — 표준 scrollbar-width 는 auto·
      thin·none 세 키워드만 받아 두께를 고를 수 없고, WebKit 쪽만 트랙 폭과
      여백을 직접 그릴 수 있다. 아래에서 각각 최대한 가깝게 맞췄을 뿐이다.

      :host-context() 를 금지한 이유와는 다르다 — 그것은 없으면 기능이
      조용히 죽는다. 여기서 WebKit 규칙이 빠지면(18.2 미만 Safari 가 아닌
      다른 상상 속 엔진이라면) 플랫폼 기본 스크롤바로 떨어질 뿐 스크롤
      자체는 죽지 않는다. 그래서 이 벤더 접두사는 전례가 되지 않는다 —
      판단 기준은 "없으면 죽는가, 못생겨지는가" 이지 벤더 접두사 자체의
      허용이 아니다.

      감추지 않고 칠하기로 한 이유는 따로 있다 — 막대를 완전히 지우면
      "목록이 더 이어진다" 는 것을 알려주는 유일한 정적 신호가 함께
      사라진다. 가늘게 두면 그 신호는 남기고 존재감만 줄어든다.
    */
    scrollbar-width: thin;
    scrollbar-color: var(--ns-color-line-strong) transparent;
  }

  /*
    목록 안에 있을 때만 눈에 띄게 한다 — 평소엔 옅다가 스크롤하려는 그
    순간에 진해지는 편이 항상 진한 것보다 덜 거슬린다. scrollbar-color 는
    transition 대상이 아니라(애니메이션 불가 프로퍼티) 즉시 전환된다.
  */
  nav:hover {
    scrollbar-color: var(--ns-color-fg-subtle) transparent;
  }

  /*
    WebKit 쪽 두께는 트랙(--ns-scrollbar-width)과 인셋(--ns-scrollbar-thumb-inset)을
    함께 정해 만든다. border 를 transparent 로 주고 background-clip:
    padding-box 를 쓰면 배경색이 border 안쪽(패딩 상자)에서만 칠해져,
    실제로 보이는 막대는 트랙보다 좁고 양옆에 여백이 남는다 — border
    두께만큼 막대가 트랙 가운데로 졸아든다. border 를 안 쓰고 막대 폭만
    줄이면 트랙 배경이 그대로 남아 막대 옆에 색 있는 여백이 아니라 색
    없는 여백이 필요한데, ::-webkit-scrollbar-track 자체가 transparent
    라 그 여백을 만드는 유일한 수단이 이 인셋이다.

    두 값을 토큰으로 뽑은 이유는 tokens.css 의 정의 옆 주석에 있다 — 이
    블록이 ns-dialog · .ns-multi-select__list 에도 그대로 반복되면서
    "한 곳에만 있는 구조적 상수" 에서 "두 곳 이상에 나타나는 값" 으로
    넘어갔다.
  */
  nav::-webkit-scrollbar {
    width: var(--ns-scrollbar-width);
  }

  nav::-webkit-scrollbar-track {
    background: transparent;
  }

  nav::-webkit-scrollbar-thumb {
    background-color: var(--ns-color-line-strong);
    border-radius: var(--ns-radius-pill);
    border: var(--ns-scrollbar-thumb-inset) solid transparent;
    background-clip: padding-box;
  }

  nav::-webkit-scrollbar-thumb:hover {
    background-color: var(--ns-color-fg-subtle);
    background-clip: padding-box;
  }
`;
var Os = Object.defineProperty, Ge = (n, o, t, s) => {
  for (var e = void 0, i = n.length - 1, a; i >= 0; i--)
    (a = n[i]) && (e = a(o, t, e) || e);
  return e && Os(o, t, e), e;
}, ot, Gt, Qe;
const Le = class Le extends C {
  constructor() {
    super(...arguments);
    d(this, Gt);
    d(this, ot);
    this.defaultOpen = !1, r(this, ot, !1);
  }
  connectedCallback() {
    super.connectedCallback(), k(), J(this, { open: "default-open" });
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
  willUpdate(t) {
    t.has("defaultOpen") && r(this, ot, this.defaultOpen === !0);
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
  updated() {
    this.toggleAttribute("data-ns-open", l(this, Gt, Qe));
  }
  render() {
    return b`<nav><slot></slot></nav>`;
  }
};
ot = new WeakMap(), Gt = new WeakSet(), Qe = function() {
  return this.open ?? l(this, ot);
}, Le.styles = As;
let Ct = Le;
Ge([
  u({ attribute: !1 })
], Ct.prototype, "open");
Ge([
  u({ type: Boolean, attribute: "default-open" })
], Ct.prototype, "defaultOpen");
x("ns-sidebar", Ct);
const Ms = O`
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
var zs = Object.defineProperty, Ae = (n, o, t, s) => {
  for (var e = void 0, i = n.length - 1, a; i >= 0; i--)
    (a = n[i]) && (e = a(o, t, e) || e);
  return e && zs(o, t, e), e;
};
const Us = /* @__PURE__ */ new Set(["badge", "control", "panel", "card", "pill"]);
var Qt, ts;
const qe = class qe extends C {
  constructor() {
    super(...arguments);
    d(this, Qt);
    this.width = "100%", this.height = "1rem", this.radius = "control";
  }
  connectedCallback() {
    super.connectedCallback(), k();
  }
  render() {
    return b`
      <div
        class="bar"
        aria-hidden="true"
        style="width:${this.width};height:${this.height};border-radius:${c(this, Qt, ts).call(this)}"
      ></div>
    `;
  }
};
Qt = new WeakSet(), ts = function() {
  return Us.has(this.radius) ? `var(--ns-radius-${this.radius})` : this.radius;
}, qe.styles = Ms;
let ft = qe;
Ae([
  u({ type: String })
], ft.prototype, "width");
Ae([
  u({ type: String })
], ft.prototype, "height");
Ae([
  u({ type: String })
], ft.prototype, "radius");
x("ns-skeleton", ft);
var Ds = Object.defineProperty, It = (n, o, t, s) => {
  for (var e = void 0, i = n.length - 1, a; i >= 0; i--)
    (a = n[i]) && (e = a(o, t, e) || e);
  return e && Ds(o, t, e), e;
};
function js(n) {
  return n === "none" ? "ascending" : n === "ascending" ? "descending" : "none";
}
var R, W, N, rt, at, h, es, be, ge, ss, Y, ve, lt, Xt, L, wt, me, ns, is, yt, os;
class vt extends We {
  constructor() {
    super(...arguments);
    d(this, h);
    d(this, R);
    d(this, W);
    /*
        비제어 모드에서 ns-select-change 로 **마지막에 보고한 집합**이다.
        `undefined` 면 아직 기준선이 없다는 뜻이고, 그때는 비교 대신 seed 만 한다.
    
        관찰자가 이것과 DOM 을 비교해 "이벤트 없이 바뀐 선택" 을 잡는다.
      */
    d(this, N);
    d(this, rt);
    d(this, at);
    d(this, lt);
    this.defaultSortKey = "", this.defaultSortDirection = "none", r(this, R, ""), r(this, W, "none"), r(this, rt, !1), r(this, lt, (t) => {
      const s = t.target, e = s == null ? void 0 : s.closest(
        'input[type="checkbox"][data-ns-select-all], input[type="checkbox"][data-ns-row-id]'
      );
      if (e && c(this, h, Y).call(this, e)) {
        c(this, h, os).call(this, e);
        return;
      }
      const i = s == null ? void 0 : s.closest("th[data-ns-sort-key]");
      if (!i || !c(this, h, Y).call(this, i)) return;
      const a = i.dataset.nsSortKey ?? "", f = a === l(this, h, be) ? js(l(this, h, ge)) : "ascending", y = f === "none" ? "" : a;
      l(this, h, es) || (r(this, R, y), r(this, W, f), this.requestUpdate());
      const z = { key: y, direction: f };
      this.dispatchEvent(
        new CustomEvent("ns-sort", { detail: z, bubbles: !0, composed: !0 })
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
    super.connectedCallback(), k(), J(this, {
      "sort-key": "default-sort-key",
      "sort-direction": "default-sort-direction",
      selected: "각 행 checkbox 의 checked 속성"
    }), this.addEventListener("click", l(this, lt)), r(this, at, new MutationObserver(() => {
      c(this, h, ve).call(this), c(this, h, wt).call(this), c(this, h, is).call(this);
    })), l(this, at).observe(this, { childList: !0, subtree: !0 });
  }
  disconnectedCallback() {
    var t;
    this.removeEventListener("click", l(this, lt)), (t = l(this, at)) == null || t.disconnect(), super.disconnectedCallback();
  }
  /*
    비제어 초기값을 seed 한다. 덮어쓰지 않는다 — Lit 은 첫 업데이트를
    마이크로태스크로 미루므로, 생성과 같은 태스크에서 프로퍼티를 만진 코드가
    여기보다 먼저 실행된다. 무조건 대입하면 그것이 경고 없이 사라진다.
  */
  firstUpdated() {
    this.defaultSortKey !== "" && r(this, R, this.defaultSortKey), this.defaultSortDirection !== "none" && r(this, W, this.defaultSortDirection), this.selected === void 0 && r(this, N, c(this, h, me).call(this));
  }
  updated() {
    c(this, h, ss).call(this), c(this, h, ve).call(this), c(this, h, wt).call(this);
  }
}
R = new WeakMap(), W = new WeakMap(), N = new WeakMap(), rt = new WeakMap(), at = new WeakMap(), h = new WeakSet(), es = function() {
  return this.sortKey !== void 0;
}, be = function() {
  return this.sortKey ?? l(this, R);
}, ge = function() {
  return this.sortDirection ?? l(this, W);
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
ss = function() {
  l(this, rt) || this.sortDirection === void 0 || this.sortKey !== void 0 || (r(this, rt, !0), console.warn(
    `[ns-table] sortDirection="${this.sortDirection}" 만 설정하고 sortKey 는 설정하지 않았습니다. 둘은 짝이라 이 상태에서는 정렬 방향이 바뀌지 않습니다. 제어하려면 둘 다 설정하고, 비제어 초기값이 목적이면 default-sort-direction 을 쓰세요.`
  ));
}, /*
  Light DOM 이라 shadow 경계가 없다. 중첩된 <ns-table> 의 <th>·체크박스도 바깥
  호스트의 querySelectorAll·closest 에 그대로 잡히므로, 안쪽 헤더 클릭이나 안쪽
  체크박스가 바깥 컴포넌트에서도 처리돼 이벤트가 두 번 발생하고 두 컴포넌트가
  같은 상태를 두고 다툰다. 가장 가까운 ns-table 이 자기인 요소만 자기 것이다.
  헤더 · 행 체크박스 · 전체 선택 체크박스 모두 이 검사를 거친다.
*/
Y = function(t) {
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
    속성을 직접 렌더한다(guide.html 의 SSR 안내).
  */
ve = function() {
  const t = l(this, h, be), s = l(this, h, ge);
  for (const e of this.querySelectorAll("th[data-ns-sort-key]"))
    c(this, h, Y).call(this, e) && (e.dataset.nsSortKey === t && s !== "none" ? e.setAttribute("aria-sort", s) : e.removeAttribute("aria-sort"));
}, lt = new WeakMap(), /*
  중첩된 <ns-table> 의 행 체크박스도 바깥 호스트의 querySelectorAll 에 그대로
  잡힌다 — #owns 로 걸러 자기 것만 남긴다.
*/
Xt = function() {
  return [...this.querySelectorAll("input[data-ns-row-id]")].filter(
    (t) => c(this, h, Y).call(this, t)
  );
}, L = function(t) {
  return t.dataset.nsRowId ?? "";
}, /*
    전체 선택 체크박스의 3-상태를 쓴다. checked 와 indeterminate 의 유일한
    작성자가 컴포넌트다 — 소비자는 그 둘을 바인딩하지 않는다.

    indeterminate 는 프로퍼티고 대응하는 HTML 속성이 없다. 마크업만으로는
    "일부 선택" 을 만들 수 없어서, 이것이 컴포넌트가 가져갈 값이 있는 지점이다.
  */
wt = function() {
  const t = [
    ...this.querySelectorAll("input[data-ns-select-all]")
  ].filter((y) => c(this, h, Y).call(this, y));
  if (t.length === 0) return;
  const s = c(this, h, Xt).call(this), e = this.selected, i = e === void 0 ? s.filter((y) => y.checked).length : s.filter((y) => e.includes(c(this, h, L).call(this, y))).length, a = s.length > 0 && i === s.length, f = i > 0 && i < s.length;
  for (const y of t)
    y.checked = a, y.indeterminate = f;
}, /** 비제어 모드의 진실 — DOM 이다. 행 순서를 그대로 따른다. */
me = function() {
  return c(this, h, Xt).call(this).filter((t) => t.checked).map((t) => c(this, h, L).call(this, t));
}, /*
  **내용**으로 비교한다. 배열 정체성으로 보면 매번 새 배열이라 관찰자가 도는
  족족 "바뀌었다" 가 되어 이벤트를 스팸한다. 순서도 보지 않는다 — 소비자가
  행을 재정렬하면 같은 집합이 다른 순서로 오는데 그것은 선택 변경이 아니다.
  (같은 data-ns-row-id 가 둘인 마크업은 정의되지 않은 입력으로 둔다.)
*/
ns = function(t, s) {
  if (t.length !== s.length) return !1;
  const e = new Set(s);
  return t.every((i) => e.has(i));
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
is = function() {
  if (this.selected !== void 0) return;
  const t = c(this, h, me).call(this), s = l(this, N);
  if (!(s !== void 0 && c(this, h, ns).call(this, s, t))) {
    if (s === void 0 || this.ownerDocument.readyState === "loading") {
      r(this, N, t);
      return;
    }
    c(this, h, yt).call(this, t);
  }
}, yt = function(t) {
  r(this, N, t);
  const s = { ids: t };
  this.dispatchEvent(
    new CustomEvent("ns-select-change", { detail: s, bubbles: !0, composed: !0 })
  );
}, /**
 * 체크박스 하나가 활성화됐다. `box.checked` 는 **이미 뒤집힌 뒤**다.
 *
 * `change` 가 아니라 `click` 에서 부른다 — 근거는 `#onClick` 주석에 있다.
 */
os = function(t) {
  const s = c(this, h, Xt).call(this);
  if (t.hasAttribute("data-ns-select-all")) {
    if (this.selected === void 0)
      for (const f of s) f.checked = t.checked;
    c(this, h, yt).call(this, t.checked ? s.map((f) => c(this, h, L).call(this, f)) : []), this.selected === void 0 && c(this, h, wt).call(this);
    return;
  }
  if (!t.hasAttribute("data-ns-row-id")) return;
  let e;
  if (this.selected === void 0) {
    e = s.filter((f) => f.checked).map((f) => c(this, h, L).call(this, f)), c(this, h, yt).call(this, e), c(this, h, wt).call(this);
    return;
  }
  const i = new Set(this.selected), a = c(this, h, L).call(this, t);
  t.checked ? i.add(a) : i.delete(a), e = s.map((f) => c(this, h, L).call(this, f)).filter((f) => i.has(f)), c(this, h, yt).call(this, e);
};
It([
  u({ attribute: !1 })
], vt.prototype, "sortKey");
It([
  u({ attribute: !1 })
], vt.prototype, "sortDirection");
It([
  u({ type: String, attribute: "default-sort-key" })
], vt.prototype, "defaultSortKey");
It([
  u({ type: String, attribute: "default-sort-direction" })
], vt.prototype, "defaultSortDirection");
It([
  u({ attribute: !1 })
], vt.prototype, "selected");
x("ns-table", vt);
var Ks = Object.defineProperty, rs = (n, o, t, s) => {
  for (var e = void 0, i = n.length - 1, a; i >= 0; i--)
    (a = n[i]) && (e = a(o, t, e) || e);
  return e && Ks(o, t, e), e;
};
function Ls(n) {
  return `${n}-tab`;
}
var V, ct, dt, p, we, xt, q, ye, Zt, xe, ke, $e, ht, ut;
class Oe extends We {
  constructor() {
    super(...arguments);
    d(this, p);
    d(this, V);
    d(this, ct);
    d(this, dt);
    d(this, ht);
    d(this, ut);
    this.defaultActive = "", r(this, V, ""), r(this, dt, !1), r(this, ht, (t) => {
      const s = c(this, p, $e).call(this, t.target);
      s !== null && c(this, p, xe).call(this, c(this, p, q).call(this, s), !1);
    }), r(this, ut, (t) => {
      const s = c(this, p, $e).call(this, t.target);
      if (s === null) return;
      const e = l(this, p, xt), i = e.indexOf(s);
      if (i === -1) return;
      const a = (f) => {
        t.preventDefault(), c(this, p, xe).call(this, c(this, p, q).call(this, e[(f + e.length) % e.length]), !0);
      };
      t.key === "ArrowRight" ? a(i + 1) : t.key === "ArrowLeft" ? a(i - 1) : t.key === "Home" ? a(0) : t.key === "End" && a(e.length - 1);
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
    super.connectedCallback(), k(), J(this, { active: "default-active" }), this.hasAttribute("role") || this.setAttribute("role", "tablist"), this.addEventListener("click", l(this, ht)), this.addEventListener("keydown", l(this, ut)), r(this, ct, new MutationObserver(() => c(this, p, Zt).call(this))), l(this, ct).observe(this, { childList: !0, subtree: !0 });
  }
  disconnectedCallback() {
    var t;
    this.removeEventListener("click", l(this, ht)), this.removeEventListener("keydown", l(this, ut)), (t = l(this, ct)) == null || t.disconnect(), super.disconnectedCallback();
  }
  /*
      비제어 초기값을 seed 한다. ns-pagination 과 달리 firstUpdated 로 충분하다 —
      이 컴포넌트는 render 를 갖지 않으므로 DOM 쓰기가 전부 updated() 에서 일어나고
      그것은 firstUpdated 다음이다. ns-table 과 같은 자리다.
  
      덮어쓰지 않고 seed 만 한다. Lit 은 첫 업데이트를 마이크로태스크로 미루므로,
      생성과 같은 태스크에서 프로퍼티를 만진 코드가 여기보다 먼저 실행된다.
    */
  firstUpdated() {
    this.defaultActive !== "" && r(this, V, this.defaultActive);
  }
  updated() {
    c(this, p, Zt).call(this);
  }
}
V = new WeakMap(), ct = new WeakMap(), dt = new WeakMap(), p = new WeakSet(), we = function() {
  return this.active !== void 0;
}, xt = function() {
  return [...this.querySelectorAll("[data-ns-tab]")].filter(
    (t) => t.closest("ns-tabs") === this
  );
}, q = function(t) {
  return t.dataset.nsTab ?? "";
}, ye = function() {
  const t = l(this, p, xt);
  if (t.length === 0) return "";
  const s = this.active ?? l(this, V);
  if (t.some((i) => c(this, p, q).call(this, i) === s)) return s;
  const e = c(this, p, q).call(this, t[0]);
  return s !== "" && !l(this, dt) && (r(this, dt, !0), console.warn(
    l(this, p, we) ? `[ns-tabs] active="${s}" 와 일치하는 data-ns-tab 이 없습니다. 첫 번째 탭 "${e}" 을 표시하지만 그 탭을 눌러도 ns-tab-change 가 나가지 않습니다. 대소문자까지 맞는지 확인하세요.` : `[ns-tabs] 활성 탭 "${s}" 와 일치하는 data-ns-tab 이 없습니다. 첫 번째 탭 "${e}" 을 표시합니다. default-active 값이 data-ns-tab 과 맞는지 확인하세요.`
  )), e;
}, /** 소비자 DOM 에 ARIA 와 roving tabindex 를 쓴다. 멱등이다. */
Zt = function() {
  const t = l(this, p, ye);
  for (const s of l(this, p, xt)) {
    const e = c(this, p, q).call(this, s), i = s.dataset.nsPanel ?? "";
    s.setAttribute("role", "tab"), !s.hasAttribute("id") && i !== "" && s.setAttribute("id", Ls(i)), i !== "" && s.setAttribute("aria-controls", i), s.setAttribute("aria-selected", e === t ? "true" : "false"), s.setAttribute("tabindex", e === t ? "0" : "-1");
  }
}, xe = function(t, s) {
  if (t === "") return;
  if (t === l(this, p, ye)) {
    s && c(this, p, ke).call(this, t);
    return;
  }
  l(this, p, we) || (r(this, V, t), this.requestUpdate());
  const e = { id: t };
  this.dispatchEvent(
    new CustomEvent("ns-tab-change", { detail: e, bubbles: !0, composed: !0 })
  ), c(this, p, Zt).call(this), s && c(this, p, ke).call(this, t);
}, ke = function(t) {
  var s;
  (s = l(this, p, xt).find((e) => c(this, p, q).call(this, e) === t)) == null || s.focus();
}, /** 이벤트가 우리 탭에서 났으면 그 요소, 아니면 null. */
$e = function(t) {
  var e;
  const s = ((e = t == null ? void 0 : t.closest) == null ? void 0 : e.call(t, "[data-ns-tab]")) ?? null;
  return s === null || s.closest("ns-tabs") !== this ? null : s;
}, ht = new WeakMap(), ut = new WeakMap();
rs([
  u({ attribute: !1 })
], Oe.prototype, "active");
rs([
  u({ type: String, attribute: "default-active" })
], Oe.prototype, "defaultActive");
x("ns-tabs", Oe);
const qs = O`
  :host {
    position: fixed;
    /*
      **기본 자리(top-center)의 인셋을 :host 에도 둔다.** 아래 네 규칙 중 아무것도
      걸리지 않는 상태가 둘 있고, 인셋이 하나도 없는 fixed 상자는 정적 위치
      (문서 흐름에서 있었을 자리)에 남으므로 그 둘을 여기서 받는다.

      ⓐ connectedCallback ~ 첫 update() — Lit 이 속성을 첫 업데이트에서 반영하므로
         그 전에는 [position] 이 없다.
      ⓑ **범위 밖의 값.** 타입이 없는 UMD·순수 JS 소비자가 nsToastPosition("center-top")
         을 부르면 그 문자열이 그대로 반영돼 어느 규칙에도 걸리지 않는다.

      **upgrade 전 구간은 여기서 덮이지 않는다** — shadow root 가 없으면 이 규칙도
      없다. 그 구간은 애초에 그릴 내용이 없어 문제가 되지 않는다. 근거는 ns-toast.ts
      의 position 주석에 있다.
    */
    top: var(--ns-space-4);
    right: auto;
    bottom: auto;
    left: 50%;
    transform: translateX(-50%);
    /*
      **가운데 정렬에서 폭이 반토막 나는 것을 막는다.** width: auto 인 fixed 상자는
      shrink-to-fit 이고, 그때 "쓸 수 있는 폭" 은 컨테이닝 블록 폭에서 left 를 뺀
      값이다 — left: 50% 면 50vw 다. 좁은 화면에서 그 값이 .region 의 max-width
      보다 먼저 걸려 토스트가 화면 절반 폭으로 눌린다. max-content 는 그 계산에서
      빠지고, 넘치는 것은 .region 의 max-width 가 그대로 막는다.
    */
    width: max-content;
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

      해결은 문서다 — guide.html 의 nsToast 절 "주의" 에 적혀 있다.
    */
    z-index: 1000;
    display: block;
    /* 토스트가 없는 동안 리전이 덮는 자리의 클릭을 가로채지 않는다. */
    pointer-events: none;
  }

  /*
    네 자리. **각 규칙이 인셋 넷과 transform 을 모두 적는다.** 자기에게 필요한
    것만 적고 나머지는 다른 규칙이 지워 주기를 기대하면 두 값이 함께 걸리고,
    규칙을 하나 더할 때 어느 쪽이 이기는지가 소스 순서로 조용히 바뀐다.
    .ns-accordion 이 --card/--plain 을 반드시 함께 쓰게 만든 것과 같은 판단이다.

    top-center 규칙은 위 :host 기본값과 값이 같다. 중복이지만 일부러 적는다 —
    네 자리가 한자리에 모여 있어야 대조할 수 있고, 기본값이 바뀌어도 이 규칙은
    자기 이름이 뜻하는 자리를 계속 가리킨다.
  */
  :host([position="top-center"]) {
    top: var(--ns-space-4);
    right: auto;
    bottom: auto;
    left: 50%;
    transform: translateX(-50%);
  }

  :host([position="bottom-center"]) {
    top: auto;
    right: auto;
    bottom: var(--ns-space-4);
    left: 50%;
    transform: translateX(-50%);
  }

  :host([position="top-right"]) {
    top: var(--ns-space-4);
    right: var(--ns-space-4);
    bottom: auto;
    left: auto;
    transform: none;
  }

  :host([position="bottom-right"]) {
    top: auto;
    right: var(--ns-space-4);
    bottom: var(--ns-space-4);
    left: auto;
    transform: none;
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
    tone 은 메시지 앞의 작은 원점 하나로만 표현한다. 배경을 칠하면 글자 대비를
    다시 정해야 하고, 왼쪽 변을 두껍게 하면 상자 자체의 모양이 tone 마다 달라진다.

    **neutral 은 점을 아예 그리지 않는다.** 투명한 자리 채우기를 두지 않는다는
    뜻이기도 하다 — 그래서 neutral 토스트의 글자는 색 있는 것보다 (점 + gap)
    만큼 왼쪽에서 시작하고, 섞어 쌓으면 글자 시작점이 어긋난다. **의도한
    선택이다.** 없는 것을 자리로 주장하지 않는다.

    점은 장식이다. tone 은 danger 의 role="alert" 와 메시지 글자로 이미
    보조기술에 닿으므로 ns-toast.ts 가 aria-hidden 을 붙인다.

    첫 줄 글자의 세로 중앙에 맞춘다. .toast 가 align-items: flex-start 라 점이
    그대로 상자 맨 위에 붙는데, 여러 줄 메시지에서 그것이 첫 글자보다 위에
    뜬다. 줄 높이와 점 지름의 차이 절반만큼 내리면 첫 줄과 중심이 같아진다.
  */
  .dot {
    flex-shrink: 0;
    width: var(--ns-space-2);
    height: var(--ns-space-2);
    margin-top: calc((var(--ns-line-height-sm) - var(--ns-space-2)) / 2);
    border-radius: var(--ns-radius-pill);
  }

  .toast.success .dot { background: var(--ns-color-success); }
  .toast.danger  .dot { background: var(--ns-color-danger); }
  .toast.warn    .dot { background: var(--ns-color-warn); }

  .message {
    flex: 1;
    min-width: 0;
    /* 긴 메시지가 한 줄로 넘치지 않게 한다. */
    overflow-wrap: anywhere;
  }

  /*
    닫기 버튼도 첫 줄 글자의 세로 중앙에 맞춘다. 점과 같은 이유이고 같은 계산이다 —
    .toast 가 align-items: flex-start 라 버튼이 상자 맨 위에 붙는데, 버튼의 높이는
    아이콘(--ns-icon-size)에 위아래 padding 이 더해진 값이라 줄 높이보다 크다.
    그 차이의 절반만큼 아이콘 중심이 첫 글자 중심보다 내려가 있었다.

    **위아래에 똑같이 준다.** 위만 당기면 버튼이 아래로 그만큼 더 삐져나와 상자
    높이를 늘리지만, 양쪽을 당기면 배치상의 높이가 정확히 한 줄이 되어 한 줄
    메시지에서 토스트가 글자보다 커지지 않는다. 넘치는 만큼은 .toast 의
    padding(--ns-space-3) 안에 들어가므로 상자 밖으로 나가지 않는다.

    지금 값은 우연히 0 이 아니다 — --ns-icon-size 와 --ns-line-height-sm 이 둘 다
    1.25rem 이라 남는 것은 padding 뿐이지만, 그 셋 중 무엇이 바뀌어도 이 식이
    따라간다.
  */
  .close {
    flex-shrink: 0;
    margin-block: calc(
      (var(--ns-line-height-sm) - (var(--ns-icon-size) + var(--ns-space-1) * 2)) / 2
    );
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
var Ts = Object.defineProperty, as = (n, o, t, s) => {
  for (var e = void 0, i = n.length - 1, a; i >= 0; i--)
    (a = n[i]) && (e = a(o, t, e) || e);
  return e && Ts(o, t, e), e;
}, jt, j, _, K, m, Ce, Se, Ee, G, Kt, Lt, qt, Tt;
const Te = class Te extends C {
  constructor() {
    super(...arguments);
    d(this, m);
    d(this, jt);
    d(this, j);
    d(this, _);
    d(this, K);
    d(this, Kt);
    d(this, Lt);
    d(this, qt);
    d(this, Tt);
    this.position = "top-center", this.items = [], r(this, jt, 0), r(this, j, !1), r(this, _, !1), r(this, K, !1), r(this, Kt, () => {
      r(this, j, !0), c(this, m, G).call(this);
    }), r(this, Lt, () => {
      r(this, j, !1), c(this, m, G).call(this);
    }), r(this, qt, () => {
      r(this, _, !0), c(this, m, G).call(this);
    }), r(this, Tt, () => {
      r(this, _, !1), c(this, m, G).call(this);
    });
  }
  connectedCallback() {
    super.connectedCallback(), k(), c(this, m, Ee).call(this);
  }
  disconnectedCallback() {
    c(this, m, Se).call(this), r(this, j, !1), r(this, _, !1), r(this, K, !1), super.disconnectedCallback();
  }
  /** 토스트 하나를 띄운다. 돌려주는 함수를 부르면 즉시 닫는다(두 번 불러도 안전). */
  show(t, s, e) {
    const i = Ie(this, jt)._++, a = {
      key: i,
      message: t,
      tone: s,
      duration: e,
      remaining: e,
      startedAt: Date.now()
    };
    return this.items = [...this.items, a], l(this, K) || c(this, m, Ce).call(this, a), () => this.dismiss(i);
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
    r(this, _, ((t = this.shadowRoot) == null ? void 0 : t.activeElement) != null), c(this, m, G).call(this);
  }
  render() {
    return b`
      <div
        class="region"
        aria-live="polite"
        @mousemove=${l(this, Kt)}
        @mouseleave=${l(this, Lt)}
        @focusin=${l(this, qt)}
        @focusout=${l(this, Tt)}
      >
        ${Jt(
      this.items,
      (t) => t.key,
      (t) => b`
            <div class="toast ${t.tone}" role=${t.tone === "danger" ? "alert" : w}>
              ${t.tone === "neutral" ? w : b`<span class="dot" aria-hidden="true"></span>`}
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
jt = new WeakMap(), j = new WeakMap(), _ = new WeakMap(), K = new WeakMap(), m = new WeakSet(), /*
    자동 소멸 타이머를 건다. 이미 돌고 있으면 아무 일도 하지 않는다 — 재개가
    멱등한 근거다.

    **양수 유한값이 아니면 걸지 않는다.** 「저절로 사라지지 않는다」 는 한쪽으로
    0 이하·NaN·Infinity 를 전부 모은다. duration <= 0 만 보면 Infinity 가 가드를
    통과해 setTimeout(cb, Infinity) 로 가는데, WebIDL 의 long 변환이 비유한값을
    0 으로 만들므로 **다음 태스크에 즉시 닫힌다** — 「영원히 띄운다」 는 뜻으로
    Infinity 를 준 소비자가 한 프레임 번쩍이는 토스트를 받고, 오류도 경고도 없다.
    NaN 도 같은 경로다. 음수는 원래 <= 0 이라 영구였고 그대로 유지된다.
  */
Ce = function(t) {
  !Number.isFinite(t.duration) || t.duration <= 0 || t.timer !== void 0 || (t.startedAt = Date.now(), t.timer = window.setTimeout(() => this.dismiss(t.key), t.remaining));
}, /*
    포인터가 위에서 움직였거나(#onMouseMove 주석 참고) 안쪽에 포커스가 있는 동안
    자동 소멸을 멈춘다. 안 멈추면 읽는 중에, 혹은 닫기 버튼에 Tab 으로 닿는 중에
    사라진다.

    items 배열을 갈아 끼우지 않고 항목을 직접 고친다 — 화면에 보이는 것이 하나도
    바뀌지 않으므로 리렌더할 이유가 없다.
  */
Se = function() {
  for (const t of this.items)
    t.timer !== void 0 && (clearTimeout(t.timer), t.timer = void 0, t.remaining = Math.max(0, t.remaining - (Date.now() - t.startedAt)));
}, Ee = function() {
  for (const t of this.items) c(this, m, Ce).call(this, t);
}, /*
  두 사유를 하나의 적용 상태로 접는다. 사유가 바뀔 때마다 부르고, 실제 정지·재개는
  상태가 뒤집힐 때만 일어난다.
*/
G = function() {
  const t = l(this, j) || l(this, _);
  t !== l(this, K) && (r(this, K, t), t ? c(this, m, Se).call(this) : c(this, m, Ee).call(this));
}, Kt = new WeakMap(), Lt = new WeakMap(), qt = new WeakMap(), Tt = new WeakMap(), Te.styles = qs;
let St = Te;
as([
  u({ reflect: !0 })
], St.prototype, "position");
as([
  Pe()
], St.prototype, "items");
x("ns-toast", St);
let ls = "top-center";
function Bs() {
  const n = document.querySelector("ns-toast");
  if (n !== null) return n;
  const o = document.createElement("ns-toast");
  return o.position = ls, document.body.append(o), o;
}
function Vs(n) {
  if (ls = n, typeof document > "u") return;
  const o = document.querySelector("ns-toast");
  o !== null && (o.position = n);
}
function Hs(n, o = {}) {
  if (typeof document > "u") return () => {
  };
  const { tone: t = "neutral", duration: s = 4e3 } = o;
  return Bs().show(n, t, s);
}
function cs(n, o, t) {
  const s = document.activeElement, e = document.createElement("ns-dialog");
  e.heading = n.heading ?? "";
  const i = document.createElement("p");
  i.textContent = n.message, i.style.margin = "0", e.append(i);
  let a = !1;
  const f = ($) => {
    if (a) return;
    a = !0, e.close();
    const mt = () => {
      e.remove(), t($), s instanceof HTMLElement && s.isConnected && s.focus();
    };
    e.updateComplete.then(mt, mt);
  }, y = async ($) => {
    for (let mt = 0; mt < 5; mt++)
      if (await e.updateComplete, a || ($.focus({ preventScroll: !0 }), document.activeElement === $)) return;
    console.warn(
      "[ns-confirm] 취소 버튼에 초기 포커스를 주지 못했습니다. ns-dialog 의 갱신 순서가 바뀌었을 수 있습니다."
    );
  }, z = document.createElement("button");
  z.type = "button", z.slot = "footer", z.className = n.tone === "danger" ? "ns-button ns-button--danger ns-button--sm" : "ns-button ns-button--solid ns-button--sm", z.textContent = n.confirmLabel ?? "확인", z.addEventListener("click", () => f(!0));
  let ee = null;
  if (o) {
    const $ = document.createElement("button");
    $.type = "button", $.slot = "footer", $.className = "ns-button ns-button--outline ns-button--sm", $.textContent = n.cancelLabel ?? "취소", $.addEventListener("click", () => f(!1)), n.tone === "danger" && (ee = $), e.append($);
  }
  e.append(z), e.addEventListener("ns-dialog-close", () => f(!1)), document.body.append(e), e.show(), ee !== null && y(ee);
}
function Xs(n) {
  return typeof document > "u" ? Promise.resolve() : new Promise((o) => {
    cs(n, !1, () => o());
  });
}
function Zs(n) {
  return typeof document > "u" ? Promise.resolve(!1) : new Promise((o) => {
    cs(n, !0, o);
  });
}
export {
  A as NsDialog,
  kt as NsHeader,
  Yt as NsIcon,
  E as NsMultiSelect,
  H as NsNavGroup,
  pt as NsNavItem,
  $t as NsPageHeading,
  gt as NsPagination,
  Ct as NsSidebar,
  ft as NsSkeleton,
  vt as NsTable,
  Oe as NsTabs,
  St as NsToast,
  Xs as nsAlert,
  Zs as nsConfirm,
  Hs as nsToast,
  Vs as nsToastPosition,
  Ns as registerIcons,
  Gs as svg,
  Ls as tabIdFor
};
