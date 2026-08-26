import { svg, type SVGTemplateResult } from "lit";

export interface IconDef {
  /** 아이콘마다 다르다. ns-icon 이 <svg> 에 그대로 넘긴다. */
  viewBox: string;
  /** <svg> 의 자식들. width/height 를 적지 않는다 — 크기는 tokens.css 가 정한다(ns-icon.styles.ts 참고: 문서 트리 선택자가 :host 를 이긴다). */
  content: SVGTemplateResult;
}

/*
  아이콘 스프라이트.

  전부 이 모듈에 있으므로 트리 셰이킹되지 않는다. 넷이면 무시할 수준이고,
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

  /*
    ns-nav-group 의 접힘 caret. 아래를 가리키는 것이 펼침이고, 접히면
    그 컴포넌트가 -90deg 로 돌린다. 회전은 여기서 하지 않는다 — 이 스프라이트는
    방향을 모르는 채로 하나만 갖고, 쓰는 쪽이 돌린다.
  */
  "chevron-down": {
    viewBox: "0 0 20 20",
    content: svg`
      <path
        d="M5 7.5l5 5 5-5"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
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

/**
 * 스프라이트에 아이콘을 더한다. 같은 키를 다시 주면 덮는다.
 *
 * 이 넷은 라이브러리 자신이 쓰는 것뿐이라(`ns-header` 의 토글, `ns-dialog` 의
 * 닫기, 로그인 예시) 소비자 도메인의 아이콘은 여기 들어올 수 없다. 그래서
 * 스프라이트를 열어 둔다 — 이 함수가 없으면 `<ns-icon>` 은 소비자에게
 * 쓸모가 없고 `slot="leading"` 에 `<svg>` 를 직접 넣는 길밖에 남지 않는다.
 *
 * **클라이언트 번들에 들어가는 모듈의 최상위에서 한 번 부른다.** 조건이 둘이다.
 * ① 첫 렌더보다 앞서야 한다 — 이미 그려진 `<ns-icon>` 을 다시 그리게 하지 않으므로
 * 늦으면 그 아이콘이 빈 채로 남는다. ② 그 모듈이 브라우저에 도달해야 한다 —
 * Next.js App Router 의 루트 레이아웃은 서버 컴포넌트라 거기서 import 해도
 * 클라이언트 번들에 들어가지 않고, `"use client"` 를 붙여도 같다. 셸처럼 이미
 * 클라이언트 컴포넌트인 파일이 import 하게 한다.
 *
 * `content` 는 lit 의 `svg` 태그드 템플릿이다. lit 은 이 패키지의 의존성이라
 * 소비자 `package.json` 에 없을 수 있으므로 진입점이 `svg` 를 함께 내보낸다.
 *
 * ```ts
 * import { registerIcons, svg } from "@neosimplix/common-ui";
 *
 * registerIcons({
 *   chart: {
 *     viewBox: "0 0 20 20",
 *     content: svg`<path d="M3 17V9m5 8V4m5 13v-6m4 6V7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />`,
 *   },
 * });
 * ```
 */
export function registerIcons(defs: Record<string, IconDef>): void {
  Object.assign(icons, defs);
}
