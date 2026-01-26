import type { DashboardKpi } from '../../types';

interface KpiCardsProps {
  data?: DashboardKpi;
  isLoading: boolean;
}

const KpiCard = ({ title, value, isLoading }: { title: string; value?: number; isLoading: boolean }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      {isLoading ? (
        <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
      ) : (
        <p className="mt-1 text-3xl font-semibold">{value ?? '-'}</p>
      )}
    </div>
  );
};

const KpiCards = ({ data, isLoading }: KpiCardsProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard title="승인 대기 중" value={data?.pendingCount} isLoading={isLoading} />
      <KpiCard title="오늘의 승인" value={data?.approvedToday} isLoading={isLoading} />
      <KpiCard title="오늘의 거절" value={data?.rejectedToday} isLoading={isLoading} />
      <KpiCard title="연결된 고객" value={data?.customerCount} isLoading={isLoading} />
    </div>
  );
};

export default KpiCards;
