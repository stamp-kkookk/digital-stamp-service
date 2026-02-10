/**
 * LoginForm 컴포넌트
 * 사장님 계정용 이메일/비밀번호 로그인 폼
 */

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader2, Lock, Mail } from "lucide-react";
import { useState } from "react";

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  onSwitchToSignup: () => void;
  isLoading?: boolean;
}

export function LoginForm({
  onSubmit,
  onSwitchToSignup,
  isLoading = false,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    onSubmit(email, password);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 animate-in fade-in slide-in-from-bottom-4"
    >
      <Input
        type="email"
        label="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="boss@partner.com"
        icon={<Mail size={18} />}
        autoComplete="email"
        className="focus:border-indigo-600!"
      />

      <Input
        type="password"
        label="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        icon={<Lock size={18} />}
        autoComplete="current-password"
        className="focus:border-indigo-600!"
      />

      <Button
        type="submit"
        variant="secondary"
        size="full"
        disabled={isLoading || !email || !password}
        className="mt-4"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            로그인 중...
          </>
        ) : (
          "로그인"
        )}
      </Button>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="text-sm text-kkookk-steel hover:text-indigo-600 decoration-slate-300 "
        >
          아직 계정이 없으신가요? <b className="underline">회원가입</b>
        </button>
      </div>
    </form>
  );
}

export default LoginForm;
