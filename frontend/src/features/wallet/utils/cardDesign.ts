/**
 * Card design utilities
 * Parses designJson from API and maps to visual styles
 *
 * Version detection:
 * - v1 COLOR: {"color":"orange"}
 * - v1 IMAGE: {"backgroundImage":"data:...","stampImage":"data:..."}
 * - v2 CUSTOM: {"version":2,"front":{...},"back":{stampSlots:[...],...}}
 */

import type { DesignJsonV2 } from '../types/designV2';
import { designJsonV2Schema } from '../types/designV2';

export interface CardDesignStyle {
  bgGradient: string;
  shadowColor: string;
  stampColor: string;
  backgroundImage: string | null;
  stampImage: string | null;
}

const COLOR_MAP: Record<string, Pick<CardDesignStyle, 'bgGradient' | 'shadowColor' | 'stampColor'>> = {
  orange: {
    bgGradient: 'from-[var(--color-kkookk-orange-500)] to-[#E04F00]',
    shadowColor: 'shadow-orange-200',
    stampColor: 'bg-kkookk-orange-500',
  },
  indigo: {
    bgGradient: 'from-indigo-500 to-indigo-700',
    shadowColor: 'shadow-indigo-200',
    stampColor: 'bg-indigo-500',
  },
  emerald: {
    bgGradient: 'from-emerald-500 to-emerald-700',
    shadowColor: 'shadow-emerald-200',
    stampColor: 'bg-emerald-500',
  },
  green: {
    bgGradient: 'from-emerald-500 to-emerald-700',
    shadowColor: 'shadow-emerald-200',
    stampColor: 'bg-emerald-500',
  },
  purple: {
    bgGradient: 'from-purple-500 to-purple-700',
    shadowColor: 'shadow-purple-200',
    stampColor: 'bg-purple-500',
  },
  rose: {
    bgGradient: 'from-rose-500 to-rose-700',
    shadowColor: 'shadow-rose-200',
    stampColor: 'bg-rose-500',
  },
  blue: {
    bgGradient: 'from-blue-500 to-blue-700',
    shadowColor: 'shadow-blue-200',
    stampColor: 'bg-blue-500',
  },
  navy: {
    bgGradient: 'from-slate-700 to-slate-900',
    shadowColor: 'shadow-slate-200',
    stampColor: 'bg-slate-700',
  },
};

const DEFAULT_COLOR = COLOR_MAP.orange;

/**
 * Parse designJson string and return card visual styles
 *
 * COLOR type: {"color":"purple"} → gradient + stamp color
 * IMAGE type: {"backgroundImage":"data:image/...","stampImage":"data:image/..."} → background image + stamp image
 */
export function parseDesignJson(designJson: string | null): CardDesignStyle {
  if (!designJson) {
    return { ...DEFAULT_COLOR, backgroundImage: null, stampImage: null };
  }

  try {
    const parsed = JSON.parse(designJson);

    // IMAGE type — has backgroundImage
    if (parsed.backgroundImage) {
      return {
        bgGradient: '',
        shadowColor: 'shadow-slate-200',
        stampColor: 'bg-kkookk-navy',
        backgroundImage: parsed.backgroundImage,
        stampImage: parsed.stampImage || null,
      };
    }

    // COLOR type — has color
    const colorStyle = COLOR_MAP[parsed.color] ?? DEFAULT_COLOR;
    return {
      ...colorStyle,
      backgroundImage: null,
      stampImage: null,
    };
  } catch {
    return { ...DEFAULT_COLOR, backgroundImage: null, stampImage: null };
  }
}

/** Check if a designJson string represents v2 format */
export function isDesignV2(designJson: string | null): boolean {
  if (!designJson) return false;
  try {
    const parsed = JSON.parse(designJson);
    return parsed.version === 2;
  } catch {
    return false;
  }
}

/** Parse v2 designJson with Zod validation, returns null on failure */
export function parseDesignJsonV2(designJson: string | null): DesignJsonV2 | null {
  if (!designJson) return null;
  try {
    const parsed = JSON.parse(designJson);
    if (parsed.version !== 2) return null;
    const result = designJsonV2Schema.safeParse(parsed);
    if (result.success) return result.data;
    console.warn('DesignJson v2 validation failed:', result.error);
    return null;
  } catch {
    return null;
  }
}
