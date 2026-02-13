package com.project.kkookk.wallet.controller;

import com.project.kkookk.wallet.dto.CustomerLoginRequest;
import com.project.kkookk.wallet.dto.CustomerLoginResponse;
import com.project.kkookk.wallet.dto.NicknameCheckResponse;
import com.project.kkookk.wallet.dto.WalletRegisterRequest;
import com.project.kkookk.wallet.dto.WalletRegisterResponse;
import com.project.kkookk.wallet.service.CustomerWalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class WalletController implements WalletApi {

    private final CustomerWalletService customerWalletService;

    @Override
    public ResponseEntity<WalletRegisterResponse> register(
            @Valid @RequestBody WalletRegisterRequest request) {
        WalletRegisterResponse response = customerWalletService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Override
    public ResponseEntity<CustomerLoginResponse> login(
            @Valid @RequestBody CustomerLoginRequest request) {
        CustomerLoginResponse response = customerWalletService.login(request);
        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<NicknameCheckResponse> checkNickname(@RequestParam String nickname) {
        boolean available = customerWalletService.checkNicknameAvailable(nickname);
        return ResponseEntity.ok(new NicknameCheckResponse(available));
    }
}
