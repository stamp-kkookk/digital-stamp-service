import { Home, Store, BarChart3, Settings } from 'lucide-react'

interface BottomNavProps {
    className?: string
}

interface NavItem {
    icon: typeof Home
    label: string
    path: string
    isActive: boolean
}

export default function BottomNav({ className = '' }: BottomNavProps) {
    const navItems: NavItem[] = [
        { icon: Home, label: '대시보드', path: '/owner/dashboard', isActive: false },
        { icon: Store, label: '매장 관리', path: '/owner/stores', isActive: true },
        { icon: BarChart3, label: '통계', path: '/owner/stats', isActive: false },
        { icon: Settings, label: '설정', path: '/owner/settings', isActive: false },
    ]

    const handleNavClick = (item: NavItem) => {
        if (!item.isActive) {
            console.log(`Navigate to ${item.path} (준비 중)`)
        }
    }

    return (
        <nav
            className={`fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 animate-slideUpBottom ${className}`}
            aria-label="Bottom navigation"
        >
            <div className="flex items-center justify-around h-16 px-2 max-w-screen-sm mx-auto">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = item.isActive

                    return (
                        <button
                            key={item.path}
                            onClick={() => handleNavClick(item)}
                            className={`
                                flex flex-col items-center justify-center gap-1 w-full h-full px-2 rounded-xl transition-all duration-200
                                ${isActive ? 'text-kkookk-indigo scale-110' : 'text-kkookk-steel'}
                                focus:outline-none focus:ring-2 focus:ring-kkookk-indigo/50
                                active:scale-95
                            `}
                            aria-current={isActive ? 'page' : undefined}
                            aria-label={item.label}
                        >
                            <Icon className="w-6 h-6" aria-hidden="true" />
                            <span className="text-xs font-medium">{item.label}</span>
                        </button>
                    )
                })}
            </div>
        </nav>
    )
}
