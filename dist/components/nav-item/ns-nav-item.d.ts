import { LitElement } from "lit";
export declare class NsNavItem extends LitElement {
    #private;
    static styles: import("lit").CSSResult;
    /** 라우팅 키. ns-navigate 이벤트에 그대로 실린다. */
    href: string;
    /** 펼친 상태에서 보이는 라벨. 넘치면 한 줄 말줄임. */
    label: string;
    /**
     * 활성 여부. 컴포넌트가 스스로 바꾸지 않는다 — 소비자가 내려준다.
     * reflect 로 속성에 남겨야 :host([active]) 스타일이 걸린다.
     */
    active: boolean;
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "ns-nav-item": NsNavItem;
    }
}
