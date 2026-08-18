import type { NsToast, NsToastTone } from "./ns-toast.js";

// 등록 부수효과. document.createElement("ns-toast") 가 업그레이드된 요소를 주려면 필요하다.
import "./ns-toast.js";

export interface NsToastOptions {
  tone?: NsToastTone;
  /** 밀리초. **`0` 이면 자동으로 사라지지 않는다** — 닫기 버튼이나 반환값으로만 닫힌다. */
  duration?: number;
}

/*
  문서당 리전 하나. **모듈 평가 시점에 만들지 않는다** — SSR 에서 document 가 없다.
  register() 가 customElements.define 을 미루는 것과 같은 이유다.
*/
function region(): NsToast {
  const found = document.querySelector("ns-toast");
  if (found !== null) return found;
  const el = document.createElement("ns-toast");
  document.body.append(el);
  return el;
}

/**
 * 토스트를 띄운다. **돌려주는 함수를 부르면 즉시 닫힌다**(두 번 불러도 안전).
 *
 * ```ts
 * nsToast("저장했습니다", { tone: "success" });
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
