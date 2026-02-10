/**
 * WalletPage 컴포넌트
 * 스탬프 카드 캐러셀이 포함된 메인 지갑 뷰
 */

import { useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { WalletHeader } from '../components/WalletHeader';
import { StampCardCarousel } from '../components/StampCardCarousel';
import { useWalletStampCards, useStoreSummary } from '../hooks/useWallet';
import { useCustomerNavigate } from '@/hooks/useCustomerNavigate';
import { parseDesignJson } from '../utils/cardDesign';
import type { StampCard } from '@/types/domain';

interface CustomerLayoutContext {
  setIsMenuOpen: (open: boolean) => void;
  setCurrentStoreId: (storeId: number | undefined) => void;
}

export function WalletPage() {
  const { storeId, customerNavigate } = useCustomerNavigate();
  const { setIsMenuOpen, setCurrentStoreId } = useOutletContext<CustomerLayoutContext>();
  const storeIdNum = storeId ? Number(storeId) : undefined;
  const { data: storeSummary } = useStoreSummary(storeIdNum);

  // API Hook - JWT identifies the customer, storeId scopes the store
  const { data: walletData, isLoading, error, refetch } = useWalletStampCards(storeIdNum);

  // Transform API data to StampCard format, current store card first
  const cards: StampCard[] = useMemo(() => {
    const apiCards = walletData?.stampCards ?? [];

    // Sort: current store's cards first (by storeId match)
    const sorted = [...apiCards].sort((a, b) => {
      const aMatch = a.store.storeId === storeIdNum ? 0 : 1;
      const bMatch = b.store.storeId === storeIdNum ? 0 : 1;
      return aMatch - bMatch;
    });

    const mapped = sorted.map((apiCard) => {
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

    // If wallet has no card for this store, add a preview from summary
    const hasCurrentStoreCard = apiCards.some(
      (c) => c.store.storeId === storeIdNum
    );

    if (!hasCurrentStoreCard) {
      const summaryCard = storeSummary?.stampCard;
      const summaryStoreName = storeSummary?.storeName;
      if (summaryCard && summaryStoreName) {
        const summaryStyle = parseDesignJson(summaryCard.designJson);
        const previewCard: StampCard = {
          id: `summary-${summaryCard.stampCardId}`,
          storeName: summaryStoreName,
          current: 0,
          max: summaryCard.goalStampCount,
          reward: summaryCard.rewardName || '리워드',
          theme: 'orange',
          status: 'active',
          bgGradient: summaryStyle.bgGradient,
          shadowColor: summaryStyle.shadowColor,
          stampColor: summaryStyle.stampColor,
          backgroundImage: summaryStyle.backgroundImage,
          stampImage: summaryStyle.stampImage,
        };
        return [previewCard, ...mapped];
      }
    }

    return mapped;
  }, [walletData?.stampCards, storeSummary, storeIdNum]);

  // 첫 번째 카드의 storeId로 초기화
  useEffect(() => {
    if (cards.length > 0) {
      setCurrentStoreId(cards[0].storeId);
    }
  }, [cards, setCurrentStoreId]);

  const handleCardChange = (card: StampCard) => {
    setCurrentStoreId(card.storeId);
  };

  const handleCardSelect = (card: StampCard) => {
    customerNavigate(`/wallet/${card.id}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col min-h-screen">
        <WalletHeader onMenuClick={() => setIsMenuOpen(true)} />
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-kkookk-orange-500" />
          <p className="mt-4 text-kkookk-steel">지갑을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 flex flex-col min-h-screen">
        <WalletHeader onMenuClick={() => setIsMenuOpen(true)} />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="mt-4 text-lg font-medium text-kkookk-navy">지갑을 불러올 수 없습니다</p>
          <p className="mt-1 text-sm text-kkookk-steel">잠시 후 다시 시도해주세요</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-6 py-2 bg-kkookk-navy text-white rounded-lg font-bold"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (cards.length === 0) {
    return (
      <div className="flex-1 flex flex-col min-h-screen">
        <WalletHeader onMenuClick={() => setIsMenuOpen(true)} />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <p className="text-lg font-medium text-kkookk-navy">아직 스탬프 카드가 없어요</p>
          <p className="mt-1 text-sm text-kkookk-steel">
            매장에서 QR 코드를 스캔하여 첫 스탬프를 받아보세요!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <WalletHeader onMenuClick={() => setIsMenuOpen(true)} />

      <div className="flex-1 flex flex-col justify-center">
        <StampCardCarousel cards={cards} onCardSelect={handleCardSelect} onCardChange={handleCardChange} />
      </div>
    </div>
  );
}

export default WalletPage;
