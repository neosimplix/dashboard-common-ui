/*
  소비자 관점의 타입 검사 파일.

  React 래퍼(src/react/elements.ts)의 이벤트 핸들러 타입은 라이브러리 내부의
  npm run check(tsc -p tsconfig.json) 로는 볼 수 없다 — 그 안에서는
  events 값이 그냥 문자열이라 EventName<> 브랜딩이 빠져도 통과한다.
  이 파일은 "@neosimplix/common-ui/react" 를 실제로 설치해 쓰는 소비자
  프로젝트를 흉내 내어, tsconfig.consumer.json 을 통해 별도로 타입 검사된다.

  아래 JSX 의 뼈대(NsHeader / Sidebar / NsNavGroup / NsNavItem)는 index.html 의
  "환경별 연동 → Next.js (App Router)" 절 예시를 옮긴 것이고, 그 안에 다른 절의
  React 예시(Dialog · Field · Select · Checkbox · Card · NsTable · NsPagination
  등)를 한 셸 안에 모아 넣었다. next/navigation, UserMenu 등 Next 전용 부분만
  최소 스텁으로 대체했다(이 패키지는 next 에 의존하지 않는다).

  **이 파일은 index.html 의 스니펫을 통째로 검사하지 않는다.** 문서의
  <script type="text/plain"> 안은 tsc 가 보지 않고, 여기 옮겨 적힌 것만 검사된다.
  둘이 갈라지면 문서 쪽만 컴파일되지 않는 상태가 조용히 생긴다 — 실제로
  ns-table 의 React 예시가 `useState({ direction: "none" as const })` 로 갈라져
  있다가 소비자의 첫 빌드에서 막히는 형태로 발견됐다. 그래서 정렬 상태는
  index.html 의 ns-table 절과 **같은 형태**(useState<NsSortDetail> +
  setSort(e.detail))로 적어 둔다. 예시를 고칠 때는 양쪽을 같이 본다.
*/
import * as React from "react";
import { useState } from "react";
import {
  Button,
  ButtonLink,
  Card,
  Checkbox,
  Dialog,
  Field,
  Input,
  NsHeader,
  NsIcon,
  NsNavGroup,
  NsNavItem,
  NsPagination,
  NsSkeleton,
  NsTable,
  PageHeading,
  Select,
  Sidebar,
  Textarea,
} from "../src/react/index.js";
import type { NsDialogCloseReason, NsSortDetail } from "../src/react/index.js";

// Next.js 없이 타입 검사만 하기 위한 최소 스텁.
declare function usePathname(): string;
declare function useRouter(): { push(href: string): void };
declare function UserMenu(): React.ReactElement;

export function Shell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  // ns-navigate 는 composed 라 그룹에서도, 항목에서도 들을 수 있다 — 아래는
  // 그 두 지점 모두에서 detail 을 실제로 읽어, 네 래퍼 전부의 이벤트 타입이
  // 이 파일에서 검사되게 한다(사이드바에서 한 번만 듣는 것도 여전히 유효한
  // 패턴이다. index.html 의 각 컴포넌트 절 참고).
  const log = (msg: string) => console.log(msg);

  const [dialogOpen, setDialogOpen] = useState(false);

  const [sort, setSort] = useState<NsSortDetail>({ key: "", direction: "none" });

  const [rows, setRows] = useState<string[]>([]);

  const [page, setPage] = useState(1);

  // reason 을 실제로 읽어 detail 타입이 검사되게 한다.
  const onDialogClose = (reason: NsDialogCloseReason) => {
    log(`closed by ${reason}`);
    setDialogOpen(false);
  };

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
        <Sidebar open={open} onNavigate={(d) => router.push(d.href)}>
          <NsNavGroup heading="프로젝트" onNsNavigate={(e) => log(e.detail.label)}>
            <NsNavItem
              href="/a"
              label="프로젝트 A"
              badge="PA"
              active={pathname === "/a"}
              onNsNavigate={(e) => log(e.detail.href)}
            />
            <NsNavItem href="/b" label="프로젝트 B" onNsNavigate={(e) => log(e.detail.href)}>
              <NsIcon slot="leading" name="menu" />
            </NsNavItem>
          </NsNavGroup>
        </Sidebar>
        <main>
          <Card>
            <PageHeading title="사용자" description="가입 신청을 승인하고 권한을 관리합니다." />
            <NsSkeleton width="10rem" height="2.25rem" radius="pill" />
            {children}
            <Input value="" onChange={(e) => log(e.target.value)} invalid />
            <Field label="이메일" error="@neosimplix.com 계정만 사용할 수 있습니다.">
              <Input value="" onChange={(e) => log(e.target.value)} />
            </Field>
            <Field label="직급" hint="관리자 승인 후 반영됩니다">
              <Select
                value=""
                onChange={(e) => log(e.target.value)}
                placeholder="직급을 선택하세요"
                options={[{ value: "senior", label: "선임" }]}
              />
            </Field>
            <Textarea value="" onChange={(e) => log(e.target.value)} rows={6} />
            <Checkbox
              label="사용자 목록 조회"
              hint="부서 기본"
              checked
              onChange={(e) => log(String(e.target.checked))}
            />
            <Button variant="icon" aria-label="메뉴 열기" onClick={() => log("toggle")}>
              <NsIcon name="menu" />
            </Button>
            <ButtonLink href="/login" variant="outline" fullWidth>로그인</ButtonLink>
            <Dialog
              open={dialogOpen}
              title="사용자 승인"
              onClose={onDialogClose}
              footer={<Button size="sm" onClick={() => setDialogOpen(false)}>확인</Button>}
            >
              <p>승인하시겠습니까?</p>
            </Dialog>
            <NsTable
              sortKey={sort.key}
              sortDirection={sort.direction}
              selected={rows}
              onNsSort={(e) => setSort(e.detail)}
              onNsSelectChange={(e) => setRows(e.detail.ids)}
            >
              <table className="ns-table">
                <thead>
                  <tr>
                    <th>
                      <label className="ns-checkbox">
                        <input type="checkbox" data-ns-select-all />
                      </label>
                    </th>
                    <th data-ns-sort-key="name">
                      <button className="ns-table__sort" type="button">이름</button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <label className="ns-checkbox">
                        <input type="checkbox" data-ns-row-id="a" checked={rows.includes("a")} readOnly />
                      </label>
                    </td>
                    <td>{sort.direction}</td>
                  </tr>
                </tbody>
              </table>
            </NsTable>
            <NsPagination
              total={240}
              perPage={20}
              page={page}
              onNsPageChange={(e) => setPage(e.detail.page)}
            />
          </Card>
        </main>
      </div>
    </>
  );
}
