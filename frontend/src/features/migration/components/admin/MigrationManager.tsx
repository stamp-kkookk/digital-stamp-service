/**
 * MigrationManager 컴포넌트
 * 마이그레이션 요청 관리 어드민 뷰
 */

import { Image as ImageIcon, RefreshCw, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatShortDate } from '@/lib/utils/format';
import type { MigrationRequest, MigrationStatus } from '@/types/domain';

interface MigrationManagerProps {
  migrations: MigrationRequest[];
  onAction: (id: string, newStatus: MigrationStatus, approvedCount?: number, rejectReason?: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onViewImage?: (id: string) => void;
  imageDetail?: { imageUrl: string; count: number } | null;
  imageLoading?: boolean;
  onCloseImage?: () => void;
}

export function MigrationManager({
  migrations,
  onAction,
  onRefresh,
  isRefreshing = false,
  onViewImage,
  imageDetail,
  imageLoading = false,
  onCloseImage,
}: MigrationManagerProps) {
  const getStatusBadge = (status: MigrationStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">대기중</Badge>;
      case 'approved':
        return <Badge variant="success">승인됨</Badge>;
      case 'rejected':
        return <Badge variant="destructive">반려됨</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-kkookk-navy">전환 신청 관리</h3>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 text-kkookk-steel hover:text-kkookk-navy hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              title="새로고침"
            >
              <RefreshCw
                size={18}
                className={isRefreshing ? 'animate-spin' : ''}
              />
            </button>
          )}
        </div>
        <span className="text-sm text-kkookk-steel">
          총 {migrations.length}건
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex-1 flex flex-col">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 pl-6 text-xs font-bold text-kkookk-steel">
                신청일
              </th>
              <th className="p-4 text-xs font-bold text-kkookk-steel">
                신청자
              </th>
              <th className="p-4 text-xs font-bold text-kkookk-steel">수량</th>
              <th className="p-4 text-xs font-bold text-kkookk-steel">
                증빙 사진
              </th>
              <th className="p-4 text-xs font-bold text-kkookk-steel">상태</th>
              <th className="p-4 text-xs font-bold text-kkookk-steel text-right pr-6">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {migrations.map((mig) => (
              <tr key={mig.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 pl-6 text-sm text-kkookk-steel font-mono">
                  {formatShortDate(mig.date)}
                </td>
                <td className="p-4">
                  <div className="text-sm font-bold text-kkookk-navy">
                    {mig.customerName || '이름 없음'}
                  </div>
                  {mig.customerPhone && (
                    <div className="text-xs text-kkookk-steel mt-0.5">
                      {mig.customerPhone}
                    </div>
                  )}
                </td>
                <td className="p-4 text-sm font-bold text-kkookk-navy">
                  {mig.count}개
                </td>
                <td className="p-4">
                  <button
                    onClick={() => onViewImage?.(mig.id)}
                    className="flex items-center gap-1 text-xs font-bold text-kkookk-indigo hover:underline"
                  >
                    <ImageIcon size={14} /> 확인하기
                  </button>
                </td>
                <td className="p-4">{getStatusBadge(mig.status)}</td>
                <td className="p-4 text-right pr-6">
                  {mig.status === 'pending' && (
                    <div className="flex justify-end gap-2">
                      <Button
                        onClick={() => {
                          const reason = prompt('반려 사유를 입력해주세요:');
                          if (reason) {
                            onAction(mig.id, 'rejected', undefined, reason);
                          }
                        }}
                        variant="subtle"
                        size="sm"
                        className="hover:bg-red-50 hover:text-red-600"
                      >
                        반려
                      </Button>
                      <Button
                        onClick={() => {
                          const countStr = prompt(`승인할 스탬프 수를 입력해주세요 (신청: ${mig.count}개):`, String(mig.count));
                          const count = countStr ? parseInt(countStr, 10) : null;
                          if (count && count > 0) {
                            onAction(mig.id, 'approved', count);
                          }
                        }}
                        variant="navy"
                        size="sm"
                      >
                        승인
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {migrations.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-12 text-center text-kkookk-steel"
                >
                  신청 내역이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 이미지 미리보기 모달 (로딩 or 결과) */}
      {(imageLoading || imageDetail) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-kkookk-navy/80 backdrop-blur-sm"
          role="presentation"
        >
          <button
            type="button"
            aria-label="이미지 미리보기 닫기"
            className="absolute inset-0 w-full h-full cursor-default"
            onClick={onCloseImage}
          />
          <div
            role="dialog"
            aria-label="이미지 미리보기"
            aria-modal="true"
            className="relative bg-white rounded-2xl p-2 max-w-sm w-full animate-in zoom-in-95"
          >
            {imageLoading ? (
              <div className="aspect-[3/4] bg-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-400">
                <Loader2 size={32} className="animate-spin mb-2" />
                <p className="text-sm">이미지 불러오는 중...</p>
              </div>
            ) : imageDetail?.imageUrl ? (
              <img
                src={imageDetail.imageUrl}
                alt="마이그레이션 증빙 사진"
                className="aspect-[3/4] w-full object-contain rounded-xl bg-slate-100"
              />
            ) : (
              <div className="aspect-[3/4] bg-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-400">
                <ImageIcon size={48} className="mb-2" />
                <p className="text-sm">이미지 없음</p>
              </div>
            )}
            {imageDetail && (
              <div className="mt-2 px-2 text-center">
                <p className="text-sm text-kkookk-navy font-bold">신청 스탬프: {imageDetail.count}개</p>
              </div>
            )}
            <button
              type="button"
              onClick={onCloseImage}
              className="w-full py-3 mt-2 font-bold text-kkookk-navy hover:bg-slate-50 rounded-xl"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MigrationManager;
