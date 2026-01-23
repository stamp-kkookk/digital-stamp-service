import { ActiveStampCardSummary } from '../types';

// UI 상태를 확인하려면 이 값을 'READY' 또는 'EMPTY'로 변경하세요.
const MOCK_STATE: 'READY' | 'EMPTY' = 'READY';

/**
 * 활성 스탬프 카드 요약 정보에 대한 목(mock) 응답을 생성합니다.
 * @param storeId 
 * @returns 
 */
export const getMockActiveStampCardSummary = async (storeId: string): Promise<ActiveStampCardSummary | null> => {
  console.log(
    `%c[MOCK] Fetching active stamp card for storeId: ${storeId}. Mock state: ${MOCK_STATE}`,
    'background: #222; color: #bada55'
  );

  // 실제 네트워크 딜레이를 시뮬레이션합니다.
  await new Promise(resolve => setTimeout(resolve, 500));

  if (MOCK_STATE === 'EMPTY') {
    return null;
  }
  
  // 'READY' 상태의 목 데이터
  return {
    storeInfo: {
      storeId: parseInt(storeId, 10) || 1,
      storeName: '꾸욱카페 (Mock)',
    },
    stampCardInfo: {
      stampCardId: 1,
      name: '여름맞이 스페셜 원두 (Mock)',
      reward: '아메리카노 1잔',
      totalStampCount: 10,
      // public 폴더에 있는 기본 vite 아이콘을 임시로 사용합니다.
      stampImageUrl: '/vite.svg',
    },
  };
};
