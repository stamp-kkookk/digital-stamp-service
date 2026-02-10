/**
 * RewardAchievedView 컴포넌트
 * 리워드 달성 축하 화면
 */

import { Gift, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface RewardAchievedViewProps {
  rewardName?: string;
  onGoToRewards: () => void;
  onViewNewCard: () => void;
  isLoading?: boolean;
}

export function RewardAchievedView({
  rewardName,
  onGoToRewards,
  onViewNewCard,
  isLoading = false,
}: RewardAchievedViewProps) {
  return (
    <div className="h-full flex flex-col p-6 justify-center text-center">
      <div className="w-20 h-20 bg-kkookk-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <Gift size={40} className="text-kkookk-orange-500" />
      </div>

      <h2 className="text-2xl font-bold mb-2 text-kkookk-navy">
        리워드 획득!
      </h2>

      <p className="text-kkookk-steel mb-8">
        {rewardName
          ? `축하합니다! "${rewardName}" 리워드를 받았어요`
          : '축하합니다! 리워드를 받았어요'}
      </p>

      <div className="space-y-3 w-full">
        <Button onClick={onGoToRewards} variant="navy" size="full">
          리워드 보관함
        </Button>
        <Button
          onClick={onViewNewCard}
          variant="subtle"
          size="full"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2 justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
              불러오는 중...
            </span>
          ) : (
            '새 스탬프 카드 보기'
          )}
        </Button>
      </div>
    </div>
  );
}

export default RewardAchievedView;
