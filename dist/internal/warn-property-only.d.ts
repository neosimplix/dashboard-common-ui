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
export declare function warnPropertyOnlyAttributes(el: Element, advice: Record<string, string>): void;
