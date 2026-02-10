/**
 * CustomerSignupForm 컴포넌트
 * OTP 인증을 포함한 신규 고객 회원가입 폼
 */

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useNavigate } from "react-router-dom";
import { useCustomerNavigate, saveOriginStoreId } from "@/hooks/useCustomerNavigate";
import { useAuth } from "@/app/providers/AuthProvider";
import { useOtpRequest, useOtpVerify, useWalletRegister } from "@/features/auth/hooks/useAuth";
import { Check, ChevronLeft, Sparkles } from "lucide-react";
import { useState } from "react";

type SignupStep = "input" | "otp" | "success";

export function CustomerSignupForm() {
  const navigate = useNavigate();
  const { storeId, customerNavigate } = useCustomerNavigate();
  const { refreshAuthState } = useAuth();
  const [step, setStep] = useState<SignupStep>("input");
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);

  const otpRequest = useOtpRequest();
  const otpVerify = useOtpVerify();
  const walletRegister = useWalletRegister();

  // 폼 유효성 검사
  const isBasicInfoValid =
    name.trim() !== "" && nickname.trim() !== "" && phone.trim() !== "";
  const isOtpValid = otp.trim().length === 6;

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBasicInfoValid) return;
    setError(null);

    otpRequest.mutate(
      { phone },
      {
        onSuccess: (response) => {
          setStep("otp");
          // Dev convenience: auto-fill OTP code in dev mode
          if (response.devOtpCode) {
            setOtp(response.devOtpCode);
          }
        },
        onError: () => {
          setError("1분 후 다시 시도해주세요.");
        },
      }
    );
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setError(null);

    otpVerify.mutate(
      { phone, code: otp },
      {
        onSuccess: (response) => {
          if (!response.verified) {
            setError("인증번호가 올바르지 않습니다.");
            return;
          }
          // OTP verified → register wallet
          walletRegister.mutate(
            { phone, name, nickname, storeId: storeId ? Number(storeId) : undefined },
            {
              onSuccess: () => {
                if (storeId) saveOriginStoreId(storeId);
                refreshAuthState();
                setStep("success");
              },
              onError: () => {
                setError("이미 등록된 번호입니다.");
              },
            }
          );
        },
        onError: () => {
          setError("인증번호가 올바르지 않습니다.");
        },
      }
    );
  };

  const isVerifying = otpVerify.isPending || walletRegister.isPending;

  if (step === "success") {
    return (
      <div className="flex flex-col h-full p-6 bg-white">
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="flex items-center justify-center w-24 h-24 mb-8 duration-300 bg-green-100 rounded-full animate-in zoom-in">
            <Check size={48} className="text-green-600" strokeWidth={3} />
          </div>
          <h2 className="mb-3 text-2xl font-bold text-center delay-100 text-kkookk-navy animate-in fade-in slide-in-from-bottom-4">
            환영합니다!
            <br />
            멤버십이 생성되었어요.
          </h2>
          <p className="text-center delay-200 text-kkookk-steel animate-in fade-in slide-in-from-bottom-4">
            이제 스탬프를 적립하고
            <br />
            다양한 혜택을 받아보세요.
          </p>
        </div>

        <div className="w-full pb-8 delay-300 animate-in fade-in slide-in-from-bottom-4">
          <Button
            onClick={() => navigate("/customer/wallet")}
            variant="primary"
            size="full"
            className="shadow-lg shadow-orange-200"
          >
            <Sparkles size={20} className="text-white" />내 지갑 확인하기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6 pt-12 bg-white">
      <div className="flex items-center mb-6 -ml-2">
        <button
          onClick={() => {
            setError(null);
            if (step === "otp") {
              setStep("input");
              setOtp("");
            } else {
              customerNavigate("/");
            }
          }}
          className="p-2 text-kkookk-steel"
          aria-label="뒤로 가기"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      <h2 className="mb-2 text-2xl font-bold text-kkookk-navy">
        첫 방문이시군요!
        <br />
        멤버십을 만들어드릴게요.
      </h2>

      {step === "input" ? (
        <form onSubmit={handleRequestOtp} className="mt-8 space-y-4">
          <Input
            type="text"
            label="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="홍길동"
            autoComplete="name"
          />

          <Input
            type="text"
            label="닉네임 (매장에서 불릴 이름)"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="길동이"
          />

          <Input
            type="tel"
            label="휴대폰 번호"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="010-0000-0000"
            autoComplete="tel"
          />

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="full"
            disabled={!isBasicInfoValid || otpRequest.isPending}
            isLoading={otpRequest.isPending}
            className="mt-4"
          >
            인증번호 받기
          </Button>
        </form>
      ) : (
        <form
          onSubmit={handleVerifyOtp}
          className="mt-8 space-y-6 animate-in fade-in slide-in-from-right-4"
        >
          <p className="text-sm text-kkookk-steel">
            입력하신 번호로 인증번호를 보냈어요.
          </p>

          <Input
            type="text"
            label="인증번호 6자리"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="123456"
            className="font-mono text-lg tracking-widest text-center"
            maxLength={6}
            inputMode="numeric"
            autoComplete="one-time-code"
          />

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="full"
            disabled={!isOtpValid || isVerifying}
            isLoading={isVerifying}
            className="mt-4"
          >
            인증 완료하고 시작하기
          </Button>
        </form>
      )}
    </div>
  );
}

export default CustomerSignupForm;
