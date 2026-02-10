/**
 * ProblemSection
 * 문제 제기 섹션 - 사장님들의 고민 공감대 형성
 */
import { motion } from "framer-motion";

const problems = [
  {
    icon: "/logo/nodoc.png",
    title: "고객이 종이 쿠폰을 잃어버려요",
    description:
      "쿠폰을 집에 두고 오거나 분실해서 혜택을 못 받는 고객들. 재방문 기회를 놓치고 있어요.",
  },
  {
    icon: "/logo/cryimti.png",
    title: "일일이 도장 찍고 확인하기 번거로워요",
    description:
      "바쁜 시간대에 쿠폰을 찾고, 도장 찍고, 위조 걱정까지. 진짜 고객 응대에 집중하고 싶어요.",
  },
  {
    icon: "/logo/arrow_rb.png",
    title: "혜택을 줘도 다시 안 오시네요",
    description:
      "쿠폰은 만들었는데 고객이 잊어버리거나 관심이 없어요. 효과적인 재방문 유도가 어려워요.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

export function ProblemSection() {
  return (
    <motion.section
      id="problem"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col justify-center min-h-screen py-20 md:py-12 snap-start snap-always "
    >
      <div className="px-6 mx-auto max-w-7xl">
        <h2 className="mb-20 text-4xl font-bold text-center sm:text-5xl text-kkookk-navy break-keep">
          혹시 이런 고민, 하고 계신가요?
        </h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="grid grid-cols-1 gap-12 md:grid-cols-3"
        >
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="p-8 transition-transform bg-white border border-gray-100 shadow-lg rounded-2xl hover:scale-105"
            >
              <div className="flex items-center justify-center mb-6 rounded-full">
                <img
                  src={problem.icon}
                  width={200}
                  height={200}
                  alt={problem.title}
                />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-center text-kkookk-navy break-keep">
                {problem.title}
              </h3>
              <p className="leading-relaxed text-center text-kkookk-steel break-keep">
                {problem.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
