package com.kkookk.customer.service;

import com.kkookk.common.exception.BusinessException;
import com.kkookk.customer.dto.WalletStampCardResponse;
import com.kkookk.customer.entity.CustomerSession;
import com.kkookk.customer.entity.WalletStampCard;
import com.kkookk.customer.repository.CustomerSessionRepository;
import com.kkookk.customer.repository.WalletStampCardRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WalletStampCardService {

    private final WalletStampCardRepository walletStampCardRepository;
    private final CustomerSessionRepository sessionRepository;

    @Transactional(readOnly = true)
    public List<WalletStampCardResponse> getMyStampCards(String sessionToken) {
        // 세션 검증
        CustomerSession session = sessionRepository.findBySessionToken(sessionToken)
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

        // WalletStampCard 목록 조회
        List<WalletStampCard> cards = walletStampCardRepository
                .findByWalletIdOrderByUpdatedAtDesc(session.getWallet().getId());

        return cards.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private WalletStampCardResponse toResponse(WalletStampCard card) {
        return WalletStampCardResponse.builder()
                .id(card.getId())
                .storeId(card.getStampCard().getStore().getId())
                .storeName(card.getStampCard().getStore().getName())
                .storeAddress(card.getStampCard().getStore().getAddress())
                .stampCardId(card.getStampCard().getId())
                .stampCardTitle(card.getStampCard().getTitle())
                .stampCardDescription(card.getStampCard().getDescription())
                .stampGoal(card.getStampCard().getStampGoal())
                .rewardName(card.getStampCard().getRewardName())
                .rewardExpiresInDays(card.getStampCard().getRewardExpiresInDays())
                .themeColor(card.getStampCard().getThemeColor())
                .stampCount(card.getStampCount())
                .updatedAt(card.getUpdatedAt())
                .build();
    }
}
