/**
 * ContactModal
 * 문의하기 모달 - 카카오톡 상담 + 이메일 문의 2채널
 */

import { AnimatePresence, motion } from "framer-motion";
import { Mail, MessageCircle, X } from "lucide-react";
import { useEffect, useRef } from "react";

const KAKAO_OPEN_CHAT_URL = "https://open.kakao.com/o/gqnX1Qei";
const CONTACT_EMAIL = "contact@kkookk.io";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const focusableEls = modalRef.current.querySelectorAll<HTMLElement>(
      'button, a[href], [tabindex]:not([tabindex="-1"])',
    );
    const firstEl = focusableEls[0];
    const lastEl = focusableEls[focusableEls.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl?.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTab);
    firstEl?.focus();

    return () => document.removeEventListener("keydown", handleTab);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-label="문의하기"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-md rounded-t-3xl bg-white px-6 pb-8 pt-6 shadow-2xl md:rounded-3xl"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              aria-label="닫기"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-kkookk-navy">문의하기</h2>
              <p className="mt-1 text-kkookk-steel">
                궁금한 점을 편하게 물어보세요
              </p>
            </div>

            {/* Channel buttons */}
            <div className="flex flex-col gap-3">
              {/* KakaoTalk */}
              <a
                href={KAKAO_OPEN_CHAT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-2xl bg-[#FEE500] px-5 py-4 text-[#391B1B] transition-all hover:brightness-95 active:scale-[0.98]"
              >
                <MessageCircle className="h-6 w-6 flex-shrink-0" />
                <div>
                  <p className="font-semibold">카카오톡 상담</p>
                  <p className="text-sm opacity-70">가장 빠른 상담 채널</p>
                </div>
              </a>

              {/* Email */}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-kkookk-navy transition-all hover:bg-gray-50 active:scale-[0.98]"
              >
                <Mail className="h-6 w-6 flex-shrink-0" />
                <div>
                  <p className="font-semibold">이메일 문의</p>
                  <p className="text-sm text-kkookk-steel">{CONTACT_EMAIL}</p>
                </div>
              </a>
            </div>

            {/* Operating hours */}
            <p className="mt-5 text-center text-sm text-kkookk-steel">
              평일 09:00 - 18:00 운영
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
