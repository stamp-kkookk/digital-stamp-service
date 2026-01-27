import { ArrowPathIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import type { PendingIssuanceRequest } from '../../types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface IssuanceRequestTableProps {
  requests: PendingIssuanceRequest[];
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
  onRefresh: () => void;
}

const TableRow = ({ request, onApprove, onReject }: { request: PendingIssuanceRequest, onApprove: (id: string) => void, onReject: (id: string) => void }) => {
  return (
    <tr className="bg-white border-b border-black/5">
      <td className="px-6 py-4">
        <div className="font-medium text-kkookk-navy">{request.customerNickname}</div>
        <div className="text-sm text-kkookk-steel">{request.customerPhoneNumber}</div>
      </td>
      <td className="px-6 py-4 text-kkookk-steel">{new Date(request.requestedAt).toLocaleString()}</td>
      <td className="px-6 py-4 text-kkookk-steel">{new Date(request.expiresAt).toLocaleString()}</td>
      <td className="px-6 py-4">
        <Badge variant="warning" size="sm">{request.status}</Badge>
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="danger"
            onClick={() => onReject(request.requestId)}
            className="!h-9 !w-9 !p-0"
          >
            <XMarkIcon className="h-5 w-5" />
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => onApprove(request.requestId)}
            className="!h-9 !w-9 !p-0 !bg-kkookk-green hover:!bg-kkookk-green/90"
          >
            <CheckIcon className="h-5 w-5" />
          </Button>
        </div>
      </td>
    </tr>
  );
};

const IssuanceRequestTable = ({ requests, onApprove, onReject, onRefresh }: IssuanceRequestTableProps) => {
  return (
    <Card padding="md" className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-kkookk-navy">실시간 발급 요청 목록</h2>
        <div className="flex items-center gap-2">
          <Input
            inputSize="sm"
            placeholder="고객 닉네임, 번호 검색"
            className="w-56"
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={onRefresh}
            className="!h-10 !w-10 !p-0"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-kkookk-steel uppercase bg-kkookk-navy-50">
            <tr>
              <th scope="col" className="px-6 py-3">고객 정보</th>
              <th scope="col" className="px-6 py-3">요청 시간</th>
              <th scope="col" className="px-6 py-3">만료 시간</th>
              <th scope="col" className="px-6 py-3">상태</th>
              <th scope="col" className="px-6 py-3">승인 관리</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(request => (
              <TableRow key={request.requestId} request={request} onApprove={onApprove} onReject={onReject} />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default IssuanceRequestTable;
