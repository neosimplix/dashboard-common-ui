# 프로젝트 구조와 실행

`common-ui` 는 Next.js · React 18/19 · 순수 HTML 에서 동일하게 쓰는 대시보드 셸 웹 컴포넌트 라이브러리다.

## 무엇을 제공하나

| 태그 | 역할 |
|---|---|
| `ns-header` | 좌측 토글 버튼과 프로젝트 이름, 우측 `actions` slot |
| `ns-sidebar` | 네비게이션 컨테이너. 접으면 좌측에 4rem 레일이 남는다 |
| `ns-nav-group` | 제목이 붙은 네비게이션 그룹 |
| `ns-nav-item` | 그룹 하위 항목. 행 우측에 `trailing` slot |

이벤트는 둘뿐이다. `ns-toggle`(`{ open }`)과 `ns-navigate`(`{ href, label }`). 둘 다 `bubbles: true, composed: true` 라 shadow 경계를 넘어 소비자에게 도달한다. **라우팅은 하지 않는다** — 이벤트만 올리고 각 프로젝트가 처리한다.

## 왜 이런 구조인가

**npm 레지스트리를 쓰지 않는다.** private 레지스트리는 유료이므로 git 태그로 배포한다. 소비자는 `git+ssh://…#v0.1.3` 한 줄로 설치한다. npm 이 그 태그의 저장소를 clone 해서 `files` 가 고르는 것만 가져가므로, **`dist/` 가 태그 커밋에 물리적으로 존재해야 한다.** 하지만 `main` 은 빌드 산출물 없이 유지해야 한다. 태그는 이미 있는 커밋에 파일을 더할 수 없으므로, 릴리스 스크립트가 detached HEAD 에서 `dist/` 를 포함한 커밋을 새로 만들고 거기에 태그를 붙인다.

**모노레포를 쓰지 않는다.** 이전 시도(`shared-ui`)가 pnpm workspace 였고, git 의존성으로 설치가 되지 않아 폐기됐다. 단일 패키지에 `exports` 서브패스로 나눈다.

**테스트 러너를 두지 않는다.** 같은 시도가 검증 하네스 복잡도 때문에도 폐기됐다. 회귀 확인은 `npm run check` 와 `index.html` 육안 확인이다. 문서 페이지의 헤더와 좌측 네비게이션이 이 라이브러리의 컴포넌트로 만들어져 있어서, 깨지면 문서가 열리지 않는 것으로 즉시 드러난다.

## 디렉터리

```
common-ui/
├── src/
│   ├── tokens/tokens.css              디자인 토큰. Tailwind 비의존. 손으로 쓰는 정적 파일
│   ├── internal/
│   │   ├── register.ts                SSR 안전 customElements.define
│   │   └── warn-missing-tokens.ts     tokens.css 미로드 경고(페이지당 1회)
│   ├── components/<name>/
│   │   ├── ns-<name>.ts               Lit 엘리먼트 + 등록 + 태그 타입 선언
│   │   └── ns-<name>.styles.ts        shadow CSS (css`` 템플릿, .css 파일 아님)
│   ├── types.ts                       이벤트 detail 타입 + HTMLElementEventMap 확장
│   ├── index.ts                       네 컴포넌트 등록 진입점
│   └── react/index.ts                 @lit/react 래퍼. 이벤트 매핑의 단일 출처
├── scripts/
│   ├── copy-tokens.mjs                tokens.css → dist/ 복사
│   ├── check-events.mjs               발생 이벤트 ↔ React 래퍼 매핑 대조
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
dist/**/*.d.ts        tsc 가 src 트리 유지해 방출
```

`package.json` 의 `exports` 가 이것들을 `.`, `./react`, `./tokens.css`, `./umd` 로 노출한다.

**`tokens.css` 는 어느 환경에서든 반드시 불러와야 한다.** 컴포넌트 스타일은 이 파일이 정의하는 CSS 변수를 폴백 없이 참조한다. 빠지면 레이아웃이 무너지고 콘솔에 경고가 뜬다.

## 명령

| 명령 | 하는 일 |
|---|---|
| `npm run check` | ① 라이브러리 타입 검사 ② 소비자 관점 타입 검사 ③ 이벤트 매핑 대조 |
| `npm run build` | `dist/` 에 ES · React · UMD · tokens.css 생성 |
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
```

세 번째가 중요하다. 이벤트가 `composed` 라 데모에서 발생한 것도 `document` 까지 올라온다. 리스너를 `document` 에 붙이면 데모를 만질 때 문서 페이지가 제멋대로 움직인다. 모든 리스너는 자기가 소유한 엘리먼트에 붙인다.

## 관련 문서

- 함정과 그 이유: `docs/gotchas.md`
- 설계 배경과 수용된 한계: `docs/superpowers/specs/2026-08-12-common-ui-web-components-design.md`
- 구현 계획(Task 단위 코드 포함): `docs/superpowers/plans/2026-08-12-common-ui-web-components.md`
- 사용법·프로퍼티·이벤트·라이브 데모: `index.html` (`npm run demo`)
- 토큰 원본: `dashboard-shell/app/globals.css`

## 남은 일

- **`dashboard-shell` 이관.** 별도 계획이 필요하다. `globals.css` 의 토큰 블록 삭제, Tailwind 커스텀 색 유틸 2곳 수정, `SidebarSection[]` 데이터를 JSX 로 변환, loading/error/empty 상태를 slot 으로 이동, `linkComponent={Link}` → `ns-navigate` 전환.
