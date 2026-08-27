# common-ui

Next.js · React 18/19 · 순수 HTML 에서 동일하게 쓰는 대시보드 셸 웹 컴포넌트.

- `ns-header` — 토글 버튼, 프로젝트 이름, 우측 `actions` slot
- `ns-sidebar` — 네비게이션 한 칼럼. 열리면 그룹이 위에서 아래로 이어지고, 닫히면 폭이 0 이 되어 통째로 사라진다
- `ns-nav-group` / `ns-nav-item` — 네비게이션 그룹과 항목. **그룹을 그룹 안에 중첩하면 하위 카테고리가 된다.** 항목 좌측은 `leading` slot 이라 아이콘을 넣을 수 있고, 비우면 그 자리가 접혀 라벨이 왼쪽 끝에 붙는다
- `ns-icon` — 아무 아이콘이나 감싸 크기·색을 통일한다. `<ns-icon><House /></ns-icon>` 처럼 자식으로 넣는 것이 기본이고, `name` 은 내장 넷(`menu`·`close`·`google`·`chevron-down` — 라이브러리 자신이 쓰는 것들이다)과 `registerIcons()` 로 등록한 것에만 쓴다

## 설치

npm 레지스트리를 쓰지 않는다. git 태그로 설치한다.

```json
"dependencies": {
  "@neosimplix/common-ui": "git+https://github.com/neosimplix/dashboard-common-ui.git#v0.4.0"
}
```

**태그를 반드시 지정한다.** `main` 에는 `dist/` 가 없어서 브랜치를 가리키면 설치는 되지만 import 가 실패한다. 사용할 수 있는 태그는 `git tag -l` 로 확인한다.

설치가 의도한 태그를 잡았는지 두 줄로 확인한다.

```sh
node -p "require('@neosimplix/common-ui/package.json').version"   # 위 태그와 같아야 한다
ls node_modules/@neosimplix/common-ui/dist/tokens.css             # 있어야 정상
```

두 번째가 없으면 `dist/` 가 없는 커밋을 잡은 것이다 — 태그가 아니라 브랜치를 가리켰거나, npm 이 옛 git 캐시를 재사용한 경우다. 후자는 `npm cache clean --force` 뒤 재설치한다. 첫 줄은 **0.2.1 부터만** 동작한다. `exports` 맵에 `./package.json` 이 없던 0.2.0 이하에서는 `ERR_PACKAGE_PATH_NOT_EXPORTED` 가 나므로 두 번째 줄로 확인한다.

CSS 두 개를 모두 불러온다.

```css
/* app/globals.css — 아래 Tailwind 절의 레이어 순서 선언과 같은 파일에 둔다 */
@import "@neosimplix/common-ui/tokens.css";
@import "@neosimplix/common-ui/controls.css";
```

`tokens.css` 는 색·치수의 단일 출처이고 `controls.css` 는 네이티브 요소용 `.ns-*` 클래스다. 컴포넌트 스타일이 토큰을 폴백 없이 참조하므로 둘 중 하나라도 빠지면 레이아웃이 무너진다.

**두 파일 사이의 순서는 결과를 바꾸지 않는다.** 토큰 이름이 전부 `--ns-` 접두사를 쓰므로 소비자 문서의 `:root` 와 이름이 겹치지 않는다. 0.1.5 까지는 접두사가 없어 `tokens.css` 를 소비자 CSS 뒤에 두어야만 셸 색이 살아나는 프로젝트가 있었다 — 그 제약이 사라졌다.

**그러나 Tailwind 를 쓰면 두 파일을 *어디서* 임포트하는지는 결과를 바꾼다.** 없어진 것은 이름 충돌이지 레이어 순서가 아니다. 레이어 순서는 첫 등장 순서로 정해지므로, `controls.css` 가 순서 선언보다 먼저 나오면 `ns-controls` 가 preflight 앞으로 가서 `.ns-*` 의 테두리·여백이 전부 사라진다. 자리는 하나다 — 아래 **Tailwind 를 쓰면 레이어 순서를 선언해야 한다** 가 보이는 `globals.css` 한 파일. Next.js 라면 `layout.tsx` 에서 이 두 줄을 JS `import` 하지 않는다.

이미 무접두사 이름(`var(--space-3)` 등)을 직접 참조하는 CSS 가 있는 프로젝트만 별칭 파일을 **선택적으로** 함께 불러온다.

```css
/* 선택. 0.1.5 의 무접두사 이름을 --ns- 이름으로 잇는다 */
@import "@neosimplix/common-ui/aliases.css";
```

**새 프로젝트는 임포트하지 않는다.** 이 파일은 무접두사 이름을 문서 `:root` 에 다시 정의하므로 위에서 없앤 이름 충돌을 의도적으로 되살린다.

브라우저 요구사항은 **Chrome 123 · Safari 17.5 · Firefox 121** 이상이다. Chrome·Safari 는 `light-dark()`, Firefox 는 `controls.css` 가 쓰는 `:has()` 가 하한을 정한다.

**Tailwind 를 쓰면 레이어 순서를 선언해야 한다.** `controls.css` 는 `@layer ns-controls` 로 감싸 배포되므로, 이 선언이 없으면 Tailwind preflight 가 클래스 스타일을 지운다. **선언과 임포트는 한 파일에 함께 둔다** — 순서 선언은 그 레이어 이름들이 아직 나오지 않았을 때만 효력이 있어서, 임포트가 다른 파일에 흩어지면 어느 것이 먼저 번들에 들어가는지에 결과가 매달린다. 위의 두 `@import` 도 여기 함께 온다.

```css
/* app/globals.css — 선언이 맨 위, 임포트가 그 아래. 이 파일 하나로 끝난다 */
@layer theme, base, ns-controls, components, utilities;

@import "tailwindcss";
@import "@neosimplix/common-ui/tokens.css";
@import "@neosimplix/common-ui/controls.css";
```

Tailwind v4 의 임포트 리졸버가 bare specifier 를 해석하므로 `@import "@neosimplix/…"` 가 `node_modules` 에서 그대로 풀린다. 순서가 뒤집혔는지는 `.ns-button--outline` 하나를 골라 `getComputedStyle(el).borderTopWidth` 를 읽어 확인한다 — `1px` 이어야 하고 `0px` 이면 preflight 가 이긴 것이다. **경고도 에러도 없다.**

## React 래퍼는 전부 클라이언트 경계다

**`dist/react.js` 최상단에 `"use client"` 배너가 있다.** `@lit/react` 의 `createComponent` 가 훅을 쓰므로 필요하고 없앨 수 없다. 배너는 파일 단위라 그 진입점이 export 하는 것 전부에 걸린다 — 상호작용이 전혀 없는 `Card`·`PageHeading` 도 클라이언트 경계다. 쓰는 것 자체는 정상이지만 **그 경계 너머로 함수를 넘길 수 없다.** 표 칼럼을 `{ render, sortValue }` 처럼 함수를 담은 값으로 정의해 서버 페이지에서 넘기면 `Functions cannot be passed directly to Client Components` 로 빌드가 깨진다. 셸을 이 라이브러리로 바꾸면 표시 전용 컴포넌트까지 클라이언트로 끌려온다는 뜻이라 **도입을 정하기 전에 알아야 한다.** 우회(칼럼 정의를 `"use client"` 파일로 내린다)와 전체 설명은 `index.html` 의 "React 래퍼는 전부 클라이언트 경계다"(`#usage-use-client`) 에 있다. 순수 HTML 로 커스텀 엘리먼트를 직접 쓰는 경로에는 해당하지 않는다.

## 다크모드

**기본값은 OS 를 따르는 것이다.** `tokens.css` 가 `:root` 에 `color-scheme: light dark` 를 선언하고, 값은 토큰마다 `light-dark()` 한 쌍으로 들어 있다. `color-scheme` 은 상속되므로 컴포넌트 shadow 안까지 도달하고 네이티브 폼 컨트롤·스크롤바도 함께 뒤집힌다.

**이 업그레이드에서 소비자 코드 없이 화면이 바뀌는 부분은 여기 하나다.** 라이트 전용으로 만든 앱도 사용자의 OS 가 다크면 셸·폼 컨트롤·스크롤바가 어두워진다 — 앱 본문만 밝은 채로 남는다. 나머지 변경은 고치지 않으면 타입 오류나 무효한 속성으로 드러나지만, 이것은 아무 신호 없이 모양만 달라진다.

모양을 고정하려면 `:root`(`<html>`)에 `data-theme` 을 세운다. **이것이 결정적인 옵트아웃이다** — 속성 선택자라 특정도가 높아 임포트 순서와 무관하게 이긴다.

```html
<html data-theme="light">   <!-- 항상 라이트. OS 다크모드를 무시한다 -->
```

```js
document.documentElement.dataset.theme = "dark";   // 명시 지정
delete document.documentElement.dataset.theme;     // OS 설정으로 되돌림
```

**자기 CSS 에서 `color-scheme` 을 세우고 있다면 지우고 `data-theme` 으로 옮긴다.** 소비자의 `:root { color-scheme: … }` 와 `tokens.css` 의 `:root` 는 특정도가 같아 승자를 임포트 순서가 정한다 — 토큰 이름에서 없앤 그 종속이 이 한 프로퍼티에는 그대로 남아 있다. `color-scheme` 은 이름을 바꿀 수 없는 표준 프로퍼티라 `--ns-` 같은 이름공간을 줄 수 없기 때문이다. 근거는 `docs/gotchas.md` 의 "`color-scheme` 에는 이름공간이 없어 접두사로 막을 수 없다" 에 있다.

## 0.5.0 이주

**소비자가 마크업을 고쳐야 하는 것은 하나다.**

| 지금 (0.4.0) | 바뀐 뒤 (0.5.0) |
|---|---|
| `<ns-sidebar open>` | `<ns-sidebar default-open>` |
| `<NsSidebar open={x}>` | 그대로 (제어 모드) |

**`<ns-sidebar open>` 은 조용히 무시되고 콘솔 경고가 뜬다.** `open` 이 프로퍼티 전용이 되어 관찰되지 않으므로 제어 모드로 들어가지도 않는다 — HTML 에서 초기 상태를 열어 두려면 `default-open` 이다. React 의 제어 모드(`open={x}`)는 그대로다.

**열린 폭은 15rem 그대로다.** `--ns-sidebar-width` 의 뜻도 값도 바뀌지 않았으므로 이주 항목이 아니다. 바뀐 것은 **닫힌 폭**이다 — `--ns-sidebar-width-collapsed` 가 `4rem` 에서 `0` 으로 내려가, 접은 사이드바가 좁은 띠를 남기지 않고 통째로 사라진다.

**이 토큰을 덮어 좁은 레일을 되살릴 수는 없다.** 값을 올리면 그만큼의 **빈 자리**가 예약될 뿐 그 안에는 아무것도 그려지지 않는다 — `nav` 가 통째로 숨으므로 항목도, 제목도, 그 오른쪽 경계선조차 없고 `ns-sidebar` 의 배경색만 남는다. 이유가 둘이고 서로 독립이다.

1. **닫힌 사이드바의 내용을 감추는 것은 폭이 아니라 상태다.** shadow 안에 `:host(:not([data-ns-open])) nav { visibility: hidden }` 가 있고, 이 규칙은 닫힘 폭이 얼마든 그대로 걸린다.
2. **그 규칙이 없더라도 읽히는 띠가 되지 않는다.** 0.4.0 에서 좁은 띠에 라벨을 숨기고 항목을 남기던 신호 프로퍼티 둘(`--ns-label-display`·`--ns-group-list-display`)이 0.5.0 에 없어졌고 **되살리지 않는다.** 둘이 없으면 띠에 보이는 것은 15rem 짜리 레이아웃의 왼쪽 끝을 자른 조각 — 잘린 제목과 잘린 라벨 — 이다.

**라이브러리가 레일을 다시 주지 않는 이유**는 그것을 만들어 보고 물렀기 때문이다. 근거는 `docs/gotchas.md` 의 "레일을 만들었다가 물렀다" 에 있다. 레일이 필요한 프로젝트는 사이드바 밖에 자기 칼럼을 두고 이 컴포넌트를 그 오른쪽에 놓는다.

**그래서 이 토큰이 정하는 것은 "닫혔을 때 본문을 얼마나 밀어 둘 것인가" 하나다.** 접힌 상태에서도 본문이 화면 왼쪽 끝까지 오지 않게 하려면 값을 준다.

```css
:root { --ns-sidebar-width-collapsed: 1rem }   /* 접으면 빈 1rem 이 남는다 */
```

**닫힌 사이드바는 탭 순서에서도 빠진다.** 폭 0 과 `overflow: hidden` 은 **자르는** 것이라 그것만으로는 보이지 않는 링크에 Tab 이 내려앉는다. 그래서 폭 전환이 끝나는 200ms 뒤에 안쪽 `nav` 를 `visibility: hidden` 으로 숨긴다 — 링크가 탭 순서와 접근성 트리에서 함께 빠지고, 여는 쪽에는 지연이 없어 즉시 보인다. **기대도 되는 보장이다.** 딸려 오는 성질이 둘 있다: 닫는 200ms 안에는 아직 Tab 이 닿고, 닫는 순간 사이드바 안에 있던 포커스는 숨김이 도착할 때 `<body>` 로 떨어진다. 둘 다 "애니메이션 뒤에 숨긴다" 에 내재하는 절충이다.

### breaking — `ns-nav-item` 의 `badge` 가 없어졌다

배지 사각형은 "접힌 사이드바에서 유일하게 남는 요소" 라는 이유로 있었고, 사이드바가 닫히면 통째로 사라지게 되면서 그 이유가 없어졌다. **속성을 그대로 두면 조용히 무시된다** — 라벨 왼쪽이 비고 그 자리가 접힌다.

**대안은 `leading` 슬롯이다.** 원하는 요소를 그대로 넣는다 — 폴백이 아니라 그 자리의 유일한 내용이므로 분기할 것이 없다.

```html
<!-- 0.4.0 -->
<ns-nav-item href="/users" label="사용자" badge="사"></ns-nav-item>

<!-- 0.5.0 — 아이콘 -->
<ns-nav-item href="/users" label="사용자">
  <ns-icon slot="leading"><svg>…</svg></ns-icon>
</ns-nav-item>

<!-- 0.5.0 — 옛 배지와 같은 모양을 원하면 소비자가 그 상자를 만든다 -->
<ns-nav-item href="/users" label="사용자">
  <span slot="leading" class="my-badge" aria-hidden="true">사</span>
</ns-nav-item>
```

React 도 같다 — `badge` 프롭 대신 `slot="leading"` 을 붙인 자식을 넘긴다.

```tsx
<NsNavItem href="/users" label="사용자">
  <NsIcon slot="leading"><Users /></NsIcon>
</NsNavItem>
```

**아무것도 넣지 않는 것이 기본이다.** 빈 슬롯은 상자도 `gap` 도 만들지 않으므로 라벨이 왼쪽 끝에 붙는다. **일부 항목에만 `leading` 을 주면 줄이 들쭉날쭉해 보일 수 있다** — 0.4.0 은 배지가 늘 자리를 차지해 정렬이 강제됐고, 0.5.0 은 그 강제를 놓았다. 한 목록 안에서는 전부 주거나 전부 비우는 쪽을 권한다.

### 그 밖에

**`ns-sidebar` 밖에서 최상위 `ns-nav-group` 을 세로로 쌓으면 사이가 24px 좁아진다.**
0.4.0 은 첫 형제가 아닌 그룹의 wrapper 에 `padding-top: var(--ns-space-6)`(24px)을
얹었다. 그 규칙의 `:first-child` 가 화면과 어긋나게 세는 경우가 있어 지웠고, 남는
것은 헤딩 자신의 `padding-top: var(--ns-space-4)`(16px)뿐이다. 사이드바 안에서는
보이지 않는 차이지만, 그룹을 평범한 컨테이너에 쌓아 쓰던 소비자는 화면이 좁아진
것을 본다. 되돌리려면 소비자 문서 CSS 한 줄이면 된다 — 호스트는 문서 트리에 있으므로
이 규칙이 shadow 를 이긴다.

```css
ns-nav-group + ns-nav-group { padding-top: 1.5rem }
```

**`ns-nav-group` 을 `ns-nav-group` 안에 중첩하면 하위 카테고리가 된다.** 이번 릴리스가
더한 기능이고 breaking 이 아니다 — 새 태그도 새 속성도 없이 그룹이 자기 중첩을 스스로
판정한다. `collapsible` 은 **단을 가리지 않는다** — 최상위 그룹에 붙이면 그 그룹이
통째로 접히고(긴 네비게이션을 줄이는 데는 이쪽이 가장 크다), 하위 그룹에 붙이면 그
카테고리만 접힌다. **0.4.0 마크업에 이미 있는 `collapsible` 은 옮길 필요가 없다.**

```html
<ns-sidebar default-open>
  <ns-nav-group heading="관리">
    <ns-nav-group heading="사용자" collapsible>
      <ns-nav-item href="/users" label="목록"></ns-nav-item>
    </ns-nav-group>
    <ns-nav-item href="/logs" label="로그"></ns-nav-item>
  </ns-nav-group>
</ns-sidebar>
```

**새 이벤트는 없다.** `ns-sidebar` 는 자기를 여닫는 버튼을 갖지 않으므로 `ns-toggle` 을 올리지 않는다 — 헤더의 토글을 받아 사이드바의 `open` 에 내려주는 배선은 0.4.0 과 같다.

## 릴리스

**`dist/` 가 바뀌었는지**를 태그마다 적는다. 안 바뀐 릴리스는 설치해도 화면이 그대로이므로, 소비자가 태그별로 받아 `diff -rq` 하기 전에는 알 수 없다.

| 태그 | `dist/` | 소비자가 할 일 |
|---|---|---|
| `v0.5.0` | 변경 | **breaking 둘.** `<ns-sidebar open>` → `default-open`(`open` 이 프로퍼티 전용이 됐다), `ns-nav-item` 의 `badge` 삭제(`leading` 슬롯으로 옮긴다). 닫힌 사이드바가 4rem 이 아니라 0 이 된다. `ns-nav-group` 의 `collapsible` 과 **하위 카테고리 중첩**이 함께 나간다. 위 **0.5.0 이주** 절을 본다 |
| `v0.4.0` | 변경 | **breaking 둘.** 액센트 토큰 `--ns-color-accent-hover`·`--ns-color-accent-fg` 가 없어졌다(`--ns-color-accent-fill-hover`·`--ns-color-accent-fill-fg` 로 옮겨간다). `nsToast()` 기본 자리가 상단 중앙 — 우하단을 유지하려면 시작 지점에서 `nsToastPosition("bottom-right")` |
| `v0.3.0` | 변경 | 태그만 올린다. 컴포넌트 둘과 클래스 여섯, 명령형 API 셋이 늘었다 |
| `v0.2.5` | 변경 | 태그만 올린다. `ns-icon` 슬롯 자식이 하이드레이션 때 튀지 않는다. 프로퍼티 전용 이름을 속성으로 쓰면 경고가 나온다 |
| `v0.2.4` | **동일** (`v0.2.2` 와 바이트 일치) | 없음. `index.html` 다크모드 코드 블록 수정 — 문서만 |
| `v0.2.3` | **동일** (`v0.2.2` 와 바이트 일치) | 없음. 예시를 `name` 대신 슬롯 우선으로 개편 — 문서만 |
| `v0.2.2` | 변경 | 태그만 올린다. `ns-icon` 이 기본 슬롯을 갖는다 |
| `v0.2.1` | 변경 | 태그만 올린다. `globals.css` 에 사이드바 경계선을 되살려 둔 것이 있으면 지운다 |
| `v0.2.0` | 변경 | **breaking 둘.** 공개 토큰 이름에 `--ns-` 접두사(옛 이름을 계속 쓰려면 `aliases.css` 를 임포트한다). React 의 `NsSidebar` → `Sidebar` — 프롭이 `onNsNavigate={(e) => …e.detail}` 대신 `onNavigate={(d) => …d}` 다 |

## 문서 보기

사용법·프로퍼티·이벤트·라이브 데모는 `index.html` 에 있다. **패키지에 함께 설치되므로 설치한 뒤 바로 열면 된다.** 옆에 `dist/` 가 있어 라이브 데모까지 그대로 동작한다.

```sh
open node_modules/@neosimplix/common-ui/index.html
```

이 파일은 설치된 버전과 정확히 같은 시점의 문서다. 저장소를 따로 보러 가면 다른 버전의 문서를 읽게 될 수 있다.

이 저장소에서 직접 작업할 때는 `main` 에 `dist/` 가 없으므로 빌드가 필요하다.

```sh
git clone https://github.com/neosimplix/dashboard-common-ui.git
cd dashboard-common-ui
npm install
npm run demo
```

## 개발

| 명령 | 설명 |
|---|---|
| `npm run check` | 타입 검사 + 이벤트 매핑 · 클래스 ↔ 문서 · 토큰 참조 검사 |
| `npm run build` | `dist/` 에 ES · React · UMD · tokens.css · controls.css · aliases.css 생성 |
| `npm run demo` | 빌드 후 `index.html` 열기 |
| `npm run release -- 0.1.0` | 빌드 산출물을 포함한 `v0.1.0` 태그 생성·푸시 |

테스트 러너가 없다. `npm run check` 와 `index.html` 육안 확인이 회귀 확인
수단이다. 문서 페이지의 헤더와 네비게이션 자체가 이 패키지의 컴포넌트라,
깨지면 문서가 열리지 않는 것으로 드러난다. 컴포넌트를 추가하면
`index.html` 에도 섹션을 추가한다.

## 설계

`docs/superpowers/specs/2026-08-12-common-ui-web-components-design.md`
