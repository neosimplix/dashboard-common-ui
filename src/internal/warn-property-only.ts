/*
  제어 프로퍼티는 `@property({ attribute: false })` 라 같은 이름의 속성이 관찰되지
  않는다. 그래서 `<ns-dialog open>` 은 제어 모드로 들어가는 것이 아니라 **통째로
  무시된다.** 열리지도 않고 경고도 없고 콘솔에도 아무것도 남지 않는다.

  이것은 설계가 의도한 결과다 — 제어와 비제어를 속성 짝으로 가르기로 했고, 마크업이
  쓸 것은 `default-open` 이다. 문제는 틀렸다는 신호가 어디에도 없다는 것이다. 소비자가
  이 함정을 실제로 밟았고, 그 사람은 프로퍼티 주석까지 읽은 뒤였다.

  이 이름의 속성이 호스트에 붙는 경로는 소비자가 쓴 것 하나뿐이다. 라이브러리는
  호스트에 속성을 쓰지 않고(불변 규칙), Lit 도 attribute: false 를 반영하지 않으며,
  React shim 은 프로퍼티로 넘긴다. **따라서 발견되면 언제나 실수다.**
*/

/* 요소마다 같은 속성으로 두 번 찍지 않는다. 대화상자는 재연결되는 경로가 있다. */
const warned = new WeakMap<Element, Set<string>>();

/**
 * 프로퍼티 전용 이름이 속성으로 쓰였으면 콘솔에 한 번 경고한다.
 *
 * `advice` 는 그 자리에서 대신 쓸 것이다. 케밥 표기를 주면 붙여 쓴 형태도 함께
 * 본다 — HTML 속성 이름은 대소문자를 구분하지 않으므로 TS 쪽 `sortKey` 를 그대로
 * 옮겨 적은 `sortkey` 가 흔한 오타 경로다.
 *
 * @param el     검사할 호스트
 * @param advice 속성 이름 → 대신 쓸 것
 */
export function warnPropertyOnlyAttributes(el: Element, advice: Record<string, string>): void {
  for (const [name, use] of Object.entries(advice)) {
    const found = [name, name.replaceAll("-", "")].find((n) => el.hasAttribute(n));
    if (found === undefined) continue;

    let seen = warned.get(el);
    if (seen === undefined) warned.set(el, (seen = new Set()));
    if (seen.has(found)) continue;
    seen.add(found);

    /*
      조사를 붙이지 않는다. `use` 에 무엇이 오든 "…를/을" 이 어색해지지 않도록
      콜론으로 끊는다.
    */
    console.warn(
      `[${el.localName}] ${found} 속성은 무시됩니다 — 이 이름은 프로퍼티 전용입니다.\n` +
        `  HTML 에서 쓸 것: ${use}\n` +
        `  JS 에서는 el.${toCamel(name)} 에 대입합니다.`,
    );
  }
}

const toCamel = (name: string) => name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
