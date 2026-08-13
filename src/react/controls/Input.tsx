import type { InputHTMLAttributes } from "react";

import { cx } from "../cx.js";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export function Input({ invalid = false, className, ...rest }: InputProps) {
  return (
    <input
      className={cx("ns-input", className)}
      // false 를 넘기면 aria-invalid="false" 가 남는다. 없는 것과 다른 뜻이다.
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
}
