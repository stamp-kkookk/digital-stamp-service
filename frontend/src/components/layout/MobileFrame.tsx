/**
 * MobileFrame 컴포넌트
 * 고객 PWA를 위한 풀스크린 웹앱 컨테이너
 * 옵션 사이드바 + BottomNavigationBar + OTP 모달 포함
 */

import type { ReactNode } from 'react'
import { X, ShieldCheck, BookOpen, Info, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MenuLink } from '@/components/shared/MenuLink'
import { BottomNavigationBar } from '@/components/layout/BottomNavigationBar'
import { OtpVerifyModal } from '@/components/shared/OtpVerifyModal'

interface MobileFrameProps {
    children: ReactNode
    // 옵션 사이드바
    isMenuOpen?: boolean
    onMenuClose?: () => void
    onVerifyIdentity?: () => void
    onPrivacyPolicy?: () => void
    onLogout?: () => void
    userName?: string
    // BottomNav
    showBottomNav?: boolean
    onBottomNavClick?: (tab: string) => void
    // OTP Modal
    isStepUpVerified?: boolean
    isOtpModalOpen?: boolean
    onOtpModalChange?: (open: boolean) => void
    onOtpVerified?: () => void
    className?: string
}

export function MobileFrame({
    children,
    isMenuOpen = false,
    onMenuClose,
    onVerifyIdentity,
    onPrivacyPolicy,
    onLogout,
    userName = '김고객님',
    showBottomNav = false,
    onBottomNavClick,
    isStepUpVerified = false,
    isOtpModalOpen = false,
    onOtpModalChange,
    onOtpVerified,
    className,
}: MobileFrameProps) {
    return (
        <div className="h-dvh w-full bg-kkookk-sand flex justify-center">
            <div
                className={cn(
                    'w-full max-w-md h-full bg-white flex flex-col relative overflow-hidden',
                    className
                )}
            >
                {/* 메인 콘텐츠 영역 */}
                <main className="flex-1 min-h-0 flex flex-col no-scrollbar bg-white overflow-y-auto">
                    {children}
                </main>

                {/* 하단 탭 네비게이션 */}
                {showBottomNav && onBottomNavClick && (
                    <BottomNavigationBar onTabClick={(tab) => onBottomNavClick(tab)} />
                )}

                {/* OTP 인증 모달 */}
                {onOtpVerified && onOtpModalChange && (
                    <OtpVerifyModal
                        open={isOtpModalOpen}
                        onOpenChange={onOtpModalChange}
                        onVerified={onOtpVerified}
                    />
                )}

                {/* 옵션 사이드바 */}
                <div
                    className={cn(
                        'absolute inset-0 z-50 flex justify-end transition-opacity duration-200',
                        isMenuOpen ? 'pointer-events-auto' : 'opacity-0 pointer-events-none'
                    )}
                >
                    {/* 배경 오버레이 */}
                    <div
                        role="button"
                        tabIndex={0}
                        aria-label="메뉴 닫기"
                        className={cn(
                            'absolute inset-0 transition-all duration-200',
                            isMenuOpen ? 'bg-kkookk-navy/20 backdrop-blur-sm' : 'bg-transparent'
                        )}
                        onClick={onMenuClose}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                onMenuClose?.()
                            }
                        }}
                    />

                    {/* 옵션 패널 */}
                    <div
                        className={cn(
                            'relative w-75 max-w-[80vw] h-full bg-white shadow-2xl flex flex-col',
                            'transition-transform duration-300 ease-out',
                            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
                        )}
                    >
                        {/* 헤더: 유저 이름 + X 버튼 */}
                        <div className="p-6 pt-12 flex justify-between items-start border-b border-slate-100">
                            <h2 className="font-bold text-xl text-kkookk-navy">{userName}</h2>
                            <button
                                onClick={onMenuClose}
                                className="p-2 -mr-2 -mt-1 text-kkookk-steel hover:text-kkookk-navy hover:bg-slate-50 rounded-full transition-colors"
                                aria-label="메뉴 닫기"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* 옵션 목록 */}
                        <div className="flex-1 overflow-y-auto no-scrollbar py-2">
                            {isStepUpVerified ? (
                                <div className="w-full flex items-center gap-4 px-6 py-4 cursor-default">
                                    <ShieldCheck size={20} className="text-kkookk-orange-500 shrink-0" />
                                    <span className="font-medium text-kkookk-orange-500">본인 인증</span>
                                    <span className="ml-auto text-xs font-bold text-kkookk-orange-500 bg-orange-50 px-2 py-1 rounded-full">
                                        인증됨
                                    </span>
                                </div>
                            ) : (
                                <MenuLink
                                    icon={<ShieldCheck size={20} />}
                                    label="본인 인증"
                                    onClick={onVerifyIdentity ?? (() => {})}
                                />
                            )}
                            <MenuLink
                                icon={<BookOpen size={20} />}
                                label="개인정보처리방침"
                                onClick={onPrivacyPolicy}
                            />
                            <div className="flex items-center gap-3 px-6 py-4 text-slate-400">
                                <Info size={20} />
                                <span className="text-sm">
                                    버전 정보{' '}
                                    <span className="text-xs font-mono ml-1">v1.0.0</span>
                                </span>
                            </div>
                        </div>

                        {/* 로그아웃 */}
                        <div className="p-6 border-t border-slate-100 bg-kkookk-sand/30">
                            <button
                                onClick={onLogout}
                                className="flex items-center gap-3 w-full p-3 text-kkookk-steel hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            >
                                <LogOut size={20} />
                                <span className="font-medium text-sm">로그아웃 / 나가기</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MobileFrame
