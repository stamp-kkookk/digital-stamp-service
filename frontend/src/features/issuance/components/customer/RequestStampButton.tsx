/**
 * RequestStampButton 컴포넌트
 * 스탬프 요청 플로우를 시작하는 버튼
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useBlocker } from 'react-router-dom';
import { QrCode, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { kkookkToast } from '@/components/ui/Toast';
import { useCustomerNavigate } from '@/hooks/useCustomerNavigate';
import { useWalletStampCards } from '@/features/wallet/hooks/useWallet';
import { useCreateIssuanceRequest, useIssuanceRequestStatus, useCancelIssuanceRequest, generateIdempotencyKey } from '@/features/issuance/hooks/useIssuance';
import { getWalletStampCards } from '@/features/wallet/api/walletApi';
import { QUERY_KEYS } from '@/lib/api/endpoints';
import { RequestingView } from './RequestingView';
import { RequestResultView } from './RequestResultView';
import { RewardAchievedView } from './RewardAchievedView';

type RequestState = 'idle' | 'pending' | 'approved' | 'rewarded' | 'rejected' | 'expired' | 'cancelled';

export function RequestStampButton() {
  const { storeId, customerNavigate } = useCustomerNavigate();
  const { cardId } = useParams<{ cardId: string }>();
  const [requestState, setRequestState] = useState<RequestState>('idle');
  const [requestId, setRequestId] = useState<number | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const storeIdNum = storeId ? Number(storeId) : undefined;
  const queryClient = useQueryClient();

  // Get wallet stamp cards to find current card info
  const { data: walletData } = useWalletStampCards(storeIdNum);
  const card = walletData?.stampCards?.find((c) => String(c.walletStampCardId) === cardId);

  // Create issuance request mutation
  const createIssuance = useCreateIssuanceRequest();
  const cancelIssuance = useCancelIssuanceRequest();

  // Poll for request status when we have a pending request
  const { data: requestStatus } = useIssuanceRequestStatus(
    requestId ?? undefined,
    requestState === 'pending'
  );

  // Block in-app navigation while pending
  const blocker = useBlocker(requestState === 'pending');

  // Show cancel confirm when blocker is triggered
  useEffect(() => {
    if (blocker.state === 'blocked') {
      setShowCancelConfirm(true);
    }
  }, [blocker.state]);

  // Block browser refresh/tab close while pending
  useEffect(() => {
    if (requestState !== 'pending') return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [requestState]);

  // Navigate back after cancel (useBlocker is deactivated by this point)
  useEffect(() => {
    if (requestState === 'cancelled') {
      customerNavigate('/wallet');
    }
  }, [requestState, customerNavigate]);

  // Update state based on polling result
  if (requestStatus && requestState === 'pending') {
    if (requestStatus.status === 'APPROVED') {
      if (requestStatus.rewardsIssued && requestStatus.rewardsIssued > 0) {
        setRequestState('rewarded');
      } else {
        setRequestState('approved');
      }
    } else if (requestStatus.status === 'REJECTED') {
      setRequestState('rejected');
    } else if (requestStatus.status === 'EXPIRED') {
      setRequestState('expired');
    } else if (requestStatus.status === 'CANCELLED') {
      setRequestState('cancelled');
    } else if (requestStatus.status === 'PENDING' && requestStatus.remainingSeconds <= 0) {
      // TTL 만료 but 백엔드 미반영 → 프론트에서 만료 처리
      setRequestState('expired');
    }
  }

  const handleRequest = () => {
    if (!card) return;

    createIssuance.mutate(
      {
        storeId: card.store.storeId,
        walletStampCardId: card.walletStampCardId,
        idempotencyKey: generateIdempotencyKey(),
      },
      {
        onSuccess: (data) => {
          setRequestId(data.id);
          setRequestState('pending');
        },
        onError: (error) => {
          kkookkToast.error('적립 요청 실패', { description: error.message });
        },
      }
    );
  };

  const handleBack = () => {
    customerNavigate('/wallet');
  };

  const handleGoToRewards = () => {
    customerNavigate('/redeems');
  };

  const handleViewNewCard = async () => {
    if (!storeIdNum) return;
    setIsNavigating(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['wallet'] });
      const fresh = await queryClient.fetchQuery({
        queryKey: QUERY_KEYS.walletStampCards(storeIdNum),
        queryFn: () => getWalletStampCards(storeIdNum),
      });
      const newCard = fresh?.stampCards
        ?.filter((c) => c.store.storeId === storeIdNum && c.currentStampCount === 0)
        ?.sort((a, b) => b.walletStampCardId - a.walletStampCardId)?.[0];
      customerNavigate(newCard ? `/wallet/${newCard.walletStampCardId}` : '/wallet');
    } catch {
      customerNavigate('/wallet');
    } finally {
      setIsNavigating(false);
    }
  };

  const handleCancelRequest = useCallback(() => {
    if (!requestId) return;
    setShowCancelConfirm(false);

    cancelIssuance.mutate(requestId, {
      onSuccess: () => {
        // state → 'cancelled' → useBlocker 비활성화 → useEffect에서 네비게이션
        setRequestState('cancelled');
        if (blocker.state === 'blocked') {
          blocker.reset();
        }
      },
      onError: () => {
        // 409: 이미 처리됨 - 폴링이 상태를 반영할 것
        if (blocker.state === 'blocked') {
          blocker.reset();
        }
      },
    });
  }, [requestId, cancelIssuance, blocker]);

  const handleCancelConfirmClose = useCallback(() => {
    setShowCancelConfirm(false);
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
  }, [blocker]);

  // Cancel confirm modal
  const cancelConfirmModal = showCancelConfirm && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h3 className="text-lg font-bold text-kkookk-navy mb-2">적립 요청을 취소하시겠습니까?</h3>
        <p className="text-sm text-kkookk-steel mb-6">
          취소하면 현재 대기 중인 적립 요청이 취소됩니다.
        </p>
        <div className="flex gap-3">
          <Button
            onClick={handleCancelConfirmClose}
            variant="subtle"
            size="full"
          >
            계속 기다리기
          </Button>
          <Button
            onClick={handleCancelRequest}
            variant="primary"
            size="full"
            disabled={cancelIssuance.isPending}
            className="bg-red-500 hover:bg-red-600"
          >
            {cancelIssuance.isPending ? '취소 중...' : '요청 취소'}
          </Button>
        </div>
      </div>
    </div>
  );

  // Pending state - show waiting screen
  if (requestState === 'pending') {
    return (
      <>
        <RequestingView
          requestId={String(requestId)}
          remainingSeconds={requestStatus?.remainingSeconds ?? 120}
          onCancel={() => setShowCancelConfirm(true)}
          isCancelling={cancelIssuance.isPending}
          showDevControls={false}
        />
        {cancelConfirmModal}
      </>
    );
  }

  // Rewarded state - show celebration
  if (requestState === 'rewarded') {
    return (
      <RewardAchievedView
        rewardName={card?.nextRewardName ?? undefined}
        onGoToRewards={handleGoToRewards}
        onViewNewCard={handleViewNewCard}
        isLoading={isNavigating}
      />
    );
  }

  // Approved state
  if (requestState === 'approved') {
    return (
      <RequestResultView
        success={true}
        stampCount={requestStatus?.currentStampCount}
        onConfirm={handleBack}
      />
    );
  }

  // Rejected or Expired state
  if (requestState === 'rejected' || requestState === 'expired') {
    return (
      <RequestResultView
        success={false}
        message="매장에서 요청을 거절했습니다."
        onConfirm={handleBack}
      />
    );
  }

  // Idle state - show request button
  return (
    <div className="h-full flex flex-col p-6 justify-center text-center">
      <div className="mb-8">
        <div className="w-20 h-20 bg-kkookk-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 text-kkookk-orange-500">
          <QrCode size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-kkookk-navy">
          적립 요청을 보낼까요?
        </h2>
        {card ? (
          <p className="text-kkookk-steel">
            현재 {card.currentStampCount}개 → 적립 후 {card.currentStampCount + 1}개
          </p>
        ) : (
          <p className="text-kkookk-steel">카드 정보를 불러오는 중...</p>
        )}
      </div>

      <div className="mb-6 px-4">
        <p className="text-xs text-kkookk-steel text-center leading-relaxed">
          리워드 사용 시 사장님 확인이 필요합니다.
        </p>
      </div>

      <div className="space-y-3 w-full">
        <Button
          onClick={handleRequest}
          variant="primary"
          size="full"
          className="shadow-lg"
          disabled={!card || createIssuance.isPending}
        >
          {createIssuance.isPending ? (
            <span className="flex items-center gap-2 justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
              요청 중...
            </span>
          ) : (
            '요청 보내기'
          )}
        </Button>
        <Button onClick={handleBack} variant="subtle" size="full">
          취소
        </Button>
      </div>
    </div>
  );
}

export default RequestStampButton;
