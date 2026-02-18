/**
 * OwnerSignupPage
 * 사장님 회원가입 페이지 (회원가입 폼 + OTP 인증)
 */

import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneVerification } from "../components/PhoneVerification";
import { SignupForm } from "../components/SignupForm";
import { useOwnerSignup, useOtpRequest, useOtpVerify } from "../hooks/useAuth";
import { kkookkToast } from "@/components/ui/Toast";

type SignupStep = "form" | "verify";

export function OwnerSignupPage() {
  const navigate = useNavigate();

  const ownerSignup = useOwnerSignup();
  const otpRequest = useOtpRequest();
  const otpVerify = useOtpVerify();

  const [step, setStep] = useState<SignupStep>("form");
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

  const isLoading = ownerSignup.isPending || otpRequest.isPending || otpVerify.isPending;

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
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

    otpRequest.mutate(
      { phone: data.phone },
      {
        onSuccess: (response) => {
          setStep("verify");
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
            ownerSignup.mutate(
              {
                email: signupData.email,
                password: signupData.password,
                name: signupData.name,
                phoneNumber: signupData.phone,
              },
              {
                onSuccess: () => {
                  kkookkToast.success("회원가입이 완료되었습니다", { description: "로그인해주세요." });
                  navigate("/owner/login");
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md border border-slate-200">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-kkookk-navy">사장님 회원가입</h2>
        </div>

        {errorMessage && step === "form" && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm text-center">
            {errorMessage}
          </div>
        )}

        {step === "form" && (
          <SignupForm
            onSubmit={handleSignup}
            onSwitchToLogin={() => navigate("/owner/login")}
            isLoading={isLoading}
          />
        )}

        {step === "verify" && (
          <PhoneVerification
            phone={phone}
            devOtpCode={devOtpCode}
            onVerify={handleVerify}
            onResend={handleResend}
            onBack={() => {
              clearMessages();
              setDevOtpCode("");
              setStep("form");
            }}
            isLoading={isLoading}
            error={errorMessage}
            success={successMessage}
          />
        )}
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

export default OwnerSignupPage;
