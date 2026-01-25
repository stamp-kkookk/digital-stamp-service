package com.project.kkookk.domain.auth.dto;

import java.util.List;

public record OwnerLoginResponse(
    String accessToken,
    String refreshToken,
    List<StoreBasicInfo> stores
) {}
