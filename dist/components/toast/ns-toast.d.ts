import { LitElement } from "lit";
import "../icon/ns-icon.js";
export type NsToastTone = "neutral" | "success" | "danger" | "warn";
/**
 * 토스트 리전. **문서당 하나다** — `nsToast()` 가 만들어 `document.body` 에 붙이고
 * 이미 있으면 재사용한다.
 *
 * shadow 인 이유: 페이지 위에 겹쳐 뜨므로 소비자 CSS 와 격리돼야 한다. Light DOM
 * 이면 소비자의 `div { … }` 한 줄이 토스트를 무너뜨릴 수 있다.
 *
 * **직접 마크업에 쓰는 태그가 아니다.** 프로퍼티도 슬롯도 없다.
 */
export declare class NsToast extends LitElement {
    #private;
    static styles: import("lit").CSSResult;
    private items;
    connectedCallback(): void;
    disconnectedCallback(): void;
    /** 토스트 하나를 띄운다. 돌려주는 함수를 부르면 즉시 닫는다(두 번 불러도 안전). */
    show(message: string, tone: NsToastTone, duration: number): () => void;
    /** 이미 사라진 키를 줘도 아무 일도 하지 않는다. */
    dismiss(key: number): void;
    protected updated(): void;
    protected render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "ns-toast": NsToast;
    }
}
