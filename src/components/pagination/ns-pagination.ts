import { LitElement, html, nothing } from "lit";
import { property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

import { register } from "../../internal/register.js";
import { warnIfTokensMissing } from "../../internal/warn-missing-tokens.js";
import { warnPropertyOnlyAttributes } from "../../internal/warn-property-only.js";
import type { NsPageChangeDetail } from "../../types.js";

/**
 * 기본 슬롯 수. `page-window` 프로퍼티의 초기값이자 잘못된 값이 들어왔을 때의
 * 폴백이다. **두 자리가 같은 상수를 봐야 한다** — 따로 적으면 어긋나도 아무도
 * 모른다.
 */
const DEFAULT_PAGE_WINDOW = 7;

/** `from`..`to` 의 정수 배열. `to < from` 이면 빈 배열이다. */
function range(from: number, to: number): number[] {
  return Array.from({ length: Math.max(to - from + 1, 0) }, (_, i) => from + i);
}

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
export function pageWindow(
  current: number,
  total: number,
  size: number,
): (number | "gap")[] {
  if (total <= size) return range(1, total);

  // 앞·뒤 배치가 연속으로 내는 번호 개수. 남는 두 칸이 gap 과 반대쪽 끝이다.
  const edge = size - 2;
  // 가운데 배치에서 현재 좌우로 몇 개. size 가 5 이상의 홀수라 정수다.
  const half = (size - 5) / 2;

  if (current <= edge) return [...range(1, edge), "gap", total];
  if (current > total - edge) return [1, "gap", ...range(total - edge + 1, total)];
  return [1, "gap", ...range(current - half, current + half), "gap", total];
}

/**
 * 목록 페이지 이동 컨트롤. 표를 모르고 데이터를 모른다 — 어떤 목록에도 붙는다.
 *
 * **자식을 받지 않는다.** Lit 이 이 요소의 내용을 통째로 소유한다 — 렌더마다
 * 갈아 끼우므로 `<ns-pagination>…</ns-pagination>` 사이에 무엇을 써도 첫 렌더에서
 * 사라진다. slot 이 없다.
 */
export class NsPagination extends LitElement {
  /*
    Light DOM 이다. controls.css 의 .ns-button 을 그대로 쓰기 위해서다 — shadow
    였다면 버튼 스타일 전부를 다시 적어야 했고, ns-dialog 닫기 버튼에서 수용한
    중복(열 줄)이 여기서는 훨씬 커진다.

    ns-table 과 달리 자식이 없으므로 Lit 이 이 요소 안에 렌더해도 덮어쓸 소비자
    내용이 없다. 그래서 LitElement 를 그대로 쓴다.

    static styles 는 이 재정의로 무시된다 — adoptStyles 가 호출되지 않는다.
    스타일은 전부 controls.css 에 있고 이 컴포넌트에 .styles.ts 가 없다.
  */
  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  /** 전체 **항목** 수. 페이지 수가 아니다 — 서버 응답이 주는 것이 보통 이쪽이다. */
  @property({ type: Number }) total = 0;

  @property({ type: Number, attribute: "per-page" }) perPage = 20;

  /**
   * 제어 모드의 현재 페이지. `undefined` 면 비제어다.
   *
   * 속성이 아니라 프로퍼티 전용인 이유는 ns-dialog 의 `open` 과 같다 —
   * `<ns-pagination page="3">` 이라고 쓰면 제어 모드로 들어가 컴포넌트가 스스로
   * 페이지를 넘기지 못한다. 순수 HTML 은 `default-page` 를 쓴다.
   */
  @property({ attribute: false }) page?: number;

  /** 비제어 초기 페이지. */
  @property({ type: Number, attribute: "default-page" }) defaultPage = 1;

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
  @property({ type: Number, attribute: "page-window" }) pageWindow = DEFAULT_PAGE_WINDOW;

  #innerPage = 1;

  /*
    각각 평생 한 번만 켜진다 — 렌더마다 다시 경고하면 스팸이 된다. 대신 두
    설정 오류를 별개 플래그로 나눈다: 하나로 합치면 먼저 일어난 쪽이 이후에
    일어나는 다른 쪽 경고를 막아버린다. 무관한 진단 두 개가 하나로 뭉개지는
    것이 어느 한쪽만 못 보는 것보다 나쁘다.

    대가로 같은 설정 오류가 값을 바꿔 다시 일어나도(예: page=99 다음 page=150)
    두 번째는 경고하지 않는다 — 그 트레이드오프는 의도한 것이다. 값마다
    경고하면 리렌더 스팸이 될 수 있어, 이 완화를 "고치겠다"고 값별 경고로
    바꾸기 전에 이 트레이드오프를 다시 따져야 한다.
  */
  #warnedPage = false;
  #warnedPerPage = false;
  #warnedTotal = false;
  #warnedWindow = false;

  /*
    방금 활성화한 컨트롤과 그것이 **요청한 페이지**. 다음 업데이트 뒤에 같은
    컨트롤로 포커스를 되돌린다. control 이 번호면 그 번호 자신이 정체성이고,
    이전·다음은 "prev"/"next" 다. null 이면 되돌릴 것이 없다.

    page 를 함께 들고 있는 이유는 updated() 주석에 있다 — 요청이 실제로
    반영됐는지 확인하지 않으면 이 의도가 남아 나중에 포커스를 훔친다.
  */
  #refocus: { control: number | "prev" | "next"; page: number } | null = null;

  get #controlled(): boolean {
    return this.page !== undefined;
  }

  get #pages(): number {
    /*
      perPage 가 0 이하이거나 NaN 이면 페이지 수가 Infinity(total > 0) 또는
      NaN(total 0) 이 된다. 둘 다 조용히 깨진다 — Infinity 면 "Infinity" 가 글자로
      버튼에 렌더되고 "다음" 이 영원히 활성이며, NaN 이면 NaN 비교가 항상 false 라
      render() 의 "1 이하면 아무것도 렌더하지 않는다" 가드를 그냥 통과한다.

      !(perPage > 0) 로 쓰는 이유는 0·음수·NaN 을 한 번에 걸러내기 위해서다.
      perPage <= 0 은 NaN 을 놓친다.

      페이지를 셀 수 없으면 넘길 수도 없다. 0 을 돌려 아무것도 렌더하지 않는
      경로로 보낸다.
    */
    if (!(this.perPage > 0)) {
      if (!this.#warnedPerPage) {
        this.#warnedPerPage = true;
        console.warn(
          `[ns-pagination] per-page=${this.perPage} 는 1 이상이어야 합니다. 페이징을 렌더하지 않습니다.`,
        );
      }
      return 0;
    }

    /*
      total 도 똑같이 막는다. perPage 만 막았을 때 total = NaN(예:
      total={parseInt(searchParams.get("total"))} 가 파라미터를 못 찾은 경우)이면
      Math.ceil(NaN / 20) = NaN 이 되어 render() 의 "1 이하면 렌더하지 않는다"
      가드를 그대로 통과했다. 번호 버튼 없이 이전·다음만 둘 다 활성인 nav 가
      남고 어느 쪽을 눌러도 소비자에게 page: NaN 이 갔다.

      Number.isFinite 로 쓰는 이유는 NaN 과 ±Infinity 를 한 번에 걸러내기
      위해서다. total < 0 은 그 뒤에 따로 본다 — Math.ceil(-5 / 20) 이 -0 이라
      지금도 아무것도 렌더하지 않지만, 그것은 우연이고 여기서는 의도로 만든다.

      페이지 수를 셀 수 없으면 0 을 돌려 아무것도 렌더하지 않는 경로로 보낸다.
      "≤ 1 페이지면 렌더하지 않는다" 는 문서 보증이 이 입력들에도 성립한다.
    */
    if (!Number.isFinite(this.total) || this.total < 0) {
      if (!this.#warnedTotal) {
        this.#warnedTotal = true;
        console.warn(
          `[ns-pagination] total=${this.total} 은 0 이상의 유한한 수여야 합니다. 페이징을 렌더하지 않습니다.`,
        );
      }
      return 0;
    }

    return Math.ceil(this.total / this.perPage);
  }

  /** 검증을 통과한 슬롯 수. **언제나 5 이상의 홀수를 돌려준다.** */
  get #window(): number {
    const raw = this.pageWindow;
    /*
      Number.isInteger 가 NaN·Infinity·소수를 한 번에 걸러낸다. 음수는 순서와
      무관하게 둘 다 스스로 걸러낸다 — raw >= 5 가 곧바로 떨어뜨리고, 설령 그
      조건이 없어도 JS 의 % 는 피제수의 부호를 따르므로(`-5 % 2 === -1`) raw % 2
      === 1 도 참이 되지 않는다.
    */
    if (Number.isInteger(raw) && raw >= 5 && raw % 2 === 1) return raw;

    if (!this.#warnedWindow) {
      this.#warnedWindow = true;
      console.warn(
        `[ns-pagination] page-window=${raw} 는 5 이상의 홀수여야 합니다. ${DEFAULT_PAGE_WINDOW} 로 그립니다.`,
      );
    }
    return DEFAULT_PAGE_WINDOW;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    warnIfTokensMissing();
    warnPropertyOnlyAttributes(this, { page: "default-page" });
  }

  /*
    비제어 초기값을 seed 한다. **firstUpdated 가 아니라 willUpdate 다.**

    Lit 의 첫 업데이트 순서는 willUpdate → render → firstUpdated → updated 다.
    firstUpdated 에서 seed 하면 그때 이미 첫 render 가 끝나 있고, 아무도 두 번째
    업데이트를 요청하지 않으므로 default-page="4" 인데 화면은 1을 현재로 그린
    상태가 남는다(내부 상태만 4다 — 첫 "다음" 클릭이 5가 아니라 2로 간다).
    willUpdate 는 첫 render **앞**이라 첫 페인트부터 4가 현재다. 두 번 그리지
    않으므로 잘못된 페이지가 스치는 일도 없다.

    ns-table 이 같은 실수를 하지 않는 이유는 그쪽이 render 를 갖지 않기
    때문이다 — 그 컴포넌트의 DOM 쓰기는 전부 updated() 에서 일어나고 그것은
    firstUpdated 다음이다. 이 컴포넌트는 render 가 있어 자리가 다르다.

    덮어쓰지 않는다는 원래 근거는 그대로다 — Lit 은 첫 업데이트를 마이크로태스크로
    미루므로, 생성과 같은 태스크에서 프로퍼티를 만진 코드가 여기보다 먼저 실행된다.
    willUpdate 도 그 마이크로태스크 안이라 이 성질이 유지된다.
  */
  protected override willUpdate(): void {
    // 첫 업데이트에서만 돈다. hasUpdated 는 firstUpdated 직전에 true 가 된다.
    if (this.hasUpdated) return;

    /*
      default-page="abc" 는 Number("abc") = NaN 이다. 그대로 seed 하면
      (NaN !== 1 이 true 라 통과한다) #innerPage 가 NaN 이 되고, 그 뒤로는
      비제어 상태 전체가 NaN 에 묶인다. 여기서 막는다.

      warn 플래그가 없는 이유는 이 블록이 인스턴스마다 한 번만 돌기 때문이다 —
      이 자리에서는 경고가 이미 일회성이다.
    */
    if (!Number.isInteger(this.defaultPage) || this.defaultPage < 1) {
      console.warn(
        `[ns-pagination] default-page=${this.defaultPage} 는 1 이상의 정수여야 합니다. 1 페이지에서 시작합니다.`,
      );
      return;
    }
    if (this.defaultPage !== 1) this.#innerPage = this.defaultPage;
  }

  /**
   * 지금 보여줄 페이지. **#pages 가 1 이상이면 언제나 1..#pages 의 정수를
   * 돌려준다** — raw 가 무엇이든 상관없다.
   */
  #current(): number {
    const raw = this.page ?? this.#innerPage;
    const pages = this.#pages;
    if (Number.isInteger(raw) && raw >= 1 && raw <= pages) return raw;

    /*
      범위를 벗어난 값은 표시용으로만 clamp 하고 경고를 한 번 낸다.
      이벤트로 교정하지 않는다 — 소비자 상태와 서로 밀어내는 루프가 된다.

      Number.isFinite 로 감싸는 이유: Math.min/Math.max 는 NaN 을 정화하지
      못한다. Math.min(Math.max(NaN, 1), Math.max(5, 1)) 은 5 가 아니라 NaN 이다.
      정화하지 않으면 한 번 NaN 이 된 #innerPage 가 total 이 정상으로 돌아온
      뒤에도 NaN 으로 남아, 어느 버튼에도 aria-current 가 붙지 않고 클릭마다
      NaN 이 나가는 상태로 고착된다.
    */
    const clamped = Number.isFinite(raw)
      ? Math.min(Math.max(Math.round(raw), 1), Math.max(pages, 1))
      : 1;

    if (!this.#warnedPage) {
      this.#warnedPage = true;
      /*
        지목할 프로퍼티가 모드마다 다르다. 비제어에서 raw 는 소비자가 쓴
        page 가 아니라 내부 값이므로 page 를 탓하면 없는 프로퍼티를 가리키게
        된다. 그때 실제로 어긋난 것은 total·per-page 로 계산된 페이지 수다.
      */
      console.warn(
        this.#controlled
          ? `[ns-pagination] page=${raw} 가 1..${pages} 범위를 벗어났습니다. 표시용으로 ${clamped} 로 보정합니다.`
          : `[ns-pagination] 현재 페이지 ${raw} 가 total=${this.total} · per-page=${this.perPage} 로 계산된 페이지 수(${pages})를 벗어났습니다. 표시용으로 ${clamped} 로 보정합니다.`,
      );
    }
    return clamped;
  }

  /** 이동했으면(= 이벤트를 냈으면) true. */
  #go(page: number): boolean {
    /*
      정상 경로에서는 렌더된 버튼만 이 함수를 부르므로 늘 참인 검사다.
      그럼에도 두는 이유가 둘이다.

      1. 양 끝의 이전·다음이 disabled 가 아니라 aria-disabled 라(포커스를
         잃지 않기 위해서다) 활성화가 여기까지 온다. 이 검사가 그 no-op 다.
      2. ns-page-change 의 page 가 유한한 정수라는 것을 이 한 지점이 보증한다.
    */
    if (!Number.isInteger(page) || page < 1 || page > this.#pages) return false;
    // 현재 페이지 클릭은 아무 일도 하지 않는다.
    if (page === this.#current()) return false;

    if (!this.#controlled) {
      this.#innerPage = page;
      this.requestUpdate();
    }

    const detail: NsPageChangeDetail = { page };
    this.dispatchEvent(
      new CustomEvent("ns-page-change", { detail, bubbles: true, composed: true }),
    );
    return true;
  }

  /*
    실제로 이동했을 때만 포커스 의도를 남긴다. 양 끝에서 눌린 이전·다음이나
    현재 페이지 재클릭은 DOM 을 바꾸지 않으므로 되돌릴 포커스도 없다 —
    의도를 남기면 한참 뒤의 무관한 업데이트에서 소진되어 포커스를 훔친다.
  */
  #activate(control: number | "prev" | "next", page: number): void {
    if (this.#go(page)) this.#refocus = { control, page };
  }

  /*
    페이지가 바뀌면 방금 누른 컨트롤로 포커스를 되돌린다. repeat() 의 키가
    번호 버튼의 정체성을 지켜 주지만, 그 버튼이 윈도우 안에서 자리를 옮기면
    lit 이 노드를 이동시키고(제거 후 삽입) 브라우저는 그때 포커스를 떨어뜨린다.
    키만으로는 부족해서 여기서 명시적으로 되돌린다.
  */
  protected override updated(): void {
    const intent = this.#refocus;
    if (intent === null) return;
    // 활성화 직후의 첫 업데이트에서 소진한다. 남겨 두면 수명이 무한해진다.
    this.#refocus = null;

    /*
      **요청이 실제로 반영됐을 때만** 되돌린다.

      제어 모드에서 #go 는 이벤트를 내고 true 를 돌려주지만 페이지를 직접 쓰지
      않는다(쓰면 제어 규칙 위반이다). 소비자가 ns-page-change 를 무시하면 그
      자리에서는 업데이트가 아예 일어나지 않아 이 의도가 남는다. 그 뒤 total 이
      바뀌는 것 같은 무관한 업데이트가 이것을 소진하면, 그 사이 사용자가 포커스
      없는 빈 영역을 클릭해 <body> 에 있을 때 아래 activeElement 가드가 "잃었다"
      로 읽어 포커스를 페이지네이션으로 끌어가고 화면이 거기로 스크롤된다.

      요청한 페이지가 지금 상태와 같은지 보는 것으로 그 경로가 닫힌다 —
      비제어는 #go 가 #innerPage 를 썼으므로 항상 같고, 제어는 소비자가
      반영했을 때만 같다. repeat() 이 노드를 옮겨 포커스가 떨어지는 진짜 페이지
      이동에서는 양쪽 다 같으므로 복구가 그대로 동작한다.

      #current() 가 아니라 원값을 비교하는 이유: #current() 의 clamp 경고는
      렌더·이동 경로의 진단이다. 포커스 복구가 그것을 다시 트리거하면 경고의
      출처가 흐려지고, 여기서 필요한 것은 "요청한 페이지가 상태가 됐는가" 뿐이다.
    */
    if ((this.page ?? this.#innerPage) !== intent.page) return;

    /*
      포커스가 이 컴포넌트 밖으로 이미 옮겨갔으면 뺏지 않는다. <body> 는
      "잃었다" 는 뜻이라 되돌릴 대상이다 — 노드가 사라지거나 disabled 되면
      브라우저가 포커스를 거기로 보낸다.
    */
    const active = this.ownerDocument.activeElement;
    if (active !== null && active !== this.ownerDocument.body && !this.contains(active)) return;

    const selector =
      typeof intent.control === "number"
        ? `button[data-ns-page="${intent.control}"]`
        : `button[data-ns-nav="${intent.control}"]`;
    this.querySelector<HTMLButtonElement>(selector)?.focus();
  }

  protected override render() {
    const pages = this.#pages;
    // 페이지가 하나 이하면 쓸모없는 컨트롤을 남기지 않는다.
    if (pages <= 1) return nothing;

    const current = this.#current();

    /*
      양 끝에서 disabled 를 쓰지 않는다. 포커스된 요소가 disabled 되면 브라우저가
      blur 시켜 포커스가 <body> 로 떨어진다 — Tab 으로 "다음" 에 가서 마지막
      페이지까지 Enter 를 누른 키보드 사용자가 위치를 잃는다. 현재 페이지 버튼을
      비활성화하지 않는 것과 같은 이유다. aria-disabled 로 "쓸 수 없음" 만 알리고
      (APG 의 패턴이다) 활성화는 #go 의 범위 검사가 no-op 로 받는다.

      data-ns-page / data-ns-nav 는 updated() 가 포커스를 되돌릴 때 쓰는 훅이다.
      Light DOM 이라 문서 이름공간에 들어가므로 접두사를 붙인다. Lit 이 이
      요소의 내용을 통째로 소유하므로 소비자가 쓰는 속성은 아니다.
    */
    return html`
      <nav aria-label="페이지 이동">
        <button
          class="ns-button ns-button--ghost ns-button--sm"
          type="button"
          data-ns-nav="prev"
          aria-disabled=${current === 1 ? "true" : nothing}
          @click=${() => this.#activate("prev", current - 1)}
        >
          이전
        </button>
        <span class="ns-pagination-pages">
          ${repeat(
            pageWindow(current, pages, this.#window),
            /*
              번호는 그 번호 자신이 정체성이다. 슬롯 수는 이제 고정이지만 윈도우가
              밀리면 같은 자리에 다른 번호가 온다(`1 … 5 6 7 … 12` → `1 … 6 7 8 … 12`).
              위치로 diff 하면 lit 이 노드를 재사용하며 라벨만 5에서 6으로 바꾸고,
              화면낭독기가 엉뚱한 번호를 읽는다. 포커스가 있던 노드가 옮겨 갈 때
              제거 후 삽입이 되는 것도 같다 — 그쪽은 updated() 가 되돌린다.

              gap 은 포커스를 받지 않고 위치가 곧 정체성이라 인덱스로 구분한다.
              문자열 키라 번호 키와 섞이지 않는다.
            */
            (entry, index) => (entry === "gap" ? `gap-${index}` : entry),
            (entry) =>
              entry === "gap"
                ? html`<span class="ns-pagination-gap" aria-hidden="true">…</span>`
                : /*
                    비활성 번호의 --ghost 문자열은 controls.css 의
                    `.ns-pagination-pages > .ns-button--ghost` 투명 테두리 규칙과
                    짝이다(§6.1). 그 선택자가 변형 이름으로 걸려 있으므로 여기서
                    변형을 바꾸면 조용히 안 맞고, 트랙 폭이 다시 흔들린다.
                    npm run check 는 이 결합을 보지 못한다.
                  */
                  html`<button
                    class=${entry === current
                      ? "ns-button ns-button--outline ns-button--sm"
                      : "ns-button ns-button--ghost ns-button--sm"}
                    type="button"
                    data-ns-page=${entry}
                    aria-current=${entry === current ? "page" : nothing}
                    @click=${() => this.#activate(entry, entry)}
                  >
                    ${entry}
                  </button>`,
          )}
        </span>
        <button
          class="ns-button ns-button--ghost ns-button--sm"
          type="button"
          data-ns-nav="next"
          aria-disabled=${current === pages ? "true" : nothing}
          @click=${() => this.#activate("next", current + 1)}
        >
          다음
        </button>
      </nav>
    `;
  }
}

register("ns-pagination", NsPagination);

declare global {
  interface HTMLElementTagNameMap {
    "ns-pagination": NsPagination;
  }
}
