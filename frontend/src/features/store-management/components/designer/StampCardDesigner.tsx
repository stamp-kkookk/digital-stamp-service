/**
 * StampCardDesigner
 * 인터랙티브 스탬프 카드 에디터 최상위 컴포넌트
 * 좌: 컨트롤 패널 / 우: 드래그 가능한 SVG 캔버스
 * 앞면/뒷면 전환 편집 + 디자인 요소 CRUD
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Grid3x3, Minus, Plus } from 'lucide-react';
import type { DesignJsonV2, DesignElement } from '@/features/wallet/types/designV2';
import { useDesignerState } from './useDesignerState';
import { DesignerCanvas } from './DesignerCanvas';
import { DesignerToolbar } from './DesignerToolbar';
import { DesignerColorPanel } from './DesignerColorPanel';
import { DesignerStampStylePanel } from './DesignerStampStylePanel';
import { DesignerElementPanel } from './DesignerElementPanel';
import { StampCardFrontV2 } from '@/features/wallet/components/StampCardFrontV2';
import { StampCardBackV2 } from '@/features/wallet/components/StampCardBackV2';

interface SelectedElement {
  side: 'front' | 'back';
  index: number;
}

interface StampCardDesignerProps {
  initialDesign: DesignJsonV2;
  onDesignChange: (design: DesignJsonV2) => void;
}

export function StampCardDesigner({ initialDesign, onDesignChange }: StampCardDesignerProps) {
  const { design, canUndo, canRedo, dispatch, undo, redo } =
    useDesignerState(initialDesign);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [showElementEditor, setShowElementEditor] = useState(false);
  const [editingSide, setEditingSide] = useState<'front' | 'back'>('back');
  const [activeTab, setActiveTab] = useState<'elements' | 'background' | 'stamp'>('elements');
  const [lastClickPos, setLastClickPos] = useState<{ x: number; y: number } | null>(null);
  const [snapEnabled, setSnapEnabled] = useState(false);

  // Move-all baseline snapshot
  const moveAllBaselineRef = useRef<DesignJsonV2 | null>(null);

  // Sync design changes to parent — skip the initial mount
  const isMounted = useRef(false);
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    onDesignChange(design);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [design]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
      // Duplicate (Ctrl+D)
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedElement) {
        e.preventDefault();
        dispatch({ type: 'DUPLICATE_ELEMENT', side: selectedElement.side, index: selectedElement.index });
        const newIdx = design[selectedElement.side].elements.length;
        setSelectedElement({ side: selectedElement.side, index: newIdx });
      }
      // Delete selected element
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
        e.preventDefault();
        dispatch({ type: 'REMOVE_ELEMENT', side: selectedElement.side, index: selectedElement.index });
        setSelectedElement(null);
        setShowElementEditor(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, selectedElement, dispatch, design]);

  // Canvas selection — no editor
  const handleSelectElement = useCallback((sel: SelectedElement | null) => {
    setSelectedElement(sel);
    if (!sel) setShowElementEditor(false);
  }, []);

  // Panel list selection — open editor
  const handlePanelSelectElement = useCallback((sel: SelectedElement | null) => {
    setSelectedElement(sel);
    setShowElementEditor(sel !== null);
  }, []);

  // Clear selections when switching sides
  const handleSideChange = useCallback((side: 'front' | 'back') => {
    setEditingSide(side);
    setSelectedSlot(null);
    setSelectedElement(null);
    setShowElementEditor(false);
  }, []);

  // Slot drag
  const handleSlotMovePreview = useCallback(
    (order: number, x: number, y: number) => {
      dispatch({ type: 'MOVE_SLOT_PREVIEW', order, x, y });
    },
    [dispatch],
  );

  const handleSlotMoveCommit = useCallback(
    (order: number, x: number, y: number) => {
      dispatch({ type: 'MOVE_SLOT', order, x, y });
    },
    [dispatch],
  );

  // Element drag
  const handleElementMovePreview = useCallback(
    (side: 'front' | 'back', index: number, x: number, y: number) => {
      dispatch({ type: 'MOVE_ELEMENT_PREVIEW', side, index, x, y });
    },
    [dispatch],
  );

  const handleElementMoveCommit = useCallback(
    (side: 'front' | 'back', index: number, x: number, y: number) => {
      dispatch({ type: 'MOVE_ELEMENT', side, index, x, y });
    },
    [dispatch],
  );

  // Element update (for line endpoint drag)
  const handleElementUpdatePreview = useCallback(
    (side: 'front' | 'back', index: number, patch: Partial<DesignElement>) => {
      dispatch({ type: 'UPDATE_ELEMENT_PREVIEW', side, index, patch });
    },
    [dispatch],
  );

  const handleElementUpdateCommit = useCallback(
    (side: 'front' | 'back', index: number, patch: Partial<DesignElement>) => {
      dispatch({ type: 'UPDATE_ELEMENT', side, index, patch });
    },
    [dispatch],
  );

  // Move-all (Shift+drag)
  const handleMoveAllStart = useCallback(() => {
    moveAllBaselineRef.current = design;
  }, [design]);

  const handleMoveAllPreview = useCallback(
    (dx: number, dy: number) => {
      if (!moveAllBaselineRef.current) return;
      dispatch({ type: 'MOVE_ALL_PREVIEW', side: editingSide, dx, dy, baseline: moveAllBaselineRef.current });
    },
    [dispatch, editingSide],
  );

  const handleMoveAllCommit = useCallback(
    (dx: number, dy: number) => {
      if (!moveAllBaselineRef.current) return;
      dispatch({ type: 'MOVE_ALL', side: editingSide, dx, dy, baseline: moveAllBaselineRef.current });
      moveAllBaselineRef.current = null;
    },
    [dispatch, editingSide],
  );

  // Layer order
  const handleMoveElementForward = useCallback(
    (index: number) => dispatch({ type: 'MOVE_ELEMENT_FORWARD', side: editingSide, index }),
    [dispatch, editingSide],
  );

  const handleMoveElementBackward = useCallback(
    (index: number) => dispatch({ type: 'MOVE_ELEMENT_BACKWARD', side: editingSide, index }),
    [dispatch, editingSide],
  );

  // Slot resize
  const handleSlotResizePreview = useCallback(
    (order: number, size: number) => dispatch({ type: 'RESIZE_SLOT_PREVIEW', order, size }),
    [dispatch],
  );

  const handleSlotResizeCommit = useCallback(
    (order: number, size: number) => dispatch({ type: 'RESIZE_SLOT', order, size }),
    [dispatch],
  );

  // Canvas click position tracking
  const handleCanvasClick = useCallback((x: number, y: number) => {
    setLastClickPos({ x, y });
  }, []);

  // Element CRUD — place at last click position if available, auto-select new element
  const handleAddElement = useCallback(
    (element: DesignElement) => {
      const placed = lastClickPos
        ? { ...element, x: lastClickPos.x, y: lastClickPos.y }
        : element;
      dispatch({ type: 'ADD_ELEMENT', side: editingSide, element: placed });
      const newIndex = design[editingSide].elements.length;
      setSelectedElement({ side: editingSide, index: newIndex });
      setShowElementEditor(true);
    },
    [dispatch, editingSide, lastClickPos, design],
  );

  const handleUpdateElement = useCallback(
    (index: number, patch: Partial<DesignElement>) => {
      dispatch({ type: 'UPDATE_ELEMENT', side: editingSide, index, patch });
    },
    [dispatch, editingSide],
  );

  const handleRemoveElement = useCallback(
    (index: number) => {
      dispatch({ type: 'REMOVE_ELEMENT', side: editingSide, index });
      if (selectedElement?.index === index) {
        setSelectedElement(null);
        setShowElementEditor(false);
      }
    },
    [dispatch, editingSide, selectedElement],
  );

  // Background change based on current side
  const handleBackgroundChange = useCallback(
    (bg: { type: 'color' | 'gradient' | 'image'; value: string }) => {
      if (editingSide === 'front') {
        dispatch({ type: 'SET_FRONT_BACKGROUND', background: bg });
      } else {
        dispatch({ type: 'SET_BACK_BACKGROUND', background: bg });
      }
    },
    [dispatch, editingSide],
  );

  const tabs = [
    { id: 'elements' as const, label: '요소' },
    { id: 'background' as const, label: '배경' },
    ...(editingSide === 'back' ? [{ id: 'stamp' as const, label: '도장' }] : []),
  ];

  // Auto-switch tab if current tab is hidden
  useEffect(() => {
    if (editingSide === 'front' && activeTab === 'stamp') {
      setActiveTab('elements');
    }
  }, [editingSide, activeTab]);

  const previewSide = editingSide === 'front' ? 'back' : 'front';

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <DesignerToolbar
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
        />

        {/* Snap toggle */}
        <button
          type="button"
          onClick={() => setSnapEnabled((v) => !v)}
          className={`p-1.5 rounded-lg border transition-colors ${
            snapEnabled
              ? 'bg-blue-50 border-blue-300 text-blue-600'
              : 'bg-white border-slate-200 text-kkookk-steel hover:bg-slate-50'
          }`}
          title={`그리드 스냅 ${snapEnabled ? 'ON' : 'OFF'}`}
        >
          <Grid3x3 size={16} />
        </button>

        {/* Front/Back toggle */}
        <div className="flex border rounded-lg border-slate-200 overflow-hidden">
          <button
            type="button"
            onClick={() => handleSideChange('front')}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              editingSide === 'front'
                ? 'bg-kkookk-navy text-white'
                : 'bg-white text-kkookk-steel hover:bg-slate-50'
            }`}
          >
            앞면
          </button>
          <button
            type="button"
            onClick={() => handleSideChange('back')}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              editingSide === 'back'
                ? 'bg-kkookk-navy text-white'
                : 'bg-white text-kkookk-steel hover:bg-slate-50'
            }`}
          >
            뒷면
          </button>
        </div>

        {/* Stamp count controls (back only) */}
        {editingSide === 'back' && (
          <div className="flex items-center gap-2 ml-auto px-3 py-1 border rounded-lg border-slate-200 bg-white">
            <span className="text-xs font-medium text-kkookk-navy">도장 수</span>
            <button
              type="button"
              onClick={() => dispatch({ type: 'REMOVE_STAMP_SLOT' })}
              disabled={design.back.stampSlots.length <= 1}
              className="p-0.5 rounded hover:bg-slate-100 disabled:opacity-30"
              title="도장 감소"
            >
              <Minus size={14} />
            </button>
            <span className="w-5 text-center text-xs font-bold text-kkookk-navy">
              {design.back.stampSlots.length}
            </span>
            <button
              type="button"
              onClick={() => dispatch({ type: 'ADD_STAMP_SLOT' })}
              disabled={design.back.stampSlots.length >= 10}
              className="p-0.5 rounded hover:bg-slate-100 disabled:opacity-30"
              title="도장 추가"
            >
              <Plus size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        {/* Left: Control Panel */}
        <div className="w-[240px] space-y-4 shrink-0">
          {/* Tab navigation */}
          <div className="flex border rounded-lg border-slate-200 overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-2 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-kkookk-navy text-white'
                    : 'bg-white text-kkookk-steel hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-3 border rounded-lg border-slate-200 bg-slate-50">
            {activeTab === 'elements' && (
              <DesignerElementPanel
                elements={design[editingSide].elements}
                editingSide={editingSide}
                selectedElement={selectedElement}
                showEditor={showElementEditor}
                onAddElement={handleAddElement}
                onUpdateElement={handleUpdateElement}
                onRemoveElement={handleRemoveElement}
                onSelectElement={handlePanelSelectElement}
                onMoveForward={handleMoveElementForward}
                onMoveBackward={handleMoveElementBackward}
                onDuplicate={(index) => {
                  dispatch({ type: 'DUPLICATE_ELEMENT', side: editingSide, index });
                  setSelectedElement({ side: editingSide, index: design[editingSide].elements.length });
                }}
              />
            )}

            {activeTab === 'background' && (
              <DesignerColorPanel
                background={design[editingSide].background}
                onBackgroundChange={handleBackgroundChange}
              />
            )}

            {activeTab === 'stamp' && editingSide === 'back' && (
              <DesignerStampStylePanel
                stampStyle={design.back.stampStyle}
                onChange={(patch) => dispatch({ type: 'SET_STAMP_STYLE', style: patch })}
              />
            )}
          </div>

          {/* Preview: opposite side */}
          <div>
            <span className="block mb-2 text-xs font-bold text-kkookk-navy">
              {previewSide === 'front' ? '앞면' : '뒷면'} 미리보기
            </span>
            {previewSide === 'front' ? (
              <StampCardFrontV2 design={design} />
            ) : (
              <StampCardBackV2 design={design} stampCount={3} />
            )}
          </div>
        </div>

        {/* Right: Interactive Canvas */}
        <div className="flex-1">
          <DesignerCanvas
            design={design}
            editingSide={editingSide}
            selectedSlot={selectedSlot}
            selectedElement={selectedElement}
            lastClickPos={lastClickPos}
            snapEnabled={snapEnabled}
            onSelectSlot={setSelectedSlot}
            onSelectElement={handleSelectElement}
            onCanvasClick={handleCanvasClick}
            onSlotMovePreview={handleSlotMovePreview}
            onSlotMoveCommit={handleSlotMoveCommit}
            onSlotResizePreview={handleSlotResizePreview}
            onSlotResizeCommit={handleSlotResizeCommit}
            onElementMovePreview={handleElementMovePreview}
            onElementMoveCommit={handleElementMoveCommit}
            onElementUpdatePreview={handleElementUpdatePreview}
            onElementUpdateCommit={handleElementUpdateCommit}
            onMoveAllStart={handleMoveAllStart}
            onMoveAllPreview={handleMoveAllPreview}
            onMoveAllCommit={handleMoveAllCommit}
          />
          <p className="mt-1 text-[10px] text-kkookk-steel text-center">
            Shift+드래그: 전체 이동 · Ctrl+D: 복제 · Delete: 삭제 · 선택 후 하단 핸들: 크기 조절
          </p>
        </div>
      </div>
    </div>
  );
}

export default StampCardDesigner;
