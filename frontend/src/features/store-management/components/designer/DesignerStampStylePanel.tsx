/**
 * DesignerStampStylePanel
 * 도장 모양/아이콘/빈 슬롯 스타일 선택 + 커스텀 이미지 업로드
 */

import { useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';
import type { StampStyle } from '@/features/wallet/types/designV2';

interface DesignerStampStylePanelProps {
  stampStyle: StampStyle;
  onChange: (patch: Partial<StampStyle>) => void;
}

const SHAPES: Array<{ value: StampStyle['shape']; label: string }> = [
  { value: 'circle', label: '원형' },
  { value: 'square', label: '사각형' },
  { value: 'rounded-square', label: '둥근 사각형' },
];

const EMPTY_STYLES: Array<{ value: StampStyle['emptyStyle']; label: string }> = [
  { value: 'dashed', label: '점선' },
  { value: 'outline', label: '실선' },
  { value: 'solid', label: '채움' },
];

const MAX_ICON_SIZE = 300_000; // ~300KB base64

export function DesignerStampStylePanel({ stampStyle, onChange }: DesignerStampStylePanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (result.length > MAX_ICON_SIZE) {
        alert('이미지가 너무 큽니다. 300KB 이하의 이미지를 사용해주세요.');
        return;
      }
      onChange({ customIcon: result });
    };
    reader.readAsDataURL(file);

    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      {!stampStyle.customIcon && (
        <div>
          <span className="block mb-2 text-xs font-bold text-kkookk-navy">도장 모양</span>
          <div className="flex gap-2">
            {SHAPES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => onChange({ shape: value })}
                className={`px-3 py-1.5 text-xs rounded-lg border ${
                  stampStyle.shape === value
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                    : 'border-slate-200 text-kkookk-steel hover:bg-slate-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom stamp icon */}
      <div>
        <span className="block mb-2 text-xs font-bold text-kkookk-navy">커스텀 도장 이미지</span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={handleIconUpload}
          className="hidden"
        />
        {stampStyle.customIcon ? (
          <div className="flex items-center gap-2">
            <div className="relative w-12 h-12 rounded-lg border border-slate-200 overflow-hidden bg-white flex items-center justify-center">
              <img
                src={stampStyle.customIcon}
                alt="도장 아이콘"
                className="w-10 h-10 object-contain"
              />
            </div>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                변경
              </button>
              <button
                type="button"
                onClick={() => onChange({ customIcon: null })}
                className="flex items-center gap-0.5 text-xs text-red-500 hover:text-red-600"
              >
                <X size={10} />
                제거
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg border-2 border-dashed border-slate-300 text-kkookk-steel hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            <ImagePlus size={14} />
            이미지 업로드
          </button>
        )}
        <p className="mt-1 text-[10px] text-kkookk-steel">PNG, JPG, SVG (300KB 이하, 투명 배경 권장)</p>
      </div>

      <div>
        <span className="block mb-2 text-xs font-bold text-kkookk-navy">빈 슬롯 스타일</span>
        <div className="flex gap-2">
          {EMPTY_STYLES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ emptyStyle: value })}
              className={`px-3 py-1.5 text-xs rounded-lg border ${
                stampStyle.emptyStyle === value
                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                  : 'border-slate-200 text-kkookk-steel hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DesignerStampStylePanel;
