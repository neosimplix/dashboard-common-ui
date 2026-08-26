# `ns-pagination` 이전·다음 위치 고정 — 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 페이지를 넘기는 동안 "이전"·"다음" 버튼이 한 픽셀도 움직이지 않게 만든다.

**Architecture:** 원인이 셋이라 처방도 둘이 함께 필요하다 — `pageWindow` 가 현재 페이지와 무관하게 **언제나 `min(pages, size)` 개 슬롯**을 내고(Task 1·2), 번호들을 감싼 균등 그리드가 **모든 칸을 같은 폭**으로 만든다(Task 3). 한쪽만으로는 진폭만 줄고 여전히 움직인다.

**Tech Stack:** Lit 3 (Light DOM · `createRenderRoot` 재정의) · TypeScript · 전역 `controls.css` (`@layer ns-controls`)

**설계 문서:** `docs/superpowers/specs/2026-08-26-pagination-stable-width-design.md` — 이 계획의 모든 "왜" 는 거기 있다. 구현 중 판단이 필요하면 그 문서를 먼저 본다.

## Global Constraints

이 저장소의 불변 규칙 중 **이 작업에서 실제로 걸리는 것들**이다. 전체는 `.claude/rules/` 에 있다.

- **테스트 러너가 없다. 추가하지 않는다.** vitest·jest·playwright 어느 것도, 테스트 파일도 만들지 않는다. 설계 결정이지 누락이 아니다 (`.claude/rules/verification.md`).
- **`git push` 는 하지 않는다.** 로컬 커밋까지만 한다.
- 커밋 메시지는 `<type>(<scope>): <한국어 제목>` 이다. 마침표를 찍지 않고 명령조로 쓴다. scope 는 이 작업에서 전부 `pagination` 이다.
- **`ns-pagination` 은 Light DOM 이라 클래스 이름이 문서 이름공간에 들어간다.** 새 클래스에는 `ns-` 접두사를 쓴다.
- **`.styles.ts` 파일을 만들지 않는다.** 이 컴포넌트는 `createRenderRoot` 를 재정의해 `adoptStyles` 가 불리지 않으므로 `static styles` 가 조용히 무시된다. 스타일은 전부 `src/controls/controls.css` 에 있다.
- **`controls.css` 에 `var()` 폴백을 쓰지 않는다.** 색·치수는 `src/tokens/tokens.css` 한 곳에만 있다.
- **`npm run check` 는 모든 커밋 전에 초록이어야 한다.** 다섯 검사다 — ① 라이브러리 타입 ② 소비자 관점 타입 ③ 이벤트 매핑 ④ 클래스 ↔ 문서 대조(`check-controls.mjs`) ⑤ 토큰 참조.
- **브라우저 확인은 사람이 한다.** 구현자는 화면을 볼 수 없다. **하지 않은 확인을 했다고 보고하지 않는다.** 사람 눈이 필요한 것은 Task 4 가 `docs/pending-human-checks.md` 로 옮긴다.

### 검증 수단이 왜 이것뿐인가

`pageWindow` 는 순수 함수지만 **기계적으로 실행해 볼 수단이 없다.** 같은 파일이 `lit` 과 데코레이터를 쓰므로 `node --experimental-strip-types` 가 파싱하지 못하고, `dist/index.js` 는 `lit` 을 external 로 두는 데다 `src/index.ts` 가 `pageWindow` 를 재export 하지 않는다.

**그래서 Task 1 은 손 추적으로 검증한다.** `ns-table` 때 같은 함수를 같은 방식으로 검증했다. 추적 결과가 설계 문서 §4.3 의 표와 다르면 **코드를 고치기 전에 어느 쪽이 틀렸는지 사람이 정한다** — 윈도우 규칙은 스펙이 정한 것이다.

이 제약을 우회하려고 테스트 파일이나 `pageWindow` 전용 모듈 분리를 발명하지 않는다. 후자는 승인된 스펙의 범위 밖이다.

---

## File Structure

| 파일 | 이 작업에서의 책임 | Task |
|---|---|---|
| `src/components/pagination/ns-pagination.ts` | 윈도우 알고리즘 · `page-window` 프로퍼티와 검증 · 템플릿의 래퍼 | 1 · 2 · 3 |
| `src/controls/controls.css` | `.ns-pagination-pages` 균등 그리드 · `.ns-pagination-gap` 수정 | 3 |
| `index.html` | 프로퍼티 표 · 클래스 표 · 윈도우 규칙 산문 · `page-window` 데모 | 2 · 3 · 4 |
| `docs/superpowers/specs/2026-08-13-ns-table-design.md` | `ns-pagination` 의 API 계약(§7.1 · §7.2 · §7.3) | 4 |
| `docs/gotchas.md` | 균등 그리드가 성립하는 조건 두 가지 | 4 |
| `docs/pending-human-checks.md` | 릴리스 전 육안 확인 목록 | 4 |

새 파일을 만들지 않는다. `docs/project-structure.md` 도 바뀌지 않는다 — 구조가 그대로다.

---

## Task 1: `pageWindow` 를 고정 슬롯 알고리즘으로 바꾼다

**Files:**
- Modify: `src/components/pagination/ns-pagination.ts:10-45` (`pageWindow` 와 그 JSDoc)
- Modify: `src/components/pagination/ns-pagination.ts:365-369` (호출부와 `repeat` 키 주석)

**Interfaces:**
- Produces: `pageWindow(current: number, total: number, size: number): (number | "gap")[]` — Task 2 가 세 번째 인자를 `this.#window` 로 갈아 끼운다
- Produces: `DEFAULT_PAGE_WINDOW = 7` (모듈 상수, export 하지 않는다) — Task 2 가 프로퍼티 초기값과 폴백 양쪽에서 쓴다

이 태스크가 끝나면 동작이 이미 고쳐진다(슬롯 수 고정). 폭은 아직 흔들린다 — Task 3 이 맡는다.

- [ ] **Step 1: 상수와 `range` 헬퍼를 더한다**

`import` 문 바로 아래, `pageWindow` 의 JSDoc 위에 넣는다.

```ts
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
```

- [ ] **Step 2: `pageWindow` 의 JSDoc 을 갈아 끼운다**

`src/components/pagination/ns-pagination.ts:10-18` 의 블록 전체를 이것으로 바꾼다.

```ts
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
```

- [ ] **Step 3: 함수 본문을 갈아 끼운다**

`export function pageWindow(...)` 부터 그 닫는 `}` 까지(현재 `:19-45`) 전체를 이것으로 바꾼다. **기존의 `wanted` / `previous` / 중복 제거 루프는 통째로 사라진다.**

```ts
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
```

**앞쪽 조건을 먼저 본다.** `total` 이 `size` 보다 조금만 클 때(예: `size=7 · total=8`) 두 조건이 겹치는데, 앞쪽이 이기면 가운데 배치에 닿지 않고 두 배치 다 `size` 슬롯이라 문제가 없다.

- [ ] **Step 4: 호출부를 고친다**

`render()` 안의 `repeat(` 첫 인자(현재 `:365`)를 바꾼다.

```ts
          pageWindow(current, pages, DEFAULT_PAGE_WINDOW),
```

Task 2 가 이것을 `this.#window` 로 바꾼다. 지금 리터럴 `7` 을 쓰지 않는 이유는 그 자리가 상수를 봐야 한다는 것을 코드로 남기기 위해서다.

- [ ] **Step 5: `repeat` 키 주석의 사실 오류를 고친다**

현재 `:366-372` 주석은 **"윈도우가 줄어들 때(`pageWindow(6,12)` 는 7개, `pageWindow(12,12)` 는 4개)"** 라고 적는다. 이 태스크가 그 성질을 없앴으므로 그대로 두면 거짓말이 된다. 주석 블록을 이것으로 바꾼다.

```ts
          /*
            번호는 그 번호 자신이 정체성이다. 슬롯 수는 이제 고정이지만 윈도우가
            밀리면 같은 자리에 다른 번호가 온다(`1 … 5 6 7 … 12` → `1 … 6 7 8 … 12`).
            위치로 diff 하면 lit 이 노드를 재사용하며 라벨만 5에서 6으로 바꾸고,
            화면낭독기가 엉뚱한 번호를 읽는다. 포커스가 있던 노드가 옮겨 갈 때
            제거 후 삽입이 되는 것도 같다 — 그쪽은 updated() 가 되돌린다.

            gap 은 포커스를 받지 않고 위치가 곧 정체성이라 인덱스로 구분한다.
            문자열 키라 번호 키와 섞이지 않는다.
          */
```

- [ ] **Step 6: 타입 검사를 돌린다**

Run: `npm run check`
Expected: 다섯 검사 모두 통과. 실패하면 대부분 `(number | "gap")[]` 반환 타입 추론 문제다 — 반환 타입 애너테이션이 배열 리터럴에 컨텍스트 타입을 주므로 `"gap"` 이 리터럴 타입으로 좁혀진다. 애너테이션을 지우지 않는다.

- [ ] **Step 7: 손으로 추적해 결과를 보고서에 적는다**

설계 문서 §4.3 의 네 표를 **직접 계산해서** 채운다. 코드를 읽고 "맞는 것 같다" 고 적지 않는다 — `edge`·`half` 를 숫자로 구하고 세 분기 중 어디로 가는지 판정한 뒤 배열을 쓴다.

추적할 입력:

| `size` | `total` | `current` |
|---|---|---|
| 7 | 12 | 1 · 4 · 5 · 6 · 7 · 8 · 9 · 12 |
| 5 | 12 | 1 · 3 · 4 · 9 · 10 · 12 |
| 7 | 8 | 1 · 5 · 6 · 8 |
| 7 | 7 | 1 · 4 |
| 7 | 2 | 1 · 2 |

각 입력에 대해 **`edge` · `half` · 어느 분기 · 결과 배열 · 슬롯 수**를 적는다. **슬롯 수가 `min(total, size)` 가 아닌 줄이 하나라도 있으면 거기서 멈추고 보고한다.**

결과가 §4.3 과 다르면 **코드를 고치지 말고 보고한다.**

- [ ] **Step 8: 커밋**

```bash
git add src/components/pagination/ns-pagination.ts
git commit -m "fix(pagination): 슬롯 수를 현재 페이지와 무관하게 고정한다"
```

---

## Task 2: `page-window` 프로퍼티와 검증을 더한다

**Files:**
- Modify: `src/components/pagination/ns-pagination.ts` — `defaultPage` 선언 다음(현재 `:85`) · 경고 플래그 옆(현재 `:102`) · `#pages` 게터 근처 · `render()` 의 호출부
- Modify: `index.html` — `ns-pagination` 절의 프로퍼티 표와 데모

**Interfaces:**
- Consumes: `DEFAULT_PAGE_WINDOW` · `pageWindow(current, total, size)` (Task 1)
- Produces: 공개 프로퍼티 `pageWindow: number` / 속성 `page-window` — Task 4 가 문서화한다
- Produces: 비공개 게터 `get #window(): number` — 언제나 5 이상의 홀수를 돌려준다

- [ ] **Step 1: 프로퍼티를 선언한다**

`@property({ type: Number, attribute: "default-page" }) defaultPage = 1;` 바로 다음에 넣는다.

```ts
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
```

- [ ] **Step 2: 경고 플래그를 더한다**

`#warnedTotal = false;` (현재 `:102`) 다음 줄에 넣는다. **기존 플래그들과 합치지 않는다** — 바로 위 주석이 그 이유를 이미 적고 있다(무관한 진단 둘이 하나로 뭉개지면 먼저 일어난 쪽이 다른 쪽을 가린다).

```ts
  #warnedWindow = false;
```

- [ ] **Step 3: 검증 게터를 더한다**

`get #pages(): number { … }` 가 끝나는 `}` 다음에 넣는다.

```ts
  /** 검증을 통과한 슬롯 수. **언제나 5 이상의 홀수를 돌려준다.** */
  get #window(): number {
    const raw = this.pageWindow;
    /*
      Number.isInteger 가 NaN·Infinity·소수를 한 번에 걸러낸다. raw >= 5 를 먼저
      보므로 음수의 나머지 연산을 걱정할 필요가 없다.
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
```

- [ ] **Step 4: 호출부를 게터로 바꾼다**

`render()` 안에서 Task 1 이 넣은 줄을 바꾼다.

```ts
          pageWindow(current, pages, this.#window),
```

함수 이름과 프로퍼티 이름이 같지만 `this.` 가 갈라 준다. `this.pageWindow` 를 직접 넘기지 **않는다** — 검증을 건너뛴다.

- [ ] **Step 5: 검사를 돌린다**

Run: `npm run check`
Expected: 다섯 검사 모두 통과.

- [ ] **Step 6: `index.html` 프로퍼티 표에 행을 더한다**

`ns-pagination` 절의 `<h3>프로퍼티</h3>` 표에서 `defaultPage` 행 다음에 넣는다.

```html
    <tr><td><code>pageWindow</code></td><td><code>page-window</code></td><td>number</td><td><code>7</code></td><td>이전·다음 사이 슬롯 수. <code>…</code> 칸도 센다. <strong>5 이상의 홀수</strong> — 아니면 경고 후 <code>7</code></td></tr>
```

- [ ] **Step 7: `index.html` 에 `page-window` 데모를 더한다**

`<h3>경계</h3>` 데모 블록(`id="pagination-edge-demo"`)의 `<pre></pre>` 와 그 아래 설명 `<p>` 다음, `<h3>프로퍼티</h3>` 앞에 넣는다.

**id 에 `pagination-` 접두사가 붙어 있는 것이 중요하다.** 이 파일의 배선은 `<script>` 하나라, 다른 절이 이미 쓴 id 를 재사용하면 `querySelector(...).addEventListener` 에서 예외가 나고 **그 지점부터 아래 배선 전부가 죽는다.** 화면은 멀쩡해 보이므로 육안 확인이 그 결함을 못 잡는다.

```html
  <h3>슬롯 수</h3>
  <template class="ex">
    <div style="display:grid;gap:var(--ns-space-4)">
      <ns-pagination total="240" per-page="20" default-page="6" page-window="5"></ns-pagination>
      <ns-pagination total="240" per-page="20" default-page="6"></ns-pagination>
      <ns-pagination total="240" per-page="20" default-page="6" page-window="9"></ns-pagination>
    </div>
  </template>
  <div class="demo block" id="pagination-window-demo" style="padding: var(--ns-space-4)"></div>
  <pre></pre>
  <p>
    위에서부터 <code>page-window="5"</code> · 기본값 <code>7</code> · <code>page-window="9"</code> 다.
    셋 다 12페이지이고, <strong>어느 것이든 끝까지 넘기는 동안 "다음" 버튼이 제자리에 있어야 한다</strong> —
    슬롯 수가 달라지는 것은 세 컨트롤 <em>사이</em>지 한 컨트롤 <em>안</em>이 아니다.
  </p>
```

배선은 필요 없다. 비제어 데모라 컴포넌트가 스스로 페이지를 관리하고, 이벤트를 찍는 것은 위쪽 `pagination-demo` 하나로 충분하다.

- [ ] **Step 8: `index.html` 을 브라우저 없이 검사한다**

`.claude/rules/verification.md` 가 정한 네 검사를 그대로 돌린다.

```sh
grep -c '<script>' index.html
grep -n '</script>' index.html | grep -v -E ':\s*</script>\s*$' | grep -v '<script src='
grep -n 'document.addEventListener' index.html
grep -oE '(^|[[:space:]])id="[^"]*"' index.html | sed -E 's/.*id="([^"]*)"/\1/' | sort | uniq -d
```

Expected: 첫 번째는 `1`. 나머지 셋은 **출력이 없어야 한다.** 네 번째에 `pagination-window-demo` 가 뜨면 id 가 겹친 것이다.

- [ ] **Step 9: 검사를 다시 돌리고 커밋**

Run: `npm run check`
Expected: 통과. ④ 가 클래스 목록을 보고하는데 이 태스크는 클래스를 더하지 않았으므로 목록이 그대로다.

```bash
git add src/components/pagination/ns-pagination.ts index.html
git commit -m "feat(pagination): 슬롯 수를 정하는 page-window 속성을 더한다"
```

---

## Task 3: 번호 칸을 균등 그리드로 만든다

**Files:**
- Modify: `src/components/pagination/ns-pagination.ts` — `render()` 의 템플릿
- Modify: `src/controls/controls.css:521-539` (`ns-pagination` · `ns-pagination nav` · `.ns-pagination-gap` 블록 부근)
- Modify: `index.html` — `ns-pagination` 절의 클래스 표

**Interfaces:**
- Consumes: Task 1 의 고정 슬롯 수. **이 태스크만으로는 문제가 안 고쳐진다** — 슬롯 수가 흔들리면 칸 폭이 같아도 전체 폭이 달라진다
- Produces: 공개 클래스 `.ns-pagination-pages`

- [ ] **Step 1: 템플릿에 래퍼를 넣는다**

`render()` 에서 `${repeat(...)}` **한 덩어리**를 `<span class="ns-pagination-pages">` 로 감싼다. `repeat` 의 세 인자는 하나도 바뀌지 않는다 — 감싸기만 하고 들여쓰기를 두 칸 민다.

"이전"·"다음" 버튼은 **밖에 남는다.** 그 둘이 고정되는 것이 목표이므로 그리드에 들어가면 안 된다.

감싼 뒤의 모양(주석 본문은 Task 1 Step 5 가 넣은 것이 그대로 있다):

```ts
        <span class="ns-pagination-pages">
          ${repeat(
            pageWindow(current, pages, this.#window),
            /* (Task 1 Step 5 의 키 주석) */
            (entry, index) => (entry === "gap" ? `gap-${index}` : entry),
            (entry) =>
              entry === "gap"
                ? html`<span class="ns-pagination-gap" aria-hidden="true">…</span>`
                : html`<button
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
```

**`data-ns-page` 와 `aria-current` 를 그대로 둔다.** 전자는 `updated()` 의 포커스 복구가 쓰는 훅이고 후자는 화면낭독기가 현재 위치를 아는 유일한 수단이다.

`<div>` 가 아니라 `<span>` 인 이유: `controls.css` 를 임포트하지 않은 소비자에게 `<div>` 는 블록이라 번호 버튼이 세로로 쌓인다. `<span>` 은 인라인이라 지금과 비슷하게 흐른다.

`updated()` 의 포커스 복구는 `this.querySelector` 로 **후손**을 찾으므로 고칠 것이 없다.

- [ ] **Step 2: `controls.css` 에 그리드를 더한다**

`ns-pagination nav { … }` 블록 다음, `.ns-pagination-gap` 앞에 넣는다.

```css
  /*
    번호 칸을 전부 같은 폭으로 만든다. 이전·다음이 제자리에 있으려면 이것과
    pageWindow 의 고정 슬롯 수가 **둘 다** 필요하다 — 한쪽만으로는 진폭만
    줄고 여전히 움직인다. 근거는
    docs/superpowers/specs/2026-08-26-pagination-stable-width-design.md 에 있다.

    내재 폭 컨테이너 안에서 1fr 트랙들은 전부 가장 넓은 항목의 max-content 폭을
    갖는다. 이 컴포넌트는 어느 배치에서도 마지막 페이지 버튼을 렌더하므로 그것이
    언제나 최댓값이면 폭이 고정되는데, 그 전제가 저절로 성립하지는 않는다 —
    아래 두 규칙이 상자와 글자폭을 맞춰 성립시킨다.
  */
  .ns-pagination-pages {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    align-items: center;
    gap: var(--ns-space-1);
  }

  /*
    자릿수만이 폭을 정하게 한다. 비례폭 글꼴에서 0 이 1 보다 넓으면 "10" 이
    "11" 보다 넓어져, 마지막 페이지가 최댓값이라는 전제가 깨진다.

    부모가 아니라 항목에 직접 준다. 상속 프로퍼티지만 UA 스타일시트가 button 에
    font 단축 프로퍼티를 걸어 이 값을 normal 로 되돌리고, 이 파일의 버튼 규칙은
    font-family·font-size·line-height 를 따로 적을 뿐 단축을 쓰지 않는다.
  */
  .ns-pagination-pages > * {
    font-variant-numeric: tabular-nums;
  }

  /*
    .ns-button--outline 은 1px 테두리를 갖고 --ghost 는 갖지 않는다. box-sizing 이
    border-box 라도 **max-content 는 테두리를 포함**하므로, 현재 페이지가 가장 넓은
    번호일 때와 아닐 때 트랙 폭이 2px 갈린다. 일곱 칸이면 14px 어긋난다.

    선택자를 > .ns-button 으로 넓히지 않는다 — (0,2,0) 이라 .ns-button--outline
    (0,1,0) 을 이겨 현재 페이지의 테두리까지 투명해진다.
  */
  .ns-pagination-pages > .ns-button--ghost {
    border: 1px solid transparent;
  }
```

- [ ] **Step 3: `.ns-pagination-gap` 을 고친다**

기존 블록을 이것으로 바꾼다. `padding-inline` 이 사라지고 `text-align` 이 들어온다.

```css
  /*
    padding-inline 을 갖지 않는다. 트랙 폭은 번호가 정하므로 필요 없고, 남겨 두면
    gap 이 최댓값을 다툴 여지만 생긴다. 그리드 항목이라 트랙 폭만큼 늘어나므로
    가로 가운데는 text-align 이, 세로 가운데는 부모의 align-items 가 맡는다.
  */
  .ns-pagination-gap {
    text-align: center;
    color: var(--ns-color-fg-subtle);
    font-size: var(--ns-font-size-sm);
    line-height: var(--ns-line-height-sm);
  }
```

- [ ] **Step 4: `.ns-button--sm` 에 손대지 않았는지 확인한다**

Run: `git diff src/controls/controls.css | grep -n 'ns-button'`
Expected: 출력이 `.ns-pagination-pages > .ns-button--ghost` 를 더한 줄뿐이다.

`.ns-button--sm` 에 `min-width` 를 주고 싶은 유혹이 있는데 **주지 않는다.** 페이지네이션 밖의 모든 작은 버튼이 함께 넓어진다. 폭 고정은 그리드가 이미 하고 있다.

- [ ] **Step 5: 검사를 돌려 ④ 가 실패하는 것을 확인한다**

Run: `npm run check`
Expected: **실패한다.** `check-controls.mjs` 가 `controls.css` 에는 있고 `index.html` 에는 없는 `ns-pagination-pages` 를 보고해야 한다.

**이 실패를 반드시 눈으로 본다.** 통과해 버리면 ④ 가 이 클래스를 아예 안 보고 있다는 뜻이고, 다음 스텝에서 표에 적어도 그것이 검사된 것이 아니다. 다른 이유(예: 타입 에러)로 먼저 실패하면 그것부터 고치고 다시 돌린다 — 목표한 실패를 확인하지 못한 것이다.

- [ ] **Step 6: `index.html` 클래스 표에 행을 더한다**

`.ns-pagination-gap` 행 **앞**에 넣는다(문서 트리 순서와 같게).

```html
    <tr><td><code>.ns-pagination-pages</code></td><td>컴포넌트가 렌더하는 <code>span</code></td><td>번호 버튼과 <code>…</code> 를 감싸는 균등 그리드. <strong>칸을 전부 같은 폭으로 만들어 이전·다음을 제자리에 붙든다</strong></td></tr>
```

같은 절의 설명 `<p>` 도 함께 고친다 — 지금은 `.ns-pagination-gap` 하나만 이름을 대고 있다.

```html
  <p>
    <code>nav</code> 는 이 컴포넌트가 렌더하는 유일한 자식이라 요소 타입으로 특정되어
    클래스가 없다. 이 표에 <code>.ns-pagination-pages</code> 와
    <code>.ns-pagination-gap</code> 이 적혀 있어야
    <code>check-controls.mjs</code> 가 통과한다 — 데모 템플릿에는 그 클래스들이 소스로
    등장하지 않는다(컴포넌트가 런타임에 만든다).
  </p>
```

- [ ] **Step 7: 검사가 다시 초록인지 확인한다**

Run: `npm run check`
Expected: 통과. ④ 의 클래스 목록에 `ns-pagination-pages` 가 **포함되어 출력된다.** 출력에서 그 이름을 눈으로 확인한다.

- [ ] **Step 8: 커밋**

```bash
git add src/components/pagination/ns-pagination.ts src/controls/controls.css index.html
git commit -m "fix(pagination): 번호 칸을 균등 그리드로 묶어 폭을 고정한다"
```

---

## Task 4: 문서를 맞춘다

**Files:**
- Modify: `docs/superpowers/specs/2026-08-13-ns-table-design.md` §7.1 · §7.2 · §7.3
- Modify: `index.html` — `<h3>번호 윈도우</h3>` 산문
- Modify: `docs/gotchas.md`
- Modify: `docs/pending-human-checks.md`

**Interfaces:**
- Consumes: Task 1·2·3 이 만든 동작 전부

이 태스크는 코드를 건드리지 않는다. **`ns-table` 설계 문서가 `ns-pagination` 의 API 계약을 담고 있으므로**, 거기를 고치지 않으면 문서가 구현과 어긋난 채 남는다.

- [ ] **Step 1: 설계 스펙 §7.1 표에 행을 더한다**

`docs/superpowers/specs/2026-08-13-ns-table-design.md` 의 §7.1 프로퍼티 표, `defaultPage` 행 다음.

```markdown
| `pageWindow` | `page-window` | number | `7` | 이전·다음 사이 슬롯 수. 5 이상의 홀수 |
```

- [ ] **Step 2: 같은 문서 §7.2 의 렌더 결과에 래퍼를 넣는다**

번호 버튼과 `…` 들을 `<span class="ns-pagination-pages">` 로 감싼 모양으로 고친다. `이전`·`다음` 버튼은 그 밖에 남는다.

```html
<nav aria-label="페이지 이동">
  <button class="ns-button ns-button--ghost ns-button--sm">이전</button>
  <span class="ns-pagination-pages">
    <button class="ns-button ns-button--ghost ns-button--sm">1</button>
    <span class="ns-pagination-gap">…</span>
    <button class="ns-button ns-button--ghost ns-button--sm">3</button>
    <button class="ns-button ns-button--outline ns-button--sm" aria-current="page">4</button>
    <button class="ns-button ns-button--ghost ns-button--sm">5</button>
    <span class="ns-pagination-gap">…</span>
    <button class="ns-button ns-button--ghost ns-button--sm">12</button>
  </span>
  <button class="ns-button ns-button--ghost ns-button--sm">다음</button>
</nav>
```

바로 아래 문장(**Light DOM 이라 `.ns-button` 이 그대로 먹는다**)은 그대로 둔다.

- [ ] **Step 3: 같은 문서 §7.3 의 규칙 목록을 갈아 끼운다**

첫 두 항목(`페이지 수 ≤ 7 이면 전부 표시` / `그 외에는 첫 페이지 · 현재±1 · 마지막 페이지, 빈 구간에 …`)만 바꾼다. **`aria-current` 항목과 이전/다음 항목은 건드리지 않는다.**

```markdown
- **슬롯 수는 언제나 `min(페이지 수, page-window)` 다.** 현재 페이지가 어디에 있든 달라지지 않는다 — 이전·다음 버튼을 제자리에 붙들기 위한 것이고, 폭까지 고정하는 것은 `.ns-pagination-pages` 가 맡는다(**둘 다 필요하다**)
- 페이지 수 ≤ `page-window` 면 전부 표시
- 그 외 세 배치. `h = (page-window - 5)/2` 다
  - 앞쪽(`현재 ≤ page-window-2`): `1 … page-window-2` · `…` · 마지막
  - 뒤쪽(`현재 > 페이지 수 - (page-window-2)`): `1` · `…` · 마지막 직전 `page-window-2` 개
  - 가운데: `1` · `…` · `현재±h` · `…` · 마지막
- **`page-window` 는 5 이상의 홀수여야 한다.** 가운데 배치의 번호 개수가 `page-window - 4 = 2h + 1` 이라 짝수면 `h` 가 정수가 아니고, 3이면 `h = -1` 이라 현재 페이지가 들어갈 자리가 없다. 잘못된 값은 경고 한 번 뒤 `7` 로 그린다
- `…` 이 감추는 페이지는 어느 배치에서든 **최소 2개**다
```

§7.4 경계 절에 한 줄 더한다.

```markdown
- **`page-window` 가 잘못돼도 렌더를 멈추지 않는다.** `per-page` 와 달리 페이지 수 계산에 쓰이지 않는 표시 설정이다
```

- [ ] **Step 4: `index.html` 의 `<h3>번호 윈도우</h3>` 산문을 고친다**

첫 두 `<li>` 를 바꾼다. **나머지 두 `<li>`(`aria-current` · `aria-disabled`)는 그대로 둔다.**

```html
    <li><strong>슬롯 수는 언제나 <code>min(페이지 수, page-window)</code> 다.</strong> 현재 페이지가 어디에 있든 달라지지 않는다 — 그래야 "이전"·"다음" 이 제자리에 있다. <strong>폭까지 고정하는 것은 <code>.ns-pagination-pages</code> 가 맡는다</strong>. 둘 중 하나만으로는 진폭만 줄고 여전히 움직인다</li>
    <li>페이지 수 ≤ <code>page-window</code> 면 전부 표시. 그 외에는 <strong>앞쪽</strong>(<code>1 … n</code> · <code>…</code> · 마지막) · <strong>가운데</strong>(<code>1</code> · <code>…</code> · 현재±h · <code>…</code> · 마지막) · <strong>뒤쪽</strong>(<code>1</code> · <code>…</code> · 끝의 n개) 셋 중 하나다. <code>h = (page-window - 5)/2</code> 라 <code>page-window</code> 가 <strong>5 이상의 홀수</strong>여야 한다</li>
```

- [ ] **Step 5: 「경계」 데모의 캡션에 있는 사실 오류를 고친다**

**이 결함은 이번 변경이 만든 것이 아니라 원래 있던 것이다.** `ns-pagination` 절의 「경계」 데모 캡션이 이렇게 적혀 있다.

```
위에서부터 3페이지(전부 표시) · 7페이지(… 등장) · 1페이지(아무것도 렌더하지 않는다) 다.
```

가운데 컨트롤은 `total="140" per-page="20"` 이라 **7페이지**이고, 기본 슬롯 수도 7이라 `…` 이 나오지 않는다. 고치기 전 코드도 `total <= 7` 이면 전부 표시했으므로 **이 캡션은 처음부터 틀렸다.** 이번 변경으로 달라지지는 않지만, 세 경계 중 하나를 보여주지 못하는 데모를 그대로 두면 A-5 를 보는 사람이 `…` 을 못 찾고 결함으로 오인한다.

캡션이 주장하던 것을 데모가 실제로 하도록 페이지 수를 늘린다.

```html
      <ns-pagination total="180" per-page="20" default-page="7"></ns-pagination>
```

`180 / 20 = 9` 페이지다. `default-page="7"` 이 뒤쪽 배치에 들어가 `1 · … · 5 6 7 8 9` 가 되어 `…` 이 하나 보인다. 캡션의 숫자도 함께 고친다.

```html
  <p>
    위에서부터 3페이지(<strong>전부 표시</strong> — 페이지 수가 <code>page-window</code> 이하다) ·
    9페이지(<code>…</code> 등장) · 1페이지(<strong>아무것도 렌더하지 않는다</strong>) 다.
  </p>
```

- [ ] **Step 6: `index.html` 을 브라우저 없이 다시 검사한다**

Run: `.claude/rules/verification.md` 의 네 명령(Task 2 Step 8 과 같다)
Expected: 첫 번째 `1`, 나머지 셋 출력 없음.

- [ ] **Step 7: `docs/gotchas.md` 에 항목을 더한다**

파일의 기존 형식(**증상 → `→ 원인·처방`**)을 따른다. `ns-pagination` 관련 항목들 근처에 넣는다.

```markdown
### 균등 그리드의 "가장 넓은 칸" 은 저절로 고정되지 않는다

`ns-pagination` 의 이전·다음 버튼이 페이지를 넘길 때마다 좌우로 움직였다. 원인이 **셋**이었고 하나만 고치면 진폭만 줄었다 — ① `pageWindow` 의 슬롯 수가 현재 페이지에 따라 4~7 로 오갔다 ② `…` 칸이 번호 버튼보다 좁았다 ③ 번호 버튼에 최소 폭이 없어 `9` 와 `10` 의 폭이 달랐다.

②③을 `.ns-pagination-pages { display: grid; grid-auto-columns: 1fr }` 로 묶었다. 내재 폭 컨테이너에서 `1fr` 트랙은 전부 가장 넓은 항목의 max-content 폭을 갖고, 이 컴포넌트는 **어느 배치에서도 마지막 페이지 버튼을 렌더**하므로 그것이 최댓값이면 폭이 고정된다. 그런데 그 전제가 두 곳에서 깨진다.

→ **하나. 현재 페이지 버튼이 2px 더 넓다.** `.ns-button--outline` 은 `border: 1px solid` 를 갖고 `--ghost` 는 갖지 않는다. `box-sizing: border-box` 라도 **max-content 는 테두리를 포함**하므로, 현재 페이지가 가장 넓은 번호일 때와 아닐 때 트랙 폭이 갈린다. 일곱 칸이면 14px 다. 비활성 번호에 `border: 1px solid transparent` 를 줘 상자를 맞춘다. 선택자를 `> .ns-button` 으로 넓히면 (0,2,0)이 `.ns-button--outline`(0,1,0)을 이겨 **현재 페이지의 테두리까지 투명해진다** — `> .ns-button--ghost` 로 좁혀야 한다.

→ **둘. 자릿수가 같아도 폭이 같지 않다.** 비례폭 글꼴에서 `0` 이 `1` 보다 넓으면 `"10"` 이 `"11"` 보다 넓다. `pages=11` 이면 가장 넓은 항목이 마지막 페이지가 아니라 창 안의 `10` 이 되고, `10` 이 창에서 빠지는 순간 다시 흔들린다. `font-variant-numeric: tabular-nums` 로 자릿수만이 폭을 정하게 만든다. **부모가 아니라 항목에 직접 준다** — 상속 프로퍼티지만 UA 스타일시트가 `button` 에 `font` **단축** 프로퍼티를 걸어 `normal` 로 되돌리고, `controls.css` 의 버튼 규칙은 `font-family`·`font-size`·`line-height` 를 따로 적을 뿐 단축을 쓰지 않는다.

→ **①은 CSS 로 못 고친다.** 칸 폭이 같아도 칸 개수가 달라지면 전체 폭이 달라진다. `pageWindow` 가 언제나 `min(pages, size)` 개를 내도록 고쳤다. **"다음" 이 안 움직이는 조건은 슬롯 수가 `current` 와 무관한 것이지 모든 데이터셋에서 같은 것이 아니다** — 한 데이터셋 안에서 `pages` 는 고정이므로 페이지가 3개면 3칸만 그리면 된다.
```

- [ ] **Step 8: `docs/pending-human-checks.md` 의 `## 범위` 절에 한 줄 더한다**

기존 세 항목의 목록 다음에 넣는다. **이 절을 함께 고치는 것이 중요하다** — 목록만 자라면 범위 설명이 조용히 낡는다.

```markdown
- **페이지네이션 폭 고정.** 페이지를 넘길 때마다 "이전"·"다음" 이 움직이던 것을 고쳤다. 슬롯 수를 현재 페이지와 무관하게 고정하고, 번호 칸을 균등 그리드로 묶었다. `page-window` 속성이 새로 생겼고 **DOM 에 래퍼 `<span class="ns-pagination-pages">` 가 하나 늘었다.** `dist/` 가 바뀐다. 설계 문서는 `docs/superpowers/specs/2026-08-26-pagination-stable-width-design.md` 다
```

- [ ] **Step 9: `## A` 절 끝에 항목 셋을 더한다**

기존 마지막 A 항목 다음에 이어 붙인다. 번호는 **기존 마지막 번호 + 1** 부터다(이 계획을 쓰는 시점에는 A-4 가 마지막이므로 A-5·A-6·A-7 이지만, 실제 파일을 열어 확인하고 붙인다).

**볼 것 / 잘못된 것 / 릴리스 때 할 일** 세 줄 형식을 그대로 지킨다.

```markdown
### A-5. 페이지를 끝까지 넘기는 동안 "다음" 버튼이 제자리에 있는가

**이 사이클의 핵심 증거다.** `ns-pagination` 절의 첫 데모(`total="240" per-page="20"`, 12페이지)를 쓴다. "다음" 을 1페이지부터 12페이지까지 누르고 "이전" 으로 되돌아온다. **버튼을 누른 뒤 마우스를 움직이지 않는 것이 요령이다** — 커서 아래에서 버튼이 빠져나가면 그것이 곧 결함이다.

- **볼 것:** ① "다음" 버튼의 왼쪽 모서리가 1 → 12 → 1 내내 같은 x 좌표에 있다 ② "이전" 버튼도 같다 ③ **4→5 와 9→10 경계**에서도 그렇다(고치기 전 진폭이 가장 컸던 자리다) ④ 번호 칸과 `…` 칸의 폭이 서로 같다 ⑤ 어느 페이지에서도 번호 칸이 정확히 7개다
- **잘못된 것:** 특정 페이지에서만 버튼이 튄다 · `…` 칸이 번호 칸보다 눈에 띄게 좁다 · 현재 페이지가 `12` 일 때만 전체 폭이 살짝 넓어진다(테두리 2px 이 안 맞은 것이다) · 1페이지와 12페이지에서 번호 개수가 다르다
- **릴리스 때 할 일:** 없다 — `scripts/release.mjs` 가 태그 커밋에서 `dist/` 를 새로 빌드한다. 다만 이 항목은 **소비자에게 나가는 코드**라 태그가 실제 동작을 바꾼다

### A-6. `page-window` 가 실제로 듣고, 잘못된 값이 경고와 함께 7로 떨어지는가

`ns-pagination` 절의 「슬롯 수」 데모 셋을 쓴다. 그 다음 **콘솔을 연 채로** 개발자 도구에서 값을 잘못 넣어 본다.

```js
document.querySelector("#pagination-window-demo ns-pagination").setAttribute("page-window", "6")
```

- **볼 것:** ① 세 컨트롤의 번호 칸이 각각 5개 · 7개 · 9개다 ② 셋 다 각자 끝까지 넘기는 동안 "다음" 이 제자리다 ③ `page-window="5"` 에서 가운데 배치가 `1 … 6 … 12` 모양이다(현재 페이지 좌우에 번호가 없다) ④ 위 `setAttribute` 뒤 콘솔에 `[ns-pagination] page-window=6 는 5 이상의 홀수여야 합니다. 7 로 그립니다.` 가 **한 번만** 뜨고 칸이 7개가 된다 ⑤ 같은 컨트롤에 `"3"`·`"abc"` 를 다시 넣어도 **경고가 더 뜨지 않는다**(인스턴스당 한 번이다)
- **잘못된 것:** 세 컨트롤의 칸 수가 같다(속성이 안 먹은 것) · 잘못된 값에서 아무것도 안 그려진다(렌더를 멈추면 안 된다) · 경고가 렌더마다 반복된다 · 경고가 아예 없다
- **릴리스 때 할 일:** 없다. 위와 같다

### A-7. 현재 페이지 테두리와 `…` 정렬이 살아 있는가

투명 테두리 규칙(`.ns-pagination-pages > .ns-button--ghost`)을 잘못 쓰면 **현재 페이지의 테두리가 사라진다.** 폭은 고정된 것처럼 보이므로 A-5 만으로는 안 잡힌다. 밝은 모드와 다크 모드 양쪽에서 본다.

- **볼 것:** ① 현재 페이지 버튼에 테두리가 **보인다**(`--outline` 변형이다) ② 나머지 번호 버튼에는 테두리가 **안 보인다** ③ `…` 이 칸 안에서 가로·세로 모두 가운데다 ④ 번호 버튼의 높이가 "이전"·"다음" 과 같다 ⑤ 다크 모드에서 투명 테두리가 미묘한 선으로 드러나지 않는다
- **잘못된 것:** 현재 페이지에 테두리가 없다(선택자를 `> .ns-button` 으로 넓힌 것이다) · 모든 번호에 테두리가 보인다 · `…` 이 칸 위쪽에 붙어 있다(부모의 `align-items: center` 가 빠진 것이다) · 번호 버튼만 2px 높다
- **릴리스 때 할 일:** 없다. 위와 같다
```

- [ ] **Step 10: 검사를 돌리고 커밋**

Run: `npm run check`
Expected: 통과.

```bash
git add docs/superpowers/specs/2026-08-13-ns-table-design.md docs/gotchas.md docs/pending-human-checks.md index.html
git commit -m "docs(pagination): 고정 슬롯 규칙과 page-window 를 문서에 반영한다"
```

---

## 끝난 뒤

- **`git push` 하지 않는다.** 사용자가 명시적으로 요청할 때만 한다.
- **릴리스는 별개다.** `.claude/skills/releasing` 이 맡고, 그 스킬이 `docs/pending-human-checks.md` 를 비우기 전에 사람이 A-5·A-6·A-7 을 확인하도록 요구한다.
- **소비자 영향을 보고서에 적는다:** DOM 에 래퍼가 생겨 `ns-pagination nav > button` 으로 번호 버튼을 겨냥하던 소비자 CSS 는 깨진다. 그 선택자에는 이전·다음만 남는다. 릴리스 노트 항목이다.
