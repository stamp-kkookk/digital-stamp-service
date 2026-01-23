import { useQuery } from '@tanstack/react-query';
import { getStoreSummary } from '../../lib/api/store';

const QUERY_KEY = ['storeSummary'];

export const useStoreSummaryQuery = (storeId: string) => {
  return useQuery({
    queryKey: [...QUERY_KEY, storeId],
    queryFn: () => getStoreSummary(storeId),
    enabled: !!storeId, // storeId가 있을 때만 쿼리 실행
  });
};
