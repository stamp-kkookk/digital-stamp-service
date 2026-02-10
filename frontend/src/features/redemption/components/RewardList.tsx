/**
 * RewardList 컴포넌트
 * 리워드 보관함의 리워드 목록 (API 연동)
 */

import type { Reward } from "@/types/domain";
import type { WalletRewardItem } from "@/types/api";
import { useState } from "react";
import { ChevronLeft, Gift, Loader2 } from "lucide-react";
import { useCustomerNavigate } from "@/hooks/useCustomerNavigate";
import { RewardCard } from "./RewardCard";
import { useWalletRewards } from "@/features/wallet/hooks/useWallet";
import { isStepUpValid } from "@/lib/api/tokenManager";
import { StepUpVerify } from "@/components/shared/StepUpVerify";
import { formatShortDate } from "@/lib/utils/format";

function mapReward(item: WalletRewardItem): Reward {
  const isUsed = item.status === "REDEEMED" || item.status === "EXPIRED";
  return {
    id: String(item.id),
    storeName: item.store.storeName,
    stampCardTitle: item.stampCardTitle,
    name: item.rewardName,
    expiry: formatShortDate(new Date(item.expiresAt)),
    isUsed,
    designJson: item.designJson,
  };
}

export function RewardList() {
  const { customerNavigate } = useCustomerNavigate();
  const [stepUpValid, setStepUpValid] = useState(isStepUpValid());
  const { data, isLoading } = useWalletRewards();

  const rewards: Reward[] =
    data?.rewards?.map((item) => mapReward(item)) ?? [];

  const handleRedeem = (reward: Reward) => {
    customerNavigate(`/redeems/${reward.id}/use`);
  };

  return (
    <div className="relative flex flex-col h-full pt-12">
      {/* 헤더 */}
      <div className="px-6 py-4 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center sticky top-0 z-10 -mt-12 pt-12">
        <button
          onClick={() => customerNavigate("/wallet")}
          className="p-2 -ml-2 text-kkookk-steel hover:text-kkookk-navy"
          aria-label="뒤로 가기"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="ml-2 text-lg font-bold text-kkookk-navy">
          리워드 보관함
        </h1>
      </div>

      {/* 리워드 목록 */}
      <div className="p-6 space-y-4 overflow-y-auto">
        {!stepUpValid ? (
          <div className="flex items-center justify-center py-20">
            <StepUpVerify onVerified={() => setStepUpValid(true)} />
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-kkookk-steel">
            <Loader2 size={32} className="animate-spin opacity-40 mb-4" />
            <p>리워드를 불러오는 중...</p>
          </div>
        ) : rewards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-kkookk-steel">
            <Gift size={48} className="opacity-20 mb-4" />
            <p>보관함이 비어있습니다.</p>
          </div>
        ) : (
          rewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              onRedeem={reward.isUsed ? undefined : () => handleRedeem(reward)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default RewardList;
