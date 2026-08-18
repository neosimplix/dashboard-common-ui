# common-ui

Next.js · React 18/19 · 순수 HTML 에서 동일하게 쓰는 대시보드 셸 웹 컴포넌트.

- `ns-header` — 토글 버튼, 프로젝트 이름, 우측 `actions` slot
- `ns-sidebar` — 접으면 좌측 레일이 남는 사이드바
- `ns-nav-group` / `ns-nav-item` — 네비게이션 그룹과 항목. 항목 좌측은 `leading` slot 이라 아이콘을 넣을 수 있고, 비우면 `badge` 가 대신 보인다
- `ns-icon` — 아무 아이콘이나 감싸 크기·색을 통일한다. `<ns-icon><House /></ns-icon>` 처럼 자식으로 넣는 것이 기본이고, `name` 은 내장 셋(`menu`·`close`·`google`)과 `registerIcons()` 로 등록한 것에만 쓴다

## 설치

npm 레지스트리를 쓰지 않는다. git 태그로 설치한다.

```json
"dependencies": {
  "@neosimplix/common-ui": "git+https://github.com/neosimplix/dashboard-common-ui.git#v0.2.3"
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
@import "@neosimplix/common-ui/tokens.css";
@import "@neosimplix/common-ui/controls.css";
```

`tokens.css` 는 색·치수의 단일 출처이고 `controls.css` 는 네이티브 요소용 `.ns-*` 클래스다. 컴포넌트 스타일이 토큰을 폴백 없이 참조하므로 둘 중 하나라도 빠지면 레이아웃이 무너진다.

**임포트 순서는 결과를 바꾸지 않는다.** 토큰 이름이 전부 `--ns-` 접두사를 쓰므로 소비자 문서의 `:root` 와 이름이 겹치지 않는다. 0.1.5 까지는 접두사가 없어 `tokens.css` 를 소비자 CSS 뒤에 두어야만 셸 색이 살아나는 프로젝트가 있었다 — 그 제약이 사라졌다.

이미 무접두사 이름(`var(--space-3)` 등)을 직접 참조하는 CSS 가 있는 프로젝트만 별칭 파일을 **선택적으로** 함께 불러온다.

```css
/* 선택. 0.1.5 의 무접두사 이름을 --ns- 이름으로 잇는다 */
@import "@neosimplix/common-ui/aliases.css";
```

**새 프로젝트는 임포트하지 않는다.** 이 파일은 무접두사 이름을 문서 `:root` 에 다시 정의하므로 위에서 없앤 이름 충돌을 의도적으로 되살린다.

브라우저 요구사항은 **Chrome 123 · Safari 17.5 · Firefox 121** 이상이다. Chrome·Safari 는 `light-dark()`, Firefox 는 `controls.css` 가 쓰는 `:has()` 가 하한을 정한다.

**Tailwind 를 쓰면 레이어 순서를 선언해야 한다.** `controls.css` 는 `@layer ns-controls` 로 감싸 배포되므로, 이 한 줄이 없으면 Tailwind preflight 가 클래스 스타일을 지운다.

```css
/* Tailwind import 보다 위 */
@layer theme, base, ns-controls, components, utilities;
@import "tailwindcss";
```

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

## 0.2.1 → 0.2.2 이관

**소비자가 할 일은 없다.** 태그만 올린다.

`ns-icon` 이 기본 슬롯을 갖는다. **자식을 넣으면 그것이 그려지고 `name` 은 읽히지 않는다.** 등록도 빌드 설정도 필요 없으므로, 앱 아이콘은 대개 이쪽이 짧다.

```tsx
import { House, Settings } from "lucide-react";

<NsIcon><House /></NsIcon>
<NsNavItem href="/" label="개요"><NsIcon slot="leading"><House /></NsIcon></NsNavItem>
```

크기는 `ns-icon` 이 정한다. 넣은 것이 자기 `width`/`height` 를 갖고 와도(lucide 계열은 24 를 찍는다) `::slotted(*)` 규칙이 `--ns-icon-size` 상자에 맞춘다 — 프레젠테이션 속성은 어떤 CSS 규칙에도 지기 때문이다. 다르게 하려면 그 요소에 인라인 `style` 을 준다.

접근성은 넣는 쪽 책임이다. 스프라이트로 그릴 때 붙는 `aria-hidden` 은 우리 shadow 안의 `svg` 에 있는 것이라 슬롯으로 들어온 것에는 없다. lucide-react 는 스스로 붙인다.

**손으로 HTML 을 쓸 때 `<ns-icon>` 안쪽에 공백을 두지 않는다.** 기본 슬롯은 공백 텍스트 노드도 배정받고, 배정이 하나라도 있으면 브라우저가 폴백을 렌더하지 않는다 — 줄바꿈 하나로 아이콘이 사라진다. 막을 수단이 없어 대신 콘솔 경고를 낸다. JSX 는 공백만 있는 줄을 컴파일 시점에 지우므로 해당하지 않는다.

기존 `<ns-icon name="menu"></ns-icon>` 은 그대로 동작한다.

## 0.2.0 → 0.2.1 이관

**소비자가 할 일은 없다.** 태그만 올린다. 고친 것과 더한 것은 넷이다.

| 무엇 | 성격 |
|---|---|
| `ns-sidebar` 의 오른쪽 경계선 | **fix** — `:host` 에 있어 Tailwind preflight 의 `* { border: 0 solid }` 에 지워지고 있었다. 0.1.5 부터의 결함이고 Tailwind 소비자에게만 나타났다. `globals.css` 에 `ns-sidebar { border-right: … }` 로 되살려 둔 것이 있으면 **지운다** |
| `ns-nav-group` 사이 간격 | **fix** — 같은 원인. 그룹이 둘 이상일 때만 보이므로 보고되지 않았다 |
| `registerIcons()` | **추가** — 스프라이트에 아이콘을 더한다. `slot="leading"` 에 `<svg>` 를 직접 넣던 우회가 필요 없어진다 |
| `exports` 의 `./package.json` | **추가** — `require("@neosimplix/common-ui/package.json")` 로 버전을 읽을 수 있다 |

```ts
import { registerIcons, svg } from "@neosimplix/common-ui/react"; // 또는 "@neosimplix/common-ui"

registerIcons({
  chart: {
    viewBox: "0 0 20 20",
    content: svg`<path d="M3 17V9m5 8V4m5 13v-6m4 6V7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />`,
  },
});
```

**클라이언트 번들에 들어가는 모듈의 최상위에서 한 번 부른다.** 조건이 둘이다.

1. **첫 렌더보다 앞서야 한다.** 이미 그려진 `<ns-icon>` 을 다시 그리게 하지 않으므로, 늦으면 그 아이콘이 빈 채로 남는다. 그래서 컴포넌트 안이 아니라 모듈 최상위다.
2. **그 모듈이 브라우저에 도달해야 한다.** Next.js App Router 의 루트 레이아웃은 서버 컴포넌트라, 거기서 `import "./icons"` 해도 클라이언트 번들에 들어가지 않는다 — 부수효과만 있고 export 를 쓰지 않는 모듈은 클라이언트 참조가 만들어지지 않고, **`"use client"` 를 붙여도 마찬가지다.** 셸처럼 이미 클라이언트 컴포넌트인 파일이 import 하게 한다.

2 를 놓치면 등록이 통째로 실행되지 않는다. 증상은 아이콘 자리가 비고 콘솔에 `[ns-icon] 없는 아이콘` 경고가 남는 것뿐이라, 1 만 지켰을 때와 구분되지 않는다.

`svg` 를 이 패키지에서 받는 이유는 `lit` 이 우리 의존성이지 소비자 의존성이 아니기 때문이다 — `import { svg } from "lit"` 은 pnpm 설치에서 해석되지 않는다.

## 0.1.5 → 0.2.0 이관

깨지는 변경이 둘, 코드 변경 없이 화면이 바뀌는 것이 하나, 새로 생긴 것이 하나다. 절차와 예시는 `index.html` 의 **0.1.5 → 0.2.0 이관** 절에 있다.

| 무엇 | 성격 | 해야 할 일 |
|---|---|---|
| 토큰 이름에 `--ns-` 접두사 | **breaking** | `var(--space-3)` → `var(--ns-space-3)` 로 참조를 고치거나, 옛 이름을 계속 쓰려면 위의 `aliases.css` 를 임포트한다 |
| React 의 `NsSidebar` → `Sidebar` | **breaking** | `import { Sidebar }` 로 고치고, 프롭은 `onNsNavigate={(e) => …e.detail}` 대신 `onNavigate={(d) => …d}` 다 — 이벤트 객체가 아니라 `detail` 이 그대로 들어온다 |
| 다크모드 | 화면이 바뀐다 | 없다. 원하지 않으면 위의 `<html data-theme="light">` 로 고정한다 |
| `ns-nav-item` 의 `leading` slot | 추가 | 없다. 원하면 배지 자리에 아이콘을 넣는다. 기존 `badge` 사용은 그대로 동작한다 |

**사이드바를 감싸던 래퍼 `<div>` 와 거기 복제해 둔 너비·트랜지션 값은 더 이상 필요 없다.** `Sidebar` shim 이 `data-ns-open` 을 서버 마크업에 실어 같은 일을 하기 때문이다. **제거해도 되고 그대로 두어도 동작한다** — 제거하면 라이브러리 내부 상수(`15rem`/`4rem`, 트랜지션 지속시간)를 소비자가 복제해 두는 상태가 함께 없어진다.

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
