/**
 * StampCardPreview
 * 스탬프 카드의 앞면(배경)과 뒷면(도장 찍는 곳)을 겹쳐서 보여주는 카드
 */

import { useState } from "react";
import { Coffee } from "lucide-react";

export interface StampCardPreviewProps {
  foregroundImage: string;
  backgroundImage: string;
  storeName: string;
  stampCount: number;
  expiryDays: number;
}

export function StampCardPreview({
  foregroundImage,
  backgroundImage,
  storeName,
  stampCount,
  expiryDays,
}: StampCardPreviewProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleFlip();
    }
  };

  // 스탬프 카드 콘텐츠 (재사용)
  const stampCardContent = (
    <div
      className="w-full aspect-[1.58/1] rounded-none p-4 text-white shadow-luxury relative overflow-hidden bg-cover bg-center border border-white/15"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* 배경 그라데이션 오버레이 (가독성 향상) */}
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/30 to-black/10 rounded-none" />

      {/* 상단 하이라이트 */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/40 to-transparent" />

      {/* StampCardItem 스타일 */}
      <div className="relative z-10 flex flex-col justify-between h-full">
        {/* 헤더 */}
        <div className="flex items-start justify-between">
          <span className="text-base font-bold drop-shadow-lg">
            {storeName}
          </span>
          <span className="bg-white/25 px-2.5 py-1 rounded-full text-[10px] backdrop-blur-md font-semibold border border-white/20 shadow-sm">
            D-{expiryDays}
          </span>
        </div>

        {/* 푸터 */}
        <div>
          <p className="text-white/70 text-[10px] font-medium mb-1 tracking-wide uppercase">
            현재 스탬프
          </p>
          <div className="flex items-baseline gap-1">
            <p className="text-4xl font-extrabold leading-none text-white drop-shadow-lg tracking-tight">
              {stampCount}
            </p>
            <span className="text-lg font-semibold text-white/80">개</span>
          </div>
        </div>
      </div>

      {/* 배경 아이콘 */}
      <Coffee
        className="absolute w-24 h-24 transform -right-2 -bottom-3 text-white/8 rotate-12"
        strokeWidth={0.8}
      />

      {/* 장식 요소 */}
      <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-kkookk-orange-500/5 blur-2xl" />
    </div>
  );

  // 스탬프 시트 콘텐츠 (재사용)
  const stampSheetContent = (
    <div
      className="w-full aspect-[1.58/1] rounded-none shadow-card-stack relative overflow-hidden border border-white/10"
      style={{
        backgroundImage: `url(${foregroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* 상단 하이라이트 */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/30 to-transparent" />
    </div>
  );

  return (
    <>
      {/* Mobile Version (< md) - 3D Flip */}
      <div
        className="md:hidden perspective-1000 cursor-pointer
          w-[360px] h-[200px]"
        onClick={handleFlip}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`스탬프 카드 - ${storeName} - 탭하여 ${isFlipped ? "카드" : "시트"} 보기`}
      >
        <div
          className={`relative w-full h-full preserve-3d transition-transform duration-[400ms] ease-out transform-gpu ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Front: Stamp Card (Background) */}
          <div className="absolute inset-0 flex items-center justify-center backface-hidden">
            <div className="w-full px-4">{stampCardContent}</div>
          </div>

          {/* Back: Stamp Sheet (Foreground) */}
          <div className="absolute inset-0 flex items-center justify-center backface-hidden rotate-y-180">
            <div className="w-full px-4">{stampSheetContent}</div>
          </div>
        </div>
      </div>

      {/* Desktop Version (>= md) - Layered Design */}
      <div
        className="hidden md:block relative p-5 transition-all duration-500 bg-white/0 backdrop-blur-sm group rounded-none
          w-[473px] h-[425px]
          lg:w-[540px] lg:h-[486px]"
      >
        {/* 스탬프 뒷면 (도장 찍는 곳) - 왼쪽 상단 */}
        <div className="absolute transition-all duration-500 ease-out w-[389px] lg:w-[389px] top-5 left-5 group-hover:opacity-40">
          {stampSheetContent}
        </div>

        {/* 스탬프 카드 배경 - 오른쪽 하단 */}
        <div className="absolute transition-all duration-500 ease-out right-3 bottom-16 w-[432px] lg:w-[432px] group-hover:scale-[1.03] group-hover:-translate-y-1">
          {stampCardContent}
        </div>
      </div>
    </>
  );
}
