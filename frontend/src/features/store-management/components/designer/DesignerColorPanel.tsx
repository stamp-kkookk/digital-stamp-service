/**
 * DesignerColorPanel
 * 배경색(컬러피커) + 이미지 업로드 + 도장 색상(컬러피커)
 */

import { useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';
import type { Background, StampStyle } from '@/features/wallet/types/designV2';

interface DesignerColorPanelProps {
  editingSide: 'front' | 'back';
  background: Background;
  stampStyle: StampStyle;
  onBackgroundChange: (bg: Background) => void;
  onStampStyleChange: (patch: Partial<StampStyle>) => void;
}

const MAX_IMAGE_SIZE = 500_000; // ~500KB base64

export function DesignerColorPanel({
  editingSide,
  background,
  stampStyle,
  onBackgroundChange,
  onStampStyleChange,
}: DesignerColorPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (result.length > MAX_IMAGE_SIZE) {
        alert('이미지가 너무 큽니다. 500KB 이하의 이미지를 사용해주세요.');
        return;
      }
      onBackgroundChange({ type: 'image', value: result });
    };
    reader.readAsDataURL(file);

    e.target.value = '';
  };

  const bgColor = background.type === 'color' ? background.value : '#FFFFFF';

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="bg-color" className="block mb-2 text-xs font-bold text-kkookk-navy">
          {editingSide === 'front' ? '앞면' : '뒷면'} 배경색
        </label>
        <input
          id="bg-color"
          type="color"
          value={bgColor}
          onChange={(e) => onBackgroundChange({ type: 'color', value: e.target.value })}
          className="w-full h-8 rounded-lg border border-slate-200 cursor-pointer"
        />
      </div>

      {/* Image background */}
      <div>
        <span className="block mb-2 text-xs font-bold text-kkookk-navy">배경 이미지</span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleImageUpload}
          className="hidden"
        />
        {background.type === 'image' ? (
          <div className="relative">
            <img
              src={background.value}
              alt="배경 미리보기"
              className="w-full h-16 object-cover rounded-lg border border-slate-200"
            />
            <button
              type="button"
              onClick={() => onBackgroundChange({ type: 'color', value: '#FFFFFF' })}
              className="absolute top-1 right-1 p-0.5 rounded-full bg-white/80 hover:bg-red-100 text-red-500 border border-slate-200"
              title="이미지 제거"
            >
              <X size={12} />
            </button>
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
        <p className="mt-1 text-[10px] text-kkookk-steel">PNG, JPG, WebP (500KB 이하)</p>
      </div>

      {editingSide === 'back' && (
        <div>
          <label htmlFor="stamp-color" className="block mb-2 text-xs font-bold text-kkookk-navy">
            도장 색상
          </label>
          <input
            id="stamp-color"
            type="color"
            value={stampStyle.filledColor}
            onChange={(e) => onStampStyleChange({ filledColor: e.target.value })}
            className="w-full h-8 rounded-lg border border-slate-200 cursor-pointer"
          />
        </div>
      )}
    </div>
  );
}

export default DesignerColorPanel;
