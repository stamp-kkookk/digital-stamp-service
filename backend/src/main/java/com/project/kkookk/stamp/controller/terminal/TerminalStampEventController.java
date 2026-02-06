package com.project.kkookk.stamp.controller.terminal;

import com.project.kkookk.global.dto.PageResponse;
import com.project.kkookk.global.security.TerminalPrincipal;
import com.project.kkookk.stamp.controller.owner.dto.StampEventResponse;
import com.project.kkookk.stamp.service.TerminalStampEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/terminal/stores/{storeId}/stamp-events")
public class TerminalStampEventController implements TerminalStampEventApi {

    private final TerminalStampEventService terminalStampEventService;

    @Override
    @GetMapping
    public ResponseEntity<PageResponse<StampEventResponse>> getStampEvents(
            @PathVariable Long storeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal TerminalPrincipal principal) {

        Page<StampEventResponse> events =
                terminalStampEventService.getStampEvents(
                        principal.getStoreId(), storeId, page, size);

        return ResponseEntity.ok(PageResponse.from(events));
    }
}
