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
 * 알린다. 확인 · ESC · 백드롭 · 닫기 버튼 어느 쪽으로 닫혀도 resolve 한다.
 *
 * ```ts
 * await nsAlert({ heading: "권한 없음", message: "관리자에게 문의하세요." });
 * ```
 *
 * 서버에서 부르면 즉시 resolve 한다 — 이벤트 핸들러에서만 부르는 것이 정상이지만,
 * 그 실수가 SSR 을 통째로 깨뜨리게 두지 않는다.
 */
export declare function nsAlert(options: NsAlertOptions): Promise<void>;
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
export declare function nsConfirm(options: NsConfirmOptions): Promise<boolean>;
