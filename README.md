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

## 릴리스

**`dist/` 가 바뀌었는지**를 태그마다 적는다. 안 바뀐 릴리스는 설치해도 화면이 그대로이므로, 소비자가 태그별로 받아 `diff -rq` 하기 전에는 알 수 없다.

| 태그 | `dist/` | 소비자가 할 일 |
|---|---|---|
| `v0.4.0` | 변경 | **breaking 둘.** 아래 이관 절을 본다 |
| `v0.3.0` | 변경 | 태그만 올린다. 컴포넌트 둘과 클래스 여섯, 명령형 API 셋이 늘었다. 아래 이관 절을 본다 |
| `v0.2.5` | 변경 | 태그만 올린다. `ns-icon` 슬롯 자식이 하이드레이션 때 튀지 않는다. 프로퍼티 전용 이름을 속성으로 쓰면 경고가 나온다 |
| `v0.2.4` | **동일** (`v0.2.2` 와 바이트 일치) | 없음. `index.html` 다크모드 코드 블록 수정 — 문서만 |
| `v0.2.3` | **동일** (`v0.2.2` 와 바이트 일치) | 없음. 예시를 `name` 대신 슬롯 우선으로 개편 — 문서만 |
| `v0.2.2` | 변경 | 태그만 올린다. `ns-icon` 이 기본 슬롯을 갖는다 |
| `v0.2.1` | 변경 | 태그만 올린다. `globals.css` 에 사이드바 경계선을 되살려 둔 것이 있으면 지운다 |
| `v0.2.0` | 변경 | **breaking 둘.** 아래 이관 절을 본다 |

## 0.3.0 → 0.4.0 이관

**breaking 이 둘이다.** 둘 다 고치는 데는 한 줄씩이면 된다.

### ① 액센트 토큰 둘이 사라졌다

`--ns-color-accent` 가 **선·링 전용**으로 좁아졌다. 지금 그 토큰이 칠하는 것은 포커스 링 여섯 · 입력 포커스 테두리 · 탭 활성 밑줄 · 체크박스 `accent-color` 뿐이고 전부 선이다. 선에는 hover 상태도 없고 그 위에 놓이는 글자도 없으므로, 그 둘을 가리키던 이름이 가리킬 것을 잃었다.

| 사라진 것 | 대신 쓸 것 |
|---|---|
| `--ns-color-accent-hover` | `--ns-color-accent-fill-hover` |
| `--ns-color-accent-fg` | `--ns-color-accent-fill-fg` |

**무접두사 별칭 `--color-accent-hover`·`--color-accent-fg` 도 함께 사라진다.** 채움면 토큰 셋에는 별칭이 없으므로 무접두사 이름으로는 대체할 것이 없다 — `--ns-` 이름을 쓴다.

**덮어 쓰고 있었다면 지금 조용히 무시되고 있다.** 이 둘을 브랜딩으로 덮었다면 그 선언은 0.4.0 부터 아무것도 하지 않는다. 오류도 경고도 없다. 채움면 색을 바꾸려면 `--ns-color-accent-fill` 셋을, 링 색을 바꾸려면 `--ns-color-accent` 를 덮는다.

```css
:root {
  /* 0.3.0 까지 */
  --ns-color-accent:       oklch(55% .18 265);
  --ns-color-accent-hover: oklch(48% .18 265);
  --ns-color-accent-fg:    #fff;

  /* 0.4.0 부터 — 링은 accent, 면은 accent-fill */
  --ns-color-accent:            oklch(55% .18 265);
  --ns-color-accent-fill:       oklch(55% .18 265);
  --ns-color-accent-fill-hover: oklch(48% .18 265);
  --ns-color-accent-fill-fg:    #fff;
}
```

**왜 나눴나.** 다크모드에서 `solid` 버튼이 눈부셨다. 액센트 하나를 어둡게 내리면 같은 토큰을 쓰던 **포커스 링이 어두운 배경에 묻혀 사라진다** — 버튼이 밝은 것보다 나쁜 결함이다. 면과 선은 밝기 요구가 반대라 한 토큰이 둘 다 될 수 없다.

### ② 토스트 기본 자리가 상단 중앙으로 바뀌었다

`nsToast()` 는 우하단이 아니라 **상단 중앙**에 뜬다. 우하단을 유지하려면 앱 시작 시점에 한 줄 부른다.

```ts
import { nsToastPosition } from "@neosimplix/common-ui";

nsToastPosition("bottom-right");
```

`"top-center"`(기본) · `"bottom-center"` · `"top-right"` · `"bottom-right"` 넷이다. **리전이 문서당 하나**라 위치는 개별 토스트가 아니라 리전의 성질이고, 그래서 호출마다가 아니라 전역 설정이다. 이미 떠 있는 토스트가 있을 때 부르면 **그것들도 함께 옮겨간다.**

### 함께 바뀐 것

| 무엇 | 성격 |
|---|---|
| `nsToast(msg, { duration })` | **추가** — 지정한 밀리초가 지나면 스스로 닫힌다. 기본 4000. `0` 을 주면 영구다(음수·`NaN`·`Infinity` 도 같은 자리로 모인다). 마우스가 위에서 **움직이거나** 안쪽에 포커스가 있는 동안 멈춘다 |
| 커서 밑에 뜬 토스트가 안 사라지던 것 | **fix** — 포인터가 멈춰 있어도 요소가 그 밑에 생기면 브라우저가 `mouseenter` 를 합성한다. 뜨자마자 정지 상태로 들어가 타이머가 지워졌다. 정지를 `mousemove` 로 옮겼다 |
| 토스트 왼쪽 색 띠 → 메시지 앞 작은 점 | **변경** — `tone` 을 안 주면(`neutral`) 아무것도 그리지 않는다 |
| 선택된 `.ns-chip` 안의 체크 표시 | **추가** — 자리는 선택 여부와 무관하게 늘 잡혀 있어 토글해도 칩 폭이 변하지 않는다. `role="checkbox"` 인 칩에만 붙는다 |
| `--ns-color-disabled` 다크값 · `--ns-color-disabled-fg` | **변경·추가** — 다크에서 비활성 `solid`·`danger` 버튼이 정상 버튼과 같은 색이 되던 것을 되살렸다. 밝은 모드는 바뀌지 않는다 |

## 0.2.5 → 0.3.0 이관

**소비자가 할 일은 없다.** 태그만 올린다. 이 표는 태그를 자를 때 빠졌던 것을 나중에 채운 것이다.

| 무엇 | 성격 |
|---|---|
| `ns-tabs` · `ns-multi-select` | **추가** — 컴포넌트 둘. `ns-tabs` 는 소비자 마크업에 ARIA 와 키보드를 얹는 Light DOM 이다 |
| `nsToast` · `nsAlert` · `nsConfirm` | **추가** — 명령형 API 셋. 뒤 둘은 `Promise` 를 돌려준다 |
| `.ns-accordion` · `.ns-message` · `.ns-chip` · `.ns-card` 머리-본문 · `.ns-button--danger` · `.ns-table--rows-clickable` | **추가** — 클래스 |
| `ns-table` 의 체크박스 선택이 React 제어 입력에서 죽던 것 | **fix** — `change` 가 아니라 `click` 에서 읽는다. React 는 자기 루트 클릭 처리 끝에 값을 복원하므로 `change` 핸들러는 언제나 복원된 값을 본다 |
| 정렬 헤더 클릭이 죽던 것 | **fix** — 체크박스 갈래를 훅이 붙은 박스로 좁혔다 |
| `aria-sort="none"` 하이드레이션 불일치 | **fix** — `none` 은 ARIA 의 기본값이라 쓰는 것과 안 쓰는 것이 같다. 정렬되지 않은 칼럼에서는 속성을 지운다 |

## 0.2.4 → 0.2.5 이관

**소비자가 할 일은 없다.** 태그만 올린다.

| 무엇 | 성격 |
|---|---|
| `ns-icon` 슬롯 자식의 크기 정규화 | **fix** — `::slotted(*)` 는 shadow 안이라 upgrade 이후에만 존재해서, 자기 `width`/`height` 를 갖고 오는 자식(lucide 계열)이 하이드레이션 때 24 → 20 으로 줄어들었다. `tokens.css` 에 문서 트리 짝을 두어 그 구간을 덮는다 |
| 프로퍼티 전용 이름을 속성으로 쓰면 경고 | **추가** — `<ns-dialog open>` 은 제어 모드로 들어가는 것이 아니라 **무시된다.** 아무 일도 안 일어나고 콘솔도 조용했다. `ns-pagination` 의 `page`, `ns-table` 의 `sort-key`·`sort-direction`·`selected` 도 같다 |

`<ns-dialog open>` 을 쓰고 계셨다면 **지금까지 대화상자가 열리지 않고 있었다는 뜻이다.** `default-open` 으로 바꾸거나 `el.open = true` 로 대입한다.

## 0.2.1 → 0.2.2 이관

**소비자가 할 일은 없다.** 태그만 올린다.

`ns-icon` 이 기본 슬롯을 갖는다. **자식을 넣으면 그것이 그려지고 `name` 은 읽히지 않는다.** 등록도 빌드 설정도 필요 없으므로, 앱 아이콘은 대개 이쪽이 짧다.

```tsx
import { House, Settings } from "lucide-react";

<NsIcon><House /></NsIcon>
<NsNavItem href="/" label="개요"><NsIcon slot="leading"><House /></NsIcon></NsNavItem>
```

크기는 `ns-icon` 이 정한다. 넣은 것이 자기 `width`/`height` 를 갖고 와도(lucide 계열은 24 를 찍는다) `--ns-icon-size` 상자에 맞춰진다 — 프레젠테이션 속성은 어떤 CSS 규칙에도 지기 때문이다. 다르게 하려면 그 요소에 인라인 `style` 을 준다. **정규화는 upgrade 전에도 걸린다** — 같은 선언이 shadow 의 `::slotted(*)` 와 `tokens.css` 의 `ns-icon > *` 두 벌로 있어서, 하이드레이션 때 24 → 20 으로 줄어드는 튐이 없다.

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
