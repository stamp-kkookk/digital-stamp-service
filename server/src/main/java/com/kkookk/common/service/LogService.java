package com.kkookk.common.service;

import com.kkookk.common.dto.EventLogResponse;
import com.kkookk.issuance.entity.StampEvent;
import com.kkookk.issuance.repository.StampEventRepository;
import com.kkookk.redemption.entity.RedeemEvent;
import com.kkookk.redemption.repository.RedeemEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LogService {

    private final StampEventRepository stampEventRepository;
    private final RedeemEventRepository redeemEventRepository;

    @Transactional(readOnly = true)
    public List<EventLogResponse> getStampLogs(Long storeId, Long walletId, LocalDateTime from, LocalDateTime to) {
        List<StampEvent> events = stampEventRepository.findAll();

        // 필터링
        return events.stream()
                .filter(e -> storeId == null || e.getStore().getId().equals(storeId))
                .filter(e -> walletId == null || e.getWallet().getId().equals(walletId))
                .filter(e -> from == null || e.getCreatedAt().isAfter(from))
                .filter(e -> to == null || e.getCreatedAt().isBefore(to))
                .sorted(Comparator.comparing(StampEvent::getCreatedAt).reversed())
                .map(this::toStampEventResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EventLogResponse> getRedeemLogs(Long storeId, Long walletId, LocalDateTime from, LocalDateTime to) {
        List<RedeemEvent> events = redeemEventRepository.findAll();

        // 필터링
        return events.stream()
                .filter(e -> storeId == null || e.getStore().getId().equals(storeId))
                .filter(e -> walletId == null || e.getWallet().getId().equals(walletId))
                .filter(e -> from == null || e.getCreatedAt().isAfter(from))
                .filter(e -> to == null || e.getCreatedAt().isBefore(to))
                .sorted(Comparator.comparing(RedeemEvent::getCreatedAt).reversed())
                .map(this::toRedeemEventResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EventLogResponse> getAllLogs(Long storeId, Long walletId, LocalDateTime from, LocalDateTime to) {
        List<EventLogResponse> allLogs = new ArrayList<>();

        allLogs.addAll(getStampLogs(storeId, walletId, from, to));
        allLogs.addAll(getRedeemLogs(storeId, walletId, from, to));

        // 시간순 정렬
        allLogs.sort(Comparator.comparing(EventLogResponse::getCreatedAt).reversed());

        return allLogs;
    }

    private EventLogResponse toStampEventResponse(StampEvent event) {
        return EventLogResponse.builder()
                .id(event.getId())
                .eventType("STAMP")
                .eventSubType(event.getEventType().name())
                .walletId(event.getWallet().getId())
                .storeId(event.getStore().getId())
                .storeName(event.getStore().getName())
                .stampCardId(event.getStampCard().getId())
                .stampCardTitle(event.getStampCard().getTitle())
                .stampDelta(event.getStampDelta())
                .requestId(event.getRequestId())
                .notes(event.getNotes())
                .createdAt(event.getCreatedAt())
                .build();
    }

    private EventLogResponse toRedeemEventResponse(RedeemEvent event) {
        return EventLogResponse.builder()
                .id(event.getId())
                .eventType("REDEEM")
                .eventSubType("REDEEMED")
                .walletId(event.getWallet().getId())
                .storeId(event.getStore().getId())
                .storeName(event.getStore().getName())
                .stampCardId(event.getStampCard().getId())
                .stampCardTitle(event.getStampCard().getTitle())
                .rewardName(event.getRewardInstance().getRewardName())
                .sessionToken(event.getSessionToken())
                .createdAt(event.getCreatedAt())
                .build();
    }
}
