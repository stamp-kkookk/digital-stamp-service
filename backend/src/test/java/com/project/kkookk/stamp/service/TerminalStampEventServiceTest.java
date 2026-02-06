package com.project.kkookk.stamp.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.stamp.controller.owner.dto.StampEventResponse;
import com.project.kkookk.stamp.domain.StampEventType;
import com.project.kkookk.stamp.repository.StampEventProjection;
import com.project.kkookk.stamp.repository.StampEventRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

@ExtendWith(MockitoExtension.class)
@DisplayName("TerminalStampEventService 테스트")
class TerminalStampEventServiceTest {

    @InjectMocks private TerminalStampEventService terminalStampEventService;

    @Mock private StampEventRepository stampEventRepository;

    @Test
    @DisplayName("스탬프 적립 내역 조회 성공")
    void getStampEvents_Success() {
        // given
        Long storeId = 1L;
        int page = 0;
        int size = 20;

        StampEventProjection projection = createMockProjection();
        Page<StampEventProjection> projectionPage = new PageImpl<>(List.of(projection));

        given(stampEventRepository.findByStoreIdWithCustomerInfo(eq(storeId), any(Pageable.class)))
                .willReturn(projectionPage);

        // when
        Page<StampEventResponse> result =
                terminalStampEventService.getStampEvents(storeId, storeId, page, size);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).customerName()).isEqualTo("홍길동");
    }

    @Test
    @DisplayName("스탬프 적립 내역 조회 실패 - 다른 매장 접근 시도")
    void getStampEvents_Fail_AccessDenied() {
        // given
        Long terminalStoreId = 1L;
        Long requestedStoreId = 2L;
        int page = 0;
        int size = 20;

        // when & then
        assertThatThrownBy(
                        () ->
                                terminalStampEventService.getStampEvents(
                                        terminalStoreId, requestedStoreId, page, size))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.TERMINAL_ACCESS_DENIED);
    }

    private StampEventProjection createMockProjection() {
        return new StampEventProjection() {
            @Override
            public Long getId() {
                return 1L;
            }

            @Override
            public Long getWalletStampCardId() {
                return 10L;
            }

            @Override
            public String getCustomerName() {
                return "홍길동";
            }

            @Override
            public String getCustomerPhone() {
                return "010-1234-5678";
            }

            @Override
            public StampEventType getType() {
                return StampEventType.ISSUED;
            }

            @Override
            public Integer getDelta() {
                return 1;
            }

            @Override
            public String getReason() {
                return "현장 승인";
            }

            @Override
            public LocalDateTime getOccurredAt() {
                return LocalDateTime.now();
            }
        };
    }
}
