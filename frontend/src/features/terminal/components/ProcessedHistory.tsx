/**
 * ProcessedHistory 컴포넌트
 * 처리된 요청 히스토리 테이블
 */

import { formatTime } from '@/lib/utils/format';
import { Badge } from '@/components/ui/Badge';

interface HistoryItem {
  id: string;
  type: 'stamp' | 'reward';
  user: string;
  phone: string;
  time: Date;
  status: 'approved' | 'rejected';
  content: string;
}

interface ProcessedHistoryProps {
  items: HistoryItem[];
}

export function ProcessedHistory({ items }: ProcessedHistoryProps) {
  return (
    <>
      <div className="p-6 pb-2">
        <h2 className="text-2xl font-bold text-kkookk-navy">최근 처리 내역</h2>
      </div>
      <div className="p-6 flex-1 overflow-y-auto">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-xs font-bold text-kkookk-steel">시간</th>
                <th className="p-4 text-xs font-bold text-kkookk-steel">고객명</th>
                <th className="p-4 text-xs font-bold text-kkookk-steel">내용</th>
                <th className="p-4 text-xs font-bold text-kkookk-steel">결과</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-kkookk-steel text-sm"
                  >
                    처리된 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-4 text-sm text-kkookk-navy font-mono">
                      {formatTime(item.time)}
                    </td>
                    <td className="p-4 text-sm text-kkookk-navy font-bold">
                      {item.user}
                    </td>
                    <td className="p-4 text-sm text-kkookk-navy">
                      {item.content}
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={
                          item.status === 'approved' ? 'success' : 'destructive'
                        }
                      >
                        {item.status === 'approved' ? '승인됨' : '거절됨'}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default ProcessedHistory;
