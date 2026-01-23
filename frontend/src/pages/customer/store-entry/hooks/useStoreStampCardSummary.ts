import { useQuery } from '@tanstack/react-query';
import { ActiveStampCardSummary } from '../types';
import { getMockActiveStampCardSummary } from './mock';

// NOTE: 백엔드 연결 시 아래 실제 fetch 함수를 사용하고, queryFn을 교체해야 합니다.
/*
const fetchActiveStampCardSummary = async (storeId: string): Promise<ActiveStampCardSummary | null> => {
  // TODO: .env 파일 등으로 API base URL 분리
  const response = await fetch(`/api/v1/customer/stores/${storeId}/active-stamp-card`);

  if (!response.ok) {
    // 404 외 다른 클라이언트/서버 에러는 Error Boundary 또는 isError 플래그로 처리
    throw new Error('Failed to fetch store information');
  }

  // API가 204 No Content 또는 빈 body를 반환하는 경우를 EMPTY 상태로 간주
  if (response.status === 204) {
    return null;
  }
  
  const data = await response.json();
  // 데이터가 명시적으로 null 이거나 빈 객체일 경우 EMPTY 상태로 처리
  if (!data || Object.keys(data).length === 0) {
      return null;
  }

  return data;
};
*/

export const useStoreStampCardSummary = (storeId: string) => {
  return useQuery({
    queryKey: ['activeStampCardSummary', storeId],
    // MOCK: 실제 API 대신 목업 함수를 사용합니다.
    queryFn: () => getMockActiveStampCardSummary(storeId),
    // 재시도 로직이나 stale time 등은 정책에 따라 추가
  });
};
