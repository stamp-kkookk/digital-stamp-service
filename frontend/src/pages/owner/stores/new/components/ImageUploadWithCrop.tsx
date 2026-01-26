import { useState, useRef, type DragEvent } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

interface ImageUploadWithCropProps {
    onImageSelect: (file: File) => void
    currentImage?: File
    onImageRemove: () => void
}

/**
 * Image Upload with Crop
 *
 * Drag & drop or click-to-upload image component.
 * Features:
 * - Drag & drop zone
 * - File validation (JPEG/PNG, max 5MB)
 * - Circular preview
 * - Remove functionality
 *
 * TODO: Add actual image cropping when needed
 */

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg']

export default function ImageUploadWithCrop({
    onImageSelect,
    currentImage,
    onImageRemove,
}: ImageUploadWithCropProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [error, setError] = useState<string>('')
    const [preview, setPreview] = useState<string>('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const validateFile = (file: File): string | null => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            return 'JPG, PNG 형식의 이미지만 업로드 가능합니다'
        }
        if (file.size > MAX_FILE_SIZE) {
            return '파일 크기는 5MB 이하여야 합니다'
        }
        return null
    }

    const handleFile = (file: File) => {
        setError('')

        const validationError = validateFile(file)
        if (validationError) {
            setError(validationError)
            return
        }

        // Create preview
        const reader = new FileReader()
        reader.onloadend = () => {
            setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)

        onImageSelect(file)
    }

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)

        const file = e.dataTransfer.files[0]
        if (file) {
            handleFile(file)
        }
    }

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleFile(file)
        }
    }

    const handleRemove = () => {
        setPreview('')
        setError('')
        onImageRemove()
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleClick = () => {
        fileInputRef.current?.click()
    }

    return (
        <div>
            {!preview ? (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={handleClick}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-8 transition-colors ${
                        isDragging
                            ? 'border-kkookk-indigo bg-kkookk-indigo/5'
                            : error
                              ? 'border-kkookk-red bg-kkookk-red/5'
                              : 'border-gray-300 bg-gray-50 hover:border-kkookk-indigo hover:bg-kkookk-indigo/5'
                    }`}
                >
                    <Upload
                        className={`mb-3 h-10 w-10 ${
                            isDragging || error ? 'text-kkookk-indigo' : 'text-kkookk-steel'
                        }`}
                    />
                    <p className="mb-1 text-sm font-medium text-kkookk-navy">
                        이미지를 드래그하거나 클릭하여 업로드
                    </p>
                    <p className="text-xs text-kkookk-steel">
                        JPG, PNG (최대 5MB)
                    </p>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={ALLOWED_TYPES.join(',')}
                        onChange={handleFileInputChange}
                        className="hidden"
                        aria-label="로고 이미지 업로드"
                    />
                </div>
            ) : (
                <div className="relative flex flex-col items-center">
                    {/* Circular Preview */}
                    <div className="relative h-32 w-32">
                        <div className="h-full w-full overflow-hidden rounded-full border-4 border-kkookk-indigo/20">
                            <img
                                src={preview}
                                alt="로고 미리보기"
                                className="h-full w-full object-cover"
                            />
                        </div>

                        {/* Remove Button */}
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-kkookk-red text-white shadow-lg transition-transform hover:scale-110"
                            aria-label="이미지 삭제"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <p className="mt-3 text-sm text-kkookk-navy">
                        {currentImage?.name}
                    </p>
                    <button
                        type="button"
                        onClick={handleClick}
                        className="mt-2 text-sm text-kkookk-indigo hover:underline"
                    >
                        다른 이미지 선택
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={ALLOWED_TYPES.join(',')}
                        onChange={handleFileInputChange}
                        className="hidden"
                    />
                </div>
            )}

            {error && (
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-kkookk-red/10 p-3">
                    <ImageIcon className="h-4 w-4 text-kkookk-red" />
                    <p className="text-sm text-kkookk-red">{error}</p>
                </div>
            )}
        </div>
    )
}
