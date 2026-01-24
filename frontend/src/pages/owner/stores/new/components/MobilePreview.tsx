import { useEffect, useState } from 'react'
import { Store, MapPin, Phone } from 'lucide-react'
import type { StoreRegistrationFormData } from '../schemas/storeRegistrationSchema'

interface MobilePreviewProps {
    formData: Partial<StoreRegistrationFormData>
}

/**
 * Mobile Preview
 *
 * Real-time preview of store information as it would appear on mobile.
 * Shows in iPhone-style frame on desktop (hidden on mobile/tablet).
 * Updates are debounced by 300ms for performance.
 */

export default function MobilePreview({ formData }: MobilePreviewProps) {
    const [debouncedData, setDebouncedData] = useState(formData)

    // Debounce updates for performance
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedData(formData)
        }, 300)

        return () => clearTimeout(timer)
    }, [formData])

    const { name, category, logoFile, address, phone } = debouncedData

    // Create preview URL for logo
    const [logoPreview, setLogoPreview] = useState<string>('')
    useEffect(() => {
        if (logoFile) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setLogoPreview(reader.result as string)
            }
            reader.readAsDataURL(logoFile)
        } else {
            setLogoPreview('')
        }
    }, [logoFile])

    return (
        <div className="hidden lg:block">
            {/* Device Frame */}
            <div className="sticky top-8 w-full max-w-sm">
                <div className="relative">
                    {/* iPhone Frame */}
                    <div className="rounded-[3rem] border-8 border-kkookk-navy/80 bg-kkookk-navy/80 p-3 shadow-2xl">
                        {/* Notch */}
                        <div className="absolute left-1/2 top-3 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-kkookk-navy/80"></div>

                        {/* Screen */}
                        <div className="relative h-[600px] overflow-y-auto rounded-[2.5rem] bg-kkookk-paper">
                            {/* Status Bar */}
                            <div className="flex h-12 items-center justify-between px-6 pt-2">
                                <span className="text-xs font-semibold text-kkookk-navy">
                                    9:41
                                </span>
                                <div className="flex gap-1">
                                    <div className="h-3 w-3 rounded-full bg-kkookk-navy/20"></div>
                                    <div className="h-3 w-3 rounded-full bg-kkookk-navy/20"></div>
                                    <div className="h-3 w-3 rounded-full bg-kkookk-navy/20"></div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="px-6 py-4">
                                {/* Header */}
                                <div className="mb-4 text-center">
                                    <h3 className="text-xs font-semibold text-kkookk-steel">
                                        매장 미리보기
                                    </h3>
                                </div>

                                {/* Store Card */}
                                <div className="rounded-2xl border-2 border-gray-200 bg-white p-4 shadow-sm">
                                    {/* Logo */}
                                    <div className="mb-4 flex justify-center">
                                        {logoPreview ? (
                                            <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-kkookk-orange-500/20">
                                                <img
                                                    src={logoPreview}
                                                    alt="매장 로고"
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                                                <Store className="h-8 w-8 text-kkookk-steel" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Store Name */}
                                    <h2 className="mb-2 text-center text-lg font-bold text-kkookk-navy">
                                        {name || '매장 이름'}
                                    </h2>

                                    {/* Category Badge */}
                                    {category && (
                                        <div className="mb-4 flex justify-center">
                                            <span className="rounded-full bg-kkookk-indigo/10 px-3 py-1 text-xs font-medium text-kkookk-indigo">
                                                {category}
                                            </span>
                                        </div>
                                    )}

                                    {/* Divider */}
                                    <div className="my-4 border-t border-gray-200"></div>

                                    {/* Address */}
                                    {address && (
                                        <div className="mb-2 flex items-start gap-2">
                                            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-kkookk-steel" />
                                            <p className="text-sm text-kkookk-navy">
                                                {address}
                                            </p>
                                        </div>
                                    )}

                                    {/* Phone */}
                                    {phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 flex-shrink-0 text-kkookk-steel" />
                                            <p className="text-sm text-kkookk-navy">{phone}</p>
                                        </div>
                                    )}

                                    {/* Empty State */}
                                    {!address && !phone && (
                                        <p className="text-center text-xs text-kkookk-steel">
                                            연락처 정보를 입력해주세요
                                        </p>
                                    )}
                                </div>

                                {/* Helper Text */}
                                <p className="mt-4 text-center text-xs text-kkookk-steel">
                                    고객에게 이렇게 표시됩니다
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Device Shadow */}
                    <div className="absolute -inset-2 -z-10 rounded-[3.5rem] bg-kkookk-navy/5 blur-xl"></div>
                </div>
            </div>
        </div>
    )
}
