package com.kkookk.issuance.entity;

public enum StampEventType {
    ISSUED,         // 정상 적립
    MIGRATED,       // 종이 스탬프 마이그레이션
    MANUAL_ADJUST   // 수동 조정
}
