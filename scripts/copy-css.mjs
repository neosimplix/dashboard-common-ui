/*
  CSS 두 개를 dist/ 로 복사한다. 손으로 쓰는 정적 파일이라 빌드가 아니라 복사다.

  tokens.css   — 어느 환경에서든 반드시 불러야 한다. 컴포넌트 스타일이 이
                 파일의 변수를 폴백 없이 참조한다.
  controls.css — 네이티브 요소용 클래스. 순수 HTML 소비자가 직접 링크한다.
*/
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

mkdirSync("dist", { recursive: true });

for (const [from, to] of [
  ["src/tokens/tokens.css", "dist/tokens.css"],
  ["src/controls/controls.css", "dist/controls.css"],
]) {
  copyFileSync(from, to);
  console.log(`복사 완료: ${to}`);
}

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
  "  **이 파일은 임포트하는 순간 0.1.5 의 이름 충돌을 그대로 재현한다. 그게",
  "  목적이다.** 무접두사 이름을 소비자 문서와 같은 :root 이름공간에 다시",
  "  정의하는 것이 하는 일의 전부이므로, 같은 이름을 다른 뜻으로 쓰는 CSS 가",
  "  하나라도 있으면 임포트 순서가 다시 화면을 정한다.",
  "",
  "  **이미 무접두사 이름을 직접 참조하는 CSS 가 있는 프로젝트만 임포트한다.**",
  "  새 프로젝트는 임포트하지 않는다. 경위는 저장소의 docs/gotchas.md 의",
  "  \"토큰 이름을 소비자와 공유하면 라이브러리가 캐스케이드에 종속된다\" 에 있다.",
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
