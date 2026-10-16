import type { CSSProperties, ReactNode } from "react";
import type { NsNavigateDetail } from "../../types.js";
export type SidebarProps = {
    /**
     * 사이드바 보임 여부. 주면 제어 모드다 — 컴포넌트가 스스로 바꾸지 않는다.
     *
     * **주지 않아도 컴포넌트가 스스로 여닫지는 않는다.** 이 사이드바에는 자기를
     * 여닫는 버튼이 없으므로(그 버튼은 `NsHeader` 에 있다) 비제어 모드는 사실상
     * **초깃값 전용**이다 — `defaultOpen` 으로 시작한 상태가 그대로 유지된다.
     * 여닫게 하려면 `NsHeader` 의 `onNsToggle` 을 받아 여기 `open` 에 내려준다.
     */
    open?: boolean;
    /** 비제어 초기값. */
    defaultOpen?: boolean;
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
     * 있기 때문이다. 필수로 바꾸는 것은 0.1.5 부터의 동작 변경이라 여기서 하지 않는다.
     */
    onNavigate?: (detail: NsNavigateDetail) => void;
    children?: ReactNode;
    className?: string;
    style?: CSSProperties;
};
/**
 * `open`·`defaultOpen` 을 서버 마크업에도 싣기 위한 shim.
 *
 * `@lit/react` 의 `createComponent` 는 반응형 프로퍼티를 `useLayoutEffect`
 * 안에서 프로퍼티로만 설정한다. 서버 렌더 시점에는 실행되지 않으므로 Next 가
 * 내려주는 HTML 에 `open`·`defaultOpen` 속성이 없고, `tokens.css` 의 정의 전
 * 예약이 접힘으로 그려다가 하이드레이션 직후 벌어진다.
 *
 * 반응형 프로퍼티가 **아닌** 이름은 가로채이지 않고 `React.createElement` 로
 * 흘러가 서버 마크업에 그대로 실린다. 통로는 둘이고 서로 다른 구간을 덮는다 —
 * `data-ns-open` 은 제어 모드(`open` 이 있을 때)만 렌더해 upgrade 전 폭을
 * 잡고, `default-open` 은 `open === true || defaultOpen === true` 일 때
 * 렌더해 제어·비제어 양쪽에서 upgrade 시점에 Lit 의 속성 컨버터가
 * `defaultOpen` 을 곧바로 세우게 한다 — 엘리먼트의 첫 `updated()` 가 `open`
 * 도착 전에도 이미 참인 `#isOpen` 을 보게 되어 `data-ns-open` 을 지우지 않고
 * 유지한다.
 */
export declare function Sidebar({ open, defaultOpen, onNavigate, children, className, style, }: SidebarProps): import("react").JSX.Element;
