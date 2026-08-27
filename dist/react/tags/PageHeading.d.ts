export type PageHeadingProps = {
    /**
     * 커스텀 엘리먼트의 속성 이름은 `heading` 이다 — `title` 은 브라우저 툴팁을
     * 띄우기 때문이다. React 프롭은 `title` 을 유지해 소비자 호출부가 바뀌지 않게 한다.
     */
    title: string;
    description?: string;
    className?: string;
};
export declare function PageHeading({ title, description, className }: PageHeadingProps): import("react").JSX.Element;
