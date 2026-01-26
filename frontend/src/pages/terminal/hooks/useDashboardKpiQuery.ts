import { useQuery } from '@tanstack/react-query';
import { fetchDashboardKpi } from '../api/terminal';
import { getMockDashboardKpi } from '../../../../mock/terminal';

// 환경 변수로 Mock 사용 여부 결정 (기본값: 개발 모드에서는 Mock 사용)
const USE_MOCK = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK !== 'false';

export const useDashboardKpiQuery = (storeId: string) => {
  return useQuery({
    queryKey: ['terminals', { storeId }, 'kpi'],
    queryFn: () => {
      if (USE_MOCK) {
        console.log('[MOCK MODE] Using mock data for dashboard KPI');
        return getMockDashboardKpi();
      }
      return fetchDashboardKpi(storeId);
    },
    enabled: !!storeId,
    refetchInterval: USE_MOCK ? false : 30000, // 목업 사용 시 폴링 비활성화
  });
};
