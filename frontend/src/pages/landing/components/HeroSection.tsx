import { motion, useMotionValue, useTransform, useSpring, MotionValue } from "framer-motion";
import { useEffect } from "react";

// 샘플 스탬프 데이터 (다양한 사장님들의 개성 있는 스탬프)
const SAMPLE_STAMPS = [
  { id: 1, emoji: "☕", name: "카페 모카", color: "#8B4513", bg: "#FFF8DC" },
  { id: 2, emoji: "🍜", name: "면사랑", color: "#FF6B35", bg: "#FFF5F0" },
  { id: 3, emoji: "🌸", name: "꽃집 봄", color: "#FF69B4", bg: "#FFF0F5" },
  { id: 4, emoji: "📚", name: "동네책방", color: "#2F4F4F", bg: "#F0FFF0" },
  { id: 5, emoji: "🍰", name: "달콤베이커리", color: "#FF4500", bg: "#FFFAF0" },
  { id: 6, emoji: "🎨", name: "아트공방", color: "#9370DB", bg: "#F8F4FF" },
  { id: 7, emoji: "🍺", name: "수제맥주집", color: "#DAA520", bg: "#FFFDE7" },
  { id: 8, emoji: "💇", name: "헤어살롱", color: "#FF1493", bg: "#FFF0F8" },
  { id: 9, emoji: "🧁", name: "컵케이크하우스", color: "#E91E63", bg: "#FCE4EC" },
  { id: 10, emoji: "🍕", name: "피자마을", color: "#FF5722", bg: "#FBE9E7" },
  { id: 11, emoji: "🎸", name: "기타교실", color: "#795548", bg: "#EFEBE9" },
];

// 마우스 반응형 3D 스탬프 카드
function FloatingStamp({
  stamp,
  index,
  mouseX,
  mouseY,
}: {
  stamp: (typeof SAMPLE_STAMPS)[0];
  index: number;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
}) {
  // 각 스탬프 위치 - 텍스트 중심으로 자연스럽게 흩뿌림
  const positions = [
    // 왼쪽 - 위에서 아래로 자연스럽게 흐르듯
    { x: "3%", y: "12%", scale: 0.85, rotate: -8 },
    { x: "-2%", y: "38%", scale: 0.75, rotate: 12 },
    { x: "5%", y: "65%", scale: 0.9, rotate: -15 },
    { x: "10%", y: "88%", scale: 0.7, rotate: 5 },
    // 오른쪽 - 위에서 아래로 자연스럽게 흐르듯
    { x: "87%", y: "8%", scale: 0.8, rotate: 10 },
    { x: "92%", y: "35%", scale: 0.7, rotate: -12 },
    { x: "85%", y: "60%", scale: 0.85, rotate: 8 },
    { x: "78%", y: "85%", scale: 0.75, rotate: -5 },
    // 상단 - 텍스트 위 살짝
    { x: "25%", y: "3%", scale: 0.6, rotate: -18 },
    { x: "70%", y: "5%", scale: 0.65, rotate: 15 },
    // 하단 중앙
    { x: "45%", y: "92%", scale: 0.55, rotate: -8 },
  ];

  const pos = positions[index % positions.length];

  // 마우스 위치에 따른 미세한 움직임
  const offsetX = useTransform(mouseX, [0, 1], [-15 + index * 3, 15 - index * 3]);
  const offsetY = useTransform(mouseY, [0, 1], [-10 + index * 2, 10 - index * 2]);

  const springX = useSpring(offsetX, { stiffness: 150, damping: 20 });
  const springY = useSpring(offsetY, { stiffness: 150, damping: 20 });

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        left: pos.x,
        top: pos.y,
        x: springX,
        y: springY,
      }}
      initial={{ opacity: 0, scale: 0, rotate: pos.rotate - 20 }}
      animate={{ opacity: 1, scale: pos.scale, rotate: pos.rotate }}
      transition={{
        duration: 0.8,
        delay: 0.1 * index,
        type: "spring",
        stiffness: 100,
      }}
      whileHover={{
        scale: pos.scale * 1.15,
        rotate: 0,
        zIndex: 50,
        transition: { duration: 0.2 },
      }}
    >
      <div
        className="relative flex h-28 w-28 flex-col items-center justify-center rounded-2xl shadow-2xl transition-shadow hover:shadow-3xl md:h-36 md:w-36"
        style={{ backgroundColor: stamp.bg }}
      >
        {/* 스탬프 테두리 효과 */}
        <div
          className="absolute inset-1.5 rounded-xl border-2 border-dashed opacity-30"
          style={{ borderColor: stamp.color }}
        />

        {/* 이모지 */}
        <span className="text-4xl md:text-6xl">{stamp.emoji}</span>

        {/* 가게 이름 */}
        <span
          className="mt-1.5 text-xs font-bold tracking-tight md:text-sm"
          style={{ color: stamp.color }}
        >
          {stamp.name}
        </span>

        {/* 스탬프 찍힌 느낌의 그림자 */}
        <div
          className="absolute -bottom-1 -right-1 h-full w-full rounded-2xl opacity-20 blur-sm"
          style={{ backgroundColor: stamp.color }}
        />
      </div>
    </motion.div>
  );
}


// 아래 화살표 SVG 컴포넌트
function ArrowDownIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-kkookk-orange-500"
    >
      <path
        d="M12 4V20M12 20L6 14M12 20L18 14"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function HeroSection() {
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <section className="relative flex h-screen w-full snap-start flex-col items-center justify-center overflow-hidden bg-kkookk-paper">
      {/* 배경 노이즈 텍스처 */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* 그라데이션 오버레이 */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-kkookk-orange-50/50" />

      {/* 떠다니는 스탬프들 */}
      {SAMPLE_STAMPS.map((stamp, index) => (
        <FloatingStamp
          key={stamp.id}
          stamp={stamp}
          index={index}
          mouseX={mouseX}
          mouseY={mouseY}
        />
      ))}

      {/* 메인 카피 */}
      <motion.div
        className="relative z-10 px-6 text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        {/* 메인 헤드라인 */}
        <h1 className="font-pretendard text-5xl font-extrabold leading-[1.1] tracking-tight text-kkookk-navy md:text-7xl lg:text-8xl">
          <span className="block">세상에 단 하나뿐인</span>
          <span className="block">
            사장님의{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-kkookk-orange-500">취향</span>
              {/* 하이라이트 효과 */}
              <motion.span
                className="absolute -bottom-1 left-0 z-0 h-4 w-full bg-kkookk-orange-200/60 md:h-6"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                style={{ originX: 0 }}
              />
            </span>
            을
          </span>
          <span className="block">찍으세요</span>
        </h1>

        {/* CTA 버튼 - 하나만, 더 크게 */}
        <motion.div
          className="mt-12 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
        >
          <motion.button
            className="h-16 rounded-2xl bg-kkookk-orange-500 px-12 text-xl font-bold text-white shadow-xl shadow-kkookk-orange-500/30 transition-all md:h-18 md:px-16 md:text-2xl"
            whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(255, 77, 0, 0.35)" }}
            whileTap={{ scale: 0.95 }}
          >
            꾸욱 찍으러 가기
          </motion.button>
        </motion.div>
      </motion.div>

      {/* 스크롤 인디케이터 - 아래 화살표 */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ delay: 2, y: { duration: 1.5, repeat: Infinity } }}
      >
        <ArrowDownIcon />
      </motion.div>
    </section>
  );
}
