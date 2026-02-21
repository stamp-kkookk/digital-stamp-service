package com.project.kkookk.store.controller.owner.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "카카오 장소 검색 결과")
public record PlaceSearchResult(
        @Schema(description = "장소명", example = "스타벅스 강남점") String placeName,
        @Schema(description = "지번 주소", example = "서울 강남구 역삼동 123-4") String address,
        @Schema(description = "도로명 주소", example = "서울 강남구 테헤란로 123") String roadAddress,
        @Schema(description = "전화번호", example = "02-1234-5678") String phone,
        @Schema(description = "카카오 장소 URL", example = "https://place.map.kakao.com/12345678")
                String placeUrl,
        @Schema(description = "카카오 장소 ID", example = "12345678") String kakaoPlaceId) {}
