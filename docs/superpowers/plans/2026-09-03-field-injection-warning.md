# `Field` 주입 실패 경고 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `Field` 가 자식에 `id` 를 주입하지 못하면 dev 콘솔에 한 번 경고한다. 지금은 감지 수단이 하나도 없다.

**Architecture:** 판정은 `!isValidElement(children)` 하나다 — 렌더 시점에 확정되고 타이밍 의존이 없다. 경고는 `useEffect(…, [])` + `useRef` 가드로 인스턴스당 1회 낸다.

**Tech Stack:** React shim(`src/react/controls/Field.tsx`) 한 파일. 테스트 러너 없음(설계 결정). 검증은 `npm run check` 와 `react-dom` 스크래치 하네스다.

**근거:** `docs/superpowers/specs/2026-09-03-field-injection-warning-design.md` — 범위를 왜 좁혔는지의 실측이 거기 있다.

## Global Constraints

- **테스트 러너를 추가하지 않는다.** vitest·jest·playwright 금지, 저장소에 테스트 파일을 만들지 않는다. 검증 하네스는 저장소 **밖** 스크래치에 둔다.
- **커밋 메시지:** `<type>(<scope>): <subject>` — 한국어 명령조, 마침표 없음, 트레일러 `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.
- **`git push` 는 하지 않는다.** 태그는 조정자가 자른다.
- **공개 API 를 바꾸지 않는다.** `FieldProps` 는 그대로다 — 경고 하나가 늘 뿐이다.
- **문서 페이지에 리터럴 색을 쓰지 않고, 산문에 스크립트 태그를 리터럴로 쓰지 않는다**("스크립트" 로 적는다).
- **새 `id` 를 만들 때는 절 이름을 접두사로 붙인다.**
- **측정값·부정 단정은 적기 전에 실행해서 확인한다.** 확인 못 한 것은 확인 못 했다고 적는다.

---

### Task 1: `Field` 에 경고를 넣는다

**Files:**
- Modify: `src/react/controls/Field.tsx`

**Interfaces:**
- Consumes: 없음. Produces: 없음. `FieldProps` 와 렌더 결과가 그대로다.

**결함.** `Field.tsx:44` 의 `if (isValidElement(children))` 가 거짓이면 주입 블록 전체가 조용히 건너뛰어진다. `<label htmlFor>` 은 `useId()` 값을 받고 자식은 아무것도 못 받아 **라벨이 아무것도 가리키지 않는다.** 소비자는 Next 의 RSC 페이로드가 자식을 `React.lazy` 참조로 넘기는 배선에서 이것을 겪었고(`isValidElement=false`, `$$typeof=Symbol(react.lazy)`), **`next dev` 에서만** 나서 테스트도 프로덕션 빌드도 못 잡았다.

- [ ] **Step 1: 파일을 읽고 기존 경고 관례를 확인한다**

```bash
cd /Users/neosimplix/coding/dashboard/common-ui
cat src/react/controls/Field.tsx
cat src/react/tags/Sidebar.tsx
grep -rn 'console.warn' src/ | head
```

`Sidebar.tsx` 가 **바로 앞 릴리스에서 같은 문제를 푼 선례**다 — `useRef` 가드 + `useEffect(…, [])`. 그 형태와 메시지 모양(`[ns-x] …`)을 그대로 따른다. 새 형식을 만들지 않는다.

- [ ] **Step 2: 경고를 넣는다**

`Field` 함수 안에 넣는다. `import` 에 `useEffect`·`useRef` 를 더해야 하는지 먼저 확인한다.

```tsx
  /*
    자식이 React 엘리먼트가 아니면 위 게이트가 거짓이 되어 주입이 통째로
    건너뛰어진다 — label 은 useId 값을 갖는데 자식은 아무것도 못 받아
    라벨이 아무것도 가리키지 않는다. 조용히 깨지므로 경고가 유일한 감지 수단이다.

    Next 의 RSC 페이로드가 자식을 React.lazy 참조로 넘기면 이렇게 된다
    (isValidElement=false, $$typeof=Symbol(react.lazy)). lazy 로 감싸일지는 청크
    경계가 정하고 next dev 에서만 나므로, 테스트도 프로덕션 빌드도 못 잡는다.

    판정을 렌더 시점 값으로 하고 이펙트는 언제 찍을지만 정한다 — 타이밍 의존이
    없다. 렌더 본문에서 찍지 않는 이유는 Sidebar 와 같다: StrictMode 이중
    렌더에 두 번 나온다(실측 2 → 1).
  */
  const warnedRef = useRef(false);
  const injectable = isValidElement(children);
  useEffect(() => {
    if (injectable || warnedRef.current) return;
    warnedRef.current = true;
    console.warn(
      `[ns-field] label="${label}" 의 자식이 React 엘리먼트가 아니라 id 를 ` +
        "주입하지 못했습니다. label 이 아무것도 가리키지 않습니다 — 자식을 " +
        "클라이언트 컴포넌트에서 만들거나 수동 .ns-field 마크업을 쓰세요.",
    );
  }, [injectable, label]);
```

**`isValidElement(children)` 를 두 번 부르지 않는다** — 위 게이트가 이미 그 값을 쓰므로, 지역 변수로 뽑아 게이트와 이펙트가 같은 값을 보게 한다. 게이트 쪽도 그 변수를 쓰도록 고친다.

**`label` 을 메시지에 넣는 이유**는 한 화면에 `Field` 가 여럿일 때 어느 것인지 알려야 해서다.

- [ ] **Step 3: 스크래치 하네스로 잰다**

**저장소 안에 테스트 파일을 만들지 않는다.** 하네스는 저장소 밖에 둔다.

```bash
SP=/private/tmp/claude-501/-Users-neosimplix-coding-dashboard-common-ui/f08e70d4-e0c8-47cf-b5ee-30f658f9aaeb/scratchpad/rdom
ls "$SP"/check.mjs "$SP"/node_modules/@neosimplix/common-ui/dist/react.js
```

그 디렉터리에 `react@18` · `react-dom@18` · `jsdom` 과 `v0.5.5` 설치본이 이미 있다. **`check.mjs` 가 이번 세션에서 실제로 물었던 하네스다**(경고를 지우자 1 → 0). 그것을 본떠 `field-warn.mjs` 를 만든다.

빌드한 `dist` 를 그 프로젝트에 덮어 최신 코드를 잰다.

```bash
cd /Users/neosimplix/coding/dashboard/common-ui && npm run build
cp dist/react.js "$SP/node_modules/@neosimplix/common-ui/dist/react.js"
```

`check.mjs` 의 jsdom 부트스트랩을 그대로 쓴다 — `navigator` 는 Node 26 에서 getter 라 `try/catch` 로 건너뛴다. 네 경우를 잰다.

| 자식 | 기대 경고 |
|---|---|
| 평범한 엘리먼트(`<Input/>`) | 0 |
| 커스텀 엘리먼트(`<NsMultiSelect options={[]} value={[]}/>`) | 0 |
| `React.lazy(...)` 객체 그 자체를 children 으로 | 1 |
| 위와 같은 것을 `StrictMode` 안에서 | 1 |

`lazy` 객체를 children 으로 넘기면 렌더가 서스펜드하므로 `Suspense` 로 감싼다.

Expected: 위 표 그대로.

- [ ] **Step 4: 검사를 실패시켜 본다**

경고를 통째로 없앤 `dist` 를 만들어 같은 하네스를 돌린다 — 셋째가 **1 → 0** 이 되어야 한다. 같은 결과가 나오면 하네스가 아무것도 재지 않는 것이다.

소스를 고쳐 빌드하고 되돌리는 쪽이 미니파이 정규식보다 확실하다. **끝나면 소스를 원복하고 `git status` 가 깨끗한지 확인한다.**

- [ ] **Step 5: `npm run check` 와 커밋**

```bash
cd /Users/neosimplix/coding/dashboard/common-ui
npm run check
git status --short
```

Expected: `check` 5/5. `git status` 에 `src/react/controls/Field.tsx` 하나.

```bash
git add src/react/controls/Field.tsx
git commit -F - <<'EOF'
feat(field): 자식에 id 를 주입하지 못하면 경고한다

isValidElement 게이트가 거짓이면 주입이 통째로 건너뛰어져 label 이
아무것도 가리키지 않는데 지금까지 감지 수단이 없었다. next dev 에서만
나는 배선이라 테스트도 프로덕션 빌드도 잡지 못한다.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 2: 문서 — 원인이 밝혀진 자리를 고치고 범위를 남긴다

**Files:**
- Modify: `guide.html` (`Field` 절)
- Modify: `docs/gotchas.md` (파일 끝)

**Interfaces:**
- Consumes: Task 1. Produces: 없음.

- [ ] **Step 1: `guide.html` 의 「확정하지 못했다」를 고친다**

`Field` 절에 `v0.5.5` 때 넣은 문단이 있다 — `next dev` 에서만 깨진다는 것과 **"왜 dev 에서만 갈리는지는 우리도 확정하지 못했다"**. 찾아서 읽는다.

```bash
cd /Users/neosimplix/coding/dashboard/common-ui
grep -n '확정하지 못했다' guide.html
```

**이제 원인이 밝혀졌다.** 소비자가 `node_modules` 의 `Field` 에 로그를 넣어 계측했다.

```
깨지는 쪽 : isValidElement=false   $$typeof=Symbol(react.lazy)
정상인 쪽 : isValidElement=true    $$typeof=Symbol(react.transitional.element)
```

RSC 페이로드가 자식을 `React.lazy` 참조로 넘기면 `Field` 의 게이트가 거짓이 되어 주입이 건너뛰어진다. lazy 로 감싸일지는 **청크 경계**가 정하므로 조건이 까다롭고 프로덕션 빌드는 정상이다.

그 문단을 고쳐 쓴다. 담을 것:

- 원인은 `isValidElement` 게이트다
- **`"use client"` 우회가 왜 통하는가** — 자식 생성이 클라이언트로 옮겨가 평범한 엘리먼트가 된다. 문제는 `Field` 자신이 어느 쪽에 있느냐가 아니라 **자식이 어느 쪽에서 만들어졌느냐**다
- **`v0.5.6` 부터 경고가 난다** — 이제 감지 수단이 있다
- **출처를 밝힌다** — `dashboard-shell` 이 계측해 찾아냈다

**「확정하지 못했다」를 그냥 지우지 않는다** — 그 문장이 있던 자리에 밝혀진 원인이 들어가야, 이전 판을 읽은 사람이 무엇이 바뀌었는지 안다.

- [ ] **Step 2: `docs/gotchas.md` 에 범위 근거를 남긴다**

파일 **끝**에 절을 더한다. 담을 것:

- 게이트가 조용히 건너뛴다는 결함과 그것이 왜 안 잡히는지(테스트에 RSC 경계가 없고 프로덕션 빌드는 정상)
- **`lazy` 가 판별자가 아니다** — 실측: `lazy` + 내부가 프롭 전달이면 정상, 프롭 무시면 깨지고, **일반 컴포넌트 + 프롭 무시도 똑같이 깨진다.** 진짜 판별자는 "자식이 프롭을 labelable 요소까지 전달하는가" 이고 렌더 시점에 알 수 없다
- **그래서 프롭 무시 래퍼는 잡지 않는다.** `Field` 만의 문제가 아니라 React 의 일반적 성질이다
- **결과 검사를 왜 안 썼는가** — 이펙트 시점에 `document.getElementById(label.htmlFor)` 를 보면 프롭 무시 래퍼까지 잡히지만, **마커 경로에서 거짓 양성**이다(실측: 네이티브 `INPUT`, 프롭 무시 `null`, lazy `null`, **커스텀 엘리먼트 `null`**). 안쪽 `<input>` 의 `id` 를 Lit 이 마이크로태스크에서 쓰기 때문이다 — `ns-sidebar` 경고에서 설계를 되돌리게 만든 그 함정과 같다
- **조사 중에 우리가 한 번 잘못 짚었다** — "lazy 엘리먼트도 깨진다" 는 관찰을 했는데 프로브가 프롭을 무시하는 컴포넌트를 쓴 탓이었다. 철회했다. 부재나 실패를 근거로 삼기 전에 그 조건이 진짜 원인인지 갈라 본다

- [ ] **Step 3: 검사와 커밋**

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

Expected: `check` 5/5. 구조 검사 첫 줄 `index.html` **0**, 나머지 **1**, 다른 셋은 출력 없음.

```bash
git add guide.html docs/gotchas.md
git commit -F - <<'EOF'
docs(field): 주입 실패의 원인을 밝히고 경고 범위의 근거를 남긴다

dashboard-shell 이 계측해 찾아낸 isValidElement 게이트가 원인이다.
lazy 가 판별자가 아니라는 것과 결과 검사가 마커 경로에서 거짓 양성이라는
실측도 함께 남긴다.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 3: v0.5.6 릴리스 기록

**Files:**
- Modify: `changelog.html` (절 + 사이드바 nav 항목)
- Modify: `README.md` (릴리스 표 행)

**Interfaces:**
- Consumes: Task 1~2. Produces: 없음.

**셋을 함께 만든다** — 절, nav 항목, README 행. `v0.5.3` 에서 nav 를 빼먹어 리뷰에 잡혔고 그 뒤로는 반복하지 않았다.

- [ ] **Step 1: 기존 절의 모양을 읽는다**

```bash
cd /Users/neosimplix/coding/dashboard/common-ui
grep -n 'id="v0-5-5"\|href="#v0-5-5"' changelog.html
grep -n 'v0-5-5' README.md
```

- [ ] **Step 2: 절·nav·README 행을 만든다**

버전은 `0.5.6`. `dist/` 는 **변경**이다(shim 이 바뀐다). **breaking 없다.**

담을 것:

- **`Field` 가 자식에 `id` 를 주입하지 못하면 경고한다.** 언제 나는지(자식이 React 엘리먼트가 아닐 때), 왜 중요한지(그전에는 감지 수단이 전혀 없었다 — 테스트도 프로덕션 빌드도 못 잡는다)
- **런타임 동작은 안 바뀐다** — 경고만 는다
- **잡지 못하는 것도 적는다** — 프롭을 무시하는 래퍼는 이 경고가 잡지 못한다. 정적으로 알 수 없다
- 원인을 `dashboard-shell` 이 계측해 찾아줬다는 것

nav 항목을 더하고 `active` 를 `v0.5.5` 에서 옮긴다. 그룹 안에 `active` 는 정확히 하나다.

- [ ] **Step 3: 검사와 커밋**

```bash
cd /Users/neosimplix/coding/dashboard/common-ui
npm run check
grep -c 'href="#v0-5-6"' changelog.html          # 1
grep -c 'id="v0-5-6"' changelog.html             # 1
grep -c 'active></ns-nav-item>' changelog.html   # 1
grep -c 'v0-5-6' README.md                       # 1
git status --short
```

Expected: `check` 5/5(릴리스 표 대조에 `v0.5.6` 이 나타난다), 넷 다 1, `git status` 에 두 파일.

```bash
git add changelog.html README.md
git commit -F - <<'EOF'
docs(changelog): v0.5.6 절과 릴리스 표 행을 더한다

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

## 이 계획이 끝난 뒤 (조정자가 한다)

- **사람 눈이 필요한 것을 사용자에게 직접 보고한다.** 이번엔 짧다 — 경고 문구가 콘솔에서 읽을 만한지, `guide.html` 의 고친 문단이 정상 렌더되는지.
- **`npm run release -- 0.5.6`** — `releasing` 스킬을 따르고 자른 뒤 검사 셋을 돌린다. 첫 검사 패턴은 `onNs[A-Za-z]+\??:` 로 넓혀져 있다.
- **`dashboard-shell` 에 회신한다.** 담을 것: 경고가 나갔다는 것, **범위를 `!isValidElement` 로 좁힌 이유**(프롭 무시 래퍼는 못 잡는다), 선택 요청 2번(context 로 전환)은 하지 않았다는 것과 그 이유, 그리고 우리가 조사 중에 "lazy 엘리먼트도 깨진다" 를 잘못 짚었다가 철회한 것.
