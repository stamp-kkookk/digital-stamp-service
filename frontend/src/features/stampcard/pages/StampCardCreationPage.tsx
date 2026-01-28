import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useStampCardCreation } from '../hooks/useStampCardCreation'
import { DesignStudioPanel } from '../components/DesignStudioPanel'
import { PreviewPanel } from '../components/PreviewPanel'
import { RulesPanel } from '../components/RulesPanel'
import { stampCardFormSchema, type StampCardFormData } from '../schemas/stampCardSchema'
import type { StampCardDesign } from '@/types/stampCard'
import { STAMP_CARD_STATUS } from '@/types/stampCard'
import { showToast } from '@/lib/toast'
import { ApiError } from '@/lib/apiClient'

export function StampCardCreationPage() {
    const { storeId } = useParams<{ storeId: string }>()
    const navigate = useNavigate()
    const { createStampCard, publishStampCard, isCreating, isPublishing } = useStampCardCreation(Number(storeId))

    // Form with validation
    const form = useForm<StampCardFormData>({
        resolver: zodResolver(stampCardFormSchema),
        mode: 'onChange',
        defaultValues: {
            title: '',
            goalStampCount: 8,
            rewardName: '',
            rewardQuantity: 1,
            expireDays: 30,
        },
    })

    const { handleSubmit, watch, setValue } = form

    // Design state
    const [mode, setMode] = useState<'custom' | 'puzzle'>('custom')
    const [puzzleGrid, setPuzzleGrid] = useState<'2x2' | '3x3' | '4x4' | '5x4'>('3x3')
    const [puzzleImage, setPuzzleImage] = useState<string | null>(null)
    const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
    const [emptyIcon, setEmptyIcon] = useState<string | null>(null)
    const [stampIcon, setStampIcon] = useState<string | null>(null)

    // Loading/Error states
    const [saveError, setSaveError] = useState<string | null>(null)

    // Watch form values for preview
    const goalStampCount = watch('goalStampCount')
    const title = watch('title')
    const rewardName = watch('rewardName')

    const buildDesignJson = (): string => {
        const design: StampCardDesign = {
            mode,
            ...(mode === 'custom'
                ? {
                      backgroundImage: backgroundImage || undefined,
                      emptyIcon: emptyIcon || undefined,
                      stampIcon: stampIcon || undefined,
                  }
                : {
                      puzzleGrid,
                      puzzleImage: puzzleImage || undefined,
                  }),
        }
        return JSON.stringify(design)
    }

    const onSaveDraft = async (data: StampCardFormData) => {
        try {
            setSaveError(null)
            await createStampCard({
                title: data.title,
                goalStampCount: data.goalStampCount,
                requiredStamps: data.goalStampCount,
                rewardName: data.rewardName || undefined,
                rewardQuantity: data.rewardQuantity,
                expireDays: data.expireDays,
                designJson: buildDesignJson(),
            })

            showToast.success('스탬프 카드가 임시 저장되었습니다')
            navigate(`/owner/stores/${storeId}/stamp-cards`)
        } catch (error) {
            const errorMessage = error instanceof ApiError ? error.message : '저장 중 오류가 발생했습니다'
            setSaveError(errorMessage)
            showToast.error(errorMessage)
            console.error('Save draft error:', error)
        }
    }

    const onPublish = async (data: StampCardFormData) => {
        if (!confirm('스탬프 카드를 발행하시겠습니까? 발행 후에는 일부 항목만 수정할 수 있습니다.')) {
            return
        }

        try {
            setSaveError(null)
            // Step 1: Create as DRAFT
            const created = await createStampCard({
                title: data.title,
                goalStampCount: data.goalStampCount,
                requiredStamps: data.goalStampCount,
                rewardName: data.rewardName || undefined,
                rewardQuantity: data.rewardQuantity,
                expireDays: data.expireDays,
                designJson: buildDesignJson(),
            })

            // Step 2: Publish (DRAFT -> ACTIVE)
            await publishStampCard({
                stampCardId: created.id,
                data: { status: STAMP_CARD_STATUS.ACTIVE },
            })

            showToast.success('스탬프 카드가 발행되었습니다')
            navigate(`/owner/stores/${storeId}/stamp-cards`)
        } catch (error) {
            const errorMessage = error instanceof ApiError ? error.message : '발행 중 오류가 발생했습니다'
            setSaveError(errorMessage)
            showToast.error(errorMessage)
            console.error('Publish error:', error)
        }
    }

    const handleSaveDraft = handleSubmit(onSaveDraft)
    const handlePublish = handleSubmit(onPublish)

    const isProcessing = isCreating || isPublishing

    return (
        <div className="min-h-screen bg-kkookk-paper">
            {/* Header */}
            <header className="flex items-center justify-between h-16 px-4 lg:px-8 bg-white border-b border-black/5">
                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-kkookk-indigo">
                        <span className="font-semibold text-white">K</span>
                    </div>
                    <span className="font-semibold text-kkookk-navy">KKOOKK</span>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleSaveDraft}
                        disabled={isProcessing}
                        className="h-11 px-6 rounded-2xl transition-all bg-white border-2 border-kkookk-indigo text-kkookk-indigo hover:bg-kkookk-indigo hover:text-white font-medium focus:outline-none focus:ring-4 focus:ring-kkookk-indigo/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isCreating ? '저장 중...' : '임시 저장'}
                    </button>
                    <button
                        type="button"
                        onClick={handlePublish}
                        disabled={isProcessing}
                        className="h-11 px-6 rounded-2xl transition-all hover:opacity-90 bg-kkookk-indigo text-white font-medium focus:outline-none focus:ring-4 focus:ring-kkookk-indigo/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPublishing ? '발행 중...' : '발행'}
                    </button>
                </div>
            </header>

            {/* Error Message */}
            {saveError && (
                <div className="px-4 py-3 mx-4 mt-4 rounded-xl bg-kkookk-red/10 border border-kkookk-red text-kkookk-red">
                    {saveError}
                </div>
            )}

            {/* Three-panel layout */}
            <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-4rem)]">
                {/* Left Panel - Design Studio */}
                <div className="w-full lg:w-[320px] border-b lg:border-b-0 lg:border-r border-black/5 bg-white">
                    <DesignStudioPanel
                        mode={mode}
                        onModeChange={setMode}
                        totalStamps={goalStampCount}
                        onTotalStampsChange={(value) => setValue('goalStampCount', value, { shouldValidate: true })}
                        puzzleGrid={puzzleGrid}
                        onPuzzleGridChange={setPuzzleGrid}
                        puzzleImage={puzzleImage}
                        onPuzzleImageChange={setPuzzleImage}
                        backgroundImage={backgroundImage}
                        onBackgroundImageChange={setBackgroundImage}
                        emptyIcon={emptyIcon}
                        onEmptyIconChange={setEmptyIcon}
                        stampIcon={stampIcon}
                        onStampIconChange={setStampIcon}
                    />
                </div>

                {/* Center Panel - Preview */}
                <div className="flex-1 overflow-y-auto">
                    <PreviewPanel
                        mode={mode}
                        totalStamps={goalStampCount}
                        puzzleGrid={puzzleGrid}
                        puzzleImage={puzzleImage}
                        backgroundImage={backgroundImage}
                        emptyIcon={emptyIcon}
                        stampIcon={stampIcon}
                        cardTitle={title}
                        rewardName={rewardName || ''}
                    />
                </div>

                {/* Right Panel - Rules */}
                <div className="w-full lg:w-[320px] border-t lg:border-t-0 lg:border-l border-black/5 bg-white">
                    <RulesPanel form={form} />
                </div>
            </div>
        </div>
    )
}
