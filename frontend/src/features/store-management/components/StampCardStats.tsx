/**
 * StampCardStats 컴포넌트
 * 스탬프 카드 통계 뷰 (API 데이터 기반)
 */

import type { StoreStatisticsResponse } from "@/types/api";
import {
  AlertCircle,
  Calendar,
  Check,
  ChevronLeft,
  Gift,
  TrendingUp,
  Users,
} from "lucide-react";

interface StampCardStatsProps {
  cardName: string;
  stats: StoreStatisticsResponse | null;
  statsError: boolean;
  onBack: () => void;
}

function formatNumber(n: number): string {
  return n.toLocaleString("ko-KR");
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const fmt = (d: Date) =>
    `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  return `${fmt(s)} ~ ${fmt(e)}`;
}

export function StampCardStats({
  cardName,
  stats,
  statsError,
  onBack,
}: StampCardStatsProps) {
  if (statsError || !stats) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[400px]">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="mt-4 text-kkookk-steel">통계 데이터를 불러올 수 없습니다.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 mt-4 font-bold border rounded-lg border-slate-200 text-kkookk-navy hover:bg-slate-50"
        >
          돌아가기
        </button>
      </div>
    );
  }

  const kpiCards = [
    {
      title: "누적 적립 수",
      value: formatNumber(stats.totalStamps),
      unit: "개",
      icon: <TrendingUp size={20} />,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "리워드 발급 수",
      value: formatNumber(stats.totalRewardsIssued),
      unit: "장",
      icon: <Gift size={20} />,
      color: "bg-orange-50 text-orange-600",
    },
    {
      title: "리워드 사용 수",
      value: formatNumber(stats.totalRewardsRedeemed),
      unit: "회",
      icon: <Check size={20} />,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "활성 이용자",
      value: formatNumber(stats.activeUsers),
      unit: "명",
      icon: <Users size={20} />,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  const dailyTrend = stats.dailyTrend;
  const maxCount = Math.max(...dailyTrend.map((d) => d.count), 1);

  // 최근 7일만 차트로 표시
  const recentDays = dailyTrend.slice(-7);
  const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className="flex flex-col w-full h-full max-w-6xl p-8 mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 -ml-2 transition-colors rounded-full text-kkookk-steel hover:text-kkookk-navy hover:bg-slate-100"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h3 className="text-xl font-bold text-kkookk-navy">
              {cardName} 통계
            </h3>
            <p className="mt-1 text-sm text-kkookk-steel">
              조회 기간의 데이터를 분석합니다.
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-white border rounded-lg border-slate-200 text-kkookk-steel">
          <Calendar size={16} /> {formatDateRange(stats.startDate, stats.endDate)}
        </button>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {kpiCards.map((stat, i) => (
          <div
            key={i}
            className="p-6 transition-shadow bg-white border shadow-sm rounded-2xl border-slate-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>{stat.icon}</div>
            </div>
            <p className="mb-1 text-xs font-medium text-kkookk-steel">
              {stat.title}
            </p>
            <div className="flex items-baseline gap-1">
              <h4 className="text-2xl font-bold text-kkookk-navy">
                {stat.value}
              </h4>
              <span className="text-sm text-kkookk-steel">{stat.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 일별 적립 추이 차트 */}
      <div className="flex flex-col flex-1 min-h-0 p-6 bg-white border shadow-sm rounded-2xl border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-bold text-kkookk-navy">
            일별 적립 추이
          </h4>
          <div className="flex items-center gap-1.5 text-xs text-kkookk-steel">
            <div className="w-2.5 h-2.5 bg-kkookk-indigo rounded-full" />
            스탬프 적립
          </div>
        </div>

        {recentDays.length === 0 ? (
          <div className="flex items-center justify-center flex-1">
            <p className="text-kkookk-steel">조회 기간 내 적립 데이터가 없습니다.</p>
          </div>
        ) : (
          <div className="flex items-end justify-between gap-4 px-2 flex-1 min-h-[200px]">
            {recentDays.map((d, i) => {
              const date = new Date(d.date);
              const dayLabel = dayLabels[date.getDay()];
              const heightPct = maxCount > 0 ? (d.count / maxCount) * 100 : 0;

              return (
                <div
                  key={i}
                  className="flex flex-col items-center justify-end flex-1 h-full gap-2 cursor-pointer group"
                >
                  <div className="relative flex items-end justify-center w-full h-full">
                    <div className="absolute z-10 px-2 py-1 mb-2 text-xs font-bold text-white transition-opacity rounded opacity-0 pointer-events-none -top-10 group-hover:opacity-100 bg-kkookk-navy whitespace-nowrap">
                      {d.count}건
                    </div>
                    <div
                      className="relative z-10 w-4 transition-all duration-500 rounded-t-full bg-kkookk-indigo hover:bg-blue-700"
                      style={{ height: `${Math.max(heightPct, 4)}%` }}
                    />
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-medium text-kkookk-steel">
                      {dayLabel}
                    </span>
                    <p className="text-[10px] text-slate-400">
                      {date.getMonth() + 1}/{date.getDate()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default StampCardStats;
