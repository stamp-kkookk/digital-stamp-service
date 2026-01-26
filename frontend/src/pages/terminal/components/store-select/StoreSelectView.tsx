import type { OwnerStore } from '../../types';
import StoreCard from './StoreCard';
import Empty from '../../../../components/common/Empty'; // Common Empty component

interface StoreSelectViewProps {
  stores: OwnerStore[];
}

const StoreSelectView = ({ stores }: StoreSelectViewProps) => {
  if (stores.length === 0) {
    return <Empty message="연결된 매장이 없습니다. 백오피스에서 매장을 등록해주세요." />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stores.map((store) => (
        <StoreCard key={store.storeId} store={store} />
      ))}
    </div>
  );
};

export default StoreSelectView;
