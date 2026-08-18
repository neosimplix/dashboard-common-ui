import type { ReactNode } from "react";

import { cx } from "../cx.js";

type ChipBase = {
  children: ReactNode;
  className?: string;
};

/**
 * 세 갈래를 판별 유니온으로 가른다.
 *
 * 토글과 제거를 함께 쓰면 버튼 안에 버튼이 들어가 마크업이 무효가 된다.
 * 런타임 경고가 아니라 타입으로 막는다 — 경고는 개발 빌드를 봐야 보이고,
 * 이 저장소는 `process.env` 를 번들에 넣지 않는다.
 *
 * `onClick` 이 토글 갈래에만 있는 것도 의도다. 제거 갈래는 칩 몸통이 `<span>`
 * 이고 × 만 버튼이라, 칩을 잘못 눌러 지우는 일이 없다.
 *
 * `disabled` 도 같은 이유로 두 상호작용 갈래에만 있다. 읽기 전용 갈래는
 * `<span>` 하나뿐이라 disable 할 대상이 없다 — 허용해도 렌더가 아무것도
 * 하지 않아 "속성은 받는데 스타일도 동작도 따라오지 않는" 거짓 API가 된다.
 */
export type ChipProps = ChipBase &
  (
    | { selected: boolean; onClick?: () => void; onRemove?: never; removeLabel?: never; disabled?: boolean }
    | { selected?: never; onClick?: never; onRemove: () => void; removeLabel?: string; disabled?: boolean }
    | { selected?: never; onClick?: never; onRemove?: never; removeLabel?: never; disabled?: never }
  );

/**
 * 누르거나 지우는 선택 토큰.
 *
 * `removeLabel` 은 × 버튼의 접근성 이름이다. `children` 이 `ReactNode` 라 거기서
 * 뽑을 수 없어 따로 받는다. **기본값을 그대로 두면 칩이 여러 개일 때 이름이 전부
 * 같아져 어느 칩인지 구별되지 않는다** — `"박승인 제거"` 처럼 채운다.
 */
export function Chip({
  children,
  selected,
  onClick,
  onRemove,
  removeLabel = "제거",
  disabled = false,
  className,
}: ChipProps) {
  if (selected !== undefined) {
    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={selected}
        disabled={disabled}
        onClick={onClick}
        className={cx("ns-chip", className)}
      >
        {children}
      </button>
    );
  }

  if (onRemove !== undefined) {
    return (
      <span className={cx("ns-chip", className)}>
        {children}
        <button
          type="button"
          aria-label={removeLabel}
          disabled={disabled}
          onClick={onRemove}
          className="ns-chip__remove"
        >
          ×
        </button>
      </span>
    );
  }

  return <span className={cx("ns-chip", className)}>{children}</span>;
}
