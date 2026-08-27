import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  .row {
    display: flex;
    align-items: center;
    gap: var(--ns-space-2-5);
    margin-bottom: var(--ns-space-1);
    border-radius: var(--ns-radius-control);
    padding: var(--ns-space-2);
    color: var(--ns-color-fg-body);
    text-decoration: none;
    transition: background-color var(--ns-transition-fast) var(--ns-transition-ease),
      color var(--ns-transition-fast) var(--ns-transition-ease);
  }

  /*
    배경만 바뀌면 "누를 수 있다" 가 정적인 대비로만 드러난다. 글자색이 함께
    올라가면 반응으로도 드러난다 — collapsible 인 그룹 제목이 이미 같은 모양의
    hover 를 갖고 있어 둘이 같은 규약을 쓴다.
  */
  .row:hover {
    background: var(--ns-color-surface-sunken);
    color: var(--ns-color-fg);
  }

  :host([active]) .row {
    background: var(--ns-color-surface-hover);
    color: var(--ns-color-fg);
  }

  /*
    소비자가 넣은 요소의 상한. 크기 자체는 여기서 주지 않는다 — 보통 들어오는
    <ns-icon> 은 자기 shadow 의 :host 에서 --ns-icon-size 로 크기를 갖고 그것이
    이 상한보다 작다. 크기가 없는 것을 넣으면 이 규칙은 그것을 키워 주지 않는다.

    flex: none 이 필요한 이유는 이것이 이제 .leading 래퍼 없이 .row 의 직계
    flex 항목이기 때문이다 — 라벨이 길면 축소 대상이 된다.
  */
  ::slotted([slot="leading"]) {
    flex: none;
    max-width: var(--ns-control-height-sm);
    max-height: var(--ns-control-height-sm);
  }

  /*
    flex: 1 과 min-width: 0 이 함께 있어야 한다. flex 자식은 기본이
    min-width: auto 라 내용보다 작아지지 않고, 그러면 text-overflow 가
    동작하지 않는다.
  */
  .label {
    display: block;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: var(--ns-font-size-sm);
    line-height: var(--ns-line-height-sm);
    font-weight: var(--ns-weight-medium);
  }

  /*
    leading 과 달리 max-width 를 주지 않는다. trailing 은 배지·카운트처럼
    내용에 따라 넓어지는 것이 정상이다 — "3" 과 "128" 은 너비가 달라야
    맞다. 높이만 행 높이에 맞춰 눌러 준다.

    flex: none 이 필요한 이유는 leading 과 같다 — 이제 .trailing 래퍼
    없이 .row 의 직계 flex 항목이라, 라벨이 길면 축소 대상이 된다.
  */
  ::slotted([slot="trailing"]) {
    flex: none;
    max-height: var(--ns-control-height-sm);
  }
`;
