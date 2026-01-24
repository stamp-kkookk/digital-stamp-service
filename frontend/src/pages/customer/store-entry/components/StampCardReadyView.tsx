import React from 'react'
import type { ActiveStampCardSummary, UserStatus } from '../types'
import CtaSection from './CtaSection'
import StampCardSummaryCard from './StampCardSummaryCard'
import StoreInfoHeader from './StoreInfoHeader'

// Info icon for guidance section
const InfoIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-blue-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
    </svg>
)

interface StampCardReadyViewProps {
    data: ActiveStampCardSummary
    userStatus: UserStatus
}

const StampCardReadyView: React.FC<StampCardReadyViewProps> = ({ data, userStatus }) => {
    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="mx-auto flex max-w-md flex-col gap-6">
                {/* DEV CONTROLS - Development mode only */}
                {import.meta.env.DEV && (
                    <div className="rounded-lg border border-yellow-300 bg-yellow-100 p-4 text-xs">
                        <div className="mb-2 font-bold">DEV MODE</div>
                        <div>Store ID: {data.storeInfo.storeId}</div>
                        <div>User Status: {userStatus}</div>
                        <div>Stamp Card ID: {data.stampCardInfo.stampCardId}</div>
                    </div>
                )}

                {/* Store Info Header */}
                <StoreInfoHeader storeName={data.storeInfo.storeName} />

                {/* Stamp Card Summary */}
                <StampCardSummaryCard stampCardInfo={data.stampCardInfo} />

                {/* Guidance Section */}
                <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <InfoIcon />
                    <div className="text-sm text-blue-800">
                        <p className="mb-1 font-semibold">스탬프 적립 방법</p>
                        <p className="text-blue-700">매장 직원에게 QR 코드를 보여주시면 스탬프를 적립해드립니다.</p>
                    </div>
                </div>

                {/* CTA Section */}
                <CtaSection userStatus={userStatus} storeId={String(data.storeInfo.storeId)} />

                {/* Bottom Links */}
                <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
                    <button className="transition-colors hover:text-gray-700">매장 입점하기</button>
                    <span>•</span>
                    <button className="transition-colors hover:text-gray-700">간편 회원 가입</button>
                </div>
            </div>
        </div>
    )
}

export default StampCardReadyView
