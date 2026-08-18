import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
export type ButtonVariant = "solid" | "outline" | "ghost" | "icon";
export type ButtonSize = "sm" | "md";
type ButtonBase = {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
};
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ButtonBase;
export type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & ButtonBase;
/**
 * type 기본값이 "button" 인 것이 중요하다. 네이티브 기본값은 "submit" 이라
 * 폼 안에 놓인 순간 의도치 않게 제출한다. 제출 버튼은 호출부가 명시한다.
 */
export declare function Button({ variant, size, fullWidth, className, type, ...rest }: ButtonProps): import("react").JSX.Element;
/**
 * 버튼처럼 보이는 링크. 서버 리디렉션으로 시작하는 로그인처럼 클릭 결과가
 * 페이지 이동인 경우에 쓴다. 동작이 링크면 마크업도 링크여야 한다.
 */
export declare function ButtonLink({ variant, size, fullWidth, className, ...rest }: ButtonLinkProps): import("react").JSX.Element;
export {};
