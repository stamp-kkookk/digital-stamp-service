/**
 * FloatingConsultButton
 * 문의하기 플로팅 버튼 (우측 하단 고정)
 */

import { MessageCircle } from "lucide-react";

interface FloatingConsultButtonProps {
  onOpenContact: () => void;
}

export function FloatingConsultButton({
  onOpenContact,
}: FloatingConsultButtonProps) {
  return (
    <button
      onClick={onOpenContact}
      className="fixed z-50 flex items-center gap-2 rounded-full bg-[#FEE500] px-4 py-3 shadow-lg transition-all duration-300 bottom-4 right-4 hover:scale-105 active:scale-95"
      aria-label="문의하기"
    >
      <MessageCircle className="h-5 w-5 text-[#391B1B]" />
      <span className="text-sm font-semibold text-[#391B1B]">문의하기</span>
    </button>
  );
}
