/**
 * ReviewSection
 * 후기 섹션 - 사회적 증거
 */

import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface Review {
  name: string;
  role: string;
  image: string;
  rating: number;
  content: string;
}

const reviews: Review[] = [
  {
    name: "만월다방 강남점",
    role: "사장님",
    image: "/mock-review/profile/만월다방.jpeg",
    rating: 5,
    content:
      "POS 연동 없이 바로 시작할 수 있어서 정말 편했어요. 복잡한 설정 없이 QR만 출력하면 끝이라 매장 운영에만 집중할 수 있게 됐습니다.",
  },
  {
    name: "청춘고양이카페 성수점",
    role: "사장님",
    image: "/mock-review/profile/청춘고양이카페.jpeg",
    rating: 5,
    content:
      "종이 쿠폰 관리가 너무 번거로웠는데, 꾸욱으로 바꾸고 나서 위조 걱정도 없고 고객 관리가 한눈에 보여서 좋아요. 재방문율도 확실히 올랐습니다!",
  },
  {
    name: "스탠스커피",
    role: "사장님",
    image: "/mock-review/profile/스탠스커피.jpeg",
    rating: 5,
    content:
      "기존 종이 쿠폰을 그대로 디지털로 옮길 수 있어서 단골 손님들이 불편함 없이 바로 전환됐어요. 마이그레이션 기능 덕분에 서비스 전환이 정말 쉬웠습니다.",
  },
  {
    name: "zl존준형",
    role: "고객",
    image: "/mock-review/profile/사용자1.png",
    rating: 5,
    content:
      "스탬프가 너무 예쁘고 각 카페마다 개성이 있어서 모으는 재미가 있어요! 지갑에서 쿠폰 찾느라 허둥대는 일도 없고, 앱 설치도 안 해도 돼서 편해요.",
  },
  {
    name: "퀸카수현",
    role: "고객",
    image: "/mock-review/profile/사용자2.png",
    rating: 5,
    content:
      "사장님이 직접 만드신 스탬프 디자인들이 너무 이뻐요. 카페마다 색다른 디자인을 모으는 소유욕구가 생겨서 이것저것 가게 되더라구요. 쿠폰 잃어버릴 걱정도 없고!",
  },
  {
    name: "빽다방 성수1호점",
    role: "사장님",
    image: "/mock-review/profile/빽다방.png",
    rating: 5,
    content:
      "바쁜 시간대에도 QR 스캔 한 번이면 끝이라 고객 응대가 훨씬 빨라졌어요. 도장 찍고 확인하는 시간이 줄어드니 매출도 늘었습니다.",
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
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

export function ReviewSection() {
  return (
    <motion.section
      id="review"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen snap-start flex flex-col justify-center py-16 bg-kkookk-navy-50"
    >
      <div className="px-6 mx-auto max-w-7xl">
        <h2 className="mb-12 text-4xl font-semibold text-center leading-12 md:text-5xl text-kkookk-navy break-keep">
          꾸욱과 함께 만든 스탬프,
          <br /> <b className="text-kkookk-orange-500">고객</b>들은 이렇게
          말합니다
        </h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="flex flex-col gap-4 p-6 transition-all duration-300 bg-white border shadow-lg border-gray-50 rounded-2xl hover:shadow-xl hover:-translate-y-1"
            >
              {/* Profile Section */}
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={review.image}
                  alt={review.name}
                  className="object-cover w-12 h-12 rounded-full bg-kkookk-indigo-100"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-kkookk-navy">
                    {review.name}
                  </h4>
                  <p className="text-sm text-kkookk-steel">{review.role}</p>
                </div>
              </div>

              {/* Review Content */}
              <p className="leading-relaxed text-kkookk-steel break-keep">
                "{review.content}"
              </p>

              {/* Star Rating */}
              <div className="flex gap-0.5 mt-auto">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-kkookk-yellow text-kkookk-yellow"
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
