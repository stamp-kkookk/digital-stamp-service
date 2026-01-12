package com.kkookk.stampcard.entity;

public enum StampCardStatus {
    DRAFT,      // 작성 중
    ACTIVE,     // 활성화 (고객에게 표시)
    PAUSED,     // 일시 중지
    ARCHIVED    // 보관 (더 이상 사용하지 않음)
}
