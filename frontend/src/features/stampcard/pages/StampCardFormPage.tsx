import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import OwnerLayout from '@/components/layout/OwnerLayout'
import { useStampCardForm } from '../hooks/useStampCardForm'
import { useStampCardDetail } from '../hooks/useStampCardDetail'
import { DesignStudioPanel } from '../components/DesignStudioPanel'
import { PreviewPanel } from '../components/PreviewPanel'
import { RulesPanel } from '../components/RulesPanel'
import { stampCardFormSchema, type StampCardFormData } from '../schemas/stampCardSchema'
import type { StampCardDesign } from '@/types/stampCard'
import { STAMP_CARD_STATUS } from '@/types/stampCard'
import { showToast } from '@/lib/toast'
import { ApiError } from '@/lib/apiClient'

export function StampCardFormPage() {
    const { storeId, id } = useParams<{ storeId: string; id?: string }>()
    const navigate = useNavigate()

    const isEditMode = !!id
    const stampCardId = id ? Number(id) : null

    const { createStampCard, updateStampCard, updateStatus, isCreating, isUpdating, isUpdatingStatus } =
        useStampCardForm(Number(storeId))

    const {
        data: existingCard,
        isLoading: isLoadingCard,
        isError: isLoadError,
        error: loadError,
    } = useStampCardDetail(Number(storeId), stampCardId)

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

    const { handleSubmit, watch, setValue, reset } = form

    // Design state
    const [mode, setMode] = useState<'custom' | 'puzzle'>('custom')
    const [puzzleGrid, setPuzzleGrid] = useState<'2x2' | '3x3' | '4x4' | '5x4'>('3x3')
    const [puzzleImage, setPuzzleImage] = useState<string | null>(null)
    const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
    const [emptyIcon, setEmptyIcon] = useState<string | null>(null)
    const [stampIcon, setStampIcon] = useState<string | null>(null)

    // Loading/Error states
    const [saveError, setSaveError] = useState<string | null>(null)
    const [isDataLoaded, setIsDataLoaded] = useState(false)

    // Watch form values for preview
    const goalStampCount = watch('goalStampCount')
    const title = watch('title')
    const rewardName = watch('rewardName')

    // Load existing data when in edit mode
    useEffect(() => {
        if (existingCard && isEditMode && !isDataLoaded) {
            // Reset form with existing data
            reset({
                title: existingCard.title,
                goalStampCount: existingCard.goalStampCount,
                rewardName: existingCard.rewardName || '',
                rewardQuantity: existingCard.rewardQuantity || 1,
                expireDays: existingCard.expireDays || 30,
            })

            // Parse designJson
            if (existingCard.designJson) {
                try {
                    const design: StampCardDesign = JSON.parse(existingCard.designJson)
                    setMode(design.mode)

                    if (design.mode === 'custom') {
                        setBackgroundImage(design.backgroundImage || null)
                        setEmptyIcon(design.emptyIcon || null)
                        setStampIcon(design.stampIcon || null)
                    } else if (design.mode === 'puzzle') {
                        setPuzzleGrid(design.puzzleGrid || '3x3')
                        setPuzzleImage(design.puzzleImage || null)
                    }
                } catch (error) {
                    console.error('Failed to parse designJson:', error)
                }
            }

            setIsDataLoaded(true)
        }
    }, [existingCard, isEditMode, isDataLoaded, reset])

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
            await updateStatus({
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

    const onUpdate = async (data: StampCardFormData) => {
        if (!stampCardId) {
            return
        }

        try {
            setSaveError(null)
            await updateStampCard({
                stampCardId,
                data: {
                    title: data.title,
                    goalStampCount: data.goalStampCount,
                    requiredStamps: data.goalStampCount,
                    rewardName: data.rewardName || undefined,
                    rewardQuantity: data.rewardQuantity,
                    expireDays: data.expireDays,
                    designJson: buildDesignJson(),
                },
            })

            showToast.success('스탬프 카드가 수정되었습니다')
            navigate(`/owner/stores/${storeId}/stamp-cards`)
        } catch (error) {
            const errorMessage = error instanceof ApiError ? error.message : '수정 중 오류가 발생했습니다'
            setSaveError(errorMessage)
            showToast.error(errorMessage)
            console.error('Update error:', error)
        }
    }

    const handleSaveDraft = handleSubmit(onSaveDraft)
    const handlePublish = handleSubmit(onPublish)
    const handleUpdate = handleSubmit(onUpdate)

    const handleBack = () => {
        if (confirm('변경 사항이 저장되지 않을 수 있습니다. 뒤로 가시겠습니까?')) {
            navigate(`/owner/stores/${storeId}/stamp-cards`)
        }
    }

    const isProcessing = isCreating || isUpdating || isUpdatingStatus
    const isActiveStatus = existingCard?.status === STAMP_CARD_STATUS.ACTIVE
    const isDesignLocked = isEditMode && isActiveStatus

    // Loading state for edit mode
    if (isEditMode && isLoadingCard) {
        return (
            <OwnerLayout>
                <div className="flex items-center justify-center h-full">
                    <div className="animate-pulse flex flex-col items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-kkookk-indigo/20"></div>
                        <div className="text-sm text-kkookk-steel">데이터 로딩 중...</div>
                    </div>
                </div>
            </OwnerLayout>
        )
    }

    // Error state for edit mode
    if (isEditMode && isLoadError) {
        return (
            <OwnerLayout>
                <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-6 py-16 px-4">
                        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-kkookk-red/10">
                            <AlertCircle className="w-10 h-10 text-kkookk-red" />
                        </div>

                        <div className="flex flex-col items-center gap-2 text-center">
                            <h3 className="text-xl font-semibold text-kkookk-navy">데이터를 불러올 수 없습니다</h3>
                            <p className="text-sm text-kkookk-steel">
                                {loadError instanceof Error ? loadError.message : '알 수 없는 오류가 발생했습니다'}
                            </p>
                        </div>

                        <button
                            onClick={handleBack}
                            className="h-14 px-6 rounded-2xl bg-kkookk-indigo text-white font-semibold active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-kkookk-indigo/30"
                        >
                            목록으로 돌아가기
                        </button>
                    </div>
                </div>
            </OwnerLayout>
        )
    }

    return (
        <OwnerLayout>
            <div className="bg-kkookk-paper -m-4 md:-m-8">
            {/* Header */}
            <header className="flex items-center justify-between h-16 px-4 lg:px-8 bg-white border-b border-black/5">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="p-2 rounded-lg text-kkookk-steel hover:bg-gray-100 active:scale-95 transition-all"
                        aria-label="뒤로 가기"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-kkookk-indigo">
                            <span className="font-semibold text-white">K</span>
                        </div>
                        <span className="font-semibold text-kkookk-navy">KKOOKK</span>
                    </div>

                    <span className="hidden sm:inline text-sm text-kkookk-steel">
                        {isEditMode ? '스탬프 카드 수정' : '스탬프 카드 만들기'}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    {isEditMode ? (
                        <button
                            type="button"
                            onClick={handleUpdate}
                            disabled={isProcessing}
                            className="h-11 px-6 rounded-2xl transition-all hover:opacity-90 bg-kkookk-indigo text-white font-medium focus:outline-none focus:ring-4 focus:ring-kkookk-indigo/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUpdating ? '저장 중...' : '저장'}
                        </button>
                    ) : (
                        <>
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
                                {isUpdatingStatus ? '발행 중...' : '발행'}
                            </button>
                        </>
                    )}
                </div>
            </header>

            {/* Design Locked Warning */}
            {isDesignLocked && (
                <div className="px-4 py-3 mx-4 mt-4 rounded-xl bg-kkookk-amber/10 border border-kkookk-amber text-kkookk-amber">
                    ⚠️ 발행된 카드는 디자인을 수정할 수 없습니다. 제목, 리워드 정보만 수정 가능합니다.
                </div>
            )}

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
                            disabled={isDesignLocked}
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
        </OwnerLayout>
    )
}
