/**
 * TTLCountdown 컴포넌트
 * 리딤 세션 TTL 카운트다운 타이머 (30-60초)
 */

import { formatCountdown } from '@/lib/utils/format';

interface TTLCountdownProps {
  seconds: number;
  className?: string;
}

export function TTLCountdown({ seconds, className }: TTLCountdownProps) {
  const isUrgent = seconds <= 10;

  return (
    <div
      className={`text-4xl font-mono font-bold text-kkookk-navy tracking-wider ${
        isUrgent ? 'text-kkookk-red animate-pulse' : ''
      } ${className || ''}`}
    >
      {formatCountdown(seconds)}
    </div>
  );
}

export default TTLCountdown;
