import type { HTMLAttributes, ReactNode } from "react";

import { cx } from "../cx.js";

export type BadgeTone = "neutral" | "ok" | "warn" | "risk" | "accent" | "strong";

export type BadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  children: ReactNode;
  /** 의미축. 기본 `"neutral"`. 색만으로 뜻을 전하지 않도록 라벨 글자에 뜻을 담는다. */
  tone?: BadgeTone;
};

export function Badge({ children, tone = "neutral", className, ...rest }: BadgeProps) {
  return (
    <span {...rest} className={cx("ns-badge", tone !== "neutral" && `ns-badge--${tone}`, className)}>
      {children}
    </span>
  );
}
