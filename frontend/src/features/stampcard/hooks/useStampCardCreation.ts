import { useMutation, useQueryClient } from '@tanstack/react-query'
import { stampCardApi } from '../api/stampCardApi'
import type { CreateStampCardRequest, UpdateStampCardStatusRequest } from '@/types/stampCard'

export const useStampCardCreation = (storeId: number) => {
    const queryClient = useQueryClient()

    const createMutation = useMutation({
        mutationFn: (data: CreateStampCardRequest) => stampCardApi.create(storeId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stampCards', storeId] })
        },
    })

    const publishMutation = useMutation({
        mutationFn: ({ stampCardId, data }: { stampCardId: number; data: UpdateStampCardStatusRequest }) =>
            stampCardApi.updateStatus(storeId, stampCardId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stampCards', storeId] })
        },
    })

    return {
        createStampCard: createMutation.mutateAsync,
        publishStampCard: publishMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isPublishing: publishMutation.isPending,
        createError: createMutation.error,
        publishError: publishMutation.error,
    }
}
