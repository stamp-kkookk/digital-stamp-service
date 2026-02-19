/**
 * StoreTabBar 컴포넌트
 * 매장 상세 페이지 4개 탭 공유 네비게이션 바 (배지 카운트 포함)
 */

import { useNavigate } from 'react-router-dom';
import { useStoreMigrations } from '@/features/migration/hooks/useOwnerMigration';
import { useOwnerPendingIssuanceRequests } from '../hooks/useApproval';

type StoreTab = 'cards' | 'history' | 'migrations' | 'approval';

interface StoreTabBarProps {
  storeId: number;
  activeTab: StoreTab;
}

const TAB_CONFIG: { key: StoreTab; label: string; path: (id: number) => string }[] = [
  { key: 'cards', label: '스탬프 카드 관리', path: (id) => `/owner/stores/${id}` },
  { key: 'history', label: '적립/사용 내역', path: (id) => `/owner/stores/${id}/history` },
  { key: 'migrations', label: '전환 신청 관리', path: (id) => `/owner/stores/${id}/migrations` },
  { key: 'approval', label: '승인 관리', path: (id) => `/owner/stores/${id}/approval` },
];

function BadgeCount({ count }: { count: number }) {
  if (count <= 0) return null;
  const display = count > 9 ? '9+' : String(count);
  return (
    <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold leading-none text-white bg-red-500 rounded-full">
      {display}
    </span>
  );
}

export function StoreTabBar({ storeId, activeTab }: StoreTabBarProps) {
  const navigate = useNavigate();

  const { data: apiMigrations } = useStoreMigrations(storeId);
  const { data: pendingIssuance } = useOwnerPendingIssuanceRequests(storeId, {
    pollingEnabled: false,
  });

  const pendingMigrationCount = (apiMigrations ?? []).filter(
    (m) => m.status === 'SUBMITTED',
  ).length;
  const pendingApprovalCount = pendingIssuance?.items?.length ?? 0;

  const getBadgeCount = (tab: StoreTab): number => {
    if (tab === 'migrations') return pendingMigrationCount;
    if (tab === 'approval') return pendingApprovalCount;
    return 0;
  };

  return (
    <div className="flex gap-1">
      {TAB_CONFIG.map((tab) => {
        const isActive = activeTab === tab.key;
        const badgeCount = getBadgeCount(tab.key);
        return (
          <button
            key={tab.key}
            onClick={() => {
              if (!isActive) navigate(tab.path(storeId));
            }}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
              isActive
                ? 'bg-kkookk-navy text-white'
                : 'text-kkookk-steel hover:bg-slate-50'
            }`}
          >
            {tab.label}
            <BadgeCount count={badgeCount} />
          </button>
        );
      })}
    </div>
  );
}
