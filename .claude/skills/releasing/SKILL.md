---
name: releasing
description: Use when cutting a release of this package, bumping its version, publishing a tag, or when a consumer needs a tag that includes recent changes
---

# 릴리스

## 왜 이렇게 하나

npm 레지스트리를 쓰지 않는다. 소비자는 `git+ssh://…#v0.1.3` 으로 설치하고, npm 은 그 태그의 저장소를 clone 해서 `files` 가 고르는 것만 가져간다. 그래서 **`dist/` 가 태그 커밋에 물리적으로 존재해야 한다.** 동시에 `main` 은 빌드 산출물 없이 유지한다.

태그는 이미 있는 커밋에 파일을 더할 수 없다. 그래서 `scripts/release.mjs` 가 detached HEAD 에서 `dist/` 를 포함한 커밋을 새로 만들고 거기에 태그를 붙인 뒤 브랜치로 돌아온다.

## 자르기 전에 — 사람이 봐야 하는 것을 사용자에게 확인받는다

**사람이 브라우저에서 봐야 하는데 아직 아무도 안 본 것**이 있으면 태그를 자르기 전에 사용자에게 직접 알린다. `npm run check` 는 그중 아무것도 보지 못하고, 소비자 프로젝트가 있어야 확인되는 항목에 대해서는 검사가 전부 초록인 것이 **아무 증거도 아니다.**

그래서 순서가 이렇다. **① 사람 눈이 필요한 것을 사용자에게 보고한다 → ② 확인·승인을 받는다 → ③ 그다음에 자른다.** 아래 "반드시 확인할 것" 은 전부 태그를 자른 **뒤**의 검사이고, 그때 발견된 문제는 태그를 지우고 다음 번호로 다시 자르는 것 말고 방법이 없다(아래 함정 참고). 보고를 그쪽으로 미루지 않는다.

보고할 것이 없으면(사람 눈이 필요한 항목이 없으면) 그대로 진행한다.

## 자르기 전에 — `README.md` 의 `(릴리스 전)` 행에 태그를 채운다

`README.md` 의 릴리스 표는 아직 태그가 없는 변경을 `(릴리스 전)` 행에 담아 두다가, 태그를 자르는 시점에 그 행의 태그 칸을 실제 버전(`vX.Y.Z`)으로 바꾼다. 다음 릴리스가 또 태그 전 변경을 쌓기 시작하면 그때 새 `(릴리스 전)` 행을 만든다.

**`npm run release` 는 이 행을 갱신하지 않는다.** 스크립트가 건드리는 것은 설치 안내의 버전 문자열뿐이다(아래 "태그 안의 문서가 자기 버전을 가리키는가" 참고). 행을 채우지 않은 채로 태그를 자르면 그 태그가 배포하는 `README.md` 가 여전히 `(릴리스 전)` 을 담게 되는데, 태그는 되돌릴 수 없으므로 그 태그를 설치한 소비자는 자신이 받은 변경이 어느 태그에 들어있는지 표에서 알 방법이 없다 — 자리표시자 하나가 소비자에게 아무것도 말해주지 못한 채 영구히 남는다.

사람 눈이 필요한 것을 사용자에게 보고하는 것과 같은 시점(태그를 자르기 **전**)에 처리한다.

## 자르기 전에 — `changelog.html` 에 그 태그의 절을 더한다

릴리스 표는 태그와 한 줄 요약만 갖고, **무엇이 왜 바뀌었는지와 이주 코드는 `changelog.html`** 에 있다. 표의 태그가 그 절로 링크하므로 절이 없으면 소비자가 링크를 눌러 아무것도 없는 곳에 도착한다.

절은 `<h2 id="v0-5-1">v0.5.1</h2>` 꼴이다 — 점은 id 에 쓸 수 없어 하이픈으로 적는다. 새 버전이 맨 위에 온다.

**`npm run check` 가 이것을 강제한다.** `scripts/check-controls.mjs` 가 릴리스 표의 태그와 `changelog.html` 의 절을 양방향으로 대조하므로, 표의 `(릴리스 전)` 행에 태그를 채우고 절을 만들지 않으면 `check` 가 실패하고 릴리스 스크립트가 빌드 전에 멈춘다. 반대로 절만 만들고 행을 안 채워도 실패한다.

`changelog.html` 을 고쳤으면 구조 검사 넷도 함께 돈다 — `.claude/rules/verification.md` 의 명령이 문서 페이지 셋(`index.html`·`guide.html`·`changelog.html`)을 루프로 돈다. **기대값이 파일마다 다르다** — 첫 검사는 `guide`·`changelog` 가 1, 목차인 `index` 는 0 이다.

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
git show v0.1.4:dist/react/elements.d.ts | grep -cE 'onNs[A-Za-z]+:'   # 11 이어야 한다
```

**줄이 정확히 열한 개여야 하고**, 전부 `EventName<CustomEvent<...>>` 여야 한다. **세는 단위는 래퍼가 아니라 이벤트 매핑 줄이다** — 래퍼는 아홉인데 줄이 열하나인 이유가 둘이다. `ns-nav-group` 과 `ns-table` 이 각각 이벤트를 둘씩 내고, `onNsNavigate` 는 세 래퍼(`ns-sidebar`·`ns-nav-group`·`ns-nav-item`)가 공유하는데 이 grep 은 중복을 줄이지 않는다. 숫자의 출처는 `src/react/elements.ts` 에서 `events` 가 비어 있지 않은 `createComponent` 호출이 내는 이벤트 전부이고, 래퍼나 이벤트를 더하면 이 숫자와 `.claude/rules/verification.md` 의 숫자를 **함께** 고친다. **`EventName` 브랜딩은 `dist/react/index.d.ts` 가 아니라 `elements.d.ts` 에 있다** — `index.d.ts` 를 대상으로 grep 하면 아무 줄도 안 나오고 그 상태로 항상 "통과"하므로 검사가 아니다.

나쁜 결과는 둘이다. ① 어떤 줄이 `onNsToggle: string;` 처럼 `EventName<...>` 없이 맨 `string` 으로 끝난다 — 그 이벤트의 캐스트가 소스에서 빠졌거나 약해졌다는 뜻이다. ② **줄 수가 열하나가 아니다.** 적으면 이벤트 매핑이 사라진 것이고(래퍼가 통째로 빠진 것과 래퍼는 남은 채 이벤트 하나만 빠진 것이 여기서 같은 모양으로 드러난다), 많으면 소스에 없는 매핑이 태그에 들어간 것이다.

**하한이 아니라 등식으로 본다.** "열 개보다 적게" 같은 하한은 이벤트 하나가 조용히 사라진 상태를 통과시킨다 — 그리고 이것이 태그 앞의 마지막 검사이고 태그는 되돌릴 수 없다. 숫자가 어긋나면 먼저 `src/react/elements.ts` 를 다시 세어 **어느 쪽이 옳은지** 정하고, 이 문단과 `verification.md` 를 고친 뒤에 태그를 자른다.

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
| 릴리스 직후 `guide.html` 이 빈 화면 | 정상이다. 브랜치 복귀 시 git 이 `dist/` 를 지운다. `npm run demo` 로 재빌드 |
| 릴리스가 중간에 실패했다 | `git branch --show-current` 로 `main` 인지 먼저 확인. 스크립트가 정리 명령을 출력한다 |
| `origin` 이 없다 | 스크립트가 push 를 건너뛰고 알린다. 오류가 아니다 |

## push

**`git push` 는 사용자가 명시적으로 요청할 때만 한다.** 태그 생성까지가 기본이다. 버전 커밋도 브랜치에 남아 있을 뿐 푸시되지 않는다.
