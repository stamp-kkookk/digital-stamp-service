import type { UseFormReturn } from 'react-hook-form'
import { Store } from 'lucide-react'
import ImageUploadWithCrop from './ImageUploadWithCrop'
import type { StoreRegistrationFormData } from '../schemas/storeRegistrationSchema'
import type { StoreCategory } from '../../../../../types/storeRegistration'

interface Step1BasicInfoProps {
    form: UseFormReturn<StoreRegistrationFormData>
}

/**
 * Step 1: Basic Info
 *
 * Collects store name, category, and logo (optional).
 * Category and logo are frontend-only until backend support.
 */

const CATEGORIES: StoreCategory[] = [
    '카페',
    '음식점',
    '베이커리',
    '뷰티/미용',
    '리테일',
    '기타',
]

export default function Step1BasicInfo({ form }: Step1BasicInfoProps) {
    const {
        register,
        formState: { errors },
        watch,
        setValue,
    } = form

    const selectedCategory = watch('category')
    const logoFile = watch('logoFile')

    const handleImageSelect = (file: File) => {
        setValue('logoFile', file, { shouldValidate: true })
    }

    const handleImageRemove = () => {
        setValue('logoFile', undefined, { shouldValidate: true })
    }

    return (
        <div className="space-y-6">
            {/* Section Header */}
            <div className="mb-8 text-center">
                <div className="mb-4 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-kkookk-indigo/10">
                        <Store className="h-8 w-8 text-kkookk-indigo" />
                    </div>
                </div>
                <h2 className="mb-2 text-2xl font-semibold text-kkookk-navy">매장 기본 정보</h2>
                <p className="text-sm text-kkookk-steel">
                    매장 이름과 카테고리를 입력해주세요
                </p>
            </div>

            {/* Store Name */}
            <div>
                <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-kkookk-navy"
                >
                    매장 이름 <span className="text-kkookk-red">*</span>
                </label>
                <input
                    id="name"
                    type="text"
                    placeholder="예: 우리 카페"
                    {...register('name')}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-kkookk-navy transition-colors focus:border-kkookk-indigo focus:outline-none focus:ring-2 focus:ring-kkookk-indigo/50 ${
                        errors.name ? 'border-kkookk-red' : 'border-black/5'
                    }`}
                    aria-invalid={errors.name ? 'true' : 'false'}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                />
                {errors.name && (
                    <p id="name-error" className="mt-1 text-sm text-kkookk-red">
                        {errors.name.message}
                    </p>
                )}
            </div>

            {/* Category */}
            <div>
                <label
                    htmlFor="category"
                    className="mb-2 block text-sm font-medium text-kkookk-navy"
                >
                    카테고리 <span className="text-kkookk-red">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {CATEGORIES.map((category) => (
                        <label
                            key={category}
                            className={`cursor-pointer rounded-xl border-2 p-4 text-center text-sm font-medium transition-all hover:border-kkookk-indigo hover:bg-kkookk-indigo/5 ${
                                selectedCategory === category
                                    ? 'border-kkookk-indigo bg-kkookk-indigo/10 text-kkookk-indigo'
                                    : 'border-black/5 text-kkookk-navy'
                            } ${errors.category ? 'border-kkookk-red/50' : ''}`}
                        >
                            <input
                                type="radio"
                                value={category}
                                {...register('category')}
                                className="sr-only"
                            />
                            {category}
                        </label>
                    ))}
                </div>
                {errors.category && (
                    <p id="category-error" className="mt-1 text-sm text-kkookk-red">
                        {errors.category.message}
                    </p>
                )}
            </div>

            {/* Logo Upload */}
            <div>
                <label className="mb-2 block text-sm font-medium text-kkookk-navy">
                    매장 로고 <span className="text-xs text-kkookk-steel">(선택)</span>
                </label>
                <ImageUploadWithCrop
                    onImageSelect={handleImageSelect}
                    currentImage={logoFile}
                    onImageRemove={handleImageRemove}
                />
                <p className="mt-1 text-xs text-kkookk-steel">
                    권장: 정사각형 이미지 (500x500px), 최대 5MB
                </p>
            </div>
        </div>
    )
}
