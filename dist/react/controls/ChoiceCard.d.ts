import type { InputHTMLAttributes, ReactNode } from "react";
export type ChoiceCardProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
    /** 라디오(하나 고르기) 또는 체크박스(여럿 고르기). */
    type: "radio" | "checkbox";
    label: ReactNode;
    description?: ReactNode;
};
/**
 * 입력 + 제목 + 설명을 라벨 하나로 감싼 선택 카드. 카드 전체가 히트 영역이고
 * 라벨이 입력의 접근성 이름이다.
 *
 * **묶음은 쓰는 쪽이 `<fieldset>` + `<legend>` 로 감싼다.** 라디오면 같은 `name`
 * 을 준다 — 방향키 이동과 단일 선택은 브라우저가 name 으로 묶어서 한다.
 */
export declare function ChoiceCard({ type, label, description, className, ...rest }: ChoiceCardProps): import("react").JSX.Element;
