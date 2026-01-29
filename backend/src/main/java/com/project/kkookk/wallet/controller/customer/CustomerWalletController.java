package com.project.kkookk.wallet.controller.customer;

import com.project.kkookk.wallet.domain.StampCardSortType;
import com.project.kkookk.wallet.dto.response.RedeemEventHistoryResponse;
import com.project.kkookk.wallet.dto.response.StampEventHistoryResponse;
import com.project.kkookk.wallet.dto.response.WalletStampCardListResponse;
import com.project.kkookk.wallet.service.CustomerWalletService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
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
    public ResponseEntity<WalletStampCardListResponse> getStampCardsByPhoneAndName(
            @NotBlank(message = "전화번호는 필수입니다")
                    @Pattern(regexp = "^\\d{3}-\\d{3,4}-\\d{4}$", message = "전화번호 형식이 올바르지 않습니다")
                    String phone,
            @NotBlank(message = "이름은 필수입니다")
                    @Size(min = 2, max = 50, message = "이름은 2~50자 이내여야 합니다")
                    String name,
            StampCardSortType sortBy) {

        WalletStampCardListResponse response =
                customerWalletService.getStampCardsByPhoneAndName(phone, name, sortBy);

        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<StampEventHistoryResponse> getStampHistory(
            Long walletStampCardId, @Min(0) int page, @Min(1) @Max(100) int size) {

        // TODO: JWT 인증 구현 후 SecurityContext에서 walletId 추출
        // Long walletId = CustomerSecurityUtils.getCurrentCustomerWalletId();
        // 임시로 하드코딩 (실제 구현 시 삭제 필요)
        Long walletId = 1L;

        Pageable pageable = PageRequest.of(page, size, Sort.by("occurredAt").descending());
        StampEventHistoryResponse response =
                customerWalletService.getStampHistory(walletStampCardId, walletId, pageable);

        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<RedeemEventHistoryResponse> getRedeemHistory(
            @Min(0) int page, @Min(1) @Max(100) int size) {

        // TODO: JWT 인증 구현 후 SecurityContext에서 walletId 추출
        // Long walletId = CustomerSecurityUtils.getCurrentCustomerWalletId();
        // 임시로 하드코딩 (실제 구현 시 삭제 필요)
        Long walletId = 1L;

        Pageable pageable = PageRequest.of(page, size, Sort.by("occurredAt").descending());
        RedeemEventHistoryResponse response =
                customerWalletService.getRedeemHistory(walletId, pageable);

        return ResponseEntity.ok(response);
    }
}
