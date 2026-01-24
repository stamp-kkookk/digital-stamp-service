import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '../lib/api/axiosInstance'
import type { CreateStoreRequest, CreateStoreResponse } from '../types/storeRegistration'

/**
 * Hook for creating a new store
 *
 * POST /api/owner/stores
 * Invalidates the stores list query on success.
 */

export const useCreateStore = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: CreateStoreRequest): Promise<CreateStoreResponse> => {
            const response = await axiosInstance.post<CreateStoreResponse>(
                '/api/owner/stores',
                data
            )
            return response.data
        },
        onSuccess: () => {
            // Invalidate and refetch stores list
            queryClient.invalidateQueries({ queryKey: ['owner', 'stores'] })
        },
        onError: (error) => {
            console.error('Failed to create store:', error)
        },
    })
}
