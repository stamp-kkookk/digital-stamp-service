import type { UseFormReturn } from 'react-hook-form'
import { MapPin, Phone } from 'lucide-react'
import type { StoreRegistrationFormData } from '../schemas/storeRegistrationSchema'

interface Step2LocationProps {
    form: UseFormReturn<StoreRegistrationFormData>
}

/**
 * Step 2: Location & Contact
 *
 * Collects store address and phone number (both optional).
 * Provides clear guidance on formatting.
 */

export default function Step2Location({ form }: Step2LocationProps) {
    const {
        register,
        formState: { errors },
    } = form

    return (
        <div className="space-y-6">
            {/* Section Header */}
            <div className="mb-8 text-center">
                <div className="mb-4 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-kkookk-indigo/10">
                        <MapPin className="h-8 w-8 text-kkookk-indigo" />
                    </div>
                </div>
                <h2 className="mb-2 text-2xl font-semibold text-kkookk-navy">
                    위치 & 연락처 정보
                </h2>
                <p className="text-sm text-kkookk-steel">
                    고객이 매장을 쉽게 찾을 수 있도록 정보를 입력해주세요
                </p>
            </div>

            {/* Address */}
            <div>
                <label
                    htmlFor="address"
                    className="mb-2 block text-sm font-medium text-kkookk-navy"
                >
                    매장 주소 <span className="text-xs text-kkookk-steel">(선택)</span>
                </label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-kkookk-steel" />
                    <input
                        id="address"
                        type="text"
                        placeholder="예: 서울시 강남구 테헤란로 123"
                        {...register('address')}
                        className={`w-full rounded-xl border-2 py-3 pl-11 pr-4 text-kkookk-navy transition-colors focus:border-kkookk-indigo focus:outline-none focus:ring-2 focus:ring-kkookk-indigo/50 ${
                            errors.address ? 'border-kkookk-red' : 'border-black/5'
                        }`}
                        aria-invalid={errors.address ? 'true' : 'false'}
                        aria-describedby={errors.address ? 'address-error' : undefined}
                    />
                </div>
                {errors.address && (
                    <p id="address-error" className="mt-1 text-sm text-kkookk-red">
                        {errors.address.message}
                    </p>
                )}
                <p className="mt-1 text-xs text-kkookk-steel">
                    고객이 매장 위치를 확인할 수 있도록 상세 주소를 입력해주세요
                </p>
            </div>

            {/* Phone */}
            <div>
                <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-medium text-kkookk-navy"
                >
                    전화번호 <span className="text-xs text-kkookk-steel">(선택)</span>
                </label>
                <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-kkookk-steel" />
                    <input
                        id="phone"
                        type="tel"
                        placeholder="예: 02-1234-5678"
                        {...register('phone')}
                        className={`w-full rounded-xl border-2 py-3 pl-11 pr-4 text-kkookk-navy transition-colors focus:border-kkookk-indigo focus:outline-none focus:ring-2 focus:ring-kkookk-indigo/50 ${
                            errors.phone ? 'border-kkookk-red' : 'border-black/5'
                        }`}
                        aria-invalid={errors.phone ? 'true' : 'false'}
                        aria-describedby={errors.phone ? 'phone-error' : undefined}
                    />
                </div>
                {errors.phone && (
                    <p id="phone-error" className="mt-1 text-sm text-kkookk-red">
                        {errors.phone.message}
                    </p>
                )}
                <p className="mt-1 text-xs text-kkookk-steel">
                    숫자와 하이픈(-)만 입력 가능합니다
                </p>
            </div>

            {/* Info Card */}
            <div className="mt-8 rounded-xl bg-kkookk-indigo/5 p-4">
                <p className="text-sm text-kkookk-navy">
                    <span className="font-semibold">💡 팁:</span> 주소와 전화번호는 나중에
                    수정할 수 있습니다. 지금 정확한 정보가 없다면 나중에 추가해도 괜찮아요!
                </p>
            </div>
        </div>
    )
}
