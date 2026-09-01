import type { TextareaHTMLAttributes } from "react";

import { cx } from "../cx.js";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

/**
 * `Input` 의 여러 줄 판이다. props·클래스 구성·invalid 처리를 일부러 똑같이
 * 맞춘다 — 두 컨트롤이 다르게 생기면 `Field` 안에 나란히 놓았을 때 어긋나 보인다.
 *
 * `rows` 기본값 3 은 호출부가 덮을 수 있다. 높이를 className 으로 잡게 두면
 * cascade layer 가 달라 조용히 안 먹는 경우가 생긴다.
 */
export function Textarea({ invalid = false, className, rows = 3, ...rest }: TextareaProps) {
  return (
    <textarea
      className={cx("ns-textarea", className)}
      rows={rows}
      {...rest}
      // 순서의 이유는 Input.tsx 에 있다. 세 컨트롤이 같은 처치를 받는다.
      aria-invalid={invalid || rest["aria-invalid"] || undefined}
    />
  );
}
