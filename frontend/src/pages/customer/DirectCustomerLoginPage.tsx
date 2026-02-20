/**
 * DirectCustomerLoginPage
 * 직접 고객 로그인 페이지 (storeId 없이 진입)
 * OAuth 로그인 버튼으로 진입
 */

import { OAuthButtons } from "@/features/auth/components/OAuthButtons";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function DirectCustomerLoginPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white">
      <div className="flex flex-col items-center justify-center flex-1 -mt-10">
        <img
          src="/logo/symbol_customer.png"
          alt="KKOOKK Customer"
          className="mb-2 w-26 h-26"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <h2 className="mb-3 text-2xl font-bold leading-tight text-kkookk-navy">
          내 지갑 열기
        </h2>
        <p className="mb-8 text-sm text-kkookk-steel">
          SNS 계정으로 간편하게 로그인하세요.
        </p>
      </div>
      <div className="w-full pb-8 mt-auto">
        <OAuthButtons role="CUSTOMER" />

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 mx-auto mt-6 text-sm text-kkookk-steel hover:text-kkookk-indigo"
        >
          <ChevronLeft size={16} /> 돌아가기
        </button>
      </div>
    </div>
  );
}

export default DirectCustomerLoginPage;
