/**
 * LauncherCard 컴포넌트
 * 런처 페이지에서 다양한 앱 모드를 선택하기 위한 카드 컴포넌트
 */

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface LauncherCardProps {
  icon: ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
  color: string;
  className?: string;
}

export function LauncherCard({
  icon,
  title,
  desc,
  onClick,
  color,
  className,
}: LauncherCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm',
        'hover:shadow-xl transition-all border border-slate-100 hover:border-slate-200 group',
        className
      )}
    >
      <div
        className={cn(
          'p-4 rounded-full text-white mb-4 group-hover:scale-110 transition-transform',
          color
        )}
      >
        {icon}
      </div>
      <h2 className="text-xl font-bold text-kkookk-navy mb-2">{title}</h2>
      <p className="text-kkookk-steel text-center text-sm">{desc}</p>
    </button>
  );
}

export default LauncherCard;
