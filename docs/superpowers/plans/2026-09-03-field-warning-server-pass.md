# `Field` 서버 패스 경고 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `v0.5.6` 의 `Field` 경고가 RSC 경로에서 뜨지 않는 것을 고친다 — 서버 렌더용 자리를 하나 더 둔다. 기존 클라이언트 경고는 유지한다.

**Architecture:** 같은 결함이 환경마다 다른 자리에서 나타난다. 게이트가 거짓인 시점이 RSC 에서는 서버 패스, 그 외에서는 클라이언트다. 그래서 감지도 두 자리다 — 서버는 렌더 본문(`typeof window === "undefined"`), 클라이언트는 지금의 이펙트.

**Tech Stack:** React shim(`src/react/controls/Field.tsx`) 한 파일 + 문서. 테스트 러너 없음(설계 결정). 검증은 `npm run check` 와 저장소 밖 `react-dom` 하네스다.

**근거:** `docs/superpowers/specs/2026-09-03-field-warning-server-pass-design.md`

## Global Constraints

- **테스트 러너를 추가하지 않는다.** 저장소에 테스트 파일을 만들지 않는다. 하네스는 저장소 **밖** 스크래치에 둔다.
- **커밋 메시지:** `<type>(<scope>): <subject>` — 한국어 명령조, 마침표 없음, 트레일러 `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.
- **`git push` 는 하지 않는다.** 태그는 조정자가 자른다.
- **공개 API 를 바꾸지 않는다.** `FieldProps` 와 렌더 결과가 그대로다.
- **기존 클라이언트 경고를 없애지 않는다.** 옮기는 것이 아니라 더하는 것이다 — 클라이언트 쪽 네 경우(`null`·배열·문자열·bare lazy)가 실측으로 라벨을 끊고 있고 그 경고가 유일한 감지 수단이다.
- **문서 페이지에 리터럴 색을 쓰지 않고, 산문에 스크립트 태그를 리터럴로 쓰지 않는다**("스크립트" 로 적는다).
- **새 `id` 를 만들지 않는다.**
- **측정값·부정 단정은 적기 전에 실행해서 확인한다.**

---

### Task 1: 서버 렌더용 경고를 더한다

**Files:**
- Modify: `src/react/controls/Field.tsx`

**Interfaces:**
- Consumes: 없음. Produces: 없음. `FieldProps` 와 반환 JSX 가 그대로다.

**왜 자리가 둘인가.** `v0.5.6` 의 경고는 `useEffect` 에 있다. 이펙트는 클라이언트에서만 돌고, RSC 경로에서는 **그 시점에 게이트가 이미 참**이다(페이로드가 풀려 평범한 엘리먼트가 도착한다). 게이트가 거짓인 것은 **서버 패스뿐**이라 양쪽 다 조용하다.

**실측 (spec 에 있는 것):**

| | 렌더 본문 | 이펙트 |
|---|---|---|
| `renderToString` | 1회 | **0회** |
| `renderToString` + StrictMode | **1회** | 0회 |

서버에서는 이펙트가 안 돌고 **StrictMode 도 두 번 부르지 않는다** — 이펙트로 옮긴 원래 이유가 서버에는 적용되지 않으므로 렌더 본문에서 내도 중복이 없다.

- [ ] **Step 1: 현재 파일과 `v0.5.6` 경고를 읽는다**

```bash
cd /Users/neosimplix/coding/dashboard/common-ui
cat src/react/controls/Field.tsx
```

`injectable` 지역 변수와 `warnedRef` + `useEffect` 블록이 있다. **그 블록을 지우지 않는다.**

- [ ] **Step 2: 서버 경고를 더한다**

`injectable` 을 계산한 **직후**, 이펙트 블록 앞에 넣는다. 훅이 아니므로 조건부로 실행해도 된다.

```tsx
  /*
    자리가 둘인 이유. 게이트가 거짓이 되는 시점이 환경마다 다르다.

    RSC 경로에서는 서버 패스에서만 거짓이다 — Next 의 페이로드가 자식을
    React.lazy 참조로 넘기고, 클라이언트에서는 그것이 풀려 평범한 엘리먼트로
    도착한다. 그런데 아래 이펙트는 클라이언트에서만 돌고 그때 게이트는 이미
    참이므로, 0.5.6 의 경고는 정작 그 사고에서 뜨지 않았다(소비자가 next dev
    에서 확인해 알려줬다).

    서버 렌더에는 이펙트가 없으므로 렌더 본문에서 낸다. 렌더 본문에서
    console.warn 하는 것은 순수성 위반이지만, 서버 렌더는 한 번만 돌고
    StrictMode 도 서버에서는 두 번 부르지 않으므로 중복이 없다
    (실측: renderToString 은 본문 1회·이펙트 0회, StrictMode 로 감싸도 같다).
    이펙트는 서버에서 안 돌고 서버 전용 훅도 없어 대안이 없다.

    문구를 아래 클라이언트 경고와 다르게 쓴다 — 진단이 다르므로 처방도 다르다.
    여기는 "자식이 서버에서 만들어져 lazy 로 왔다", 아래는 "자식이 단일
    엘리먼트가 아니다" 다. 하나로 합치면 RSC 사고를 만난 사람이 엉뚱한 것을
    의심한다.
  */
  if (!injectable && typeof window === "undefined") {
    console.warn(
      `[ns-field] label="${label}" 의 자식이 서버 렌더에서 React 엘리먼트가 ` +
        "아니라 id 를 주입하지 못했습니다. 서버 컴포넌트가 만든 자식이 RSC " +
        "페이로드에서 lazy 참조로 도착하면 이렇게 됩니다 — 자식을 클라이언트 " +
        "컴포넌트에서 만들거나 이 파일에 use client 를 붙이세요.",
    );
  }
```

**`typeof window === "undefined"` 를 쓰는 이유**는 서버 렌더를 그것으로만 구별할 수 있어서다. `injectable` 은 이미 계산돼 있으니 다시 부르지 않는다.

**클라이언트 경고 쪽도 손댈 것이 하나 있다** — 이제 서버에서도 경고가 날 수 있으므로, 이펙트 쪽 주석에 "자리가 둘" 이라는 사실을 한 줄 더한다. 이펙트는 클라이언트에서만 도니 조건을 바꿀 필요는 없다.

- [ ] **Step 3: 서버 경로를 잰다**

하네스는 저장소 밖에 있다.

```bash
SP=/private/tmp/claude-501/-Users-neosimplix-coding-dashboard-common-ui/f08e70d4-e0c8-47cf-b5ee-30f658f9aaeb/scratchpad/rdom
ls "$SP"/field-warn.mjs "$SP"/server.mjs
cd /Users/neosimplix/coding/dashboard/common-ui && npm run build
cp dist/react.js "$SP/node_modules/@neosimplix/common-ui/dist/react.js"
```

`field-server.mjs` 를 만든다. `react-dom/server` 의 `renderToString` 을 쓰고 `console.warn` 을 가로채 센다. **jsdom 을 세우지 않는다** — 서버 경로를 재는 것이므로 `window` 가 없어야 한다.

| 자식 | 서버 경고 |
|---|---|
| 평범한 엘리먼트(`<Input/>`) | 0 |
| `{lazy 객체}` | **1** |
| `StrictMode` 로 감싼 `{lazy 객체}` | **1** |

`{lazy 객체}` 는 렌더가 서스펜드하므로 `Suspense` 로 감싼다.

Expected: 위 표 그대로.

- [ ] **Step 4: 클라이언트 경로가 회귀하지 않았는지 잰다**

`field-warn.mjs` 를 그대로 다시 돌린다 — **0 / 0 / 1 / 1** 이어야 한다. 그리고 `client-cases.mjs` 도 돌려 배열·문자열·`null`·`undefined` 넷이 **여전히 각각 1** 인지 본다.

**이 단계가 「옮긴 것이 아니라 더한 것」의 증거다.** 하나라도 0 이 되면 클라이언트 경고를 깨뜨린 것이다.

- [ ] **Step 5: 두 자리가 독립인지 확인한다 — 검사를 실패시켜 본다**

서버 경고만 지우고 빌드해 다시 돌린다.

- 서버 표의 둘째·셋째가 **1 → 0** 이어야 한다
- 클라이언트 표는 **안 변해야** 한다

두 번째가 핵심이다 — 안 변하면 두 자리가 서로 독립임이 증명된다. 클라이언트 쪽도 같이 0 이 되면 한 자리를 잘못 건드린 것이다.

확인 후 소스를 원복하고 `git status` 가 깨끗한지 본다.

- [ ] **Step 6: `npm run check` 와 커밋**

```bash
cd /Users/neosimplix/coding/dashboard/common-ui
npm run check
git status --short
```

Expected: `check` 5/5. `git status` 에 `src/react/controls/Field.tsx` 하나.

```bash
git add src/react/controls/Field.tsx
git commit -F - <<'EOF'
fix(field): 서버 렌더에서도 주입 실패를 경고한다

0.5.6 의 경고는 이펙트에만 있어 RSC 경로에서 뜨지 않았다 — 게이트가
거짓인 것은 서버 패스뿐이고 클라이언트에서는 이미 참이다. 서버 렌더에는
이펙트가 없어 렌더 본문에서 낸다. 클라이언트 경고는 그대로 둔다.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 2: 문서 — 거짓 문단을 고치고 감지 경로를 적는다

**Files:**
- Modify: `guide.html` (`Field` 절)
- Modify: `docs/gotchas.md` (파일 끝)

**Interfaces:**
- Consumes: Task 1. Produces: 없음.

- [ ] **Step 1: `guide.html` 의 거짓 문단을 찾아 고친다**

```bash
cd /Users/neosimplix/coding/dashboard/common-ui
grep -n 'v0.5.6' guide.html
grep -n '의심할 근거' guide.html
```

지금 이렇게 적혀 있다.

> `v0.5.6` 부터는 경고가 난다. … **위 증상을 다시 만나면 이제 `Field` 를 의심할 근거가 생긴 것이다.**

**그 증상이 경고가 안 뜨던 경우다.** 소비자가 `next dev` 에서 확인했다 — 브라우저 콘솔 `ns-field` 0건, 서버 터미널도 0건.

Task 1 이 고쳤으므로 이제 참이 되지만, **어느 콘솔에 뜨는지를 반드시 명시한다.**

- **RSC 경로(서버에서 만든 자식)** → `next dev` **터미널**. 브라우저 콘솔에서 찾으면 못 찾는다
- **클라이언트 쪽(`null`·배열·문자열 등)** → **브라우저 콘솔**

같은 절의 이 문장도 갱신한다.

> `v0.5.6` 이전에는 자동화된 잡을 수단도 없었다.

`v0.5.7` 부터는 있다 — 서버 경고가 터미널 로그에 남으므로 **CI 로 잡을 수 있다.**

- [ ] **Step 2: Chrome 의 감지 경로를 적는다**

소비자가 찾아준 것이다. 그 상태에서 Chrome 이 스스로 이슈를 낸다.

```
Incorrect use of <label for=FORM_ELEMENT>
```

하이드레이션 오류와 이것이 같이 뜨면 `Field` 를 의심하라는 신호다. **`v0.5.7` 전까지는 그것이 유일한 감지 경로였다** — 그 사실을 함께 적으면 왜 이 릴리스가 필요했는지가 드러난다.

- [ ] **Step 3: `docs/gotchas.md` 에 절을 더한다**

파일 **끝**에 붙인다. 담을 것:

- **같은 결함이 환경마다 다른 자리에서 나타나므로 감지도 두 자리가 필요하다.** 게이트가 거짓이 되는 시점이 RSC 에서는 서버 패스, 그 외에서는 클라이언트다
- **⑥에서 배운 것을 그대로 일반화했다가 틀렸다.** `ns-sidebar` 경고는 "이펙트가 안전하다" 가 맞았는데, 거기 조건은 클라이언트 렌더 시점에 확정된다. `Field` 의 RSC 조건은 서버에서만 참이라 같은 자리가 정확히 틀린 자리가 됐다. **판단 기준은 "이펙트냐 렌더 본문이냐" 가 아니라 "조건이 어느 쪽에서 확정되는가" 다**
- **렌더 본문에서 `console.warn` 하는 것은 순수성 위반**이고, 서버 렌더가 한 번만 돌아 실질 피해가 없다는 것과 대안이 없다는 것(이펙트는 서버에서 안 돌고 서버 전용 훅도 없다)
- 실측 표 — `renderToString` 은 본문 1회·이펙트 0회, StrictMode 로 감싸도 같다
- **문구를 나눈 이유** — 진단이 다르므로 처방도 다르다

- [ ] **Step 4: 검사와 커밋**

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

Expected: `check` 5/5. 구조 검사 `index.html` **0**, 나머지 **1**, 다른 셋은 출력 없음.

```bash
git add guide.html docs/gotchas.md
git commit -F - <<'EOF'
docs(field): 경고가 어느 콘솔에 뜨는지 밝히고 자리 둘의 근거를 남긴다

0.5.6 문단이 RSC 경로에서도 경고가 뜬다고 읽히게 적혀 있었다. 경로별로
어느 콘솔인지 나누고, Chrome 이 끊어진 라벨을 직접 잡아 주는 것도 적는다.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 3: v0.5.7 릴리스 기록

**Files:**
- Modify: `changelog.html` (절 + 사이드바 nav 항목)
- Modify: `README.md` (릴리스 표 행)

**Interfaces:**
- Consumes: Task 1~2. Produces: 없음.

**셋을 함께 만든다** — 절, nav 항목, README 행.

- [ ] **Step 1: 기존 절의 모양을 읽는다**

```bash
cd /Users/neosimplix/coding/dashboard/common-ui
grep -n 'id="v0-5-6"\|href="#v0-5-6"' changelog.html
grep -n 'v0-5-6' README.md
```

- [ ] **Step 2: 절·nav·README 행을 만든다**

버전은 `0.5.7`. `dist/` 는 **변경**. **breaking 없다.**

담을 것:

- **`v0.5.6` 의 경고가 RSC 경로에서 뜨지 않던 것을 고쳤다.** 이유를 한 줄로 — 게이트가 거짓인 것은 서버 패스뿐인데 경고가 클라이언트 이펙트에만 있었다
- **경로별로 어느 콘솔에 뜨는지** — RSC 는 dev 서버 터미널, 클라이언트 쪽은 브라우저 콘솔. 소비자가 브라우저에서 찾다 못 찾은 것이 이 릴리스의 계기다
- **이제 CI 로 잡을 수 있다** — 서버 경고가 터미널 로그에 남는다
- **클라이언트 경고는 그대로다** — 옮긴 것이 아니라 더한 것이다
- **여전히 잡지 못하는 것** — 자식이 엘리먼트이지만 프롭을 삼키는 래퍼. `v0.5.6` 절과 같은 한계다
- 원인과 이번 확인을 `dashboard-shell` 이 알려줬다는 것

nav 항목을 더하고 `active` 를 `v0.5.6` 에서 옮긴다. 그룹 안에 `active` 는 정확히 하나다.

- [ ] **Step 3: 검사와 커밋**

```bash
cd /Users/neosimplix/coding/dashboard/common-ui
npm run check
grep -c 'href="#v0-5-7"' changelog.html          # 1
grep -c 'id="v0-5-7"' changelog.html             # 1
grep -c 'active></ns-nav-item>' changelog.html   # 1
grep -c 'v0-5-7' README.md                       # 1
git status --short
```

Expected: `check` 5/5(릴리스 표 대조에 `v0.5.7`), 넷 다 1, `git status` 에 두 파일.

```bash
git add changelog.html README.md
git commit -F - <<'EOF'
docs(changelog): v0.5.7 절과 릴리스 표 행을 더한다

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

## 이 계획이 끝난 뒤 (조정자가 한다)

- **사람 눈이 필요한 것을 사용자에게 직접 보고한다.** 서버 경고 문구가 터미널에서 읽을 만한지, `guide.html` 의 고친 절이 정상 렌더되는지.
- **`npm run release -- 0.5.7`** — `releasing` 스킬을 따르고 자른 뒤 검사 셋을 돌린다.
- **`dashboard-shell` 에 회신한다.** 담을 것: 자리를 하나 더 뒀다는 것(옮긴 것이 아니다)과 이유, **경로별로 어느 콘솔인지**, `guide.html` 의 거짓 문단을 고쳤다는 것, Chrome 의 감지 경로를 문서에 실었다는 것, 그리고 **우리가 ⑥의 교훈을 잘못 일반화했다**는 것 — 판단 기준은 "이펙트냐 렌더 본문이냐" 가 아니라 "조건이 어느 쪽에서 확정되는가" 였다.
