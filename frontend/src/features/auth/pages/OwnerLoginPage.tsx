/**
 * OwnerLoginPage
 * 사장님/백오피스 인증을 위한 로그인 페이지
 */

import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "../components/LoginForm";
import { useOwnerLogin } from "../hooks/useAuth";
import { useAuth } from "@/app/providers/AuthProvider";
import { kkookkToast } from "@/components/ui/Toast";

interface OwnerLoginPageProps {
  title?: string;
  subtitle?: string;
  onLoginSuccess?: () => void;
  onLoginSuccessWithCredentials?: (email: string, password: string) => void;
  onBack?: () => void;
  isTabletMode?: boolean;
}

export function OwnerLoginPage({
  title = "사장님 백오피스",
  subtitle = "",
  onLoginSuccess,
  onLoginSuccessWithCredentials,
  onBack,
  isTabletMode = false,
}: OwnerLoginPageProps) {
  const navigate = useNavigate();
  const { refreshAuthState } = useAuth();

  const ownerLogin = useOwnerLogin();
  const [errorMessage, setErrorMessage] = useState("");

  const handleLoginSuccess = () => {
    refreshAuthState();
    if (onLoginSuccess) {
      onLoginSuccess();
    } else {
      navigate("/owner/stores");
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/simulation");
    }
  };

  const handleLogin = (email: string, password: string) => {
    setErrorMessage("");
    ownerLogin.mutate(
      { email, password },
      {
        onSuccess: () => {
          kkookkToast.success("로그인 성공");
          onLoginSuccessWithCredentials?.(email, password);
          handleLoginSuccess();
        },
        onError: () => {
          setErrorMessage("로그인 실패: 이메일 또는 비밀번호를 확인해주세요.");
        },
      }
    );
  };

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen p-6 ${isTabletMode ? "w-full" : ""}`}
    >
      <div
        className={`bg-white rounded-3xl shadow-xl p-8 w-full ${isTabletMode ? "max-w-sm border border-slate-100" : "max-w-md border border-slate-200"}`}
      >
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-kkookk-navy">{title}</h2>
          {subtitle && <p className="text-sm text-kkookk-steel">{subtitle}</p>}
        </div>

        <LoginForm
          onSubmit={handleLogin}
          onSwitchToSignup={() => navigate("/owner/signup")}
          isLoading={ownerLogin.isPending}
          error={errorMessage}
        />
      </div>

      <button
        onClick={handleBack}
        className="flex items-center gap-1 mt-4 text-sm text-kkookk-steel hover:text-kkookk-indigo"
      >
        <ChevronLeft size={16} /> 초기 화면으로
      </button>
    </div>
  );
}

export default OwnerLoginPage;
