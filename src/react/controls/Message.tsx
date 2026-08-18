import type { ReactNode } from "react";

import { cx } from "../cx.js";

export type MessageProps = {
  children: ReactNode;
  /** 배치·여백만 더한다. */
  className?: string;
};

/**
 * 로딩 · 빈 상태 · 오류를 남는 공간 가운데에 한 줄로 알린다.
 *
 * **부모가 flex 컨테이너여야 한다.** 이 컴포넌트는 `flex: 1 1 0%` 로 남는 자리를
 * 차지하고 그 안에서 가운데 정렬한다.
 */
export function Message({ children, className }: MessageProps) {
  return (
    <div className={cx("ns-message", className)}>
      <p>{children}</p>
    </div>
  );
}
