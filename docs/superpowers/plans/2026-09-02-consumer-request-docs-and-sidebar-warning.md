# 요청서 나머지 전부 — 문서 다섯과 사이드바 경고 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `dashboard-shell` 요청서에서 남은 전부를 끝낸다 — 문서 항목 ①⑤⑦⑨ 와 ②의 보강, 회신에서 새로 온 ②-b, 그리고 코드 항목 ⑥. 이것으로 요청서 아홉이 모두 닫힌다.

**Architecture:** 여섯 중 다섯이 `guide.html` 한 파일에 들어가므로 직렬로 처리한다. ⑥만 소스를 만지고, 마지막에 릴리스 기록을 만든다.

**Tech Stack:** Lit 3 · TypeScript · 순수 HTML 문서. 테스트 러너 없음(설계 결정). 회귀 확인은 `npm run check` 와 헤드리스 브라우저 프로브다.

**근거 문서** (전부 저장소 밖 세션 스크래치패드에 있었고 사라진다. 필요한 내용은 이 계획에 옮겨 적었다):
- `common-ui-수정요청서.md` — 원 요청 ①~⑨
- `common-ui-v0.5.4-회신.md` — 설치·검증 결과. ②-b 신규 보고, ⑥ 조건 철회, ⑨ 문서 송부
- `common-ui-테스트-규칙-§6.md` — ⑨에 옮길 본문

## Global Constraints

- **테스트 러너를 추가하지 않는다.** vitest·jest·playwright·web-test-runner 금지, 테스트 파일도 만들지 않는다.
- **커밋 메시지:** `<type>(<scope>): <subject>` — 한국어 명령조, 마침표 없음, 트레일러 `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.
- **`git push` 는 하지 않는다.** 태그는 조정자가 자른다.
- **문서 페이지 셋에 리터럴 색을 쓰지 않는다.** 색은 `var(--ns-…)` 로만.
- **문서 페이지 산문에 스크립트 태그를 리터럴로 쓰지 않는다** — "스크립트" 로 적는다. 구조 검사가 문자열을 센다.
- **새 `id` 를 만들 때는 절 이름을 접두사로 붙인다.** 문서 안 id 중복은 그 페이지 배선 전체를 죽인다.
- **측정값·부정 단정은 적기 전에 실행해서 확인한다.** 이 저장소는 되돌릴 수 없는 태그로 나가고 문서가 그 안에 실린다. 확인 못 한 것은 **확인 못 했다고 적는다.**
- **`@ts-expect-error` 를 `.tsx` 안 주석의 첫 토큰으로 쓰면 `tsc` 가 집행한다.** 산문으로 언급할 때는 문장 중간에 둔다.

---

### Task 1: ⑦⑤ — 프로퍼티 표에 reflect 칸과 타이밍을 넣는다

**Files:**
- Modify: `guide.html` (컴포넌트별 프로퍼티 표)

**Interfaces:**
- Consumes: 없음. Produces: 없음. 문서만 바뀐다.

**요청 내용.** 지금 표의 `속성` 칸이 **"이름" 인지 "reflect 된다" 인지 구분이 없다.** 소비자는 `getAttribute` 가 되는지 알려면 번들을 grep 해야 했고, 실제로 `el.getAttribute("label")` 이 `null` 인 것을 실행해 보고서야 알았다고 한다.

**측정된 사실 — 이 저장소에서 reflect 하는 프로퍼티는 정확히 셋이다.**

```bash
cd /Users/neosimplix/coding/dashboard/common-ui
grep -rn 'reflect: true' src/components/
```

- `src/components/header/ns-header.ts` — `sidebarOpen` → 속성 `sidebar-open`
- `src/components/nav-item/ns-nav-item.ts` — `active`
- `src/components/toast/ns-toast.ts` — `position`

- [ ] **Step 1: 지금 표의 모양을 확인한다**

```bash
cd /Users/neosimplix/coding/dashboard/common-ui
grep -n '<th>속성</th>\|<th>프로퍼티</th>' guide.html | head -20
```

표가 여러 개다. **전부 같은 방식으로 고친다.** 하나만 고치면 소비자가 "이 표에는 칸이 있고 저 표에는 없네" 로 읽는다. 표마다 열 구성이 조금씩 다를 수 있으니 각각 읽고 맞춘다.

- [ ] **Step 2: reflect 칸을 더한다**

각 프로퍼티 표에 열을 하나 더한다. 값은 셋 중 하나다.

- **`reflect`** — 위 셋에만 해당
- **`—`** — 나머지 전부(대부분이다)

열 제목은 `reflect` 로 한다. 그리고 표 **바로 위나 아래**에 이 문단을 둔다(표마다 반복하지 말고, 프로퍼티 표가 처음 나오는 절에 한 번 두고 나머지는 그리로 보낸다).

```html
  <p>
    <strong><code>reflect</code> 칸이 <code>—</code> 면 그 프로퍼티는 속성으로
    내려가지 않는다.</strong> <code>el.getAttribute("label")</code> 은
    <code>null</code> 이다 — 프로퍼티로 읽는다(<code>el.label</code>).
    <strong>프로퍼티로 읽는 것은 언제나 안전하다.</strong>
  </p>
  <p>
    <strong><code>reflect</code> 하는 것에도 타이밍이 있다.</strong> lit 은 속성을
    업데이트 주기 뒤에 쓰므로 프로퍼티를 대입한 직후 동기로 읽으면 아직 없다 —
    <code>await el.updateComplete</code> 뒤에 읽는다. 같은 셸 쌍이라도
    <code>ns-header</code> 의 <code>sidebar-open</code> 은 이 대기가 필요하고,
    <code>ns-sidebar</code> 의 <code>data-ns-open</code> 은 React shim 이 직접
    렌더해서 첫 커밋에 이미 있다 — <strong>둘의 타이밍이 다르다.</strong>
  </p>
```

**⑤가 이 두 번째 문단이다.** 별도 절을 만들지 않는다 — 요청서가 "⑦의 표에 같은 칸으로 넣으면 둘이 한 번에 해결된다" 고 했고 그 판단이 맞다.

- [ ] **Step 3: 검사**

```bash
cd /Users/neosimplix/coding/dashboard/common-ui
npm run check
for f in index.html guide.html changelog.html; do
  echo "— $f"; grep -c '<script>' "$f"
  grep -n '</script>' "$f" | grep -v -E ':\s*</script>\s*$' | grep -v '<script src='
  grep -n 'document.addEventListener' "$f"
  grep -oE '(^|[[:space:]])id="[^"]*"' "$f" | sed -E 's/.*id="([^"]*)"/\1/' | sort | uniq -d
done
git status --short
```

Expected: `check` 5/5. 구조 검사 첫 줄 `index.html` **0**, 나머지 **1**, 다른 셋은 출력 없음. `git status` 에 `guide.html` 만.

- [ ] **Step 4: 커밋**

```bash
git add guide.html
git commit -F - <<'EOF'
docs(guide): 프로퍼티 표에 reflect 칸과 속성 타이밍을 더한다

속성 칸이 이름인지 reflect 인지 구분이 없어 소비자가 번들을 grep 해야 했다.
reflect 하는 것은 셋뿐이고, 그 셋에도 업데이트 주기 뒤라는 타이밍이 있다.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 2: ⑨① — 「소비자가 테스트할 때」 절을 만든다

**Files:**
- Modify: `guide.html` (새 절)

**Interfaces:**
- Consumes: 없음. Produces: 없음.

**이 절은 소비자가 보내온 문서를 옮기는 것이다.** 출처를 명시해 싣기로 합의했고 인용 허락도 받았다. **우리가 새로 지어내지 않는다** — 아래 본문이 근거이고, 우리 문서 관례(용어·말투)에만 맞춘다.

**받은 본문 (`dashboard-shell` 의 `.claude/rules/ui-components.md` §6, `v0.5.4` 기준 갱신본):**

- **원칙: 우리가 소유한 계약을 단언한다.** 넘긴 프롭과 받은 이벤트를 본다. 라이브러리가 그리는 내부 마크업에 의존하지 않는다 — 그쪽이 `<h2>` 를 `<h1>` 로 바꾸는 날 깨지는 것은 우리 버그가 아니다.
- **프로퍼티가 속성으로 reflect 되는지는 컴포넌트마다 다르다.** 대부분은 안 한다(`el.getAttribute("label")` 이 `null`). 하는 것은 `ns-header.sidebarOpen` · `ns-nav-item.active` · `ns-toast.position` 셋. **프로퍼티로 읽는 것이 항상 안전하다.**
- **lit 은 shadow 내용을 마이크로태스크에서 쓴다.** `render()` 직후 동기 조회로는 빈 엘리먼트다. 그 파일에 이미 있는 대기 수단을 쓰고 **새 헬퍼를 발명하지 않는다.**
- **무엇이 보이고 무엇이 안 보이는가.** 보임: 클래스 래퍼 전부 · `ns-tabs` · `ns-table` · `ns-multi-select` · `ns-pagination`(Light DOM). 안 보임: `ns-dialog`(제목·닫기) · `ns-page-heading` · `ns-header`(projectName·토글) · `ns-sidebar`/`ns-nav-*`(라벨·그룹 제목). **slot 으로 넘긴 자식은 호스트의 light DOM 자식으로 남으므로 `within(host)` 범위가 보존된다.**
- **shadow 접근은 한 종류만 허용한다** — 네이티브 `<dialog>` 의 `open` 속성. 다른 관찰 경로가 없기 때문이다. **"유일한 자리" 가 아니라 "유일한 종류"** 다 — 열림/닫힘 짝이 있으면 파일당 둘 이상이 정상이다.
- **이벤트로 배선을 확인한다.** shadow 안 버튼을 클릭하지 말고 호스트에 라이브러리 이벤트를 올린다(`ns-dialog-close` · `ns-toggle` · `ns-navigate`). **그 테스트는 "누르면 이벤트가 난다" 를 증명하지 않는다** — 라이브러리와 브라우저의 일이다. 그래서 **테스트 제목에 "누르면" 을 쓰지 않는다.**
- **선택 프롭의 부재와 `false` 가 같은 DOM 을 만들 수 있다.** `ns-sidebar` 의 `open` 이 그렇다 — 음성 단언만 두면 배선이 통째로 빠져도 통과한다. **음성·양성 둘을 함께 둔다.**
- **순회형 헬퍼에는 비어 있지 않음 가드를 넣는다.** 목록이 비면 루프가 안 돌아 아무것도 단언하지 않은 채 통과한다.
- **커스텀 엘리먼트를 `Field` 로 감쌀 때는 동기 조회가 안 된다.** `await findByLabelText` 를 쓴다. (Task 3 이 이것을 더 자세히 다루므로 여기서는 한 줄로 두고 그리로 보낸다.)
- **`Field` 를 서버 컴포넌트에서 쓰지 않는다.** (같음 — Task 3 으로 보낸다.)

- [ ] **Step 1: ①의 내용을 첫 항목으로 준비한다**

**요청서가 "가장 값어치 있는 하나" 로 꼽은 것이 ①이다.** vitest(jsdom)에서 커스텀 엘리먼트 래퍼에 넘긴 프로퍼티가 **하나도 반영되지 않고**, 에러도 경고도 없이 기본값으로 렌더된다.

원인은 `@lit/react` 의 `node` export 조건이다. 직접 확인한다:

```bash
cd /Users/neosimplix/coding/dashboard/common-ui
node -p "JSON.stringify(require('./node_modules/@lit/react/package.json').exports['.'], null, 1)"
```

`node` 조건이 `./node/index.js` 로 가고, 그 빌드의 `createComponent` 에는 **프로퍼티를 세우는 경로가 아예 없다** — 모아 둔 것을 `litPatchedCreateElement` 이거나 `globalThis.litSsrReactEnabled` 일 때만 `_$litProps$` 로 싣고, 아니면 버린다.

소비자 쪽 처방(`vitest.config.ts` **최상위**, `test` 안이 아니다):

```ts
ssr: { resolve: { conditions: ["module", "browser", "node", "development|production"] } },
```

**`node` 를 빼면 안 된다** — `react-dom/server` 처럼 browser/node 빌드가 갈리는 패키지가 조용히 틀린 쪽을 잡는다. `server.deps.inline` 은 효과가 없다(인라인은 export 조건을 안 바꾼다).

**적을 때 주의:** *"`useLayoutEffect` 가 없어서"* 로 적지 않는다. **어떤 타이밍 조작으로도 안 된다** — `act()` 나 flush 를 만지면 고칠 수 있을 것처럼 읽히고, 소비자가 실제로 거기서 시간을 버렸다. **`useLayoutEffect` 개수를 적지 않는다** — 프로덕션 판이 미니파이돼 있어 `grep -c`(줄)와 `grep -o`(출현)가 1 과 2 로 갈린다. 숫자에 기대는 서술은 이 자리에서 두 번 어긋났다.

- [ ] **Step 2: `jsdom` 의 `showModal` 항목을 준비한다**

패키지 결함이 아니지만 `ns-dialog` 를 쓰는 순간 걸린다. 프로토타입 스텁이 필요하고, **그건 스텁이지 구현이 아니다** — 포커스 트랩·`::backdrop`·`Esc` 를 흉내내지 않는다. 폴리필로 그것들을 흉내내기 시작하면 연극이 되고, 초록 실행이 "검증됐다" 로 오해된다.

- [ ] **Step 3: 절을 쓴다**

`guide.html` 에서 **컴포넌트 참조 절들이 끝난 뒤**, 문서 마지막 쪽에 새 `<h2>` 절을 만든다. 위치는 파일을 읽고 자연스러운 곳으로 정한다.

절 첫머리에 출처를 밝힌다:

```html
  <p>
    이 절은 <code>dashboard-shell</code> 이 자체 프리미티브 17개를 이 패키지로
    이관하면서 열 태스크에 걸쳐 <strong>실측으로 알아낸 것</strong>을 옮긴 것이다.
    적어 두지 않으면 다음 소비자가 처음부터 다시 겪는다.
  </p>
```

그리고 **실측과 추론을 나눠 적는다** — 소비자가 항목별로 구분해 보내왔고, 이 저장소도 둘을 나눠 적는 관례가 있다.

**실측:** reflect 여부 · 마이크로태스크 타이밍 · light DOM/shadow 구분 표 · 선택 프롭의 부재와 `false` 가 같은 DOM · 순회형 헬퍼 가드 · ①의 export 조건
**추론(방침):** "우리가 소유한 계약을 단언한다" 원칙 · shadow 접근을 한 종류만 허용한다는 판단

새 `id` 가 필요하면 `consumer-testing-` 접두사를 쓴다.

- [ ] **Step 4: 검사와 커밋**

Task 1 Step 3 과 같은 명령을 돌린다. 그다음:

```bash
git add guide.html
git commit -F - <<'EOF'
docs(guide): 소비자가 테스트할 때 절을 더한다

dashboard-shell 이 이관 열 태스크에 걸쳐 실측으로 알아낸 것을 옮긴다.
vitest 의 export 조건이 첫 항목이다 — 그것을 모르면 프롭이 조용히
버려진 채로 테스트가 전부 초록이 된다.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 3: ② 보강과 ②-b — `Field` 항목을 고친다

**Files:**
- Modify: `guide.html` (React `Field` 절)

**Interfaces:**
- Consumes: 없음. Produces: 없음.

**② 보강 — "왜 두 번 기다려야 하나".** 지금 우리 설명은 *"`inputId` 가 안쪽 input 의 `id` 로 찍히는 시점이 한 마이크로태스크 뒤"* 인데, 소비자가 실측한 것은 그보다 **앞**이다. `render()` 직후 호스트에는 **`input-id` 속성조차 없다.**

기다려야 하는 단계가 **둘**이다.

1. `@lit/react` 가 `useLayoutEffect` 에서 프로퍼티를 세운다
2. 그다음 Lit 의 갱신이 마이크로태스크에서 돌아 안쪽 `<input>` 에 `id` 를 쓴다

그래서 `await findByLabelText` 가 필요하다. 이걸 적으면 "왜 한 번 기다려도 안 되나" 가 안 헷갈린다.

**②-b — `Field` 와 서버 컴포넌트.** 소비자가 실측한 것:

```
next dev      → <label for="…"> 는 있고 <input> 에 id 가 없다 → 하이드레이션 불일치
next build && next start → 같은 소스인데 id 가 정상적으로 들어간다
```

**메커니즘은 우리가 확정하지 못했다.** 소비자는 `cloneElement` 가 RSC 경계를 못 넘는 것으로 추정했는데, **이 패키지는 이미 `"use client"` 를 싣는다** — 확인했다:

```bash
git show v0.5.4:dist/react.js | head -1   # "use client";
```

`vite.config.ts` 가 배너를 주입하고 주석이 그 이유를 적고 있다. 그래서 소비자의 추정이 그 사실과 바로 맞지는 않는다.

**그러므로 메커니즘을 단정해 적지 않는다.** 적을 것은 관찰된 조건과 처방이다.

```html
  <p>
    <strong><code>Field</code> 는 클라이언트 컴포넌트 안에서 쓴다.</strong>
    <code>Field</code> 와 그 자식을 서버 컴포넌트가 만들어 넘기면
    <strong><code>next dev</code> 에서</strong> 자식에 <code>id</code> 가 실리지
    않아 <code>&lt;label for&gt;</code> 가 가리킬 것을 잃고 하이드레이션이 깨진다.
    <code>Field</code> 를 쓰는 파일에 <code>"use client"</code> 를 붙이면 없어진다.
  </p>
  <p>
    <strong>프로덕션 빌드에서는 나지 않는다</strong> — <code>next build</code> 로
    받은 마크업에는 <code>id</code> 가 정상적으로 들어간다. 그래서 배포된 화면의
    접근성이 깨지지는 않지만, <strong>잡을 수단도 사실상 없다</strong>:
    jsdom 테스트에는 RSC 경계가 없어 원리적으로 못 잡고 프로덕션 빌드도 정상이라
    CI 로도 못 잡는다. 개발 서버에서 사람이 하이드레이션 경고를 보는 것이
    유일한 감지 경로다.
  </p>
  <p>
    <strong>왜 dev 에서만 갈리는지는 우리도 확정하지 못했다.</strong> 위 증상은
    <code>dashboard-shell</code> 이 실제 앱에서 두 방식으로 받아 비교해 보고한
    것이고, 이 저장소에는 Next 앱이 없어 재현하지 못했다. 이 패키지의 React
    진입점은 <code>"use client"</code> 를 이미 싣고 있어서
    (<code>dist/react.js</code> 첫 줄), 경계 자체는 표시돼 있다.
  </p>
```

**"확정하지 못했다" 를 빼지 않는다.** 이 저장소는 확인한 것과 못 한 것을 나눠 적는다.

- [ ] **Step 1: `Field` 절을 찾아 읽는다**

```bash
cd /Users/neosimplix/coding/dashboard/common-ui
grep -n 'Field' guide.html | head -20
```

React `Field` 를 설명하는 절과, `ns-multi-select` 절의 수동 `.ns-field` 배선 예시를 **둘 다** 찾는다. 후자는 지금 소비자가 베끼면 `Field` 가 `inputId` 를 덮는 자리다.

- [ ] **Step 2: `Field` + 커스텀 엘리먼트 조합을 문서화한다**

`v0.5.4` 부터 `Field` 가 자식이 커스텀 엘리먼트 컨트롤이면 `id` 대신 `inputId` · `inputDescribedby` · `inputInvalid` 를 주입한다. 지금 `guide.html` 에는 이 조합 예시가 없어서, React 소비자가 순수 HTML 절의 수동 배선을 베낀다.

조합 예시를 넣는다.

```html
  <h3>커스텀 엘리먼트 자식</h3>
  <p>
    <code>ns-multi-select</code> 처럼 안쪽에 자기 입력을 그리는 컴포넌트도
    <code>Field</code> 로 감쌀 수 있다. 커스텀 엘리먼트는 labelable 이 아니라
    호스트에 <code>id</code> 를 얹어도 <code>&lt;label for&gt;</code> 가 닿지
    않으므로, <code>Field</code> 가 <code>inputId</code> 계열 프로퍼티로 안쪽
    컨트롤에 내려보낸다.
  </p>
```

그리고 코드 예시와 함께 **한계 둘**을 적는다.

- `Field` 는 소비자가 준 `inputId` 를 **덮는다.** 라벨과 컨트롤을 잇는 주체가 `Field` 라 id 를 자기가 정해야 한다. 안쪽 id 를 직접 정하려면 `Field` 를 쓰지 말고 수동 `.ns-field` 마크업을 쓴다
- 호스트에 `id` 를 줘도 **안전하다.** 그 id 는 호스트에 남고 안쪽 입력은 별도 id 를 받는다

- [ ] **Step 3: ② 보강과 ②-b 문단을 넣는다**

위에 준비한 문단들을 `Field` 절에 넣는다.

- [ ] **Step 4: 검사와 커밋**

Task 1 Step 3 과 같은 명령. 그다음:

```bash
git add guide.html
git commit -F - <<'EOF'
docs(guide): Field 의 커스텀 엘리먼트 조합과 서버 컴포넌트 제약을 적는다

두 번 기다려야 하는 이유(프로퍼티 설정 → Lit 갱신)를 밝히고,
next dev 에서만 나는 증상을 관찰된 조건으로만 적는다 — 메커니즘은
확정하지 못했고 그 사실을 함께 남긴다.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 4: ⑥ — `ns-sidebar` 가 여닫을 수 없는 상태를 경고한다

**Files:**
- Modify: `src/components/sidebar/ns-sidebar.ts`
- Modify: `docs/gotchas.md` (근거)
- Create(임시, 끝나면 삭제): `probe-sidebar-warn.html`

**Interfaces:**
- Consumes: 없음. Produces: 없음. 공개 API 가 바뀌지 않는다 — dev 경고 하나가 늘 뿐이다.

**결함.** `Sidebar` shim 이 `data-ns-open` 을 `open === true` 일 때만 렌더하므로, **`open` 을 통째로 안 넘긴 것과 `false` 를 넘긴 것이 DOM 에서 같다.** 소비자 테스트가 "닫혔을 때 속성이 없다" 만 단언하면 배선이 사라져도 통과한다. 소비자가 실제로 그 구멍을 만들었다가 최종 리뷰 직전에 잡았다.

**발동 조건 — 소비자 제안과 다르다. 이유가 있다.**

요청서의 원안("문서에 `ns-header` 토글이 있으면")은 교차 검사라 소비자도 철회했다. 회신의 대안은 *"`ns-toggle` 을 한 번 냈는데 그 뒤로도 `open` 이 설정된 적이 없으면"* 인데, **`ns-toggle` 은 `ns-header` 만 낸다**(`src/components/header/ns-header.ts:60`). 사이드바가 그것을 알려면 문서에서 버블링 이벤트를 주워야 하고, 그러면 철회한 교차 검사가 이름만 바꿔 돌아온다 — 어느 사이드바인지, 어느 헤더인지, upgrade 시점이 언제인지가 그대로 문제로 남는다.

**대신 자기 프로퍼티 둘만 본다.**

> `open` 도 `default-open` 도 주어지지 않았으면 경고한다.

그 사이드바는 `#isOpen` 이 `this.open ?? this.#innerOpen` 이고 둘 다 거짓이라 **영원히 닫혀 있고 열 방법이 없다.** 타이머도, 다른 컴포넌트도, 사용자 상호작용도 필요 없다.

**판정이 가능한 이유:** `open` 은 `@property({ attribute: false }) open?: boolean` 이라 안 주면 `undefined` 다. `defaultOpen` 은 `@property({ type: Boolean, attribute: "default-open" })` 이라 **속성의 존재 자체**가 신호다.

**시점이 핵심이다.** `connectedCallback` 이나 `firstUpdated` 에서 재면 **전부 거짓 양성**이다 — 같은 파일 `willUpdate` 위의 주석이 그 함정을 이미 적고 있다: *"`customElements.define` 이 `hydrateRoot` 보다 먼저 실행되므로 첫 업데이트의 마이크로태스크가 하이드레이션 커밋의 `useLayoutEffect` 보다 먼저 흘러가고, `@lit/react` 의 `createComponent` 는 반응형 프로퍼티를 그 `useLayoutEffect` 에서만 설정한다."* 그래서 **매크로태스크로 미룬다.**

- [ ] **Step 1: 기존 경고 헬퍼의 관례를 읽는다**

```bash
cd /Users/neosimplix/coding/dashboard/common-ui
cat src/internal/warn-property-only.ts
grep -rn 'console.warn' src/ | head
```

이 저장소는 dev 경고를 이미 여러 곳에서 쓴다. **문구 형식과 접두사(`[ns-sidebar]` 꼴)를 그대로 따른다.** 새 형식을 만들지 않는다.

- [ ] **Step 2: 경고를 넣는다**

`src/components/sidebar/ns-sidebar.ts` 의 `connectedCallback` 에 예약하고, 매크로태스크에서 판정한다. 분리될 때 취소한다.

```ts
  /** 여닫기 배선 경고 타이머. 분리되면 취소한다. */
  #wiringWarnTimer: ReturnType<typeof setTimeout> | undefined;
```

```ts
  override connectedCallback(): void {
    super.connectedCallback();
    warnIfTokensMissing();
    warnPropertyOnlyAttributes(this, { open: "default-open" });

    /*
      open 도 default-open 도 없으면 #isOpen 이 영원히 false 라 열 방법이 없다.
      거의 언제나 배선 실수다.

      매크로태스크로 미루는 이유는 이 파일의 willUpdate 주석과 같다 —
      @lit/react 는 반응형 프로퍼티를 useLayoutEffect 에서만 설정하고, 그것은
      첫 업데이트의 마이크로태스크보다 뒤에 온다. connectedCallback 이나
      firstUpdated 에서 재면 React 소비자가 전부 거짓 양성이 된다.

      판정에 다른 컴포넌트를 보지 않는다. ns-toggle 은 ns-header 만 내므로
      그것을 기다리면 "어느 헤더가 어느 사이드바를 겨냥하는가" 가 되살아난다.
      자기 프로퍼티 둘로 충분하다.
    */
    this.#wiringWarnTimer = setTimeout(() => {
      if (this.open === undefined && !this.hasAttribute("default-open")) {
        console.warn(
          "[ns-sidebar] open 도 default-open 도 없어 이 사이드바는 열 수 없습니다. " +
            "제어하려면 open 프로퍼티를, 비제어로 열어 두려면 default-open 속성을 씁니다.",
        );
      }
    }, 0);
  }

  override disconnectedCallback(): void {
    clearTimeout(this.#wiringWarnTimer);
    super.disconnectedCallback();
  }
```

**기존 `disconnectedCallback` 이 있으면 지우지 말고 그 안에 `clearTimeout` 을 더한다.** 먼저 확인한다.

- [ ] **Step 3: 프로브로 세 경우를 잰다 — 거짓 양성이 없어야 한다**

```bash
cd /Users/neosimplix/coding/dashboard/common-ui && npm run build
```

저장소 루트에 `probe-sidebar-warn.html` 을 만든다. `dist/bundle.umd.js` 를 쓴다.

```html
<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<link rel="stylesheet" href="./dist/tokens.css"><link rel="stylesheet" href="./dist/controls.css">
</head><body>
<ns-sidebar id="a"></ns-sidebar>
<ns-sidebar id="b" default-open></ns-sidebar>
<ns-sidebar id="c"></ns-sidebar>
<pre id="out"></pre>
<script src="./dist/bundle.umd.js"></script>
<script type="module">
const warns = [];
const orig = console.warn;
console.warn = (...a) => { warns.push(a.join(" ")); orig(...a); };
try {
  await customElements.whenDefined("ns-sidebar");
  // c 는 React 소비자를 흉내낸다 — 정의 뒤에 프로퍼티로 open 을 세운다.
  document.getElementById("c").open = false;
  await new Promise((r) => setTimeout(r, 50));
  const only = (id) => warns.filter((w) => w.includes("[ns-sidebar]") && w.includes("열 수 없습니다")).length;
  document.getElementById("out").textContent = JSON.stringify({
    총경고수: warns.filter((w) => w.includes("열 수 없습니다")).length,
    a_속성없음_경고나야함: true,
    b_defaultOpen_경고나면안됨: true,
    c_open세움_경고나면안됨: true,
    전체: warns,
  }, null, 1);
} catch (e) { document.getElementById("out").textContent = "ERR " + e; }
</script>
</body></html>
```

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless \
  --allow-file-access-from-files --virtual-time-budget=6000 \
  --dump-dom "file://$PWD/probe-sidebar-warn.html" 2>/dev/null \
  | grep -o '<pre id="out">[^<]*' | sed 's/<pre id="out">//'
```

Expected: `총경고수` 가 **1** 이다. `a` 하나만 경고하고 `b`(`default-open` 있음)와 `c`(나중에 `open` 을 세움)는 조용해야 한다.

**`c` 가 이 태스크의 핵심 검사다.** 거기서 경고가 나면 시점이 너무 이른 것이고, React 소비자 전체가 거짓 양성을 받는다 — 그러면 경고가 소음이 되어 아무도 안 읽는다. `총경고수` 가 2 이상이면 멈추고 보고한다.

- [ ] **Step 4: 검사를 실패시켜 본다**

경고 조건을 잠시 뒤집어(`if (this.open !== undefined …)`) 프로브를 다시 돌려 **다른 결과가 나오는지** 확인한다. 같은 결과가 나오면 프로브가 아무것도 재지 않는 것이다. 확인 후 되돌린다.

- [ ] **Step 5: `docs/gotchas.md` 에 근거를 남긴다**

파일 끝에 절을 더한다. 담을 것:

- 결함: shim 이 `open === true` 일 때만 속성을 내므로 **부재와 `false` 가 같은 DOM** 이다. 음성 단언만 둔 소비자 테스트가 배선이 사라져도 통과한다
- 조건을 자기 프로퍼티 둘로 잡은 이유, 그리고 **교차 검사 두 안을 왜 버렸는지** — 원안(`ns-header` 존재)과 대안(`ns-toggle` 수신) 둘 다 "어느 헤더가 어느 사이드바를 겨냥하는가" 를 풀지 못한다. `ns-toggle` 은 `ns-header` 만 낸다
- **시점을 매크로태스크로 미룬 이유** — `@lit/react` 가 `useLayoutEffect` 에서 프로퍼티를 세우고 그것이 첫 업데이트의 마이크로태스크보다 뒤에 온다. 같은 파일 `willUpdate` 주석이 이미 그 함정을 적고 있고, 이것은 그 함정의 **두 번째 피해자**다
- 프로브의 `c` 케이스가 왜 진짜 바인지 — 거짓 양성이 나면 경고가 소음이 된다

- [ ] **Step 6: 정리·검사·커밋**

```bash
cd /Users/neosimplix/coding/dashboard/common-ui
rm -f probe-sidebar-warn.html
npm run check
git status --short
```

Expected: `check` 5/5. `git status` 에 `src/components/sidebar/ns-sidebar.ts` 와 `docs/gotchas.md` 둘만.

```bash
git add src/components/sidebar/ns-sidebar.ts docs/gotchas.md
git commit -F - <<'EOF'
feat(sidebar): 여닫을 수 없는 배선을 dev 경고로 알린다

open 도 default-open 도 없으면 영원히 닫혀 있고 열 방법이 없다. 판정은
자기 프로퍼티 둘만 본다 — ns-toggle 을 기다리면 어느 헤더가 어느
사이드바를 겨냥하는가가 되살아난다. 시점은 매크로태스크로 미룬다.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 5: v0.5.5 릴리스 기록

**Files:**
- Modify: `changelog.html` (절 + 사이드바 nav 항목)
- Modify: `README.md` (릴리스 표 행)

**Interfaces:**
- Consumes: Task 1~4. Produces: 없음.

**셋을 함께 만든다** — 절, nav 항목, README 행. `v0.5.3` 에서 nav 를 빼먹어 리뷰에 잡혔고, `v0.5.4` 에서 반복하지 않았다. 여기서도 반복하지 않는다.

- [ ] **Step 1: 기존 절의 모양을 읽는다**

```bash
cd /Users/neosimplix/coding/dashboard/common-ui
grep -n 'id="v0-5-4"\|href="#v0-5-4"' changelog.html
grep -n 'v0-5-4' README.md
```

- [ ] **Step 2: 절을 쓴다**

`<h2 id="v0-5-4">` **앞**에 넣는다. 버전은 `0.5.5`.

`dist/` 는 **변경**이다 — ⑥이 소스를 바꾼다. **breaking 은 없다.**

담을 것:

- **`ns-sidebar` 가 여닫을 수 없는 배선을 경고한다** (⑥). `open` 도 `default-open` 도 없으면 dev 콘솔에 경고. **동작은 안 바뀐다** — 경고만 는다
- **문서가 크게 늘었다** — 「소비자가 테스트할 때」 절, 프로퍼티 표의 `reflect` 칸, `Field` 의 커스텀 엘리먼트 조합과 서버 컴포넌트 제약
- 문서 절의 출처가 `dashboard-shell` 이관 경험이라는 것

- [ ] **Step 3: nav 항목과 README 행**

```html
      <ns-nav-item href="#v0-5-5" label="v0.5.5" active></ns-nav-item>
      <ns-nav-item href="#v0-5-4" label="v0.5.4"></ns-nav-item>
```

`v0.5.4` 의 `active` 를 뗀다. 그룹 안에 `active` 는 정확히 하나다.

README 릴리스 표에 행을 더한다(기존 `v0.5.4` 행 **위**).

- [ ] **Step 4: 검사와 커밋**

```bash
cd /Users/neosimplix/coding/dashboard/common-ui
npm run check
grep -c 'href="#v0-5-5"' changelog.html          # 1
grep -c 'active></ns-nav-item>' changelog.html   # 1
for f in index.html guide.html changelog.html; do
  echo "— $f"; grep -c '<script>' "$f"
  grep -n '</script>' "$f" | grep -v -E ':\s*</script>\s*$' | grep -v '<script src='
  grep -n 'document.addEventListener' "$f"
  grep -oE '(^|[[:space:]])id="[^"]*"' "$f" | sed -E 's/.*id="([^"]*)"/\1/' | sort | uniq -d
done
git status --short
```

Expected: `check` 5/5(릴리스 표 대조에 `v0.5.5` 가 나타난다), nav 1개, `active` 1개, 구조 검사 0/1/1.

```bash
git add changelog.html README.md
git commit -F - <<'EOF'
docs(changelog): v0.5.5 절과 릴리스 표 행을 더한다

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

## 이 계획이 끝난 뒤 (조정자가 한다)

- **사람 눈이 필요한 것을 사용자에게 직접 보고한다.** 파일에 모으지 않는다.
  - `guide.html` 이 정상 렌더되는지 — 이번엔 문서가 많이 늘어 표와 새 절의 레이아웃을 봐야 한다
  - 경고 문구가 실제 콘솔에서 읽을 만한지
- **`npm run release -- 0.5.5`** — `releasing` 스킬을 따르고 자른 뒤 검사 셋을 돌린다. **첫 검사의 패턴은 `onNs[A-Za-z]+\??:` 로 넓혀져 있다**(`v0.5.4` 에서 오탐이 나 고쳤다).
- **`dashboard-shell` 에 회신한다.** 담을 것: ⑥의 조건이 그쪽 제안과 다른 이유(`ns-toggle` 은 `ns-header` 만 낸다), `useLayoutEffect` 숫자가 갈린 원인(미니파이로 줄 수 ≠ 출현 수), ②-b 의 `"use client"` 확인과 판별 질문(자식 JSX 가 `Field` 와 같은 파일인가 서버가 만들어 넘기는가).
