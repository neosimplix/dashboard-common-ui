import type { InputHTMLAttributes } from "react";
export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    invalid?: boolean;
};
export declare function Input({ invalid, className, ...rest }: InputProps): import("react").JSX.Element;
