package com.project.kkookk.domain.issuance.dto;

import com.project.kkookk.domain.issuance.dto.CustomerInfo;

import java.time.LocalDateTime;
import java.util.UUID;

// Repository에서 DTO 프로젝션을 위해 생성자 필요
public record PendingIssuanceRequestResponse(
    UUID requestId,
    CustomerInfo customer,
    LocalDateTime requestedAt,
    LocalDateTime expiresAt
) {
    // 전화번호 뒷4자리를 마스킹 처리하는 생성자
    public PendingIssuanceRequestResponse(UUID requestId, String customerNickname, String customerPhoneNumber, LocalDateTime requestedAt, LocalDateTime expiresAt) {
        this(
            requestId,
            new CustomerInfo(customerNickname, maskPhoneNumber(customerPhoneNumber)),
            requestedAt,
            expiresAt
        );
    }

    private static String maskPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.length() < 4) {
            return "****";
        }
        return "****" + phoneNumber.substring(phoneNumber.length() - 4);
    }
}
