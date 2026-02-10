/**
 * TerminalLayout
 * 터미널(태블릿) 라우트용 레이아웃 래퍼
 * 사이드바와 상태 관리를 포함
 */

import { TerminalSidebar } from "@/features/terminal/components/TerminalSidebar";
import {
  usePendingIssuanceRequests,
  useApproveIssuance,
  useRejectIssuance,
} from "@/features/terminal/hooks/useTerminal";
import { useStorePublicInfo } from "@/hooks/useStorePublicInfo";
import { useAuth } from "@/app/providers/AuthProvider";
import type { IssuanceRequest, StoreStatus } from "@/types/domain";
import { useCallback, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { ScrollToTop } from "@/components/shared/ScrollToTop";

export function TerminalLayout() {
  const navigate = useNavigate();
  const { storeId } = useParams<{ storeId: string }>();
  const { logout } = useAuth();
  const [storeStatus, setStoreStatus] = useState<StoreStatus>("OPEN");
  const [processedHistory, setProcessedHistory] = useState<IssuanceRequest[]>(
    []
  );

  const storeIdNum = Number(storeId) || 0;

  // API Hooks
  const { data: storeInfo } = useStorePublicInfo(
    storeIdNum > 0 ? storeIdNum : undefined
  );
  const {
    data: pendingData,
    isLoading,
    error,
  } = usePendingIssuanceRequests(storeIdNum > 0 ? storeIdNum : undefined);
  const approveIssuance = useApproveIssuance();
  const rejectIssuance = useRejectIssuance();

  // pendingCount 계산
  const pendingCount = pendingData?.count ?? 0;

  // 매장 이름
  const storeName = storeInfo?.storeName ?? `매장 ${storeId}`;

  // 요청 목록 변환 (API 응답을 컴포넌트 형식으로)
  const requests: IssuanceRequest[] = (pendingData?.items ?? []).map(
    (item) => ({
      id: String(item.id),
      type: "stamp" as const,
      user: item.customerName,
      phone: "",
      count: 1,
      time: new Date(item.requestedAt),
      status: "pending" as const,
      store: storeName,
    })
  );

  const handleLogout = useCallback(() => {
    logout();
    navigate("/simulation");
  }, [logout, navigate]);

  const approve = useCallback(
    (id: string) => {
      const request = requests.find((r) => r.id === id);
      approveIssuance.mutate(
        { storeId: storeIdNum, requestId: Number(id) },
        {
          onSuccess: () => {
            if (request) {
              setProcessedHistory((prev) => [
                { ...request, status: "approved" as const, time: new Date() },
                ...prev,
              ]);
            }
          },
        }
      );
    },
    [approveIssuance, storeIdNum, requests]
  );

  const reject = useCallback(
    (id: string) => {
      const request = requests.find((r) => r.id === id);
      rejectIssuance.mutate(
        { storeId: storeIdNum, requestId: Number(id) },
        {
          onSuccess: () => {
            if (request) {
              setProcessedHistory((prev) => [
                { ...request, status: "rejected" as const, time: new Date() },
                ...prev,
              ]);
            }
          },
        }
      );
    },
    [rejectIssuance, storeIdNum, requests]
  );

  const toggleStoreStatus = useCallback(() => {
    setStoreStatus((prev) => (prev === "OPEN" ? "CLOSED" : "OPEN"));
  }, []);

  return (
    <>
      <ScrollToTop />
      <div className="flex items-center justify-center min-h-screen p-8 min-w-screen bg-kkookk-navy">
        <div className="w-5xl min-h-[80vh] max-h-[90vh] bg-kkookk-sand rounded-4xl overflow-hidden shadow-2xl flex border-2 border-kkookk-steel relative">
          <TerminalSidebar
            storeName={storeName}
            storeStatus={storeStatus}
            pendingCount={pendingCount}
            onLogout={handleLogout}
          />
          <div className="flex flex-col flex-1 bg-kkookk-sand">
            <Outlet
              context={{
                requests,
                approve,
                reject,
                processedHistory,
                isLoading,
                error,
                storeStatus,
                toggleStoreStatus,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default TerminalLayout;
