/**
 * MigrationForm 컴포넌트
 * 고객이 종이 스탬프 전환 요청을 제출하기 위한 폼
 * API 연동: createMigration({ storeId, imageData, claimedStampCount })
 */

import { useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronDown, Camera, Check, Info, AlertCircle, Loader2, Store } from 'lucide-react';
import { useCustomerNavigate } from '@/hooks/useCustomerNavigate';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StepUpVerify } from '@/components/shared/StepUpVerify';
import { isStepUpValid } from '@/lib/api/tokenManager';
import { useCreateMigration, useMigrationList } from '@/features/migration/hooks/useMigration';
import { kkookkToast } from '@/components/ui/Toast';
import { useAllWalletStampCards } from '@/features/wallet/hooks/useWallet';

/** File → Base64 data URI */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function MigrationForm() {
  const { storeId: urlStoreId, customerNavigate } = useCustomerNavigate();
  const originStoreId = urlStoreId ? Number(urlStoreId) : undefined;

  const [stepUpValid, setStepUpValid] = useState(isStepUpValid());
  const [selectedStoreId, setSelectedStoreId] = useState<number | undefined>(originStoreId);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [count, setCount] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: walletData } = useAllWalletStampCards();
  const { data: migrations } = useMigrationList();
  const createMigration = useCreateMigration();

  // 중복 없는 매장 목록
  const availableStores = useMemo(() => {
    const seen = new Set<number>();
    return (walletData?.stampCards ?? [])
      .filter((c) => {
        if (seen.has(c.store.storeId)) return false;
        seen.add(c.store.storeId);
        return true;
      })
      .map((c) => ({ storeId: c.store.storeId, storeName: c.store.storeName }));
  }, [walletData?.stampCards]);

  // 현재 SUBMITTED 상태인 매장 set
  const pendingStoreIds = useMemo(
    () =>
      new Set(
        (migrations ?? [])
          .filter((m) => m.status === 'SUBMITTED')
          .map((m) => m.storeId)
      ),
    [migrations]
  );

  // 선택 가능한 매장 먼저, 심사 중 매장 뒤로
  const sortedStores = useMemo(
    () => [
      ...availableStores.filter((s) => !pendingStoreIds.has(s.storeId)),
      ...availableStores.filter((s) => pendingStoreIds.has(s.storeId)),
    ],
    [availableStores, pendingStoreIds]
  );

  const selectedStoreName = availableStores.find((s) => s.storeId === selectedStoreId)?.storeName;

  const isFormValid =
    selectedStoreId !== undefined &&
    count.trim() !== '' &&
    Number(count) >= 1 &&
    file !== null &&
    !pendingStoreIds.has(selectedStoreId);

  const handleStoreSelect = (storeId: number) => {
    setSelectedStoreId(storeId);
    setIsDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStoreId || !file || !count) return;

    setSubmitError(null);

    try {
      const imageData = await fileToBase64(file);

      createMigration.mutate(
        {
          storeId: selectedStoreId,
          imageData,
          claimedStampCount: parseInt(count, 10),
        },
        {
          onSuccess: () => {
            kkookkToast.success('전환 신청이 접수되었습니다');
            customerNavigate('/migrations');
          },
          onError: (error) => {
            const err = error as { response?: { status?: number } };
            if (err.response?.status === 409) {
              setSubmitError('이미 심사 중인 전환 신청이 있습니다.');
            } else if (err.response?.status === 413) {
              setSubmitError('이미지 크기가 너무 큽니다. (최대 5MB)');
            } else if (err.response?.status === 403) {
              setSubmitError('본인 인증이 만료되었습니다. 다시 인증해주세요.');
              setStepUpValid(false);
            } else {
              setSubmitError('전환 신청에 실패했습니다. 다시 시도해주세요.');
            }
          },
        }
      );
    } catch {
      setSubmitError('이미지 처리 중 오류가 발생했습니다.');
    }
  };

  // StepUp 인증 필요
  if (!stepUpValid) {
    return (
      <div className="h-full bg-white flex flex-col pt-12">
        <div className="px-6 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center sticky top-0 bg-white z-10 -mt-12 pt-12">
          <button
            onClick={() => customerNavigate('/migrations')}
            className="p-2 -ml-2 text-kkookk-steel hover:text-kkookk-navy"
            aria-label="뒤로 가기"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="font-bold text-lg ml-2 text-kkookk-navy">전환 신청하기</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <StepUpVerify onVerified={() => setStepUpValid(true)} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white flex flex-col pt-12">
      {/* 헤더 */}
      <div className="px-6 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center sticky top-0 bg-white z-10 -mt-12 pt-12">
        <button
          onClick={() => customerNavigate('/migrations')}
          className="p-2 -ml-2 text-kkookk-steel hover:text-kkookk-navy"
          aria-label="뒤로 가기"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-bold text-lg ml-2 text-kkookk-navy">전환 신청하기</h1>
      </div>

      {/* 폼 콘텐츠 */}
      <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto">
        {/* 안내 배너 */}
        <div className="bg-blue-50 p-4 rounded-xl flex gap-3 mb-8 text-blue-800 text-xs leading-relaxed">
          <Info size={20} className="shrink-0" />
          <div>
            <p className="font-bold mb-1">안내사항</p>
            <p>• 매장별로 1회만 전환 신청이 가능합니다.</p>
            <p>• 신청 후 승인까지 약 24~48시간 소요됩니다.</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* 매장 선택 드롭다운 */}
          <div>
            <p className="text-sm font-bold text-kkookk-navy mb-2">
              매장 선택 <span className="text-kkookk-orange-500">*</span>
            </p>
            <div className="relative" ref={dropdownRef}>
              {/* 트리거 버튼 */}
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className={[
                  'w-full flex items-center justify-between px-4 py-3.5 rounded-xl border text-sm transition-colors',
                  isDropdownOpen
                    ? 'border-kkookk-orange-500 bg-white'
                    : 'border-slate-200 bg-white hover:border-slate-300',
                ].join(' ')}
              >
                <div className="flex items-center gap-2.5">
                  <Store
                    size={16}
                    className={selectedStoreName ? 'text-kkookk-navy' : 'text-slate-400'}
                  />
                  <span className={selectedStoreName ? 'text-kkookk-navy font-medium' : 'text-slate-400'}>
                    {selectedStoreName ?? '매장을 선택하세요'}
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* 드롭다운 패널 */}
              {isDropdownOpen && (
                <>
                  {/* 백드롭 — 외부 클릭 시 닫기 */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsDropdownOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                    {sortedStores.length === 0 ? (
                      <div className="flex items-center gap-2 px-4 py-3 text-sm text-kkookk-steel">
                        <Store size={15} className="shrink-0" />
                        <span>스탬프 카드가 있는 매장이 없습니다.</span>
                      </div>
                    ) : (
                      sortedStores.map((store) => {
                        const isPending = pendingStoreIds.has(store.storeId);
                        const isSelected = selectedStoreId === store.storeId;
                        return (
                          <button
                            key={store.storeId}
                            type="button"
                            disabled={isPending}
                            onClick={() => handleStoreSelect(store.storeId)}
                            className={[
                              'w-full flex items-center justify-between px-4 py-3 text-sm text-left border-b border-slate-100 last:border-b-0 transition-colors',
                              isPending
                                ? 'opacity-50 cursor-not-allowed bg-white'
                                : isSelected
                                ? 'bg-kkookk-orange-50'
                                : 'hover:bg-slate-50',
                            ].join(' ')}
                          >
                            <span
                              className={
                                isSelected && !isPending
                                  ? 'font-medium text-kkookk-navy'
                                  : 'text-kkookk-steel'
                              }
                            >
                              {store.storeName}
                            </span>
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              {isPending && (
                                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                  심사 중
                                </span>
                              )}
                              {isSelected && !isPending && (
                                <Check size={14} className="text-kkookk-orange-500" />
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 스탬프 개수 */}
          <div>
            <label htmlFor="count-input" className="block text-xs font-bold text-kkookk-navy mb-2">
              보유 스탬프 개수 <span className="text-kkookk-orange-500">*</span>
            </label>
            <Input
              id="count-input"
              type="number"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              placeholder="0"
              min={1}
            />
          </div>

          {/* 사진 업로드 */}
          <div>
            <label
              htmlFor="photo-upload"
              className="block text-sm font-bold text-kkookk-navy mb-2"
            >
              종이 쿠폰 사진 첨부 <span className="text-kkookk-orange-500">*</span>
            </label>
            <p className="text-xs text-kkookk-steel mb-2">
              <span className="text-rose-600">• 파일 크기: 3MB 이하</span>
            </p>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-kkookk-sand/30 hover:bg-kkookk-sand cursor-pointer transition-colors relative">
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (!selectedFile) return;

                  const maxSize = 3 * 1024 * 1024;
                  if (selectedFile.size > maxSize) {
                    alert('파일 크기가 너무 큽니다.\n3MB 이하의 이미지를 선택해주세요.');
                    e.target.value = '';
                    return;
                  }

                  setFile(selectedFile);
                }}
              />
              <div className="flex flex-col items-center text-kkookk-steel">
                {file ? (
                  <>
                    <Check size={32} className="text-green-500 mb-2" />
                    <p className="text-sm font-bold text-kkookk-navy">{file.name}</p>
                  </>
                ) : (
                  <>
                    <Camera size={32} className="mb-2" />
                    <p className="text-sm">터치하여 사진 촬영 또는 업로드</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 에러 메시지 */}
          {submitError && (
            <div className="flex items-center gap-2 p-4 text-sm text-red-700 bg-red-50 rounded-xl">
              <AlertCircle size={16} className="shrink-0" />
              <span>{submitError}</span>
            </div>
          )}
        </div>
      </form>

      {/* 제출 버튼 */}
      <div className="p-6 border-t border-slate-100">
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid || createMigration.isPending}
          variant="primary"
          size="full"
          className="shadow-lg"
        >
          {createMigration.isPending ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              제출 중...
            </>
          ) : (
            '제출하기'
          )}
        </Button>
      </div>
    </div>
  );
}

export default MigrationForm;
