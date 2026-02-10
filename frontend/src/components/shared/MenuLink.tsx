/**
 * MenuLink 컴포넌트
 * 사이드 메뉴용 네비게이션 링크 아이템
 */

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MenuLinkProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  isActive?: boolean;
  className?: string;
}

export function MenuLink({
  icon,
  label,
  onClick,
  isActive = false,
  className,
}: MenuLinkProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors text-left group',
        isActive && 'bg-slate-50',
        className
      )}
    >
      <div
        className={cn(
          'text-kkookk-steel group-hover:text-kkookk-orange-500 transition-colors',
          isActive && 'text-kkookk-orange-500'
        )}
      >
        {icon}
      </div>
      <span
        className={cn(
          'font-medium text-kkookk-navy group-hover:text-kkookk-orange-500 transition-colors',
          isActive && 'text-kkookk-orange-500'
        )}
      >
        {label}
      </span>
    </button>
  );
}

export default MenuLink;
