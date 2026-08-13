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
*/
import { readFileSync } from "node:fs";

const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "");

const css = stripComments(readFileSync("src/controls/controls.css", "utf8"));
const html = readFileSync("index.html", "utf8");

const CLASS = /\.(ns-[a-z0-9_-]+)/g;

const defined = new Set([...css.matchAll(CLASS)].map((m) => m[1]));

const documented = new Set([...html.matchAll(CLASS)].map((m) => m[1]));
for (const m of html.matchAll(/class="([^"]*)"/g)) {
  for (const name of m[1].split(/\s+/)) {
    if (name.startsWith("ns-")) documented.add(name);
  }
}

const missing = [...defined].filter((n) => !documented.has(n)).sort();
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
