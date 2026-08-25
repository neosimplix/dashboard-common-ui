import { LitElement } from "lit";
export declare class NsSidebar extends LitElement {
    static styles: import("lit").CSSResult;
    /**
     * 펼침 여부. 접히면 완전히 사라지지 않고 레일(--ns-sidebar-width-collapsed)이 남는다.
     * 컴포넌트가 스스로 바꾸지 않는다 — ns-header 의 ns-toggle 을 받아 소비자가 내려준다.
     */
    open: boolean;
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "ns-sidebar": NsSidebar;
    }
}
