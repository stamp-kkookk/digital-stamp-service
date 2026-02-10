/**
 * PendingRequestsList 컴포넌트
 * 터미널 승인 대기 중인 스탬프 요청 목록
 */

import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatTime, maskPhone } from '@/lib/utils/format';
import type { IssuanceRequest } from '@/types/domain';

interface PendingRequestsListProps {
  requests: IssuanceRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function PendingRequestsList({
  requests,
  onApprove,
  onReject,
}: PendingRequestsListProps) {
  if (requests.length === 0) {
    return (
      <div className="col-span-2 h-64 flex flex-col items-center justify-center text-kkookk-steel border-2 border-dashed border-slate-200 rounded-2xl">
        <Bell size={48} className="mb-4 opacity-20" />
        <p>새로운 요청이 없습니다.</p>
      </div>
    );
  }

  return (
    <>
      {requests.map((req) => (
        <div
          key={req.id}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <Badge
                variant="secondary"
                className="mb-2"
              >
                {req.type === 'stamp' ? '스탬프 적립' : '리워드 사용'}
              </Badge>
              <h3 className="text-xl font-bold mt-2 text-kkookk-navy">
                {req.user}님
              </h3>
              <p className="text-sm text-kkookk-steel font-mono mt-1">
                {maskPhone(req.phone)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-kkookk-steel">
                {formatTime(req.time)} 요청
              </p>
              <p className="font-bold text-lg text-kkookk-indigo mt-1">
                {req.type === 'stamp' ? `+${req.count}개` : '사용'}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => onReject(req.id)}
              variant="subtle"
              className="flex-1"
            >
              거절
            </Button>
            <Button
              onClick={() => onApprove(req.id)}
              variant="secondary"
              className="flex-[2] shadow-lg shadow-blue-200"
            >
              승인하기
            </Button>
          </div>
        </div>
      ))}
    </>
  );
}

export default PendingRequestsList;
