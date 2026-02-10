/**
 * RequestingView 컴포넌트
 * 스탬프 요청 대기 중 폴링/대기 화면
 */

import { Loader2, TestTube } from 'lucide-react';
import { formatCountdown } from '@/lib/utils/format';

interface RequestingViewProps {
  requestId: string;
  remainingSeconds?: number;
  /** 개발 시뮬레이션 전용 */
  onSimulateApprove?: () => void;
  onSimulateReject?: () => void;
  showDevControls?: boolean;
}

export function RequestingView({
  requestId,
  remainingSeconds = 118,
  onSimulateApprove,
  onSimulateReject,
  showDevControls = true,
}: RequestingViewProps) {
  return (
    <div className="h-full flex flex-col p-6 justify-center text-center bg-kkookk-navy text-white relative">
      <div className="flex-1 flex flex-col justify-center">
        <Loader2 className="animate-spin w-12 h-12 mx-auto mb-6 text-kkookk-orange-500" />
        <h2 className="text-2xl font-bold mb-2">적립 승인 대기 중</h2>
        <p className="text-white/60 mb-8">매장에서 확인 후 승인해요</p>
        <div className="inline-block bg-white/10 px-4 py-2 rounded-full text-sm font-mono mb-12">
          남은 시간 {formatCountdown(remainingSeconds)}
        </div>
        <p className="text-xs text-white/40">요청번호 #{requestId.slice(-6)}</p>
      </div>

      {/* 개발자 시뮬레이션 컨트롤 */}
      {showDevControls && (
        <div className="bg-white/10 rounded-2xl p-4 mb-8 backdrop-blur-sm border border-white/10">
          <div className="flex items-center justify-center gap-2 mb-3 text-white/60 text-xs font-medium">
            <TestTube size={14} />
            <span>개발자 시뮬레이션 모드</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onSimulateReject}
              className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-200 text-sm font-bold rounded-xl border border-red-500/30 transition-colors"
            >
              거절 시나리오
            </button>
            <button
              onClick={onSimulateApprove}
              className="flex-1 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-200 text-sm font-bold rounded-xl border border-green-500/30 transition-colors"
            >
              승인 시나리오
            </button>
          </div>
          <p className="text-[10px] text-white/30 text-center mt-3">
            실제로는 매장 태블릿에서 누르는 버튼입니다.
          </p>
        </div>
      )}
    </div>
  );
}

export default RequestingView;
