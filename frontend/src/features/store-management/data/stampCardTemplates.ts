/**
 * Stamp Card Templates (v2)
 * 고품질 2종 + 빈 커스텀 템플릿
 */

import type { DesignJsonV2, StampStyle } from '@/features/wallet/types/designV2';
import type { StampCardTemplate } from '@/features/wallet/types/designV2';
import {
  generateGridSlots,
  generateCircularSlots,
  generatePathSlots,
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

const squareStampStyle = (filled: string, empty: string): StampStyle => ({
  shape: 'square',
  filledColor: filled,
  emptyColor: empty,
  emptyStyle: 'outline',
  icon: null,
  customSvgPath: null,
  customIcon: null,
});

// ─── 1. 소요 SOYO — 자연/정원 테마 ─────────────────────────

const soyoDesign: DesignJsonV2 = {
  version: 2,
  front: {
    background: { type: 'gradient', value: 'linear-gradient(160deg, #E8F5E9, #C8E6C9)' },
    elements: [
      // Decorative leaves
      { type: 'svg-path', x: 78, y: 10, content: 'M0,0 Q6,-12 12,0 Q6,10 0,0 Z', style: { fill: '#66BB6A', stroke: 'none', opacity: '0.25' } },
      { type: 'svg-path', x: 85, y: 25, content: 'M0,0 Q4,-8 8,0 Q4,7 0,0 Z', style: { fill: '#81C784', stroke: 'none', opacity: '0.2' } },
      { type: 'svg-path', x: 72, y: 42, content: 'M0,0 Q5,-10 10,0 Q5,8 0,0 Z', style: { fill: '#A5D6A7', stroke: 'none', opacity: '0.18' } },
      { type: 'svg-path', x: 5, y: 48, content: 'M0,0 Q3,-6 6,0 Q3,5 0,0 Z', style: { fill: '#81C784', stroke: 'none', opacity: '0.15' } },
      // Branch line
      { type: 'svg-path', x: 70, y: 8, content: 'M0,0 C8,15 20,25 12,45', style: { stroke: '#4CAF50', strokeWidth: '0.3', fill: 'none', opacity: '0.2' } },
      // Title text
      { type: 'text', x: 12, y: 20, content: '소요', style: { fontSize: '10', fontWeight: 'bold', fill: '#2E7D32' } },
      { type: 'text', x: 12, y: 32, content: 'SOYO', style: { fontSize: '4', fill: '#4CAF50', letterSpacing: '0.3' } },
      { type: 'text', x: 12, y: 40, content: '자연 속 한 잔의 여유', style: { fontSize: '2.5', fill: '#66BB6A' } },
    ],
  },
  back: {
    background: { type: 'color', value: '#F1F8E9' },
    elements: [
      // Background leaf decorations
      { type: 'svg-path', x: 88, y: 5, content: 'M0,0 Q5,-10 10,0 Q5,8 0,0 Z', style: { fill: '#C8E6C9', stroke: 'none', opacity: '0.4' } },
      { type: 'svg-path', x: 5, y: 50, content: 'M0,0 Q4,-8 8,0 Q4,6 0,0 Z', style: { fill: '#C8E6C9', stroke: 'none', opacity: '0.35' } },
      { type: 'svg-path', x: 92, y: 48, content: 'M0,0 Q3,-6 6,0 Q3,5 0,0 Z', style: { fill: '#A5D6A7', stroke: 'none', opacity: '0.3' } },
      // Header
      { type: 'text', x: 50, y: 7, content: '소요 스탬프 여정', style: { fontSize: '3', fontWeight: 'bold', fill: '#2E7D32', textAnchor: 'middle' } },
      // Decorative path connecting stamps
      { type: 'svg-path', x: 0, y: 0, content: 'M15,20 C25,45 45,10 55,40 C65,15 75,45 85,25', style: { stroke: '#A5D6A7', strokeWidth: '0.3', fill: 'none', opacity: '0.4' } },
    ],
    stampSlots: generatePathSlots(8, [
      { x: 15, y: 20 },
      { x: 35, y: 45 },
      { x: 60, y: 18 },
      { x: 85, y: 45 },
    ], 6),
    stampStyle: circleStampStyle('#2E7D32', '#A5D6A7'),
    rewardSlot: null,
  },
};

// ─── 2. 구활자인쇄소 — 전통 활판인쇄 테마 ──────────────────

const guhlDesign: DesignJsonV2 = {
  version: 2,
  front: {
    background: { type: 'gradient', value: 'linear-gradient(135deg, #1A1A1A, #2D2D2D)' },
    elements: [
      // Double border frame
      { type: 'shape', x: 3, y: 3, width: 94, height: 57, content: '', style: { fill: 'none', stroke: '#C5A55A', strokeWidth: '0.4', borderRadius: '2' } },
      { type: 'shape', x: 5, y: 5, width: 90, height: 53, content: '', style: { fill: 'none', stroke: '#C5A55A', strokeWidth: '0.2', borderRadius: '1' } },
      // Corner decorations (small squares)
      { type: 'shape', x: 6, y: 6, width: 3, height: 3, content: '', style: { fill: 'none', stroke: '#C5A55A', strokeWidth: '0.2' } },
      { type: 'shape', x: 91, y: 6, width: 3, height: 3, content: '', style: { fill: 'none', stroke: '#C5A55A', strokeWidth: '0.2' } },
      { type: 'shape', x: 6, y: 52, width: 3, height: 3, content: '', style: { fill: 'none', stroke: '#C5A55A', strokeWidth: '0.2' } },
      { type: 'shape', x: 91, y: 52, width: 3, height: 3, content: '', style: { fill: 'none', stroke: '#C5A55A', strokeWidth: '0.2' } },
      // Horizontal separator lines
      { type: 'svg-path', x: 15, y: 28, content: 'M0,0 L70,0', style: { stroke: '#C5A55A', strokeWidth: '0.15', opacity: '0.5' } },
      { type: 'svg-path', x: 15, y: 44, content: 'M0,0 L70,0', style: { stroke: '#C5A55A', strokeWidth: '0.15', opacity: '0.5' } },
      // Title
      { type: 'text', x: 50, y: 22, content: '구활자인쇄소', style: { fontSize: '6', fontWeight: 'bold', fill: '#C5A55A', textAnchor: 'middle' } },
      { type: 'text', x: 50, y: 36, content: 'LETTERPRESS', style: { fontSize: '3', fill: '#8B7D4A', textAnchor: 'middle', letterSpacing: '0.5' } },
      { type: 'text', x: 50, y: 50, content: '활자의 숨결을 담다', style: { fontSize: '2.5', fill: '#8B7D4A', textAnchor: 'middle' } },
    ],
  },
  back: {
    background: { type: 'color', value: '#F5F0E8' },
    elements: [
      // Border frame
      { type: 'shape', x: 3, y: 3, width: 94, height: 57, content: '', style: { fill: 'none', stroke: '#C5A55A', strokeWidth: '0.3', borderRadius: '1' } },
      // Header
      { type: 'text', x: 50, y: 7, content: '활판 도장', style: { fontSize: '3', fontWeight: 'bold', fill: '#333', textAnchor: 'middle' } },
      // Decorative coin-like circle in center
      { type: 'svg-path', x: 50, y: 34, content: 'M-22,0 A22,22 0 1,0 22,0 A22,22 0 1,0 -22,0 Z', style: { fill: 'none', stroke: '#D4C4B0', strokeWidth: '0.3', opacity: '0.4' } },
      { type: 'svg-path', x: 50, y: 34, content: 'M-20,0 A20,20 0 1,0 20,0 A20,20 0 1,0 -20,0 Z', style: { fill: 'none', stroke: '#D4C4B0', strokeWidth: '0.15', opacity: '0.3' } },
    ],
    stampSlots: generateCircularSlots(8, 50, 34, 18, 5.5),
    stampStyle: squareStampStyle('#8B0000', '#D4C4B0'),
    rewardSlot: null,
  },
};

// ─── 3. 빈 커스텀 (직접 만들기) ─────────────────────────────

const blankDesign: DesignJsonV2 = {
  version: 2,
  front: {
    background: { type: 'color', value: '#FFFFFF' },
    elements: [],
  },
  back: {
    background: { type: 'color', value: '#FFFFFF' },
    elements: [],
    stampSlots: generateGridSlots(8, 4, { padX: 12, padY: 12, size: 7 }),
    stampStyle: circleStampStyle('#333333', '#D4D4D4'),
    rewardSlot: null,
  },
};

// ─── Template Registry ──────────────────────────────────────

export const STAMP_CARD_TEMPLATES: StampCardTemplate[] = [
  {
    id: 'v2-blank',
    name: 'BLANK',
    nameKo: '직접 커스텀',
    description: '빈 캔버스에서 시작',
    goalStampCount: 8,
    design: blankDesign,
    thumbnailFront: '',
    thumbnailBack: '',
  },
  {
    id: 'v2-soyo',
    name: 'SOYO',
    nameKo: '소요 SOYO',
    description: '자연/정원 테마 카페',
    goalStampCount: 8,
    design: soyoDesign,
    thumbnailFront: '',
    thumbnailBack: '',
  },
  {
    id: 'v2-guhl',
    name: 'GUHL',
    nameKo: '구활자인쇄소',
    description: '전통 활판인쇄 테마',
    goalStampCount: 8,
    design: guhlDesign,
    thumbnailFront: '',
    thumbnailBack: '',
  },
];

export function getTemplateById(id: string): StampCardTemplate | undefined {
  return STAMP_CARD_TEMPLATES.find((t) => t.id === id);
}
