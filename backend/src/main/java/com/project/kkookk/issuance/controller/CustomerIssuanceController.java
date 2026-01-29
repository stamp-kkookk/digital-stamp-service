package com.project.kkookk.issuance.controller;

import com.project.kkookk.global.security.CustomerPrincipal;
import com.project.kkookk.issuance.controller.dto.CreateIssuanceRequest;
import com.project.kkookk.issuance.controller.dto.IssuanceRequestResponse;
import com.project.kkookk.issuance.controller.dto.IssuanceRequestResult;
import com.project.kkookk.issuance.service.CustomerIssuanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/customer/issuance-requests")
public class CustomerIssuanceController implements CustomerIssuanceApi {

    private final CustomerIssuanceService customerIssuanceService;

    @Override
    @PostMapping
    public ResponseEntity<IssuanceRequestResponse> createIssuanceRequest(
            @Valid @RequestBody CreateIssuanceRequest request,
            @AuthenticationPrincipal CustomerPrincipal principal) {

        IssuanceRequestResult result =
                customerIssuanceService.createIssuanceRequest(principal.getWalletId(), request);

        HttpStatus status = result.newlyCreated() ? HttpStatus.CREATED : HttpStatus.OK;

        return ResponseEntity.status(status).body(result.response());
    }

    @Override
    @GetMapping("/{id}")
    public ResponseEntity<IssuanceRequestResponse> getIssuanceRequest(
            @PathVariable Long id, @AuthenticationPrincipal CustomerPrincipal principal) {

        IssuanceRequestResponse response =
                customerIssuanceService.getIssuanceRequest(id, principal.getWalletId());

        return ResponseEntity.ok(response);
    }
}
