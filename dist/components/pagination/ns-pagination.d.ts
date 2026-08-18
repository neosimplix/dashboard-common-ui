import { LitElement, nothing } from "lit";
/**
 * 번호 윈도우.
 *
 * - 페이지 수 ≤ 7 이면 전부
 * - 그 외에는 첫 페이지 · 현재±1 · 마지막 페이지, 빈 구간에 `"gap"`
 *
 * 내보내는 이유는 규칙이 모호하지 않게 문서화되기 위해서다. 소비자가 쓸 API 는
 * 아니고 `src/index.ts` 에서 재export 하지 않는다.
 */
export declare function pageWindow(current: number, total: number): (number | "gap")[];
/**
 * 목록 페이지 이동 컨트롤. 표를 모르고 데이터를 모른다 — 어떤 목록에도 붙는다.
 *
 * **자식을 받지 않는다.** Lit 이 이 요소의 내용을 통째로 소유한다 — 렌더마다
 * 갈아 끼우므로 `<ns-pagination>…</ns-pagination>` 사이에 무엇을 써도 첫 렌더에서
 * 사라진다. slot 이 없다.
 */
export declare class NsPagination extends LitElement {
    #private;
    protected createRenderRoot(): HTMLElement;
    /** 전체 **항목** 수. 페이지 수가 아니다 — 서버 응답이 주는 것이 보통 이쪽이다. */
    total: number;
    perPage: number;
    /**
     * 제어 모드의 현재 페이지. `undefined` 면 비제어다.
     *
     * 속성이 아니라 프로퍼티 전용인 이유는 ns-dialog 의 `open` 과 같다 —
     * `<ns-pagination page="3">` 이라고 쓰면 제어 모드로 들어가 컴포넌트가 스스로
     * 페이지를 넘기지 못한다. 순수 HTML 은 `default-page` 를 쓴다.
     */
    page?: number;
    /** 비제어 초기 페이지. */
    defaultPage: number;
    connectedCallback(): void;
    protected willUpdate(): void;
    protected updated(): void;
    protected render(): typeof nothing | import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "ns-pagination": NsPagination;
    }
}
