/**
 * StampCardPreview
 * 스탬프 카드의 앞면(배경)과 뒷면(도장 찍는 곳)을 겹쳐서 보여주는 카드
 */

import { useState } from "react";

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

  // 스탬프 카드 콘텐츠 (배경 이미지만) — 지갑 홈 StampCardFront 질감 적용
  const stampCardContent = (
    <div
      className="w-full aspect-[1.58/1] rounded-2xl overflow-hidden relative select-none texture-cardstock shadow-cardstock bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/20 pointer-events-none" />
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          boxShadow: 'inset 0 -1px 2px rgba(0,0,0,0.08), inset 0 1px 1px rgba(255,255,255,0.15)',
        }}
      />
    </div>
  );

  // 스탬프 시트 콘텐츠 (쿠폰 시트) — 지갑 홈 StampCardBack 질감 적용
  const stampSheetContent = (
    <div
      className="w-full aspect-[1.58/1] rounded-2xl overflow-hidden relative select-none texture-cardstock-white shadow-cardstock bg-cover bg-center"
      style={{ backgroundImage: `url(${foregroundImage})` }}
    >
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-slate-200/80 pointer-events-none" />
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          boxShadow: 'inset 0 -1px 2px rgba(0,0,0,0.04), inset 0 1px 1px rgba(255,255,255,0.6)',
        }}
      />
    </div>
  );

  return (
    <>
      {/* Mobile Version (< md) - 3D Flip */}
      <div
        className="md:hidden perspective-1000 cursor-pointer
          w-[320px] h-[200px]"
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
        className="hidden md:block relative p-5 transition-all duration-500 bg-white/0 group
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
