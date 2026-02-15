package com.project.kkookk.store.service;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.store.controller.owner.dto.PlaceSearchResult;
import java.time.Duration;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
public class KakaoPlaceSearchService {

    private static final String KAKAO_SEARCH_URL =
            "https://dapi.kakao.com/v2/local/search/keyword.json?query={query}";

    private final RestTemplate restTemplate;
    private final String restApiKey;

    public KakaoPlaceSearchService(
            RestTemplateBuilder restTemplateBuilder,
            @Value("${kakao.rest-api-key:}") String restApiKey) {
        this.restTemplate =
                restTemplateBuilder
                        .connectTimeout(Duration.ofSeconds(5))
                        .readTimeout(Duration.ofSeconds(10))
                        .build();
        this.restApiKey = restApiKey;
    }

    @SuppressWarnings("unchecked")
    public List<PlaceSearchResult> search(String query) {
        if (restApiKey == null || restApiKey.isBlank()) {
            log.warn("[Kakao] REST API key not configured, returning empty results");
            return Collections.emptyList();
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "KakaoAK " + restApiKey);

            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<Map<String, Object>> response =
                    restTemplate.exchange(
                            KAKAO_SEARCH_URL,
                            HttpMethod.GET,
                            entity,
                            new ParameterizedTypeReference<>() {},
                            query);

            Map<String, Object> body = response.getBody();
            if (body == null) {
                return Collections.emptyList();
            }

            List<Map<String, Object>> documents = (List<Map<String, Object>>) body.get("documents");
            if (documents == null) {
                return Collections.emptyList();
            }

            return documents.stream()
                    .map(
                            doc ->
                                    new PlaceSearchResult(
                                            (String) doc.get("place_name"),
                                            (String) doc.get("address_name"),
                                            (String) doc.get("road_address_name"),
                                            (String) doc.get("phone"),
                                            (String) doc.get("place_url"),
                                            (String) doc.get("id")))
                    .toList();
        } catch (RestClientException e) {
            log.error("[Kakao] API call failed: {}", e.getMessage());
            throw new BusinessException(ErrorCode.KAKAO_API_ERROR);
        }
    }
}
