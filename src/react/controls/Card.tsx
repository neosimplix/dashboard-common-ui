import type { ReactNode } from "react";

import { cx } from "../cx.js";

type CardBase = {
  className?: string;
  children: ReactNode;
};

/**
 * 머리는 `heading` 이 있을 때만 생긴다. **없으면 출력이 예전과 완전히 같다** —
 * 이 프롭들이 생겼다고 기존 호출부가 달라지지 않는다.
 *
 * `description`·`actions`·`headingLevel` 을 `heading` 없이 주는 것은 타입이
 * 막는다. 셋만 주면 아무것도 렌더되지 않아 조용히 사라지기 때문이다.
 */
export type CardProps = CardBase &
  (
    | {
        heading: string;
        description?: string;
        actions?: ReactNode;
        /**
         * 제목 요소. 기본은 `2` — 이 라이브러리를 쓰는 페이지에는 대개
         * `ns-page-heading` 의 `h1` 이 이미 있다.
         *
         * **`1` 을 허용하지 않는다.** 카드 제목이 페이지 제목일 수는 없다.
         */
        headingLevel?: 2 | 3;
      }
    | { heading?: never; description?: never; actions?: never; headingLevel?: never }
  );

export function Card({
  className,
  children,
  heading,
  description,
  actions,
  headingLevel = 2,
}: CardProps) {
  if (heading === undefined) {
    return <div className={cx("ns-card", className)}>{children}</div>;
  }

  const Heading = headingLevel === 3 ? "h3" : "h2";

  return (
    <div className={cx("ns-card", className)}>
      <div className="ns-card__header">
        <div>
          <Heading className="ns-card__title">{heading}</Heading>
          {description !== undefined && (
            <p className="ns-card__description">{description}</p>
          )}
        </div>
        {actions !== undefined && <div className="ns-card__actions">{actions}</div>}
      </div>
      <div className="ns-card__body">{children}</div>
    </div>
  );
}
