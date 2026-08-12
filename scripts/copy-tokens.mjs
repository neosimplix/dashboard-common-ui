import { copyFileSync, mkdirSync } from "node:fs";

mkdirSync("dist", { recursive: true });
copyFileSync("src/tokens/tokens.css", "dist/tokens.css");
console.log("복사 완료: dist/tokens.css");
