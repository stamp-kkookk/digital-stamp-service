import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

interface OwnerLayoutProps {
    children: ReactNode
}

export default function OwnerLayout({ children }: OwnerLayoutProps) {
    return (
        <div className="flex h-screen bg-kkookk-paper">
            {/* Desktop Sidebar - hidden on mobile */}
            <Sidebar className="hidden md:flex" />

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
                {children}
            </main>

            {/* Mobile Bottom Navigation - hidden on desktop */}
            <BottomNav className="md:hidden" />
        </div>
    )
}
