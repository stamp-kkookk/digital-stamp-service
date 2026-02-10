/**
 * StoreCard 컴포넌트
 * 사장님 백오피스의 매장 카드 표시
 */

import { Store, MapPin, QrCode, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Store as StoreType } from '@/types/domain';

interface StoreCardProps {
  store: StoreType;
  onClick: () => void;
  onQRClick: (e: React.MouseEvent) => void;
}

export function StoreCard({ store, onClick, onQRClick }: StoreCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer group"
    >
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
          <Store size={32} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-kkookk-navy flex items-center gap-2">
            {store.name}
            <Badge
              variant={store.status === 'OPEN' ? 'success' : 'default'}
              size="sm"
            >
              {store.status === 'OPEN' ? '영업중' : '영업종료'}
            </Badge>
          </h3>
          <p className="text-sm text-kkookk-steel flex items-center gap-1 mt-1">
            <MapPin size={14} /> {store.address}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="text-right">
          <p className="text-xs text-kkookk-steel">활성 스탬프 카드</p>
          <p className="text-lg font-bold text-kkookk-navy">
            {store.activeCards}개
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onQRClick}
            variant="subtle"
            size="sm"
            className="flex items-center gap-2"
          >
            <QrCode size={16} /> QR 포스터
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="flex items-center gap-2 bg-kkookk-orange-50 text-kkookk-orange-500 hover:bg-kkookk-orange-100"
          >
            관리 <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default StoreCard;
