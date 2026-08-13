import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

import { cx } from "../cx.js";

export type ButtonVariant = "solid" | "outline" | "ghost" | "icon";
export type ButtonSize = "sm" | "md";

type ButtonBase = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ButtonBase;
export type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & ButtonBase;

function buttonClass(
  { variant = "solid", size = "md", fullWidth = false }: ButtonBase,
  className?: string,
): string {
  return cx(
    "ns-button",
    `ns-button--${variant}`,
    // --icon 은 자체 패딩을 쓰므로 크기 변형을 붙이지 않는다.
    variant !== "icon" && `ns-button--${size}`,
    fullWidth && "ns-button--full",
    className,
  );
}

/**
 * type 기본값이 "button" 인 것이 중요하다. 네이티브 기본값은 "submit" 이라
 * 폼 안에 놓인 순간 의도치 않게 제출한다. 제출 버튼은 호출부가 명시한다.
 */
export function Button({
  variant = "solid",
  size = "md",
  fullWidth = false,
  className,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClass({ variant, size, fullWidth }, className)}
      {...rest}
    />
  );
}

/**
 * 버튼처럼 보이는 링크. 서버 리디렉션으로 시작하는 로그인처럼 클릭 결과가
 * 페이지 이동인 경우에 쓴다. 동작이 링크면 마크업도 링크여야 한다.
 */
export function ButtonLink({
  variant = "solid",
  size = "md",
  fullWidth = false,
  className,
  ...rest
}: ButtonLinkProps) {
  return <a className={buttonClass({ variant, size, fullWidth }, className)} {...rest} />;
}
