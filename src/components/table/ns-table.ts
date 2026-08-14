import { ReactiveElement } from "lit";
import { property } from "lit/decorators.js";

import { register } from "../../internal/register.js";
import { warnIfTokensMissing } from "../../internal/warn-missing-tokens.js";
import type {
  NsSelectChangeDetail,
  NsSortDetail,
  NsSortDirection,
} from "../../types.js";

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
  @property({ type: String, attribute: "default-sort-direction" })
  defaultSortDirection: NsSortDirection = "none";

  /**
   * 제어 모드의 선택 집합. `undefined` 면 비제어다.
   *
   * 배열은 속성으로 표현할 수 없어 프로퍼티 전용이다. **비제어 초기 선택은
   * 마크업의 `checked` 속성에서 온다** — `default-selected` 프로퍼티를 두지
   * 않는다. 네이티브 폼과 같은 방식이고 컴포넌트는 DOM 을 읽으면 된다.
   */
  @property({ attribute: false }) selected?: string[];

  /** 비제어일 때의 진실. */
  #innerKey = "";
  #innerDirection: NsSortDirection = "none";

  /*
    비제어 모드에서 ns-select-change 로 **마지막에 보고한 집합**이다.
    `undefined` 면 아직 기준선이 없다는 뜻이고, 그때는 비교 대신 seed 만 한다.

    관찰자가 이것과 DOM 을 비교해 "이벤트 없이 바뀐 선택" 을 잡는다.
  */
  #reported?: string[];

  /*
    평생 한 번만 켜진다. ns-pagination 의 #warnedPage/#warnedPerPage 와 같은
    이유로 다른 진단과 플래그를 공유하지 않는다.
  */
  #warnedHalfControlled = false;

  #observer?: MutationObserver;

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
    this.addEventListener("change", this.#onChange);

    /*
      updated() 는 반응형 프로퍼티가 바뀔 때만 돈다. 소비자가 정렬·선택과 무관한
      이유로(칼럼 구성 변경, i18n, 페이지 이동, 필터) <thead>/<tbody> 를 교체하면
      새 <th>·체크박스에 aria-sort·3-상태가 쓰이지 않고 다음 상호작용까지 조용히
      낡는다 — 이 컴포넌트가 스스로 주장하는 "유일한 작성자" 보증이 그 사이에 깨진다.

      attributes 는 관찰하지 않는다. #syncAriaSort 가 setAttribute 를 쓰므로
      관찰했다면 자기 쓰기에 다시 깨어나 루프가 된다. childList·subtree 만 본다.
      #syncSelectAll 은 checked·indeterminate 프로퍼티만 쓰고 속성을 바꾸지
      않으므로 애초에 이 재발동 문제가 없다.

      ns-field 를 light DOM 엘리먼트로 만드는 안은 MutationObserver 복잡도 때문에
      거절했다(프리미티브 스펙 §4.4). 여기서는 받아들인다 — 그 관찰자는 임의의
      자식에 id·aria-* 를 주입하는 일을 다시 해야 했고, 이 관찰자는
      querySelectorAll 로 개수를 다시 세는 것만 한다.
    */
    this.#observer = new MutationObserver(() => {
      this.#syncAriaSort();
      this.#syncSelectAll();
      this.#reportSelectionIfChanged();
    });
    this.#observer.observe(this, { childList: true, subtree: true });
  }

  override disconnectedCallback(): void {
    this.removeEventListener("click", this.#onClick);
    this.removeEventListener("change", this.#onChange);
    this.#observer?.disconnect();
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

    /*
      비제어 초기 선택은 마크업의 checked 다. 소비자가 자기 손으로 쓴 것이므로
      보고하지 않고 비교 기준선으로만 잡는다.
    */
    if (this.selected === undefined) this.#reported = this.#checkedIds();
  }

  protected override updated(): void {
    this.#warnHalfControlled();
    this.#syncAriaSort();
    this.#syncSelectAll();
  }

  /*
    #controlled 는 sortKey 하나로 판정하는데 #direction 게터는
    `sortDirection ?? #innerDirection` 이다. sortDirection 만 설정하고 sortKey 를
    두지 않으면 비제어 분기가 #innerDirection 을 갱신해도 게터가 그것을 소비자
    값으로 덮는다 — nextDirection 의 입력이 그 값에 묶여 ns-sort 가 같은 방향만
    반복하고 aria-sort 가 거기서 멈춘다.

    코드로 한쪽을 고르지 않는 이유는 어느 쪽이 의도인지 컴포넌트가 알 수 없기
    때문이다(제어하려 했는데 sortKey 를 빠뜨렸을 수도, 비제어 초기값을 주려다
    프로퍼티를 잘못 골랐을 수도 있다). ns-pagination 이 잘못된 per-page·page 에
    하는 것처럼 알리기만 한다.
  */
  #warnHalfControlled(): void {
    if (this.#warnedHalfControlled) return;
    if (this.sortDirection === undefined || this.sortKey !== undefined) return;
    this.#warnedHalfControlled = true;
    console.warn(
      `[ns-table] sortDirection="${this.sortDirection}" 만 설정하고 sortKey 는 설정하지 않았습니다. 둘은 짝이라 이 상태에서는 정렬 방향이 바뀌지 않습니다. 제어하려면 둘 다 설정하고, 비제어 초기값이 목적이면 default-sort-direction 을 쓰세요.`,
    );
  }

  /*
    Light DOM 이라 shadow 경계가 없다. 중첩된 <ns-table> 의 <th>·체크박스도 바깥
    호스트의 querySelectorAll·closest 에 그대로 잡히므로, 안쪽 헤더 클릭이나 안쪽
    체크박스가 바깥 컴포넌트에서도 처리돼 이벤트가 두 번 발생하고 두 컴포넌트가
    같은 상태를 두고 다툰다. 가장 가까운 ns-table 이 자기인 요소만 자기 것이다.
    헤더 · 행 체크박스 · 전체 선택 체크박스 모두 이 검사를 거친다.
  */
  #owns(el: HTMLElement): boolean {
    return el.closest("ns-table") === this;
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
      if (!this.#owns(th)) continue;
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
    if (!th || !this.#owns(th)) return;

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

  /*
    중첩된 <ns-table> 의 행 체크박스도 바깥 호스트의 querySelectorAll 에 그대로
    잡힌다 — #owns 로 걸러 자기 것만 남긴다.
  */
  #rowBoxes(): HTMLInputElement[] {
    return [...this.querySelectorAll<HTMLInputElement>("input[data-ns-row-id]")].filter(
      (box) => this.#owns(box),
    );
  }

  #rowId(box: HTMLInputElement): string {
    return box.dataset.nsRowId ?? "";
  }

  /*
    전체 선택 체크박스의 3-상태를 쓴다. checked 와 indeterminate 의 유일한
    작성자가 컴포넌트다 — 소비자는 그 둘을 바인딩하지 않는다.

    indeterminate 는 프로퍼티고 대응하는 HTML 속성이 없다. 마크업만으로는
    "일부 선택" 을 만들 수 없어서, 이것이 컴포넌트가 가져갈 값이 있는 지점이다.
  */
  #syncSelectAll(): void {
    /*
      .find 가 아니라 .filter 다. 전체 선택 박스는 하나가 보통이지만 <tfoot> 의
      두 번째 전체 선택이나 sticky 헤더 복제처럼 정당한 마크업도 있다.
      #onChange 는 data-ns-select-all 속성으로 판정해 **모든** 박스에 반응하므로,
      여기서 첫 번째만 갱신하면 두 번째 박스가 "누르면 동작하지만 3-상태는
      절대 갱신되지 않는" 반쪽이 된다. 두 경로를 대칭으로 맞춘다.
    */
    const alls = [
      ...this.querySelectorAll<HTMLInputElement>("input[data-ns-select-all]"),
    ].filter((box) => this.#owns(box));
    if (alls.length === 0) return;

    const boxes = this.#rowBoxes();
    const selected = this.selected;
    const count =
      selected === undefined
        ? boxes.filter((box) => box.checked).length
        : boxes.filter((box) => selected.includes(this.#rowId(box))).length;

    const checked = boxes.length > 0 && count === boxes.length;
    const indeterminate = count > 0 && count < boxes.length;
    for (const all of alls) {
      all.checked = checked;
      all.indeterminate = indeterminate;
    }
  }

  /** 비제어 모드의 진실 — DOM 이다. 행 순서를 그대로 따른다. */
  #checkedIds(): string[] {
    return this.#rowBoxes()
      .filter((box) => box.checked)
      .map((box) => this.#rowId(box));
  }

  /*
    **내용**으로 비교한다. 배열 정체성으로 보면 매번 새 배열이라 관찰자가 도는
    족족 "바뀌었다" 가 되어 이벤트를 스팸한다. 순서도 보지 않는다 — 소비자가
    행을 재정렬하면 같은 집합이 다른 순서로 오는데 그것은 선택 변경이 아니다.
    (같은 data-ns-row-id 가 둘인 마크업은 정의되지 않은 입력으로 둔다.)
  */
  #sameSet(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false;
    const set = new Set(b);
    return a.every((id) => set.has(id));
  }

  /*
    비제어 모드에서 소비자가 <tbody> 를 교체하면(정렬·페이지 이동·필터) 선택
    집합이 이벤트 없이 바뀐다. NsSelectChangeDetail 은 그 집합을 "요청되는 다음
    전체 집합" 이라고 규정하므로, 이벤트 없이 달라지면 소비자는 화면에 없는 행을
    선택한 채로 남는다("삭제(1건)" 이 켜져 있는데 체크된 행이 없는 상태다).
    관찰자가 차이를 발견하면 여기서 보고한다.

    제어 모드에서는 하지 않는다 — 그때의 진실은 DOM 이 아니라 selected 이고,
    소비자가 방금 쓴 값을 되돌려 주면 루프가 된다.

    재진입: 소비자 핸들러가 그 자리에서 DOM 을 또 바꾸면 관찰자가 다시 깨어난다.
    무한하지 않다 — #emitSelect 가 dispatch **전에** #reported 를 갱신하므로
    같은 집합으로 다시 그린 경우는 위 비교에서 멈춘다.
  */
  #reportSelectionIfChanged(): void {
    if (this.selected !== undefined) return;

    const ids = this.#checkedIds();
    const last = this.#reported;
    if (last !== undefined && this.#sameSet(last, ids)) return;

    /*
      파서가 행을 넣는 중이면 보고하지 않고 기준선만 다시 잡는다. 정적 HTML 의
      <ns-table> 은 시작 태그에서 connect 되고 첫 업데이트는 마이크로태스크라
      행이 다 들어오기 전에 기준선이 [] 로 잡힐 수 있다. 그대로 두면 마크업의
      checked 가 파싱되는 것만으로 "선택이 바뀌었다" 가 되어 로드만으로 이벤트가
      나간다 — 소비자가 자기 마크업에 쓴 초기 선택은 변경이 아니다.
    */
    if (last === undefined || this.ownerDocument.readyState === "loading") {
      this.#reported = ids;
      return;
    }

    this.#emitSelect(ids);
  }

  #emitSelect(ids: string[]): void {
    /*
      dispatch 보다 **먼저** 갱신한다. 소비자 핸들러가 그 자리에서 <tbody> 를
      바꾸면 관찰자가 곧 이 값과 비교하기 때문이다. 나중에 갱신하면 방금 보고한
      집합을 "아직 보고 안 한 변화" 로 다시 세어 이벤트가 한 번 더 나간다.
    */
    this.#reported = ids;

    const detail: NsSelectChangeDetail = { ids };
    this.dispatchEvent(
      new CustomEvent("ns-select-change", { detail, bubbles: true, composed: true }),
    );
  }

  #onChange = (e: Event): void => {
    const box = (e.target as Element | null)?.closest<HTMLInputElement>(
      'input[type="checkbox"]',
    );
    if (!box || !this.#owns(box)) return;

    const boxes = this.#rowBoxes();

    if (box.hasAttribute("data-ns-select-all")) {
      /*
        비제어면 행 체크박스를 직접 쓴다 — 아무도 안 하니까. 제어면 쓰지 않는다:
        React 가 checked 를 소유하므로 다음 렌더에 덮어쓴다.
      */
      if (this.selected === undefined) {
        for (const row of boxes) row.checked = box.checked;
      }
      this.#emitSelect(box.checked ? boxes.map((row) => this.#rowId(row)) : []);
      // 제어 모드에서는 selected 가 아직 옛 값이다. updated() 가 갱신한다.
      if (this.selected === undefined) this.#syncSelectAll();
      return;
    }

    if (!box.hasAttribute("data-ns-row-id")) return;

    let ids: string[];
    if (this.selected === undefined) {
      ids = boxes.filter((row) => row.checked).map((row) => this.#rowId(row));
      this.#emitSelect(ids);
      this.#syncSelectAll();
      return;
    }

    /*
      제어 모드에서는 다른 행의 DOM checked 를 신뢰할 수 없다 — React 가 아직
      리렌더하지 않았을 수 있다. 방금 눌린 하나의 변화만 selected 에 반영하고,
      순서는 DOM 의 행 순서를 따른다.
    */
    const next = new Set(this.selected);
    const id = this.#rowId(box);
    if (box.checked) next.add(id);
    else next.delete(id);
    ids = boxes.map((row) => this.#rowId(row)).filter((rowId) => next.has(rowId));

    this.#emitSelect(ids);
  };
}

register("ns-table", NsTable);

declare global {
  interface HTMLElementTagNameMap {
    "ns-table": NsTable;
  }
}
