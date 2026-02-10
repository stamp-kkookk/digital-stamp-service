/**
 * StampCardStatsPage 컴포넌트
 * 스탬프 카드 통계 페이지 (API 연동)
 */

import { useNavigate, useParams } from 'react-router-dom';
import { StampCardStats } from '@/features/store-management/components';
import { useStampCard } from '@/features/store-management/hooks/useStampCard';
import { useStoreStatistics } from '@/features/store-management/hooks/useStore';
import { Loader2, AlertCircle } from 'lucide-react';

export function StampCardStatsPage() {
  const navigate = useNavigate();
  const { storeId, cardId } = useParams<{ storeId: string; cardId: string }>();
  const storeIdNum = Number(storeId);
  const cardIdNum = Number(cardId);

  const { data: card, isLoading: cardLoading, error: cardError } = useStampCard(storeIdNum, cardIdNum);
  const { data: stats, isLoading: statsLoading, error: statsError } = useStoreStatistics({ storeId: storeIdNum });

  const handleBack = () => {
    navigate(`/owner/stores/${storeId}`);
  };

  if (cardLoading || statsLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-kkookk-indigo" />
        <p className="mt-4 text-kkookk-steel">통계를 불러오는 중...</p>
      </div>
    );
  }

  if (cardError || !card) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
        <p className="mt-4 text-kkookk-steel">스탬프 카드를 찾을 수 없습니다.</p>
        <button
          onClick={handleBack}
          className="px-4 py-2 mt-4 font-bold border rounded-lg border-slate-200 text-kkookk-navy hover:bg-slate-50"
        >
          매장으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="h-full">
      <StampCardStats
        cardName={card.title}
        stats={stats ?? null}
        statsError={!!statsError}
        onBack={handleBack}
      />
    </div>
  );
}

export default StampCardStatsPage;
