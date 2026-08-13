import { ReactiveElement } from "lit";
import { property } from "lit/decorators.js";

import { register } from "../../internal/register.js";
import { warnIfTokensMissing } from "../../internal/warn-missing-tokens.js";
import type { NsSortDetail, NsSortDirection } from "../../types.js";

/*
  none → ascending → descending → none.

  2-상태(오름·내림만)로 하면 서버의 기본 정렬로 돌아갈 방법이 없다. 이 앱에서
  그 기본 순서가 의도를 담는다 — "오래된 신청이 위" 같은 것이다. 이름으로 한 번
  정렬하면 새로고침 말고는 되돌릴 수 없게 된다.
*/
function nextDirection(current: NsSortDirection): NsSortDirection {
  if (current === "none") return "ascending";
  if (current === "ascending") return "descending";
  return "none";
}

/**
 * 소비자가 쓴 `<table>` 을 감싸는 Light DOM 컴포넌트.
 *
 * **셀을 렌더하지 않고 데이터를 모른다.** 정렬 상태와 그 시각 표시만 갖고,
 * 데이터를 다시 정렬하는 것은 소비자다. 설계 근거는
 * docs/superpowers/specs/2026-08-13-ns-table-design.md §2 에 있다 — 실사용 셀에
 * 조건부 버튼과 참조 조회가 들어 있어 데이터 주입형 API 로 표현되지 않는다.
 */
export class NsTable extends ReactiveElement {
  /*
    Light DOM 이다. 실패 경로가 둘이고 이 재정의가 둘 다 막는다.

    1. LitElement 처럼 템플릿을 렌더하면 소비자가 쓴 <table> 이 덮어써진다.
       → ReactiveElement 를 상속해 렌더 파이프라인 자체를 갖지 않는다.
    2. ReactiveElement 의 기본 createRenderRoot 는 shadow root 를 만든다.
       shadow root 가 있으면 <slot> 이 없는 한 light DOM 자식이 렌더되지 않는다.
       → this 를 반환해 shadow root 를 만들지 않는다.

    둘 다 에러 없이 빈 표가 된다. 그래서 이 재정의를 지우면 조용히 깨진다.

    부수 효과로 static styles 가 무시된다(adoptStyles 가 호출되지 않는다).
    스타일은 전부 controls.css 에 있고 이 컴포넌트에 .styles.ts 파일이 없다.
  */
  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  /**
   * 제어 모드의 정렬 칼럼. `undefined` 면 비제어다.
   *
   * 속성이 아니라 프로퍼티 전용인 이유는 ns-dialog 의 `open` 과 같다 —
   * `<ns-table sort-key="name">` 이라고 쓰면 제어 모드로 들어가 컴포넌트가
   * 스스로 방향을 바꾸지 못한다. 순수 HTML 은 `default-sort-key` 를 쓴다.
   */
  @property({ attribute: false }) sortKey?: string;

  /** 제어 모드의 정렬 방향. `sortKey` 와 짝이다. */
  @property({ attribute: false }) sortDirection?: NsSortDirection;

  /** 비제어 초기 정렬 칼럼. */
  @property({ type: String, attribute: "default-sort-key" }) defaultSortKey = "";

  /** 비제어 초기 정렬 방향. */
  @property({ attribute: "default-sort-direction" })
  defaultSortDirection: NsSortDirection = "none";

  /** 비제어일 때의 진실. */
  #innerKey = "";
  #innerDirection: NsSortDirection = "none";

  get #controlled(): boolean {
    return this.sortKey !== undefined;
  }

  get #key(): string {
    return this.sortKey ?? this.#innerKey;
  }

  get #direction(): NsSortDirection {
    return this.sortDirection ?? this.#innerDirection;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    warnIfTokensMissing();
    // 위임이라 소비자가 행을 다시 그려도 리스너를 다시 붙일 필요가 없다.
    this.addEventListener("click", this.#onClick);
  }

  override disconnectedCallback(): void {
    this.removeEventListener("click", this.#onClick);
    super.disconnectedCallback();
  }

  /*
    비제어 초기값을 seed 한다. 덮어쓰지 않는다 — Lit 은 첫 업데이트를
    마이크로태스크로 미루므로, 생성과 같은 태스크에서 프로퍼티를 만진 코드가
    여기보다 먼저 실행된다. 무조건 대입하면 그것이 경고 없이 사라진다.
  */
  protected override firstUpdated(): void {
    if (this.defaultSortKey !== "") this.#innerKey = this.defaultSortKey;
    if (this.defaultSortDirection !== "none") this.#innerDirection = this.defaultSortDirection;
  }

  protected override updated(): void {
    this.#syncAriaSort();
  }

  /*
    활성 <th> 에 aria-sort 를 쓴다. 컴포넌트가 유일한 작성자다 — 소비자는 이
    속성을 쓰지 않으므로 React 와 싸우지 않는다. 삼각형은 controls.css 가
    이 속성을 받아 그린다.
  */
  #syncAriaSort(): void {
    const key = this.#key;
    const direction = this.#direction;

    for (const th of this.querySelectorAll<HTMLElement>("th[data-ns-sort-key]")) {
      th.setAttribute("aria-sort", th.dataset.nsSortKey === key ? direction : "none");
    }
  }

  /*
    <th data-ns-sort-key> 안의 클릭을 받는다. 안쪽 <button> 뿐 아니라 <th> 의
    여백을 눌러도 동작한다 — 마우스 타깃이 넓어지고, 키보드 도달은 <button> 이
    담당한다. 소비자가 훅을 붙인 <th> 만 대상이다.
  */
  #onClick = (e: Event): void => {
    const target = e.target as Element | null;
    const th = target?.closest<HTMLElement>("th[data-ns-sort-key]");
    if (!th) return;

    const key = th.dataset.nsSortKey ?? "";
    // 다른 칼럼을 누르면 오름차순부터 시작한다. 같은 칼럼이면 다음 상태로 돈다.
    const direction = key === this.#key ? nextDirection(this.#direction) : "ascending";
    // direction 이 none 이면 정렬이 해제된 것이므로 key 를 비운다.
    const nextKey = direction === "none" ? "" : key;

    if (!this.#controlled) {
      this.#innerKey = nextKey;
      this.#innerDirection = direction;
      this.requestUpdate();
    }

    const detail: NsSortDetail = { key: nextKey, direction };
    this.dispatchEvent(
      new CustomEvent("ns-sort", { detail, bubbles: true, composed: true }),
    );
  };
}

register("ns-table", NsTable);

declare global {
  interface HTMLElementTagNameMap {
    "ns-table": NsTable;
  }
}
