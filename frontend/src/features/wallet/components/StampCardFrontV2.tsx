/**
 * StampCardFrontV2
 * SVG 기반 앞면 렌더러 (v2 designJson)
 * 배경 + 텍스트/이미지/장식 요소
 */

import { cn } from '@/lib/utils';
import type { DesignJsonV2 } from '../types/designV2';
import { CARD_VIEWBOX } from '../types/designV2';
import { DesignElementRenderer } from './DesignElementRenderer';
import { BackgroundRenderer } from './BackgroundRenderer';

interface StampCardFrontV2Props {
  design: DesignJsonV2;
  className?: string;
}

export function StampCardFrontV2({ design, className }: StampCardFrontV2Props) {
  const { front } = design;

  return (
    <div
      className={cn(
        'w-full aspect-[1.58/1] rounded-2xl overflow-hidden relative',
        'select-none texture-cardstock shadow-cardstock',
        className,
      )}
    >
      <svg
        viewBox={CARD_VIEWBOX}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <BackgroundRenderer background={front.background} />
        {front.elements.map((el, i) => (
          <DesignElementRenderer key={i} element={el} />
        ))}
      </svg>

      {/* Card texture overlays */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%, rgba(0,0,0,0.06) 100%)',
        }}
      />
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/15 pointer-events-none" />
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.18), inset 1px 0 1px rgba(255,255,255,0.08), inset 0 -1px 2px rgba(0,0,0,0.10), inset -1px 0 1px rgba(0,0,0,0.04)',
        }}
      />
    </div>
  );
}

export default StampCardFrontV2;
