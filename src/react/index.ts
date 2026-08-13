/*
  React 소비자의 단일 진입점.

  값과 타입만 내보낸다. createComponent 호출은 elements.ts, 네이티브 요소에
  클래스를 붙이는 컴포넌트는 controls/, 커스텀 엘리먼트 래퍼의 프롭 이름을
  맞추는 어댑터는 tags/ 에 있다.
*/
export { NsHeader, NsIcon, NsNavGroup, NsNavItem, NsSidebar, NsSkeleton, NsTable } from "./elements.js";

export { PageHeading } from "./tags/PageHeading.js";
export type { PageHeadingProps } from "./tags/PageHeading.js";

export { Dialog } from "./tags/Dialog.js";
export type { DialogProps } from "./tags/Dialog.js";

export { Button, ButtonLink } from "./controls/Button.js";
export type {
  ButtonLinkProps,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from "./controls/Button.js";

export { Card } from "./controls/Card.js";
export type { CardProps } from "./controls/Card.js";

export { Input } from "./controls/Input.js";
export type { InputProps } from "./controls/Input.js";
export { Textarea } from "./controls/Textarea.js";
export type { TextareaProps } from "./controls/Textarea.js";

export { Select } from "./controls/Select.js";
export type { SelectOption, SelectProps } from "./controls/Select.js";

export { Checkbox } from "./controls/Checkbox.js";
export type { CheckboxProps } from "./controls/Checkbox.js";

export { Field } from "./controls/Field.js";
export type { FieldProps } from "./controls/Field.js";

export type {
  NsToggleDetail,
  NsNavigateDetail,
  NsDialogCloseDetail,
  NsDialogCloseReason,
  NsSortDetail,
  NsSortDirection,
} from "../types.js";
