import type { ReactNode } from "react";
export type StepItem = {
    title: ReactNode;
    description?: ReactNode;
};
export type StepsProps = {
    items: StepItem[];
    className?: string;
};
/** 원형 번호가 붙는 순서 목록(`<ol>`). 번호는 CSS 카운터라 항목 순서가 곧 번호다. */
export declare function Steps({ items, className }: StepsProps): import("react").JSX.Element;
