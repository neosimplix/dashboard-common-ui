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
const es: UserConfig = {
  // 1. ES — 번들러(Next/Vite)가 소비하는 웹 컴포넌트
  build: {
    lib: { entry: r("src/index.ts"), formats: ["es"], fileName: () => "index.js" },
    rollupOptions: { external: ["lit"] },
  },
};

const react: UserConfig = {
  // 2. ES — React 래퍼. 'use client' 배너가 필요해 별도 설정으로 분리한다
  build: {
    emptyOutDir: false,
    lib: { entry: r("src/react/index.ts"), formats: ["es"], fileName: () => "react.js" },
    rollupOptions: {
      external: ["react", "react-dom", "lit", "@lit/react"],
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
