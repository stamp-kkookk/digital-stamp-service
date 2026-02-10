/**
 * StampCardCreatePage 컴포넌트
 * 새 스탬프 카드 생성 페이지
 */

import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { StampCardCreateForm } from '@/features/store-management/components';
import { useStore } from '@/features/store-management/hooks/useStore';
import { useCreateStampCard } from '@/features/store-management/hooks/useStampCard';
import type { CreateStampCardRequest } from '@/types/api';

export function StampCardCreatePage() {
  const navigate = useNavigate();
  const { storeId } = useParams<{ storeId: string }>();
  const storeIdNum = Number(storeId);

  const { data: store, isLoading, error } = useStore(storeIdNum);
  const createStampCard = useCreateStampCard();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-kkookk-indigo" />
        <p className="mt-4 text-kkookk-steel">매장 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
        <p className="mt-4 text-kkookk-steel">매장을 찾을 수 없습니다.</p>
        <button
          onClick={() => navigate('/owner/stores')}
          className="mt-4 px-4 py-2 border border-slate-200 rounded-lg text-kkookk-navy font-bold hover:bg-slate-50"
        >
          매장 목록으로
        </button>
      </div>
    );
  }

  const handleSubmit = (data: CreateStampCardRequest) => {
    createStampCard.mutate(
      { storeId: storeIdNum, data },
      {
        onSuccess: () => {
          navigate(`/owner/stores/${storeId}`);
        },
        onError: (err) => {
          alert(`스탬프 카드 생성 실패: ${err.message}`);
        },
      }
    );
  };

  const handleCancel = () => {
    navigate(`/owner/stores/${storeId}`);
  };

  return (
    <div className="h-full">
      <StampCardCreateForm
        storeName={store.name}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}

export default StampCardCreatePage;
