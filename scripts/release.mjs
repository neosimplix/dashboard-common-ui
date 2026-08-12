/*
  main 은 소스만 유지하고 dist 는 릴리스 태그에만 넣는다.

  태그는 이미 존재하는 커밋에 파일을 얹을 수 없으므로, detached HEAD 에서
  dist 를 포함한 커밋을 새로 만들고 거기에 태그를 붙인다. main 히스토리는
  건드리지 않는다.
*/
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const version = process.argv[2];
if (!/^\d+\.\d+\.\d+$/.test(version ?? "")) {
  console.error("사용법: npm run release -- 0.1.0");
  process.exit(1);
}
const tag = `v${version}`;

const git = (...args) => execFileSync("git", args, { stdio: "inherit" });
const gitOut = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const run = (cmd, ...args) => execFileSync(cmd, args, { stdio: "inherit" });

if (gitOut("status", "--porcelain")) {
  console.error("작업 트리가 깨끗하지 않습니다. 커밋하거나 stash 후 다시 실행하세요.");
  process.exit(1);
}
if (gitOut("tag", "--list", tag)) {
  console.error(`${tag} 태그가 이미 있습니다.`);
  process.exit(1);
}

const branch = gitOut("rev-parse", "--abbrev-ref", "HEAD");

/*
  검사와 빌드를 git 에 아무것도 쓰기 전에 먼저 돌린다. 순서를 뒤집으면
  버전 커밋을 남긴 뒤에 빌드가 깨져서, 검증되지 않은 버전 커밋이
  브랜치에 남는다.
*/
run("npm", "run", "check");
run("npm", "run", "build");

// 버전 커밋은 현재 브랜치에 남긴다.
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
pkg.version = version;
writeFileSync("package.json", `${JSON.stringify(pkg, null, 2)}\n`);

/*
  README.md / index.html 에 적힌 설치 라인의 태그도 같은 커밋에서 갱신한다.
  이걸 릴리스 이후로 미루면, npm pack 이 태그 커밋 시점의 README 를 그대로
  패키지에 넣기 때문에 태그의 README 는 항상 이전 버전을 가리키게 된다.
  패턴에 매치되는 게 없으면 조용히 넘어가지 않고 바로 실패한다 — 그게
  바로 이 버그를 다시 만드는 길이다.
*/
const installPattern = /dashboard-common-ui\.git#v\d+\.\d+\.\d+/g;
const docFiles = ["README.md", "index.html"];
for (const file of docFiles) {
  const content = readFileSync(file, "utf8");
  if (!content.match(installPattern)) {
    console.error(
      `${file} 에서 설치 버전 패턴을 찾지 못했습니다. 기대한 패턴: dashboard-common-ui.git#v<semver>`
    );
    process.exit(1);
  }
  const updated = content.replace(installPattern, `dashboard-common-ui.git#v${version}`);
  writeFileSync(file, updated);
}

git("add", "package.json", ...docFiles);
git("commit", "-m", `chore(release): v${version}`);

const hasOrigin = gitOut("remote").split("\n").includes("origin");

/*
  여기서부터 detached HEAD 다. 무슨 일이 있어도 브랜치로 돌아와야 한다 —
  중간에 던지고 끝나면 사용자가 detached 상태에 갇힌 채 이유도 모른다.
  push 실패(네트워크·인증)가 가장 현실적인 경로다.
*/
git("checkout", "--detach");
try {
  // dist 는 .gitignore 대상이라 -f 로 강제 추가한다.
  git("add", "-f", "dist");
  git("commit", "-m", `release: ${tag}`);
  git("tag", tag);

  if (hasOrigin) {
    git("push", "origin", tag);
    console.log(`\n${tag} 태그를 푸시했습니다.`);
  } else {
    console.log(`\n${tag} 태그를 로컬에 만들었습니다. origin 이 없어 푸시는 건너뜁니다.`);
  }
} catch (error) {
  console.error(`
릴리스가 중단됐습니다. ${branch} 브랜치로 돌아갑니다.

정리할 것이 남아 있을 수 있습니다:
  git tag -l ${tag}                 태그가 만들어졌는지 확인
  git tag -d ${tag}                 만들어졌다면 삭제
  git log --oneline -1 ${branch}    버전 커밋을 되돌릴지 판단
`);
  throw error;
} finally {
  git("checkout", branch);
}

console.log(`
${branch} 브랜치의 버전 커밋은 아직 푸시되지 않았습니다:
  git push origin ${branch}

소비자 설치:
  "@neosimplix/common-ui": "git+https://github.com/neosimplix/dashboard-common-ui.git#${tag}"
`);
