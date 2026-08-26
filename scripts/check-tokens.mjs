/*
  컴포넌트 CSS 가 문법으로는 멀쩡한데 브라우저에서 조용히 무효가 되는 것들을 잡는다.

  이 파일의 CSS 는 템플릿 리터럴 안에 있어 tsc 가 보지 못한다. 옛 무접두사 이름을
  var(--color-line) 으로 다시 적어도 타입 검사와 빌드가 통과하고, 화면에서
  그 속성만 조용히 무효가 된다.
  0.1.5 에서 토큰 이름을 소비자와 공유하다 겪은 고장이 정확히 그 종류였다.

  다섯 규칙:
    ① 모든 var(--x) 는 --ns- 로 시작한다.
    ② 이름이 리터럴이면 tokens.css 에 정의돼 있거나 WIRING 에 있어야 한다.
    ③ data-ns-* 훅 이름은 세 곳에서 일치한다.
    ④ :host 블록에 border·margin·padding 을 두지 않는다.
    ⑤ index.html 의 <style> 에 리터럴 색을 두지 않는다.

  ②를 건너뛰는 경우가 하나 있다. ns-skeleton.ts 는 `var(--ns-radius-${this.radius})`
  로 이름을 조립하므로 정적으로 확인할 수 없다. 이름에 ${ 가 있으면 ①만 본다.

  tokens.css 자신도 검사 대상이다. 파생 토큰(--ns-page-padding-x 등)과 정의 전
  레이아웃 예약 규칙(ns-header 등)이 그 안에서 var() 로 다른 토큰을 참조하므로,
  대상에서 빠지면 거기서 접두사를 빠뜨려도 잡히지 않는다. tokens.css 는 정의와
  참조를 동시에 담으므로 규칙 ②는 자기 자신과도 일관돼야 한다 — 참조하는 이름은
  전부 같은 파일에 정의돼 있어야 한다.

  ③ 이 필요한 이유는 이 이름이 어느 타입 검사에도 걸리지 않기 때문이다.
  하이픈이 든 JSX 속성 이름은 tsc 가 검사하지 않고(임의의 이름이 허용된다),
  ①②는 var(--…) 만 본다. data-ns-open 을 data-ns-opne 로 잘못 적으면 다섯
  검사가 전부 통과하면서 SSR 통로만 조용히 끊긴다 — 저장소 안에서 그 사실을
  알 방법이 없다.

  ③ 이 보는 곳이 셋인 이유는 훅 하나가 세 층에 걸쳐 있기 때문이다.

    shim      src/react/tags 의 .tsx        속성을 쓴다
    문서 예약  src/tokens/tokens.css         upgrade 전 구간을 덮는다
    shadow    src/components 의 .styles.ts  upgrade~hydration 구간을 덮는다

  ns-sidebar 가 이 셋을 모두 쓴다. 한 층만 고치면 나머지 구간에 튐이 남는다는
  것이 이 훅을 만든 계기였으므로(docs/gotchas.md 의 "@lit/react 는 반응형
  프로퍼티를 서버 마크업에 싣지 않는다"), 세 곳이 서로 어긋나면 실패시킨다.
  어느 한 곳의 오타든 짝이 깨진 것은 같다.

  세 곳 모두에서 주석을 지우고 수집한다. 세 파일 전부가 이 통로를 산문으로
  설명하면서 [data-ns-open] 을 그대로 적으므로, 지우지 않으면 설명문이 짝을
  채워 검사가 무력해진다.

  ④ 도 같은 종류의 조용한 무효다. 호스트 요소는 문서 트리에 있으므로 소비자의
  문서 규칙이 shadow 의 :host 규칙을 이긴다 — 특정도가 아니라 캐스케이드 순서로
  정해지는 것이라 :host 쪽이 아무리 구체적이어도 진다. Tailwind preflight 의

    *, ::before, ::after, ::backdrop { border: 0 solid; margin: 0; padding: 0 }

  가 그 규칙이고, Tailwind 를 쓰는 소비자는 예외 없이 이것을 갖는다. 그래서
  :host 에 둔 박스 프로퍼티는 라이브러리 안에서는 잘 보이고 소비자 프로젝트에서만
  사라진다. 0.2.0 의 ns-sidebar 경계선과 ns-nav-group 그룹 간격이 그렇게 죽었다.
  배경·색·너비는 preflight 가 건드리지 않으므로 대상이 아니다. 박스는 shadow 안의
  요소가 갖게 하면 문서 규칙이 닿지 못한다 — ns-header 가 처음부터 그 모양이라
  같은 사고를 겪지 않았다.

  ⑤ 는 위의 "index.html 은 검사 대상이 아니다" 를 한 군데만 뚫은 것이다. 규칙 ①을
  그 파일에 켤 수 없는 이유는 산문이 옛 무접두사 이름을 일부러 적기 때문인데,
  <style> 블록 안은 산문이 아니다. 그 안의 선언만 보면 오탐이 없고, 실제로 거기
  하나 있던 리터럴 색(pre 의 `color: #fff`)이 다크모드에서 흰 바탕에 흰 글씨를
  만들었다. 리터럴 색은 정의상 두 모드를 함께 뒤집을 수 없다.

  선언 안만 보는 것이 중요하다. 선택자까지 훑으면 #icon-demo 같은 id 선택자가
  16진수 색으로 읽힌다.

  한계:
    - 참조가 규칙을 지키는지만 본다. 그 토큰이 화면에서 옳은 값인지는
      index.html 육안 확인의 몫이다.
    - index.html 은 검사 대상이 아니다. 그 파일은 배포되고(README 가 소비자에게
      열라고 안내한다) 자체 스타일에 살아 있는 var(--ns-*) 참조를 77 개 갖고 있으므로
      이것은 진짜 사각지대다 — 거기서 접두사를 빠뜨리면 육안 확인의 매개체 자신이
      조용히 깨진다. 그런데도 넣을 수 없는 이유는 같은 파일이 0.1.5 를 설명하는
      산문에서 옛 무접두사 이름을 일부러 적기 때문이다("var(--space-3) →
      var(--ns-space-3)" 같은 이관 안내). 규칙 ①은 코드와 산문을 구분하지 못하므로
      넣는 즉시 그 문장들이 실패한다. 산문만 걸러내려면 결국 HTML 을 파싱해야 하고,
      그것은 이 저장소가 검증 하네스에 대해 정한 선을 넘는다.
    - ③ 은 이름의 짝만 본다. 그 선택자가 옳은 엘리먼트에 붙었는지, 옳은
      선언을 담았는지, 하이드레이션 전후로 실제 효과가 있는지는 보지 못한다.
      그것은 브라우저와 실제 Next.js 소비자의 몫이다.
    - ③ 은 전개 형태의 JSX(`{...{"data-ns-x": ""}}`)를 보지 못한다. `이름=`
      만 찾기 때문이다. 정규식으로 흉내 내는 대신 한계로 적어 둔다 — 훅을
      그렇게 쓰지 않는다.
    - ③ 은 세 곳 **전부**를 요구한다. 지금은 훅이 ns-sidebar 의 data-ns-open
      하나뿐이고 그것이 실제로 세 층에 걸쳐 있어 맞지만, 한 층만 있으면 되는
      훅(예: 문서 예약 없이 shadow 에서만 읽는 것)이 생기면 이 검사가 막는다.
      그때는 규칙을 "짝이 하나뿐이면 통과" 로 늘리지 말고 — 그러면 오타를
      못 잡는다 — 훅마다 필요한 층을 이 파일에 명시하는 쪽으로 고친다.
    - ③ 의 수집 범위는 위 세 곳뿐이다. 컴포넌트가 JS 로 질의하는 훅
      (data-ns-row-id·data-ns-page 등)은 CSS 가 아니라 코드가 짝이므로
      대상이 아니고, 그래서 셋 중 어디에도 나타나지 않는다.
    - ④ 는 :host 자신을 겨냥한 선택자만 본다. `:host(…) .row` 처럼 후손을
      고르는 것은 shadow 안이라 대상이 아니다. 값이 0 이나 none 인 선언도
      넘긴다 — preflight 가 넣으려는 값과 같아서 지워져도 달라지지 않는다.
    - ④ 는 border-radius·border-collapse·border-spacing·border-image 를
      제외한다. preflight 의 `border: 0 solid` 는 width·style·color 만 덮는다.
    - ④ 는 이 저장소의 :host 만 본다. 소비자가 자기 문서에서 ns-* 태그에
      박스를 주는 것은 정상적인 override 이고 막을 이유가 없다.
    - ⑤ 는 <style> 블록만 본다. 인라인 style 속성은 대상이 아니다 —
      <script type="text/plain"> 안의 예시 코드에도 style={{…}} 가 나오므로
      가려내려면 결국 HTML 을 파싱해야 하고, 그것은 이 저장소가 검증 하네스에
      대해 정한 선을 넘는다. 지금 인라인 style 에 색 리터럴은 없다.
    - ⑤ 는 **부분적인 방어다.** 리터럴 색만 잡는다. 두 토큰이 서로 반대로
      뒤집히지 않는 조합(--ns-color-fg 를 배경으로 쓰고 글자에 --ns-color-fg-body
      를 쓰는 식)은 전부 토큰이라 통과한다. 그쪽은 여전히 육안 확인 몫이다.
      실제 결함이 리터럴 쪽이었기에 이만큼만 막는다.
    - ①② 의 참조 수집은 주석을 지우지 않는다. 주석 속 var() 는 죽은 참조라
      실패시켜도 손해가 없는 방향이라서 그대로 둔다. ② 의 *정의* 수집은
      반대다 — 주석 속 정의가 실재하는 것처럼 보이면 없는 토큰이 통과하므로
      반드시 지운다.
*/
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/*
  tokens.css 에 정의하지 않는 내부 배선. 소비자가 덮는 값이 아니라 신호다.

  ns-sidebar 가 ::slotted 로 자식에게 상태를 알리는 통로 둘이다. 색·치수 토큰과
  달리 정의가 tokens.css 에 없고, 사이드바가 세워 주지 않는 상황(단독 사용,
  사이드바 펼침)에서는 읽는 쪽의 var() 폴백이 곧 기본 동작이다. 그래서 이 둘만
  "컴포넌트 스타일에 var() 폴백을 쓰지 않는다" 의 예외이기도 하다.
*/
const WIRING = new Set(["--ns-label-display", "--ns-group-list-display"]);

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return walk(p);
    return /\.(ts|tsx)$/.test(p) ? [p] : [];
  });

/*
  CSS 주석과 JS 블록 주석은 문법이 같다. .styles.ts 의 CSS 는 템플릿 리터럴
  안에 있으므로 한 규칙으로 둘 다 걷힌다. 줄 주석은 ts/tsx 에서만 지우고,
  `https://` 를 주석으로 오인하지 않도록 앞 글자가 `:` 가 아닐 때만 자른다.
*/
const strip = (source, { line }) => {
  const out = source.replace(/\/\*[\s\S]*?\*\//g, " ");
  return line ? out.replace(/(^|[^:])\/\/[^\n]*/g, "$1") : out;
};

/*
  정의를 줄 머리로만 잡으면 안 된다. 타이포 블록 여섯 줄이 한 줄에 정의를
  둘씩 담고 있다(`--ns-font-size-2xs: …; --ns-line-height-2xs: …;`).
  경계는 줄 머리 또는 세미콜론 뒤다.
*/
const TOKENS_CSS = "src/tokens/tokens.css";
const defined = new Set(
  [...strip(readFileSync(TOKENS_CSS, "utf8"), { line: false })
    .matchAll(/(?:^|;)\s*(--[a-z0-9-]+)\s*:/gm)].map((m) => m[1]),
);

const targets = [...walk("src"), "src/controls/controls.css", TOKENS_CSS];

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

/* ③ 훅 이름이 shim · 문서 예약 · shadow 세 곳에서 일치하는지 본다. */
const WRITE = /(data-ns-[a-z0-9-]+)\s*=/g;   // shim 이 속성을 쓴 자리
const SELECT = /\[(data-ns-[a-z0-9-]+)\]/g;  // CSS 가 그 속성을 읽는 자리

const collect = (files, re, line) => {
  const found = new Map();
  for (const file of files) {
    const source = strip(readFileSync(file, "utf8"), { line });
    for (const m of source.matchAll(re)) {
      if (!found.has(m[1])) found.set(m[1], new Set());
      found.get(m[1]).add(file);
    }
  }
  return found;
};

const TAGS_DIR = "src/react/tags";
const groups = [
  {
    label: "shim",
    found: collect(
      readdirSync(TAGS_DIR).filter((n) => n.endsWith(".tsx")).map((n) => join(TAGS_DIR, n)),
      WRITE,
      true,
    ),
  },
  { label: "문서 예약", found: collect([TOKENS_CSS], SELECT, false) },
  {
    label: "shadow",
    found: collect(walk("src/components").filter((p) => p.endsWith(".styles.ts")), SELECT, true),
  },
];

const mismatched = [];
for (const name of new Set(groups.flatMap((g) => [...g.found.keys()])).values()) {
  const missing = groups.filter((g) => !g.found.has(name));
  if (missing.length === 0) continue;
  const present = groups
    .filter((g) => g.found.has(name))
    .map((g) => `${g.label}(${[...g.found.get(name)].sort().join(", ")})`);
  mismatched.push(
    `${name}\n      있음: ${present.join(" / ")}` +
      `\n      없음: ${missing.map((g) => g.label).join(", ")}`,
  );
}

if (mismatched.length > 0) {
  console.error(
    "data-ns-* 훅 이름이 shim · 문서 예약 · shadow 세 곳에서 일치하지 않습니다:\n    " +
      mismatched.sort().join("\n    "),
  );
  process.exit(1);
}

/* ④ :host 자신에 박스 프로퍼티를 두지 않았는지 본다. */

/*
  선택자와 선언을 짝지어 걷는다. ns-skeleton 이 @media 를 쓰므로 중첩이 한 단계
  있고, 그래서 평평한 정규식 대신 중괄호를 센다. 여는 괄호 직전까지가 선택자,
  괄호 안에서 다음 중괄호를 만나기 전까지가 그 블록의 선언이다.

  각 파일의 첫 블록 앞에는 `export const styles = css\`` 가 붙어 있다. 백틱과
  세미콜론은 선택자에 나올 수 없으므로 마지막 것 뒤만 남긴다. 이 손질이 없으면
  파일마다 첫 :host 블록이 통째로 검사에서 빠진다.
*/
const blocks = (css) => {
  const out = [];
  const open = [];
  let buf = "";
  for (const ch of css) {
    if (ch === "{") {
      open.push(buf.split(/[`;]/).pop().trim());
      buf = "";
    } else if (ch === "}") {
      if (open.length > 0) out.push({ selector: open[open.length - 1], body: buf });
      open.pop();
      buf = "";
    } else {
      buf += ch;
    }
  }
  return out;
};

/*
  `:host` 와 `:host(…)` 만 호스트 자신을 고른다. 괄호 안에 `:not([a]):not([b])`
  처럼 괄호가 또 들어가므로 정규식으로 벗기지 않고 짝을 세어 잘라낸다.
  잘라낸 나머지가 비어 있지 않으면 후손 선택자다 — shadow 안이라 안전하다.
*/
const targetsHost = (selector) =>
  selector.split(",").some((part) => {
    const s = part.trim();
    if (!s.startsWith(":host")) return false;
    let i = ":host".length;
    if (s[i] === "(") {
      let depth = 0;
      for (; i < s.length; i++) {
        if (s[i] === "(") depth++;
        else if (s[i] === ")" && --depth === 0) {
          i++;
          break;
        }
      }
    }
    return s.slice(i).trim() === "";
  });

const BOX = /(?:^|;)\s*((?:border|margin|padding)(?:-[a-z-]+)?)\s*:\s*([^;]+)/g;
const BORDER_OK = /^border-(radius|collapse|spacing|image)/;
const NO_OP = /^(?:(?:0[a-z%]*|none)\s*)+$/;

const hostBoxes = [];
for (const file of walk("src/components").filter((p) => p.endsWith(".styles.ts"))) {
  const source = strip(readFileSync(file, "utf8"), { line: true });
  for (const { selector, body } of blocks(source)) {
    if (!targetsHost(selector)) continue;
    for (const [, prop, value] of body.matchAll(BOX)) {
      if (BORDER_OK.test(prop)) continue;
      if (NO_OP.test(value.trim())) continue;
      hostBoxes.push(`${file}: ${selector} { ${prop}: ${value.trim()} }`);
    }
  }
}

if (hostBoxes.length > 0) {
  console.error(
    ":host 에 박스 프로퍼티가 있습니다. 소비자 문서 규칙(Tailwind preflight 등)이\n" +
      "호스트에 대해서는 :host 를 이기므로 조용히 지워집니다. shadow 안의 요소로 옮기세요:\n  " +
      hostBoxes.sort().join("\n  "),
  );
  process.exit(1);
}

/* ⑤ index.html 의 <style> 블록에 리터럴 색이 없는지 본다. */

/*
  색 함수와 16진수, 그리고 흔한 색 이름. transparent · currentColor · none ·
  inherit 은 값이 아니라 지시라서 대상이 아니다 — 모드가 바뀌어도 뜻이 그대로다.
*/
const LITERAL_COLOR =
  /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|hwb|oklch|oklab|lab|lch|color)\(|\b(?:white|black|red|green|blue|gray|grey|silver|navy|teal|olive|maroon|lime|aqua|fuchsia|purple|orange|yellow|pink|brown)\b/;

const DECL = /(?:^|;)\s*([a-z-]+)\s*:\s*([^;]+)/g;

const literals = [];
for (const [, css] of readFileSync("index.html", "utf8").matchAll(
  /<style[^>]*>([\s\S]*?)<\/style>/g,
)) {
  /*
    선언 안만 본다. 선택자까지 훑으면 #icon-demo 같은 id 선택자가 16진수로 읽힌다.
    ④ 가 쓰는 blocks() 를 그대로 재사용하므로 중첩 at-rule 도 함께 처리된다.
  */
  for (const { selector, body } of blocks(strip(css, { line: false }))) {
    for (const [, prop, value] of body.matchAll(DECL)) {
      if (!LITERAL_COLOR.test(value)) continue;
      literals.push(`index.html: ${selector} { ${prop}: ${value.trim()} }`);
    }
  }
}

if (literals.length > 0) {
  console.error(
    "index.html 의 <style> 에 리터럴 색이 있습니다. 두 모드를 함께 뒤집을 수 없으므로\n" +
      "tokens.css 의 토큰이나 light-dark() 를 쓰세요:\n  " +
      literals.sort().join("\n  "),
  );
  process.exit(1);
}

console.log(
  `토큰 참조 확인 완료: ${defined.size} 개 정의, ${targets.length} 개 파일 검사, ` +
    `data-ns-* 훅 ${groups[0].found.size} 개 세 곳 일치, :host 박스 없음, ` +
    `index.html 리터럴 색 없음`,
);
