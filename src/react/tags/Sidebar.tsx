import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef } from "react";

import { NsSidebarBase } from "../elements.js";
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
export function Sidebar({
  open,
  defaultOpen,
  onNavigate,
  children,
  className,
  style,
}: SidebarProps) {
  /*
    여닫을 수 없는 배선(open 도 defaultOpen 도 없음) 경고는 원래 엘리먼트의
    connectedCallback 에 있었다. 그쪽은 setTimeout(0) 으로 React 가 open 을
    세울 때까지 기다렸지만, hydrateRoot 는 동기 커밋이 아니라 MessageChannel 로
    스케줄되는 별도 매크로태스크다 — 타이머가 번들 평가 시점에 이미 걸려 있어
    그 태스크보다 먼저 만료된다(실측: define→2.8ms, hydrateRoot 반환→3.2ms,
    WARN→6.8ms, open 대입→8.2ms). 그래서 항상 닫힌 채로 시작하는 정상 배선
    (`<Sidebar open={isOpen}>`, isOpen 초깃값 false)마다 거짓 양성이 났다.

    이 shim 은 렌더 시점에 open·defaultOpen 을 직접 받으므로 기다릴 것이
    없다 — 프롭은 이미 도착해 있다. 판정은 엘리먼트가 쓰던 것과 같다: 둘 다
    undefined 면 #isOpen(open ?? #innerOpen)이 영원히 false 라 열 방법이 없다.

    판정 자체는 렌더 시점에 끝나지만, **경고를 내는 자리는 useEffect(…, [])
    안이다.** 판정에 타이밍 의존이 없다는 것과, 부작용(console.warn)을 어디서
    커밋하느냐는 별개의 문제다 — 후자를 렌더 바디에 두면 StrictMode 아래서
    깨진다.

    한 번만 경고하는 것은 useRef 가드가 한다. React 는 리렌더를 자유롭게
    일으키므로 매 렌더 콘솔을 찍으면 스팸이 되기 때문이다. 그런데 이 가드가
    렌더 바디에서 버티지 못한다 — StrictMode 는 마운트 시 렌더 함수를 커밋
    전에 두 번 호출하고, 두 호출 다 아직 커밋되지 않은 상태이므로 각자
    warned.current 를 false 로 새로 본다. 그 결과 두 렌더 패스가 각각
    console.warn 을 부른다. 실측(React 18.3.1 dev, 실제 createRoot, 마운트 +
    리렌더 두 번): 렌더 바디 + useRef 는 StrictMode 에서 2 회, 비-Strict 에서
    1 회. Next.js App Router 는 dev 에서 StrictMode 를 기본으로 켜므로, 이
    라이브러리를 쓰는 전형적인 dev 환경에서 소비자가 두 번 본다.

    useEffect(…, []) 로 옮기면 1 회로 줄어든다. 이펙트는 커밋 이후에만
    실행되므로, 그 시점에는 이미 한 번 커밋된 렌더의 훅 상태(= 이 useRef 가
    가리키는 같은 객체)가 고정돼 있다. StrictMode 가 마운트 이펙트를
    실행→정리→재실행으로 두 번 부르더라도 두 호출이 같은 ref 객체를 보므로,
    첫 호출이 세운 warned.current = true 를 두 번째 호출이 그대로 이어받아
    가드가 실제로 먹힌다. 잃는 것은 없다 — 프롭은 렌더 시점에 이미 확정돼
    있으므로 판정을 미룰 이유도, 미뤄서 판정이 달라질 여지도 없다. 딱 하나
    내주는 것은 SSR 노출이다: 이펙트는 클라이언트 전용이라 이 경고가 더는
    렌더 패스(`next dev` 의 서버 터미널)에 찍히지 않고 브라우저 콘솔에서만
    보인다. 결함(여닫을 수 없는 배선)은 여전히 브라우저에서 드러나므로 감수할
    만한 손실이다.
  */
  const warned = useRef(false);
  useEffect(() => {
    if (open === undefined && defaultOpen === undefined && !warned.current) {
      warned.current = true;
      console.warn(
        "[ns-sidebar] open 도 defaultOpen 도 주지 않아 이 사이드바는 열 수 없습니다.\n" +
          "  제어하려면 open 을, 비제어로 열어 두려면 defaultOpen 을 줍니다.",
      );
    }
  }, []);

  return (
    <NsSidebarBase
      open={open}
      defaultOpen={defaultOpen}
      /*
        하이픈 든 이름은 반응형 프로퍼티가 아니므로 createComponent 가 가로채지
        않고 React.createElement 로 흘러가 서버 마크업에 그대로 실린다.

        **제어·비제어 양쪽의 튐을 막는 것이 이 줄이다.** 조건에 open === true 가
        함께 있는 이유가 그것이다.

        비제어: defaultOpen 은 반응형이라 useLayoutEffect 에서만 설정되므로 서버
        마크업에 아무 표시도 남지 않고, upgrade 시점에 아직 false 라 폭 0 으로
        그려지다 하이드레이션 직후 15rem 으로 벌어진다.

        제어: shim 이 심은 data-ns-open 이 upgrade 전까지는 15rem 을 잡지만,
        upgrade 직후 엘리먼트의 첫 updated() 가 돌 때 open 은 아직 undefined 이고
        #innerOpen 은 false 라 **그 속성을 지운다.** 폭 0 으로 접혔다가 하이드레이션
        직후 다시 벌어진다.

        이 속성이 있으면 upgrade 때 Lit 의 컨버터가 defaultOpen 을 세우고,
        #isOpen 이 open ?? #innerOpen 이므로 open 이 도착하기 전에도 참이 되어
        첫 updated() 가 속성을 유지한다. 나중에 open={false} 가 오면 open 이
        이기므로 초기값이 남아 있어도 해가 없다.
      */
      default-open={open === true || defaultOpen === true ? "" : undefined}
      // 하이드레이션 전에는 이것만 보인다. tokens.css 의 :not(:defined) 규칙이 읽는다.
      // 제어 모드에서만 렌더한다 — 비제어에서는 엘리먼트가 스스로 쓰므로
      // 여기서 함께 쓰면 React 가 이 속성의 소유자가 되어 엘리먼트의
      // toggleAttribute 와 다툰다. default-open 은 엘리먼트가 쓰지 않는 이름이라
      // 그 다툼이 없다.
      data-ns-open={open === true ? "" : undefined}
      className={className}
      style={style}
      // e.detail 을 여기서 실제로 읽는다. elements.ts 의 EventName<> 캐스트가
      // 빠지면 e 가 Event 로 타입돼 이 줄들이 깨진다.
      onNsNavigate={(e) => onNavigate?.(e.detail)}
    >
      {children}
    </NsSidebarBase>
  );
}
