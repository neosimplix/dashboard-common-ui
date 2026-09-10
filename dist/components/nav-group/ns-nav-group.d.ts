import { LitElement, type PropertyValues } from "lit";
import "../icon/ns-icon.js";
export declare class NsNavGroup extends LitElement {
    #private;
    static styles: import("lit").CSSResult;
    /** 그룹 제목. `[role="group"]` 의 `aria-label` 로도 실린다. */
    heading: string;
    /**
     * 헤딩 줄을 토글 버튼으로 만든다.
     *
     * opt-in 이다. 이 속성이 없으면 노드 구조가 0.4.0 과 달라지지 않는다 — 유일한
     * 차이는 목록 `<div>` 가 이제 항상 `id="list"` 를 갖는 것인데(`aria-controls`
     * 가 필요해서), shadow root 안이라 소비자가 관측할 길이 없어 이 non-breaking
     * 주장을 깨지 않는다. 전부 접히게 만들면 소비자가 코드를 한 줄도 바꾸지
     * 않았는데 헤딩에 hover·포커스 링·caret 이 생긴다.
     */
    collapsible: boolean;
    /**
     * 제어 모드. `undefined` 면 비제어다.
     *
     * 속성이 아니라 프로퍼티 전용이다. 겸용했다면 `<ns-nav-group collapsible open>`
     * 이 boolean 속성으로 읽혀 제어 모드로 들어가고, 그러면 컴포넌트가 스스로
     * 접지 못한다. 순수 HTML 소비자가 쓸 것은 `default-collapsed` 다.
     *
     * 그 속성이 관찰되지 않으므로 `<ns-nav-group open>` 은 제어 모드로 들어가는
     * 것이 아니라 통째로 무시된다. connectedCallback 이 경고한다.
     */
    open?: boolean;
    /**
     * 비제어 초기값. 있으면 접힌 채로 시작한다.
     *
     * `default-open` 이 아닌 이유는 boolean 속성의 성질이다 — 속성이 없으면 Lit 이
     * 컨버터를 부르지 않아 필드 초기값이 그대로 남으므로, 기본을 펼침(true)으로
     * 잡으면 소비자가 그 값을 false 로 만들 경로가 없다. 그래서 극성을 뒤집어
     * **기본값에서 벗어나는 쪽**을 이름으로 삼았다. ns-dialog 의 default-open 과
     * 반대로 보이지만 규칙은 같다.
     *
     * 나중에 이 값을 바꾸면 **아직 토글되지 않은 그룹에만** 반영된다.
     */
    defaultCollapsed: boolean;
    connectedCallback(): void;
    protected willUpdate(changed: PropertyValues): void;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "ns-nav-group": NsNavGroup;
    }
}
