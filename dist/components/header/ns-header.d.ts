import { LitElement } from "lit";
import "../icon/ns-icon.js";
export declare class NsHeader extends LitElement {
    #private;
    static styles: import("lit").CSSResult;
    /** 헤더 좌측에 표시할 프로젝트 이름. */
    projectName: string;
    /**
     * 사이드바 펼침 여부. 토글 버튼의 aria-expanded 와 aria-label 을 결정한다.
     * 컴포넌트가 스스로 바꾸지 않는다 — ns-toggle 을 받아 소비자가 내려준다.
     */
    sidebarOpen: boolean;
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "ns-header": NsHeader;
    }
}
