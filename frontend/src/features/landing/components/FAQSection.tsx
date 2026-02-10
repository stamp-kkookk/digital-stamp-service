/**
 * FAQSection
 * FAQ 섹션 - 자주 묻는 질문
 */

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const faqs = [
  {
    question: "이용 요금은 어떻게 되나요?",
    answer:
      "꾸욱의 모든 핵심 기능은 현재 무료로 제공되고 있습니다. 사장님들께서 부담 없이 디지털 전환을 시작하고, 고객 재방문율을 높이는 효과를 경험하실 수 있도록 돕고 싶습니다. 추가적인 프리미엄 기능은 추후 도입될 수 있습니다.",
  },
  {
    question: "POS 연동이 정말 필요없나요?",
    answer:
      "네, 필요 없습니다! 꾸욱은 POS 연동 없이 독립적으로 작동하는 서비스입니다. 매장에 QR코드만 비치하면 바로 고객에게 스탬프를 적립해줄 수 있어, 복잡한 설치 과정이나 추가 장비 구매에 대한 부담이 없습니다.",
  },
  {
    question: "고객은 앱을 설치해야 하나요?",
    answer:
      "아니요, 고객은 별도의 앱을 설치할 필요가 없습니다. 스마트폰 카메라로 QR코드를 스캔하면 웹에서 바로 이용할 수 있습니다. 더 편리한 사용을 원하시면, '홈 화면에 추가' 기능을 통해 앱처럼 바탕화면에 아이콘을 만들고 빠르게 접속할 수도 있습니다. (PWA 지원)",
  },
  {
    question: "스탬프 디자인은 직접 만들 수 있나요?",
    answer:
      "もちろん! 사장님께서 직접 스탬프의 색상, 로고, 배경 이미지를 커스터마이징하여 가게의 브랜드 아이덴티티를 담은 특별한 스탬프 카드를 만들 수 있습니다. 3분이면 충분합니다.",
  },
  {
    question: "기존에 쓰던 종이 쿠폰 고객들은 어떻게 옮기나요?",
    answer:
      "사장님 백오피스에서 기존 종이 쿠폰을 사용하던 단골 고객을 위한 스탬프 수동 지급 기능을 제공합니다. 고객이 종이 쿠폰을 가져오면, 사장님께서 직접 확인 후 해당 개수만큼 디지털 스탬프를 바로 적립해줄 수 있습니다.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

export function FAQSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <motion.section
      id="faq"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col justify-center w-full min-h-screen py-16 snap-start"
      style={{
        background:
          "radial-gradient(ellipse 120% 80% at 50% 100%, #FFF7ED 0%, #FFFBF7 30%, #FFFFFF 100%)",
      }}
    >
      <div className="w-full max-w-4xl px-6 mx-auto">
        <h2 className="mb-4 text-4xl font-bold text-center md:text-5xl text-kkookk-navy">
          FAQ
        </h2>
        <p className="mb-16 text-xl text-center text-kkookk-steel">
          자주 묻는 질문에 답해드립니다
        </p>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="flex flex-col space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="w-full overflow-hidden transition-shadow duration-300 bg-white border shadow-lg border-gray-200/50 rounded-2xl hover:shadow-xl"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="flex items-center justify-between w-full gap-4 p-6 text-left transition-colors hover:bg-gray-50/50"
              >
                <h3 className="flex-1 text-lg font-semibold break-words text-kkookk-navy">
                  {faq.question}
                </h3>
                <motion.div
                  animate={{ rotate: activeIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0 ml-2"
                >
                  <ChevronDown className="w-5 h-5 text-kkookk-steel" />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{
                      duration: 0.3,
                      ease: [0.04, 0.62, 0.23, 0.98],
                    }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6">
                      <p className="leading-relaxed text-kkookk-steel break-keep">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="p-8 mt-6 transition-all duration-300 bg-white border shadow-lg text-start border-gray-200/50 rounded-2xl hover:shadow-xl"
        >
          <h3 className="mb-2 text-xl font-bold md:text-2xl text-kkookk-navy">
            다른 궁금하신 내용이 있으신가요?
          </h3>
          <p className="mb-6 text-lg text-kkookk-steel">
            지금 바로 문의주세요!
          </p>
          <Link
            to="/simulation"
            className="relative inline-flex items-center justify-center px-8 py-3 overflow-hidden text-lg text-white transition-all duration-500 shadow-lg bg-kkookk-orange-500 rounded-2xl active:scale-95 group"
          >
            <span className="absolute inset-0 flex items-center justify-center transition-transform duration-200 ease-out group-hover:-translate-y-full">
              바로 문의하기
              <ChevronRight className="ml-2" />
            </span>
            <span className="absolute inset-0 flex items-center justify-center transition-transform duration-200 ease-out translate-y-full group-hover:translate-y-0">
              바로 문의하기
              <ChevronRight className="ml-2" />
            </span>
            <span className="invisible">바로 문의하기</span>
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
}
