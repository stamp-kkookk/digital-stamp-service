/**
 * CustomerLandingPage 컴포넌트
 * QR 스캔 시 표시되는 고객 앱 랜딩 페이지
 * 신규 유저는 OAuth 후 동일 카드 안에서 2차 폼 표시
 */

import { OAuthButtons } from "@/features/auth/components/OAuthButtons";
import {
  OAuthCompleteSignupForm,
  type SignupLocationState,
} from "@/features/auth/components/OAuthCompleteSignupForm";
import { useCustomerNavigate } from "@/hooks/useCustomerNavigate";
import { useStorePublicInfo } from "@/hooks/useStorePublicInfo";
import { AlertCircle, ChevronLeft, Loader2, Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export function CustomerLandingPage() {
  const { storeId } = useCustomerNavigate();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as SignupLocationState | undefined;
  const showSignup = locationState?.tempToken;

  const {
    data: storeInfo,
    isLoading,
    error,
  } = useStorePublicInfo(storeId ? Number(storeId) : undefined);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 bg-kkookk-sand">
        <Loader2 className="w-8 h-8 animate-spin text-kkookk-orange-500" />
        <p className="mt-4 text-sm text-kkookk-steel">
          매장 정보를 불러오는 중...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 bg-kkookk-sand">
        <AlertCircle className="w-12 h-12 text-kkookk-red" />
        <p className="mt-4 text-lg font-medium text-kkookk-navy">
          매장을 찾을 수 없습니다
        </p>
        <p className="mt-1 text-sm text-kkookk-steel">
          QR 코드를 다시 스캔해주세요
        </p>
      </div>
    );
  }

  const storeName = storeInfo?.storeName ?? "매장";
  const activeCount = storeInfo?.activeStampCardCount ?? 0;

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 bg-kkookk-sand">
      <div className="relative w-full max-w-md overflow-hidden bg-white rounded-3xl border border-slate-100 shadow-xl text-center animate-fadeInUp texture-grain">
        {showSignup ? (
          <div className="px-8 py-6 text-left">
            <button
              onClick={() =>
                navigate(`/stores/${storeId}/customer`, { replace: true })
              }
              className="flex items-center gap-1 mb-4 -ml-2 text-sm text-kkookk-steel hover:text-kkookk-indigo"
            >
              <ChevronLeft size={18} /> 돌아가기
            </button>
            <OAuthCompleteSignupForm signupState={locationState} />
          </div>
        ) : (
          <>
            {/* Branding */}
            <div className="pt-8 pb-2 px-8">
              <img
                src="/logo/logo_textandsymbol_customer.png"
                alt="KKOOKK"
                className="h-24 mx-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>

            {/* Store welcome */}
            <div className="px-8 pt-2 pb-6">
              <h1 className="mb-2 text-3xl font-extrabold bg-linear-to-r from-kkookk-orange-600 via-kkookk-orange-500 to-kkookk-orange-600 bg-clip-text text-transparent">
                {storeName}
              </h1>
              <p className="text-sm text-kkookk-steel">
                스탬프를 모아 특별한 혜택을 받아보세요
              </p>
            </div>

            {/* Social proof badge */}
            {activeCount > 0 && (
              <div className="pb-6">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-kkookk-orange-50 text-kkookk-orange-600 animate-pulse-badge">
                  <Users size={13} />
                  현재 {activeCount}명이 적립 중
                </span>
              </div>
            )}

            {/* Gradient divider */}
            <div className="mx-8 h-px bg-linear-to-r from-transparent via-slate-200 to-transparent" />

            {/* OAuth action area */}
            <div className="px-8 pt-6 pb-6">
              <OAuthButtons userRole="CUSTOMER" storeId={storeId} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CustomerLandingPage;
