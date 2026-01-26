import { useNavigate } from 'react-router-dom';
import AuthLayout from './components/AuthLayout';
import TerminalLoginForm from './components/login/TerminalLoginForm';
import { useOwnerLoginMutation } from './hooks/useOwnerLoginMutation';
import type { TerminalLoginRequest } from './types';

const TerminalLoginPage = () => {
  const navigate = useNavigate();
  const { mutate, isPending, error } = useOwnerLoginMutation();

  const handleLogin = (data: TerminalLoginRequest) => {
    mutate(data, {
      onSuccess: () => {
        // 로그인 성공 시 매장 선택 페이지로 이동
        navigate('/t/stores');
      },
      // onError는 useMutation 훅에서 이미 콘솔 로그로 처리
      // 추가적인 UI 피드백은 error 객체를 사용하여 TerminalLoginForm에서 처리
    });
  };

  const errorMessage = error?.message === 'Request failed with status code 401' 
    ? '아이디 또는 비밀번호가 올바르지 않습니다.'
    : error?.message;

  return (
    <AuthLayout
      title="KKOOKK TERMINAL"
      subtitle="사장님 계정으로 단말기 운영을 시작하세요."
    >
      <TerminalLoginForm
        onSubmit={handleLogin}
        isPending={isPending}
        error={errorMessage}
      />
    </AuthLayout>
  );
};

export default TerminalLoginPage;
