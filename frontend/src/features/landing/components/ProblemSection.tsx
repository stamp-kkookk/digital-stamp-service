/**
 * ProblemSection
 * 문제 해결 섹션 - 꾸욱의 3가지 핵심 가치 제안
 */
import { motion } from "framer-motion";

/* ──────────────────────────────────────────────
 * Data
 * ────────────────────────────────────────────── */

interface ProblemCard {
  icon: string;
  title: string;
  description: string;
  accent: string;
  iconClass?: string;
}

const problems: ProblemCard[] = [
  {
    icon: "/image/solution_emoji_first.png",
    title: "원클릭 디지털 스탬프 생성",
    description:
      "종이 도장 찍는 번거로움은 끝. 클릭 한 번으로 우리 매장만의 디지털 스탬프 카드를 바로 만들 수 있어요.",
    accent: "from-[#FF6A00] to-[#FF9100]",
    iconClass: "scale-120",
  },
  {
    icon: "/image/solution_emoji_second.png",
    title: "발급 내역 확인 & 통계",
    description:
      "누가, 언제, 몇 개의 스탬프를 받았는지 실시간으로 확인. 고객 데이터 기반으로 매출 인사이트를 얻으세요.",
    accent: "from-[#2E58FF] to-[#6B8AFF]",
  },
  {
    icon: "/image/solution_emoji_third.png",
    title: "종이 스탬프도 디지털로",
    description:
      "이미 발급한 종이 스탬프도 걱정 마세요. 기존 고객의 적립 현황을 간편하게 디지털로 전환할 수 있습니다.",
    accent: "from-[#8B5CF6] to-[#6B8AFF]",
    iconClass: "scale-85",
  },
];

/* ──────────────────────────────────────────────
 * Animation Variants
 * ────────────────────────────────────────────── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

/* ──────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────── */

export function ProblemSection() {
  return (
    <motion.section
      id="problem"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col justify-center min-h-screen pt-14 py-12 snap-start snap-always"
    >
      <div className="px-6 mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <p className="mb-4 text-lg font-semibold tracking-wide text-kkookk-orange-500">
            왜 꾸욱이어야 할까요?
          </p>
          <h2 className="text-4xl font-bold sm:text-5xl text-kkookk-navy break-keep">
            사장님의 고민, 꾸욱이 해결합니다
          </h2>
        </div>

        {/* Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          className="grid grid-cols-1 gap-10 md:grid-cols-3"
        >
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* 상단 그라디언트 액센트 라인 */}
              <div className={`h-1.5 bg-linear-to-r ${problem.accent}`} />

              <div className="px-8 pt-8 pb-10">
                {/* Icon */}
                <div className="flex items-center justify-center mb-6 h-40">
                  <img
                    src={problem.icon}
                    className={`max-h-full w-auto object-contain ${problem.iconClass ?? ""}`}
                    alt={problem.title}
                  />
                </div>

                {/* Title */}
                <h3 className="mb-3 text-xl font-bold text-center text-kkookk-navy break-keep">
                  {problem.title}
                </h3>

                {/* Description */}
                <p className="text-base leading-relaxed text-center text-kkookk-steel break-keep">
                  {problem.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
