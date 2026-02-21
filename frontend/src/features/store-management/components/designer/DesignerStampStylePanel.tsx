/**
 * DesignerStampStylePanel
 * 도장 탭: 배경(색상+투명+유형) + 도장 모양(아이콘/이미지) + 빈 도장 테두리
 */

import { useRef, useState, useEffect } from 'react';
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

const ICON_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'checkmark', label: '체크무늬' },
  { value: 'smiley', label: '스마일' },
  { value: 'star', label: '별 모양' },
];

const EMPTY_STYLES: Array<{ value: StampStyle['emptyStyle']; label: string }> = [
  { value: 'dashed', label: '점선' },
  { value: 'outline', label: '실선' },
  { value: 'solid', label: '채움' },
  { value: 'none', label: '없음' },
];

const MAX_ICON_SIZE = 5_000_000; // ~5MB base64

export function DesignerStampStylePanel({ stampStyle, onChange }: DesignerStampStylePanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stampMode, setStampMode] = useState<'shape' | 'image'>(
    stampStyle.customIcon ? 'image' : 'shape',
  );

  // Sync mode when customIcon changes externally
  useEffect(() => {
    setStampMode(stampStyle.customIcon ? 'image' : 'shape');
  }, [stampStyle.customIcon]);

  const handleModeChange = (mode: 'shape' | 'image') => {
    setStampMode(mode);
    if (mode === 'shape' && stampStyle.customIcon) {
      onChange({ customIcon: null });
    }
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (result.length > MAX_ICON_SIZE) {
        alert('이미지가 너무 큽니다. 5MB 이하의 이미지를 사용해주세요.');
        return;
      }
      onChange({ customIcon: result });
    };
    reader.readAsDataURL(file);

    e.target.value = '';
  };

  const isTransparent = stampStyle.filledColor === 'transparent';
  const currentIcon = stampStyle.icon || 'checkmark';

  return (
    <div className="space-y-4">
      {/* 배경 (색상 + 유형) */}
      <div>
        <label htmlFor="stamp-bg-color" className="block mb-2 text-xs font-bold text-kkookk-navy">
          배경
        </label>
        <div className="flex items-center gap-2 mb-3">
          <input
            id="stamp-bg-color"
            type="color"
            value={isTransparent ? '#FFFFFF' : stampStyle.filledColor}
            onChange={(e) => onChange({ filledColor: e.target.value })}
            disabled={isTransparent}
            className={`flex-1 h-8 rounded-lg border border-slate-200 cursor-pointer ${isTransparent ? 'opacity-40' : ''}`}
          />
          <button
            type="button"
            onClick={() =>
              onChange({ filledColor: isTransparent ? '#4F46E5' : 'transparent' })
            }
            className={`px-2 py-1.5 text-[10px] rounded-lg border whitespace-nowrap ${
              isTransparent
                ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                : 'border-slate-200 text-kkookk-steel hover:bg-slate-50'
            }`}
          >
            투명
          </button>
        </div>

        {/* 유형 (원형/사각형/둥근 사각형) */}
        <span className="block mb-2 text-[11px] font-medium text-kkookk-steel">유형</span>
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

      {/* 도장 모양 (아이콘/이미지) */}
      <div>
        <span className="block mb-2 text-xs font-bold text-kkookk-navy">도장 모양</span>
        <div className="flex border rounded-lg border-slate-200 overflow-hidden mb-3">
          <button
            type="button"
            onClick={() => handleModeChange('shape')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${
              stampMode === 'shape'
                ? 'bg-kkookk-navy text-white'
                : 'bg-white text-kkookk-steel hover:bg-slate-50'
            }`}
          >
            모양
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('image')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${
              stampMode === 'image'
                ? 'bg-kkookk-navy text-white'
                : 'bg-white text-kkookk-steel hover:bg-slate-50'
            }`}
          >
            이미지
          </button>
        </div>

        {/* Icon selector */}
        {stampMode === 'shape' && (
          <div className="flex gap-2">
            {ICON_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => onChange({ icon: value })}
                className={`px-3 py-1.5 text-xs rounded-lg border ${
                  currentIcon === value
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                    : 'border-slate-200 text-kkookk-steel hover:bg-slate-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Image upload */}
        {stampMode === 'image' && (
          <div>
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
            <p className="mt-1 text-[10px] text-kkookk-steel">PNG, JPG, SVG (5MB 이하, 투명 배경 권장)</p>
          </div>
        )}
      </div>

      {/* Empty slot style */}
      <div>
        <span className="block mb-2 text-xs font-bold text-kkookk-navy">빈 도장 테두리</span>
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
