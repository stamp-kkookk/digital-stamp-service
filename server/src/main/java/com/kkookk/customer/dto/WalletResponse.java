package com.kkookk.customer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletResponse {

    private Long walletId;
    private String phoneNumber;
    private String name;
    private String nickname;
    private String sessionToken;
    private String sessionScope;
}
