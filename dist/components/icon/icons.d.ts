import { type SVGTemplateResult } from "lit";
export interface IconDef {
    /** 아이콘마다 다르다. ns-icon 이 <svg> 에 그대로 넘긴다. */
    viewBox: string;
    /** <svg> 의 자식들. width/height 를 적지 않는다 — 크기는 tokens.css 가 정한다(ns-icon.styles.ts 참고: 문서 트리 선택자가 :host 를 이긴다). */
    content: SVGTemplateResult;
}
export declare const icons: Record<string, IconDef>;
/**
 * 스프라이트에 아이콘을 더한다. 같은 키를 다시 주면 덮는다.
 *
 * 이 넷은 라이브러리 자신이 쓰는 것뿐이라(`ns-header` 의 토글, `ns-dialog` 의
 * 닫기, 로그인 예시, `ns-nav-group` 의 접힘 caret) 소비자 도메인의 아이콘은
 * 여기 들어올 수 없다. 그래서
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
export declare function registerIcons(defs: Record<string, IconDef>): void;
