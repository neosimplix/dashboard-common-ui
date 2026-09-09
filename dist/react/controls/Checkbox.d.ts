import type { InputHTMLAttributes } from "react";
export type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    /**
     * 라벨 옆에 흐리게 붙는 보조 설명. 두 가지로 쓰인다 — 체크돼 있지만 바꿀 수
     * 없는 이유(비활성 체크박스), 또는 편집 가능한 항목이 무엇을 하는지 풀어 쓴 설명.
     */
    hint?: string;
};
export declare function Checkbox({ label, hint, className, ...rest }: CheckboxProps): import("react").JSX.Element;
