/**
 * OwnerLoginPage
 * 사장님 백오피스 통합 인증 페이지 (로그인 + 회원가입)
 * 신규 유저는 OAuth 후 동일 카드 안에서 2차 폼 표시
 */

import { ChevronLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { OAuthButtons } from "../components/OAuthButtons";
import type { SignupLocationState } from "../components/OAuthCompleteSignupForm";
import { OwnerCompleteSignupForm } from "../components/OwnerCompleteSignupForm";

export function OwnerLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as SignupLocationState | undefined;

  const showSignup = locationState?.showSignup && locationState.tempToken;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md border border-slate-200">
        {showSignup ? (
          <>
            <button
              onClick={() => navigate("/owner/login", { replace: true })}
              className="flex items-center gap-1 mb-4 -ml-2 text-sm text-kkookk-steel hover:text-kkookk-indigo"
            >
              <ChevronLeft size={18} /> 돌아가기
            </button>
            <OwnerCompleteSignupForm signupState={locationState} />
          </>
        ) : (
          <>
            <div className="mb-8 text-center">
              <img
                src="/logo/logo_textandsymbol_owner.png"
                alt="KKOOKK Owner"
                className="h-24 mx-auto mb-4"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <p className="text-base font-bold text-kkookk-steel">
                SNS 계정으로 간편하게 시작하세요
              </p>
            </div>

            <div className="mx-8 h-px bg-linear-to-r from-transparent via-slate-200 to-transparent" />

            <div className="pt-6 pb-6">
              <OAuthButtons userRole="OWNER" />
            </div>
          </>
        )}
      </div>

      {!showSignup && (
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1 mt-4 text-sm text-kkookk-steel hover:text-kkookk-indigo"
        >
          <ChevronLeft size={16} /> 초기 화면으로
        </button>
      )}
    </div>
  );
}

export default OwnerLoginPage;
