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
  Accordion,
  Button,
  ButtonLink,
  Card,
  Checkbox,
  Chip,
  Dialog,
  Field,
  Input,
  Message,
  NsHeader,
  NsIcon,
  NsMultiSelect,
  NsNavGroup,
  NsNavItem,
  NsPagination,
  NsSkeleton,
  NsTable,
  NsTabs,
  PageHeading,
  Select,
  Sidebar,
  Textarea,
  nsConfirm,
  nsToast,
  registerIcons,
  svg,
  tabIdFor,
} from "../src/react/index.js";
import type { NsDialogCloseReason, NsSortDetail } from "../src/react/index.js";

/*
  스프라이트 등록. 소비자가 실제로 쓰는 형태 그대로 — 이 경로 하나만
  import 하고, lit 을 직접 의존하지 않으며, svg 도 여기서 받는다.
  IconDef 의 두 필드가 갖춰졌는지는 tsc 가 본다.

  모듈 최상단에 두는 것이 규약이다. 컴포넌트 안에서 부르면 첫 렌더보다
  늦어 그 렌더의 아이콘이 빈 채로 남는다.
*/
registerIcons({
  chart: {
    viewBox: "0 0 20 20",
    content: svg`
      <path
        d="M3 17V9m5 8V4m5 13v-6m4 6V7"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
      />
    `,
  },
});

/*
  탭과 패널의 짝을 한 곳에 둔다. 탭 버튼의 data-ns-panel 과 패널의 id 가 같은
  문자열에서 나오므로 어긋날 수 없다 — tabIdFor 의 주석이 말하는 그 이유다.
  패널 id 를 상태로 조립하면(`panel-${tab}`) 활성이 아닌 탭의 aria-controls 가
  실재하지 않는 id 를 가리켜 둘 중 하나는 항상 끊어진다.
*/
const TABS = [
  { id: "live", panel: "panel-live", label: "운영 중" },
  { id: "requests", panel: "panel-requests", label: "신청", count: 3 },
];

// Next.js 없이 타입 검사만 하기 위한 최소 스텁.
declare function usePathname(): string;
declare function useRouter(): { push(href: string): void };
declare function UserMenu(): React.ReactElement;

export function Shell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  // ns-navigate 는 composed 라 그룹에서도, 항목에서도 들을 수 있다 — 아래는
  // 그 두 지점 모두에서 detail 을 실제로 읽어 NsNavGroup·NsNavItem 두 래퍼의
  // 이벤트 타입을 검사한다. 같은 이벤트를 가진 세 번째 래퍼 NsSidebarBase 는
  // 비공개라 이 파일이 닿을 수 없고, 그쪽은 src/react/tags/Sidebar.tsx 의 shim 이
  // onNsNavigate={(e) => onNavigate?.(e.detail)} 로 같은 방어를 한다.
  // (사이드바에서 한 번만 듣는 것도 여전히 유효한 패턴이다. index.html 의 각
  // 컴포넌트 절 참고.)
  const log = (msg: string) => console.log(msg);

  const [dialogOpen, setDialogOpen] = useState(false);

  const [sort, setSort] = useState<NsSortDetail>({ key: "", direction: "none" });

  const [rows, setRows] = useState<string[]>([]);

  const [page, setPage] = useState(1);

  const [tab, setTab] = useState("live");

  const [owners, setOwners] = useState<string[]>(["kim"]);

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
              {/* 위에서 registerIcons 로 더한 이름. 스프라이트 기본 셋에는 없다. */}
              <NsIcon slot="leading" name="chart" />
            </NsNavItem>
            <NsNavItem href="/c" label="프로젝트 C" onNsNavigate={(e) => log(e.detail.href)}>
              {/*
                등록 없이 자식으로 직접 넣는 길. 실제 소비자는 여기에
                <House /> 같은 lucide-react 컴포넌트를 넣는다 — 이 패키지는
                lucide 에 의존하지 않으므로 여기서는 svg 를 그대로 적는다.
                width="24" 는 ::slotted 규칙이 --ns-icon-size 로 덮는다.
              */}
              <NsIcon slot="leading">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
                  <path d="M3 17V9m5 8V4m5 13v-6m4 6V7" stroke="currentColor" strokeWidth="2" />
                </svg>
              </NsIcon>
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
            <Accordion title="권한" summary="3개" defaultOpen>
              <Checkbox label="가입 승인" defaultChecked />
            </Accordion>
            <Accordion variant="plain" title="관리자 로그인">
              <Input value="" onChange={(e) => log(e.target.value)} />
            </Accordion>
            <Checkbox
              label="사용자 목록 조회"
              hint="부서 기본"
              checked
              onChange={(e) => log(String(e.target.checked))}
            />
            <Chip selected onClick={() => log("toggle")}>마케팅팀</Chip>
            <Chip onRemove={() => log("remove")} removeLabel="박승인 제거">박승인</Chip>
            <Chip>공지</Chip>
            <Button variant="icon" aria-label="메뉴 열기" onClick={() => log("toggle")}>
              <NsIcon name="menu" />
            </Button>
            <ButtonLink href="/login" variant="outline" fullWidth>로그인</ButtonLink>
            <Button
              variant="danger"
              size="sm"
              onClick={async () => {
                if (await nsConfirm({ heading: "삭제", message: "되돌릴 수 없습니다.", tone: "danger" })) {
                  log("deleted");
                }
              }}
            >
              삭제
            </Button>
            {/*
              명령형 API 다. 래퍼가 없으므로 이벤트 핸들러에서 그대로 부른다 —
              소비자 관점에서 import 경로와 인자 타입이 맞는지가 여기서 검사된다.
            */}
            <Button size="sm" onClick={() => nsToast("저장했습니다", { tone: "success" })}>
              저장
            </Button>
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
            {/*
              행 클릭. 핸들러는 <tr> 에만 있다 — RowButton 에 또 붙이면
              Enter·Space 가 낸 click 이 버블링해 한 번에 두 번 돈다.
            */}
            <table className="ns-table ns-table--rows-clickable">
              <tbody>
                <tr onClick={() => log("open detail")}>
                  <td>
                    <button className="ns-table__row-button" type="button" aria-haspopup="dialog">
                      글로벌 인플루언서 마케팅
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <NsPagination
              total={240}
              perPage={20}
              page={page}
              onNsPageChange={(e) => setPage(e.detail.page)}
            />
            {/* e.detail 을 실제로 읽어 ns-tab-change 의 detail 타입이 검사되게 한다. */}
            <NsTabs aria-label="관리자 목록" active={tab} onNsTabChange={(e) => setTab(e.detail.id)}>
              {TABS.map((t) => (
                <button key={t.id} type="button" data-ns-tab={t.id} data-ns-panel={t.panel}>
                  {t.label}
                  {t.count !== undefined && <span className="ns-tabs__count">{t.count}</span>}
                </button>
              ))}
            </NsTabs>
            {/* 탭마다 패널이 하나씩 있고 보이는 것만 고른다. */}
            {TABS.map((t) => (
              <div
                key={t.panel}
                id={t.panel}
                role="tabpanel"
                aria-labelledby={tabIdFor(t.panel)}
                tabIndex={0}
                hidden={tab !== t.id}
              >
                {t.label} 패널
              </div>
            ))}
            {/* e.detail 을 실제로 읽어 ns-multi-select-change 의 detail 타입이 검사되게 한다. */}
            <NsMultiSelect
              options={[
                { value: "kim", label: "김담당", meta: "플랫폼개발팀" },
                { value: "park", label: "박승인", meta: "마케팅팀" },
              ]}
              value={owners}
              onNsMultiSelectChange={(e) => setOwners(e.detail.values)}
              searchPlaceholder="이름으로 검색"
            />
            <div style={{ display: "flex", height: "6rem" }}>
              <Message>표시할 항목이 없습니다.</Message>
            </div>
          </Card>
        </main>
      </div>
    </>
  );
}
