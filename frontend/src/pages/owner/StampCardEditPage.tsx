/**
 * StampCardEditPage 컴포넌트
 * 기존 스탬프 카드 수정 페이지
 */

import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, AlertCircle, ChevronLeft } from 'lucide-react';
import { useStore } from '@/features/store-management/hooks/useStore';
import {
  useStampCard,
  useUpdateStampCard,
} from '@/features/store-management/hooks/useStampCard';
import type { UpdateStampCardRequest } from '@/types/api';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export function StampCardEditPage() {
  const navigate = useNavigate();
  const { storeId, cardId } = useParams<{ storeId: string; cardId: string }>();
  const storeIdNum = Number(storeId);
  const cardIdNum = Number(cardId);

  const { data: store } = useStore(storeIdNum);
  const { data: card, isLoading, error } = useStampCard(storeIdNum, cardIdNum);
  const updateStampCard = useUpdateStampCard();

  const [title, setTitle] = useState('');
  const [designJson, setDesignJson] = useState('');

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDesignJson(card.designJson ?? '');
    }
  }, [card]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-kkookk-indigo" />
        <p className="mt-4 text-kkookk-steel">카드 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
        <p className="mt-4 text-kkookk-steel">스탬프 카드를 찾을 수 없습니다.</p>
        <button
          onClick={() => navigate(`/owner/stores/${storeId}`)}
          className="px-4 py-2 mt-4 font-bold border rounded-lg border-slate-200 text-kkookk-navy hover:bg-slate-50"
        >
          매장으로 돌아가기
        </button>
      </div>
    );
  }

  const isActive = card.status === 'ACTIVE';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: UpdateStampCardRequest = {
      title,
      goalStampCount: card.goalStampCount,
      ...(designJson && { designJson }),
    };

    updateStampCard.mutate(
      { storeId: storeIdNum, stampCardId: cardIdNum, data },
      {
        onSuccess: () => {
          navigate(`/owner/stores/${storeId}`);
        },
        onError: (err) => {
          alert(`수정 실패: ${err.message}`);
        },
      }
    );
  };

  return (
    <div className="w-full max-w-2xl p-8 mx-auto">
      <button
        onClick={() => navigate(`/owner/stores/${storeId}`)}
        className="flex items-center gap-1 mb-6 text-sm text-kkookk-steel hover:text-kkookk-navy"
      >
        <ChevronLeft size={16} /> 매장으로 돌아가기
      </button>

      <h2 className="mb-2 text-2xl font-bold text-kkookk-navy">
        스탬프 카드 수정
      </h2>
      <p className="mb-8 text-sm text-kkookk-steel">
        {store?.name} · {card.title}
        {isActive && (
          <span className="ml-2 px-2 py-0.5 text-xs font-bold text-yellow-700 bg-yellow-100 rounded">
            ACTIVE 상태에서는 제목과 디자인만 수정 가능
          </span>
        )}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block mb-2 text-sm font-bold text-kkookk-navy">
            카드 이름
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border rounded-lg border-slate-200 focus:border-kkookk-indigo focus:outline-none"
          />
        </div>

        {!isActive && (
          <>
            <div>
              <label className="block mb-2 text-sm font-bold text-kkookk-navy">
                목표 스탬프
              </label>
              <p className="p-3 border rounded-lg bg-slate-50 border-slate-200 text-kkookk-navy">
                {card.goalStampCount}개
              </p>
              <p className="mt-1 text-xs text-kkookk-steel">
                목표 스탬프 수는 카드 생성 시에만 설정 가능합니다.
              </p>
            </div>

            <div>
              <label className="block mb-2 text-sm font-bold text-kkookk-navy">
                리워드
              </label>
              <p className="p-3 border rounded-lg bg-slate-50 border-slate-200 text-kkookk-navy">
                {card.rewardName || '미설정'}
              </p>
            </div>
          </>
        )}

        <div>
          <label className="block mb-2 text-sm font-bold text-kkookk-navy">
            디자인 타입
          </label>
          <p className="p-3 border rounded-lg bg-slate-50 border-slate-200 text-kkookk-navy">
            {card.designType}
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" variant="navy" disabled={updateStampCard.isPending || !title}>
            {updateStampCard.isPending ? '저장 중...' : '저장'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/owner/stores/${storeId}`)}
          >
            취소
          </Button>
        </div>
      </form>
    </div>
  );
}

export default StampCardEditPage;
