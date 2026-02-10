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
        placeholder="홍길동"
        icon={<User size={18} />}
        autoComplete="name"
        className="focus:border-indigo-600!"
      />

      <Input
        type="tel"
        label="휴대폰 번호 (인증필요)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="010-0000-0000"
        icon={<Smartphone size={18} />}
        autoComplete="tel"
        className="focus:border-indigo-600!"
      />

      <Input
        type="email"
        label="이메일 주소"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="boss@partner.com"
        icon={<Mail size={18} />}
        autoComplete="email"
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
