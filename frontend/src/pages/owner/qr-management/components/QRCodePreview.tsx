import React from 'react';
import { Download, Printer } from 'lucide-react';

interface QRCodePreviewProps {
  storeId: string;
}

const QRCodePreview: React.FC<QRCodePreviewProps> = ({ storeId }) => {
  // Use a placeholder for QR code image generation for now.
  // In a real scenario, this would be an API endpoint.
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://kkookk.com/c/store/${storeId}`;
  const downloadUrl = `/api/v1/owner/stores/${storeId}/qr/download`;
  const posterUrl = `/api/v1/owner/stores/${storeId}/qr/poster`;

  if (!storeId) {
    return (
      <div className="w-full max-w-sm mx-auto bg-white p-8 border border-gray-200 rounded-lg flex flex-col items-center justify-center h-[400px]">
        <p className="text-gray-500">매장을 선택해주세요.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto bg-white p-8 border border-gray-200 rounded-lg flex flex-col items-center space-y-6">
      <div className="relative">
        <img
          src={qrImageUrl}
          alt="Store QR Code"
          className="w-56 h-56 rounded-lg"
        />
        <div className="absolute -top-3 -right-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full transform rotate-12">
          매장 QR
        </div>
      </div>
      
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-800">매장 고정 QR</h3>
        <p className="text-sm text-gray-500 bg-gray-100 rounded-full px-3 py-1 mt-2">
          ID: {storeId}
        </p>
      </div>

      <div className="w-full space-y-3">
        <a
          href={downloadUrl}
          download
          className="w-full flex items-center justify-center px-4 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors"
        >
          <Download className="h-5 w-5 mr-2" />
          PNG 이미지 다운로드
        </a>
        <a
          href={posterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center px-4 py-3 bg-white text-gray-800 font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Printer className="h-5 w-5 mr-2" />
          포스터 양식으로 인쇄
        </a>
      </div>
    </div>
  );
};

export default QRCodePreview;
