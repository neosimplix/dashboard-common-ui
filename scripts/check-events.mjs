/*
  컴포넌트가 발생시키는 커스텀 이벤트가 React 래퍼에 빠짐없이 등록됐는지
  확인한다.

  createComponent 는 프로퍼티 타입은 자동으로 끌어오지만 이벤트 매핑은
  손으로 적어야 한다. 컴포넌트에 이벤트를 추가하고 래퍼를 깜빡하면
  React 사용자에게만 조용히 동작하지 않는다. 그 드리프트를 여기서 잡는다.

  이 검사의 실제 한계:
  - 정규식이 리터럴 큰따옴표/작은따옴표 문자열만 잡는다. 백틱 템플릿
    리터럴이나 변수로 넘긴 이벤트 이름은 잡지 못한다.
  - 컴포넌트별 매핑이 아니라 전체 이벤트 이름 집합끼리만 비교한다.
    예를 들어 어떤 컴포넌트가 "ns-navigate"를 발생시키지 않는데도 다른
    컴포넌트의 "ns-navigate" 매핑을 자기 것으로 착각해 통과할 수 있다.
  - strip() 은 주석만 지운다. 문자열 리터럴 안에 `onFoo: "ns-foo"` 처럼
    매핑과 같은 모양이 들어 있으면 여전히 매핑으로 잡힌다 — 이 저장소에서
    래퍼가 그렇게 쓰이지 않으므로 감수한다.
*/
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return walk(p);
    return p.endsWith(".ts") ? [p] : [];
  });

/*
  check-tokens.mjs 의 strip() 과 같은 idiom 이다. 주석에 적힌 예시가 실제
  코드처럼 잡히면 안 되므로(주석 처리로 지운 매핑이 계속 통과하면 이 검사가
  무력해진다) 매칭 전에 CSS/JS 블록 주석과 `//` 줄 주석을 지운다. `://` 로
  시작하는 URL 을 줄 주석으로 오인하지 않도록 앞 글자가 `:` 가 아닐 때만 자른다.
*/
const strip = (source) =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1");

const emitted = new Set();
for (const file of walk("src/components")) {
  const source = strip(readFileSync(file, "utf8"));
  for (const m of source.matchAll(/new CustomEvent\(\s*["']([^"']+)["']/g)) {
    emitted.add(m[1]);
  }
}

const wrapper = strip(readFileSync("src/react/elements.ts", "utf8"));
const mapped = new Set(
  [...wrapper.matchAll(/on[A-Za-z0-9]+:\s*["']([^"']+)["']/g)].map((m) => m[1]),
);

const missing = [...emitted].filter((name) => !mapped.has(name)).sort();
if (missing.length > 0) {
  console.error(
    `React 래퍼(src/react/elements.ts)에 등록되지 않은 이벤트: ${missing.join(", ")}`,
  );
  process.exit(1);
}

const unused = [...mapped].filter((name) => !emitted.has(name)).sort();
if (unused.length > 0) {
  console.error(
    `어떤 컴포넌트도 발생시키지 않는 이벤트가 래퍼에 있습니다: ${unused.join(", ")}`,
  );
  process.exit(1);
}

console.log(`이벤트 매핑 확인 완료: ${[...emitted].sort().join(", ")}`);
