/**
 * StoreCreatePage 컴포넌트
 * 새 매장 등록 페이지
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, Loader2 } from 'lucide-react';
import { useCreateStore } from '@/features/store-management/hooks/useStore';
import { STORE_CATEGORIES } from '@/lib/constants/mockData';

interface StoreFormData {
  name: string;
  address: string;
  phone: string;
  category: string;
  description: string;
}

export function StoreCreatePage() {
  const navigate = useNavigate();
  const createStore = useCreateStore();
  const [formData, setFormData] = useState<StoreFormData>({
    name: '',
    address: '',
    phone: '',
    category: '',
    description: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategorySelect = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      category: prev.category === category ? '' : category,
    }));
  };

  const handleSubmit = async () => {
    createStore.mutate(
      {
        name: formData.name,
        address: formData.address || undefined,
        phone: formData.phone || undefined,
        status: 'ACTIVE', // 기본값: 활성 상태
      },
      {
        onSuccess: () => {
          navigate('/owner/stores');
        },
        onError: (error) => {
          alert(`매장 등록 실패: ${error.message}`);
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

          <div>
            <label
              htmlFor="address"
              className="block text-sm font-bold text-kkookk-navy mb-2"
            >
              매장 주소 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="주소를 검색해주세요"
                className="flex-1 p-3 border border-slate-200 rounded-xl focus:border-kkookk-indigo focus:outline-none"
              />
              <button
                type="button"
                className="px-4 py-3 bg-slate-100 text-kkookk-navy font-bold rounded-xl hover:bg-slate-200 flex items-center gap-2"
              >
                <Search size={18} /> 검색
              </button>
            </div>
          </div>

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

          <div>
            <span className="block text-sm font-bold text-kkookk-navy mb-2">
              업종 카테고리
            </span>
            <div className="flex gap-2 flex-wrap">
              {STORE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategorySelect(cat)}
                  className={`px-4 py-2 border rounded-full text-sm transition-colors bg-white ${
                    formData.category === cat
                      ? 'border-kkookk-indigo text-kkookk-indigo'
                      : 'border-slate-200 hover:border-kkookk-indigo hover:text-kkookk-indigo'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

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

        <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={() => navigate('/owner/stores')}
            className="px-6 py-3 border border-slate-200 text-kkookk-steel font-bold rounded-xl hover:bg-slate-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={createStore.isPending || !formData.name || !formData.address}
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
