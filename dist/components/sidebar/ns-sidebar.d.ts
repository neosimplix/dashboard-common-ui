import { LitElement, type PropertyValues } from "lit";
/**
 * 네비게이션 컨테이너. 열리면 `ns-nav-group` 이 세로로 이어지고 닫히면 사라진다.
 *
 * ```html
 * <ns-sidebar default-open>
 *   <ns-nav-group heading="관리">
 *     <ns-nav-group heading="사용자" collapsible>
 *       <ns-nav-item href="/users" label="목록"></ns-nav-item>
 *     </ns-nav-group>
 *     <ns-nav-item href="/logs" label="로그"></ns-nav-item>
 *   </ns-nav-group>
 * </ns-sidebar>
 * ```
 *
 * **0.5.0 개발 중에 레일 모델을 만들었다가 물렀다.** 4rem 레일에 그룹마다 한 글자
 * 타일을 쌓는 방식이었는데 그것이 무엇인지 읽히지 않았다. 경위는
 * `docs/gotchas.md` 에 있다.
 */
export declare class NsSidebar extends LitElement {
    #private;
    static styles: import("lit").CSSResult;
    /**
     * 제어 모드. `undefined` 면 비제어다.
     *
     * 속성이 아니라 프로퍼티 전용이다. 겸용했다면 `<ns-sidebar open>` 이 boolean
     * 속성으로 읽혀 **제어 모드로 굳는다** — 마크업에 초기 상태를 적으려던 소비자가
     * 자기도 모르게 제어 모드에 들어가고, 그 뒤로는 `el.open` 을 대입하는 코드를
     * 쓰지 않는 한 사이드바가 그 값에 고정된다. 순수 HTML 소비자가 쓸 것은
     * `default-open` 이다. (`ns-dialog` 에서는 같은 겸용이 "스스로 닫지 못한다" 로
     * 드러난다. 이쪽은 자기 토글 경로가 애초에 없어 증상이 다르다.)
     *
     * **그래서 그 속성은 무시된다** — 관찰되지 않으므로 제어 모드로 들어가지도
     * 않는다. `connectedCallback` 이 경고한다.
     */
    open?: boolean;
    /**
     * 비제어 초기값. 있으면 열린 채로 시작한다.
     *
     * 기본이 닫힘이므로 **기본값에서 벗어나는 쪽**이 속성 이름이다. `ns-dialog` 와
     * 같고, `ns-nav-group` 의 `default-collapsed` 와 반대로 보이지만 규칙은 같다 —
     * 그쪽은 기본이 펼침이었다.
     *
     * **레일이 없어 이 컴포넌트는 스스로 토글하지 않는다.** 그래서 비제어
     * 모드에서 사용자 상호작용으로 여닫히는 경로가 아예 없고, 이 값을 지키던
     * 가드(`#toggled`)도 지킬 대상이 없어져 지웠다 — 나중에 이 값을 바꾸면
     * 그대로 다시 반영된다. 사실상 비제어 모드는 **초기값 하나로 시작해서
     * 계속 그 값을 따라가는 것**이고, "나중에 소비자가 상호작용으로 연 것을
     * `defaultOpen` 변경이 덮어쓴다" 는 걱정을 할 필요가 없다.
     */
    defaultOpen: boolean;
    connectedCallback(): void;
    protected willUpdate(changed: PropertyValues): void;
    protected updated(): void;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "ns-sidebar": NsSidebar;
    }
}
