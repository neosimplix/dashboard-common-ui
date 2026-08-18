// 등록 부수효과. document.createElement("ns-dialog") 가 업그레이드된 요소를 주려면 필요하다.
import "./ns-dialog.js";

export interface NsAlertOptions {
  /**
   * 대화상자 제목. **타입상 선택이지만 실질적으로 필수다.**
   *
   * ns-dialog 는 `<dialog aria-labelledby="dialog-heading">` 로 이 제목을 가리키므로,
   * 비우면 모달에 접근 가능한 이름이 없다 — 스크린리더가 "대화상자" 라고만 읽는다.
   *
   * 비워도 제목 줄이 사라지지는 않는다. ns-dialog 는 헤더를 조건 없이 그리므로
   * 닫기 버튼과 아래 경계선은 그대로 남고 글자만 빈다.
   */
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
 * `show()`/네이티브 닫힘 경로가 맞다. 제어 모드가 아니므로 `show()`·`close()` 가
 * 경고하지 않는다.
 */
function open(
  options: NsConfirmOptions,
  withCancel: boolean,
  resolve: (ok: boolean) => void,
): void {
  /*
    포커스를 돌려줄 곳. 대화상자를 열기 전에 잡아 둔다.
    아래 finish() 의 복원 주석에 왜 브라우저에만 맡기지 않는지 적어 뒀다.
  */
  const opener = document.activeElement;

  const el = document.createElement("ns-dialog");
  el.heading = options.heading ?? "";

  const body = document.createElement("p");
  body.textContent = options.message;
  /*
    ns-dialog 의 .body 가 이미 패딩을 주므로 <p> 의 UA 여백은 군더더기다.
    클래스를 만들지 않는 이유: 이 <p> 는 이 함수만 만들고 소비자가 손댈 수 없어서,
    controls.css 에 이름을 하나 더 늘릴 근거가 없다. 인라인 스타일인 것도 같은
    이유로 의도된 것이다 — 소비자가 이 <p> 에 선택자를 걸 방법이 없으므로
    덮을 수 없는 값이고, 덮을 수 있어야 할 이유도 없다.
  */
  body.style.margin = "0";
  el.append(body);

  /* 닫힘 경로가 여럿이라(확인·취소·ESC·백드롭·닫기 버튼) 정리를 한 곳에 모은다. */
  let settled = false;
  const finish = (ok: boolean): void => {
    if (settled) return;
    settled = true;

    /*
      순서가 전부다.

      remove() 만 하면 대화상자가 top layer 에서 빠지기만 하고 네이티브 "close the
      dialog" 단계가 돌지 않는다. 그 단계에 포커스 복원이 들어 있어서, 건너뛰면
      확인·취소로 닫았을 때 포커스가 <body> 로 떨어지고 다음 Tab 이 문서 맨 위에서
      다시 시작한다. ESC 는 브라우저가 직접 닫으니 무관하지만 나머지 네 경로가 전부
      이 문제를 갖는다 — 백드롭·닫기 버튼도 ns-dialog 의 updated() 를 타긴 하는데
      그때는 이미 제거된 뒤라 늦다.

      ns-dialog 의 close() 는 #innerOpen 을 내리고 requestUpdate() 만 한다. 실제
      네이티브 close() 는 다음 갱신의 updated() 에서 돈다. 그래서 그 갱신을 기다린
      뒤에 지운다 — 뒤집으면 제거가 먼저 포커스를 <body> 로 옮겨서 이어 도는
      복원 조건을 깬다. 마이크로태스크 한 번이라 그 사이에 프레임은 그려지지 않는다.
    */
    el.close();

    const cleanup = (): void => {
      el.remove();
      /*
        resolve 를 포커스보다 먼저 한다. focus() 가 던지면 Promise 가 영영 안 풀린다.
      */
      resolve(ok);

      /*
        **지우지 말 것 — 죽은 줄이 아니다.**

        명세의 복원 조건은 논리합이다: 포커스가 대화상자의 shadow-including 자손일
        것, **또는** wasModal 이 참일 것. 이 대화상자는 언제나 showModal() 로 열리고
        위 순서 덕분에 아직 붙어 있고 모달인 채로 close 단계가 도니까, 명세를 따르는
        엔진은 다섯 경로 모두에서 무조건 복원한다 — 자손이냐 아니냐는 물어보지도
        않는다.

        이 줄은 그 뒤 항을 구현하지 않고 자손 검사만 하는 엔진을 위한 backstop 이다.
        그런 엔진에서는 확인·취소 버튼이 slot 으로 배정될 뿐 shadow 의 <dialog> 의
        자손이 아니라서 하필 가장 많이 쓰는 두 경로만 복원이 빠진다. 이미 복원된
        경우에는 같은 요소라 아무 일도 일어나지 않는다.
      */
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
    /*
      성공·실패 양쪽에 같은 함수를 건다. 갱신 중 예외로 updateComplete 가 reject
      되면 then(cleanup) 하나로는 요소가 문서에 남고 Promise 가 영영 안 풀린다.
    */
    void el.updateComplete.then(cleanup, cleanup);
  };

  /*
    초기 포커스를 직접 준다. autofocus 속성은 여기서 죽는다 — 이유가 둘 겹친다.

    ① ns-dialog 의 hasFooter 는 false 로 시작하므로 첫 렌더가 footer 를
       `[hidden]` 으로 그리고, `.footer[hidden] { display: none }` 이다. 그런데
       showModal() 은 바로 그 첫 갱신의 updated() 에서 동기로 불린다. 초기 포커스를
       정하는 시점에 취소 버튼은 display:none 안이라 포커스 가능 영역이 아니다.
    ② 취소 버튼은 slot 으로 배정될 뿐 shadow 의 <dialog> 의 노드 트리 자손이 아니라
       autofocus 후보 탐색이 닿는지가 구현에 달렸다.

    hasFooter 는 slotchange 로 뒤늦게 켜지고, 그 slotchange 는 첫 갱신이 끝난 뒤의
    마이크로태스크에서 돈다. 즉 갱신을 한 번 더 기다려야 한다.

    갱신 횟수를 세지 않는다. 첫 updateComplete 는 hasFooter 가 켜지기 전에 이미
    true 로 풀리므로 `while (!(await updateComplete))` 관용구가 통하지 않고, 몇 번
    기다려야 하는지는 lit 과 브라우저의 마이크로태스크 순서에 달린 값이다. 대신
    포커스가 실제로 갔는지를 보고 끝낸다 — 조건을 직접 관찰하므로 그 순서가 바뀌어도
    어긋나지 않는다. 상한이 있어 어떤 경우에도 유한 번에 멈춘다.

    `document.activeElement === target` 이 성립하는 것은 **취소 버튼이 light DOM
    이기 때문이다.** 그 뿌리가 문서라 activeElement 가 버튼 자신을 준다. shadow
    안이었다면 호스트로 재타깃되어 이 조건이 영영 참이 되지 않고 루프가 상한까지
    헛돌았을 것이다.
  */
  const focusInitial = async (target: HTMLButtonElement): Promise<void> => {
    for (let i = 0; i < 5; i++) {
      await el.updateComplete;
      if (settled) return;              // 기다리는 사이에 닫혔다
      // 긴 페이지에서 대화상자 뒤 문서가 튀지 않게 한다.
      target.focus({ preventScroll: true });
      if (document.activeElement === target) return;
    }
    /*
      여기 오면 tone: "danger" 가 문서로 약속한 "취소에 초기 포커스" 가 깨진 것이다.
      조용히 넘기면 ns-dialog 의 갱신 순서가 바뀌는 날 약속만 거짓이 되고 아무
      흔적이 남지 않는다. 이 저장소가 조용한 오설정에 쓰는 방식 그대로 경고한다.
    */
    console.warn(
      "[ns-confirm] 취소 버튼에 초기 포커스를 주지 못했습니다. ns-dialog 의 갱신 순서가 바뀌었을 수 있습니다.",
    );
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

  /** 파괴적 확인에서는 초기 포커스가 취소에 간다. */
  let initialFocus: HTMLButtonElement | null = null;

  if (withCancel) {
    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "ns-button ns-button--outline ns-button--sm";
    cancel.textContent = options.cancelLabel ?? "취소";
    cancel.addEventListener("click", () => finish(false));
    if (options.tone === "danger") initialFocus = cancel;
    footer.append(cancel);
  }

  footer.append(confirm);
  el.append(footer);

  /* ESC · 백드롭 · 닫기 버튼. alert 은 이 경로도 resolve 다. */
  el.addEventListener("ns-dialog-close", () => finish(false));

  document.body.append(el);
  el.show();

  if (initialFocus !== null) void focusInitial(initialFocus);
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
