---
name: releasing
description: Use when cutting a release of this package, bumping its version, publishing a tag, or when a consumer needs a tag that includes recent changes
---

# 릴리스

## 왜 이렇게 하나

npm 레지스트리를 쓰지 않는다. 소비자는 `git+ssh://…#v0.1.3` 으로 설치하고, npm 은 그 태그의 저장소를 clone 해서 `files` 가 고르는 것만 가져간다. 그래서 **`dist/` 가 태그 커밋에 물리적으로 존재해야 한다.** 동시에 `main` 은 빌드 산출물 없이 유지한다.

태그는 이미 있는 커밋에 파일을 더할 수 없다. 그래서 `scripts/release.mjs` 가 detached HEAD 에서 `dist/` 를 포함한 커밋을 새로 만들고 거기에 태그를 붙인 뒤 브랜치로 돌아온다.

## 실행

```sh
npm run release -- 0.1.4
```

스크립트가 순서대로 한다: `check` → `build` → 버전 커밋(문서 설치 버전 포함) → detached → `dist` 커밋 → 태그 → push(origin 있을 때만) → 브랜치 복귀.

## 반드시 확인할 것

### 태그 안의 산출물이 최신 소스로 빌드됐는가

**타입만 바뀐 수정도 태그를 다시 잘라야 한다.** `as EventName<...>` 같은 타입 어노테이션은 런타임 JS 에서 지워지지만 `.d.ts` 에는 남는다. 소스를 고쳐놓고 재발행하지 않으면 소비자는 깨진 타입을 계속 받는다.

```sh
git show v0.1.4:dist/react/index.d.ts | grep onNs
```

`EventName<CustomEvent<...>>` 가 보여야 한다. `string` 이면 옛 빌드다.

### 태그 안의 문서가 자기 버전을 가리키는가

`README.md` 는 패키지에 함께 배포된다. 릴리스 스크립트가 설치 버전을 갱신하지만, 확인은 한다.

```sh
git show v0.1.4:README.md | grep 'common-ui.git#'
```

### 콜드 설치가 되는가

소비자가 실제로 밟는 경로다. 정적 검사로는 절대 안 잡히는 것들이 여기서 드러난다.

```sh
rm -rf /tmp/ns-check && mkdir -p /tmp/ns-check && cd /tmp/ns-check && npm init -y >/dev/null
npm i "git+file:///Users/neosimplix/coding/dashboard/common-ui#v0.1.4"
ls node_modules/@neosimplix/common-ui/dist
node --input-type=module -e "import('@neosimplix/common-ui').then(m=>console.log(Object.keys(m).sort().join(', ')))"
cd - && rm -rf /tmp/ns-check
```

마지막 줄이 `NsDialog, NsHeader, NsIcon, NsNavGroup, NsNavItem, NsPageHeading, NsPagination, NsSidebar, NsSkeleton, NsTable` 를 출력해야 한다(`Object.keys().sort()` 라 알파벳 순이다 — `src/index.ts` 의 export 목록과 대조). Node 에는 `window` 도 `customElements` 도 없으므로, **이것이 이 저장소에서 SSR 안전성을 증명하는 유일한 자동 검사다.** `ReferenceError: HTMLElement is not defined` 가 나면 `register()` 를 고치지 말 것 — 가드는 정상이고 원인은 빌드 설정이다(`docs/gotchas.md` 참고).

## 함정

| 상황 | 처리 |
|---|---|
| 깨진 산출물로 태그를 이미 만들었다 | `git tag -d vX.Y.Z` 로 폐기하고 다음 번호로 다시 자른다. 깨진 태그를 남기는 것이 없는 것보다 나쁘다 |
| 릴리스 직후 `index.html` 이 빈 화면 | 정상이다. 브랜치 복귀 시 git 이 `dist/` 를 지운다. `npm run demo` 로 재빌드 |
| 릴리스가 중간에 실패했다 | `git branch --show-current` 로 `main` 인지 먼저 확인. 스크립트가 정리 명령을 출력한다 |
| `origin` 이 없다 | 스크립트가 push 를 건너뛰고 알린다. 오류가 아니다 |

## push

**`git push` 는 사용자가 명시적으로 요청할 때만 한다.** 태그 생성까지가 기본이다. 버전 커밋도 브랜치에 남아 있을 뿐 푸시되지 않는다.
