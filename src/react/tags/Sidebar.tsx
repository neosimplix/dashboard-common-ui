import type { CSSProperties, ReactNode } from "react";

import { NsSidebarBase } from "../elements.js";
import type { NsNavigateDetail } from "../../types.js";

export type SidebarProps = {
  /** 패널 보임 여부. 소비자가 내려준다 — 컴포넌트가 스스로 바꾸지 않는다. */
  open: boolean;
  /**
   * 패널에 보일 그룹의 `name`. 주면 제어 모드다 — 컴포넌트가 스스로 바꾸지 않는다.
   *
   * 주지 않으면 컴포넌트가 스스로 관리하고, 초기값은 `defaultActiveGroup` 이다.
   */
  activeGroup?: string;
  /** 비제어 초기 그룹. 비우면 첫 번째 그룹이다. */
  defaultActiveGroup?: string;
  /**
   * 레일 타일이 요청하는 다음 그룹.
   *
   * **`open` 을 소비자가 들고 있으므로 `onToggle` 과 짝으로 다뤄야 한다.**
   * 타일 클릭은 그룹을 바꾸면서 패널을 열어 달라고 요청한다.
   */
  onGroupSelect?: (name: string) => void;
  /**
   * 패널의 다음 상태 요청. 레일 타일과 `ns-header` 의 토글이 같은 이름으로 올린다.
   *
   * 빠뜨리면 레일 타일을 눌러도 패널이 열리지 않는다.
   */
  onToggle?: (open: boolean) => void;
  /**
   * 하위 ns-nav-item 의 클릭. composed 라 사이드바에서 한 번만 들으면 된다.
   *
   * **빠뜨리면 그 사이드바의 링크가 전부 죽는다.** ns-nav-item 은 평범한 좌클릭에
   * preventDefault() 를 부르고 이벤트만 올리므로(라우팅은 소비자 몫이라는 설계),
   * 듣는 쪽이 없으면 클릭이 아무 일도 하지 않는다. 선택 프롭이라 타입 검사도 통과하고
   * 콘솔에도 아무것도 남지 않아 화면에서만 드러난다. 수식키·가운데 클릭은 가로채지
   * 않으므로 새 탭 열기만 동작해 "가끔 되는 것처럼" 보인다.
   *
   * 선택으로 두는 이유는 사이드바가 라우팅 없이 쓰이는 경우(정적 예시, 스토리)가
   * 있기 때문이다.
   */
  onNavigate?: (detail: NsNavigateDetail) => void;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/**
 * `open` 을 서버 마크업에도 싣기 위한 shim.
 *
 * `@lit/react` 의 `createComponent` 는 반응형 프로퍼티를 `useLayoutEffect`
 * 안에서 프로퍼티로만 설정한다. 서버 렌더 시점에는 실행되지 않으므로 Next 가
 * 내려주는 HTML 에 `open` 속성이 없고, `tokens.css` 의 정의 전 예약이 접힘으로
 * 그려다가 하이드레이션 직후 벌어진다.
 *
 * 반응형 프로퍼티가 **아닌** 이름은 가로채이지 않고 `React.createElement` 로
 * 흘러가 서버 마크업에 그대로 실린다. `data-ns-open` 이 그 통로다.
 */
export function Sidebar({
  open,
  activeGroup,
  defaultActiveGroup,
  onGroupSelect,
  onToggle,
  onNavigate,
  children,
  className,
  style,
}: SidebarProps) {
  return (
    <NsSidebarBase
      open={open}
      activeGroup={activeGroup}
      defaultActiveGroup={defaultActiveGroup}
      // 하이드레이션 전에는 이것만 보인다. tokens.css 의 :not(:defined) 규칙이 읽는다.
      data-ns-open={open ? "" : undefined}
      className={className}
      style={style}
      // e.detail 을 여기서 실제로 읽는다. elements.ts 의 EventName<> 캐스트가
      // 빠지면 e 가 Event 로 타입돼 이 줄들이 깨진다.
      onNsNavigate={(e) => onNavigate?.(e.detail)}
      onNsGroupSelect={(e) => onGroupSelect?.(e.detail.name)}
      onNsToggle={(e) => onToggle?.(e.detail.open)}
    >
      {children}
    </NsSidebarBase>
  );
}
