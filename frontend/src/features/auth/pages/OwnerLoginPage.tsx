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

  const isLoading = ownerLogin.isPending || ownerSignup.isPending || otpRequest.isPending || otpVerify.isPending;

  const handleLogin = (email: string, password: string) => {
    ownerLogin.mutate(
      { email, password },
      {
        onSuccess: () => {
          onLoginSuccessWithCredentials?.(email, password);
          handleLoginSuccess();
        },
        onError: (error) => {
          alert("로그인 실패: 이메일 또는 비밀번호를 확인해주세요.");
          console.error("Login error:", error);
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
    setPhone(data.phone);
    setSignupData(data);

    // OTP 요청
    otpRequest.mutate(
      { phone: data.phone },
      {
        onSuccess: (response) => {
          setAuthMode("verify");
          if (response.devOtpCode) {
            alert(`[개발용 인증번호]\n${data.phone}로 인증번호 ${response.devOtpCode}을 보냈습니다.`);
          } else {
            alert(`인증번호가 ${data.phone}로 발송되었습니다.`);
          }
        },
        onError: (error) => {
          alert("인증번호 발송 실패. 잠시 후 다시 시도해주세요.");
          console.error("OTP request error:", error);
        },
      }
    );
  };

  const handleVerify = (code: string) => {
    if (!signupData) return;

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
                  alert("회원가입이 완료되었습니다. 로그인해주세요.");
                  setAuthMode("login");
                  setSignupData(null);
                },
                onError: (error) => {
                  alert("회원가입 실패. 이미 등록된 이메일일 수 있습니다.");
                  console.error("Signup error:", error);
                },
              }
            );
          } else {
            alert("인증번호가 일치하지 않습니다.");
          }
        },
        onError: (error) => {
          alert("인증 실패. 인증번호를 확인해주세요.");
          console.error("OTP verify error:", error);
        },
      }
    );
  };

  const handleResend = () => {
    otpRequest.mutate(
      { phone },
      {
        onSuccess: (response) => {
          if (response.devOtpCode) {
            alert(`[개발용 인증번호]\n${phone}로 인증번호 ${response.devOtpCode}을 재발송했습니다.`);
          } else {
            alert(`인증번호가 ${phone}로 재발송되었습니다.`);
          }
        },
        onError: () => {
          alert("인증번호 재발송 실패. 1분 후 다시 시도해주세요.");
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

        {authMode === "login" && (
          <LoginForm
            onSubmit={handleLogin}
            onSwitchToSignup={() => setAuthMode("signup")}
            isLoading={isLoading}
          />
        )}

        {authMode === "signup" && (
          <SignupForm
            onSubmit={handleSignup}
            onSwitchToLogin={() => setAuthMode("login")}
            isLoading={isLoading}
          />
        )}

        {authMode === "verify" && (
          <PhoneVerification
            phone={phone}
            onVerify={handleVerify}
            onResend={handleResend}
            onBack={() => setAuthMode("signup")}
            isLoading={isLoading}
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
