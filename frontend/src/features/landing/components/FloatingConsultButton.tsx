/**
 * FloatingConsultButton
 * 오픈카카오톡 상담 버튼 (우측 하단 고정)
 */

export function FloatingConsultButton() {
  return (
    <a
      href="https://open.kakao.com/o/gqnX1Qei"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed z-50 transition-all duration-300 bottom-4 right-4 hover:scale-110 active:scale-95 md:bottom-4 md:right-4"
      aria-label="카카오톡 상담하기"
    >
      <img src="/image/consult_small_yellow_pc.png" alt="상담하기" />
    </a>
  );
}
