import type { InputHTMLAttributes } from "react";

import { cx } from "../cx.js";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export function Input({ invalid = false, className, ...rest }: InputProps) {
  return (
    <input
      className={cx("ns-input", className)}
      {...rest}
      /*
        rest 를 먼저 펴고 aria-invalid 를 뒤에서 합친다. 지역 계산이 먼저 오면
        남이 넘긴 aria-invalid 가 그것을 조용히 덮어, 이 컴포넌트의 invalid
        프롭이 근거 없이 무력화된다. 이제 둘 중 하나라도 참이면 invalid 다.

        Field 안의 동작은 이 변경으로 바뀌지 않는다 — Field 는 error 일 때
        true 만 주입하므로 오류가 계속 이긴다. 그것이 의도된 동작이다:
        오류가 있는 필드의 컨트롤은 invalid 다.

        false 를 넘기면 aria-invalid="false" 가 남는다. 없는 것과 다른 뜻이므로
        undefined 로 떨어뜨린다.
      */
      aria-invalid={invalid || rest["aria-invalid"] || undefined}
    />
  );
}
