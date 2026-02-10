/**
 * StoreListPage 컴포넌트
 * 사장님 매장 목록 페이지
 */

import { QRPosterModal } from "@/features/store-management/components";
import { useStores, useStoreQR } from "@/features/store-management/hooks/useStore";
import type { StoreResponse } from "@/types/api";
import {
  ArrowRight,
  Loader2,
  MapPin,
  Plus,
  QrCode,
  Store as StoreIcon,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function StoreListPage() {
  const navigate = useNavigate();
  const [qrModalStore, setQrModalStore] = useState<StoreResponse | null>(null);

  // API Hook
  const { data: stores, isLoading, error, refetch } = useStores();
  const { data: qrData } = useStoreQR(qrModalStore?.id);

  const handleStoreClick = (storeId: number) => {
    navigate(`/owner/stores/${storeId}`);
  };

  const handleQRClick = (e: React.MouseEvent, store: StoreResponse) => {
    e.stopPropagation();
    setQrModalStore(store);
  };

  const handleDownloadQR = () => {
    if (qrData?.qrCodeBase64) {
      // Create download link for QR image
      const link = document.createElement("a");
      link.href = `data:image/png;base64,${qrData.qrCodeBase64}`;
      link.download = `${qrModalStore?.name}_QR.png`;
      link.click();
    }
    setQrModalStore(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-6xl p-8 mx-auto min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-kkookk-indigo" />
        <p className="mt-4 text-kkookk-steel">매장 목록을 불러오는 중...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-6xl p-8 mx-auto min-h-[400px]">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="mt-4 text-lg font-medium text-kkookk-navy">매장 목록을 불러올 수 없습니다</p>
        <p className="mt-1 text-sm text-kkookk-steel">잠시 후 다시 시도해주세요</p>
        <button
          onClick={() => refetch()}
          className="px-6 py-2 mt-4 font-bold text-white transition-colors bg-kkookk-navy rounded-lg hover:bg-slate-800"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const storeList = stores ?? [];

  return (
    <div className="w-full max-w-6xl p-8 mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-kkookk-navy">스토어 관리</h2>
          <p className="mt-1 text-sm text-kkookk-steel">
            등록된 매장을 확인하고 관리하세요.
          </p>
        </div>
        <button
          onClick={() => navigate("/owner/stores/new")}
          className="flex items-center gap-2 px-6 py-3 font-bold text-white transition-colors bg-kkookk-navy rounded-xl hover:bg-slate-800"
        >
          <Plus size={20} /> 매장 추가
        </button>
      </div>

      {/* 매장 목록 */}
      {storeList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-kkookk-steel">
          <StoreIcon size={64} className="mb-4 opacity-20" />
          <p className="text-lg font-medium">등록된 매장이 없습니다.</p>
          <p className="mt-1 text-sm">새 매장을 등록해보세요.</p>
          <button
            onClick={() => navigate("/owner/stores/new")}
            className="flex items-center gap-2 px-6 py-3 mt-6 font-bold border border-slate-200 text-kkookk-navy rounded-xl hover:bg-slate-50"
          >
            <Plus size={16} /> 첫 매장 등록하기
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {storeList.map((store) => (
            <div
              key={store.id}
              role="button"
              tabIndex={0}
              onClick={() => handleStoreClick(store.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleStoreClick(store.id);
                }
              }}
              className="flex items-center justify-between p-6 transition-shadow bg-white border cursor-pointer rounded-2xl border-slate-200 hover:shadow-md group"
            >
              <div className="flex items-center gap-6">
                <div className="flex items-center justify-center w-16 h-16 bg-slate-100 rounded-xl text-slate-400">
                  <StoreIcon size={32} />
                </div>
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-bold text-kkookk-navy">
                    {store.name}
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        store.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {store.status === "ACTIVE" ? "영업중" : "영업종료"}
                    </span>
                  </h3>
                  <p className="flex items-center gap-1 mt-1 text-sm text-kkookk-steel">
                    <MapPin size={14} /> {store.address || "주소 미등록"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-xs text-kkookk-steel">상태</p>
                  <p className="text-lg font-bold text-kkookk-navy">
                    {store.status === "ACTIVE" ? "활성" : "비활성"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => handleQRClick(e, store)}
                    className="flex items-center gap-2 px-4 py-2 font-bold border rounded-lg border-slate-200 text-kkookk-steel hover:bg-slate-50 hover:text-kkookk-navy"
                  >
                    <QrCode size={16} /> QR 포스터
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 font-bold rounded-lg bg-blue-50 text-kkookk-indigo hover:bg-blue-100">
                    관리 <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR 포스터 모달 */}
      <QRPosterModal
        isOpen={!!qrModalStore}
        storeName={qrModalStore?.name || ""}
        storeId={qrModalStore?.id}
        qrCodeBase64={qrData?.qrCodeBase64}
        isLoading={!!qrModalStore && !qrData}
        onClose={() => setQrModalStore(null)}
        onDownload={handleDownloadQR}
      />
    </div>
  );
}

export default StoreListPage;
