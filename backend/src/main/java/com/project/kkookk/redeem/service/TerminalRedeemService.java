package com.project.kkookk.redeem.service;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.redeem.controller.dto.PendingRedeemSessionItem;
import com.project.kkookk.redeem.controller.dto.PendingRedeemSessionListResponse;
import com.project.kkookk.redeem.domain.RedeemSession;
import com.project.kkookk.redeem.domain.RedeemSessionStatus;
import com.project.kkookk.redeem.repository.RedeemSessionRepository;
import com.project.kkookk.stampcard.domain.StampCard;
import com.project.kkookk.stampcard.repository.StampCardRepository;
import com.project.kkookk.store.domain.Store;
import com.project.kkookk.store.repository.StoreRepository;
import com.project.kkookk.wallet.domain.CustomerWallet;
import com.project.kkookk.wallet.domain.WalletReward;
import com.project.kkookk.wallet.repository.CustomerWalletRepository;
import com.project.kkookk.wallet.repository.WalletRewardRepository;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TerminalRedeemService {

    private final RedeemSessionRepository redeemSessionRepository;
    private final WalletRewardRepository walletRewardRepository;
    private final CustomerWalletRepository customerWalletRepository;
    private final StampCardRepository stampCardRepository;
    private final StoreRepository storeRepository;

    public PendingRedeemSessionListResponse getPendingRedeemSessions(Long storeId, Long ownerId) {
        // 1. 매장 존재 및 소유권 검증
        Store store =
                storeRepository
                        .findById(storeId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.STORE_NOT_FOUND));

        if (!store.getOwnerAccountId().equals(ownerId)) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        // 2. PENDING 상태 리딤 세션 조회
        List<RedeemSession> pendingSessions =
                redeemSessionRepository.findByStoreIdAndStatus(
                        storeId, RedeemSessionStatus.PENDING);

        // 3. 만료되지 않은 세션만 필터링
        LocalDateTime now = LocalDateTime.now();
        List<RedeemSession> validSessions =
                pendingSessions.stream()
                        .filter(session -> !now.isAfter(session.getExpiresAt()))
                        .toList();

        if (validSessions.isEmpty()) {
            return PendingRedeemSessionListResponse.of(List.of());
        }

        // 4. 배치 로딩: WalletReward 조회 (N+1 방지)
        Set<Long> rewardIds =
                validSessions.stream()
                        .map(RedeemSession::getWalletRewardId)
                        .collect(Collectors.toSet());

        Map<Long, WalletReward> rewardMap =
                walletRewardRepository.findAllById(rewardIds).stream()
                        .collect(Collectors.toMap(WalletReward::getId, Function.identity()));

        // 5. 2차 배치 로딩: CustomerWallet, StampCard 조회
        Set<Long> walletIds =
                rewardMap.values().stream()
                        .map(WalletReward::getWalletId)
                        .collect(Collectors.toSet());
        Set<Long> stampCardIds =
                rewardMap.values().stream()
                        .map(WalletReward::getStampCardId)
                        .collect(Collectors.toSet());

        Map<Long, CustomerWallet> walletMap =
                customerWalletRepository.findAllByIds(walletIds).stream()
                        .collect(Collectors.toMap(CustomerWallet::getId, Function.identity()));
        Map<Long, StampCard> stampCardMap =
                stampCardRepository.findAllById(stampCardIds).stream()
                        .collect(Collectors.toMap(StampCard::getId, Function.identity()));

        // 6. DTO 변환 (추가 쿼리 없음)
        List<PendingRedeemSessionItem> items =
                validSessions.stream()
                        .map(
                                session -> {
                                    WalletReward reward =
                                            rewardMap.get(session.getWalletRewardId());
                                    if (reward == null) {
                                        return null;
                                    }

                                    CustomerWallet wallet = walletMap.get(reward.getWalletId());
                                    if (wallet == null) {
                                        return null;
                                    }

                                    StampCard stampCard = stampCardMap.get(reward.getStampCardId());
                                    String rewardName =
                                            stampCard != null ? stampCard.getRewardName() : "리워드";
                                    long remainingSeconds =
                                            Duration.between(now, session.getExpiresAt())
                                                    .getSeconds();

                                    return new PendingRedeemSessionItem(
                                            session.getId(),
                                            wallet.getNickname(),
                                            rewardName,
                                            Math.max(0, remainingSeconds),
                                            session.getCreatedAt());
                                })
                        .filter(Objects::nonNull)
                        .toList();

        log.info("[Redeem] Pending sessions fetched storeId={} count={}", storeId, items.size());
        return PendingRedeemSessionListResponse.of(items);
    }
}
