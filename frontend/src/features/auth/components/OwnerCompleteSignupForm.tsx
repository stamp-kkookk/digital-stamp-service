/**
 * OwnerCompleteSignupForm
 * 사장님 전용 OAuth 2차 가입 폼 (파란색 테마)
 * 이메일(프리필/읽기전용), 이름(프리필), 전화번호
 */

import { useAuth } from "@/app/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { kkookkToast } from "@/components/ui/Toast";
import { checkPhone } from "@/features/auth/api/authApi";
import { useOAuthCompleteOwnerSignup } from "@/features/auth/hooks/useOAuth";
import {
  formatPhoneNumber,
  hasInvalidPhoneChars,
  stripPhoneToDigits,
} from "@/lib/utils/format";
import type { ErrorResponse } from "@/types/api";
import type { AxiosError } from "axios";
import { Briefcase, Check } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { SignupLocationState } from "./OAuthCompleteSignupForm";

type Step = "input" | "success";

interface OwnerCompleteSignupFormProps {
  signupState: SignupLocationState;
}

export function OwnerCompleteSignupForm({
  signupState,
}: OwnerCompleteSignupFormProps) {
  const navigate = useNavigate();
  const { refreshAuthState } = useAuth();

  const [step, setStep] = useState<Step>("input");
  const [name, setName] = useState(signupState.oauthName ?? "");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);

  const ownerSignup = useOAuthCompleteOwnerSignup();

  const phoneDigitCount = stripPhoneToDigits(phone).length;
  const isPhoneComplete = phoneDigitCount >= 10 && phoneDigitCount <= 11;
  const isFormValid =
    name.trim() !== "" && isPhoneComplete && !phoneError && !nameError;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    if (hasInvalidPhoneChars(rawValue)) {
      setPhoneError("숫자만 입력해주세요");
    } else {
      setPhoneError(null);
    }
    setPhone(formatPhoneNumber(rawValue));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setError(null);
    setPhoneError(null);

    const phoneDigits = stripPhoneToDigits(phone);

    setIsCheckingPhone(true);
    try {
      const result = await checkPhone(phoneDigits);
      if (!result.available) {
        setPhoneError("이미 등록된 번호입니다");
        setIsCheckingPhone(false);
        return;
      }
    } catch {
      // proceed
    }
    setIsCheckingPhone(false);

    ownerSignup.mutate(
      {
        tempToken: signupState.tempToken,
        name: name.trim(),
        phone: phoneDigits,
      },
      {
        onSuccess: () => {
          refreshAuthState();
          kkookkToast.success("사장님 계정이 생성되었습니다");
          setStep("success");
        },
        onError: (err: unknown) => {
          const axiosError = err as AxiosError<ErrorResponse>;
          const errorCode = axiosError?.response?.data?.code;
          if (errorCode === "WALLET_001") {
            setPhoneError("이미 등록된 번호입니다");
          } else {
            setError("가입에 실패했습니다. 다시 시도해주세요.");
          }
        },
      },
    );
  };

  if (step === "success") {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="flex items-center justify-center w-20 h-20 mb-6 duration-300 bg-kkookk-indigo-100 rounded-full animate-in zoom-in">
            <Check
              size={40}
              className="text-kkookk-indigo-500"
              strokeWidth={3}
            />
          </div>
          <h2 className="mb-3 text-xl font-bold text-center text-kkookk-navy">
            환영합니다!
            <br />
            사장님 계정이 생성되었어요.
          </h2>
          <p className="text-sm text-center text-kkookk-steel whitespace-pre-line">
            {"매장을 등록하고\n스탬프 카드를 만들어보세요."}
          </p>
        </div>
        <Button
          onClick={() => navigate("/owner/stores")}
          variant="secondary"
          size="full"
        >
          <Briefcase size={20} className="text-white" />
          백오피스 시작하기
        </Button>
      </>
    );
  }

  return (
    <>
      <p className="mb-1 text-sm font-medium text-kkookk-indigo-500">
        처음 방문하셨네요!
      </p>
      <h2 className="mb-2 text-xl font-bold text-kkookk-navy">
        거의 다 왔어요!
        <br />
        추가 정보를 입력해주세요.
      </h2>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          type="email"
          label="이메일"
          value={signupState.oauthEmail ?? ""}
          disabled
          className="bg-slate-50 text-kkookk-steel cursor-not-allowed"
        />

        <Input
          type="text"
          label="이름"
          value={name}
          onChange={(e) => {
            const value = e.target.value;
            setName(value);
            if (/[0-9]/.test(value)) {
              setNameError("이름에는 숫자를 입력할 수 없어요.");
            } else {
              setNameError(null);
            }
          }}
          placeholder="홍길동"
          autoComplete="name"
          error={nameError ?? undefined}
          className="focus:border-kkookk-indigo-500"
        />

        <Input
          type="tel"
          label="휴대폰 번호"
          value={phone}
          onChange={handlePhoneChange}
          placeholder="010-0000-0000"
          autoComplete="tel"
          maxLength={13}
          error={phoneError ?? undefined}
          className="focus:border-kkookk-indigo-500"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button
          type="submit"
          variant="secondary"
          size="full"
          disabled={!isFormValid || isCheckingPhone || ownerSignup.isPending}
          isLoading={isCheckingPhone || ownerSignup.isPending}
          className="mt-4"
        >
          가입 완료
        </Button>
      </form>
    </>
  );
}
