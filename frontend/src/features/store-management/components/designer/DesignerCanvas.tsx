/**
 * DesignerCanvas
 * 인터랙티브 SVG 캔버스 — 도장 슬롯 + 디자인 요소 드래그 이동
 * 앞면/뒷면 모드 지원, 선 끝점 회전 드래그, 텍스트 더블클릭 인라인 편집
 * Shift+드래그: 전체 요소 이동
 */

import { useRef, useState, useCallback, useMemo } from 'react';
import type { DesignJsonV2, StampSlot, DesignElement } from '@/features/wallet/types/designV2';
import { CARD_VIEWBOX, CARD_VIEWBOX_WIDTH, CARD_VIEWBOX_HEIGHT } from '@/features/wallet/types/designV2';
import { StampSlotRenderer } from '@/features/wallet/components/StampSlotRenderer';
import { DesignElementRenderer } from '@/features/wallet/components/DesignElementRenderer';
import { BackgroundRenderer } from '@/features/wallet/components/BackgroundRenderer';

interface SelectedElement {
  side: 'front' | 'back';
  index: number;
}

interface DesignerCanvasProps {
  design: DesignJsonV2;
  editingSide: 'front' | 'back';
  selectedSlot: number | null;
  selectedElement: SelectedElement | null;
  lastClickPos: { x: number; y: number } | null;
  snapEnabled: boolean;
  onSelectSlot: (order: number | null) => void;
  onSelectElement: (sel: SelectedElement | null) => void;
  onCanvasClick: (x: number, y: number) => void;
  onSlotMovePreview: (order: number, x: number, y: number) => void;
  onSlotMoveCommit: (order: number, x: number, y: number) => void;
  onSlotResizePreview: (order: number, size: number) => void;
  onSlotResizeCommit: (order: number, size: number) => void;
  onElementMovePreview: (side: 'front' | 'back', index: number, x: number, y: number) => void;
  onElementMoveCommit: (side: 'front' | 'back', index: number, x: number, y: number) => void;
  onElementUpdatePreview: (side: 'front' | 'back', index: number, patch: Partial<DesignElement>) => void;
  onElementUpdateCommit: (side: 'front' | 'back', index: number, patch: Partial<DesignElement>) => void;
  onMoveAllStart: () => void;
  onMoveAllPreview: (dx: number, dy: number) => void;
  onMoveAllCommit: (dx: number, dy: number) => void;
}

type DragTarget =
  | { type: 'slot'; order: number; startX: number; startY: number; origX: number; origY: number }
  | { type: 'element'; index: number; startX: number; startY: number; origX: number; origY: number }
  | { type: 'line-endpoint'; index: number; originX: number; originY: number }
  | { type: 'all'; startX: number; startY: number }
  | { type: 'slot-resize'; order: number; startY: number; origSize: number }
  | { type: 'element-resize'; index: number; startX: number; startY: number; origWidth: number; origHeight: number; origFontSize: number };

const SNAP_GRID = 5; // snap to 5% grid

/** Smart alignment guides */
interface AlignGuide { axis: 'horizontal' | 'vertical'; position: number; }
const ALIGN_THRESHOLD = 1.5; // viewBox units

/** 아이템 중심점 계산 */
function getItemCenter(item: { x: number; y: number; width?: number; height?: number }, isSlot: boolean): { cx: number; cy: number } {
  if (isSlot) return { cx: item.x, cy: item.y }; // slots are already centered
  // shape elements have top-left origin
  if (item.width && item.height) return { cx: item.x + item.width / 2, cy: item.y + item.height / 2 };
  return { cx: item.x, cy: item.y };
}

/** 정렬 가이드 + 자석 스냅 계산 */
function computeAlignGuides(
  draggedCenter: { cx: number; cy: number },
  allCenters: { cx: number; cy: number }[],
  threshold: number,
): { guides: AlignGuide[]; snappedX: number | null; snappedY: number | null } {
  const guides: AlignGuide[] = [];
  let snappedX: number | null = null;
  let snappedY: number | null = null;
  let bestDx = threshold;
  let bestDy = threshold;

  for (const other of allCenters) {
    const dx = Math.abs(draggedCenter.cx - other.cx);
    const dy = Math.abs(draggedCenter.cy - other.cy);
    if (dx < bestDx) {
      bestDx = dx;
      snappedX = other.cx;
    }
    if (dy < bestDy) {
      bestDy = dy;
      snappedY = other.cy;
    }
  }

  if (snappedX !== null) guides.push({ axis: 'vertical', position: snappedX });
  if (snappedY !== null) guides.push({ axis: 'horizontal', position: snappedY });

  return { guides, snappedX, snappedY };
}

/** svg-path content에서 끝점 좌표 파싱 */
function parseLineEndpoint(content: string): { ex: number; ey: number } {
  const m = content.match(/L([-\d.]+),([-\d.]+)/);
  if (!m) return { ex: 30, ey: 0 };
  return { ex: parseFloat(m[1]), ey: parseFloat(m[2]) };
}

/** 요소 타입별 투명 히트 영역 생성 */
function renderHitArea(el: DesignElement) {
  const MIN_HIT = 4; // minimum hit area in viewBox units

  if (el.type === 'text') {
    const fontSize = Number(el.style?.fontSize || 4);
    const w = Math.max(MIN_HIT, el.content.length * fontSize * 0.6);
    const h = Math.max(MIN_HIT, fontSize * 1.4);
    const anchor = el.style?.textAnchor || 'start';
    const offsetX = anchor === 'middle' ? -w / 2 : anchor === 'end' ? -w : 0;
    return <rect x={el.x + offsetX} y={el.y - h / 2} width={w} height={h} fill="transparent" />;
  }

  if (el.type === 'svg-path') {
    const { ex, ey } = parseLineEndpoint(el.content);
    // thick invisible line for easy clicking
    return (
      <line
        x1={el.x}
        y1={el.y}
        x2={el.x + ex}
        y2={el.y + ey}
        stroke="transparent"
        strokeWidth={MIN_HIT}
      />
    );
  }

  if (el.type === 'shape') {
    const w = Math.max(MIN_HIT, el.width || 10);
    const h = Math.max(MIN_HIT, el.height || 10);
    return <rect x={el.x} y={el.y} width={w} height={h} fill="transparent" />;
  }

  return null;
}

export function DesignerCanvas({
  design,
  editingSide,
  selectedSlot,
  selectedElement,
  snapEnabled,
  onSelectSlot,
  onSelectElement,
  onCanvasClick,
  onSlotMovePreview,
  onSlotMoveCommit,
  onSlotResizePreview,
  onSlotResizeCommit,
  onElementMovePreview,
  onElementMoveCommit,
  onElementUpdatePreview,
  onElementUpdateCommit,
  onMoveAllStart,
  onMoveAllPreview,
  onMoveAllCommit,
}: DesignerCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<DragTarget | null>(null);
  const [editingText, setEditingText] = useState<{ index: number; value: string } | null>(null);
  const [alignGuides, setAlignGuides] = useState<AlignGuide[]>([]);
  const lastSnappedPos = useRef<{ x: number; y: number } | null>(null);

  const snap = useCallback(
    (v: number) => (snapEnabled ? Math.round(v / SNAP_GRID) * SNAP_GRID : v),
    [snapEnabled],
  );

  const svgPointFromEvent = useCallback(
    (e: React.MouseEvent | MouseEvent): { x: number; y: number } | null => {
      const svg = svgRef.current;
      if (!svg) return null;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const ctm = svg.getScreenCTM()?.inverse();
      if (!ctm) return null;
      const svgPt = pt.matrixTransform(ctm);
      return { x: svgPt.x, y: svgPt.y };
    },
    [],
  );

  // Start move-all drag
  const startMoveAll = useCallback(
    (e: React.MouseEvent) => {
      const pt = svgPointFromEvent(e);
      if (!pt) return;
      onMoveAllStart();
      setDragging({ type: 'all', startX: pt.x, startY: pt.y });
    },
    [svgPointFromEvent, onMoveAllStart],
  );

  const handleSlotMouseDown = useCallback(
    (e: React.MouseEvent, slot: StampSlot) => {
      e.stopPropagation();
      e.preventDefault();
      if (e.shiftKey) { startMoveAll(e); return; }
      const pt = svgPointFromEvent(e);
      if (!pt) return;
      onSelectSlot(slot.order);
      onSelectElement(null);
      setEditingText(null);
      setDragging({
        type: 'slot',
        order: slot.order,
        startX: pt.x,
        startY: pt.y,
        origX: slot.x,
        origY: slot.y,
      });
    },
    [svgPointFromEvent, onSelectSlot, onSelectElement, startMoveAll],
  );

  const handleElementMouseDown = useCallback(
    (e: React.MouseEvent, el: DesignElement, index: number) => {
      e.stopPropagation();
      e.preventDefault();
      if (e.shiftKey) { startMoveAll(e); return; }
      onSelectElement({ side: editingSide, index });
      onSelectSlot(null);
      setDragging({
        type: 'element',
        index,
        startX: svgPointFromEvent(e)?.x ?? 0,
        startY: svgPointFromEvent(e)?.y ?? 0,
        origX: el.x,
        origY: el.y,
      });
    },
    [svgPointFromEvent, onSelectElement, onSelectSlot, editingSide, startMoveAll],
  );

  const handleElementDoubleClick = useCallback(
    (e: React.MouseEvent, el: DesignElement, index: number) => {
      e.stopPropagation();
      if (el.type === 'text') {
        setEditingText({ index, value: el.content });
      }
    },
    [],
  );

  const handleTextEditCommit = useCallback(() => {
    if (!editingText) return;
    onElementUpdateCommit(editingSide, editingText.index, { content: editingText.value });
    setEditingText(null);
  }, [editingText, editingSide, onElementUpdateCommit]);

  const handleLineEndpointMouseDown = useCallback(
    (e: React.MouseEvent, el: DesignElement, index: number) => {
      e.stopPropagation();
      e.preventDefault();
      if (e.shiftKey) { startMoveAll(e); return; }
      onSelectElement({ side: editingSide, index });
      onSelectSlot(null);
      setDragging({
        type: 'line-endpoint',
        index,
        originX: el.x,
        originY: el.y,
      });
    },
    [onSelectElement, onSelectSlot, editingSide, startMoveAll],
  );

  // Slot resize handle
  const handleSlotResizeMouseDown = useCallback(
    (e: React.MouseEvent, slot: StampSlot) => {
      e.stopPropagation();
      e.preventDefault();
      setDragging({
        type: 'slot-resize',
        order: slot.order,
        startY: svgPointFromEvent(e)?.y ?? 0,
        origSize: slot.size,
      });
    },
    [svgPointFromEvent],
  );

  // Element resize handle
  const handleElementResizeMouseDown = useCallback(
    (e: React.MouseEvent, el: DesignElement, index: number) => {
      e.stopPropagation();
      e.preventDefault();
      setDragging({
        type: 'element-resize',
        index,
        startX: svgPointFromEvent(e)?.x ?? 0,
        startY: svgPointFromEvent(e)?.y ?? 0,
        origWidth: el.width || 10,
        origHeight: el.height || 10,
        origFontSize: Number(el.style?.fontSize || 5),
      });
    },
    [svgPointFromEvent],
  );

  // Canvas background mousedown — shift starts move-all
  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!e.shiftKey) return;
      e.preventDefault();
      startMoveAll(e);
    },
    [startMoveAll],
  );

  // Derived data (needed by handleMouseMove for alignment guides)
  const sideData = design[editingSide];
  const elements = sideData.elements;
  const isBack = editingSide === 'back';
  const sortedSlots = useMemo(
    () => isBack ? [...design.back.stampSlots].sort((a, b) => a.order - b.order) : [],
    [isBack, design.back.stampSlots],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging) return;
      const pt = svgPointFromEvent(e);
      if (!pt) return;

      if (dragging.type === 'all') {
        const dx = pt.x - dragging.startX;
        const dy = pt.y - dragging.startY;
        onMoveAllPreview(dx, dy);
        return;
      }

      if (dragging.type === 'slot-resize') {
        const dy = pt.y - dragging.startY;
        const newSize = Math.max(2, Math.min(20, dragging.origSize - dy * 0.5));
        onSlotResizePreview(dragging.order, Math.round(newSize * 10) / 10);
        return;
      }

      if (dragging.type === 'line-endpoint') {
        const ex = pt.x - dragging.originX;
        const ey = pt.y - dragging.originY;
        const content = `M0,0 L${Math.round(ex * 100) / 100},${Math.round(ey * 100) / 100}`;
        onElementUpdatePreview(editingSide, dragging.index, { content });
        return;
      }

      if (dragging.type === 'element-resize') {
        const dx = pt.x - dragging.startX;
        const dy = pt.y - dragging.startY;
        const el = elements[dragging.index];
        if (el?.type === 'shape') {
          const newW = Math.max(2, Math.min(100, dragging.origWidth + dx));
          const newH = Math.max(2, Math.min(100, dragging.origHeight + dy));
          onElementUpdatePreview(editingSide, dragging.index, { width: Math.round(newW * 10) / 10, height: Math.round(newH * 10) / 10 });
        } else if (el?.type === 'text') {
          const scale = Math.max(0.3, 1 + dy * 0.05);
          const newSize = Math.max(1, Math.min(20, dragging.origFontSize * scale));
          onElementUpdatePreview(editingSide, dragging.index, { style: { ...el.style, fontSize: String(Math.round(newSize * 10) / 10) } });
        }
        return;
      }

      const dx = pt.x - dragging.startX;
      const dy = pt.y - dragging.startY;
      let newX = snap(Math.max(0, Math.min(CARD_VIEWBOX_WIDTH, dragging.origX + dx)));
      let newY = snap(Math.max(0, Math.min(CARD_VIEWBOX_HEIGHT, dragging.origY + dy)));

      // Collect other item centers for alignment (exclude self)
      const otherCenters: { cx: number; cy: number }[] = [];
      if (isBack) {
        for (const s of sortedSlots) {
          if (dragging.type === 'slot' && s.order === dragging.order) continue;
          otherCenters.push(getItemCenter(s, true));
        }
      }
      for (let ei = 0; ei < elements.length; ei++) {
        if (dragging.type === 'element' && ei === dragging.index) continue;
        otherCenters.push(getItemCenter(elements[ei], false));
      }

      const draggedCenter = dragging.type === 'slot'
        ? { cx: newX, cy: newY }
        : getItemCenter({ ...elements[dragging.index], x: newX, y: newY }, false);

      const { guides, snappedX, snappedY } = computeAlignGuides(draggedCenter, otherCenters, ALIGN_THRESHOLD);
      setAlignGuides(guides);

      // Apply snap: shift position by the delta between current center and target center
      if (snappedX !== null) newX += snappedX - draggedCenter.cx;
      if (snappedY !== null) newY += snappedY - draggedCenter.cy;

      // Store snapped position for mouseUp commit
      lastSnappedPos.current = { x: newX, y: newY };

      if (dragging.type === 'slot') {
        onSlotMovePreview(dragging.order, newX, newY);
      } else {
        onElementMovePreview(editingSide, dragging.index, newX, newY);
      }
    },
    [dragging, svgPointFromEvent, snap, onSlotMovePreview, onSlotResizePreview, onElementMovePreview, onElementUpdatePreview, onMoveAllPreview, editingSide, isBack, sortedSlots, elements],
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      if (!dragging) return;
      setAlignGuides([]);
      const pt = svgPointFromEvent(e as React.MouseEvent);

      if (dragging.type === 'all' && pt) {
        const dx = pt.x - dragging.startX;
        const dy = pt.y - dragging.startY;
        onMoveAllCommit(dx, dy);
        setDragging(null);
        return;
      }

      if (dragging.type === 'slot-resize' && pt) {
        const dy = pt.y - dragging.startY;
        const newSize = Math.max(2, Math.min(20, dragging.origSize - dy * 0.5));
        onSlotResizeCommit(dragging.order, Math.round(newSize * 10) / 10);
        setDragging(null);
        return;
      }

      if (dragging.type === 'line-endpoint' && pt) {
        const ex = pt.x - dragging.originX;
        const ey = pt.y - dragging.originY;
        const content = `M0,0 L${Math.round(ex * 100) / 100},${Math.round(ey * 100) / 100}`;
        onElementUpdateCommit(editingSide, dragging.index, { content });
        setDragging(null);
        return;
      }

      if (dragging.type === 'element-resize' && pt) {
        const dx = pt.x - dragging.startX;
        const dy = pt.y - dragging.startY;
        const el = elements[dragging.index];
        if (el?.type === 'shape') {
          const newW = Math.max(2, Math.min(100, dragging.origWidth + dx));
          const newH = Math.max(2, Math.min(100, dragging.origHeight + dy));
          onElementUpdateCommit(editingSide, dragging.index, { width: Math.round(newW * 10) / 10, height: Math.round(newH * 10) / 10 });
        } else if (el?.type === 'text') {
          const scale = Math.max(0.3, 1 + dy * 0.05);
          const newSize = Math.max(1, Math.min(20, dragging.origFontSize * scale));
          onElementUpdateCommit(editingSide, dragging.index, { style: { ...el.style, fontSize: String(Math.round(newSize * 10) / 10) } });
        }
        setDragging(null);
        return;
      }

      if (dragging.type === 'slot' || dragging.type === 'element') {
        // Use the last alignment-snapped position from handleMouseMove
        const pos = lastSnappedPos.current;
        if (pos) {
          if (dragging.type === 'slot') {
            onSlotMoveCommit(dragging.order, pos.x, pos.y);
          } else {
            onElementMoveCommit(editingSide, dragging.index, pos.x, pos.y);
          }
        } else if (pt) {
          // Fallback: no drag movement occurred, use raw position
          const dx = pt.x - dragging.startX;
          const dy = pt.y - dragging.startY;
          const newX = snap(Math.max(0, Math.min(CARD_VIEWBOX_WIDTH, dragging.origX + dx)));
          const newY = snap(Math.max(0, Math.min(CARD_VIEWBOX_HEIGHT, dragging.origY + dy)));
          if (dragging.type === 'slot') {
            onSlotMoveCommit(dragging.order, newX, newY);
          } else {
            onElementMoveCommit(editingSide, dragging.index, newX, newY);
          }
        }
      }
      lastSnappedPos.current = null;
      setDragging(null);
    },
    [dragging, svgPointFromEvent, snap, onSlotMoveCommit, onSlotResizeCommit, onElementMoveCommit, onElementUpdateCommit, onMoveAllCommit, editingSide],
  );

  const handleMouseLeave = useCallback(() => {
    if (dragging) {
      if (dragging.type === 'all') onMoveAllCommit(0, 0);
      if (dragging.type === 'slot-resize') onSlotResizeCommit(dragging.order, dragging.origSize);
      if (dragging.type === 'element-resize') {
        const el = elements[dragging.index];
        if (el?.type === 'shape') {
          onElementUpdateCommit(editingSide, dragging.index, { width: dragging.origWidth, height: dragging.origHeight });
        } else if (el?.type === 'text') {
          onElementUpdateCommit(editingSide, dragging.index, { style: { ...el.style, fontSize: String(dragging.origFontSize) } });
        }
      }
      setDragging(null);
      setAlignGuides([]);
    }
  }, [dragging, onMoveAllCommit, onSlotResizeCommit, onElementUpdateCommit, editingSide, elements]);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (dragging) return;
      if (e.shiftKey) return;
      const pt = svgPointFromEvent(e);
      if (pt) onCanvasClick(pt.x, pt.y);
      onSelectSlot(null);
      onSelectElement(null);
      setEditingText(null);
    },
    [dragging, svgPointFromEvent, onCanvasClick, onSelectSlot, onSelectElement],
  );

  const isSelected = (index: number) =>
    selectedElement?.side === editingSide && selectedElement.index === index;

  // Element selection indicator with resize handle
  const renderElementSelection = (el: DesignElement, index: number) => {
    const PAD = 2; // padding around element for border

    if (el.type === 'text') {
      const fontSize = Number(el.style?.fontSize || 4);
      const w = Math.max(fontSize * 2, el.content.length * fontSize * 0.85);
      const h = fontSize * 1.5;
      const anchor = el.style?.textAnchor || 'start';
      const offsetX = anchor === 'middle' ? -w / 2 : anchor === 'end' ? -w : 0;
      const bx = el.x + offsetX - PAD;
      const by = el.y - h / 2 - PAD;
      const bw = w + PAD * 2;
      const bh = h + PAD * 2;
      return (
        <g>
          <rect
            x={bx} y={by} width={bw} height={bh}
            fill="none" stroke="#3B82F6" strokeWidth={0.4} strokeDasharray="1.5 1"
          />
          {/* Resize handle at bottom-right */}
          <g
            onMouseDown={(e) => handleElementResizeMouseDown(e, el, index)}
            className="cursor-nwse-resize"
          >
            <rect
              x={bx + bw - 2} y={by + bh - 2}
              width={3} height={3} rx={0.5}
              fill="#3B82F6" stroke="white" strokeWidth={0.3}
            />
            <rect
              x={bx + bw - 4} y={by + bh - 4}
              width={7} height={7}
              fill="transparent"
            />
          </g>
        </g>
      );
    }

    if (el.type === 'svg-path') {
      const { ex, ey } = parseLineEndpoint(el.content);
      return (
        <g>
          <circle cx={el.x} cy={el.y} r={1.2} fill="#3B82F6" opacity={0.5} />
          <circle
            cx={el.x + ex}
            cy={el.y + ey}
            r={1.5}
            fill="#3B82F6"
            stroke="white"
            strokeWidth={0.4}
            className="cursor-crosshair"
            onMouseDown={(e) => handleLineEndpointMouseDown(e, el, index)}
          />
          <circle
            cx={el.x + ex}
            cy={el.y + ey}
            r={3}
            fill="transparent"
            className="cursor-crosshair"
            onMouseDown={(e) => handleLineEndpointMouseDown(e, el, index)}
          />
        </g>
      );
    }

    // shape
    const sw = el.width || 10;
    const sh = el.height || 10;
    return (
      <g>
        <rect
          x={el.x - PAD} y={el.y - PAD}
          width={sw + PAD * 2} height={sh + PAD * 2}
          fill="none" stroke="#3B82F6" strokeWidth={0.4} strokeDasharray="1.5 1"
        />
        {/* Resize handle at bottom-right */}
        <g
          onMouseDown={(e) => handleElementResizeMouseDown(e, el, index)}
          className="cursor-nwse-resize"
        >
          <rect
            x={el.x + sw - 1} y={el.y + sh - 1}
            width={3} height={3} rx={0.5}
            fill="#3B82F6" stroke="white" strokeWidth={0.3}
          />
          <rect
            x={el.x + sw - 3} y={el.y + sh - 3}
            width={7} height={7}
            fill="transparent"
          />
        </g>
      </g>
    );
  };

  return (
    <div className="relative w-full overflow-hidden border-2 border-slate-300 rounded-2xl aspect-[1.58/1] bg-white">
      <svg
        ref={svgRef}
        viewBox={CARD_VIEWBOX}
        preserveAspectRatio="xMidYMid meet"
        className={`absolute inset-0 w-full h-full ${dragging?.type === 'all' ? 'cursor-move' : 'cursor-crosshair'}`}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClick={handleCanvasClick}
      >
        <BackgroundRenderer background={sideData.background} />

        {/* Snap grid overlay */}
        {snapEnabled && (
          <g opacity={0.15} pointerEvents="none">
            {Array.from({ length: Math.floor(CARD_VIEWBOX_WIDTH / SNAP_GRID) }, (_, i) => (
              <line
                key={`gv${i}`}
                x1={(i + 1) * SNAP_GRID}
                y1={0}
                x2={(i + 1) * SNAP_GRID}
                y2={CARD_VIEWBOX_HEIGHT}
                stroke="#94a3b8"
                strokeWidth={0.15}
              />
            ))}
            {Array.from({ length: Math.floor(CARD_VIEWBOX_HEIGHT / SNAP_GRID) }, (_, i) => (
              <line
                key={`gh${i}`}
                x1={0}
                y1={(i + 1) * SNAP_GRID}
                x2={CARD_VIEWBOX_WIDTH}
                y2={(i + 1) * SNAP_GRID}
                stroke="#94a3b8"
                strokeWidth={0.15}
              />
            ))}
          </g>
        )}

        {/* Design elements */}
        {elements.map((el, i) => (
          <g
            key={i}
            onMouseDown={(e) => handleElementMouseDown(e, el, i)}
            onDoubleClick={(e) => handleElementDoubleClick(e, el, i)}
            onClick={(e) => e.stopPropagation()}
            className="cursor-grab active:cursor-grabbing"
          >
            {/* Invisible hit area for easier clicking */}
            {renderHitArea(el)}
            <DesignElementRenderer element={el} />
            {isSelected(i) && renderElementSelection(el, i)}
          </g>
        ))}

        {/* Inline text editing */}
        {editingText && elements[editingText.index]?.type === 'text' && (() => {
          const el = elements[editingText.index];
          const fontSize = Number(el.style?.fontSize || 4);
          const w = Math.max(20, el.content.length * fontSize * 0.7 + 4);
          const h = fontSize * 1.8;
          const anchor = el.style?.textAnchor || 'start';
          const offsetX = anchor === 'middle' ? -w / 2 : anchor === 'end' ? -w : 0;
          return (
            <foreignObject
              x={el.x + offsetX}
              y={el.y - h / 2}
              width={w}
              height={h}
            >
              <input
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                type="text"
                value={editingText.value}
                onChange={(e) => setEditingText({ ...editingText, value: e.target.value })}
                onBlur={handleTextEditCommit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTextEditCommit();
                  if (e.key === 'Escape') setEditingText(null);
                  e.stopPropagation();
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className="w-full h-full bg-white/90 border border-blue-400 rounded px-0.5 outline-none"
                style={{
                  fontSize: `${fontSize * 1.5}px`,
                  color: el.style?.fill || '#333',
                  textAlign: anchor === 'middle' ? 'center' : anchor === 'end' ? 'right' : 'left',
                }}
              />
            </foreignObject>
          );
        })()}

        {/* Alignment guides */}
        {alignGuides.map((g, i) => (
          <line
            key={`ag-${i}`}
            x1={g.axis === 'vertical' ? g.position : 0}
            y1={g.axis === 'horizontal' ? g.position : 0}
            x2={g.axis === 'vertical' ? g.position : CARD_VIEWBOX_WIDTH}
            y2={g.axis === 'horizontal' ? g.position : CARD_VIEWBOX_HEIGHT}
            stroke="#3B82F6"
            strokeWidth={0.3}
            strokeDasharray="1 1"
            opacity={0.7}
            pointerEvents="none"
          />
        ))}

        {/* Stamp slots (back only) */}
        {isBack &&
          sortedSlots.map((slot) => (
            <g
              key={slot.order}
              onMouseDown={(e) => handleSlotMouseDown(e, slot)}
              onClick={(e) => e.stopPropagation()}
              className="cursor-grab active:cursor-grabbing"
            >
              <StampSlotRenderer
                slot={slot}
                style={design.back.stampStyle}
                filled={slot.order <= 3}
                isDesigner
              />
              {selectedSlot === slot.order && (() => {
                const stampShape = design.back.stampStyle.shape;
                const r = slot.size / 2 + 1.5;
                const borderRx = stampShape === 'circle' ? r : stampShape === 'rounded-square' ? r * 0.25 : 0;
                return (
                  <g>
                    {stampShape === 'circle' ? (
                      <circle
                        cx={slot.x}
                        cy={slot.y}
                        r={r}
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth={0.5}
                        strokeDasharray="1.5 1"
                      />
                    ) : (
                      <rect
                        x={slot.x - r}
                        y={slot.y - r}
                        width={r * 2}
                        height={r * 2}
                        rx={borderRx}
                        ry={borderRx}
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth={0.5}
                        strokeDasharray="1.5 1"
                      />
                    )}
                    {/* Resize handle — pill shape at bottom */}
                    <g
                      onMouseDown={(e) => handleSlotResizeMouseDown(e, slot)}
                      className="cursor-ns-resize"
                    >
                      <rect
                        x={slot.x - 2}
                        y={slot.y + slot.size / 2 + 0.5}
                        width={4}
                        height={2.5}
                        rx={1}
                        fill="#3B82F6"
                        stroke="white"
                        strokeWidth={0.3}
                      />
                      {/* Grip lines */}
                      <line
                        x1={slot.x - 0.8}
                        y1={slot.y + slot.size / 2 + 1.35}
                        x2={slot.x + 0.8}
                        y2={slot.y + slot.size / 2 + 1.35}
                        stroke="white"
                        strokeWidth={0.25}
                      />
                      <line
                        x1={slot.x - 0.8}
                        y1={slot.y + slot.size / 2 + 1.95}
                        x2={slot.x + 0.8}
                        y2={slot.y + slot.size / 2 + 1.95}
                        stroke="white"
                        strokeWidth={0.25}
                      />
                      {/* Larger invisible hit area */}
                      <rect
                        x={slot.x - 4}
                        y={slot.y + slot.size / 2 - 1}
                        width={8}
                        height={6}
                        fill="transparent"
                      />
                    </g>
                  </g>
                );
              })()}
            </g>
          ))}
      </svg>
    </div>
  );
}

export default DesignerCanvas;
