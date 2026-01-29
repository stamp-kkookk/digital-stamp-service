import { Edit2, Trash2, Play, Pause, Archive } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import type { StampCardSummary, StampCardStatus } from '@/types/stampCard'
import { STAMP_CARD_STATUS } from '@/types/stampCard'

interface StampCardTableProps {
    cards: StampCardSummary[]
    onDelete: (id: number) => Promise<void>
    onUpdateStatus: (id: number, status: StampCardStatus) => Promise<void>
    isDeleting: boolean
    isUpdatingStatus: boolean
}

export function StampCardTable({ cards, onDelete, onUpdateStatus, isDeleting, isUpdatingStatus }: StampCardTableProps) {
    const navigate = useNavigate()
    const { storeId } = useParams<{ storeId: string }>()

    const getStatusBadge = (status: StampCardStatus) => {
        const configs = {
            [STAMP_CARD_STATUS.DRAFT]: {
                label: '임시저장',
                variant: 'default' as const,
            },
            [STAMP_CARD_STATUS.ACTIVE]: {
                label: '발행중',
                variant: 'success' as const,
            },
            [STAMP_CARD_STATUS.PAUSED]: {
                label: '일시정지',
                variant: 'warning' as const,
            },
            [STAMP_CARD_STATUS.ARCHIVED]: {
                label: '보관됨',
                variant: 'default' as const,
            },
        }

        const config = configs[status]
        return (
            <Badge variant={config.variant} size="sm">
                {config.label}
            </Badge>
        )
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    const handleEdit = (id: number) => {
        navigate(`/owner/stores/${storeId}/stamp-cards/${id}/edit`)
    }

    const handleDelete = async (id: number, title: string) => {
        if (window.confirm(`"${title}" 카드를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
            try {
                await onDelete(id)
            } catch (error) {
                alert('삭제 중 오류가 발생했습니다.')
            }
        }
    }

    const handleStatusChange = async (id: number, currentStatus: StampCardStatus) => {
        let newStatus: StampCardStatus | null = null
        let confirmMessage = ''

        if (currentStatus === STAMP_CARD_STATUS.DRAFT) {
            newStatus = STAMP_CARD_STATUS.ACTIVE
            confirmMessage = '이 카드를 발행하시겠습니까?'
        } else if (currentStatus === STAMP_CARD_STATUS.ACTIVE) {
            newStatus = STAMP_CARD_STATUS.PAUSED
            confirmMessage = '이 카드를 일시 정지하시겠습니까?\n\n고객은 더 이상 이 카드를 사용할 수 없습니다.'
        } else if (currentStatus === STAMP_CARD_STATUS.PAUSED) {
            newStatus = STAMP_CARD_STATUS.ACTIVE
            confirmMessage = '이 카드를 다시 활성화하시겠습니까?'
        }

        if (newStatus && window.confirm(confirmMessage)) {
            try {
                await onUpdateStatus(id, newStatus)
            } catch (error) {
                alert('상태 변경 중 오류가 발생했습니다.')
            }
        }
    }

    const handleArchive = async (id: number) => {
        if (window.confirm('이 카드를 보관하시겠습니까?\n\n보관된 카드는 목록에서 숨겨집니다.')) {
            try {
                await onUpdateStatus(id, STAMP_CARD_STATUS.ARCHIVED)
            } catch (error) {
                alert('보관 중 오류가 발생했습니다.')
            }
        }
    }

    return (
        <div className="overflow-x-auto">
            {/* Desktop Table */}
            <table className="hidden lg:table w-full border-collapse">
                <thead>
                    <tr className="border-b border-gray-200">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-kkookk-navy">카드 제목</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-kkookk-navy">상태</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-kkookk-navy">스탬프</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-kkookk-navy">리워드</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-kkookk-navy">생성일</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-kkookk-navy">액션</th>
                    </tr>
                </thead>
                <tbody>
                    {cards.map((card) => (
                        <tr key={card.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                                <button
                                    onClick={() => handleEdit(card.id)}
                                    className="text-base font-medium text-kkookk-navy hover:text-kkookk-indigo transition-colors text-left"
                                >
                                    {card.title}
                                </button>
                            </td>
                            <td className="px-6 py-4">{getStatusBadge(card.status)}</td>
                            <td className="px-6 py-4 text-sm text-kkookk-steel">{card.goalStampCount}개</td>
                            <td className="px-6 py-4 text-sm text-kkookk-steel">
                                {card.rewardName || <span className="text-gray-400">-</span>}
                            </td>
                            <td className="px-6 py-4 text-sm text-kkookk-steel">{formatDate(card.createdAt)}</td>
                            <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => handleEdit(card.id)}
                                        disabled={isDeleting || isUpdatingStatus}
                                        className="p-2 rounded-lg text-kkookk-indigo hover:bg-kkookk-indigo/10 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        aria-label="수정"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>

                                    {card.status === STAMP_CARD_STATUS.DRAFT && (
                                        <>
                                            <button
                                                onClick={() => handleStatusChange(card.id, card.status)}
                                                disabled={isDeleting || isUpdatingStatus}
                                                className="p-2 rounded-lg text-green-600 hover:bg-green-50 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                aria-label="발행"
                                            >
                                                <Play className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(card.id, card.title)}
                                                disabled={isDeleting || isUpdatingStatus}
                                                className="p-2 rounded-lg text-kkookk-red hover:bg-red-50 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                aria-label="삭제"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}

                                    {card.status === STAMP_CARD_STATUS.ACTIVE && (
                                        <>
                                            <button
                                                onClick={() => handleStatusChange(card.id, card.status)}
                                                disabled={isDeleting || isUpdatingStatus}
                                                className="p-2 rounded-lg text-kkookk-amber hover:bg-kkookk-amber/10 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                aria-label="일시정지"
                                            >
                                                <Pause className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleArchive(card.id)}
                                                disabled={isDeleting || isUpdatingStatus}
                                                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                aria-label="보관"
                                            >
                                                <Archive className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}

                                    {card.status === STAMP_CARD_STATUS.PAUSED && (
                                        <>
                                            <button
                                                onClick={() => handleStatusChange(card.id, card.status)}
                                                disabled={isDeleting || isUpdatingStatus}
                                                className="p-2 rounded-lg text-green-600 hover:bg-green-50 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                aria-label="재개"
                                            >
                                                <Play className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleArchive(card.id)}
                                                disabled={isDeleting || isUpdatingStatus}
                                                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                aria-label="보관"
                                            >
                                                <Archive className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
                {cards.map((card) => (
                    <div
                        key={card.id}
                        className="p-4 rounded-2xl border border-gray-200 bg-white hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <button
                                onClick={() => handleEdit(card.id)}
                                className="flex-1 text-left text-base font-semibold text-kkookk-navy hover:text-kkookk-indigo transition-colors"
                            >
                                {card.title}
                            </button>
                            {getStatusBadge(card.status)}
                        </div>

                        <div className="space-y-2 mb-4 text-sm text-kkookk-steel">
                            <div className="flex justify-between">
                                <span>스탬프:</span>
                                <span>{card.goalStampCount}개</span>
                            </div>
                            <div className="flex justify-between">
                                <span>리워드:</span>
                                <span>{card.rewardName || <span className="text-gray-400">-</span>}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>생성일:</span>
                                <span>{formatDate(card.createdAt)}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                            <button
                                onClick={() => handleEdit(card.id)}
                                disabled={isDeleting || isUpdatingStatus}
                                className="flex-1 h-12 px-4 rounded-xl border border-kkookk-indigo text-kkookk-indigo font-medium active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                수정
                            </button>

                            {card.status === STAMP_CARD_STATUS.DRAFT && (
                                <>
                                    <button
                                        onClick={() => handleStatusChange(card.id, card.status)}
                                        disabled={isDeleting || isUpdatingStatus}
                                        className="flex-1 h-12 px-4 rounded-xl bg-kkookk-indigo text-white font-medium active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        발행
                                    </button>
                                    <button
                                        onClick={() => handleDelete(card.id, card.title)}
                                        disabled={isDeleting || isUpdatingStatus}
                                        className="p-3 rounded-xl border border-kkookk-red text-kkookk-red active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        aria-label="삭제"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </>
                            )}

                            {card.status === STAMP_CARD_STATUS.ACTIVE && (
                                <>
                                    <button
                                        onClick={() => handleStatusChange(card.id, card.status)}
                                        disabled={isDeleting || isUpdatingStatus}
                                        className="flex-1 h-12 px-4 rounded-xl border border-kkookk-amber text-kkookk-amber font-medium active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        일시정지
                                    </button>
                                    <button
                                        onClick={() => handleArchive(card.id)}
                                        disabled={isDeleting || isUpdatingStatus}
                                        className="p-3 rounded-xl border border-gray-300 text-gray-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        aria-label="보관"
                                    >
                                        <Archive className="w-5 h-5" />
                                    </button>
                                </>
                            )}

                            {card.status === STAMP_CARD_STATUS.PAUSED && (
                                <>
                                    <button
                                        onClick={() => handleStatusChange(card.id, card.status)}
                                        disabled={isDeleting || isUpdatingStatus}
                                        className="flex-1 h-12 px-4 rounded-xl bg-green-600 text-white font-medium active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        재개
                                    </button>
                                    <button
                                        onClick={() => handleArchive(card.id)}
                                        disabled={isDeleting || isUpdatingStatus}
                                        className="p-3 rounded-xl border border-gray-300 text-gray-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        aria-label="보관"
                                    >
                                        <Archive className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}