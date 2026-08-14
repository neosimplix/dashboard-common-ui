/*
  컴포넌트와 클래스가 참조하는 커스텀 프로퍼티가 규칙을 지키는지 확인한다.

  토큰 참조는 CSS 문자열이라 tsc 가 보지 못한다. var(--color-line) 을 다시
  적어도 타입 검사와 빌드가 통과하고, 화면에서 그 속성만 조용히 무효가 된다.
  0.1.5 에서 토큰 이름을 소비자와 공유하다 겪은 고장이 정확히 그 종류였다.

  세 규칙:
    ① 모든 var(--x) 는 --ns- 로 시작한다.
    ② 이름이 리터럴이면 tokens.css 에 정의돼 있거나 WIRING 에 있어야 한다.
    ③ data-ns-* 훅 이름은 세 곳에서 일치한다.

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
  것이 이 훅을 만든 계기였으므로(docs/gotchas.md), 세 곳이 서로 어긋나면
  실패시킨다. 어느 한 곳의 오타든 짝이 깨진 것은 같다.

  세 곳 모두에서 주석을 지우고 수집한다. 세 파일 전부가 이 통로를 산문으로
  설명하면서 [data-ns-open] 을 그대로 적으므로, 지우지 않으면 설명문이 짝을
  채워 검사가 무력해진다.

  한계:
    - 참조가 규칙을 지키는지만 본다. 그 토큰이 화면에서 옳은 값인지는
      index.html 육안 확인의 몫이다.
    - ③ 은 이름의 짝만 본다. 그 선택자가 옳은 엘리먼트에 붙었는지, 옳은
      선언을 담았는지, 하이드레이션 전후로 실제 효과가 있는지는 보지 못한다.
      그것은 브라우저와 실제 Next.js 소비자의 몫이다.
    - ③ 은 전개 형태의 JSX(`{...{"data-ns-x": ""}}`)를 보지 못한다. `이름=`
      만 찾기 때문이다. 정규식으로 흉내 내는 대신 한계로 적어 둔다 — 훅을
      그렇게 쓰지 않는다.
    - ③ 의 수집 범위는 위 세 곳뿐이다. 컴포넌트가 JS 로 질의하는 훅
      (data-ns-row-id·data-ns-page 등)은 CSS 가 아니라 코드가 짝이므로
      대상이 아니고, 그래서 셋 중 어디에도 나타나지 않는다.
    - ①② 의 참조 수집은 주석을 지우지 않는다. 주석 속 var() 는 죽은 참조라
      실패시켜도 손해가 없는 방향이라서 그대로 둔다. ② 의 *정의* 수집은
      반대다 — 주석 속 정의가 실재하는 것처럼 보이면 없는 토큰이 통과하므로
      반드시 지운다.
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

console.log(
  `토큰 참조 확인 완료: ${defined.size} 개 정의, ${targets.length} 개 파일 검사, ` +
    `data-ns-* 훅 ${groups[0].found.size} 개 세 곳 일치`,
);
