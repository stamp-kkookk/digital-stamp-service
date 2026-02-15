/**
 * StampCardCreatePage 컴포넌트
 * 새 스탬프 카드 생성 페이지
 * initial=true 쿼리 파라미터: 매장 생성 직후 온보딩 모드
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle, X, AlertTriangle } from 'lucide-react';
import { StampCardCreateForm } from '@/features/store-management/components';
import { useStore } from '@/features/store-management/hooks/useStore';
import {
  useCreateStampCard,
  useUpdateStampCardStatus,
} from '@/features/store-management/hooks/useStampCard';
import type { CreateStampCardRequest } from '@/types/api';

export function StampCardCreatePage() {
  const navigate = useNavigate();
  const { storeId } = useParams<{ storeId: string }>();
  const [searchParams] = useSearchParams();
  const storeIdNum = Number(storeId);
  const isInitialSetup = searchParams.get('initial') === 'true';

  const [showToast, setShowToast] = useState(isInitialSetup);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  const { data: store, isLoading, error } = useStore(storeIdNum);
  const createStampCard = useCreateStampCard();
  const updateStampCardStatus = useUpdateStampCardStatus();

  useEffect(() => {
    if (!showToast) return;
    const timer = setTimeout(() => setShowToast(false), 5000);
    return () => clearTimeout(timer);
  }, [showToast]);

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
        onSuccess: (newCard) => {
          if (isInitialSetup) {
            updateStampCardStatus.mutate(
              { storeId: storeIdNum, stampCardId: newCard.id, status: 'ACTIVE' },
              {
                onSuccess: () => {
                  navigate(`/owner/stores/${storeId}`, {
                    state: { message: '매장과 스탬프 카드가 성공적으로 등록되었습니다!' },
                  });
                },
                onError: () => {
                  navigate(`/owner/stores/${storeId}`, {
                    state: {
                      message:
                        '스탬프 카드가 생성되었습니다. 활성화는 카드 상세에서 진행해주세요.',
                    },
                  });
                },
              }
            );
          } else {
            navigate(`/owner/stores/${storeId}`);
          }
        },
        onError: (err) => {
          alert(`스탬프 카드 생성 실패: ${err.message}`);
        },
      }
    );
  };

  const handleCancel = () => {
    if (isInitialSetup) {
      setShowSkipConfirm(true);
    } else {
      navigate(`/owner/stores/${storeId}`);
    }
  };

  const handleSkipConfirm = () => {
    navigate(`/owner/stores/${storeId}`, {
      state: { message: '매장이 초안 상태로 등록되었습니다.' },
    });
  };

  return (
    <div className="h-full relative">
      {showToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-3 shadow-lg animate-in fade-in slide-in-from-top-2">
          <CheckCircle size={18} className="shrink-0 text-green-600" />
          <p className="text-sm font-medium text-green-800">
            매장 등록 완료! 스탬프 카드를 설정하세요.
          </p>
          <button
            onClick={() => setShowToast(false)}
            className="shrink-0 text-green-400 hover:text-green-600"
          >
            <X size={16} />
          </button>
        </div>
      )}
      <StampCardCreateForm
        storeName={store.name}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />

      {showSkipConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle size={22} className="mt-0.5 shrink-0 text-amber-500" />
              <div>
                <h3 className="font-bold text-kkookk-navy">
                  스탬프 카드 없이 진행하시겠습니까?
                </h3>
                <p className="mt-1.5 text-sm text-kkookk-steel">
                  스탬프 카드 없이 매장만 등록됩니다. 나중에 추가할 수 있습니다.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowSkipConfirm(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-kkookk-steel hover:bg-slate-50 transition-colors"
              >
                계속 작성
              </button>
              <button
                onClick={handleSkipConfirm}
                className="rounded-xl bg-kkookk-navy px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition-colors"
              >
                건너뛰기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StampCardCreatePage;
