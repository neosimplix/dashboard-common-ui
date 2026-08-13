import type { SelectHTMLAttributes } from "react";

import { cx } from "../cx.js";

export type SelectOption = { value: string; label: string };

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  options: SelectOption[];
  /**
   * 비어 있는 첫 항목의 문구. 값은 항상 "" 이다.
   *
   * HTML 의 selectedness 알고리즘은 `disabled` 인 option 을 건너뛴다 — 이
   * option 에 `selected` 를 못 박아도(React 는 `<option>` 에 `selected` 를
   * 못 쓴다) `value`/`defaultValue` 를 안 주면 첫 실제 항목이 조용히
   * 선택된다. 그래서 둘 다 없을 때만 `defaultValue` 를 `""` 로 채운다 —
   * `value`(제어) 또는 명시적 `defaultValue` 를 준 경우는 그대로 존중한다.
   */
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
  value,
  defaultValue,
  ...rest
}: SelectProps) {
  /*
    value 가 있으면(제어) defaultValue 는 항상 undefined 다 — 둘 다 넘기면
    React 가 "받았지만 무시한다" 경고를 낸다. value 가 없을 때만 defaultValue
    후보가 되고, 그 둘 다 없는데 placeholder 가 있으면 "" 를 시드한다 —
    비제어에서 placeholder 가 실제로 선택되게 하기 위해서다.
  */
  const resolvedDefaultValue =
    value !== undefined
      ? undefined
      : defaultValue !== undefined
        ? defaultValue
        : placeholder !== undefined
          ? ""
          : undefined;

  return (
    <select
      className={cx("ns-select", className)}
      aria-invalid={invalid || undefined}
      value={value}
      defaultValue={resolvedDefaultValue}
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
