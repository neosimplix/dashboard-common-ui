# 릴리스 검증 명령 수정 보고

## 결함 확인

기존 명령:

```sh
git show v0.1.4:dist/react/index.d.ts | grep onNs
```

`v0.3.0` 태그로 재현:

```
$ git show v0.3.0:dist/react/index.d.ts | grep onNs
(출력 없음)

$ git show v0.3.0:dist/react/elements.d.ts | grep onNs
    onNsToggle: EventName<CustomEvent<NsToggleDetail>>;
    onNsNavigate: EventName<CustomEvent<NsNavigateDetail>>;
    onNsNavigate: EventName<CustomEvent<NsNavigateDetail>>;
    onNsNavigate: EventName<CustomEvent<NsNavigateDetail>>;
    onNsDialogClose: EventName<CustomEvent<NsDialogCloseDetail>>;
    onNsSort: EventName<CustomEvent<NsSortDetail>>;
    onNsSelectChange: EventName<CustomEvent<NsSelectChangeDetail>>;
    onNsPageChange: EventName<CustomEvent<NsPageChangeDetail>>;
    onNsTabChange: EventName<CustomEvent<NsTabChangeDetail>>;
    onNsMultiSelectChange: EventName<CustomEvent<NsMultiSelectChangeDetail>>;
```

`EventName` 브랜딩은 `elements.d.ts` 에 있고 `index.d.ts` 에는 `onNs` 문자열이 전혀 없다. 옛 명령은 `index.d.ts` 를 대상으로 해서 항상 빈 출력이었고, 문서가 "`EventName<...>` 가 보여야 한다" 고 기대하는 것 자체가 그 파일에서는 성립할 수 없었다 — 어떤 상태에서도 실패할 수 없는 검사였다.

## 수정

`.claude/skills/releasing/SKILL.md` 의 "태그 안의 산출물이 최신 소스로 빌드됐는가" 절을 아래로 교체했다.

```sh
git show v0.1.4:dist/react/elements.d.ts | grep -E 'onNs[A-Za-z]+:'
```

- 대상 파일을 `index.d.ts` → `elements.d.ts` 로 바꿈 (브랜딩이 실제로 있는 곳).
- 단순 `grep onNs` (양성만 찾는 검사) 대신 `onNs[A-Za-z]+:` 로 **모든 이벤트 프로퍼티 줄을 나열**하도록 바꿔서, 아홉 래퍼 각각이 브랜딩됐는지 한눈에 대조할 수 있게 했다. 어느 하나만 깨져도 그 줄만 `string` 으로 도드라진다.
- 문서에 "나쁜 결과" 두 가지를 명시: ① 어떤 줄이 `onNsX: string;` 로 끝남(캐스트 누락/약화), ② 열 줄보다 적게 나옴(래퍼 자체가 사라짐 — `onNsNavigate` 는 사이드바/그룹/아이템 세 곳이 공유하므로 아홉 래퍼가 열 줄이 된다).

## 실패 재현 (증거)

`src/react/elements.ts` 에서 `NsHeader` 의 캐스트를 약화:

```diff
   events: {
-    // EventName<> 브랜딩이 없으면 핸들러가 (e: Event) => void 로 타입된다.
-    onNsToggle: "ns-toggle" as EventName<CustomEvent<NsToggleDetail>>,
+    onNsToggle: "ns-toggle",
   },
```

`npx tsc -p tsconfig.build.json` 로 `.d.ts` 재생성(`dist/` 는 `.gitignore` 대상이라 git 상태에 영향 없음) 후 새 명령을 `dist/` 에 대해 실행:

```
$ grep -E 'onNs[A-Za-z]+:' dist/react/elements.d.ts
    onNsToggle: string;
    onNsNavigate: EventName<CustomEvent<NsNavigateDetail>>;
    onNsNavigate: EventName<CustomEvent<NsNavigateDetail>>;
    onNsNavigate: EventName<CustomEvent<NsNavigateDetail>>;
    onNsDialogClose: EventName<CustomEvent<NsDialogCloseDetail>>;
    onNsSort: EventName<CustomEvent<NsSortDetail>>;
    onNsSelectChange: EventName<CustomEvent<NsSelectChangeDetail>>;
    onNsPageChange: EventName<CustomEvent<NsPageChangeDetail>>;
    onNsTabChange: EventName<CustomEvent<NsTabChangeDetail>>;
    onNsMultiSelectChange: EventName<CustomEvent<NsMultiSelectChangeDetail>>;
```

`onNsToggle: string;` 가 정확히 그 이유(캐스트 제거)로 드러났다 — 다른 아홉 줄은 그대로 `EventName<...>` 라서 무관한 오류가 아님을 확인.

캐스트를 원복하고 재빌드한 뒤 다시 확인:

```
$ git diff --stat src/react/elements.ts
(출력 없음 — 원복 확인)

$ grep -E 'onNs[A-Za-z]+:' dist/react/elements.d.ts
    onNsToggle: EventName<CustomEvent<NsToggleDetail>>;
    ... (나머지 아홉 줄 모두 EventName<...>)

$ git status --porcelain
(출력 없음)
```

## 태그 기반 형태와의 차이

`dist/` 는 `.gitignore` 대상이라 태그를 다시 자를 수 없는 상태에서는 `git show`가 아니라 로컬 `dist/` 파일을 직접 grep 했다. 명령이 읽는 **경로는 동일**(`dist/react/elements.d.ts`) — `git show vX.Y.Z:path` 는 그 경로를 커밋 트리에서 읽고, 로컬 검증은 같은 경로를 워킹 디렉터리에서 읽을 뿐이다. 태그가 있을 때와 없을 때 명령의 판정 로직에 차이가 없으므로 스킬 문서에 별도로 적을 차이는 없다고 판단했다.

## 이웃 명령 확인

- README 버전 grep: `git show v0.3.0:README.md | grep 'common-ui.git#'` → `"@neosimplix/common-ui": "git+https://github.com/neosimplix/dashboard-common-ui.git#v0.3.0"`. 정확함, 수정 불필요.
- 콜드 설치 export 목록: `v0.3.0` 태그로 실제 `npm i git+file://...#v0.3.0` 후 `Object.keys(m).sort()` 실행 → `NsDialog, NsHeader, NsIcon, NsMultiSelect, NsNavGroup, NsNavItem, NsPageHeading, NsPagination, NsSidebar, NsSkeleton, NsTable, NsTabs, NsToast, nsAlert, nsConfirm, nsToast, registerIcons, svg, tabIdFor`. 스킬 문서의 기대값과 정확히 일치. 수정 불필요.

## 최종 상태

```
$ git log --oneline -3
<커밋 후 채움>

$ git status --porcelain
(비어 있어야 함)
```
