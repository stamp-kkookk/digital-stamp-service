/**
 * Layout Generators
 * 스탬프 슬롯 위치를 다양한 패턴으로 자동 생성
 * 좌표계: SVG viewBox 0-100 (x), 0-63.29 (y)
 */

import type { StampSlot } from '@/features/wallet/types/designV2';
import { CARD_VIEWBOX_HEIGHT } from '@/features/wallet/types/designV2';

const H = CARD_VIEWBOX_HEIGHT; // 63.29

/** 균등 격자 배치 */
export function generateGridSlots(
  count: number,
  cols: number,
  options?: { padX?: number; padY?: number; size?: number },
): StampSlot[] {
  const { padX = 12, padY = 10, size = 7 } = options ?? {};
  const rows = Math.ceil(count / cols);
  const areaW = 100 - padX * 2;
  const areaH = H - padY * 2;
  const cellW = areaW / cols;
  const cellH = areaH / rows;

  return Array.from({ length: count }, (_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      order: i + 1,
      x: padX + cellW * col + cellW / 2,
      y: padY + cellH * row + cellH / 2,
      size,
    };
  });
}

/** 원형 배치 */
export function generateCircularSlots(
  count: number,
  cx: number = 50,
  cy: number = H / 2,
  radius: number = 22,
  size: number = 6.5,
): StampSlot[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2; // 12시 방향부터
    return {
      order: i + 1,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      size,
    };
  });
}

/** 경로형 배치 (제어점 기반 베지어 커브) */
export function generatePathSlots(
  count: number,
  controlPoints: Array<{ x: number; y: number }>,
  size: number = 6.5,
): StampSlot[] {
  if (controlPoints.length < 2) return generateGridSlots(count, 5);

  // Simple linear interpolation along control points
  const totalSegments = controlPoints.length - 1;
  const slots: StampSlot[] = [];

  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0 : i / (count - 1);
    const segT = t * totalSegments;
    const segIndex = Math.min(Math.floor(segT), totalSegments - 1);
    const localT = segT - segIndex;

    const p0 = controlPoints[segIndex];
    const p1 = controlPoints[segIndex + 1];

    slots.push({
      order: i + 1,
      x: p0.x + (p1.x - p0.x) * localT,
      y: p0.y + (p1.y - p0.y) * localT,
      size,
    });
  }

  return slots;
}

/** 산포형 배치 (시드 기반 의사 난수) */
export function generateScatteredSlots(
  count: number,
  seed: number = 42,
  size: number = 6,
): StampSlot[] {
  const padX = 12;
  const padY = 10;

  // Simple seeded pseudo-random
  let s = seed;
  const rand = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };

  const slots: StampSlot[] = [];
  for (let i = 0; i < count; i++) {
    const x = padX + rand() * (100 - padX * 2);
    const y = padY + rand() * (H - padY * 2);
    const rotation = (rand() - 0.5) * 20;
    slots.push({ order: i + 1, x, y, size, rotation });
  }

  return slots;
}

/** 피라미드/계층형 배치 (1-2-3-... 행) */
export function generateTieredSlots(
  count: number,
  size: number = 6.5,
): StampSlot[] {
  // Determine rows: 1+2+3+... = count
  const tiers: number[] = [];
  let remaining = count;
  let row = 1;
  while (remaining > 0) {
    const thisRow = Math.min(row, remaining);
    tiers.push(thisRow);
    remaining -= thisRow;
    row++;
  }

  const padY = 8;
  const areaH = H - padY * 2;
  const rowHeight = areaH / tiers.length;
  const slots: StampSlot[] = [];
  let order = 1;

  for (let r = 0; r < tiers.length; r++) {
    const cols = tiers[r];
    const rowWidth = 70;
    const startX = (100 - rowWidth) / 2;
    const cellW = cols === 1 ? 0 : rowWidth / (cols - 1);
    const y = padY + rowHeight * r + rowHeight / 2;

    for (let c = 0; c < cols; c++) {
      const x = cols === 1 ? 50 : startX + cellW * c;
      slots.push({ order: order++, x, y, size });
    }
  }

  return slots;
}
