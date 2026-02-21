package com.project.kkookk.wallet.controller;

import com.project.kkookk.wallet.dto.NicknameCheckResponse;
import com.project.kkookk.wallet.dto.PhoneCheckResponse;
import com.project.kkookk.wallet.service.CustomerWalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class WalletController implements WalletApi {

    private final CustomerWalletService customerWalletService;

    @Override
    public ResponseEntity<NicknameCheckResponse> checkNickname(@RequestParam String nickname) {
        boolean available = customerWalletService.checkNicknameAvailable(nickname);
        return ResponseEntity.ok(new NicknameCheckResponse(available));
    }

    @Override
    public ResponseEntity<PhoneCheckResponse> checkPhone(@RequestParam String phone) {
        boolean available = customerWalletService.checkPhoneAvailable(phone);
        return ResponseEntity.ok(new PhoneCheckResponse(available));
    }
}
