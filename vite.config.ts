import { defineConfig, type UserConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

// package.json 이 "type": "module" 이므로 __dirname 이 없다.
const here = path.dirname(fileURLToPath(import.meta.url));
const r = (p: string) => path.resolve(here, p);

// 브리프 원안은 `defineConfig([...])`로 세 빌드를 배열 하나에 묶었으나,
// 설치된 Vite 6.4.3 은 배열 설정 익스포트를 지원하지 않는다
// (loadConfigFromFile 이 "config must export or return an object" 로 실패).
// `defineConfig([...])` 는 Rollup 의 config 파일 기능이고 Vite 에는 없다.
// 대신 Vite 내장 `--mode` 플래그로 셋 중 하나를 선택해 매번 단일 객체를 내보내고,
// package.json 의 build 스크립트가 vite build 를 세 번(모드별로) 호출한다.
// (참고: esbuild 의 청크 재출력 과정에서 배너의 인용부호가 큰따옴표로 바뀔 수
// 있으나, 문자열 값은 동일하므로 무해하다.)
/*
  Rollup 의 문자열 external 은 모듈 지정자와 정확히 일치해야 한다.
  "lit" 만 적으면 컴포넌트가 쓰는 "lit/decorators.js" 가 걸리지 않아
  @lit/reactive-element 가 번들에 통째로 들어간다. 그 안의
  `class ReactiveElement extends HTMLElement` 가 모듈 평가 시점에
  실행되므로 Node 에서 import 하면 ReferenceError 로 죽는다 — Next 의
  서버 렌더링이 정확히 그 경로다.

  게다가 소비자 앱에 ReactiveElement 가 두 벌 생긴다. LitElement 는
  external "lit" 에서, 데코레이터는 번들된 사본에서 오기 때문에 Lit 이
  "Multiple versions of Lit loaded" 를 경고하고 반응성이 깨질 수 있다.

  정규식으로 lit 계열 전체를 외부로 둔다. lit 은 dependencies 에 있으므로
  소비자에게 함께 설치된다.
*/
const litExternal = [/^lit(\/.*)?$/, /^@lit\/.*/, /^@lit-labs\/.*/];

const es: UserConfig = {
  // 1. ES — 번들러(Next/Vite)가 소비하는 웹 컴포넌트
  build: {
    lib: { entry: r("src/index.ts"), formats: ["es"], fileName: () => "index.js" },
    rollupOptions: { external: litExternal },
  },
};

const react: UserConfig = {
  // 2. ES — React 래퍼. 'use client' 배너가 필요해 별도 설정으로 분리한다
  build: {
    emptyOutDir: false,
    lib: { entry: r("src/react/index.ts"), formats: ["es"], fileName: () => "react.js" },
    rollupOptions: {
      external: ["react", "react-dom", ...litExternal],
      // Rollup 은 모듈 최상단 디렉티브를 제거한다. 소스에 써도 남지 않으므로
      // 여기서 다시 주입한다. 없으면 Next 의 Server Component 가 import 할 때 터진다.
      output: { banner: "'use client';" },
    },
  },
};

const umd: UserConfig = {
  // 3. UMD — file:// 로컬 실행용. lit 을 인라인한다
  build: {
    emptyOutDir: false,
    lib: {
      entry: r("src/index.ts"),
      name: "NsCommonUi",
      formats: ["umd"],
      fileName: () => "bundle.umd.js",
    },
  },
};

const configs: Record<string, UserConfig> = { es, react, umd };

export default defineConfig(({ mode }) => configs[mode] ?? es);
