import imageCompression from 'browser-image-compression'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_OUTPUT_SIZE = 50 * 1024 // 50KB (after compression)

export interface ImageCompressionOptions {
    maxSizeMB: number
    maxWidthOrHeight: number
    useWebWorker?: boolean
}

export interface ImageValidationError {
    type: 'size' | 'format' | 'compression'
    message: string
}

/**
 * Validate image file before upload
 */
export function validateImageFile(file: File): ImageValidationError | null {
    // Check file size (before compression)
    if (file.size > MAX_FILE_SIZE) {
        return {
            type: 'size',
            message: `이미지 파일이 너무 큽니다. 최대 ${MAX_FILE_SIZE / 1024 / 1024}MB까지 업로드 가능합니다.`,
        }
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
        return {
            type: 'format',
            message: '이미지 파일만 업로드할 수 있습니다.',
        }
    }

    // Check specific formats
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
        return {
            type: 'format',
            message: 'JPG, PNG, WebP, GIF 형식의 이미지만 업로드 가능합니다.',
        }
    }

    return null
}

/**
 * Compress and convert image to base64
 */
export async function compressAndConvertToBase64(
    file: File,
    options?: Partial<ImageCompressionOptions>
): Promise<string> {
    const defaultOptions: ImageCompressionOptions = {
        maxSizeMB: MAX_OUTPUT_SIZE / 1024 / 1024, // 50KB
        maxWidthOrHeight: 800,
        useWebWorker: true,
        ...options,
    }

    try {
        // Compress image
        const compressedFile = await imageCompression(file, defaultOptions)

        // Convert to base64
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (event) => {
                const result = event.target?.result
                if (typeof result === 'string') {
                    resolve(result)
                } else {
                    reject(new Error('Failed to convert image to base64'))
                }
            }
            reader.onerror = () => reject(new Error('Failed to read file'))
            reader.readAsDataURL(compressedFile)
        })
    } catch (error) {
        console.error('Image compression error:', error)
        throw new Error('이미지 압축 중 오류가 발생했습니다.')
    }
}

/**
 * Get human-readable file size
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) {
        return '0 Bytes'
    }

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Process image upload with validation and compression
 */
export async function processImageUpload(file: File): Promise<{
    success: boolean
    data?: string
    error?: ImageValidationError
}> {
    // Validate
    const validationError = validateImageFile(file)
    if (validationError) {
        return {
            success: false,
            error: validationError,
        }
    }

    try {
        // Compress and convert
        const base64 = await compressAndConvertToBase64(file)

        return {
            success: true,
            data: base64,
        }
    } catch (error) {
        return {
            success: false,
            error: {
                type: 'compression',
                message: error instanceof Error ? error.message : '이미지 처리 중 오류가 발생했습니다.',
            },
        }
    }
}
