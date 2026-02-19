/**
 * StoreMigrationsPage 컴포넌트
 * 매장 전환 신청 관리 페이지
 */

import { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { MigrationManager } from '@/features/migration/components/admin';
import { useStore } from '@/features/store-management/hooks/useStore';
import { StoreTabBar } from '@/features/store-management/components/StoreTabBar';
import {
  useStoreMigrations,
  useApproveMigration,
  useRejectMigration,
} from '@/features/migration/hooks/useOwnerMigration';
import { getStoreMigrationDetail } from '@/features/migration/api/migrationApi';
import { QUERY_KEYS } from '@/lib/api/endpoints';
import { kkookkToast } from '@/components/ui/Toast';
import type { MigrationStatus, MigrationRequest } from '@/types/domain';
import type { StampMigrationStatus } from '@/types/api';

/** Map API status to domain status */
function toMigrationStatus(apiStatus: StampMigrationStatus): MigrationStatus {
  switch (apiStatus) {
    case 'SUBMITTED': return 'pending';
    case 'APPROVED': return 'approved';
    case 'REJECTED': return 'rejected';
    default: return 'pending';
  }
}

export function StoreMigrationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { storeId } = useParams<{ storeId: string }>();

  const storeIdNum = Number(storeId);

  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  // API Hooks
  const { data: store, isLoading: storeLoading, error: storeError } = useStore(storeIdNum);
  const {
    data: apiMigrations,
    isLoading: migrationsLoading,
    refetch: refetchMigrations,
  } = useStoreMigrations(storeIdNum);
  const approveMutation = useApproveMigration();
  const rejectMutation = useRejectMigration();

  // Image detail state
  const [imageDetail, setImageDetail] = useState<{ imageUrl: string; count: number } | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  const handleRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      await refetchMigrations();
      kkookkToast.success('데이터를 갱신했습니다');
    } finally {
      setIsManualRefreshing(false);
    }
  };

  // Fetch migration detail for image preview
  const handleViewImage = useCallback(async (migrationId: string) => {
    const id = Number(migrationId);
    if (!storeIdNum || !id) return;

    setImageLoading(true);
    try {
      const detail = await queryClient.fetchQuery({
        queryKey: QUERY_KEYS.storeMigration(storeIdNum, id),
        queryFn: () => getStoreMigrationDetail(storeIdNum, id),
        staleTime: 60_000,
      });
      setImageDetail({ imageUrl: detail.imageUrl, count: detail.claimedStampCount });
    } catch {
      setImageDetail(null);
    } finally {
      setImageLoading(false);
    }
  }, [storeIdNum, queryClient]);

  // Transform API MigrationSummary[] to domain MigrationRequest[]
  const migrations: MigrationRequest[] = (apiMigrations ?? []).map((m) => ({
    id: String(m.id),
    storeName: store?.name ?? '',
    customerName: m.customerName,
    customerPhone: m.customerPhone,
    count: m.claimedStampCount,
    status: toMigrationStatus(m.status),
    date: new Date(m.requestedAt),
  }));

  // Loading state
  if (storeLoading || migrationsLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-kkookk-indigo" />
        <p className="mt-4 text-kkookk-steel">불러오는 중...</p>
      </div>
    );
  }

  // Error or not found state
  if (storeError || !store) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
        <p className="mt-4 text-kkookk-steel">매장을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const handleAction = (id: string, newStatus: MigrationStatus, approvedCount?: number, rejectReason?: string) => {
    const migrationId = Number(id);

    if (newStatus === 'approved' && approvedCount !== undefined) {
      approveMutation.mutate(
        {
          storeId: storeIdNum,
          migrationId,
          data: { approvedStampCount: approvedCount },
        },
        {
          onSuccess: () => {
            kkookkToast.success('전환 신청을 승인했습니다');
          },
          onError: (err) => {
            kkookkToast.error('승인 처리 실패', { description: err.message });
          },
        }
      );
    } else if (newStatus === 'rejected' && rejectReason) {
      rejectMutation.mutate(
        {
          storeId: storeIdNum,
          migrationId,
          data: { rejectReason },
        },
        {
          onSuccess: () => {
            kkookkToast.success('전환 신청을 거절했습니다');
          },
          onError: (err) => {
            kkookkToast.error('거절 처리 실패', { description: err.message });
          },
        }
      );
    }
  };

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

        {/* 탭 */}
        <StoreTabBar storeId={storeIdNum} activeTab="migrations" />
      </div>

      {/* 마이그레이션 매니저 */}
      <div className="flex-1 overflow-y-auto">
        <MigrationManager
          migrations={migrations}
          onAction={handleAction}
          onRefresh={handleRefresh}
          isRefreshing={isManualRefreshing}
          onViewImage={handleViewImage}
          imageDetail={imageDetail}
          imageLoading={imageLoading}
          onCloseImage={() => setImageDetail(null)}
        />
      </div>
    </div>
  );
}

export default StoreMigrationsPage;
