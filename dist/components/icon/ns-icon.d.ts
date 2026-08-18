import { LitElement, nothing } from "lit";
export declare class NsIcon extends LitElement {
    #private;
    static styles: import("lit").CSSResult;
    /** 스프라이트의 키. 없는 이름이면 아무것도 그리지 않고 경고한다. */
    name: string;
    connectedCallback(): void;
    render(): typeof nothing | import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "ns-icon": NsIcon;
    }
}
