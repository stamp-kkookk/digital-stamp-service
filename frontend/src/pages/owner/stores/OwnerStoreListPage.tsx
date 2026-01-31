import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import OwnerLayout from '../../../components/layout/OwnerLayout'
import DashboardCards from './components/DashboardCards'
import SearchFilterBar from './components/SearchFilterBar'
import StoreGrid from './components/StoreGrid'
import { mockDashboardMetrics, mockStores } from '../../../mocks/ownerStores'
import type { SortOption, ViewMode } from '../../../types/store'

export default function OwnerStoreListPage() {
    const navigate = useNavigate()

    // State management
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
    const [sortOption, setSortOption] = useState<SortOption>('latest')
    const [viewMode, setViewMode] = useState<ViewMode>('grid')

    // Client-side filtering and sorting
    const filteredStores = useMemo(() => {
        let result = [...mockStores]

        // Filter by status
        if (filterStatus !== 'all') {
            result = result.filter((store) => store.status.toLowerCase() === filterStatus)
        }

        // Search by name or address
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(
                (store) =>
                    store.name.toLowerCase().includes(query) ||
                    store.address.toLowerCase().includes(query)
            )
        }

        // Sort
        switch (sortOption) {
            case 'name':
                result.sort((a, b) => a.name.localeCompare(b.name))
                break
            case 'customers':
                result.sort((a, b) => (b.customerCount || 0) - (a.customerCount || 0))
                break
            case 'latest':
            default:
                result.sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )
        }

        return result
    }, [searchQuery, filterStatus, sortOption])

    // Event handlers
    const handleStoreClick = (storeId: number) => {
        console.log('매장 상세 페이지 이동:', storeId)
    }

    const handleNewStore = () => {
        navigate('/owner/stores/new')
    }

    return (
        <OwnerLayout>
            <div className="max-w-7xl mx-auto animate-fadeInUp">
                {/* Page Header */}
                <header className="mb-8">
                    <h1 className="text-2xl font-semibold text-kkookk-navy mb-2">매장 관리</h1>
                    <p className="text-sm text-kkookk-steel">
                        총 <span className="font-semibold text-kkookk-navy">{mockStores.length}</span>개의 매장
                    </p>
                </header>

                {/* Dashboard Metrics Cards */}
                <DashboardCards metrics={mockDashboardMetrics} />

                {/* Search and Filter Bar */}
                <SearchFilterBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    filterStatus={filterStatus}
                    onFilterChange={setFilterStatus}
                    sortOption={sortOption}
                    onSortChange={setSortOption}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    onNewStore={handleNewStore}
                />

                {/* Store Grid/List */}
                <StoreGrid
                    stores={filteredStores}
                    viewMode={viewMode}
                    onStoreClick={handleStoreClick}
                    onNewStore={handleNewStore}
                />
            </div>
        </OwnerLayout>
    )
}
