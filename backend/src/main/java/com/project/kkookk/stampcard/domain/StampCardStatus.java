package com.project.kkookk.stampcard.domain;

import java.util.Set;

public enum StampCardStatus {
    DRAFT, // 초안 (편집 가능, 미노출)
    ACTIVE, // 활성 (고객에게 노출, Store당 1개만)
    PAUSED, // 일시정지 (미노출, 재활성 가능)
    ARCHIVED; // 보관 (영구 비활성, 통계용 보존)

    private static final Set<StampCardStatus> ALLOWED_FROM_DRAFT = Set.of(ACTIVE, ARCHIVED);
    private static final Set<StampCardStatus> ALLOWED_FROM_ACTIVE = Set.of(PAUSED, ARCHIVED);
    private static final Set<StampCardStatus> ALLOWED_FROM_PAUSED = Set.of(ACTIVE, ARCHIVED);

    public boolean canTransitionTo(StampCardStatus target) {
        if (this == target) {
            return false;
        }

        return switch (this) {
            case DRAFT -> ALLOWED_FROM_DRAFT.contains(target);
            case ACTIVE -> ALLOWED_FROM_ACTIVE.contains(target);
            case PAUSED -> ALLOWED_FROM_PAUSED.contains(target);
            case ARCHIVED -> false;
        };
    }
}
