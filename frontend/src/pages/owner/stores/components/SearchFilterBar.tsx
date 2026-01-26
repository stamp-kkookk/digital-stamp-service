import { Search, Filter, ArrowUpDown, Grid3x3, List, Plus } from 'lucide-react'
import type { SortOption, ViewMode } from '../../../../types/store'

interface SearchFilterBarProps {
    searchQuery: string
    onSearchChange: (query: string) => void
    filterStatus: 'all' | 'active' | 'inactive'
    onFilterChange: (status: 'all' | 'active' | 'inactive') => void
    sortOption: SortOption
    onSortChange: (option: SortOption) => void
    viewMode: ViewMode
    onViewModeChange: (mode: ViewMode) => void
    onNewStore: () => void
}

export default function SearchFilterBar({
    searchQuery,
    onSearchChange,
    filterStatus,
    onFilterChange,
    sortOption,
    onSortChange,
    viewMode,
    onViewModeChange,
    onNewStore,
}: SearchFilterBarProps) {
    const filterOptions = [
        { value: 'all' as const, label: '전체' },
        { value: 'active' as const, label: '영업중' },
        { value: 'inactive' as const, label: '준비중' },
    ]

    const sortOptions = [
        { value: 'latest' as const, label: '최신순' },
        { value: 'name' as const, label: '이름순' },
        { value: 'customers' as const, label: '고객 많은 순' },
    ]

    return (
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Left side: Search, Filter, Sort */}
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
                {/* Search Input */}
                <div className="relative flex-1 min-w-0">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-kkookk-steel pointer-events-none" aria-hidden="true" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="매장명/주소 검색"
                        className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-300 text-sm text-kkookk-navy placeholder:text-kkookk-steel focus:outline-none focus:ring-2 focus:ring-kkookk-indigo/50 focus:border-kkookk-indigo transition-all"
                        aria-label="매장 검색"
                    />
                </div>

                {/* Filter Dropdown */}
                <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-kkookk-steel pointer-events-none" aria-hidden="true" />
                    <select
                        value={filterStatus}
                        onChange={(e) => onFilterChange(e.target.value as 'all' | 'active' | 'inactive')}
                        className="h-12 pl-11 pr-10 rounded-xl border border-gray-300 text-sm text-kkookk-navy bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-kkookk-indigo/50 focus:border-kkookk-indigo transition-all"
                        aria-label="매장 상태 필터"
                    >
                        {filterOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-kkookk-steel" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                    <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-kkookk-steel pointer-events-none" aria-hidden="true" />
                    <select
                        value={sortOption}
                        onChange={(e) => onSortChange(e.target.value as SortOption)}
                        className="h-12 pl-11 pr-10 rounded-xl border border-gray-300 text-sm text-kkookk-navy bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-kkookk-indigo/50 focus:border-kkookk-indigo transition-all"
                        aria-label="정렬 순서"
                    >
                        {sortOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-kkookk-steel" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Right side: View toggle and New store button */}
            <div className="flex gap-3">
                {/* View Mode Toggle */}
                <div className="flex rounded-xl border border-gray-300 p-1 bg-white" role="group" aria-label="View mode toggle">
                    <button
                        onClick={() => onViewModeChange('grid')}
                        className={`
                            flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300
                            ${viewMode === 'grid' ? 'bg-kkookk-indigo text-white scale-105' : 'text-kkookk-steel hover:bg-gray-50'}
                            focus:outline-none focus:ring-2 focus:ring-kkookk-indigo/50
                        `}
                        aria-label="Grid view"
                        aria-pressed={viewMode === 'grid'}
                    >
                        <Grid3x3 className="w-5 h-5 transition-transform duration-200" aria-hidden="true" />
                    </button>
                    <button
                        onClick={() => onViewModeChange('list')}
                        className={`
                            flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300
                            ${viewMode === 'list' ? 'bg-kkookk-indigo text-white scale-105' : 'text-kkookk-steel hover:bg-gray-50'}
                            focus:outline-none focus:ring-2 focus:ring-kkookk-indigo/50
                        `}
                        aria-label="List view"
                        aria-pressed={viewMode === 'list'}
                    >
                        <List className="w-5 h-5 transition-transform duration-200" aria-hidden="true" />
                    </button>
                </div>

                {/* New Store Button */}
                <button
                    onClick={onNewStore}
                    className="flex items-center gap-2 h-12 px-5 rounded-xl bg-kkookk-indigo text-white font-semibold text-sm hover:bg-kkookk-indigo/90 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-kkookk-indigo/50 focus:ring-offset-2"
                    aria-label="새 매장 등록"
                >
                    <Plus className="w-5 h-5" aria-hidden="true" />
                    <span className="hidden sm:inline">새 매장 등록</span>
                </button>
            </div>
        </div>
    )
}
