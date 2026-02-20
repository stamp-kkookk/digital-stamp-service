/**
 * OwnerLoginPage
 * 사장님/백오피스 인증을 위한 OAuth 로그인 페이지
 */

import { ChevronLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { OAuthButtons } from "../components/OAuthButtons";
import { OAuthCompleteSignupForm } from "../components/OAuthCompleteSignupForm";

export function OwnerLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { showSignup?: boolean } | undefined;

  // If navigated from OAuth callback for new user signup
  if (locationState?.showSignup) {
    return <OAuthCompleteSignupForm role="owner" />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md border border-slate-200">
        <div className="mb-8 text-center">
          <img
            src="/logo/symbol_owner.png"
            alt="KKOOKK Owner"
            className="w-16 h-16 mx-auto mb-4"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <h2 className="mb-2 text-2xl font-bold text-kkookk-navy">사장님 백오피스</h2>
          <p className="text-sm text-kkookk-steel">SNS 계정으로 간편하게 시작하세요</p>
        </div>

        <OAuthButtons role="OWNER" />
      </div>

      <button
        onClick={() => navigate("/simulation")}
        className="flex items-center gap-1 mt-4 text-sm text-kkookk-steel hover:text-kkookk-indigo"
      >
        <ChevronLeft size={16} /> 초기 화면으로
      </button>
    </div>
  );
}

export default OwnerLoginPage;
