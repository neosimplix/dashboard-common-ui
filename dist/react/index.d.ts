import { type EventName } from "@lit/react";
import { NsHeader as NsHeaderElement } from "../components/header/ns-header.js";
import { NsNavGroup as NsNavGroupElement } from "../components/nav-group/ns-nav-group.js";
import { NsNavItem as NsNavItemElement } from "../components/nav-item/ns-nav-item.js";
import { NsSidebar as NsSidebarElement } from "../components/sidebar/ns-sidebar.js";
import type { NsToggleDetail, NsNavigateDetail } from "../types.js";
export declare const NsHeader: import("@lit/react").ReactWebComponent<NsHeaderElement, {
    onNsToggle: EventName<CustomEvent<NsToggleDetail>>;
}>;
export declare const NsSidebar: import("@lit/react").ReactWebComponent<NsSidebarElement, {
    onNsNavigate: EventName<CustomEvent<NsNavigateDetail>>;
}>;
export declare const NsNavGroup: import("@lit/react").ReactWebComponent<NsNavGroupElement, {
    onNsNavigate: EventName<CustomEvent<NsNavigateDetail>>;
}>;
export declare const NsNavItem: import("@lit/react").ReactWebComponent<NsNavItemElement, {
    onNsNavigate: EventName<CustomEvent<NsNavigateDetail>>;
}>;
export type { NsToggleDetail, NsNavigateDetail } from "../types.js";
