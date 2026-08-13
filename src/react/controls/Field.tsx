import { cloneElement, isValidElement, useId } from "react";
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

  if (isValidElement(children)) {
    const element = children as ReactElement<ControlProps>;
    controlId = element.props.id ?? id;

    // cloneElement 는 값이 undefined 인 키도 그대로 얹어 기존 prop 을 지운다.
    // 그래서 필요한 키만 골라 넣는다 — 아이가 스스로 aria-invalid 등을 들고
    // 있을 때 hint/error 가 없는 렌더에서 그걸 지워버리지 않기 위해서다.
    const ariaProps: ControlProps = { id: controlId };
    if (showHint) ariaProps["aria-describedby"] = hintId;
    if (showError) {
      ariaProps["aria-errormessage"] = errorId;
      ariaProps["aria-invalid"] = true;
    }

    control = cloneElement(element, ariaProps);
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
