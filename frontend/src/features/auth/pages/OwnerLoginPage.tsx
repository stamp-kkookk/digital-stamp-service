/**
 * OwnerLoginPage
 * 사장님/백오피스 인증을 위한 로그인 페이지
 */

import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "../components/LoginForm";
import { PhoneVerification } from "../components/PhoneVerification";
import { SignupForm } from "../components/SignupForm";
import { useOwnerLogin, useOwnerSignup, useOtpRequest, useOtpVerify } from "../hooks/useAuth";
import { useAuth } from "@/app/providers/AuthProvider";
import type { AuthMode } from "../types";

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

  // API Hooks
  const ownerLogin = useOwnerLogin();
  const ownerSignup = useOwnerSignup();
  const otpRequest = useOtpRequest();
  const otpVerify = useOtpVerify();

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
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [phone, setPhone] = useState("");
  const [signupData, setSignupData] = useState<{
    name: string;
    phone: string;
    email: string;
    password: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [devOtpCode, setDevOtpCode] = useState("");

  const isLoading = ownerLogin.isPending || ownerSignup.isPending || otpRequest.isPending || otpVerify.isPending;

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleLogin = (email: string, password: string) => {
    clearMessages();
    ownerLogin.mutate(
      { email, password },
      {
        onSuccess: () => {
          onLoginSuccessWithCredentials?.(email, password);
          handleLoginSuccess();
        },
        onError: () => {
          setErrorMessage("로그인 실패: 이메일 또는 비밀번호를 확인해주세요.");
        },
      }
    );
  };

  const handleSignup = (data: {
    name: string;
    phone: string;
    email: string;
    password: string;
  }) => {
    clearMessages();
    setPhone(data.phone);
    setSignupData(data);

    // OTP 요청
    otpRequest.mutate(
      { phone: data.phone },
      {
        onSuccess: (response) => {
          setAuthMode("verify");
          if (response.devOtpCode) {
            setDevOtpCode(response.devOtpCode);
          }
        },
        onError: () => {
          setErrorMessage("인증번호 발송 실패. 잠시 후 다시 시도해주세요.");
        },
      }
    );
  };

  const handleVerify = (code: string) => {
    if (!signupData) return;
    clearMessages();

    otpVerify.mutate(
      { phone, code },
      {
        onSuccess: (response) => {
          if (response.verified) {
            // OTP 인증 성공 후 회원가입 진행
            ownerSignup.mutate(
              {
                email: signupData.email,
                password: signupData.password,
                name: signupData.name,
                phoneNumber: signupData.phone,
              },
              {
                onSuccess: () => {
                  setSuccessMessage("회원가입이 완료되었습니다. 로그인해주세요.");
                  setDevOtpCode("");
                  setAuthMode("login");
                  setSignupData(null);
                },
                onError: () => {
                  setErrorMessage("회원가입 실패. 이미 등록된 이메일일 수 있습니다.");
                },
              }
            );
          } else {
            setErrorMessage("인증번호가 일치하지 않습니다.");
          }
        },
        onError: () => {
          setErrorMessage("인증 실패. 인증번호를 확인해주세요.");
        },
      }
    );
  };

  const handleResend = () => {
    clearMessages();
    otpRequest.mutate(
      { phone },
      {
        onSuccess: (response) => {
          if (response.devOtpCode) {
            setDevOtpCode(response.devOtpCode);
          }
          setSuccessMessage(`인증번호가 ${phone}로 재발송되었습니다.`);
        },
        onError: () => {
          setErrorMessage("인증번호 재발송 실패. 1분 후 다시 시도해주세요.");
        },
      }
    );
  };

  const handleSwitchMode = (mode: AuthMode) => {
    clearMessages();
    setDevOtpCode("");
    setAuthMode(mode);
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

        {errorMessage && authMode === "signup" && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm text-center">
            {errorMessage}
          </div>
        )}
        {successMessage && authMode !== "verify" && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-600 text-sm text-center">
            {successMessage}
          </div>
        )}

        {authMode === "login" && (
          <LoginForm
            onSubmit={handleLogin}
            onSwitchToSignup={() => handleSwitchMode("signup")}
            isLoading={isLoading}
            error={errorMessage}
          />
        )}

        {authMode === "signup" && (
          <SignupForm
            onSubmit={handleSignup}
            onSwitchToLogin={() => handleSwitchMode("login")}
            isLoading={isLoading}
          />
        )}

        {authMode === "verify" && (
          <PhoneVerification
            phone={phone}
            devOtpCode={devOtpCode}
            onVerify={handleVerify}
            onResend={handleResend}
            onBack={() => handleSwitchMode("signup")}
            isLoading={isLoading}
            error={errorMessage}
            success={successMessage}
          />
        )}
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
