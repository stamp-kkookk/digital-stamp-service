import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

// 문제점 아이템
const PROBLEMS = [
  {
    icon: "📄",
    title: "잃어버리기 쉬운 종이 쿠폰",
    description: "지갑 어딘가에 있던 쿠폰, 정작 필요할 때는 찾을 수 없어요.",
  },
  {
    icon: "🗑️",
    title: "구겨지고 찢어지는 스탬프 카드",
    description: "열심히 모은 스탬프가 훼손되면 다시 처음부터...",
  },
  {
    icon: "📊",
    title: "관리하기 힘든 고객 데이터",
    description: "누가 단골인지, 얼마나 자주 오는지 파악하기 어려워요.",
  },
  {
    icon: "💸",
    title: "인쇄비로 새어나가는 비용",
    description: "쿠폰 인쇄할 때마다 비용이 발생하고 재고 관리도 번거로워요.",
  },
];

// 문제 섹션
export function ProblemSection() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <section className="relative flex h-screen w-full snap-start items-center overflow-hidden">
      {/* 배경 */}
      <div className="absolute inset-0 bg-linear-to-br from-gray-900 via-gray-800 to-gray-900" />

      {/* 노이즈 텍스처 */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* 떨어지는 종이 조각들 애니메이션 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-8 w-6 rounded bg-white/10"
            style={{
              left: `${10 + i * 12}%`,
              top: "-10%",
            }}
            animate={{
              y: ["0vh", "120vh"],
              rotate: [0, 360 * (i % 2 === 0 ? 1 : -1)],
              opacity: [0.3, 0],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 md:px-12">
        <div className="max-w-2xl">
          <motion.h2
            className="mb-12 font-pretendard text-4xl font-extrabold leading-tight text-white md:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="block text-gray-400">아직도</span>
            <span className="block">
              <span className="text-kkookk-red">종이 쿠폰</span>
              으로
            </span>
            <span className="block">고생하세요?</span>
          </motion.h2>

          {/* 문제점 리스트 - 왼쪽 정렬 */}
          <div className="flex flex-col gap-4">
            {PROBLEMS.map((problem, i) => (
              <motion.button
                key={i}
                onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                className="w-full text-left"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div
                  className={`rounded-2xl border p-5 backdrop-blur-sm transition-all ${
                    expandedIndex === i
                      ? "border-kkookk-red/30 bg-kkookk-red/10"
                      : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl grayscale">{problem.icon}</span>
                    <span className="text-lg font-medium text-gray-300">
                      {problem.title}
                    </span>
                    <motion.span
                      className="ml-auto text-gray-500"
                      animate={{ rotate: expandedIndex === i ? 180 : 0 }}
                    >
                      ▼
                    </motion.span>
                  </div>

                  <AnimatePresence>
                    {expandedIndex === i && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 overflow-hidden pl-12 text-gray-400"
                      >
                        {problem.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// 마이그레이션 섹션 - 종이 스탬프를 디지털로 안전하게 옮겨드립니다
export function SolutionSection() {
  const [step, setStep] = useState(0);

  const steps = [
    { icon: "📸", title: "촬영", desc: "기존 종이 스탬프 카드를 사진으로 찍어주세요" },
    { icon: "🔍", title: "검증", desc: "꾸욱이 스탬프 개수를 자동으로 인식해요" },
    { icon: "✨", title: "완료", desc: "디지털 스탬프로 안전하게 마이그레이션!" },
  ];

  return (
    <section className="relative flex h-screen w-full snap-start items-center justify-center overflow-hidden bg-linear-to-b from-kkookk-paper to-white">
      {/* 배경 패턴 */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #1a1c1e 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* 왼쪽: 텍스트 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-6 font-pretendard text-4xl font-black leading-[1.1] text-kkookk-navy md:text-5xl lg:text-6xl">
              <span className="block">기존 스탬프도</span>
              <span className="block text-kkookk-orange-500">안전하게</span>
              <span className="block">옮겨드려요</span>
            </h2>

            <p className="mb-8 text-lg leading-relaxed text-kkookk-navy/60 md:text-xl">
              이미 모아둔 종이 스탬프가 있으신가요?
              <br />
              사진 한 장이면 꾸욱이 디지털로 마이그레이션 해드려요.
              <br />
              <span className="font-semibold text-kkookk-navy">고객의 노력, 하나도 버리지 않습니다.</span>
            </p>

            {/* 스텝 인디케이터 */}
            <div className="flex gap-3">
              {steps.map((s, i) => (
                <motion.button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`flex h-12 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-all ${
                    step === i
                      ? "bg-kkookk-orange-500 text-white shadow-lg shadow-kkookk-orange-500/30"
                      : "bg-kkookk-navy/5 text-kkookk-navy/60 hover:bg-kkookk-navy/10"
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-lg">{s.icon}</span>
                  <span className="hidden sm:inline">{s.title}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* 오른쪽: 마이그레이션 시각화 */}
          <motion.div
            className="relative flex justify-center"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="relative h-80 w-full max-w-md md:h-96">
              {/* Step 0: 종이 스탬프 카드 */}
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div
                    key="paper"
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, x: -50 }}
                  >
                    <div className="relative">
                      {/* 종이 카드 */}
                      <motion.div
                        className="relative h-44 w-72 -rotate-2 rounded-xl bg-linear-to-br from-amber-50 to-amber-100 p-5 shadow-xl md:h-52 md:w-80"
                        animate={{ rotate: [-2, 1, -2] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        {/* 종이 질감 */}
                        <div className="absolute inset-0 rounded-xl opacity-30" style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
                        }} />
                        <div className="relative">
                          <div className="mb-3 flex items-center gap-2">
                            <span className="text-2xl">☕</span>
                            <span className="font-bold text-amber-900">카페 모카</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {[...Array(10)].map((_, i) => (
                              <div
                                key={i}
                                className={`flex h-8 w-8 items-center justify-center rounded-lg border-2 border-amber-300 md:h-9 md:w-9 ${
                                  i < 7 ? "bg-amber-400" : "bg-amber-50"
                                }`}
                              >
                                {i < 7 && <span className="text-xs text-amber-900">✓</span>}
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 text-xs text-amber-700">7/10 적립</div>
                        </div>
                        {/* 구겨진 자국 */}
                        <div className="absolute right-3 top-3 h-6 w-6 rotate-45 border-b border-r border-amber-200" />
                      </motion.div>
                      {/* 카메라 아이콘 */}
                      <motion.div
                        className="absolute -bottom-4 -right-4 flex h-16 w-16 items-center justify-center rounded-full bg-kkookk-navy text-3xl shadow-xl"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        📸
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {/* Step 1: 검증 중 */}
                {step === 1 && (
                  <motion.div
                    key="verify"
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, x: -50 }}
                  >
                    <div className="relative">
                      <motion.div
                        className="h-44 w-72 rounded-2xl bg-white p-5 shadow-2xl md:h-52 md:w-80"
                        animate={{ boxShadow: ["0 10px 40px rgba(255,77,0,0.1)", "0 10px 40px rgba(255,77,0,0.3)", "0 10px 40px rgba(255,77,0,0.1)"] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <div className="mb-3 flex items-center gap-2">
                          <span className="text-2xl">☕</span>
                          <span className="font-bold text-kkookk-navy">카페 모카</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {[...Array(10)].map((_, i) => (
                            <motion.div
                              key={i}
                              className={`flex h-8 w-8 items-center justify-center rounded-lg border-2 md:h-9 md:w-9 ${
                                i < 7
                                  ? "border-kkookk-orange-500 bg-kkookk-orange-100"
                                  : "border-gray-200 bg-gray-50"
                              }`}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: i * 0.1 }}
                            >
                              {i < 7 && (
                                <motion.span
                                  className="text-sm text-kkookk-orange-500"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.5 + i * 0.1 }}
                                >
                                  ✓
                                </motion.span>
                              )}
                            </motion.div>
                          ))}
                        </div>
                        <motion.div
                          className="mt-3 text-sm font-medium text-kkookk-orange-500"
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          🔍 스탬프 인식 중... 7개 감지됨
                        </motion.div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: 완료 */}
                {step === 2 && (
                  <motion.div
                    key="done"
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, x: -50 }}
                  >
                    <div className="relative">
                      <motion.div
                        className="h-44 w-72 rounded-2xl bg-linear-to-br from-kkookk-orange-500 to-kkookk-orange-600 p-5 shadow-2xl shadow-kkookk-orange-500/30 md:h-52 md:w-80"
                        initial={{ y: 20 }}
                        animate={{ y: 0 }}
                      >
                        <div className="mb-3 flex items-center gap-2 text-white">
                          <span className="text-2xl">☕</span>
                          <span className="font-bold">카페 모카</span>
                          <span className="ml-auto rounded-full bg-white/20 px-2 py-0.5 text-xs">
                            디지털
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {[...Array(10)].map((_, i) => (
                            <motion.div
                              key={i}
                              className={`flex h-8 w-8 items-center justify-center rounded-lg md:h-9 md:w-9 ${
                                i < 7 ? "bg-white" : "bg-white/30"
                              }`}
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: i * 0.05, type: "spring" }}
                            >
                              {i < 7 && <span className="text-sm">☕</span>}
                            </motion.div>
                          ))}
                        </div>
                        <div className="mt-3 text-sm text-white/90">
                          ✨ 마이그레이션 완료! 3개 더 모으면 무료
                        </div>
                      </motion.div>
                      {/* 성공 뱃지 */}
                      <motion.div
                        className="absolute -right-4 -top-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-2xl shadow-lg"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                      >
                        ✓
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* 하단 설명 */}
        <motion.p
          className="mt-8 text-center text-sm text-kkookk-navy/40 md:text-base"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
        >
          * 마이그레이션은 사장님의 승인 후 진행됩니다
        </motion.p>
      </div>
    </section>
  );
}

// 사용자 관점 섹션 - "이제 꾸욱! 내 손안의 모든 스탬프"
export function CustomerSection() {
  const stampCards = [
    { name: "카페 모카", emoji: "☕", count: 7, total: 10, reward: "아메리카노 무료", color: "#8B4513" },
    { name: "면사랑", emoji: "🍜", count: 9, total: 10, reward: "곱빼기 무료", color: "#FF6B35" },
    { name: "꽃집 봄", emoji: "🌸", count: 4, total: 8, reward: "미니 화분 증정", color: "#FF69B4" },
    { name: "달콤베이커리", emoji: "🍰", count: 2, total: 5, reward: "케이크 20% 할인", color: "#FF4500" },
  ];

  return (
    <section className="relative flex h-screen w-full snap-start items-center justify-center overflow-hidden bg-linear-to-b from-kkookk-navy via-kkookk-navy to-gray-900">
      {/* 배경 글로우 */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-150 w-150 -translate-x-1/2 -translate-y-1/2 rounded-full bg-kkookk-orange-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10 flex h-full w-full max-w-6xl flex-col items-center justify-center px-6 md:flex-row md:gap-16">
        {/* 왼쪽: 텍스트 - "이제 꾸욱!" 통합 */}
        <motion.div
          className="mb-8 text-center md:mb-0 md:flex-1 md:text-left"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="mb-4 font-pretendard text-5xl font-black leading-none text-white md:text-6xl lg:text-7xl">
            <motion.span
              className="relative inline-block text-kkookk-orange-500"
              whileHover={{ scale: 1.05 }}
            >
              이제 꾸욱!
              <motion.span
                className="absolute -right-3 -top-3 text-2xl md:-right-5 md:-top-5 md:text-3xl"
                animate={{ rotate: [0, 15, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ✦
              </motion.span>
            </motion.span>
          </h2>
          <h2 className="mb-6 font-pretendard text-4xl font-black leading-[1.1] text-white md:text-5xl lg:text-6xl">
            <span className="block">내 손안의</span>
            <span className="block">모든 스탬프</span>
          </h2>
          <p className="text-lg text-white/50 md:text-xl">
            더 이상 지갑이 두꺼워질 일 없어요.
            <br />
            언제 어디서든 꺼내보세요.
          </p>
        </motion.div>

        {/* 오른쪽: 큰 폰 목업 */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {/* 폰 프레임 */}
          <div className="relative h-125 w-65 overflow-hidden rounded-[3rem] border-8 border-gray-800 bg-white shadow-2xl shadow-black/50 md:h-150 md:w-75">
            {/* 노치 */}
            <div className="absolute left-1/2 top-0 z-20 h-7 w-28 -translate-x-1/2 rounded-b-2xl bg-gray-800" />

            {/* 화면 내용 */}
            <div className="h-full overflow-hidden bg-kkookk-paper pt-10">
              {/* 헤더 */}
              <div className="px-5 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-kkookk-navy/50">안녕하세요</div>
                    <div className="text-lg font-bold text-kkookk-navy">김꾸욱님 👋</div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-kkookk-orange-500 text-lg text-white">
                    🔔
                  </div>
                </div>

                {/* 검색바 */}
                <div className="mt-4 flex h-10 items-center gap-2 rounded-xl bg-white px-3 shadow-sm">
                  <span className="text-gray-400">🔍</span>
                  <span className="text-sm text-gray-400">매장 검색</span>
                </div>
              </div>

              {/* 스탬프 카드 리스트 */}
              <div className="px-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-kkookk-navy">내 스탬프</span>
                  <span className="text-xs text-kkookk-orange-500">{stampCards.length}개 보유</span>
                </div>

                <div className="flex flex-col gap-3">
                  {stampCards.map((card, i) => (
                    <motion.div
                      key={i}
                      className="rounded-2xl bg-white p-4 shadow-md"
                      initial={{ opacity: 0, x: 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                          style={{ backgroundColor: `${card.color}20` }}
                        >
                          {card.emoji}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-kkookk-navy">{card.name}</span>
                            <span className="text-xs font-medium" style={{ color: card.color }}>
                              {card.count}/{card.total}
                            </span>
                          </div>
                          {/* 프로그레스 바 */}
                          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: card.color }}
                              initial={{ width: 0 }}
                              whileInView={{ width: `${(card.count / card.total) * 100}%` }}
                              transition={{ delay: 0.6 + i * 0.1, duration: 0.6 }}
                              viewport={{ once: true }}
                            />
                          </div>
                          <div className="mt-1 text-[10px] text-gray-400">
                            {card.count === card.total ? (
                              <span className="font-medium text-green-500">🎉 {card.reward}</span>
                            ) : (
                              `${card.total - card.count}개 더 모으면 → ${card.reward}`
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* 하단 네비게이션 */}
              <div className="absolute bottom-0 left-0 right-0 flex h-16 items-center justify-around border-t border-gray-100 bg-white">
                <div className="flex flex-col items-center">
                  <span className="text-kkookk-orange-500">🏠</span>
                  <span className="text-[10px] font-medium text-kkookk-orange-500">홈</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-gray-300">🔍</span>
                  <span className="text-[10px] text-gray-300">탐색</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-gray-300">🎁</span>
                  <span className="text-[10px] text-gray-300">리워드</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-gray-300">👤</span>
                  <span className="text-[10px] text-gray-300">마이</span>
                </div>
              </div>
            </div>
          </div>

          {/* 플로팅 뱃지 */}
          <motion.div
            className="absolute -left-8 top-20 rounded-xl bg-white px-4 py-2 shadow-lg md:-left-16"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
            viewport={{ once: true }}
            animate={{ y: [0, -5, 0] }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">🎉</span>
              <div>
                <div className="text-[10px] text-gray-500">새로운 리워드!</div>
                <div className="text-xs font-bold text-kkookk-navy">면사랑 곱빼기 쿠폰</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="absolute -right-6 bottom-32 rounded-xl bg-kkookk-orange-500 px-4 py-2 shadow-lg md:-right-12"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2 }}
            viewport={{ once: true }}
            animate={{ y: [0, 5, 0] }}
          >
            <div className="text-xs font-bold text-white">+1 스탬프 적립!</div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
