import * as React from "react";
import { type EventName, type ReactWebComponent } from "@lit/react";
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
export declare const NsHeader: ReactWebComponent<NsHeaderElement, {
    onNsToggle: EventName<CustomEvent<NsToggleDetail>>;
}>;
export declare const NsIcon: ReactWebComponent<NsIconElement, {}>;
export declare const NsSidebarBase: ReactWebComponent<NsSidebarElement, {
    onNsNavigate: EventName<CustomEvent<NsNavigateDetail>>;
}>;
export declare const NsNavGroup: ReactWebComponent<NsNavGroupElement, {
    onNsNavigate: EventName<CustomEvent<NsNavigateDetail>>;
    onNsGroupToggle: EventName<CustomEvent<NsGroupToggleDetail>>;
}>;
export declare const NsNavItem: ReactWebComponent<NsNavItemElement, {
    onNsNavigate: EventName<CustomEvent<NsNavigateDetail>>;
}>;
export declare const NsPageHeadingBase: ReactWebComponent<NsPageHeadingElement, {}>;
export declare const NsSkeleton: React.ForwardRefExoticComponent<Omit<Omit<React.HTMLAttributes<NsSkeletonElement>, "renderRoot" | "isUpdatePending" | "hasUpdated" | "addController" | "removeController" | "connectedCallback" | "disconnectedCallback" | "attributeChangedCallback" | "requestUpdate" | "updateComplete" | "width" | "height" | "radius" | "render" | "renderOptions"> & {} & Partial<Omit<NsSkeletonElement, keyof HTMLElement>> & React.RefAttributes<NsSkeletonElement>, "children"> & {
    children?: never;
}>;
export declare const NsDialogBase: ReactWebComponent<NsDialogElement, {
    onNsDialogClose: EventName<CustomEvent<NsDialogCloseDetail>>;
}>;
export declare const NsTable: ReactWebComponent<NsTableElement, {
    onNsSort: EventName<CustomEvent<NsSortDetail>>;
    onNsSelectChange: EventName<CustomEvent<NsSelectChangeDetail>>;
}>;
export declare const NsPagination: React.ForwardRefExoticComponent<Omit<Omit<React.HTMLAttributes<NsPaginationElement>, "renderRoot" | "isUpdatePending" | "hasUpdated" | "addController" | "removeController" | "connectedCallback" | "disconnectedCallback" | "attributeChangedCallback" | "requestUpdate" | "updateComplete" | "page" | "total" | "perPage" | "defaultPage" | "pageWindow" | "renderOptions" | "onNsPageChange"> & {
    onNsPageChange?: ((e: CustomEvent<NsPageChangeDetail>) => void) | undefined;
} & Partial<Omit<NsPaginationElement, keyof HTMLElement>> & React.RefAttributes<NsPaginationElement>, "children"> & {
    children?: never;
}>;
export declare const NsTabs: ReactWebComponent<NsTabsElement, {
    onNsTabChange: EventName<CustomEvent<NsTabChangeDetail>>;
}>;
export declare const NsMultiSelect: React.ForwardRefExoticComponent<Omit<Omit<React.HTMLAttributes<NsMultiSelectElement>, "renderRoot" | "isUpdatePending" | "hasUpdated" | "addController" | "removeController" | "connectedCallback" | "disconnectedCallback" | "attributeChangedCallback" | "requestUpdate" | "updateComplete" | "options" | "value" | "defaultValue" | "searchPlaceholder" | "emptyMessage" | "inputId" | "inputDescribedby" | "inputInvalid" | "renderOptions" | "onNsMultiSelectChange"> & {
    onNsMultiSelectChange?: ((e: CustomEvent<NsMultiSelectChangeDetail>) => void) | undefined;
} & Partial<Omit<NsMultiSelectElement, keyof HTMLElement>> & React.RefAttributes<NsMultiSelectElement>, "children"> & {
    children?: never;
}> & {
    nsFieldControl: {
        id: "inputId";
        describedby: "inputDescribedby";
        invalid: "inputInvalid";
    };
};
