/**
 * TerminalHistoryPage
 * 처리된 요청 히스토리 페이지 (Terminal stamp-events API 사용)
 */

import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { ProcessedHistory } from '@/features/terminal/components/ProcessedHistory';
import { useTerminalStampEvents } from '@/features/terminal/hooks/useTerminal';

interface HistoryItem {
  id: string;
  type: 'stamp';
  user: string;
  phone: string;
  time: Date;
  status: 'approved';
  content: string;
}

export function TerminalHistoryPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const storeIdNum = Number(storeId) || 0;

  const { data: stampData, isLoading, error } =
    useTerminalStampEvents(storeIdNum > 0 ? storeIdNum : undefined);

  const history = useMemo<HistoryItem[]>(() => {
    const events = stampData?.content ?? [];
    return events.map((event) => ({
      id: `stamp-${event.id}`,
      type: 'stamp' as const,
      user: event.customerName,
      phone: event.customerPhone,
      time: new Date(event.occurredAt),
      status: 'approved' as const,
      content: `스탬프 +${event.delta}개`,
    })).sort((a, b) => b.time.getTime() - a.time.getTime());
  }, [stampData]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1">
        <Loader2 className="w-8 h-8 animate-spin text-kkookk-indigo" />
        <p className="mt-4 text-kkookk-steel text-sm">처리 내역을 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1">
        <p className="text-kkookk-steel text-sm">처리 내역을 불러올 수 없습니다.</p>
      </div>
    );
  }

  return <ProcessedHistory items={history} />;
}

export default TerminalHistoryPage;
