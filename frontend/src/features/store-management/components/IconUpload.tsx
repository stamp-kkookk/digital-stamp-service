import { Camera, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB (백엔드와 동일)

interface IconUploadProps {
  file: File | null;
  existingUrl: string | null;
  onChange: (file: File | null) => void;
}

export function IconUpload({ file, existingUrl, onChange }: IconUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [file]);

  const displayUrl = previewUrl ?? existingUrl;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > MAX_SIZE_BYTES) {
      alert('아이콘 이미지 크기는 5MB 이하여야 합니다.');
      return;
    }

    onChange(selected);
    // input 초기화 (같은 파일 재선택 허용)
    e.target.value = '';
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
        {displayUrl ? (
          <img
            src={displayUrl}
            alt="매장 아이콘"
            className="w-full h-full object-cover"
          />
        ) : (
          <Camera size={24} className="text-slate-400" />
        )}
      </div>
      <div className="flex flex-col gap-1">
        {displayUrl && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
          >
            <X size={14} /> 삭제
          </button>
        )}
        <p className="text-xs text-kkookk-steel">최대 5MB · 권장 200×200px</p>
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
