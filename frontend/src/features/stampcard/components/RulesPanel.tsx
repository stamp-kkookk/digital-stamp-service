import type { UseFormReturn } from 'react-hook-form'
import type { StampCardFormData } from '../schemas/stampCardSchema'

interface RulesPanelProps {
    form: UseFormReturn<StampCardFormData>
}

export function RulesPanel({ form }: RulesPanelProps) {
    const {
        register,
        formState: { errors },
        watch,
    } = form

    const title = watch('title')
    const rewardName = watch('rewardName')

    return (
        <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto">
            <h2 className="text-xl font-semibold text-kkookk-navy">규칙 설정</h2>

            {/* Card Title */}
            <div>
                <label htmlFor="title" className="block mb-3 text-sm text-kkookk-steel">
                    카드 제목
                </label>
                <input
                    id="title"
                    type="text"
                    {...register('title')}
                    placeholder="스탬프 카드 제목을 입력하세요"
                    maxLength={100}
                    aria-invalid={errors.title ? 'true' : 'false'}
                    aria-describedby={errors.title ? 'title-error' : undefined}
                    className="w-full h-14 px-4 rounded-2xl bg-white border-2 border-kkookk-steel/20 text-kkookk-navy placeholder:text-kkookk-steel/50 focus:outline-none focus:border-kkookk-indigo focus:ring-4 focus:ring-kkookk-indigo/30 aria-[invalid=true]:border-kkookk-red"
                />
                <div className="flex justify-between items-center mt-1">
                    {errors.title && (
                        <p id="title-error" className="text-xs text-kkookk-red">
                            {errors.title.message}
                        </p>
                    )}
                    <p className="text-xs text-kkookk-steel ml-auto">{title?.length || 0} / 100</p>
                </div>
            </div>

            {/* Reward Name */}
            <div>
                <label htmlFor="rewardName" className="block mb-3 text-sm text-kkookk-steel">
                    리워드 명
                </label>
                <input
                    id="rewardName"
                    type="text"
                    {...register('rewardName')}
                    placeholder="예: 아메리카노 1잔 무료"
                    maxLength={255}
                    aria-invalid={errors.rewardName ? 'true' : 'false'}
                    aria-describedby={errors.rewardName ? 'rewardName-error' : undefined}
                    className="w-full h-14 px-4 rounded-2xl bg-white border-2 border-kkookk-steel/20 text-kkookk-navy placeholder:text-kkookk-steel/50 focus:outline-none focus:border-kkookk-indigo focus:ring-4 focus:ring-kkookk-indigo/30 aria-[invalid=true]:border-kkookk-red"
                />
                <div className="flex justify-between items-center mt-1">
                    {errors.rewardName && (
                        <p id="rewardName-error" className="text-xs text-kkookk-red">
                            {errors.rewardName.message}
                        </p>
                    )}
                    <p className="text-xs text-kkookk-steel ml-auto">{rewardName?.length || 0} / 255</p>
                </div>
            </div>

            {/* Reward Quantity */}
            <div>
                <label htmlFor="rewardQuantity" className="block mb-3 text-sm text-kkookk-steel">
                    리워드 수량
                </label>
                <input
                    id="rewardQuantity"
                    type="number"
                    min="1"
                    {...register('rewardQuantity', { valueAsNumber: true })}
                    aria-invalid={errors.rewardQuantity ? 'true' : 'false'}
                    aria-describedby={errors.rewardQuantity ? 'rewardQuantity-error' : undefined}
                    className="w-full h-14 px-4 rounded-2xl bg-white border-2 border-kkookk-steel/20 text-kkookk-navy focus:outline-none focus:border-kkookk-indigo focus:ring-4 focus:ring-kkookk-indigo/30 aria-[invalid=true]:border-kkookk-red"
                />
                {errors.rewardQuantity && (
                    <p id="rewardQuantity-error" className="mt-1 text-xs text-kkookk-red">
                        {errors.rewardQuantity.message}
                    </p>
                )}
            </div>

            {/* Expire Days */}
            <div>
                <label htmlFor="expireDays" className="block mb-3 text-sm text-kkookk-steel">
                    리워드 유효기간 (일)
                </label>
                <input
                    id="expireDays"
                    type="number"
                    min="1"
                    {...register('expireDays', { valueAsNumber: true })}
                    aria-invalid={errors.expireDays ? 'true' : 'false'}
                    aria-describedby={errors.expireDays ? 'expireDays-error' : undefined}
                    className="w-full h-14 px-4 rounded-2xl bg-white border-2 border-kkookk-steel/20 text-kkookk-navy focus:outline-none focus:border-kkookk-indigo focus:ring-4 focus:ring-kkookk-indigo/30 aria-[invalid=true]:border-kkookk-red"
                />
                {errors.expireDays && (
                    <p id="expireDays-error" className="mt-1 text-xs text-kkookk-red">
                        {errors.expireDays.message}
                    </p>
                )}
            </div>

            {/* Info Box */}
            <div className="p-4 rounded-2xl bg-kkookk-navy-50 border border-kkookk-steel/20">
                <p className="mb-2 text-sm font-medium text-kkookk-navy">리워드 설정 안내</p>
                <p className="text-sm text-kkookk-steel">
                    스탬프를 모두 적립한 고객에게 제공할 리워드를 설정하세요. 리워드는 자동으로 발급되며, 설정한
                    유효기간 내에 사용할 수 있습니다.
                </p>
            </div>
        </div>
    )
}