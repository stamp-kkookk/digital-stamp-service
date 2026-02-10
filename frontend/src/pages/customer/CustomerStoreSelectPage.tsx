/**
 * CustomerStoreSelectPage
 * 시뮬레이션에서 고객 PWA 진입 시 매장을 선택하는 화면
 */

import { usePublicStores } from '@/hooks/useStorePublicInfo';
import { AlertCircle, Loader2, MapPin, Smartphone, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CustomerStoreSelectPage() {
  const navigate = useNavigate();
  const { data: stores, isLoading, error, refetch } = usePublicStores();

  const handleSelect = (storeId: number) => {
    navigate(`/stores/${storeId}/customer`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-gradient-to-b from-kkookk-orange-50 to-white">
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-kkookk-orange-500 rounded-2xl shadow-lg shadow-orange-200">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-kkookk-navy">매장 선택</h1>
          <p className="mt-2 text-sm text-kkookk-steel">
            방문할 매장을 선택해주세요
          </p>
        </div>

        {/* 로딩 */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-kkookk-orange-500" />
            <p className="mt-4 text-sm text-kkookk-steel">매장 목록을 불러오는 중...</p>
          </div>
        )}

        {/* 에러 */}
        {error && (
          <div className="p-8 text-center bg-white rounded-2xl shadow-sm">
            <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
            <p className="mt-4 text-kkookk-steel">매장 목록을 불러올 수 없습니다.</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 mt-4 text-sm font-bold border rounded-lg border-slate-200 text-kkookk-navy hover:bg-slate-50"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 매장 목록 */}
        {!isLoading && !error && (
          <>
            {stores?.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl shadow-sm">
                <Store size={48} className="mx-auto mb-4 text-slate-300" />
                <p className="text-kkookk-steel">등록된 매장이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stores?.map((store) => (
                  <button
                    key={store.storeId}
                    onClick={() => handleSelect(store.storeId)}
                    className="flex items-center w-full gap-4 p-5 text-left transition-all bg-white shadow-sm rounded-2xl hover:shadow-md hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-kkookk-orange-50">
                      <Store className="w-6 h-6 text-kkookk-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold truncate text-kkookk-navy">
                        {store.storeName}
                      </h3>
                      <p className="flex items-center gap-1 mt-1 text-xs text-kkookk-steel">
                        <MapPin size={10} className="shrink-0" />
                        스탬프 카드 {store.activeStampCardCount}개 운영 중
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 shrink-0 text-slate-300"
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
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* 시뮬레이터로 돌아가기 */}
        <button
          onClick={() => navigate('/simulation')}
          className="flex items-center justify-center gap-2 mx-auto mt-8 text-sm text-kkookk-steel hover:text-kkookk-navy"
        >
          시뮬레이터로 돌아가기
        </button>
      </div>
    </div>
  );
}

export default CustomerStoreSelectPage;
