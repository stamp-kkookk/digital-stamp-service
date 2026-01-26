import { useQuery } from '@tanstack/react-query'
import { stampCardApi } from '../api/stampCardApi'

export function useStampCardDetail(storeId: number, stampCardId: number | null) {
    return useQuery({
        queryKey: ['stampCard', storeId, stampCardId],
        queryFn: () => {
            if (!stampCardId) {
                throw new Error('Stamp card ID is required')
            }
            return stampCardApi.getById(storeId, stampCardId)
        },
        enabled: !!storeId && !!stampCardId,
    })
}
