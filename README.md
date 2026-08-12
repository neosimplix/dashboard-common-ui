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
| `npm run check` | 타입 검사 + 이벤트 매핑 검사 |
| `npm run build` | `dist/` 에 ES · React · UMD · tokens.css 생성 |
| `npm run demo` | 빌드 후 `index.html` 열기 |
| `npm run release -- 0.1.0` | 빌드 산출물을 포함한 `v0.1.0` 태그 생성·푸시 |

테스트 러너가 없다. `npm run check` 와 `index.html` 육안 확인이 회귀 확인
수단이다. 문서 페이지의 헤더와 네비게이션 자체가 이 패키지의 컴포넌트라,
깨지면 문서가 열리지 않는 것으로 드러난다. 컴포넌트를 추가하면
`index.html` 에도 섹션을 추가한다.

## 설계

`docs/superpowers/specs/2026-08-12-common-ui-web-components-design.md`
