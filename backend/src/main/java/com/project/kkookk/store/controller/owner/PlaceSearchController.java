package com.project.kkookk.store.controller.owner;

import com.project.kkookk.store.controller.owner.dto.PlaceSearchResult;
import com.project.kkookk.store.service.KakaoPlaceSearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Place Search", description = "카카오 장소 검색 API")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/owner/places")
public class PlaceSearchController {

    private final KakaoPlaceSearchService kakaoPlaceSearchService;

    @Operation(summary = "장소 검색", description = "카카오 장소 검색 API를 통해 장소를 검색합니다.")
    @GetMapping("/search")
    public ResponseEntity<List<PlaceSearchResult>> search(@RequestParam String query) {
        List<PlaceSearchResult> results = kakaoPlaceSearchService.search(query);
        return ResponseEntity.ok(results);
    }
}
