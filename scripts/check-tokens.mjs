/*
  컴포넌트와 클래스가 참조하는 커스텀 프로퍼티가 규칙을 지키는지 확인한다.

  토큰 참조는 CSS 문자열이라 tsc 가 보지 못한다. var(--color-line) 을 다시
  적어도 타입 검사와 빌드가 통과하고, 화면에서 그 속성만 조용히 무효가 된다.
  0.1.5 에서 토큰 이름을 소비자와 공유하다 겪은 고장이 정확히 그 종류였다.

  세 규칙:
    ① 모든 var(--x) 는 --ns- 로 시작한다.
    ② 이름이 리터럴이면 tokens.css 에 정의돼 있거나 WIRING 에 있어야 한다.
    ③ src/react/tags/*.tsx 가 쓰는 data-ns-* 훅 속성은 tokens.css 에 같은
       이름의 속성 선택자를 가져야 한다.

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

  한 방향만 보지만 양쪽 오타를 잡는다. shim 이 쓴 이름에 대응하는 선택자가
  없으면 실패하므로, 오타가 shim 쪽이든 tokens.css 쪽이든 짝이 깨진 것은
  같다. 선택자 수집 전에 CSS 주석을 지우는 이유가 여기 있다 — 주석에 남은
  옛 이름이 짝을 채워 주면 검사가 무력해진다.

  한계:
    - 참조가 규칙을 지키는지만 본다. 그 토큰이 화면에서 옳은 값인지는
      index.html 육안 확인의 몫이다.
    - ③ 은 이름의 짝만 본다. 그 선택자가 옳은 엘리먼트에 붙었는지, 옳은
      선언을 담았는지, 하이드레이션 전후로 실제 효과가 있는지는 보지 못한다.
      그것은 브라우저와 실제 Next.js 소비자의 몫이다.
    - ③ 의 수집 범위는 src/react/tags/*.tsx 뿐이다. shim 이 사는 곳이라서다.
      컴포넌트가 JS 로 질의하는 훅(data-ns-row-id 등)은 CSS 가 아니라 코드가
      짝이므로 대상이 아니다.
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

/*
  ③ data-ns-* 훅과 tokens.css 속성 선택자의 짝.

  주석을 먼저 지운다. tokens.css 는 이 통로를 설명하면서 본문에 [data-ns-open]
  을 그대로 적으므로, 지우지 않으면 설명만으로 짝이 채워진다.
*/
const TAGS_DIR = "src/react/tags";

const selectors = new Set(
  [...tokens.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/\[(data-ns-[a-z0-9-]+)\]/g)]
    .map((m) => m[1]),
);

/* `이름=` 로 좁힌다. 실제로 속성으로 쓴 것만 세고 산문 언급은 넘긴다. */
const hooks = new Set();
for (const name of readdirSync(TAGS_DIR).filter((n) => n.endsWith(".tsx"))) {
  const source = readFileSync(join(TAGS_DIR, name), "utf8");
  for (const m of source.matchAll(/(data-ns-[a-z0-9-]+)\s*=/g)) {
    if (!selectors.has(m[1])) hooks.add(`${join(TAGS_DIR, name)}: ${m[1]}`);
  }
}

if (hooks.size > 0) {
  console.error(
    "tokens.css 에 대응하는 속성 선택자가 없는 data-ns-* 훅:\n  " +
      [...hooks].sort().join("\n  "),
  );
  process.exit(1);
}

console.log(
  `토큰 참조 확인 완료: ${defined.size} 개 정의, ${targets.length} 개 파일 검사, ` +
    `data-ns-* 선택자 ${selectors.size} 개`,
);
