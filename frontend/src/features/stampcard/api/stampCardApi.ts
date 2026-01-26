import apiClient from '@/lib/apiClient'
import type {
    CreateStampCardRequest,
    UpdateStampCardRequest,
    UpdateStampCardStatusRequest,
    StampCardResponse,
    StampCardListResponse,
} from '@/types/stampCard'

const STAMP_CARD_BASE_URL = '/api/owner/stores'

export const stampCardApi = {
    /**
     * Create a new stamp card (DRAFT status)
     */
    create: async (storeId: number, data: CreateStampCardRequest): Promise<StampCardResponse> => {
        const response = await apiClient.post<StampCardResponse>(
            `${STAMP_CARD_BASE_URL}/${storeId}/stamp-cards`,
            data
        )
        return response.data
    },

    /**
     * Get stamp card list for a store
     */
    list: async (storeId: number, params?: { status?: string; page?: number; size?: number }) => {
        const response = await apiClient.get<StampCardListResponse>(
            `${STAMP_CARD_BASE_URL}/${storeId}/stamp-cards`,
            { params }
        )
        return response.data
    },

    /**
     * Get stamp card detail
     */
    getById: async (storeId: number, stampCardId: number): Promise<StampCardResponse> => {
        const response = await apiClient.get<StampCardResponse>(
            `${STAMP_CARD_BASE_URL}/${storeId}/stamp-cards/${stampCardId}`
        )
        return response.data
    },

    /**
     * Update stamp card
     */
    update: async (
        storeId: number,
        stampCardId: number,
        data: UpdateStampCardRequest
    ): Promise<StampCardResponse> => {
        const response = await apiClient.put<StampCardResponse>(
            `${STAMP_CARD_BASE_URL}/${storeId}/stamp-cards/${stampCardId}`,
            data
        )
        return response.data
    },

    /**
     * Update stamp card status (e.g., DRAFT -> ACTIVE = Publish)
     */
    updateStatus: async (
        storeId: number,
        stampCardId: number,
        data: UpdateStampCardStatusRequest
    ): Promise<StampCardResponse> => {
        const response = await apiClient.patch<StampCardResponse>(
            `${STAMP_CARD_BASE_URL}/${storeId}/stamp-cards/${stampCardId}/status`,
            data
        )
        return response.data
    },

    /**
     * Delete stamp card (DRAFT only)
     */
    delete: async (storeId: number, stampCardId: number): Promise<void> => {
        await apiClient.delete(`${STAMP_CARD_BASE_URL}/${storeId}/stamp-cards/${stampCardId}`)
    },
}
