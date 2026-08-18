/*
  React 소비자의 단일 진입점.

  값과 타입만 내보낸다. createComponent 호출은 elements.ts, 네이티브 요소에
  클래스를 붙이는 컴포넌트는 controls/, 커스텀 엘리먼트 래퍼의 프롭 이름을
  맞추는 어댑터는 tags/ 에 있다.
*/
export { NsHeader, NsIcon, NsNavGroup, NsNavItem, NsPagination, NsSkeleton, NsTable } from "./elements.js";

/*
  스프라이트 등록. 루트 진입점에도 같은 이름으로 있지만 여기도 내보낸다 —
  React 소비자는 이 경로 하나만 import 하므로, 없으면 아이콘 하나 때문에
  두 번째 진입점을 알아야 한다. svg 를 함께 내보내는 이유는 루트와 같다.
*/
export { registerIcons } from "../components/icon/icons.js";
export type { IconDef } from "../components/icon/icons.js";
export { svg } from "lit";

export { PageHeading } from "./tags/PageHeading.js";
export type { PageHeadingProps } from "./tags/PageHeading.js";

export { Dialog } from "./tags/Dialog.js";
export type { DialogProps } from "./tags/Dialog.js";

export { Sidebar } from "./tags/Sidebar.js";
export type { SidebarProps } from "./tags/Sidebar.js";

export { Button, ButtonLink } from "./controls/Button.js";
export type {
  ButtonLinkProps,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from "./controls/Button.js";

export { Card } from "./controls/Card.js";
export type { CardProps } from "./controls/Card.js";

export { Accordion } from "./controls/Accordion.js";
export type { AccordionProps, AccordionVariant } from "./controls/Accordion.js";

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
  NsSelectChangeDetail,
  NsPageChangeDetail,
} from "../types.js";
