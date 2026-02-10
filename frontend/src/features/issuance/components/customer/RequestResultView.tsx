/**
 * RequestResultView 컴포넌트
 * 스탬프 요청 처리 후 결과 화면
 */

import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface RequestResultViewProps {
  success: boolean;
  stampCount?: number;
  message?: string;
  onConfirm: () => void;
}

export function RequestResultView({
  success,
  stampCount,
  message,
  onConfirm,
}: RequestResultViewProps) {
  return (
    <div className="h-full flex flex-col p-6 justify-center text-center">
      <div
        className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
          success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-kkookk-red'
        }`}
      >
        {success ? <Check size={40} /> : <X size={40} />}
      </div>

      <h2 className="text-2xl font-bold mb-2 text-kkookk-navy">
        {success ? '적립 완료!' : '승인되지 않았어요'}
      </h2>

      <p className="text-kkookk-steel mb-8">
        {message ?? (success ? (stampCount ? `지금 ${stampCount}개예요` : '스탬프가 적립되었습니다') : '매장에 문의해주세요')}
      </p>

      <Button onClick={onConfirm} variant="subtle" size="full">
        {success ? '확인' : '돌아가기'}
      </Button>
    </div>
  );
}

export default RequestResultView;
