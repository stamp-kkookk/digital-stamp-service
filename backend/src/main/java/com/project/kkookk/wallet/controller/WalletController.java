package com.project.kkookk.wallet.controller;

import com.project.kkookk.wallet.dto.WalletAccessRequest;
import com.project.kkookk.wallet.dto.WalletAccessResponse;
import com.project.kkookk.wallet.service.WalletAccessService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class WalletController implements WalletApi {

    private final WalletAccessService walletAccessService;

    @Override
    public ResponseEntity<WalletAccessResponse> getWalletAccessInfo(
            @Valid @ModelAttribute WalletAccessRequest request, @RequestParam Long storeId) {
        WalletAccessResponse response =
                walletAccessService.getWalletInfo(
                        request.phoneNumber(), request.userName(), storeId);
        return ResponseEntity.ok(response);
    }
}
