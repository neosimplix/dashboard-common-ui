import { LitElement } from "lit";
import "../icon/ns-icon.js";
export type NsToastTone = "neutral" | "success" | "danger" | "warn";
/**
 * 리전이 뜨는 자리. 이름은 **`세로-가로`** 로 고정한다 — `"center-top"` 같은
 * 관용 표기를 함께 받지 않는다. 받는 순간 문서와 코드가 두 표기를 평생 함께 든다.
 *
 * **좌측 정렬 두 값이 없는 것은 빠뜨린 것이 아니다.** 이 라이브러리의 셸이 좌측에
 * 사이드바를 두므로 좌하단 토스트는 접힌 레일 위에 겹치고 펼친 사이드바에서는
 * 아예 가려진다. 필요해지면 그때 더한다 — 값을 더하는 것은 breaking 이 아니다.
 */
export type NsToastPosition = "top-center" | "bottom-center" | "top-right" | "bottom-right";
/**
 * 토스트 리전. **문서당 하나다** — `nsToast()` 가 만들어 `document.body` 에 붙이고
 * 이미 있으면 재사용한다.
 *
 * shadow 인 이유: 페이지 위에 겹쳐 뜨므로 소비자 CSS 와 격리돼야 한다. Light DOM
 * 이면 소비자의 `div { … }` 한 줄이 토스트를 무너뜨릴 수 있다.
 *
 * **직접 마크업에 쓰는 태그가 아니다.** 슬롯이 없고, 프로퍼티는 `position` 하나인데
 * 그것도 소비자가 아니라 `nsToastPosition()` 이 세운다.
 */
export declare class NsToast extends LitElement {
    #private;
    static styles: import("lit").CSSResult;
    position: NsToastPosition;
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
