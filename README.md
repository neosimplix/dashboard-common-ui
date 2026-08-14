# common-ui

Next.js · React 18/19 · 순수 HTML 에서 동일하게 쓰는 대시보드 셸 웹 컴포넌트.

- `ns-header` — 토글 버튼, 프로젝트 이름, 우측 `actions` slot
- `ns-sidebar` — 접으면 좌측 레일이 남는 사이드바
- `ns-nav-group` / `ns-nav-item` — 네비게이션 그룹과 항목

## 설치

npm 레지스트리를 쓰지 않는다. git 태그로 설치한다.

```json
"dependencies": {
  "@neosimplix/common-ui": "git+https://github.com/neosimplix/dashboard-common-ui.git#v0.1.5"
}
```

**태그를 반드시 지정한다.** `main` 에는 `dist/` 가 없어서 브랜치를 가리키면 설치는 되지만 import 가 실패한다. 사용할 수 있는 태그는 `git tag -l` 로 확인한다.

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

브라우저 요구사항은 Chrome 123 · Safari 17.5 · Firefox 120 이상이다. `light-dark()` 가 기준선이다.

**Tailwind 를 쓰면 레이어 순서를 선언해야 한다.** `controls.css` 는 `@layer ns-controls` 로 감싸 배포되므로, 이 한 줄이 없으면 Tailwind preflight 가 클래스 스타일을 지운다.

```css
/* Tailwind import 보다 위 */
@layer theme, base, ns-controls, components, utilities;
@import "tailwindcss";
```

## 0.2.0 에서 깨지는 것 둘

- **토큰 이름에 `--ns-` 접두사가 붙는다.** `var(--space-3)` → `var(--ns-space-3)`. 옛 이름을 계속 쓰려면 위의 `aliases.css` 를 임포트한다.
- **React 의 `NsSidebar` 가 `Sidebar` 로 바뀐다.** `import { Sidebar }` 로 고치고, 프롭은 `onNsNavigate={(e) => …e.detail}` 대신 `onNavigate={(detail) => …}` 다. 이 shim 이 SSR 너비 튐을 없애므로 사이드바를 감싸던 래퍼 `<div>` 와 거기 복제해 둔 너비·트랜지션 값을 지운다.

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
