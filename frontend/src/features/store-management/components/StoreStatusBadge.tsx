import type { StoreStatus } from '@/types/api';

const STATUS_CONFIG: Record<
  StoreStatus,
  { color: string; label: string }
> = {
  DRAFT: { color: 'bg-gray-100 text-gray-600', label: '승인 대기' },
  LIVE: { color: 'bg-green-100 text-green-700', label: '영업중' },
  SUSPENDED: { color: 'bg-red-100 text-red-700', label: '정지' },
  DELETED: { color: 'bg-slate-100 text-slate-500', label: '삭제됨' },
};

interface StoreStatusBadgeProps {
  status: StoreStatus;
  className?: string;
}

export function StoreStatusBadge({ status, className = '' }: StoreStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT;
  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${config.color} ${className}`}
    >
      {config.label}
    </span>
  );
}
