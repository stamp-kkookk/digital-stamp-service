/**
 * QRPosterModal 컴포넌트
 * 매장용 QR 포스터 표시 및 다운로드 모달
 */

import { useState } from 'react';
import { QrCode, Smartphone, Check, Download, X, Loader2, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface QRPosterModalProps {
  isOpen: boolean;
  storeName: string;
  storeId?: number;
  qrCodeBase64?: string;
  isLoading?: boolean;
  onClose: () => void;
  onDownload: () => void;
}

export function QRPosterModal({
  isOpen,
  storeName,
  storeId,
  qrCodeBase64,
  isLoading,
  onClose,
  onDownload,
}: QRPosterModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    if (!storeId) return;
    const link = `${window.location.origin}/stores/${storeId}/customer`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that don't support clipboard API
      const textarea = document.createElement('textarea');
      textarea.value = link;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* 배경 오버레이 */}
      <div
        role="button"
        tabIndex={0}
        aria-label="QR 포스터 모달 닫기"
        className="absolute inset-0 bg-kkookk-navy/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClose();
          }
        }}
      />

      {/* 모달 */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95">
        {/* 헤더 */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-kkookk-navy">
            QR 포스터 미리보기
          </h3>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-kkookk-steel hover:text-kkookk-navy rounded-full hover:bg-slate-100"
            aria-label="닫기"
          >
            <X size={20} />
          </button>
        </div>

        {/* 미리보기 */}
        <div className="p-8 bg-slate-50 flex justify-center">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center w-full aspect-[3/4] flex flex-col items-center justify-center">
            <h4 className="font-bold text-xl text-kkookk-navy mb-1">
              {storeName}
            </h4>
            <p className="text-xs text-kkookk-orange-500 font-bold mb-6">
              스탬프 적립 & 리워드 사용
            </p>

            <div className="bg-kkookk-navy p-4 rounded-xl mb-6 min-w-[152px] min-h-[152px] flex items-center justify-center">
              {isLoading ? (
                <Loader2 size={48} className="text-white animate-spin" />
              ) : qrCodeBase64 ? (
                <img
                  src={`data:image/png;base64,${qrCodeBase64}`}
                  alt={`${storeName} QR 코드`}
                  className="w-[120px] h-[120px]"
                />
              ) : (
                <QrCode size={120} className="text-white" />
              )}
            </div>

            <div className="flex items-center gap-2 text-kkookk-navy font-bold text-sm bg-slate-100 px-4 py-2 rounded-full">
              <Smartphone size={16} />
              <span>카메라로 스캔하세요</span>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="p-6 bg-white border-t border-slate-100">
          <p className="text-center text-sm text-kkookk-steel mb-4 flex items-center justify-center gap-2">
            <Check size={14} className="text-green-500" /> 프린트 후 매장에
            배치해주세요
          </p>
          <div className="space-y-2">
            <Button
              onClick={onDownload}
              variant="navy"
              size="full"
              className="shadow-lg shadow-kkookk-navy/20"
            >
              <Download size={20} /> 이미지로 저장하기
            </Button>
            {storeId && (
              <Button
                onClick={handleCopyLink}
                variant="subtle"
                size="full"
              >
                <Link2 size={18} />
                {copied ? '복사 완료!' : 'QR 링크 복사하기'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QRPosterModal;
