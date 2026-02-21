/**
 * StoreCreatePage 컴포넌트
 * 새 매장 등록 페이지
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2, AlertTriangle, X, Search, MapPin } from 'lucide-react';
import { useCreateStore } from '@/features/store-management/hooks/useStore';
import { PlaceSearchModal, IconUpload } from '@/features/store-management/components';
import type { ErrorResponse, PlaceSearchResult } from '@/types/api';
import type { AxiosError } from 'axios';
import { kkookkToast } from '@/components/ui/Toast';

interface StoreFormData {
  name: string;
  address: string;
  phone: string;
  description: string;
  placeRef: string | null;
  iconImageBase64: string | null;
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

export function StoreCreatePage() {
  const navigate = useNavigate();
  const createStore = useCreateStore();
  const [manualAddressMode, setManualAddressMode] = useState(false);
  const [placeSearchOpen, setPlaceSearchOpen] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [formData, setFormData] = useState<StoreFormData>({
    name: '',
    address: '',
    phone: '',
    description: '',
    placeRef: null,
    iconImageBase64: null,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setFormData((prev) => ({ ...prev, phone: formatPhone(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePlaceSelect = (place: PlaceSearchResult) => {
    setFormData((prev) => ({
      ...prev,
      name: place.placeName,
      address: place.roadAddress || place.address,
      phone: place.phone ? formatPhone(place.phone) : '',
      placeRef: place.kakaoPlaceId,
    }));
    setManualAddressMode(false);
    setPlaceSearchOpen(false);
  };

  const handleManualMode = () => {
    setManualAddressMode(true);
    setFormData((prev) => ({ ...prev, placeRef: null }));
  };

  const handleSubmit = async () => {
    setErrorBanner(null);
    createStore.mutate(
      {
        name: formData.name,
        address: formData.address || undefined,
        phone: formData.phone || undefined,
        placeRef: formData.placeRef || undefined,
        iconImageBase64: formData.iconImageBase64 || undefined,
        description: formData.description || undefined,
      },
      {
        onSuccess: (newStore) => {
          kkookkToast.success('매장이 등록되었습니다');
          navigate(`/owner/stores/${newStore.id}/stamp-cards/new?initial=true`);
        },
        onError: (error) => {
          const axiosError = error as AxiosError<ErrorResponse>;
          const code = axiosError.response?.data?.code;
          if (code === 'STORE_PLACE_REF_DUPLICATED') {
            setErrorBanner(
              '이미 등록된 매장입니다. 본인 매장이라면 관리자에게 문의해주세요.'
            );
          } else {
            const msg = axiosError.response?.data?.message || error.message;
            setErrorBanner(`매장 등록 실패: ${msg}`);
          }
        },
      }
    );
  };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <button
          onClick={() => navigate('/owner/stores')}
          className="flex items-center gap-2 text-kkookk-steel hover:text-kkookk-navy mb-4 transition-colors"
        >
          <ChevronLeft size={20} /> 돌아가기
        </button>
        <h2 className="text-2xl font-bold text-kkookk-navy">새 매장 추가하기</h2>
        <p className="text-kkookk-steel text-sm mt-1">
          매장 정보를 입력하여 서비스를 시작하세요.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="space-y-6 max-w-2xl">
          {/* 매장 아이콘 */}
          <div>
            <span className="block text-sm font-bold text-kkookk-navy mb-2">
              매장 아이콘
            </span>
            <IconUpload
              value={formData.iconImageBase64}
              onChange={(base64) =>
                setFormData((prev) => ({ ...prev, iconImageBase64: base64 }))
              }
            />
          </div>

          {/* 장소 검색 */}
          <div>
            <span className="block text-sm font-bold text-kkookk-navy mb-2">
              장소 검색
            </span>
            {manualAddressMode ? (
              <div className="flex items-center gap-2 p-3 border border-slate-200 rounded-xl bg-slate-50">
                <span className="text-sm text-kkookk-steel">직접 입력 모드</span>
                <button
                  type="button"
                  onClick={() => setManualAddressMode(false)}
                  className="text-sm text-kkookk-indigo hover:underline"
                >
                  장소 검색으로 전환
                </button>
              </div>
            ) : formData.placeRef ? (
              <div className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-slate-50">
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin size={16} className="shrink-0 text-kkookk-indigo" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-kkookk-navy truncate">{formData.name}</p>
                    <p className="text-xs text-kkookk-steel truncate">{formData.address}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPlaceSearchOpen(true)}
                  className="shrink-0 text-sm text-kkookk-indigo hover:underline ml-2"
                >
                  다시 검색
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setPlaceSearchOpen(true)}
                className="flex items-center gap-2 w-full p-3 border border-dashed border-slate-300 rounded-xl text-kkookk-steel hover:border-kkookk-indigo hover:text-kkookk-indigo transition-colors"
              >
                <Search size={16} />
                <span className="text-sm">장소 검색</span>
              </button>
            )}
            {manualAddressMode && (
              <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
                <AlertTriangle size={12} />
                장소 연동 없이 등록하면 운영 승인 시 추가 확인이 필요할 수 있습니다
              </p>
            )}
            <PlaceSearchModal
              open={placeSearchOpen}
              onOpenChange={setPlaceSearchOpen}
              onSelect={handlePlaceSelect}
              onManualMode={handleManualMode}
            />
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
              placeholder="예: 카페 루나 강남점"
              className="w-full p-3 border border-slate-200 rounded-xl focus:border-kkookk-indigo focus:outline-none"
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
            {manualAddressMode ? (
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="예: 서울시 강남구 테헤란로 123"
                className="w-full p-3 border border-slate-200 rounded-xl focus:border-kkookk-indigo focus:outline-none"
              />
            ) : formData.address ? (
              <input
                type="text"
                value={formData.address}
                readOnly
                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-kkookk-steel"
              />
            ) : (
              <input
                type="text"
                disabled
                placeholder="장소 검색으로 자동 입력됩니다"
                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-kkookk-steel disabled:cursor-not-allowed"
              />
            )}
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
              placeholder="02-0000-0000"
              className="w-full p-3 border border-slate-200 rounded-xl focus:border-kkookk-indigo focus:outline-none"
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
            onClick={() => navigate('/owner/stores')}
            className="px-6 py-3 border border-slate-200 text-kkookk-steel font-bold rounded-xl hover:bg-slate-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={createStore.isPending || !formData.name}
            className="px-6 py-3 bg-kkookk-navy text-white font-bold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {createStore.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {createStore.isPending ? '등록 중...' : '매장 등록하기'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default StoreCreatePage;
