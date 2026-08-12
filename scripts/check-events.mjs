/*
  컴포넌트가 발생시키는 커스텀 이벤트가 React 래퍼에 빠짐없이 등록됐는지
  확인한다.

  createComponent 는 프로퍼티 타입은 자동으로 끌어오지만 이벤트 매핑은
  손으로 적어야 한다. 컴포넌트에 이벤트를 추가하고 래퍼를 깜빡하면
  React 사용자에게만 조용히 동작하지 않는다. 그 드리프트를 여기서 잡는다.
*/
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return walk(p);
    return p.endsWith(".ts") ? [p] : [];
  });

const emitted = new Set();
for (const file of walk("src/components")) {
  const source = readFileSync(file, "utf8");
  for (const m of source.matchAll(/new CustomEvent\(\s*["']([^"']+)["']/g)) {
    emitted.add(m[1]);
  }
}

const wrapper = readFileSync("src/react/index.ts", "utf8");
const mapped = new Set(
  [...wrapper.matchAll(/on[A-Za-z0-9]+:\s*["']([^"']+)["']/g)].map((m) => m[1]),
);

const missing = [...emitted].filter((name) => !mapped.has(name)).sort();
if (missing.length > 0) {
  console.error(
    `React 래퍼(src/react/index.ts)에 등록되지 않은 이벤트: ${missing.join(", ")}`,
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
