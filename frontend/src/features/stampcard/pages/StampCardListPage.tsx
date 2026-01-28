import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import { useStampCardList } from '../hooks/useStampCardList'
import { StampCardTable } from '../components/StampCardTable'
import { EmptyState } from '../components/EmptyState'
import { STAMP_CARD_STATUS, type StampCardStatus } from '@/types/stampCard'

const STATUS_TABS = [
    { value: undefined, label: '전체' },
    { value: STAMP_CARD_STATUS.DRAFT, label: '임시저장' },
    { value: STAMP_CARD_STATUS.ACTIVE, label: '발행중' },
    { value: STAMP_CARD_STATUS.PAUSED, label: '일시정지' },
    { value: STAMP_CARD_STATUS.ARCHIVED, label: '보관됨' },
] as const

export function StampCardListPage() {
    const { storeId } = useParams<{ storeId: string }>()
    const navigate = useNavigate()

    const [selectedStatus, setSelectedStatus] = useState<StampCardStatus | undefined>(undefined)
    const [currentPage, setCurrentPage] = useState(0)
    const pageSize = 10

    const { data, isLoading, isError, error, deleteStampCard, updateStatus, isDeleting, isUpdatingStatus } =
        useStampCardList({
            storeId: Number(storeId),
            status: selectedStatus,
            page: currentPage,
            size: pageSize,
        })

    const handleStatusChange = (status: StampCardStatus | undefined) => {
        setSelectedStatus(status)
        setCurrentPage(0)
    }

    const handleCreateNew = () => {
        navigate(`/owner/stores/${storeId}/stamp-cards/create`)
    }

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleUpdateStatus = async (stampCardId: number, newStatus: StampCardStatus) => {
        await updateStatus({ stampCardId, newStatus })
    }

    const handleDelete = async (stampCardId: number) => {
        await deleteStampCard(stampCardId)
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-kkookk-paper">
                <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-semibold text-kkookk-navy">스탬프 카드 관리</h1>
                        </div>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center py-16">
                        <div className="animate-pulse flex flex-col items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-kkookk-indigo/20"></div>
                            <div className="text-sm text-kkookk-steel">로딩 중...</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Error state
    if (isError) {
        return (
            <div className="min-h-screen bg-kkookk-paper">
                <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-semibold text-kkookk-navy">스탬프 카드 관리</h1>
                        </div>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-center gap-6 py-16 px-4">
                        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-kkookk-red/10">
                            <AlertCircle className="w-10 h-10 text-kkookk-red" />
                        </div>

                        <div className="flex flex-col items-center gap-2 text-center">
                            <h3 className="text-xl font-semibold text-kkookk-navy">데이터를 불러올 수 없습니다</h3>
                            <p className="text-sm text-kkookk-steel">
                                {error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'}
                            </p>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="h-14 px-6 rounded-2xl bg-kkookk-indigo text-white font-semibold active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-kkookk-indigo/30"
                        >
                            다시 시도
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const cards = data?.content || []
    const pageInfo = data?.page

    // Empty state
    const isEmpty = cards.length === 0

    return (
        <div className="min-h-screen bg-kkookk-paper">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-semibold text-kkookk-navy">스탬프 카드 관리</h1>
                        <button
                            onClick={handleCreateNew}
                            className="flex items-center gap-2 h-12 px-5 rounded-xl bg-kkookk-indigo text-white font-semibold active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-kkookk-indigo/30"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="hidden sm:inline">새 카드 만들기</span>
                            <span className="sm:hidden">만들기</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                {/* Status Tabs */}
                <div className="mb-6 overflow-x-auto">
                    <div className="flex gap-2 pb-2">
                        {STATUS_TABS.map((tab) => (
                            <button
                                key={tab.label}
                                onClick={() => handleStatusChange(tab.value)}
                                className={`
                                    flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all
                                    ${
                                        selectedStatus === tab.value
                                            ? 'bg-kkookk-indigo text-white'
                                            : 'bg-white text-kkookk-steel hover:bg-gray-50 border border-kkookk-steel/20'
                                    }
                                    active:scale-95 focus:outline-none focus:ring-2 focus:ring-kkookk-indigo/30
                                `}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table or Empty State */}
                {isEmpty ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                        <EmptyState status={selectedStatus} />
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <StampCardTable
                                cards={cards}
                                onDelete={handleDelete}
                                onUpdateStatus={handleUpdateStatus}
                                isDeleting={isDeleting}
                                isUpdatingStatus={isUpdatingStatus}
                            />
                        </div>

                        {/* Pagination */}
                        {pageInfo && pageInfo.totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6 px-4">
                                <div className="text-sm text-kkookk-steel">
                                    전체 {pageInfo.totalElements}개 중 {currentPage * pageSize + 1}-
                                    {Math.min((currentPage + 1) * pageSize, pageInfo.totalElements)}개 표시
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 0}
                                        className="p-2 rounded-lg border border-gray-300 text-kkookk-steel hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        aria-label="이전 페이지"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: pageInfo.totalPages }, (_, i) => i)
                                            .filter((page) => {
                                                // Show first, last, current, and adjacent pages
                                                return (
                                                    page === 0 ||
                                                    page === pageInfo.totalPages - 1 ||
                                                    Math.abs(page - currentPage) <= 1
                                                )
                                            })
                                            .map((page, index, array) => {
                                                // Add ellipsis if there's a gap
                                                const prevPage = array[index - 1]
                                                const showEllipsis = prevPage !== undefined && page - prevPage > 1

                                                return (
                                                    <div key={page} className="flex items-center gap-1">
                                                        {showEllipsis && (
                                                            <span className="px-2 text-kkookk-steel">...</span>
                                                        )}
                                                        <button
                                                            onClick={() => handlePageChange(page)}
                                                            className={`
                                                                min-w-[40px] h-10 px-3 rounded-lg text-sm font-medium transition-all
                                                                ${
                                                                    page === currentPage
                                                                        ? 'bg-kkookk-indigo text-white'
                                                                        : 'text-kkookk-steel hover:bg-gray-100'
                                                                }
                                                                active:scale-95
                                                            `}
                                                        >
                                                            {page + 1}
                                                        </button>
                                                    </div>
                                                )
                                            })}
                                    </div>

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage >= pageInfo.totalPages - 1}
                                        className="p-2 rounded-lg border border-gray-300 text-kkookk-steel hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        aria-label="다음 페이지"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
