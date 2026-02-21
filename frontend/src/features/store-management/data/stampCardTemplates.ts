/**
 * Stamp Card Templates (v2)
 * 빈 커스텀 템플릿 (직접 만들기)
 */

import type { DesignJsonV2, StampStyle } from '@/features/wallet/types/designV2';
import type { StampCardTemplate } from '@/features/wallet/types/designV2';
import {
  generateGridSlots,
} from '../utils/layoutGenerators';

// ─── Shared stamp styles ────────────────────────────────────

const circleStampStyle = (filled: string, empty: string): StampStyle => ({
  shape: 'circle',
  filledColor: filled,
  emptyColor: empty,
  emptyStyle: 'dashed',
  icon: null,
  customSvgPath: null,
  customIcon: null,
});

// ─── 커스텀 기본 디자인 (직접 만들기) ────────────────────

const blankDesign: DesignJsonV2 = {
  version: 2,
  front: {
    background: { type: 'color', value: '#F8FAFC' },
    elements: [],
  },
  back: {
    background: { type: 'color', value: '#FFFFFF' },
    elements: [],
    stampSlots: generateGridSlots(8, 4, { padX: 10, padY: 8, size: 10 }),
    stampStyle: circleStampStyle('#94A3B8', '#E2E8F0'),
    rewardSlot: null,
  },
};

// ─── Template Registry ──────────────────────────────────────

export const STAMP_CARD_TEMPLATES: StampCardTemplate[] = [
  {
    id: 'v2-blank',
    name: 'BLANK',
    nameKo: '직접 만들기',
    description: '빈 캔버스에서 시작',
    goalStampCount: 8,
    design: blankDesign,
    thumbnailFront: '',
    thumbnailBack: '',
  },
];

export function getTemplateById(id: string): StampCardTemplate | undefined {
  return STAMP_CARD_TEMPLATES.find((t) => t.id === id);
}
