import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { stampCardApi } from '../api/stampCardApi'
import type { StampCardStatus } from '@/types/stampCard'

interface UseStampCardListParams {
    storeId: number
    status?: StampCardStatus
    page?: number
    size?: number
}

export function useStampCardList({ storeId, status, page = 0, size = 10 }: UseStampCardListParams) {
    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey: ['stampCards', storeId, status, page, size],
        queryFn: () => stampCardApi.list(storeId, { status, page, size }),
        enabled: !!storeId,
    })

    const deleteMutation = useMutation({
        mutationFn: (stampCardId: number) => stampCardApi.delete(storeId, stampCardId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stampCards', storeId] })
        },
    })

    const updateStatusMutation = useMutation({
        mutationFn: ({ stampCardId, newStatus }: { stampCardId: number; newStatus: StampCardStatus }) =>
            stampCardApi.updateStatus(storeId, stampCardId, { status: newStatus }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stampCards', storeId] })
        },
    })

    return {
        data: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        deleteStampCard: deleteMutation.mutateAsync,
        updateStatus: updateStatusMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
        isUpdatingStatus: updateStatusMutation.isPending,
    }
}
