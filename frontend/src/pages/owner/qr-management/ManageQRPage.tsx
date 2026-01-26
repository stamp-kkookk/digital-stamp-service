import React, { useState, useEffect } from 'react';
import StoreSelector from './components/StoreSelector';
import QRCodePreview from './components/QRCodePreview';
import EntryURLPanel from './components/EntryURLPanel';
import SecurityInfo from './components/SecurityInfo';

// TODO: API 연동 시 실제 useOwnerStoresQuery 훅으로 교체해야 합니다.
// 현재는 UI 확인을 위해 목 데이터를 사용합니다.
const mockStores = [
  { id: 'S-1024', name: '카페 딜라이트 강남점' },
  { id: 'S-2048', name: '베이커리 앨리스' },
  { id: 'S-4096', name: '푸드트럭 얌얌' },
];

const ManageQRPage: React.FC = () => {
  // TODO: API에서 데이터를 가져오는 동안의 로딩 상태를 관리해야 합니다.
  const isLoading = false; 
  // TODO: API 호출 실패 시 에러 상태를 관리해야 합니다.
  const error = null;

  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  useEffect(() => {
    // 데이터 로딩이 끝나고, 선택된 매장이 없으면 첫번째 매장을 기본으로 선택
    if (!isLoading && mockStores.length > 0 && !selectedStoreId) {
      setSelectedStoreId(mockStores[0].id);
    }
  }, [isLoading, selectedStoreId]);

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">데이터를 불러오는 중 오류가 발생했습니다.</p>
        {/* TODO: 재시도 버튼 구현 */}
      </div>
    );
  }

  if (!isLoading && mockStores.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">관리 중인 매장이 없습니다.</p>
        {/* TODO: 매장 등록 페이지로 이동하는 CTA 버튼 구현 */}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">QR 관리</h1>
            <p className="mt-1 text-sm text-gray-600">
              고객이 스캔하여 매장 스탬프 카드로 즉시 진입할 수 있는 고정 QR입니다.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <StoreSelector
              stores={mockStores}
              selectedStoreId={selectedStoreId}
              onSelectStore={setSelectedStoreId}
              isLoading={isLoading}
            />
          </div>
        </header>

        <main className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <QRCodePreview storeId={selectedStoreId!} />
            </div>
            <div className="lg:col-span-2 space-y-6">
              <EntryURLPanel storeId={selectedStoreId!} />
              <SecurityInfo />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageQRPage;
