/**
 * StoreEditPage 컴포넌트
 * 매장 정보 수정 페이지
 */

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Loader2, AlertCircle, AlertTriangle, Info, X, Search } from 'lucide-react';
import { useStore, useUpdateStore } from '@/features/store-management/hooks/useStore';
import { IconUpload, PlaceSearchModal } from '@/features/store-management/components';
import type { ErrorResponse, PlaceSearchResult, StoreUpdateRequest } from '@/types/api';
import type { AxiosError } from 'axios';

interface StoreEditFormData {
  name: string;
  address: string;
  phone: string;
  description: string;
  iconFile: File | null;
  existingIconUrl: string | null;
  placeRef: string | null;
}

function formatPhone(value: string): string {
  const digits = value.replace(/[^0-9]/g, '');
  if (digits.startsWith('02')) {
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    if (digits.length <= 9) return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
  }
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
}

export function StoreEditPage() {
  const navigate = useNavigate();
  const { storeId } = useParams<{ storeId: string }>();
  const storeIdNum = Number(storeId);

  const { data: store, isLoading, error } = useStore(storeIdNum);
  const updateStore = useUpdateStore();
  const [formData, setFormData] = useState<StoreEditFormData | null>(null);
  const [placeSearchOpen, setPlaceSearchOpen] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // 스토어 로드 후 폼 데이터 초기화
  if (store && !formData) {
    setFormData({
      name: store.name,
      address: store.address ?? '',
      phone: store.phone ?? '',
      description: store.description ?? '',
      iconFile: null,
      existingIconUrl: store.iconImageUrl,
      placeRef: store.placeRef,
    });
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setFormData((prev) => prev ? { ...prev, phone: formatPhone(value) } : prev);
    } else {
      setFormData((prev) => prev ? { ...prev, [name]: value } : prev);
    }
  };

  const isLive = store?.status === 'LIVE';

  const handlePlaceSelect = (place: PlaceSearchResult) => {
    if (isLive) return;
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            name: place.placeName,
            address: place.roadAddress || place.address || prev.address,
            phone: place.phone ? formatPhone(place.phone) : prev.phone,
            placeRef: place.kakaoPlaceId,
          }
        : prev
    );
    setPlaceSearchOpen(false);
  };

  const handleSubmit = () => {
    if (!formData) return;
    setErrorBanner(null);
    const data: StoreUpdateRequest = {
      name: formData.name,
      address: formData.address || undefined,
      phone: formData.phone || undefined,
      description: formData.description || undefined,
      placeRef: formData.placeRef || undefined,
    };

    updateStore.mutate(
      { storeId: storeIdNum, data, iconFile: formData.iconFile || undefined },
      {
        onSuccess: () => {
          navigate(`/owner/stores/${storeId}`, {
            state: { message: '매장 정보가 수정되었습니다.' },
          });
        },
        onError: (err) => {
          const axiosError = err as AxiosError<ErrorResponse>;
          const code = axiosError.response?.data?.code;
          if (code === 'STORE_UPDATE_NOT_ALLOWED') {
            setErrorBanner(
              '운영 중인 매장은 설명과 아이콘만 수정할 수 있습니다. 다른 정보를 변경하려면 관리자에게 문의해주세요.'
            );
          } else if (code === 'STORE_PLACE_REF_DUPLICATED') {
            setErrorBanner(
              '이미 등록된 매장입니다. 본인 매장이라면 관리자에게 문의해주세요.'
            );
          } else {
            const msg = axiosError.response?.data?.message || err.message;
            setErrorBanner(`매장 수정 실패: ${msg}`);
          }
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[calc(100vh-64px)]">
        <Loader2 className="w-8 h-8 animate-spin text-kkookk-indigo" />
        <p className="mt-4 text-kkookk-steel">매장 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
        <p className="mt-4 text-kkookk-steel">매장을 찾을 수 없습니다.</p>
        <button
          onClick={() => navigate('/owner/stores')}
          className="px-4 py-2 mt-4 font-bold border rounded-lg border-slate-200 text-kkookk-navy hover:bg-slate-50"
        >
          매장 목록으로
        </button>
      </div>
    );
  }

  if (!formData) {
    return null;
  }

  if (store.status === 'SUSPENDED') {
    return (
      <div className="p-8 max-w-4xl mx-auto w-full">
        <button
          onClick={() => navigate(`/owner/stores/${storeId}`)}
          className="flex items-center gap-2 text-kkookk-steel hover:text-kkookk-navy mb-4 transition-colors"
        >
          <ChevronLeft size={20} /> 돌아가기
        </button>
        <div className="flex items-center gap-3 px-4 py-3 text-sm border rounded-lg bg-red-50 border-red-200 text-red-700">
          <AlertTriangle size={18} />
          <p className="font-bold">정지된 매장은 정보를 수정할 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <button
          onClick={() => navigate(`/owner/stores/${storeId}`)}
          className="flex items-center gap-2 text-kkookk-steel hover:text-kkookk-navy mb-4 transition-colors"
        >
          <ChevronLeft size={20} /> 돌아가기
        </button>
        <h2 className="text-2xl font-bold text-kkookk-navy">매장 정보 수정</h2>
        <p className="text-kkookk-steel text-sm mt-1">
          {store.name}의 정보를 수정합니다.
        </p>
      </div>

      {isLive && (
        <div className="flex items-center gap-3 px-4 py-3 mb-6 text-sm border rounded-lg bg-amber-50 border-amber-200 text-amber-700">
          <Info size={18} className="shrink-0" />
          <p className="font-medium">운영 중인 매장은 설명과 아이콘만 수정할 수 있습니다. 다른 정보를 변경하려면 관리자에게 문의해주세요.</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="space-y-6 max-w-2xl">
          {/* 매장 아이콘 */}
          <div>
            <span className="block text-sm font-bold text-kkookk-navy mb-2">
              매장 아이콘
            </span>
            <IconUpload
              file={formData.iconFile}
              existingUrl={formData.existingIconUrl}
              onChange={(file) =>
                setFormData((prev) => prev ? { ...prev, iconFile: file } : prev)
              }
            />
          </div>

          {/* 장소 연동 */}
          <div>
            <span className="block text-sm font-bold text-kkookk-navy mb-2">
              장소 연동
            </span>
            {formData.placeRef || isLive ? (
              <p className="text-sm text-kkookk-steel p-3 bg-slate-50 rounded-xl border border-slate-200">
                {formData.placeRef
                  ? `장소 ID: ${formData.placeRef} (변경 불가)`
                  : '장소 미연동 (운영 중 변경 불가)'}
              </p>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setPlaceSearchOpen(true)}
                  className="flex items-center gap-2 w-full p-3 border border-dashed border-slate-300 rounded-xl text-kkookk-steel hover:border-kkookk-indigo hover:text-kkookk-indigo transition-colors"
                >
                  <Search size={16} />
                  <span className="text-sm">장소 검색</span>
                </button>
                <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  장소를 연동하면 중복 등록을 방지할 수 있습니다
                </p>
                <PlaceSearchModal
                  open={placeSearchOpen}
                  onOpenChange={setPlaceSearchOpen}
                  onSelect={handlePlaceSelect}
                  onManualMode={() => setPlaceSearchOpen(false)}
                />
              </>
            )}
          </div>

          {/* 매장 이름 */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-bold text-kkookk-navy mb-2"
            >
              매장 이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isLive}
              placeholder="예: 카페 루나 강남점"
              className={`w-full p-3 border border-slate-200 rounded-xl focus:border-kkookk-indigo focus:outline-none ${isLive ? 'bg-slate-100 text-kkookk-steel cursor-not-allowed' : ''}`}
            />
          </div>

          {/* 매장 주소 */}
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-bold text-kkookk-navy mb-2"
            >
              매장 주소
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={isLive}
              placeholder="예: 서울시 강남구 테헤란로 123"
              className={`w-full p-3 border border-slate-200 rounded-xl focus:border-kkookk-indigo focus:outline-none ${isLive ? 'bg-slate-100 text-kkookk-steel cursor-not-allowed' : ''}`}
            />
          </div>

          {/* 전화번호 */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-bold text-kkookk-navy mb-2"
            >
              매장 전화번호
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={isLive}
              placeholder="02-0000-0000"
              className={`w-full p-3 border border-slate-200 rounded-xl focus:border-kkookk-indigo focus:outline-none ${isLive ? 'bg-slate-100 text-kkookk-steel cursor-not-allowed' : ''}`}
            />
          </div>

          {/* 설명 */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-bold text-kkookk-navy mb-2"
            >
              매장 설명 (선택)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="매장에 대한 간단한 소개를 입력해주세요."
              className="w-full p-3 border border-slate-200 rounded-xl focus:border-kkookk-indigo focus:outline-none h-24 resize-none"
            />
          </div>
        </div>

        {errorBanner && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-500" />
            <p className="flex-1 text-sm font-medium text-red-800">{errorBanner}</p>
            <button
              onClick={() => setErrorBanner(null)}
              className="shrink-0 text-red-400 hover:text-red-600"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={() => navigate(`/owner/stores/${storeId}`)}
            className="px-6 py-3 border border-slate-200 text-kkookk-steel font-bold rounded-xl hover:bg-slate-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={updateStore.isPending || !formData.name}
            className="px-6 py-3 bg-kkookk-navy text-white font-bold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {updateStore.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {updateStore.isPending ? '수정 중...' : '수정 완료'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default StoreEditPage;
