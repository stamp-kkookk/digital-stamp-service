import { Home, Store, CreditCard, CheckCircle, FileText, BarChart3, Settings } from 'lucide-react'

interface SidebarProps {
    className?: string
}

interface MenuItem {
    icon: typeof Home
    label: string
    path: string
    isActive: boolean
    isDisabled: boolean
    badge?: number
}

export default function Sidebar({ className = '' }: SidebarProps) {
    const menuItems: MenuItem[] = [
        { icon: Home, label: '대시보드', path: '/owner/dashboard', isActive: false, isDisabled: true },
        { icon: Store, label: '매장 관리', path: '/owner/stores', isActive: true, isDisabled: false },
        { icon: CreditCard, label: '스탬프카드 관리', path: '/owner/stamp-cards', isActive: false, isDisabled: true },
        { icon: CheckCircle, label: '적립 승인', path: '/owner/approvals', isActive: false, isDisabled: true, badge: 5 },
        { icon: FileText, label: '이전 요청 처리', path: '/owner/migrations', isActive: false, isDisabled: true, badge: 3 },
        { icon: BarChart3, label: '통계', path: '/owner/stats', isActive: false, isDisabled: true },
        { icon: Settings, label: '설정', path: '/owner/settings', isActive: false, isDisabled: true },
    ]

    const handleMenuClick = (item: MenuItem) => {
        if (item.isDisabled) {
            console.log(`${item.label} 메뉴는 준비 중입니다`)
            return
        }
        console.log(`Navigate to ${item.path}`)
    }

    return (
        <aside
            className={`flex flex-col w-64 h-screen bg-white border-r border-gray-200 ${className}`}
            aria-label="Owner navigation sidebar"
        >
            {/* Logo */}
            <div className="flex items-center h-16 px-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-kkookk-indigo to-kkookk-indigo/80 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">K</span>
                    </div>
                    <span className="text-lg font-semibold text-kkookk-navy">KKOOKK</span>
                    <span className="px-2 py-0.5 text-xs font-medium rounded bg-kkookk-indigo/10 text-kkookk-indigo">
                        Owner
                    </span>
                </div>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 p-4 overflow-y-auto" aria-label="Main menu">
                <ul className="flex flex-col gap-1">
                    {menuItems.map((item, index) => {
                        const Icon = item.icon
                        const isActive = item.isActive
                        const isDisabled = item.isDisabled

                        return (
                            <li
                                key={item.path}
                                className="animate-slideInLeft"
                                style={{
                                    animationDelay: `${index * 50}ms`,
                                    animationFillMode: 'both',
                                }}
                            >
                                <button
                                    onClick={() => handleMenuClick(item)}
                                    disabled={isDisabled}
                                    className={`
                                        flex items-center gap-3 w-full h-12 px-4 rounded-xl text-sm font-medium transition-all duration-200
                                        ${
                                            isActive
                                                ? 'bg-kkookk-indigo/10 text-kkookk-indigo border-l-4 border-kkookk-indigo pl-3'
                                                : 'text-kkookk-steel hover:bg-gray-50'
                                        }
                                        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                        focus:outline-none focus:ring-2 focus:ring-kkookk-indigo/50 focus:ring-offset-2
                                    `}
                                    aria-current={isActive ? 'page' : undefined}
                                    aria-disabled={isDisabled}
                                >
                                    <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                                    <span className="flex-1 text-left">{item.label}</span>
                                    {item.badge !== undefined && (
                                        <span
                                            className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-kkookk-indigo text-white text-xs font-semibold animate-pulse-badge"
                                            aria-label={`${item.badge} notifications`}
                                        >
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <div className="w-10 h-10 rounded-full bg-kkookk-indigo/20 flex items-center justify-center">
                        <span className="text-kkookk-indigo font-semibold">점</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-kkookk-navy truncate">점주님</p>
                        <p className="text-xs text-kkookk-steel truncate">owner@kkookk.com</p>
                    </div>
                </div>
            </div>
        </aside>
    )
}
