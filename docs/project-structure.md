# 프로젝트 구조와 실행

`common-ui` 는 Next.js · React 18/19 · 순수 HTML 에서 동일하게 쓰는 대시보드 셸 웹 컴포넌트 라이브러리다.

## 무엇을 제공하나

| 태그 | 역할 |
|---|---|
| `ns-header` | 좌측 토글 버튼과 프로젝트 이름, 우측 `actions` slot |
| `ns-sidebar` | 네비게이션 컨테이너. 접으면 좌측에 4rem 레일이 남는다 |
| `ns-nav-group` | 제목이 붙은 네비게이션 그룹 |
| `ns-nav-item` | 그룹 하위 항목. 행 좌측에 `leading` slot(비우면 `badge` 폴백), 우측에 `trailing` slot |
| `ns-icon` | 이름으로 꺼내는 인라인 SVG |
| `ns-page-heading` | `h1` + 설명 `p` |
| `ns-skeleton` | 로딩 자리표시자. 크기를 프로퍼티로 받는다 |
| `ns-dialog` | 네이티브 `dialog` 모달. 제어/비제어 |
| `ns-table` | 소비자 `table` 을 감싸는 Light DOM. 정렬 상태 · 전체 선택 3-상태. **셀을 렌더하지 않는다** |
| `ns-pagination` | Light DOM. `.ns-button` 을 재사용한 페이지 이동 컨트롤 |

| 클래스 | 붙이는 요소 |
|---|---|
| `.ns-button` | `button` · `a` |
| `.ns-input` `.ns-select` `.ns-textarea` | 같은 이름의 네이티브 컨트롤 |
| `.ns-checkbox` | `label` (내부에 `input[type=checkbox]`) |
| `.ns-field` | `div`. `__label` `__hint` `__error` 를 함께 쓴다 |
| `.ns-card` | `div` |
| `.ns-table` | `table`. `th`/`td` 는 자손 선택자 |
| `.ns-table__sort` | `th` 안의 `button` |

**태그와 클래스를 가르는 기준은 두 줄이다.** 캡슐화할 행동이 있으면 태그, 만들어 줄 마크업이 있으면 태그, 둘 다 아니면 클래스다. 폼 컨트롤과 버튼이 클래스인 이유는 `docs/gotchas.md` 의 "FACE 를 쓰지 않은 이유" 에 있다.

이벤트는 여섯이다. `ns-toggle`(`{ open }`), `ns-navigate`(`{ href, label }`), `ns-dialog-close`(`{ reason }`, 위 태그 표 참고), `ns-sort`(`{ key, direction }`), `ns-select-change`(`{ ids }`), `ns-page-change`(`{ page }`). 전부 `bubbles: true, composed: true` 라 shadow 경계를 넘어 소비자에게 도달한다. **라우팅은 하지 않는다** — 이벤트만 올리고 각 프로젝트가 처리한다.

## 왜 이런 구조인가

**npm 레지스트리를 쓰지 않는다.** private 레지스트리는 유료이므로 git 태그로 배포한다. 소비자는 `git+ssh://…#v0.1.3` 한 줄로 설치한다. npm 이 그 태그의 저장소를 clone 해서 `files` 가 고르는 것만 가져가므로, **`dist/` 가 태그 커밋에 물리적으로 존재해야 한다.** 하지만 `main` 은 빌드 산출물 없이 유지해야 한다. 태그는 이미 있는 커밋에 파일을 더할 수 없으므로, 릴리스 스크립트가 detached HEAD 에서 `dist/` 를 포함한 커밋을 새로 만들고 거기에 태그를 붙인다.

**모노레포를 쓰지 않는다.** 이전 시도(`shared-ui`)가 pnpm workspace 였고, git 의존성으로 설치가 되지 않아 폐기됐다. 단일 패키지에 `exports` 서브패스로 나눈다.

**테스트 러너를 두지 않는다.** 같은 시도가 검증 하네스 복잡도 때문에도 폐기됐다. 회귀 확인은 `npm run check` 와 `index.html` 육안 확인이다. 문서 페이지의 헤더와 좌측 네비게이션이 이 라이브러리의 컴포넌트로 만들어져 있어서, 깨지면 문서가 열리지 않는 것으로 즉시 드러난다.

**폼 컨트롤을 웹 컴포넌트로 만들지 않는다.** shadow DOM 이 폼 참여·라벨·검증·자동완성을 끊고, FACE 로 되살려도 "JS 없이 동작한다"는 성질은 돌아오지 않는다. 근거는 `docs/gotchas.md` 에 있다.

**표는 데이터가 아니라 컨트롤을 소유한다.** 실사용 셀에 조건부 버튼 여섯과 참조 조회가 들어 있어 데이터 주입형 API 로 표현되지 않고, Lit 엘리먼트는 소비자의 React 렌더 함수를 호출할 수 없다. 그래서 `ns-table` 은 정렬 · 선택 **상태**만 갖고 셀 마크업은 소비자가 쓴다. 근거는 `docs/superpowers/specs/2026-08-13-ns-table-design.md` §1~2 에 있다.

## 디렉터리

```
common-ui/
├── src/
│   ├── tokens/tokens.css              디자인 토큰 + 다크모드 신호. Tailwind 비의존. 손으로 쓰는 정적 파일
│   ├── controls/controls.css          .ns-* 클래스. @layer ns-controls. 손으로 쓰는 정적 파일
│   ├── internal/
│   │   ├── register.ts                SSR 안전 customElements.define
│   │   └── warn-missing-tokens.ts     tokens.css 미로드 경고(페이지당 1회)
│   ├── components/<name>/
│   │   ├── ns-<name>.ts               Lit 엘리먼트 + 등록 + 태그 타입 선언
│   │   └── ns-<name>.styles.ts        shadow CSS (css`` 템플릿, .css 파일 아님)
│   ├── components/table/ns-table.ts            ReactiveElement. .styles.ts 가 없다(Light DOM)
│   ├── components/pagination/ns-pagination.ts  LitElement + light DOM 렌더
│   ├── types.ts                       이벤트 detail 타입 + HTMLElementEventMap 확장
│   ├── index.ts                       컴포넌트 등록 진입점
│   ├── react/
│   │   ├── cx.ts                      조건부 클래스 합치기(내부 전용)
│   │   ├── controls/*.tsx             네이티브 요소에 클래스를 붙이는 컴포넌트 7종
│   │   ├── tags/*.tsx                 커스텀 엘리먼트 래퍼의 프롭 이름을 맞추는 shim
│   │   ├── elements.ts                @lit/react 래퍼. 이벤트 매핑의 단일 출처
│   │   └── index.ts                   재export 허브
├── scripts/
│   ├── copy-css.mjs                   tokens.css · controls.css → dist/, tokens.css → dist/aliases.css 생성
│   ├── check-events.mjs               발생 이벤트 ↔ React 래퍼 매핑 대조
│   ├── check-controls.mjs             클래스 ↔ index.html 양방향, 요소 선택자는 정방향만 대조
│   ├── check-tokens.mjs               var() 참조의 --ns- 접두사·정의 여부, data-ns-* 훅 세 곳 일치
│   └── release.mjs                    빌드 → detached 커밋에 dist 포함 → 태그
├── docs/
│   ├── project-structure.md           이 문서
│   ├── gotchas.md                     함정과 그 이유. 규칙이 왜 그런지는 전부 여기
│   ├── consumer-example.tsx           소비자 관점 타입 검사 대상 (npm run check 가 실행)
│   └── superpowers/{specs,plans}/     설계 문서와 구현 계획
├── .claude/
│   ├── rules/                         항상 지켜야 하는 제약 (commit, library-invariants, verification)
│   └── skills/                        작업별 절차 (releasing, adding-a-component)
├── index.html                         문서 겸 플레이그라운드. 셸 자체가 우리 컴포넌트
├── vite.config.ts                     --mode 로 세 벌 빌드
├── tsconfig.json                      타입 검사용(noEmit)
├── tsconfig.build.json                선언 방출 전용
└── tsconfig.consumer.json             소비자 관점 검사용
```

## 산출물과 진입점

```
dist/index.js         ES. lit 은 external      → Next / Vite 등 번들러
dist/react.js         ES. 'use client' 배너     → React 프로젝트
dist/bundle.umd.js    UMD. lit 인라인 (27KB)    → 순수 HTML <script src>, file:// 가능
dist/tokens.css       복사본                    → 모든 환경에서 필수
dist/controls.css     복사본                    → 순수 HTML 이 직접 링크
dist/aliases.css      tokens.css 에서 생성      → 무접두사 이름을 쓰던 프로젝트만 (옵트인)
dist/**/*.d.ts        tsc 가 src 트리 유지해 방출
```

`package.json` 의 `exports` 가 이것들을 `.`, `./react`, `./tokens.css`, `./controls.css`, `./aliases.css`, `./umd` 로 노출한다.

**`aliases.css` 는 기본이 아니다.** 무접두사 이름을 문서 `:root` 에 다시 정의하므로, 임포트하면 0.1.5 의 이름 충돌이 그대로 돌아온다. 그게 그 파일의 목적이다 — 이유는 `docs/gotchas.md` 의 "토큰 이름을 소비자와 공유하면 라이브러리가 캐스케이드에 종속된다" 에 있다.

**`tokens.css` 는 어느 환경에서든 반드시 불러와야 한다.** 컴포넌트 스타일은 이 파일이 정의하는 CSS 변수를 폴백 없이 참조한다. 빠지면 레이아웃이 무너지고 콘솔에 경고가 뜬다.

**다크모드는 `tokens.css` 를 불러오는 것으로 끝난다(0.2.0).** 값은 토큰마다 `light-dark()` 한 쌍이고 신호는 `:root` 의 `color-scheme` 하나다. `data-theme` 이 없으면 OS 설정을 따르고, `light`/`dark` 를 세우면 그것이 이긴다. `color-scheme` 은 상속되므로 컴포넌트 shadow 안과 네이티브 폼 컨트롤·스크롤바까지 함께 뒤집힌다. **`@media (prefers-color-scheme: dark)` 선언 블록을 복제하지 않는 이유**는 `docs/gotchas.md` 의 "다크모드를 미디어쿼리 블록으로 만들면 값이 두 벌이 된다" 에 있다.

**브라우저 하한은 Chrome 123 · Safari 17.5 · Firefox 121 이다.** Chrome·Safari 는 `light-dark()`, Firefox 는 `controls.css` 의 `:has()` 가 정한다.

**Tailwind 를 쓰는 소비자는 레이어 순서를 한 줄 선언해야 한다.** `@layer theme, base, ns-controls, components, utilities;` 를 Tailwind import 위에 둔다. 빠지면 preflight 가 클래스 스타일을 지우고, **JS 로 감지할 수 없다.**

## 명령

| 명령 | 하는 일 |
|---|---|
| `npm run check` | ① 라이브러리 타입 ② 소비자 관점 타입 ③ 이벤트 매핑 ④ 클래스 ↔ 문서 ⑤ 토큰 참조 |
| `npm run build` | `dist/` 에 ES · React · UMD · tokens.css · controls.css · aliases.css 생성 |
| `npm run demo` | 빌드 후 `index.html` 열기 (macOS `open`) |
| `npm run release -- 0.1.4` | 검사 → 빌드 → 버전 커밋 → dist 포함 태그 생성 |

`release` 는 `README.md` 와 `index.html` 의 설치 버전도 함께 갱신해 태그 안의 문서가 자기 버전을 가리키게 한다.

**릴리스 직후에는 `dist/` 가 사라진다.** 브랜치로 돌아오면서 git 이 지운다. `index.html` 을 다시 보려면 `npm run demo` 로 재빌드한다.

## 구조 검사

`index.html` 을 고친 뒤 확인한다. 브라우저 없이 가능한 것들이다.

```sh
grep -c '<script>' index.html                      # 헬퍼 하나 = 1
grep -n '</script>' index.html \
  | grep -v -E ':\s*</script>\s*$' | grep -v '<script src='   # 출력 없어야 정상
grep -n 'document.addEventListener' index.html     # 출력 없어야 정상
grep -oE '(^|[[:space:]])id="[^"]*"' index.html \
  | sed -E 's/.*id="([^"]*)"/\1/' | sort | uniq -d            # 출력 없어야 정상
```

세 번째가 중요하다. 이벤트가 `composed` 라 데모에서 발생한 것도 `document` 까지 올라온다. 리스너를 `document` 에 붙이면 데모를 만질 때 문서 페이지가 제멋대로 움직인다. 모든 리스너는 자기가 소유한 엘리먼트에 붙인다.

네 번째는 **중복 id** 다. 배선이 `<script>` 하나라 `getElementById` 가 엉뚱한 요소를 주는 순간 그 아래 전부가 실행되지 않는데, 화면은 멀쩡해 보인다. 새 절의 id 에는 절 이름을 접두사로 붙인다(`table-select-demo`).

## 관련 문서

- 함정과 그 이유: `docs/gotchas.md`
- 설계 배경과 수용된 한계: `docs/superpowers/specs/2026-08-12-common-ui-web-components-design.md`
- 구현 계획(Task 단위 코드 포함): `docs/superpowers/plans/2026-08-12-common-ui-web-components.md`
- 사용법·프로퍼티·이벤트·라이브 데모: `index.html` (`npm run demo`)

## 남은 일

- **`ns-header`·`ns-sidebar` 의 비제어 지원.** 토글을 소비자 코드 없이 동작시키는 것. 지금 소비자 코드가 필요한 이유는 두 컴포넌트가 서로 남남이어서, 이벤트를 받아 *다른* 엘리먼트에 내려주는 일을 소비자밖에 할 수 없다는 것이다. 둘을 감싸는 것을 도입할지가 논의의 핵심이다. (0.2.0 이 해결한 것은 **SSR 너비 튐**이다 — `Sidebar` shim 의 `data-ns-open` 과 `:not(:defined)` 예약으로 소비자 래퍼 `div` 가 필요 없어졌다. 상태를 누가 들고 있느냐는 그대로 남았다.)
- **`dashboard-shell` 이관.** 별도 계획이 필요하다. `globals.css` 의 토큰 블록 정리(0.2.0 부터는 이름이 겹치지 않으므로 **삭제가 강제되지 않는다** — 그대로 두거나 `--ns-` 로 옮긴다), Tailwind 커스텀 색 유틸 2곳 수정, `SidebarSection[]` 데이터를 JSX 로 변환, loading/error/empty 상태를 slot 으로 이동, `linkComponent={Link}` → `ns-navigate` 전환.
