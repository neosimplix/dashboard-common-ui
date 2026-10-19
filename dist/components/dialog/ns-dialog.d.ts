import { LitElement } from "lit";
import "../icon/ns-icon.js";
export declare class NsDialog extends LitElement {
    #private;
    static styles: import("lit").CSSResult;
    /**
     * 제목.
     *
     * `title` 이 아닌 이유는 ns-page-heading 과 같다 — 전역 속성이라 대화상자
     * 전체가 브라우저 툴팁을 갖는다. React 프롭만 `title` 을 유지한다.
     */
    heading: string;
    /**
     * 제어 모드. `undefined` 면 비제어다.
     *
     * 속성이 아니라 프로퍼티 전용이다. 겸용했다면 `<ns-dialog open>` 이 boolean
     * 속성으로 읽혀 제어 모드로 들어가고, 그러면 컴포넌트가 스스로 닫지 못한다.
     * 그것을 피하려고 이름을 갈랐다 — 순수 HTML 소비자는 `default-open` 을 쓴다.
     *
     * **그래서 `<ns-dialog open>` 은 제어 모드로 들어가지 않는다. 무시된다.**
     * 속성이 관찰되지 않으므로 열리지도 않고 이 프로퍼티는 `undefined` 로 남아
     * 비제어다. 위 문장은 고르지 않은 설계를 설명한 것이지 현재 동작이 아니다 —
     * 소비자가 이 주석을 읽고도 `setAttribute("open")` 을 썼다. 실제로 그 속성이
     * 붙어 있으면 connectedCallback 이 경고한다.
     *
     * `open` 을 나중에 `undefined` 로 되돌리면 비제어로 전환되고, 그 시점의 내부
     * 상태(보통 닫힘)가 화면에 반영된다 — 열려 있던 대화상자가 닫힌다. React 의
     * controlled/uncontrolled 전환과 같은 성질이다.
     */
    open?: boolean;
    /** 비제어 초기값. */
    defaultOpen: boolean;
    /** backdrop 클릭 닫기를 끈다. 입력을 잃으면 안 되는 폼 대화상자에서 쓴다. */
    noBackdropClose: boolean;
    private dialogEl;
    /** footer slot 에 내용이 있는지. CSS 로는 알 수 없어 slotchange 로 잡는다. */
    private hasFooter;
    connectedCallback(): void;
    firstUpdated(): void;
    /**
     * 비제어일 때만 연다. 제어 중이면 경고만 낸다 — 여기서 상태를 바꾸면
     * 소비자의 `open` 과 어긋나 화면이 튄다.
     */
    show(): void;
    /** 비제어일 때만 닫는다. 소비자가 부른 것이므로 `ns-dialog-close` 를 내지 않는다. */
    close(): void;
    updated(): void;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "ns-dialog": NsDialog;
    }
}
