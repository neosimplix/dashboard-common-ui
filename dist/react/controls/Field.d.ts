import type { ReactNode } from "react";
export type FieldProps = {
    label: string;
    hint?: ReactNode;
    error?: ReactNode;
    children: ReactNode;
};
/**
 * hint/error 는 label 밖에 두고 id 로 컨트롤과 연결한다.
 * label 이 컨트롤을 감싸면 hint/error 텍스트까지 그 컨트롤의 accessible name 에
 * 포함돼, 화면낭독기가 포커스마다 라벨과 오류 문구를 한 문장으로 읽게 된다.
 * error 가 있으면 hint 는 감춘다 — 둘 다 보이면 어느 쪽을 읽어야 할지 모호하다.
 *
 * className 프롭을 받지 않는다. 이 컴포넌트는 아이에게 props 를 주입하는 것이
 * 본체이고, 레이아웃 조정은 감싸는 쪽이 한다.
 */
export declare function Field({ label, hint, error, children }: FieldProps): import("react").JSX.Element;
