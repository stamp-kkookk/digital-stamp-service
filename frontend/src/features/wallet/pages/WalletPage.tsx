/**
 * WalletPage 컴포넌트
 * 스탬프 카드 캐러셀이 포함된 메인 지갑 뷰
 * 적립 승인 후 돌아오면 자동 뒤집기 + 도장 애니메이션 재생
 */

import { useEffect, useMemo, useState } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';
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

interface WalletLocationState {
  stampJustAdded?: boolean;
  animateStampIndex?: number;
  stampedCardId?: string;
}

export function WalletPage() {
  const { storeId, customerNavigate } = useCustomerNavigate();
  const { setIsMenuOpen, setCurrentStoreId } = useOutletContext<CustomerLayoutContext>();
  const location = useLocation();
  const storeIdNum = storeId ? Number(storeId) : undefined;
  const { data: storeSummary } = useStoreSummary(storeIdNum);

  // Read navigation state for animation trigger
  const locationState = location.state as WalletLocationState | null;
  const [animatingStampIndex, setAnimatingStampIndex] = useState<number | undefined>(
    locationState?.stampJustAdded ? locationState.animateStampIndex : undefined,
  );
  const [initialFlipped] = useState(() => locationState?.stampJustAdded === true);

  // Clear navigation state to prevent re-animation on refresh
  useEffect(() => {
    if (locationState?.stampJustAdded) {
      window.history.replaceState({}, '');
    }
  }, [locationState?.stampJustAdded]);

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
        designJsonRaw: apiCard.designJson,
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
          designJsonRaw: summaryCard.designJson,
        };
        return [previewCard, ...mapped];
      }
    }

    return mapped;
  }, [walletData?.stampCards, storeSummary, storeIdNum]);

  // 적립된 카드의 초기 캐러셀 인덱스 계산
  // 우선순위: stampedCardId (적립 후 복귀) > sessionStorage (탭 이동 후 복귀) > 0
  const stampedCardId = locationState?.stampedCardId;
  const initialCardIndex = useMemo(() => {
    if (cards.length === 0) return 0;
    if (stampedCardId) {
      const idx = cards.findIndex((c) => c.id === stampedCardId);
      if (idx >= 0) return idx;
    }
    const lastViewedCardId = sessionStorage.getItem('wallet_lastViewedCardId');
    if (lastViewedCardId) {
      const idx = cards.findIndex((c) => c.id === lastViewedCardId);
      if (idx >= 0) return idx;
    }
    return 0;
  }, [cards, stampedCardId]);

  // 첫 번째 카드의 storeId로 초기화 (또는 적립된 카드의 storeId)
  useEffect(() => {
    if (cards.length > 0) {
      const startCard = cards[initialCardIndex] ?? cards[0];
      setCurrentStoreId(startCard.storeId);
    }
  }, [cards, initialCardIndex, setCurrentStoreId]);

  const handleCardChange = (card: StampCard) => {
    setCurrentStoreId(card.storeId);
    sessionStorage.setItem('wallet_lastViewedCardId', card.id);
  };

  const handleStampRequest = (card: StampCard) => {
    customerNavigate(`/wallet/${card.id}/stamp`);
  };

  const handleAnimationComplete = () => {
    setAnimatingStampIndex(undefined);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col h-full">
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
      <div className="flex-1 flex flex-col h-full">
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
      <div className="flex-1 flex flex-col h-full">
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
    <div className="flex-1 flex flex-col h-full">
      <WalletHeader onMenuClick={() => setIsMenuOpen(true)} />

      <div className="flex-1 flex flex-col justify-center pb-8">
        <StampCardCarousel
          cards={cards}
          initialIndex={initialCardIndex}
          onCardChange={handleCardChange}
          onStampRequest={handleStampRequest}
          initialFlipped={initialFlipped}
          animatingStampIndex={animatingStampIndex}
          onAnimationComplete={handleAnimationComplete}
        />
      </div>
    </div>
  );
}

export default WalletPage;
