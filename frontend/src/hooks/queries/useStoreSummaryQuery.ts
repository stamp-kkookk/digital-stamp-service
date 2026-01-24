import { useQuery } from '@tanstack/react-query';
import { getStoreSummary } from '../../lib/api/store';
import { getMockStoreSummary } from '../../../mock/storeSummary';

const QUERY_KEY = ['storeSummary'];

// 환경 변수로 Mock 사용 여부 결정 (기본값: 개발 모드에서는 Mock 사용)
const USE_MOCK = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK !== 'false';

export const useStoreSummaryQuery = (storeId: string) => {
  return useQuery({
    queryKey: [...QUERY_KEY, storeId],
    queryFn: () => {
      if (USE_MOCK) {
        console.log('[MOCK MODE] Using mock data for storeId:', storeId);
        return getMockStoreSummary(storeId);
      }
      return getStoreSummary(storeId);
    },
    enabled: !!storeId, // storeId가 있을 때만 쿼리 실행
  });
};
