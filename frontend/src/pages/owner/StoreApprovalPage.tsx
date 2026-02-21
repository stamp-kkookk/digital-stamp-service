/**
 * StoreApprovalPage 컴포넌트
 * 매장 적립 승인 관리 페이지
 */

import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { useStore } from '@/features/store-management/hooks/useStore';
import { ApprovalTab } from '@/features/store-management/components/ApprovalTab';
import { StoreTabBar } from '@/features/store-management/components/StoreTabBar';

export function StoreApprovalPage() {
  const navigate = useNavigate();
  const { storeId } = useParams<{ storeId: string }>();

  const storeIdNum = Number(storeId);

  const { data: store, isLoading: storeLoading, error: storeError } = useStore(storeIdNum);

  if (storeLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-kkookk-indigo" />
        <p className="mt-4 text-kkookk-steel">매장 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (storeError || !store) {
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

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(`/owner/stores/${storeId}`)}
            className="p-2 -ml-2 text-kkookk-steel hover:text-kkookk-navy hover:bg-slate-50 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-kkookk-navy">{store.name}</h2>
            <p className="text-kkookk-steel text-sm flex items-center gap-1">
              <MapPin size={12} /> {store.address || '주소 미등록'}
            </p>
          </div>
        </div>

        <StoreTabBar storeId={storeIdNum} activeTab="approval" />
      </div>

      {/* 컨텐츠 */}
      <div className="flex-1 overflow-y-auto">
        <ApprovalTab storeId={storeIdNum} />
      </div>
    </div>
  );
}

export default StoreApprovalPage;
