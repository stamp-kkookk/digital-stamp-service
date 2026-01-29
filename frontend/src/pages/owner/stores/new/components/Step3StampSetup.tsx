import type { UseFormReturn } from 'react-hook-form'
import { Award, Minus, Plus } from 'lucide-react'
import type { StoreRegistrationFormData } from '../schemas/storeRegistrationSchema'

interface Step3StampSetupProps {
    form: UseFormReturn<StoreRegistrationFormData>
}

/**
 * Step 3: Stamp & Reward Setup
 *
 * Collects stamp card name, max stamps, reward description, and terms agreement.
 * This data will be used for creating the first stamp card (future API).
 */

export default function Step3StampSetup({ form }: Step3StampSetupProps) {
    const {
        register,
        formState: { errors },
        watch,
        setValue,
    } = form

    const maxStamps = watch('maxStamps') || 10
    const termsAgreed = watch('termsAgreed')

    const handleStampIncrement = () => {
        if (maxStamps < 20) {
            setValue('maxStamps', maxStamps + 1, { shouldValidate: true })
        }
    }

    const handleStampDecrement = () => {
        if (maxStamps > 1) {
            setValue('maxStamps', maxStamps - 1, { shouldValidate: true })
        }
    }

    return (
        <div className="space-y-6">
            {/* Section Header */}
            <div className="mb-8 text-center">
                <div className="mb-4 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-kkookk-indigo/10">
                        <Award className="h-8 w-8 text-kkookk-indigo" />
                    </div>
                </div>
                <h2 className="mb-2 text-2xl font-semibold text-kkookk-navy">스탬프 설정</h2>
                <p className="text-sm text-kkookk-steel">
                    첫 번째 스탬프 카드를 만들어보세요
                </p>
            </div>

            {/* Stamp Card Name */}
            <div>
                <label
                    htmlFor="stampCardName"
                    className="mb-2 block text-sm font-medium text-kkookk-navy"
                >
                    스탬프 카드 이름 <span className="text-kkookk-red">*</span>
                </label>
                <input
                    id="stampCardName"
                    type="text"
                    placeholder="예: 기본 적립 카드"
                    {...register('stampCardName')}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-kkookk-navy transition-colors focus:border-kkookk-indigo focus:outline-none focus:ring-2 focus:ring-kkookk-indigo/50 ${
                        errors.stampCardName ? 'border-kkookk-red' : 'border-black/5'
                    }`}
                    aria-invalid={errors.stampCardName ? 'true' : 'false'}
                    aria-describedby={
                        errors.stampCardName ? 'stampCardName-error' : undefined
                    }
                />
                {errors.stampCardName && (
                    <p id="stampCardName-error" className="mt-1 text-sm text-kkookk-red">
                        {errors.stampCardName.message}
                    </p>
                )}
            </div>

            {/* Max Stamps Counter */}
            <div>
                <label className="mb-2 block text-sm font-medium text-kkookk-navy">
                    스탬프 개수 <span className="text-kkookk-red">*</span>
                </label>
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={handleStampDecrement}
                        disabled={maxStamps <= 1}
                        className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-black/5 text-kkookk-navy transition-colors hover:border-kkookk-indigo hover:bg-kkookk-indigo/5 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="스탬프 개수 감소"
                    >
                        <Minus className="h-5 w-5" />
                    </button>
                    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-kkookk-indigo bg-kkookk-indigo/5 py-3">
                        <span className="text-3xl font-bold text-kkookk-indigo">
                            {maxStamps}
                        </span>
                        <span className="text-xs text-kkookk-steel">개</span>
                    </div>
                    <button
                        type="button"
                        onClick={handleStampIncrement}
                        disabled={maxStamps >= 20}
                        className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-black/5 text-kkookk-navy transition-colors hover:border-kkookk-indigo hover:bg-kkookk-indigo/5 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="스탬프 개수 증가"
                    >
                        <Plus className="h-5 w-5" />
                    </button>
                </div>
                {errors.maxStamps && (
                    <p className="mt-1 text-sm text-kkookk-red">{errors.maxStamps.message}</p>
                )}
                <p className="mt-1 text-xs text-kkookk-steel">
                    고객이 모아야 하는 스탬프 개수 (1~20개)
                </p>
            </div>

            {/* Reward Description */}
            <div>
                <label
                    htmlFor="rewardDescription"
                    className="mb-2 block text-sm font-medium text-kkookk-navy"
                >
                    리워드 설명 <span className="text-kkookk-red">*</span>
                </label>
                <textarea
                    id="rewardDescription"
                    rows={4}
                    placeholder="예: 아메리카노 1잔 무료"
                    {...register('rewardDescription')}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-kkookk-navy transition-colors focus:border-kkookk-indigo focus:outline-none focus:ring-2 focus:ring-kkookk-indigo/50 ${
                        errors.rewardDescription ? 'border-kkookk-red' : 'border-black/5'
                    }`}
                    aria-invalid={errors.rewardDescription ? 'true' : 'false'}
                    aria-describedby={
                        errors.rewardDescription ? 'rewardDescription-error' : undefined
                    }
                />
                {errors.rewardDescription && (
                    <p id="rewardDescription-error" className="mt-1 text-sm text-kkookk-red">
                        {errors.rewardDescription.message}
                    </p>
                )}
                <p className="mt-1 text-xs text-kkookk-steel">
                    고객이 스탬프를 모두 모으면 받을 수 있는 혜택을 설명해주세요
                </p>
            </div>

            {/* Terms Agreement */}
            <div className="mt-6">
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-black/5 p-4 transition-colors hover:border-kkookk-indigo hover:bg-kkookk-indigo/5">
                    <input
                        type="checkbox"
                        {...register('termsAgreed')}
                        className="mt-1 h-5 w-5 cursor-pointer rounded border-black/5 text-kkookk-indigo focus:ring-2 focus:ring-kkookk-indigo/50"
                    />
                    <span className="text-sm text-kkookk-navy">
                        <span className={termsAgreed ? 'font-semibold' : ''}>
                            서비스 이용약관
                        </span>
                        에 동의합니다 <span className="text-kkookk-red">*</span>
                    </span>
                </label>
                {errors.termsAgreed && (
                    <p className="mt-1 text-sm text-kkookk-red">
                        {errors.termsAgreed.message}
                    </p>
                )}
            </div>

            {/* Success Preview */}
            <div className="mt-8 rounded-xl bg-kkookk-indigo/5 p-4">
                <p className="mb-2 text-sm font-semibold text-kkookk-navy">
                    🎉 거의 다 됐어요!
                </p>
                <p className="text-sm text-kkookk-steel">
                    매장 등록을 완료하면 바로 고객에게 스탬프를 제공할 수 있습니다.
                </p>
            </div>
        </div>
    )
}
