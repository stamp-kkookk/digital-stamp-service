import { FileQuestion } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
    status?: string
}

export function EmptyState({ status }: EmptyStateProps) {
    const navigate = useNavigate()
    const { storeId } = useParams<{ storeId: string }>()

    const getMessage = () => {
        switch (status) {
            case 'DRAFT':
                return '저장된 임시 카드가 없습니다'
            case 'ACTIVE':
                return '발행된 스탬프 카드가 없습니다'
            case 'PAUSED':
                return '일시 정지된 카드가 없습니다'
            case 'ARCHIVED':
                return '보관된 카드가 없습니다'
            default:
                return '아직 생성된 스탬프 카드가 없습니다'
        }
    }

    const getDescription = () => {
        if (status) {
            return '다른 상태의 카드를 확인해보세요'
        }
        return '첫 번째 스탬프 카드를 만들어보세요!'
    }

    const handleCreate = () => {
        navigate(`/owner/stores/${storeId}/stamp-cards/create`)
    }

    return (
        <div className="flex flex-col items-center justify-center gap-6 py-16 px-4">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-kkookk-indigo/10">
                <FileQuestion className="w-10 h-10 text-kkookk-indigo" />
            </div>

            <div className="flex flex-col items-center gap-2 text-center">
                <h3 className="text-xl font-semibold text-kkookk-navy">{getMessage()}</h3>
                <p className="text-sm text-kkookk-steel">{getDescription()}</p>
            </div>

            {!status && (
                <Button onClick={handleCreate} size="md">
                    스탬프 카드 만들기
                </Button>
            )}
        </div>
    )
}