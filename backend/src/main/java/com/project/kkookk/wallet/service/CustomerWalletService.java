package com.project.kkookk.wallet.service;

import com.project.kkookk.redeem.domain.RedeemEvent;
import com.project.kkookk.redeem.repository.RedeemEventRepository;
import com.project.kkookk.stamp.domain.StampEvent;
import com.project.kkookk.stamp.repository.StampEventRepository;
import com.project.kkookk.stampcard.domain.StampCard;
import com.project.kkookk.stampcard.repository.StampCardRepository;
import com.project.kkookk.store.domain.Store;
import com.project.kkookk.store.repository.StoreRepository;
import com.project.kkookk.wallet.domain.CustomerWallet;
import com.project.kkookk.wallet.domain.StampCardSortType;
import com.project.kkookk.wallet.domain.WalletStampCard;
import com.project.kkookk.wallet.dto.response.PageInfo;
import com.project.kkookk.wallet.dto.response.RedeemEventHistoryResponse;
import com.project.kkookk.wallet.dto.response.RedeemEventSummary;
import com.project.kkookk.wallet.dto.response.StampEventHistoryResponse;
import com.project.kkookk.wallet.dto.response.StampEventSummary;
import com.project.kkookk.wallet.dto.response.WalletStampCardListResponse;
import com.project.kkookk.wallet.dto.response.WalletStampCardSummary;
import com.project.kkookk.wallet.repository.CustomerWalletRepository;
import com.project.kkookk.wallet.repository.WalletStampCardRepository;
import com.project.kkookk.wallet.service.exception.CustomerWalletBlockedException;
import com.project.kkookk.wallet.service.exception.CustomerWalletNotFoundException;
import com.project.kkookk.wallet.service.exception.WalletStampCardAccessDeniedException;
import com.project.kkookk.wallet.service.exception.WalletStampCardNotFoundException;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerWalletService {

    private final CustomerWalletRepository customerWalletRepository;
    private final WalletStampCardRepository walletStampCardRepository;
    private final StampCardRepository stampCardRepository;
    private final StoreRepository storeRepository;
    private final StampEventRepository stampEventRepository;
    private final RedeemEventRepository redeemEventRepository;

    public WalletStampCardListResponse getStampCardsByPhoneAndName(
            String phone, String name, StampCardSortType sortType) {

        // Step 1: 전화번호와 이름으로 CustomerWallet 조회
        CustomerWallet wallet =
                customerWalletRepository
                        .findByPhoneAndName(phone, name)
                        .orElseThrow(
                                () ->
                                        new CustomerWalletNotFoundException(
                                                "해당 전화번호와 이름으로 지갑을 찾을 수 없습니다"));

        // Step 2: BLOCKED 상태 체크
        if (wallet.isBlocked()) {
            throw new CustomerWalletBlockedException("차단된 지갑입니다");
        }

        // Step 3: WalletStampCard 목록 조회 (정렬 적용)
        List<WalletStampCard> walletCards = getWalletStampCardsSorted(wallet.getId(), sortType);

        // Step 4: StampCard, Store Batch 조회 (N+1 방지)
        Set<Long> stampCardIds =
                walletCards.stream()
                        .map(WalletStampCard::getStampCardId)
                        .collect(Collectors.toSet());
        Set<Long> storeIds =
                walletCards.stream().map(WalletStampCard::getStoreId).collect(Collectors.toSet());

        Map<Long, StampCard> stampCardMap =
                stampCardRepository.findAllById(stampCardIds).stream()
                        .collect(Collectors.toMap(StampCard::getId, Function.identity()));
        Map<Long, Store> storeMap =
                storeRepository.findAllById(storeIds).stream()
                        .collect(Collectors.toMap(Store::getId, Function.identity()));

        // Step 5: 진행률 정렬이면 메모리에서 정렬
        if (sortType == StampCardSortType.PROGRESS) {
            walletCards.sort(
                    (a, b) -> {
                        double progressA =
                                calculateProgress(
                                        a.getStampCount(),
                                        stampCardMap.get(a.getStampCardId()).getGoalStampCount());
                        double progressB =
                                calculateProgress(
                                        b.getStampCount(),
                                        stampCardMap.get(b.getStampCardId()).getGoalStampCount());
                        return Double.compare(progressB, progressA);
                    });
        }

        // Step 6: Response 조립
        List<WalletStampCardSummary> summaries =
                walletCards.stream()
                        .map(
                                walletCard ->
                                        WalletStampCardSummary.from(
                                                walletCard,
                                                stampCardMap.get(walletCard.getStampCardId()),
                                                storeMap.get(walletCard.getStoreId())))
                        .toList();

        return new WalletStampCardListResponse(wallet.getId(), wallet.getName(), summaries);
    }

    public StampEventHistoryResponse getStampHistory(
            Long walletStampCardId, Long walletId, Pageable pageable) {

        // Step 1: WalletStampCard 조회 및 권한 검증
        WalletStampCard walletStampCard =
                walletStampCardRepository
                        .findByIdAndCustomerWalletId(walletStampCardId, walletId)
                        .orElseThrow(
                                () -> {
                                    // 존재하지 않거나 다른 고객의 카드인 경우
                                    if (walletStampCardRepository.existsById(walletStampCardId)) {
                                        throw new WalletStampCardAccessDeniedException(
                                                "다른 고객의 스탬프카드에 접근할 수 없습니다");
                                    }
                                    throw new WalletStampCardNotFoundException(
                                            "해당 지갑 스탬프카드를 찾을 수 없습니다");
                                });

        // Step 2: StampEvent 페이징 조회
        Page<StampEvent> eventPage =
                stampEventRepository.findByWalletStampCardIdOrderByOccurredAtDesc(
                        walletStampCardId, pageable);

        // Step 3: Response 조립
        List<StampEventSummary> events =
                eventPage.getContent().stream().map(StampEventSummary::from).toList();

        return new StampEventHistoryResponse(events, PageInfo.from(eventPage));
    }

    public RedeemEventHistoryResponse getRedeemHistory(Long walletId, Pageable pageable) {

        // Step 1: RedeemEvent 페이징 조회
        Page<RedeemEvent> eventPage =
                redeemEventRepository.findByWalletIdOrderByOccurredAtDesc(walletId, pageable);

        // Step 2: Store Batch 조회 (N+1 방지)
        Set<Long> storeIds =
                eventPage.getContent().stream()
                        .map(RedeemEvent::getStoreId)
                        .collect(Collectors.toSet());

        Map<Long, Store> storeMap =
                storeRepository.findAllById(storeIds).stream()
                        .collect(Collectors.toMap(Store::getId, Function.identity()));

        // Step 3: Response 조립
        List<RedeemEventSummary> events =
                eventPage.getContent().stream()
                        .map(
                                event ->
                                        RedeemEventSummary.from(
                                                event, storeMap.get(event.getStoreId())))
                        .toList();

        return new RedeemEventHistoryResponse(events, PageInfo.from(eventPage));
    }

    private List<WalletStampCard> getWalletStampCardsSorted(
            Long walletId, StampCardSortType sortType) {

        return switch (sortType) {
            case LAST_STAMPED ->
                    walletStampCardRepository.findByCustomerWalletIdOrderByLastStampedAtDesc(
                            walletId);
            case CREATED ->
                    walletStampCardRepository.findByCustomerWalletIdOrderByCreatedAtDesc(walletId);
            case PROGRESS -> walletStampCardRepository.findByCustomerWalletId(walletId);
        };
    }

    private double calculateProgress(int currentCount, int goalCount) {
        return (currentCount * 100.0) / goalCount;
    }
}
