package com.project.kkookk.oauth.service;

public interface OAuthProviderClient {

    OAuthUserInfo getUserInfo(String code, String redirectUri);
}
