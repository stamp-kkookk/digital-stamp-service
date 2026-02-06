package com.project.kkookk.wallet.service;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.global.util.JwtUtil;
import com.project.kkookk.redeem.domain.RedeemEvent;
import com.project.kkookk.redeem.repository.RedeemEventRepository;
import com.project.kkookk.stamp.domain.StampEvent;
import com.project.kkookk.stamp.repository.StampEventRepository;
import com.project.kkookk.stampcard.domain.StampCard;
import com.project.kkookk.stampcard.domain.StampCardStatus;
import com.project.kkookk.stampcard.repository.StampCardRepository;
import com.project.kkookk.store.domain.Store;
import com.project.kkookk.store.repository.StoreRepository;
import com.project.kkookk.wallet.domain.CustomerWallet;
import com.project.kkookk.wallet.domain.StampCardSortType;
import com.project.kkookk.wallet.domain.WalletReward;
import com.project.kkookk.wallet.domain.WalletRewardStatus;
import com.project.kkookk.wallet.domain.WalletStampCard;
import com.project.kkookk.wallet.domain.WalletStampCardStatus;
import com.project.kkookk.wallet.dto.CustomerLoginRequest;
import com.project.kkookk.wallet.dto.CustomerLoginResponse;
import com.project.kkookk.wallet.dto.WalletRegisterRequest;
import com.project.kkookk.wallet.dto.WalletRegisterResponse;
import com.project.kkookk.wallet.dto.response.PageInfo;
import com.project.kkookk.wallet.dto.response.RedeemEventHistoryResponse;
import com.project.kkookk.wallet.dto.response.RedeemEventSummary;
import com.project.kkookk.wallet.dto.response.RegisteredStampCardInfo;
import com.project.kkookk.wallet.dto.response.StampEventHistoryResponse;
import com.project.kkookk.wallet.dto.response.StampEventSummary;
import com.project.kkookk.wallet.dto.response.StoreInfo;
import com.project.kkookk.wallet.dto.response.WalletRewardItem;
import com.project.kkookk.wallet.dto.response.WalletRewardListResponse;
import com.project.kkookk.wallet.dto.response.WalletStampCardListResponse;
import com.project.kkookk.wallet.dto.response.WalletStampCardSummary;
import com.project.kkookk.wallet.repository.CustomerWalletRepository;
import com.project.kkookk.wallet.repository.WalletRewardRepository;
import com.project.kkookk.wallet.repository.WalletStampCardRepository;
import com.project.kkookk.wallet.service.exception.CustomerWalletBlockedException;
import com.project.kkookk.wallet.service.exception.CustomerWalletNotFoundException;
import com.project.kkookk.wallet.service.exception.WalletStampCardNotFoundException;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerWalletService {

    private final CustomerWalletRepository customerWalletRepository;
    private final WalletStampCardRepository walletStampCardRepository;
    private final WalletRewardRepository walletRewardRepository;
    private final StampCardRepository stampCardRepository;
    private final StoreRepository storeRepository;
    private final StampEventRepository stampEventRepository;
    private final RedeemEventRepository redeemEventRepository;
    private final JwtUtil jwtUtil;

    @Transactional
    public WalletRegisterResponse register(WalletRegisterRequest request) {
        // 1. 전화번호 중복 체크
        if (customerWalletRepository.existsByPhone(request.phone())) {
            throw new BusinessException(ErrorCode.WALLET_PHONE_DUPLICATED);
        }

        // 2. CustomerWallet 생성
        CustomerWallet wallet =
                CustomerWallet.builder()
                        .phone(request.phone())
                        .name(request.name())
                        .nickname(request.nickname())
                        .build();

        CustomerWallet savedWallet = customerWalletRepository.save(wallet);

        // 3. storeId가 있으면 해당 매장의 ACTIVE 스탬프카드로 WalletStampCard 자동 생성
        RegisteredStampCardInfo stampCardInfo = null;
        if (request.storeId() != null) {
            stampCardInfo = createWalletStampCardIfExists(savedWallet.getId(), request.storeId());
        }

        // 4. JWT 토큰 생성 (일반 CUSTOMER 토큰, STEPUP 아님)
        String accessToken = jwtUtil.generateCustomerToken(savedWallet.getId());

        log.info(
                "[Wallet Register] walletId={}, phone={}, name={}, storeId={}, walletStampCardId={}",
                savedWallet.getId(),
                savedWallet.getPhone(),
                savedWallet.getName(),
                request.storeId(),
                stampCardInfo != null ? stampCardInfo.walletStampCardId() : null);

        // 5. Response 반환
        return new WalletRegisterResponse(
                accessToken,
                savedWallet.getId(),
                savedWallet.getPhone(),
                savedWallet.getName(),
                savedWallet.getNickname(),
                stampCardInfo);
    }

    @Transactional
    public CustomerLoginResponse login(CustomerLoginRequest request) {
        // 1. 전화번호와 이름으로 CustomerWallet 조회
        CustomerWallet wallet =
                customerWalletRepository
                        .findByPhoneAndName(request.phone(), request.name())
                        .orElseThrow(
                                () ->
                                        new CustomerWalletNotFoundException(
                                                "해당 전화번호와 이름으로 지갑을 찾을 수 없습니다"));

        // 2. BLOCKED 상태 체크
        if (wallet.isBlocked()) {
            throw new CustomerWalletBlockedException("차단된 지갑입니다");
        }

        // 3. 해당 매장의 스탬프카드가 있는지 확인, 없으면 생성
        ensureWalletStampCardExists(wallet.getId(), request.storeId());

        // 4. 고객의 모든 ACTIVE 스탬프카드 조회 (현재 매장 카드 우선)
        List<WalletStampCardSummary> stampCards =
                getAllStampCardsWithCurrentStoreFirst(wallet.getId(), request.storeId());

        // 5. JWT 토큰 생성
        String accessToken = jwtUtil.generateCustomerToken(wallet.getId());

        log.info(
                "[Customer Login] walletId={}, phone={}, name={}, storeId={}, stampCardCount={}",
                wallet.getId(),
                wallet.getPhone(),
                wallet.getName(),
                request.storeId(),
                stampCards.size());

        // 6. Response 반환
        return new CustomerLoginResponse(
                accessToken,
                wallet.getId(),
                wallet.getPhone(),
                wallet.getName(),
                wallet.getNickname(),
                stampCards);
    }

    private void ensureWalletStampCardExists(Long walletId, Long storeId) {
        // 해당 매장의 ACTIVE 스탬프카드가 없으면 생성
        boolean exists =
                walletStampCardRepository
                        .findByCustomerWalletIdAndStoreIdAndStatus(
                                walletId, storeId, WalletStampCardStatus.ACTIVE)
                        .isPresent();

        if (!exists) {
            createWalletStampCardIfExists(walletId, storeId);
        }
    }

    private List<WalletStampCardSummary> getAllStampCardsWithCurrentStoreFirst(
            Long walletId, Long currentStoreId) {

        // 고객의 모든 ACTIVE 스탬프카드 조회
        List<WalletStampCard> walletCards =
                walletStampCardRepository.findByCustomerWalletIdAndStatus(
                        walletId, WalletStampCardStatus.ACTIVE);

        if (walletCards.isEmpty()) {
            return List.of();
        }

        // StampCard, Store Batch 조회 (N+1 방지)
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

        // 현재 매장 카드를 첫 번째로 정렬
        walletCards.sort(
                (a, b) -> {
                    boolean firstIsCurrentStore = a.getStoreId().equals(currentStoreId);
                    boolean secondIsCurrentStore = b.getStoreId().equals(currentStoreId);
                    if (firstIsCurrentStore && !secondIsCurrentStore) {
                        return -1;
                    }
                    if (!firstIsCurrentStore && secondIsCurrentStore) {
                        return 1;
                    }
                    // 같은 경우 최근 적립 순
                    if (a.getLastStampedAt() == null && b.getLastStampedAt() == null) {
                        return 0;
                    }
                    if (a.getLastStampedAt() == null) {
                        return 1;
                    }
                    if (b.getLastStampedAt() == null) {
                        return -1;
                    }
                    return b.getLastStampedAt().compareTo(a.getLastStampedAt());
                });

        // WalletStampCardSummary 변환
        return walletCards.stream()
                .map(
                        walletCard ->
                                WalletStampCardSummary.from(
                                        walletCard,
                                        stampCardMap.get(walletCard.getStampCardId()),
                                        storeMap.get(walletCard.getStoreId())))
                .toList();
    }

    private RegisteredStampCardInfo createWalletStampCardIfExists(Long walletId, Long storeId) {
        // 해당 매장의 ACTIVE 스탬프카드 조회
        return stampCardRepository
                .findFirstByStoreIdAndStatusOrderByCreatedAtDesc(storeId, StampCardStatus.ACTIVE)
                .map(
                        stampCard -> {
                            // Store 조회
                            Store store =
                                    storeRepository
                                            .findById(storeId)
                                            .orElseThrow(
                                                    () ->
                                                            new BusinessException(
                                                                    ErrorCode.STORE_NOT_FOUND));

                            // WalletStampCard 생성
                            WalletStampCard walletStampCard =
                                    WalletStampCard.builder()
                                            .customerWalletId(walletId)
                                            .storeId(storeId)
                                            .stampCardId(stampCard.getId())
                                            .stampCount(0)
                                            .build();
                            WalletStampCard saved = walletStampCardRepository.save(walletStampCard);

                            log.info(
                                    "[WalletStampCard Created] walletId={}, storeId={}, "
                                            + "stampCardId={}, walletStampCardId={}",
                                    walletId,
                                    storeId,
                                    stampCard.getId(),
                                    saved.getId());

                            return RegisteredStampCardInfo.from(saved, stampCard, store);
                        })
                .orElseGet(
                        () -> {
                            log.warn(
                                    "[WalletStampCard Skip] No ACTIVE StampCard found for "
                                            + "walletId={}, storeId={}",
                                    walletId,
                                    storeId);
                            return null;
                        });
    }

    public WalletStampCardListResponse getMyStampCards(Long walletId, StampCardSortType sortType) {
        // Step 1: CustomerWallet 조회
        CustomerWallet wallet =
                customerWalletRepository
                        .findById(walletId)
                        .orElseThrow(() -> new CustomerWalletNotFoundException("지갑을 찾을 수 없습니다"));

        // Step 2: BLOCKED 상태 체크
        if (wallet.isBlocked()) {
            throw new CustomerWalletBlockedException("차단된 지갑입니다");
        }

        // Step 3: 스탬프카드 목록 조회 및 Response 생성
        return buildStampCardListResponse(wallet, sortType);
    }

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

        // Step 3: 스탬프카드 목록 조회 및 Response 생성
        return buildStampCardListResponse(wallet, sortType);
    }

    private WalletStampCardListResponse buildStampCardListResponse(
            CustomerWallet wallet, StampCardSortType sortType) {

        // WalletStampCard 목록 조회 (정렬 적용)
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

    public StampEventHistoryResponse getStampHistoryByStore(
            Long storeId, Long walletId, Pageable pageable) {

        // Step 1: 해당 매장에 WalletStampCard가 존재하는지 확인 (ACTIVE 또는 COMPLETED)
        boolean hasStampCard =
                walletStampCardRepository.existsByCustomerWalletIdAndStoreId(walletId, storeId);

        if (!hasStampCard) {
            throw new WalletStampCardNotFoundException("해당 매장의 스탬프카드를 찾을 수 없습니다");
        }

        // Step 2: 해당 매장의 모든 StampEvent 페이징 조회 (ACTIVE + COMPLETED 카드 모두 포함)
        Page<StampEvent> eventPage =
                stampEventRepository.findByStoreIdAndWalletId(storeId, walletId, pageable);

        // Step 3: Response 조립
        List<StampEventSummary> events =
                eventPage.getContent().stream().map(StampEventSummary::from).toList();

        return new StampEventHistoryResponse(events, PageInfo.from(eventPage));
    }

    public RedeemEventHistoryResponse getRedeemHistoryByStore(
            Long storeId, Long walletId, Pageable pageable) {

        // Step 1: 해당 매장에 WalletStampCard가 존재하는지 확인
        boolean hasStampCard =
                walletStampCardRepository.existsByCustomerWalletIdAndStoreId(walletId, storeId);

        if (!hasStampCard) {
            throw new WalletStampCardNotFoundException("해당 매장의 스탬프카드를 찾을 수 없습니다");
        }

        // Step 2: 해당 매장의 RedeemEvent 페이징 조회
        Page<RedeemEvent> eventPage =
                redeemEventRepository.findByStoreIdAndWalletIdOrderByOccurredAtDesc(
                        storeId, walletId, pageable);

        // Step 3: Store 조회
        Store store =
                storeRepository
                        .findById(storeId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.STORE_NOT_FOUND));

        // Step 4: Response 조립
        List<RedeemEventSummary> events =
                eventPage.getContent().stream()
                        .map(event -> RedeemEventSummary.from(event, store))
                        .toList();

        return new RedeemEventHistoryResponse(events, PageInfo.from(eventPage));
    }

    public WalletRewardListResponse getRewards(
            Long walletId, WalletRewardStatus status, Pageable pageable) {

        // Step 1: WalletReward 페이징 조회 (상태 필터 선택적)
        Page<WalletReward> rewardPage;
        if (status != null) {
            rewardPage =
                    walletRewardRepository.findByWalletIdAndStatusOrderByIssuedAtDesc(
                            walletId, status, pageable);
        } else {
            rewardPage =
                    walletRewardRepository.findByWalletIdOrderByIssuedAtDesc(walletId, pageable);
        }

        // Step 2: Store, StampCard Batch 조회 (N+1 방지)
        Set<Long> storeIds =
                rewardPage.getContent().stream()
                        .map(WalletReward::getStoreId)
                        .collect(Collectors.toSet());
        Set<Long> stampCardIds =
                rewardPage.getContent().stream()
                        .map(WalletReward::getStampCardId)
                        .collect(Collectors.toSet());

        Map<Long, Store> storeMap =
                storeRepository.findAllById(storeIds).stream()
                        .collect(Collectors.toMap(Store::getId, Function.identity()));
        Map<Long, StampCard> stampCardMap =
                stampCardRepository.findAllById(stampCardIds).stream()
                        .collect(Collectors.toMap(StampCard::getId, Function.identity()));

        // Step 3: Response 조립
        List<WalletRewardItem> rewards =
                rewardPage.getContent().stream()
                        .map(
                                reward -> {
                                    Store store = storeMap.get(reward.getStoreId());
                                    StampCard stampCard = stampCardMap.get(reward.getStampCardId());
                                    return new WalletRewardItem(
                                            reward.getId(),
                                            new StoreInfo(store.getId(), store.getName()),
                                            stampCard != null ? stampCard.getRewardName() : null,
                                            stampCard != null ? stampCard.getTitle() : null,
                                            reward.getStatus(),
                                            reward.getIssuedAt(),
                                            reward.getExpiresAt(),
                                            reward.getRedeemedAt(),
                                            stampCard != null ? stampCard.getDesignType() : null,
                                            stampCard != null ? stampCard.getDesignJson() : null);
                                })
                        .toList();

        return new WalletRewardListResponse(rewards, PageInfo.from(rewardPage));
    }

    private List<WalletStampCard> getWalletStampCardsSorted(
            Long walletId, StampCardSortType sortType) {

        // ACTIVE 상태의 WalletStampCard만 조회 (COMPLETED 제외)
        return switch (sortType) {
            case LAST_STAMPED ->
                    walletStampCardRepository
                            .findByCustomerWalletIdAndStatusOrderByLastStampedAtDesc(
                                    walletId, WalletStampCardStatus.ACTIVE);
            case CREATED ->
                    walletStampCardRepository.findByCustomerWalletIdAndStatusOrderByCreatedAtDesc(
                            walletId, WalletStampCardStatus.ACTIVE);
            case PROGRESS ->
                    walletStampCardRepository.findByCustomerWalletIdAndStatus(
                            walletId, WalletStampCardStatus.ACTIVE);
        };
    }

    private double calculateProgress(int currentCount, int goalCount) {
        return (currentCount * 100.0) / goalCount;
    }
}
