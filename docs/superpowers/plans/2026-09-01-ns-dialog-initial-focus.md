# `ns-dialog` 초기 포커스 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 대화상자가 열릴 때 닫기 버튼(`×`)에 검정 포커스 링이 뜨던 것을, 초기 포커스를 제목으로 옮기고 그 요소의 링만 꺼서 없앤다.

**Architecture:** 섀도 `<dialog>` 의 focus delegate 는 **첫 포커스 가능 자손**을 고른다. 제목 `h2` 는 DOM 순서상 `.close` 보다 앞이므로, `h2` 에 `tabindex="-1"` 을 주면 그것만으로 초기 포커스가 제목으로 간다 — JS 는 필요 없다. 그다음 Chrome 이 그 `h2` 에 씌우는 UA 링을 CSS 한 줄로 끈다.

**Tech Stack:** Lit 3 · TypeScript · 순수 CSS. 테스트 러너 없음(설계 결정). 회귀 확인은 `npm run check` 와 헤드리스 두 엔진 프로브다.

## Global Constraints

- **테스트 러너를 추가하지 않는다.** vitest·jest·playwright·web-test-runner 금지, 테스트 파일도 만들지 않는다. (`.claude/rules/verification.md`)
- **커밋 메시지:** `<type>(<scope>): <subject>` — subject 는 한국어 명령조, 마침표 없음. (`.claude/rules/commit.md`)
- **`git push` 는 하지 않는다.** 로컬 커밋까지만.
- **로직과 스타일을 파일 두 개로 나눈다** — `ns-dialog.ts` / `ns-dialog.styles.ts`.
- **`:focus-visible` 이 아니라 `:focus` 를 쓴다.** 상위집합이라 엔진이 어느 쪽으로 링을 거는지에 의존하지 않는다.
- **문서 페이지에 리터럴 색을 쓰지 않는다.** `check-tokens.mjs` 가 실패시킨다.
- **`guide.html` 의 산문과 주석에서 스크립트 태그를 리터럴로 쓰지 않는다** — "스크립트" 처럼 우리말로 적는다. 구조 검사가 문자열 세기라 거짓이 된다.
- **`guide.html` 의 새 id 에는 절 이름을 접두사로 붙인다.** 문서 안에서 id 가 중복되면 배선 전체가 죽는다. (이 계획은 새 id 를 만들지 않는다)

---

### Task 1: 초기 포커스를 제목으로 옮기고 링을 끈다

**Files:**
- Modify: `src/components/dialog/ns-dialog.ts` (`render()` 안의 `<h2 id="dialog-heading">`)
- Modify: `src/components/dialog/ns-dialog.styles.ts` (`.close:focus-visible` 규칙 아래)
- Create(임시, 끝나면 삭제): `probe-dialog-focus.html` (저장소 루트 — `dist/` 상대 경로가 필요하다)

**Interfaces:**
- Consumes: 없음 (첫 태스크)
- Produces: 없음. 공개 API·이벤트·프로퍼티가 바뀌지 않는다. `ns-dialog` 의 프로퍼티(`heading`·`open`·`defaultOpen`·`noBackdropClose`)와 `ns-dialog-close` 이벤트의 `detail` 은 전부 그대로다.

- [ ] **Step 1: 프로브를 만든다 (아직 코드는 안 고친다)**

`dist/` 가 최신이어야 한다. 먼저 빌드한다.

```bash
cd /Users/neosimplix/coding/dashboard/common-ui
npm run build
```

저장소 루트에 `probe-dialog-focus.html` 을 만든다. `dist/index.js` 가 아니라 **`dist/bundle.umd.js`** 를 쓴다 — ES 빌드는 lit 을 external 로 두어 브라우저에서 bare specifier 해석에 실패한다.

```html
<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<link rel="stylesheet" href="./dist/tokens.css">
<link rel="stylesheet" href="./dist/controls.css">
</head><body>
<ns-dialog heading="사용자 승인">
  <p>홍길동 님의 가입 신청을 승인하시겠습니까?</p>
  <button slot="footer" class="ns-button ns-button--outline" id="cancel">취소</button>
  <button slot="footer" class="ns-button ns-button--solid" id="approve">승인</button>
</ns-dialog>
<pre id="out"></pre>
<script src="./dist/bundle.umd.js"></script>
<script type="module">
try {
  await customElements.whenDefined("ns-dialog");
  const host = document.querySelector("ns-dialog");
  await host.updateComplete;
  const sr = host.shadowRoot;
  const close = sr.querySelector(".close");
  const h2 = sr.querySelector("#dialog-heading");
  host.open = true;
  await host.updateComplete;
  await new Promise((r) => setTimeout(r, 60));
  const a = sr.activeElement;
  const name = (el) => (el ? el.tagName + (el.id ? "#" + el.id : el.className ? "." + el.className : "") : null);
  document.getElementById("out").textContent = JSON.stringify({
    initialFocus: name(a),
    onHeading: a === h2,
    onClose: a === close,
    closeRing: close.matches(":focus-visible"),
    headingRing: h2.matches(":focus-visible"),
    headingOutline: getComputedStyle(h2).outlineStyle,
    headingTabindex: h2.getAttribute("tabindex"),
  });
} catch (e) {
  document.getElementById("out").textContent = "ERR " + e;
}
</script>
</body></html>
```

- [ ] **Step 2: 프로브를 돌려 결함을 재현한다 (실패 확인)**

**이 단계를 건너뛰지 않는다.** 한 번도 실패해본 적 없는 프로브가 통과하는 것은 아무 증거도 아니다.

```bash
cd /Users/neosimplix/coding/dashboard/common-ui
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless \
  --allow-file-access-from-files --virtual-time-budget=6000 \
  --dump-dom "file://$PWD/probe-dialog-focus.html" 2>/dev/null \
  | grep -o '<pre id="out">[^<]*' | sed 's/<pre id="out">//'
```

Expected(고치기 전): `initialFocus` 가 `BUTTON.close`, `onClose` 가 `true`, **`closeRing` 이 `true`**, `headingTabindex` 가 `null`.

`closeRing` 이 `true` 로 나오지 않으면 멈추고 보고한다 — 재현되지 않는 결함을 고칠 수 없다.

- [ ] **Step 3: 제목에 `tabindex="-1"` 을 준다**

`src/components/dialog/ns-dialog.ts` 의 `render()` 에서 이 줄을

```ts
          <h2 id="dialog-heading">${this.heading}</h2>
```

이렇게 바꾼다.

```ts
          <h2 id="dialog-heading" tabindex="-1">${this.heading}</h2>
```

설명은 **`render()` 위의 TS 주석**으로 단다. Lit 템플릿 안에 HTML 주석을 쓰면
shadow DOM 으로 렌더된다(`docs/gotchas.md`) — 템플릿 안에는 넣지 않는다.

```ts
  /*
    제목이 tabindex="-1" 을 갖는 이유는 초기 포커스다. showModal() 은 대화상자의
    첫 포커스 가능 자손을 고르는데, 그것이 헤더의 닫기 버튼이면 Chrome 이 그
    포커스를 :focus-visible 로 쳐서 여는 순간 × 에 링이 뜬다. h2 가 DOM 순서상
    닫기 버튼보다 앞이므로 tabindex 하나로 그 자리를 가져온다 — JS 는 필요 없다.

    tabindex="-1" 은 탭 순서에 들어가지 않으므로 탭 순서는 바뀌지 않는다.
    소비자가 슬롯 자식에 autofocus 를 주면 여전히 그쪽이 이긴다(Chrome).
    경위와 두 엔진 측정값은 docs/gotchas.md 에 있다.
  */
  override render() {
```

- [ ] **Step 4: `h2` 의 포커스 링을 끈다**

`src/components/dialog/ns-dialog.styles.ts` 의 `.close:focus-visible` 블록 **아래**에 넣는다.

```css
  /*
    되돌릴 규칙을 두지 않는다. "UA 기본값을 덮으면 되돌릴 규칙을 함께 둔다" 는
    규칙이 막으려는 것은 키보드 사용자가 포커스 위치를 잃는 것인데, 이 h2 는
    tabindex="-1" 이라 탭 순서에 없어 키보드로 도달하는 경로 자체가 없다.
    되돌릴 대상이 없으므로 되돌릴 규칙도 없다 — 근거는 docs/gotchas.md 에 있다.

    :focus-visible 이 아니라 :focus 다. 상위집합이라 엔진이 어느 쪽으로 링을
    거는지에 의존하지 않는다 — Chrome 은 focus-visible 로, 다른 엔진은 :focus
    로 걸 수 있다.
  */
  #dialog-heading:focus {
    outline: none;
  }
```

- [ ] **Step 5: 다시 빌드하고 프로브를 돌린다 (통과 확인)**

```bash
cd /Users/neosimplix/coding/dashboard/common-ui
npm run build
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless \
  --allow-file-access-from-files --virtual-time-budget=6000 \
  --dump-dom "file://$PWD/probe-dialog-focus.html" 2>/dev/null \
  | grep -o '<pre id="out">[^<]*' | sed 's/<pre id="out">//'
```

Expected: `initialFocus` 가 `H2#dialog-heading`, `onHeading` 이 `true`, `onClose` 가 `false`, **`closeRing` 이 `false`**, **`headingOutline` 이 `"none"`**, `headingTabindex` 가 `"-1"`.

`headingRing` 은 `true` 여도 된다 — 링이 *매치* 되는지가 아니라 *그려지는지* 가 바다. `headingOutline` 이 `"none"` 이면 그려지지 않는다.

- [ ] **Step 6: WebKit 에서도 같은 값을 잰다**

사용자가 Safari 로도 확인하므로 한 엔진만 본 것은 증거가 아니다. 하네스를 만든다.

```bash
mkdir -p /tmp/ns-probe && cat > /tmp/ns-probe/probe.swift <<'SWIFT'
import WebKit
import Foundation
let url = URL(fileURLWithPath: CommandLine.arguments[1])
let cfg = WKWebViewConfiguration()
cfg.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
let wv = WKWebView(frame: CGRect(x:0,y:0,width:800,height:600), configuration: cfg)
wv.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
var done = false
DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
  wv.evaluateJavaScript("document.getElementById('out').textContent") { r, e in
    print(r as? String ?? "ERR \(String(describing: e))"); done = true
  }
}
while !done && RunLoop.current.run(mode: .default, before: Date().addingTimeInterval(0.1)) {}
SWIFT
swiftc -o /tmp/ns-probe/probe /tmp/ns-probe/probe.swift 2>&1 | grep -v warning
cd /Users/neosimplix/coding/dashboard/common-ui && /tmp/ns-probe/probe "$PWD/probe-dialog-focus.html"
```

Expected: `initialFocus` 가 `H2#dialog-heading`, `onHeading` 이 `true`, `closeRing` 이 `false`, `headingOutline` 이 `"none"`.

- [ ] **Step 7: 탭 순서가 보존됐는지 잰다**

프로브의 스크립트 블록에서 `document.getElementById("out").textContent = JSON.stringify({` 바로 **위**에 이 줄들을 넣는다.

```js
  // 탭 순서 확인: h2 는 tabindex="-1" 이라 탭으로 못 가므로 첫 Tab 은 × 로 가야 한다.
  const tabbable = [...sr.querySelectorAll("button, [href], input, select, textarea, [tabindex]")]
    .filter((el) => el.getAttribute("tabindex") !== "-1");
  const firstTabbable = tabbable[0];
```

그리고 `JSON.stringify({` 안에 이 줄을 더한다.

```js
    firstTabbable: name(firstTabbable),
```

두 엔진에서 다시 돌린다(Step 5·6 의 명령 그대로).

Expected: `firstTabbable` 이 `BUTTON.close`. `h2` 가 아니어야 한다.

- [ ] **Step 8: 소비자 `autofocus` 가 여전히 이기는지 잰다**

프로브의 `승인` 버튼에 `autofocus` 를 붙인다.

```html
  <button slot="footer" class="ns-button ns-button--solid" id="approve" autofocus>승인</button>
```

Chrome 에서만 돌린다(Step 5 의 명령).

Expected: `initialFocus` 가 `null` 이고 `onHeading`·`onClose` 가 둘 다 `false`. 포커스가 섀도 밖(소비자의 `#approve`)으로 갔다는 뜻이다 — `sr.activeElement` 는 섀도 안에 없으면 `null` 이다.

**이것이 회귀 검사다.** `h2` 의 `tabindex` 가 소비자의 `autofocus` 를 빼앗으면 여기서 `onHeading: true` 로 드러난다.

확인했으면 `autofocus` 를 도로 뗀다.

- [ ] **Step 9: 프로브를 지우고 `npm run check` 를 돌린다**

프로브는 저장소 루트에 있으므로 **반드시 지운다.**

```bash
cd /Users/neosimplix/coding/dashboard/common-ui
rm -f probe-dialog-focus.html
rm -rf /tmp/ns-probe
npm run check
git status --short
```

Expected: `check` 5개 전부 통과. `git status` 에 `src/components/dialog/ns-dialog.ts` 와 `src/components/dialog/ns-dialog.styles.ts` 둘만 보인다(`dist` 는 gitignore 대상이다).

- [ ] **Step 10: 커밋**

```bash
cd /Users/neosimplix/coding/dashboard/common-ui
git add src/components/dialog/ns-dialog.ts src/components/dialog/ns-dialog.styles.ts
git commit -F - <<'EOF'
fix(dialog): 열릴 때 닫기 버튼에 링이 뜨던 것을 제목 포커스로 고친다

showModal() 이 첫 포커스 가능 자손인 × 를 잡고 Chrome 이 그것을
:focus-visible 로 쳐서 여는 순간 검정 링이 떴다. 제목이 tabindex="-1" 로
그 자리를 가져가고 자기 링은 끈다. 탭 순서와 소비자 autofocus 는 그대로다.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 2: 근거와 사용 문서를 남기고 릴리스 문서를 갱신한다

**Files:**
- Modify: `docs/gotchas.md` (파일 끝에 새 절 추가)
- Modify: `guide.html` (대화상자 절 — `<h3>backdrop 클릭</h3>` 문단 뒤, `<h3>HTML — 마크업</h3>` 앞)
- Modify: `changelog.html` (`<h2 id="v0-5-3">v0.5.3</h2>` 절에 항목 추가)
- Modify: `README.md` (릴리스 표의 `v0.5.3` 행 요약)

**Interfaces:**
- Consumes: Task 1 이 만든 동작 — 초기 포커스가 `h2#dialog-heading` 이고 `outline: none` 이다. 문서가 그 동작을 서술한다.
- Produces: 없음.

- [ ] **Step 1: `docs/gotchas.md` 에 절을 더한다**

파일 **끝**에 붙인다(이 문서는 시간순으로 쌓는다).

````markdown

## 모달의 초기 포커스는 골라지는 것이지 주어지는 것이 아니다

대화상자를 열면 닫기 버튼에 검정 테두리가 생긴다는 보고를 받았다. 그 테두리는
브라우저 기본 링이 아니라 **우리 것**이다 — `.close:focus-visible` 이
`outline: 2px solid var(--ns-color-accent)` 이고, 밝은 모드의
`--ns-color-accent` 는 `oklch(21% 0.006 285.885)` 로 거의 검정이다.
`--ns-color-accent-fill` 과 같은 값이라 채움 버튼과 구분되지 않는다.

**포커스를 주지 않는 선택지는 없다.** `showModal()` 은 반드시 포커스를 대화상자
안으로 옮긴다 — 그래야 포커스 트랩·`Esc`·`::backdrop` 과 스크린리더 맥락이
성립한다. 바꿀 수 있는 것은 **어디에 주느냐** 뿐이다.

두 엔진에서 직접 쟀다.

| 경우 | Blink 초점 | Blink 링 | WebKit 초점 | WebKit 링 |
|---|---|---|---|---|
| 고치기 전 | `.close` | **뜬다** | `.close` | 안 뜬다 |
| `<dialog tabindex="-1">` | `.close` | 뜬다 | `.close` | 안 뜬다 |
| `<dialog tabindex="-1" autofocus>` | `.close` | 뜬다 | `dialog` | 안 뜬다 |
| 소비자가 슬롯 버튼에 `autofocus` | 승인 버튼 | 안 뜬다 | `.close` | 안 뜬다 |
| **`h2[tabindex="-1"]`** (채택) | **`h2`** | UA 링 | **`h2`** | 안 뜬다 |

→ **Chrome 은 모달의 초기 포커스를 의도적으로 `:focus-visible` 로 친다.** WebKit
은 그러지 않는다. 그래서 **같은 코드가 Safari 에서는 멀쩡해 보인다** — 한 엔진만
본 육안 확인이 증거가 되지 못하는 자리가 또 하나 늘었다.

→ **`<dialog>` 자신에 붙인 `autofocus` 를 Chrome 은 무시한다.** focus delegate
탐색이 자손만 보기 때문이다. WebKit 은 따른다. 검색하면 흔히 나오는 처방인데
두 엔진이 갈리므로 쓸 수 없다.

→ **`<dialog tabindex="-1">` 만으로는 아무 효과가 없다.** 포커스 가능한 자손이
있으면 그쪽이 먼저 선택되므로 조상의 `tabindex` 는 후보가 되지 못한다. 위 둘은
**다음 사람이 똑같이 시도할 처방**이라 "해봤고 안 된다" 를 남긴다.

→ **채택한 것은 제목에 `tabindex="-1"` 하나다.** `h2` 가 DOM 순서상 닫기 버튼보다
앞이므로 "첫 포커스 가능 자손" 자리를 그냥 가져간다. **JS 가 필요 없다** — 초기
포커스를 옮기는 코드를 쓰려다 재보니 속성 하나로 이미 되어 있었다.

→ **탭 순서는 바뀌지 않는다.** `tabindex="-1"` 은 프로그램 포커스만 받고 탭
순서에는 들어가지 않는다. 열린 뒤 `Tab` 을 누르면 그대로 `×` 로 간다.

→ **`outline: none` 에 되돌릴 규칙을 두지 않는다.** `library-invariants.md` 의
"shadow 스타일이 UA 기본값을 덮으면 되돌릴 규칙을 함께 둔다" 에 걸리는 자리인데,
근거는 "안 두어도 된다" 가 아니라 **되돌릴 대상이 없다** 다. 그 규칙이 막으려는
것은 키보드 사용자가 포커스 위치를 잃는 것인데, `tabindex="-1"` 인 `h2` 에는
키보드로 도달하는 경로가 존재하지 않는다. 링이 필요해지는 상황이 발생하지 않는다.

→ **`:focus-visible` 이 아니라 `:focus` 로 끈다.** 상위집합이라 엔진이 어느 쪽으로
링을 거는지에 의존하지 않는다.

→ **소비자의 슬롯 `autofocus` 는 Chrome 에서만 통한다.** WebKit 은 슬롯 배정된
light DOM 을 후보 탐색에서 보지 않는다. `confirm.ts` 의 주석이 *"slot 으로 배정될
뿐 노드 트리 자손이 아니라 autofocus 후보 탐색이 닿는지가 구현에 달렸다"* 고 적어
둔 것이 측정으로 확정됐다. **그래서 `guide.html` 에 적지 않는다** — 한 엔진에서만
동작하는 것을 지원 기능으로 광고하면 거짓이 된다. 대신 `h2` 의 `tabindex` 가 그것을
빼앗지 않는지는 프로브가 확인한다.

→ **`nsConfirm()` 에는 이 증상이 없었다.** `confirm.ts` 가 자기 푸터 버튼에 초기
포커스를 직접 주기 때문이다. **선언형 `ns-dialog` 에 같은 처방을 쓸 수 없는 이유**는
푸터가 소비자 슬롯이라 무엇이 주 버튼인지 알 수 없어서다 — `승인` 같은 것에 기본
포커스를 주면 `Enter` 한 번에 실행된다. `nsConfirm` 은 자기가 버튼을 만들어 어느
쪽이 주인지 알기 때문에 할 수 있는 일이다.

→ **불변 규칙으로 올리지 않았다.** 모달이 하나뿐이라 사용처가 하나인 규칙이 되고,
토큰에 대해 이미 갖고 있는 기준("사용처가 하나인 토큰을 만드는 것은 추측이다")을
같은 모양으로 적용했다. 모달이 둘째로 생기는 날 이 절을 근거로 규칙으로 올린다.
````

- [ ] **Step 2: `guide.html` 대화상자 절에 문단을 더한다**

`<h3>backdrop 클릭</h3>` 의 `<ul>` 이 닫히는 `</ul>` **뒤**, `<h3>HTML — 마크업</h3>` **앞**에 넣는다.

```html
  <h3>초기 포커스</h3>
  <p>
    열리면 초기 포커스가 <strong>제목</strong>에 간다. 그래서 여는 순간 어떤 버튼도
    눌린 것처럼 보이지 않는다. <code>showModal()</code> 은 포커스를 반드시 대화상자
    안으로 옮기므로(포커스 트랩과 <code>Esc</code> 가 그것에 얹혀 있다) 포커스를
    주지 않는 선택지는 없고, 바꿀 수 있는 것은 어디에 주느냐다. 제목이
    <code>tabindex="-1"</code> 로 그 자리를 받는다.
  </p>
  <p>
    <strong>탭 순서는 그대로다.</strong> <code>tabindex="-1"</code> 은 탭 순서에
    들어가지 않으므로, 열린 뒤 <code>Tab</code> 을 누르면 닫기 버튼으로 간다.
    스크린리더는 열릴 때 제목을 읽는다.
  </p>
```

- [ ] **Step 3: `changelog.html` 의 v0.5.3 절에 항목을 더한다**

`<h2 id="v0-5-3">v0.5.3</h2>` 절에서 `<p class="dist">` 바로 다음 문단부터가 헤더 밑줄 이야기다. **그 절의 마지막 문단 뒤**(다음 `<h2 id="v0-5-2">` 앞)에 넣는다.

```html
  <p>
    <strong>대화상자를 열 때 닫기 버튼에 검정 링이 뜨던 것을 고쳤다.</strong>
    <code>showModal()</code> 이 첫 포커스 가능 자손인 닫기 버튼을 잡고, Chrome 이
    그 포커스를 <code>:focus-visible</code> 로 쳐서 링을 그렸다. 밝은 모드의
    <code>--ns-color-accent</code> 가 거의 검정이라 테두리처럼 보였다. 이제 초기
    포커스가 제목으로 가고 그 요소의 링은 꺼진다.
  </p>
  <p>
    <strong>탭 순서와 접근성은 그대로다.</strong> 제목은 탭 순서에 들어가지 않으므로
    <code>Tab</code> 은 여전히 닫기 버튼으로 가고, 포커스는 대화상자 안에 머무른다.
    <strong>Safari 에서는 원래 이 링이 없었다</strong> — WebKit 은 모달의 초기
    포커스를 <code>:focus-visible</code> 로 치지 않는다.
  </p>
```

- [ ] **Step 4: `README.md` 의 v0.5.3 행을 둘 다 담게 고친다**

이 행을

```markdown
| [`v0.5.3`](./changelog.html#v0-5-3) | 변경 | 없다. `ns-header` 밑줄이 소비자 셸에서 보이지 않던 것을 고쳤다 — 헤더 높이와 본문 위치는 그대로다 |
```

이렇게 바꾼다.

```markdown
| [`v0.5.3`](./changelog.html#v0-5-3) | 변경 | 없다. `ns-header` 밑줄이 소비자 셸에서 안 보이던 것과, 대화상자를 열 때 닫기 버튼에 링이 뜨던 것을 고쳤다 |
```

- [ ] **Step 5: `npm run check` 와 문서 구조 검사를 돌린다**

```bash
cd /Users/neosimplix/coding/dashboard/common-ui
npm run check
for f in index.html guide.html changelog.html; do
  echo "— $f"
  grep -c '<script>' "$f"
  grep -n '</script>' "$f" | grep -v -E ':\s*</script>\s*$' | grep -v '<script src='
  grep -n 'document.addEventListener' "$f"
  grep -oE '(^|[[:space:]])id="[^"]*"' "$f" | sed -E 's/.*id="([^"]*)"/\1/' | sort | uniq -d
done
```

Expected: `check` 5개 통과. 구조 검사는 첫 줄이 `index.html` 에서 **0**, `guide.html`·`changelog.html` 에서 **1**, 나머지 셋은 **출력 없음**.

`index.html` 의 0 은 빠진 것이 아니라 바다 — 목차라 배선이 없다.

- [ ] **Step 6: 커밋**

```bash
cd /Users/neosimplix/coding/dashboard/common-ui
git add docs/gotchas.md guide.html changelog.html README.md
git commit -F - <<'EOF'
docs(dialog): 초기 포커스의 근거와 사용 서술을 남긴다

두 엔진 측정값, 안 되는 처방 둘(<dialog> 의 autofocus·tabindex),
outline: none 에 되돌릴 규칙을 두지 않는 근거를 gotchas 에 적는다.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

## 이 계획이 끝난 뒤 (조정자가 한다)

- **사람 눈이 필요한 것을 사용자에게 직접 보고한다.** 파일에 모으지 않는다.
  - 실제 Chrome·Safari 에서 대화상자를 **마우스로** 열어 링이 없는지
  - 열린 뒤 `Tab` 을 눌렀을 때 `×` 에 링이 **정상적으로** 뜨는지 (끄면 안 되는 것까지 끄지 않았는지)
  - 스크린리더가 열릴 때 제목을 읽는지
- **그다음 v0.5.3 태그를 자른다.** `releasing` 스킬을 따른다. 헤더 밑줄 수정(`ad9429a`)과 이 변경이 같은 태그에 들어간다.
