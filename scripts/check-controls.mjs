/*
  **이름 목록 둘을 양방향으로 대조하는 검사 둘이 이 파일에 있다.**

    ㉠ controls.css 의 클래스 ↔ index.html 문서
    ㉡ README.md 릴리스 표의 태그 ↔ changelog.html 의 절

  둘은 대상이 다르지만 하는 일이 정확히 같다 — 두 곳에 나뉘어 적힌 같은 이름
  목록이 어긋나면, 어느 쪽이 빠졌든 실패시킨다. 그래서 ㉡ 을 위해 새 스크립트를
  만들지 않고 여기에 붙였다.

  ---

  ㉠ controls.css 의 클래스와 index.html 문서를 양방향으로 대조한다.

  클래스 레이어에는 타입 검사가 닿지 않는다. controls.css 에 클래스를 추가하고
  index.html 에 안 적으면 아무도 모른다. 반대로 index.html 이 존재하지 않는
  클래스를 문서화하고 있으면 오타다.

  --modifier 변형도 개별 이름으로 센다. .ns-button--ghost 를 문서에 빠뜨리는
  것이 정확히 이 검사가 잡아야 하는 누락이다.

  문서 쪽에서 클래스를 뽑는 방법이 두 가지인 이유:
    - class="..." 속성값     → 데모와 HTML 예시에서 실제로 쓰인 것
    - .ns-x 처럼 점이 붙은 것 → 표와 산문에서 이름으로 언급된 것
  태그 이름(ns-dialog 등)을 클래스로 오해하지 않으려면 이 둘만 봐야 한다.
  html.includes("ns-dialog") 로 판정하면 태그가 클래스로 잡힌다.

  한계: 클래스가 언급됐는지만 본다. 예시가 올바른지는 보지 못한다.

  요소 선택자(ns-table 등)는 정방향으로만 대조한다. CSS 에 있으면 문서에도
  있어야 하지만, 태그 이름은 index.html 전체에 정당하게 등장하므로 역방향
  대조는 넣지 않는다.
*/
import { readFileSync } from "node:fs";

const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "");

const css = stripComments(readFileSync("src/controls/controls.css", "utf8"));
const html = readFileSync("index.html", "utf8");

const CLASS = /\.(ns-[a-z0-9_-]+)/g;

const defined = new Set([...css.matchAll(CLASS)].map((m) => m[1]));

/*
  요소 선택자도 잡는다.

  ns-table · ns-pagination 은 Light DOM 컴포넌트라 controls.css 가 요소
  선택자로 직접 스타일한다(`ns-table { overflow-x: auto }`). 점이 붙은 클래스만
  찾으면 그 규칙들이 문서 대조 밖에 놓인다.

  정방향만 본다 — CSS 에 있으면 문서에도 있어야 한다. 역방향은 넣지 않는다.
  태그 이름은 index.html 전체에 정당하게 등장하므로(데모 마크업, 프로퍼티 표,
  예시 블록) 역방향으로 보면 거짓 양성만 쏟아진다.

  선택자 경계에서 잡는다 — 줄 시작이 아니라. 줄 기준으로 하면
  `} ns-table {` 처럼 앞 규칙과 같은 줄에 쓴 것, `ns-table[data-x]`,
  `ns-table:hover` 가 모두 조용히 빠진다. 문서 대조를 붙이는 목적이
  바로 그런 누락을 막는 것이므로, 못 잡는 형태를 남기면 검사가 무의미해진다.

  경계는 줄 시작 · `}` · `;` · `,` 다. 뒤따르는 것은 공백·`,`·`{`·`:`·`[`·`.`
  중 하나여야 한다 — 이름이 거기서 끝난다는 뜻이다.

  `.ns-table` 같은 클래스는 잡히지 않는다. 캡처가 `ns-` 로 시작해야 하고
  경계 뒤의 `.` 는 그 조건을 만족시키지 못한다. `data-ns-row-id` 도 잡히지
  않는다 — `ns-` 앞이 `data-` 라 경계가 아니다.

  넓혀서 과하게 잡히면 "문서화하라" 는 시끄러운 실패가 된다. 좁아서 놓치는
  조용한 통과보다 그쪽이 안전한 방향이다.
*/
const ELEMENT = /(?:^|[};,])\s*(ns-[a-z0-9-]+)(?=[\s,{:[.])/gm;

for (const m of css.matchAll(ELEMENT)) defined.add(m[1]);

const documented = new Set([...html.matchAll(CLASS)].map((m) => m[1]));
for (const m of html.matchAll(/class="([^"]*)"/g)) {
  for (const name of m[1].split(/\s+/)) {
    if (name.startsWith("ns-")) documented.add(name);
  }
}

/*
  요소 선택자의 문서화 여부는 태그가 등장하는지로 본다 — <ns-table> 마크업이든
  <code>ns-table</code> 언급이든 상관없다. defined 에 있는 이름만 확인하므로
  (documented 에 넣는 것이 아니라) 역방향 거짓 양성이 생기지 않는다.
*/
const TAG = (name) => new RegExp(`<${name}[\\s>]|<code>${name}</code>`);

const missing = [...defined]
  .filter((n) => !documented.has(n) && !TAG(n).test(html))
  .sort();
if (missing.length > 0) {
  console.error(`index.html 에 문서화되지 않은 클래스: ${missing.join(", ")}`);
  process.exit(1);
}

const unknown = [...documented].filter((n) => !defined.has(n)).sort();
if (unknown.length > 0) {
  console.error(
    `controls.css 에 없는 클래스가 index.html 에 있습니다: ${unknown.join(", ")}`,
  );
  process.exit(1);
}

/*
  ㉡ README.md 의 릴리스 표와 changelog.html 의 절을 양방향으로 대조한다.

  이 라이브러리는 git 태그로 배포되므로 "태그 사이에 무엇이 바뀌었나" 가 소비자
  문서의 핵심이다. 그 내용은 깊이로 나뉘어 있다 — README 의 표는 태그와 한 줄
  요약, changelog.html 은 무엇이 왜 바뀌었는지와 이주 코드. **같은 사실을 두 곳에
  적지 않는 것이 그 분할의 목적이고, 어쩔 수 없이 두 곳에 함께 있는 것은 태그
  목록 하나다.** 그 하나가 이 검사의 대상이다.

  양방향인 이유가 ㉠ 과 같다.

    - 표에만 있는 태그 → 릴리스를 자르면서 changelog 절을 잊었다. 소비자는
      README 의 링크를 눌러 아무것도 없는 곳에 도착한다.
    - changelog 에만 있는 절 → 표의 행을 지웠거나 절 id 에 오타가 났다. 어느
      쪽이든 소비자가 표에서 그 버전을 찾을 수 없다.

  한쪽만 보면 나머지 방향의 드리프트가 조용히 통과한다.

  표에서 태그를 뽑는 범위를 "## 릴리스" 절로 좁힌다. README 에는 표가 여럿이고,
  다른 표의 첫 칸에 버전 문자열이 들어가는 순간 대조 대상이 오염된다.

  태그 칸이 링크(`[`v0.5.1`](./changelog.html#v0-5-1)`)라 백틱 안의 이름을 찾는다.
  릴리스 전 변경을 담아 두는 `(릴리스 전)` 행은 백틱 태그가 없으므로 그냥
  넘어간다 — 태그를 채우는 순간 대조 대상이 되고, 그때 절이 없으면 실패한다.
  그것이 이 검사가 릴리스 절차에 거는 압력이다.

  절 쪽은 h2 의 id 로 센다. 점은 id 에 쓸 수 없어 하이픈으로 적으므로(`v0-5-1`)
  되돌려 비교한다. **산문에 적힌 버전 문자열은 세지 않는다** — changelog.html 은
  절이 없는 버전(0.1.x)을 산문에서 언급하고, 절이 있는 버전도 다른 절의 산문에서
  서로를 가리킨다. 그것까지 세면 표에 없는 이름이 쏟아지고 절의 유무를 못 본다.
*/
const readme = readFileSync("README.md", "utf8");
const changelog = readFileSync("changelog.html", "utf8");

const RELEASE_HEADING = "## 릴리스";
const headingAt = readme.indexOf(RELEASE_HEADING);
if (headingAt < 0) {
  console.error(`README.md 에 "${RELEASE_HEADING}" 절이 없습니다.`);
  process.exit(1);
}
const afterHeading = headingAt + RELEASE_HEADING.length;
const nextHeading = readme.indexOf("\n## ", afterHeading);
const releaseSection = readme.slice(
  afterHeading,
  nextHeading < 0 ? readme.length : nextHeading,
);

const listed = new Set(
  releaseSection
    .split("\n")
    .filter((line) => line.trimStart().startsWith("|"))
    .flatMap((line) => {
      const firstCell = line.split("|")[1] ?? "";
      const m = firstCell.match(/`(v\d+\.\d+\.\d+)`/);
      return m ? [m[1]] : [];
    }),
);

const sectioned = new Set(
  [...changelog.matchAll(/id="v(\d+)-(\d+)-(\d+)"/g)].map(
    (m) => `v${m[1]}.${m[2]}.${m[3]}`,
  ),
);

/*
  목록이 비면 대조가 아무것도 하지 않는다 — 어느 방향이든 "차집합이 없다" 로
  통과하므로, 표 파싱이 깨진 것과 모든 태그에 절이 있는 것이 같은 모양이 된다.
  대조보다 먼저 막는다.
*/
if (listed.size === 0) {
  console.error("README.md 릴리스 표에서 태그를 하나도 찾지 못했습니다.");
  process.exit(1);
}

const byVersion = (a, b) =>
  a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });

const noSection = [...listed].filter((t) => !sectioned.has(t)).sort(byVersion);
if (noSection.length > 0) {
  console.error(
    "README.md 릴리스 표에 있는데 changelog.html 에 절이 없는 태그: " +
      `${noSection.join(", ")}\n` +
      "  changelog.html 에 <h2 id=\"v0-0-0\"> 꼴의 절을 더하세요(점은 하이픈으로).",
  );
  process.exit(1);
}

const noRow = [...sectioned].filter((t) => !listed.has(t)).sort(byVersion);
if (noRow.length > 0) {
  console.error(
    "changelog.html 에 절이 있는데 README.md 릴리스 표에 행이 없는 태그: " +
      `${noRow.join(", ")}\n` +
      "  README.md 의 \"## 릴리스\" 표에 행을 더하거나 절 id 의 오타를 고치세요.",
  );
  process.exit(1);
}

console.log(`클래스 문서 확인 완료: ${[...defined].sort().join(", ")}`);
console.log(
  `릴리스 표 ↔ changelog.html 확인 완료: ${[...listed].sort(byVersion).reverse().join(", ")}`,
);
