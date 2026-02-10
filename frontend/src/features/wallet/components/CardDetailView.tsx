/**
 * CardDetailView 컴포넌트
 * 진행 상황 및 액션이 포함된 스탬프 카드 상세 뷰
 */

import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronLeft, Check, Smartphone, Loader2, AlertCircle, History } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCustomerNavigate } from '@/hooks/useCustomerNavigate';
import { useWalletStampCards, useStoreSummary } from '../hooks/useWallet';
import { parseDesignJson } from '../utils/cardDesign';
import type { StampCard } from '@/types/domain';

export function CardDetailView() {
  const { storeId, customerNavigate } = useCustomerNavigate();
  const { cardId } = useParams<{ cardId: string }>();
  const storeIdNum = storeId ? Number(storeId) : undefined;

  const { data: walletData, isLoading: walletLoading, error: walletError } = useWalletStampCards(storeIdNum);
  const { data: storeSummary, isLoading: summaryLoading } = useStoreSummary(storeIdNum);

  const card: StampCard | null = useMemo(() => {
    // Try to find in wallet data
    const walletCards: StampCard[] = (walletData?.stampCards ?? []).map((apiCard) => {
      const style = parseDesignJson(apiCard.designJson);
      return {
        id: String(apiCard.walletStampCardId),
        storeId: apiCard.store.storeId,
        storeName: apiCard.store.storeName,
        current: apiCard.currentStampCount,
        max: apiCard.goalStampCount,
        reward: apiCard.nextRewardName || '리워드',
        theme: 'orange' as const,
        status: 'active' as const,
        bgGradient: style.bgGradient,
        shadowColor: style.shadowColor,
        stampColor: style.stampColor,
        backgroundImage: style.backgroundImage,
        stampImage: style.stampImage,
      };
    });

    const matched = walletCards.find((c) => c.id === cardId);
    if (matched) return matched;

    // Fallback to summary card (for preview cards with id `summary-{stampCardId}`)
    const summaryCard = storeSummary?.stampCard;
    if (summaryCard && cardId === `summary-${summaryCard.stampCardId}`) {
      const summaryStyle = parseDesignJson(summaryCard.designJson);
      return {
        id: cardId,
        storeName: storeSummary.storeName,
        current: 0,
        max: summaryCard.goalStampCount,
        reward: summaryCard.rewardName || '리워드',
        theme: 'orange' as const,
        status: 'active' as const,
        bgGradient: summaryStyle.bgGradient,
        shadowColor: summaryStyle.shadowColor,
        stampColor: summaryStyle.stampColor,
        backgroundImage: summaryStyle.backgroundImage,
        stampImage: summaryStyle.stampImage,
      };
    }

    // If wallet has cards but cardId doesn't match, show first card
    if (walletCards.length > 0) return walletCards[0];

    return null;
  }, [walletData?.stampCards, storeSummary, cardId]);

  const isLoading = walletLoading || summaryLoading;

  if (isLoading) {
    return (
      <div className="h-full bg-white flex flex-col pt-12 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-kkookk-orange-500" />
        <p className="mt-4 text-kkookk-steel">카드 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (walletError) {
    return (
      <div className="h-full bg-white flex flex-col pt-12">
        <div className="px-6 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center">
          <button
            onClick={() => customerNavigate('/wallet')}
            className="p-2 -ml-2 text-kkookk-steel"
            aria-label="뒤로 가기"
          >
            <ChevronLeft size={24} />
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="mt-4 text-lg font-medium text-kkookk-navy">카드 정보를 불러올 수 없습니다</p>
          <p className="mt-1 text-sm text-kkookk-steel">잠시 후 다시 시도해주세요</p>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="h-full bg-white flex flex-col pt-12">
        <div className="px-6 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center">
          <button
            onClick={() => customerNavigate('/wallet')}
            className="p-2 -ml-2 text-kkookk-steel"
            aria-label="뒤로 가기"
          >
            <ChevronLeft size={24} />
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <p className="text-lg font-medium text-kkookk-navy">카드를 찾을 수 없습니다</p>
          <p className="mt-1 text-sm text-kkookk-steel">지갑으로 돌아가서 다시 시도해주세요</p>
        </div>
      </div>
    );
  }

  const isComplete = card.current >= card.max;

  return (
    <div className="h-full bg-white flex flex-col pt-12">
      {/* 헤더 */}
      <div className="px-6 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => customerNavigate('/wallet')}
            className="p-2 -ml-2 text-kkookk-steel"
            aria-label="뒤로 가기"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="font-bold text-lg ml-2 text-kkookk-navy">
            {card.storeName}
          </h1>
        </div>
        {card.storeId && (
          <button
            onClick={() => customerNavigate(`/history?storeId=${card.storeId}`)}
            className="p-2 -mr-2 text-kkookk-steel hover:text-kkookk-navy"
            aria-label="적립 이력"
          >
            <History size={22} />
          </button>
        )}
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 pb-32">
        {/* 리워드 정보 */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-1 text-kkookk-navy">
            {card.reward}
          </h2>
          <p className="text-kkookk-steel text-sm">
            {card.max}개를 모으면 무료로 드려요
          </p>
        </div>

        {/* 진행 상황 그리드 */}
        <div className="grid grid-cols-5 gap-3 mb-8">
          {Array.from({ length: card.max }).map((_, i) => {
            const isActive = i < card.current;
            return (
              <div
                key={i}
                className={`aspect-square rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                  isActive
                    ? `${card.stampColor || 'bg-kkookk-orange-500'} text-white shadow-md scale-100`
                    : 'bg-kkookk-sand text-kkookk-steel opacity-50 scale-90'
                }`}
              >
                {isActive ? (
                  card.stampImage ? (
                    <img src={card.stampImage} alt="stamp" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <Check size={14} strokeWidth={4} />
                  )
                ) : i + 1}
              </div>
            );
          })}
        </div>

        {/* 안내 박스 */}
        <div className="bg-kkookk-sand p-4 rounded-xl text-xs text-kkookk-steel leading-relaxed">
          <p>• 스탬프 유효기간은 적립일로부터 6개월입니다.</p>
          <p>• 1일 최대 5개까지 적립 가능합니다.</p>
          <p>• 리워드 사용 시 사장님 확인이 필요합니다.</p>
        </div>
      </div>

      {/* 하단 액션 */}
      <div className="absolute bottom-0 left-0 w-full bg-white border-t border-slate-100 p-4 pb-8 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {isComplete ? (
          <Button
            onClick={() => customerNavigate('/redeems')}
            variant="navy"
            size="full"
          >
            <Smartphone size={18} /> 사용 가능한 리워드 보기
          </Button>
        ) : (
          <Button
            onClick={() => customerNavigate(`/wallet/${cardId}/stamp`)}
            variant="primary"
            size="full"
            className="shadow-lg shadow-orange-200"
          >
            스탬프 적립하기
          </Button>
        )}
      </div>
    </div>
  );
}

export default CardDetailView;
