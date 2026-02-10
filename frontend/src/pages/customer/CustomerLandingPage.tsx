/**
 * CustomerLandingPage 컴포넌트
 * QR 스캔 시 표시되는 고객 앱 랜딩 페이지
 */

import { Button } from "@/components/ui/Button";
import { useCustomerNavigate } from "@/hooks/useCustomerNavigate";
import { useStorePublicInfo } from "@/hooks/useStorePublicInfo";
import { Loader2, AlertCircle } from "lucide-react";

export function CustomerLandingPage() {
  const { storeId, customerNavigate } = useCustomerNavigate();
  const { data: storeInfo, isLoading, error } = useStorePublicInfo(
    storeId ? Number(storeId) : undefined,
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-kkookk-orange-500" />
        <p className="mt-4 text-sm text-kkookk-steel">매장 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 bg-white">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="mt-4 text-lg font-medium text-kkookk-navy">매장을 찾을 수 없습니다</p>
        <p className="mt-1 text-sm text-kkookk-steel">QR 코드를 다시 스캔해주세요</p>
      </div>
    );
  }

  const storeName = storeInfo?.storeName ?? "매장";

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white">
      <div className="flex flex-col items-center justify-center flex-1 -mt-10">
        <img
          src="/logo/symbol_customer.png"
          alt="KKOOKK Customer"
          className="mb-2 w-26 h-26 "
        />
        <h2 className="mb-3 text-2xl font-bold leading-tight text-kkookk-navy">
          {storeName}에
          <br />
          오신 것을 환영해요!
        </h2>
        <p className="mb-8 text-sm text-kkookk-steel">
          스탬프를 모아 특별한 혜택을 받아보세요.
        </p>
        <div className="bg-kkookk-navy text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-kkookk-navy/20 animate-pulse">
          현재 {storeInfo?.activeStampCardCount ?? 0}명이 적립 중
        </div>
      </div>
      <div className="w-full pb-8 mt-auto">
        <Button
          onClick={() => customerNavigate("/login")}
          variant="primary"
          size="full"
          className="shadow-lg shadow-orange-200"
        >
          내 지갑 열기
        </Button>
        <button
          onClick={() => customerNavigate("/signup")}
          className="mt-4 text-sm underline text-kkookk-steel/60 hover:text-kkookk-steel decoration-kkookk-steel/30 underline-offset-4"
        >
          처음이신가요?
        </button>
      </div>
    </div>
  );
}

export default CustomerLandingPage;
