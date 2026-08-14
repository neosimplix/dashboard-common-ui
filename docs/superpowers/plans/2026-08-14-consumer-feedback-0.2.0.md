# 소비자 피드백 반영 0.2.0 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `v0.1.5` 소비자가 보고한 다섯 항목을 라이브러리에서 없앤다 — 토큰 이름 충돌, SSR 사이드바 튐, 배지 오해, 아이콘 자리 부재, 다크모드 미구현.

**Architecture:** 네 묶음이다. ① `tokens.css` 의 공개 토큰 47개를 `--ns-` 로 옮기고 옵트인 별칭 시트를 생성한다. ② 정의 전 레이아웃 예약을 `:not(:defined)` 로 바꾸고 React 는 `Sidebar` shim 이 `data-ns-open` 을 서버 마크업에 싣는다. ③ `ns-nav-item` 의 배지를 `leading` 슬롯의 폴백으로 옮긴다. ④ `color-scheme` + `light-dark()` 로 다크모드를 넣는다.

**Tech Stack:** Lit 3 · `@lit/react` · Vite · TypeScript · 순수 CSS. **빌드 없이 손으로 쓰는 정적 CSS 두 개**(`tokens.css`, `controls.css`)가 핵심 자산이다.

**설계 근거:** `docs/superpowers/specs/2026-08-14-common-ui-consumer-feedback-design.md`. 판단이 갈리면 그 문서가 이긴다.

## Global Constraints

- **테스트 러너를 추가하지 않는다.** vitest·jest·playwright·web-test-runner 금지, 테스트 파일 금지. 회귀 확인은 `npm run check` 와 `index.html` 육안 확인 둘뿐이다. (`.claude/rules/verification.md`)
- **검사를 새로 만들거나 고치면 일부러 깨뜨려 실제로 실패하는지 확인한다.** 의도한 이유로 실패했는지까지 본다.
- **브라우저 확인은 사람이 한다.** 구현자는 화면을 볼 수 없다. **하지 않은 확인을 했다고 보고하지 않는다.** 보고서에 정적 확인과 육안 필요를 나눠 적는다.
- **커밋 메시지**는 `<type>(<scope>): <한국어 제목>`. 마침표 없음, 명령조. (`.claude/rules/commit.md`)
- **`git push` 는 사용자가 명시적으로 요청할 때만** 한다. 태스크 끝은 로컬 커밋까지다.
- **컴포넌트 스타일에 `var()` 폴백을 쓰지 않는다.** 유일한 예외는 `--ns-label-display`.
- **`:host-context()` 를 쓰지 않는다.** Chromium 전용이다.
- **`@customElement` 데코레이터를 쓰지 않는다.** `src/internal/register.ts` 를 쓴다.
- **호스트의 속성을 `setAttribute` 로 덮지 않는다.** 숨길 것은 shadow 안의 요소에 붙인다.
- 브라우저 요구사항(이 계획이 새로 도입): **Chrome 123 · Safari 17.5 · Firefox 120** 이상 (`light-dark()`).
- 각 태스크는 `npm run check` 통과 후 커밋한다. 빨간 상태로 커밋하지 않는다.

## File Structure

| 파일 | 책임 | 태스크 |
|---|---|---|
| `src/tokens/tokens.css` | 토큰 정의(접두사·다크·`@no-alias` 블록), 정의 전 레이아웃 예약 | 1·4·6 |
| `src/components/*/*.styles.ts` | shadow CSS 의 토큰 참조 | 1 |
| `src/controls/controls.css` | `.ns-*` 클래스의 토큰 참조 | 1 |
| `src/components/skeleton/ns-skeleton.ts` | 동적 토큰 이름 조립 | 1 |
| `src/internal/warn-missing-tokens.ts` | 미로드 감지 대상 이름 | 1 |
| `scripts/check-tokens.mjs` | **신규.** 토큰 참조 규칙 검사 | 2 |
| `scripts/copy-css.mjs` | `dist/` 복사 + `aliases.css` **생성** | 3 |
| `src/react/elements.ts` | `createComponent` 래퍼. 이벤트 매핑 단일 출처 | 4 |
| `src/react/tags/Sidebar.tsx` | **신규.** SSR 속성 채널 shim | 4 |
| `src/react/index.ts` | 공개 export 목록 | 4 |
| `docs/consumer-example.tsx` | 소비자 관점 타입 검사 대상 | 4 |
| `src/components/nav-item/ns-nav-item.{ts,styles.ts}` | `leading` 슬롯 | 5 |
| `index.html` | 문서 겸 플레이그라운드 | 1·4·5·6·7 |
| `.claude/rules/*.md`, `docs/*.md`, `README.md` | 규칙과 근거 | 7 |

---

## Task 1: 토큰 `--ns-` 접두사 전환

**Files:**
- Modify: `src/tokens/tokens.css` (정의 56개 + 참조)
- Modify: `src/components/{dialog,header,icon,nav-group,nav-item,page-heading,sidebar,skeleton}/ns-*.styles.ts` (8개)
- Modify: `src/controls/controls.css`
- Modify: `src/components/skeleton/ns-skeleton.ts:31`
- Modify: `src/internal/warn-missing-tokens.ts:9`
- Modify: `index.html` (`<style>` 블록, 인라인 `style` 속성, `swatchNames` 배열)

**Interfaces:**
- Produces: 모든 공개 토큰이 `--ns-` 접두사를 갖는다. 이후 모든 태스크가 이 이름을 쓴다 — `--ns-color-surface`, `--ns-space-4`, `--ns-sidebar-width`, `--ns-sidebar-width-collapsed`, `--ns-radius-panel` 등.
- Consumes: 없음. 첫 태스크다.

**왜 기계 치환이 안전한가.** 모든 이름이 같은 접두사를 얻으므로 **부분 겹침이 문제가 되지 않는다.** `--color-line` → `--ns-color-line` 치환이 `--color-line-strong` 에 걸려도 결과는 `--ns-color-line-strong` 으로 정확하다. 순서를 고민할 필요가 없다.

**왜 `var(` 로 앵커해야 하는가.** `controls.css` 와 `index.html` 에는 BEM 변형 클래스 `.ns-button--outline`, `.ns-input--sm` 이 널려 있다. `--` 만 보고 치환하면 `.ns-button--ns-outline` 이 된다. **반드시 `var(--` 와 정의 위치만 잡는다.**

- [ ] **Step 1: 전환 전 개수를 센다 (나중에 대조할 기준값)**

```bash
grep -oh 'var(--[a-z0-9-]*' src/components/*/*.styles.ts src/controls/controls.css src/tokens/tokens.css \
  | sed 's/var(//' | sort -u | grep -vc '^--ns-'
```

Expected: `48`

`-h` 가 필요하다. 없으면 `grep -o` 가 파일명을 앞에 붙여 같은 이름이 파일마다 따로 세어진다.

내역: `styles.ts` + `controls.css` 가 참조하는 서로 다른 이름 51개 중 이미 `--ns-` 인 4개를 뺀 47개, 거기에 `tokens.css` 안에서만 참조되는 `--space-8` 하나를 더한 값이다.

- [ ] **Step 2: 치환 스크립트를 스크래치패드에 쓴다**

프로젝트에 남기지 않는다. 일회용이다. 경로는 세션 스크래치패드 디렉터리를 쓴다.

```js
// prefix-tokens.mjs
import { readFileSync, writeFileSync, readdirSync } from "node:fs";

const styleFiles = readdirSync("src/components", { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .flatMap((d) =>
    readdirSync(`src/components/${d.name}`)
      .filter((f) => f.endsWith(".styles.ts"))
      .map((f) => `src/components/${d.name}/${f}`),
  );

// var(--x) 참조만 바꾼다. BEM 변형(.ns-button--outline)에 걸리지 않게 var( 로 앵커한다.
// (?!ns-) 는 이미 접두사가 있는 --ns-icon-size 등의 이중 접두사를 막는다.
const REF = /var\(\s*--(?!ns-)/g;

for (const f of [...styleFiles, "src/controls/controls.css", "index.html"]) {
  const before = readFileSync(f, "utf8");
  const n = (before.match(REF) ?? []).length;
  writeFileSync(f, before.replace(REF, "var(--ns-"));
  console.log(`${f}: ${n} 건`);
}

/*
  tokens.css 는 참조와 정의 둘 다 바꾼다.

  정의를 `^\s*--` 로 잡으면 안 된다. 타이포 블록 여섯 줄이 한 줄에 정의를
  둘씩 담고 있다(`--font-size-2xs: …; --line-height-2xs: …;`). 줄 머리만
  보면 그 여섯을 놓치고, 놓친 이름은 컴포넌트 쪽만 --ns- 로 바뀐 채
  정의는 무접두사로 남아 화면에서 조용히 빈다.

  경계는 줄 머리 또는 세미콜론 뒤다.
*/
{
  const f = "src/tokens/tokens.css";
  const DEF = /(^|;)(\s*)--(?!ns-)/gm;
  const before = readFileSync(f, "utf8");
  const after = before.replace(REF, "var(--ns-").replace(DEF, "$1$2--ns-");
  writeFileSync(f, after);
  console.log(`${f}: 정의 ${(before.match(DEF) ?? []).length} 건`);
}
```

- [ ] **Step 3: 실행한다**

```bash
node <스크래치패드>/prefix-tokens.mjs
```

Expected: `src/tokens/tokens.css: 정의 59 건`

`tokens.css` 의 정의는 모두 62개이고 그중 셋(`--ns-icon-size` · `--ns-dialog-width` · `--ns-dialog-margin`)은 이미 접두사가 있어 대상이 아니다. **59 가 아니면 멈춘다** — 놓친 정의는 컴포넌트만 `--ns-` 로 바뀐 채 남아 화면에서 조용히 빈다. 특히 타이포 블록 여섯 줄이 한 줄에 정의를 둘씩 담고 있으니 그 열둘이 다 잡혔는지 본다.

- [ ] **Step 4: 기계가 못 잡은 셋을 손으로 고친다**

`var(` 앵커에 걸리지 않는 곳이다.

`src/components/skeleton/ns-skeleton.ts:31` — 이름을 문자열로 조립한다.

```ts
    return RADIUS_TOKENS.has(this.radius) ? `var(--ns-radius-${this.radius})` : this.radius;
```

`src/internal/warn-missing-tokens.ts:9` — `getPropertyValue` 인자.

```ts
  getComputedStyle(document.documentElement).getPropertyValue("--ns-color-line").trim() !== "";
```

`index.html` 의 `swatchNames` 배열(1993줄 부근) — 따옴표 문자열이다.

```js
  const swatchNames = [
    "--ns-color-surface", "--ns-color-surface-sunken", "--ns-color-surface-hover",
    "--ns-color-line", "--ns-color-line-strong",
    "--ns-color-fg", "--ns-color-fg-body", "--ns-color-fg-muted", "--ns-color-fg-subtle",
    "--ns-color-accent", "--ns-color-accent-hover", "--ns-color-accent-fg", "--ns-color-disabled",
    "--ns-color-danger", "--ns-color-danger-surface", "--ns-color-warn", "--ns-color-warn-surface",
    "--ns-color-success", "--ns-color-success-surface",
  ];
```

- [ ] **Step 5: `tokens.css` 머리말 주석을 고친다**

치환기가 주석 안의 `var(--space-3)` 도 바꿔 놓아 문장이 앞뒤가 안 맞는다. 근거 자체가 바뀌었으므로 다시 쓴다.

```css
/*
  common-ui 디자인 토큰.

  모든 이름에 --ns- 접두사를 붙인다. 붙이지 않던 0.1.5 에서 두 번째 소비자의
  --color-surface 와 이름만 겹치고 값 체계가 달라, 임포트 순서가 셸 색을
  결정하는 상태가 됐다. 컴포넌트 스타일은 var() 폴백 없이 이 이름들을 읽으므로
  이름을 공유하면 라이브러리 렌더링이 소비자 캐스케이드에 종속된다.

  이미 무접두사 이름을 쓰던 프로젝트는 dist/aliases.css 를 임포트한다.
  그 파일은 이 파일에서 생성된다(scripts/copy-css.mjs).

  색 값은 Tailwind v4 기본 팔레트(oklch)에서 그대로 가져왔다. 이 파일은
  Tailwind 에 의존하지 않으므로 순수 HTML 에서도 동작한다.
*/
```

- [ ] **Step 6: 남은 무접두사 참조가 0인지 확인한다**

```bash
grep -rn 'var(--[a-z]' src/ index.html | grep -v 'var(--ns-'
```

Expected: 출력 없음

BEM 변형이 망가지지 않았는지도 본다.

```bash
grep -c 'ns-button--ns-\|ns-input--ns-\|ns-table--ns-' src/controls/controls.css index.html
```

Expected: 두 줄 모두 `0`

- [ ] **Step 7: 타입·매핑·문서 검사**

Run: `npm run check`
Expected: 네 검사 전부 통과. 토큰은 CSS 레이어라 타입 검사가 보지 못하므로 **이 단계는 회귀가 없다는 증거가 아니다** — Step 6 의 `grep` 과 Step 8 의 육안이 실제 증거다.

- [ ] **Step 8: 빌드하고 육안 확인을 사람에게 넘긴다**

Run: `npm run build`
Expected: 오류 없이 `dist/` 생성

**사람이 확인할 것:** `npm run demo` 로 `index.html` 을 열어 ① 헤더·사이드바가 정상 색으로 그려지는지 ② "디자인 토큰" 절의 색 견본 19개가 전부 채워져 보이는지(빈 칸이 있으면 그 이름의 치환이 어긋난 것) ③ 버튼·입력 등 `.ns-*` 클래스 데모의 색과 간격이 유지되는지.

- [ ] **Step 9: 커밋**

```bash
git add -A
git commit -m "refactor(tokens): 공개 토큰 47개에 --ns- 접두사를 붙여 소비자 이름공간과 분리"
```

---

## Task 2: `check-tokens.mjs` — 토큰 참조 검사

**Files:**
- Create: `scripts/check-tokens.mjs`
- Modify: `package.json` (`check` 스크립트에 추가)

**Interfaces:**
- Consumes: Task 1 이 만든 `--ns-` 이름 체계.
- Produces: `npm run check` 의 넷째 검사. 이후 태스크가 토큰을 추가·참조할 때마다 이 검사가 돈다.

**이 검사가 필요한 이유.** 토큰 참조는 CSS 문자열이라 `tsc` 가 보지 못한다. 다음에 누가 `var(--color-line)` 을 다시 적어도 타입 검사도 빌드도 통과하고, 화면에서는 그 속성만 조용히 무효가 된다.

**두 규칙.**
1. `src/**/*.ts`, `src/controls/controls.css`, `src/tokens/tokens.css` 의 모든 `var(--x)` 는 `--ns-` 로 시작해야 한다.
2. 이름이 리터럴이면 `tokens.css` 에 정의돼 있거나 내부 배선 화이트리스트에 있어야 한다. `ns-skeleton.ts` 의 `` `var(--ns-radius-${this.radius})` `` 처럼 조립되는 이름은 ②를 건너뛴다 — 값을 알 수 없다.

- [ ] **Step 1: 검사 스크립트를 쓴다**

```js
// scripts/check-tokens.mjs
/*
  컴포넌트와 클래스가 참조하는 커스텀 프로퍼티가 규칙을 지키는지 확인한다.

  토큰 참조는 CSS 문자열이라 tsc 가 보지 못한다. var(--color-line) 을 다시
  적어도 타입 검사와 빌드가 통과하고, 화면에서 그 속성만 조용히 무효가 된다.
  0.1.5 에서 토큰 이름을 소비자와 공유하다 겪은 고장이 정확히 그 종류였다.

  두 규칙:
    ① 모든 var(--x) 는 --ns- 로 시작한다.
    ② 이름이 리터럴이면 tokens.css 에 정의돼 있거나 WIRING 에 있어야 한다.

  ②를 건너뛰는 경우가 하나 있다. ns-skeleton.ts 는 `var(--ns-radius-${this.radius})`
  로 이름을 조립하므로 정적으로 확인할 수 없다. 이름에 ${ 가 있으면 ①만 본다.

  tokens.css 자신도 검사 대상이다. 파생 토큰(--ns-page-padding-x 등)과 정의 전
  레이아웃 예약 규칙(ns-header 등)이 그 안에서 var() 로 다른 토큰을 참조하므로,
  대상에서 빠지면 거기서 접두사를 빠뜨려도 잡히지 않는다. tokens.css 는 정의와
  참조를 동시에 담으므로 규칙 ②는 자기 자신과도 일관돼야 한다 — 참조하는 이름은
  전부 같은 파일에 정의돼 있어야 한다.

  한계: 참조가 규칙을 지키는지만 본다. 그 토큰이 화면에서 옳은 값인지는
  index.html 육안 확인의 몫이다.
*/
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/* tokens.css 에 정의하지 않는 내부 배선. 소비자가 덮는 값이 아니라 신호다. */
const WIRING = new Set(["--ns-label-display"]);

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return walk(p);
    return /\.(ts|tsx)$/.test(p) ? [p] : [];
  });

/*
  정의를 줄 머리로만 잡으면 안 된다. 타이포 블록 여섯 줄이 한 줄에 정의를
  둘씩 담고 있다(`--ns-font-size-2xs: …; --ns-line-height-2xs: …;`).
  경계는 줄 머리 또는 세미콜론 뒤다.
*/
const tokens = readFileSync("src/tokens/tokens.css", "utf8");
const defined = new Set(
  [...tokens.matchAll(/(?:^|;)\s*(--[a-z0-9-]+)\s*:/gm)].map((m) => m[1]),
);

const targets = [...walk("src"), "src/controls/controls.css", "src/tokens/tokens.css"];

const badPrefix = [];
const unknown = [];

for (const file of targets) {
  const source = readFileSync(file, "utf8");
  for (const m of source.matchAll(/var\(\s*(--[^),\s]+)/g)) {
    const name = m[1];
    if (!name.startsWith("--ns-")) {
      badPrefix.push(`${file}: ${name}`);
      continue;
    }
    if (name.includes("${")) continue;          // 조립되는 이름은 ②를 건너뛴다
    if (defined.has(name) || WIRING.has(name)) continue;
    unknown.push(`${file}: ${name}`);
  }
}

if (badPrefix.length > 0) {
  console.error("--ns- 접두사가 없는 토큰 참조:\n  " + badPrefix.sort().join("\n  "));
  process.exit(1);
}

if (unknown.length > 0) {
  console.error(
    "tokens.css 에 정의되지 않은 토큰을 참조합니다:\n  " + unknown.sort().join("\n  "),
  );
  process.exit(1);
}

console.log(`토큰 참조 확인 완료: ${defined.size} 개 정의, ${targets.length} 개 파일 검사`);
```

- [ ] **Step 2: 통과하는지 본다**

Run: `node scripts/check-tokens.mjs`
Expected: `토큰 참조 확인 완료: 62 개 정의, …` — **62 가 아니면 Task 1 이 정의를 빠뜨렸다.**

- [ ] **Step 3: 규칙 ①로 일부러 깨뜨린다**

`src/components/nav-item/ns-nav-item.styles.ts` 에서 `var(--ns-space-2)` 한 곳을 `var(--space-2)` 로 되돌린다.

Run: `node scripts/check-tokens.mjs`
Expected: exit 1, `--ns- 접두사가 없는 토큰 참조:` 에 그 파일과 `--space-2` 가 찍힌다.

**의도한 이유로 실패했는지 본다.** 다른 오류(파일 못 읽음, 정규식 예외)로 죽었으면 규칙 ①은 여전히 미검증이다.

되돌린다.

- [ ] **Step 4: 규칙 ②로 일부러 깨뜨린다**

같은 파일에서 `var(--ns-space-2)` 를 `var(--ns-space-7)`(존재하지 않는 토큰)로 바꾼다.

Run: `node scripts/check-tokens.mjs`
Expected: exit 1, `tokens.css 에 정의되지 않은 토큰을 참조합니다:` 에 `--ns-space-7` 이 찍힌다.

되돌린다.

- [ ] **Step 5: `npm run check` 에 넣는다**

`package.json` 의 `scripts.check` 를 고친다.

```json
    "check": "tsc -p tsconfig.json && tsc -p tsconfig.consumer.json && node scripts/check-events.mjs && node scripts/check-controls.mjs && node scripts/check-tokens.mjs",
```

- [ ] **Step 6: 전체 검사**

Run: `npm run check`
Expected: 다섯 검사 전부 통과

- [ ] **Step 7: 커밋**

```bash
git add scripts/check-tokens.mjs package.json
git commit -m "test(tokens): 토큰 참조 접두사·정의 여부 검사를 check 에 추가"
```

---

## Task 3: `aliases.css` 생성기

**Files:**
- Modify: `scripts/copy-css.mjs`
- Modify: `src/tokens/tokens.css` (`@no-alias` 블록 정리)
- Modify: `package.json` (`exports` 에 `./aliases.css`)

**Interfaces:**
- Consumes: Task 1 의 `--ns-` 이름.
- Produces: `dist/aliases.css`. `@neosimplix/common-ui/aliases.css` 로 임포트된다. 각 줄은 `--<name>: var(--ns-<name>);`.

**왜 손으로 쓰지 않는가.** 별칭이 존재하지 않는 토큰을 가리키면 그 이름이 조용히 비고, 값이 두 곳에 존재하면 어긋난다 — 이 저장소가 `var()` 폴백을 금지한 것과 같은 이유다. `tokens.css` 에서 생성하면 어긋날 방법이 없다.

**`@no-alias` 가 필요한 이유.** `--ns-icon-size` · `--ns-dialog-width` · `--ns-dialog-margin` 은 0.1.5 에서도 `--ns-` 였다. 무접두사 원본이 없으므로 별칭을 만들면 아무도 쓰지 않는 `--icon-size` 가 생긴다.

- [ ] **Step 1: `tokens.css` 의 배선 토큰 셋을 한 블록으로 모으고 표시한다**

지금 `--ns-icon-size` 와 `--ns-dialog-width`/`--ns-dialog-margin` 은 각각 다른 주석 아래 떨어져 있다. 하나로 모으고 머리에 표시를 단다. **기존 주석의 설명은 그대로 옮긴다** — shadow 경계 때문에 요소 선택자가 아니라 커스텀 프로퍼티라는 설명이 사라지면 안 된다.

`:root` 블록 맨 끝에 둔다.

```css
  /*
    @no-alias

    아래는 0.1.5 에서도 --ns- 였던 것들이다. 무접두사 원본이 없으므로
    aliases.css 생성에서 제외한다. scripts/copy-css.mjs 가 이 표시를 읽는다.
    표시는 이 주석 하나뿐이고, 여기부터 :root 블록 끝까지가 대상이다.
  */

  /*
    ns-icon 의 크기. 요소 선택자 대신 커스텀 프로퍼티인 이유는 shadow 경계다 —
    요소 선택자는 문서 트리에만 적용되므로 ns-dialog 의 shadow 안에 있는
    <ns-icon> 에 닿지 못한다. 커스텀 프로퍼티는 상속되므로 중첩 shadow 까지
    도달한다.
  */
  --ns-icon-size: 1.25rem;

  /*
    ns-dialog 의 치수. 폭과 여백을 나눠 두는 이유가 있다 — 컴포넌트가
    min(폭, 100vw - 여백) 으로 감싸므로, 소비자가 --ns-dialog-width 만 키워도
    작은 화면에서 넘치지 않는다. 하나로 합치면 소비자가 min() 째로 덮어써서
    그 보호가 사라진다.

    32rem 은 화면 비율이 아니라 절대 상한이다. 큰 모니터에서도 512px 이다.
    넓은 폼 대화상자는 인스턴스에서 --ns-dialog-width 를 올린다.
  */
  --ns-dialog-width: 32rem;
  --ns-dialog-margin: var(--ns-space-8);
```

- [ ] **Step 2: `copy-css.mjs` 에 생성 단계를 더한다**

파일 끝에 붙인다. 기존 복사 루프는 그대로 둔다.

```js
/*
  aliases.css 를 tokens.css 에서 생성한다.

  0.1.5 까지 토큰 이름에는 접두사가 없었다. 이미 var(--space-3) 형태로 이
  이름들을 직접 참조하던 프로젝트(dashboard-shell 의 25개 파일)를 위해 옵트인
  별칭을 제공한다.

  **이 파일은 임포트하는 순간 0.1.5 의 이름 충돌을 그대로 재현한다. 그게
  목적이다.** 새 프로젝트는 임포트하지 않는다.

  손으로 쓰지 않는 이유: 두 파일이 어긋나면 별칭이 존재하지 않는 토큰을
  가리키고, 그 이름은 화면에서 조용히 빈다. 생성하면 어긋날 방법이 없다.

  @no-alias 주석 이후의 정의는 건너뛴다. --ns-icon-size 등은 0.1.5 에서도
  --ns- 였으므로 무접두사 원본이 존재하지 않는다.
*/
import { readFileSync, writeFileSync } from "node:fs";

const tokens = readFileSync("src/tokens/tokens.css", "utf8");
const aliasable = tokens.split("@no-alias")[0];

/* 경계는 줄 머리 또는 세미콜론 뒤다. 타이포 블록은 한 줄에 정의가 둘이다. */
const names = [...aliasable.matchAll(/(?:^|;)\s*--ns-([a-z0-9-]+)\s*:/gm)].map((m) => m[1]);

if (names.length === 0) {
  console.error("aliases.css: tokens.css 에서 토큰을 하나도 찾지 못했습니다");
  process.exit(1);
}

const aliases = [
  "/*",
  "  0.1.5 의 무접두사 토큰 이름 → 0.2.0 의 --ns- 이름.",
  "",
  "  **이미 무접두사 이름을 쓰던 프로젝트만 임포트한다.** 이 파일은 소비자",
  "  문서의 :root 와 같은 이름공간에 값을 정의하므로, 새 프로젝트가 임포트하면",
  "  0.1.5 에서 겪은 충돌이 그대로 돌아온다.",
  "",
  "  scripts/copy-css.mjs 가 tokens.css 에서 생성한다. 손으로 고치지 않는다.",
  "*/",
  ":root {",
  ...names.map((n) => `  --${n}: var(--ns-${n});`),
  "}",
  "",
].join("\n");

writeFileSync("dist/aliases.css", aliases);
console.log(`생성 완료: dist/aliases.css (${names.length} 개)`);
```

- [ ] **Step 3: `package.json` 에 export 를 더한다**

`exports` 의 `"./controls.css"` 다음 줄에 넣는다.

```json
    "./aliases.css": "./dist/aliases.css",
```

`files` 는 이미 `"dist"` 를 통째로 포함하므로 손대지 않는다.

- [ ] **Step 4: 빌드하고 결과를 확인한다**

Run: `npm run build`
Expected: `생성 완료: dist/aliases.css (59 개)` — 정의 62개에서 `@no-alias` 블록의 셋을 뺀 값이다.

개수를 직접 대조한다. **세미콜론 뒤 정의까지 세야 한다** — 타이포 블록 여섯 줄이 한 줄에 정의를 둘씩 담고 있어 줄 머리만 세면 여섯이 빈다.

```bash
echo "정의 전체:   $(grep -oE '(^|;)\s*--ns-[a-z0-9-]+\s*:' src/tokens/tokens.css | wc -l)"
echo "no-alias 후: $(awk '/@no-alias/,0' src/tokens/tokens.css | grep -oE '(^|;)\s*--ns-[a-z0-9-]+\s*:' | wc -l)"
echo "생성된 별칭: $(grep -cE '^\s+--[a-z0-9-]+: var\(' dist/aliases.css)"
```

Expected: `정의 전체 − no-alias 후 = 생성된 별칭` (62 − 3 = 59)

- [ ] **Step 5: 배선 토큰이 새어 나가지 않았는지 본다**

```bash
grep -n 'icon-size\|dialog-width\|dialog-margin' dist/aliases.css
```

Expected: 출력 없음

- [ ] **Step 6: 검사와 커밋**

Run: `npm run check`
Expected: 다섯 검사 전부 통과

```bash
git add scripts/copy-css.mjs src/tokens/tokens.css package.json
git commit -m "feat(tokens): 무접두사 이름을 위한 옵트인 aliases.css 를 tokens.css 에서 생성"
```

---

## Task 4: SSR 상태 채널 — `:not(:defined)` 예약과 `Sidebar` shim

**Files:**
- Modify: `src/tokens/tokens.css` (정의 전 레이아웃 예약 블록)
- Create: `src/react/tags/Sidebar.tsx`
- Modify: `src/react/elements.ts` (`NsSidebar` → `NsSidebarBase`)
- Modify: `src/react/index.ts` (export 교체)
- Modify: `docs/consumer-example.tsx` (`NsSidebar` → `Sidebar`)
- Modify: `index.html` ("SSR 과 사이드바 너비" 절, `ns-sidebar` 프로퍼티 표)
- Modify: `.claude/rules/verification.md` ("일곱 중 여섯" 서술)

**Interfaces:**
- Consumes: Task 1 의 `--ns-sidebar-width` · `--ns-sidebar-width-collapsed`.
- Produces:
  - `Sidebar` — 공개 React 컴포넌트. `SidebarProps = { open: boolean; onNavigate?: (detail: NsNavigateDetail) => void; children?: ReactNode; className?: string; style?: CSSProperties }`
  - `NsSidebarBase` — `elements.ts` 의 비공개 래퍼. `index.ts` 가 내보내지 않는다.
  - `data-ns-open` — 서버 마크업에 실리는 훅 속성. `tokens.css` 가 읽는다.

**메커니즘.** `createComponent` 는 `elementClass` 의 반응형 프로퍼티(`open`)를 가로채 `useLayoutEffect` 에서 프로퍼티로 설정하고 `React.createElement` 에는 넘기지 않는다. 서버에서는 layout effect 가 실행되지 않으므로 속성이 마크업에 없다. **반응형 프로퍼티가 아닌 이름은 가로채이지 않고 그대로 흘러가 서버 마크업에 실린다.** 그 통로가 `data-ns-open` 이다.

- [ ] **Step 1: 메커니즘 서술을 실물로 확인한다**

`node_modules` 가 없으면 먼저 설치한다.

```bash
[ -d node_modules ] || npm install
grep -n 'elementProps\|createElement\|reactProps' node_modules/@lit/react/development/create-component.js
```

**확인할 것:** 반응형 프로퍼티가 `elementProps` 로 분리되어 `useLayoutEffect` 에서 설정되고, 나머지만 `createElement` 에 넘어가는가.

**서술과 다르면 여기서 멈추고 보고한다.** `data-ns-open` 통로가 성립하지 않으면 이 태스크의 전제가 무너진다. 그 경우 `open` 을 `@property({ attribute: "open", reflect: true })` 로 두고 shim 이 `open` 대신 별도 속성만 쓰는 대안을 검토해야 하는데, 그것은 별도 설계 판단이다.

- [ ] **Step 2: `tokens.css` 의 정의 전 레이아웃 예약을 다시 쓴다**

**`ns-header` 와 `ns-sidebar` 두 줄만 바꾼다.** 같은 블록에 있는 `ns-icon` · `ns-page-heading` · `ns-skeleton` · `ns-dialog:not(:defined)` 규칙은 그대로 둔다 — 특히 `ns-icon` 은 shadow 경계 때문에 커스텀 프로퍼티로 크기를 받는 규칙이고, `ns-dialog:not(:defined) { display: none }` 은 모달 내용이 페이지에 새는 것을 막는다.

```css
/*
  정의 전 레이아웃 예약.

  커스텀 엘리먼트는 customElements.define 이전까지 display: inline 이고
  크기가 0 이다. SSR HTML 에는 셸이 없으므로 JS 로드 시점에 화면이 튄다.
  light DOM 선택자라 upgrade 전에도 적용된다.

  :defined 로 경계를 긋는 이유가 사이드바에 있다. 예약 규칙이 [open] 을 보면
  정의 이후까지 계속 걸리는데, @lit/react 는 open 을 useLayoutEffect 에서
  프로퍼티로만 설정하므로 서버 마크업에 그 속성이 없다. 그래서 하이드레이션
  전까지 4rem 레일로 그려지다 15rem 으로 벌어졌다. 정의 이후의 프레임은
  useLayoutEffect 가 페인트 전에 잡으므로 애초에 예약이 볼 필요가 없다.

  data-ns-open 은 React 소비자를 위한 통로다. createComponent 가 반응형
  프로퍼티만 가로채므로, 반응형이 아닌 이 이름은 서버 마크업에 그대로 실린다.
  src/react/tags/Sidebar.tsx 가 채운다. 순수 HTML 소비자는 마크업에 open 을
  직접 쓰므로 첫 짝이 걸린다.
*/
ns-header { display: block; height: var(--ns-header-height); }

ns-sidebar                             { display: block; }
ns-sidebar:not(:defined)               { width: var(--ns-sidebar-width-collapsed); }
ns-sidebar:not(:defined)[open],
ns-sidebar:not(:defined)[data-ns-open] { width: var(--ns-sidebar-width); }
```

**옛 `ns-sidebar:not([open])` 규칙을 지우고, `ns-sidebar` 의 `width` 도 뗀다.** 정의 이후의 너비는 `ns-sidebar.styles.ts` 의 `:host` 가 소유한다 — 두 곳에 두면 어긋난다. `display: block` 만 남기는 이유는 upgrade 전 `display: inline` 으로 높이가 0 이 되는 것을 막기 위해서다.

- [ ] **Step 3: `elements.ts` 의 사이드바 래퍼를 비공개로 바꾼다**

`export const NsSidebar = createComponent({` 를 찾아 이름과 주석을 고친다. `events` 매핑은 그대로 둔다 — `check-events.mjs` 가 이 파일만 본다.

```ts
/*
  ns-navigate 는 composed: true 로 올라오므로 사이드바와 그룹에서도 받을 수
  있다. 항목마다 핸들러를 다는 대신 사이드바에서 한 번만 듣는 쪽이 편해서
  세 곳 모두에 매핑해 둔다.

  소비자에게 직접 노출하지 않는다. tags/Sidebar.tsx 가 감싸서 SSR 마크업에
  data-ns-open 을 싣는다 — createComponent 는 반응형 프로퍼티인 open 을
  useLayoutEffect 에서만 설정하므로 서버 HTML 에 남지 않는다.
*/
export const NsSidebarBase = createComponent({
  react: React,
  tagName: "ns-sidebar",
  elementClass: NsSidebarElement,
  events: {
    // EventName<> 브랜딩이 없으면 핸들러가 (e: Event) => void 로 타입된다.
    onNsNavigate: "ns-navigate" as EventName<CustomEvent<NsNavigateDetail>>,
  },
});
```

- [ ] **Step 4: `Sidebar` shim 을 만든다**

```tsx
// src/react/tags/Sidebar.tsx
import type { CSSProperties, ReactNode } from "react";

import { NsSidebarBase } from "../elements.js";
import type { NsNavigateDetail } from "../../types.js";

export type SidebarProps = {
  /** 펼침 여부. 소비자가 내려준다 — 컴포넌트가 스스로 바꾸지 않는다. */
  open: boolean;
  /** 하위 ns-nav-item 의 클릭. composed 라 사이드바에서 한 번만 들으면 된다. */
  onNavigate?: (detail: NsNavigateDetail) => void;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/**
 * `open` 을 서버 마크업에도 싣기 위한 shim.
 *
 * `@lit/react` 의 `createComponent` 는 반응형 프로퍼티를 `useLayoutEffect`
 * 안에서 프로퍼티로만 설정한다. 서버 렌더 시점에는 실행되지 않으므로 Next 가
 * 내려주는 HTML 에 `open` 속성이 없고, `tokens.css` 의 정의 전 예약이 접힘으로
 * 그려다가 하이드레이션 직후 벌어진다.
 *
 * 반응형 프로퍼티가 **아닌** 이름은 가로채이지 않고 `React.createElement` 로
 * 흘러가 서버 마크업에 그대로 실린다. `data-ns-open` 이 그 통로다.
 */
export function Sidebar({ open, onNavigate, children, className, style }: SidebarProps) {
  return (
    <NsSidebarBase
      open={open}
      // 하이드레이션 전에는 이것만 보인다. tokens.css 의 :not(:defined) 규칙이 읽는다.
      data-ns-open={open ? "" : undefined}
      className={className}
      style={style}
      // e.detail 을 여기서 실제로 읽는다. elements.ts 의 EventName<> 캐스트가
      // 빠지면 e 가 Event 로 타입돼 이 줄이 깨진다.
      onNsNavigate={(e) => onNavigate?.(e.detail)}
    >
      {children}
    </NsSidebarBase>
  );
}
```

- [ ] **Step 5: `react/index.ts` 의 export 를 바꾼다**

첫 export 줄에서 `NsSidebar` 를 빼고, `Dialog` 아래에 `Sidebar` 를 더한다.

```ts
export { NsHeader, NsIcon, NsNavGroup, NsNavItem, NsPagination, NsSkeleton, NsTable } from "./elements.js";

export { PageHeading } from "./tags/PageHeading.js";
export type { PageHeadingProps } from "./tags/PageHeading.js";

export { Dialog } from "./tags/Dialog.js";
export type { DialogProps } from "./tags/Dialog.js";

export { Sidebar } from "./tags/Sidebar.js";
export type { SidebarProps } from "./tags/Sidebar.js";
```

- [ ] **Step 6: `consumer-example.tsx` 를 고친다**

import 목록에서 `NsSidebar` 를 빼고 `Sidebar` 를 넣는다(알파벳 순서상 `Select` 앞). 사용부를 바꾼다.

```tsx
        <Sidebar open={open} onNavigate={(d) => router.push(d.href)}>
          <NsNavGroup heading="프로젝트" onNsNavigate={(e) => log(e.detail.label)}>
```

닫는 태그도 `</Sidebar>` 로 바꾼다.

**`NsNavGroup` 과 `NsNavItem` 의 `onNsNavigate` 는 그대로 둔다.** 세 매핑 중 둘이 이 파일에서 직접 검사되어야 `EventName<>` 회귀가 잡힌다.

- [ ] **Step 7: 검사**

Run: `npm run check`
Expected: 다섯 검사 전부 통과. 특히 `tsc -p tsconfig.consumer.json` 이 `Sidebar` 를 찾고 `onNavigate` 의 `d.href` 가 `string` 으로 타입된다.

- [ ] **Step 8: `EventName<>` 방어가 실제로 동작하는지 깨뜨려 확인한다**

`elements.ts` 의 `NsSidebarBase` 에서 `as EventName<CustomEvent<NsNavigateDetail>>` 캐스트를 지운다.

Run: `npm run check`
Expected: `tsc -p tsconfig.consumer.json` 단계에서 실패. `Sidebar.tsx` 의 `e.detail` 에서 `Property 'detail' does not exist on type 'Event'` 계열 오류.

**의도한 이유로 실패했는지 본다.** 사용하지 않는 import 같은 다른 이유로 먼저 죽었으면 이 방어는 여전히 미검증이다.

되돌린다.

- [ ] **Step 9: `index.html` 의 "SSR 과 사이드바 너비" 절을 다시 쓴다**

211–232줄을 통째로 교체한다. 우회책 안내가 사라지고 **동작 설명**이 된다.

```html
  <h3>SSR 과 사이드바 너비</h3>
  <p>
    <code>@lit/react</code> 는 엘리먼트 프로퍼티를 <code>useLayoutEffect</code> 안에서만
    설정한다. 서버 렌더 시점에는 실행되지 않으므로 Next 가 내려주는 HTML 에는
    <code>open</code> 속성이 없다. 그래서 <code>&lt;Sidebar&gt;</code> shim 이
    <code>data-ns-open</code> 을 함께 내보낸다 — 반응형 프로퍼티가 아닌 이름은
    <code>createComponent</code> 가 가로채지 않고 서버 마크업에 그대로 실린다.
    <code>tokens.css</code> 의 <code>ns-sidebar:not(:defined)</code> 예약이 그것을 읽으므로
    <strong>하이드레이션 전후로 너비가 튀지 않는다.</strong>
  </p>
  <p>
    <strong>소비자가 할 일은 없다.</strong> <code>NsSidebar</code> 를 직접 쓰지 않고
    <code>Sidebar</code> 를 쓰면 된다. 0.1.x 에서 안내하던 래퍼 <code>&lt;div&gt;</code>
    우회는 더 이상 필요 없다 — 제거해도 되고 두어도 동작한다.
    (<code>ns-header</code> 는 예약 높이가 상태에 따라 바뀌지 않으므로 원래 영향이 없다.)
  </p>
  <script type="text/plain">
    import { Sidebar } from "@neosimplix/common-ui/react";

    <Sidebar open={open} onNavigate={(d) => router.push(d.href)}>
      {/* ... */}
    </Sidebar>
  </script>
```

- [ ] **Step 10: `index.html` 의 Next.js 예시와 `ns-sidebar` 절을 맞춘다**

174줄 부근 "Next.js (App Router)" 예시의 `<NsSidebar …>` 를 `<Sidebar open={open} onNavigate={(d) => router.push(d.href)}>` 로 바꾸고 import 목록도 고친다. **`consumer-example.tsx` 와 같은 형태로 적는다** — 둘이 갈라지면 문서 쪽만 컴파일되지 않는 상태가 조용히 생긴다.

1655줄 부근 `ns-sidebar` 프로퍼티 표에 `data-ns-open` 행을 더한다.

```html
  <h3>프로퍼티</h3>
  <table>
    <tr><th>프로퍼티</th><th>속성</th><th>타입</th><th>기본값</th><th>설명</th></tr>
    <tr><td><code>open</code></td><td><code>open</code></td><td>boolean</td><td><code>false</code></td><td>펼침 여부. 접히면 <code>--ns-sidebar-width-collapsed</code>(4rem) 레일만 남는다</td></tr>
    <tr><td>—</td><td><code>data-ns-open</code></td><td>속성 전용</td><td>없음</td><td>SSR 통로. <code>&lt;Sidebar&gt;</code> shim 이 채운다. 정의 전 레이아웃 예약만 읽는다 — 컴포넌트는 보지 않는다</td></tr>
  </table>
```

- [ ] **Step 11: `verification.md` 의 이벤트 검사 서술을 고친다**

"일곱 중 여섯" 문단을 교체한다.

```markdown
일곱 중 다섯(`ns-toggle`, `ns-navigate` × 2(`ns-nav-group`·`ns-nav-item`), `ns-table` 의 `ns-sort`·`ns-select-change`, `ns-pagination` 의 `ns-page-change`)은 `consumer-example.tsx` 가 직접 검사한다. 나머지 둘은 래퍼가 비공개라 그 파일이 닿을 수 없어 shim 이 같은 방어를 한다 — `src/react/tags/Dialog.tsx` 가 `onNsDialogClose={(e) => onClose(e.detail.reason)}`, `src/react/tags/Sidebar.tsx` 가 `onNsNavigate={(e) => onNavigate?.(e.detail)}` 로 `e.detail` 을 실제로 읽는다. 메커니즘은 `docs/gotchas.md` 의 "인자 0개짜리 핸들러는 `EventName<>` 캐스트 검사를 무력화한다" 에 있다.
```

세는 수가 여섯이 아니라 다섯인 이유는 `ns-navigate` 매핑 셋 중 하나(`ns-sidebar`)가 shim 뒤로 갔기 때문이다.

- [ ] **Step 12: `index.html` 구조 검사**

```bash
grep -c '<script>' index.html
grep -n '</script>' index.html | grep -v -E ':\s*</script>\s*$' | grep -v '<script src='
grep -n 'document.addEventListener' index.html
grep -oE '(^|[[:space:]])id="[^"]*"' index.html | sed -E 's/.*id="([^"]*)"/\1/' | sort | uniq -d
```

Expected: 첫째 `1`, 나머지 셋은 출력 없음

- [ ] **Step 13: 빌드와 육안 확인 요청**

Run: `npm run check && npm run build`
Expected: 통과

**사람이 확인할 것:** ① `npm run demo` 에서 `ns-sidebar` 절의 접기/펴기 버튼이 여전히 동작하고 트랜지션이 부드러운지 ② 문서 페이지 자체의 좌측 사이드바가 정상 너비로 뜨는지. ③ **이 저장소 안에서는 확인할 수 없는 것** — Next.js 소비자에서 `curl -s localhost:3000 | grep 'ns-sidebar'` 로 서버 HTML 에 `data-ns-open` 이 실렸는지. 이것이 이 태스크의 핵심 효과이며, 구현자는 **확인했다고 보고하지 않는다.**

- [ ] **Step 14: 커밋**

```bash
git add -A
git commit -m "fix(sidebar): SSR 마크업에 data-ns-open 을 실어 하이드레이션 너비 튐을 없앰"
```

---

## Task 5: `ns-nav-item` 의 `leading` 슬롯

**Files:**
- Modify: `src/components/nav-item/ns-nav-item.ts`
- Modify: `src/components/nav-item/ns-nav-item.styles.ts`
- Modify: `index.html` (좌측 네비게이션 자신, `ns-nav-item` 절의 데모·프로퍼티 표·slot 표)

**Interfaces:**
- Consumes: Task 1 의 `--ns-*` 토큰.
- Produces: `ns-nav-item` 의 `leading` 슬롯. 할당된 노드가 있으면 그것이, 없으면 `badge` 프로퍼티가 보인다. `trailing` 슬롯과 `badge` 프로퍼티는 그대로다.

**이 저장소 자신이 증거다.** `index.html:79` 는 `<ns-nav-item href="#install" label="설치" badge="설치">` 다. 배지는 접힘 전용이 아니므로 펼친 상태에서 **"설치 설치"** 로 렌더된다. 소비자가 보고한 "개요 개요" 와 같은 것이고, 문서 페이지가 그 오해를 스스로 시연하고 있었다.

- [ ] **Step 1: `render()` 를 고친다**

```ts
  override render() {
    return html`
      <a class="row" href=${this.href} title=${this.label} @click=${this.#onClick}>
        <span class="leading">
          <slot name="leading">
            <span class="badge" aria-hidden="true">${this.badge}</span>
          </slot>
        </span>
        <span class="label">${this.label}</span>
        <span class="trailing"><slot name="trailing"></slot></span>
      </a>
    `;
  }
```

`.leading` 으로 한 겹 감싸는 이유는 슬롯 요소 자체에 레이아웃을 걸면 소비자가 넣은 요소의 `display` 에 휘둘리기 때문이다.

- [ ] **Step 2: `badge` 프로퍼티 주석을 고친다**

```ts
  /**
   * `leading` 슬롯이 비었을 때 대신 보이는 짧은 배지.
   *
   * **접힘·펼침 양쪽에서 보인다.** 접힌 레일에서 유일하게 남는 요소라 거기서
   * 두드러질 뿐이고, 펼친 상태에서도 라벨 왼쪽에 그대로 남는다. 라벨과 같은
   * 글자를 넣으면 "설치 설치" 가 된다.
   */
  @property({ type: String }) badge = "";
```

- [ ] **Step 3: 스타일을 고친다**

`.badge` 가 갖고 있던 `flex: none` 과 크기를 `.leading` 으로 올린다. 배지는 그 안을 채운다.

```css
  /* 접힌 레일에서 유일하게 남는 자리라 flex 축소를 막는다. */
  .leading {
    flex: none;
    display: grid;
    place-items: center;
    width: var(--ns-control-height-sm);
    height: var(--ns-control-height-sm);
  }

  /*
    슬롯에 들어온 것이 배지와 같은 사각형을 차지하게 한다. 소비자가 넣는 것은
    보통 <ns-icon> 이고, 그 크기는 --ns-icon-size 를 따른다.
  */
  ::slotted([slot="leading"]) {
    max-width: 100%;
    max-height: 100%;
  }

  .badge {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    border-radius: var(--ns-radius-badge);
    background: var(--ns-color-surface-hover);
    font-size: var(--ns-font-size-2xs);
    line-height: var(--ns-line-height-2xs);
    font-weight: var(--ns-weight-semibold);
  }
```

`:host([active]) .badge` 규칙은 그대로 둔다.

- [ ] **Step 4: 문서 페이지 자신의 중복을 고친다**

`index.html:79-83` 과 `108` 에서 라벨과 같은 글자를 넣은 배지를 한 글자로 줄인다. 이 절 자체가 규칙의 시연이 된다.

```html
      <ns-nav-item href="#install" label="설치" badge="설" active></ns-nav-item>
      <ns-nav-item href="#usage" label="환경별 연동" badge="연"></ns-nav-item>
```

```html
      <ns-nav-item href="#tokens" label="디자인 토큰" badge="토"></ns-nav-item>
```

```html
      <ns-nav-item href="#full" label="전체 셸 조합" badge="셸"></ns-nav-item>
```

`셸` 은 한 글자라 그대로 둔다.

- [ ] **Step 5: `ns-nav-item` 절의 데모에 아이콘 항목을 더한다**

1766–1772줄의 `<template class="ex">` 를 교체한다. **`<template class="ex">` 다음 형제가 `.demo`, 그 다음이 `<pre>` 라는 규약을 지킨다** — 어기면 문서 스크립트가 그 섹션을 건너뛴다.

```html
  <template class="ex">
    <ns-nav-item href="/a" label="프로젝트 A" badge="PA" active></ns-nav-item>
    <ns-nav-item href="/b" label="아주 긴 프로젝트 이름은 한 줄로 말줄임된다" badge="PB"></ns-nav-item>
    <ns-nav-item href="/c" label="프로젝트 C" badge="PC">
      <span slot="trailing">3</span>
    </ns-nav-item>
    <ns-nav-item href="/d" label="배지 대신 아이콘">
      <ns-icon slot="leading" name="menu"></ns-icon>
    </ns-nav-item>
  </template>
```

- [ ] **Step 6: 프로퍼티 표와 slot 표를 고친다**

1782줄의 `badge` 행:

```html
    <tr><td><code>badge</code></td><td><code>badge</code></td><td>string</td><td><code>""</code></td><td><code>leading</code> 슬롯이 비었을 때 대신 보이는 짧은 배지. <strong>접힘·펼침 양쪽에서 보인다</strong> — 라벨과 같은 글자를 넣으면 "설치 설치" 가 된다</td></tr>
```

1787–1790줄의 slot 표에 `leading` 행을 더한다.

```html
  <h3>slot</h3>
  <table>
    <tr><th>이름</th><th>위치</th><th>용도</th></tr>
    <tr><td><code>leading</code></td><td>행의 좌측 끝</td><td>아이콘 등. 비우면 <code>badge</code> 가 대신 보인다 — 슬롯 폴백이라 분기 코드가 필요 없다. 접혀도 계속 보인다</td></tr>
    <tr><td><code>trailing</code></td><td>행의 우측 끝</td><td>카운트 배지 등 소비자가 원하는 것. 접히면 함께 숨는다</td></tr>
  </table>
```

- [ ] **Step 7: HTML·React 예시에 슬롯 사용을 더한다**

1798–1801줄 "HTML — 마크업" 을 교체한다.

```html
  <h3>HTML — 마크업</h3>
  <script type="text/plain">
    <ns-nav-item href="/a" label="프로젝트 A" badge="PA" active></ns-nav-item>

    <!-- 배지 대신 아이콘. 둘을 함께 쓰지 않는다 — 슬롯이 차면 배지는 사라진다 -->
    <ns-nav-item href="/b" label="프로젝트 B">
      <ns-icon slot="leading" name="menu"></ns-icon>
    </ns-nav-item>
  </script>
```

1809–1820줄 "React" 를 교체한다.

```html
  <h3>React</h3>
  <script type="text/plain">
    import { NsIcon, NsNavItem } from "@neosimplix/common-ui/react";

    <NsNavItem
      href="/a"
      label="프로젝트 A"
      badge="PA"
      active={pathname === "/a"}
      onNsNavigate={(e) => router.push(e.detail.href)}
    />

    <NsNavItem href="/b" label="프로젝트 B" onNsNavigate={(e) => router.push(e.detail.href)}>
      <NsIcon slot="leading" name="menu" />
    </NsNavItem>
  </script>
```

- [ ] **Step 8: `consumer-example.tsx` 에 슬롯 사용을 더한다**

문서 예시가 실제로 컴파일되는지 검사되게 한다. 기존 `<NsNavItem …/>` 다음에 형제로 넣는다.

```tsx
            <NsNavItem href="/b" label="프로젝트 B" onNsNavigate={(e) => log(e.detail.href)}>
              <NsIcon slot="leading" name="menu" />
            </NsNavItem>
```

- [ ] **Step 9: 검사**

Run: `npm run check`
Expected: 다섯 검사 전부 통과

`index.html` 구조 검사도 돌린다.

```bash
grep -c '<script>' index.html
grep -oE '(^|[[:space:]])id="[^"]*"' index.html | sed -E 's/.*id="([^"]*)"/\1/' | sort | uniq -d
```

Expected: `1`, 그리고 출력 없음

- [ ] **Step 10: 빌드와 육안 확인 요청**

Run: `npm run build`

**사람이 확인할 것:** ① `ns-nav-item` 데모의 네 번째 항목이 배지 자리에 아이콘을 보이는지, 배지가 함께 나오지 않는지 ② 좌측 네비게이션에서 "설 설치" 같은 중복이 사라졌는지 ③ 사이드바를 접었을 때 아이콘 항목의 아이콘이 레일에 그대로 남는지 ④ 아이콘과 배지가 같은 크기 사각형을 차지해 세로선이 맞는지.

- [ ] **Step 11: 커밋**

```bash
git add -A
git commit -m "feat(nav-item): leading 슬롯을 추가하고 badge 를 그 폴백으로 옮김"
```

---

## Task 6: 다크모드

**Files:**
- Modify: `src/tokens/tokens.css` (`color-scheme` 신호 + `light-dark()` 값)
- Modify: `index.html` (테마 토글 절)

**Interfaces:**
- Consumes: Task 1 의 `--ns-*` 이름, Task 3 의 `@no-alias` 블록 위치(값 정의부만 바뀌므로 생성기는 영향 없음).
- Produces: `data-theme` 이 없으면 OS 를 따르고, `light`/`dark` 를 세우면 그것이 이긴다.

**왜 `light-dark()` 인가.** 두 신호(OS·명시 지정)를 다 받으려면 보통 선언 블록을 미디어쿼리 안팎으로 두 벌 복제한다. 값이 두 곳에 존재하면 어긋나고 어긋나도 아무도 모른다 — 이 저장소가 `var()` 폴백을 금지한 것과 같은 함정이다. `color-scheme` 만 신호로 세우고 값을 `light-dark()` 한 줄에 두면 복제가 없다.

**부수 효과가 이득이다.** `color-scheme` 은 네이티브 폼 컨트롤·스크롤바·기본 배경도 함께 뒤집는다. 폼 컨트롤을 웹 컴포넌트로 만들지 않기로 한 결정의 배당금이다.

- [ ] **Step 1: 신호 규칙을 `:root` 블록 앞에 둔다**

```css
/*
  다크모드 신호.

  값은 아래 :root 에서 light-dark() 한 줄에 둔다. 미디어쿼리 안팎으로 선언을
  복제하면 값이 두 곳에 존재하게 되고, 어긋나도 아무도 모른다 — 이 파일이
  var() 폴백을 금지하는 것과 같은 이유다.

  color-scheme 은 상속되므로 컴포넌트 shadow 안까지 도달한다. 네이티브 폼
  컨트롤·스크롤바·기본 배경도 함께 뒤집힌다.

  요구 브라우저: Chrome 123 · Safari 17.5 · Firefox 120 이상.
*/
:root                     { color-scheme: light dark; }
:root[data-theme="light"] { color-scheme: light; }
:root[data-theme="dark"]  { color-scheme: dark; }
```

- [ ] **Step 2: 색 토큰을 `light-dark()` 로 바꾼다**

`:root` 안의 색 토큰만 바꾼다. 간격·반경·타이포·레이아웃 상수는 그대로다.

```css
  /* 표면 · 전경 · 경계 */
  --ns-color-surface:        light-dark(#fff, oklch(21% 0.006 285.885));
  --ns-color-surface-sunken: light-dark(oklch(98.5% 0 0), oklch(14.1% 0.005 285.823));
  --ns-color-surface-hover:  light-dark(oklch(96.7% 0.001 286.375), oklch(27.4% 0.006 286.033));
  --ns-color-line:           light-dark(oklch(92% 0.004 286.32), oklch(27.4% 0.006 286.033));
  --ns-color-line-strong:    light-dark(oklch(87.1% 0.006 286.286), oklch(37% 0.013 285.805));
  --ns-color-overlay:        light-dark(rgb(0 0 0 / .4), rgb(0 0 0 / .6));

  --ns-color-fg:        light-dark(oklch(21% 0.006 285.885), oklch(98.5% 0 0));
  --ns-color-fg-body:   light-dark(oklch(37% 0.013 285.805), oklch(87.1% 0.006 286.286));
  --ns-color-fg-muted:  light-dark(oklch(55.2% 0.016 285.938), oklch(70.5% 0.015 286.067));
  --ns-color-fg-subtle: light-dark(oklch(70.5% 0.015 286.067), oklch(55.2% 0.016 285.938));

  /* 액센트 — 브랜드 컬러가 정해지면 이 네 줄만 교체한다 */
  --ns-color-accent:       light-dark(oklch(21% 0.006 285.885), oklch(98.5% 0 0));
  --ns-color-accent-hover: light-dark(oklch(27.4% 0.006 286.033), oklch(92% 0.004 286.32));
  --ns-color-accent-fg:    light-dark(#fff, oklch(21% 0.006 285.885));
  --ns-color-disabled:     light-dark(oklch(87.1% 0.006 286.286), oklch(37% 0.013 285.805));

  /* 상태 */
  --ns-color-danger:          light-dark(oklch(57.7% 0.245 27.325), oklch(70.4% 0.191 22.216));
  --ns-color-danger-surface:  light-dark(oklch(97.1% 0.013 17.38), oklch(25.8% 0.092 26.042));
  --ns-color-warn:            light-dark(oklch(55.5% 0.163 48.998), oklch(82.8% 0.189 84.429));
  --ns-color-warn-surface:    light-dark(oklch(98.7% 0.022 95.277), oklch(27.9% 0.077 45.635));
  --ns-color-success:         light-dark(oklch(59.6% 0.145 163.225), oklch(76.5% 0.177 163.223));
  --ns-color-success-surface: light-dark(oklch(97.9% 0.021 166.113), oklch(26.2% 0.051 172.552));
```

`--ns-elevation-card` 도 다크에서 진하게 한다. 그림자는 색이 아니라 그림자 목록이라 `light-dark()` 를 값 전체에 쓸 수 없으므로 알파만 토큰으로 뺀다 — **쓰는 곳이 하나이므로 새 토큰을 만들지 않고** `light-dark()` 를 색 자리에 쓴다.

```css
  --ns-elevation-card:
    0 1px 3px 0 light-dark(rgb(0 0 0 / .1), rgb(0 0 0 / .4)),
    0 1px 2px -1px light-dark(rgb(0 0 0 / .1), rgb(0 0 0 / .4));
```

- [ ] **Step 3: 빈 `[data-theme="dark"]` 블록을 지운다**

`/* 다크모드는 이번 범위 밖. 나중에 이 블록만 채우면 된다. */` 와 `[data-theme="dark"] { }` 두 줄을 삭제한다. Step 1 이 자리를 대신한다.

- [ ] **Step 4: `index.html` 에 테마 토글 절을 더한다**

"디자인 토큰" 절(272줄)의 색 견본 `<div class="demo block">` **다음**에 넣는다. 다크모드는 육안 확인 경로가 없으면 이 저장소의 두 회귀 확인 수단 중 하나가 닿지 않는다.

**`id` 에 절 이름을 접두사로 붙인다.** `getElementById` 는 문서 순서상 첫 번째를 주므로 중복하면 엉뚱한 요소를 받고 배선 전체가 그 지점에서 멈춘다.

```html
  <h3>다크모드</h3>
  <p>
    값은 <code>light-dark()</code> 한 줄에 둘 다 들어 있고, 신호는
    <code>color-scheme</code> 하나다. <code>data-theme</code> 이 없으면 OS 설정을 따르고,
    <code>light</code>/<code>dark</code> 를 세우면 그것이 이긴다.
    <code>color-scheme</code> 은 상속되므로 컴포넌트 shadow 안까지 도달하고,
    네이티브 폼 컨트롤·스크롤바도 함께 뒤집힌다.
  </p>
  <p>요구 브라우저: Chrome 123 · Safari 17.5 · Firefox 120 이상.</p>
  <script type="text/plain">
    document.documentElement.dataset.theme = "dark";   // 명시 지정
    delete document.documentElement.dataset.theme;     // OS 설정으로 되돌림
  </script>
  <p>
    <button class="ns-button ns-button--outline ns-button--sm" id="theme-toggle">
      테마 전환
    </button>
    <span id="theme-log">현재: OS 설정</span>
  </p>
```

- [ ] **Step 5: 토글을 배선한다**

`index.html` 의 단일 `<script>` 안, `swatchNames` 블록 **다음**에 넣는다. **리스너는 자기가 소유한 엘리먼트에만 붙인다** — `document` 에 붙이면 데모를 만질 때 문서가 제멋대로 움직인다.

```js
  const themeToggle = document.getElementById("theme-toggle");
  const themeLog = document.getElementById("theme-log");
  if (themeToggle && themeLog) {
    // OS 설정 → light → dark → OS 설정 …
    const cycle = [undefined, "light", "dark"];
    let i = 0;
    themeToggle.addEventListener("click", () => {
      i = (i + 1) % cycle.length;
      const next = cycle[i];
      if (next) document.documentElement.dataset.theme = next;
      else delete document.documentElement.dataset.theme;
      themeLog.textContent = `현재: ${next ?? "OS 설정"}`;
    });
  }
```

- [ ] **Step 6: 구조 검사**

```bash
grep -c '<script>' index.html
grep -n 'document.addEventListener' index.html
grep -oE '(^|[[:space:]])id="[^"]*"' index.html | sed -E 's/.*id="([^"]*)"/\1/' | sort | uniq -d
```

Expected: 첫째 `1`, 나머지 둘은 출력 없음

- [ ] **Step 7: `aliases.css` 가 여전히 옳은지 본다**

값이 `light-dark()` 로 바뀌었을 뿐 이름은 그대로이므로 별칭은 영향받지 않는다. 확인만 한다.

Run: `npm run build`

```bash
grep -c 'light-dark' dist/aliases.css
```

Expected: `0` — 별칭은 `var(--ns-x)` 만 담는다. 값이 아니라 참조를 넘기므로 다크모드가 자동으로 따라온다.

- [ ] **Step 8: 검사와 육안 확인 요청**

Run: `npm run check`
Expected: 다섯 검사 전부 통과

**사람이 확인할 것:** ① `npm run demo` 후 "테마 전환" 버튼을 세 번 눌러 OS → light → dark → OS 순환이 되는지 ② 다크에서 문서 전체(헤더·사이드바·본문·카드·표·대화상자)가 읽히는지, 특히 **글자와 배경의 대비** ③ 색 견본 19개가 다크에서도 값을 갖는지 ④ 네이티브 `input`·`select`·스크롤바가 함께 어두워지는지 ⑤ `--ns-color-line` 과 `--ns-color-surface-hover` 가 같은 값이라 행 hover 가 경계보다 튀지 않는지. **팔레트는 1차안이다 — 어색하면 이 단계에서 값을 조정한다.**

- [ ] **Step 9: 커밋**

```bash
git add -A
git commit -m "feat(tokens): color-scheme 과 light-dark() 로 다크모드 추가"
```

---

## Task 7: 규칙과 문서

**Files:**
- Modify: `.claude/rules/library-invariants.md`
- Modify: `docs/gotchas.md`
- Modify: `docs/project-structure.md`
- Modify: `README.md`
- Modify: `index.html` ("설치" 절, "디자인 토큰" 절 산문)

**Interfaces:**
- Consumes: Task 1–6 의 모든 결과.
- Produces: 없음. 마지막 태스크다.

**앞선 태스크가 이미 고친 것은 다시 건드리지 않는다.** Task 4 가 `verification.md` 를, Task 5 가 `ns-nav-item` 절을, Task 6 이 다크모드 절을 이미 고쳤다.

- [ ] **Step 1: `library-invariants.md` 의 이름 규칙을 교체한다**

"## 이름" 절의 둘째·셋째 항목을 한 항목으로 합친다.

```markdown
- **모든 커스텀 프로퍼티는 `--ns-` 를 쓴다.** `tokens.css` 에 정의돼 있으면 공개(소비자가 덮어도 된다), 없으면 내부 신호다. (`--ns-color-line`, `--ns-space-3` / 신호는 `--ns-label-display`) 접두사를 붙이지 않던 0.1.5 가 두 번째 소비자에서 깨진 경위는 `docs/gotchas.md` 에 있다.
```

"## 스타일" 절의 `var()` 폴백 조항에서 예외 이름을 확인한다 — `--ns-label-display` 그대로다.

같은 절의 `shadow 컴포넌트는 controls.css 를 재사용할 수 없다` 항목은 그대로 둔다.

- [ ] **Step 2: `library-invariants.md` 에 새 조항 둘을 더한다**

"## 컴포넌트" 절 끝에 넣는다.

```markdown
- **SSR 에 보여야 하는 상태는 반응형 프로퍼티가 아닌 이름으로 내보낸다.** `@lit/react` 의 `createComponent` 는 반응형 프로퍼티를 `useLayoutEffect` 에서만 설정하므로 서버 마크업에 남지 않는다. shim 이 `data-ns-*` 속성을 함께 렌더한다. (`ns-sidebar` 의 `data-ns-open`)
- **정의 전 레이아웃 예약은 `:not(:defined)` 로 경계를 긋는다.** 상태 속성만 보면 정의 이후까지 걸려 하이드레이션 튐의 원인이 된다.
- **둘 중 하나만 보여야 하는 자리는 슬롯 폴백으로 만든다.** 프로퍼티 두 개로 만들면 소비자가 분기해야 하고, 분기해야 한다는 사실을 문서로만 알릴 수 있다. (`ns-nav-item` 의 `leading` 슬롯과 `badge`)
```

- [ ] **Step 3: `gotchas.md` 에 항목 셋을 더한다**

각각 **왜** 를 적는다. 파일의 기존 서술 방식(증상 → 메커니즘 → 결론)을 따른다. 제목은 아래 그대로 쓴다.

**`## 토큰 이름을 소비자와 공유하면 라이브러리가 캐스케이드에 종속된다`**

담을 것: 0.1.5 가 접두사를 뺀 근거(`dashboard-shell` 의 25개 파일이 이미 `var(--space-3)` 를 직접 참조) → 그 근거가 소비자 하나를 전제한다는 것 → 두 번째 소비자에서 `--color-surface`·`--color-surface-hover` 가 이름만 겹치고 값 체계가 달라 임포트 순서가 셸 색을 정하게 된 경위 → 컴포넌트가 `var()` 폴백 없이 읽으므로(그 자체는 옳은 규칙) 이름을 공유하면 렌더링이 남의 캐스케이드에 종속된다는 결론 → `aliases.css` 가 그 충돌을 의도적으로 재현하므로 옵트인이라는 것.

**`## @lit/react 는 반응형 프로퍼티를 서버 마크업에 싣지 않는다`**

담을 것: `createComponent` 가 반응형 프로퍼티를 가로채 `useLayoutEffect` 에서 설정하고 `React.createElement` 에는 넘기지 않는다는 것 → 서버에서 layout effect 가 실행되지 않아 SSR HTML 에 `open` 이 없다는 것 → 반응형이 **아닌** 이름은 그대로 흘러가므로 `data-ns-open` 이 통로가 된다는 것 → 예약 규칙이 `[open]` 이 아니라 `:not(:defined)` 를 봐야 하는 이유(정의 이후 프레임은 `useLayoutEffect` 가 페인트 전에 잡는다) → 소비자가 래퍼 `div` 로 우회하면 라이브러리 내부 상수(트랜지션·너비)를 복제하게 된다는 부수 피해.

**`## 슬롯 폴백은 배타가 자동이다`**

담을 것: `badge` 가 프로퍼티라 항상 렌더됐다는 것 → 문서의 "접힌 레일에서 보이는" 이 "접힘 전용" 으로 읽혀 소비자가 라벨과 같은 글자를 넣어 "개요 개요" 가 됐다는 것 → **이 저장소의 `index.html` 자신도 `label="설치" badge="설치"` 로 "설치 설치" 를 렌더하고 있었다**는 것 → 슬롯 폴백은 할당된 노드가 없을 때만 렌더되므로 소비자 분기 코드가 필요 없다는 결론.

- [ ] **Step 4: `project-structure.md` 를 갱신한다**

- 태그 표의 `ns-nav-item` 행에 `leading` slot 추가
- 디렉터리 트리에 `scripts/check-tokens.mjs` 추가, `copy-css.mjs` 설명에 `aliases.css` 생성 추가
- `src/react/tags/*.tsx` 설명은 그대로(shim 이 하나 늘었을 뿐)
- "산출물과 진입점" 표에 `dist/aliases.css` 추가
- `exports` 나열에 `./aliases.css` 추가
- `npm run check` 설명을 "① 라이브러리 타입 ② 소비자 관점 타입 ③ 이벤트 매핑 ④ 클래스 ↔ 문서 ⑤ 토큰 참조" 로
- **"남은 일" 의 첫 항목을 갱신한다** — SSR 튐은 해결됐고, `ns-header`·`ns-sidebar` 비제어 지원(둘을 감싸는 것)은 여전히 남았다는 점만 남긴다
- "토큰 원본: `dashboard-shell/app/globals.css`" 줄을 지운다. 이제 원본은 이 저장소다

- [ ] **Step 5: `README.md` 를 갱신한다**

- 설치 예시에 `aliases.css` 를 **선택**으로 안내하고, 새 프로젝트는 쓰지 않는다고 못 박는다
- **임포트 순서가 더 이상 중요하지 않다**는 것을 한 줄로 적는다 — 0.1.5 소비자가 `globals.css` 뒤에 두어야 했던 제약이 사라졌다
- 브라우저 요구사항(Chrome 123 · Safari 17.5 · Firefox 120) 한 줄
- `npm run build` 설명에 `aliases.css` 추가
- **0.2.0 breaking 안내 두 줄**: 토큰 이름에 `--ns-` 접두사, `NsSidebar` → `Sidebar`

- [ ] **Step 6: `index.html` 의 "설치" 와 "디자인 토큰" 산문을 고친다**

"CSS 두 개를 모두 불러온다"(137줄) 절에 순서 무관과 `aliases.css` 를 더한다.

"디자인 토큰" 절(273–282줄)의 첫 문단을 교체한다. 지금 문장이 소비자를 잘못 이끈 바로 그 문장이다.

```html
  <p>
    모든 토큰 이름에 <code>--ns-</code> 접두사가 붙는다. 소비자 문서의
    <code>:root</code> 와 이름이 겹치지 않으므로 <strong>임포트 순서가 결과를
    바꾸지 않는다.</strong> 0.1.5 까지는 접두사가 없어, 같은 이름을 다른 뜻으로
    쓰던 프로젝트에서 <code>tokens.css</code> 를 뒤에 임포트해야만 셸 색이 살았다.
  </p>
  <p>
    이미 무접두사 이름을 쓰던 프로젝트는
    <code>@neosimplix/common-ui/aliases.css</code> 를 함께 임포트한다.
    <strong>새 프로젝트는 임포트하지 않는다</strong> — 그 파일은 위의 충돌을
    의도적으로 재현한다.
  </p>
```

다크모드가 미구현이라는 문단(277–281줄)을 지운다. Task 6 이 그 자리에 실제 절을 넣었다.

- [ ] **Step 7: 문서 안의 옛 이름이 남아 있는지 훑는다**

```bash
grep -rn '\-\-color-\|\-\-space-\|\-\-sidebar-width\|\-\-radius-\|\-\-font-size-' \
  README.md docs/*.md index.html .claude/rules/*.md | grep -v '\-\-ns-' | grep -v aliases
```

Expected: 출력이 있으면 각각 본다. `gotchas.md` 와 `README.md` 의 **0.1.5 를 설명하는 문맥**에서는 옛 이름이 남는 것이 옳다 — 그 경우만 남긴다.

- [ ] **Step 8: 전체 검사**

Run: `npm run check`
Expected: 다섯 검사 전부 통과

```bash
grep -c '<script>' index.html
grep -n '</script>' index.html | grep -v -E ':\s*</script>\s*$' | grep -v '<script src='
grep -n 'document.addEventListener' index.html
grep -oE '(^|[[:space:]])id="[^"]*"' index.html | sed -E 's/.*id="([^"]*)"/\1/' | sort | uniq -d
```

Expected: 첫째 `1`, 나머지 셋은 출력 없음

- [ ] **Step 9: 커밋**

```bash
git add -A
git commit -m "docs(tokens): 접두사·SSR 채널·슬롯 폴백의 근거를 규칙과 gotchas 에 기록"
```

---

## 릴리스

이 계획은 **로컬 커밋까지**다. 태그를 만들고 소비자가 받게 하려면 사용자가 명시적으로 요청할 때 `.claude/skills/releasing` 절차를 따른다. breaking change 가 둘이므로 버전은 **`0.2.0`** 이다.

`npm run release -- 0.2.0` 은 `README.md` 와 `index.html` 의 설치 버전도 함께 갱신한다. **`git push` 는 사용자가 명시적으로 요청할 때만 한다.**

## 소비자에게 전달할 것

릴리스 시 함께 전달한다. 소비자 쪽 피드백 문서의 "버전 올릴 때 확인할 것" 다섯 줄이 전부 필요 없어진다.

| 소비자가 할 일 | 이유 |
|---|---|
| `import { NsSidebar }` → `import { Sidebar }`, 프롭 `onNsNavigate` → `onNavigate`(인자가 `detail`) | shim 도입 |
| `shell.tsx` 의 래퍼 `div`·`SIDEBAR_TRANSITION`·`15rem`/`4rem` 하드코딩 제거 | SSR 튐이 라이브러리에서 해결됨 |
| 토큰을 직접 참조하던 CSS 가 있으면 `--ns-` 로 바꾸거나 `aliases.css` 임포트 | 접두사 전환. 이 프로젝트는 자체 이름(`--surface` 등)을 쓰므로 **아마 할 일이 없다** |
| `app/layout.tsx` 의 임포트 순서 주석 제거 | 순서가 더 이상 결과를 바꾸지 않음 |
| `nav.ts` 의 배지를 한 글자로 줄인 것을 되돌리고 아이콘을 `slot="leading"` 으로 복원 | `leading` 슬롯 도입 |
| OS 다크모드 확인 | `data-theme` 없이 `prefers-color-scheme` 만 쓰는 지금 구성에서 셸이 함께 어두워진다 |
