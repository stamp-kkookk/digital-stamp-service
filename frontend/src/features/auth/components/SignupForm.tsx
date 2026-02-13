/**
 * SignupForm 컴포넌트
 * 휴대폰 인증이 포함된 사장님 계정 회원가입 폼
 */

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Check, Loader2, Lock, Mail, Smartphone, User } from "lucide-react";
import { useState } from "react";

interface SignupFormProps {
  onSubmit: (data: {
    name: string;
    phone: string;
    email: string;
    password: string;
  }) => void;
  onSwitchToLogin: () => void;
  isLoading?: boolean;
}

const PASSWORD_RULES = [
  { key: "length", label: "8~20자", test: (v: string) => v.length >= 8 && v.length <= 20 },
  { key: "letter", label: "영문 포함", test: (v: string) => /[A-Za-z]/.test(v) },
  { key: "digit", label: "숫자 포함", test: (v: string) => /\d/.test(v) },
  { key: "special", label: "특수문자 포함", test: (v: string) => /[@$!%*#?&]/.test(v) },
] as const;

function isPasswordValid(password: string) {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}

const PHONE_REGEX = /^01[0-9]-\d{3,4}-\d{4}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatPhone(value: string): string {
  const digits = value.replace(/[^0-9]/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function getNameError(name: string, touched: boolean) {
  if (!touched) return undefined;
  if (!name.trim()) return "이름을 입력해주세요";
  if (name.trim().length < 2 || name.trim().length > 20) return "이름은 2~20자여야 합니다";
  return undefined;
}

function getPhoneError(phone: string, touched: boolean) {
  if (!touched || !phone) return undefined;
  if (!PHONE_REGEX.test(phone)) return "올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)";
  return undefined;
}

function getEmailError(email: string, touched: boolean) {
  if (!touched || !email) return undefined;
  if (!EMAIL_REGEX.test(email)) return "올바른 이메일 형식이 아닙니다";
  return undefined;
}

export function SignupForm({
  onSubmit,
  onSwitchToLogin,
  isLoading = false,
}: SignupFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const passwordValid = isPasswordValid(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !passwordValid || !name || !phone) return;
    onSubmit({ name, phone, email, password });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 animate-in fade-in slide-in-from-right-4"
    >
      <Input
        type="text"
        label="이름"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => setNameTouched(true)}
        placeholder="홍길동"
        icon={<User size={18} />}
        autoComplete="name"
        error={getNameError(name, nameTouched)}
        className="focus:border-indigo-600!"
      />

      <Input
        type="tel"
        label="휴대폰 번호 (인증필요)"
        value={phone}
        onChange={(e) => setPhone(formatPhone(e.target.value))}
        onBlur={() => setPhoneTouched(true)}
        placeholder="010-0000-0000"
        icon={<Smartphone size={18} />}
        autoComplete="tel"
        error={getPhoneError(phone, phoneTouched)}
        className="focus:border-indigo-600!"
      />

      <Input
        type="email"
        label="이메일 주소"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => setEmailTouched(true)}
        placeholder="boss@partner.com"
        icon={<Mail size={18} />}
        autoComplete="email"
        error={getEmailError(email, emailTouched)}
        className="focus:border-indigo-600!"
      />

      <div>
        <Input
          type="password"
          label="비밀번호"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (!passwordTouched) setPasswordTouched(true);
          }}
          placeholder="영문, 숫자, 특수문자 포함 8자 이상"
          icon={<Lock size={18} />}
          autoComplete="new-password"
          className="focus:border-indigo-600!"
        />
        {passwordTouched && password.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2 px-1">
            {PASSWORD_RULES.map((rule) => {
              const pass = rule.test(password);
              return (
                <span
                  key={rule.key}
                  className={`inline-flex items-center gap-1 text-xs font-medium transition-colors ${
                    pass ? "text-emerald-600" : "text-slate-400"
                  }`}
                >
                  <Check
                    size={12}
                    className={pass ? "opacity-100" : "opacity-0"}
                  />
                  {rule.label}
                </span>
              );
            })}
          </div>
        )}
      </div>

      <Button
        type="submit"
        variant="secondary"
        size="full"
        disabled={isLoading || !name || !phone || !email || !passwordValid}
        className="mt-4"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            처리 중...
          </>
        ) : (
          "인증번호 받기"
        )}
      </Button>

      <div className="mt-2 text-center">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-sm text-kkookk-steel hover:text-kkookk-indigo"
        >
          이미 계정이 있으신가요? <b className="underline">로그인</b>
        </button>
      </div>
    </form>
  );
}

export default SignupForm;
