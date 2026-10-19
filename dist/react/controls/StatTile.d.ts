import type { HTMLAttributes, ReactNode } from "react";
export type StatTileProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
    label: ReactNode;
    /** 큰 숫자. 고정폭·자릿수 고정으로 그린다. */
    value: ReactNode;
    /** 숫자 아래 보조 줄. 없으면 그리지 않는다. */
    note?: ReactNode;
};
/** 이름 · 큰 숫자 · 보조 줄. 자기 표면을 가진 빽빽한 카드다. 나머지 속성(data-testid 등)은 바깥 div 로 간다. */
export declare function StatTile({ label, value, note, className, ...rest }: StatTileProps): import("react").JSX.Element;
