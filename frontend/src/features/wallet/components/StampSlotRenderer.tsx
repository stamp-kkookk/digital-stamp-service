/**
 * StampSlotRenderer
 * 단일 도장 슬롯 SVG 컴포넌트 (채움/빈/애니메이션 3상태)
 * SVG viewBox 좌표계 (0-100) 내에서 렌더링
 */

import { motion } from 'framer-motion';
import type { StampSlot, StampStyle } from '../types/designV2';

interface StampSlotRendererProps {
  slot: StampSlot;
  style: StampStyle;
  filled: boolean;
  isAnimating?: boolean;
  onAnimationComplete?: () => void;
}

const stampDropAnimation = {
  initial: { y: -5, scale: 1.4, opacity: 0, rotate: -12 },
  animate: {
    y: [null, 0.3, 0],
    scale: [null, 0.88, 1],
    opacity: [null, 1, 1],
    rotate: [null, 2, 0],
  },
  transition: {
    duration: 0.8,
    times: [0, 0.55, 1],
    ease: [0.22, 1, 0.36, 1] as number[],
    delay: 0.25,
  },
};

function getShapeRadius(shape: StampStyle['shape'], size: number) {
  const r = size / 2;
  if (shape === 'circle') return r;
  if (shape === 'rounded-square') return r * 0.25;
  return 0; // square
}

function SlotShape({
  slot,
  style,
  filled,
}: {
  slot: StampSlot;
  style: StampStyle;
  filled: boolean;
}) {
  const r = slot.size / 2;
  const rx = getShapeRadius(style.shape, slot.size);
  const color = filled ? style.filledColor : style.emptyColor;

  if (style.shape === 'circle') {
    return (
      <circle
        cx={0}
        cy={0}
        r={r}
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={filled ? 0 : 0.4}
        strokeDasharray={!filled && style.emptyStyle === 'dashed' ? '1.5 1' : undefined}
        opacity={filled ? 1 : 0.4}
      />
    );
  }

  return (
    <rect
      x={-r}
      y={-r}
      width={slot.size}
      height={slot.size}
      rx={rx}
      ry={rx}
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth={filled ? 0 : 0.4}
      strokeDasharray={!filled && style.emptyStyle === 'dashed' ? '1.5 1' : undefined}
      opacity={filled ? 1 : 0.4}
    />
  );
}

function StampIcon({ style, size }: { style: StampStyle; size: number }) {
  const iconSize = size * 0.55;

  if (style.customSvgPath) {
    return (
      <g transform={`scale(${iconSize / 24})`}>
        <path d={style.customSvgPath} fill="white" transform="translate(-12, -12)" />
      </g>
    );
  }

  if (style.customIcon) {
    return (
      <image
        href={style.customIcon}
        x={-iconSize / 2}
        y={-iconSize / 2}
        width={iconSize}
        height={iconSize}
      />
    );
  }

  // Default: checkmark icon
  const s = iconSize * 0.5;
  return (
    <polyline
      points={`${-s * 0.6},${0} ${-s * 0.1},${s * 0.5} ${s * 0.6},${-s * 0.4}`}
      fill="none"
      stroke="white"
      strokeWidth={0.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

export function StampSlotRenderer({
  slot,
  style,
  filled,
  isAnimating,
  onAnimationComplete,
}: StampSlotRendererProps) {
  const rotation = slot.rotation ?? 0;

  if (isAnimating) {
    return (
      <g>
        <motion.g
          transform={`translate(${slot.x}, ${slot.y})`}
          initial={stampDropAnimation.initial}
          animate={stampDropAnimation.animate}
          transition={stampDropAnimation.transition}
          onAnimationComplete={onAnimationComplete}
        >
          <g transform={`rotate(${rotation})`}>
            <SlotShape slot={slot} style={style} filled />
            <StampIcon style={style} size={slot.size} />
          </g>
        </motion.g>
        {/* Shockwave */}
        <motion.circle
          cx={slot.x}
          cy={slot.y}
          initial={{ r: slot.size / 2, opacity: 0.3 }}
          animate={{ r: slot.size * 1.5, opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          fill="none"
          stroke={style.filledColor}
          strokeWidth={0.3}
        />
      </g>
    );
  }

  return (
    <g transform={`translate(${slot.x}, ${slot.y}) rotate(${rotation})`}>
      <SlotShape slot={slot} style={style} filled={filled} />
      {filled && <StampIcon style={style} size={slot.size} />}
      {!filled && (
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={slot.size * 0.35}
          fill={style.emptyColor}
          opacity={0.5}
          textRendering="optimizeLegibility"
        >
          {slot.order}
        </text>
      )}
    </g>
  );
}

export default StampSlotRenderer;
