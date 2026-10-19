import type { ReactNode } from "react";
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
export declare function Dialog({ open, title, onClose, children, footer, noBackdropClose, className, }: DialogProps): import("react").JSX.Element;
