/*
  소비자 관점의 타입 검사 파일.

  React 래퍼(src/react/elements.ts)의 이벤트 핸들러 타입은 라이브러리 내부의
  npm run check(tsc -p tsconfig.json) 로는 볼 수 없다 — 그 안에서는
  events 값이 그냥 문자열이라 EventName<> 브랜딩이 빠져도 통과한다.
  이 파일은 "@neosimplix/common-ui/react" 를 실제로 설치해 쓰는 소비자
  프로젝트를 흉내 내어, tsconfig.consumer.json 을 통해 별도로 타입 검사된다.

  아래 JSX 의 뼈대(NsHeader / Sidebar / NsNavGroup / NsNavItem)는 guide.html 의
  "환경별 연동 → Next.js (App Router)" 절 예시를 옮긴 것이고, 그 안에 다른 절의
  React 예시(Dialog · Field · Select · Checkbox · Card · NsTable · NsPagination
  등)를 한 셸 안에 모아 넣었다. next/navigation, UserMenu 등 Next 전용 부분만
  최소 스텁으로 대체했다(이 패키지는 next 에 의존하지 않는다).

  **이 파일은 guide.html 의 스니펫을 통째로 검사하지 않는다.** 문서의
  <script type="text/plain"> 안은 tsc 가 보지 않고, 여기 옮겨 적힌 것만 검사된다.
  둘이 갈라지면 문서 쪽만 컴파일되지 않는 상태가 조용히 생긴다 — 실제로
  ns-table 의 React 예시가 `useState({ direction: "none" as const })` 로 갈라져
  있다가 소비자의 첫 빌드에서 막히는 형태로 발견됐다. 그래서 정렬 상태는
  guide.html 의 ns-table 절과 **같은 형태**(useState<NsSortDetail> +
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
  nsToastPosition,
  registerIcons,
  svg,
  tabIdFor,
} from "../src/react/index.js";
import type { NsDialogCloseReason, NsSortDetail, NsToastPosition } from "../src/react/index.js";

/*
  토스트 위치는 리전 하나의 성질이라 전역 설정이다. 소비자는 앱이 뜰 때 한 번 부른다.
  타입도 함께 내보내는지가 여기서 검사된다 — 값만 내보내고 타입을 빠뜨리면 소비자가
  이 상수에 이름을 붙일 수 없다.
*/
const TOAST_POSITION: NsToastPosition = "bottom-right";

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

/*
  후보 목록은 모듈 상수다. 인라인 배열 리터럴로 넘기면 렌더마다 새 배열이 되고,
  options 는 반응형 프로퍼티라 그때마다 ns-multi-select 가 다시 렌더된다.
  guide.html 의 React 예시가 같은 이유로 OWNERS 를 밖에 둔다.

  value 는 유일해야 한다 — 목록과 칩 줄의 렌더 키다.
*/
const OWNERS = [
  { value: "kim", label: "김담당", meta: "플랫폼개발팀" },
  { value: "park", label: "박승인", meta: "마케팅팀" },
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
  // 이벤트 타입을 검사한다. ns-group-toggle 도 여기서 검사된다. 같은 이벤트를 가진
  // 세 번째 래퍼 NsSidebarBase 는 비공개라 이 파일이 닿을 수 없고, 그쪽은
  // src/react/tags/Sidebar.tsx 의 shim 이 onNsNavigate={(e) => onNavigate?.(e.detail)}
  // 로 같은 방어를 한다.
  // (사이드바에서 한 번만 듣는 것도 여전히 유효한 패턴이다. guide.html 의 각
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
          <NsNavGroup
            heading="프로젝트"
            onNsNavigate={(e) => log(e.detail.label)}
            /*
              detail 을 실제로 읽는다. 인자 0개짜리 핸들러는 EventName<> 캐스트
              누락을 감추므로 e.detail.open 까지 내려가야 검사가 성립한다.
            */
            onNsGroupToggle={(e) => log(String(e.detail.open))}
          >
            <NsNavItem
              href="/a"
              label="프로젝트 A"
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
        {/*
          비제어. defaultOpen 은 **초깃값 전용**이다 — ns-sidebar 는 자기를 여닫는
          버튼을 갖지 않으므로 그 뒤로 상태를 바꾸는 것은 소비자다. 여닫게 하려면
          위 제어 모드처럼 ns-header 의 onNsToggle 을 받아 open 에 내려준다.
        */}
        <Sidebar defaultOpen onNavigate={(d) => router.push(d.href)}>
          {/*
            하위 카테고리. collapsible 은 **단을 가리지 않는다** — 최상위 그룹에
            쓰면 그 그룹이 통째로 접혀 긴 네비게이션을 가장 크게 줄이고(이 저장소
            guide.html 의 좌측 네비게이션이 그렇게 돼 있다), 하위 그룹에 쓰면 그
            카테고리만 접힌다. 0.5.0 개발 중에 한동안 "최상위가 아니라 하위에
            쓴다" 고 안내했으나 그것은 패널에 그룹 하나만 보이던 레일 시절의
            것이고, 지금은 최상위가 오히려 주 용도다.

            여기서 하위에만 붙인 것은 아래 핸들러가 composed 경로를 검사하기
            때문이다 — ns-group-toggle 은 하위에서 올린 것도 최상위 그룹의 이
            핸들러에 도착하고, e.detail.open 을 실제로 읽어 그 경로가 타입으로
            성립하는지 확인하는 자리다.
          */}
          <NsNavGroup heading="관리" onNsGroupToggle={(e) => log(String(e.detail.open))}>
            <NsNavGroup heading="사용자" collapsible>
              <NsNavItem href="/users" label="목록" />
            </NsNavGroup>
            <NsNavItem href="/logs" label="로그" />
          </NsNavGroup>
        </Sidebar>
        <main>
          <Card>
            <PageHeading title="사용자" description="가입 신청을 승인하고 권한을 관리합니다." />
            <NsSkeleton width="10rem" height="2.25rem" radius="pill" />
            {children}
            {/*
              ④ 회귀 바: Field.error 와 자식의 invalid 가 서로를 죽이지 않는지.
              타입 검사만으로는 aria-invalid 의 계산 결과를 볼 수 없으므로, 여기서는
              아래 네 Field 조합이 전부 렌더 트리 안에서 컴파일되는 것까지가 이
              파일의 몫이다. 병합 결과는 Step 6 의 프로브가 본다.
            */}
            <Field label="이메일" error="@neosimplix.com 계정만 사용할 수 있습니다.">
              {/* 1/4: error 가 있으면 자식이 invalid={false} 를 명시해도 오류가 이긴다. */}
              <Input value="" onChange={(e) => log(e.target.value)} invalid={false} />
            </Field>
            <Field label="이름">
              {/* 2/4: error 가 없으면 자식의 invalid 가 그대로 나간다. */}
              <Input value="" onChange={(e) => log(e.target.value)} invalid />
            </Field>
            <Field label="직급" hint="관리자 승인 후 반영됩니다">
              <Select
                value=""
                onChange={(e) => log(e.target.value)}
                placeholder="직급을 선택하세요"
                options={[{ value: "senior", label: "선임" }]}
              />
            </Field>
            <Field label="분류" error="필수입니다">
              {/* 4/4: Select 도 같은 처치를 받는다. */}
              <Select
                onChange={(e) => log(e.target.value)}
                options={[{ value: "senior", label: "선임" }]}
                invalid={false}
              />
            </Field>
            <Field label="메모" error="필수입니다">
              {/* 3/4: Textarea 도 같은 처치를 받는다. */}
              <Textarea value="" onChange={(e) => log(e.target.value)} rows={6} invalid={false} />
            </Field>
            {/* ② 회귀 바: 같은 패키지의 두 export 가 조합되는지. */}
            <Field label="담당자">
              <NsMultiSelect options={[]} value={[]} />
            </Field>
            <Field label="담당자" error="필수입니다">
              <NsMultiSelect options={[]} value={[]} />
            </Field>
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
            <Button
              size="sm"
              onClick={() => {
                nsToastPosition(TOAST_POSITION);
                nsToast("저장했습니다", { tone: "success" });
              }}
            >
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
            <NsTable>
              <table className="ns-table ns-table--rows-clickable">
                <tbody>
                  <tr onClick={() => log("open detail")}>
                    <td>
                      <button
                        className="ns-table__row-button"
                        type="button"
                        aria-haspopup="dialog"
                      >
                        글로벌 인플루언서 마케팅
                      </button>
                    </td>
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
              options={OWNERS}
              value={owners}
              onNsMultiSelectChange={(e) => setOwners(e.detail.values)}
              searchPlaceholder="이름으로 검색"
            />
            {/* ③ 회귀 바: 안쪽 input 의 aria-invalid 를 세울 통로가 있는지. */}
            <NsMultiSelect options={[]} value={[]} inputInvalid />
            {/*
              ⑤ 회귀 바: children?: never 가 살아있는지. elements.ts 의
              withoutChildren 이 만드는 보장은 "자식을 주면 컴파일이 실패한다"
              는 음성 명제라, 이 파일의 다른 예시가 전부 자식 없는 정상 사용인
              것만으로는 npm run check 가 이 성질을 보지 못한다 — withoutChildren
              을 네 래퍼 중 하나에서만 지워도 이 파일은 통째로 초록으로 남는다.

              아래 넷(NsSkeleton·NsPagination·NsMultiSelect·PageHeading)은 일부러
              자식을 주는, 틀린 사용이다. JSX 안의 주석이라도 `@ts-expect-error`
              는 tsc 가 진짜 지시문으로 강제한다 — 그 자리에서 에러가 나지
              않으면(지시문이 unused 가 되면) TS2578 로 컴파일이 실패한다. 즉
              children?: never 가 없어지면 여기서 먼저 무너진다. 자식은 렌더에
              아무것도 남기지 않는 {false} 를 썼다 — 여전히 자식 에러를 낸다.
            */}
            <NsSkeleton width="1rem" height="1rem">
              {/* @ts-expect-error 자식을 받지 않는다 — 이 지시문이 unused 가 되면 제약이 풀린 것이다 */}
              {false}
            </NsSkeleton>
            <NsPagination total={1} perPage={20}>
              {/* @ts-expect-error 자식을 받지 않는다 — 이 지시문이 unused 가 되면 제약이 풀린 것이다 */}
              {false}
            </NsPagination>
            <NsMultiSelect options={[]} value={[]}>
              {/* @ts-expect-error 자식을 받지 않는다 — 이 지시문이 unused 가 되면 제약이 풀린 것이다 */}
              {false}
            </NsMultiSelect>
            <PageHeading title="회귀 바 전용">
              {/* @ts-expect-error 자식을 받지 않는다 — 이 지시문이 unused 가 되면 제약이 풀린 것이다 */}
              {false}
            </PageHeading>
            <div style={{ display: "flex", height: "6rem" }}>
              <Message>표시할 항목이 없습니다.</Message>
            </div>
            {/*
              머리 있는 형태. 바깥의 <Card> 가 프롭 없이 그대로 컴파일되는 것이
              「heading 이 없으면 예전과 같다」의 검사이고, 이쪽이 새 갈래의 검사다.
            */}
            <Card
              heading="최근 주문"
              description="최근 30일"
              headingLevel={3}
              actions={<ButtonLink href="/orders" variant="ghost" size="sm">전체 보기</ButtonLink>}
            >
              <p>본문</p>
            </Card>
          </Card>
        </main>
      </div>
    </>
  );
}
