interface RulesPanelProps {
    cardTitle: string
    onCardTitleChange: (value: string) => void
    rewardName: string
    onRewardNameChange: (value: string) => void
    rewardQuantity: number
    onRewardQuantityChange: (value: number) => void
    expireDays: number
    onExpireDaysChange: (value: number) => void
}

export function RulesPanel({
    cardTitle,
    onCardTitleChange,
    rewardName,
    onRewardNameChange,
    rewardQuantity,
    onRewardQuantityChange,
    expireDays,
    onExpireDaysChange,
}: RulesPanelProps) {
    return (
        <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto">
            <h2 className="text-xl font-semibold text-kkookk-navy">규칙 설정</h2>

            {/* Card Title */}
            <div>
                <label htmlFor="cardTitle" className="block mb-3 text-sm text-kkookk-steel">
                    카드 제목
                </label>
                <input
                    id="cardTitle"
                    type="text"
                    value={cardTitle}
                    onChange={(e) => onCardTitleChange(e.target.value)}
                    placeholder="스탬프 카드 제목을 입력하세요"
                    maxLength={100}
                    className="w-full h-14 px-4 rounded-2xl bg-kkookk-sand border border-black/5 text-kkookk-navy placeholder:text-kkookk-steel/50 focus:outline-none focus:ring-4 focus:ring-kkookk-orange-500/30"
                />
                <p className="mt-1 text-xs text-kkookk-steel">{cardTitle.length} / 100</p>
            </div>

            {/* Reward Name */}
            <div>
                <label htmlFor="rewardName" className="block mb-3 text-sm text-kkookk-steel">
                    리워드 명
                </label>
                <input
                    id="rewardName"
                    type="text"
                    value={rewardName}
                    onChange={(e) => onRewardNameChange(e.target.value)}
                    placeholder="예: 아메리카노 1잔 무료"
                    maxLength={255}
                    className="w-full h-14 px-4 rounded-2xl bg-kkookk-sand border border-black/5 text-kkookk-navy placeholder:text-kkookk-steel/50 focus:outline-none focus:ring-4 focus:ring-kkookk-orange-500/30"
                />
                <p className="mt-1 text-xs text-kkookk-steel">{rewardName.length} / 255</p>
            </div>

            {/* Reward Quantity */}
            <div>
                <label htmlFor="rewardQuantity" className="block mb-3 text-sm text-kkookk-steel">
                    리워드 수량
                </label>
                <input
                    id="rewardQuantity"
                    type="number"
                    min="1"
                    value={rewardQuantity}
                    onChange={(e) => onRewardQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-full h-14 px-4 rounded-2xl bg-kkookk-sand border border-black/5 text-kkookk-navy focus:outline-none focus:ring-4 focus:ring-kkookk-orange-500/30"
                />
            </div>

            {/* Expire Days */}
            <div>
                <label htmlFor="expireDays" className="block mb-3 text-sm text-kkookk-steel">
                    리워드 유효기간 (일)
                </label>
                <input
                    id="expireDays"
                    type="number"
                    min="1"
                    value={expireDays}
                    onChange={(e) => onExpireDaysChange(parseInt(e.target.value) || 1)}
                    className="w-full h-14 px-4 rounded-2xl bg-kkookk-sand border border-black/5 text-kkookk-navy focus:outline-none focus:ring-4 focus:ring-kkookk-orange-500/30"
                />
            </div>

            {/* Info Box */}
            <div className="p-4 rounded-2xl bg-kkookk-sand border border-black/5">
                <p className="mb-2 text-sm font-medium text-kkookk-navy">리워드 설정 안내</p>
                <p className="text-sm text-kkookk-steel">
                    스탬프를 모두 적립한 고객에게 제공할 리워드를 설정하세요. 리워드는 자동으로 발급되며, 설정한
                    유효기간 내에 사용할 수 있습니다.
                </p>
            </div>
        </div>
    )
}
