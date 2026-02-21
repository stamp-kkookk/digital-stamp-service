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
  isDesigner?: boolean;
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
  isDesigner,
}: {
  slot: StampSlot;
  style: StampStyle;
  filled: boolean;
  isDesigner?: boolean;
}) {
  const r = slot.size / 2;
  const rx = getShapeRadius(style.shape, slot.size);
  const color = filled ? style.filledColor : style.emptyColor;

  // emptyStyle === 'none': in designer show ghost outline, in display hide entirely
  if (!filled && style.emptyStyle === 'none') {
    if (!isDesigner) return null;
    // Designer ghost: faint dashed border to indicate slot position
    if (style.shape === 'circle') {
      return (
        <circle
          cx={0} cy={0} r={r}
          fill="none"
          stroke={style.emptyColor}
          strokeWidth={0.3}
          strokeDasharray="1.5 1"
          opacity={0.25}
        />
      );
    }
    return (
      <rect
        x={-r} y={-r} width={slot.size} height={slot.size}
        rx={rx} ry={rx}
        fill="none"
        stroke={style.emptyColor}
        strokeWidth={0.3}
        strokeDasharray="1.5 1"
        opacity={0.25}
      />
    );
  }

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
  const isTransparentBg = style.filledColor === 'transparent';
  const iconColor = isTransparentBg ? (style.emptyColor || '#333') : 'white';

  if (style.customSvgPath) {
    return (
      <g transform={`scale(${iconSize / 24})`}>
        <path d={style.customSvgPath} fill={iconColor} transform="translate(-12, -12)" />
      </g>
    );
  }

  if (style.customIcon) {
    const imgSize = size * 0.85;
    return (
      <image
        href={style.customIcon}
        x={-imgSize / 2}
        y={-imgSize / 2}
        width={imgSize}
        height={imgSize}
      />
    );
  }

  const iconType = style.icon || 'checkmark';
  const s = iconSize * 0.5;

  if (iconType === 'smiley') {
    return (
      <g>
        <circle cx={0} cy={0} r={s} fill="none" stroke={iconColor} strokeWidth={0.6} />
        <circle cx={-s * 0.35} cy={-s * 0.2} r={s * 0.12} fill={iconColor} />
        <circle cx={s * 0.35} cy={-s * 0.2} r={s * 0.12} fill={iconColor} />
        <path
          d={`M${-s * 0.4},${s * 0.2} Q0,${s * 0.65} ${s * 0.4},${s * 0.2}`}
          fill="none"
          stroke={iconColor}
          strokeWidth={0.5}
          strokeLinecap="round"
        />
      </g>
    );
  }

  if (iconType === 'star') {
    const points: string[] = [];
    for (let i = 0; i < 5; i++) {
      const outerAngle = (Math.PI / 2) * -1 + (2 * Math.PI * i) / 5;
      const innerAngle = outerAngle + Math.PI / 5;
      points.push(`${Math.cos(outerAngle) * s},${Math.sin(outerAngle) * s}`);
      points.push(`${Math.cos(innerAngle) * s * 0.4},${Math.sin(innerAngle) * s * 0.4}`);
    }
    return (
      <polygon
        points={points.join(' ')}
        fill={iconColor}
      />
    );
  }

  // Default: checkmark
  return (
    <polyline
      points={`${-s * 0.6},${0} ${-s * 0.1},${s * 0.5} ${s * 0.6},${-s * 0.4}`}
      fill="none"
      stroke={iconColor}
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
  isDesigner,
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
      <SlotShape slot={slot} style={style} filled={filled} isDesigner={isDesigner} />
      {filled && <StampIcon style={style} size={slot.size} />}
      {!filled && (style.emptyStyle !== 'none' || isDesigner) && (
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={slot.size * 0.35}
          fill={style.emptyColor}
          opacity={isDesigner && style.emptyStyle === 'none' ? 0.25 : 0.5}
          textRendering="optimizeLegibility"
        >
          {slot.order}
        </text>
      )}
    </g>
  );
}

export default StampSlotRenderer;
