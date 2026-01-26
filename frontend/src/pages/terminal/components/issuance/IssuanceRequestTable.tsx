import { ArrowPathIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import type { PendingIssuanceRequest } from '../../types';

interface IssuanceRequestTableProps {
  requests: PendingIssuanceRequest[];
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
  onRefresh: () => void;
}

const TableRow = ({ request, onApprove, onReject }: { request: PendingIssuanceRequest, onApprove: (id: string) => void, onReject: (id: string) => void }) => {
  return (
    <tr className="bg-white border-b">
      <td className="px-6 py-4">
        <div className="font-medium">{request.customerNickname}</div>
        <div className="text-sm text-gray-500">{request.customerPhoneNumber}</div>
      </td>
      <td className="px-6 py-4">{new Date(request.requestedAt).toLocaleString()}</td>
      <td className="px-6 py-4">{new Date(request.expiresAt).toLocaleString()}</td>
      <td className="px-6 py-4">
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
          {request.status}
        </span>
      </td>
      <td className="px-6 py-4 space-x-2">
        <button onClick={() => onReject(request.requestId)} className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200">
          <XMarkIcon className="h-5 w-5" />
        </button>
        <button onClick={() => onApprove(request.requestId)} className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200">
          <CheckIcon className="h-5 w-5" />
        </button>
      </td>
    </tr>
  );
};

const IssuanceRequestTable = ({ requests, onApprove, onReject, onRefresh }: IssuanceRequestTableProps) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">실시간 발급 요청 목록</h2>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="고객 닉네임, 번호 검색"
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
          />
          <button onClick={onRefresh} className="p-2 text-gray-500 hover:text-gray-700">
            <ArrowPathIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
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
    </div>
  );
};

export default IssuanceRequestTable;
