/*
  CSS 두 개를 dist/ 로 복사한다. 손으로 쓰는 정적 파일이라 빌드가 아니라 복사다.

  tokens.css   — 어느 환경에서든 반드시 불러야 한다. 컴포넌트 스타일이 이
                 파일의 변수를 폴백 없이 참조한다.
  controls.css — 네이티브 요소용 클래스. 순수 HTML 소비자가 직접 링크한다.
*/
import { copyFileSync, mkdirSync } from "node:fs";

mkdirSync("dist", { recursive: true });

for (const [from, to] of [
  ["src/tokens/tokens.css", "dist/tokens.css"],
  ["src/controls/controls.css", "dist/controls.css"],
]) {
  copyFileSync(from, to);
  console.log(`복사 완료: ${to}`);
}
