import { useAdminStores, useChangeStoreStatus } from '@/features/admin/hooks/useAdmin';
import { StoreStatusBadge } from '@/features/store-management/components';
import type { StoreStatus } from '@/types/api';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  CreditCard,
  Loader2,
  MapPin,
  Pause,
  Play,
  Store as StoreIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const STATUS_FILTERS: { label: string; value: StoreStatus | undefined }[] = [
  { label: '전체', value: undefined },
  { label: '승인 대기', value: 'DRAFT' },
  { label: '영업중', value: 'LIVE' },
  { label: '정지', value: 'SUSPENDED' },
];

export function AdminStoreListPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<StoreStatus | undefined>(undefined);
  const { data: stores, isLoading, error } = useAdminStores(statusFilter);
  const changeStatus = useChangeStoreStatus();

  const handleApprove = (e: React.MouseEvent, storeId: number) => {
    e.stopPropagation();
    if (!confirm('이 매장을 승인하시겠습니까?')) return;
    changeStatus.mutate({
      storeId,
      data: { status: 'LIVE', reason: '운영 승인 완료' },
    });
  };

  const handleSuspend = (e: React.MouseEvent, storeId: number) => {
    e.stopPropagation();
    const reason = prompt('정지 사유를 입력해주세요:');
    if (!reason) return;
    changeStatus.mutate({
      storeId,
      data: { status: 'SUSPENDED', reason },
    });
  };

  const handleUnsuspend = (e: React.MouseEvent, storeId: number) => {
    e.stopPropagation();
    if (!confirm('이 매장의 정지를 해제하시겠습니까?')) return;
    changeStatus.mutate({
      storeId,
      data: { status: 'LIVE', reason: '정지 해제' },
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
        <p className="mt-4 text-slate-500">매장 목록을 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="mt-4 text-slate-700">매장 목록을 불러올 수 없습니다</p>
      </div>
    );
  }

  const storeList = stores ?? [];

  return (
    <div className="w-full max-w-6xl p-8 mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">매장 관리</h2>
        <p className="mt-1 text-sm text-slate-500">전체 매장을 확인하고 승인/정지를 관리합니다.</p>
      </div>

      {/* 상태 필터 */}
      <div className="flex gap-2 mb-6">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.label}
            onClick={() => setStatusFilter(filter.value)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              statusFilter === filter.value
                ? 'bg-slate-800 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* 매장 목록 */}
      <div className="grid gap-3">
        {storeList.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <StoreIcon size={48} className="mx-auto mb-4 opacity-20" />
            <p>해당 상태의 매장이 없습니다.</p>
          </div>
        ) : (
          storeList.map((store) => (
            <div
              key={store.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/admin/stores/${store.id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/admin/stores/${store.id}`);
                }
              }}
              className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-xl hover:shadow-sm cursor-pointer transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-slate-100 rounded-lg overflow-hidden">
                  {store.iconImageBase64 ? (
                    <img
                      src={`data:image/png;base64,${store.iconImageBase64}`}
                      alt={store.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <StoreIcon size={24} className="text-slate-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800">{store.name}</h3>
                    <StoreStatusBadge status={store.status} />
                  </div>
                  <p className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                    <MapPin size={12} /> {store.address || '주소 미등록'}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-slate-400">
                      점주: {store.ownerName || '-'} ({store.ownerEmail})
                    </p>
                    {store.hasActiveStampCard ? (
                      <span className="inline-flex items-center gap-0.5 text-xs text-green-600">
                        <CreditCard size={11} /> 스탬프카드
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-xs text-amber-600">
                        <AlertTriangle size={11} /> 스탬프카드 없음
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {store.status === 'DRAFT' && (
                  <button
                    onClick={(e) => handleApprove(e, store.id)}
                    disabled={changeStatus.isPending}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100"
                  >
                    <CheckCircle size={14} /> 승인
                  </button>
                )}
                {store.status === 'LIVE' && (
                  <button
                    onClick={(e) => handleSuspend(e, store.id)}
                    disabled={changeStatus.isPending}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100"
                  >
                    <Pause size={14} /> 정지
                  </button>
                )}
                {store.status === 'SUSPENDED' && (
                  <button
                    onClick={(e) => handleUnsuspend(e, store.id)}
                    disabled={changeStatus.isPending}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100"
                  >
                    <Play size={14} /> 해제
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminStoreListPage;
