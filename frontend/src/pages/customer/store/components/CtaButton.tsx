interface CtaButtonProps {
  isAuthenticated: boolean;
  hasWallet: boolean;
}

const CtaButton = ({ isAuthenticated, hasWallet }: CtaButtonProps) => {
  const getButtonText = () => {
    if (!isAuthenticated) {
      return '로그인하고 스탬프 시작하기';
    }
    if (!hasWallet) {
      return '내 스탬프 카드 만들기';
    }
    return '내 스탬프 현황 보기';
  };

  const handleClick = () => {
    // TODO: 각 상태에 맞는 라우팅 또는 액션 실행
    alert(`TODO: "${getButtonText()}" 기능 구현`);
  };

  return (
    <button
      onClick={handleClick}
      className="w-full rounded-lg bg-blue-600 px-4 py-3 font-bold text-white shadow-md transition-transform duration-200 hover:scale-105 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
    >
      {getButtonText()}
    </button>
  );
};

export default CtaButton;
