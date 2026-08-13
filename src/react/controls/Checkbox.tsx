import type { InputHTMLAttributes } from "react";

import { cx } from "../cx.js";

export type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  /**
   * 라벨 옆에 흐리게 붙는 보조 설명. 두 가지로 쓰인다 — 체크돼 있지만 바꿀 수
   * 없는 이유(비활성 체크박스), 또는 편집 가능한 항목이 무엇을 하는지 풀어 쓴 설명.
   */
  hint?: string;
};

export function Checkbox({ label, hint, className, ...rest }: CheckboxProps) {
  return (
    <label className={cx("ns-checkbox", className)}>
      {/* type 을 rest 뒤에 두어 호출부가 덮어쓸 수 없게 한다. */}
      <input {...rest} type="checkbox" />
      <span>{label}</span>
      {hint && <span className="ns-checkbox__hint">{hint}</span>}
    </label>
  );
}
