import type { ReactNode } from "react";

import { cx } from "../cx.js";

export type CardProps = {
  className?: string;
  children: ReactNode;
};

export function Card({ className, children }: CardProps) {
  return <div className={cx("ns-card", className)}>{children}</div>;
}
