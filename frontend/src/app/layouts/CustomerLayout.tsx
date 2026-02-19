/**
 * CustomerLayout
 * 고객 PWA 라우트용 레이아웃 래퍼
 *
 * Pre-login: /stores/:storeId/customer/* (URL storeId)
 * Post-login: /customer/* (sessionStorage storeId)
 */

import { useState } from 'react'
import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom'
import { MobileFrame } from '@/components/layout/MobileFrame'
import { PrivacyPolicyModal } from '@/components/shared/PrivacyPolicyModal'
import { useAuth } from '@/app/providers/AuthProvider'
import { clearOriginStoreId } from '@/hooks/useCustomerNavigate'
import { isStepUpValid } from '@/lib/api/tokenManager'
import { ScrollToTop } from '@/components/shared/ScrollToTop'
import { getUserInfo } from '@/lib/api/tokenManager'

export function CustomerLayout() {
    const navigate = useNavigate()
    const location = useLocation()
    const { storeId: urlStoreId } = useParams<{ storeId: string }>()
    const { logout } = useAuth()

    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [currentStoreId, setCurrentStoreId] = useState<number | undefined>(undefined)
    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false)
    const [afterOtpCallback, setAfterOtpCallback] = useState<(() => void) | null>(null)
    const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false)
    const [isStepUpVerified, setIsStepUpVerified] = useState(isStepUpValid())

    // Pre-login: /stores/:storeId/customer, Post-login: /customer
    const base = urlStoreId ? `/stores/${urlStoreId}/customer` : '/customer'

    const userInfo = getUserInfo()
    const userName = userInfo?.name ? `${userInfo.name}님` : '김고객님'

    const navigateToTab = (tab: string) => {
        switch (tab) {
            case 'history': {
                const query = currentStoreId ? `?storeId=${currentStoreId}` : ''
                navigate(`${base}/history${query}`)
                break
            }
            case 'rewardBox':
                navigate(`${base}/redeems`)
                break
            case 'migrationList':
                navigate(`${base}/migrations`)
                break
            default:
                navigate(`${base}/wallet`)
        }
    }

    const openOtpModal = (callback?: () => void) => {
        setAfterOtpCallback(() => callback ?? null)
        setIsOtpModalOpen(true)
    }

    const handleBottomNavClick = (tab: string) => {
        if (tab === 'wallet') {
            navigate(`${base}/wallet`)
            return
        }
        const requiresStepUp = ['history', 'rewardBox', 'migrationList'].includes(tab)
        if (requiresStepUp && !isStepUpValid()) {
            openOtpModal(() => navigateToTab(tab))
        } else {
            navigateToTab(tab)
        }
    }

    const handleVerifyIdentity = () => {
        setIsMenuOpen(false)
        if (!isStepUpValid()) {
            openOtpModal()
        }
    }

    const handlePrivacyPolicy = () => {
        setIsMenuOpen(false)
        setIsPrivacyModalOpen(true)
    }

    const handleOtpVerified = () => {
        setIsStepUpVerified(true)
        setIsOtpModalOpen(false)
        afterOtpCallback?.()
        setAfterOtpCallback(null)
    }

    const handleLogout = () => {
        clearOriginStoreId()
        logout()
        navigate('/')
    }

    return (
        <>
            <MobileFrame
                isMenuOpen={isMenuOpen}
                onMenuClose={() => setIsMenuOpen(false)}
                onVerifyIdentity={handleVerifyIdentity}
                onPrivacyPolicy={handlePrivacyPolicy}
                onLogout={handleLogout}
                userName={userName}
                showBottomNav={!urlStoreId && !location.pathname.includes('/stamp') && !location.pathname.endsWith('/use')}
                onBottomNavClick={handleBottomNavClick}
                isStepUpVerified={isStepUpVerified}
                isOtpModalOpen={isOtpModalOpen}
                onOtpModalChange={setIsOtpModalOpen}
                onOtpVerified={handleOtpVerified}
            >
                <ScrollToTop />
                <Outlet context={{ setIsMenuOpen, setCurrentStoreId }} />
            </MobileFrame>

            <PrivacyPolicyModal
                open={isPrivacyModalOpen}
                onOpenChange={setIsPrivacyModalOpen}
            />
        </>
    )
}

export default CustomerLayout
