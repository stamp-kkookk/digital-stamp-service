import React from 'react';
import { useStoreSummaryQuery } from '../../../../hooks/queries/useStoreSummaryQuery';
import type { ActiveStampCardSummary, UserStatus } from '../types';
import StampCardReadyView from './StampCardReadyView';
import LoadingSkeletonView from './LoadingSkeletonView';
import ErrorView from './ErrorView';
import EmptyView from './EmptyView';

interface StoreStampCardSummaryContainerProps {
  storeId: string;
}

// MVP 임시 함수: 실제로는 인증 컨텍스트나 전역 상태에서 가져와야 함
const checkUserStatus = (): UserStatus => {
  const token = localStorage.getItem('authToken');
  if (!token) return 'GUEST';
  const hasWallet = localStorage.getItem('hasWallet') === 'true';
  return hasWallet ? 'LOGGED_IN_WITH_WALLET' : 'LOGGED_IN_NO_WALLET';
};

const StoreStampCardSummaryContainer: React.FC<StoreStampCardSummaryContainerProps> = ({ storeId }) => {
  const { data, isLoading, isError, refetch } = useStoreSummaryQuery(storeId);
  const userStatus = checkUserStatus();

  // Loading state
  if (isLoading) {
    return <LoadingSkeletonView />;
  }

  // Error state
  if (isError || !data) {
    return <ErrorView onRetry={refetch} />;
  }

  // Empty state (no stamp card)
  if (!data.stampCard) {
    return <EmptyView storeName={data.storeName} />;
  }

  // Ready state - transform API response to UI data
  const uiData: ActiveStampCardSummary = {
    storeInfo: {
      storeId: parseInt(storeId, 10),
      storeName: data.storeName,
    },
    stampCardInfo: {
      stampCardId: data.stampCard.stampCardId,
      name: data.stampCard.name,
      reward: data.stampCard.reward,
      totalStampCount: 10, // 기본값 (API에 없음)
      stampImageUrl: data.stampCard.imageUrl || '/vite.svg',
    },
  };

  return <StampCardReadyView data={uiData} userStatus={userStatus} />;
};

export default StoreStampCardSummaryContainer;
