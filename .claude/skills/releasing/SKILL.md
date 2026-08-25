---
name: releasing
description: Use when cutting a release of this package, bumping its version, publishing a tag, or when a consumer needs a tag that includes recent changes
---

# 릴리스

## 왜 이렇게 하나

npm 레지스트리를 쓰지 않는다. 소비자는 `git+ssh://…#v0.1.3` 으로 설치하고, npm 은 그 태그의 저장소를 clone 해서 `files` 가 고르는 것만 가져간다. 그래서 **`dist/` 가 태그 커밋에 물리적으로 존재해야 한다.** 동시에 `main` 은 빌드 산출물 없이 유지한다.

태그는 이미 있는 커밋에 파일을 더할 수 없다. 그래서 `scripts/release.mjs` 가 detached HEAD 에서 `dist/` 를 포함한 커밋을 새로 만들고 거기에 태그를 붙인 뒤 브랜치로 돌아온다.

## 자르기 전에 — `docs/pending-human-checks.md` 가 비어 있어야 한다

그 파일은 **사람이 브라우저에서 봐야 하는데 아직 아무도 안 본 것**을 담는다. 항목이 남아 있으면 그것은 확인되지 않은 항목이다 — `npm run check` 는 그중 아무것도 보지 못하고, 소비자 프로젝트가 있어야 확인되는 B 항목에 대해서는 검사가 전부 초록인 것이 **아무 증거도 아니다.**

그래서 순서가 이렇다. **① 목록을 끝까지 확인한다 → ② 파일을 비우는 커밋을 만든다 → ③ 그다음에 자른다.** 아래 "반드시 확인할 것" 은 전부 태그를 자른 **뒤**의 검사이고, 그때 발견된 문제는 태그를 지우고 다음 번호로 다시 자르는 것 말고 방법이 없다(아래 함정 참고). 목록 확인을 그쪽으로 미루지 않는다.

파일이 이미 `## 대기 없음` 이면 그대로 진행한다.

## 실행

```sh
npm run release -- 0.1.4
```

스크립트가 순서대로 한다: `check` → `build` → 버전 커밋(문서 설치 버전 포함) → detached → `dist` 커밋 → 태그 → push(origin 있을 때만) → 브랜치 복귀.

## 반드시 확인할 것

### 태그 안의 산출물이 최신 소스로 빌드됐는가

**타입만 바뀐 수정도 태그를 다시 잘라야 한다.** `as EventName<...>` 같은 타입 어노테이션은 런타임 JS 에서 지워지지만 `.d.ts` 에는 남는다. 소스를 고쳐놓고 재발행하지 않으면 소비자는 깨진 타입을 계속 받는다.

```sh
git show v0.1.4:dist/react/elements.d.ts | grep -E 'onNs[A-Za-z]+:'
```

이벤트를 가진 아홉 래퍼가 (`onNsNavigate` 는 세 컴포넌트가 공유하므로) 열 줄로 나와야 하고, 전부 `EventName<CustomEvent<...>>` 여야 한다. **`EventName` 브랜딩은 `dist/react/index.d.ts` 가 아니라 `elements.d.ts` 에 있다** — `index.d.ts` 를 대상으로 grep 하면 아무 줄도 안 나오고 그 상태로 항상 "통과"하므로 검사가 아니다.

나쁜 결과는 둘이다. ① 어떤 줄이 `onNsToggle: string;` 처럼 `EventName<...>` 없이 맨 `string` 으로 끝난다 — 그 이벤트의 캐스트가 소스에서 빠졌거나 약해졌다는 뜻이다. ② 줄이 열 개보다 적게 나온다 — 래퍼 하나가 통째로 사라졌다는 뜻이다.

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

마지막 줄이 이것을 출력해야 한다.

```
NsDialog, NsHeader, NsIcon, NsMultiSelect, NsNavGroup, NsNavItem, NsPageHeading, NsPagination, NsSidebar, NsSkeleton, NsTable, NsTabs, NsToast, nsAlert, nsConfirm, nsToast, nsToastPosition, registerIcons, svg, tabIdFor
```

`Object.keys().sort()` 는 코드포인트 순이라 **대문자로 시작하는 이름이 전부 앞에 오고 소문자가 뒤에 온다** — 사람이 읽는 알파벳 순이 아니다. `src/index.ts` 의 export 목록과 대조한다. 이 목록에는 엘리먼트 클래스만 있는 것이 아니다 — 명령형 API 셋(`nsToast`·`nsAlert`·`nsConfirm`), 그 설정 함수(`nsToastPosition`), 헬퍼(`tabIdFor`·`registerIcons`·`svg`) 가 함께 나온다.

**기대 목록을 손으로 늘리지 않는다.** 컴포넌트를 더한 뒤에는 위 명령을 다시 돌려 나온 줄을 그대로 붙여 넣는다. 손으로 추측하면 목록이 소스와 어긋나고, 어긋난 기대값은 검사가 아니다.

Node 에는 `window` 도 `customElements` 도 없으므로, **이것이 이 저장소에서 SSR 안전성을 증명하는 유일한 자동 검사다.** `ReferenceError: HTMLElement is not defined` 가 나면 `register()` 를 고치지 말 것 — 가드는 정상이고 원인은 빌드 설정이다(`docs/gotchas.md` 참고).

## 함정

| 상황 | 처리 |
|---|---|
| 깨진 산출물로 태그를 이미 만들었다 | `git tag -d vX.Y.Z` 로 폐기하고 다음 번호로 다시 자른다. 깨진 태그를 남기는 것이 없는 것보다 나쁘다 |
| 릴리스 직후 `index.html` 이 빈 화면 | 정상이다. 브랜치 복귀 시 git 이 `dist/` 를 지운다. `npm run demo` 로 재빌드 |
| 릴리스가 중간에 실패했다 | `git branch --show-current` 로 `main` 인지 먼저 확인. 스크립트가 정리 명령을 출력한다 |
| `origin` 이 없다 | 스크립트가 push 를 건너뛰고 알린다. 오류가 아니다 |

## push

**`git push` 는 사용자가 명시적으로 요청할 때만 한다.** 태그 생성까지가 기본이다. 버전 커밋도 브랜치에 남아 있을 뿐 푸시되지 않는다.
