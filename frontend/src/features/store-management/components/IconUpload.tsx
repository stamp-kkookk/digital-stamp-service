import { Camera, X } from 'lucide-react';
import { useRef } from 'react';

const MAX_SIZE_BYTES = 3 * 1024 * 1024; // 3MB

interface IconUploadProps {
  value: string | null;
  onChange: (base64: string | null) => void;
}

export function IconUpload({ value, onChange }: IconUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_SIZE_BYTES) {
      alert('아이콘 이미지 크기는 3MB 이하여야 합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the "data:image/...;base64," prefix for storage
      const base64 = result.split(',')[1] ?? result;
      onChange(base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center gap-4">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className="flex items-center justify-center w-20 h-20 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-kkookk-indigo transition-colors overflow-hidden"
      >
        {value ? (
          <img
            src={`data:image/png;base64,${value}`}
            alt="매장 아이콘"
            className="w-full h-full object-cover"
          />
        ) : (
          <Camera size={24} className="text-slate-400" />
        )}
      </div>
      <div className="flex flex-col gap-1">
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
          >
            <X size={14} /> 삭제
          </button>
        )}
        <p className="text-xs text-kkookk-steel">최대 3MB · 권장 200×200px</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
