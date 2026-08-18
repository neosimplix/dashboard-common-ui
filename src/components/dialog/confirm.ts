// 등록 부수효과. document.createElement("ns-dialog") 가 업그레이드된 요소를 주려면 필요하다.
import "./ns-dialog.js";

export interface NsAlertOptions {
  /** 대화상자 제목. 비우면 제목 줄 없이 본문만 나온다. */
  heading?: string;
  /** 본문. 문자열만 받는다 — textContent 로 들어가므로 HTML 주입 경로가 없다. */
  message: string;
  confirmLabel?: string;
}

export interface NsConfirmOptions extends NsAlertOptions {
  cancelLabel?: string;
  /**
   * `"danger"` 면 확인 버튼이 `.ns-button--danger` 이고 **취소에 초기 포커스가 간다.**
   * 네이티브 `<dialog>` 의 초기 포커스가 파괴적 동작에 놓이면 Enter 한 번에 지워진다.
   */
  tone?: "default" | "danger";
}

/**
 * 대화상자를 만들어 띄우고, 닫힐 때 resolve 한다.
 *
 * 비제어로 쓴다 — 이 대화상자는 소비자가 상태를 갖지 않는 것이 목적이므로
 * `show()`/네이티브 닫힘 경로가 맞다.
 */
function open(
  options: NsConfirmOptions,
  withCancel: boolean,
  resolve: (ok: boolean) => void,
): void {
  const el = document.createElement("ns-dialog");
  el.heading = options.heading ?? "";

  const body = document.createElement("p");
  body.textContent = options.message;
  /*
    ns-dialog 의 .body 가 이미 패딩을 주므로 <p> 의 UA 여백은 군더더기다.
    클래스를 만들지 않는 이유: 이 <p> 는 이 함수만 만들고 소비자가 손댈 수 없어서,
    controls.css 에 이름을 하나 더 늘릴 근거가 없다.
  */
  body.style.margin = "0";
  el.append(body);

  /* 닫힘 경로가 여럿이라(확인·취소·ESC·백드롭·닫기 버튼) 정리를 한 곳에 모은다. */
  let settled = false;
  const finish = (ok: boolean): void => {
    if (settled) return;
    settled = true;
    el.remove();
    resolve(ok);
  };

  const confirm = document.createElement("button");
  confirm.type = "button";
  confirm.className =
    options.tone === "danger"
      ? "ns-button ns-button--danger ns-button--sm"
      : "ns-button ns-button--solid ns-button--sm";
  confirm.textContent = options.confirmLabel ?? "확인";
  confirm.addEventListener("click", () => finish(true));

  const footer = document.createElement("div");
  footer.slot = "footer";

  if (withCancel) {
    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "ns-button ns-button--outline ns-button--sm";
    cancel.textContent = options.cancelLabel ?? "취소";
    cancel.addEventListener("click", () => finish(false));
    // 파괴적 확인에서는 초기 포커스가 취소에 간다.
    if (options.tone === "danger") cancel.autofocus = true;
    footer.append(cancel);
  }

  footer.append(confirm);
  el.append(footer);

  /* ESC · 백드롭 · 닫기 버튼. alert 은 이 경로도 resolve 다. */
  el.addEventListener("ns-dialog-close", () => finish(false));

  document.body.append(el);
  el.show();
}

/**
 * 알린다. 확인 · ESC · 백드롭 · 닫기 버튼 어느 쪽으로 닫혀도 resolve 한다.
 *
 * ```ts
 * await nsAlert({ heading: "권한 없음", message: "관리자에게 문의하세요." });
 * ```
 *
 * 서버에서 부르면 즉시 resolve 한다 — 이벤트 핸들러에서만 부르는 것이 정상이지만,
 * 그 실수가 SSR 을 통째로 깨뜨리게 두지 않는다.
 */
export function nsAlert(options: NsAlertOptions): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  return new Promise((resolve) => {
    open(options, false, () => resolve());
  });
}

/**
 * 묻는다. 확인이면 `true`, **취소 · ESC · 백드롭 · 닫기 버튼은 `false`** 다.
 *
 * ```ts
 * if (await nsConfirm({ heading: "삭제", message: "되돌릴 수 없습니다.", tone: "danger" })) {
 *   await remove();
 * }
 * ```
 *
 * 여러 번 부르면 네이티브 top layer 에 쌓인다 — 별도 큐를 두지 않는다.
 *
 * 서버에서 부르면 즉시 `false` 다.
 */
export function nsConfirm(options: NsConfirmOptions): Promise<boolean> {
  if (typeof document === "undefined") return Promise.resolve(false);
  return new Promise((resolve) => {
    open(options, true, resolve);
  });
}
