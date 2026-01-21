import { motion } from 'framer-motion'

export default function FooterSection() {
    return (
        <footer className="bg-kkookk-navy relative flex min-h-screen w-full snap-start flex-col items-center justify-center overflow-hidden">
            {/* 배경 그라데이션 */}
            <div className="pointer-events-none absolute inset-0">
                <div className="bg-kkookk-orange-500/10 absolute top-1/4 left-1/4 h-96 w-96 rounded-full blur-[100px]" />
                <div className="bg-kkookk-indigo/10 absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full blur-[100px]" />
            </div>

            {/* 메인 콘텐츠 */}
            <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    {/* 슬로건 */}
                    <h2 className="font-pretendard mb-8 text-5xl font-black leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl">
                        <span className="block">지금 바로,</span>
                        <span className="block">
                            <span className="text-kkookk-orange-500">당신만의 스탬프</span>를
                        </span>
                        <span className="block">시작하세요.</span>
                    </h2>
                    <p className="mb-10 text-lg text-white/50">
                        5분이면 충분해요. 무료로 시작하고, 언제든 업그레이드하세요.
                    </p>
                    {/* CTA 버튼들 */}
                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                        <motion.button
                            className="bg-kkookk-orange-500 shadow-kkookk-orange-500/40 h-16 w-full rounded-2xl px-10 text-lg font-bold text-white shadow-2xl sm:w-auto"
                            whileHover={{
                                scale: 1.05,
                                boxShadow: '0 30px 60px rgba(255, 77, 0, 0.4)',
                            }}
                            whileTap={{ scale: 0.95 }}
                        >
                            사장님으로 시작하기
                        </motion.button>

                        <motion.button
                            className="h-16 w-full rounded-2xl border-2 border-white/20 px-10 text-lg font-semibold text-white sm:w-auto"
                            whileHover={{ scale: 1.02, borderColor: 'rgba(255,255,255,0.4)' }}
                            whileTap={{ scale: 0.98 }}
                        >
                            고객으로 둘러보기
                        </motion.button>
                    </div>
                </motion.div>
            </div>

            {/* 하단 푸터 정보 */}
            <div className="absolute right-0 bottom-0 left-0 border-t border-white/10 py-8">
                <div className="mx-auto max-w-6xl px-6">
                    <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                        {/* 링크들 */}
                        <nav className="flex flex-wrap justify-center gap-6 text-sm text-white/40">
                            <button type="button" className="transition-colors hover:text-white/70">
                                서비스 소개
                            </button>
                            <button type="button" className="transition-colors hover:text-white/70">
                                요금제
                            </button>
                            <button type="button" className="transition-colors hover:text-white/70">
                                자주 묻는 질문
                            </button>
                            <button type="button" className="transition-colors hover:text-white/70">
                                이용약관
                            </button>
                            <button type="button" className="transition-colors hover:text-white/70">
                                개인정보처리방침
                            </button>
                        </nav>

                        {/* 카피라이트 */}
                        <div className="text-sm text-white/30">© 2025 꾸욱 KKOOKK. All rights reserved.</div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
