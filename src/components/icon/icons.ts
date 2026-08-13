import { svg, type SVGTemplateResult } from "lit";

export interface IconDef {
  /** 아이콘마다 다르다. ns-icon 이 <svg> 에 그대로 넘긴다. */
  viewBox: string;
  /** <svg> 의 자식들. width/height 를 적지 않는다 — 크기는 tokens.css 가 정한다(ns-icon.styles.ts 참고: 문서 트리 선택자가 :host 를 이긴다). */
  content: SVGTemplateResult;
}

/*
  아이콘 스프라이트.

  전부 이 모듈에 있으므로 트리 셰이킹되지 않는다. 셋이면 무시할 수준이고,
  늘어나면 서브패스 분리를 검토한다.

  stroke/fill 에 currentColor 를 쓴다. color 는 shadow 경계를 넘어 상속되므로
  바깥에서 색을 정할 수 있다. google 은 브랜드 규정상 색이 고정이라 예외다 —
  토큰을 쓰지 않는 유일한 아이콘이다.
*/
export const icons: Record<string, IconDef> = {
  menu: {
    viewBox: "0 0 20 20",
    content: svg`
      <path
        d="M3 5h14M3 10h14M3 15h14"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
      />
    `,
  },

  close: {
    viewBox: "0 0 20 20",
    content: svg`
      <path
        d="M5 5l10 10M15 5L5 15"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
      />
    `,
  },

  // 구글 브랜드 마크. 색이 규정으로 고정돼 있어 토큰을 쓰지 않는다.
  google: {
    viewBox: "0 0 18 18",
    content: svg`
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    `,
  },
};
