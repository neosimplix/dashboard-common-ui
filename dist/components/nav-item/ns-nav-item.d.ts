import { LitElement } from "lit";
export declare class NsNavItem extends LitElement {
    #private;
    static styles: import("lit").CSSResult;
    /** 라우팅 키. ns-navigate 이벤트에 그대로 실린다. */
    href: string;
    /** 펼친 상태에서 보이는 라벨. 넘치면 한 줄 말줄임. */
    label: string;
    /**
     * `leading` 슬롯이 비었을 때 대신 보이는 짧은 배지.
     *
     * **접힘·펼침 양쪽에서 보인다.** 접힌 레일에서 유일하게 남는 요소라 거기서
     * 두드러질 뿐이고, 펼친 상태에서도 라벨 왼쪽에 그대로 남는다. 라벨과 같은
     * 글자를 넣으면 "설치 설치" 가 된다.
     */
    badge: string;
    /**
     * 활성 여부. 컴포넌트가 스스로 바꾸지 않는다 — 소비자가 내려준다.
     * reflect 로 속성에 남겨야 :host([active]) 스타일이 걸린다.
     */
    active: boolean;
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "ns-nav-item": NsNavItem;
    }
}
