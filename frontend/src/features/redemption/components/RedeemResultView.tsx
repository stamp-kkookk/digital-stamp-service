/**
 * RedeemResultView 컴포넌트
 * 리딤 처리 후 결과 화면
 */

import { Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface RedeemResultViewProps {
  success: boolean;
  onConfirm: () => void;
}

export function RedeemResultView({
  success,
  onConfirm,
}: RedeemResultViewProps) {
  return (
    <div className="h-full flex flex-col p-6 justify-center text-center bg-white">
      <div
        className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
          success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-kkookk-red'
        }`}
      >
        {success ? <Check size={40} /> : <AlertCircle size={40} />}
      </div>

      <h2 className="text-2xl font-bold mb-2 text-kkookk-navy">
        {success ? '사용 완료!' : '사용 처리 실패'}
      </h2>

      <p className="text-kkookk-steel mb-8">
        {success
          ? '리워드가 정상적으로 사용되었습니다.'
          : '다시 시도하거나 매장에 문의해주세요.'}
      </p>

      <Button onClick={onConfirm} variant="navy" size="full">
        확인하고 보관함 가기
      </Button>
    </div>
  );
}

export default RedeemResultView;
