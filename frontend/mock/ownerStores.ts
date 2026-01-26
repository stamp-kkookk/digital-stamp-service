import type { OwnerStore } from '../src/pages/terminal/types';

export const getMockOwnerStores = (): Promise<OwnerStore[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { storeId: '1', storeName: '카페 딜라이트 강남점' },
        { storeId: '2', storeName: '카페 딜라이트 판교점' },
        { storeId: '3', storeName: '카페 딜라이트 분당점' },
        { storeId: '4', storeName: '카페 딜라이트 일산점' },
      ]);
    }, 500); // Simulate network delay
  });
};
