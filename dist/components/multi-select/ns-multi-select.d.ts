import { LitElement } from "lit";
export interface NsMultiSelectOption {
    /**
     * 이 후보의 식별자. **`options` 안에서 유일해야 한다.**
     *
     * 두 곳에서 키로 쓰인다 — 목록과 칩 줄의 `repeat()` 이 이 값으로 DOM 을
     * 재사용하므로, 겹치면 lit 이 같은 키의 두 항목을 하나로 보고 렌더가 어긋난다.
     * 선택도 값으로만 하므로 겹친 후보는 함께 선택되고 칩도 그 수만큼 생긴다.
     */
    value: string;
    label: string;
    /**
     * 라벨 옆에 흐리게 붙는 보조 정보. 담당자에게는 소속 부서명.
     *
     * **검색은 `label` 과 이 값 둘 다에 걸린다** — 화면에 보이는 문자열만 검색어가
     * 된다. 보이지 않는 별도 검색어 필드를 두지 않는다.
     */
    meta?: string;
}
/**
 * 후보가 길 때 쓰는 다중 선택 — 선택 칩 줄 · 검색 · 높이 제한 목록.
 *
 * **정렬 순서는 호출부가 `options` 배열 순서로 정한다.** 이 컴포넌트는 도메인을
 * 모르고 받은 순서를 건드리지 않는다.
 *
 * **자식을 받지 않는다.** Lit 이 이 요소의 내용을 통째로 소유한다.
 */
export declare class NsMultiSelect extends LitElement {
    #private;
    protected createRenderRoot(): HTMLElement;
    /** 후보 전체. **배열이라 속성으로 쓸 수 없다** — JS 로 대입한다. */
    options: NsMultiSelectOption[];
    /**
     * 제어 모드의 선택 집합. `undefined` 면 비제어다.
     *
     * 비제어 초기값이 속성이 아니라 `defaultValue` 프로퍼티인 것은 이 저장소의
     * 규칙에서 벗어난다. 배열은 속성으로 쓸 수 없어서다 — 규칙이 막으려던 것
     * ("속성 하나가 겸용돼 조용히 제어 모드로 들어감")은 이름이 둘이라 일어나지 않는다.
     */
    value?: string[];
    /**
     * 비제어 초기 선택. **사용자가 처음 만지기 전까지 계속 유효하다.**
     *
     * 첫 업데이트에서 한 번 seed 하고 마는 것이 아니다. 늦게 대입해도(마크업으로
     * 만들어 둔 요소를 나중에 `getElementById` 로 찾아 대입하는, 문서가 안내하는
     * 바로 그 모양) 반응형 프로퍼티라 그대로 다시 렌더된다. 이유는 `#innerValue`
     * 선언에 적어 뒀다.
     */
    defaultValue: string[];
    searchPlaceholder: string;
    emptyMessage: string;
    /**
     * 검색 input 의 `id`. `.ns-field__label` 의 `for` 가 가리킬 곳이다.
     *
     * 호스트의 `id` 를 안쪽 input 에 옮기지 않는 이유: 문서에 같은 `id` 가 둘
     * 생기고, `getElementById` 가 어느 쪽을 주는지가 문서 순서로 정해진다.
     */
    inputId: string;
    /** 검색 input 의 `aria-describedby`. `.ns-field__hint` 를 잇는 자리다. */
    inputDescribedby: string;
    /**
     * 안쪽 검색 `input` 의 `aria-invalid`.
     *
     * 호스트가 아니라 안쪽 input 이 받아야 하는 이유는 `inputId` 와 같다 —
     * 커스텀 엘리먼트는 labelable 이 아니고, 보조기술이 보는 컨트롤은 안쪽
     * input 이다. `controls.css` 가 invalid 를 `[aria-invalid="true"]` 로만
     * 잡으므로 이 이름이 스타일 훅도 겸한다.
     */
    inputInvalid: boolean;
    private query;
    connectedCallback(): void;
    protected render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "ns-multi-select": NsMultiSelect;
    }
}
