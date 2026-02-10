/**
 * MigrationForm 컴포넌트
 * 고객이 종이 스탬프 전환 요청을 제출하기 위한 폼
 * API 연동: createMigration({ storeId, imageData, claimedStampCount })
 */

import { useState } from 'react';
import { ChevronLeft, Camera, Check, Info, AlertCircle, Loader2 } from 'lucide-react';
import { useCustomerNavigate } from '@/hooks/useCustomerNavigate';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StepUpVerify } from '@/components/shared/StepUpVerify';
import { isStepUpValid } from '@/lib/api/tokenManager';
import { useCreateMigration, useMigrationList } from '@/features/migration/hooks/useMigration';
import { useWalletStampCards } from '@/features/wallet/hooks/useWallet';

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
  const { storeId, customerNavigate } = useCustomerNavigate();
  const storeIdNum = storeId ? Number(storeId) : undefined;

  const [stepUpValid, setStepUpValid] = useState(isStepUpValid());
  const [count, setCount] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Hooks
  const { data: walletData } = useWalletStampCards(storeIdNum);
  const { data: migrations } = useMigrationList();
  const createMigration = useCreateMigration();

  // Store info from wallet
  const storeName = walletData?.stampCards?.[0]?.store?.storeName ?? '현재 매장';

  // Check if already has pending migration for this store
  const hasPending = (migrations ?? []).some(
    (m) => m.storeId === storeIdNum && m.status === 'SUBMITTED'
  );

  const isFormValid =
    count.trim() !== '' &&
    Number(count) >= 1 &&
    file !== null &&
    !hasPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeIdNum || !file || !count) return;

    setSubmitError(null);

    try {
      const imageData = await fileToBase64(file);

      createMigration.mutate(
        {
          storeId: storeIdNum,
          imageData,
          claimedStampCount: parseInt(count, 10),
        },
        {
          onSuccess: () => {
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
        <div className="px-6 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center sticky top-0 bg-white z-10 -mt-12 pt-12">
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
      <div className="px-6 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center sticky top-0 bg-white z-10 -mt-12 pt-12">
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
          {/* 매장 정보 */}
          <div>
            <label className="block text-sm font-bold text-kkookk-navy mb-2">
              매장
            </label>
            <div className="w-full p-4 bg-kkookk-sand rounded-xl border border-slate-200 text-kkookk-navy font-medium">
              {storeName}
            </div>
          </div>

          {/* 이미 심사중인 경우 경고 */}
          {hasPending && (
            <div className="flex items-center gap-2 p-4 text-sm text-amber-700 bg-amber-50 rounded-xl">
              <AlertCircle size={16} className="shrink-0" />
              <span>이 매장에 이미 심사 중인 전환 신청이 있습니다.</span>
            </div>
          )}

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
              disabled={hasPending}
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
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-kkookk-sand/30 hover:bg-kkookk-sand cursor-pointer transition-colors relative">
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                disabled={hasPending}
              />
              <div className="flex flex-col items-center text-kkookk-steel">
                {file ? (
                  <>
                    <Check size={32} className="text-green-500 mb-2" />
                    <p className="text-sm font-bold text-kkookk-navy">
                      {file.name}
                    </p>
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
