package com.project.kkookk.wallet.controller.customer;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.global.security.CustomerPrincipal;
import com.project.kkookk.wallet.domain.StampCardSortType;
import com.project.kkookk.wallet.domain.WalletRewardStatus;
import com.project.kkookk.wallet.dto.response.RedeemEventHistoryResponse;
import com.project.kkookk.wallet.dto.response.StampEventHistoryResponse;
import com.project.kkookk.wallet.dto.response.WalletRewardListResponse;
import com.project.kkookk.wallet.dto.response.WalletStampCardListResponse;
import com.project.kkookk.wallet.service.CustomerWalletService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Validated
public class CustomerWalletController implements CustomerWalletApi {

    private final CustomerWalletService customerWalletService;

    @Override
    public ResponseEntity<WalletStampCardListResponse> getMyStampCards(
            CustomerPrincipal principal, StampCardSortType sortBy) {

        Long walletId = principal.getWalletId();
        WalletStampCardListResponse response =
                customerWalletService.getMyStampCards(walletId, sortBy);

        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<StampEventHistoryResponse> getStampHistory(
            CustomerPrincipal principal,
            Long storeId,
            @Min(0) int page,
            @Min(1) @Max(100) int size) {

        // StepUp 인증 필수
        if (!principal.isStepUp()) {
            throw new BusinessException(ErrorCode.STEPUP_REQUIRED);
        }

        Long walletId = principal.getWalletId();

        Pageable pageable = PageRequest.of(page, size, Sort.by("occurredAt").descending());
        StampEventHistoryResponse response =
                customerWalletService.getStampHistoryByStore(storeId, walletId, pageable);

        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<RedeemEventHistoryResponse> getRedeemHistory(
            CustomerPrincipal principal,
            Long storeId,
            @Min(0) int page,
            @Min(1) @Max(100) int size) {

        // StepUp 인증 필수
        if (!principal.isStepUp()) {
            throw new BusinessException(ErrorCode.STEPUP_REQUIRED);
        }

        Long walletId = principal.getWalletId();

        Pageable pageable = PageRequest.of(page, size, Sort.by("occurredAt").descending());
        RedeemEventHistoryResponse response =
                customerWalletService.getRedeemHistoryByStore(storeId, walletId, pageable);

        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<WalletRewardListResponse> getRewards(
            CustomerPrincipal principal,
            WalletRewardStatus status,
            @Min(0) int page,
            @Min(1) @Max(100) int size) {

        // StepUp 인증 필수
        if (!principal.isStepUp()) {
            throw new BusinessException(ErrorCode.STEPUP_REQUIRED);
        }

        Long walletId = principal.getWalletId();

        Pageable pageable = PageRequest.of(page, size, Sort.by("issuedAt").descending());
        WalletRewardListResponse response =
                customerWalletService.getRewards(walletId, status, pageable);

        return ResponseEntity.ok(response);
    }
}
