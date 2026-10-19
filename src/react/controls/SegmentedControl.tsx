import { cx } from "../cx.js";

export type SegmentedOption = { value: string; label: string; disabled?: boolean };

export type SegmentedControlProps = {
  /** 라디오 묶음 이름. 한 페이지에 둘 이상이면 서로 달라야 한다. */
  name: string;
  options: SegmentedOption[];
  /** 제어 컴포넌트다 — 선택한 값을 `onChange` 로 받아 다시 넘긴다. */
  value: string;
  onChange: (value: string) => void;
  /** 묶음의 접근성 이름. 보이는 라벨이 따로 없으므로 필수다. */
  "aria-label": string;
  className?: string;
};

/**
 * 짧은 보기 전환(기간 · 표/카드)의 단일 선택. 네이티브 라디오 묶음이라 방향키로
 * 옮기고, 컨테이너가 `role="radiogroup"` 이다. 패널을 바꾸는 탭이면 `NsTabs` 를 쓴다.
 */
export function SegmentedControl({ name, options, value, onChange, className, ...aria }: SegmentedControlProps) {
  return (
    <div role="radiogroup" aria-label={aria["aria-label"]} className={cx("ns-segmented", className)}>
      {options.map((o) => (
        <label key={o.value}>
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            disabled={o.disabled}
            onChange={() => onChange(o.value)}
          />
          <span>{o.label}</span>
        </label>
      ))}
    </div>
  );
}
