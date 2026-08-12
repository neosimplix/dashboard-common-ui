import { LitElement } from "lit";
export declare class NsNavGroup extends LitElement {
    static styles: import("lit").CSSResult;
    /** 그룹 제목. 사이드바가 접히면 시각적으로 숨지만 aria-label 로는 남는다. */
    heading: string;
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "ns-nav-group": NsNavGroup;
    }
}
