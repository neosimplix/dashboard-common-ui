import * as React from "react";
import { createComponent, type EventName } from "@lit/react";

import { NsHeader as NsHeaderElement } from "../components/header/ns-header.js";
import { NsIcon as NsIconElement } from "../components/icon/ns-icon.js";
import { NsNavGroup as NsNavGroupElement } from "../components/nav-group/ns-nav-group.js";
import { NsNavItem as NsNavItemElement } from "../components/nav-item/ns-nav-item.js";
import { NsSidebar as NsSidebarElement } from "../components/sidebar/ns-sidebar.js";
import type { NsToggleDetail, NsNavigateDetail } from "../types.js";

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
  ns-navigate 는 composed: true 로 올라오므로 사이드바와 그룹에서도
  받을 수 있다. 항목마다 핸들러를 다는 대신 사이드바에서 한 번만 듣는
  쪽이 편해서 세 곳 모두에 매핑해 둔다.
*/
export const NsSidebar = createComponent({
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
