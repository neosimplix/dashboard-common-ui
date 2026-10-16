import { LitElement } from "lit";
export declare class NsSkeleton extends LitElement {
    #private;
    static styles: import("lit").CSSResult;
    /** CSS 길이. 참고 구현이 Tailwind 유틸로 받던 것을 프로퍼티로 옮긴 것이다. */
    width: string;
    height: string;
    /**
     * `badge` `control` `panel` `card` `pill` 중 하나면 해당 토큰을 쓰고,
     * 아니면 원시 CSS 값으로 그대로 쓴다(`50%`, `0` 등).
     */
    radius: string;
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "ns-skeleton": NsSkeleton;
    }
}
