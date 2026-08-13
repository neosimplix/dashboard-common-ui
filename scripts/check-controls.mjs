/*
  controls.css 의 클래스와 index.html 문서를 양방향으로 대조한다.

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
*/
const ELEMENT = /^[ \t]*(ns-[a-z-]+)[ \t]*[,{]/gm;

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

console.log(`클래스 문서 확인 완료: ${[...defined].sort().join(", ")}`);
