/**
 * CustomerHistoryPage 컴포넌트
 * 고객 활동 이력 페이지 (스탬프 적립 + 리워드 사용 통합)
 */

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, History, Check, Gift, Loader2 } from 'lucide-react';
import { useCustomerNavigate } from '@/hooks/useCustomerNavigate';
import { formatFullDateTime } from '@/lib/utils/format';
import { useStampHistory, useRedeemHistory } from '@/features/wallet/hooks/useWallet';
import { isStepUpValid } from '@/lib/api/tokenManager';
import { StepUpVerify } from '@/components/shared/StepUpVerify';

type HistoryFilter = 'all' | 'stamp' | 'reward';

interface HistoryEntry {
  id: string;
  type: 'stamp' | 'reward';
  description: string;
  count: number;
  time: Date;
}

export function CustomerHistoryPage() {
  const { storeId: defaultStoreId, customerNavigate } = useCustomerNavigate();
  const [searchParams] = useSearchParams();
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [stepUpValid, setStepUpValid] = useState(isStepUpValid());

  // query param 우선, 없으면 sessionStorage/URL fallback
  const storeIdNum = Number(searchParams.get('storeId')) || (defaultStoreId ? Number(defaultStoreId) : undefined);

  // 스탬프 적립 이력 (StepUp 필요)
  const { data: stampData, isLoading: stampLoading } = useStampHistory(storeIdNum);

  // 리워드 사용 이력 (StepUp 필요)
  const { data: redeemData, isLoading: redeemLoading } = useRedeemHistory(storeIdNum);

  const isLoading = stampLoading || redeemLoading;

  // API 데이터를 통합 형식으로 변환
  const entries: HistoryEntry[] = [];

  if (stampData?.events) {
    for (const item of stampData.events) {
      entries.push({
        id: `stamp-${item.id}`,
        type: 'stamp',
        description: item.reason,
        count: item.delta,
        time: new Date(item.occurredAt),
      });
    }
  }

  if (redeemData?.events) {
    for (const item of redeemData.events) {
      entries.push({
        id: `redeem-${item.id}`,
        type: 'reward',
        description: item.store.storeName,
        count: 1,
        time: new Date(item.occurredAt),
      });
    }
  }

  const filteredEntries = entries
    .filter((entry) => {
      if (filter === 'all') return true;
      return entry.type === filter;
    })
    .sort((a, b) => b.time.getTime() - a.time.getTime());

  return (
    <div className="h-full bg-white flex flex-col">
      {/* 헤더 */}
      <div className="px-6 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center sticky top-0 bg-white z-10 justify-between">
        <div className="flex items-center">
          <button
            onClick={() => customerNavigate('/wallet')}
            className="p-2 -ml-2 text-kkookk-steel hover:text-kkookk-navy"
            aria-label="뒤로 가기"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="font-bold text-lg ml-2 text-kkookk-navy">활동 이력</h1>
        </div>
      </div>

      {/* 필터 */}
      <div className="px-6 py-4 border-b border-slate-50 flex gap-2">
        {(['all', 'stamp', 'reward'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              filter === f
                ? 'bg-kkookk-navy text-white shadow-md shadow-slate-200'
                : 'bg-slate-100 text-kkookk-steel hover:bg-slate-200'
            }`}
          >
            {f === 'all'
              ? '전체'
              : f === 'stamp'
                ? '스탬프 적립'
                : '리워드 사용'}
          </button>
        ))}
      </div>

      {/* 목록 */}
      <div className="flex-1 overflow-y-auto px-6">
        {!stepUpValid ? (
          <div className="flex items-center justify-center py-16">
            <StepUpVerify onVerified={() => setStepUpValid(true)} />
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-kkookk-steel">
            <Loader2 size={32} className="animate-spin opacity-40 mb-4" />
            <p>이력을 불러오는 중...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-kkookk-steel">
            <History size={48} className="opacity-20 mb-4" />
            <p>내역이 없습니다.</p>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0 animate-in fade-in slide-in-from-bottom-2"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    entry.type === 'stamp'
                      ? 'bg-orange-50 text-kkookk-orange-500'
                      : 'bg-purple-50 text-purple-600'
                  }`}
                >
                  {entry.type === 'stamp' ? (
                    <Check size={20} />
                  ) : (
                    <Gift size={20} />
                  )}
                </div>
                <div>
                  <p className="font-bold text-sm text-kkookk-navy">
                    {entry.description}
                  </p>
                  <p className="text-xs text-kkookk-steel mt-0.5">
                    {formatFullDateTime(entry.time)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`font-bold text-base ${
                    entry.type === 'stamp'
                      ? 'text-kkookk-orange-500'
                      : 'text-kkookk-navy'
                  }`}
                >
                  {entry.type === 'stamp' ? `+${entry.count}` : '사용'}
                </span>
                <p className="text-[10px] text-kkookk-steel mt-0.5">
                  {entry.type === 'stamp' ? '스탬프' : '리워드'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CustomerHistoryPage;
