package com.project.kkookk.stamp.service;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.stamp.controller.owner.dto.StampEventResponse;
import com.project.kkookk.stamp.repository.StampEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TerminalStampEventService {

    private final StampEventRepository stampEventRepository;

    public Page<StampEventResponse> getStampEvents(
            Long terminalStoreId, Long requestedStoreId, int page, int size) {

        // 터미널의 storeId와 요청된 storeId 일치 확인
        if (!terminalStoreId.equals(requestedStoreId)) {
            throw new BusinessException(ErrorCode.TERMINAL_ACCESS_DENIED);
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<StampEventResponse> result =
                stampEventRepository
                        .findByStoreIdWithCustomerInfo(requestedStoreId, pageable)
                        .map(StampEventResponse::from);
        log.info("[StampEvent] Terminal queried storeId={} page={}", requestedStoreId, page);
        return result;
    }
}
