import type { ReactNode } from "react";

import { cx } from "../cx.js";

type CardBase = {
  className?: string;
  children: ReactNode;
  /**
   * 안쪽 여백. 기본 `"default"` 는 예전과 같은 `--ns-card-padding` 이고,
   * `"compact"` 는 `.ns-card--compact` 를 붙여 `--ns-card-padding-compact` 를 쓴다.
   * 숫자 타일·보드 칸처럼 카드가 한 화면에 여럿 놓일 때 쓴다.
   */
  density?: "default" | "compact";
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
  density = "default",
  heading,
  description,
  actions,
  headingLevel = 2,
}: CardProps) {
  const cardClass = cx("ns-card", density === "compact" && "ns-card--compact", className);

  if (heading === undefined) {
    return <div className={cardClass}>{children}</div>;
  }

  const Heading = headingLevel === 3 ? "h3" : "h2";

  return (
    <div className={cardClass}>
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
