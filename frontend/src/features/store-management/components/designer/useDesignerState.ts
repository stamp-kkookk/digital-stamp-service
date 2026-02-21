/**
 * useDesignerState
 * Designer state management with undo/redo (30-step history)
 */

import { useReducer, useCallback } from 'react';
import type { DesignJsonV2, StampSlot, StampStyle, Background, DesignElement } from '@/features/wallet/types/designV2';

const MAX_HISTORY = 30;

type DesignerAction =
  | { type: 'SET_DESIGN'; design: DesignJsonV2 }
  | { type: 'MOVE_SLOT'; order: number; x: number; y: number }
  | { type: 'MOVE_SLOT_PREVIEW'; order: number; x: number; y: number }
  | { type: 'RESIZE_SLOT'; order: number; size: number }
  | { type: 'RESIZE_SLOT_PREVIEW'; order: number; size: number }
  | { type: 'ROTATE_SLOT'; order: number; rotation: number }
  | { type: 'SET_STAMP_STYLE'; style: Partial<StampStyle> }
  | { type: 'SET_BACK_BACKGROUND'; background: Background }
  | { type: 'SET_FRONT_BACKGROUND'; background: Background }
  | { type: 'SET_STAMP_SLOTS'; slots: StampSlot[] }
  | { type: 'ADD_STAMP_SLOT' }
  | { type: 'REMOVE_STAMP_SLOT' }
  | { type: 'ADD_ELEMENT'; side: 'front' | 'back'; element: DesignElement }
  | { type: 'UPDATE_ELEMENT'; side: 'front' | 'back'; index: number; patch: Partial<DesignElement> }
  | { type: 'REMOVE_ELEMENT'; side: 'front' | 'back'; index: number }
  | { type: 'MOVE_ELEMENT'; side: 'front' | 'back'; index: number; x: number; y: number }
  | { type: 'MOVE_ELEMENT_PREVIEW'; side: 'front' | 'back'; index: number; x: number; y: number }
  | { type: 'UPDATE_ELEMENT_PREVIEW'; side: 'front' | 'back'; index: number; patch: Partial<DesignElement> }
  | { type: 'MOVE_ALL_PREVIEW'; side: 'front' | 'back'; dx: number; dy: number; baseline: DesignJsonV2 }
  | { type: 'MOVE_ALL'; side: 'front' | 'back'; dx: number; dy: number; baseline: DesignJsonV2 }
  | { type: 'MOVE_ELEMENT_FORWARD'; side: 'front' | 'back'; index: number }
  | { type: 'MOVE_ELEMENT_BACKWARD'; side: 'front' | 'back'; index: number }
  | { type: 'DUPLICATE_ELEMENT'; side: 'front' | 'back'; index: number }
  | { type: 'UNDO' }
  | { type: 'REDO' };

interface DesignerState {
  design: DesignJsonV2;
  past: DesignJsonV2[];
  future: DesignJsonV2[];
}

function updateSlot(slots: StampSlot[], order: number, patch: Partial<StampSlot>): StampSlot[] {
  return slots.map((s) => (s.order === order ? { ...s, ...patch } : s));
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function updateElements(
  design: DesignJsonV2,
  side: 'front' | 'back',
  updater: (elements: DesignElement[]) => DesignElement[],
): DesignJsonV2 {
  return {
    ...design,
    [side]: {
      ...design[side],
      elements: updater(design[side].elements),
    },
  };
}

function applyMoveAll(baseline: DesignJsonV2, side: 'front' | 'back', dx: number, dy: number): DesignJsonV2 {
  const movedElements = baseline[side].elements.map((el) => ({
    ...el,
    x: clamp(el.x + dx, 0, 100),
    y: clamp(el.y + dy, 0, 100),
  }));

  if (side === 'front') {
    return { ...baseline, front: { ...baseline.front, elements: movedElements } };
  }

  return {
    ...baseline,
    back: {
      ...baseline.back,
      elements: movedElements,
      stampSlots: baseline.back.stampSlots.map((s) => ({
        ...s,
        x: clamp(s.x + dx, 0, 100),
        y: clamp(s.y + dy, 0, 100),
      })),
    },
  };
}

function designerReducer(state: DesignerState, action: DesignerAction): DesignerState {
  switch (action.type) {
    case 'SET_DESIGN':
      return {
        design: action.design,
        past: [],
        future: [],
      };

    case 'UNDO': {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      return {
        design: previous,
        past: state.past.slice(0, -1),
        future: [state.design, ...state.future].slice(0, MAX_HISTORY),
      };
    }

    case 'REDO': {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      return {
        design: next,
        past: [...state.past, state.design].slice(-MAX_HISTORY),
        future: state.future.slice(1),
      };
    }

    case 'RESIZE_SLOT_PREVIEW': {
      const newDesign = applyAction(state.design, { type: 'RESIZE_SLOT', order: action.order, size: action.size });
      return { ...state, design: newDesign };
    }

    case 'MOVE_SLOT_PREVIEW': {
      const newDesign = applyAction(state.design, {
        type: 'MOVE_SLOT',
        order: action.order,
        x: action.x,
        y: action.y,
      });
      return { ...state, design: newDesign };
    }

    case 'MOVE_ELEMENT_PREVIEW': {
      const newDesign = applyAction(state.design, {
        type: 'MOVE_ELEMENT',
        side: action.side,
        index: action.index,
        x: action.x,
        y: action.y,
      });
      return { ...state, design: newDesign };
    }

    case 'UPDATE_ELEMENT_PREVIEW': {
      const newDesign = applyAction(state.design, {
        type: 'UPDATE_ELEMENT',
        side: action.side,
        index: action.index,
        patch: action.patch,
      });
      return { ...state, design: newDesign };
    }

    case 'MOVE_ALL_PREVIEW':
      return { ...state, design: applyMoveAll(action.baseline, action.side, action.dx, action.dy) };

    case 'MOVE_ALL':
      return {
        design: applyMoveAll(action.baseline, action.side, action.dx, action.dy),
        past: [...state.past, action.baseline].slice(-MAX_HISTORY),
        future: [],
      };

    default: {
      const newDesign = applyAction(state.design, action);
      return {
        design: newDesign,
        past: [...state.past, state.design].slice(-MAX_HISTORY),
        future: [],
      };
    }
  }
}

function applyAction(
  design: DesignJsonV2,
  action: Exclude<DesignerAction, { type: 'UNDO' | 'REDO' | 'SET_DESIGN' | 'MOVE_SLOT_PREVIEW' | 'MOVE_ELEMENT_PREVIEW' | 'UPDATE_ELEMENT_PREVIEW' }>,
): DesignJsonV2 {
  switch (action.type) {
    case 'MOVE_SLOT':
      return {
        ...design,
        back: {
          ...design.back,
          stampSlots: updateSlot(design.back.stampSlots, action.order, {
            x: clamp(action.x, 0, 100),
            y: clamp(action.y, 0, 100),
          }),
        },
      };

    case 'RESIZE_SLOT':
      return {
        ...design,
        back: {
          ...design.back,
          stampSlots: updateSlot(design.back.stampSlots, action.order, {
            size: clamp(action.size, 2, 20),
          }),
        },
      };

    case 'ROTATE_SLOT':
      return {
        ...design,
        back: {
          ...design.back,
          stampSlots: updateSlot(design.back.stampSlots, action.order, {
            rotation: action.rotation,
          }),
        },
      };

    case 'SET_STAMP_STYLE':
      return {
        ...design,
        back: {
          ...design.back,
          stampStyle: { ...design.back.stampStyle, ...action.style },
        },
      };

    case 'SET_BACK_BACKGROUND':
      return {
        ...design,
        back: { ...design.back, background: action.background },
      };

    case 'SET_FRONT_BACKGROUND':
      return {
        ...design,
        front: { ...design.front, background: action.background },
      };

    case 'SET_STAMP_SLOTS':
      return {
        ...design,
        back: { ...design.back, stampSlots: action.slots },
      };

    case 'ADD_STAMP_SLOT': {
      const slots = design.back.stampSlots;
      if (slots.length >= 10) return design;
      const maxOrder = Math.max(...slots.map((s) => s.order));
      const refSlot = slots[0];
      // Place new slot at center with slight offset
      const newSlot: StampSlot = {
        order: maxOrder + 1,
        x: 50 + ((slots.length % 3) - 1) * 8,
        y: 32 + Math.floor(slots.length / 3) * 8,
        size: refSlot?.size ?? 7,
      };
      return {
        ...design,
        back: { ...design.back, stampSlots: [...slots, newSlot] },
      };
    }

    case 'REMOVE_STAMP_SLOT': {
      const slots = design.back.stampSlots;
      if (slots.length <= 1) return design;
      // Remove the slot with the highest order
      const maxOrder = Math.max(...slots.map((s) => s.order));
      return {
        ...design,
        back: {
          ...design.back,
          stampSlots: slots.filter((s) => s.order !== maxOrder),
        },
      };
    }

    case 'ADD_ELEMENT':
      return updateElements(design, action.side, (els) => [...els, action.element]);

    case 'UPDATE_ELEMENT':
      return updateElements(design, action.side, (els) =>
        els.map((el, i) => (i === action.index ? { ...el, ...action.patch } : el)),
      );

    case 'REMOVE_ELEMENT':
      return updateElements(design, action.side, (els) =>
        els.filter((_, i) => i !== action.index),
      );

    case 'MOVE_ELEMENT':
      return updateElements(design, action.side, (els) =>
        els.map((el, i) =>
          i === action.index
            ? { ...el, x: clamp(action.x, 0, 100), y: clamp(action.y, 0, 100) }
            : el,
        ),
      );

    case 'MOVE_ELEMENT_FORWARD':
      return updateElements(design, action.side, (els) => {
        if (action.index >= els.length - 1) return els;
        const arr = [...els];
        [arr[action.index], arr[action.index + 1]] = [arr[action.index + 1], arr[action.index]];
        return arr;
      });

    case 'MOVE_ELEMENT_BACKWARD':
      return updateElements(design, action.side, (els) => {
        if (action.index <= 0) return els;
        const arr = [...els];
        [arr[action.index - 1], arr[action.index]] = [arr[action.index], arr[action.index - 1]];
        return arr;
      });

    case 'DUPLICATE_ELEMENT':
      return updateElements(design, action.side, (els) => {
        const src = els[action.index];
        if (!src) return els;
        const copy = { ...src, x: clamp(src.x + 3, 0, 100), y: clamp(src.y + 3, 0, 100) };
        return [...els, copy];
      });

    default:
      return design;
  }
}

export function useDesignerState(initialDesign: DesignJsonV2) {
  const [state, dispatch] = useReducer(designerReducer, {
    design: initialDesign,
    past: [],
    future: [],
  });

  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), []);
  const setDesign = useCallback(
    (design: DesignJsonV2) => dispatch({ type: 'SET_DESIGN', design }),
    [],
  );

  return {
    design: state.design,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    dispatch,
    undo,
    redo,
    setDesign,
  };
}
