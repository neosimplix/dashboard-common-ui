import * as React from "react";
import { createComponent } from "@lit/react";

import { NsHeader as NsHeaderElement } from "../components/header/ns-header.js";
import { NsNavGroup as NsNavGroupElement } from "../components/nav-group/ns-nav-group.js";
import { NsNavItem as NsNavItemElement } from "../components/nav-item/ns-nav-item.js";
import { NsSidebar as NsSidebarElement } from "../components/sidebar/ns-sidebar.js";

/*
  프로퍼티 타입은 createComponent 가 Lit 클래스에서 자동으로 끌어온다.
  이벤트만 손으로 적는다 — 그래서 scripts/check-events.mjs 가 이 파일과
  컴포넌트의 dispatchEvent 를 대조한다.
*/

export const NsHeader = createComponent({
  react: React,
  tagName: "ns-header",
  elementClass: NsHeaderElement,
  events: { onNsToggle: "ns-toggle" },
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
  events: { onNsNavigate: "ns-navigate" },
});

export const NsNavGroup = createComponent({
  react: React,
  tagName: "ns-nav-group",
  elementClass: NsNavGroupElement,
  events: { onNsNavigate: "ns-navigate" },
});

export const NsNavItem = createComponent({
  react: React,
  tagName: "ns-nav-item",
  elementClass: NsNavItemElement,
  events: { onNsNavigate: "ns-navigate" },
});

export type { NsToggleDetail, NsNavigateDetail } from "../types.js";
