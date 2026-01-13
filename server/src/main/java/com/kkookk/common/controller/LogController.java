package com.kkookk.common.controller;

import com.kkookk.common.dto.EventLogResponse;
import com.kkookk.common.service.LogService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/owner/logs")
@RequiredArgsConstructor
public class LogController {

    private final LogService logService;

    @GetMapping("/stamps")
    public ResponseEntity<List<EventLogResponse>> getStampLogs(
            @RequestParam(required = false) Long storeId,
            @RequestParam(required = false) Long walletId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {

        List<EventLogResponse> logs = logService.getStampLogs(storeId, walletId, from, to);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/redeems")
    public ResponseEntity<List<EventLogResponse>> getRedeemLogs(
            @RequestParam(required = false) Long storeId,
            @RequestParam(required = false) Long walletId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {

        List<EventLogResponse> logs = logService.getRedeemLogs(storeId, walletId, from, to);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/all")
    public ResponseEntity<List<EventLogResponse>> getAllLogs(
            @RequestParam(required = false) Long storeId,
            @RequestParam(required = false) Long walletId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {

        List<EventLogResponse> logs = logService.getAllLogs(storeId, walletId, from, to);
        return ResponseEntity.ok(logs);
    }
}
