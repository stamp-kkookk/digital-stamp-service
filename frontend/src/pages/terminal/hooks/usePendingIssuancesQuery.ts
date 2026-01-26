import { useQuery } from '@tanstack/react-query';
import { fetchPendingIssuances } from '../api/terminal';
import { getMockPendingIssuances } from '../../../../mock/terminal';

// 환경 변수로 Mock 사용 여부 결정 (기본값: 개발 모드에서는 Mock 사용)
const USE_MOCK = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK !== 'false';

interface UsePendingIssuancesQueryParams {
  storeId: string;
  page?: number;
  size?: number;
  enabled?: boolean;
}

export const usePendingIssuancesQuery = ({ storeId, page, size, enabled = true }: UsePendingIssuancesQueryParams) => {
  return useQuery({
    queryKey: ['terminals', { storeId }, 'issuance-requests', { page, size }],
    queryFn: () => {
      if (USE_MOCK) {
        console.log('[MOCK MODE] Using mock data for pending issuances');
        return getMockPendingIssuances();
      }
      return fetchPendingIssuances({ storeId, page, size });
    },
    enabled: !!storeId && enabled,
    refetchInterval: USE_MOCK ? false : 5000, // 목업 사용 시 폴링 비활성화
  });
};
