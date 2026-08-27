# 검증 규칙

## 테스트 러너를 두지 않는다

이 저장소에는 테스트 프레임워크가 없다. **설계 결정이지 누락이 아니다.** 이전 시도(`shared-ui`)가 검증 하네스 복잡도 때문에 폐기됐다. vitest·jest·playwright·web-test-runner 등을 추가하지 않고, 테스트 파일도 만들지 않는다.

회귀 확인 수단은 둘이다.

| 수단 | 무엇을 잡나 |
|---|---|
| `npm run check` | ① 라이브러리 타입 ② 소비자 관점 타입 ③ 이벤트 매핑 일관성 ④ 클래스 ↔ 문서 대조 ⑤ 토큰 참조·`data-ns-*` 훅·`:host` 박스·`index.html` 리터럴 색 |
| `index.html` 육안 확인 | 렌더·상호작용. 문서 셸이 이 라이브러리로 만들어져 있어 깨지면 문서가 안 열린다 |

**육안 확인은 볼 것의 목록이 있어야 작동한다.** 다음 릴리스 전에 사람이 봐야 하는 것은 `docs/pending-human-checks.md` 에 모으고 릴리스가 나가면 비운다 — 거기에는 이 저장소에서 **재현할 수 없어 소비자 프로젝트가 필요한** 항목도 있고, 그것들에 대해서는 `npm run check` 가 초록인 것이 아무 증거도 아니다.

## 검사는 실패시켜 봐야 검사다

검사를 새로 만들거나 고쳤으면 **일부러 깨뜨려서 실제로 실패하는지 확인한다.** 한 번도 실패해본 적 없는 검사가 통과하는 것은 아무 증거도 아니다.

확인할 때는 **의도한 이유로 실패했는지**까지 본다. 다른 이유(예: 사용하지 않는 import)로 먼저 실패하면 목표한 속성은 여전히 검증되지 않은 것이다.

## `npm run check` 가 못 보는 영역

React 래퍼의 `events` 값은 라이브러리 안에서는 그냥 문자열이라, `EventName<>` 브랜딩이 빠져도 라이브러리 타입 검사는 통과한다. 소비자 쪽에서만 드러난다.

그래서 `docs/consumer-example.tsx` 와 `tsconfig.consumer.json` 이 `check` 에 포함돼 있다. **이벤트를 가진 래퍼는 아홉이고 그 아홉이 내는 이벤트는 열하나다. 열하나 전부에 핸들러를 붙여 `e.detail` 을 읽어야 한다.** 바는 래퍼 단위가 아니라 **이벤트 단위**다 — 이벤트를 둘 이상 내는 래퍼(`ns-nav-group`·`ns-table` 이 둘씩)에서 하나만 읽고 나머지를 빼먹으면 그 이벤트의 회귀는 "아홉 래퍼 전부" 를 만족하고도 조용히 통과한다.

**두 숫자의 출처가 다르다.** 래퍼 수는 `src/react/elements.ts` 에서 `events` 가 비어 있지 않은 `createComponent` 호출이고, 이벤트 수는 그 파일의 `EventName<>` 캐스트 수다(`grep -c 'as EventName<' src/react/elements.ts`). **두 숫자가 따로 움직인다** — 0.5.0 개발 중에 `ns-sidebar` 가 `ns-group-select`·`ns-toggle` 을 얻었다가 다시 잃었는데 그 래퍼는 내내 `ns-navigate` 를 갖고 있었으므로 아홉은 아홉으로 남고 이벤트 수만 열셋까지 갔다 열하나로 돌아왔다. 그래서 래퍼 수만 세는 문장은 이런 변경을 놓친다. 어느 쪽이 변해도 이 문단의 숫자를 함께 고친다.

아홉 래퍼 중 일곱(`ns-header` 의 `ns-toggle`, `ns-navigate` × 2(`ns-nav-group`·`ns-nav-item`), `ns-nav-group` 의 `ns-group-toggle`, `ns-table` 의 `ns-sort`·`ns-select-change`, `ns-pagination` 의 `ns-page-change`, `ns-tabs` 의 `ns-tab-change`, `ns-multi-select` 의 `ns-multi-select-change`)은 `consumer-example.tsx` 가 직접 검사한다. 이벤트로 세면 아홉이다. 나머지 두 래퍼는 비공개라 그 파일이 닿을 수 없어 shim 이 같은 방어를 한다 — 이벤트 하나씩, 합쳐 둘이다.

- `src/react/tags/Dialog.tsx` — `onNsDialogClose={(e) => onClose(e.detail.reason)}`
- `src/react/tags/Sidebar.tsx` — `onNsNavigate={(e) => onNavigate?.(e.detail)}`

**`NsSidebarBase` 의 이벤트는 그 shim 한 파일에 걸려 있다.** `consumer-example.tsx` 가 `<Sidebar onNavigate={…} />` 로 쓰는 것은 shim 이 이미 벗겨 놓은 인자라, 그쪽만으로는 `EventName<>` 캐스트가 빠진 것을 잡지 못한다 — 잡는 것은 shim 안의 `e.detail` 한 줄이다. 그것이 인자 0개 핸들러로 바뀌면 그 이벤트의 브랜딩 회귀가 조용히 통과한다. 메커니즘은 `docs/gotchas.md` 의 "인자 0개짜리 핸들러는 `EventName<>` 캐스트 검사를 무력화한다" 에 있다.

## 브라우저 확인은 사람이 한다

구현 서브에이전트는 화면을 볼 수 없다. **하지 않은 확인을 했다고 보고하지 않는다.** 정적으로 확인 가능한 것과 사람 눈이 필요한 것을 보고서에 구분해 적는다.

**사람 눈이 필요한 것은 보고서에서 끝내지 말고 `docs/pending-human-checks.md` 에 옮긴다.** 보고서는 `.superpowers/` 아래의 gitignore 대상이라 워크스페이스와 함께 사라진다 — 목록이 거기에만 있으면 릴리스 시점에 남는 것이 없다.

`index.html` 을 고친 뒤 브라우저 없이 할 수 있는 검사:

```sh
grep -c '<script>' index.html                      # 헬퍼 하나 = 1
grep -n '</script>' index.html \
  | grep -v -E ':\s*</script>\s*$' | grep -v '<script src='   # 출력 없어야 정상
grep -n 'document.addEventListener' index.html     # 출력 없어야 정상
grep -oE '(^|[[:space:]])id="[^"]*"' index.html \
  | sed -E 's/.*id="([^"]*)"/\1/' | sort | uniq -d            # 출력 없어야 정상
```

세 번째가 중요하다. 이벤트가 `composed` 라 데모에서 발생한 것도 `document` 까지 올라온다. 리스너는 자기가 소유한 엘리먼트에만 붙인다.

네 번째는 **id 중복**이다. `getElementById` 는 문서 순서상 첫 번째를 주므로, 다른 절이 이미 쓴 이름을 쓰면 엉뚱한 요소를 받고 `querySelector(...).addEventListener` 에서 예외가 난다. 이 파일의 배선은 **`<script>` 하나**라 그 지점부터 아래 전부가 실행되지 않는다. **화면은 멀쩡해 보이므로 육안 확인 경로가 이 결함의 피해자다** — 스스로를 검증할 수 없다. 새 절의 id 에는 절 이름을 접두사로 붙인다(`table-select-demo`).
