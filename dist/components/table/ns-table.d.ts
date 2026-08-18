import { ReactiveElement } from "lit";
import type { NsSortDirection } from "../../types.js";
/**
 * 소비자가 쓴 `<table>` 을 감싸는 Light DOM 컴포넌트.
 *
 * **셀을 렌더하지 않고 데이터를 모른다.** 정렬 상태와 그 시각 표시만 갖고,
 * 데이터를 다시 정렬하는 것은 소비자다. 설계 근거는
 * docs/superpowers/specs/2026-08-13-ns-table-design.md §2 에 있다 — 실사용 셀에
 * 조건부 버튼과 참조 조회가 들어 있어 데이터 주입형 API 로 표현되지 않는다.
 */
export declare class NsTable extends ReactiveElement {
    #private;
    protected createRenderRoot(): HTMLElement;
    /**
     * 제어 모드의 정렬 칼럼. `undefined` 면 비제어다.
     *
     * 속성이 아니라 프로퍼티 전용인 이유는 ns-dialog 의 `open` 과 같다 —
     * `<ns-table sort-key="name">` 이라고 쓰면 제어 모드로 들어가 컴포넌트가
     * 스스로 방향을 바꾸지 못한다. 순수 HTML 은 `default-sort-key` 를 쓴다.
     */
    sortKey?: string;
    /** 제어 모드의 정렬 방향. `sortKey` 와 짝이다. */
    sortDirection?: NsSortDirection;
    /** 비제어 초기 정렬 칼럼. */
    defaultSortKey: string;
    /** 비제어 초기 정렬 방향. */
    defaultSortDirection: NsSortDirection;
    /**
     * 제어 모드의 선택 집합. `undefined` 면 비제어다.
     *
     * 배열은 속성으로 표현할 수 없어 프로퍼티 전용이다. **비제어 초기 선택은
     * 마크업의 `checked` 속성에서 온다** — `default-selected` 프로퍼티를 두지
     * 않는다. 네이티브 폼과 같은 방식이고 컴포넌트는 DOM 을 읽으면 된다.
     */
    selected?: string[];
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected firstUpdated(): void;
    protected updated(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "ns-table": NsTable;
    }
}
