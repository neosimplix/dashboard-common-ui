import type { HTMLAttributes, ReactNode } from "react";
export type BadgeTone = "neutral" | "ok" | "warn" | "risk" | "accent" | "strong";
export type BadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
    children: ReactNode;
    /** 의미축. 기본 `"neutral"`. 색만으로 뜻을 전하지 않도록 라벨 글자에 뜻을 담는다. */
    tone?: BadgeTone;
};
export declare function Badge({ children, tone, className, ...rest }: BadgeProps): import("react").JSX.Element;
