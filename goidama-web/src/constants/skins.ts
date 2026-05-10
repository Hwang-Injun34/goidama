/**
 * 서비스에서 사용 가능한 스킨 설정
 */

// 현재 폴더에 있는 스킨의 총 개수 (1번부터 n번까지 있다고 가정)
export const MAX_SKIN_COUNT = 24; 

// 이스터에그 스킨 ID (일반 선택 목록에서 제외할 번호들)
export const EASTER_EGG_SKIN_IDS = [1030];

/**
 * 사용자가 선택 가능한 일반 스킨 ID 배열 생성
 * 결과: [1, 2, 3, ..., 24] (1030은 포함되지 않음)
 */
export const AVAILABLE_SKIN_IDS = Array.from(
  { length: MAX_SKIN_COUNT },
  (_, i) => i + 1
).filter((id) => !EASTER_EGG_SKIN_IDS.includes(id));

/**
 * 특정 스킨 ID가 유효한지 확인하는 함수 (렌더링 시 방어 코드용)
 */
export const isValidSkinId = (id: number) => {
  return (id >= 1 && id <= MAX_SKIN_COUNT) || EASTER_EGG_SKIN_IDS.includes(id);
};