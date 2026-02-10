/**
 * GuaranteeSection
 * Security features showcase - "걱정 없이 시작하세요"
 * Editorial-industrial aesthetic with UI screenshot thumbnails
 */

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check, X } from "lucide-react";
import { useEffect, useState } from "react";

// Mock data for realistic UI thumbnails - Compact 8 rows
const MOCK_LOG_DATA = [
  {
    time: "14:32",
    user: "김민수",
    phone: "010-****-5678",
    action: "스탬프 +2개",
    status: "approved",
  },
  {
    time: "14:28",
    user: "이지은",
    phone: "010-****-9012",
    action: "리워드 사용",
    status: "approved",
  },
  {
    time: "14:15",
    user: "박철수",
    phone: "010-****-3456",
    action: "스탬프 +1개",
    status: "rejected",
  },
  {
    time: "14:05",
    user: "최수진",
    phone: "010-****-7890",
    action: "스탬프 +3개",
    status: "approved",
  },
];

export function GuaranteeSection() {
  // TTL countdown state
  const [countdown, setCountdown] = useState(3);
  const [isFailed, setIsFailed] = useState(false);

  useEffect(() => {
    if (countdown > 0 && !isFailed) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !isFailed) {
      // Wait a moment before showing failure
      const failTimer = setTimeout(() => setIsFailed(true), 500);
      return () => clearTimeout(failTimer);
    } else if (isFailed) {
      // Wait 5 seconds on failure screen, then restart
      const restartTimer = setTimeout(() => {
        setCountdown(3);
        setIsFailed(false);
      }, 5000);
      return () => clearTimeout(restartTimer);
    }
  }, [countdown, isFailed]);

  const formatTime = (seconds: number) => {
    return `00:0${seconds}`;
  };

  return (
    <section id="guarantee" className="relative min-h-screen snap-start overflow-hidden bg-white">
      {/* Noise texture overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      />

      <div className="flex flex-col justify-center min-h-screen py-16 md:py-20">
        <div className="px-6 mx-auto max-w-7xl">
        {/* Editorial Header - Centered */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl mx-auto mb-20 text-center"
        >
          {/* Extreme headline scale */}
          <h2 className="mb-6 text-3xl sm:text-4xl md:text-5xl font-bold text-kkookk-navy">
            걱정 없이 시작하세요
          </h2>

          {/* Generous line-height for subheading */}
          <p className="text-lg sm:text-xl md:text-2xl text-kkookk-steel break-keep">
            사장님의 비즈니스를 안전하게 지킵니다
          </p>
        </motion.div>

        {/* Screenshot Grid - New Layout */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:grid-rows-2 md:auto-rows-fr">
          {/* 1. Log Table - Left side, tall (2 rows) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-5 md:row-span-2"
          >
            <div className="relative h-full overflow-hidden transition-all duration-500 bg-white border-2 rounded-none group border-kkookk-navy-100 hover:border-kkookk-indigo-500 hover:shadow-2xl hover:shadow-kkookk-indigo-500/10 hover:-translate-y-1">
              {/* Screenshot viewport - vertical */}
              <div className="relative flex flex-col h-full p-6 bg-linear-to-b from-white to-slate-50/50">
                {/* Header with title and description */}
                <div className="mb-4">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h3 className="text-2xl font-bold text-kkookk-navy break-keep">
                      리딤 감사 로그
                    </h3>
                    <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 font-mono text-xs font-bold text-white rounded-full bg-kkookk-indigo-500">
                      1
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-kkookk-steel break-keep">
                    모든 거래 내역이 투명하게 기록되어 언제든 확인 가능합니다
                  </p>
                </div>

                {/* Simulated desktop screen - vertical table */}
                <div className="flex-1 overflow-hidden bg-white border-2 shadow-2xl rounded-2xl border-slate-200">
                  {/* Table header */}
                  <div className="px-4 py-2 border-b bg-slate-50 border-slate-200">
                    <h4 className="text-xs font-bold text-kkookk-navy">
                      처리 내역
                    </h4>
                  </div>

                  {/* Table content - vertical layout */}
                  <div className="flex-1">
                    <table className="w-full">
                      <thead className="border-b bg-slate-50 border-slate-200">
                        <tr>
                          <th className="px-4 py-2 text-left text-[9px] font-mono font-bold tracking-wider uppercase text-kkookk-steel">
                            시간
                          </th>
                          <th className="px-4 py-2 text-left text-[9px] font-mono font-bold tracking-wider uppercase text-kkookk-steel">
                            사용자
                          </th>
                          <th className="px-4 py-2 text-left text-[9px] font-mono font-bold tracking-wider uppercase text-kkookk-steel">
                            내용
                          </th>
                          <th className="px-4 py-2 text-left text-[9px] font-mono font-bold tracking-wider uppercase text-kkookk-steel">
                            결과
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {MOCK_LOG_DATA.map((log, idx) => (
                          <motion.tr
                            key={idx}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.05 * idx }}
                            className="transition-colors hover:bg-slate-50/50"
                          >
                            <td className="px-4 py-2 font-mono text-xs text-kkookk-navy">
                              {log.time}
                            </td>
                            <td className="px-4 py-2">
                              <div className="text-xs font-bold text-kkookk-navy">
                                {log.user}
                              </div>
                              <div className="mt-0.5 font-mono text-[10px] text-kkookk-steel">
                                {log.phone}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs text-kkookk-navy break-keep">
                              {log.action}
                            </td>
                            <td className="px-4 py-2">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  log.status === "approved"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-red-50 text-red-700"
                                }`}
                              >
                                {log.status === "approved" ? (
                                  <Check size={10} />
                                ) : (
                                  <X size={10} />
                                )}
                                {log.status === "approved" ? "승인" : "거절"}
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                        {/* Duplicate for more rows - total 12 rows */}
                        {MOCK_LOG_DATA.map((log, idx) => (
                          <tr
                            key={`dup-${idx}`}
                            className="transition-colors hover:bg-slate-50/50"
                          >
                            <td className="px-4 py-2 font-mono text-xs text-kkookk-navy">
                              {log.time}
                            </td>
                            <td className="px-4 py-2">
                              <div className="text-xs font-bold text-kkookk-navy">
                                {log.user}
                              </div>
                              <div className="mt-0.5 font-mono text-[10px] text-kkookk-steel">
                                {log.phone}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs text-kkookk-navy break-keep">
                              {log.action}
                            </td>
                            <td className="px-4 py-2">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  log.status === "approved"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-red-50 text-red-700"
                                }`}
                              >
                                {log.status === "approved" ? (
                                  <Check size={10} />
                                ) : (
                                  <X size={10} />
                                )}
                                {log.status === "approved" ? "승인" : "거절"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 2. Staff Confirmation Modal - Right top */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-7 md:row-span-1"
          >
            <div className="relative h-full overflow-hidden transition-all duration-500 bg-white border-2 rounded-none group border-kkookk-navy-100 hover:border-kkookk-indigo-500 hover:shadow-2xl hover:shadow-kkookk-indigo-500/10 hover:-translate-y-1">
              {/* Screenshot viewport */}
              <div className="relative flex flex-col h-full p-6 bg-linear-to-b from-white to-slate-50/50">
                {/* Header with title and description */}
                <div className="mb-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h3 className="text-2xl font-bold text-kkookk-navy break-keep">
                      직원 확인 모달
                    </h3>
                    <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 font-mono text-xs font-bold text-white rounded-full bg-kkookk-indigo-500">
                      2
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-kkookk-steel break-keep">
                    고객 실수를 방지하는 2단계 안전장치입니다
                  </p>
                </div>

                {/* Simulated modal overlay */}
                <div className="relative flex items-center justify-center flex-1">
                  <div className="relative w-full max-w-sm">
                    {/* Blurred background simulation */}
                    <div className="absolute inset-0 bg-kkookk-navy/20 backdrop-blur-sm rounded-2xl" />

                    {/* Modal card */}
                    <div className="relative p-6 bg-white border shadow-2xl rounded-2xl border-slate-200">
                      {/* Warning icon */}
                      <div className="flex justify-center mb-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50">
                          <AlertCircle
                            className="w-6 h-6 text-red-500"
                            strokeWidth={2.5}
                          />
                        </div>
                      </div>

                      {/* Modal content */}
                      <h4 className="mb-2 text-lg font-bold text-center text-kkookk-navy">
                        직원 확인
                      </h4>
                      <p className="mb-6 text-xs leading-relaxed text-center text-kkookk-steel break-keep">
                        지금 사용 처리하면 되돌릴 수 없습니다.
                        <br />
                        매장에서 확인 후 진행해 주세요.
                      </p>

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <button className="flex-1 px-4 py-2 text-xs font-bold transition-colors text-kkookk-steel bg-slate-100 rounded-xl hover:bg-slate-200">
                          취소
                        </button>
                        <button className="flex-1 px-4 py-2 text-xs font-bold text-white transition-colors shadow-lg bg-kkookk-navy rounded-xl hover:bg-kkookk-navy-900">
                          확인 완료
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 3. TTL Countdown - Right bottom */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-7 md:row-span-1"
          >
            <div className="relative h-full overflow-hidden transition-all duration-500 bg-white border-2 rounded-none group border-kkookk-navy-100 hover:border-kkookk-indigo-500 hover:shadow-2xl hover:shadow-kkookk-indigo-500/10 hover:-translate-y-1">
              {/* Screenshot viewport */}
              <div className="relative flex flex-col h-full p-6 bg-linear-to-b from-white to-slate-50/50">
                {/* Header with title and description */}
                <div className="mb-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h3 className="text-2xl font-bold text-kkookk-navy break-keep">
                      60초 TTL
                    </h3>
                    <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 font-mono text-xs font-bold text-white rounded-full bg-kkookk-indigo-500">
                      3
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-kkookk-steel break-keep">
                    짧은 유효 시간으로 부정 사용을 원천 차단합니다
                  </p>
                </div>

                {/* Simulated mobile screen */}
                <div className="flex items-center justify-center flex-1">
                  <div className="w-full max-w-[240px] bg-white rounded-3xl shadow-2xl p-6 border-4 border-kkookk-navy min-h-[280px] flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      {!isFailed ? (
                        <motion.div
                          key="countdown"
                          initial={{ opacity: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3 }}
                          className="w-full space-y-4 text-center"
                        >
                          <div className="text-xs font-bold text-kkookk-steel">
                            리워드 사용 대기 중
                          </div>

                          {/* Countdown timer */}
                          <div className="py-6">
                            <motion.div
                              key={countdown}
                              initial={{ scale: 1.2, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className={`font-mono text-6xl font-black tracking-tighter ${
                                countdown <= 1
                                  ? "text-kkookk-red animate-pulse"
                                  : "text-kkookk-navy"
                              }`}
                            >
                              {formatTime(countdown)}
                            </motion.div>
                            <div className="mt-2 font-mono text-xs text-kkookk-steel">
                              남은 시간
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-200">
                            <div className="text-[10px] leading-relaxed text-kkookk-steel">
                              요청이 60초 후 자동 만료됩니다
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="failed"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.4 }}
                          className="flex flex-col items-center justify-center w-full text-center"
                        >
                          {/* Failure icon */}
                          <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-red-50">
                            <AlertCircle className="w-8 h-8 text-kkookk-red" />
                          </div>

                          {/* Failure message */}
                          <h4 className="mb-2 text-lg font-bold text-kkookk-navy">
                            사용 처리 실패
                          </h4>
                          <p className="mb-6 text-xs text-kkookk-steel">
                            다시 시도하거나 매장에 문의해주세요.
                          </p>

                          {/* Action button */}
                          <button className="w-full px-4 py-2 text-xs font-bold text-white transition-colors shadow-lg bg-kkookk-navy rounded-xl hover:bg-kkookk-navy-900">
                            확인하고 보관함 가기
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Trust statement - editorial pull quote style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10"
        >
          <div className="relative pl-8 border-l-4 border-kkookk-indigo-500">
            <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-kkookk-navy">
              꾸욱은 사장님과 고객 모두를 위한 안전한 플랫폼이 될 것을
              <b className="text-kkookk-orange-500"> 약속</b>합니다.
            </p>
          </div>
        </motion.div>
        </div>
      </div>

      {/* Subtle gradient accents */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-kkookk-indigo-500/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-kkookk-navy-500/5 rounded-full blur-3xl -z-10" />
    </section>
  );
}
