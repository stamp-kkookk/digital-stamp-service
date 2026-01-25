import React from 'react';
import { Info, ShieldAlert } from 'lucide-react';

const SecurityInfo: React.FC = () => {
  const securityWarnings = [
    '매장 위치나 명칭이 변경되어도 URL은 유지되므로 인쇄물을 다시 제작하실 필요가 없습니다.',
    '현재 활성화된 스탬프 카드가 없을 경우, 고객에게 ‘진행 중인 이벤트 없음’ 메시지가 노출됩니다.',
    'QR 코드는 고객이 직접 스캔해야 하며, 점주가 대신 스탬프를 적립해주는 행위는 어뷰징으로 간주될 수 있습니다.',
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-3">
        <Info className="h-5 w-5 text-blue-500 mt-0.5" />
        <p className="text-sm text-gray-700">
          이 QR은 매장 전용 고정 코드입니다. 매장에 비치할 포스터나 테이블 텐트 제작 시 활용하세요.
        </p>
      </div>

      <div className="bg-white p-6 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">연결 및 보안 설정</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500 mb-1">진입 방식</p>
            <p className="text-base font-semibold text-gray-800">고정형 (Static)</p>
            <p className="text-xs text-gray-500 mt-1">토큰 만료가 없는 상시용 코드입니다.</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500 mb-1">첫 방문 인증</p>
            <p className="text-base font-semibold text-gray-800">필수 (OTP)</p>
            <p className="text-xs text-gray-500 mt-1">최초 1회 인증 후 지갑이 자동으로 생성됩니다.</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 border border-gray-200 rounded-lg">
        <div className="flex items-center mb-4">
          <ShieldAlert className="h-6 w-6 text-yellow-500 mr-3" />
          <h3 className="text-lg font-semibold text-gray-800">운영 및 보안 주의사항</h3>
        </div>
        <ul className="space-y-3">
          {securityWarnings.map((warning, index) => (
            <li key={index} className="flex items-start">
              <span className="text-xs font-semibold text-gray-500 mr-3 mt-1">{`0${index + 1}`}</span>
              <p className="text-sm text-gray-600">{warning}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SecurityInfo;
