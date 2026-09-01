import * as React from "react";
import { createComponent, type EventName, type ReactWebComponent } from "@lit/react";

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

/*
  createComponent 의 반환 타입 ReactWebComponent<I, E> 는 WebComponentProps 를
  거쳐 React.HTMLAttributes 를 그대로 물려받으므로 children 을 받는 타입이다.
  자식을 받지 못하는 래퍼(NsPagination·NsSkeleton·NsMultiSelect)는 이 유틸로
  감싸 children 을 never 로 좁힌다. Select.tsx 의 Omit<..., "children"> 과 같은
  목적이고, 여기서는 createComponent 의 반환 타입을 직접 손으로 다시 적지
  않기 위해 제네릭 함수로 뺐다 — I·E 는 인자에서 그대로 추론된다.

  런타임은 넘어온 컴포넌트를 그대로 반환한다. 타입만의 캐스트이고 동작은
  바뀌지 않는다.
*/
type NoChildren<C> = C extends React.ForwardRefExoticComponent<infer P>
  ? React.ForwardRefExoticComponent<Omit<P, "children"> & { children?: never }>
  : never;

function withoutChildren<I extends HTMLElement, E extends Record<string, EventName | string>>(
  component: ReactWebComponent<I, E>,
): NoChildren<ReactWebComponent<I, E>> {
  return component as NoChildren<ReactWebComponent<I, E>>;
}

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

  통로는 하나가 아니라 둘이고 서로 다른 구간을 덮는다. data-ns-open 은 제어
  경로(open 을 준 경우)의 upgrade 전 폭을 잡고, default-open 은 비제어 경로와
  제어 경로의 upgrade~hydration 구간을 덮는다 — defaultOpen 도 반응형
  프로퍼티라 같은 처방을 받는다. 어느 이름이 무엇을 덮는지는 tags/Sidebar.tsx
  의 shim docstring 에 있다.
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

/*
  자식을 받지 않는다. shadow 에 슬롯이 없어 자식이 조용히 사라진다 —
  에러가 없어서 오히려 알아채기 어렵다.
*/
export const NsSkeleton = withoutChildren(
  createComponent({
    react: React,
    tagName: "ns-skeleton",
    elementClass: NsSkeletonElement,
    events: {},
  }),
);

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

/*
  자식을 받지 않는다. Light DOM 에 자기 템플릿을 렌더하므로 React 가 넣은
  자식과 다투다 removeChild 계열 런타임 에러가 난다. guide.html 이 이미
  경고하던 것을 타입이 막는다.
*/
export const NsPagination = withoutChildren(
  createComponent({
    react: React,
    tagName: "ns-pagination",
    elementClass: NsPaginationElement,
    events: {
      // EventName<> 브랜딩이 없으면 핸들러가 (e: Event) => void 로 타입된다.
      onNsPageChange: "ns-page-change" as EventName<CustomEvent<NsPageChangeDetail>>,
    },
  }),
);

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
  자식을 받지 않는다. Light DOM 에 자기 템플릿을 렌더하므로 React 가 넣은
  자식과 다투다 removeChild 계열 런타임 에러가 난다. guide.html 의
  ns-multi-select 절은 Light DOM 이라는 사실만 적을 뿐 자식 경고는 없다 —
  ns-pagination 과 달리 문서가 먼저 경고하던 것을 타입이 뒤따르는 게 아니라,
  이 제약은 여기서 처음 생긴다.

  shim 이 필요 없다. options·value 어느 것도 HTML 전역 속성과 충돌하지 않으므로
  평범한 래퍼를 그대로 공개한다 — 그래서 EventName<> 검사가 고전적인 경로로
  동작한다(docs/consumer-example.tsx 가 e.detail 을 직접 읽는다).

  Field 가 이 래퍼를 만났을 때 무엇을 주입해야 하는지 여기 적는다. Field 는
  래퍼를 import 하지 않고 element.type 에서 이 값을 읽으므로, 새 커스텀
  엘리먼트 컨트롤이 생겨도 Field 를 고치지 않는다 — 지식이 래퍼 옆에 남는다.

  하이픈으로 판별할 수 없기 때문에 마커가 필요하다. createComponent 는
  forwardRef 객체를 반환하므로 element.type 이 문자열이 아니다.

  describedby 가 오류 id 까지 받는다. ns-multi-select 에는 aria-errormessage
  의 짝이 없고, 그 속성은 스크린리더 지원이 고르지 않아 describedby 가 오히려
  더 안정적으로 읽힌다 — 네이티브 경로와 생기는 속성이 달라지는 것은 의도다.

  satisfies Record<"id" | "describedby" | "invalid", keyof NsMultiSelectElement>
  로 값을 제약한다. 이게 없으면 오타(describedBy, "inputID" 등)가 여기와
  Field.tsx 양쪽에서 조용히 컴파일된다 — Field 는 이 값을 그대로 프로퍼티
  이름으로 써서 cloneElement 에 넘기므로, 존재하지 않는 프로퍼티 이름이면
  @lit/react 가 undefined="…" 같은 정크 속성을 렌더하고 아무 경고도 없다.
*/
export const NsMultiSelect = Object.assign(
  withoutChildren(
    createComponent({
      react: React,
      tagName: "ns-multi-select",
      elementClass: NsMultiSelectElement,
      events: {
        // EventName<> 브랜딩이 없으면 핸들러가 (e: Event) => void 로 타입된다.
        onNsMultiSelectChange:
          "ns-multi-select-change" as EventName<CustomEvent<NsMultiSelectChangeDetail>>,
      },
    }),
  ),
  {
    nsFieldControl: {
      id: "inputId",
      describedby: "inputDescribedby",
      invalid: "inputInvalid",
    } satisfies Record<"id" | "describedby" | "invalid", keyof NsMultiSelectElement>,
  },
);
