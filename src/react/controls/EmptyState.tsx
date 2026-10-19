import type { ReactNode } from "react";

import { cx } from "../cx.js";

export type EmptyStateProps = {
  title: ReactNode;
  description?: ReactNode;
  /** 비어 있을 때 할 수 있는 행동(버튼·링크). */
  actions?: ReactNode;
  className?: string;
};

/**
 * 목록·칸이 비었을 때. **불러오기 실패에는 쓰지 않는다** — 비어 있음과 실패를 같은
 * 모양으로 그리면 사용자는 기다려야 할지 모른다. 한 줄 알림이면 `Message` 를 쓴다.
 */
export function EmptyState({ title, description, actions, className }: EmptyStateProps) {
  return (
    <div className={cx("ns-empty-state", className)}>
      <p className="ns-empty-state__title">{title}</p>
      {description !== undefined && <p className="ns-empty-state__description">{description}</p>}
      {actions !== undefined && <div className="ns-empty-state__actions">{actions}</div>}
    </div>
  );
}
