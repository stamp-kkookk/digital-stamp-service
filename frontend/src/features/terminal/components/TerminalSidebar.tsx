/**
 * TerminalSidebar 컴포넌트
 * 터미널 대시보드용 사이드 네비게이션
 */

import { cn } from "@/lib/utils";
import type { StoreStatus } from "@/types/domain";
import { Bell, History, LogOut, Settings } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";

interface TerminalSidebarProps {
  storeName: string;
  storeStatus: StoreStatus;
  pendingCount: number;
  onLogout: () => void;
}

export function TerminalSidebar({
  storeName,
  storeStatus,
  pendingCount,
  onLogout,
}: TerminalSidebarProps) {
  const location = useLocation();
  const { storeId } = useParams<{ storeId: string }>();

  const tabs = [
    {
      id: "approval",
      label: "승인 대기",
      icon: <Bell size={20} />,
      path: `/terminal/${storeId}/approval`,
    },
    {
      id: "history",
      label: "처리 내역",
      icon: <History size={20} />,
      path: `/terminal/${storeId}/history`,
    },
    {
      id: "settings",
      label: "설정",
      icon: <Settings size={20} />,
      path: `/terminal/${storeId}/settings`,
    },
  ];

  const isActive = (tabId: string) => location.pathname.includes(tabId);

  return (
    <div className="flex flex-col w-64 bg-white border-r border-slate-200">
      {/* 매장 정보 */}
      <div className="p-6 border-b border-slate-100">
        <h1 className="text-xl font-bold text-kkookk-navy">{storeName}</h1>
        <div
          className={cn(
            "text-xs font-medium flex items-center gap-1 mt-1",
            storeStatus === "OPEN" ? "text-green-600" : "text-slate-400",
          )}
        >
          <span
            className={cn(
              "w-2 h-2 rounded-full",
              storeStatus === "OPEN"
                ? "bg-green-500 animate-pulse"
                : "bg-slate-400",
            )}
          />
          {storeStatus === "OPEN" ? "영업중 · 온라인" : "영업 종료"}
        </div>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 p-4 space-y-2">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            to={tab.path}
            className={cn(
              "w-full flex items-center gap-3 p-4 rounded-xl transition-all text-left",
              isActive(tab.id)
                ? "bg-kkookk-indigo/10 text-indigo-900 shadow-lg shadow-indigo-100"
                : "text-kkookk-steel hover:bg-slate-50",
            )}
          >
            {tab.icon}
            <span className="font-bold">{tab.label}</span>
            {tab.id === "approval" && pendingCount > 0 && (
              <span className="ml-auto bg-kkookk-red text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* 로그아웃 */}
      <div className="p-4">
        <button
          onClick={onLogout}
          className="flex items-center gap-2 p-2 text-kkookk-steel hover:text-kkookk-navy"
        >
          <LogOut size={16} /> 앱 종료
        </button>
      </div>
    </div>
  );
}

export default TerminalSidebar;
