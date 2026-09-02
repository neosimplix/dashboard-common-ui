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
  "@neosimplix/common-ui": "git+https://github.com/neosimplix/dashboard-common-ui.git#v0.5.5"
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

**`dist/react.js` 최상단에 `"use client"` 배너가 있다.** `@lit/react` 의 `createComponent` 가 훅을 쓰므로 필요하고 없앨 수 없다. 배너는 파일 단위라 그 진입점이 export 하는 것 전부에 걸린다 — 상호작용이 전혀 없는 `Card`·`PageHeading` 도 클라이언트 경계다. 쓰는 것 자체는 정상이지만 **그 경계 너머로 함수를 넘길 수 없다.** 표 칼럼을 `{ render, sortValue }` 처럼 함수를 담은 값으로 정의해 서버 페이지에서 넘기면 `Functions cannot be passed directly to Client Components` 로 빌드가 깨진다. 셸을 이 라이브러리로 바꾸면 표시 전용 컴포넌트까지 클라이언트로 끌려온다는 뜻이라 **도입을 정하기 전에 알아야 한다.** 우회(칼럼 정의를 `"use client"` 파일로 내린다)와 전체 설명은 `guide.html` 의 "React 래퍼는 전부 클라이언트 경계다"(`#usage-use-client`) 에 있다. 순수 HTML 로 커스텀 엘리먼트를 직접 쓰는 경로에는 해당하지 않는다.

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

## 릴리스

**여기 두는 것은 태그와 `dist/` 변경 여부, 그리고 소비자가 할 일 한 줄이다.**
무엇이 왜 바뀌었는지와 이주 코드는 [`changelog.html`](./changelog.html) 에 있다 —
아래 태그를 누르면 그 절로 간다.

`dist/` 칸은 그 태그가 산출물을 바꿨는지다. 안 바뀐 릴리스는 설치해도 화면이 그대로다.

| 태그 | `dist/` | 소비자가 할 일 |
|---|---|---|
| [`v0.5.5`](./changelog.html#v0-5-5) | 변경 | **breaking 없음.** `open`·`defaultOpen` 을 둘 다 안 주면 `ns-sidebar` 가 콘솔에 경고한다(React shim 전용, 동작은 그대로). `guide.html` 에 「소비자가 테스트할 때」 절, 프로퍼티 표 `reflect` 칸, `Field` 의 커스텀 엘리먼트 조합 안내가 늘었다 |
| [`v0.5.4`](./changelog.html#v0-5-4) | 변경 | **breaking 하나(타입만, 런타임 아님).** 컨트롤에 직접 넘긴 `aria-invalid` 가 더 이상 `invalid` 프롭을 무력화하지 않고, `Field` + `ns-multi-select` 조합이 라벨을 잇는다. 자식을 안 받는 래퍼 넷은 `children?: never` 로 막는다 |
| [`v0.5.3`](./changelog.html#v0-5-3) | 변경 | 없다. `ns-header` 밑줄이 소비자 셸에서 안 보이던 것, 대화상자를 열 때 닫기 버튼에 링이 뜨던 것, `*` 리셋 없는 순수 HTML 소비자에서 `.ns-card` 가 컨테이너 밖으로 넘치던 것을 고쳤다 |
| [`v0.5.2`](./changelog.html#v0-5-2) | 변경 | 없다. 문서가 세 페이지로 나뉘고 사용 안내가 `guide.html` 로 옮겨갔다 — `dist/` 는 주석만 바뀐다 |
| [`v0.5.1`](./changelog.html#v0-5-1) | 변경 | 접히는 사이드바가 글자를 찌그러뜨리지 않는다. 폭 손잡이는 `--ns-sidebar-width` 하나다 |
| [`v0.5.0`](./changelog.html#v0-5-0) | 변경 | **breaking 둘.** `<ns-sidebar open>` → `default-open`, `ns-nav-item` 의 `badge` 삭제. 닫힌 사이드바가 0 이 된다 |

## 문서 보기

**문서는 두 파일이고 둘 다 패키지에 함께 설치된다.** 설치한 뒤 바로 열면 되고, 옆에 `dist/` 가 있어 라이브 데모까지 그대로 동작한다.

```sh
open node_modules/@neosimplix/common-ui/guide.html      # 사용법·프로퍼티·이벤트·라이브 데모
open node_modules/@neosimplix/common-ui/changelog.html  # 태그별 변경 내역과 이주 코드
```

`index.html` 도 함께 설치되지만 위 둘로 보내는 목차일 뿐이다. 어느 파일이 무엇인지 잊었을 때 폴더를 열면 브라우저가 그것을 집으므로 남겨 둔다 — `index.html` 은 이름이 아니라 관례라서, 없으면 디렉터리를 여는 경로가 죽는다.

두 파일은 설치된 버전과 정확히 같은 시점의 문서다. 저장소를 따로 보러 가면 다른 버전의 문서를 읽게 될 수 있다 — **특히 `changelog.html` 은 지금 설치한 태그보다 뒤의 항목은 담고 있지 않다.**

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
| `npm run demo` | 빌드 후 `guide.html` 열기 — 데모가 있는 페이지로 바로 간다. `index.html`·`changelog.html` 은 같은 `dist/` 를 읽으므로 빌드 뒤 그냥 열면 된다 |
| `npm run release -- 0.1.0` | 빌드 산출물을 포함한 `v0.1.0` 태그 생성·푸시 |

테스트 러너가 없다. `npm run check` 와 육안 확인이 회귀 확인 수단이다.
`guide.html` 과 `changelog.html` 두 페이지의 헤더와 네비게이션 자체가 이 패키지의
컴포넌트라, 깨지면 문서가 열리지 않는 것으로 드러난다. 컴포넌트를 추가하면
`guide.html` 에도 섹션을 추가하고, 태그를 자르면 `changelog.html` 에도 절을
추가한다 — 후자는 `npm run check` 가 릴리스 표와 대조해 강제한다.

## 설계

`docs/superpowers/specs/2026-08-12-common-ui-web-components-design.md`
