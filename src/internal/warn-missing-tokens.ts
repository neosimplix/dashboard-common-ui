let warned = false;

/**
 * tokens.css 가 로드되지 않았으면 콘솔에 한 번만 경고한다.
 *
 * 컴포넌트 스타일은 var() 폴백을 쓰지 않는다. 값이 tokens.css 와 컴포넌트
 * 양쪽에 존재하면 어긋나기 때문이다. 그래서 토큰이 없으면 레이아웃이
 * 무너지는데, 조용히 무너지는 대신 원인과 해결책을 알려준다.
 */
export function warnIfTokensMissing(): void {
  if (warned) return;
  if (typeof document === "undefined" || typeof getComputedStyle === "undefined") return;
  warned = true;

  const probe = getComputedStyle(document.documentElement).getPropertyValue("--color-line");
  if (probe.trim()) return;

  console.warn(
    "[@neosimplix/common-ui] tokens.css 가 로드되지 않아 레이아웃이 깨집니다.\n" +
      '  Next/React:  import "@neosimplix/common-ui/tokens.css";\n' +
      '  HTML:        <link rel="stylesheet" href="…/dist/tokens.css">',
  );
}
