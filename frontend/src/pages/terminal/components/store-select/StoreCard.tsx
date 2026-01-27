import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { OwnerStore } from '../../types';
import { Card } from '@/components/ui/Card';

interface StoreCardProps {
  store: OwnerStore;
}

const StoreCard = ({ store }: StoreCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/t/issuance/${store.storeId}`);
  };

  return (
    <Card
      variant="elevated"
      padding="md"
      onClick={handleClick}
      className="flex items-center justify-between cursor-pointer"
    >
      <div>
        <p className="text-lg font-semibold text-kkookk-navy">{store.storeName}</p>
        <p className="text-sm text-kkookk-steel">ID: {store.storeId}</p>
      </div>
      <ChevronRight className="h-6 w-6 text-kkookk-steel" />
    </Card>
  );
};

export default StoreCard;
