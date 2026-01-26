import { useMutation, useQueryClient } from '@tanstack/react-query'
import { stampCardApi } from '../api/stampCardApi'
import type {
    CreateStampCardRequest,
    UpdateStampCardRequest,
    UpdateStampCardStatusRequest,
} from '@/types/stampCard'

export const useStampCardForm = (storeId: number) => {
    const queryClient = useQueryClient()

    const createMutation = useMutation({
        mutationFn: (data: CreateStampCardRequest) => stampCardApi.create(storeId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stampCards', storeId] })
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ stampCardId, data }: { stampCardId: number; data: UpdateStampCardRequest }) =>
            stampCardApi.update(storeId, stampCardId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['stampCards', storeId] })
            queryClient.invalidateQueries({ queryKey: ['stampCard', storeId, variables.stampCardId] })
        },
    })

    const updateStatusMutation = useMutation({
        mutationFn: ({ stampCardId, data }: { stampCardId: number; data: UpdateStampCardStatusRequest }) =>
            stampCardApi.updateStatus(storeId, stampCardId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['stampCards', storeId] })
            queryClient.invalidateQueries({ queryKey: ['stampCard', storeId, variables.stampCardId] })
        },
    })

    return {
        createStampCard: createMutation.mutateAsync,
        updateStampCard: updateMutation.mutateAsync,
        updateStatus: updateStatusMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isUpdatingStatus: updateStatusMutation.isPending,
        createError: createMutation.error,
        updateError: updateMutation.error,
        updateStatusError: updateStatusMutation.error,
    }
}
