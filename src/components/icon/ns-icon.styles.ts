import { css } from "lit";

export const styles = css`
  /*
    크기(width/height)는 tokens.css 의 ns-icon 규칙이 정한다. 문서 트리의
    선택자가 :host 를 이기므로 여기에 값을 두면 두 곳에 존재하게 된다 —
    var() 폴백을 금지하는 것과 같은 이유다.
  */
  :host {
    display: inline-flex;
    flex: none;
  }

  svg {
    display: block;
    width: 100%;
    height: 100%;
  }
`;
