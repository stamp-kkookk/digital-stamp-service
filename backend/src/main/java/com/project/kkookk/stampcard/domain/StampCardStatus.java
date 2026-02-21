package com.project.kkookk.stampcard.domain;

import java.util.Set;

public enum StampCardStatus {
    DRAFT, // 초안 (편집 가능, 미노출)
    ACTIVE, // 활성 (고객에게 노출, Store당 1개만)
    ARCHIVED; // 보관 (재게시 가능, 통계용 보존)

    private static final Set<StampCardStatus> ALLOWED_FROM_DRAFT = Set.of(ACTIVE, ARCHIVED);
    private static final Set<StampCardStatus> ALLOWED_FROM_ACTIVE = Set.of(ARCHIVED);
    private static final Set<StampCardStatus> ALLOWED_FROM_ARCHIVED = Set.of(ACTIVE);

    public boolean canTransitionTo(StampCardStatus target) {
        if (this == target) {
            return false;
        }

        return switch (this) {
            case DRAFT -> ALLOWED_FROM_DRAFT.contains(target);
            case ACTIVE -> ALLOWED_FROM_ACTIVE.contains(target);
            case ARCHIVED -> ALLOWED_FROM_ARCHIVED.contains(target);
        };
    }
}
