import { cloneElement, isValidElement, useEffect, useId, useRef } from "react";
import type { ReactElement, ReactNode } from "react";

export type FieldProps = {
  label: string;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
};

type ControlProps = {
  id?: string;
  "aria-describedby"?: string;
  "aria-errormessage"?: string;
  "aria-invalid"?: boolean;
};

/**
 * 커스텀 엘리먼트 래퍼가 자기 옆에 달아 두는 주입 지도. `elements.ts` 가
 * 세우고 이 파일이 읽는다 — 여기서 래퍼를 import 하지 않기 위한 형태다.
 */
type NsFieldControl = { id: string; describedby: string; invalid: string };

/**
 * hint/error 는 label 밖에 두고 id 로 컨트롤과 연결한다.
 * label 이 컨트롤을 감싸면 hint/error 텍스트까지 그 컨트롤의 accessible name 에
 * 포함돼, 화면낭독기가 포커스마다 라벨과 오류 문구를 한 문장으로 읽게 된다.
 * error 가 있으면 hint 는 감춘다 — 둘 다 보이면 어느 쪽을 읽어야 할지 모호하다.
 *
 * className 프롭을 받지 않는다. 이 컴포넌트는 아이에게 props 를 주입하는 것이
 * 본체이고, 레이아웃 조정은 감싸는 쪽이 한다.
 */
export function Field({ label, hint, error, children }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const showError = Boolean(error);
  const showHint = !showError && Boolean(hint);

  let control: ReactNode = children;
  let controlId = id;

  /*
    자식이 React 엘리먼트가 아니면 이 게이트가 거짓이 되어 아래 주입 블록
    전체가 조용히 건너뛰어진다 — label 은 위 useId 값을 갖는데 자식은
    아무것도 못 받아 label 이 아무것도 가리키지 않는다. 조용히 깨지므로
    경고가 유일한 감지 수단이다.

    Next 의 RSC 페이로드가 자식을 React.lazy 참조로 넘기면 이렇게 된다
    (isValidElement=false, $$typeof=Symbol(react.lazy)). lazy 로 감싸일지는
    청크 경계가 정하고 next dev 에서만 나므로, 테스트도 프로덕션 빌드도
    못 잡는다.

    판정을 렌더 시점 값(injectable)으로 하고 이펙트는 언제 찍을지만
    정한다 — 타이밍 의존이 없다. isValidElement 를 두 번 부르지 않도록
    이 값을 아래 이펙트와 공유한다. 클라이언트 쪽(아래 이펙트)이 렌더
    본문에서 찍지 않는 이유는 Sidebar 와 같다: StrictMode 이중 렌더에
    두 번 나온다(실측 2 → 1). 서버 쪽은 이펙트 자체가 없어 사정이 다르다
    — 아래 참조.
  */
  const injectable = isValidElement(children);

  /*
    자리가 둘인 이유. 게이트가 거짓이 되는 시점이 환경마다 다르다.

    RSC 경로에서는 서버 패스에서만 거짓이다 — Next 의 페이로드가 자식을
    React.lazy 참조로 넘기고, 클라이언트에서는 그것이 풀려 평범한 엘리먼트로
    도착한다. 그런데 아래 이펙트는 클라이언트에서만 돌고 그때 게이트는 이미
    참이므로, 0.5.6 의 경고는 정작 그 사고에서 뜨지 않았다(소비자가 next dev
    에서 확인해 알려줬다).

    서버 렌더에는 이펙트가 없으므로 렌더 본문에서 낸다. 렌더 본문에서
    console.warn 하는 것은 순수성 위반이지만, 서버 렌더는 한 번만 돌고
    StrictMode 도 서버에서는 두 번 부르지 않으므로 중복이 없다
    (실측: renderToString 은 본문 1회·이펙트 0회, StrictMode 로 감싸도 같다).
    이펙트는 서버에서 안 돌고 서버 전용 훅도 없어 대안이 없다.

    문구를 아래 클라이언트 경고와 다르게 쓴다 — 진단이 다르므로 처방도 다르다.
    여기는 "자식이 서버에서 만들어져 lazy 로 왔다", 아래는 "자식이 단일
    엘리먼트가 아니다" 다. 하나로 합치면 RSC 사고를 만난 사람이 엉뚱한 것을
    의심한다.
  */
  if (!injectable && typeof window === "undefined") {
    console.warn(
      `[ns-field] label="${label}" 의 자식이 서버 렌더에서 React 엘리먼트가 ` +
        "아니라 id 를 주입하지 못했습니다. 흔한 원인은 서버 컴포넌트가 만든 " +
        "자식이 RSC 페이로드에서 lazy 참조로 도착하는 경우입니다 — 자식을 " +
        "클라이언트 컴포넌트에서 만들거나 이 파일에 use client 를 붙이세요.",
    );
  }

  const warnedRef = useRef(false);
  useEffect(() => {
    // 자리가 둘이다 — 위는 서버 렌더 본문, 여기는 클라이언트 이펙트다.
    // 두 조건은 렌더 패스 하나로 보면 배타적이다 — 이 이펙트는 서버에서
    // 돌지 않고, typeof window === "undefined" 는 클라이언트에서 결코
    // 참이 되지 않는다. 하지만 SSR 앱은 같은 트리를 서버 패스와 클라이언트
    // 패스 둘 다로 렌더한다 — 자식이 null·배열·문자열이거나 감싸지 않은
    // lazy 참조 자체처럼 애초에 단일 엘리먼트가 아니면 두 패스 모두에서
    // 게이트가 거짓이라, 두 메시지가 각자 다른 곳(터미널과 브라우저 콘솔)에
    // 함께 뜬다. RSC 경로(자식이 클라이언트에서는 풀려 도착)만 서버에서만
    // 거짓이라 위쪽만 뜬다.
    if (injectable || warnedRef.current) return;
    warnedRef.current = true;
    console.warn(
      `[ns-field] label="${label}" 의 자식이 단일 React 엘리먼트가 아니라 ` +
        "id 를 주입하지 못했습니다. label 이 아무것도 가리키지 않습니다 — " +
        "자식을 엘리먼트 하나로 두세요(예: 클라이언트 컴포넌트에서 만들기). " +
        "그 외에는 수동 .ns-field 마크업을 쓰세요.",
    );
  }, [injectable, label]);

  if (injectable) {
    const element = children as ReactElement<ControlProps>;

    // cloneElement 는 값이 undefined 인 키도 그대로 얹어 기존 prop 을 지운다.
    // 그래서 필요한 키만 골라 넣는다 — 아이가 스스로 aria-invalid 등을 들고
    // 있을 때 hint/error 가 없는 렌더에서 그걸 지워버리지 않기 위해서다.
    const marker = (element.type as { nsFieldControl?: NsFieldControl })?.nsFieldControl;

    // element.props.id ?? id 는 네이티브 경로 전용이다. 커스텀 엘리먼트
    // 경로(marker 가 있는 경우)에서는 소비자의 id 를 쓰지 않는다. 그것은
    // 호스트에 남아 있고(cloneElement 는 지우지 않는다), 같은 값을 안쪽
    // input 에도 주면 문서에 같은 id 가 둘 생겨 label for 가 문서 순서상
    // 첫 번째인 호스트를 잡는다 — 호스트는 labelable 이 아니라 고치려던
    // 결함이 그대로 돌아온다. 생성된 id 를 쓴다.
    controlId = marker ? id : (element.props.id ?? id);

    if (marker) {
      /*
        커스텀 엘리먼트는 labelable 이 아니라 호스트에 id 를 얹어도 label 의
        for 가 아무것도 가리키지 못한다. 래퍼가 알려준 이름으로 안쪽 컨트롤에
        내려보낸다 — 그러면 label for 가 그 안쪽 input 을 가리킨다.
      */
      const markerProps: Record<string, unknown> = { [marker.id]: controlId };
      if (showHint) markerProps[marker.describedby] = hintId;
      if (showError) {
        // aria-errormessage 의 짝이 없어 오류 id 도 describedby 로 간다.
        markerProps[marker.describedby] = errorId;
        markerProps[marker.invalid] = true;
      }
      control = cloneElement(element, markerProps);
    } else {
      const ariaProps: ControlProps = { id: controlId };
      if (showHint) ariaProps["aria-describedby"] = hintId;
      if (showError) {
        ariaProps["aria-errormessage"] = errorId;
        ariaProps["aria-invalid"] = true;
      }
      control = cloneElement(element, ariaProps);
    }
  }

  return (
    <div className="ns-field">
      <label htmlFor={controlId} className="ns-field__label">
        {label}
      </label>
      {control}
      {showError ? (
        <span id={errorId} className="ns-field__error">
          {error}
        </span>
      ) : showHint ? (
        <span id={hintId} className="ns-field__hint">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
