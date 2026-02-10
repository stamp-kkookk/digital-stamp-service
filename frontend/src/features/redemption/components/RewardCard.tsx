/**
 * RewardCard 컴포넌트
 * 개별 리워드 카드 표시 (스탬프 카드 디자인 반영)
 */

import { Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import type { Reward } from '@/types/domain';
import { parseDesignJson } from '@/features/wallet/utils/cardDesign';

interface RewardCardProps {
  reward: Reward;
  onRedeem?: () => void;
}

export function RewardCard({ reward, onRedeem }: RewardCardProps) {
  const design = parseDesignJson(reward.designJson);
  const hasImage = !!design.backgroundImage;

  return (
    <div
      className={cn(
        'bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 transition-transform',
        reward.isUsed
          ? 'opacity-60 grayscale'
          : 'hover:scale-[1.02] active:scale-95'
      )}
    >
      {/* 카드 헤더 */}
      <div
        className={cn(
          'p-6 text-white relative overflow-hidden h-32 flex flex-col justify-between',
          !hasImage && `bg-gradient-to-r ${design.bgGradient}`,
        )}
        style={hasImage ? {
          backgroundImage: `url(${design.backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : undefined}
      >
        {hasImage && (
          <div className="absolute inset-0 bg-black/30" />
        )}
        <div className="relative z-10">
          <p
            className={cn(
              'text-xs font-bold mb-1',
              reward.isUsed ? 'text-slate-300' : 'text-white/70'
            )}
          >
            {reward.storeName}
          </p>
          <h3 className="text-xl font-bold">{reward.stampCardTitle}</h3>
          <p className="text-sm text-white/90 mt-0.5">{reward.name}</p>
        </div>
        <p className="text-white/80 text-xs relative z-10">
          {reward.isUsed ? '사용 완료' : `${reward.expiry} 까지`}
        </p>
        {!hasImage && (
          <Coffee
            className="absolute -right-4 -bottom-4 text-white/10 w-32 h-32"
            strokeWidth={1}
          />
        )}
      </div>

      {/* 카드 푸터 */}
      <div className="p-4 bg-white flex justify-between items-center">
        <span
          className={cn(
            'text-xs font-medium flex items-center gap-1',
            reward.isUsed ? 'text-kkookk-steel' : 'text-kkookk-orange-500'
          )}
        >
          {!reward.isUsed && (
            <div className="w-1.5 h-1.5 bg-kkookk-orange-500 rounded-full animate-pulse" />
          )}
          {reward.isUsed ? '사용된 쿠폰입니다' : '사용 가능한 쿠폰'}
        </span>
        {!reward.isUsed && onRedeem && (
          <Button onClick={onRedeem} variant="navy" size="sm">
            사용하기
          </Button>
        )}
      </div>
    </div>
  );
}

export default RewardCard;
