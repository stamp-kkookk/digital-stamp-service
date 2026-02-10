/**
 * StoreStatusToggle 컴포넌트
 * 매장 영업/마감 상태 토글
 */

import { Store, Power } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StoreStatus } from '@/types/domain';

interface StoreStatusToggleProps {
  status: StoreStatus;
  onToggle: () => void;
}

export function StoreStatusToggle({
  status,
  onToggle,
}: StoreStatusToggleProps) {
  const isOpen = status === 'OPEN';

  return (
    <>
      <div className="p-6 pb-2">
        <h2 className="text-2xl font-bold text-kkookk-navy">매장 설정</h2>
      </div>
      <div className="p-6">
        {/* 매장 상태 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex justify-between items-center shadow-sm">
          <div>
            <h3 className="font-bold text-lg text-kkookk-navy flex items-center gap-2">
              <Store size={20} /> 영업 상태 설정
            </h3>
            <p className="text-sm text-kkookk-steel mt-1">
              영업 종료 시 고객이 적립을 요청할 수 없습니다.
            </p>
          </div>
          <button
            onClick={onToggle}
            className={cn(
              'relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none',
              isOpen ? 'bg-green-500' : 'bg-slate-300'
            )}
            role="switch"
            aria-checked={isOpen}
          >
            <span
              className={cn(
                'inline-block h-6 w-6 transform rounded-full bg-white transition-transform',
                isOpen ? 'translate-x-7' : 'translate-x-1'
              )}
            />
          </button>
        </div>

        {/* 자동 승인 (비활성화/준비중) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mt-4 flex justify-between items-center shadow-sm opacity-50 cursor-not-allowed">
          <div>
            <h3 className="font-bold text-lg text-kkookk-navy flex items-center gap-2">
              <Power size={20} /> 자동 승인 모드 (준비중)
            </h3>
            <p className="text-sm text-kkookk-steel mt-1">
              바쁜 시간대에 모든 요청을 자동으로 승인합니다.
            </p>
          </div>
          <div className="relative inline-flex h-8 w-14 items-center rounded-full bg-slate-200">
            <span className="inline-block h-6 w-6 transform rounded-full bg-white translate-x-1" />
          </div>
        </div>
      </div>
    </>
  );
}

export default StoreStatusToggle;
