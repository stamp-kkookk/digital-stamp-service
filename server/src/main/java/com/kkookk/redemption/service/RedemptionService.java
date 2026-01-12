package com.kkookk.redemption.service;

import com.kkookk.common.exception.BusinessException;
import com.kkookk.customer.entity.CustomerSession;
import com.kkookk.customer.repository.CustomerSessionRepository;
import com.kkookk.redemption.dto.CreateRedeemSessionRequest;
import com.kkookk.redemption.dto.RedeemSessionResponse;
import com.kkookk.redemption.dto.RewardInstanceResponse;
import com.kkookk.redemption.entity.RedeemEvent;
import com.kkookk.redemption.entity.RedeemSession;
import com.kkookk.redemption.entity.RewardInstance;
import com.kkookk.redemption.entity.RewardStatus;
import com.kkookk.redemption.repository.RedeemEventRepository;
import com.kkookk.redemption.repository.RedeemSessionRepository;
import com.kkookk.redemption.repository.RewardInstanceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RedemptionService {

    private static final int REDEEM_SESSION_TTL_SECONDS = 45; // 45초

    private final RewardInstanceRepository rewardInstanceRepository;
    private final RedeemSessionRepository redeemSessionRepository;
    private final RedeemEventRepository redeemEventRepository;
    private final CustomerSessionRepository customerSessionRepository;

    @Transactional(readOnly = true)
    public List<RewardInstanceResponse> getMyRewards(String sessionToken) {
        // 세션 검증
        CustomerSession session = customerSessionRepository.findBySessionToken(sessionToken)
                .orElseThrow(() -> new BusinessException(
                        "S001",
                        "유효하지 않은 세션입니다.",
                        HttpStatus.UNAUTHORIZED
                ));

        if (session.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BusinessException(
                    "S002",
                    "세션이 만료되었습니다. 다시 로그인해주세요.",
                    HttpStatus.UNAUTHORIZED
            );
        }

        // 사용 가능한 리워드 조회
        List<RewardInstance> rewards = rewardInstanceRepository
                .findByWalletIdAndStatusOrderByCreatedAtDesc(
                        session.getWallet().getId(),
                        RewardStatus.AVAILABLE
                );

        return rewards.stream()
                .map(this::toRewardResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public RedeemSessionResponse createRedeemSession(
            String walletSessionToken,
            CreateRedeemSessionRequest request) {

        // 세션 검증 및 OTP step-up 확인
        CustomerSession session = customerSessionRepository.findBySessionToken(walletSessionToken)
                .orElseThrow(() -> new BusinessException(
                        "S001",
                        "유효하지 않은 세션입니다.",
                        HttpStatus.UNAUTHORIZED
                ));

        if (session.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BusinessException(
                    "S002",
                    "세션이 만료되었습니다. 다시 로그인해주세요.",
                    HttpStatus.UNAUTHORIZED
            );
        }

        // OTP step-up 확인 (리워드 사용은 FULL scope 필요하지 않지만 OTP 재검증 필요)
        if (session.getOtpVerifiedUntil() == null ||
                session.getOtpVerifiedUntil().isBefore(LocalDateTime.now())) {
            throw new BusinessException(
                    "RD001",
                    "리워드 사용을 위해 OTP 재인증이 필요합니다.",
                    HttpStatus.FORBIDDEN
            );
        }

        // 리워드 조회
        RewardInstance reward = rewardInstanceRepository.findById(request.getRewardId())
                .orElseThrow(() -> new BusinessException(
                        "RD002",
                        "리워드를 찾을 수 없습니다.",
                        HttpStatus.NOT_FOUND
                ));

        // 소유권 확인
        if (!reward.getWallet().getId().equals(session.getWallet().getId())) {
            throw new BusinessException(
                    "RD003",
                    "본인의 리워드만 사용할 수 있습니다.",
                    HttpStatus.FORBIDDEN
            );
        }

        // 상태 확인
        if (reward.getStatus() != RewardStatus.AVAILABLE) {
            throw new BusinessException(
                    "RD004",
                    "이미 사용되었거나 만료된 리워드입니다.",
                    HttpStatus.CONFLICT
            );
        }

        // 만료 확인
        if (reward.getExpiresAt() != null && reward.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BusinessException(
                    "RD005",
                    "만료된 리워드입니다.",
                    HttpStatus.GONE
            );
        }

        // 중복 요청 확인
        if (redeemSessionRepository.findByClientRequestId(request.getClientRequestId()).isPresent()) {
            throw new BusinessException(
                    "RD006",
                    "이미 처리된 요청입니다.",
                    HttpStatus.CONFLICT
            );
        }

        // RedeemSession 생성
        String sessionToken = UUID.randomUUID().toString();
        LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(REDEEM_SESSION_TTL_SECONDS);

        RedeemSession redeemSession = RedeemSession.builder()
                .wallet(session.getWallet())
                .rewardInstance(reward)
                .sessionToken(sessionToken)
                .clientRequestId(request.getClientRequestId())
                .completed(false)
                .expiresAt(expiresAt)
                .build();

        redeemSession = redeemSessionRepository.save(redeemSession);

        log.info("Redeem session created: id={}, reward={}, wallet={}",
                redeemSession.getId(), reward.getId(), session.getWallet().getId());

        return toSessionResponse(redeemSession);
    }

    @Transactional
    public RedeemSessionResponse completeRedemption(String redeemSessionToken) {
        // RedeemSession 조회
        RedeemSession session = redeemSessionRepository.findBySessionToken(redeemSessionToken)
                .orElseThrow(() -> new BusinessException(
                        "RD007",
                        "사용 세션을 찾을 수 없습니다.",
                        HttpStatus.NOT_FOUND
                ));

        // 만료 확인
        if (session.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BusinessException(
                    "RD008",
                    "사용 세션이 만료되었습니다.",
                    HttpStatus.GONE
            );
        }

        // 이미 완료된 경우 (idempotent)
        if (session.isCompleted()) {
            log.info("Redeem session already completed: id={}", session.getId());
            return toSessionResponse(session);
        }

        RewardInstance reward = session.getRewardInstance();

        // 리워드 상태 확인
        if (reward.getStatus() != RewardStatus.AVAILABLE) {
            throw new BusinessException(
                    "RD004",
                    "이미 사용되었거나 만료된 리워드입니다.",
                    HttpStatus.CONFLICT
            );
        }

        // 리워드 사용 처리
        reward.setStatus(RewardStatus.USED);
        reward.setUsedAt(LocalDateTime.now());
        rewardInstanceRepository.save(reward);

        // 세션 완료 처리
        session.setCompleted(true);
        session.setCompletedAt(LocalDateTime.now());
        redeemSessionRepository.save(session);

        // 이벤트 로그
        RedeemEvent event = RedeemEvent.builder()
                .wallet(session.getWallet())
                .store(reward.getStore())
                .stampCard(reward.getStampCard())
                .rewardInstance(reward)
                .sessionToken(session.getSessionToken())
                .build();
        redeemEventRepository.save(event);

        log.info("Redemption completed: session={}, reward={}, wallet={}",
                session.getId(), reward.getId(), session.getWallet().getId());

        return toSessionResponse(session);
    }

    private RewardInstanceResponse toRewardResponse(RewardInstance reward) {
        return RewardInstanceResponse.builder()
                .id(reward.getId())
                .walletId(reward.getWallet().getId())
                .storeId(reward.getStore().getId())
                .storeName(reward.getStore().getName())
                .stampCardId(reward.getStampCard().getId())
                .stampCardTitle(reward.getStampCard().getTitle())
                .rewardName(reward.getRewardName())
                .status(reward.getStatus().name())
                .expiresAt(reward.getExpiresAt())
                .usedAt(reward.getUsedAt())
                .createdAt(reward.getCreatedAt())
                .build();
    }

    private RedeemSessionResponse toSessionResponse(RedeemSession session) {
        return RedeemSessionResponse.builder()
                .id(session.getId())
                .sessionToken(session.getSessionToken())
                .rewardId(session.getRewardInstance().getId())
                .rewardName(session.getRewardInstance().getRewardName())
                .storeName(session.getRewardInstance().getStore().getName())
                .completed(session.isCompleted())
                .expiresAt(session.getExpiresAt())
                .createdAt(session.getCreatedAt())
                .build();
    }
}
