import type { ReactNode } from "react";

import { cx } from "../cx.js";

export type StepItem = { title: ReactNode; description?: ReactNode };

export type StepsProps = {
  items: StepItem[];
  className?: string;
};

/** 원형 번호가 붙는 순서 목록(`<ol>`). 번호는 CSS 카운터라 항목 순서가 곧 번호다. */
export function Steps({ items, className }: StepsProps) {
  return (
    <ol className={cx("ns-steps", className)}>
      {items.map((s, i) => (
        <li key={i}>
          <strong>{s.title}</strong>
          {s.description !== undefined && <p>{s.description}</p>}
        </li>
      ))}
    </ol>
  );
}
