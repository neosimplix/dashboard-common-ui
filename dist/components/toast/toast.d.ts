import type { NsToastPosition, NsToastTone } from "./ns-toast.js";
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
export declare function nsToastPosition(next: NsToastPosition): void;
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
export declare function nsToast(message: string, options?: NsToastOptions): () => void;
