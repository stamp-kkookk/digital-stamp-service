/**
 * OAuthCompleteSignupForm
 * 2nd step form for OAuth new users (name, nickname, phone)
 * Renders content only — parent page provides the container/layout
 */

import { useAuth } from "@/app/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { kkookkToast } from "@/components/ui/Toast";
import { checkNickname, checkPhone } from "@/features/auth/api/authApi";
import {
  useOAuthCompleteCustomerSignup,
  useOAuthCompleteOwnerSignup,
} from "@/features/auth/hooks/useOAuth";
import {
  saveOriginStoreId,
  useCustomerNavigate,
} from "@/hooks/useCustomerNavigate";
import {
  formatPhoneNumber,
  hasInvalidPhoneChars,
  stripPhoneToDigits,
} from "@/lib/utils/format";
import type { ErrorResponse } from "@/types/api";
import type { AxiosError } from "axios";
import { Check, Sparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export interface SignupLocationState {
  tempToken: string;
  oauthName?: string;
  oauthEmail?: string;
  provider?: string;
  showSignup?: boolean;
}

type Step = "input" | "success";

interface OAuthCompleteSignupFormProps {
  userRole: "customer" | "owner";
  signupState: SignupLocationState;
}

export function OAuthCompleteSignupForm({
  userRole,
  signupState,
}: OAuthCompleteSignupFormProps) {
  const navigate = useNavigate();
  const { storeId } = useCustomerNavigate();
  const { refreshAuthState } = useAuth();

  const [step, setStep] = useState<Step>("input");
  const [name, setName] = useState(signupState.oauthName ?? "");
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);

  const customerSignup = useOAuthCompleteCustomerSignup();
  const ownerSignup = useOAuthCompleteOwnerSignup();

  const phoneDigitCount = stripPhoneToDigits(phone).length;
  const isPhoneComplete = phoneDigitCount >= 10 && phoneDigitCount <= 11;
  const isFormValid =
    name.trim() !== "" &&
    nickname.trim() !== "" &&
    isPhoneComplete &&
    !phoneError &&
    !nameError &&
    !nicknameError;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    if (hasInvalidPhoneChars(rawValue)) {
      setPhoneError("숫자만 입력해주세요");
    } else {
      setPhoneError(null);
    }
    setPhone(formatPhoneNumber(rawValue));
  };

  const handleNicknameBlur = async () => {
    if (!nickname.trim()) return;
    setNicknameError(null);
    try {
      const result = await checkNickname(nickname.trim());
      if (!result.available) {
        setNicknameError("이미 사용 중인 닉네임입니다");
      }
    } catch {
      // ignore
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setError(null);
    setPhoneError(null);

    const phoneDigits = stripPhoneToDigits(phone);

    // Phone duplicate check
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

    const onSuccess = () => {
      refreshAuthState();
      kkookkToast.success("회원가입이 완료되었습니다");
      setStep("success");
    };

    const onError = (err: unknown) => {
      const axiosError = err as AxiosError<ErrorResponse>;
      const errorCode = axiosError?.response?.data?.code;
      if (errorCode === "WALLET_002") {
        setNicknameError("이미 사용 중인 닉네임입니다");
      } else if (errorCode === "WALLET_001") {
        setPhoneError("이미 등록된 번호입니다");
      } else {
        setError("가입에 실패했습니다. 다시 시도해주세요.");
      }
    };

    if (userRole === "customer") {
      customerSignup.mutate(
        {
          tempToken: signupState.tempToken,
          name: name.trim(),
          nickname: nickname.trim(),
          phone: phoneDigits,
          storeId: storeId ? Number(storeId) : undefined,
        },
        { onSuccess, onError },
      );
    } else {
      ownerSignup.mutate(
        {
          tempToken: signupState.tempToken,
          name: name.trim(),
          nickname: nickname.trim(),
          phone: phoneDigits,
        },
        { onSuccess, onError },
      );
    }
  };

  const isPending = customerSignup.isPending || ownerSignup.isPending;

  if (step === "success") {
    const isCustomer = userRole === "customer";
    return (
      <>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="flex items-center justify-center w-20 h-20 mb-6 duration-300 bg-green-100 rounded-full animate-in zoom-in">
            <Check size={40} className="text-green-600" strokeWidth={3} />
          </div>
          <h2 className="mb-3 text-xl font-bold text-center text-kkookk-navy">
            환영합니다!
            <br />
            {isCustomer
              ? "멤버십이 생성되었어요."
              : "사장님 계정이 생성되었어요."}
          </h2>
          <p className="text-sm text-center text-kkookk-steel whitespace-pre-line">
            {isCustomer
              ? "이제 스탬프를 적립하고\n다양한 혜택을 받아보세요."
              : "매장을 등록하고\n스탬프 카드를 만들어보세요."}
          </p>
        </div>
        <Button
          onClick={() => {
            if (isCustomer) {
              if (storeId) saveOriginStoreId(storeId);
              navigate("/customer/wallet");
            } else {
              navigate("/owner/stores");
            }
          }}
          variant="primary"
          size="full"
          className="shadow-lg shadow-orange-200"
        >
          <Sparkles size={20} className="text-white" />
          {isCustomer ? "내 지갑 확인하기" : "백오피스 시작하기"}
        </Button>
      </>
    );
  }

  return (
    <>
      <p className="mb-1 text-sm font-medium text-kkookk-orange-500">
        처음 방문하셨네요!
      </p>
      <h2 className="mb-2 text-xl font-bold text-kkookk-navy">
        거의 다 왔어요!
        <br />
        추가 정보를 입력해주세요.
      </h2>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
        />

        <Input
          type="text"
          label={role === "customer" ? "닉네임 (매장에서 불릴 이름)" : "닉네임"}
          value={nickname}
          onChange={(e) => {
            setNickname(e.target.value);
            if (nicknameError) setNicknameError(null);
          }}
          onBlur={handleNicknameBlur}
          placeholder="길동이"
          error={nicknameError ?? undefined}
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
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button
          type="submit"
          variant="primary"
          size="full"
          disabled={!isFormValid || isCheckingPhone || isPending}
          isLoading={isCheckingPhone || isPending}
          className="mt-4"
        >
          가입 완료
        </Button>
      </form>
    </>
  );
}
