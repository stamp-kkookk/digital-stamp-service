import type { StoreStampCardSummaryResponse } from '../src/types/store';

/**
 * Mock 데이터: 매장 스탬프 카드 요약
 */
export const mockStoreSummaryData: Record<string, StoreStampCardSummaryResponse> = {
  '1': {
    storeName: '꾸욱카페 강남점',
    stampCard: {
      stampCardId: 1,
      name: '여름맞이 스페셜 원두',
      reward: '아메리카노 1잔',
      stampBenefit: '스탬프 1개 적립',
      imageUrl: '/vite.svg',
    },
  },
  '2': {
    storeName: '꾸욱카페 홍대점',
    stampCard: {
      stampCardId: 2,
      name: '겨울 시즌 카드',
      reward: '카페라떼 1잔',
      stampBenefit: '스탬프 1개 적립',
      imageUrl: '/vite.svg',
    },
  },
  '3': {
    storeName: '꾸욱카페 신촌점',
    stampCard: null, // Empty state 테스트용
  },
};

/**
 * Mock API 함수: 실제 API 대신 사용
 */
export const getMockStoreSummary = async (
  storeId: string,
): Promise<StoreStampCardSummaryResponse> => {
  // 실제 API 호출처럼 딜레이 추가
  await new Promise((resolve) => setTimeout(resolve, 500));

  const data = mockStoreSummaryData[storeId];

  if (!data) {
    throw new Error(`Store with id ${storeId} not found`);
  }

  return data;
};
