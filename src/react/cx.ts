type ClassValue = string | false | null | undefined;

/**
 * 조건부 클래스를 합친다. 외부 의존성을 쓰지 않기 위한 최소 구현.
 *
 * 공개 API 로 내보내지 않는다 — 여섯 줄짜리고, 내보내면 유지 의무가 생긴다.
 */
export function cx(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
