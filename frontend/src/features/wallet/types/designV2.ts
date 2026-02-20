/**
 * DesignJson v2 Schema
 *
 * SVG viewBox 기반 정규화 좌표 (0-100) 사용.
 * stampCount(정수)와 stampSlots[].order를 비교하여 채움/빈 판별.
 * 백엔드 변경 없이 designJson MEDIUMTEXT에 저장.
 */

import { z } from 'zod/v4';

// ─── Stamp Slot ─────────────────────────────────────────────

export const stampSlotSchema = z.object({
  order: z.number().int().min(1),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  size: z.number().min(1).max(50),
  rotation: z.number().optional(),
});

export type StampSlot = z.infer<typeof stampSlotSchema>;

// ─── Stamp Style ────────────────────────────────────────────

export const stampStyleSchema = z.object({
  shape: z.enum(['circle', 'square', 'rounded-square']),
  filledColor: z.string(),
  emptyColor: z.string(),
  emptyStyle: z.enum(['solid', 'dashed', 'outline']),
  icon: z.string().nullable(),
  customSvgPath: z.string().nullable(),
  customIcon: z.string().nullable(),
});

export type StampStyle = z.infer<typeof stampStyleSchema>;

// ─── Design Element ─────────────────────────────────────────

export const designElementSchema = z.object({
  type: z.enum(['text', 'image', 'svg-path', 'shape']),
  x: z.number(),
  y: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  rotation: z.number().optional(),
  content: z.string(),
  style: z.record(z.string(), z.string()).optional(),
});

export type DesignElement = z.infer<typeof designElementSchema>;

// ─── Background ─────────────────────────────────────────────

export const backgroundSchema = z.object({
  type: z.enum(['color', 'gradient', 'image']),
  value: z.string(),
});

export type Background = z.infer<typeof backgroundSchema>;

// ─── Reward Slot ────────────────────────────────────────────

export const rewardSlotSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  size: z.number().min(1).max(50),
  label: z.string().optional(),
});

export type RewardSlot = z.infer<typeof rewardSlotSchema>;

// ─── DesignJson V2 ──────────────────────────────────────────

export const designJsonV2Schema = z.object({
  version: z.literal(2),
  front: z.object({
    background: backgroundSchema,
    elements: z.array(designElementSchema),
  }),
  back: z.object({
    background: backgroundSchema,
    elements: z.array(designElementSchema),
    stampSlots: z.array(stampSlotSchema).min(1),
    stampStyle: stampStyleSchema,
    rewardSlot: rewardSlotSchema.nullable(),
  }),
});

export type DesignJsonV2 = z.infer<typeof designJsonV2Schema>;

// ─── SVG viewBox constants ──────────────────────────────────

/** 카드 비율 1.58:1 → viewBox "0 0 100 63.29" */
export const CARD_VIEWBOX_WIDTH = 100;
export const CARD_VIEWBOX_HEIGHT = 63.29;
export const CARD_VIEWBOX = `0 0 ${CARD_VIEWBOX_WIDTH} ${CARD_VIEWBOX_HEIGHT}`;

// ─── Template metadata ──────────────────────────────────────

export interface StampCardTemplate {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  goalStampCount: number;
  design: DesignJsonV2;
  thumbnailFront: string;
  thumbnailBack: string;
}
