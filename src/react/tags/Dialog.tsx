import type { ReactNode } from "react";

import { NsDialogBase } from "../elements.js";
import type { NsDialogCloseReason } from "../../types.js";

export type DialogProps = {
  open: boolean;
  /** 커스텀 엘리먼트의 속성 이름은 `heading` 이다. React 프롭은 `title` 을 유지한다. */
  title: string;
  onClose: (reason: NsDialogCloseReason) => void;
  children: ReactNode;
  /** 하단 가운데 정렬 영역. 지정하면 `slot="footer"` 로 들어간다. */
  footer?: ReactNode;
  noBackdropClose?: boolean;
  className?: string;
};

/**
 * `open` 을 항상 넘기므로 언제나 제어 모드다. React 에서는 state 가 진실의
 * 원천이어야 하고, 비제어 모드는 순수 HTML 소비자를 위한 것이다.
 *
 * Esc·backdrop·닫기 버튼 어느 경로든 `onClose` 로 모이고, 어느 경로였는지는
 * 인자로 받는다. 사유가 필요 없으면 `onClose={() => setOpen(false)}` 처럼
 * 인자를 무시하면 된다 — 인자 수가 적은 함수는 그대로 대입된다.
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
      // e.detail 을 여기서 실제로 읽는다. 이것이 elements.ts 의 EventName<> 캐스트를
      // 검증하는 유일한 지점이다 — 캐스트가 빠지면 e 가 Event 로 타입돼 이 줄이 깨진다.
      onNsDialogClose={(e) => onClose(e.detail.reason)}
    >
      {children}
      {/*
        래퍼는 피할 수 없다 — footer 는 임의의 ReactNode 라 각 노드에 slot 속성을
        붙일 수 없고, 이름 있는 슬롯은 slot 을 가진 요소만 배정받는다.

        display: contents 로 그 래퍼가 배치에서 비켜선다. 없으면 ns-dialog 의
        .footer 가 보는 flex 항목이 이 <div> 하나뿐이라 가운데 정렬은 래퍼에
        걸리고 gap 은 버튼 사이에 닿지 못한다.

        인라인 스타일인 것은 confirm.ts 가 <p> 의 여백을 지우는 것과 같은 이유다 —
        이 <div> 는 shim 만 만들고 소비자가 선택자를 걸 수 없으므로 덮을 수 있어야
        할 값이 아니다. 래퍼 자신에 여백이나 배경을 주고 싶으면 footer 로 넘기는
        노드 쪽에 준다.
      */}
      {footer != null && (
        <div slot="footer" style={{ display: "contents" }}>
          {footer}
        </div>
      )}
    </NsDialogBase>
  );
}
