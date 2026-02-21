/**
 * BottomNavigationBar 컴포넌트
 * 고객 PWA 하단 탭 네비게이션 (내 지갑 / 이력 / 리워드 / 전환)
 */

import { useLocation } from 'react-router-dom'
import { Wallet, History, Gift, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

type TabKey = 'wallet' | 'history' | 'rewardBox' | 'migrationList'

interface Tab {
    key: TabKey
    label: string
    icon: React.ElementType
    pathSegment: string
}

const TABS: Tab[] = [
    { key: 'wallet', label: '내 지갑', icon: Wallet, pathSegment: '/wallet' },
    { key: 'history', label: '이력', icon: History, pathSegment: '/history' },
    { key: 'rewardBox', label: '리워드', icon: Gift, pathSegment: '/redeems' },
    { key: 'migrationList', label: '전환', icon: FileText, pathSegment: '/migrations' },
]

interface BottomNavigationBarProps {
    onTabClick: (tab: TabKey) => void
}

export function BottomNavigationBar({ onTabClick }: BottomNavigationBarProps) {
    const { pathname } = useLocation()

    const getActiveTab = (): TabKey => {
        if (pathname.includes('/history')) return 'history'
        if (pathname.includes('/redeems')) return 'rewardBox'
        if (pathname.includes('/migrations')) return 'migrationList'
        return 'wallet'
    }

    const activeTab = getActiveTab()

    return (
        <nav
            className="shrink-0 flex items-stretch bg-white border-t border-slate-100 z-20"
            aria-label="하단 탭 네비게이션"
        >
            {TABS.map(({ key, label, icon: Icon }) => {
                const isActive = activeTab === key
                return (
                    <button
                        key={key}
                        onClick={() => onTabClick(key)}
                        className={cn(
                            'flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors',
                            isActive
                                ? 'text-kkookk-orange-500'
                                : 'text-kkookk-steel hover:text-kkookk-navy'
                        )}
                        aria-label={label}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        <Icon
                            size={22}
                            strokeWidth={isActive ? 2.5 : 1.8}
                        />
                        <span className={cn('text-[11px] font-medium', isActive && 'font-bold')}>
                            {label}
                        </span>
                    </button>
                )
            })}
        </nav>
    )
}

export default BottomNavigationBar
