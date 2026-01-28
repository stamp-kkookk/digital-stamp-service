import { useState } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { processImageUpload, formatFileSize } from '@/lib/imageUtils'

interface DesignStudioPanelProps {
    mode: 'custom' | 'puzzle'
    onModeChange: (mode: 'custom' | 'puzzle') => void
    totalStamps: number
    onTotalStampsChange: (value: number) => void
    puzzleGrid: '2x2' | '3x3' | '4x4' | '5x4'
    onPuzzleGridChange: (grid: '2x2' | '3x3' | '4x4' | '5x4') => void
    puzzleImage: string | null
    onPuzzleImageChange: (image: string | null) => void
    backgroundImage: string | null
    onBackgroundImageChange: (image: string | null) => void
    emptyIcon: string | null
    onEmptyIconChange: (icon: string | null) => void
    stampIcon: string | null
    onStampIconChange: (icon: string | null) => void
    disabled?: boolean
}

export function DesignStudioPanel({
    mode,
    onModeChange,
    totalStamps,
    onTotalStampsChange,
    puzzleGrid,
    onPuzzleGridChange,
    puzzleImage,
    onPuzzleImageChange,
    backgroundImage,
    onBackgroundImageChange,
    emptyIcon,
    onEmptyIconChange,
    stampIcon,
    onStampIconChange,
    disabled = false,
}: DesignStudioPanelProps) {
    const [uploadingField, setUploadingField] = useState<string | null>(null)
    const [uploadError, setUploadError] = useState<string | null>(null)

    const handleImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
        callback: (image: string | null) => void,
        fieldName: string
    ) => {
        const file = e.target.files?.[0]
        if (!file) {
            return
        }

        // Reset error
        setUploadError(null)
        setUploadingField(fieldName)

        try {
            const result = await processImageUpload(file)

            if (result.success && result.data) {
                callback(result.data)

                // Show success feedback (optional)
                const originalSize = formatFileSize(file.size)
                const compressedSize = formatFileSize(new Blob([result.data]).size)
                console.log(`Image uploaded: ${originalSize} → ${compressedSize}`)
            } else if (result.error) {
                setUploadError(result.error.message)
                callback(null)
            }
        } catch (error) {
            setUploadError('이미지 업로드 중 오류가 발생했습니다.')
            callback(null)
            console.error('Image upload error:', error)
        } finally {
            setUploadingField(null)
            // Clear input so same file can be uploaded again
            e.target.value = ''
        }
    }

    return (
        <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto">
            <h2 className="text-xl font-semibold text-kkookk-navy">Design Studio</h2>

            {/* Error Message */}
            {uploadError && (
                <div className="p-3 rounded-xl bg-kkookk-red/10 border border-kkookk-red text-kkookk-red text-sm">
                    {uploadError}
                </div>
            )}

            {/* Mode Toggle */}
            <div>
                <label className="block mb-3 text-sm text-kkookk-steel">Mode</label>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => onModeChange('custom')}
                        disabled={disabled}
                        className={twMerge(
                            'flex-1 h-11 rounded-2xl transition-all font-medium',
                            'focus:outline-none focus:ring-4 focus:ring-kkookk-indigo/30',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            mode === 'custom'
                                ? 'bg-kkookk-indigo text-white'
                                : 'bg-white text-kkookk-steel border-2 border-kkookk-steel/20'
                        )}
                    >
                        일반
                    </button>
                    <button
                        type="button"
                        onClick={() => onModeChange('puzzle')}
                        disabled={disabled}
                        className={twMerge(
                            'flex-1 h-11 rounded-2xl transition-all font-medium',
                            'focus:outline-none focus:ring-4 focus:ring-kkookk-indigo/30',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            mode === 'puzzle'
                                ? 'bg-kkookk-indigo text-white'
                                : 'bg-white text-kkookk-steel border-2 border-kkookk-steel/20'
                        )}
                    >
                        퍼즐
                    </button>
                </div>
            </div>

            {/* Custom Mode */}
            {mode === 'custom' && (
                <>
                    {/* Background Image */}
                    <div>
                        <label htmlFor="background-upload" className="block mb-3 text-sm text-kkookk-steel">
                            배경 이미지
                        </label>
                        <label
                            htmlFor="background-upload"
                            className={twMerge(
                                'block w-full aspect-square rounded-2xl overflow-hidden transition-all bg-kkookk-sand border border-black/5',
                                !disabled && 'cursor-pointer',
                                !disabled && uploadingField !== 'background' && 'hover:opacity-80',
                                (uploadingField === 'background' || disabled) && 'opacity-50 cursor-not-allowed'
                            )}
                        >
                            <input
                                id="background-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={disabled || uploadingField !== null}
                                onChange={(e) => handleImageUpload(e, onBackgroundImageChange, 'background')}
                            />
                            {uploadingField === 'background' ? (
                                <div className="flex flex-col items-center justify-center gap-2 w-full h-full">
                                    <Loader2 size={24} className="text-kkookk-steel animate-spin" />
                                    <span className="text-sm text-kkookk-steel">압축 중...</span>
                                </div>
                            ) : backgroundImage ? (
                                <img src={backgroundImage} alt="Background" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-2 w-full h-full">
                                    <Upload size={24} className="text-kkookk-steel" />
                                    <span className="text-sm text-kkookk-steel">이미지 업로드</span>
                                </div>
                            )}
                        </label>
                    </div>

                    {/* Empty Icon */}
                    <div>
                        <label htmlFor="empty-icon-upload" className="block mb-3 text-sm text-kkookk-steel">
                            빈 스탬프 아이콘
                        </label>
                        <label
                            htmlFor="empty-icon-upload"
                            className={twMerge(
                                'block w-full aspect-square rounded-2xl overflow-hidden transition-all bg-kkookk-sand border border-black/5',
                                !disabled && 'cursor-pointer',
                                !disabled && uploadingField !== 'emptyIcon' && 'hover:opacity-80',
                                (uploadingField === 'emptyIcon' || disabled) && 'opacity-50 cursor-not-allowed'
                            )}
                        >
                            <input
                                id="empty-icon-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={disabled || uploadingField !== null}
                                onChange={(e) => handleImageUpload(e, onEmptyIconChange, 'emptyIcon')}
                            />
                            {uploadingField === 'emptyIcon' ? (
                                <div className="flex flex-col items-center justify-center gap-2 w-full h-full">
                                    <Loader2 size={24} className="text-kkookk-steel animate-spin" />
                                    <span className="text-sm text-kkookk-steel">압축 중...</span>
                                </div>
                            ) : emptyIcon ? (
                                <img src={emptyIcon} alt="Empty Icon" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-2 w-full h-full">
                                    <Upload size={24} className="text-kkookk-steel" />
                                    <span className="text-sm text-kkookk-steel">아이콘 업로드</span>
                                </div>
                            )}
                        </label>
                    </div>

                    {/* Stamp Icon */}
                    <div>
                        <label htmlFor="stamp-icon-upload" className="block mb-3 text-sm text-kkookk-steel">
                            찍힌 스탬프 아이콘
                        </label>
                        <label
                            htmlFor="stamp-icon-upload"
                            className={twMerge(
                                'block w-full aspect-square rounded-2xl overflow-hidden transition-all bg-kkookk-sand border border-black/5',
                                !disabled && 'cursor-pointer',
                                !disabled && uploadingField !== 'stampIcon' && 'hover:opacity-80',
                                (uploadingField === 'stampIcon' || disabled) && 'opacity-50 cursor-not-allowed'
                            )}
                        >
                            <input
                                id="stamp-icon-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={disabled || uploadingField !== null}
                                onChange={(e) => handleImageUpload(e, onStampIconChange, 'stampIcon')}
                            />
                            {uploadingField === 'stampIcon' ? (
                                <div className="flex flex-col items-center justify-center gap-2 w-full h-full">
                                    <Loader2 size={24} className="text-kkookk-steel animate-spin" />
                                    <span className="text-sm text-kkookk-steel">압축 중...</span>
                                </div>
                            ) : stampIcon ? (
                                <img src={stampIcon} alt="Stamp Icon" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-2 w-full h-full">
                                    <Upload size={24} className="text-kkookk-steel" />
                                    <span className="text-sm text-kkookk-steel">아이콘 업로드</span>
                                </div>
                            )}
                        </label>
                    </div>

                    {/* Total Stamps Slider */}
                    <div>
                        <label htmlFor="total-stamps" className="block mb-3 text-sm text-kkookk-steel">
                            전체 스탬프 개수: {totalStamps}
                        </label>
                        <input
                            id="total-stamps"
                            type="range"
                            min="4"
                            max="20"
                            value={totalStamps}
                            onChange={(e) => onTotalStampsChange(parseInt(e.target.value))}
                            disabled={disabled}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                accentColor: '#2e58ff',
                            }}
                        />
                        <div className="flex justify-between mt-1 text-xs text-kkookk-steel">
                            <span>4</span>
                            <span>20</span>
                        </div>
                    </div>
                </>
            )}

            {/* Puzzle Mode */}
            {mode === 'puzzle' && (
                <>
                    {/* Grid Preset */}
                    <div>
                        <label className="block mb-3 text-sm text-kkookk-steel">퍼즐 그리드</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(['2x2', '3x3', '4x4', '5x4'] as const).map((grid) => (
                                <button
                                    key={grid}
                                    type="button"
                                    onClick={() => onPuzzleGridChange(grid)}
                                    disabled={disabled}
                                    className={twMerge(
                                        'h-11 rounded-2xl transition-all font-medium',
                                        'focus:outline-none focus:ring-4 focus:ring-kkookk-indigo/30',
                                        'disabled:opacity-50 disabled:cursor-not-allowed',
                                        puzzleGrid === grid
                                            ? 'bg-kkookk-indigo text-white'
                                            : 'bg-white text-kkookk-steel border-2 border-kkookk-steel/20'
                                    )}
                                >
                                    {grid}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Puzzle Image */}
                    <div>
                        <label htmlFor="puzzle-image-upload" className="block mb-3 text-sm text-kkookk-steel">
                            퍼즐 이미지
                        </label>
                        <label
                            htmlFor="puzzle-image-upload"
                            className={twMerge(
                                'block w-full aspect-square rounded-2xl overflow-hidden transition-all bg-kkookk-sand border border-black/5',
                                !disabled && 'cursor-pointer',
                                !disabled && uploadingField !== 'puzzleImage' && 'hover:opacity-80',
                                (uploadingField === 'puzzleImage' || disabled) && 'opacity-50 cursor-not-allowed'
                            )}
                        >
                            <input
                                id="puzzle-image-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={disabled || uploadingField !== null}
                                onChange={(e) => handleImageUpload(e, onPuzzleImageChange, 'puzzleImage')}
                            />
                            {uploadingField === 'puzzleImage' ? (
                                <div className="flex flex-col items-center justify-center gap-2 w-full h-full">
                                    <Loader2 size={24} className="text-kkookk-steel animate-spin" />
                                    <span className="text-sm text-kkookk-steel">압축 중...</span>
                                </div>
                            ) : puzzleImage ? (
                                <img src={puzzleImage} alt="Puzzle" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-2 w-full h-full">
                                    <Upload size={24} className="text-kkookk-steel" />
                                    <span className="text-sm text-kkookk-steel">이미지 업로드</span>
                                </div>
                            )}
                        </label>
                    </div>

                    {/* Shuffle Button (UI Mock) */}
                    <div>
                        <button
                            type="button"
                            disabled={disabled}
                            className="w-full h-11 rounded-2xl transition-all bg-gray-100 hover:bg-gray-200 text-kkookk-navy border border-kkookk-steel/20 font-medium focus:outline-none focus:ring-4 focus:ring-kkookk-indigo/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            랜덤 섞기
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}