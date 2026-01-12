package com.kkookk.customer.controller;

import com.kkookk.customer.dto.WalletStampCardResponse;
import com.kkookk.customer.service.WalletStampCardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wallet/stamp-cards")
@RequiredArgsConstructor
public class WalletStampCardController {

    private final WalletStampCardService walletStampCardService;

    @GetMapping
    public ResponseEntity<List<WalletStampCardResponse>> getMyStampCards(
            @RequestHeader("X-Wallet-Session") String sessionToken) {

        List<WalletStampCardResponse> cards = walletStampCardService.getMyStampCards(sessionToken);
        return ResponseEntity.ok(cards);
    }
}
