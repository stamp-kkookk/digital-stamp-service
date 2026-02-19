/**
 * ApprovalTab 컴포넌트
 * Owner 백오피스 매장 상세 - 적립 승인 관리 탭
 */

import { useOwnerPendingIssuanceRequests, useOwnerApproveIssuance, useOwnerRejectIssuance } from '../hooks/useApproval';
import { kkookkToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Modal';
import { Bell, CheckCircle, Loader2, RefreshCw, XCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PendingIssuanceRequestItem } from '@/types/api';

interface ApprovalTabProps {
  storeId: number;
}

interface ConfirmState {
  open: boolean;
  type: 'approve' | 'reject';
  request: PendingIssuanceRequestItem | null;
}

export function ApprovalTab({ storeId }: ApprovalTabProps) {
  const { data, isLoading, error, dataUpdatedAt } = useOwnerPendingIssuanceRequests(storeId);
  const approveIssuance = useOwnerApproveIssuance();
  const rejectIssuance = useOwnerRejectIssuance();
  const [confirm, setConfirm] = useState<ConfirmState>({ open: false, type: 'approve', request: null });

  const lastUpdated = useMemo(() => {
    if (!dataUpdatedAt) return '';
    return new Date(dataUpdatedAt).toLocaleTimeString('ko-KR');
  }, [dataUpdatedAt]);

  const openConfirm = useCallback((type: 'approve' | 'reject', request: PendingIssuanceRequestItem) => {
    setConfirm({ open: true, type, request });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirm(prev => ({ ...prev, open: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (!confirm.request) return;
    const requestId = confirm.request.id;

    if (confirm.type === 'approve') {
      approveIssuance.mutate(
        { storeId, requestId },
        {
          onSuccess: () => {
            kkookkToast.success('적립 요청을 승인했습니다');
            closeConfirm();
          },
          onError: (err) => {
            kkookkToast.error('승인 처리 실패', { description: err.message });
            closeConfirm();
          },
        }
      );
    } else {
      rejectIssuance.mutate(
        { storeId, requestId },
        {
          onSuccess: () => {
            kkookkToast.warning('적립 요청을 거절했습니다');
            closeConfirm();
          },
          onError: (err) => {
            kkookkToast.error('거절 처리 실패', { description: err.message });
            closeConfirm();
          },
        }
      );
    }
  }, [confirm, storeId, approveIssuance, rejectIssuance, closeConfirm]);

  const items = data?.items ?? [];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <XCircle className="w-12 h-12 mb-4 text-red-400" />
        <p className="font-bold text-kkookk-navy">승인 목록을 불러올 수 없습니다</p>
        <p className="mt-1 text-sm text-kkookk-steel">네트워크 연결을 확인해주세요.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl p-8 mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-kkookk-navy">적립 승인 관리</h3>
          <p className="mt-1 text-sm text-kkookk-steel">
            고객의 스탬프 적립 요청을 실시간으로 확인하고 승인/거절합니다.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-kkookk-steel">
          <RefreshCw size={12} className="animate-spin" style={{ animationDuration: '2s' }} />
          <span>2초마다 자동 갱신</span>
          {lastUpdated && <span className="text-slate-400">({lastUpdated})</span>}
        </div>
      </div>

      {/* 로딩 */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center p-16">
          <Loader2 className="w-8 h-8 animate-spin text-kkookk-indigo" />
          <p className="mt-4 text-kkookk-steel">승인 대기 목록을 불러오는 중...</p>
        </div>
      )}

      {/* 컨텐츠 */}
      {!isLoading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <Bell size={48} className="mb-4 text-slate-300" />
          <p className="font-bold text-kkookk-navy">새로운 적립 요청이 없습니다</p>
          <p className="mt-1 text-sm text-kkookk-steel">
            고객이 적립 요청을 보내면 여기에 실시간으로 표시됩니다.
          </p>
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-bold text-kkookk-navy">
              대기 중 ({items.length}건)
            </span>
          </div>

          {items.map((item) => (
            <RequestCard
              key={item.id}
              item={item}
              onApprove={() => openConfirm('approve', item)}
              onReject={() => openConfirm('reject', item)}
              isProcessing={
                (approveIssuance.isPending && approveIssuance.variables?.requestId === item.id) ||
                (rejectIssuance.isPending && rejectIssuance.variables?.requestId === item.id)
              }
            />
          ))}
        </div>
      )}

      {/* 확인 다이얼로그 */}
      <Dialog open={confirm.open} onOpenChange={(open) => !open && closeConfirm()}>
        <DialogContent showClose={false} className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>
              {confirm.type === 'approve' ? '적립 승인' : '적립 거절'}
            </DialogTitle>
            <DialogDescription>
              {confirm.request && (
                <>
                  <span className="font-bold">{confirm.request.customerNickname}</span>님의
                  적립 요청을 {confirm.type === 'approve' ? '승인' : '거절'}하시겠습니까?
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeConfirm}>
              취소
            </Button>
            <Button
              variant={confirm.type === 'approve' ? 'secondary' : 'destructive'}
              onClick={handleConfirm}
              disabled={approveIssuance.isPending || rejectIssuance.isPending}
            >
              {(approveIssuance.isPending || rejectIssuance.isPending) && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {confirm.type === 'approve' ? '승인' : '거절'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RequestCard({
  item,
  onApprove,
  onReject,
  isProcessing,
}: {
  item: PendingIssuanceRequestItem;
  onApprove: () => void;
  onReject: () => void;
  isProcessing: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-5 bg-white border shadow-sm rounded-xl border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <span className="font-bold text-kkookk-navy">{item.customerNickname}</span>
          <span className="text-sm text-kkookk-steel">{item.maskedPhone}</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-kkookk-steel">
          <span>요청: {new Date(item.requestedAt).toLocaleTimeString('ko-KR')}</span>
          <CountdownTimer remainingSeconds={item.remainingSeconds} />
        </div>
      </div>
      <div className="flex gap-2 ml-4 shrink-0">
        <button
          onClick={onReject}
          disabled={isProcessing}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold border rounded-lg border-slate-200 text-kkookk-steel hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50"
        >
          <XCircle size={16} />
          거절
        </button>
        <button
          onClick={onApprove}
          disabled={isProcessing}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white rounded-lg bg-kkookk-indigo hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
          승인
        </button>
      </div>
    </div>
  );
}

function CountdownTimer({ remainingSeconds }: { remainingSeconds: number }) {
  const [seconds, setSeconds] = useState(remainingSeconds);

  useEffect(() => {
    setSeconds(remainingSeconds);
  }, [remainingSeconds]);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setInterval(() => {
      setSeconds(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [seconds > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isUrgent = seconds < 30;

  return (
    <span className={`font-mono ${isUrgent ? 'text-red-500 font-bold' : 'text-kkookk-steel'}`}>
      남은 시간: {minutes}:{secs.toString().padStart(2, '0')}
    </span>
  );
}

export default ApprovalTab;
