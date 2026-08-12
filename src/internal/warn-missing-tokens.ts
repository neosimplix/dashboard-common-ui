let settled = false;

const MESSAGE =
  "[@neosimplix/common-ui] tokens.css 가 로드되지 않아 레이아웃이 깨집니다.\n" +
  '  Next/React:  import "@neosimplix/common-ui/tokens.css";\n' +
  '  HTML:        <link rel="stylesheet" href="…/dist/tokens.css">';

const tokensPresent = () =>
  getComputedStyle(document.documentElement).getPropertyValue("--color-line").trim() !== "";

/**
 * tokens.css 가 로드되지 않았으면 콘솔에 한 번만 경고한다.
 *
 * 컴포넌트 스타일은 var() 폴백을 쓰지 않는다. 값이 tokens.css 와 컴포넌트
 * 양쪽에 존재하면 어긋나기 때문이다. 그래서 토큰이 없으면 레이아웃이
 * 무너지는데, 조용히 무너지는 대신 원인과 해결책을 알려준다.
 *
 * 네 컴포넌트가 각자 connectedCallback 에서 호출한다. 사이드바 하나에
 * nav item 이 수십 개일 수 있으므로 정상 페이지에서는 반드시 한 번만
 * 실제 검사가 일어나야 한다.
 */
export function warnIfTokensMissing(): void {
  if (settled) return;
  if (typeof document === "undefined" || typeof getComputedStyle === "undefined") return;

  // 토큰이 보이면 그것으로 확정이다. 정상 경로는 여기서 끝나고
  // getComputedStyle 은 페이지당 한 번만 호출된다.
  if (tokensPresent()) {
    settled = true;
    return;
  }

  /*
    아직 안 보인다고 없는 것은 아니다. tokens.css 는 JS 와 별도로 로드되므로
    (Next 의 CSS 청크, 늦게 삽입된 <link>) 첫 컴포넌트가 연결되는 시점에
    아직 적용 전일 수 있다. 여기서 바로 경고하면 정상 페이지에 취소할 수 없는
    거짓 경고가 남는다. 문서 로드가 끝난 뒤 한 번 더 보고 판단한다.

    settled 는 지금 세운다. 예약을 한 번만 하기 위해서다 — 판정 자체는
    아래 confirm 이 내린다.
  */
  settled = true;

  const confirm = () => {
    if (tokensPresent()) return;
    console.warn(MESSAGE);
  };

  if (document.readyState === "complete") confirm();
  else window.addEventListener("load", confirm, { once: true });
}
