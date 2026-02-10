/**
 * StoreHistoryPage 컴포넌트
 * 매장 적립/사용 이력 페이지
 */

import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, MapPin, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { formatDateTime, maskPhone } from '@/lib/utils/format';
import { useStore, useStampEvents, useRedeemEvents } from '@/features/store-management/hooks/useStore';

type HistoryFilter = 'all' | 'stamp' | 'reward';

// Combined history item type
interface HistoryItem {
  id: string | number;
  time: Date | string;
  user: string;
  phone: string;
  type: 'stamp' | 'reward';
  count?: number;
  content: string;
}

export function StoreHistoryPage() {
  const navigate = useNavigate();
  const { storeId } = useParams<{ storeId: string }>();
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('all');

  const storeIdNum = Number(storeId);

  // API Hooks
  const { data: store, isLoading: storeLoading, error: storeError } = useStore(storeIdNum);
  const {
    data: stampEventsData,
    isLoading: stampLoading,
    refetch: refetchStampEvents,
    isFetching: stampRefreshing,
  } = useStampEvents({ storeId: storeIdNum });
  const {
    data: redeemEventsData,
    isLoading: redeemLoading,
    refetch: refetchRedeemEvents,
    isFetching: redeemRefreshing,
  } = useRedeemEvents({ storeId: storeIdNum });

  const isRefreshing = stampRefreshing || redeemRefreshing;

  const handleRefresh = () => {
    refetchStampEvents();
    refetchRedeemEvents();
  };

  const handleFilterChange = (filter: HistoryFilter) => {
    setHistoryFilter(filter);
  };

  // Combine stamp and reward data from API (must be before early returns)
  const combinedHistory = useMemo<HistoryItem[]>(() => {
    const stampHistory: HistoryItem[] = (stampEventsData?.content ?? []).map((event) => ({
      id: `stamp-${event.id}`,
      time: event.occurredAt,
      user: event.customerName,
      phone: event.customerPhone,
      type: 'stamp' as const,
      count: event.delta,
      content: `+${event.delta}`,
    }));

    const rewardHistory: HistoryItem[] = (redeemEventsData?.content ?? [])
      .filter((event) => event.type === 'COMPLETED' && event.result === 'SUCCESS')
      .map((event) => ({
        id: `redeem-${event.id}`,
        time: event.occurredAt,
        user: event.customerNickname,
        phone: '',
        type: 'reward' as const,
        content: event.rewardName || '쿠폰 사용',
      }));

    return [...stampHistory, ...rewardHistory].sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
    );
  }, [stampEventsData, redeemEventsData]);

  // Filter history based on selected tab
  const filteredHistory = combinedHistory.filter((item) => {
    if (historyFilter === 'all') return true;
    return item.type === historyFilter;
  });

  // Loading state
  if (storeLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-kkookk-indigo" />
        <p className="mt-4 text-kkookk-steel">매장 정보를 불러오는 중...</p>
      </div>
    );
  }

  // Error or not found state
  if (storeError || !store) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
        <p className="mt-4 text-kkookk-steel">매장을 찾을 수 없습니다.</p>
        <button
          onClick={() => navigate('/owner/stores')}
          className="mt-4 px-4 py-2 border border-slate-200 rounded-lg text-kkookk-navy font-bold hover:bg-slate-50"
        >
          매장 목록으로
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(`/owner/stores/${storeId}`)}
            className="p-2 -ml-2 text-kkookk-steel hover:text-kkookk-navy hover:bg-slate-50 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-kkookk-navy">{store.name}</h2>
            <p className="text-kkookk-steel text-sm flex items-center gap-1">
              <MapPin size={12} /> {store.address}
            </p>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex gap-1">
          <button
            onClick={() => navigate(`/owner/stores/${storeId}`)}
            className="px-4 py-2 rounded-lg font-bold text-sm transition-colors text-kkookk-steel hover:bg-slate-50"
          >
            스탬프 카드 관리
          </button>
          <button className="px-4 py-2 rounded-lg font-bold text-sm transition-colors bg-kkookk-navy text-white">
            적립/사용 내역
          </button>
          <button
            onClick={() => navigate(`/owner/stores/${storeId}/migrations`)}
            className="px-4 py-2 rounded-lg font-bold text-sm transition-colors text-kkookk-steel hover:bg-slate-50"
          >
            전환 신청 관리
          </button>
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-kkookk-navy">적립/사용 내역</h3>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 text-kkookk-steel hover:text-kkookk-navy hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                title="새로고침"
              >
                <RefreshCw
                  size={18}
                  className={isRefreshing ? 'animate-spin' : ''}
                />
              </button>
            </div>
            <div className="flex bg-white border border-slate-200 rounded-lg p-1">
              {(['all', 'stamp', 'reward'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => handleFilterChange(filter)}
                  className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${
                    historyFilter === filter
                      ? 'bg-kkookk-navy text-white'
                      : 'text-kkookk-steel hover:bg-slate-50'
                  }`}
                >
                  {filter === 'all'
                    ? '전체'
                    : filter === 'stamp'
                      ? '스탬프 적립'
                      : '리워드 사용'}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex-1 flex flex-col">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 pl-6 text-xs font-bold text-kkookk-steel">
                    일시
                  </th>
                  <th className="p-4 text-xs font-bold text-kkookk-steel">
                    닉네임
                  </th>
                  <th className="p-4 text-xs font-bold text-kkookk-steel">
                    연락처
                  </th>
                  <th className="p-4 text-xs font-bold text-kkookk-steel">구분</th>
                  <th className="p-4 text-xs font-bold text-kkookk-steel text-right pr-6">
                    내용
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(stampLoading || redeemLoading) ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-kkookk-indigo mx-auto" />
                    </td>
                  </tr>
                ) : (
                  <>
                    {filteredHistory.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="p-4 pl-6 text-sm text-kkookk-steel font-mono">
                          {formatDateTime(item.time)}
                        </td>
                        <td className="p-4 text-sm font-bold text-kkookk-navy">
                          {item.user}
                        </td>
                        <td className="p-4 text-sm text-kkookk-steel font-mono">
                          {item.phone ? maskPhone(item.phone) : '-'}
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded ${
                              item.type === 'stamp'
                                ? 'bg-blue-50 text-kkookk-indigo'
                                : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {item.type === 'stamp' ? '적립' : '사용'}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-right pr-6 font-bold text-kkookk-navy">
                          {item.content}
                        </td>
                      </tr>
                    ))}
                    {filteredHistory.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-12 text-center text-kkookk-steel"
                        >
                          해당하는 내역이 없습니다.
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StoreHistoryPage;
