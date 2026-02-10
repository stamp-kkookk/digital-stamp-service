/**
 * TerminalApprovalPage
 * 스탬프 적립 승인 대기 페이지
 */

import { ApprovalQueue } from "@/features/terminal/components/ApprovalQueue";
import { Loader2, AlertCircle } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import type { IssuanceRequest } from "@/types/domain";

interface TerminalContextType {
  requests: IssuanceRequest[];
  approve: (id: string) => void;
  reject: (id: string) => void;
  isLoading: boolean;
  error: Error | null;
}

export function TerminalApprovalPage() {
  const { requests, approve, reject, isLoading, error } =
    useOutletContext<TerminalContextType>();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1">
        <Loader2 className="w-8 h-8 animate-spin text-kkookk-indigo" />
        <p className="mt-4 text-kkookk-steel">승인 요청을 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-8">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="mt-4 text-lg font-medium text-kkookk-navy">
          요청을 불러올 수 없습니다
        </p>
        <p className="mt-1 text-sm text-kkookk-steel">
          터미널 인증 상태를 확인해주세요
        </p>
      </div>
    );
  }

  return (
    <ApprovalQueue requests={requests} onApprove={approve} onReject={reject} />
  );
}

export default TerminalApprovalPage;
