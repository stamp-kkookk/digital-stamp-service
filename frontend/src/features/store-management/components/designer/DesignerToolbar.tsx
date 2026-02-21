/**
 * DesignerToolbar
 * 실행취소/재실행 도구바
 */

import { Undo2, Redo2 } from 'lucide-react';

interface DesignerToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export function DesignerToolbar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: DesignerToolbarProps) {
  return (
    <div className="flex items-center gap-2 p-2 border rounded-lg border-slate-200 bg-white">
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30"
        title="실행 취소 (Ctrl+Z)"
      >
        <Undo2 size={16} />
      </button>
      <button
        type="button"
        onClick={onRedo}
        disabled={!canRedo}
        className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30"
        title="재실행 (Ctrl+Y)"
      >
        <Redo2 size={16} />
      </button>
    </div>
  );
}

export default DesignerToolbar;
