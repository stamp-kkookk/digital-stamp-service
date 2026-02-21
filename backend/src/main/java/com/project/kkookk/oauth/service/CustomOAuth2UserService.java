package com.project.kkookk.oauth.service;

import java.util.HashMap;
import java.util.Map;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;

@Component
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);
        String registrationId = userRequest.getClientRegistration().getRegistrationId();

        if ("naver".equals(registrationId)) {
            return flattenNaverResponse(oauth2User);
        }

        return oauth2User;
    }

    @SuppressWarnings("unchecked")
    private OAuth2User flattenNaverResponse(OAuth2User oauth2User) {
        Map<String, Object> attributes = oauth2User.getAttributes();
        Object responseObj = attributes.get("response");
        if (responseObj instanceof Map) {
            Map<String, Object> response = (Map<String, Object>) responseObj;
            Map<String, Object> flattened = new HashMap<>(response);
            return new DefaultOAuth2User(oauth2User.getAuthorities(), flattened, "id");
        }
        return oauth2User;
    }
}
