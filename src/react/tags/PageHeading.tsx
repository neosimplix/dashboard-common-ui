import { NsPageHeadingBase } from "../elements.js";

export type PageHeadingProps = {
  /**
   * 커스텀 엘리먼트의 속성 이름은 `heading` 이다 — `title` 은 브라우저 툴팁을
   * 띄우기 때문이다. React 프롭은 `title` 을 유지해 소비자 호출부가 바뀌지 않게 한다.
   */
  title: string;
  description?: string;
  className?: string;
  /*
    자식을 받지 않는다. shadow 에 슬롯이 없어 자식이 조용히 사라진다 —
    에러가 없어서 오히려 알아채기 어렵다.
  */
  children?: never;
};

export function PageHeading({ title, description, className }: PageHeadingProps) {
  return (
    <NsPageHeadingBase heading={title} description={description ?? ""} className={className} />
  );
}
