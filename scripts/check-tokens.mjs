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

const targets = [...walk("src"), "src/controls/controls.css"];

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
