/**
 * MigrationDetail 컴포넌트
 * 마이그레이션 요청 상세 화면 — 상태별 결과 표시
 */

import { StepUpVerify } from "@/components/shared/StepUpVerify";
import { Button } from "@/components/ui/Button";
import { useMigrationStatus } from "@/features/migration/hooks/useMigration";
import { useCustomerNavigate } from "@/hooks/useCustomerNavigate";
import { isStepUpValid } from "@/lib/api/tokenManager";
import { formatShortDate } from "@/lib/utils/format";
import { Check, ChevronLeft, Clock, Loader2, X } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";

export function MigrationDetail() {
  const { id } = useParams<{ id: string }>();
  const { customerNavigate } = useCustomerNavigate();
  const [stepUpValid, setStepUpValid] = useState(isStepUpValid());

  const migrationId = id ? Number(id) : undefined;
  const {
    data: migration,
    isLoading,
    isError,
  } = useMigrationStatus(migrationId);

  if (!stepUpValid) {
    return (
      <div className="h-full bg-white flex flex-col pt-12">
        <div className="px-6 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center sticky top-0 bg-white z-10 -mt-12 pt-12">
          <button
            onClick={() => customerNavigate("/migrations")}
            className="p-2 -ml-2 text-kkookk-steel hover:text-kkookk-navy"
            aria-label="뒤로 가기"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="font-bold text-lg ml-2 text-kkookk-navy">
            전환 신청 상세
          </h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <StepUpVerify onVerified={() => setStepUpValid(true)} />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-kkookk-steel">
        <Loader2 size={32} className="animate-spin opacity-40 mb-4" />
        <p>정보를 불러오는 중...</p>
      </div>
    );
  }

  if (isError || !migration) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <p className="text-kkookk-steel mb-6">
          요청 정보를 불러올 수 없습니다.
        </p>
        <Button
          onClick={() => customerNavigate("/migrations")}
          variant="subtle"
          size="full"
        >
          목록으로 돌아가기
        </Button>
      </div>
    );
  }

  if (migration.status === "APPROVED") {
    return (
      <div className="h-full flex flex-col p-6 justify-center text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-green-100 text-green-600">
          <Check size={40} />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-kkookk-navy">
          스탬프 {migration.approvedStampCount}개 적립 완료!
        </h2>
        <p className="text-kkookk-steel mb-2">
          종이 스탬프가 디지털 스탬프로 전환되었습니다.
        </p>
        {migration.processedAt && (
          <p className="text-xs text-slate-400 mb-8">
            처리일: {formatShortDate(new Date(migration.processedAt))}
          </p>
        )}
        <Button
          onClick={() => customerNavigate("/redeems")}
          variant="primary"
          size="full"
        >
          보상 확인
        </Button>
      </div>
    );
  }

  if (migration.status === "REJECTED") {
    return (
      <div className="h-full flex flex-col p-6 justify-center text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-red-100 text-kkookk-red">
          <X size={40} />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-kkookk-navy">
          전환 신청이 반려되었습니다
        </h2>
        {migration.rejectReason && (
          <div className="mt-2 bg-red-50 rounded-xl p-4 mb-8 text-left flex gap-4 items-center">
            <p className="text-sm font-bold text-red-700 mb-1">
              반려 사유 : {migration.rejectReason}
            </p>
          </div>
        )}
        {!migration.rejectReason && <div className="mb-8" />}
        <Button
          onClick={() => customerNavigate("/migrations/new")}
          variant="primary"
          size="full"
        >
          다시 신청하기
        </Button>
        <Button
          onClick={() => customerNavigate("/migrations")}
          variant="subtle"
          size="full"
          className="mt-3"
        >
          목록으로
        </Button>
      </div>
    );
  }

  // SUBMITTED
  return (
    <div className="h-full flex flex-col p-6 justify-center text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-slate-100 text-slate-500">
        <Clock size={40} />
      </div>
      <h2 className="text-2xl font-bold mb-2 text-kkookk-navy">심사 대기 중</h2>
      <p className="text-kkookk-steel mb-2">{migration.slaMessage}</p>
      <p className="text-sm text-kkookk-steel mb-8">
        신청 스탬프:{" "}
        <span className="font-bold text-kkookk-navy">
          {migration.claimedStampCount}개
        </span>
      </p>
      <Button
        onClick={() => customerNavigate("/migrations")}
        variant="subtle"
        size="full"
      >
        목록으로 돌아가기
      </Button>
    </div>
  );
}

export default MigrationDetail;
