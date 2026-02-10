/**
 * StatisticsModal 컴포넌트
 * 차트와 KPI를 포함한 매장/카드 통계를 표시하는 모달
 */

import { X, Check, Gift, Coffee, TrendingUp, Calendar, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatNumber, formatPercent } from '@/lib/utils/format';
import type { StoreStats, WeeklyDataPoint } from '@/types/domain';

interface StatisticsModalProps {
  title: string;
  subtitle?: string;
  stats: StoreStats;
  onClose: () => void;
  className?: string;
}

interface KPICardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  change?: {
    value: string;
    isPositive: boolean;
  };
}

function KPICard({ icon, iconBg, label, value, change }: KPICardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className={cn('p-3 rounded-xl', iconBg)}>{icon}</div>
        {change && (
          <span
            className={cn(
              'text-xs font-bold px-2 py-1 rounded-full',
              change.isPositive
                ? 'bg-green-50 text-green-600'
                : 'bg-slate-100 text-slate-500'
            )}
          >
            {change.value}
          </span>
        )}
      </div>
      <p className="text-slate-500 text-sm mb-1">{label}</p>
      <h3 className="text-2xl font-bold text-kkookk-navy">{value}</h3>
    </div>
  );
}

interface WeeklyChartProps {
  data: WeeklyDataPoint[];
  maxValue?: number;
}

function WeeklyChart({ data, maxValue = 120 }: WeeklyChartProps) {
  return (
    <div className="h-64 flex items-end justify-between gap-4 px-4">
      {data.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
          <div className="w-full bg-slate-50 rounded-t-lg relative h-full flex items-end overflow-hidden">
            <div
              className="w-full bg-kkookk-navy/80 group-hover:bg-kkookk-orange-500 transition-colors rounded-t-lg relative"
              style={{ height: `${(item.value / maxValue) * 100}%` }}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-kkookk-navy text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {item.value}건
              </div>
            </div>
          </div>
          <span className="text-sm text-slate-500 font-medium">{item.day}</span>
        </div>
      ))}
    </div>
  );
}

interface ProgressBarProps {
  label: string;
  value: number;
  color: string;
  note?: string;
}

function ProgressBar({ label, value, color, note }: ProgressBarProps) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-slate-500">{label}</span>
        <span className="font-bold text-kkookk-navy">{value}%</span>
      </div>
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full', color)}
          style={{ width: `${value}%` }}
        />
      </div>
      {note && <p className="text-xs text-slate-400 mt-2">{note}</p>}
    </div>
  );
}

export function StatisticsModal({
  title,
  subtitle = '최근 30일 기준',
  stats,
  onClose,
  className,
}: StatisticsModalProps) {
  const couponRecoveryRate = formatPercent(stats.usedCoupons, stats.totalCoupons);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
      {/* 배경 오버레이 */}
      <div
        role="button"
        tabIndex={0}
        aria-label="통계 모달 닫기"
        className="absolute inset-0 bg-kkookk-navy/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClose();
          }
        }}
      />

      {/* 모달 컨테이너 */}
      <div
        className={cn(
          'relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[85vh]',
          'flex flex-col overflow-hidden animate-in zoom-in-95 duration-200',
          className
        )}
      >
        {/* 헤더 */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">
                통계 분석
              </span>
              <span className="text-slate-400 text-xs">{subtitle}</span>
            </div>
            <h2 className="text-2xl font-bold text-kkookk-navy">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-kkookk-steel hover:text-kkookk-navy hover:bg-slate-50 rounded-full transition-colors"
            aria-label="닫기"
          >
            <X size={24} />
          </button>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 overflow-y-auto p-8 bg-kkookk-sand/30">
          {/* KPI 카드들 */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <KPICard
              icon={<Check size={20} />}
              iconBg="bg-blue-50 text-blue-600"
              label="누적 스탬프 적립"
              value={`${formatNumber(stats.totalStamps)}개`}
              change={{ value: '+12%', isPositive: true }}
            />
            <KPICard
              icon={<Gift size={20} />}
              iconBg="bg-purple-50 text-purple-600"
              label="쿠폰 발행 완료"
              value={`${formatNumber(stats.totalCoupons)}장`}
              change={{ value: '+5%', isPositive: true }}
            />
            <KPICard
              icon={<Coffee size={20} />}
              iconBg="bg-green-50 text-green-600"
              label="쿠폰 사용 완료"
              value={`${formatNumber(stats.usedCoupons)}장`}
              change={{ value: '-2%', isPositive: false }}
            />
            <KPICard
              icon={<TrendingUp size={20} />}
              iconBg="bg-orange-50 text-orange-600"
              label="쿠폰 회수율"
              value={`${couponRecoveryRate}%`}
              change={{ value: 'Good', isPositive: true }}
            />
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* 주간 차트 */}
            <div className="col-span-2 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-lg text-kkookk-navy mb-6 flex items-center gap-2">
                <Calendar size={18} className="text-slate-400" />
                주간 적립 현황
              </h3>
              <WeeklyChart data={stats.weeklyData} />
            </div>

            {/* 고객 분석 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
              <h3 className="font-bold text-lg text-kkookk-navy mb-6 flex items-center gap-2">
                <Users size={18} className="text-slate-400" />
                고객 분석
              </h3>

              <div className="flex-1 flex flex-col justify-center gap-8">
                <ProgressBar
                  label="재방문 고객 비율"
                  value={stats.retentionRate}
                  color="bg-blue-500"
                  note="지난달 대비 4% 상승"
                />

                <ProgressBar
                  label="신규 유입 고객"
                  value={stats.newCustomers}
                  color="bg-orange-500"
                  note="마케팅 캠페인 효과 분석 필요"
                />

                <div className="mt-auto p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm font-bold text-kkookk-navy mb-1">
                    인사이트
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    주말(토) 방문객이 평일 평균 대비 2.5배 높습니다. 주말 한정
                    더블 적립 이벤트를 고려해보세요.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatisticsModal;
