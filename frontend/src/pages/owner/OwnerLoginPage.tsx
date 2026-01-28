import { useNavigate } from 'react-router-dom';
import AuthLayout from '../terminal/components/AuthLayout';
import OwnerLoginForm from '../terminal/components/login/OwnerLoginForm';
import { useOwnerLoginMutation } from '../terminal/hooks/useOwnerLoginMutation';
import type { TerminalLoginRequest } from '../terminal/types';

const OwnerLoginPage = () => {
  const navigate = useNavigate();
  const { mutate, isPending, error } = useOwnerLoginMutation();

  const handleLogin = (data: TerminalLoginRequest) => {
    mutate(data, {
      onSuccess: () => {
        // 로그인 성공 시 매장 목록 페이지로 이동
        navigate('/owner/stores');
      },
      // onError는 useMutation 훅에서 이미 콘솔 로그로 처리
      // 추가적인 UI 피드백은 error 객체를 사용하여 OwnerLoginForm에서 처리
    });
  };

  const errorMessage = error?.message === 'Request failed with status code 401'
    ? '아이디 또는 비밀번호가 올바르지 않습니다.'
    : error?.message;

  return (
    <AuthLayout
      title="KKOOKK OWNER"
      subtitle="사장님 계정으로 백오피스 관리를 시작하세요."
    >
      <OwnerLoginForm
        onSubmit={handleLogin}
        isPending={isPending}
        error={errorMessage}
      />
    </AuthLayout>
  );
};

export default OwnerLoginPage;
