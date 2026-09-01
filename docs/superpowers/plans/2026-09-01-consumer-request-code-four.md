# `dashboard-shell` 요청서 코드 항목 넷 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `dashboard-shell` 수정요청서의 코드 항목 넷(④②③⑧)을 고쳐 태그를 자른다. 문서 항목(①⑤⑦⑨)과 설계가 남은 ⑥은 이 계획에 없다.

**Architecture:** 넷이 서로 얽히는 지점은 하나다 — ②(`Field` 분기)가 ③(`inputInvalid`)이 만든 프로퍼티 이름을 쓴다. 그래서 ③을 먼저 하고 ②가 뒤에 온다. ④와 ⑧은 독립이다.

**Tech Stack:** Lit 3 · React 18/19 shim(`@lit/react`) · TypeScript. 테스트 러너 없음(설계 결정). 회귀 확인은 `npm run check`(소비자 관점 타입 검사 포함)와 헤드리스 브라우저 프로브다.

**근거 문서:** `dashboard-shell` 이 보낸 수정요청서(`common-ui-수정요청서.md`)와
그에 대한 답변(`common-ui-수정요청서-답변.md`)이 이 계획의 spec 이다. 둘 다 이
저장소 밖, 그 작업의 세션 스코프 스크래치패드에만 있었다 — 세션이 끝나면 사라지는
경로라 여기 옮겨 적지 않는다. 이 계획과 각 Task 의 서술이 그 내용을 담아 옮긴다.

## Global Constraints

- **테스트 러너를 추가하지 않는다.** vitest·jest·playwright·web-test-runner 금지, 테스트 파일도 만들지 않는다. (`.claude/rules/verification.md`)
- **커밋 메시지:** `<type>(<scope>): <subject>` — subject 는 한국어 명령조, 마침표 없음. 트레일러 `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.
- **`git push` 는 하지 않는다.** 로컬 커밋까지만. 태그는 조정자가 자른다.
- **커스텀 프로퍼티·속성 이름은 `--ns-` / `ns-` 접두사 규칙을 따른다.** 소비자가 쓰는 훅 속성은 `data-ns-`.
- **`title` 과 `key` 를 속성/프로퍼티 이름으로 쓰지 않는다.**
- **제어 중이면 그 값을 바꾸지 않는다.** 제어는 프로퍼티 전용(`attribute: false`), 비제어 초기값은 별도 속성.
- **로직과 스타일을 파일 두 개로 나눈다.** Light DOM 컴포넌트는 `static styles` 를 갖지 않는다 — 스타일은 `controls.css` 에 있다.
- **`invalid` 는 클래스가 아니라 `[aria-invalid="true"]` 로 스타일한다.** `--invalid` 변형 클래스를 만들지 않는다.
- **문서 페이지 셋에 리터럴 색을 쓰지 않고, 산문에 스크립트 태그를 리터럴로 쓰지 않는다.**
- **이 계획은 `guide.html` 의 사용 서술을 손대지 않는다.** 문서 작업은 별건으로 분리됐다. 예외는 Task 5 의 릴리스 기록(`changelog.html`·`README.md`)뿐이다 — 그것은 태그를 자르기 위한 필수 절차다(`check-controls.mjs` 가 강제한다).

---

### Task 1: ④ `Input`·`Textarea`·`Select` 의 `aria-invalid` 를 rest 뒤에서 합친다

**Files:**
- Modify: `src/react/controls/Input.tsx`
- Modify: `src/react/controls/Textarea.tsx`
- Modify: `src/react/controls/Select.tsx`
- Modify: `docs/consumer-example.tsx` (소비자 관점 검사에 이 경로를 추가)

**Interfaces:**
- Consumes: 없음.
- Produces: 없음. `InputProps`·`TextareaProps`·`SelectProps` 의 공개 타입도, `Field` 안에서 나오는 `aria-invalid` 값도 바뀌지 않는다. 바뀌는 것은 **소비자가 `aria-invalid` 를 직접 넘긴 경우** 하나다 — 그때 컴포넌트의 `invalid` 가 더 이상 무력화되지 않는다.

**왜 이 순서가 문제인가.** 세 컨트롤 모두 지역 `aria-invalid` 를 계산한 **뒤** `{...rest}` 를 편다. `Field` 가 `showError` 일 때 `cloneElement` 로 `aria-invalid: true` 를 주입하는데(`src/react/controls/Field.tsx:47`), 그것이 `rest` 에 실려 지역 값을 덮는다.

**이 수정은 동작을 바꾸지 않는다. 순서의 취약함을 없앨 뿐이다.** 실행으로 확인한 사실이고, 구현자가 이것을 알고 시작해야 한다.

`Field` 는 `showError` 일 때 **`true` 만** 주입하므로 `false || true` 는 `true` 다 — 오류가 이긴다. 그것은 **의도된 동작이다**(오류가 있는 필드의 컨트롤은 invalid 다). 요청서는 "`invalid` 를 넘기든 말든 차이가 없다" 를 결함으로 들었는데, 진단은 맞지만 **OR 병합으로도 그 상황은 바뀌지 않는다.** 사용자가 (가)안 — "오류가 이긴다" 를 유지 — 을 골랐다.

그래서 이 태스크가 실제로 얻는 것은 하나다: **남의 prop 이 지역 계산을 조용히 덮는 순서를 없앤다.** 지금은 소비자가 `aria-invalid` 를 직접 넘기면 컴포넌트의 `invalid` 프롭이 근거 없이 무력화된다. 고친 뒤에는 둘 중 하나라도 참이면 invalid 다.

**`Field` 안의 동작이 안 바뀌는 것이 정상이다.** 프로브가 그것을 증명하는 데 쓰인다(Step 6).

- [ ] **Step 1: 지금 상태를 확인한다 (셋 다 같은 순서인지)**

```bash
cd /Users/neosimplix/coding/dashboard/common-ui
grep -n -A3 'aria-invalid={invalid' src/react/controls/Input.tsx src/react/controls/Textarea.tsx src/react/controls/Select.tsx
```

Expected: 세 파일 모두 `aria-invalid={invalid || undefined}` 가 있고 그 **뒤에** `{...rest}` 가 온다. `Select.tsx` 는 사이에 `value`·`defaultValue` 가 끼어 있다. 셋 중 하나라도 이미 rest 가 앞이면 멈추고 보고한다.

- [ ] **Step 2: `Input.tsx` 를 고친다**

`src/react/controls/Input.tsx` 의 `return` 을 이렇게 바꾼다.

```tsx
  return (
    <input
      className={cx("ns-input", className)}
      {...rest}
      /*
        rest 를 먼저 펴고 aria-invalid 를 뒤에서 합친다. 지역 계산이 먼저 오면
        남이 넘긴 aria-invalid 가 그것을 조용히 덮어, 이 컴포넌트의 invalid
        프롭이 근거 없이 무력화된다. 이제 둘 중 하나라도 참이면 invalid 다.

        Field 안의 동작은 이 변경으로 바뀌지 않는다 — Field 는 error 일 때
        true 만 주입하므로 오류가 계속 이긴다. 그것이 의도된 동작이다:
        오류가 있는 필드의 컨트롤은 invalid 다.

        false 를 넘기면 aria-invalid="false" 가 남는다. 없는 것과 다른 뜻이므로
        undefined 로 떨어뜨린다.
      */
      aria-invalid={invalid || rest["aria-invalid"] || undefined}
    />
  );
```

- [ ] **Step 3: `Textarea.tsx` 를 고친다**

`rows` 는 호출부가 덮을 수 있어야 하므로 **`rest` 보다 앞**에 남는다. `aria-invalid` 만 뒤로 옮긴다.

```tsx
  return (
    <textarea
      className={cx("ns-textarea", className)}
      rows={rows}
      {...rest}
      // 순서의 이유는 Input.tsx 에 있다. 세 컨트롤이 같은 처치를 받는다.
      aria-invalid={invalid || rest["aria-invalid"] || undefined}
    />
  );
```

- [ ] **Step 4: `Select.tsx` 를 고친다**

`value`·`defaultValue` 는 지역 계산이 이겨야 한다(제어/비제어 판정이 거기서 나온다). 그대로 두고 `aria-invalid` 만 뒤로 옮긴다.

```tsx
  return (
    <select
      className={cx("ns-select", className)}
      value={value}
      defaultValue={resolvedDefaultValue}
      {...rest}
      // 순서의 이유는 Input.tsx 에 있다. 세 컨트롤이 같은 처치를 받는다.
      aria-invalid={invalid || rest["aria-invalid"] || undefined}
    >
```

**`Select` 는 요청서가 지목하지 않았다.** 답변을 쓰다가 같은 패턴을 나머지 컨트롤에 대 보고 찾았다. `Textarea.tsx` 의 주석이 *"props·클래스 구성·invalid 처리를 일부러 똑같이 맞춘다"* 고 적고 있어서 둘만 고치면 그 약속이 `Select` 쪽에서 깨진다.

- [ ] **Step 5: 소비자 관점 검사에 이 경로를 추가한다**

`docs/consumer-example.tsx` 를 읽고 기존 관례를 따라 아래 네 조합을 추가한다. **이 파일은 `npm run check` 의 두 번째 단계(`tsconfig.consumer.json`)가 타입 검사하므로, 타입이 통과하는지가 바다.** 런타임 단언은 이 저장소에 없다.

```tsx
/*
  ④ 회귀 바: Field.error 와 자식의 invalid 가 서로를 죽이지 않는지.
  타입 검사만으로는 aria-invalid 의 계산 결과를 볼 수 없으므로, 여기서는
  네 조합이 전부 컴파일되는 것까지가 이 파일의 몫이다. 병합 결과는
  Step 6 의 프로브가 본다.
*/
<Field label="이름" error="필수입니다"><Input invalid={false} /></Field>;
<Field label="이름"><Input invalid /></Field>;
<Field label="메모" error="필수입니다"><Textarea invalid={false} /></Field>;
<Field label="분류" error="필수입니다"><Select options={[]} invalid={false} /></Field>;
```

- [ ] **Step 6: 프로브로 「무엇이 바뀌고 무엇이 안 바뀌는지」를 잰다**

**이 단계를 건너뛰지 않는다.** 타입 검사는 `aria-invalid` 의 최종 값을 보지 못하고, 이 태스크는 **동작이 안 바뀌는 것을 증명해야 하는** 드문 경우다.

React 를 브라우저에서 돌리는 하네스가 이 저장소에 없으므로, 병합 지점만 떼어내 잰다. 저장소 루트에 `probe-invalid.mjs`:

```js
// 현재: 지역 계산 먼저, rest 뒤 → rest 가 이긴다
const now = (i, r) => ({ "aria-invalid": i || undefined, ...r })["aria-invalid"];
// 고친 뒤: rest 먼저, 병합을 뒤에
const fixed = (i, r) => ({ ...r, "aria-invalid": (i || r["aria-invalid"]) || undefined })["aria-invalid"];

// Field 는 showError 일 때만, 그리고 항상 true 를 주입한다 (Field.tsx:47)
const FIELD_ERROR = { "aria-invalid": true };
const FIELD_OK = {};

const cases = [
  ["Field error + invalid={false}",              false, FIELD_ERROR, "같아야 한다"],
  ["Field error + invalid 안 넘김",               false, FIELD_ERROR, "같아야 한다"],
  ["Field error + invalid={true}",               true,  FIELD_ERROR, "같아야 한다"],
  ["Field 정상 + invalid={true}",                true,  FIELD_OK,    "같아야 한다"],
  ["Field 정상 + invalid={false}",               false, FIELD_OK,    "같아야 한다"],
  ["invalid={true} + aria-invalid={false} 직접", true,  { "aria-invalid": false }, "달라야 한다"],
];
let bad = 0;
for (const [label, i, r, expect] of cases) {
  const a = now(i, r), b = fixed(i, r);
  const same = a === b;
  const ok = expect === "같아야 한다" ? same : !same;
  if (!ok) bad++;
  console.log(`${ok ? "OK  " : "FAIL"} ${label.padEnd(38)} 현재=${String(a).padEnd(10)} 고친뒤=${String(b).padEnd(10)} (${expect})`);
}
console.log(bad === 0 ? "\n전부 기대대로다." : `\n${bad} 건이 기대와 다르다.`);
process.exit(bad === 0 ? 0 : 1);
```

```bash
node probe-invalid.mjs; echo "exit=$?"
```

Expected: 여섯 줄 전부 `OK`, `exit=0`.

**마지막 줄이 이 태스크의 유일한 실제 변화다** — 소비자가 `aria-invalid` 를 직접 넘겨 컴포넌트의 `invalid` 를 무력화하던 것이 막힌다. **앞의 다섯 줄이 「같아야 한다」인 것도 바다** — `Field` 안의 동작을 바꾸지 않았음을 증명한다. 앞의 다섯 중 하나라도 `FAIL` 이면 **동작을 바꿔 버린 것이므로** 멈추고 보고한다.

끝나면 `rm -f probe-invalid.mjs`.

- [ ] **Step 7: `npm run check` 와 커밋**

```bash
cd /Users/neosimplix/coding/dashboard/common-ui
rm -f probe-invalid.mjs
npm run check
git status --short
```

Expected: `check` 5/5. `git status` 에 네 파일만.

```bash
git add src/react/controls/Input.tsx src/react/controls/Textarea.tsx src/react/controls/Select.tsx docs/consumer-example.tsx
git commit -F - <<'EOF'
refactor(react): 컨트롤 셋의 aria-invalid 를 rest 뒤에서 합친다

지역 계산이 rest 보다 앞이라 소비자가 aria-invalid 를 직접 넘기면
컴포넌트의 invalid 프롭이 근거 없이 무력화됐다. Field 안의 동작은
바뀌지 않는다 — Field 는 true 만 주입하므로 오류가 계속 이긴다.
요청서가 지목한 Input·Textarea 에 Select 를 더해 셋을 함께 고친다.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 2: ③ `ns-multi-select` 에 `inputInvalid` 를 더한다

**Files:**
- Modify: `src/components/multi-select/ns-multi-select.ts`
- Modify: `docs/consumer-example.tsx`

**Interfaces:**
- Consumes: 없음.
- Produces: **Task 3 이 이 이름을 쓴다.** 공개 프로퍼티 `inputInvalid: boolean`, 속성 `input-invalid`. 안쪽 검색 `input` 에 `aria-invalid="true"` 를 세운다(거짓일 때는 속성을 내지 않는다).

**지금 상태.** 공개 프로퍼티는 일곱이다 — `options`·`value`·`defaultValue`·`searchPlaceholder`·`emptyMessage`·`inputId`·`inputDescribedby`. (요청서는 여덟이라 했는데 `query` 는 `ns-multi-select.ts:89` 의 `@state() private` 다.) 오류 문구는 `inputDescribedby` 로 이을 수 있지만 **안쪽 input 에 `aria-invalid` 를 세울 방법이 없다.**

- [ ] **Step 1: 기존 `inputId`·`inputDescribedby` 의 선언과 사용을 읽는다**

```bash
cd /Users/neosimplix/coding/dashboard/common-ui
grep -n 'inputId\|inputDescribedby' src/components/multi-select/ns-multi-select.ts
```

두 프로퍼티가 **어떻게 선언되고 템플릿에서 어떻게 쓰이는지** 확인한다. 새 프로퍼티는 그 관례를 그대로 따른다 — 선언 위치, 속성 이름 짓기, 템플릿에서 거짓 값을 떨어뜨리는 방식까지.

- [ ] **Step 2: 프로퍼티를 선언한다**

`inputDescribedby` 선언 **바로 아래**에 넣는다.

```ts
  /**
   * 안쪽 검색 `input` 의 `aria-invalid`.
   *
   * 호스트가 아니라 안쪽 input 이 받아야 하는 이유는 `inputId` 와 같다 —
   * 커스텀 엘리먼트는 labelable 이 아니고, 보조기술이 보는 컨트롤은 안쪽
   * input 이다. `controls.css` 가 invalid 를 `[aria-invalid="true"]` 로만
   * 잡으므로 이 이름이 스타일 훅도 겸한다.
   */
  @property({ type: Boolean, attribute: "input-invalid" }) inputInvalid = false;
```

- [ ] **Step 3: 템플릿에서 안쪽 input 에 싣는다**

`render()` 의 검색 `input` 을 찾아 `aria-invalid` 를 더한다. **거짓일 때 속성이 남지 않게 한다** — `aria-invalid="false"` 는 없는 것과 다른 뜻이다. `inputId`·`inputDescribedby` 가 거짓 값을 어떻게 떨어뜨리는지 보고 같은 방식을 쓴다(Lit 은 `nothing` 또는 `?attr=` 를 쓴다 — 이 파일의 기존 관례를 따른다).

- [ ] **Step 4: 소비자 관점 검사에 추가한다**

`docs/consumer-example.tsx` 에 넣는다.

```tsx
// ③ 회귀 바: 안쪽 input 의 aria-invalid 를 세울 통로가 있는지.
<NsMultiSelect options={[]} value={[]} inputInvalid />;
```

- [ ] **Step 5: 프로퍼티가 정말 안쪽 input 에 도달하는지 잰다**

저장소 루트에 프로브를 만든다. `dist/bundle.umd.js` 를 쓴다 (ES 빌드는 lit 을 external 로 두어 브라우저에서 해석 실패).

```bash
cd /Users/neosimplix/coding/dashboard/common-ui && npm run build
```

```html
<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<link rel="stylesheet" href="./dist/tokens.css"><link rel="stylesheet" href="./dist/controls.css">
</head><body>
<ns-multi-select id="ms" input-invalid input-id="ms-input"></ns-multi-select>
<pre id="out"></pre>
<script src="./dist/bundle.umd.js"></script>
<script type="module">
try {
  await customElements.whenDefined("ns-multi-select");
  const el = document.getElementById("ms");
  el.options = [{ value: "a", label: "가" }];
  await el.updateComplete;
  const input = el.querySelector("input");   // Light DOM 이라 shadowRoot 가 아니다
  document.getElementById("out").textContent = JSON.stringify({
    prop: el.inputInvalid,
    inputAriaInvalid: input && input.getAttribute("aria-invalid"),
    inputId: input && input.id,
  });
  // 거짓으로 되돌리면 속성이 사라지는가
  el.inputInvalid = false;
  await el.updateComplete;
  document.getElementById("out").textContent += "\n" + JSON.stringify({
    afterFalse: input && input.getAttribute("aria-invalid"),
  });
} catch (e) { document.getElementById("out").textContent = "ERR " + e; }
</script>
</body></html>
```

파일 이름은 `probe-msinvalid.html`. 돌린다:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless \
  --allow-file-access-from-files --virtual-time-budget=6000 \
  --dump-dom "file://$PWD/probe-msinvalid.html" 2>/dev/null \
  | grep -o '<pre id="out">[^<]*' | sed 's/<pre id="out">//'
```

Expected: `prop: true`, `inputAriaInvalid: "true"`, `inputId: "ms-input"`, 그리고 둘째 줄의 `afterFalse: null`.

`afterFalse` 가 `"false"` 로 남으면 Step 3 의 거짓 값 처리가 틀렸다.

끝나면 `rm -f probe-msinvalid.html`.

- [ ] **Step 6: `npm run check` 와 커밋**

```bash
cd /Users/neosimplix/coding/dashboard/common-ui
rm -f probe-msinvalid.html
npm run check
git status --short
git add src/components/multi-select/ns-multi-select.ts docs/consumer-example.tsx
git commit -F - <<'EOF'
feat(multi-select): 안쪽 input 의 aria-invalid 를 세우는 inputInvalid 를 더한다

inputId·inputDescribedby 와 짝을 맞춘다. 호스트가 아니라 안쪽 input 이
받아야 하는 이유도 그 둘과 같다 — 보조기술이 보는 컨트롤이 그것이다.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 3: ② `Field` 가 커스텀 엘리먼트 자식에 프로퍼티로 주입한다

**Files:**
- Modify: `src/react/elements.ts` (`NsMultiSelect` 에 정적 마커를 붙인다)
- Modify: `src/react/controls/Field.tsx` (마커를 읽어 분기)
- Modify: `docs/consumer-example.tsx`

**Interfaces:**
- Consumes: **Task 2 의 `inputInvalid`.** 마커의 `invalid` 값이 정확히 그 이름이어야 한다.
- Produces: `NsMultiSelect` 에 정적 프로퍼티 `nsFieldControl: { id: string; describedby: string; invalid: string }` 가 붙는다. 앞으로 `Field` 와 조합해야 하는 커스텀 엘리먼트 래퍼는 같은 마커를 갖는다.

**왜 이 방식인가.** `Field` 는 `cloneElement` 로 자식에 `id` 를 얹지만 커스텀 엘리먼트는 labelable 이 아니라 `<label for>` 이 아무것도 가리키지 못한다. 안쪽 input 에 닿는 통로는 `inputId` 다.

**태그 이름의 하이픈으로 판별할 수 없다.** `@lit/react` 의 `createComponent` 는 `React.forwardRef(...)` 를 반환하므로 `element.type` 이 **문자열이 아니라 객체**다. `<NsMultiSelect/>` 를 쓰는 요청서의 실패 경우가 정확히 그것이다. 그래서 **래퍼에 정적 마커를 달고 `Field` 가 그것을 읽는다** — `Field` 는 어떤 래퍼도 import 하지 않으므로 새 컨트롤이 생겨도 `Field` 를 고치지 않는다.

- [ ] **Step 1: `elements.ts` 의 `NsMultiSelect` 에 마커를 붙인다**

`src/react/elements.ts` 의 `export const NsMultiSelect = createComponent({...});` 를 이렇게 바꾼다.

```ts
/*
  Field 가 이 래퍼를 만났을 때 무엇을 주입해야 하는지 여기 적는다. Field 는
  래퍼를 import 하지 않고 element.type 에서 이 값을 읽으므로, 새 커스텀
  엘리먼트 컨트롤이 생겨도 Field 를 고치지 않는다 — 지식이 래퍼 옆에 남는다.

  하이픈으로 판별할 수 없기 때문에 마커가 필요하다. createComponent 는
  forwardRef 객체를 반환하므로 element.type 이 문자열이 아니다.

  describedby 가 오류 id 까지 받는다. ns-multi-select 에는 aria-errormessage
  의 짝이 없고, 그 속성은 스크린리더 지원이 고르지 않아 describedby 가 오혀
  더 안정적으로 읽힌다 — 네이티브 경로와 생기는 속성이 달라지는 것은 의도다.
*/
export const NsMultiSelect = Object.assign(
  createComponent({
    react: React,
    tagName: "ns-multi-select",
    elementClass: NsMultiSelectElement,
    events: {
      // EventName<> 브랜딩이 없으면 핸들러가 (e: Event) => void 로 타입된다.
      onNsMultiSelectChange:
        "ns-multi-select-change" as EventName<CustomEvent<NsMultiSelectChangeDetail>>,
    },
  }),
  {
    nsFieldControl: {
      id: "inputId",
      describedby: "inputDescribedby",
      invalid: "inputInvalid",
    } as const,
  },
);
```

**기존 주석을 지우지 않는다.** 그 `createComponent` 호출 위에 이미 주석이 있으면 그대로 둔 위에 이것을 더한다.

- [ ] **Step 2: `Field.tsx` 가 마커를 읽어 분기한다**

`src/react/controls/Field.tsx` 를 읽는다. 현재 `ControlProps` 타입과 `ariaProps` 를 만드는 블록(대략 `:38-52`)이 대상이다.

마커 타입을 파일 안에 선언한다 — `elements.ts` 를 import 하지 않는다(그러면 이 파일이 모든 래퍼를 끌고 온다).

```ts
/**
 * 커스텀 엘리먼트 래퍼가 자기 옆에 달아 두는 주입 지도. `elements.ts` 가
 * 세우고 이 파일이 읽는다 — 여기서 래퍼를 import 하지 않기 위한 형태다.
 */
type NsFieldControl = { id: string; describedby: string; invalid: string };
```

그리고 `ariaProps` 를 만드는 곳을 이렇게 바꾼다.

```ts
    // cloneElement 는 값이 undefined 인 키도 그대로 얹어 기존 prop 을 지운다.
    // 그래서 필요한 키만 골라 넣는다.
    const marker = (element.type as { nsFieldControl?: NsFieldControl })?.nsFieldControl;

    const ariaProps: Record<string, unknown> = {};
    if (marker) {
      /*
        커스텀 엘리먼트는 labelable 이 아니라 호스트에 id 를 얹어도 label 의
        for 가 아무것도 가리키지 못한다. 래퍼가 알려준 이름으로 안쪽 컨트롤에
        내려보낸다 — 그러면 label for 가 그 안쪽 input 을 가리킨다.
      */
      ariaProps[marker.id] = controlId;
      if (showHint) ariaProps[marker.describedby] = hintId;
      if (showError) {
        // aria-errormessage 의 짝이 없어 오류 id 도 describedby 로 간다.
        ariaProps[marker.describedby] = errorId;
        ariaProps[marker.invalid] = true;
      }
    } else {
      ariaProps.id = controlId;
      if (showHint) ariaProps["aria-describedby"] = hintId;
      if (showError) {
        ariaProps["aria-errormessage"] = errorId;
        ariaProps["aria-invalid"] = true;
      }
    }

    control = cloneElement(element, ariaProps);
```

**`controlId` 를 정하는 기존 줄을 건드리지 않는다** — `element.props.id ?? id` 는 네이티브 경로에서 여전히 맞다. 커스텀 경로에서 소비자가 `inputId` 를 직접 준 경우까지 존중할지는 이 태스크의 범위가 아니다. 그 경우 `Field` 가 덮어쓰며, **그 사실을 주석으로 남긴다.**

- [ ] **Step 3: 소비자 관점 검사에 추가한다**

`docs/consumer-example.tsx` 에 넣는다.

```tsx
// ② 회귀 바: 같은 패키지의 두 export 가 조합되는지.
<Field label="담당자"><NsMultiSelect options={[]} value={[]} /></Field>;
<Field label="담당자" error="필수입니다"><NsMultiSelect options={[]} value={[]} /></Field>;
```

- [ ] **Step 4: 프로브로 실제 DOM 을 잰다**

`Field` 는 React 컴포넌트라 브라우저 프로브로 직접 렌더할 수 없다. **대신 마커 배선이 끊기지 않았는지를 잰다** — 그것이 이 태스크의 유일한 새 실패 지점이다. 저장소 루트에 `probe-marker.mjs`:

```js
import { NsMultiSelect } from "./dist/react.js";
const m = NsMultiSelect.nsFieldControl;
console.log(JSON.stringify({
  hasMarker: Boolean(m),
  map: m,
  // Task 2 가 만든 이름과 일치하는가 — 여기가 어긋나면 조용히 안 먹는다.
  matchesTask2: m?.invalid === "inputInvalid",
}));
```

```bash
cd /Users/neosimplix/coding/dashboard/common-ui && npm run build && node probe-marker.mjs
```

Expected: `hasMarker: true`, `matchesTask2: true`, `map` 의 세 값이 `inputId`·`inputDescribedby`·`inputInvalid`.

**`dist/react.js` 를 Node 에서 import 하는 것이 되는지 먼저 확인한다.** 안 되면(react 를 못 찾는 등) `dist/react/elements.js` 를 직접 보거나, 그것도 안 되면 **프로브 대신 `grep` 으로 마커가 산출물에 실렸는지 확인하고 그 사실을 보고서에 적는다** — 못 한 확인을 했다고 적지 않는다.

끝나면 `rm -f probe-marker.mjs`.

- [ ] **Step 5: `npm run check` 와 커밋**

```bash
cd /Users/neosimplix/coding/dashboard/common-ui
rm -f probe-marker.mjs
npm run check
git status --short
git add src/react/elements.ts src/react/controls/Field.tsx docs/consumer-example.tsx
git commit -F - <<'EOF'
fix(react): Field 가 커스텀 엘리먼트 자식에 프로퍼티로 주입한다

커스텀 엘리먼트는 labelable 이 아니라 호스트에 id 를 얹어도 label for 가
닿지 않았다. 래퍼가 정적 마커로 주입할 이름을 알리고 Field 가 그것을
읽는다 — Field 는 래퍼를 import 하지 않아 새 컨트롤에 자동으로 열린다.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 4: ⑧ 자식을 받지 않는 래퍼 넷에 `children?: never` 를 얹는다

**Files:**
- Modify: `src/react/elements.ts` (`NsPagination`·`NsSkeleton`·`NsMultiSelect` 래퍼의 props 타입)
- Modify: `src/react/tags/PageHeading.tsx` (공개 shim 의 props 타입)
- Modify: `docs/consumer-example.tsx`

**Interfaces:**
- Consumes: Task 3 이 `NsMultiSelect` 를 `Object.assign(...)` 로 감쌌다. **그 형태를 유지한 채** 타입만 좁힌다.
- Produces: 네 래퍼의 props 타입에 `children?: never`.

**대상이 왜 넷인가.** 컴포넌트별로 조사한 결과다.

| 래퍼 | 형태 | 자식이 어떻게 되나 |
|---|---|---|
| `NsPagination` | Light DOM + 렌더 | **덮인다.** React 와 Lit 이 같은 자식을 두고 다투다 `removeChild` 계열 런타임 에러 |
| `NsMultiSelect` | Light DOM + 렌더 | 같다 |
| `NsSkeleton` | shadow, 슬롯 없음 | **조용히 사라진다.** 에러도 없다 |
| `PageHeading` | shadow, 슬롯 없음 | 같다 |

`NsTabs` 는 대상이 **아니다** — `ReactiveElement` 를 상속해 소비자 자식을 품는다(`ns-tabs.ts:40`). `NsTable` 도 같다. `NsIcon`·`NsHeader`·`NsSidebar`·`NsNavGroup`·`NsNavItem`·`NsDialog` 는 슬롯이 있다.

**선례가 이미 저장소에 있다.** `src/react/controls/Select.tsx:7` 이 `Omit<SelectHTMLAttributes<HTMLSelectElement>, "children">` 으로 같은 것을 하고 그 이유를 주석으로 적어 두었다. `createComponent` 래퍼들만 그 관례 밖에 있었다.

- [ ] **Step 1: `createComponent` 가 반환하는 타입을 좁히는 방법을 확인한다**

```bash
cd /Users/neosimplix/coding/dashboard/common-ui
grep -n 'ReactWebComponent\|WebComponentProps' node_modules/@lit/react/development/create-component.d.ts | head -10
grep -n 'NsPagination\|NsSkeleton' src/react/elements.ts
```

`createComponent` 의 반환 타입을 확인하고, **props 를 좁히는 가장 작은 형태**를 고른다. 후보는 둘이다.

- 반환값을 `as` 로 좁은 타입에 캐스트한다
- 래퍼를 감싸는 얇은 타입 별칭을 선언한다

**어느 쪽이든 런타임 동작은 바뀌지 않아야 한다.** 이것은 타입만의 변경이다. 고른 이유를 주석으로 남긴다.

- [ ] **Step 2: 네 래퍼에 적용한다**

각 자리에 주석을 함께 둔다. 이유가 둘로 갈리므로 **같은 문구를 쓰지 않는다.**

Light DOM 둘(`NsPagination`·`NsMultiSelect`):

```ts
  // 자식을 받지 않는다. Light DOM 에 자기 템플릿을 렌더하므로 React 가 넣은
  // 자식과 다투다 removeChild 계열 런타임 에러가 난다. guide.html 이 이미
  // 경고하던 것을 타입이 막는다.
```

shadow 둘(`NsSkeleton`·`PageHeading`):

```ts
  // 자식을 받지 않는다. shadow 에 슬롯이 없어 자식이 조용히 사라진다 —
  // 에러가 없어서 오히려 알아채기 어렵다.
```

- [ ] **Step 3: 막히는지 확인한다 — 검사를 실패시켜 본다**

**이 단계가 이 태스크의 전부다.** 타입이 정말 막는지 보지 않으면 아무 증거도 없다.

`docs/consumer-example.tsx` 맨 아래에 **일부러 틀린 코드**를 임시로 넣는다.

```tsx
// @ts-expect-error 를 붙이지 않은 채로 넣어 실제로 실패하는지 본다 — 확인한 뒤 지운다.
<NsPagination total={100} pageSize={20}>{"x"}</NsPagination>;
```

```bash
cd /Users/neosimplix/coding/dashboard/common-ui
npx tsc -p tsconfig.consumer.json 2>&1 | head -10
```

Expected: `children` 관련 타입 에러가 난다. **다른 이유로 실패하면(프롭 이름 오타 등) 목표한 속성은 여전히 미검증이다** — 에러 메시지가 `children` 을 가리키는지 확인한다.

네 래퍼 전부에 같은 확인을 한다. `PageHeading` 은 shim 이므로 `<PageHeading heading="…">{"x"}</PageHeading>` 형태로 본다.

확인이 끝나면 **일부러 틀린 코드를 전부 지운다.**

- [ ] **Step 4: 정상 사용이 여전히 통과하는지 확인한다**

지우고 나서 `docs/consumer-example.tsx` 에 정상 형태를 남긴다(이미 있으면 추가하지 않는다).

```tsx
// ⑧ 회귀 바: 자식 없는 정상 사용은 통과해야 한다.
<NsSkeleton width="10rem" height="2.25rem" />;
```

- [ ] **Step 5: `npm run check` 와 커밋**

```bash
cd /Users/neosimplix/coding/dashboard/common-ui
npm run check
git status --short
git diff --stat | cat
```

Expected: `check` 5/5. `git status` 에 세 파일(`elements.ts`·`PageHeading.tsx`·`consumer-example.tsx`). **일부러 틀린 코드가 남아 있지 않은지 diff 로 확인한다.**

```bash
git add src/react/elements.ts src/react/tags/PageHeading.tsx docs/consumer-example.tsx
git commit -F - <<'EOF'
fix(react): 자식을 받지 않는 래퍼 넷에 children?: never 를 얹는다

guide.html 이 경고하던 것을 컴파일러가 막는다. 이유가 둘로 갈린다 —
Light DOM 둘은 자식이 덮여 런타임 에러가 나고, 슬롯 없는 shadow 둘은
조용히 사라진다. Select 가 이미 같은 처치를 하고 있었다.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 5: 릴리스 기록을 더한다 (태그를 자르기 위한 최소한)

**Files:**
- Modify: `changelog.html` (새 절 + 사이드바 nav 항목)
- Modify: `README.md` (릴리스 표에 새 행)

**Interfaces:**
- Consumes: Task 1~4 의 변경 내용.
- Produces: 없음.

**이 태스크가 왜 있나.** `scripts/check-controls.mjs` 가 `README.md` 의 릴리스 표와 `changelog.html` 의 절을 **양방향으로** 대조한다. 절이 없으면 `check` 가 실패해 릴리스 스크립트가 빌드 전에 멈춘다. **사용 서술(⑨⑦⑤)은 이 태스크에 넣지 않는다** — 별건으로 분리됐다.

- [ ] **Step 1: v0.5.3 절의 형태를 그대로 따른다**

```bash
cd /Users/neosimplix/coding/dashboard/common-ui
grep -n 'id="v0-5-3"' changelog.html
sed -n "$(grep -n 'id="v0-5-3"' changelog.html | cut -d: -f1),+4p" changelog.html
grep -n 'href="#v0-5-3"' changelog.html
grep -n 'v0-5-3' README.md
```

**`v0.5.3` 을 자를 때 사이드바 nav 항목을 빼먹어 리뷰에서 잡혔다.** 같은 실수를 반복하지 않는다 — 이 태스크는 **절·nav 항목·README 행 셋을 함께** 만든다.

- [ ] **Step 2: `changelog.html` 에 절을 더한다**

`<h2 id="v0-5-3">` **앞**에 넣는다. 버전은 `0.5.4` 로 적는다(조정자가 다른 번호를 지시하면 그것을 쓴다).

```html
  <h2 id="v0-5-4">v0.5.4</h2>
  <p class="dist"><code>dist/</code> 변경</p>
  <p>
    <strong>소비자 보고를 반영했다.</strong> <code>dashboard-shell</code> 이
    프리미티브 17개를 이 패키지로 이관하면서 실측으로 찾아낸 것들이고, 네 가지가
    이 태그에 들어갔다. 마크업을 고쳐야 하는 변경은 없다.
  </p>
  <p>
    <strong><code>Field</code> 안에서 컨트롤의 <code>invalid</code> 프롭이 살아난다.</strong>
    <code>Input</code>·<code>Textarea</code>·<code>Select</code> 가
    <code>aria-invalid</code> 를 계산한 뒤 나머지 props 를 펴서, <code>Field</code> 가
    오류 상태로 주입한 값에 지역 계산이 덮였다. 이제 뒤에서 합치므로 둘 중
    하나라도 참이면 invalid 다.
  </p>
  <p>
    <strong><code>Field</code> 와 <code>ns-multi-select</code> 를 함께 쓸 수 있다.</strong>
    커스텀 엘리먼트는 labelable 이 아니라 호스트에 <code>id</code> 를 얹어도
    <code>label for</code> 가 닿지 않았다. <code>Field</code> 가 이제 안쪽 컨트롤의
    프로퍼티로 내려보내므로 라벨과 오류 문구가 실제로 이어진다.
  </p>
  <p>
    <strong><code>ns-multi-select</code> 에 <code>input-invalid</code> 가 생겼다.</strong>
    안쪽 검색 입력의 <code>aria-invalid</code> 를 세울 통로가 없었다.
    <code>input-id</code>·<code>input-describedby</code> 와 짝을 맞춘다.
  </p>
  <p>
    <strong>자식을 받지 않는 래퍼가 타입으로 막힌다.</strong>
    <code>NsPagination</code>·<code>NsMultiSelect</code>·<code>NsSkeleton</code>·<code>PageHeading</code>
    넷이다. 앞의 둘은 Light DOM 이라 자식이 덮여 런타임 에러가 났고, 뒤의 둘은
    슬롯이 없어 조용히 사라졌다. 문서가 경고하던 것을 컴파일러가 막는다.
  </p>
```

- [ ] **Step 3: 사이드바 nav 항목을 더하고 `active` 를 옮긴다**

`changelog.html` 의 `<ns-sidebar>` 안 `0.5.x` 그룹에서:

```html
      <ns-nav-item href="#v0-5-4" label="v0.5.4" active></ns-nav-item>
      <ns-nav-item href="#v0-5-3" label="v0.5.3"></ns-nav-item>
```

`v0.5.3` 항목의 `active` 를 **뗀다.** 그룹 안에 `active` 는 정확히 하나여야 한다.

- [ ] **Step 4: `README.md` 릴리스 표에 행을 더한다**

기존 `v0.5.3` 행 **위**에 넣는다.

```markdown
| [`v0.5.4`](./changelog.html#v0-5-4) | 변경 | 없다. `Field` 안에서 컨트롤의 `invalid` 가 살아나고, `Field` + `ns-multi-select` 조합이 라벨을 잇는다. 자식을 안 받는 래퍼 넷은 타입이 막는다 |
```

- [ ] **Step 5: 검사를 돌리고 커밋**

```bash
cd /Users/neosimplix/coding/dashboard/common-ui
npm run check
grep -c 'href="#v0-5-4"' changelog.html      # 1
grep -c 'active></ns-nav-item>' changelog.html   # 1
for f in index.html guide.html changelog.html; do
  echo "— $f"
  grep -c '<script>' "$f"
  grep -n '</script>' "$f" | grep -v -E ':\s*</script>\s*$' | grep -v '<script src='
  grep -n 'document.addEventListener' "$f"
  grep -oE '(^|[[:space:]])id="[^"]*"' "$f" | sed -E 's/.*id="([^"]*)"/\1/' | sort | uniq -d
done
```

Expected: `check` 5/5 (릴리스 표 대조에 `v0.5.4` 가 나타난다). nav 항목 1개, `active` 1개. 구조 검사 첫 줄이 `index.html` **0**, 나머지 **1**, 다른 셋은 출력 없음.

```bash
git add changelog.html README.md
git commit -F - <<'EOF'
docs(changelog): v0.5.4 절과 릴리스 표 행을 더한다

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

## 이 계획이 끝난 뒤 (조정자가 한다)

- **사람 눈이 필요한 것을 사용자에게 직접 보고한다.** 파일에 모으지 않는다. 이 계획에서 그 목록은 짧다 — 변경 대부분이 타입과 속성이라 화면이 거의 안 바뀐다.
  - `guide.html` 의 `ns-multi-select` 데모와 `.ns-field` 데모가 여전히 정상으로 보이는지
  - `input-invalid` 를 켠 다중 선택의 테두리가 `controls.css` 의 invalid 스타일을 실제로 받는지
- **`npm run release -- 0.5.4` 로 태그를 자른다.** `releasing` 스킬을 따르고, **자른 뒤 검사 셋**(이벤트 매핑 11줄 · 태그 안 README 버전 · 콜드 설치)을 반드시 돌린다.
- **`dashboard-shell` 에 알린다.** 그쪽 스위트 146파일/2042개가 이 변경들의 **유일한 통합 검증**이다 — 특히 ②④는 React 래퍼의 동작을 바꾼다. 요청서 말미의 확인 항목 여섯 중 2·3·5·6 이 이 태그에 해당한다.
- **남은 것을 별건으로 남긴다:** 문서 항목 ①⑤⑦⑨, 그리고 설계가 필요한 ⑥(dev 경고의 발동 조건).
