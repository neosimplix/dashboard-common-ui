# 검증 규칙

## 테스트 러너를 두지 않는다

이 저장소에는 테스트 프레임워크가 없다. **설계 결정이지 누락이 아니다.** 이전 시도(`shared-ui`)가 검증 하네스 복잡도 때문에 폐기됐다. vitest·jest·playwright·web-test-runner 등을 추가하지 않고, 테스트 파일도 만들지 않는다.

회귀 확인 수단은 둘이다.

| 수단 | 무엇을 잡나 |
|---|---|
| `npm run check` | ① 라이브러리 타입 ② 소비자 관점 타입 ③ 이벤트 매핑 일관성 ④ 클래스 ↔ 문서 대조 |
| `index.html` 육안 확인 | 렌더·상호작용. 문서 셸이 이 라이브러리로 만들어져 있어 깨지면 문서가 안 열린다 |

## 검사는 실패시켜 봐야 검사다

검사를 새로 만들거나 고쳤으면 **일부러 깨뜨려서 실제로 실패하는지 확인한다.** 한 번도 실패해본 적 없는 검사가 통과하는 것은 아무 증거도 아니다.

확인할 때는 **의도한 이유로 실패했는지**까지 본다. 다른 이유(예: 사용하지 않는 import)로 먼저 실패하면 목표한 속성은 여전히 검증되지 않은 것이다.

## `npm run check` 가 못 보는 영역

React 래퍼의 `events` 값은 라이브러리 안에서는 그냥 문자열이라, `EventName<>` 브랜딩이 빠져도 라이브러리 타입 검사는 통과한다. 소비자 쪽에서만 드러난다.

그래서 `docs/consumer-example.tsx` 와 `tsconfig.consumer.json` 이 `check` 에 포함돼 있다. **이벤트를 가진 일곱 래퍼 전부에 핸들러를 붙여 `e.detail` 을 읽어야 한다.** 일부만 붙이면 나머지의 회귀가 조용히 통과한다.

일곱 중 여섯(`ns-toggle`, `ns-navigate` × 3, `ns-table` 의 `ns-sort`·`ns-select-change`, `ns-pagination` 의 `ns-page-change`)은 `consumer-example.tsx` 가 직접 검사한다. 일곱 번째 `ns-dialog-close` 는 `NsDialogBase` 가 비공개라 그 파일이 닿을 수 없다 — 대신 `src/react/tags/Dialog.tsx` 의 shim 이 `onNsDialogClose={(e) => onClose(e.detail.reason)}` 로 `e.detail.reason` 을 실제로 읽어 같은 방어를 한다. 메커니즘은 `docs/gotchas.md` 의 "인자 0개짜리 핸들러는 `EventName<>` 캐스트 검사를 무력화한다" 에 있다.

## 브라우저 확인은 사람이 한다

구현 서브에이전트는 화면을 볼 수 없다. **하지 않은 확인을 했다고 보고하지 않는다.** 정적으로 확인 가능한 것과 사람 눈이 필요한 것을 보고서에 구분해 적는다.

`index.html` 을 고친 뒤 브라우저 없이 할 수 있는 검사:

```sh
grep -c '<script>' index.html                      # 헬퍼 하나 = 1
grep -n '</script>' index.html \
  | grep -v -E ':\s*</script>\s*$' | grep -v '<script src='   # 출력 없어야 정상
grep -n 'document.addEventListener' index.html     # 출력 없어야 정상
```

세 번째가 중요하다. 이벤트가 `composed` 라 데모에서 발생한 것도 `document` 까지 올라온다. 리스너는 자기가 소유한 엘리먼트에만 붙인다.
