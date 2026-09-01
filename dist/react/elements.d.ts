import { type EventName } from "@lit/react";
import { NsDialog as NsDialogElement } from "../components/dialog/ns-dialog.js";
import { NsHeader as NsHeaderElement } from "../components/header/ns-header.js";
import { NsIcon as NsIconElement } from "../components/icon/ns-icon.js";
import { NsMultiSelect as NsMultiSelectElement } from "../components/multi-select/ns-multi-select.js";
import { NsNavGroup as NsNavGroupElement } from "../components/nav-group/ns-nav-group.js";
import { NsNavItem as NsNavItemElement } from "../components/nav-item/ns-nav-item.js";
import { NsPageHeading as NsPageHeadingElement } from "../components/page-heading/ns-page-heading.js";
import { NsPagination as NsPaginationElement } from "../components/pagination/ns-pagination.js";
import { NsSidebar as NsSidebarElement } from "../components/sidebar/ns-sidebar.js";
import { NsSkeleton as NsSkeletonElement } from "../components/skeleton/ns-skeleton.js";
import { NsTable as NsTableElement } from "../components/table/ns-table.js";
import { NsTabs as NsTabsElement } from "../components/tabs/ns-tabs.js";
import type { NsToggleDetail, NsNavigateDetail, NsGroupToggleDetail, NsDialogCloseDetail, NsSelectChangeDetail, NsSortDetail, NsPageChangeDetail, NsTabChangeDetail, NsMultiSelectChangeDetail } from "../types.js";
export declare const NsHeader: import("@lit/react").ReactWebComponent<NsHeaderElement, {
    onNsToggle: EventName<CustomEvent<NsToggleDetail>>;
}>;
export declare const NsIcon: import("@lit/react").ReactWebComponent<NsIconElement, {}>;
export declare const NsSidebarBase: import("@lit/react").ReactWebComponent<NsSidebarElement, {
    onNsNavigate: EventName<CustomEvent<NsNavigateDetail>>;
}>;
export declare const NsNavGroup: import("@lit/react").ReactWebComponent<NsNavGroupElement, {
    onNsNavigate: EventName<CustomEvent<NsNavigateDetail>>;
    onNsGroupToggle: EventName<CustomEvent<NsGroupToggleDetail>>;
}>;
export declare const NsNavItem: import("@lit/react").ReactWebComponent<NsNavItemElement, {
    onNsNavigate: EventName<CustomEvent<NsNavigateDetail>>;
}>;
export declare const NsPageHeadingBase: import("@lit/react").ReactWebComponent<NsPageHeadingElement, {}>;
export declare const NsSkeleton: import("@lit/react").ReactWebComponent<NsSkeletonElement, {}>;
export declare const NsDialogBase: import("@lit/react").ReactWebComponent<NsDialogElement, {
    onNsDialogClose: EventName<CustomEvent<NsDialogCloseDetail>>;
}>;
export declare const NsTable: import("@lit/react").ReactWebComponent<NsTableElement, {
    onNsSort: EventName<CustomEvent<NsSortDetail>>;
    onNsSelectChange: EventName<CustomEvent<NsSelectChangeDetail>>;
}>;
export declare const NsPagination: import("@lit/react").ReactWebComponent<NsPaginationElement, {
    onNsPageChange: EventName<CustomEvent<NsPageChangeDetail>>;
}>;
export declare const NsTabs: import("@lit/react").ReactWebComponent<NsTabsElement, {
    onNsTabChange: EventName<CustomEvent<NsTabChangeDetail>>;
}>;
export declare const NsMultiSelect: import("@lit/react").ReactWebComponent<NsMultiSelectElement, {
    onNsMultiSelectChange: EventName<CustomEvent<NsMultiSelectChangeDetail>>;
}>;
