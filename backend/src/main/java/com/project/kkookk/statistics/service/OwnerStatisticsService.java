package com.project.kkookk.statistics.service;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.redeem.domain.RedeemEventResult;
import com.project.kkookk.redeem.repository.RedeemEventRepository;
import com.project.kkookk.stamp.repository.StampEventRepository;
import com.project.kkookk.statistics.dto.StoreStatisticsResponse;
import com.project.kkookk.statistics.dto.StoreStatisticsResponse.DailyStampCount;
import com.project.kkookk.store.domain.Store;
import com.project.kkookk.store.repository.StoreRepository;
import com.project.kkookk.wallet.repository.WalletRewardRepository;
import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OwnerStatisticsService {

    private final StoreRepository storeRepository;
    private final StampEventRepository stampEventRepository;
    private final RedeemEventRepository redeemEventRepository;
    private final WalletRewardRepository walletRewardRepository;

    public StoreStatisticsResponse getStoreStatistics(
            Long storeId, Long ownerId, LocalDate startDate, LocalDate endDate) {
        // 1. 매장 존재 및 소유권 검증
        Store store =
                storeRepository
                        .findById(storeId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.STORE_NOT_FOUND));

        if (!store.getOwnerAccountId().equals(ownerId)) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        // 2. 기간 설정
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        // 3. 총 적립 스탬프 수
        long totalStamps =
                stampEventRepository.sumPositiveDeltaByStoreIdAndPeriod(
                        storeId, startDateTime, endDateTime);

        // 4. 총 발급된 리워드 수
        long totalRewardsIssued =
                walletRewardRepository.countByStoreIdAndIssuedAtBetween(
                        storeId, startDateTime, endDateTime);

        // 5. 총 사용된 리워드 수
        long totalRewardsRedeemed =
                redeemEventRepository.countByStoreIdAndPeriodAndResult(
                        storeId, startDateTime, endDateTime, RedeemEventResult.SUCCESS);

        // 6. 활성 이용자 수
        long activeUsers =
                stampEventRepository.countDistinctWalletsByStoreIdAndPeriod(
                        storeId, startDateTime, endDateTime);

        // 7. 일별 적립 추이
        List<Object[]> dailyData =
                stampEventRepository.findDailyStampCountsByStoreIdAndPeriod(
                        storeId, startDateTime, endDateTime);

        List<DailyStampCount> dailyTrend =
                dailyData.stream()
                        .map(
                                row -> {
                                    LocalDate date;
                                    if (row[0] instanceof Date sqlDate) {
                                        date = sqlDate.toLocalDate();
                                    } else if (row[0] instanceof LocalDate localDate) {
                                        date = localDate;
                                    } else {
                                        date = LocalDate.parse(row[0].toString());
                                    }
                                    long count = ((Number) row[1]).longValue();
                                    return new DailyStampCount(date, count);
                                })
                        .toList();

        return new StoreStatisticsResponse(
                startDate,
                endDate,
                totalStamps,
                totalRewardsIssued,
                totalRewardsRedeemed,
                activeUsers,
                dailyTrend);
    }
}
