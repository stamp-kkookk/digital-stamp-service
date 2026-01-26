import { useNavigate } from 'react-router-dom';
import type { OwnerStore } from '../../types';

interface StoreCardProps {
  store: OwnerStore;
}

const StoreCard = ({ store }: StoreCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/t/issuance/${store.storeId}`);
  };

  return (
    <div
      className="flex items-center justify-between p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div>
        <p className="text-lg font-semibold">{store.storeName}</p>
        <p className="text-sm text-gray-500">ID: {store.storeId}</p>
      </div>
      <svg
        className="h-6 w-6 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </div>
  );
};

export default StoreCard;
