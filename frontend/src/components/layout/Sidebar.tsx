import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Store, CreditCard, CheckCircle, FileText, BarChart3, Settings, ChevronDown, ChevronRight, Plus, Edit, Building2 } from 'lucide-react'

interface SidebarProps {
    className?: string
}

interface SubMenuItem {
    label: string
    path: string
    icon?: typeof CreditCard
    children?: SubMenuItem[]
}

interface MenuItem {
    icon: typeof Home
    label: string
    path?: string
    badge?: number
    children?: SubMenuItem[]
}

export default function Sidebar({ className = '' }: SidebarProps) {
    const navigate = useNavigate()
    const location = useLocation()
    const [expandedItems, setExpandedItems] = useState<string[]>(['매장 관리', '스탬프 카드 관리'])

    // TODO: Get actual storeId and cardId from context or route params
    const currentStoreId = 1
    const currentCardId = 1

    const menuItems: MenuItem[] = [
        {
            icon: Home,
            label: '대시보드',
            path: '/owner/dashboard'
        },
        {
            icon: Store,
            label: '매장 관리',
            children: [
                { label: '매장 목록', path: '/owner/stores', icon: Building2 },
                {
                    label: '스탬프 카드 관리',
                    path: `/owner/stores/${currentStoreId}/stamp-cards`,
                    icon: CreditCard,
                    children: [
                        { label: '카드 생성하기', path: `/owner/stores/${currentStoreId}/stamp-cards/create`, icon: Plus },
                        { label: '카드 수정하기', path: `/owner/stores/${currentStoreId}/stamp-cards/${currentCardId}/edit`, icon: Edit },
                    ]
                },
                { label: '적립 승인', path: '/owner/approvals', icon: CheckCircle },
                { label: '이전 요청 처리', path: '/owner/migrations', icon: FileText },
            ]
        },
        {
            icon: BarChart3,
            label: '통계',
            path: '/owner/stats'
        },
        {
            icon: Settings,
            label: '설정',
            path: '/owner/settings'
        },
    ]

    const toggleExpand = (label: string) => {
        setExpandedItems(prev =>
            prev.includes(label)
                ? prev.filter(item => item !== label)
                : [...prev, label]
        )
    }

    const handleMenuClick = (path?: string, label?: string, hasChildren?: boolean) => {
        if (hasChildren) {
            toggleExpand(label!)
            return
        }
        if (path) {
            navigate(path)
        }
    }

    const isPathActive = (path: string) => {
        return location.pathname === path || location.pathname.startsWith(path + '/')
    }

    const renderSubMenu = (items: SubMenuItem[], depth: number = 1) => {
        return (
            <ul className={`flex flex-col ${depth === 1 ? 'mt-1 mb-2' : 'mt-1'}`}>
                {items.map((item) => {
                    const hasChildren = item.children && item.children.length > 0
                    const isExpanded = expandedItems.includes(item.label)
                    const isActive = item.path ? isPathActive(item.path) : false
                    const Icon = item.icon

                    return (
                        <li key={item.label}>
                            <button
                                onClick={() => handleMenuClick(item.path, item.label, hasChildren)}
                                className={`
                                    flex items-center gap-2 w-full h-10 px-4 rounded-lg text-sm font-medium transition-all duration-200
                                    ${depth === 1 ? 'ml-8' : 'ml-12'}
                                    ${isActive
                                        ? 'bg-kkookk-indigo/10 text-kkookk-indigo'
                                        : 'text-kkookk-steel hover:bg-gray-50'
                                    }
                                    focus:outline-none focus:ring-2 focus:ring-kkookk-indigo/50 focus:ring-offset-2
                                `}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                {Icon && <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />}
                                <span className="text-left">{item.label}</span>
                                {hasChildren && (
                                    isExpanded
                                        ? <ChevronDown className="w-4 h-4 flex-shrink-0 ml-1" aria-hidden="true" />
                                        : <ChevronRight className="w-4 h-4 flex-shrink-0 ml-1" aria-hidden="true" />
                                )}
                            </button>
                            {hasChildren && isExpanded && renderSubMenu(item.children!, depth + 1)}
                        </li>
                    )
                })}
            </ul>
        )
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
                        const hasChildren = item.children && item.children.length > 0
                        const isExpanded = expandedItems.includes(item.label)
                        const isActive = item.path ? isPathActive(item.path) : false

                        return (
                            <li
                                key={item.label}
                                className="animate-slideInLeft"
                                style={{
                                    animationDelay: `${index * 50}ms`,
                                    animationFillMode: 'both',
                                }}
                            >
                                <button
                                    onClick={() => handleMenuClick(item.path, item.label, hasChildren)}
                                    className={`
                                        flex items-center gap-3 w-full h-12 px-4 rounded-xl text-sm font-medium transition-all duration-200
                                        ${
                                            isActive
                                                ? 'bg-kkookk-indigo/10 text-kkookk-indigo border-l-4 border-kkookk-indigo pl-3'
                                                : 'text-kkookk-steel hover:bg-gray-50'
                                        }
                                        cursor-pointer
                                        focus:outline-none focus:ring-2 focus:ring-kkookk-indigo/50 focus:ring-offset-2
                                    `}
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                    <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                                    <span className="flex-1 text-left">{item.label}</span>
                                    {hasChildren && (
                                        isExpanded
                                            ? <ChevronDown className="w-4 h-4" aria-hidden="true" />
                                            : <ChevronRight className="w-4 h-4" aria-hidden="true" />
                                    )}
                                    {item.badge !== undefined && (
                                        <span
                                            className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-kkookk-indigo text-white text-xs font-semibold animate-pulse-badge"
                                            aria-label={`${item.badge} notifications`}
                                        >
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                                {hasChildren && isExpanded && renderSubMenu(item.children!)}
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
