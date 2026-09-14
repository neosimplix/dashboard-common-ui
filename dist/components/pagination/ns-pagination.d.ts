import { LitElement, nothing } from "lit";
/**
 * 번호 윈도우.
 *
 * **슬롯 수는 언제나 `min(total, size)` 다.** 현재 페이지가 어디에 있든 달라지지
 * 않는다 — 그것이 이전·다음 버튼을 제자리에 붙들어 두는 조건이다. 슬롯의 **폭**
 * 까지 고정하는 것은 `controls.css` 의 `.ns-pagination-pages` 가 맡는다.
 * **둘 다 필요하다** — 한쪽만으로는 진폭만 줄고 여전히 움직인다.
 *
 * - `total <= size` 면 전부
 * - 앞쪽: `1 … size-2` · `gap` · `total`
 * - 뒤쪽: `1` · `gap` · `total-(size-3) … total`
 * - 가운데: `1` · `gap` · `현재±h` · `gap` · `total`  (`h = (size-5)/2`)
 *
 * `size` 는 **5 이상의 홀수**여야 한다. 가운데 배치의 번호 개수가 `size - 4` 이고
 * 그것이 현재를 가운데 둔 `2h + 1` 이어야 하므로 `h = (size-5)/2` 다 — 짝수면
 * `h` 가 정수가 아니고, 3이면 `h = -1` 이라 현재 페이지가 들어갈 자리가 없다.
 * **검증은 이 함수가 하지 않는다.** 호출부의 `#window` 게터가 하고, 이 함수는
 * 유효한 `size` 를 받는다고 전제한다.
 *
 * 앞 구현과 달리 `…` 이 감추는 페이지는 어느 배치에서든 최소 2개다. 근거는
 * 설계 문서 §4.2 에 있다.
 *
 * 내보내는 이유는 규칙이 모호하지 않게 문서화되기 위해서다. 소비자가 쓸 API 는
 * 아니고 `src/index.ts` 에서 재export 하지 않는다.
 */
export declare function pageWindow(current: number, total: number, size: number): (number | "gap")[];
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
    /**
     * 이전·다음 사이에 놓을 슬롯 수. **`…` 칸도 하나로 센다.**
     *
     * **5 이상의 홀수여야 한다.** 가운데 배치가 `1 · … · 현재±h · … · 마지막` 이고
     * 그 번호 개수가 `size - 4 = 2h + 1` 이라 `h = (size-5)/2` 이기 때문이다 —
     * 짝수면 현재 페이지 좌우가 비대칭이 되고, 3이면 `h = -1` 이라 현재 페이지가
     * 들어갈 자리가 없다.
     *
     * 잘못된 값은 경고 한 번 뒤 기본값으로 그린다. **렌더를 멈추지 않는다** —
     * `per-page` 와 달리 이것은 페이지 수 계산에 쓰이지 않는 표시 설정이라,
     * 페이징을 통째로 죽이는 것은 과하다.
     *
     * `page` 와 달리 속성을 갖는다. 상태가 아니라 설정이라 제어 모드 문제가 없다.
     */
    pageWindow: number;
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
