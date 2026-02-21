/**
 * BackgroundRenderer
 * SVG 내 배경 렌더링 (단색/그라데이션/이미지)
 */

import { CARD_VIEWBOX_WIDTH, CARD_VIEWBOX_HEIGHT } from '../types/designV2';
import type { Background } from '../types/designV2';

interface BackgroundRendererProps {
  background: Background;
}

let gradientCounter = 0;

export function BackgroundRenderer({ background }: BackgroundRendererProps) {
  const { type, value } = background;

  if (type === 'color') {
    return (
      <rect
        x={0}
        y={0}
        width={CARD_VIEWBOX_WIDTH}
        height={CARD_VIEWBOX_HEIGHT}
        fill={value}
        rx={0}
      />
    );
  }

  if (type === 'gradient') {
    const id = `bg-grad-${++gradientCounter}`;
    // Parse CSS-like gradient: "linear-gradient(135deg, #color1, #color2)"
    const match = value.match(/linear-gradient\((\d+)deg,\s*([^,]+),\s*([^)]+)\)/);
    if (match) {
      const angle = parseInt(match[1]);
      const rad = ((angle - 90) * Math.PI) / 180;
      const x1 = 50 + 50 * Math.cos(rad + Math.PI);
      const y1 = 50 + 50 * Math.sin(rad + Math.PI);
      const x2 = 50 + 50 * Math.cos(rad);
      const y2 = 50 + 50 * Math.sin(rad);
      return (
        <>
          <defs>
            <linearGradient id={id} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`}>
              <stop offset="0%" stopColor={match[2].trim()} />
              <stop offset="100%" stopColor={match[3].trim()} />
            </linearGradient>
          </defs>
          <rect
            x={0}
            y={0}
            width={CARD_VIEWBOX_WIDTH}
            height={CARD_VIEWBOX_HEIGHT}
            fill={`url(#${id})`}
          />
        </>
      );
    }
    // Fallback: treat as solid color
    return (
      <rect x={0} y={0} width={CARD_VIEWBOX_WIDTH} height={CARD_VIEWBOX_HEIGHT} fill={value} />
    );
  }

  if (type === 'image') {
    return (
      <image
        href={value}
        x={0}
        y={0}
        width={CARD_VIEWBOX_WIDTH}
        height={CARD_VIEWBOX_HEIGHT}
        preserveAspectRatio="xMidYMid slice"
      />
    );
  }

  return null;
}

export default BackgroundRenderer;
