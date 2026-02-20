package com.project.kkookk.oauth.controller.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record OAuthLoginResponse(
        boolean isNewUser,
        String tempToken,
        String oauthName,
        String oauthEmail,
        String accessToken,
        String refreshToken,
        Long id,
        String name,
        String nickname,
        String email,
        String phone,
        Long ownerId,
        List<StoreItem> stores) {

    public record StoreItem(Long id, String name) {}

    public static OAuthLoginResponse newUser(
            String tempToken, String oauthName, String oauthEmail) {
        return new OAuthLoginResponse(
                true,
                tempToken,
                oauthName,
                oauthEmail,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null);
    }

    public static OAuthLoginResponse existingCustomer(
            String accessToken,
            String refreshToken,
            Long walletId,
            String name,
            String nickname,
            String phone) {
        return new OAuthLoginResponse(
                false,
                null,
                null,
                null,
                accessToken,
                refreshToken,
                walletId,
                name,
                nickname,
                null,
                phone,
                null,
                null);
    }

    public static OAuthLoginResponse existingOwner(
            String accessToken,
            String refreshToken,
            Long ownerId,
            String name,
            String nickname,
            String email,
            String phone) {
        return new OAuthLoginResponse(
                false,
                null,
                null,
                null,
                accessToken,
                refreshToken,
                ownerId,
                name,
                nickname,
                email,
                phone,
                null,
                null);
    }

    public static OAuthLoginResponse terminalOwnerFound(
            String tempToken, Long ownerId, List<StoreItem> stores) {
        return new OAuthLoginResponse(
                false, tempToken, null, null, null, null, null, null, null, null, null, ownerId,
                stores);
    }

    public static OAuthLoginResponse terminalOwnerNotFound() {
        return new OAuthLoginResponse(
                true, null, null, null, null, null, null, null, null, null, null, null, null);
    }
}
