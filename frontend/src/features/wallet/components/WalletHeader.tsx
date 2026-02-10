/**
 * WalletHeader 컴포넌트
 * 메뉴 토글이 있는 지갑 페이지 헤더
 */

import { Menu } from 'lucide-react';

interface WalletHeaderProps {
  title?: string;
  onMenuClick: () => void;
}

export function WalletHeader({
  title = '내 지갑',
  onMenuClick,
}: WalletHeaderProps) {
  return (
    <div className="flex justify-between items-center px-6 pt-12 pb-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <h1 className="text-2xl font-bold text-kkookk-navy">{title}</h1>
      <button
        onClick={onMenuClick}
        className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-kkookk-navy hover:bg-slate-50 transition-colors"
        title="메뉴 열기"
        aria-label="메뉴 열기"
      >
        <Menu size={20} />
      </button>
    </div>
  );
}

export default WalletHeader;
