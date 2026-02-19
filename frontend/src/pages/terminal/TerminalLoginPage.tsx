/**
 * TerminalLoginPage
 * 매장용 태블릿 로그인 페이지
 * 로그인 성공 후 매장 선택 화면으로 이동
 * 비밀번호를 sessionStorage에 임시 저장하여 매장 선택 시 터미널 JWT 발급에 사용
 */

import { OwnerLoginPage } from "@/features/auth/pages/OwnerLoginPage";
import { useNavigate } from "react-router-dom";
import { setTerminalCredentials } from "./terminalCredentials";

export function TerminalLoginPage() {
  const navigate = useNavigate();

  const handleCredentials = (email: string, password: string) => {
    setTerminalCredentials(email, password);
  };

  const handleLoginSuccess = () => {
    navigate("/terminal/stores");
  };

  return (
    <OwnerLoginPage
      title="매장용 태블릿"
      subtitle=""
      onLoginSuccessWithCredentials={handleCredentials}
      onLoginSuccess={handleLoginSuccess}
      onBack={() => navigate("/simulation")}
      isTabletMode
    />
  );
}

export default TerminalLoginPage;
