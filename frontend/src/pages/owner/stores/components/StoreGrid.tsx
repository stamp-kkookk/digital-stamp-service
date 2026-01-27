import type { Store, ViewMode } from '../../../../types/store'
import StoreCard from './StoreCard'
import { Button } from '@/components/ui/button'

interface StoreGridProps {
    stores: Store[]
    viewMode: ViewMode
    onStoreClick: (storeId: number) => void
    onNewStore?: () => void
}

export default function StoreGrid({ stores, viewMode, onStoreClick, onNewStore }: StoreGridProps) {
    // Empty state
    if (stores.length === 0) {
        return (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
                <div className="text-6xl" role="img" aria-label="Store icon">
                    🏪
                </div>
                <p className="text-xl font-semibold text-kkookk-navy">등록된 매장이 없습니다</p>
                <p className="text-sm text-kkookk-steel">첫 매장을 등록해보세요</p>
                {onNewStore && (
                    <Button
                        onClick={onNewStore}
                        variant="secondary"
                        size="md"
                        className="mt-2"
                        aria-label="새 매장 등록하기"
                    >
                        + 새 매장 등록
                    </Button>
                )}
            </div>
        )
    }

    // Grid layout
    if (viewMode === 'grid') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores.map((store) => (
                    <StoreCard
                        key={store.id}
                        store={store}
                        viewMode={viewMode}
                        onClick={onStoreClick}
                    />
                ))}
            </div>
        )
    }

    // List layout
    return (
        <div className="flex flex-col gap-4">
            {stores.map((store) => (
                <StoreCard
                    key={store.id}
                    store={store}
                    viewMode={viewMode}
                    onClick={onStoreClick}
                />
            ))}
        </div>
    )
}
