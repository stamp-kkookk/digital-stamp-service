/**
 * GET /api/v1/customer/stores/{storeId}/active-stamp-card
 * 고객이 진입 시 보게 될 활성 스탬프 카드 요약 정보
 */
export interface ActiveStampCardSummary {
  storeInfo: {
    storeId: number;
    storeName: string; // 예: "꾸욱카페"
  };
  stampCardInfo: {
    stampCardId: number;
    name: string; // 예: "여름맞이 스페셜 원두"
    reward: string; // 예: "아메리카노 1잔"
    totalStampCount: number; // 예: 10
    stampImageUrl: string; // 스탬프 이미지 URL
  };
}

/**
 * 프론트엔드에서 자체적으로 관리할 사용자 상태
 * API 응답이 아닌, 클라이언트의 인증 상태에 따라 결정
 */
export type UserStatus = 'GUEST' | 'LOGGED_IN_NO_WALLET' | 'LOGGED_IN_WITH_WALLET';
