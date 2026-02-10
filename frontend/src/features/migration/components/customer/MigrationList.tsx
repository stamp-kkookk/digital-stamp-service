/**
 * MigrationList 컴포넌트
 * 고객의 전환 요청 내역 뷰 (API 연동)
 */

import { Badge } from "@/components/ui/Badge";
import { formatShortDate } from "@/lib/utils/format";
import type { MigrationListItemResponse, StampMigrationStatus } from "@/types/api";
import { useState } from "react";
import { ChevronLeft, Plus, FileText, Loader2 } from "lucide-react";
import { useCustomerNavigate } from "@/hooks/useCustomerNavigate";
import { useMigrationList } from "@/features/migration/hooks/useMigration";
import { isStepUpValid } from "@/lib/api/tokenManager";
import { StepUpVerify } from "@/components/shared/StepUpVerify";

function getStatusBadge(status: StampMigrationStatus) {
  switch (status) {
    case "SUBMITTED":
      return <Badge variant="warning">제출됨</Badge>;
    case "APPROVED":
      return <Badge variant="success">승인됨</Badge>;
    case "REJECTED":
      return <Badge variant="destructive">반려됨</Badge>;
    default:
      return null;
  }
}

export function MigrationList() {
  const { customerNavigate } = useCustomerNavigate();
  const [stepUpValid, setStepUpValid] = useState(isStepUpValid());
  const { data: migrations, isLoading } = useMigrationList();

  const items: MigrationListItemResponse[] = migrations ?? [];

  return (
    <div className="flex flex-col h-full pt-12">
      {/* 헤더 */}
      <div className="px-6 py-4 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center justify-between sticky top-0 z-10 -mt-12 pt-12">
        <div className="flex items-center">
          <button
            onClick={() => customerNavigate("/wallet")}
            className="p-2 -ml-2 text-kkookk-steel hover:text-kkookk-navy"
            aria-label="뒤로 가기"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="ml-2 text-lg font-bold text-kkookk-navy">
            종이 스탬프 전환
          </h1>
        </div>
        {stepUpValid && (
          <button
            onClick={() => customerNavigate("/migrations/new")}
            className="flex items-center justify-center w-8 h-8 text-white transition-colors duration-100 bg-gray-500 rounded-lg hover:bg-kkookk-orange-500"
            aria-label="새 신청"
          >
            <Plus size={20} />
          </button>
        )}
      </div>

      {/* 목록 */}
      <div className="p-6 space-y-4 overflow-y-auto">
        {!stepUpValid ? (
          <div className="flex items-center justify-center mt-20">
            <StepUpVerify onVerified={() => setStepUpValid(true)} />
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center mt-20 text-kkookk-steel">
            <Loader2 size={32} className="animate-spin opacity-40 mb-4" />
            <p>내역을 불러오는 중...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-kkookk-steel">
            <FileText size={48} className="opacity-20 mb-4" />
            <p>신청 내역이 없습니다.</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="p-5 bg-white border shadow-sm rounded-2xl border-slate-100"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-kkookk-navy">{item.storeName}</h3>
                {getStatusBadge(item.status)}
              </div>
              <div className="flex items-end justify-between">
                <p className="text-sm text-kkookk-steel">
                  신청 수량:{" "}
                  <span className="font-bold text-kkookk-navy">
                    {item.claimedStampCount}개
                  </span>
                  {item.approvedStampCount != null && (
                    <span className="text-xs text-slate-400 ml-2">
                      (승인: {item.approvedStampCount}개)
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-400">
                  {formatShortDate(new Date(item.requestedAt))}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MigrationList;
