import { LitElement } from "lit";
export declare class NsIcon extends LitElement {
    #private;
    static styles: import("lit").CSSResult;
    /**
     * 스프라이트의 키.
     *
     * 자식을 넣으면 그것이 이긴다 — 이 프로퍼티는 슬롯 폴백이므로 자식이 있을 때는
     * 읽히지 않는다. 없는 이름이면 아무것도 그리지 않고 한 번 경고한다.
     */
    name: string;
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
    updated(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "ns-icon": NsIcon;
    }
}
