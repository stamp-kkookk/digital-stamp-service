import React from 'react';
import { Building } from 'lucide-react';

interface Store {
  id: string;
  name: string;
}

interface StoreSelectorProps {
  stores: Store[];
  selectedStoreId: string | null;
  onSelectStore: (storeId: string) => void;
  isLoading: boolean;
}

const StoreSelector: React.FC<StoreSelectorProps> = ({
  stores,
  selectedStoreId,
  onSelectStore,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="w-64 h-10 bg-gray-200 rounded-lg animate-pulse" />
    );
  }

  return (
    <div className="relative w-64">
      <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      <select
        value={selectedStoreId ?? ''}
        onChange={(e) => onSelectStore(e.target.value)}
        className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
        disabled={stores.length === 0}
      >
        {stores.length === 0 ? (
          <option>매장 정보 없음</option>
        ) : (
          stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))
        )}
      </select>
    </div>
  );
};

export default StoreSelector;
