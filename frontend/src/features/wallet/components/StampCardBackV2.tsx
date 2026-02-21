/**
 * StampCardBackV2
 * SVG 기반 위치 기반 도장 렌더러 (v2 designJson)
 * viewBox "0 0 100 63.29" 정규화 좌표로 어떤 화면에서도 동일한 위치 보장
 */

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { DesignJsonV2 } from '../types/designV2';
import { CARD_VIEWBOX } from '../types/designV2';
import { StampSlotRenderer } from './StampSlotRenderer';
import { DesignElementRenderer } from './DesignElementRenderer';
import { BackgroundRenderer } from './BackgroundRenderer';

interface StampCardBackV2Props {
  design: DesignJsonV2;
  stampCount: number;
  className?: string;
  onStampRequest?: () => void;
  animatingStampIndex?: number;
  onAnimationComplete?: () => void;
}

export function StampCardBackV2({
  design,
  stampCount,
  className,
  onStampRequest,
  animatingStampIndex,
  onAnimationComplete,
}: StampCardBackV2Props) {
  const { back } = design;
  const sortedSlots = [...back.stampSlots].sort((a, b) => a.order - b.order);
  const goalCount = sortedSlots.length;
  const isComplete = stampCount >= goalCount;

  // 다음 도장 위치 슬롯 (적립 버튼용)
  const nextSlot =
    !isComplete && animatingStampIndex === undefined
      ? sortedSlots.find((s) => s.order === stampCount + 1)
      : null;

  return (
    <div
      className={cn(
        'w-full aspect-[1.58/1] rounded-2xl overflow-hidden relative',
        'select-none shadow-cardstock',
        className,
      )}
    >
      <svg
        viewBox={CARD_VIEWBOX}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background */}
        <BackgroundRenderer background={back.background} />

        {/* Design elements (decorations, text, etc.) */}
        {back.elements.map((el, i) => (
          <DesignElementRenderer key={i} element={el} />
        ))}

        {/* Stamp slots */}
        {sortedSlots.map((slot) => {
          const filled = slot.order <= stampCount;
          const isAnimating =
            animatingStampIndex !== undefined && slot.order === animatingStampIndex + 1 && filled;
          // 다음 적립 슬롯은 SVG에서 렌더하지 않음 (HTML 버튼으로 대체)
          const isNextSlot = nextSlot && slot.order === nextSlot.order && onStampRequest;
          if (isNextSlot) return null;

          return (
            <StampSlotRenderer
              key={slot.order}
              slot={slot}
              style={back.stampStyle}
              filled={filled}
              isAnimating={isAnimating}
              onAnimationComplete={isAnimating ? onAnimationComplete : undefined}
            />
          );
        })}
      </svg>

      {/* 적립 요청 버튼 — SVG 위에 HTML로 오버레이 (접근성 + 클릭 이벤트) */}
      {nextSlot && onStampRequest && (
        <motion.button
          type="button"
          className="absolute flex items-center justify-center rounded-full border-2 border-dashed border-kkookk-orange-400 bg-kkookk-orange-50 text-kkookk-orange-500 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-kkookk-orange-500"
          style={{
            left: `${nextSlot.x}%`,
            top: `${(nextSlot.y / 63.29) * 100}%`,
            width: `${nextSlot.size}%`,
            height: `${(nextSlot.size / 63.29) * 100}%`,
          }}
          initial={{ scale: 0, opacity: 0, x: '-50%', y: '-50%' }}
          animate={{ scale: [1, 1.15, 1], opacity: 1, x: '-50%', y: '-50%' }}
          transition={{
            scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
            opacity: { duration: 0.25 },
          }}
          onClick={(e) => {
            e.stopPropagation();
            onStampRequest();
          }}
          aria-label="스탬프 적립 요청"
        >
          <svg viewBox="0 0 24 24" className="w-1/2 h-1/2" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </motion.button>
      )}

      {/* Card texture overlay */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%, rgba(0,0,0,0.04) 100%)',
        }}
      />
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/20 pointer-events-none" />
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.7), inset 1px 0 1px rgba(255,255,255,0.3), inset 0 -1px 2px rgba(0,0,0,0.06), inset -1px 0 1px rgba(0,0,0,0.02)',
        }}
      />
    </div>
  );
}

export default StampCardBackV2;
