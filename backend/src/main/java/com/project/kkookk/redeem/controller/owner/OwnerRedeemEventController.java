package com.project.kkookk.redeem.controller.owner;

import com.project.kkookk.global.dto.PageResponse;
import com.project.kkookk.global.security.OwnerPrincipal;
import com.project.kkookk.redeem.controller.owner.dto.RedeemEventResponse;
import com.project.kkookk.redeem.service.OwnerRedeemEventService;
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
@RequestMapping("/api/owner/stores/{storeId}/redeem-events")
public class OwnerRedeemEventController implements OwnerRedeemEventApi {

    private final OwnerRedeemEventService ownerRedeemEventService;

    @Override
    @GetMapping
    public ResponseEntity<PageResponse<RedeemEventResponse>> getRedeemEvents(
            @PathVariable Long storeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal OwnerPrincipal principal) {

        Page<RedeemEventResponse> events =
                ownerRedeemEventService.getCompletedRedeemEvents(
                        principal.getOwnerId(), storeId, page, size);

        return ResponseEntity.ok(PageResponse.from(events));
    }
}
