import { ReactiveElement } from "lit";
/**
 * 탭 버튼에 붙는 `id`. 패널의 `aria-labelledby` 가 이 값을 가리켜야 한다.
 *
 * `data-ns-panel` 에서 파생시키는 이유: 쓰는 쪽이 두 문자열을 따로 관리하면
 * 반드시 어긋난다. 패널 id 는 한 페이지에서 유일하므로 이 파생값도 유일하다.
 */
export declare function tabIdFor(panelId: string): string;
/**
 * 탭 줄. **탭 버튼을 렌더하지 않는다** — 소비자가 쓴 마크업에 ARIA 와 키보드만
 * 얹는다. `ns-table` 이 셀을 렌더하지 않는 것과 같은 자리다.
 *
 * 소비자가 쓰는 것:
 * ```html
 * <ns-tabs aria-label="관리자 목록" default-active="live">
 *   <button type="button" data-ns-tab="live" data-ns-panel="panel-live">운영 중</button>
 * </ns-tabs>
 * ```
 *
 * **shadow root 를 두지 않는다.** 이 컴포넌트는 자기 마크업을 하나도 렌더하지
 * 않으므로 캡슐화할 것이 없고, shadow 를 두면 얻는 것 없이 실패 경로만 생긴다 —
 * `LitElement` 처럼 템플릿을 렌더하면 소비자가 쓴 버튼이 덮이고, `<slot>` 없는
 * shadow root 는 그 버튼을 가린다. 둘 다 에러 없이 빈 탭 줄이 된다.
 * 곁들여, 전역 스타일시트인 `controls.css` 는 shadow 안에 닿지 않으므로 shadow
 * 안에 무언가를 그리는 순간 그 스타일을 컴포넌트에 다시 적어야 한다.
 *
 * (`aria-controls` 는 이 결정의 근거가 아니다. 슬롯을 쓰면 탭 버튼은 문서 트리에
 * 그대로 남으므로 IDREF 도 `ns-tabs [data-ns-tab]` 선택자도 계속 해석된다.)
 */
export declare class NsTabs extends ReactiveElement {
    #private;
    protected createRenderRoot(): HTMLElement;
    /**
     * 제어 모드의 활성 탭. `undefined` 면 비제어다.
     *
     * 속성이 아니라 프로퍼티 전용인 이유는 ns-dialog 의 `open` 과 같다 —
     * `<ns-tabs active="live">` 라고 쓰면 제어 모드로 들어가 컴포넌트가 스스로
     * 탭을 바꾸지 못한다. 순수 HTML 은 `default-active` 를 쓴다.
     *
     * **그래서 그 속성은 무시된다** — 관찰되지 않으므로 제어 모드로 들어가지도
     * 않는다. 붙어 있으면 connectedCallback 이 경고한다.
     */
    active?: string;
    /** 비제어 초기 탭. 비어 있으면 첫 번째 탭이다. */
    defaultActive: string;
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected firstUpdated(): void;
    protected updated(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "ns-tabs": NsTabs;
    }
}
