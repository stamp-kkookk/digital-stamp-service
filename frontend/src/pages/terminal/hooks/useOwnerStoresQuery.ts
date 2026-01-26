import { useQuery } from '@tanstack/react-query';
import { fetchOwnerStores } from '../api/owner';
import { getMockOwnerStores } from '../../../../mock/ownerStores'; // Import mock data

// 환경 변수로 Mock 사용 여부 결정 (기본값: 개발 모드에서는 Mock 사용)
const USE_MOCK = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK !== 'false';

export const useOwnerStoresQuery = () => {
  return useQuery({
    queryKey: ['owner', 'stores'],
    queryFn: () => {
      if (USE_MOCK) {
        console.log('[MOCK MODE] Using mock data for owner stores');
        return getMockOwnerStores();
      }
      return fetchOwnerStores();
    },
  });
};
