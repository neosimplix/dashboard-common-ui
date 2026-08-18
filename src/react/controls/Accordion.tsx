import type { ReactNode } from "react";

import { cx } from "../cx.js";

export type AccordionVariant = "card" | "plain";

type AccordionBase = {
  title: string;
  /**
   * 처음 렌더될 때 펼쳐진 채로 나온다.
   *
   * `open` 이 아니라 `defaultOpen` 인 이유: 이후의 열림 상태는 브라우저가 갖고
   * React 는 다시 손대지 않는다. **넘기는 값이 렌더마다 그대로일 때만 그렇다** —
   * 이 프롭은 `<details open>` **속성**으로 나가고 React 는 프롭 값이 바뀌면 그
   * 속성을 다시 쓰므로, 바뀌는 값을 넘기면 사용자가 접어 둔 것이 다시 열린다.
   * 비제어라는 이름으로 제어처럼 도는 셈이니 값은 고정해서 넘긴다.
   *
   * `defaultChecked` 처럼 마운트 뒤에 완전히 분리되는 프롭은 아니다. 그쪽은
   * `<input>` 의 속성과 현재 상태가 애초에 다른 값이라 속성을 다시 써도 사용자가
   * 만진 상태가 움직이지 않지만, `<details>` 는 `open` 속성 자체가 상태다.
   */
  defaultOpen?: boolean;
  children: ReactNode;
  /** 배치·여백만 더한다. 색·테두리는 여기서 덮이지 않는다. */
  className?: string;
};

/**
 * `summary` 가 `card` 에서만 필수인 것은 타입으로 갈라 둔 것이다.
 *
 * 「권한」만 적혀 있으면 몇 개인지 보려고 전부 열어야 하고, 그건 접어 둔 의미가
 * 없다. optional 로 두면 이 규약은 아무도 지키지 않으므로 tsc 가 호출부에서
 * 멈추게 한다. `plain` 에는 요약 자리 자체가 없으므로 `never` 다.
 */
export type AccordionProps = AccordionBase &
  (
    | { variant?: "card"; summary: string }
    | { variant: "plain"; summary?: never }
  );

/**
 * 접히는 섹션 하나. 여러 개를 쌓은 것이 아코디언이고, 각각은 독립적으로 여닫힌다.
 *
 * **네이티브 `<details>`/`<summary>` 다** — 열림 상태·키보드·접근성을 브라우저가
 * 한다. 그래서 이 컴포넌트가 상태를 갖지 않고, 라이브러리에서도 태그가 아니라
 * 클래스다.
 *
 * 두 변형의 차이는 **무게**다. `card` 는 나란히 쌓아 훑는 편집 섹션이고,
 * `plain` 은 본문에서 눈을 떼게 하지 않으려는 보조 경로다.
 */
export function Accordion({
  title,
  summary,
  defaultOpen,
  children,
  className,
  variant = "card",
}: AccordionProps) {
  return (
    <details
      className={cx("ns-accordion", `ns-accordion--${variant}`, className)}
      open={defaultOpen}
    >
      <summary>
        {variant === "plain" ? (
          title
        ) : (
          <>
            <span className="ns-accordion__title">{title}</span>
            <span className="ns-accordion__meta">{summary}</span>
          </>
        )}
      </summary>
      <div className="ns-accordion__body">{children}</div>
    </details>
  );
}
