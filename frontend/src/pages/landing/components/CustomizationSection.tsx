import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

// 커스터마이징 옵션들
const EMOJI_OPTIONS = ["☕", "🍜", "🌸", "🍰", "🍺", "💇", "🎨", "🐶"];
const COLOR_OPTIONS = [
  { name: "클래식 브라운", primary: "#8B4513", bg: "#FFF8DC" },
  { name: "비비드 오렌지", primary: "#FF4D00", bg: "#FFF5F0" },
  { name: "로즈 핑크", primary: "#FF69B4", bg: "#FFF0F5" },
  { name: "딥 네이비", primary: "#1a1c1e", bg: "#F0F4FF" },
  { name: "포레스트 그린", primary: "#2D5A27", bg: "#F0FFF0" },
  { name: "로얄 퍼플", primary: "#6B3FA0", bg: "#F8F4FF" },
];
const SHOP_NAMES = ["우리 가게", "카페 모카", "면사랑", "꽃집 봄", "동네책방", "달콤베이커리"];

export default function CustomizationSection() {
  const [selectedEmoji, setSelectedEmoji] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedName, setSelectedName] = useState(0);
  const [stampCount, setStampCount] = useState(3);
  const [isStamping, setIsStamping] = useState(false);

  const currentColor = COLOR_OPTIONS[selectedColor];
  const currentEmoji = EMOJI_OPTIONS[selectedEmoji];
  const currentName = SHOP_NAMES[selectedName];

  // 스탬프 찍기 애니메이션
  const handleStamp = () => {
    if (isStamping || stampCount >= 10) return;
    setIsStamping(true);
    setTimeout(() => {
      setStampCount((prev) => Math.min(prev + 1, 10));
      setIsStamping(false);
    }, 300);
  };

  // 다음 옵션으로 순환
  const cycleOption = (type: "emoji" | "color" | "name") => {
    if (type === "emoji") {
      setSelectedEmoji((prev) => (prev + 1) % EMOJI_OPTIONS.length);
    } else if (type === "color") {
      setSelectedColor((prev) => (prev + 1) % COLOR_OPTIONS.length);
    } else {
      setSelectedName((prev) => (prev + 1) % SHOP_NAMES.length);
    }
  };

  return (
    <section className="relative flex h-screen w-full snap-start items-center justify-center overflow-hidden bg-kkookk-navy">
      {/* 배경 그리드 패턴 */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* 그라데이션 오버레이 */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-kkookk-orange-500/10 via-transparent to-kkookk-indigo/10" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* 왼쪽: 텍스트 & 컨트롤 */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-6 font-pretendard text-4xl font-extrabold leading-tight text-white md:text-5xl lg:text-6xl">
              <span className="block">당신만의</span>
              <span className="block text-kkookk-orange-500">스탬프를</span>
              <span className="block">만들어보세요</span>
            </h2>

            <p className="mb-10 max-w-md text-lg leading-relaxed text-white/60">
              이모지, 색상, 가게 이름까지. 버튼 하나로 나만의 개성 있는 스탬프가 완성됩니다.
            </p>

            {/* 커스터마이징 버튼들 */}
            <div className="flex flex-wrap gap-3">
              <motion.button
                onClick={() => cycleOption("emoji")}
                className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-lg">{currentEmoji}</span>
                <span>아이콘 변경</span>
              </motion.button>

              <motion.button
                onClick={() => cycleOption("color")}
                className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                whileTap={{ scale: 0.95 }}
              >
                <span
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: currentColor.primary }}
                />
                <span>색상 변경</span>
              </motion.button>

              <motion.button
                onClick={() => cycleOption("name")}
                className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                whileTap={{ scale: 0.95 }}
              >
                <span>✏️</span>
                <span>이름 변경</span>
              </motion.button>
            </div>
          </motion.div>

          {/* 오른쪽: 스탬프 카드 프리뷰 */}
          <motion.div
            className="relative flex justify-center"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {/* 스탬프 카드 */}
            <motion.div
              className="relative w-full max-w-sm overflow-hidden rounded-3xl p-6 shadow-2xl"
              style={{ backgroundColor: currentColor.bg }}
              layout
            >
              {/* 카드 헤더 */}
              <div className="mb-6 flex items-center justify-between">
                <AnimatePresence mode="wait">
                  <motion.h3
                    key={currentName}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-xl font-bold"
                    style={{ color: currentColor.primary }}
                  >
                    {currentName}
                  </motion.h3>
                </AnimatePresence>
                <span className="text-sm font-medium text-gray-500">
                  {stampCount} / 10
                </span>
              </div>

              {/* 스탬프 그리드 */}
              <div className="mb-6 grid grid-cols-5 gap-3">
                {[...Array(10)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="relative flex aspect-square items-center justify-center rounded-xl border-2 border-dashed"
                    style={{
                      borderColor: i < stampCount ? "transparent" : `${currentColor.primary}30`,
                      backgroundColor: i < stampCount ? `${currentColor.primary}15` : "transparent",
                    }}
                  >
                    <AnimatePresence>
                      {i < stampCount && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className="text-2xl"
                        >
                          {currentEmoji}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* 스탬프 번호 (비어있을 때) */}
                    {i >= stampCount && (
                      <span
                        className="text-xs font-medium"
                        style={{ color: `${currentColor.primary}40` }}
                      >
                        {i + 1}
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* 스탬프 찍기 버튼 */}
              <motion.button
                onClick={handleStamp}
                disabled={stampCount >= 10}
                className="relative h-14 w-full overflow-hidden rounded-2xl font-bold text-white shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  backgroundColor: currentColor.primary,
                  boxShadow: `0 10px 30px ${currentColor.primary}40`,
                }}
                whileHover={{ scale: stampCount < 10 ? 1.02 : 1 }}
                whileTap={{ scale: stampCount < 10 ? 0.95 : 1 }}
              >
                {/* 찍히는 효과 */}
                <AnimatePresence>
                  {isStamping && (
                    <motion.div
                      className="absolute inset-0 bg-white"
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </AnimatePresence>

                <span className="relative z-10">
                  {stampCount >= 10 ? "🎉 리워드 받기" : "꾸욱! 스탬프 찍기"}
                </span>
              </motion.button>

              {/* 리워드 안내 */}
              <p
                className="mt-4 text-center text-sm"
                style={{ color: `${currentColor.primary}80` }}
              >
                {stampCount >= 10
                  ? "축하해요! 무료 음료 쿠폰이 발급됐어요 ☕"
                  : `${10 - stampCount}개 더 모으면 리워드!`}
              </p>

              {/* 장식용 스탬프 그림자 */}
              <div
                className="absolute -right-4 -top-4 h-20 w-20 rotate-12 rounded-2xl opacity-10"
                style={{ backgroundColor: currentColor.primary }}
              />
            </motion.div>

            {/* 플로팅 힌트 */}
            <motion.div
              className="absolute -bottom-4 -right-4 rounded-xl bg-white px-4 py-2 shadow-lg md:-right-8"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 }}
              viewport={{ once: true }}
            >
              <span className="text-sm font-medium text-kkookk-navy">
                ✨ 버튼을 눌러보세요!
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* 하단 그라데이션 */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent" />
    </section>
  );
}
