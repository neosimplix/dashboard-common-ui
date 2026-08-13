import type { ReactNode } from "react";

import { NsDialogBase } from "../elements.js";

export type DialogProps = {
  open: boolean;
  /** 커스텀 엘리먼트의 속성 이름은 `heading` 이다. React 프롭은 `title` 을 유지한다. */
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** 하단 우측 정렬 영역. 지정하면 `slot="footer"` 로 들어간다. */
  footer?: ReactNode;
  noBackdropClose?: boolean;
  className?: string;
};

/**
 * `open` 을 항상 넘기므로 언제나 제어 모드다. React 에서는 state 가 진실의
 * 원천이어야 하고, 비제어 모드는 순수 HTML 소비자를 위한 것이다.
 *
 * Esc·backdrop·닫기 버튼 어느 경로든 `onClose` 로 모인다. 사유를 구분해야 하면
 * 래퍼를 쓰지 않고 `onNsDialogClose` 로 `e.detail.reason` 을 읽는다.
 */
export function Dialog({
  open,
  title,
  onClose,
  children,
  footer,
  noBackdropClose = false,
  className,
}: DialogProps) {
  return (
    <NsDialogBase
      open={open}
      heading={title}
      noBackdropClose={noBackdropClose}
      className={className}
      onNsDialogClose={() => onClose()}
    >
      {children}
      {footer !== undefined && <div slot="footer">{footer}</div>}
    </NsDialogBase>
  );
}
