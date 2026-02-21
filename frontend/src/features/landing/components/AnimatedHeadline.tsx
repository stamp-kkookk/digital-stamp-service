/**
 * AnimatedHeadline
 * 헤드라인 - 글자별 슬라이드 애니메이션
 */

import { useEffect, useState } from "react";

export function AnimatedHeadline() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="mb-8 md:mb-10">
      {/* Mobile Version (< md) */}
      <div className="md:hidden">
        {/* Line 1 - 단골을 부르는 치트키 */}
        <h2
          className={`font-bold transition-all duration-700
            text-2xl sm:text-3xl
            leading-tight
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          단골을 부르는 치트키
        </h2>

        {/* Line 2 - 꾸욱 (강조) */}
        <div
          className={`font-black text-5xl leading-none mt-3 sm:mt-4
            bg-gradient-to-r from-[#FF6A00] to-[#FF9100] bg-clip-text text-transparent
            transition-all duration-700
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          꾸욱
        </div>

        {/* Line 3 - 서브 텍스트 */}
        <p
          className={`text-black transition-all duration-700
            text-base sm:text-lg
            mt-2 sm:mt-6
            leading-relaxed
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          커스텀 디지털 스탬프로 브랜딩을 완성하세요.
        </p>
      </div>

      {/* Desktop Version (>= md) */}
      <div className="hidden md:block">
        {/* Line 1 - 그라디언트 텍스트 */}
        <h2
          className={`font-bold transition-all duration-700
            text-2xl lg:text-3xl
            bg-gradient-to-r from-[#FF6A00] to-[#FF8C00] bg-clip-text text-transparent
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          사장님, 스탬프 카드 아직도 종이로 만드시나요?
        </h2>

        {/* Line 2 - 부분 그라디언트 */}
        <h2
          className={`font-semibold transition-all duration-700
            text-6xl lg:text-7xl xl:text-8xl
            mt-6
            leading-[1.15]
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <span>올인원 디지털 스탬프 카드</span>
          <br />
          <span className="font-black bg-gradient-to-r from-[#FF6A00] to-[#FF9100] bg-clip-text text-transparent">
            꾸욱
          </span>
          입니다.
        </h2>

        {/* Line 3 - 서브 텍스트 */}
        <p
          className={`text-black transition-all duration-700
            text-lg lg:text-xl
            mt-6
            leading-relaxed
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          디지털로 디자인부터 고객 발급까지 한번에!
          <br />
          사장님의 소중한 아이덴티티를, 꾸욱 눌러 채워드립니다.
        </p>
      </div>
    </div>
  );
}
