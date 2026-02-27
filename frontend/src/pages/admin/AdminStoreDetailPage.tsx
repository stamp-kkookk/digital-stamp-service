import {
  useAdminStore,
  useChangeStoreStatus,
  useStoreAuditLogs,
} from '@/features/admin/hooks/useAdmin';
import { StoreStatusBadge } from '@/features/store-management/components';
import type { StoreAuditAction } from '@/types/api';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  Pause,
  Phone,
  Play,
  User,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const ACTION_LABELS: Record<StoreAuditAction, string> = {
  CREATED: '매장 생성',
  APPROVED: '매장 승인',
  SUSPENDED: '매장 정지',
  UNSUSPENDED: '정지 해제',
  DELETED: '매장 삭제',
  UPDATED: '정보 수정',
};

export function AdminStoreDetailPage() {
  const navigate = useNavigate();
  const { storeId } = useParams<{ storeId: string }>();
  const storeIdNum = Number(storeId);

  const { data: store, isLoading } = useAdminStore(storeIdNum);
  const { data: auditLogs } = useStoreAuditLogs(storeIdNum);
  const changeStatus = useChangeStoreStatus();

  const handleApprove = () => {
    if (!confirm('이 매장을 승인하시겠습니까?')) return;
    changeStatus.mutate({
      storeId: storeIdNum,
      data: { status: 'LIVE', reason: '운영 승인 완료' },
    });
  };

  const handleSuspend = () => {
    const reason = prompt('정지 사유를 입력해주세요:');
    if (!reason) return;
    changeStatus.mutate({
      storeId: storeIdNum,
      data: { status: 'SUSPENDED', reason },
    });
  };

  const handleUnsuspend = () => {
    if (!confirm('이 매장의 정지를 해제하시겠습니까?')) return;
    changeStatus.mutate({
      storeId: storeIdNum,
      data: { status: 'LIVE', reason: '정지 해제' },
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="mt-4 text-slate-700">매장을 찾을 수 없습니다</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl p-8 mx-auto">
      {/* 헤더 */}
      <button
        onClick={() => navigate('/admin/stores')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6"
      >
        <ChevronLeft size={20} /> 매장 목록
      </button>

      {/* 매장 정보 카드 */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 bg-slate-100 rounded-xl overflow-hidden">
              {store.iconImageUrl ? (
                <img
                  src={store.iconImageUrl}
                  alt={store.name}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-slate-400 text-2xl font-bold">
                  {store.name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-800">{store.name}</h2>
                <StoreStatusBadge status={store.status} />
              </div>
              <p className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                <MapPin size={14} /> {store.address || '주소 미등록'}
              </p>
              {store.phone && (
                <p className="flex items-center gap-1 text-sm text-slate-500">
                  <Phone size={14} /> {store.phone}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {store.status === 'DRAFT' && (
              <button
                onClick={handleApprove}
                disabled={changeStatus.isPending}
                className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <CheckCircle size={16} /> 승인
              </button>
            )}
            {store.status === 'LIVE' && (
              <button
                onClick={handleSuspend}
                disabled={changeStatus.isPending}
                className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                <Pause size={16} /> 정지
              </button>
            )}
            {store.status === 'SUSPENDED' && (
              <button
                onClick={handleUnsuspend}
                disabled={changeStatus.isPending}
                className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Play size={16} /> 정지 해제
              </button>
            )}
          </div>
        </div>

        {store.description && (
          <p className="mt-4 text-sm text-slate-600 border-t border-slate-100 pt-4">
            {store.description}
          </p>
        )}
      </div>

      {/* 승인 체크리스트 (DRAFT 상태일 때) */}
      {store.status === 'DRAFT' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <CreditCard size={18} /> 승인 체크리스트
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              {store.hasActiveStampCard ? (
                <>
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="text-slate-700">활성 스탬프카드가 등록되어 있습니다</span>
                </>
              ) : (
                <>
                  <AlertTriangle size={16} className="text-amber-500" />
                  <span className="text-amber-700 font-medium">
                    활성 스탬프카드가 없습니다 — 승인 전 확인 필요
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 점주 정보 */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
          <User size={18} /> 점주 정보
        </h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-slate-500">이름</p>
            <p className="font-medium text-slate-800">{store.ownerName || '-'}</p>
          </div>
          <div>
            <p className="text-slate-500">이메일</p>
            <p className="font-medium text-slate-800">{store.ownerEmail || '-'}</p>
          </div>
          <div>
            <p className="text-slate-500">전화번호</p>
            <p className="font-medium text-slate-800">{store.ownerPhone || '-'}</p>
          </div>
        </div>
      </div>

      {/* Audit Log */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Clock size={18} /> 변경 이력
        </h3>
        {!auditLogs || auditLogs.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">변경 이력이 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-800">
                      {ACTION_LABELS[log.action] || log.action}
                    </span>
                    {log.previousStatus && log.newStatus && (
                      <span className="text-xs text-slate-500">
                        {log.previousStatus} → {log.newStatus}
                      </span>
                    )}
                    <span className="text-xs px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">
                      {log.performedByType}
                    </span>
                  </div>
                  {log.detail && (
                    <p className="text-xs text-slate-500 mt-1">{log.detail}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(log.createdAt).toLocaleString('ko-KR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminStoreDetailPage;
