import * as React from "react";
import { createComponent, type EventName } from "@lit/react";

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
import type {
  NsToggleDetail,
  NsNavigateDetail,
  NsGroupToggleDetail,
  NsDialogCloseDetail,
  NsSelectChangeDetail,
  NsSortDetail,
  NsPageChangeDetail,
  NsTabChangeDetail,
  NsMultiSelectChangeDetail,
} from "../types.js";

/*
  @lit/react 래퍼 전부가 이 파일에 모인다. 두 가지 이유다.

  1. tags/ 의 shim(PageHeading·Dialog)이 래퍼를 import 해야 한다.
     index.ts 에 두면 index → tags → index 로 순환한다.
  2. scripts/check-events.mjs 가 이 파일과 컴포넌트의 dispatchEvent 를
     대조한다. 이벤트 매핑의 단일 출처를 한 파일로 유지한다.

  프로퍼티 타입은 createComponent 가 Lit 클래스에서 자동으로 끌어온다.
  이벤트만 손으로 적는다.
*/

export const NsHeader = createComponent({
  react: React,
  tagName: "ns-header",
  elementClass: NsHeaderElement,
  events: {
    // EventName<> 브랜딩이 없으면 핸들러가 (e: Event) => void 로 타입된다.
    onNsToggle: "ns-toggle" as EventName<CustomEvent<NsToggleDetail>>,
  },
});

/* 이벤트가 없다. events 를 빈 객체로 두면 createComponent 가 그대로 받는다. */
export const NsIcon = createComponent({
  react: React,
  tagName: "ns-icon",
  elementClass: NsIconElement,
  events: {},
});

/*
  ns-navigate 는 composed: true 로 올라오므로 사이드바와 그룹에서도 받을 수
  있다. 항목마다 핸들러를 다는 대신 사이드바에서 한 번만 듣는 쪽이 편해서
  세 곳 모두에 매핑해 둔다.

  소비자에게 직접 노출하지 않는다. tags/Sidebar.tsx 가 감싸서 SSR 마크업에
  data-ns-open 을 싣는다 — createComponent 는 반응형 프로퍼티인 open 을
  useLayoutEffect 에서만 설정하므로 서버 HTML 에 남지 않는다.
*/
export const NsSidebarBase = createComponent({
  react: React,
  tagName: "ns-sidebar",
  elementClass: NsSidebarElement,
  events: {
    // EventName<> 브랜딩이 없으면 핸들러가 (e: Event) => void 로 타입된다.
    onNsNavigate: "ns-navigate" as EventName<CustomEvent<NsNavigateDetail>>,
  },
});

export const NsNavGroup = createComponent({
  react: React,
  tagName: "ns-nav-group",
  elementClass: NsNavGroupElement,
  events: {
    // EventName<> 브랜딩이 없으면 핸들러가 (e: Event) => void 로 타입된다.
    onNsNavigate: "ns-navigate" as EventName<CustomEvent<NsNavigateDetail>>,
    onNsGroupToggle: "ns-group-toggle" as EventName<CustomEvent<NsGroupToggleDetail>>,
  },
});

export const NsNavItem = createComponent({
  react: React,
  tagName: "ns-nav-item",
  elementClass: NsNavItemElement,
  events: {
    // EventName<> 브랜딩이 없으면 핸들러가 (e: Event) => void 로 타입된다.
    onNsNavigate: "ns-navigate" as EventName<CustomEvent<NsNavigateDetail>>,
  },
});

/*
  이 래퍼는 소비자에게 직접 노출하지 않는다. tags/PageHeading.tsx 가 감싸서
  title 프롭을 heading 속성으로 넘긴다 — 소비자 호출부를 바꾸지 않기 위해서다.
  Element 는 Lit 클래스 별칭이 쓰므로(기존 네 컴포넌트와 같은 규칙) 래퍼는 Base 다.
*/
export const NsPageHeadingBase = createComponent({
  react: React,
  tagName: "ns-page-heading",
  elementClass: NsPageHeadingElement,
  events: {},
});

export const NsSkeleton = createComponent({
  react: React,
  tagName: "ns-skeleton",
  elementClass: NsSkeletonElement,
  events: {},
});

/*
  소비자에게 직접 노출하지 않는다. tags/Dialog.tsx 가 감싸서 title/onClose/footer
  프롭 이름을 맞춘다.
*/
export const NsDialogBase = createComponent({
  react: React,
  tagName: "ns-dialog",
  elementClass: NsDialogElement,
  events: {
    // EventName<> 브랜딩이 없으면 핸들러가 (e: Event) => void 로 타입된다.
    onNsDialogClose: "ns-dialog-close" as EventName<CustomEvent<NsDialogCloseDetail>>,
  },
});

/*
  shim 이 필요 없다. sortKey·sortDirection 어느 것도 HTML 전역 속성과 충돌하지
  않으므로 평범한 래퍼를 그대로 공개한다. 그래서 EventName<> 검사가 고전적인
  경로로 동작한다 — docs/consumer-example.tsx 가 e.detail 을 직접 읽는다.
*/
export const NsTable = createComponent({
  react: React,
  tagName: "ns-table",
  elementClass: NsTableElement,
  events: {
    // EventName<> 브랜딩이 없으면 핸들러가 (e: Event) => void 로 타입된다.
    onNsSort: "ns-sort" as EventName<CustomEvent<NsSortDetail>>,
    onNsSelectChange: "ns-select-change" as EventName<CustomEvent<NsSelectChangeDetail>>,
  },
});

export const NsPagination = createComponent({
  react: React,
  tagName: "ns-pagination",
  elementClass: NsPaginationElement,
  events: {
    // EventName<> 브랜딩이 없으면 핸들러가 (e: Event) => void 로 타입된다.
    onNsPageChange: "ns-page-change" as EventName<CustomEvent<NsPageChangeDetail>>,
  },
});

/*
  shim 이 필요 없다. active·defaultActive 어느 것도 HTML 전역 속성과 충돌하지
  않으므로 평범한 래퍼를 그대로 공개한다. 탭 버튼은 children 으로 넘긴다.
*/
export const NsTabs = createComponent({
  react: React,
  tagName: "ns-tabs",
  elementClass: NsTabsElement,
  events: {
    // EventName<> 브랜딩이 없으면 핸들러가 (e: Event) => void 로 타입된다.
    onNsTabChange: "ns-tab-change" as EventName<CustomEvent<NsTabChangeDetail>>,
  },
});

/*
  shim 이 필요 없다. options·value 어느 것도 HTML 전역 속성과 충돌하지 않으므로
  평범한 래퍼를 그대로 공개한다 — 그래서 EventName<> 검사가 고전적인 경로로
  동작한다(docs/consumer-example.tsx 가 e.detail 을 직접 읽는다).
*/
export const NsMultiSelect = createComponent({
  react: React,
  tagName: "ns-multi-select",
  elementClass: NsMultiSelectElement,
  events: {
    // EventName<> 브랜딩이 없으면 핸들러가 (e: Event) => void 로 타입된다.
    onNsMultiSelectChange:
      "ns-multi-select-change" as EventName<CustomEvent<NsMultiSelectChangeDetail>>,
  },
});
