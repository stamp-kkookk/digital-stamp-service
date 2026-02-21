/**
 * DesignerElementPanel
 * 디자인 요소 추가/편집/삭제 패널
 */

import { Type, Square, Minus, Trash2, ChevronUp, ChevronDown, Copy } from 'lucide-react';
import type { DesignElement } from '@/features/wallet/types/designV2';

/** svg-path content에서 길이/각도를 파싱 */
function parseLinePath(content: string): { length: number; angle: number } {
  const m = content.match(/L([-\d.]+),([-\d.]+)/);
  if (!m) return { length: 30, angle: 0 };
  const ex = parseFloat(m[1]);
  const ey = parseFloat(m[2]);
  const length = Math.round(Math.sqrt(ex * ex + ey * ey) * 10) / 10;
  const angle = Math.round(Math.atan2(ey, ex) * (180 / Math.PI));
  return { length, angle };
}

/** 길이/각도에서 svg-path content 생성 */
function buildLinePath(length: number, angle: number): string {
  const rad = (angle * Math.PI) / 180;
  const ex = Math.round(Math.cos(rad) * length * 100) / 100;
  const ey = Math.round(Math.sin(rad) * length * 100) / 100;
  return `M0,0 L${ex},${ey}`;
}

interface SelectedElement {
  side: 'front' | 'back';
  index: number;
}

interface DesignerElementPanelProps {
  elements: DesignElement[];
  editingSide: 'front' | 'back';
  selectedElement: SelectedElement | null;
  showEditor: boolean;
  onAddElement: (element: DesignElement) => void;
  onUpdateElement: (index: number, patch: Partial<DesignElement>) => void;
  onRemoveElement: (index: number) => void;
  onSelectElement: (sel: SelectedElement | null) => void;
  onMoveForward: (index: number) => void;
  onMoveBackward: (index: number) => void;
  onDuplicate: (index: number) => void;
}

const DEFAULT_TEXT: DesignElement = {
  type: 'text',
  x: 50,
  y: 31,
  content: '텍스트',
  style: { fontSize: '5', fill: '#333', textAnchor: 'middle' },
};

const DEFAULT_SHAPE: DesignElement = {
  type: 'shape',
  x: 45,
  y: 26,
  width: 10,
  height: 10,
  content: '',
  style: { fill: '#e2e8f0', stroke: '#94a3b8', strokeWidth: '0.3' },
};

const DEFAULT_LINE: DesignElement = {
  type: 'svg-path',
  x: 20,
  y: 31,
  content: 'M0,0 L30,0',
  style: { stroke: '#333', strokeWidth: '0.3' },
};

function elementLabel(el: DesignElement): string {
  switch (el.type) {
    case 'text':
      return el.content.length > 8 ? el.content.slice(0, 8) + '…' : el.content;
    case 'shape':
      return '사각형';
    case 'svg-path':
      return '선';
    case 'image':
      return '이미지';
    default:
      return '요소';
  }
}

function ElementTypeIcon({ type }: { type: DesignElement['type'] }) {
  switch (type) {
    case 'text':
      return <Type size={12} />;
    case 'shape':
      return <Square size={12} />;
    case 'svg-path':
      return <Minus size={12} />;
    default:
      return <Square size={12} />;
  }
}

export function DesignerElementPanel({
  elements,
  editingSide,
  selectedElement,
  showEditor,
  onAddElement,
  onUpdateElement,
  onRemoveElement,
  onSelectElement,
  onMoveForward,
  onMoveBackward,
  onDuplicate,
}: DesignerElementPanelProps) {
  const selectedIdx = selectedElement?.side === editingSide ? selectedElement.index : null;
  const selectedEl = selectedIdx !== null ? elements[selectedIdx] : null;

  return (
    <div className="space-y-3">
      {/* Add buttons */}
      <div>
        <span className="block mb-2 text-xs font-bold text-kkookk-navy">요소 추가</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onAddElement(DEFAULT_TEXT)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 hover:bg-slate-100 text-kkookk-navy"
          >
            <Type size={14} />
            텍스트
          </button>
          <button
            type="button"
            onClick={() => onAddElement(DEFAULT_SHAPE)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 hover:bg-slate-100 text-kkookk-navy"
          >
            <Square size={14} />
            사각형
          </button>
          <button
            type="button"
            onClick={() => onAddElement(DEFAULT_LINE)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 hover:bg-slate-100 text-kkookk-navy"
          >
            <Minus size={14} />
            선
          </button>
        </div>
      </div>

      {/* Element list */}
      {elements.length > 0 && (
        <div>
          <span className="block mb-2 text-xs font-bold text-kkookk-navy">
            {editingSide === 'front' ? '앞면' : '뒷면'} 요소 ({elements.length})
          </span>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {elements.map((el, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSelectElement({ side: editingSide, index: i })}
                className={`w-full flex items-center justify-between px-2 py-1.5 text-xs rounded cursor-pointer ${
                  selectedIdx === i
                    ? 'bg-blue-50 border border-blue-300'
                    : 'bg-white border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <ElementTypeIcon type={el.type} />
                  <span>{elementLabel(el)}</span>
                </span>
                <span className="flex items-center gap-0.5">
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); onMoveBackward(i); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onMoveBackward(i); } }}
                    className={`p-0.5 rounded text-slate-400 ${i > 0 ? 'hover:bg-slate-200 hover:text-slate-600' : 'opacity-30'}`}
                    title="뒤로 보내기"
                  >
                    <ChevronDown size={12} />
                  </span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); onMoveForward(i); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onMoveForward(i); } }}
                    className={`p-0.5 rounded text-slate-400 ${i < elements.length - 1 ? 'hover:bg-slate-200 hover:text-slate-600' : 'opacity-30'}`}
                    title="앞으로 보내기"
                  >
                    <ChevronUp size={12} />
                  </span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); onDuplicate(i); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onDuplicate(i); } }}
                    className="p-0.5 rounded text-slate-400 hover:bg-blue-100 hover:text-blue-500"
                    title="복제 (Ctrl+D)"
                  >
                    <Copy size={12} />
                  </span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveElement(i);
                      if (selectedIdx === i) onSelectElement(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                        onRemoveElement(i);
                        if (selectedIdx === i) onSelectElement(null);
                      }
                    }}
                    className="p-0.5 rounded hover:bg-red-100 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 size={12} />
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected element editor — only shown from panel list clicks */}
      {showEditor && selectedEl && selectedIdx !== null && (
        <div className="p-2 border rounded-lg border-blue-200 bg-blue-50/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-kkookk-navy">
              {selectedEl.type === 'text' ? '텍스트' : selectedEl.type === 'shape' ? '사각형' : '선'} 편집
            </span>
            <button
              type="button"
              onClick={() => {
                onRemoveElement(selectedIdx);
                onSelectElement(null);
              }}
              className="p-1 rounded hover:bg-red-100 text-red-500"
              title="삭제"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {/* Text-specific */}
          {selectedEl.type === 'text' && (
            <>
              <div>
                <label htmlFor="el-content" className="block mb-1 text-xs text-kkookk-steel">내용</label>
                <input
                  id="el-content"
                  type="text"
                  value={selectedEl.content}
                  onChange={(e) => onUpdateElement(selectedIdx, { content: e.target.value })}
                  className="w-full px-2 py-1 text-xs border rounded border-slate-200"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label htmlFor="el-font-size" className="block mb-1 text-xs text-kkookk-steel">크기</label>
                  <input
                    id="el-font-size"
                    type="number"
                    value={selectedEl.style?.fontSize || '5'}
                    onChange={(e) =>
                      onUpdateElement(selectedIdx, {
                        style: { ...selectedEl.style, fontSize: e.target.value },
                      })
                    }
                    min={1}
                    max={20}
                    step={0.5}
                    className="w-full px-2 py-1 text-xs border rounded border-slate-200"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="el-text-color" className="block mb-1 text-xs text-kkookk-steel">색상</label>
                  <input
                    id="el-text-color"
                    type="color"
                    value={selectedEl.style?.fill || '#333333'}
                    onChange={(e) =>
                      onUpdateElement(selectedIdx, {
                        style: { ...selectedEl.style, fill: e.target.value },
                      })
                    }
                    className="w-full h-7 rounded border border-slate-200 cursor-pointer"
                  />
                </div>
              </div>
            </>
          )}

          {/* Shape-specific */}
          {selectedEl.type === 'shape' && (
            <>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label htmlFor="el-width" className="block mb-1 text-xs text-kkookk-steel">너비</label>
                  <input
                    id="el-width"
                    type="number"
                    value={selectedEl.width || 10}
                    onChange={(e) =>
                      onUpdateElement(selectedIdx, { width: Number(e.target.value) })
                    }
                    min={1}
                    max={100}
                    step={1}
                    className="w-full px-2 py-1 text-xs border rounded border-slate-200"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="el-height" className="block mb-1 text-xs text-kkookk-steel">높이</label>
                  <input
                    id="el-height"
                    type="number"
                    value={selectedEl.height || 10}
                    onChange={(e) =>
                      onUpdateElement(selectedIdx, { height: Number(e.target.value) })
                    }
                    min={1}
                    max={100}
                    step={1}
                    className="w-full px-2 py-1 text-xs border rounded border-slate-200"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label htmlFor="el-fill" className="block mb-1 text-xs text-kkookk-steel">채움색</label>
                  <input
                    id="el-fill"
                    type="color"
                    value={selectedEl.style?.fill || '#e2e8f0'}
                    onChange={(e) =>
                      onUpdateElement(selectedIdx, {
                        style: { ...selectedEl.style, fill: e.target.value },
                      })
                    }
                    className="w-full h-7 rounded border border-slate-200 cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="el-stroke" className="block mb-1 text-xs text-kkookk-steel">테두리</label>
                  <input
                    id="el-stroke"
                    type="color"
                    value={selectedEl.style?.stroke || '#94a3b8'}
                    onChange={(e) =>
                      onUpdateElement(selectedIdx, {
                        style: { ...selectedEl.style, stroke: e.target.value },
                      })
                    }
                    className="w-full h-7 rounded border border-slate-200 cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="el-radius" className="block mb-1 text-xs text-kkookk-steel">모서리 둥글기</label>
                <input
                  id="el-radius"
                  type="number"
                  value={selectedEl.style?.borderRadius || '0'}
                  onChange={(e) =>
                    onUpdateElement(selectedIdx, {
                      style: { ...selectedEl.style, borderRadius: e.target.value },
                    })
                  }
                  min={0}
                  max={50}
                  step={0.5}
                  className="w-full px-2 py-1 text-xs border rounded border-slate-200"
                />
              </div>
            </>
          )}

          {/* Line-specific */}
          {selectedEl.type === 'svg-path' && (() => {
            const { length } = parseLinePath(selectedEl.content);
            const presets = [
              { label: '가로', path: buildLinePath(length, 0) },
              { label: '세로', path: buildLinePath(length, 90) },
              { label: '↗', path: buildLinePath(length, -45) },
              { label: '↘', path: buildLinePath(length, 45) },
            ];
            return (
              <div className="space-y-2">
                <div>
                  <span className="block mb-1 text-xs text-kkookk-steel">방향</span>
                  <div className="flex gap-1">
                    {presets.map(({ label, path }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => onUpdateElement(selectedIdx, { content: path })}
                        className={`flex-1 px-1 py-1 text-xs rounded border ${
                          selectedEl.content === path
                            ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                            : 'border-slate-200 text-kkookk-steel hover:bg-slate-50'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1 text-[10px] text-kkookk-steel">끝점을 드래그하여 자유 조절</p>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label htmlFor="el-line-color" className="block mb-1 text-xs text-kkookk-steel">색상</label>
                    <input
                      id="el-line-color"
                      type="color"
                      value={selectedEl.style?.stroke || '#333333'}
                      onChange={(e) =>
                        onUpdateElement(selectedIdx, {
                          style: { ...selectedEl.style, stroke: e.target.value },
                        })
                      }
                      className="w-full h-7 rounded border border-slate-200 cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="el-line-width" className="block mb-1 text-xs text-kkookk-steel">두께</label>
                    <input
                      id="el-line-width"
                      type="number"
                      value={selectedEl.style?.strokeWidth || '0.3'}
                      onChange={(e) =>
                        onUpdateElement(selectedIdx, {
                          style: { ...selectedEl.style, strokeWidth: e.target.value },
                        })
                      }
                      min={0.1}
                      max={5}
                      step={0.1}
                      className="w-full px-2 py-1 text-xs border rounded border-slate-200"
                    />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

export default DesignerElementPanel;
