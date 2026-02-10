/**
 * StampCardItem 컴포넌트
 * 지갑 캐러셀에서 개별 스탬프 카드 표시
 */

import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StampCard } from '@/types/domain';

interface StampCardItemProps {
  card: StampCard;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function StampCardItem({
  card,
  isActive = true,
  onClick,
  className,
}: StampCardItemProps) {
  const hasBackgroundImage = !!card.backgroundImage;
  const bgGradient =
    card.bgGradient || 'from-[var(--color-kkookk-orange-500)] to-[#E04F00]';
  const shadowColor = card.shadowColor || 'shadow-orange-200';

  return (
    <div
      onClick={onClick}
      className={cn(
        'w-full aspect-[1.58/1] rounded-2xl p-6 text-white',
        'shadow-xl cursor-pointer flex flex-col justify-between relative overflow-hidden',
        'transition-all duration-300',
        !hasBackgroundImage && 'bg-gradient-to-br',
        !hasBackgroundImage && bgGradient,
        shadowColor,
        !isActive && 'opacity-70 scale-95',
        className
      )}
      style={
        hasBackgroundImage
          ? {
              backgroundImage: `url(${card.backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      {/* 이미지형 오버레이 */}
      {hasBackgroundImage && (
        <div className="absolute inset-0 bg-black/20" />
      )}

      {/* 헤더 */}
      <div className="flex justify-between items-start z-10">
        <span className={cn(
          'font-bold text-lg opacity-90 tracking-tight',
          hasBackgroundImage ? 'text-white drop-shadow-lg' : 'text-white drop-shadow-md'
        )}>
          {card.storeName}
        </span>
        <span className="bg-white/20 px-2 py-1 rounded text-xs backdrop-blur-sm font-medium">
          D-{card.expiryDays || 15}
        </span>
      </div>

      {/* 배경 아이콘 (COLOR 타입만) */}
      {!hasBackgroundImage && (
        <img
          src="/image/cat_pace.png"
          alt="Background"
          className="absolute -right-12 -bottom-12 opacity-10 w-64 h-64 object-cover transform -rotate-12"
        />
      )}

      {/* 푸터 */}
      <div className="flex justify-between items-end z-10">
        <div>
          <p className={cn(
            'text-[10px] font-medium mb-0.5 ml-0.5',
            hasBackgroundImage ? 'text-white/90 drop-shadow-sm' : 'text-white/80'
          )}>
            현재 스탬프
          </p>
          <p className={cn(
            'text-3xl font-bold leading-none',
            hasBackgroundImage ? 'text-white drop-shadow-lg' : 'text-white drop-shadow-sm'
          )}>
            {card.current}개
          </p>
        </div>
        <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm hover:bg-white/30 transition-colors">
          <ChevronRight size={20} />
        </div>
      </div>
    </div>
  );
}

export default StampCardItem;
