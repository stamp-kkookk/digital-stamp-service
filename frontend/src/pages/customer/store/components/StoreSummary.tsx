import type { StampCardInfo } from '@/types/store';
import CtaButton from './CtaButton';

interface StoreSummaryProps {
  storeName: string;
  stampCard: StampCardInfo;
}

const StoreSummary = ({ storeName, stampCard }: StoreSummaryProps) => {
  // TODO: 실제 인증 상태에 따라 다른 CTA 렌더링
  const isAuthenticated = false; // Mock data
  const hasWallet = false; // Mock data

  return (
    <div className="container mx-auto max-w-md p-4">
      <div className="overflow-hidden rounded-lg bg-white shadow-lg">
        <div className="p-6">
          <h1 className="mb-2 text-center text-2xl font-bold text-gray-800">{storeName}</h1>
          <p className="mb-6 text-center text-sm text-gray-500">스탬프 적립 카드</p>

          <div className="relative mb-6 w-full rounded-lg border-4 border-dashed border-gray-300 bg-gray-50 p-4">
            {stampCard.imageUrl ? (
              <img
                src={stampCard.imageUrl}
                alt={stampCard.name}
                className="mx-auto h-48 w-auto object-contain"
              />
            ) : (
              <div className="flex h-48 items-center justify-center bg-gray-200">
                <span className="text-gray-500">이미지 없음</span>
              </div>
            )}
            <p className="absolute bottom-2 right-2 rounded-full bg-gray-800 px-3 py-1 text-xs font-semibold text-white">
              KKOOKK
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-md bg-sky-50 p-4">
              <h2 className="mb-1 font-semibold text-sky-800">🎁 리워드</h2>
              <p className="text-sky-700">{stampCard.reward}</p>
            </div>
            <div className="rounded-md bg-green-50 p-4">
              <h2 className="mb-1 font-semibold text-green-800">✍️ 적립 혜택</h2>
              <p className="text-green-700">{stampCard.stampBenefit}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4">
          <CtaButton isAuthenticated={isAuthenticated} hasWallet={hasWallet} />
        </div>
      </div>
      <footer className="mt-6 text-center text-xs text-gray-400">
        Powered by KKOOKK
      </footer>
    </div>
  );
};

export default StoreSummary;
