/*
  소비자 관점의 타입 검사 파일.

  React 래퍼(src/react/index.ts)의 이벤트 핸들러 타입은 라이브러리 내부의
  npm run check(tsc -p tsconfig.json) 로는 볼 수 없다 — 그 안에서는
  events 값이 그냥 문자열이라 EventName<> 브랜딩이 빠져도 통과한다.
  이 파일은 "@neosimplix/common-ui/react" 를 실제로 설치해 쓰는 소비자
  프로젝트를 흉내 내어, tsconfig.consumer.json 을 통해 별도로 타입 검사된다.

  아래 JSX 는 index.html 의 "환경별 연동 → Next.js (App Router)" 절 예시를
  그대로 옮긴 것이다 — 문서가 배포하는 것과 정확히 같은 코드를 검사하기
  위해서다. next/navigation, UserMenu 등 Next 전용 부분만 최소 스텁으로
  대체했다(이 패키지는 next 에 의존하지 않는다).
*/
import * as React from "react";
import { useState } from "react";
import { NsHeader, NsSidebar, NsNavGroup, NsNavItem } from "../src/react/index.js";

// Next.js 없이 타입 검사만 하기 위한 최소 스텁.
declare function usePathname(): string;
declare function useRouter(): { push(href: string): void };
declare function UserMenu(): React.ReactElement;

export function Shell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  return (
    <>
      <NsHeader
        projectName="대시보드"
        sidebarOpen={open}
        onNsToggle={(e) => setOpen(e.detail.open)}
      >
        <div slot="actions">
          <UserMenu />
        </div>
      </NsHeader>
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <NsSidebar open={open} onNsNavigate={(e) => router.push(e.detail.href)}>
          <NsNavGroup heading="프로젝트">
            <NsNavItem
              href="/a"
              label="프로젝트 A"
              badge="PA"
              active={pathname === "/a"}
            />
          </NsNavGroup>
        </NsSidebar>
        <main>{children}</main>
      </div>
    </>
  );
}
