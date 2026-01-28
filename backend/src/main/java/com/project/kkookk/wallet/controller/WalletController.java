package com.project.kkookk.wallet.controller;

import com.project.kkookk.wallet.controller.dto.WalletRegisterRequest;
import com.project.kkookk.wallet.controller.dto.WalletRegisterResponse;
import com.project.kkookk.wallet.service.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/wallet")
@RequiredArgsConstructor
public class WalletController implements WalletApi {

    private final WalletService walletService;

    @Override
    @PostMapping("/register")
    public ResponseEntity<WalletRegisterResponse> registerWallet(
            @Valid @RequestBody WalletRegisterRequest request) {
        WalletRegisterResponse response = walletService.registerWallet(request);
        return ResponseEntity.ok(response);
    }
}
