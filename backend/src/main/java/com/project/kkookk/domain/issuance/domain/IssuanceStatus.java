package com.project.kkookk.domain.issuance.domain;

public enum IssuanceStatus {
    PENDING,  // 승인 대기
    APPROVED, // 승인됨
    REJECTED, // 거절됨
    EXPIRED   // 만료됨
}
