import type { NsToast, NsToastPosition, NsToastTone } from "./ns-toast.js";

// 등록 부수효과. document.createElement("ns-toast") 가 업그레이드된 요소를 주려면 필요하다.
import "./ns-toast.js";

export interface NsToastOptions {
  tone?: NsToastTone;
  /**
   * **토스트가 머무는 시간(밀리초).** 그만큼 지나면 저절로 닫힌다 — `3000` 이면 3 초다.
   * 기본은 `4000` 이다.
   *
   * **자동으로 사라지지 않게 하려면 `0` 을 준다** — 닫기 버튼이나 반환값으로만 닫힌다.
   * `0` 이 그 뜻으로 쓰는 값이지만, **양수 유한값이 아닌 것은 전부 같은 쪽으로 떨어진다**
   * (음수 · `NaN` · `Infinity`). `Infinity` 를 「영원히」 로 쓰는 관용을 한 프레임 번쩍이는
   * 토스트로 배신하지 않기 위해서다 — 근거는 `ns-toast.ts` 의 `#startItem` 주석에 있다.
   */
  duration?: number;
}

/*
  마지막으로 요청된 자리. **리전보다 오래 산다** — nsToastPosition() 은 토스트가 한 번도
  뜨기 전에도 불릴 수 있고(정상 사용이 그쪽이다), 그때는 값만 여기 남았다가 region() 이
  리전을 만들 때 적용된다. 기본값은 ns-toast 의 프로퍼티 기본값과 같은 "top-center" 다.
*/
let position: NsToastPosition = "top-center";

/*
  문서당 리전 하나. **모듈 평가 시점에 만들지 않는다** — SSR 에서 document 가 없다.
  register() 가 customElements.define 을 미루는 것과 같은 이유다.
*/
function region(): NsToast {
  const found = document.querySelector("ns-toast");
  if (found !== null) return found;
  const el = document.createElement("ns-toast");
  /*
    붙이기 전에 세운다. Lit 의 첫 업데이트는 연결 이후에야 돌므로 여기서 세운 값이
    그 한 번의 업데이트에서 속성으로 반영되고, 속성 없는 중간 상태가 생기지 않는다.
  */
  el.position = position;
  document.body.append(el);
  return el;
}

/**
 * 토스트 리전이 뜨는 자리를 정한다. 네 값 중 하나이고 기본은 `"top-center"` 다.
 *
 * ```ts
 * nsToastPosition("bottom-right");
 * ```
 *
 * **호출마다가 아니라 전역이다.** 리전이 문서당 하나뿐이라 위치는 그 리전의 성질이지
 * 개별 토스트의 성질이 아니다. 위치마다 리전을 따로 두면 정지 상태(hover·포커스)와
 * 쌓기가 리전마다 갈라져, 한쪽에 마우스를 올려도 다른 쪽은 계속 사라진다.
 *
 * 언제 불러도 된다.
 *
 * - 리전이 아직 없으면 값만 기억했다가 만들 때 적용한다.
 * - 이미 있으면 그 리전이 옮겨가고 **떠 있던 토스트도 통째로 함께 움직인다.**
 *   시작 시점에 한 번 부르는 것이 정상 사용이다.
 *
 * 서버에서 부르면 값만 기억하고 아무것도 하지 않는다 — `nsToast()` 와 같은 이유다.
 */
export function nsToastPosition(next: NsToastPosition): void {
  position = next;
  if (typeof document === "undefined") return;
  /*
    region() 을 쓰지 않는다. 자리를 정하는 것만으로 빈 리전이 문서에 생기면 안 된다 —
    없는 것을 옮길 일도 없고, 위에서 기억한 값이 첫 nsToast() 때 적용된다.
  */
  const found = document.querySelector("ns-toast");
  if (found !== null) found.position = next;
}

/**
 * 토스트를 띄운다. **돌려주는 함수를 부르면 즉시 닫힌다**(두 번 불러도 안전).
 *
 * ```ts
 * nsToast("저장했습니다", { tone: "success" });
 *
 * // 머무는 시간을 직접 정한다. 3 초 뒤에 저절로 닫힌다.
 * nsToast("저장했습니다", { duration: 3000 });
 *
 * // 0 이면 저절로 닫히지 않는다. Infinity 를 줘도 같다.
 * const close = nsToast("업로드 중…", { duration: 0 });
 * // …끝나면
 * close();
 * ```
 *
 * 문자열만 받는다. `textContent` 로 넣으므로 HTML 주입 경로가 없다.
 *
 * 서버에서 부르면 아무 일도 하지 않고 no-op 를 돌려준다 — 이벤트 핸들러에서만
 * 부르는 것이 정상이지만, 그 실수가 SSR 을 통째로 깨뜨리게 두지 않는다.
 */
export function nsToast(message: string, options: NsToastOptions = {}): () => void {
  if (typeof document === "undefined") return () => {};
  const { tone = "neutral", duration = 4000 } = options;
  return region().show(message, tone, duration);
}
