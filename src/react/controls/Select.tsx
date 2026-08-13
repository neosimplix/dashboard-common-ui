import type { SelectHTMLAttributes } from "react";

import { cx } from "../cx.js";

export type SelectOption = { value: string; label: string };

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  options: SelectOption[];
  /** 비어 있는 첫 항목의 문구. 값은 항상 "" 이다. */
  placeholder?: string;
  invalid?: boolean;
};

/**
 * children 을 받지 않는다. option 을 호출부가 직접 쓰게 두면 빈 값 항목의
 * value 규약(항상 "")이 지켜지지 않고, .ns-select:has() 규칙이 조용히 어긋난다.
 */
export function Select({
  options,
  placeholder,
  invalid = false,
  className,
  ...rest
}: SelectProps) {
  return (
    <select
      className={cx("ns-select", className)}
      aria-invalid={invalid || undefined}
      {...rest}
    >
      {placeholder !== undefined && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
