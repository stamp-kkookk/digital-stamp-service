package com.project.kkookk.stamp.event;

import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.verify;

import com.project.kkookk.issuance.event.StampIssuedEvent;
import com.project.kkookk.migration.event.StampMigratedEvent;
import com.project.kkookk.stamp.domain.StampEventType;
import com.project.kkookk.stamp.repository.StampEventRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class StampAuditEventListenerTest {

    @InjectMocks private StampAuditEventListener listener;
    @Mock private StampEventRepository stampEventRepository;

    @Test
    @DisplayName("StampIssuedEvent 수신 시 ISSUED 타입 StampEvent 생성")
    void onStampIssued_createsStampEvent() {
        // given
        StampIssuedEvent event = new StampIssuedEvent(100L, 1L, 10L, 50L, 1, "현장 승인");

        // when
        listener.onStampIssued(event);

        // then
        verify(stampEventRepository)
                .save(
                        argThat(
                                e ->
                                        e.getType() == StampEventType.ISSUED
                                                && e.getStoreId().equals(1L)
                                                && e.getStampCardId().equals(10L)
                                                && e.getWalletStampCardId().equals(50L)
                                                && e.getDelta() == 1
                                                && e.getIssuanceRequestId().equals(100L)
                                                && e.getReason().equals("현장 승인")));
    }

    @Test
    @DisplayName("StampMigratedEvent 수신 시 MIGRATED 타입 StampEvent 생성")
    void onStampMigrated_createsStampEvent() {
        // given
        StampMigratedEvent event = new StampMigratedEvent(200L, 1L, 10L, 50L, 5, "종이 스탬프 전환 승인");

        // when
        listener.onStampMigrated(event);

        // then
        verify(stampEventRepository)
                .save(
                        argThat(
                                e ->
                                        e.getType() == StampEventType.MIGRATED
                                                && e.getStoreId().equals(1L)
                                                && e.getDelta() == 5
                                                && e.getStampMigrationRequestId().equals(200L)
                                                && e.getReason().equals("종이 스탬프 전환 승인")));
    }
}
