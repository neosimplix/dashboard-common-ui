import { LitElement } from "lit";
export declare class NsPageHeading extends LitElement {
    static styles: import("lit").CSSResult;
    /**
     * 제목.
     *
     * `title` 이 아니라 `heading` 인 이유: `title` 은 모든 HTML 요소의 전역
     * 속성이고 브라우저가 툴팁을 띄운다. `@property` 로 `HTMLElement.prototype.title`
     * 을 덮어도 속성에 반영되는 순간 제목 전체가 툴팁을 갖는다.
     * React 프롭만 `title` 을 유지한다(src/react/tags/PageHeading.tsx).
     */
    heading: string;
    /** 제목 아래 한 줄. 빈 문자열이면 <p> 를 렌더하지 않는다. */
    description: string;
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "ns-page-heading": NsPageHeading;
    }
}
