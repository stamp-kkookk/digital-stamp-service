import { useMutation, useQueryClient } from '@tanstack/react-query';
import { approveIssuance } from '../api/terminal';

export const useApproveIssuanceMutation = (storeId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => approveIssuance({ storeId, requestId }),
    onSuccess: () => {
      // 승인 성공 시, 관련 쿼리를 무효화하여 데이터를 새로고침합니다.
      queryClient.invalidateQueries({ queryKey: ['terminals', { storeId }, 'issuance-requests'] });
      queryClient.invalidateQueries({ queryKey: ['terminals', { storeId }, 'kpi'] });
    },
    onError: (error) => {
      console.error('Failed to approve issuance:', error);
      // 여기에 에러 처리 로직을 추가할 수 있습니다 (예: 토스트 메시지).
    },
  });
};
