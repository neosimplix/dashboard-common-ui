import { type SVGTemplateResult } from "lit";
export interface IconDef {
    /** 아이콘마다 다르다. ns-icon 이 <svg> 에 그대로 넘긴다. */
    viewBox: string;
    /** <svg> 의 자식들. width/height 를 적지 않는다 — 크기는 tokens.css 가 정한다(ns-icon.styles.ts 참고: 문서 트리 선택자가 :host 를 이긴다). */
    content: SVGTemplateResult;
}
export declare const icons: Record<string, IconDef>;
