/**
 * 커스텀 엘리먼트를 안전하게 등록한다.
 *
 * @customElement 데코레이터를 쓰지 않는 이유가 여기 있다. 그 데코레이터는
 * 모듈 평가 시점에 customElements.define 을 호출하는데, Next 의 서버
 * 렌더링처럼 브라우저가 아닌 곳에서 import 되면 그대로 터진다.
 */
export declare function register(tag: string, ctor: CustomElementConstructor): void;
